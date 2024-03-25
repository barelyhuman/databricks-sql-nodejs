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
class ResultSlicer {
    constructor(context, source) {
        this.remainingResults = [];
        this.context = context;
        this.source = source;
    }
    hasMore() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.remainingResults.length > 0) {
                return true;
            }
            return this.source.hasMore();
        });
    }
    fetchNext(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // If we're asked to not use buffer - first try to return whatever we have in buffer.
            // If buffer is empty - just proxy the call to underlying results provider
            if (options.disableBuffering) {
                if (this.remainingResults.length > 0) {
                    const result = this.remainingResults;
                    this.remainingResults = [];
                    return result;
                }
                return this.source.fetchNext(options);
            }
            const result = [];
            let resultsCount = 0;
            // First, use remaining items from the previous fetch
            if (this.remainingResults.length > 0) {
                result.push(this.remainingResults);
                resultsCount += this.remainingResults.length;
                this.remainingResults = [];
            }
            // Fetch items from source results provider until we reach a requested count
            while (resultsCount < options.limit) {
                // eslint-disable-next-line no-await-in-loop
                const hasMore = yield this.source.hasMore();
                if (!hasMore) {
                    break;
                }
                // eslint-disable-next-line no-await-in-loop
                const chunk = yield this.source.fetchNext(options);
                result.push(chunk);
                resultsCount += chunk.length;
            }
            // If we collected more results than requested, slice the excess items and store them for the next time
            if (resultsCount > options.limit) {
                const lastChunk = (_a = result.pop()) !== null && _a !== void 0 ? _a : [];
                const neededCount = options.limit - (resultsCount - lastChunk.length);
                result.push(lastChunk.splice(0, neededCount));
                this.remainingResults = lastChunk;
            }
            return result.flat();
        });
    }
}
exports.default = ResultSlicer;
//# sourceMappingURL=ResultSlicer.js.map