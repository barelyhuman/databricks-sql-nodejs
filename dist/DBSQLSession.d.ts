import { TSessionHandle } from '../thrift/TCLIService_types';
import IDBSQLSession, { ExecuteStatementOptions, TypeInfoRequest, CatalogsRequest, SchemasRequest, TablesRequest, TableTypesRequest, ColumnsRequest, FunctionsRequest, PrimaryKeysRequest, CrossReferenceRequest } from './contracts/IDBSQLSession';
import IOperation from './contracts/IOperation';
import Status from './dto/Status';
import InfoValue from './dto/InfoValue';
import IClientContext from './contracts/IClientContext';
interface DBSQLSessionConstructorOptions {
    handle: TSessionHandle;
    context: IClientContext;
}
export default class DBSQLSession implements IDBSQLSession {
    private readonly context;
    private readonly sessionHandle;
    private isOpen;
    onClose?: () => void;
    private operations;
    constructor({ handle, context }: DBSQLSessionConstructorOptions);
    getId(): string;
    /**
     * Fetches info
     * @public
     * @param infoType - One of the values TCLIService_types.TGetInfoType
     * @returns Value corresponding to info type requested
     * @example
     * const response = await session.getInfo(thrift.TCLIService_types.TGetInfoType.CLI_DBMS_VER);
     */
    getInfo(infoType: number): Promise<InfoValue>;
    /**
     * Executes statement
     * @public
     * @param statement - SQL statement to be executed
     * @param options - maxRows field is used to specify Direct Results
     * @returns DBSQLOperation
     * @example
     * const operation = await session.executeStatement(query);
     */
    executeStatement(statement: string, options?: ExecuteStatementOptions): Promise<IOperation>;
    private handleStagingOperation;
    private handleStagingGet;
    private handleStagingRemove;
    private handleStagingPut;
    /**
     * Information about supported data types
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getTypeInfo(request?: TypeInfoRequest): Promise<IOperation>;
    /**
     * Get list of catalogs
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getCatalogs(request?: CatalogsRequest): Promise<IOperation>;
    /**
     * Get list of schemas
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getSchemas(request?: SchemasRequest): Promise<IOperation>;
    /**
     * Get list of tables
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getTables(request?: TablesRequest): Promise<IOperation>;
    /**
     * Get list of supported table types
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getTableTypes(request?: TableTypesRequest): Promise<IOperation>;
    /**
     * Get full information about columns of the table
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getColumns(request?: ColumnsRequest): Promise<IOperation>;
    /**
     * Get information about function
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getFunctions(request: FunctionsRequest): Promise<IOperation>;
    getPrimaryKeys(request: PrimaryKeysRequest): Promise<IOperation>;
    /**
     * Request information about foreign keys between two tables
     * @public
     * @param request
     * @returns DBSQLOperation
     */
    getCrossReference(request: CrossReferenceRequest): Promise<IOperation>;
    /**
     * Closes the session
     * @public
     * @returns Operation status
     */
    close(): Promise<Status>;
    private createOperation;
    private failIfClosed;
    private handleResponse;
}
export {};
