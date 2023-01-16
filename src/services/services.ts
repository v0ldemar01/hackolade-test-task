import {
  Cassandra,
} from './cassandra/cassandra.service.js';
import { CQLParser } from './cql-parser/cql-parser.service.js';
import { Logger } from './logger/logger.service.js';
import {
  Cassandra as CassandraRepository,
} from '~/data/repositories/repositories.js';
import {
  CQLJSONSchemaTransformer,
} from './cql-json-schema-trasformer/cql-json-schema-transformer.service.js';

const initServices = ({ cassandraRepository }: {
  cassandraRepository: CassandraRepository
}): {
  cassandra: Cassandra;
  cqlParser: CQLParser;
  cqlJSONSchemaTransformer: CQLJSONSchemaTransformer;
  } => {
  const cqlParser = new CQLParser();

  const cqlJSONSchemaTransformer = new CQLJSONSchemaTransformer({
    cqlParserService: cqlParser,
  });

  const cassandra = new Cassandra({ cassandraRepository });

  return {
    cassandra,
    cqlParser,
    cqlJSONSchemaTransformer,
  };
};

export {
  initServices,
  Logger,
  Cassandra,
  CQLParser,
  CQLJSONSchemaTransformer,
};