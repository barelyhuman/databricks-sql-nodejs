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
const lz4_1 = __importDefault(require("lz4"));
const node_fetch_1 = __importStar(require("node-fetch"));
class CloudFetchResultHandler {
    constructor(context, source, { lz4Compressed }) {
        this.pendingLinks = [];
        this.downloadTasks = [];
        this.context = context;
        this.source = source;
        this.isLZ4Compressed = lz4Compressed !== null && lz4Compressed !== void 0 ? lz4Compressed : false;
    }
    hasMore() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pendingLinks.length > 0 || this.downloadTasks.length > 0) {
                return true;
            }
            return this.source.hasMore();
        });
    }
    fetchNext(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.source.fetchNext(options);
            (_a = data === null || data === void 0 ? void 0 : data.resultLinks) === null || _a === void 0 ? void 0 : _a.forEach((link) => {
                this.pendingLinks.push(link);
            });
            const clientConfig = this.context.getConfig();
            const freeTaskSlotsCount = clientConfig.cloudFetchConcurrentDownloads - this.downloadTasks.length;
            if (freeTaskSlotsCount > 0) {
                const links = this.pendingLinks.splice(0, freeTaskSlotsCount);
                const tasks = links.map((link) => this.downloadLink(link));
                this.downloadTasks.push(...tasks);
            }
            const batch = yield this.downloadTasks.shift();
            if (!batch) {
                return {
                    batches: [],
                    rowCount: 0,
                };
            }
            if (this.isLZ4Compressed) {
                batch.batches = batch.batches.map((buffer) => lz4_1.default.decode(buffer));
            }
            return batch;
        });
    }
    downloadLink(link) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Date.now() >= link.expiryTime.toNumber()) {
                throw new Error('CloudFetch link has expired');
            }
            const response = yield this.fetch(link.fileLink);
            if (!response.ok) {
                throw new Error(`CloudFetch HTTP error ${response.status} ${response.statusText}`);
            }
            const result = yield response.arrayBuffer();
            return {
                batches: [Buffer.from(result)],
                rowCount: link.rowCount.toNumber(true),
            };
        });
    }
    fetch(url, init) {
        return __awaiter(this, void 0, void 0, function* () {
            const connectionProvider = yield this.context.getConnectionProvider();
            const agent = yield connectionProvider.getAgent();
            const retryPolicy = yield connectionProvider.getRetryPolicy();
            const requestConfig = Object.assign({ agent }, init);
            const result = yield retryPolicy.invokeWithRetry(() => {
                const request = new node_fetch_1.Request(url, requestConfig);
                return (0, node_fetch_1.default)(request).then((response) => ({ request, response }));
            });
            return result.response;
        });
    }
}
exports.default = CloudFetchResultHandler;
//# sourceMappingURL=CloudFetchResultHandler.js.map