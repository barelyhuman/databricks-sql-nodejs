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
const buffer_1 = require("buffer");
const apache_arrow_1 = require("apache-arrow");
const utils_1 = require("./utils");
const { isArrowBigNumSymbol, bigNumToBigInt } = apache_arrow_1.util;
class ArrowResultConverter {
    constructor(context, source, { schema }) {
        // Remaining rows in current Arrow batch (not the record batch!)
        this.remainingRows = 0;
        this.context = context;
        this.source = source;
        this.schema = (0, utils_1.getSchemaColumns)(schema);
    }
    hasMore() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.schema.length === 0) {
                return false;
            }
            if (this.prefetchedRecordBatch) {
                return true;
            }
            return this.source.hasMore();
        });
    }
    fetchNext(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.schema.length === 0) {
                return [];
            }
            // It's not possible to know if iterator has more items until trying to get the next item.
            // So each time we read one batch ahead and store it, but process the batch prefetched on
            // a previous `fetchNext` call. Because we actually already have the next item - it's easy
            // to tell if the subsequent `fetchNext` will be able to read anything, and `hasMore` logic
            // becomes trivial
            // This prefetch handles a first call to `fetchNext`, when all the internal fields are not initialized yet.
            // On subsequent calls to `fetchNext` it will do nothing
            yield this.prefetch(options);
            if (this.prefetchedRecordBatch) {
                // Consume a record batch fetched during previous call to `fetchNext`
                const table = new apache_arrow_1.Table(this.prefetchedRecordBatch);
                this.prefetchedRecordBatch = undefined;
                // Get table rows, but not more than remaining count
                const arrowRows = table.toArray().slice(0, this.remainingRows);
                const result = this.getRows(table.schema, arrowRows);
                // Reduce remaining rows count by a count of rows we just processed.
                // If the remaining count reached zero - we're done with current arrow
                // batch, so discard the batch reader
                this.remainingRows -= result.length;
                if (this.remainingRows === 0) {
                    this.recordBatchReader = undefined;
                }
                // Prefetch the next record batch
                yield this.prefetch(options);
                return result;
            }
            return [];
        });
    }
    // This method tries to read one more record batch and store it in `prefetchedRecordBatch` field.
    // If `prefetchedRecordBatch` is already non-empty - the method does nothing.
    // This method pulls the next item from source if needed, initializes a record batch reader and
    // gets the next item from it - until either reaches end of data or finds a non-empty record batch
    prefetch(options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // This loop will be executed until a next non-empty record batch is retrieved
            // Another implicit loop condition (end of data) is checked in the loop body
            while (!this.prefetchedRecordBatch) {
                // First, try to fetch next item from source and initialize record batch reader.
                // If source has no more data - exit prematurely
                if (!this.recordBatchReader) {
                    const sourceHasMore = yield this.source.hasMore(); // eslint-disable-line no-await-in-loop
                    if (!sourceHasMore) {
                        return;
                    }
                    const arrowBatch = yield this.source.fetchNext(options); // eslint-disable-line no-await-in-loop
                    if (arrowBatch.batches.length > 0 && arrowBatch.rowCount > 0) {
                        const reader = apache_arrow_1.RecordBatchReader.from(arrowBatch.batches);
                        this.recordBatchReader = reader[Symbol.iterator]();
                        this.remainingRows = arrowBatch.rowCount;
                    }
                }
                // Try to get a next item from current record batch reader. The reader may be unavailable at this point -
                // in this case we fall back to a "done" state, and the `while` loop will do one more iteration attempting
                // to create a new reader. Eventually it will either succeed or reach end of source. This scenario also
                // handles readers which are already empty
                const item = (_b = (_a = this.recordBatchReader) === null || _a === void 0 ? void 0 : _a.next()) !== null && _b !== void 0 ? _b : { done: true, value: undefined };
                if (item.done || item.value === undefined) {
                    this.recordBatchReader = undefined;
                }
                else {
                    // Skip empty batches
                    // eslint-disable-next-line no-lonely-if
                    if (item.value.numRows > 0) {
                        this.prefetchedRecordBatch = item.value;
                    }
                }
            }
        });
    }
    getRows(schema, rows) {
        return rows.map((row) => {
            // First, convert native Arrow values to corresponding plain JS objects
            const record = this.convertArrowTypes(row, undefined, schema.fields);
            // Second, cast all the values to original Thrift types
            return this.convertThriftTypes(record);
        });
    }
    convertArrowTypes(value, valueType, fields = []) {
        var _a;
        if (value === null) {
            return value;
        }
        const fieldsMap = {};
        for (const field of fields) {
            fieldsMap[field.name] = field;
        }
        // Convert structures to plain JS object and process all its fields recursively
        if (value instanceof apache_arrow_1.StructRow) {
            const result = value.toJSON();
            for (const key of Object.keys(result)) {
                const field = fieldsMap[key];
                result[key] = this.convertArrowTypes(result[key], field === null || field === void 0 ? void 0 : field.type, (field === null || field === void 0 ? void 0 : field.type.children) || []);
            }
            return result;
        }
        if (value instanceof apache_arrow_1.MapRow) {
            const result = value.toJSON();
            // Map type consists of its key and value types. We need only value type here, key will be cast to string anyway
            const field = (_a = fieldsMap.entries) === null || _a === void 0 ? void 0 : _a.type.children.find((item) => item.name === 'value');
            for (const key of Object.keys(result)) {
                result[key] = this.convertArrowTypes(result[key], field === null || field === void 0 ? void 0 : field.type, (field === null || field === void 0 ? void 0 : field.type.children) || []);
            }
            return result;
        }
        // Convert lists to JS array and process items recursively
        if (value instanceof apache_arrow_1.Vector) {
            const result = value.toJSON();
            // Array type contains the only child which defines a type of each array's element
            const field = fieldsMap.element;
            return result.map((item) => this.convertArrowTypes(item, field === null || field === void 0 ? void 0 : field.type, (field === null || field === void 0 ? void 0 : field.type.children) || []));
        }
        if (apache_arrow_1.DataType.isTimestamp(valueType)) {
            return new Date(value);
        }
        // Convert big number values to BigInt
        // Decimals are also represented as big numbers in Arrow, so additionally process them (convert to float)
        if (value instanceof Object && value[isArrowBigNumSymbol]) {
            const result = bigNumToBigInt(value);
            if (apache_arrow_1.DataType.isDecimal(valueType)) {
                return Number(result) / Math.pow(10, valueType.scale);
            }
            return result;
        }
        // Convert binary data to Buffer
        if (value instanceof Uint8Array) {
            return buffer_1.Buffer.from(value);
        }
        // Return other values as is
        return typeof value === 'bigint' ? Number(value) : value;
    }
    convertThriftTypes(record) {
        const result = {};
        this.schema.forEach((column) => {
            var _a;
            const typeDescriptor = (_a = column.typeDesc.types[0]) === null || _a === void 0 ? void 0 : _a.primitiveEntry;
            const field = column.columnName;
            const value = record[field];
            result[field] = value === null ? null : (0, utils_1.convertThriftValue)(typeDescriptor, value);
        });
        return result;
    }
}
exports.default = ArrowResultConverter;
//# sourceMappingURL=ArrowResultConverter.js.map