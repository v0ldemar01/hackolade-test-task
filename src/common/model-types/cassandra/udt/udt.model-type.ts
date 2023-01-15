import { ICassandraColumn } from '../cassandra';

interface ICassandraUserDefinedType {
  typeName: string;
  fields: Pick<ICassandraColumn, 'type' | 'columnName'>[];
}

export { type ICassandraUserDefinedType };