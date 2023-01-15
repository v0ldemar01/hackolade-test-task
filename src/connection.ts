import { Client, auth } from 'cassandra-driver';
import { ENV } from '~/configs/env.config.js';
import { DbConnectionError } from '~/exceptions/exceptions.js';
import {
  cassandraConnection as cassandraConnectionValidationSchema,
} from '~/validation-schemas/validation-schemas.js';
import { Logger } from '~/services/services.js';

const initConnection = async ({ logger }: { logger: Logger }): Promise<Client | undefined> => {
  const connectionConfig = {
    localDataCenter: ENV.CASSANDRA.LOCAL_DATA_CENTER,
    authProvider: ENV.CASSANDRA.AUTH_PROVIDER,
    username: ENV.CASSANDRA.USERNAME,
    password: ENV.CASSANDRA.PASSWORD,
    host: ENV.CASSANDRA.HOST,
    port: ENV.CASSANDRA.PORT,
  };

  try {
    await cassandraConnectionValidationSchema.validateAsync(connectionConfig);
  } catch (err) {
    logger.error(new DbConnectionError({
      message: (err as Error).message,
      stack: (err as Error).stack,
    }));

    return;
  }

  try {
    const client = new Client({
      localDataCenter: connectionConfig.localDataCenter,
      contactPoints: [`${connectionConfig.host}:${connectionConfig.port}`],
      authProvider: new auth[`${connectionConfig.authProvider}AuthProvider` as keyof typeof auth](
        connectionConfig.username,
        connectionConfig.password,
      ),
    });
    await client.connect();

    return client;
  } catch (err) {
    logger.error(new DbConnectionError({
      message: (err as Error).message,
      stack: (err as Error).stack,
    }));

    return;
  }
};

export { initConnection };