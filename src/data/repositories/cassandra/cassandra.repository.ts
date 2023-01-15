import { Client } from 'cassandra-driver';
import {
  ICassandraTable,
  ICassandraColumn,
  ICassandraKeyspace,
  IUserDefinedType,
} from '~/common/model-types/model-types.js';

interface ICassandraConstructor {
  connection: Client;
}

class Cassandra {
  #connection: Client;

  constructor({ connection }: ICassandraConstructor) {
    this.#connection = connection;
  }

  getKeyspaces = async (): Promise<ICassandraKeyspace[]> => {
    const query = 'select * from system_schema.keyspaces';

    const { rows } = await this.#connection.execute(query);

    return rows.map(({ keyspace_name }) => ({
      keyspaceName: keyspace_name,
    }));
  };

  getTables = async (keyspaceName?: string): Promise<ICassandraTable[]> => {
    const query = 'select keyspace_name, table_name FROM system_schema.tables';
    const queryWithKeyspaceFiltering = `${query} where keyspace_name = ? allow filtering`;

    const { rows } = await this.#connection.execute(
      keyspaceName ? queryWithKeyspaceFiltering : query,
      [...(keyspaceName ? [keyspaceName] : [])],
    );

    return rows.map(({ table_name, keyspace_name }) => ({
      tableName: table_name,
      keyspaceName: keyspace_name,
    }));
  };

  getTableColumns = async (params: {
    keyspaceName?: string;
    tableName?: string
  }): Promise<ICassandraColumn[]> => {
    const query = 'select keyspace_name, table_name, type, kind FROM system_schema.columns';
    const queryWithKeyspaceFiltering = `${query} where keyspace_name = ? allow filtering`;
    const queryWithTableFiltering = `${query} where table_name = ? allow filtering`;
    const queryWithKeyspaceTableFiltering = `${query} where keyspace_name = ? and table_name = ? allow filtering`;

    const queryDictionary = {
      query,
      queryWithTableFiltering,
      queryWithKeyspaceFiltering,
      queryWithKeyspaceTableFiltering,
    };
    const currentQuery = queryDictionary[Object.entries({
      query: !params,
      queryWithTableFiltering: Boolean(params && params.tableName && !params.keyspaceName),
      queryWithKeyspaceFiltering: Boolean(params && !params.tableName && !params.keyspaceName),
      queryWithKeyspaceTableFiltering: Boolean(params && params.tableName && params.keyspaceName),
    }).filter(([_, value]) => value)[0][0] as keyof typeof queryDictionary];

    const { rows } = await this.#connection.execute(
      currentQuery,
      [
        ...(params.keyspaceName ? [params.keyspaceName] : []),
        ...(params.tableName ? [params.tableName] : []),
      ],
    );

    return rows.map(({ table_name, keyspace_name, column_name, type, kind }) => ({
      type,
      kind,
      tableName: table_name,
      columnName: column_name,
      keyspaceName: keyspace_name,
    }));
  };

  getUserDefinedTypes = async (keyspaceName?: string): Promise<IUserDefinedType[]> => {
    const query = 'select type_name, field_names, field_types FROM system_schema.types';
    const queryWithKeyspaceFiltering = `${query} where keyspace_name = ? allow filtering`;

    const { rows } = await this.#connection.execute(
      keyspaceName ? queryWithKeyspaceFiltering : query,
      [...(keyspaceName ? [keyspaceName] : [])],
    );

    return rows.map(({ type_name, field_names, field_types }) => ({
      typeName: type_name,
      fields: (field_names as string[]).reduce((acc, current, i) => ({
        ...acc,
        [current]: field_types[i],
      }), [] as Record<string, string>[]),
    }));
  };
}

export { Cassandra };