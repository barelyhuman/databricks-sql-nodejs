"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hiveSchemaToArrowSchema = exports.convertThriftValue = exports.getSchemaColumns = void 0;
const node_int64_1 = __importDefault(require("node-int64"));
const apache_arrow_1 = require("apache-arrow");
const TCLIService_types_1 = require("../../thrift/TCLIService_types");
const HiveDriverError_1 = __importDefault(require("../errors/HiveDriverError"));
function getSchemaColumns(schema) {
    if (!schema) {
        return [];
    }
    return [...schema.columns].sort((c1, c2) => c1.position - c2.position);
}
exports.getSchemaColumns = getSchemaColumns;
function isString(value) {
    return typeof value === 'string' || value instanceof String;
}
function convertJSON(value, defaultValue) {
    if (!isString(value)) {
        return value;
    }
    try {
        return JSON.parse(value);
    }
    catch (e) {
        return defaultValue;
    }
}
function convertBigInt(value) {
    if (typeof value === 'bigint') {
        return Number(value);
    }
    if (value instanceof node_int64_1.default) {
        return value.toNumber();
    }
    return value;
}
function convertThriftValue(typeDescriptor, value) {
    if (!typeDescriptor) {
        return value;
    }
    switch (typeDescriptor.type) {
        case TCLIService_types_1.TTypeId.DATE_TYPE:
        case TCLIService_types_1.TTypeId.TIMESTAMP_TYPE:
            return value;
        case TCLIService_types_1.TTypeId.UNION_TYPE:
        case TCLIService_types_1.TTypeId.USER_DEFINED_TYPE:
            return String(value);
        case TCLIService_types_1.TTypeId.DECIMAL_TYPE:
            return Number(value);
        case TCLIService_types_1.TTypeId.STRUCT_TYPE:
        case TCLIService_types_1.TTypeId.MAP_TYPE:
            return convertJSON(value, {});
        case TCLIService_types_1.TTypeId.ARRAY_TYPE:
            return convertJSON(value, []);
        case TCLIService_types_1.TTypeId.BIGINT_TYPE:
            return convertBigInt(value);
        case TCLIService_types_1.TTypeId.NULL_TYPE:
        case TCLIService_types_1.TTypeId.BINARY_TYPE:
        case TCLIService_types_1.TTypeId.INTERVAL_YEAR_MONTH_TYPE:
        case TCLIService_types_1.TTypeId.INTERVAL_DAY_TIME_TYPE:
        case TCLIService_types_1.TTypeId.FLOAT_TYPE:
        case TCLIService_types_1.TTypeId.DOUBLE_TYPE:
        case TCLIService_types_1.TTypeId.INT_TYPE:
        case TCLIService_types_1.TTypeId.SMALLINT_TYPE:
        case TCLIService_types_1.TTypeId.TINYINT_TYPE:
        case TCLIService_types_1.TTypeId.BOOLEAN_TYPE:
        case TCLIService_types_1.TTypeId.STRING_TYPE:
        case TCLIService_types_1.TTypeId.CHAR_TYPE:
        case TCLIService_types_1.TTypeId.VARCHAR_TYPE:
        default:
            return value;
    }
}
exports.convertThriftValue = convertThriftValue;
// This type map corresponds to Arrow without native types support (most complex types are serialized as strings)
const hiveTypeToArrowType = {
    [TCLIService_types_1.TTypeId.BOOLEAN_TYPE]: new apache_arrow_1.Bool(),
    [TCLIService_types_1.TTypeId.TINYINT_TYPE]: new apache_arrow_1.Int8(),
    [TCLIService_types_1.TTypeId.SMALLINT_TYPE]: new apache_arrow_1.Int16(),
    [TCLIService_types_1.TTypeId.INT_TYPE]: new apache_arrow_1.Int32(),
    [TCLIService_types_1.TTypeId.BIGINT_TYPE]: new apache_arrow_1.Int64(),
    [TCLIService_types_1.TTypeId.FLOAT_TYPE]: new apache_arrow_1.Float32(),
    [TCLIService_types_1.TTypeId.DOUBLE_TYPE]: new apache_arrow_1.Float64(),
    [TCLIService_types_1.TTypeId.STRING_TYPE]: new apache_arrow_1.Utf8(),
    [TCLIService_types_1.TTypeId.TIMESTAMP_TYPE]: new apache_arrow_1.Utf8(),
    [TCLIService_types_1.TTypeId.BINARY_TYPE]: new apache_arrow_1.Binary(),
    [TCLIService_types_1.TTypeId.ARRAY_TYPE]: new apache_arrow_1.Utf8(),
    [TCLIService_types_1.TTypeId.MAP_TYPE]: new apache_arrow_1.Utf8(),
    [TCLIService_types_1.TTypeId.STRUCT_TYPE]: new apache_arrow_1.Utf8(),
    [TCLIService_types_1.TTypeId.UNION_TYPE]: new apache_arrow_1.Utf8(),
    [TCLIService_types_1.TTypeId.USER_DEFINED_TYPE]: new apache_arrow_1.Utf8(),
    [TCLIService_types_1.TTypeId.DECIMAL_TYPE]: new apache_arrow_1.Utf8(),
    [TCLIService_types_1.TTypeId.NULL_TYPE]: null,
    [TCLIService_types_1.TTypeId.DATE_TYPE]: new apache_arrow_1.Date_(apache_arrow_1.DateUnit.DAY),
    [TCLIService_types_1.TTypeId.VARCHAR_TYPE]: new apache_arrow_1.Utf8(),
    [TCLIService_types_1.TTypeId.CHAR_TYPE]: new apache_arrow_1.Utf8(),
    [TCLIService_types_1.TTypeId.INTERVAL_YEAR_MONTH_TYPE]: new apache_arrow_1.Utf8(),
    [TCLIService_types_1.TTypeId.INTERVAL_DAY_TIME_TYPE]: new apache_arrow_1.Utf8(),
};
function hiveSchemaToArrowSchema(schema) {
    if (!schema) {
        return undefined;
    }
    const columns = getSchemaColumns(schema);
    const arrowFields = columns.map((column) => {
        var _a, _b;
        const hiveType = (_b = (_a = column.typeDesc.types[0].primitiveEntry) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : undefined;
        const arrowType = hiveType !== undefined ? hiveTypeToArrowType[hiveType] : undefined;
        if (!arrowType) {
            throw new HiveDriverError_1.default(`Unsupported column type: ${hiveType ? TCLIService_types_1.TTypeId[hiveType] : 'undefined'}`);
        }
        return new apache_arrow_1.Field(column.columnName, arrowType, true);
    });
    const arrowSchema = new apache_arrow_1.Schema(arrowFields);
    const writer = new apache_arrow_1.RecordBatchWriter();
    writer.reset(undefined, arrowSchema);
    writer.finish();
    return Buffer.from(writer.toUint8Array(true));
}
exports.hiveSchemaToArrowSchema = hiveSchemaToArrowSchema;
//# sourceMappingURL=utils.js.map