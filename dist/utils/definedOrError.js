"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function definedOrError(value) {
    if (value === undefined) {
        throw new TypeError('Value is undefined');
    }
    return value;
}
exports.default = definedOrError;
//# sourceMappingURL=definedOrError.js.map