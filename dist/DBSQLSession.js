"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const node_fetch_1 = __importDefault(require("node-fetch"));
const Types_1 = require("./hive/Types");
const DBSQLOperation_1 = __importDefault(require("./DBSQLOperation"));
const Status_1 = __importDefault(require("./dto/Status"));
const InfoValue_1 = __importDefault(require("./dto/InfoValue"));
const utils_1 = require("./utils");
const CloseableCollection_1 = __importDefault(require("./utils/CloseableCollection"));
const IDBSQLLogger_1 = require("./contracts/IDBSQLLogger");
const HiveDriverError_1 = __importDefault(require("./errors/HiveDriverError"));
const StagingError_1 = __importDefault(require("./errors/StagingError"));
const DBSQLParameter_1 = require("./DBSQLParameter");
const ParameterError_1 = __importDefault(require("./errors/ParameterError"));
const defaultMaxRows = 100000;
function getDirectResultsOptions(maxRows = defaultMaxRows) {
    if (maxRows === null) {
        return {};
    }
    return {
        getDirectResults: {
            maxRows: new Types_1.Int64(maxRows),
        },
    };
}
function getArrowOptions(config) {
    const { arrowEnabled = true, useArrowNativeTypes = true } = config;
    if (!arrowEnabled) {
        return {
            canReadArrowResult: false,
        };
    }
    return {
        canReadArrowResult: true,
        useArrowNativeTypes: {
            timestampAsArrow: useArrowNativeTypes,
            decimalAsArrow: useArrowNativeTypes,
            complexTypesAsArrow: useArrowNativeTypes,
            // TODO: currently unsupported by `apache-arrow` (see https://github.com/streamlit/streamlit/issues/4489)
            intervalTypesAsArrow: false,
        },
    };
}
function getQueryParameters(sessionHandle, namedParameters, ordinalParameters) {
    const namedParametersProvided = namedParameters !== undefined && Object.keys(namedParameters).length > 0;
    const ordinalParametersProvided = ordinalParameters !== undefined && ordinalParameters.length > 0;
    if (namedParametersProvided && ordinalParametersProvided) {
        throw new ParameterError_1.default('Driver does not support both ordinal and named parameters.');
    }
    if (!namedParametersProvided && !ordinalParametersProvided) {
        return [];
    }
    const result = [];
    if (namedParameters !== undefined) {
        for (const name of Object.keys(namedParameters)) {
            const value = namedParameters[name];
            const param = value instanceof DBSQLParameter_1.DBSQLParameter ? value : new DBSQLParameter_1.DBSQLParameter({ value });
            result.push(param.toSparkParameter({ name }));
        }
    }
    if (ordinalParameters !== undefined) {
        for (const value of ordinalParameters) {
            const param = value instanceof DBSQLParameter_1.DBSQLParameter ? value : new DBSQLParameter_1.DBSQLParameter({ value });
            result.push(param.toSparkParameter());
        }
    }
    return result;
}
class DBSQLSession {
    constructor({ handle, context }) {
        this.isOpen = true;
        this.operations = new CloseableCollection_1.default();
        this.sessionHandle = handle;
        this.context = context;
        this.context.getLogger().log(IDBSQLLogger_1.LogLevel.debug, `Session created with id: ${this.getId()}`);
    }
    getId() {
        var _a, _b;
        return (0, uuid_1.stringify)(((_b = (_a = this.sessionHandle) === null || _a === void 0 ? void 0 : _a.sessionId) === null || _b === void 0 ? void 0 : _b.guid) || (0, uuid_1.parse)(uuid_1.NIL));
    }
    /**
     * Fetches info
     * @public
     * @param infoType - One of the values TCLIService_types.TGetInfoType
     * @returns Value corresponding to info type requested
     * @example
     * const response = await session.getInfo(thrift.TCLIService_types.TGetInfoType.CLI_DBMS_VER);
     */
    getInfo(infoType) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            const driver = yield this.context.getDriver();
            const operationPromise = driver.getInfo({
                sessionHandle: this.sessionHandle,
                infoType,
            });
            const response = yield this.handleResponse(operationPromise);
            Status_1.default.assert(response.status);
            return new InfoValue_1.default(response.infoValue);
        });
    }
    /**
     * Executes statement
     * @public
     * @param statement - SQL statement to be executed
     * @param options - maxRows field is used to specify Direct Results
     * @returns DBSQLOperation
     * @example
     * const operation = await session.executeStatement(query);
     */
    executeStatement(statement, options = {}) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            const driver = yield this.context.getDriver();
            const clientConfig = this.context.getConfig();
            const operationPromise = driver.executeStatement(Object.assign(Object.assign(Object.assign({ sessionHandle: this.sessionHandle, statement, queryTimeout: options.queryTimeout, runAsync: true }, getDirectResultsOptions(options.maxRows)), getArrowOptions(clientConfig)), { canDownloadResult: (_a = options.useCloudFetch) !== null && _a !== void 0 ? _a : clientConfig.useCloudFetch, parameters: getQueryParameters(this.sessionHandle, options.namedParameters, options.ordinalParameters), canDecompressLZ4Result: clientConfig.useLZ4Compression }));
            const response = yield this.handleResponse(operationPromise);
            const operation = this.createOperation(response);
            // If `stagingAllowedLocalPath` is provided - assume that operation possibly may be a staging operation.
            // To know for sure, fetch metadata and check a `isStagingOperation` flag. If it happens that it wasn't
            // a staging operation - not a big deal, we just fetched metadata earlier, but operation is still usable
            // and user can get data from it.
            // If `stagingAllowedLocalPath` is not provided - don't do anything to the operation. In a case of regular
            // operation, everything will work as usual. In a case of staging operation, it will be processed like any
            // other query - it will be possible to get data from it as usual, or use other operation methods.
            if (options.stagingAllowedLocalPath !== undefined) {
                const metadata = yield operation.getMetadata();
                if (metadata.isStagingOperation) {
                    const allowedLocalPath = Array.isArray(options.stagingAllowedLocalPath)
                        ? options.stagingAllowedLocalPath
                        : [options.stagingAllowedLocalPath];
                    return this.handleStagingOperation(operation, allowedLocalPath);
                }
            }
            return operation;
        });
    }
    handleStagingOperation(operation, allowedLocalPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield operation.fetchAll();
            if (rows.length !== 1) {
                throw new StagingError_1.default('Staging operation: expected only one row in result');
            }
            const row = rows[0];
            // For REMOVE operation local file is not available, so no need to validate it
            if (row.localFile !== undefined) {
                let allowOperation = false;
                for (const filepath of allowedLocalPath) {
                    const relativePath = path.relative(filepath, row.localFile);
                    if (!relativePath.startsWith('..') && !path.isAbsolute(relativePath)) {
                        allowOperation = true;
                    }
                }
                if (!allowOperation) {
                    throw new StagingError_1.default('Staging path not a subset of allowed local paths.');
                }
            }
            const { localFile, presignedUrl, headers } = row;
            switch (row.operation) {
                case 'GET':
                    yield this.handleStagingGet(localFile, presignedUrl, headers);
                    return operation;
                case 'PUT':
                    yield this.handleStagingPut(localFile, presignedUrl, headers);
                    return operation;
                case 'REMOVE':
                    yield this.handleStagingRemove(presignedUrl, headers);
                    return operation;
                default:
                    throw new StagingError_1.default(`Staging query operation is not supported: ${row.operation}`);
            }
        });
    }
    handleStagingGet(localFile, presignedUrl, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (localFile === undefined) {
                throw new StagingError_1.default('Local file path not provided');
            }
            const connectionProvider = yield this.context.getConnectionProvider();
            const agent = yield connectionProvider.getAgent();
            const response = yield (0, node_fetch_1.default)(presignedUrl, { method: 'GET', headers, agent });
            if (!response.ok) {
                throw new StagingError_1.default(`HTTP error ${response.status} ${response.statusText}`);
            }
            const buffer = yield response.arrayBuffer();
            fs.writeFileSync(localFile, Buffer.from(buffer));
        });
    }
    handleStagingRemove(presignedUrl, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            const connectionProvider = yield this.context.getConnectionProvider();
            const agent = yield connectionProvider.getAgent();
            const response = yield (0, node_fetch_1.default)(presignedUrl, { method: 'DELETE', headers, agent });
            // Looks that AWS and Azure have a different behavior of HTTP `DELETE` for non-existing files
            // AWS assumes that - since file already doesn't exist - the goal is achieved, and returns HTTP 200
            // Azure, on the other hand, is somewhat stricter and check if file exists before deleting it. And if
            // file doesn't exist - Azure returns HTTP 404
            if (!response.ok) {
                throw new StagingError_1.default(`HTTP error ${response.status} ${response.statusText}`);
            }
        });
    }
    handleStagingPut(localFile, presignedUrl, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (localFile === undefined) {
                throw new StagingError_1.default('Local file path not provided');
            }
            const connectionProvider = yield this.context.getConnectionProvider();
            const agent = yield connectionProvider.getAgent();
            const data = fs.readFileSync(localFile);
            const response = yield (0, node_fetch_1.default)(presignedUrl, { method: 'PUT', headers, agent, body: data });
            if (!response.ok) {
                throw new StagingError_1.default(`HTTP error ${response.status} ${response.statusText}`);
            }
        });
    }
    /**
     * Information about supported data types
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getTypeInfo(request = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            const driver = yield this.context.getDriver();
            const operationPromise = driver.getTypeInfo(Object.assign({ sessionHandle: this.sessionHandle, runAsync: true }, getDirectResultsOptions(request.maxRows)));
            const response = yield this.handleResponse(operationPromise);
            return this.createOperation(response);
        });
    }
    /**
     * Get list of catalogs
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getCatalogs(request = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            const driver = yield this.context.getDriver();
            const operationPromise = driver.getCatalogs(Object.assign({ sessionHandle: this.sessionHandle, runAsync: true }, getDirectResultsOptions(request.maxRows)));
            const response = yield this.handleResponse(operationPromise);
            return this.createOperation(response);
        });
    }
    /**
     * Get list of schemas
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getSchemas(request = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            const driver = yield this.context.getDriver();
            const operationPromise = driver.getSchemas(Object.assign({ sessionHandle: this.sessionHandle, catalogName: request.catalogName, schemaName: request.schemaName, runAsync: true }, getDirectResultsOptions(request.maxRows)));
            const response = yield this.handleResponse(operationPromise);
            return this.createOperation(response);
        });
    }
    /**
     * Get list of tables
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getTables(request = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            const driver = yield this.context.getDriver();
            const operationPromise = driver.getTables(Object.assign({ sessionHandle: this.sessionHandle, catalogName: request.catalogName, schemaName: request.schemaName, tableName: request.tableName, tableTypes: request.tableTypes, runAsync: true }, getDirectResultsOptions(request.maxRows)));
            const response = yield this.handleResponse(operationPromise);
            return this.createOperation(response);
        });
    }
    /**
     * Get list of supported table types
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getTableTypes(request = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            const driver = yield this.context.getDriver();
            const operationPromise = driver.getTableTypes(Object.assign({ sessionHandle: this.sessionHandle, runAsync: true }, getDirectResultsOptions(request.maxRows)));
            const response = yield this.handleResponse(operationPromise);
            return this.createOperation(response);
        });
    }
    /**
     * Get full information about columns of the table
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getColumns(request = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            const driver = yield this.context.getDriver();
            const operationPromise = driver.getColumns(Object.assign({ sessionHandle: this.sessionHandle, catalogName: request.catalogName, schemaName: request.schemaName, tableName: request.tableName, columnName: request.columnName, runAsync: true }, getDirectResultsOptions(request.maxRows)));
            const response = yield this.handleResponse(operationPromise);
            return this.createOperation(response);
        });
    }
    /**
     * Get information about function
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getFunctions(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            const driver = yield this.context.getDriver();
            const operationPromise = driver.getFunctions(Object.assign({ sessionHandle: this.sessionHandle, catalogName: request.catalogName, schemaName: request.schemaName, functionName: request.functionName, runAsync: true }, getDirectResultsOptions(request.maxRows)));
            const response = yield this.handleResponse(operationPromise);
            return this.createOperation(response);
        });
    }
    getPrimaryKeys(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            const driver = yield this.context.getDriver();
            const operationPromise = driver.getPrimaryKeys(Object.assign({ sessionHandle: this.sessionHandle, catalogName: request.catalogName, schemaName: request.schemaName, tableName: request.tableName, runAsync: true }, getDirectResultsOptions(request.maxRows)));
            const response = yield this.handleResponse(operationPromise);
            return this.createOperation(response);
        });
    }
    /**
     * Request information about foreign keys between two tables
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getCrossReference(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            const driver = yield this.context.getDriver();
            const operationPromise = driver.getCrossReference(Object.assign({ sessionHandle: this.sessionHandle, parentCatalogName: request.parentCatalogName, parentSchemaName: request.parentSchemaName, parentTableName: request.parentTableName, foreignCatalogName: request.foreignCatalogName, foreignSchemaName: request.foreignSchemaName, foreignTableName: request.foreignTableName, runAsync: true }, getDirectResultsOptions(request.maxRows)));
            const response = yield this.handleResponse(operationPromise);
            return this.createOperation(response);
        });
    }
    /**
     * Closes the session
     * @public
     * @returns Operation status
     */
    close() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isOpen) {
                return Status_1.default.success();
            }
            // Close owned operations one by one, removing successfully closed ones from the list
            yield this.operations.closeAll();
            const driver = yield this.context.getDriver();
            const response = yield driver.closeSession({
                sessionHandle: this.sessionHandle,
            });
            // check status for being successful
            Status_1.default.assert(response.status);
            // notify owner connection
            (_a = this.onClose) === null || _a === void 0 ? void 0 : _a.call(this);
            this.isOpen = false;
            this.context.getLogger().log(IDBSQLLogger_1.LogLevel.debug, `Session closed with id: ${this.getId()}`);
            return new Status_1.default(response.status);
        });
    }
    createOperation(response) {
        Status_1.default.assert(response.status);
        const handle = (0, utils_1.definedOrError)(response.operationHandle);
        const operation = new DBSQLOperation_1.default({
            handle,
            directResults: response.directResults,
            context: this.context,
        });
        this.operations.add(operation);
        return operation;
    }
    failIfClosed() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isOpen) {
                throw new HiveDriverError_1.default('The session was closed or has expired');
            }
        });
    }
    handleResponse(requestPromise) {
        return __awaiter(this, void 0, void 0, function* () {
            // Currently, after being closed sessions remains usable - server will not
            // error out when trying to run operations on closed session. So it's
            // basically useless to process any errors here
            const result = yield requestPromise;
            yield this.failIfClosed();
            return result;
        });
    }
}
exports.default = DBSQLSession;
//# sourceMappingURL=DBSQLSession.js.map