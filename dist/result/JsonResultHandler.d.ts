import { TGetResultSetMetadataResp, TRowSet } from '../../thrift/TCLIService_types';
import IClientContext from '../contracts/IClientContext';
import IResultsProvider, { ResultsProviderFetchNextOptions } from './IResultsProvider';
export default class JsonResultHandler implements IResultsProvider<Array<any>> {
    private readonly context;
    private readonly source;
    private readonly schema;
    constructor(context: IClientContext, source: IResultsProvider<TRowSet | undefined>, { schema }: TGetResultSetMetadataResp);
    hasMore(): Promise<boolean>;
    fetchNext(options: ResultsProviderFetchNextOptions): Promise<any[]>;
    private getRows;
    private getSchemaValues;
    private isNull;
    private getColumnValue;
}
