import { TGetResultSetMetadataResp, TRowSet } from '../../thrift/TCLIService_types';
import IClientContext from '../contracts/IClientContext';
import IResultsProvider, { ResultsProviderFetchNextOptions } from './IResultsProvider';
import { ArrowBatch } from './utils';
export default class CloudFetchResultHandler implements IResultsProvider<ArrowBatch> {
    protected readonly context: IClientContext;
    private readonly source;
    private readonly isLZ4Compressed;
    private pendingLinks;
    private downloadTasks;
    constructor(context: IClientContext, source: IResultsProvider<TRowSet | undefined>, { lz4Compressed }: TGetResultSetMetadataResp);
    hasMore(): Promise<boolean>;
    fetchNext(options: ResultsProviderFetchNextOptions): Promise<ArrowBatch>;
    private downloadLink;
    private fetch;
}
