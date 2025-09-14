import {
  stripeService,
  databaseService,
  logger,
  loopsService,
} from "../services/services.mjs";

import { config } from "../config/config.mjs";

import axios from "axios";

class PaymentService {
  async registerWebhooks(context) {
    const baseUrl =
      context.deploy.context === "production"
        ? "https://production--techinterviewcoach.netlify.app"
        : "https://development--techinterviewcoach.netlify.app";

    await stripeService.webhookEndpoints.create({
      url: `${baseUrl}/.netlify/functions/webhook`,
      enabled_events: [
        "checkout.session.completed",
        "invoice.payment_succeeded",
      ],
    });
  }

  async getExchangeRates(currency) {
    const exchangeRatesEndpoint = config.exchangeRatesEndpoint;

    try {
      const response = await axios.get(
        `${exchangeRatesEndpoint}/${currency}.json`,
      );
      return response.data[currency];
    } catch (error) {
      await logger.error(
        `[paymentService.getExchangeRates] Failed to fetch exchange rates for ${currency}`,
        {
          error: error.message,
        },
      );
      throw new Error(`Unable to fetch exchange rates for ${currency}`);
    }
  }

  async recordPurchase(purchaseData) {
    // Check if a purchase with the same stripe_id already exists
    const existingPurchase = await databaseService.purchases.findByFormula(
      `{stripe_id} = "${purchaseData.stripe_id}"`,
    );

    if (existingPurchase.length === 1) {
      await logger.warn(
        `[paymentService.recordPurchase] Purchase already exists for stripe_id`,
        purchaseData,
      );
      return existingPurchase[0];
    }

    if (existingPurchase.length > 1) {
      await logger.error(
        `[paymentService.recordPurchase] Multiple purchases found for stripe_id`,
        purchaseData,
      );
      throw new Error(
        `Multiple purchases found for stripe_id ${purchaseData.stripe_id}`,
      );
    }

    // Proceed to create a new purchase if no existing purchase is found
    const purchase = await databaseService.purchases.create(purchaseData);

    const purchasedSessions = purchaseData["Purchased Sessions"];

    const customer = await databaseService.coachees.findById(
      purchaseData["Customer Name"],
    );

    const customerEmail = customer.safeGet("Email");

    // Find the oldest unpaid event
    const unpaidEvents = await databaseService.events.findByFormula(
      `AND({Status} = "outstanding", {Email (from Customer Name) (from Debit ID)} = "${customerEmail}")`,
    );

    if (unpaidEvents.length === 0) {
      await logger.info(
        "[paymentService.recordPurchase] No unpaid events found",
      );
    } else {
      const unpaidSessionsNeeded = unpaidEvents[0].safeGet("Purchased Sessions");
      if (purchasedSessions < unpaidSessionsNeeded) {
        await logger.warn(
          "[paymentService.recordPurchase] Purchased sessions is less than unpaid events",
        );
        throw new Error(
          `Purchased sessions (${purchasedSessions}) is less than unpaid events (${unpaidSessionsNeeded})`,
        );
      } else {
        await logger.info(
          "[paymentService.recordPurchase] Found unpaid events",
        );

        // Sort them by "Created"
        await logger.info(
          "[paymentService.recordPurchase] Sorting unpaid events by creation date",
        );

        const sortedUnpaidEvents = unpaidEvents.sort((a, b) => {
          const dateA = new Date(a.safeGet("Created"));
          const dateB = new Date(b.safeGet("Created"));
          return dateA - dateB;
        });

        const updatedUnpaid = await databaseService.events.update(
          sortedUnpaidEvents[0].id,
          {
            Status: "paid",
            "Negative Credits": 0,
            "Purchase ID": [purchase.id],
            Notes: `Paid by Netlify - recordPurchase function on ${new Date().toISOString}`,
          },
        );

        await logger.info(
          "[paymentService.recordPurchase] Unpaid event updated",
          updatedUnpaid,
        );
      }
    }

    return purchase;
  }

  async prepareConversionData(checkoutSession) {
    try {
      if (!checkoutSession.client_reference_id) {
        await logger.warn(
          "[paymentService.prepareConversionData] No client_reference_id found in the Stripe session",
        );
        return;
      }

      if (!checkoutSession.customer_details.email) {
        throw new Error("No customer email found in the Stripe session");
      }

      await logger.info(
        "[paymentService.prepareConversionData] Processing checkout session:",
        checkoutSession,
      );

      return {
        coacheeEmail: checkoutSession.customer_details.email.toLowerCase(),
        sessionId: checkoutSession.client_reference_id,
      };
    } catch (error) {
      await logger.error(
        "[paymentService.prepareConversionData] Failed:",
        error,
      );
      throw error; // Ensure error is thrown and not just logged
    }
  }

  async preparePurchaseData(customer_id, stripeObject, item, isSubscription) {
    if (
      !customer_id ||
      !stripeObject ||
      !item ||
      typeof isSubscription !== "boolean"
    ) {
      await logger.error(
        "[paymentService.preparePurchaseData] Missing required parameters",
        {
          customer_id,
          stripeObject,
          item,
          isSubscription,
        },
      );
      throw new Error("Missing required parameters", {
        customer_id,
        stripeObject,
        item,
        isSubscription,
      });
    }

    await logger.info(
      `[paymentService.recordPurchase] Preparing data for ${
        isSubscription ? "subscription" : "one-off"
      } purchase`,
      {
        customer_id,
        stripeObject,
        item,
      },
    );

    const toEurExchangeRates = await this.getExchangeRates("eur");
    const toEurExchangeRate = 1 / toEurExchangeRates[item.currency];

    if (!toEurExchangeRate) {
      await logger.error(
        `[paymentService.recordPurchase] Exchange rate for currency ${item.currency} not found.`,
      );
      throw new Error(`Exchange rate for currency ${item.currency} not found.`);
    }

    await logger.info(
      "[paymentService.recordPurchase] Exchange rate for currency",
      {
        currency: item.currency,
        toEurExchangeRate,
      },
    );

    let purchasedSessions = 0;

    if (isSubscription) {
      const products = await databaseService.products.findByFormula(`
        AND(
          {stripe_product_id} = "${item.price.product}",
          {stripe_price_id} = "${item.price.id}"
        )`);

      if (products.length === 0) {
        await logger.error(
          "[paymentService.preparePurchaseData] Product not found",
          {
            item,
          },
        );
        throw new Error(
          `Product and Price not found: ${item.price.product} - ${item.price.id}`,
        );
      }

      purchasedSessions =
        products[0].safeGet("Credits per Purchase") *
        products[0].safeGet("Credits per Session");

      if (item.proration && item.proration_details.credited_items) {
        purchasedSessions = -purchasedSessions;
      }
    }

    return {
      stripe_id: stripeObject.payment_intent,
      link: `https://dashboard.stripe.com/payments/${stripeObject.payment_intent}`,
      "Customer Name": [customer_id],
      Product: item.description,
      "Purchased Sessions": purchasedSessions,
      "Purchase Date": new Date(stripeObject.created * 1000)
        .toISOString()
        .split("T")[0],
      "To EUR Exchange Rate": toEurExchangeRate,
      "Original Purchase Price": item.amount / 100,
      "Price Currency": item.currency,
      Notes: `Created by Netlify - ${
        isSubscription ? "recordSubscription" : "recordOneOff"
      } function`,
    };
  }

  // Add a new method to handle processing line items
  async processCheckoutSession(customer, checkoutSession) {
    await this.handleFirstPurchase(customer);

    const lineItems = await stripeService.checkout.sessions.listLineItems(
      checkoutSession.id,
    );

    for (const item of lineItems.data) {
      if (item.price.recurring) {
        await logger.info(
          "Subscription item - skipping; will be managed by invoice.payment_succeeded",
          item.description,
        );
      } else {
        await logger.info("One-off item - processing", item.description);
        await this.recordOneOff(customer.id, checkoutSession, item);
      }
    }
  }

  async recordOneOff(customer_id, stripeObject, item) {
    const purchaseData = await this.preparePurchaseData(
      customer_id,
      stripeObject,
      item,
      false,
    );

    return await this.recordPurchase(purchaseData);
  }

  async handleFirstPurchase(customer) {
    await logger.info(
      "[paymentService.handleFirstPurchase] Checking for first purchase",
      customer,
    );

    if (customer.safeGet("Credit").length === 0) {
      // send welcome email
      await loopsService.sendTransactionalEmail({
        transactionalId: "clye56c3e015jw4h5wojsnvp1",
        email: customer.safeGet("Email"),
        dataVariables: {
          "coachee-name": customer.safeGet("First Name"),
        },
      });

      await logger.info(
        "[paymentService.handleFirstPurchase] Sending welcome email",
        customer,
      );
    } else {
      await logger.info(
        "[paymentService.handleFirstPurchase] Customer already has credits",
        customer,
      );
    }
  }

  // Add a new method to handle processing invoice payments
  async processInvoicePayment(customer, invoice) {
    await this.handleFirstPurchase(customer);

    if (invoice.subscription) {
      await logger.info(
        `Subscription payment succeeded: ${invoice.subscription}`,
      );
      // Handle successful subscription renewal (e.g., extend access)

      for (const item of invoice.lines.data) {
        await logger.info("Subscription item", item.description);
        await this.recordSubscription(customer.id, invoice, item);
      }
    } else {
      await logger.error("No handler for non-Subscription - skipping", invoice);
    }
  }

  async recordSubscription(customer_id, stripeObject, item) {
    const purchaseData = await this.preparePurchaseData(
      customer_id,
      stripeObject,
      item,
      true,
    );

    return await this.recordPurchase(purchaseData);
  }
}

export default PaymentService;
