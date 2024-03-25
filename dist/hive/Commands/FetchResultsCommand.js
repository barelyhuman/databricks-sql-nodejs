"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseCommand_1 = __importDefault(require("./BaseCommand"));
const TCLIService_types_1 = require("../../../thrift/TCLIService_types");
/**
 * TFetchResultsReq.fetchType - 0 represents Query output. 1 represents Log
 */
class FetchResultsCommand extends BaseCommand_1.default {
    execute(data) {
        const request = new TCLIService_types_1.TFetchResultsReq(data);
        return this.executeCommand(request, this.client.FetchResults);
    }
}
exports.default = FetchResultsCommand;
//# sourceMappingURL=FetchResultsCommand.js.map