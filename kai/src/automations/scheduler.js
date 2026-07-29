import cron from "node-cron";

export class Scheduler {
  schedule(cronExpr, callback) {
    if (!cron.validate(cronExpr)) return null;
    return cron.schedule(cronExpr, callback, { scheduled: false });
  }

  start(job) { if (job) job.start(); }
  stop(job) { if (job) job.stop(); }

  validate(cronExpr) {
    return cron.validate(cronExpr);
  }
}

export const scheduler = new Scheduler();
