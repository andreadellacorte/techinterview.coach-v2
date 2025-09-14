import {
  sessionService,
  bookingService,
  paymentService,
  databaseService,
  calComService,
  notificationService,
  logger,
} from "./services.mjs";

class EventDispatcher {
  constructor() {
    this.listeners = {};
  }

  getListeners() {
    return this.listeners;
  }

  clearListeners() {
    this.listeners = {};
  }

  setListeners(listeners) {
    this.listeners = listeners;
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  async emit(event, data) {
    await logger.info(`Emitting event ${event}`, data);

    if (this.listeners[event]) {
      try {
        await Promise.all(
          this.listeners[event].map(async (callback) => {
            return callback(data);
          }),
        );
      } catch (error) {
        await logger.error(`Error in event ${event}`, error);
        throw error; // Ensure the error bubbles up
      }
    } else {
      await logger.error(`No handler registered for event type: ${event}`);
      throw new Error("No handler registered for event type: " + event);
    }
  }
}

export const eventDispatcher = new EventDispatcher();

// Stripe Events https://docs.stripe.com/api/events/types
eventDispatcher.on("checkout.session.completed", async (stripePayload) => {
  const checkoutSession = stripePayload.object;

  const coacheeData = {
    Email: checkoutSession.customer_details.email.toLowerCase(),
    "First Name": checkoutSession.customer_details.name.split(" ")[0],
    "Last Name":
      checkoutSession.customer_details.name.split(" ").slice(1).join(" ") || "",
    "User Group": ["coachee"],
    Phone: checkoutSession.customer_details.phone,
  };

  const customer = await databaseService.coachees.upsert(coacheeData);

  const sessionData =
    await paymentService.prepareConversionData(checkoutSession);

  if (sessionData) {
    await sessionService.recordConversion(sessionData);
  }

  await paymentService.processCheckoutSession(customer, checkoutSession);

  await notificationService.send(
    checkoutSession,
    "Checkout session completed",
    "high",
    ["moneybag"],
  );
});

eventDispatcher.on("invoice.payment_succeeded", async (stripePayload) => {
  const invoice = stripePayload.object;

  const coacheeData = {
    Email: invoice.customer_email.toLowerCase(),
    "First Name": invoice.customer_name.split(" ")[0],
    "Last Name": invoice.customer_name.split(" ").slice(1).join(" ") || "",
    "User Group": ["coachee"],
    Phone: invoice.customer_phone,
  };

  const customer = await databaseService.coachees.upsert(coacheeData);

  await paymentService.processInvoicePayment(customer, invoice);

  await notificationService.send(invoice, "Invoice payment succeeded", "high", [
    "moneybag",
  ]);
});

// Register listener events  for cal.com invitee created

eventDispatcher.on("BOOKING_CREATED", async (calComPayload) => {
  const bookingData = await calComService.prepareBookingData(calComPayload);

  const bookingDataResult = await bookingService.recordBooking(bookingData);

  const sessionData = await calComService.prepareSessionData(calComPayload);

  if (sessionData) {
    await sessionService.recordConversion(sessionData);
  }

  await notificationService.send(bookingDataResult, "Booking Created", "high", [
    "date",
  ]);
});

eventDispatcher.on("BOOKING_CANCELLED", async (calComPayload) => {
  const bookingData = await calComService.prepareBookingData(calComPayload);

  await bookingService.recordCancellation(bookingData.event.bookingId);

  await notificationService.send(bookingData, "Booking Cancelled", "high", [
    "date",
  ]);
});

eventDispatcher.on("BOOKING_RESCHEDULED", async (calComPayload) => {
  const rescheduledId = calComPayload.rescheduleId;

  const bookingData = await calComService.prepareBookingData(calComPayload);

  // Update the existing booking with the new schedule
  const updatedBookingData = await bookingService.updateBooking(
    rescheduledId,
    bookingData,
  );

  await notificationService.send(
    updatedBookingData,
    "Booking Rescheduled",
    "high",
    ["date"],
  );
});

eventDispatcher.on("netlify.smoke-tests", async (data = {}) => {
  const { source = "unknown", timestamp = new Date().toISOString() } = data;
  await logger.info(`Smoke test event received from ${source}`, { timestamp });

  const results = {
    success: true,
    checks: [],
    errors: [],
  };

  try {
    // Check the database connection
    await logger.info("Running database connection check");
    const coachees = await databaseService.coachees.all();
    if (!coachees) {
      results.success = false;
      results.errors.push({
        check: "database",
        error: "Database connection failed",
      });
    } else {
      results.checks.push({
        name: "database",
        status: "success",
      });
    }

    // Check Cal.com integration
    await logger.info("Running Cal.com validation check");
    try {
      await calComService.validate();
      results.checks.push({
        name: "cal.com",
        status: "success",
      });
    } catch (error) {
      results.success = false;
      results.errors.push({
        check: "cal.com",
        error: error.message,
        details: error,
      });
    }

    // Log final results
    if (results.success) {
      await logger.info("All smoke tests passed successfully", {
        source,
        checks: results.checks,
      });

      // Only send success notification once per day
      if (source === "hourly-cron" && new Date().getUTCHours() === 0) {
        await notificationService.send(
          results.checks,
          "System health check passed",
          "default",
          ["+1"],
        );
      }
    } else {
      await logger.warn("Some smoke tests failed", {
        source,
        errors: results.errors,
      });

      await notificationService.send(
        results.errors,
        `System health check failed: ${results.errors.length} issue(s) detected`,
        "high",
        ["warning"],
      );
    }

    return results;
  } catch (error) {
    const errorContext = {
      source,
      message: error.message,
      stack: error.stack,
    };

    await logger.error("Unexpected error during smoke tests", errorContext);

    await notificationService.send(
      errorContext,
      "Unexpected error during system health check",
      "high",
      ["sos"],
    );

    throw error; // Re-throw to ensure the error bubbles up
  }
});
