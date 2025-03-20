import { Messages } from "../../lib/messages.js";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const { DB_PORT, DB_USER, DB_HOST, DB_NAME, DB_PASS } = process.env;
let pool = null;

const createPool = async () => {
  try {
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    Messages.debug("✅ Database pool created successfully");
    return pool;
  } catch (e) {
    Messages.error(e);
    throw e;
  }
};

const startPool = async () => {
  /* jshint ignore:start */
  if (!pool) {
    return await createPool();
  }
  /* jshint ignore:end */

  return pool;
};

export { startPool, createPool };
