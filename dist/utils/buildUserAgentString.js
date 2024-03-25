"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const version_1 = __importDefault(require("../version"));
const productName = 'NodejsDatabricksSqlConnector';
function getNodeVersion() {
    return `Node.js ${process.versions.node}`;
}
function getOperatingSystemVersion() {
    return `${os_1.default.type()} ${os_1.default.release()}`;
}
function buildUserAgentString(clientId) {
    const extra = [clientId, getNodeVersion(), getOperatingSystemVersion()].filter(Boolean);
    return `${productName}/${version_1.default} (${extra.join('; ')})`;
}
exports.default = buildUserAgentString;
//# sourceMappingURL=buildUserAgentString.js.map