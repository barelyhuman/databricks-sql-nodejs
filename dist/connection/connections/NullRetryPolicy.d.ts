import IRetryPolicy, { ShouldRetryResult, RetryableOperation } from '../contracts/IRetryPolicy';
export default class NullRetryPolicy<R> implements IRetryPolicy<R> {
    shouldRetry(details: R): Promise<ShouldRetryResult>;
    invokeWithRetry(operation: RetryableOperation<R>): Promise<R>;
}
