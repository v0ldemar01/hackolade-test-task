import {
  CassandraConnectionValidationRule,
} from './cassandra-connection-validation-rule.enum.js';

const CassandraConnectionValidationMessage = {
  PORT_REQUIRE: 'Port is required',
  HOST_REQUIRE: 'Host is required',
  USERNAME_REQUIRE: 'Username is required',
  PASSWORD_REQUIRE: 'Password is required',
  AUTH_PROVIDER_REQUIRE: 'Auth provider is required',
  LOCAL_DATA_CENTER_REQUIRE: 'Local data center is required',
  PORT_MAX: `Port must be at most ${CassandraConnectionValidationRule.PORT_MAX}`,
  PORT_MIN: `Port must be at least ${CassandraConnectionValidationRule.PORT_MIN}`,
  AUTH_PROVIDER_VALID: `Auth provider must be one of the following: ${CassandraConnectionValidationRule.AUTH_PROVIDER.join(', ')}`,
};

export { CassandraConnectionValidationMessage };
