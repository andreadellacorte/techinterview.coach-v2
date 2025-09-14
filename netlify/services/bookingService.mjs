import { databaseService, loopsService, logger } from "./services.mjs";

class BookingService {
  async recordBooking(preparedBookingData) {
    const { event, coachDetails, coacheeDetails } = preparedBookingData;

    const { email, firstName, lastName, phone, linkedin } = coacheeDetails;
    const { coachEmail } = coachDetails;

    const { slug, title, startTime, endTime, bookingId } = event;

    const existingBooking = await databaseService.bookings.findByFormula(
      `{External ID} = "${bookingId}"`,
    );

    if (existingBooking.length > 0) {
      await logger.warn(`Booking already exists`, bookingId);
      return;
    }

    // 1. Get event type information
    if (slug === "coach-introduction") {
      await logger.info(`Skipping coach-introduction event`);
      return;
    }

    const coach = await databaseService.coaches.findByEmail(coachEmail);

    if (!coach) {
      await logger.error(`Coach not found`, coachEmail);
      throw new Error(`Coach not found: ${coachEmail}`);
    }

    // 2. Find the coachee in Airtable
    await logger.info(`Getting coachee via email`, email);

    const coacheeData = {
      Email: email.toLowerCase(),
      "First Name": firstName,
      "Last Name": lastName,
      Phone: phone,
      LinkedIn: linkedin,
      "User Group": ["coachee"],
    };

    const coachee = await databaseService.coachees.upsert(coacheeData);

    const bookingData = {
      "Coach (lookup)": [coach.id],
      "Customer Email": [coachee.id],
      "External ID": bookingId,
      Type: slug,
      Status: "confirmed",
      "Start Time (Pretty)": startTime,
      "End Time (Pretty)": endTime,
      Notes: `Created by Netlify - createBooking function on ${new Date().toISOString()}`,
    };

    const sessionMapping = {
      "15-minute-intro": {
        payout: 0,
        used: 0,
        eventName: "free-intro-scheduled",
      },
      "60-minute-session": {
        payout: 1,
        // v1 customers are always charged 1 credit (could be improved)
        used:
          email == "e.ford.phd@gmail.com" || email == "jjhbrice@gmail.com"
            ? 1
            : coach.safeGet("Credits per Session"),
        eventName: "session-booked",
      },
    };

    var eventName;

    if (sessionMapping[slug]) {
      bookingData["Payout Sessions"] = sessionMapping[slug].payout;
      bookingData["Used Sessions"] = sessionMapping[slug].used;
      eventName = sessionMapping[slug].eventName;
    } else {
      await logger.warn(`Event type slug not recognized`, slug);
      bookingData["Payout Sessions"] = 0;
      bookingData["Used Sessions"] = 0;
      bookingData["Type"] = "unknown";
      return;
    }

    // 3. Create a new booking in Airtable

    await logger.info(`Preparing to enter Booking in Airtable`, bookingData);

    const newBooking = await databaseService.bookings.create(bookingData);

    if (eventName)
      await loopsService.sendEvent({
        email: email,
        eventName: eventName,
      });

    // 4. Check if the coachee has negative credits

    await logger.info(`Checking if Coachee has negative credits`, email);

    const updatedCoachee = await databaseService.coachees.findByEmail(email);

    if (
      updatedCoachee.safeGet("Available Credits") < 0 &&
      bookingData["Payout Sessions"] > 0
    ) {
      await logger.info(
        `Coachee has negative credits`,
        updatedCoachee.safeGet("Available Credits"),
      );

      // 5. If they have negative credits, create an Unpaid Event
      await logger.info(
        `Creating unpaid event in Airtable and Google Calendar`,
      );

      const eventData = {
        Name: `🚨 [TIC] ${updatedCoachee.safeGet("Full Name")} has ${updatedCoachee.safeGet("Available Credits")} credits available for ${title}`,
        "Debit ID": [newBooking.id],
        "Negative Credits": newBooking.safeGet("Used Sessions"),
        Description:
          "The customer has negative credits for this session. If this event is still active by the time the session starts, then the coachee might not yet have paid for the session. Please direct them to your page on https://techinterview.coach to purchase the remaining credits",
        Status: "outstanding",
        Notes:
          "Created by Netlify - createBooking function on " +
          new Date().toISOString(),
      };

      await this.createUnpaidEvent(eventData);

      await loopsService.sendTransactionalEmail({
        transactionalId: "clw3wfpbr01iavearvhw2wtvj",
        email: email,
        dataVariables: {
          "coachee-name": updatedCoachee.safeGet("First Name"),
          "coach-name": coach.safeGet("Name"),
          "coach-key": coach.safeGet("key"),
          "event-name": title,
          "event-date": new Date(startTime).toLocaleDateString(),
          "credits-number": updatedCoachee.safeGet("Available Credits"),
        },
      });
    } else {
      await logger.info(
        `Coachee has credits available`,
        updatedCoachee.safeGet("Available Credits"),
      );
    }

    await logger.info("Booking Created", newBooking);

    return newBooking;
  }

  async createUnpaidEvent(data) {
    await logger.info(`Preparing to enter Unpaid Event in Airtable`);

    if (!data || Object.keys(data).length === 0) {
      throw new Error("Invalid event data: data object is empty or undefined");
    }

    const requiredFields = {
      Name: "string",
      "Debit ID": "array",
      Status: "string",
      "Negative Credits": "number",
    };

    const missingFields = Object.keys(requiredFields).filter(
      field => !(field in data)
    );

    if (missingFields.length > 0) {
      throw new Error("Missing required fields: " + missingFields.join(", "));
    }

    const invalidFields = Object.entries(requiredFields).filter(
      ([field, type]) => {
        if (type === "array") {
          return !Array.isArray(data[field]);
        } 
        return typeof data[field] !== type || (type === "string" && data[field].trim() === "");
      }
    ).map(([field]) => field);

    if (invalidFields.length > 0) {
      throw new Error("Invalid field types or contents: " + invalidFields.join(", "));
    }
    const eventData = {
      Name: data["Name"],
      Description: data["Description"],
      "Debit ID": data["Debit ID"],
      "Negative Credits": data["Negative Credits"],
      Status: data["Status"],
      Notes: data["Notes"],
    };

    await logger.info(`Creating unpaid event in Airtable`);

    const result = await databaseService.events.create(eventData);
    
    await logger.info(`Unpaid Event successfully created in Airtable`);
    
    return result;
  }

  async recordCancellation(eventUUid) {
    await logger.info(`Preparing to cancel Booking in Airtable`, eventUUid);

    const bookings = await databaseService.bookings.findByFormula(
      `{External ID} = "${eventUUid}"`
    );

    if (bookings.length === 0) {
      await logger.error(`Booking not found`, eventUUid);
      throw new Error(`Booking not found: ${eventUUid}`);
    }

    // Check for unpaid events first
    const unpaid = await databaseService.events.findByFormula(
      `{Debit ID} = "${bookings[0].id}"`
    );

    if (unpaid.length > 1) {
      await logger.error(
        `More than one unpaid event found for booking`,
        bookings[0].id
      );
      throw new Error(`More than one unpaid event found for booking: ${bookings[0].id}`);
    }

    if (unpaid.length === 1) {
      const unpaidEvent = unpaid[0];
      if (unpaidEvent.safeGet("Status") === "paid") {
        await logger.warn(
          `Related event is already marked as paid`,
          unpaidEvent.id
        );
        throw new Error(`Related event is already marked as paid: ${unpaidEvent.id}`);
      }
    }

    // If we get here, we can proceed with the cancellation
    await databaseService.bookings.update(bookings[0].id, {
      Status: "cancelled",
      "Payout Sessions": 0,
      "Used Sessions": 0,
      Notes:
        "Cancelled by Netlify - recordCancellation function on " +
        new Date().toISOString(),
    });

    await logger.info(`Booking cancelled in Airtable`, bookings[0].id);

    if (unpaid.length === 1) {
      const unpaidEvent = unpaid[0];
      await databaseService.events.update(unpaidEvent.id, {
        Status: "cancelled",
        "Negative Credits": 0,
        Notes: "Cancelled by Netlify on " + new Date().toISOString(),
      });

      await logger.info(`Unpaid Event cancelled in Airtable`, unpaidEvent.id);
    } else {
      await logger.info(`No Unpaid Event found for Booking`, bookings[0].id);
    }
  }

  async updateBooking(rescheduledId, bookingData) {
    const { bookingId, startTime, endTime } = bookingData.event;

    const bookings = await databaseService.bookings.findByFormula(
      `{External ID} = "${rescheduledId}"`,
    );

    if (bookings.length === 0) {
      await logger.error(`Booking not found`, rescheduledId);
      throw new Error(`Booking not found: ${rescheduledId}`);
    }

    // Update the booking in Airtable
    const updatedBooking = await databaseService.bookings.update(
      bookings[0].id,
      {
        "External ID": bookingId,
        Status: "rescheduled",
        "Start Time (Pretty)": startTime,
        "End Time (Pretty)": endTime,
        Notes:
          "Rescheduled by Netlify - updateBooking function on " +
          new Date().toISOString(),
      },
    );

    await logger.info("Booking Rescheduled", updatedBooking);

    return updatedBooking;
  }
}

export default BookingService;
