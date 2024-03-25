/// <reference types="node" />
import { EventEmitter } from 'events';
import TCLIService from '../thrift/TCLIService';
import IDBSQLClient, { ClientOptions, ConnectionOptions, OpenSessionRequest } from './contracts/IDBSQLClient';
import IDriver from './contracts/IDriver';
import IClientContext, { ClientConfig } from './contracts/IClientContext';
import IDBSQLSession from './contracts/IDBSQLSession';
import IAuthentication from './connection/contracts/IAuthentication';
import IDBSQLLogger from './contracts/IDBSQLLogger';
import IConnectionProvider from './connection/contracts/IConnectionProvider';
export default class DBSQLClient extends EventEmitter implements IDBSQLClient, IClientContext {
    private static defaultLogger?;
    private readonly config;
    private connectionProvider?;
    private authProvider?;
    private client?;
    private readonly driver;
    private readonly logger;
    private readonly thrift;
    private sessions;
    private static getDefaultLogger;
    private static getDefaultConfig;
    constructor(options?: ClientOptions);
    private getConnectionOptions;
    private initAuthProvider;
    /**
     * Connects DBSQLClient to endpoint
     * @public
     * @param options - host, path, and token are required
     * @param authProvider - [DEPRECATED - use `authType: 'custom'] Optional custom authentication provider
     * @returns Session object that can be used to execute statements
     * @example
     * const session = client.connect({host, path, token});
     */
    connect(options: ConnectionOptions, authProvider?: IAuthentication): Promise<IDBSQLClient>;
    /**
     * Starts new session
     * @public
     * @param request - Can be instantiated with initialSchema, empty by default
     * @returns Session object that can be used to execute statements
     * @throws {StatusError}
     * @example
     * const session = await client.openSession();
     */
    openSession(request?: OpenSessionRequest): Promise<IDBSQLSession>;
    close(): Promise<void>;
    getConfig(): ClientConfig;
    getLogger(): IDBSQLLogger;
    getConnectionProvider(): Promise<IConnectionProvider>;
    getClient(): Promise<TCLIService.Client>;
    getDriver(): Promise<IDriver>;
}
