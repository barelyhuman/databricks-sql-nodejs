/// <reference types="node" />
import { TGetResultSetMetadataResp, TRowSet } from '../../thrift/TCLIService_types';
import IClientContext from '../contracts/IClientContext';
import IResultsProvider, { ResultsProviderFetchNextOptions } from './IResultsProvider';
import { ArrowBatch } from './utils';
export default class ArrowResultHandler implements IResultsProvider<ArrowBatch> {
    protected readonly context: IClientContext;
    private readonly source;
    private readonly arrowSchema?;
    private readonly isLZ4Compressed;
    constructor(context: IClientContext, source: IResultsProvider<TRowSet | undefined>, { schema, arrowSchema, lz4Compressed }: TGetResultSetMetadataResp);
    hasMore(): Promise<boolean>;
    fetchNext(options: ResultsProviderFetchNextOptions): Promise<{
        batches: Buffer[];
        rowCount: number;
    }>;
}
