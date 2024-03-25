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
const thrift_1 = __importDefault(require("thrift"));
const events_1 = require("events");
const TCLIService_1 = __importDefault(require("../thrift/TCLIService"));
const TCLIService_types_1 = require("../thrift/TCLIService_types");
const HiveDriver_1 = __importDefault(require("./hive/HiveDriver"));
const Types_1 = require("./hive/Types");
const DBSQLSession_1 = __importDefault(require("./DBSQLSession"));
const HttpConnection_1 = __importDefault(require("./connection/connections/HttpConnection"));
const Status_1 = __importDefault(require("./dto/Status"));
const HiveDriverError_1 = __importDefault(require("./errors/HiveDriverError"));
const utils_1 = require("./utils");
const PlainHttpAuthentication_1 = __importDefault(require("./connection/auth/PlainHttpAuthentication"));
const DatabricksOAuth_1 = __importStar(require("./connection/auth/DatabricksOAuth"));
const IDBSQLLogger_1 = require("./contracts/IDBSQLLogger");
const DBSQLLogger_1 = __importDefault(require("./DBSQLLogger"));
const CloseableCollection_1 = __importDefault(require("./utils/CloseableCollection"));
function prependSlash(str) {
    if (str.length > 0 && str.charAt(0) !== '/') {
        return `/${str}`;
    }
    return str;
}
function getInitialNamespaceOptions(catalogName, schemaName) {
    if (!catalogName && !schemaName) {
        return {};
    }
    return {
        initialNamespace: {
            catalogName,
            schemaName,
        },
    };
}
class DBSQLClient extends events_1.EventEmitter {
    static getDefaultLogger() {
        if (!this.defaultLogger) {
            this.defaultLogger = new DBSQLLogger_1.default();
        }
        return this.defaultLogger;
    }
    static getDefaultConfig() {
        return {
            arrowEnabled: true,
            useArrowNativeTypes: true,
            socketTimeout: 15 * 60 * 1000,
            retryMaxAttempts: 5,
            retriesTimeout: 15 * 60 * 1000,
            retryDelayMin: 1 * 1000,
            retryDelayMax: 60 * 1000,
            useCloudFetch: false,
            cloudFetchConcurrentDownloads: 10,
            useLZ4Compression: true,
        };
    }
    constructor(options) {
        var _a;
        super();
        this.driver = new HiveDriver_1.default({
            context: this,
        });
        this.thrift = thrift_1.default;
        this.sessions = new CloseableCollection_1.default();
        this.config = DBSQLClient.getDefaultConfig();
        this.logger = (_a = options === null || options === void 0 ? void 0 : options.logger) !== null && _a !== void 0 ? _a : DBSQLClient.getDefaultLogger();
        this.logger.log(IDBSQLLogger_1.LogLevel.info, 'Created DBSQLClient');
    }
    getConnectionOptions(options) {
        return {
            host: options.host,
            port: options.port || 443,
            path: prependSlash(options.path),
            https: true,
            socketTimeout: options.socketTimeout,
            proxy: options.proxy,
            headers: {
                'User-Agent': (0, utils_1.buildUserAgentString)(options.clientId),
            },
        };
    }
    initAuthProvider(options, authProvider) {
        if (authProvider) {
            return authProvider;
        }
        switch (options.authType) {
            case undefined:
            case 'access-token':
                return new PlainHttpAuthentication_1.default({
                    username: 'token',
                    password: options.token,
                    context: this,
                });
            case 'databricks-oauth':
                return new DatabricksOAuth_1.default({
                    flow: options.oauthClientSecret === undefined ? DatabricksOAuth_1.OAuthFlow.U2M : DatabricksOAuth_1.OAuthFlow.M2M,
                    host: options.host,
                    persistence: options.persistence,
                    azureTenantId: options.azureTenantId,
                    clientId: options.oauthClientId,
                    clientSecret: options.oauthClientSecret,
                    useDatabricksOAuthInAzure: options.useDatabricksOAuthInAzure,
                    context: this,
                });
            case 'custom':
                return options.provider;
            // no default
        }
    }
    /**
     * Connects DBSQLClient to endpoint
     * @public
     * @param options - host, path, and token are required
     * @param authProvider - [DEPRECATED - use `authType: 'custom'] Optional custom authentication provider
     * @returns Session object that can be used to execute statements
     * @example
     * const session = client.connect({host, path, token});
     */
    connect(options, authProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            this.authProvider = this.initAuthProvider(options, authProvider);
            this.connectionProvider = new HttpConnection_1.default(this.getConnectionOptions(options), this);
            const thriftConnection = yield this.connectionProvider.getThriftConnection();
            thriftConnection.on('error', (error) => {
                // Error.stack already contains error type and message, so log stack if available,
                // otherwise fall back to just error type + message
                this.logger.log(IDBSQLLogger_1.LogLevel.error, error.stack || `${error.name}: ${error.message}`);
                try {
                    this.emit('error', error);
                }
                catch (e) {
                    // EventEmitter will throw unhandled error when emitting 'error' event.
                    // Since we already logged it few lines above, just suppress this behaviour
                }
            });
            thriftConnection.on('reconnecting', (params) => {
                this.logger.log(IDBSQLLogger_1.LogLevel.debug, `Reconnecting, params: ${JSON.stringify(params)}`);
                this.emit('reconnecting', params);
            });
            thriftConnection.on('close', () => {
                this.logger.log(IDBSQLLogger_1.LogLevel.debug, 'Closing connection.');
                this.emit('close');
            });
            thriftConnection.on('timeout', () => {
                this.logger.log(IDBSQLLogger_1.LogLevel.debug, 'Connection timed out.');
                this.emit('timeout');
            });
            return this;
        });
    }
    /**
     * Starts new session
     * @public
     * @param request - Can be instantiated with initialSchema, empty by default
     * @returns Session object that can be used to execute statements
     * @throws {StatusError}
     * @example
     * const session = await client.openSession();
     */
    openSession(request = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.driver.openSession(Object.assign(Object.assign({ client_protocol_i64: new Types_1.Int64(TCLIService_types_1.TProtocolVersion.SPARK_CLI_SERVICE_PROTOCOL_V8) }, getInitialNamespaceOptions(request.initialCatalog, request.initialSchema)), { canUseMultipleCatalogs: true }));
            Status_1.default.assert(response.status);
            const session = new DBSQLSession_1.default({
                handle: (0, utils_1.definedOrError)(response.sessionHandle),
                context: this,
            });
            this.sessions.add(session);
            return session;
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sessions.closeAll();
            this.client = undefined;
            this.connectionProvider = undefined;
            this.authProvider = undefined;
        });
    }
    getConfig() {
        return this.config;
    }
    getLogger() {
        return this.logger;
    }
    getConnectionProvider() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connectionProvider) {
                throw new HiveDriverError_1.default('DBSQLClient: not connected');
            }
            return this.connectionProvider;
        });
    }
    getClient() {
        return __awaiter(this, void 0, void 0, function* () {
            const connectionProvider = yield this.getConnectionProvider();
            if (!this.client) {
                this.logger.log(IDBSQLLogger_1.LogLevel.info, 'DBSQLClient: initializing thrift client');
                this.client = this.thrift.createClient(TCLIService_1.default, yield connectionProvider.getThriftConnection());
            }
            if (this.authProvider) {
                const authHeaders = yield this.authProvider.authenticate();
                connectionProvider.setHeaders(authHeaders);
            }
            return this.client;
        });
    }
    getDriver() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.driver;
        });
    }
}
exports.default = DBSQLClient;
//# sourceMappingURL=DBSQLClient.js.map