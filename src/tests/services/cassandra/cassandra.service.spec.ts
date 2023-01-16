import { it, jest, expect, describe, beforeEach } from '@jest/globals';
import { faker } from '@faker-js/faker';
import {
  CQLBasicDataType,
  CQLCollectionDataType,
} from '../../../common/enums/enums.js';
import {
  ICassandraColumn,
  ICassandraTable,
  ICassandraKeyspace,
  ICassandraUserDefinedType,
} from '../../../common/model-types/model-types.js';
import {
  ICassandraRepository,
} from '../../../data/repositories/cassandra/cassandra.repository.js';
import { Cassandra } from '../../../services/cassandra/cassandra.service.js';

describe('CassandraService', () => {
  const cassandraRepository = {} as ICassandraRepository;
  const cassandra = new Cassandra({
    cassandraRepository,
  });

  const data = {
    keyspaces: [{ keyspaceName: 'system_schema' }],
    tables: [
      { keyspaceName: 'system_schema', tableName: 'keyspaces' },
      { keyspaceName: 'my_keyspace', tableName: 'users' },
    ],
    columns: [
      {
        keyspaceName: 'system_schema',
        tableName: 'keyspaces',
        columnName: 'keyspace_name',
        type: CQLBasicDataType.TEXT,
      },
      {
        keyspaceName: 'my_keyspace',
        tableName: 'users',
        columnName: 'address',
        type: 'address',
      },
    ] as ICassandraColumn[],
    udts: [{
      typeName: 'address',
      fields: [
        {
          columnName: 'street',
          type: CQLBasicDataType.TEXT,
        },
        {
          columnName: 'city',
          type: CQLBasicDataType.TEXT,
        },
        {
          columnName: 'state',
          type: CQLBasicDataType.TEXT,
        },
        {
          columnName: 'zip',
          type: CQLBasicDataType.INT,
        },
        {
          columnName: 'phones',
          type: `${CQLCollectionDataType.SET}<${CQLBasicDataType.TEXT}>`,
        },
      ],
    }],
    firstRowData: {
      name: faker.name.fullName(),
    },
  };

  cassandraRepository.getKeyspaces = jest.fn<(
    () => Promise<ICassandraKeyspace[]>)
  >().mockImplementation(() => Promise.resolve(data.keyspaces));

  cassandraRepository.getTables = jest.fn<(
    (keyspaceName?: string) => Promise<ICassandraTable[]>)
  >().mockImplementation(() => Promise.resolve(data.tables));

  cassandraRepository.getTableColumns = jest.fn<(
    (params: {
      keyspaceName?: string;
      tableName?: string
    }) => Promise<ICassandraColumn[]>)
  >().mockImplementation(() => Promise.resolve(data.columns));

  cassandraRepository.getUserDefinedTypes = jest.fn<(
    (typeNames?: string[]) => Promise<ICassandraUserDefinedType[]>)
  >().mockImplementation(() => Promise.resolve(data.udts));

  cassandraRepository.getFirstRowFromTable = jest.fn<(
    (params: {
      keyspaceName: string;
      tableName: string
    }) => Promise<Record<string, unknown>>)
  >().mockImplementation(() => Promise.resolve(data.firstRowData));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return columns by table name', async () => {
    const columns = await cassandra.getColumnsByTableName(
      data.tables[0].tableName,
    );

    expect(columns).toEqual(data.columns);
    expect(cassandraRepository.getTableColumns).toHaveBeenCalledTimes(1);
    expect(cassandraRepository.getTableColumns).toHaveBeenCalledWith({
      tableName: data.tables[0].tableName,
    });
  });

  it('should return udts', async () => {
    const typeNames = undefined;
    const udts = await cassandra.getUdts(typeNames);

    expect(udts).toEqual(data.udts);
    expect(cassandraRepository.getUserDefinedTypes).toHaveBeenCalledTimes(1);
    expect(cassandraRepository.getUserDefinedTypes).toBeCalledWith(typeNames);
  });

  it('should return columns with used udts', async () => {
    const { columns, usedUdts } = await cassandra.getTableColumnsWithUsedUdts(
      data.tables[0].tableName,
    );

    expect(columns).toEqual(data.columns);
    expect(data.udts).toEqual(expect.arrayContaining(usedUdts));
    expect(data.columns).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: data.udts[0].typeName }),
    ]));
    expect(cassandraRepository.getUserDefinedTypes).toHaveBeenCalledTimes(1);
    expect(cassandraRepository.getUserDefinedTypes).toBeCalledWith(undefined);
    expect(cassandraRepository.getTableColumns).toHaveBeenCalledTimes(1);
    expect(cassandraRepository.getTableColumns).toHaveBeenCalledWith({
      tableName: data.tables[0].tableName,
    });
  });

  it('should return first row from table by search', async () => {
    const result = await cassandra.getFirstRowFromTable(data.tables[1]);

    expect(result).toEqual(data.firstRowData);
    expect(cassandraRepository.getFirstRowFromTable).toHaveBeenCalledTimes(1);
    expect(cassandraRepository.getFirstRowFromTable).toBeCalledWith(
      data.tables[1],
    );
  });
});