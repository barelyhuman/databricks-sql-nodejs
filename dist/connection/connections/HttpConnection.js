"use strict";
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
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const proxy_agent_1 = require("proxy-agent");
const ThriftHttpConnection_1 = __importDefault(require("./ThriftHttpConnection"));
const HttpRetryPolicy_1 = __importDefault(require("./HttpRetryPolicy"));
class HttpConnection {
    constructor(options, context) {
        this.headers = {};
        this.options = options;
        this.context = context;
    }
    setHeaders(headers) {
        var _a;
        this.headers = headers;
        (_a = this.connection) === null || _a === void 0 ? void 0 : _a.setHeaders(Object.assign(Object.assign({}, this.options.headers), this.headers));
    }
    getAgent() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.agent) {
                if (this.options.proxy !== undefined) {
                    this.agent = this.createProxyAgent(this.options.proxy);
                }
                else {
                    this.agent = this.options.https ? this.createHttpsAgent() : this.createHttpAgent();
                }
            }
            return this.agent;
        });
    }
    getAgentDefaultOptions() {
        var _a;
        const clientConfig = this.context.getConfig();
        return {
            keepAlive: true,
            keepAliveMsecs: 10000,
            maxSockets: Infinity,
            timeout: (_a = this.options.socketTimeout) !== null && _a !== void 0 ? _a : clientConfig.socketTimeout,
        };
    }
    createHttpAgent() {
        const httpAgentOptions = this.getAgentDefaultOptions();
        return new http_1.default.Agent(httpAgentOptions);
    }
    createHttpsAgent() {
        const httpsAgentOptions = Object.assign(Object.assign({}, this.getAgentDefaultOptions()), { minVersion: 'TLSv1.2', rejectUnauthorized: false, ca: this.options.ca, cert: this.options.cert, key: this.options.key });
        return new https_1.default.Agent(httpsAgentOptions);
    }
    createProxyAgent(proxyOptions) {
        var _a, _b, _c;
        const proxyAuth = ((_a = proxyOptions.auth) === null || _a === void 0 ? void 0 : _a.username)
            ? `${proxyOptions.auth.username}:${(_c = (_b = proxyOptions.auth) === null || _b === void 0 ? void 0 : _b.password) !== null && _c !== void 0 ? _c : ''}@`
            : '';
        const proxyUrl = `${proxyOptions.protocol}://${proxyAuth}${proxyOptions.host}:${proxyOptions.port}`;
        const proxyProtocol = `${proxyOptions.protocol}:`;
        return new proxy_agent_1.ProxyAgent(Object.assign(Object.assign({}, this.getAgentDefaultOptions()), { getProxyForUrl: () => proxyUrl, httpsAgent: this.createHttpsAgent(), httpAgent: this.createHttpAgent(), protocol: proxyProtocol }));
    }
    getThriftConnection() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connection) {
                const { options } = this;
                const clientConfig = this.context.getConfig();
                const agent = yield this.getAgent();
                this.connection = new ThriftHttpConnection_1.default({
                    url: `${options.https ? 'https' : 'http'}://${options.host}:${options.port}${(_a = options.path) !== null && _a !== void 0 ? _a : '/'}`,
                    transport: thrift_1.default.TBufferedTransport,
                    protocol: thrift_1.default.TBinaryProtocol,
                    getRetryPolicy: () => this.getRetryPolicy(),
                }, {
                    agent,
                    timeout: (_b = options.socketTimeout) !== null && _b !== void 0 ? _b : clientConfig.socketTimeout,
                    headers: Object.assign(Object.assign({}, options.headers), this.headers),
                });
            }
            return this.connection;
        });
    }
    getRetryPolicy() {
        return __awaiter(this, void 0, void 0, function* () {
            return new HttpRetryPolicy_1.default(this.context);
        });
    }
}
exports.default = HttpConnection;
//# sourceMappingURL=HttpConnection.js.map