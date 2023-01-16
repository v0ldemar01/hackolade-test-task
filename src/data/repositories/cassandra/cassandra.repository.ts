import { Client } from 'cassandra-driver';
import {
  ICassandraTable,
  ICassandraColumn,
  ICassandraKeyspace,
  ICassandraUserDefinedType,
} from '~/common/model-types/model-types.js';

interface ICassandraRepositoryConstructor {
  connection: Client;
}

interface ICassandraRepository {
  getKeyspaces: () => Promise<ICassandraKeyspace[]>;
  getTables: (keyspaceName?: string) => Promise<ICassandraTable[]>;
  getTableColumns: (params: {
    keyspaceName?: string;
    tableName?: string
  }) => Promise<ICassandraColumn[]>;
  getUserDefinedTypes: (typeNames?: string[]) => Promise<ICassandraUserDefinedType[]>;
  getFirstRowFromTable: (params: {
    keyspaceName: string;
    tableName: string
  }) => Promise<Record<string, unknown>>;
}

class Cassandra implements ICassandraRepository {
  #connection: Client;

  constructor({ connection }: ICassandraRepositoryConstructor) {
    this.#connection = connection;
  }

  static SYSTEM_TABLE = 'system_schema';

  getKeyspaces = async (): Promise<ICassandraKeyspace[]> => {
    const query = `select keyspace_name from ${Cassandra.SYSTEM_TABLE}.keyspaces`;

    const { rows } = await this.#connection.execute(query);

    return rows.map(({ keyspace_name }) => ({
      keyspaceName: keyspace_name,
    }));
  };

  getTables = async (keyspaceName?: string): Promise<ICassandraTable[]> => {
    const query = `select keyspace_name, table_name from ${Cassandra.SYSTEM_TABLE}.tables`;
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
    const query = `select keyspace_name, table_name, column_name, type, kind from ${Cassandra.SYSTEM_TABLE}.columns`;
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

  getUserDefinedTypes = async (typeNames?: string[]): Promise<ICassandraUserDefinedType[]> => {
    const query = `select type_name, field_names, field_types from ${Cassandra.SYSTEM_TABLE}.types`;
    const queryWithTypeFiltering = `${query} where type_name in (?) allow filtering`;

    const { rows } = await this.#connection.execute(
      typeNames ? queryWithTypeFiltering : query,
      [...(typeNames ? [typeNames] : [])],
    );

    return rows.map(({ type_name, field_names, field_types }) => ({
      typeName: type_name,
      fields: (field_names as string[]).map((fieldName, index) => ({
        type: field_types[index],
        columnName: fieldName,
      })),
    }));
  };

  getFirstRowFromTable = async (params: {
    keyspaceName: string;
    tableName: string
  }): Promise<Record<string, unknown>> => {
    const query = `select * from ${params.keyspaceName}.${params.tableName}`;
    const result = await this.#connection.execute(query);

    return result.first();
  };
}

export { Cassandra, type ICassandraRepository };