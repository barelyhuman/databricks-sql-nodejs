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
const OpenSessionCommand_1 = __importDefault(require("./Commands/OpenSessionCommand"));
const CloseSessionCommand_1 = __importDefault(require("./Commands/CloseSessionCommand"));
const ExecuteStatementCommand_1 = __importDefault(require("./Commands/ExecuteStatementCommand"));
const GetResultSetMetadataCommand_1 = __importDefault(require("./Commands/GetResultSetMetadataCommand"));
const FetchResultsCommand_1 = __importDefault(require("./Commands/FetchResultsCommand"));
const GetInfoCommand_1 = __importDefault(require("./Commands/GetInfoCommand"));
const GetTypeInfoCommand_1 = __importDefault(require("./Commands/GetTypeInfoCommand"));
const GetCatalogsCommand_1 = __importDefault(require("./Commands/GetCatalogsCommand"));
const GetSchemasCommand_1 = __importDefault(require("./Commands/GetSchemasCommand"));
const GetTablesCommand_1 = __importDefault(require("./Commands/GetTablesCommand"));
const GetTableTypesCommand_1 = __importDefault(require("./Commands/GetTableTypesCommand"));
const GetColumnsCommand_1 = __importDefault(require("./Commands/GetColumnsCommand"));
const GetFunctionsCommand_1 = __importDefault(require("./Commands/GetFunctionsCommand"));
const GetPrimaryKeysCommand_1 = __importDefault(require("./Commands/GetPrimaryKeysCommand"));
const GetCrossReferenceCommand_1 = __importDefault(require("./Commands/GetCrossReferenceCommand"));
const GetOperationStatusCommand_1 = __importDefault(require("./Commands/GetOperationStatusCommand"));
const CancelOperationCommand_1 = __importDefault(require("./Commands/CancelOperationCommand"));
const CloseOperationCommand_1 = __importDefault(require("./Commands/CloseOperationCommand"));
const GetDelegationTokenCommand_1 = __importDefault(require("./Commands/GetDelegationTokenCommand"));
const CancelDelegationTokenCommand_1 = __importDefault(require("./Commands/CancelDelegationTokenCommand"));
const RenewDelegationTokenCommand_1 = __importDefault(require("./Commands/RenewDelegationTokenCommand"));
class HiveDriver {
    constructor(options) {
        this.context = options.context;
    }
    openSession(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const action = new OpenSessionCommand_1.default(client, this.context);
            return action.execute(request);
        });
    }
    closeSession(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new CloseSessionCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    executeStatement(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new ExecuteStatementCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    getResultSetMetadata(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new GetResultSetMetadataCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    fetchResults(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new FetchResultsCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    getInfo(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new GetInfoCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    getTypeInfo(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new GetTypeInfoCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    getCatalogs(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new GetCatalogsCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    getSchemas(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new GetSchemasCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    getTables(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new GetTablesCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    getTableTypes(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new GetTableTypesCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    getColumns(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new GetColumnsCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    getFunctions(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new GetFunctionsCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    getPrimaryKeys(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new GetPrimaryKeysCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    getCrossReference(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new GetCrossReferenceCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    getOperationStatus(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new GetOperationStatusCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    cancelOperation(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new CancelOperationCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    closeOperation(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new CloseOperationCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    getDelegationToken(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new GetDelegationTokenCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    cancelDelegationToken(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new CancelDelegationTokenCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
    renewDelegationToken(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.context.getClient();
            const command = new RenewDelegationTokenCommand_1.default(client, this.context);
            return command.execute(request);
        });
    }
}
exports.default = HiveDriver;
//# sourceMappingURL=HiveDriver.js.map