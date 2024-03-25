import Int64 from 'node-int64';
import { TSparkParameter } from '../thrift/TCLIService_types';
export type DBSQLParameterValue = undefined | null | boolean | number | bigint | Int64 | Date | string;
export declare enum DBSQLParameterType {
    VOID = "VOID",
    STRING = "STRING",
    DATE = "DATE",
    TIMESTAMP = "TIMESTAMP",
    FLOAT = "FLOAT",
    DECIMAL = "DECIMAL",
    DOUBLE = "DOUBLE",
    INTEGER = "INTEGER",
    BIGINT = "BIGINT",
    SMALLINT = "SMALLINT",
    TINYINT = "TINYINT",
    BOOLEAN = "BOOLEAN",
    INTERVALMONTH = "INTERVAL MONTH",
    INTERVALDAY = "INTERVAL DAY"
}
interface DBSQLParameterOptions {
    type?: DBSQLParameterType;
    value: DBSQLParameterValue;
}
interface ToSparkParameterOptions {
    name?: string;
}
export declare class DBSQLParameter {
    readonly type?: string;
    readonly value: DBSQLParameterValue;
    constructor({ type, value }: DBSQLParameterOptions);
    toSparkParameter({ name }?: ToSparkParameterOptions): TSparkParameter;
}
export {};
