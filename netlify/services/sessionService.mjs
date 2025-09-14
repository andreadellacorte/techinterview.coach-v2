import { databaseService, logger } from "./services.mjs";

class SessionService {
  async recordConversion(sessionData) {
    const { coacheeEmail, sessionId } = sessionData;

    try {
      // Find the Customer from the Stripe checkout session
      const coachee = await databaseService.coachees.findByEmail(coacheeEmail);

      if (!coachee) {
        await logger.warn(
          "[sessionService.recordConversion] Coachee not found:",
          coacheeEmail,
        );
        return;
      }

      await logger.info(
        "[sessionService.recordConversion] Coachee found:",
        coacheeEmail,
      );

      try {
        await databaseService.sessions.findById(sessionId);
      } catch (error) {
        await logger.warn(
          `[sessionService.recordConversion] Error: ${error} - Website session not found?`,
          sessionId,
        );

        return;
      }

      await logger.info(
        "[sessionService.recordConversion] Session found:",
        sessionId,
      );

      // Add session.id to the customer's "Sessions" array field, avoiding duplicates
      const currentSessions = coachee.safeGet("Sessions") || [];
      if (!currentSessions.includes(sessionId)) {
        try {
          await databaseService.coachees.update(coachee.id, {
            Sessions: [...currentSessions, sessionId],
          });
        } catch (error) {
          await logger.error(
            `[sessionService.recordConversion] Error updating coachee:`,
            error,
          );
          return;
        }
      } else {
        await logger.info(
          "[sessionService.recordConversion] Session already recorded",
          sessionId,
        );
      }

      return await databaseService.sessions.findById(sessionId);
    } catch (error) {
      await logger.error(
        `[sessionService.recordConversion] Unexpected error:`,
        error,
      );
      return;
    }
  }

  async createSession(body, context) {
    try {
      await logger.info(`Started with UTM params: ${JSON.stringify(body)}`);

      const { user_agent, platform, referrer } = body;

      let utm_uuid;
      let country = "";
      let city = "";

      if (context.geo) {
        country = context.geo.country?.code || "";
        city = context.geo.city || "";
      }

      // Get UTM parameters
      const utmParams = this.getUTMParameters(body);

      // Check if we have any valid UTM parameters
      const hasUtmParams = Object.values(utmParams).some(
        (val) => val && val.length > 0,
      );

      if (hasUtmParams) {
        try {
          const utm = await this.findOrCreateUTM(utmParams);
          if (utm && utm.id) {
            utm_uuid = utm.id;
          }
        } catch (error) {
          await logger.error("Error finding or creating UTM", error);
          throw error;
        }
      }

      const expires_at = new Date(
        new Date().setFullYear(new Date().getFullYear() + 10),
      ).toISOString();

      try {
        return await databaseService.sessions.create({
          utm_uuid: utm_uuid ? [utm_uuid] : [],
          user_agent,
          platform,
          referrer,
          country,
          city,
          expires_at: expires_at,
        });
      } catch (error) {
        await logger.error("Error creating session", error);
        throw error;
      }
    } catch (error) {
      await logger.error("Session creation error", error);
      throw new Error(`Error creating session: ${error.message}`);
    }
  }

  getUTMParameters(body) {
    // If utm_source is direct/organic, use referrer instead
    let utm_source = body.utm_source;
    if (utm_source === "direct/organic" && body.referrer) {
      utm_source = body.referrer;
    }

    return {
      utm_campaign: body.utm_campaign || "",
      utm_medium: body.utm_medium || "",
      utm_source: utm_source || "",
      utm_term: body.utm_term || "",
      utm_content: body.utm_content || "",
    };
  }

  async findOrCreateUTM(utmParams) {
    try {
      // Build the filter formula
      const filterConditions = Object.entries(utmParams)
        .filter(([, value]) => value && value.length > 0)
        .map(([key, value]) => `{${key}} = '${value}'`)
        .join(",");

      if (!filterConditions) {
        return null;
      }

      const filterFormula = `AND(${filterConditions})`;
      const existingUTMs =
        await databaseService.utms.findByFormula(filterFormula);

      if (existingUTMs && existingUTMs.length > 0) {
        return existingUTMs[0];
      } else {
        // Create new UTM
        return await databaseService.utms.create(utmParams);
      }
    } catch (error) {
      throw new Error(`Error finding or creating UTM: ${error.message}`);
    }
  }

  async validateSession(request) {
    const body = await request.json();

    const { session_uuid } = body;

    // compare the parameters above vs what stored in the db
    const session = databaseService.sessions.findById(session_uuid);

    if (!session) {
      await logger.warn("Session not found", session_uuid);
      return false;
    }

    if (session.expires_at < new Date().toISOString()) {
      await logger.info("Session expired", session);
      return false;
    }

    await logger.info("Session valid", session);

    return true;
  }
}

export default SessionService;
