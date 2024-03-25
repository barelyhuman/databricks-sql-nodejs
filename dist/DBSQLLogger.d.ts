import winston, { Logger } from 'winston';
import IDBSQLLogger, { LoggerOptions, LogLevel } from './contracts/IDBSQLLogger';
export default class DBSQLLogger implements IDBSQLLogger {
    logger: Logger;
    transports: {
        console: winston.transports.ConsoleTransportInstance;
        file?: winston.transports.FileTransportInstance;
    };
    constructor({ level, filepath }?: LoggerOptions);
    log(level: LogLevel, message: string): Promise<void>;
    setLevel(level: LogLevel): void;
}
