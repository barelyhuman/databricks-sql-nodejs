import './polyfills';
import { Thrift } from 'thrift';
import TCLIService from '../thrift/TCLIService';
import TCLIService_types from '../thrift/TCLIService_types';
import DBSQLClient from './DBSQLClient';
import DBSQLSession from './DBSQLSession';
import { DBSQLParameter, DBSQLParameterType } from './DBSQLParameter';
import DBSQLLogger from './DBSQLLogger';
import PlainHttpAuthentication from './connection/auth/PlainHttpAuthentication';
import HttpConnection from './connection/connections/HttpConnection';
import { formatProgress } from './utils';
import { LogLevel } from './contracts/IDBSQLLogger';
export declare const auth: {
    PlainHttpAuthentication: typeof PlainHttpAuthentication;
};
declare const TException: typeof Thrift.TException, TApplicationException: typeof Thrift.TApplicationException, TApplicationExceptionType: typeof Thrift.TApplicationExceptionType, TProtocolException: typeof Thrift.TProtocolException, TProtocolExceptionType: typeof Thrift.TProtocolExceptionType;
export { TException, TApplicationException, TApplicationExceptionType, TProtocolException, TProtocolExceptionType };
export declare const connections: {
    HttpConnection: typeof HttpConnection;
};
export declare const thrift: {
    TCLIService: typeof TCLIService;
    TCLIService_types: typeof TCLIService_types;
};
export declare const utils: {
    formatProgress: typeof formatProgress;
};
export { DBSQLClient, DBSQLSession, DBSQLParameter, DBSQLParameterType, DBSQLLogger, LogLevel };
