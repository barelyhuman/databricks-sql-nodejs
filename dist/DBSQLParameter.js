"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBSQLParameter = exports.DBSQLParameterType = void 0;
const node_int64_1 = __importDefault(require("node-int64"));
const TCLIService_types_1 = require("../thrift/TCLIService_types");
var DBSQLParameterType;
(function (DBSQLParameterType) {
    DBSQLParameterType["VOID"] = "VOID";
    DBSQLParameterType["STRING"] = "STRING";
    DBSQLParameterType["DATE"] = "DATE";
    DBSQLParameterType["TIMESTAMP"] = "TIMESTAMP";
    DBSQLParameterType["FLOAT"] = "FLOAT";
    DBSQLParameterType["DECIMAL"] = "DECIMAL";
    DBSQLParameterType["DOUBLE"] = "DOUBLE";
    DBSQLParameterType["INTEGER"] = "INTEGER";
    DBSQLParameterType["BIGINT"] = "BIGINT";
    DBSQLParameterType["SMALLINT"] = "SMALLINT";
    DBSQLParameterType["TINYINT"] = "TINYINT";
    DBSQLParameterType["BOOLEAN"] = "BOOLEAN";
    DBSQLParameterType["INTERVALMONTH"] = "INTERVAL MONTH";
    DBSQLParameterType["INTERVALDAY"] = "INTERVAL DAY";
})(DBSQLParameterType = exports.DBSQLParameterType || (exports.DBSQLParameterType = {}));
class DBSQLParameter {
    constructor({ type, value }) {
        this.type = type;
        this.value = value;
    }
    toSparkParameter({ name } = {}) {
        var _a, _b, _c, _d, _e;
        // If VOID type was set explicitly - ignore value
        if (this.type === DBSQLParameterType.VOID) {
            return new TCLIService_types_1.TSparkParameter({ name }); // for NULL neither `type` nor `value` should be set
        }
        // Infer NULL values
        if (this.value === undefined || this.value === null) {
            return new TCLIService_types_1.TSparkParameter({ name }); // for NULL neither `type` nor `value` should be set
        }
        if (typeof this.value === 'boolean') {
            return new TCLIService_types_1.TSparkParameter({
                name,
                type: (_a = this.type) !== null && _a !== void 0 ? _a : DBSQLParameterType.BOOLEAN,
                value: new TCLIService_types_1.TSparkParameterValue({
                    stringValue: this.value ? 'TRUE' : 'FALSE',
                }),
            });
        }
        if (typeof this.value === 'number') {
            return new TCLIService_types_1.TSparkParameter({
                name,
                type: (_b = this.type) !== null && _b !== void 0 ? _b : (Number.isInteger(this.value) ? DBSQLParameterType.INTEGER : DBSQLParameterType.DOUBLE),
                value: new TCLIService_types_1.TSparkParameterValue({
                    stringValue: Number(this.value).toString(),
                }),
            });
        }
        if (this.value instanceof node_int64_1.default || typeof this.value === 'bigint') {
            return new TCLIService_types_1.TSparkParameter({
                name,
                type: (_c = this.type) !== null && _c !== void 0 ? _c : DBSQLParameterType.BIGINT,
                value: new TCLIService_types_1.TSparkParameterValue({
                    stringValue: this.value.toString(),
                }),
            });
        }
        if (this.value instanceof Date) {
            return new TCLIService_types_1.TSparkParameter({
                name,
                type: (_d = this.type) !== null && _d !== void 0 ? _d : DBSQLParameterType.TIMESTAMP,
                value: new TCLIService_types_1.TSparkParameterValue({
                    stringValue: this.value.toISOString(),
                }),
            });
        }
        return new TCLIService_types_1.TSparkParameter({
            name,
            type: (_e = this.type) !== null && _e !== void 0 ? _e : DBSQLParameterType.STRING,
            value: new TCLIService_types_1.TSparkParameterValue({
                stringValue: this.value,
            }),
        });
    }
}
exports.DBSQLParameter = DBSQLParameter;
//# sourceMappingURL=DBSQLParameter.js.map