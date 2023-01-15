import {
  CQLDataType,
  JSONSchemaKey,
  CQLKeywordType,
  CQLBasicDataType,
  JSONSchemaDataType,
  CQLCollectionDataType,
} from '~/common/enums/enums.js';
import {
  ICassandraColumn,
  ICassandraUserDefinedType,
} from '~/common/model-types/model-types.js';
import { getFullUrl } from '~/helpers/helpers.js';
import {
  CQLParser as CQLParserService,
} from '~/services/cql-parser/cql-parser.service.js';
import {
  JSON_SCHEMA_USED_DIALECT,
  MIN_ARRAY_ITEMS,
} from './common/constants.js';

interface ICQLJSONSchemaTransformerConstructor {
  cqlParserService: CQLParserService;
}

class CQLJSONSchemaTransformer {
  #cqlParserService: CQLParserService;

  constructor({ cqlParserService }: ICQLJSONSchemaTransformerConstructor) {
    this.#cqlParserService = cqlParserService;
  }

  generateJSONSchema = (params: {
    title?: string,
    columns: ICassandraColumn[],
    usedUdts?: ICassandraUserDefinedType[]
  }): Record<string, unknown> => {
    const definitions = params.usedUdts ? this.getJSONSchemaDefinitions(
      params.usedUdts,
    ) : null;

    const properties = params.columns.reduce((acc, { columnName, type }) => {
      return {
        ...acc,
        [columnName]: this.fromCQLTypeToJSON(
          type,
          params.usedUdts as ICassandraUserDefinedType[],
        ),
      };
    }, {});

    return {
      ...(params.title ? {
        [JSONSchemaKey.SCHEMA]: JSON_SCHEMA_USED_DIALECT,
        [JSONSchemaKey.TITLE]: params.title,
      } : {}),
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.OBJECT,
      properties,
      ...(params.usedUdts ? { [JSONSchemaKey.DEFINITIONS]: definitions } : {}),
    };
  };

  getJSONSchemaDefinitions(udts: ICassandraUserDefinedType[]): Record<string, unknown> {
    return udts?.reduce((acc, current) => ({
      ...acc,
      [current.typeName]: this.generateJSONSchema({
        columns: current.fields as ICassandraColumn[],
      }),
    }), {});
  }

  getListJSONSchema(cqlWrappedType: string): Record<string, unknown> {
    const cqlType = this.#cqlParserService.extractTypesFromWrapper(cqlWrappedType)[0];

    return {
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
      [JSONSchemaKey.ITEMS]: this.fromCQLTypeToJSON(cqlType),
    };
  }

  getSetJSONSchema = (cqlWrappedType: string): Record<string, unknown> => ({
    ...this.getListJSONSchema(cqlWrappedType),
    [JSONSchemaKey.UNIQUE_ITEMS]: true,
    [JSONSchemaKey.MIN_ITEMS]: MIN_ARRAY_ITEMS,
  });

  getMapJSONSchema = (cqlWrappedType: string): Record<string, unknown> => ({
    [JSONSchemaKey.TYPE]: JSONSchemaDataType.OBJECT,
    [JSONSchemaKey.PROPERTIES]: this.#cqlParserService.extractTypesFromWrapper(cqlWrappedType)[1],
  });

  getTupleJSONSchema = (cqlWrappedType: string): Record<string, unknown> => {
    const cqlTypes = this.#cqlParserService.extractTypesFromWrapper(cqlWrappedType);

    return {
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
      [JSONSchemaKey.ITEMS]: cqlTypes.map((type) => this.fromCQLTypeToJSON(type)),
    };
  };

  getFrozenJSONSchema = (cqlWrappedType: string): string => {
    return this.#cqlParserService.extractTypesFromWrapper(cqlWrappedType)[0];
  };

  getUDTJSONSchema = (
    cqlType: string,
    udts: ICassandraUserDefinedType[],
  ): Record<string, string> => {
    const existingUdt = udts.find(({ typeName }) => typeName === cqlType);

    return {
      [JSONSchemaKey.REF]: getFullUrl(
        JSONSchemaKey.ROOT,
        JSONSchemaKey.DEFINITIONS,
        existingUdt?.typeName as string,
      ),
    };
  };

  fromCQLTypeToJSON = (
    cqlType: string,
    udts?: ICassandraUserDefinedType[],
  ): Record<string, unknown> | undefined => {
    let resultType = cqlType;

    if (this.#cqlParserService.checkWrappedType(cqlType, CQLKeywordType.FROZEN)) {
      resultType = this.getFrozenJSONSchema(cqlType);
    }

    if (this.#cqlParserService.checkWrappedType(resultType, CQLCollectionDataType.LIST)) {
      return this.getListJSONSchema(resultType);
    }

    if (this.#cqlParserService.checkWrappedType(resultType, CQLCollectionDataType.SET)) {
      return this.getSetJSONSchema(resultType);
    }

    if (this.#cqlParserService.checkWrappedType(resultType, CQLCollectionDataType.MAP)) {
      return this.getMapJSONSchema(resultType);
    }

    if (this.#cqlParserService.checkWrappedType(resultType, CQLDataType.TUPLE)) {
      return this.getTupleJSONSchema(resultType);
    }

    const jsonBaseType = this.#cqlParserService.fromCSQToJSON(
      resultType as CQLBasicDataType,
    );

    if (jsonBaseType) {
      return { type: jsonBaseType };
    }

    if (udts) {
      return this.getUDTJSONSchema(resultType, udts);
    }
  };
}

export { CQLJSONSchemaTransformer };