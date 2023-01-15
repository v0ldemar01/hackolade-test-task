import { config } from 'dotenv';

config();

const {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_AUTH_PROVIDER,
  DB_LOCAL_DATA_CENTER,
} = process.env;

const ENV = {
  CASSANDRA: {
    HOST: String(DB_HOST),
    PORT: Number(DB_PORT),
    USERNAME: String(DB_USERNAME),
    PASSWORD: String(DB_PASSWORD),
    AUTH_PROVIDER: String(DB_AUTH_PROVIDER),
    LOCAL_DATA_CENTER: String(DB_LOCAL_DATA_CENTER),
  },
};

export { ENV };
