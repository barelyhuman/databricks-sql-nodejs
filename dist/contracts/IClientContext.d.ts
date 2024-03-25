import IDBSQLLogger from './IDBSQLLogger';
import IDriver from './IDriver';
import IConnectionProvider from '../connection/contracts/IConnectionProvider';
import TCLIService from '../../thrift/TCLIService';
export interface ClientConfig {
    arrowEnabled?: boolean;
    useArrowNativeTypes?: boolean;
    socketTimeout: number;
    retryMaxAttempts: number;
    retriesTimeout: number;
    retryDelayMin: number;
    retryDelayMax: number;
    useCloudFetch: boolean;
    cloudFetchConcurrentDownloads: number;
    useLZ4Compression: boolean;
}
export default interface IClientContext {
    getConfig(): ClientConfig;
    getLogger(): IDBSQLLogger;
    getConnectionProvider(): Promise<IConnectionProvider>;
    getClient(): Promise<TCLIService.Client>;
    getDriver(): Promise<IDriver>;
}
