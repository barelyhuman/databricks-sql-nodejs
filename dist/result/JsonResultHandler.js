"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("../hive/Types");
const utils_1 = require("./utils");
class JsonResultHandler {
    constructor(context, source, { schema }) {
        this.context = context;
        this.source = source;
        this.schema = (0, utils_1.getSchemaColumns)(schema);
    }
    hasMore() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.source.hasMore();
        });
    }
    fetchNext(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.schema.length === 0) {
                return [];
            }
            const data = yield this.source.fetchNext(options);
            if (!data) {
                return [];
            }
            const columns = data.columns || [];
            return this.getRows(columns, this.schema);
        });
    }
    getRows(columns, descriptors) {
        return descriptors.reduce((rows, descriptor) => this.getSchemaValues(descriptor, columns[descriptor.position - 1]).reduce((result, value, i) => {
            if (!result[i]) {
                result[i] = {};
            }
            const { columnName } = descriptor;
            result[i][columnName] = value;
            return result;
        }, rows), []);
    }
    getSchemaValues(descriptor, column) {
        var _a;
        const typeDescriptor = (_a = descriptor.typeDesc.types[0]) === null || _a === void 0 ? void 0 : _a.primitiveEntry;
        const columnValue = this.getColumnValue(column);
        if (!columnValue) {
            return [];
        }
        return columnValue.values.map((value, i) => {
            if (columnValue.nulls && this.isNull(columnValue.nulls, i)) {
                return null;
            }
            return (0, utils_1.convertThriftValue)(typeDescriptor, value);
        });
    }
    isNull(nulls, i) {
        const byte = nulls[Math.floor(i / 8)];
        const ofs = Math.pow(2, (i % 8));
        return (byte & ofs) !== 0;
    }
    getColumnValue(column) {
        if (!column) {
            return undefined;
        }
        return (column[Types_1.ColumnCode.binaryVal] ||
            column[Types_1.ColumnCode.boolVal] ||
            column[Types_1.ColumnCode.byteVal] ||
            column[Types_1.ColumnCode.doubleVal] ||
            column[Types_1.ColumnCode.i16Val] ||
            column[Types_1.ColumnCode.i32Val] ||
            column[Types_1.ColumnCode.i64Val] ||
            column[Types_1.ColumnCode.stringVal]);
    }
}
exports.default = JsonResultHandler;
//# sourceMappingURL=JsonResultHandler.js.map