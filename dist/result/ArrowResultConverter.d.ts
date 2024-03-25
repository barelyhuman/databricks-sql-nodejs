import { TGetResultSetMetadataResp } from '../../thrift/TCLIService_types';
import IClientContext from '../contracts/IClientContext';
import IResultsProvider, { ResultsProviderFetchNextOptions } from './IResultsProvider';
import { ArrowBatch } from './utils';
export default class ArrowResultConverter implements IResultsProvider<Array<any>> {
    protected readonly context: IClientContext;
    private readonly source;
    private readonly schema;
    private recordBatchReader?;
    private remainingRows;
    private prefetchedRecordBatch?;
    constructor(context: IClientContext, source: IResultsProvider<ArrowBatch>, { schema }: TGetResultSetMetadataResp);
    hasMore(): Promise<boolean>;
    fetchNext(options: ResultsProviderFetchNextOptions): Promise<any[]>;
    private prefetch;
    private getRows;
    private convertArrowTypes;
    private convertThriftTypes;
}
