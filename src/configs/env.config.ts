import { config } from 'dotenv';

config();

const {
  DB_HOST,
  DB_PORT,
  TABLE_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  KEYSPACE_NAME,
  DB_AUTH_PROVIDER,
  DB_LOCAL_DATA_CENTER,
  JSON_SCHEMA_SAVED_FILE,
} = process.env;

const ENV = {
  CASSANDRA: {
    HOST: String(DB_HOST),
    PORT: Number(DB_PORT),
    USERNAME: String(DB_USERNAME),
    PASSWORD: String(DB_PASSWORD),
    AUTH_PROVIDER: String(DB_AUTH_PROVIDER),
    LOCAL_DATA_CENTER: String(DB_LOCAL_DATA_CENTER),
    TABLE_NAME: String(TABLE_NAME),
    KEYSPACE_NAME: String(KEYSPACE_NAME),
  },
  FS: {
    JSON_SCHEMA_SAVED_FILE: String(JSON_SCHEMA_SAVED_FILE),
  },
};

export { ENV };
