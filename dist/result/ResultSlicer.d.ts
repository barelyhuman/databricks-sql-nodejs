import IClientContext from '../contracts/IClientContext';
import IResultsProvider, { ResultsProviderFetchNextOptions } from './IResultsProvider';
export interface ResultSlicerFetchNextOptions extends ResultsProviderFetchNextOptions {
    disableBuffering?: boolean;
}
export default class ResultSlicer<T> implements IResultsProvider<Array<T>> {
    private readonly context;
    private readonly source;
    private remainingResults;
    constructor(context: IClientContext, source: IResultsProvider<Array<T>>);
    hasMore(): Promise<boolean>;
    fetchNext(options: ResultSlicerFetchNextOptions): Promise<Array<T>>;
}
