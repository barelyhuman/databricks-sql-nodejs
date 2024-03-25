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
const lz4_1 = __importDefault(require("lz4"));
const utils_1 = require("./utils");
class ArrowResultHandler {
    constructor(context, source, { schema, arrowSchema, lz4Compressed }) {
        this.context = context;
        this.source = source;
        // Arrow schema is not available in old DBR versions, which also don't support native Arrow types,
        // so it's possible to infer Arrow schema from Hive schema ignoring `useArrowNativeTypes` option
        this.arrowSchema = arrowSchema !== null && arrowSchema !== void 0 ? arrowSchema : (0, utils_1.hiveSchemaToArrowSchema)(schema);
        this.isLZ4Compressed = lz4Compressed !== null && lz4Compressed !== void 0 ? lz4Compressed : false;
    }
    hasMore() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.arrowSchema) {
                return false;
            }
            return this.source.hasMore();
        });
    }
    fetchNext(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.arrowSchema) {
                return {
                    batches: [],
                    rowCount: 0,
                };
            }
            const rowSet = yield this.source.fetchNext(options);
            const batches = [];
            let totalRowCount = 0;
            (_a = rowSet === null || rowSet === void 0 ? void 0 : rowSet.arrowBatches) === null || _a === void 0 ? void 0 : _a.forEach(({ batch, rowCount }) => {
                if (batch) {
                    batches.push(this.isLZ4Compressed ? lz4_1.default.decode(batch) : batch);
                    totalRowCount += rowCount.toNumber(true);
                }
            });
            if (batches.length === 0) {
                return {
                    batches: [],
                    rowCount: 0,
                };
            }
            return {
                batches: [this.arrowSchema, ...batches],
                rowCount: totalRowCount,
            };
        });
    }
}
exports.default = ArrowResultHandler;
//# sourceMappingURL=ArrowResultHandler.js.map