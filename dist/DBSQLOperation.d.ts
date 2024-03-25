import IOperation, { FetchOptions, FinishedOptions, GetSchemaOptions } from './contracts/IOperation';
import { TGetOperationStatusResp, TOperationHandle, TTableSchema, TSparkDirectResults, TGetResultSetMetadataResp } from '../thrift/TCLIService_types';
import Status from './dto/Status';
import IClientContext from './contracts/IClientContext';
interface DBSQLOperationConstructorOptions {
    handle: TOperationHandle;
    directResults?: TSparkDirectResults;
    context: IClientContext;
}
export default class DBSQLOperation implements IOperation {
    private readonly context;
    private readonly operationHandle;
    onClose?: () => void;
    private readonly _data;
    private readonly closeOperation?;
    private closed;
    private cancelled;
    private metadata?;
    private state;
    private operationStatus?;
    private resultHandler?;
    constructor({ handle, directResults, context }: DBSQLOperationConstructorOptions);
    getId(): string;
    /**
     * Fetches all data
     * @public
     * @param options - maxRows property can be set to limit chunk size
     * @returns Array of data with length equal to option.maxRows
     * @throws {StatusError}
     * @example
     * const result = await queryOperation.fetchAll();
     */
    fetchAll(options?: FetchOptions): Promise<Array<object>>;
    /**
     * Fetches chunk of data
     * @public
     * @param options - maxRows property sets chunk size
     * @returns Array of data with length equal to option.maxRows
     * @throws {StatusError}
     * @example
     * const result = await queryOperation.fetchChunk({maxRows: 1000});
     */
    fetchChunk(options?: FetchOptions): Promise<Array<object>>;
    /**
     * Requests operation status
     * @param progress
     * @throws {StatusError}
     */
    status(progress?: boolean): Promise<TGetOperationStatusResp>;
    /**
     * Cancels operation
     * @throws {StatusError}
     */
    cancel(): Promise<Status>;
    /**
     * Closes operation
     * @throws {StatusError}
     */
    close(): Promise<Status>;
    finished(options?: FinishedOptions): Promise<void>;
    hasMoreRows(): Promise<boolean>;
    getSchema(options?: GetSchemaOptions): Promise<TTableSchema | null>;
    getMetadata(): Promise<TGetResultSetMetadataResp>;
    private failIfClosed;
    private waitUntilReady;
    private fetchMetadata;
    private getResultHandler;
    private processOperationStatusResponse;
}
export {};
