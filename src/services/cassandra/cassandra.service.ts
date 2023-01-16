import {
  ICassandraColumn,
  ICassandraUserDefinedType,
} from '~/common/model-types/model-types.js';
import {
  ICassandraRepository,
} from '~/data/repositories/cassandra/cassandra.repository.js';

interface ICassandraServiceConstructor {
  cassandraRepository: ICassandraRepository;
}

interface ICassandraService {
  getColumnsByTableName: (tableName: string) => Promise<ICassandraColumn[]>;
  getUdts: (typeNames?: string[]) => Promise<ICassandraUserDefinedType[]>;
  getTableColumnsWithUsedUdts: (tableName: string) => Promise<{
    columns: ICassandraColumn[];
    usedUdts: ICassandraUserDefinedType[]
  }>;
  getFirstRowFromTable: (params: {
    keyspaceName: string;
    tableName: string
  }) => Promise<Record<string, unknown>>;
}

class Cassandra implements ICassandraService {
  #cassandraRepository: ICassandraRepository;

  constructor({ cassandraRepository }: ICassandraServiceConstructor) {
    this.#cassandraRepository = cassandraRepository;
  }

  getColumnsByTableName = (tableName: string): Promise<ICassandraColumn[]> => {
    return this.#cassandraRepository.getTableColumns({
      tableName,
    });
  };

  getUdts = (typeNames?: string[]): Promise<ICassandraUserDefinedType[]> => {
    return this.#cassandraRepository.getUserDefinedTypes(typeNames);
  };

  getTableColumnsWithUsedUdts = async (tableName: string): Promise<{
    columns: ICassandraColumn[];
    usedUdts: ICassandraUserDefinedType[]
  }> => {
    const columns = await this.getColumnsByTableName(tableName);
    const availableUdts = await this.getUdts();
    const usedUdts = availableUdts
      .filter(({ typeName }) => columns
        .find(({ type }) => type.includes(typeName)));
    return {
      columns,
      usedUdts,
    };
  };

  getFirstRowFromTable = (params: {
    keyspaceName: string;
    tableName: string
  }): Promise<Record<string, unknown>> => {
    return this.#cassandraRepository.getFirstRowFromTable(params);
  };
}

export { Cassandra, type ICassandraService };