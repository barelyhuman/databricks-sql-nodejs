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
class PlainHttpAuthentication {
    constructor(options) {
        var _a;
        this.context = options.context;
        this.username = (options === null || options === void 0 ? void 0 : options.username) || 'anonymous';
        this.password = (_a = options === null || options === void 0 ? void 0 : options.password) !== null && _a !== void 0 ? _a : 'anonymous';
        this.headers = (options === null || options === void 0 ? void 0 : options.headers) || {};
    }
    authenticate() {
        return __awaiter(this, void 0, void 0, function* () {
            return Object.assign(Object.assign({}, this.headers), { Authorization: `Bearer ${this.password}` });
        });
    }
}
exports.default = PlainHttpAuthentication;
//# sourceMappingURL=PlainHttpAuthentication.js.map