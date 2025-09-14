import Airtable from "airtable";
import { logger } from "./services.mjs";

import fs from "fs/promises";
import path from "path";

class AirtableService {
  constructor(apiKey, baseKey) {
    this.apiKey = apiKey;
    this.baseKey = baseKey;
    this.base = new Airtable({ apiKey: this.apiKey }).base(this.baseKey);
    this.tables = undefined;
    this.tableFieldNames = {};
  }

  // implement the safeGet(field) function that confirms the table
  // schema has the field we expect before calling record.get()
  safeRecord(record, fields) {
    const originalGet = record.get;
    const safeRecordObj = {
      ...record,
      get: () => {
        throw new Error(
          `Direct access to record.get is not allowed. Use record.safeGet instead.`,
        );
      },
      safeGet: (field) => {
        if (!fields[field]) {
          throw new Error(
            `Field "${field}" not found in table "${record._table.name}"`,
          );
        }

        const result = originalGet.call(record, field);

        if (result === undefined || result === null) {
          switch (fields[field]) {
            case "singleLineText":
            case "multilineText":
            case "email":
            case "url":
            case "phoneNumber":
            case "attachment":
            case "richText":
              return "";
            case "multipleRecordLinks":
            case "multipleLookupValues":
            case "multipleSelects":
            case "multipleSelect":
            case "singleSelect":
              return [];
            case "checkbox":
              return false;
            case "number":
            case "currency":
            case "percent":
            case "rating":
              return 0;
            case "date":
            case "dateTime":
              return null;
            default:
              logger.warn(`Unknown field type ${fields[field]} for ${field} in ${record._table.name}, returning empty string`);
              return "";
          }
        }
        return result;
      }
    };

    Object.setPrototypeOf(safeRecordObj, Object.getPrototypeOf(record));
    return safeRecordObj;
  }

  async getTables() {
    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${this.baseKey}/tables`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.statusText}`);
    }
    const data = await response.json();

    return data.tables;
  }

  async getTable(tableName) {
    if (!this.tables) {
      this.tables = await this.getTables();
    }
    const table = this.tables.find((t) => t.name === tableName);

    if (!table) {
      throw new Error(`Table "${tableName}" not found`);
    }

    return table;
  }

  async getTableFieldsNames(table) {
    if (this.tableFieldNames[table.name]) {
      return this.tableFieldNames[table.name];
    }

    // save the field names to a set in the tableFieldNames object
    const fields = {};
    for (const field of table.fields) {
      fields[field.name] = field.type;
    }

    this.tableFieldNames[table.name] = fields;

    return fields;
  }

  async saveTableFields(tableName) {
    const modelDir = path.join(process.cwd(), "netlify", "tables", "models");
    const modelPath = path.join(modelDir, `${tableName}.json`);

    // Ensure the directory exists
    await fs.mkdir(modelDir, { recursive: true });
    const table = await this.getTable(tableName);

    // output the fields field to json file
    const fields = table.fields.map((field) => {
      return {
        name: field.name,
        type: field.type,
      };
    });

    await fs.writeFile(modelPath, JSON.stringify(fields, null, 2));
  }

  // check the fields of the table vs the ones in the json file
  // if the fields are not the same, throw an error
  async checkFields(tableName) {
    const modelPath = path.join(
      process.cwd(),
      "netlify",
      "tables",
      "models",
      `${tableName}.json`,
    );
    const table = await this.getTable(tableName);

    // check if the model file exists
    try {
      await fs.access(modelPath);
    } catch {
      // if the file does not exist, create it
      await logger.warn(
        `[checkFields] Model file does not exist, creating it`,
        { tableName: tableName },
      );
      await this.saveTableFields(tableName);
      return; // Return early since we just created the model file
    }

    const model = JSON.parse(await fs.readFile(modelPath, "utf8"));

    if (model.length !== table.fields.length) {
      // print the fields that are in model but not in table and vice versa
      const modelFieldNames = model.map((f) => f.name);
      const tableFieldNames = table.fields.map((f) => f.name);
      const missingInModel = tableFieldNames.filter(
        (f) => !modelFieldNames.includes(f),
      );
      const missingInTable = modelFieldNames.filter(
        (f) => !tableFieldNames.includes(f),
      );
      await logger.error(
        `[checkFields] Model file does not match the table fields`,
        {
          tableName: tableName,
          missingInModel: missingInModel,
          missingInTable: missingInTable,
        },
      );

      throw new Error(
        `[checkFields] Model file does not match the table fields: ${JSON.stringify(
          {
            tableName: tableName,
            missingInModel: missingInModel,
            missingInTable: missingInTable,
          },
        )}`,
      );
    }

    for (const field of model) {
      const tableField = table.fields.find((f) => f.name === field.name);
      if (!tableField || tableField.type !== field.type) {
        await logger.error(
          `[checkFields] Model file does not match the table fields`,
          {
            tableName: tableName,
            modelField: field,
            tableField: tableField,
          },
        );
        throw new Error(
          `[checkFields] Model file does not match the table fields: ${JSON.stringify(
            {
              tableName: tableName,
              modelField: field,
              tableField: tableField,
            },
          )}`,
        );
      }

      // check if the options are the same
      if (field.options && tableField.options) {
        const modelOptions = field.options;
        const tableOptions = tableField.options;

        // check if the options are the same
        if (JSON.stringify(modelOptions) !== JSON.stringify(tableOptions)) {
          await logger.error(
            `[checkFields] Model file does not match the table fields`,
            {
              tableName: tableName,
              modelOptions: modelOptions,
              tableOptions: tableOptions,
            },
          );
          throw new Error(
            `Model file does not match the table fields: ${JSON.stringify({
              tableName: tableName,
              modelOptions: modelOptions,
              tableOptions: tableOptions,
            })}`,
          );
        }
      }
    }
  }

  // Helper to call Airtable
  async findAirtableRecords(tableName, filterFormula, options = {}) {
    if (process.env.DISABLE_AIRTABLE) {
      throw new Error(
        `Airtable is disabled - [findAirtableRecords] on [${tableName}] with [${filterFormula}]`,
      );
    }

    const selectParams = {
      filterByFormula: filterFormula,
      ...options
    };

    const records = await this.base(tableName)
      .select(selectParams)
      .firstPage();

    const table = await this.getTable(tableName);

    const tableFieldsNames = await this.getTableFieldsNames(table);

    return records.map((record) => this.safeRecord(record, tableFieldsNames));
  }

  // Helper to create a new Airtable record
  async insertAirtableRecord(tableName, fields) {
    if (process.env.DISABLE_AIRTABLE) {
      throw new Error(
        `Airtable is disabled - [insertAirtableRecord] on [${tableName}] with [${fields}]`,
      );
    }

    const records = await this.base(tableName).create([
      {
        fields: fields,
      },
    ]);

    const table = await this.getTable(tableName);

    const tableFieldsNames = await this.getTableFieldsNames(table);

    return records.map((record) => this.safeRecord(record, tableFieldsNames));
  }

  async updateAirtableRecord(tableName, recordId, fields) {
    if (process.env.DISABLE_AIRTABLE) {
      throw new Error(
        `Airtable is disabled - [updateAirtableRecord] on [${tableName}] with [${recordId}] [${fields}]`,
      );
    }
    const record = await this.base(tableName).update(recordId, fields);

    const table = await this.getTable(tableName);

    const tableFieldsNames = await this.getTableFieldsNames(table);

    return this.safeRecord(record, tableFieldsNames);
  }

  async deleteAirtableRecord(tableName, recordId) {
    if (process.env.DISABLE_AIRTABLE) {
      throw new Error(
        `Airtable is disabled - [deleteAirtableRecord] on [${tableName}] with [${recordId}]`,
      );
    }

    const result = await this.base(tableName).destroy(recordId);
    const table = await this.getTable(tableName);

    const tableFieldsNames = await this.getTableFieldsNames(table);

    return this.safeRecord(result, tableFieldsNames);
  }
}

export default AirtableService;
