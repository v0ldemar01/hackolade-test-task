import { Client } from 'cassandra-driver';
import { initServices, Logger } from '~/services/services.js';
import { initConnection } from '~/connection.js';
import { initRepositories } from './data/repositories/repositories.js';

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
  logger.info(JSON.stringify(result, null, 4));
})();