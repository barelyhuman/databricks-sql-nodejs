import HiveDriverError from './HiveDriverError';
import { TGetOperationStatusResp } from '../../thrift/TCLIService_types';
export declare enum OperationStateErrorCode {
    Canceled = "CANCELED",
    Closed = "CLOSED",
    Error = "ERROR",
    Timeout = "TIMEOUT",
    Unknown = "UNKNOWN"
}
export default class OperationStateError extends HiveDriverError {
    errorCode: OperationStateErrorCode;
    response?: TGetOperationStatusResp;
    constructor(errorCode: OperationStateErrorCode, response?: TGetOperationStatusResp);
}
