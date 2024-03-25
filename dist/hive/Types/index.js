"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchType = exports.ColumnCode = exports.Int64 = void 0;
const node_int64_1 = __importDefault(require("node-int64"));
exports.Int64 = node_int64_1.default;
var ColumnCode;
(function (ColumnCode) {
    ColumnCode["boolVal"] = "boolVal";
    ColumnCode["byteVal"] = "byteVal";
    ColumnCode["i16Val"] = "i16Val";
    ColumnCode["i32Val"] = "i32Val";
    ColumnCode["i64Val"] = "i64Val";
    ColumnCode["doubleVal"] = "doubleVal";
    ColumnCode["stringVal"] = "stringVal";
    ColumnCode["binaryVal"] = "binaryVal";
})(ColumnCode = exports.ColumnCode || (exports.ColumnCode = {}));
var FetchType;
(function (FetchType) {
    FetchType[FetchType["Data"] = 0] = "Data";
    FetchType[FetchType["Logs"] = 1] = "Logs";
})(FetchType = exports.FetchType || (exports.FetchType = {}));
//# sourceMappingURL=index.js.map