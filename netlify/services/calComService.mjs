import axios from "axios";

import { databaseService, logger } from "./services.mjs";

class CalComService {
  constructor(apiBaseUrl, webhookSecret) {
    this.apiBaseUrl = apiBaseUrl;
    this.webhookSecret = webhookSecret;

    this.apiKeys = JSON.parse(process.env.CALCOM_API_KEYS || "{}");

    this.request = axios.create({
      baseURL: this.apiBaseUrl,
    });

    this.requestInterceptor = this.request.interceptors.response.use(
      (res) => res,
      this._onCalComError,
    );
  }

  requestConfiguration(calComApiKey) {
    const headers = {
      "cal-api-version": "2024-06-14",
      "Content-Type": "application/json",
    };

    if (calComApiKey) {
      headers.Authorization = `Bearer ${calComApiKey}`;
    }

    return { headers };
  }

  async fetchEventTypes(calComUsername, calComApiKey) {
    const { data } = await this.request.get(
      `/event-types?username=${calComUsername}`,
      this.requestConfiguration(calComApiKey),
    );
    return data.data;
  }

  async fetchWebhooks(calComApiKey) {
    const { data } = await this.request.get(
      "/webhooks",
      this.requestConfiguration(calComApiKey),
    );
    return data.data;
  }

  async getUser(calComApiKey) {
    const { data } = await this.request.get(
      "/me",
      this.requestConfiguration(calComApiKey),
    );
    return data.data;
  }

  async createEventType(eventTypeOptions, calComApiKey) {
    const response = await this.request.post(
      "/event-types",
      eventTypeOptions,
      this.requestConfiguration(calComApiKey),
    );
    return response.data;
  }

  async createWebhook(calComApiKey) {
    const subscriberUrl = process.env.CALCOM_SUBSCRIBER_URL;

    const webhookOptions = {
      subscriberUrl: subscriberUrl,
      triggers: ["BOOKING_CREATED", "BOOKING_CANCELLED", "BOOKING_RESCHEDULED"],
      active: true,
      secret: process.env.CALCOM_WEBHOOK_SECRET,
    };

    const response = await this.request.post(
      "/webhooks",
      webhookOptions,
      this.requestConfiguration(calComApiKey),
    );
    return response.data;
  }

  async deleteWebhook(calComApiKey, webhookId) {
    const response = await this.request.delete(
      `/webhooks/${webhookId}`,
      this.requestConfiguration(calComApiKey),
    );
    return response.data;
  }

  async prepareBookingData(calComPayload) {
    const {
      type: eventSlug,
      eventTitle,
      organizer: { email: coachEmail, name: coachName },
      startTime,
      endTime,
      attendees,
      bookingId,
      responses = {},
    } = calComPayload;

    const coacheeName = attendees?.[0]?.name || "";
    const firstName = coacheeName.split(" ")[0];
    const lastName = coacheeName.split(" ")[1];

    const phoneNumber = responses.phone?.value || "";
    const linkedin = responses.linkedin?.value || "";

    const event = {
      bookingId: bookingId.toString(),
      slug: eventSlug,
      title: eventTitle,
      startTime,
      endTime,
    };

    const coachee = {
      firstName,
      lastName,
      email: attendees[0].email,
      phone: phoneNumber,
      linkedin,
    };

    const coach = {
      coachName,
      coachEmail: coachEmail,
    };

    return {
      event,
      coacheeDetails: coachee,
      coachDetails: coach,
    };
  }

  async prepareSessionData(calComPayload) {
    try {
      const sessionId = calComPayload.metadata?.sessionId;
      const utm_medium = calComPayload.metadata?.utmMedium;

      if (!sessionId) {
        if (utm_medium === "website") {
          await logger.warn(
            "[calComService.prepareSessionData] No session UUID found in Cal.com payload",
            calComPayload,
          );
        }
        return;
      }

      if (!calComPayload.attendees[0].email) {
        throw new Error(
          "No customer email found in the Cal.com payload",
          calComPayload,
        );
      }

      return {
        coacheeEmail: calComPayload.attendees[0].email,
        sessionId: sessionId,
      };
    } catch (error) {
      await logger.error("[calComService.prepareSessionData] Failed:", error);
      throw error;
    }
  }

  async validateUser(coach) {
    const calComApiKey = coach.safeGet("CalCom Api Key");
    const coachKey = coach.safeGet("key");

    const user = await this.getUser(calComApiKey);

    if (user.username !== `techinterviewcoach-${coachKey}`) {
      await logger.error("Cal.com fetched username does not match db key", {
        user: user,
        dbKey: coachKey,
      });
    }

    if (user.email !== coach.safeGet("Email")) {
      await logger.error("Cal.com fetched email does not match db email", {
        user: user,
        dbEmail: coach.safeGet("Email"),
      });
    }
  }

  async validateEventTypes(coach) {
    const calComApiKey = coach.safeGet("CalCom Api Key");

    const user = await this.getUser(calComApiKey);

    const event_types = await this.fetchEventTypes(user.username, calComApiKey);

    if (event_types === undefined) {
      await logger.error("Failed to fetch event types");
      return;
    }

    const requiredEventTypes = [
      {
        slug: "60-minute-session",
        title: "60 Minute Session",
        lengthInMinutes: 60,
      },
      {
        slug: "15-minute-intro",
        title: "15 Minute Intro",
        lengthInMinutes: 15,
      },
    ];

    const existingSlugs = event_types.map((event) => event.slug);
    const missingEventTypes = requiredEventTypes.filter(
      (type) => !existingSlugs.includes(type.slug),
    );

    if (missingEventTypes && missingEventTypes.length > 0) {
      await logger.info("Missing  event types", missingEventTypes);
      for (const eventType of missingEventTypes) {
        const eventTypeOptions = {
          bookingFields: [
            {
              type: "name",
              label: "Your Name",
              name: "name",
            },
            {
              type: "email",
              label: "Email Address",
              required: true,
              placeholder: "Please enter your valid email address",

              name: "email",
            },
            {
              type: "textarea",
              label: "Additional Notes",
              required: false,
              name: "notes",
              slug: "additionalNotes",
            },
            {
              type: "multiemail",
              label: "Additional Guests",
              required: false,
              name: "guests",
              slug: "additionalGuests",
            },
            {
              type: "phone",
              label: "Phone",
              required: true,
              name: "phone",
              slug: "phone",
            },
            {
              type: "text",
              label: "Linkedin url",
              required: false,
              name: "linkedin",
              slug: "linkedin",
            },
          ],
          title: `${eventType.title} w/ ${coach.safeGet("Name")}`,
          slug: eventType.slug,
          lengthInMinutes: eventType.lengthInMinutes,
          customName:
            "[Tech Interview Coaching] {Event type title} between {Organiser} and {Scheduler}",

          seats: {
            showAvailabilityCount: true,
            showAttendeeInfo: false,
          },
          hideCalendarEventDetails: false,
          hideCalendarNotes: false,
          requiresBookerEmailVerification: false,
        };

        const data = await this.createEventType(eventTypeOptions, calComApiKey);
        await logger.info(`Created event types `, data);
      }
    }
  }

  async validateWebhooks(coach) {
    const calComApiKey = coach.safeGet("CalCom Api Key");
    const webhooks = await this.fetchWebhooks(calComApiKey);

    if (!webhooks?.length) {
      await logger.info("No Cal.com webhooks exists");
      const createWebhookResponse = await this.createWebhook(calComApiKey);
      await logger.info("Cal.com webhook created", createWebhookResponse);
    } else {
      const matchingWebhook = webhooks.find((webhook) => {
        return (
          webhook.subscriberUrl === process.env.CALCOM_SUBSCRIBER_URL &&
          webhook.triggers.includes("BOOKING_CREATED") &&
          webhook.triggers.includes("BOOKING_CANCELLED") &&
          webhook.triggers.includes("BOOKING_RESCHEDULED")
        );
      });

      if (!matchingWebhook) {
        await logger.info("No matching Cal.com webhook found");
        for (const webhook of webhooks) {
          await this.deleteWebhook(calComApiKey, webhook.id);
          await logger.info(`Deleted webhook: ${webhook.id}`);
        }
        const createWebhookResponse = await this.createWebhook(calComApiKey);
        await logger.info("Cal.com webhook created", createWebhookResponse);
      }
    }
  }

  async validate() {
    const coaches = await databaseService.coaches.findByFormula(
      `{CalCom Api Key} != ''`,
    );

    const validationPromises = coaches.map(async (coach) => {
      try {
        await logger.info(
          `Starting validation for coach: ${coach.safeGet("Email")}`,
        );

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Validation timeout")), 8000),
        );

        const validationPromise = Promise.all([
          this.validateUser(coach),
          this.validateEventTypes(coach),
          this.validateWebhooks(coach),
        ]);

        await Promise.race([validationPromise, timeoutPromise]);

        await logger.info(
          `Completed validation for coach: ${coach.safeGet("Email")}`,
        );
        return { success: true, coachEmail: coach.safeGet("Email") };
      } catch (error) {
        const errorContext = {
          coachEmail: coach.safeGet("Email"),
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        };

        await logger.error(
          `Validation failed for coach: ${coach.safeGet("Email")}`,
          errorContext,
        );
        return {
          success: false,
          coachEmail: coach.safeGet("Email"),
          error: errorContext,
        };
      }
    });

    const results = await Promise.all(validationPromises);

    const failedValidations = results.filter((r) => !r.success);
    if (failedValidations.length > 0) {
      await logger.warn("Some coach validations failed:", failedValidations);
    }

    return {
      success: failedValidations.length === 0,
      totalCoaches: coaches.length,
      failedCoaches: failedValidations.length,
      results,
    };
  }

  _onCalComError = async (error) => {
    return Promise.reject(error);
  };
}

export default CalComService;
