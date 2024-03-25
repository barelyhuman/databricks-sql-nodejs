"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseCommand_1 = __importDefault(require("./BaseCommand"));
const TCLIService_types_1 = require("../../../thrift/TCLIService_types");
class RenewDelegationTokenCommand extends BaseCommand_1.default {
    execute(data) {
        const request = new TCLIService_types_1.TRenewDelegationTokenReq(data);
        return this.executeCommand(request, this.client.RenewDelegationToken);
    }
}
exports.default = RenewDelegationTokenCommand;
//# sourceMappingURL=RenewDelegationTokenCommand.js.map