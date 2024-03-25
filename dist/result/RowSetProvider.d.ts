import { TFetchResultsResp, TOperationHandle, TRowSet } from '../../thrift/TCLIService_types';
import IClientContext from '../contracts/IClientContext';
import IResultsProvider, { ResultsProviderFetchNextOptions } from './IResultsProvider';
export default class RowSetProvider implements IResultsProvider<TRowSet | undefined> {
    private readonly context;
    private readonly operationHandle;
    private fetchOrientation;
    private prefetchedResults;
    private readonly returnOnlyPrefetchedResults;
    private hasMoreRowsFlag?;
    private get hasMoreRows();
    constructor(context: IClientContext, operationHandle: TOperationHandle, prefetchedResults: Array<TFetchResultsResp | undefined>, returnOnlyPrefetchedResults: boolean);
    private processFetchResponse;
    fetchNext({ limit }: ResultsProviderFetchNextOptions): Promise<TRowSet | undefined>;
    hasMore(): Promise<boolean>;
}
