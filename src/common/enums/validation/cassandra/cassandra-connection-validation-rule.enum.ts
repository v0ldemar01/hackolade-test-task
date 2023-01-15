const CassandraConnectionValidationRule = {
  AUTH_PROVIDER: [
    'PlainText',
    'DsePlainText',
    'DseGssapi',
  ],
  PORT_MIN: 0,
  PORT_MAX: 65535,
};

export { CassandraConnectionValidationRule };
