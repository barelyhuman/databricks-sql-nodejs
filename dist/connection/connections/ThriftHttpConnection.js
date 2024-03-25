"use strict";
/**
  This file is created using node_modules/thrift/lib/nodejs/lib/thrift/http_connection.js as an example

  The code relies on thrift internals, so be careful when upgrading `thrift` library
*/
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
exports.THTTPException = void 0;
const events_1 = require("events");
const thrift_1 = require("thrift");
const node_fetch_1 = __importStar(require("node-fetch"));
// @ts-expect-error TS7016: Could not find a declaration file for module
const input_buffer_underrun_error_1 = __importDefault(require("thrift/lib/nodejs/lib/thrift/input_buffer_underrun_error"));
const NullRetryPolicy_1 = __importDefault(require("./NullRetryPolicy"));
class THTTPException extends thrift_1.Thrift.TApplicationException {
    constructor(response) {
        super(thrift_1.Thrift.TApplicationExceptionType.PROTOCOL_ERROR, `Received a response with a bad HTTP status code: ${response.status}`);
        this.statusCode = response.status;
        this.response = response;
    }
}
exports.THTTPException = THTTPException;
const retryableThriftMethods = new Set([
    'GetOperationStatus',
    'CancelOperation',
    'CloseOperation',
    'GetResultSetMetadata',
    'CloseSession',
    'GetInfo',
    'GetTypeInfo',
    'GetCatalogs',
    'GetSchemas',
    'GetTables',
    'GetTableTypes',
    'GetColumns',
    'GetFunctions',
    'GetPrimaryKeys',
    'GetCrossReference',
]);
class ThriftHttpConnection extends events_1.EventEmitter {
    constructor(options, config = {}) {
        var _a, _b;
        super();
        this.url = options.url;
        this.config = config;
        this.options = options;
        this.transport = (_a = options.transport) !== null && _a !== void 0 ? _a : thrift_1.TBufferedTransport;
        this.protocol = (_b = options.protocol) !== null && _b !== void 0 ? _b : thrift_1.TBinaryProtocol;
    }
    getRetryPolicy(thriftMethodName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Allow retry behavior only for Thrift operations that are for sure safe to retry
            if (thriftMethodName && retryableThriftMethods.has(thriftMethodName)) {
                return this.options.getRetryPolicy();
            }
            // Don't retry everything that is not explicitly allowed to retry
            return new NullRetryPolicy_1.default();
        });
    }
    setHeaders(headers) {
        this.config = Object.assign(Object.assign({}, this.config), { headers });
    }
    write(data, seqId) {
        const requestConfig = Object.assign(Object.assign({}, this.config), { method: 'POST', headers: Object.assign(Object.assign({}, this.config.headers), { Connection: 'keep-alive', 'Content-Length': `${data.length}`, 'Content-Type': 'application/x-thrift' }), body: data });
        this.getThriftMethodName(data)
            .then((thriftMethod) => this.getRetryPolicy(thriftMethod))
            .then((retryPolicy) => {
            const makeRequest = () => {
                const request = new node_fetch_1.Request(this.url, requestConfig);
                return (0, node_fetch_1.default)(request).then((response) => ({ request, response }));
            };
            return retryPolicy.invokeWithRetry(makeRequest);
        })
            .then(({ response }) => {
            if (response.status !== 200) {
                throw new THTTPException(response);
            }
            return response.buffer();
        })
            .then((buffer) => {
            this.transport.receiver((transportWithData) => this.handleThriftResponse(transportWithData), seqId)(buffer);
        })
            .catch((error) => {
            var _a;
            if (error instanceof node_fetch_1.FetchError) {
                if (error.type === 'request-timeout') {
                    error = new thrift_1.Thrift.TApplicationException(thrift_1.Thrift.TApplicationExceptionType.PROTOCOL_ERROR, 'Request timed out');
                }
            }
            const defaultErrorHandler = (err) => {
                this.emit('error', err);
            };
            if (this.client) {
                const callback = (_a = this.client._reqs[seqId]) !== null && _a !== void 0 ? _a : defaultErrorHandler;
                delete this.client._reqs[seqId];
                callback(error);
            }
            else {
                defaultErrorHandler(error);
            }
        });
    }
    getThriftMethodName(thriftMessage) {
        return new Promise((resolve) => {
            try {
                const receiver = this.transport.receiver((transportWithData) => {
                    const Protocol = this.protocol;
                    const proto = new Protocol(transportWithData);
                    const header = proto.readMessageBegin();
                    resolve(header.fname);
                }, 0 /* `seqId` could be any because it's ignored */);
                receiver(thriftMessage);
            }
            catch (_a) {
                resolve(undefined);
            }
        });
    }
    handleThriftResponse(transportWithData) {
        if (!this.client) {
            throw new thrift_1.Thrift.TApplicationException(thrift_1.Thrift.TApplicationExceptionType.INTERNAL_ERROR, 'Client not available');
        }
        const Protocol = this.protocol;
        const proto = new Protocol(transportWithData);
        try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const header = proto.readMessageBegin();
                const dummySeqId = header.rseqid * -1;
                const { client } = this;
                client._reqs[dummySeqId] = (err, success) => {
                    transportWithData.commitPosition();
                    const clientCallback = client._reqs[header.rseqid];
                    delete client._reqs[header.rseqid];
                    if (clientCallback) {
                        process.nextTick(() => {
                            clientCallback(err, success);
                        });
                    }
                };
                if (client[`recv_${header.fname}`]) {
                    client[`recv_${header.fname}`](proto, header.mtype, dummySeqId);
                }
                else {
                    delete client._reqs[dummySeqId];
                    throw new thrift_1.Thrift.TApplicationException(thrift_1.Thrift.TApplicationExceptionType.WRONG_METHOD_NAME, 'Received a response to an unknown RPC function');
                }
            }
        }
        catch (error) {
            if (error instanceof input_buffer_underrun_error_1.default) {
                transportWithData.rollbackPosition();
            }
            else {
                throw error;
            }
        }
    }
}
exports.default = ThriftHttpConnection;
//# sourceMappingURL=ThriftHttpConnection.js.map