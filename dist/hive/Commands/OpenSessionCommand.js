"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseCommand_1 = __importDefault(require("./BaseCommand"));
const TCLIService_types_1 = require("../../../thrift/TCLIService_types");
/**
 * For auth mechanism GSSAPI the host and service should be provided when session is opened.
 *
 * TOpenSessionReq.configuration: {
 *   krb_host?: string;
 *   krb_service?: string;
 *   [key: string]: any;
 * }
 */
class OpenSessionCommand extends BaseCommand_1.default {
    execute(openSessionRequest) {
        const request = new TCLIService_types_1.TOpenSessionReq(openSessionRequest);
        return this.executeCommand(request, this.client.OpenSession);
    }
}
exports.default = OpenSessionCommand;
//# sourceMappingURL=OpenSessionCommand.js.map