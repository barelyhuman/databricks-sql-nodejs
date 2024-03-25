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
const winston_1 = __importDefault(require("winston"));
const IDBSQLLogger_1 = require("./contracts/IDBSQLLogger");
class DBSQLLogger {
    constructor({ level = IDBSQLLogger_1.LogLevel.info, filepath } = {}) {
        this.transports = {
            console: new winston_1.default.transports.Console({ handleExceptions: true, level }),
        };
        this.logger = winston_1.default.createLogger({
            transports: [this.transports.console],
        });
        if (filepath) {
            this.transports.file = new winston_1.default.transports.File({ filename: filepath, handleExceptions: true, level });
            this.logger.add(this.transports.file);
        }
    }
    log(level, message) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log({ level, message });
        });
    }
    setLevel(level) {
        this.transports.console.level = level;
        if (this.transports.file) {
            this.transports.file.level = level;
        }
    }
}
exports.default = DBSQLLogger;
//# sourceMappingURL=DBSQLLogger.js.map