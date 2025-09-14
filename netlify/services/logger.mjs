import { databaseService } from "./services.mjs";

class Logger {
  constructor(context = {}) {
    this.context = context;
  }

  withContext(newContext) {
    this.context = { ...this.context, ...newContext };
  }

  async log(level, message, metadata = {}) {
    // Skip console output in testing environment
    const isTestingEnv = process.env.JEKYLL_ENV === "testing";

    // Validate log level first
    if (!["info", "warn", "error", "debug"].includes(level)) {
      throw new Error(`Invalid log level: ${level}`);
    }

    // craft logging message with message + context + metadata
    const logMessage = `[${level.toUpperCase()}]: ${message} ${JSON.stringify(this.context)} ${JSON.stringify(metadata)}`;

    // Always attempt console logging first
    if (!isTestingEnv) {
      console[level](logMessage);
    }

    try {
      // Then attempt database logging
      await databaseService.logs.create({
        Created: new Date().toISOString(),
        Level: level,
        Message: message,
        Context: JSON.stringify(this.context),
        Metadata: JSON.stringify(metadata),
      });
    } catch (error) {
      // Log database error to console if not in testing
      if (!isTestingEnv) {
        console.error("Logging to Airtable failed:", {
          error: error.message,
          level,
          message,
          context: this.context,
          metadata,
        });
      }
      // Re-throw with the original error message
      throw error;
    }
  }

  info(message, metadata) {
    if (arguments.length > 2) {
      throw new Error("Logger methods accept only two parameters: message and metadata.");
    }
    return this.log("info", message, metadata);
  }

  warn(message, metadata) {
    if (arguments.length > 2) {
      throw new Error("Logger methods accept only two parameters: message and metadata.");
    }
    return this.log("warn", message, metadata);
  }

  error(message, metadata) {
    if (arguments.length > 2) {
      throw new Error("Logger methods accept only two parameters: message and metadata.");
    }
    return this.log("error", message, metadata);
  }

  debug(message, metadata) {
    if (arguments.length > 2) {
      throw new Error("Logger methods accept only two parameters: message and metadata.");
    }
    return this.log("debug", message, metadata);
  }
}

export default Logger;
