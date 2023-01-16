import { it, expect, describe } from '@jest/globals';
import {
  CQLDataType,
  CQLKeywordType,
  CQLBasicDataType,
  JSONSchemaDataType,
  CQLCollectionDataType,
} from '../../../common/enums/enums';
import {
  CQLParser,
} from '../../../services/cql-parser/cql-parser.service';

describe('CQLParserService', () => {
  const cqlParser = new CQLParser();

  it('should find out type is wrapped by', () => {
    const type = `${CQLKeywordType.FROZEN}<${CQLBasicDataType.INT}>`;
    const result = cqlParser.checkWrappedType(type, CQLKeywordType.FROZEN);

    expect(result).toBeTruthy();
  });

  it('should return wrapped type with one internal', () => {
    const result = cqlParser.getWrappedType(
      [CQLBasicDataType.INT],
      CQLKeywordType.FROZEN,
    );

    expect(result).toEqual(`${CQLKeywordType.FROZEN}<${CQLBasicDataType.INT}>`);
  });

  it('should return wrapped type with several internals', () => {
    const result = cqlParser.getWrappedType(
      [CQLBasicDataType.INT, CQLBasicDataType.TEXT, CQLBasicDataType.BOOLEAN],
      CQLDataType.TUPLE,
    );

    expect(result).toEqual(
      `${CQLDataType.TUPLE}<${[
        CQLBasicDataType.INT,
        CQLBasicDataType.TEXT,
        CQLBasicDataType.BOOLEAN,
      ].join(', ')}>`,
    );
  });

  it('should extract type from wrapped one', () => {
    const result = cqlParser.extractTypesFromWrapper(
      `${CQLDataType.TUPLE}<${[
        CQLBasicDataType.INT,
        CQLBasicDataType.TEXT,
        CQLBasicDataType.BOOLEAN,
      ].join(', ')}>`,
    );

    expect(result).toEqual([
      CQLBasicDataType.INT,
      CQLBasicDataType.TEXT,
      CQLBasicDataType.BOOLEAN,
    ]);
  });

  it('should correct trasform cql type to json one', () => {
    expect(
      cqlParser.fromCSQToJSON(CQLBasicDataType.ASCII),
    ).toEqual(JSONSchemaDataType.STRING);
    expect(
      cqlParser.fromCSQToJSON(CQLBasicDataType.DATE),
    ).toEqual(JSONSchemaDataType.STRING);
    expect(
      cqlParser.fromCSQToJSON(CQLBasicDataType.SMALLINT),
    ).toEqual(JSONSchemaDataType.NUMBER);
    expect(
      cqlParser.fromCSQToJSON(CQLBasicDataType.UUID),
    ).toEqual(JSONSchemaDataType.STRING);
    expect(
      cqlParser.fromCSQToJSON(CQLBasicDataType.VARINT),
    ).toEqual(JSONSchemaDataType.NUMBER);
  });

  it('should correct trasform value to cql type', () => {
    const stringifyValue = '{"firstName": "Vova", "age": 21, "phones" : ["=380935610264"]}';
    const objValue = JSON.parse(stringifyValue);

    expect(cqlParser.findOutStringifiedType(objValue.firstName)).toEqual(CQLBasicDataType.TEXT);
    expect(cqlParser.findOutStringifiedType(objValue.age)).toEqual(CQLBasicDataType.INT);
    expect(cqlParser.findOutStringifiedType(objValue.phones)).toEqual(`${CQLCollectionDataType.LIST}<${CQLBasicDataType.TEXT}>`);
  });
});