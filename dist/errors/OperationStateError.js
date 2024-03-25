"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationStateErrorCode = void 0;
const HiveDriverError_1 = __importDefault(require("./HiveDriverError"));
var OperationStateErrorCode;
(function (OperationStateErrorCode) {
    OperationStateErrorCode["Canceled"] = "CANCELED";
    OperationStateErrorCode["Closed"] = "CLOSED";
    OperationStateErrorCode["Error"] = "ERROR";
    OperationStateErrorCode["Timeout"] = "TIMEOUT";
    OperationStateErrorCode["Unknown"] = "UNKNOWN";
})(OperationStateErrorCode = exports.OperationStateErrorCode || (exports.OperationStateErrorCode = {}));
const errorMessages = {
    [OperationStateErrorCode.Canceled]: 'The operation was canceled by a client',
    [OperationStateErrorCode.Closed]: 'The operation was closed by a client',
    [OperationStateErrorCode.Error]: 'The operation failed due to an error',
    [OperationStateErrorCode.Timeout]: 'The operation is in a timed out state',
    [OperationStateErrorCode.Unknown]: 'The operation is in an unrecognized state',
};
class OperationStateError extends HiveDriverError_1.default {
    constructor(errorCode, response) {
        var _a;
        super((_a = response === null || response === void 0 ? void 0 : response.displayMessage) !== null && _a !== void 0 ? _a : errorMessages[errorCode]);
        this.errorCode = errorCode;
        this.response = response;
    }
}
exports.default = OperationStateError;
//# sourceMappingURL=OperationStateError.js.map