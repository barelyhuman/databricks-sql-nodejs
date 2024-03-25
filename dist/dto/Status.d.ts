import { TStatus } from '../../thrift/TCLIService_types';
export default class Status {
    private readonly status;
    constructor(status: TStatus);
    get isSuccess(): boolean;
    get isExecuting(): boolean;
    get isError(): boolean;
    get info(): Array<string>;
    static assert(status: TStatus): void;
    static success(info?: Array<string>): Status;
}
