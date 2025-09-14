export const config = {
  airtable: {
    apiKey: process.env.AIRTABLE_API_KEY,
    baseKey: process.env.AIRTABLE_BASE_KEY
  },
  calCom: {
    apiBaseUrl: process.env.CALCOM_API_BASE_URL,
    subscriberUrl: process.env.CALCOM_SUBSCRIBER_URL,
    webhookSecret: process.env.CALCOM_WEBHOOK_SECRET
  },
  calendly: {
    apiBaseUrl: process.env.CALENDLY_API_BASE_URL,
    apiKey: process.env.CALENDLY_API_KEY,
    webhookSecret: process.env.CALENDLY_WEBHOOK_SECRET
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  loops: {
    apiKey: process.env.LOOPS_API_KEY
  },
  ntfy: {
    url: process.env.NTFY_SH_URL,
    topic: process.env.NTFY_SH_TOPIC
  },
  zapier: {
    secretKey: process.env.ZAPIER_SECRET_KEY
  }
};