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
class CloseableCollection {
    constructor() {
        this.items = new Set();
    }
    add(item) {
        item.onClose = () => {
            this.delete(item);
        };
        this.items.add(item);
    }
    delete(item) {
        if (this.items.has(item)) {
            item.onClose = undefined;
        }
        this.items.delete(item);
    }
    closeAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const items = [...this.items];
            for (const item of items) {
                yield item.close(); // eslint-disable-line no-await-in-loop
                item.onClose = undefined;
                this.items.delete(item);
            }
        });
    }
}
exports.default = CloseableCollection;
//# sourceMappingURL=CloseableCollection.js.map