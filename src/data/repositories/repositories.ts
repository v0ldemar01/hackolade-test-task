import { Client } from 'cassandra-driver';
import { Cassandra } from './cassandra/cassandra.repository.js';

const initRepositories = ({ connection }: { connection: Client }): {
  cassandra: Cassandra;
} => {
  const cassandra = new Cassandra({ connection });

  return { cassandra };
};

export { initRepositories, type Cassandra };