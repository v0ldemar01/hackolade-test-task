import Joi from 'joi';
import {
  CassandraConnectionKey,
  CassandraConnectionValidationRule,
  CassandraConnectionValidationMessage,
} from '~/common/enums/enums.js';

const cassandraConnection = Joi.object({
  [CassandraConnectionKey.HOST]: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': CassandraConnectionValidationMessage.HOST_REQUIRE,
      'string.empty': CassandraConnectionValidationMessage.HOST_REQUIRE,
    }),
  [CassandraConnectionKey.PORT]: Joi.number()
    .integer()
    .min(CassandraConnectionValidationRule.PORT_MIN)
    .max(CassandraConnectionValidationRule.PORT_MAX)
    .required()
    .messages({
      'any.required': CassandraConnectionValidationMessage.PORT_REQUIRE,
      'number.min': CassandraConnectionValidationMessage.PORT_MIN,
      'number.max': CassandraConnectionValidationMessage.PORT_MAX,
    }),
  [CassandraConnectionKey.USERNAME]: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': CassandraConnectionValidationMessage.USERNAME_REQUIRE,
      'string.empty': CassandraConnectionValidationMessage.USERNAME_REQUIRE,
    }),
  [CassandraConnectionKey.PASSWORD]: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': CassandraConnectionValidationMessage.PASSWORD_REQUIRE,
      'string.empty': CassandraConnectionValidationMessage.PASSWORD_REQUIRE,
    }),
  [CassandraConnectionKey.LOCAL_DATA_CENTER]: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': CassandraConnectionValidationMessage.LOCAL_DATA_CENTER_REQUIRE,
      'string.empty': CassandraConnectionValidationMessage.LOCAL_DATA_CENTER_REQUIRE,
    }),
  [CassandraConnectionKey.AUTH_PROVIDER]: Joi.string()
    .required()
    .valid(...Object.values(CassandraConnectionValidationRule.AUTH_PROVIDER))
    .messages({
      'string.base': CassandraConnectionValidationMessage.AUTH_PROVIDER_REQUIRE,
      'any.required': CassandraConnectionValidationMessage.AUTH_PROVIDER_REQUIRE,
      'any.only': CassandraConnectionValidationMessage.AUTH_PROVIDER_VALID,
    }),
});

export { cassandraConnection };
