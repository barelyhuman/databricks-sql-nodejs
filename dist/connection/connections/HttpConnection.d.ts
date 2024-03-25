/// <reference types="node" />
import http from 'http';
import { HeadersInit } from 'node-fetch';
import IConnectionProvider, { HttpTransactionDetails } from '../contracts/IConnectionProvider';
import IConnectionOptions from '../contracts/IConnectionOptions';
import IClientContext from '../../contracts/IClientContext';
import IRetryPolicy from '../contracts/IRetryPolicy';
export default class HttpConnection implements IConnectionProvider {
    private readonly options;
    private readonly context;
    private headers;
    private connection?;
    private agent?;
    constructor(options: IConnectionOptions, context: IClientContext);
    setHeaders(headers: HeadersInit): void;
    getAgent(): Promise<http.Agent>;
    private getAgentDefaultOptions;
    private createHttpAgent;
    private createHttpsAgent;
    private createProxyAgent;
    getThriftConnection(): Promise<any>;
    getRetryPolicy(): Promise<IRetryPolicy<HttpTransactionDetails>>;
}
