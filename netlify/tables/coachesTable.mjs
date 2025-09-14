import BaseTable from "./baseTable.mjs";

class CoachesTable extends BaseTable {
  constructor() {
    super("Coaches");
  }

  async findByEmail(email) {
    const result = await this.findByFormula(`{Email} = '${email}'`);

    if (result.length == 0) {
      throw Error(`[findByEmail] Coach with email ${email} not found`);
    }

    if (result.length > 1) {
      throw Error(`[findByEmail] Multiple coaches with email ${email} found`);
    }

    return result[0];
  }
}

export default CoachesTable;
