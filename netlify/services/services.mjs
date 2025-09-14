import Stripe from "stripe";
import AirtableService from "./airtableService.mjs";
import CalComService from "./calComService.mjs";
import DatabaseService from "./databaseService.mjs";
import BookingService from "./bookingService.mjs";
import AuthService from "./authService.mjs";
import PaymentService from "./paymentService.mjs";
import SessionService from "./sessionService.mjs";
import LoopsService from "./loopsService.mjs";
import { eventDispatcher } from "./eventDispatcher.mjs";
import NotificationService from "./notificationService.mjs";
import Logger from "./logger.mjs";

// SaaS

import { LoopsClient } from "loops";

const airtableService = new AirtableService(
  process.env.AIRTABLE_API_KEY,
  process.env.AIRTABLE_BASE_KEY,
);

const calComService = new CalComService(
  process.env.CALCOM_API_BASE_URL,
  process.env.CALCOM_WEBHOOK_SECRET,
);

const logger = new Logger({ server_created: new Date().toISOString() });

const loopsService = new LoopsService(
  new LoopsClient(process.env.LOOPS_API_KEY),
);

const stripeService = new Stripe(process.env.STRIPE_SECRET_KEY);

// Database

const databaseService = new DatabaseService();

// Internals

const bookingService = new BookingService();

const sessionService = new SessionService();

const paymentService = new PaymentService(process.env.STRIPE_PUBLISHABLE_KEY);

const notificationService = new NotificationService(
  process.env.NTFY_SH_TOPIC,
  process.env.NTFY_SH_URL,
);

const authService = new AuthService(
  process.env.ZAPIER_SECRET_KEY,
  process.env.STRIPE_WEBHOOK_SECRET,
  process.env.CALCOM_WEBHOOK_SECRET,
);

export {
  airtableService,
  calComService,
  loopsService,
  databaseService,
  bookingService,
  authService,
  paymentService,
  eventDispatcher,
  stripeService,
  sessionService,
  logger,
  notificationService,
};
