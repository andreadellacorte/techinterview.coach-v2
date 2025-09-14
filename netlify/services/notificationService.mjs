// a class that sends notifications to ntfy.sh via simple axios requests

// Usage example:

// const ntfyShService = new NtfyShService(process.env.NTFY_SH_TOPIC, process.env.NTFY_SH_URL);
// await ntfyShService.sendNotification('Hello World!');

import axios from "axios";
import { logger } from "./services.mjs";

class NotificationService {
  constructor(topic, url) {
    this.topic = topic;
    this.url = url;
  }

  async send(
    message,
    title = "ntfy.sh notification",
    priority = "default",
    tags = ["information_source"],
  ) {
    try {
      if (!message) {
        throw new Error("Invalid message");
      }

      const headers = {
        Title: title,
        Priority: priority,
        Tags: tags.join(","),
      };

      const response = await axios.post(`${this.url}/${this.topic}`, message, {
        headers,
      });
      return response;
    } catch (error) {
      await logger.error("[NtfyShService] Error sending notification:", error);
      throw error;
    }
  }
}
export default NotificationService;
