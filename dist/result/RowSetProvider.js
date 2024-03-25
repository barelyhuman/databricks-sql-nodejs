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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TCLIService_types_1 = require("../../thrift/TCLIService_types");
const Types_1 = require("../hive/Types");
const Status_1 = __importDefault(require("../dto/Status"));
function checkIfOperationHasMoreRows(response) {
    var _a, _b;
    if (response.hasMoreRows) {
        return true;
    }
    const columns = ((_a = response.results) === null || _a === void 0 ? void 0 : _a.columns) || [];
    if (columns.length === 0) {
        return false;
    }
    const column = columns[0];
    const columnValue = column[Types_1.ColumnCode.binaryVal] ||
        column[Types_1.ColumnCode.boolVal] ||
        column[Types_1.ColumnCode.byteVal] ||
        column[Types_1.ColumnCode.doubleVal] ||
        column[Types_1.ColumnCode.i16Val] ||
        column[Types_1.ColumnCode.i32Val] ||
        column[Types_1.ColumnCode.i64Val] ||
        column[Types_1.ColumnCode.stringVal];
    return (((_b = columnValue === null || columnValue === void 0 ? void 0 : columnValue.values) === null || _b === void 0 ? void 0 : _b.length) || 0) > 0;
}
class RowSetProvider {
    get hasMoreRows() {
        var _a;
        // `hasMoreRowsFlag` is populated only after fetching the first row set.
        // Prior to that, we use a `operationHandle.hasResultSet` flag which
        // is set if there are any data at all. Also, we have to choose appropriate
        // flag in a getter because both `hasMoreRowsFlag` and `operationHandle.hasResultSet`
        // may change between this getter calls
        return (_a = this.hasMoreRowsFlag) !== null && _a !== void 0 ? _a : this.operationHandle.hasResultSet;
    }
    constructor(context, operationHandle, prefetchedResults, returnOnlyPrefetchedResults) {
        this.fetchOrientation = TCLIService_types_1.TFetchOrientation.FETCH_FIRST;
        this.prefetchedResults = [];
        this.hasMoreRowsFlag = undefined;
        this.context = context;
        this.operationHandle = operationHandle;
        prefetchedResults.forEach((item) => {
            if (item) {
                this.prefetchedResults.push(item);
            }
        });
        this.returnOnlyPrefetchedResults = returnOnlyPrefetchedResults;
    }
    processFetchResponse(response) {
        Status_1.default.assert(response.status);
        this.fetchOrientation = TCLIService_types_1.TFetchOrientation.FETCH_NEXT;
        this.hasMoreRowsFlag = checkIfOperationHasMoreRows(response);
        return response.results;
    }
    fetchNext({ limit }) {
        return __awaiter(this, void 0, void 0, function* () {
            const prefetchedResponse = this.prefetchedResults.shift();
            if (prefetchedResponse) {
                return this.processFetchResponse(prefetchedResponse);
            }
            // We end up here if no more prefetched results available (checked above)
            if (this.returnOnlyPrefetchedResults) {
                return undefined;
            }
            // Don't fetch next chunk if there are no more data available
            if (!this.hasMoreRows) {
                return undefined;
            }
            const driver = yield this.context.getDriver();
            const response = yield driver.fetchResults({
                operationHandle: this.operationHandle,
                orientation: this.fetchOrientation,
                maxRows: new Types_1.Int64(limit),
                fetchType: Types_1.FetchType.Data,
            });
            return this.processFetchResponse(response);
        });
    }
    hasMore() {
        return __awaiter(this, void 0, void 0, function* () {
            // If there are prefetched results available - return `true` regardless of
            // the actual state of `hasMoreRows` flag (because we actually have some data)
            if (this.prefetchedResults.length > 0) {
                return true;
            }
            // We end up here if no more prefetched results available (checked above)
            if (this.returnOnlyPrefetchedResults) {
                return false;
            }
            return this.hasMoreRows;
        });
    }
}
exports.default = RowSetProvider;
//# sourceMappingURL=RowSetProvider.js.map