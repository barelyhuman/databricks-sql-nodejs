"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InfoValue {
    constructor(value) {
        this.value = value;
    }
    getValue() {
        const infoValue = this.value;
        if (infoValue.stringValue) {
            return infoValue.stringValue;
        }
        if (infoValue.smallIntValue) {
            return infoValue.smallIntValue;
        }
        if (infoValue.integerBitmask) {
            return infoValue.integerBitmask;
        }
        if (infoValue.integerFlag) {
            return infoValue.integerFlag;
        }
        if (infoValue.lenValue) {
            return infoValue.lenValue;
        }
        return null;
    }
}
exports.default = InfoValue;
//# sourceMappingURL=InfoValue.js.map