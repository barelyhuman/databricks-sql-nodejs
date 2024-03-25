import { TStatus } from '../../thrift/TCLIService_types';
export default class StatusError implements Error {
    name: string;
    message: string;
    code: number;
    stack?: string;
    constructor(status: TStatus);
}
