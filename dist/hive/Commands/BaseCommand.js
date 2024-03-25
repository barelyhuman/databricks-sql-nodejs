"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const node_fetch_1 = require("node-fetch");
const HiveDriverError_1 = __importDefault(require("../../errors/HiveDriverError"));
const RetryError_1 = __importStar(require("../../errors/RetryError"));
class BaseCommand {
    constructor(client, context) {
        this.client = client;
        this.context = context;
    }
    executeCommand(request, command) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.invokeCommand(request, command);
            }
            catch (error) {
                if (error instanceof RetryError_1.default) {
                    let statusCode;
                    if (error.payload &&
                        typeof error.payload === 'object' &&
                        'response' in error.payload &&
                        error.payload.response instanceof node_fetch_1.Response) {
                        statusCode = error.payload.response.status;
                    }
                    switch (error.errorCode) {
                        case RetryError_1.RetryErrorCode.AttemptsExceeded:
                            throw new HiveDriverError_1.default(`Hive driver: ${statusCode !== null && statusCode !== void 0 ? statusCode : 'Error'} when connecting to resource. Max retry count exceeded.`);
                        case RetryError_1.RetryErrorCode.TimeoutExceeded:
                            throw new HiveDriverError_1.default(`Hive driver: ${statusCode !== null && statusCode !== void 0 ? statusCode : 'Error'} when connecting to resource. Retry timeout exceeded.`);
                        // no default
                    }
                }
                // Re-throw error we didn't handle
                throw error;
            }
        });
    }
    invokeCommand(request, command) {
        if (typeof command !== 'function') {
            return Promise.reject(new HiveDriverError_1.default('Hive driver: the operation does not exist, try to choose another Thrift file.'));
        }
        return new Promise((resolve, reject) => {
            try {
                command.call(this.client, request, (err, response) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(response);
                    }
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.default = BaseCommand;
//# sourceMappingURL=BaseCommand.js.map