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
const uuid_1 = require("uuid");
const TCLIService_types_1 = require("../thrift/TCLIService_types");
const Status_1 = __importDefault(require("./dto/Status"));
const IDBSQLLogger_1 = require("./contracts/IDBSQLLogger");
const OperationStateError_1 = __importStar(require("./errors/OperationStateError"));
const RowSetProvider_1 = __importDefault(require("./result/RowSetProvider"));
const JsonResultHandler_1 = __importDefault(require("./result/JsonResultHandler"));
const ArrowResultHandler_1 = __importDefault(require("./result/ArrowResultHandler"));
const CloudFetchResultHandler_1 = __importDefault(require("./result/CloudFetchResultHandler"));
const ArrowResultConverter_1 = __importDefault(require("./result/ArrowResultConverter"));
const ResultSlicer_1 = __importDefault(require("./result/ResultSlicer"));
const utils_1 = require("./utils");
const HiveDriverError_1 = __importDefault(require("./errors/HiveDriverError"));
const defaultMaxRows = 100000;
function delay(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    });
}
class DBSQLOperation {
    constructor({ handle, directResults, context }) {
        this.closed = false;
        this.cancelled = false;
        this.state = TCLIService_types_1.TOperationState.INITIALIZED_STATE;
        this.operationHandle = handle;
        this.context = context;
        const useOnlyPrefetchedResults = Boolean(directResults === null || directResults === void 0 ? void 0 : directResults.closeOperation);
        if (directResults === null || directResults === void 0 ? void 0 : directResults.operationStatus) {
            this.processOperationStatusResponse(directResults.operationStatus);
        }
        this.metadata = directResults === null || directResults === void 0 ? void 0 : directResults.resultSetMetadata;
        this._data = new RowSetProvider_1.default(this.context, this.operationHandle, [directResults === null || directResults === void 0 ? void 0 : directResults.resultSet], useOnlyPrefetchedResults);
        this.closeOperation = directResults === null || directResults === void 0 ? void 0 : directResults.closeOperation;
        this.context.getLogger().log(IDBSQLLogger_1.LogLevel.debug, `Operation created with id: ${this.getId()}`);
    }
    getId() {
        var _a, _b;
        return (0, uuid_1.stringify)(((_b = (_a = this.operationHandle) === null || _a === void 0 ? void 0 : _a.operationId) === null || _b === void 0 ? void 0 : _b.guid) || (0, uuid_1.parse)(uuid_1.NIL));
    }
    /**
     * Fetches all data
     * @public
     * @param options - maxRows property can be set to limit chunk size
     * @returns Array of data with length equal to option.maxRows
     * @throws {StatusError}
     * @example
     * const result = await queryOperation.fetchAll();
     */
    fetchAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = [];
            const fetchChunkOptions = Object.assign(Object.assign({}, options), { 
                // Tell slicer to return raw chunks. We're going to process all of them anyway,
                // so no need to additionally buffer and slice chunks returned by server
                disableBuffering: true });
            do {
                // eslint-disable-next-line no-await-in-loop
                const chunk = yield this.fetchChunk(fetchChunkOptions);
                data.push(chunk);
            } while (yield this.hasMoreRows()); // eslint-disable-line no-await-in-loop
            this.context.getLogger().log(IDBSQLLogger_1.LogLevel.debug, `Fetched all data from operation with id: ${this.getId()}`);
            return data.flat();
        });
    }
    /**
     * Fetches chunk of data
     * @public
     * @param options - maxRows property sets chunk size
     * @returns Array of data with length equal to option.maxRows
     * @throws {StatusError}
     * @example
     * const result = await queryOperation.fetchChunk({maxRows: 1000});
     */
    fetchChunk(options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            if (!this.operationHandle.hasResultSet) {
                return [];
            }
            yield this.waitUntilReady(options);
            const resultHandler = yield this.getResultHandler();
            yield this.failIfClosed();
            // All the library code is Promise-based, however, since Promises are microtasks,
            // enqueueing a lot of promises may block macrotasks execution for a while.
            // Usually, there are no much microtasks scheduled, however, when fetching query
            // results (especially CloudFetch ones) it's quite easy to block event loop for
            // long enough to break a lot of things. For example, with CloudFetch, after first
            // set of files are downloaded and being processed immediately one by one, event
            // loop easily gets blocked for enough time to break connection pool. `http.Agent`
            // stops receiving socket events, and marks all sockets invalid on the next attempt
            // to use them. See these similar issues that helped to debug this particular case -
            // https://github.com/nodejs/node/issues/47130 and https://github.com/node-fetch/node-fetch/issues/1735
            // This simple fix allows to clean up a microtasks queue and allow Node to process
            // macrotasks as well, allowing the normal operation of other code. Also, this
            // fix is added to `fetchChunk` method because, unlike other methods, `fetchChunk` is
            // a potential source of issues described above
            yield new Promise((resolve) => {
                setTimeout(resolve, 0);
            });
            const result = resultHandler.fetchNext({
                limit: (options === null || options === void 0 ? void 0 : options.maxRows) || defaultMaxRows,
                disableBuffering: options === null || options === void 0 ? void 0 : options.disableBuffering,
            });
            yield this.failIfClosed();
            this.context
                .getLogger()
                .log(IDBSQLLogger_1.LogLevel.debug, `Fetched chunk of size: ${(options === null || options === void 0 ? void 0 : options.maxRows) || defaultMaxRows} from operation with id: ${this.getId()}`);
            return result;
        });
    }
    /**
     * Requests operation status
     * @param progress
     * @throws {StatusError}
     */
    status(progress = false) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            this.context.getLogger().log(IDBSQLLogger_1.LogLevel.debug, `Fetching status for operation with id: ${this.getId()}`);
            if (this.operationStatus) {
                return this.operationStatus;
            }
            const driver = yield this.context.getDriver();
            const response = yield driver.getOperationStatus({
                operationHandle: this.operationHandle,
                getProgressUpdate: progress,
            });
            return this.processOperationStatusResponse(response);
        });
    }
    /**
     * Cancels operation
     * @throws {StatusError}
     */
    cancel() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.closed || this.cancelled) {
                return Status_1.default.success();
            }
            this.context.getLogger().log(IDBSQLLogger_1.LogLevel.debug, `Cancelling operation with id: ${this.getId()}`);
            const driver = yield this.context.getDriver();
            const response = yield driver.cancelOperation({
                operationHandle: this.operationHandle,
            });
            Status_1.default.assert(response.status);
            this.cancelled = true;
            const result = new Status_1.default(response.status);
            // Cancelled operation becomes unusable, similarly to being closed
            (_a = this.onClose) === null || _a === void 0 ? void 0 : _a.call(this);
            return result;
        });
    }
    /**
     * Closes operation
     * @throws {StatusError}
     */
    close() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.closed || this.cancelled) {
                return Status_1.default.success();
            }
            this.context.getLogger().log(IDBSQLLogger_1.LogLevel.debug, `Closing operation with id: ${this.getId()}`);
            const driver = yield this.context.getDriver();
            const response = (_a = this.closeOperation) !== null && _a !== void 0 ? _a : (yield driver.closeOperation({
                operationHandle: this.operationHandle,
            }));
            Status_1.default.assert(response.status);
            this.closed = true;
            const result = new Status_1.default(response.status);
            (_b = this.onClose) === null || _b === void 0 ? void 0 : _b.call(this);
            return result;
        });
    }
    finished(options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            yield this.waitUntilReady(options);
        });
    }
    hasMoreRows() {
        return __awaiter(this, void 0, void 0, function* () {
            // If operation is closed or cancelled - we should not try to get data from it
            if (this.closed || this.cancelled) {
                return false;
            }
            // If we fetched all the data from server - check if there's anything buffered in result handler
            const resultHandler = yield this.getResultHandler();
            return resultHandler.hasMore();
        });
    }
    getSchema(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            if (!this.operationHandle.hasResultSet) {
                return null;
            }
            yield this.waitUntilReady(options);
            this.context.getLogger().log(IDBSQLLogger_1.LogLevel.debug, `Fetching schema for operation with id: ${this.getId()}`);
            const metadata = yield this.fetchMetadata();
            return (_a = metadata.schema) !== null && _a !== void 0 ? _a : null;
        });
    }
    getMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failIfClosed();
            yield this.waitUntilReady();
            return this.fetchMetadata();
        });
    }
    failIfClosed() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.closed) {
                throw new OperationStateError_1.default(OperationStateError_1.OperationStateErrorCode.Closed);
            }
            if (this.cancelled) {
                throw new OperationStateError_1.default(OperationStateError_1.OperationStateErrorCode.Canceled);
            }
        });
    }
    waitUntilReady(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state === TCLIService_types_1.TOperationState.FINISHED_STATE) {
                return;
            }
            let isReady = false;
            while (!isReady) {
                // eslint-disable-next-line no-await-in-loop
                const response = yield this.status(Boolean(options === null || options === void 0 ? void 0 : options.progress));
                if (options === null || options === void 0 ? void 0 : options.callback) {
                    // eslint-disable-next-line no-await-in-loop
                    yield Promise.resolve(options.callback(response));
                }
                switch (response.operationState) {
                    // For these states do nothing and continue waiting
                    case TCLIService_types_1.TOperationState.INITIALIZED_STATE:
                    case TCLIService_types_1.TOperationState.PENDING_STATE:
                    case TCLIService_types_1.TOperationState.RUNNING_STATE:
                        break;
                    // Operation is completed, so exit the loop
                    case TCLIService_types_1.TOperationState.FINISHED_STATE:
                        isReady = true;
                        break;
                    // Operation was cancelled, so set a flag and exit the loop (throw an error)
                    case TCLIService_types_1.TOperationState.CANCELED_STATE:
                        this.cancelled = true;
                        throw new OperationStateError_1.default(OperationStateError_1.OperationStateErrorCode.Canceled, response);
                    // Operation was closed, so set a flag and exit the loop (throw an error)
                    case TCLIService_types_1.TOperationState.CLOSED_STATE:
                        this.closed = true;
                        throw new OperationStateError_1.default(OperationStateError_1.OperationStateErrorCode.Closed, response);
                    // Error states - throw and exit the loop
                    case TCLIService_types_1.TOperationState.ERROR_STATE:
                        throw new OperationStateError_1.default(OperationStateError_1.OperationStateErrorCode.Error, response);
                    case TCLIService_types_1.TOperationState.TIMEDOUT_STATE:
                        throw new OperationStateError_1.default(OperationStateError_1.OperationStateErrorCode.Timeout, response);
                    case TCLIService_types_1.TOperationState.UKNOWN_STATE:
                    default:
                        throw new OperationStateError_1.default(OperationStateError_1.OperationStateErrorCode.Unknown, response);
                }
                // If not ready yet - make some delay before the next status requests
                if (!isReady) {
                    // eslint-disable-next-line no-await-in-loop
                    yield delay(100);
                }
            }
        });
    }
    fetchMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.metadata) {
                const driver = yield this.context.getDriver();
                const metadata = yield driver.getResultSetMetadata({
                    operationHandle: this.operationHandle,
                });
                Status_1.default.assert(metadata.status);
                this.metadata = metadata;
            }
            return this.metadata;
        });
    }
    getResultHandler() {
        return __awaiter(this, void 0, void 0, function* () {
            const metadata = yield this.fetchMetadata();
            const resultFormat = (0, utils_1.definedOrError)(metadata.resultFormat);
            if (!this.resultHandler) {
                let resultSource;
                switch (resultFormat) {
                    case TCLIService_types_1.TSparkRowSetType.COLUMN_BASED_SET:
                        resultSource = new JsonResultHandler_1.default(this.context, this._data, metadata);
                        break;
                    case TCLIService_types_1.TSparkRowSetType.ARROW_BASED_SET:
                        resultSource = new ArrowResultConverter_1.default(this.context, new ArrowResultHandler_1.default(this.context, this._data, metadata), metadata);
                        break;
                    case TCLIService_types_1.TSparkRowSetType.URL_BASED_SET:
                        resultSource = new ArrowResultConverter_1.default(this.context, new CloudFetchResultHandler_1.default(this.context, this._data, metadata), metadata);
                        break;
                    // no default
                }
                if (resultSource) {
                    this.resultHandler = new ResultSlicer_1.default(this.context, resultSource);
                }
            }
            if (!this.resultHandler) {
                throw new HiveDriverError_1.default(`Unsupported result format: ${TCLIService_types_1.TSparkRowSetType[resultFormat]}`);
            }
            return this.resultHandler;
        });
    }
    processOperationStatusResponse(response) {
        var _a;
        Status_1.default.assert(response.status);
        this.state = (_a = response.operationState) !== null && _a !== void 0 ? _a : this.state;
        if (typeof response.hasResultSet === 'boolean') {
            this.operationHandle.hasResultSet = response.hasResultSet;
        }
        const isInProgress = [
            TCLIService_types_1.TOperationState.INITIALIZED_STATE,
            TCLIService_types_1.TOperationState.PENDING_STATE,
            TCLIService_types_1.TOperationState.RUNNING_STATE,
        ].includes(this.state);
        if (!isInProgress) {
            this.operationStatus = response;
        }
        return response;
    }
}
exports.default = DBSQLOperation;
//# sourceMappingURL=DBSQLOperation.js.map