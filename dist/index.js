"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.DBSQLLogger = exports.DBSQLParameterType = exports.DBSQLParameter = exports.DBSQLSession = exports.DBSQLClient = exports.utils = exports.thrift = exports.connections = exports.TProtocolExceptionType = exports.TProtocolException = exports.TApplicationExceptionType = exports.TApplicationException = exports.TException = exports.auth = void 0;
// Don't move this import - it should be placed before any other
require("./polyfills");
const thrift_1 = require("thrift");
const TCLIService_1 = __importDefault(require("../thrift/TCLIService"));
const TCLIService_types_1 = __importDefault(require("../thrift/TCLIService_types"));
const DBSQLClient_1 = __importDefault(require("./DBSQLClient"));
exports.DBSQLClient = DBSQLClient_1.default;
const DBSQLSession_1 = __importDefault(require("./DBSQLSession"));
exports.DBSQLSession = DBSQLSession_1.default;
const DBSQLParameter_1 = require("./DBSQLParameter");
Object.defineProperty(exports, "DBSQLParameter", { enumerable: true, get: function () { return DBSQLParameter_1.DBSQLParameter; } });
Object.defineProperty(exports, "DBSQLParameterType", { enumerable: true, get: function () { return DBSQLParameter_1.DBSQLParameterType; } });
const DBSQLLogger_1 = __importDefault(require("./DBSQLLogger"));
exports.DBSQLLogger = DBSQLLogger_1.default;
const PlainHttpAuthentication_1 = __importDefault(require("./connection/auth/PlainHttpAuthentication"));
const HttpConnection_1 = __importDefault(require("./connection/connections/HttpConnection"));
const utils_1 = require("./utils");
const IDBSQLLogger_1 = require("./contracts/IDBSQLLogger");
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return IDBSQLLogger_1.LogLevel; } });
exports.auth = {
    PlainHttpAuthentication: PlainHttpAuthentication_1.default,
};
const { TException, TApplicationException, TApplicationExceptionType, TProtocolException, TProtocolExceptionType } = thrift_1.Thrift;
exports.TException = TException;
exports.TApplicationException = TApplicationException;
exports.TApplicationExceptionType = TApplicationExceptionType;
exports.TProtocolException = TProtocolException;
exports.TProtocolExceptionType = TProtocolExceptionType;
exports.connections = {
    HttpConnection: HttpConnection_1.default,
};
exports.thrift = {
    TCLIService: TCLIService_1.default,
    TCLIService_types: TCLIService_types_1.default,
};
exports.utils = {
    formatProgress: utils_1.formatProgress,
};
//# sourceMappingURL=index.js.map