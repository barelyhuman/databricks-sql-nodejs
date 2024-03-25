/**
  This file is created using node_modules/thrift/lib/nodejs/lib/thrift/http_connection.js as an example

  The code relies on thrift internals, so be careful when upgrading `thrift` library
*/
/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import { TBufferedTransport, Thrift, TProtocol, TProtocolConstructor } from 'thrift';
import { RequestInit, HeadersInit, Response } from 'node-fetch';
import IRetryPolicy from '../contracts/IRetryPolicy';
import { HttpTransactionDetails } from '../contracts/IConnectionProvider';
export declare class THTTPException extends Thrift.TApplicationException {
    readonly statusCode: unknown;
    readonly response: Response;
    constructor(response: Response);
}
type TTransportType = typeof TBufferedTransport;
interface ThriftHttpConnectionOptions {
    url: string;
    transport?: TTransportType;
    protocol?: TProtocolConstructor;
    getRetryPolicy(): Promise<IRetryPolicy<HttpTransactionDetails>>;
}
type ThriftClient = {
    _reqs: Record<number, (error: unknown, response?: unknown) => void>;
} & {
    [key: string]: (input: TProtocol, mtype: Thrift.MessageType, seqId: number) => void;
};
export default class ThriftHttpConnection extends EventEmitter {
    private readonly url;
    private config;
    private options;
    private readonly transport;
    private readonly protocol;
    client?: ThriftClient;
    constructor(options: ThriftHttpConnectionOptions, config?: RequestInit);
    protected getRetryPolicy(thriftMethodName?: string): Promise<IRetryPolicy<HttpTransactionDetails>>;
    setHeaders(headers: HeadersInit): void;
    write(data: Buffer, seqId: number): void;
    private getThriftMethodName;
    private handleThriftResponse;
}
export {};
