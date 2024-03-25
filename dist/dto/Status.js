"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TCLIService_types_1 = require("../../thrift/TCLIService_types");
const StatusError_1 = __importDefault(require("../errors/StatusError"));
class Status {
    constructor(status) {
        this.status = status;
    }
    get isSuccess() {
        const { statusCode } = this.status;
        return statusCode === TCLIService_types_1.TStatusCode.SUCCESS_STATUS || statusCode === TCLIService_types_1.TStatusCode.SUCCESS_WITH_INFO_STATUS;
    }
    get isExecuting() {
        const { statusCode } = this.status;
        return statusCode === TCLIService_types_1.TStatusCode.STILL_EXECUTING_STATUS;
    }
    get isError() {
        const { statusCode } = this.status;
        return statusCode === TCLIService_types_1.TStatusCode.ERROR_STATUS || statusCode === TCLIService_types_1.TStatusCode.INVALID_HANDLE_STATUS;
    }
    get info() {
        return this.status.infoMessages || [];
    }
    static assert(status) {
        const statusWrapper = new Status(status);
        if (statusWrapper.isError) {
            throw new StatusError_1.default(status);
        }
    }
    static success(info = []) {
        return new Status({
            statusCode: info.length > 0 ? TCLIService_types_1.TStatusCode.SUCCESS_WITH_INFO_STATUS : TCLIService_types_1.TStatusCode.SUCCESS_STATUS,
            infoMessages: info,
        });
    }
}
exports.default = Status;
//# sourceMappingURL=Status.js.map