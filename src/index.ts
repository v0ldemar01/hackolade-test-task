import { Client } from 'cassandra-driver';
import { initServices, Logger } from '~/services/services.js';
import { initConnection } from '~/connection.js';
import { initRepositories } from './data/repositories/repositories.js';
import { writeFile } from './helpers/helpers.js';
import { ENV } from './configs/env.config.js';

(async (): Promise<void> => {
  const logger = new Logger();

  const connection = await initConnection({ logger }) as Client;
  const { cassandra: cassandraRepository } = initRepositories({
    connection,
  });
  const { cassandra, cqlJSONSchemaTransformer } = initServices({ cassandraRepository });

  const tableName = 'users';
  const data = await cassandra.getTableColumnsWithUsedUdts(tableName);

  const result = cqlJSONSchemaTransformer.generateJSONSchema({
    title: tableName,
    ...data,
  });

  const contentStr = JSON.stringify(result, null, 2);

  logger.info(contentStr);

  await writeFile(
    (new URL(ENV.FS.JSON_SCHEMA_SAVED_FILE, import.meta.url)).pathname,
    contentStr,
  );
})();