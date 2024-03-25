import IRetryPolicy, { ShouldRetryResult, RetryableOperation } from '../contracts/IRetryPolicy';
import { HttpTransactionDetails } from '../contracts/IConnectionProvider';
import IClientContext from '../../contracts/IClientContext';
export default class HttpRetryPolicy implements IRetryPolicy<HttpTransactionDetails> {
    private context;
    private readonly startTime;
    private attempt;
    constructor(context: IClientContext);
    shouldRetry(details: HttpTransactionDetails): Promise<ShouldRetryResult>;
    invokeWithRetry(operation: RetryableOperation<HttpTransactionDetails>): Promise<HttpTransactionDetails>;
    protected isRetryable({ response }: HttpTransactionDetails): boolean;
    protected getRetryAfterHeader({ response }: HttpTransactionDetails, delayMin: number): number | undefined;
    protected getBackoffDelay(attempt: number, delayMin: number, delayMax: number): number;
}
