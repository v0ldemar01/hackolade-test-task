import { ExceptionName } from '~/common/enums/enums.js';

const DEFAULT_ERROR_MESSAGE = 'Failed connection to the database';

interface IDbConnectionError {
  message?: string;
}

class DbConnectionError extends Error {
  constructor({ message = DEFAULT_ERROR_MESSAGE }: IDbConnectionError = {}) {
    super(message);

    this.message = message;
    this.name = ExceptionName.DB_CONNECTION_ERROR;
  }
}

export { DbConnectionError };
