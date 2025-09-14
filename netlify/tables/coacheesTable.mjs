import BaseTable from "./baseTable.mjs";

import { logger } from "../services/services.mjs";

class CoacheesTable extends BaseTable {
  constructor() {
    super("Customers");
  }

  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase();
    const result = await this.findByFormula(`{Email} = '${normalizedEmail}'`);

    if (result.length == 0) {
      throw Error(`[findByEmail] Coachee with email ${email} not found`);
    }

    if (result.length > 1) {
      throw Error(`[findByEmail] Multiple coachees with email ${email} found`);
    }

    return result[0];
  }

  async upsert(data) {
    const result = await this.findByFormula(`{Email} = '${data["Email"]}'`);

    if (result.length > 1) {
      throw Error(
        `[upsert] Multiple coachees with email ${data["Email"]} found`,
      );
    }

    if (result.length == 0) {
      // If coachee is not found, create a new one

      await logger.info("[upsert] Creating new Coachee", data["Email"]);

      data["Notes"] =
        "Created by Netlify - http-createBooking function on " +
        new Date().toISOString();

      return this.create(data);
    } else {
      var coachee = result[0];

      await logger.info("[upsert] Found Coachee", coachee.safeGet("Email"));

      // Update the fields that are not already set
      const fieldsToCheck = [
        "First Name",
        "Last Name",
        "Phone",
        "LinkedIn",
        "Notes",
      ];
      fieldsToCheck.forEach((field) => {
        if (coachee.safeGet(field) != null) {
          delete data[field];
        }
      });

      // remove empty fields from data
      Object.keys(data).forEach((key) => !data[key] && delete data[key]);

      await logger.info("[upsert] Updating Coachee", data["Email"]);

      return await this.update(coachee.id, data);
    }
  }
}

export default CoacheesTable;
