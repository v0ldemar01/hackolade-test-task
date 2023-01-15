import {
  Logform,
  transport,
  createLogger,
  Logger as WinstonLogger,
  format as winstonFormat,
  transports as winstonTransports,
} from 'winston';
import { LOGGER_TIMESTAMP_FORMAT } from './common/constants/constants.js';

class Logger {
  #instance: WinstonLogger;

  constructor() {
    const format = this.#getFormat();
    const transports = this.#getTransports({
      format,
    });

    this.#instance = createLogger({
      format,
      transports,
      exitOnError: false,
    });
  }

  #getFormat = (): Logform.Format => winstonFormat.combine(
    winstonFormat.colorize(),
    winstonFormat.errors({ stack: true }),
    winstonFormat.timestamp({ format: LOGGER_TIMESTAMP_FORMAT }),
    winstonFormat.printf(
      (info) => `[${info.timestamp}] ${info.level}: ${info.name ?? ''} - ${info.stack?.replace('TypeError:', '') ?? info.message}`,
    ),
    // winstonFormat.prettyPrint(),
  );

  #getTransports = ({ format }: {
    format: Logform.Format;
  }): transport[] => [
    new winstonTransports.Console({
      format,
      handleExceptions: true,
      handleRejections: true,
    }),
  ];

  error(message: string | Error): void {
    this.#instance.error(message);
  }

  info(message: string | Error): void {
    this.#instance.info(message);
  }

  debug(message: string | Error): void {
    this.#instance.debug(message);
  }
}

export { Logger };