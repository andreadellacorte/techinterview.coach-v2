import SessionsTable from "../tables/sessionsTable.mjs";
import UTMsTable from "../tables/utmsTable.mjs";
import BookingsTable from "../tables/bookingsTable.mjs";
import CoacheesTable from "../tables/coacheesTable.mjs";
import CoachesTable from "../tables/coachesTable.mjs";
import EventsTable from "../tables/eventsTable.mjs";
import SubscriptionsTable from "../tables/subscriptionsTable.mjs";
import EmailsTable from "../tables/emailsTable.mjs";
import LogsTable from "../tables/logsTable.mjs";
import PurchasesTable from "../tables/purchasesTable.mjs";
import ProductsTable from "../tables/productsTable.mjs";

class DatabaseService {
  constructor() {
    this.coachees = new CoacheesTable();
    this.events = new EventsTable();
    this.coaches = new CoachesTable();
    this.bookings = new BookingsTable();
    this.sessions = new SessionsTable();
    this.utms = new UTMsTable();
    this.subscriptions = new SubscriptionsTable();
    this.emails = new EmailsTable();
    this.purchases = new PurchasesTable();
    this.products = new ProductsTable();
    this.logs = new LogsTable();
  }
}

export default DatabaseService;
