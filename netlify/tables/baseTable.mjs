import { airtableService } from "../services/services.mjs";

class BaseTable {
  constructor(tableName) {
    if (!tableName) {
      throw new Error("Table name is required");
    }
    this.tableName = tableName;
  }

  getTableName() {
    return this.tableName;
  }

  async all() {
    return await airtableService.findAirtableRecords(this.tableName, "");
  }

  async findById(id) {
    const result = await airtableService.findAirtableRecords(
      this.tableName,
      `RECORD_ID() = '${id}'`,
    );

    if (result.length != 1) {
      throw Error(`Record with ID ${id} not found in ${this.tableName}`);
    } else {
      return result[0];
    }
  }

  async findByFormula(formula, options) {
    if (options) {
      return await airtableService.findAirtableRecords(this.tableName, formula, options);
    }
    return await airtableService.findAirtableRecords(this.tableName, formula);
  }

  async create(record) {
    const result = await airtableService.insertAirtableRecord(
      this.tableName,
      record,
    );
    return result[0];
  }

  async update(id, fields) {
    return await airtableService.updateAirtableRecord(
      this.tableName,
      id,
      fields,
    );
  }

  async delete(id) {
    return await airtableService.deleteAirtableRecord(this.tableName, id);
  }
}

export default BaseTable;
