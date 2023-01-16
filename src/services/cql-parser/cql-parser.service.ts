import {
  CQLDataType,
  CQLKeywordType,
  CQLBasicDataType,
  CQLCollectionDataType,
  JSONSchemaDataType,
} from '../../common/enums/enums.js';

interface ICQLParserService {
  checkWrappedType: (
    type: string,
    candidate:
      | CQLKeywordType
      | CQLDataType.TUPLE
      | CQLCollectionDataType,
  ) => boolean;
  getWrappedType: (
    types: CQLBasicDataType[],
    wrapperType:
      | CQLKeywordType
      | CQLDataType.TUPLE
      | CQLCollectionDataType,
  ) => string;
  extractTypesFromWrapper: (wrappedType: string) => string[];
  fromCSQToJSON: (cqlBasicType: CQLBasicDataType) => JSONSchemaDataType;
  findOutStringifiedType: <T>(candidate: T) => string;
}

class CQLParser implements ICQLParserService {
  checkWrappedType = (
    type: string,
    candidate:
      | CQLKeywordType
      | CQLDataType.TUPLE
      | CQLCollectionDataType,
  ): boolean => type.startsWith(candidate);

  getWrappedType = (
    types: CQLBasicDataType[],
    wrapperType:
      | CQLKeywordType
      | CQLDataType.TUPLE
      | CQLCollectionDataType,
  ): string => `${wrapperType}<${types.join(', ')}>`;

  extractTypesFromWrapper = (wrappedType: string): string[] => {
    return wrappedType.replace(/\w+<(.+)>/, '$1').match(/\w+(<.*>)?/g) as string[];
  };

  fromCSQToJSON = (cqlBasicType: CQLBasicDataType): JSONSchemaDataType => ({
    [CQLBasicDataType.ASCII]: JSONSchemaDataType.STRING,
    [CQLBasicDataType.BIGINT]: JSONSchemaDataType.NUMBER,
    [CQLBasicDataType.BOOLEAN]: JSONSchemaDataType.BOOLEAN,
    [CQLBasicDataType.COUNTER]: JSONSchemaDataType.NUMBER,
    [CQLBasicDataType.DATE]: JSONSchemaDataType.STRING,
    [CQLBasicDataType.DECIMAL]: JSONSchemaDataType.NUMBER,
    [CQLBasicDataType.DOUBLE]: JSONSchemaDataType.NUMBER,
    [CQLBasicDataType.FLOAT]: JSONSchemaDataType.NUMBER,
    [CQLBasicDataType.INET]: JSONSchemaDataType.STRING,
    [CQLBasicDataType.INT]: JSONSchemaDataType.NUMBER,
    [CQLBasicDataType.SMALLINT]: JSONSchemaDataType.NUMBER,
    [CQLBasicDataType.TEXT]: JSONSchemaDataType.STRING,
    [CQLBasicDataType.TIME]: JSONSchemaDataType.STRING,
    [CQLBasicDataType.TIMESTAMP]: JSONSchemaDataType.STRING,
    [CQLBasicDataType.TIMEUUID]: JSONSchemaDataType.STRING,
    [CQLBasicDataType.TINYINT]: JSONSchemaDataType.NUMBER,
    [CQLBasicDataType.UUID]: JSONSchemaDataType.STRING,
    [CQLBasicDataType.VARCHAR]: JSONSchemaDataType.STRING,
    [CQLBasicDataType.VARINT]: JSONSchemaDataType.NUMBER,
  })[cqlBasicType];

  findOutStringifiedType = <T>(candidate: T): string => {
    const dictionary = {
      string: () => CQLBasicDataType.TEXT,
      number: () => CQLBasicDataType.INT,
      object: (type?: string) => this.getWrappedType(
        [this.findOutStringifiedType(type)] as CQLBasicDataType[],
        CQLCollectionDataType.LIST,
      ),
    };
    return dictionary[typeof candidate as 'string' | 'number' | 'object'](
      typeof candidate === 'object'
        ? (typeof (candidate as Array<unknown>)[0]) as string
        : undefined,
    );
  };
}

export { CQLParser, type ICQLParserService };
