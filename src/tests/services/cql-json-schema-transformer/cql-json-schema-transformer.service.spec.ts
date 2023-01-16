import { it, jest, expect, describe } from '@jest/globals';
import {
  ICassandraColumn,
} from '../../../common/model-types/model-types.js';
import {
  CQLBasicDataType,
  CQLCollectionDataType,
  CQLDataType,
  CQLKeywordType,
  JSONSchemaDataType,
  JSONSchemaKey,
} from '../../../common/enums/enums.js';
import { getFullUrl } from '../../../helpers/helpers.js';
import {
  CQLParser,
  CQLJSONSchemaTransformer,
} from '../../../services/services.js';
import {
  JSON_SCHEMA_USED_DIALECT, MIN_ARRAY_ITEMS,
} from '../../../services/cql-json-schema-trasformer/common/constants.js';

describe('CQLJSONSchemaTransformerService', () => {
  const cqlParserService = new CQLParser();
  const cqlJSONSchemaTransformer = new CQLJSONSchemaTransformer({
    cqlParserService,
  });

  const fromCSQToJSONSpy = jest.spyOn(cqlParserService, 'fromCSQToJSON');
  const extractTypesFromWrapperSpy = jest.spyOn(cqlParserService, 'extractTypesFromWrapper');
  const findOutStringifiedTypeSpy = jest.spyOn(cqlParserService, 'findOutStringifiedType');

  const udt = {
    typeName: 'address',
    fields: [{ columnName: 'street', type: CQLBasicDataType.TEXT }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return equivalent of JSON schema due to CQL basic type', () => {
    expect(cqlJSONSchemaTransformer.fromCQLTypeToJSON({
      cqlType: CQLBasicDataType.DOUBLE,
    })).toEqual({ [JSONSchemaKey.TYPE]: JSONSchemaDataType.NUMBER });

    expect(fromCSQToJSONSpy).toHaveBeenCalledTimes(1);
    expect(fromCSQToJSONSpy).toHaveBeenCalledWith(CQLBasicDataType.DOUBLE);
  });

  it('should return equivalent of JSON schema due to CQL frozen type', () => {
    expect(cqlJSONSchemaTransformer.fromCQLTypeToJSON({
      cqlType: `${CQLKeywordType.FROZEN}<${CQLBasicDataType.INT}>`,
    })).toEqual({ [JSONSchemaKey.TYPE]: JSONSchemaDataType.NUMBER });

    expect(fromCSQToJSONSpy).toHaveBeenCalledTimes(1);
    expect(extractTypesFromWrapperSpy).toHaveBeenCalledTimes(1);
    expect(fromCSQToJSONSpy).toHaveBeenCalledWith(CQLBasicDataType.INT);
  });

  it('should return equivalent of JSON schema due to CQL list type', () => {
    expect(cqlJSONSchemaTransformer.fromCQLTypeToJSON({
      cqlType: `${CQLCollectionDataType.LIST}<${CQLBasicDataType.INT}>`,
    })).toEqual({
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
      [JSONSchemaKey.ITEMS]: {
        [JSONSchemaKey.TYPE]: JSONSchemaDataType.NUMBER,
      },
    });

    expect(fromCSQToJSONSpy).toHaveBeenCalledTimes(1);
    expect(extractTypesFromWrapperSpy).toHaveBeenCalledTimes(1);
    expect(fromCSQToJSONSpy).toHaveBeenCalledWith(CQLBasicDataType.INT);
  });

  it('should return equivalent of JSON schema due to CQL set type', () => {
    expect(cqlJSONSchemaTransformer.fromCQLTypeToJSON({
      cqlType: `${CQLCollectionDataType.SET}<${CQLBasicDataType.INT}>`,
    })).toEqual(expect.objectContaining({
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
      [JSONSchemaKey.ITEMS]: {
        [JSONSchemaKey.TYPE]: JSONSchemaDataType.NUMBER,
      },
      [JSONSchemaKey.UNIQUE_ITEMS]: true,
    }));

    expect(fromCSQToJSONSpy).toHaveBeenCalledTimes(1);
    expect(extractTypesFromWrapperSpy).toHaveBeenCalledTimes(1);
    expect(fromCSQToJSONSpy).toHaveBeenCalledWith(CQLBasicDataType.INT);
  });

  it('should return equivalent of JSON schema due to CQL map type', () => {
    expect(cqlJSONSchemaTransformer.fromCQLTypeToJSON({
      cqlType: `${CQLCollectionDataType.MAP}<${CQLBasicDataType.TEXT}, ${CQLBasicDataType.INT}>`,
    })).toEqual(expect.objectContaining({
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.OBJECT,
      [JSONSchemaKey.ADDITIONAL_PROPERTIES]: {
        [JSONSchemaKey.TYPE]: JSONSchemaDataType.NUMBER,
      },
    }));

    expect(fromCSQToJSONSpy).toHaveBeenCalledTimes(1);
    expect(extractTypesFromWrapperSpy).toHaveBeenCalledTimes(1);
    expect(fromCSQToJSONSpy).toHaveBeenCalledWith(CQLBasicDataType.INT);
  });

  it('should return equivalent of JSON schema due to CQL tuple type', () => {
    expect(cqlJSONSchemaTransformer.fromCQLTypeToJSON({
      cqlType: `${CQLDataType.TUPLE}<${CQLBasicDataType.TEXT}, ${CQLBasicDataType.INT}>`,
    })).toEqual(expect.objectContaining({
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
      [JSONSchemaKey.ITEMS]: [
        { [JSONSchemaKey.TYPE]: JSONSchemaDataType.STRING },
        { [JSONSchemaKey.TYPE]: JSONSchemaDataType.NUMBER },
      ],
    }));

    expect(fromCSQToJSONSpy).toHaveBeenCalledTimes(2);
    expect(extractTypesFromWrapperSpy).toHaveBeenCalledTimes(1);
    expect(fromCSQToJSONSpy).toHaveBeenNthCalledWith(1, CQLBasicDataType.TEXT);
    expect(fromCSQToJSONSpy).toHaveBeenNthCalledWith(2, CQLBasicDataType.INT);
  });

  it('should return equivalent of JSON schema due to CQL udt type', () => {
    expect(cqlJSONSchemaTransformer.fromCQLTypeToJSON({
      cqlType: udt.typeName,
      udts: [udt],
    })).toEqual({
      [JSONSchemaKey.REF]: getFullUrl(
        JSONSchemaKey.ROOT,
        JSONSchemaKey.DEFINITIONS,
        udt.typeName as string,
      ),
    });

    expect(fromCSQToJSONSpy).toHaveBeenCalledTimes(1);
    expect(fromCSQToJSONSpy).toHaveBeenCalledWith(udt.typeName);
  });

  it('should return equivalent of JSON schema due to CQL list udt type', () => {
    expect(cqlJSONSchemaTransformer.fromCQLTypeToJSON({
      cqlType: `${CQLCollectionDataType.LIST}<${udt.typeName}>`,
      udts: [udt],
    })).toEqual({
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
      [JSONSchemaKey.ITEMS]: {
        [JSONSchemaKey.REF]: getFullUrl(
          JSONSchemaKey.ROOT,
          JSONSchemaKey.DEFINITIONS,
          udt.typeName as string,
        ),
      },
    });

    expect(fromCSQToJSONSpy).toHaveBeenCalledTimes(1);
    expect(extractTypesFromWrapperSpy).toHaveBeenCalledTimes(1);
    expect(fromCSQToJSONSpy).toHaveBeenCalledWith(udt.typeName);
  });

  it('should return equivalent of JSON schema due to CQL set udt type', () => {
    expect(cqlJSONSchemaTransformer.fromCQLTypeToJSON({
      cqlType: `${CQLCollectionDataType.SET}<${udt.typeName}>`,
      udts: [udt],
    })).toEqual(expect.objectContaining({
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
      [JSONSchemaKey.ITEMS]: {
        [JSONSchemaKey.REF]: getFullUrl(
          JSONSchemaKey.ROOT,
          JSONSchemaKey.DEFINITIONS,
          udt.typeName as string,
        ),
      },
      [JSONSchemaKey.UNIQUE_ITEMS]: true,
    }));

    expect(fromCSQToJSONSpy).toHaveBeenCalledTimes(1);
    expect(extractTypesFromWrapperSpy).toHaveBeenCalledTimes(1);
    expect(fromCSQToJSONSpy).toHaveBeenCalledWith(udt.typeName);
  });

  it('should return equivalent of JSON schema due to CQL map udt type', () => {
    expect(cqlJSONSchemaTransformer.fromCQLTypeToJSON({
      cqlType: `${CQLCollectionDataType.MAP}<${CQLBasicDataType.TEXT}, ${udt.typeName}>`,
      udts: [udt],
    })).toEqual(expect.objectContaining({
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.OBJECT,
      [JSONSchemaKey.ADDITIONAL_PROPERTIES]: {
        [JSONSchemaKey.REF]: getFullUrl(
          JSONSchemaKey.ROOT,
          JSONSchemaKey.DEFINITIONS,
          udt.typeName as string,
        ),
      },
    }));

    expect(fromCSQToJSONSpy).toHaveBeenCalledTimes(1);
    expect(extractTypesFromWrapperSpy).toHaveBeenCalledTimes(1);
    expect(fromCSQToJSONSpy).toHaveBeenCalledWith(udt.typeName);
  });

  it('should return equivalent of JSON schema due to CQL tuple udt type', () => {
    expect(cqlJSONSchemaTransformer.fromCQLTypeToJSON({
      cqlType: `${CQLDataType.TUPLE}<${CQLBasicDataType.TEXT}, ${udt.typeName}>`,
      udts: [udt],
    })).toEqual(expect.objectContaining({
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
      [JSONSchemaKey.ITEMS]: [
        { [JSONSchemaKey.TYPE]: JSONSchemaDataType.STRING },
        {
          [JSONSchemaKey.REF]: getFullUrl(
            JSONSchemaKey.ROOT,
            JSONSchemaKey.DEFINITIONS,
            udt.typeName as string,
          ),
        },
      ],
    }));

    expect(fromCSQToJSONSpy).toHaveBeenCalledTimes(2);
    expect(extractTypesFromWrapperSpy).toHaveBeenCalledTimes(1);
    expect(fromCSQToJSONSpy).toHaveBeenNthCalledWith(1, CQLBasicDataType.TEXT);
    expect(fromCSQToJSONSpy).toHaveBeenNthCalledWith(2, udt.typeName);
  });

  it('should return equivalent of stringify JSON schema due to CQL type', () => {
    const stringifyValue = '{"firstName": "Vova", "age": 21, "phones" : ["+380935610264"]}';
    const objValue = JSON.parse(stringifyValue);

    expect(cqlJSONSchemaTransformer.getStringifyJSONSchema(
      objValue,
    )).toEqual(expect.objectContaining({
      [JSONSchemaKey.PROPERTIES]: {
        age: {
          [JSONSchemaKey.TYPE]: JSONSchemaDataType.NUMBER,
        },
        firstName: {
          [JSONSchemaKey.TYPE]: JSONSchemaDataType.STRING,
        },
        phones: {
          [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
          [JSONSchemaKey.ITEMS]: {
            [JSONSchemaKey.TYPE]: JSONSchemaDataType.STRING,
          },
        },
      },
    }));

    expect(findOutStringifiedTypeSpy).toHaveBeenCalledTimes(4);
    expect(findOutStringifiedTypeSpy).toHaveBeenNthCalledWith(1, Object.values(objValue)[0]);
    expect(findOutStringifiedTypeSpy).toHaveBeenNthCalledWith(2, Object.values(objValue)[1]);
    expect(findOutStringifiedTypeSpy).toHaveBeenNthCalledWith(3, Object.values(objValue)[2]);
    expect(findOutStringifiedTypeSpy).toHaveBeenNthCalledWith(4, JSONSchemaDataType.STRING);
  });

  it('should return generated JSON schema due to udts, exampleRow with stringify', () => {
    const tableName = 'users';
    const keyspaceName = 'my_keyspace';
    const usedUdts = [{
      typeName: 'address',
      fields: [
        {
          type: CQLBasicDataType.TEXT,
          columnName: 'street',
        },
        {
          type: CQLBasicDataType.TEXT,
          columnName: 'city',
        },
        {
          type: CQLBasicDataType.TEXT,
          columnName: 'state',
        },
        {
          type: CQLBasicDataType.INT,
          columnName: 'zip',
        },
        {
          type: `${CQLCollectionDataType.SET}<${CQLBasicDataType.TEXT}>`,
          columnName: 'phones',
        },
      ],
    }];
    const columns = [
      {
        tableName,
        keyspaceName,
        columnName: 'address',
        type: `${CQLKeywordType.FROZEN}<${usedUdts[0].typeName}>`,
      },
      {
        tableName,
        keyspaceName,
        columnName: 'email',
        type: CQLBasicDataType.TEXT,
      },
      {
        tableName,
        keyspaceName,
        columnName: 'name',
        type: CQLBasicDataType.TEXT,
      },
    ] as ICassandraColumn[];
    const exampleRow = {
      name: '{"firstName": "Vova"}',
      address: {
        street: 'A 210',
        city: 'delhi',
        state: 'DL',
        zip: 201307,
        phones: [
          '0000000000',
        ],
      },
      email: 'vova@gmail.com',
    };
    expect(cqlJSONSchemaTransformer.generateJSONSchema({
      columns,
      usedUdts,
      exampleRow,
      title: tableName,
    })).toEqual(expect.objectContaining({
      [JSONSchemaKey.SCHEMA]: JSON_SCHEMA_USED_DIALECT,
      [JSONSchemaKey.TITLE]: tableName,
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.OBJECT,
      [JSONSchemaKey.PROPERTIES]: {
        [columns[0].columnName]: {
          [JSONSchemaKey.REF]: getFullUrl(
            JSONSchemaKey.ROOT,
            JSONSchemaKey.DEFINITIONS,
            usedUdts[0].typeName as string,
          ),
        },
        [columns[1].columnName]: {
          [JSONSchemaKey.TYPE]: JSONSchemaDataType.STRING,
        },
        [columns[2].columnName]: {
          [JSONSchemaKey.TYPE]: JSONSchemaDataType.OBJECT,
          [JSONSchemaKey.PROPERTIES]: {
            [Object.keys(JSON.parse(exampleRow.name))[0]]: {
              [JSONSchemaKey.TYPE]: JSONSchemaDataType.STRING,
            },
          },
        },
      },
      [JSONSchemaKey.DEFINITIONS]: {
        [usedUdts[0].typeName]: {
          [JSONSchemaKey.TYPE]: JSONSchemaDataType.OBJECT,
          [JSONSchemaKey.PROPERTIES]: {
            [usedUdts[0].fields[0].columnName]: {
              [JSONSchemaKey.TYPE]: JSONSchemaDataType.STRING,
            },
            [usedUdts[0].fields[1].columnName]: {
              [JSONSchemaKey.TYPE]: JSONSchemaDataType.STRING,
            },
            [usedUdts[0].fields[2].columnName]: {
              [JSONSchemaKey.TYPE]: JSONSchemaDataType.STRING,
            },
            [usedUdts[0].fields[3].columnName]: {
              [JSONSchemaKey.TYPE]: JSONSchemaDataType.NUMBER,
            },
            [usedUdts[0].fields[4].columnName]: {
              [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
              [JSONSchemaKey.ITEMS]: {
                [JSONSchemaKey.TYPE]: JSONSchemaDataType.STRING,
              },
              [JSONSchemaKey.UNIQUE_ITEMS]: true,
              [JSONSchemaKey.MIN_ITEMS]: MIN_ARRAY_ITEMS,
            },
          },
        },
      },
    }));
  });
});