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
Object.defineProperty(exports, "__esModule", { value: true });
const RetryError_1 = __importStar(require("../../errors/RetryError"));
function delay(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), milliseconds);
    });
}
class HttpRetryPolicy {
    constructor(context) {
        this.context = context;
        this.startTime = Date.now();
        this.attempt = 0;
    }
    shouldRetry(details) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isRetryable(details)) {
                const clientConfig = this.context.getConfig();
                // Don't retry if overall retry timeout exceeded
                const timeoutExceeded = Date.now() - this.startTime >= clientConfig.retriesTimeout;
                if (timeoutExceeded) {
                    throw new RetryError_1.default(RetryError_1.RetryErrorCode.TimeoutExceeded, details);
                }
                this.attempt += 1;
                // Don't retry if max attempts count reached
                const attemptsExceeded = this.attempt >= clientConfig.retryMaxAttempts;
                if (attemptsExceeded) {
                    throw new RetryError_1.default(RetryError_1.RetryErrorCode.AttemptsExceeded, details);
                }
                // If possible, use `Retry-After` header as a floor for a backoff algorithm
                const retryAfterHeader = this.getRetryAfterHeader(details, clientConfig.retryDelayMin);
                const retryAfter = this.getBackoffDelay(this.attempt, retryAfterHeader !== null && retryAfterHeader !== void 0 ? retryAfterHeader : clientConfig.retryDelayMin, clientConfig.retryDelayMax);
                return { shouldRetry: true, retryAfter };
            }
            return { shouldRetry: false };
        });
    }
    invokeWithRetry(operation) {
        return __awaiter(this, void 0, void 0, function* () {
            for (;;) {
                const details = yield operation(); // eslint-disable-line no-await-in-loop
                const status = yield this.shouldRetry(details); // eslint-disable-line no-await-in-loop
                if (!status.shouldRetry) {
                    return details;
                }
                yield delay(status.retryAfter); // eslint-disable-line no-await-in-loop
            }
        });
    }
    isRetryable({ response }) {
        const statusCode = response.status;
        const result = 
        // Retry on all codes below 100
        statusCode < 100 ||
            // ...and on `429 Too Many Requests`
            statusCode === 429 ||
            // ...and on all `5xx` codes except for `501 Not Implemented`
            (statusCode >= 500 && statusCode !== 501);
        return result;
    }
    getRetryAfterHeader({ response }, delayMin) {
        // `Retry-After` header may contain a date after which to retry, or delay seconds. We support only delay seconds.
        // Value from `Retry-After` header is used when:
        // 1. it's available and is non-empty
        // 2. it could be parsed as a number, and is greater than zero
        // 3. additionally, we clamp it to not be smaller than minimal retry delay
        const header = response.headers.get('Retry-After') || '';
        if (header !== '') {
            const value = Number(header);
            if (Number.isFinite(value) && value > 0) {
                return Math.max(delayMin, value);
            }
        }
        return undefined;
    }
    getBackoffDelay(attempt, delayMin, delayMax) {
        const value = Math.pow(2, attempt) * delayMin;
        return Math.min(value, delayMax);
    }
}
exports.default = HttpRetryPolicy;
//# sourceMappingURL=HttpRetryPolicy.js.map