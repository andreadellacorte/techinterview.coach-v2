import crypto from "crypto";

import { stripeService, logger } from "./services.mjs";

class AuthService {
  constructor(ZAPIER_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CALCOM_WEBHOOK_SECRET) {
    this.ZAPIER_SECRET_KEY = ZAPIER_SECRET_KEY;
    this.STRIPE_WEBHOOK_SECRET = STRIPE_WEBHOOK_SECRET;
    this.CALCOM_WEBHOOK_SECRET = CALCOM_WEBHOOK_SECRET;
  }

  async verifyNetlifyRequest(rawBody, netlifySignature) {
    if (!this.ZAPIER_SECRET_KEY) {
      await logger.error(
        "❌ Missing required secret keys",
        "ZAPIER_SECRET_KEY",
      );
      throw new Error("❌ Missing required secret keys");
    }

    await logger.info("Validate Auth - Request received");

    // https://developer.mozilla.org/en-US/docs/Web/API/Headers/get
    if (netlifySignature != this.ZAPIER_SECRET_KEY) {
      await logger.warn("❌ Netlify Request Unauthorized");
      throw new Error("❌ Netlify Request Unauthorized");
    }

    await logger.info("✅ Verified Netlify request");

    return JSON.parse(rawBody);
  }

  async verifyStripeWebhook(rawBody, signature) {
    if (!this.STRIPE_WEBHOOK_SECRET) {
      await logger.error(
        "[AuthService] ❌ Missing required secret keys",
        "STRIPE_WEBHOOK_SECRET",
      );
      throw new Error("❌ Missing required secret keys");
    }

    try {
      return stripeService.webhooks.constructEvent(
        rawBody,
        signature,
        this.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      throw new Error(
        "❌ Stripe signature verification failed: " + error.message,
      );
    }
  }

  async verifyCalComWebhook(rawBody, calSignature) {
    if (!this.CALCOM_WEBHOOK_SECRET) {
      await logger.error(
        "[AuthService] ❌ Missing required secret keys",
        "CALCOM_WEBHOOK_SECRET",
      );
      throw new Error("❌ Missing required secret keys");
    }

    if (!calSignature) {
      throw new Error("❌ Missing Cal.com webhook signature");
    }

    const computedSignature = crypto
      .createHmac("sha256", this.CALCOM_WEBHOOK_SECRET)
      .update(rawBody, "utf8")
      .digest("hex");

    if (computedSignature !== calSignature) {
      throw new Error("❌ Invalid Cal.com webhook signature");
    }

    // If signatures match, parse and return the JSON payload
    return JSON.parse(rawBody);
  }

  async authenticateWebhook(request) {
    // Read raw body for verification
    let eventData;
    const rawBody = await request.text();

    await logger.info("Authenticate Webhook - Request received");

    const headersString = [...request.headers]
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    await logger.info("Request headers:", headersString);
    await logger.info("Request body:", rawBody);

    if (
      !request.headers.has("Stripe-Signature") &&
      !request.headers.has("Calendly-Webhook-Signature") &&
      !request.headers.has("X-Cal-Signature-256") &&
      !request.headers.has("security")
    ) {
      await logger.warn("❌ Unauthorized: No authorization present", request);
      throw new Error("Unauthorized");
    }

    const stripeSignature = request.headers.get("Stripe-Signature");
    const calSignature = request.headers.get("X-Cal-Signature-256");
    const netlifySignature = request.headers.get("security");

    if (stripeSignature) {
      eventData = await this.verifyStripeWebhook(rawBody, stripeSignature);
    } else if (calSignature) {
      eventData = await this.verifyCalComWebhook(rawBody, calSignature);
    } else if (netlifySignature) {
      eventData = await this.verifyNetlifyRequest(rawBody, netlifySignature);
    } else {
      await logger.warn("❌ Unrecognized webhook source", rawBody);
      throw new Error("Unauthorized");
    }

    await logger.info(
      "✅ Verified webhook:",
      eventData.type || eventData.event || eventData.triggerEvent,
    );

    return eventData;
  }
}

export default AuthService;
