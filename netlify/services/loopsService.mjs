import { logger } from "./services.mjs";

class LoopsService {
  constructor(loopsClient) {
    this.loopsClient = loopsClient;
  }

  async sendEvent(data) {
    if (process.env.JEKYLL_ENV != "production") return;

    const resp = await this.loopsClient.sendEvent(data);

    if (resp.success !== true) {
      await logger.error(
        "[sendEvent] Failed to send event to Loops",
        data.eventName,
      );
      throw new Error(`Failed to send event to Loops ${data.eventName}`);
    }
  }

  async createContact(data) {
    const resp = await this.loopsClient.createContact(data);

    if (resp.success !== true) {
      await logger.error(
        "[createContact] Failed to create contact in Loops",
        data.email,
      );
      throw new Error(`Failed to create contact in Loops`);
    }

    return resp;
  }

  async findContact(data) {
    return await this.loopsClient.findContact(data);
  }

  async deleteContact(data) {
    const resp = await this.loopsClient.deleteContact(data);

    if (resp.success !== true) {
      await logger.error(
        "[deleteContact] Failed to delete contact in Loops",
        data.email,
      );
      throw new Error(`Failed to delete contact in Loops`);
    }

    return resp;
  }

  async updateContact(id, loopsProperties) {
    const resp = await this.loopsClient.updateContact(id, loopsProperties);

    if (resp.success !== true) {
      await logger.error(
        "[updateContact] Failed to update contact in Loops",
        id,
      );
      throw new Error(`Failed to update contact in Loops`);
    }

    return resp;
  }

  async sendTransactionalEmail(data) {
    if (process.env.JEKYLL_ENV != "production") return;

    const resp = await this.loopsClient.sendTransactionalEmail(data);

    if (resp.success !== true) {
      await logger.error(
        "[sendTransactionalEmail] Failed to send transactional email to Loops",
        data.transactionalId,
      );
      throw new Error(`Failed to send transactional email to Loops`);
    }
  }
}

export default LoopsService;
