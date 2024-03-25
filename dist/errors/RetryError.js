"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryErrorCode = void 0;
var RetryErrorCode;
(function (RetryErrorCode) {
    RetryErrorCode["AttemptsExceeded"] = "ATTEMPTS_EXCEEDED";
    RetryErrorCode["TimeoutExceeded"] = "TIMEOUT_EXCEEDED";
})(RetryErrorCode = exports.RetryErrorCode || (exports.RetryErrorCode = {}));
const errorMessages = {
    [RetryErrorCode.AttemptsExceeded]: 'Max retry count exceeded',
    [RetryErrorCode.TimeoutExceeded]: 'Retry timeout exceeded',
};
class RetryError extends Error {
    constructor(errorCode, payload) {
        super(errorMessages[errorCode]);
        this.errorCode = errorCode;
        this.payload = payload;
    }
}
exports.default = RetryError;
//# sourceMappingURL=RetryError.js.map