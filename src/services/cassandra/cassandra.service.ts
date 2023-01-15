import {
  ICassandraColumn,
  ICassandraUserDefinedType,
} from '~/common/model-types/model-types.js';
import {
  Cassandra as CassandraRepository,
} from '~/data/repositories/cassandra/cassandra.repository.js';

interface ICassandraServiceConstructor {
  cassandraRepository: CassandraRepository;
}

class Cassandra {
  #cassandraRepository: CassandraRepository;

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
}

export { Cassandra };