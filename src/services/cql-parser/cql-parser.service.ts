import {
  CQLDataType,
  CQLKeywordType,
  CQLBasicDataType,
  CQLCollectionDataType,
  JSONSchemaDataType,
} from '~/common/enums/enums.js';

class CQLParser {
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
}

export { CQLParser };