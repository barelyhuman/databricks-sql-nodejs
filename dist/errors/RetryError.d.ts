export declare enum RetryErrorCode {
    AttemptsExceeded = "ATTEMPTS_EXCEEDED",
    TimeoutExceeded = "TIMEOUT_EXCEEDED"
}
export default class RetryError extends Error {
    readonly errorCode: RetryErrorCode;
    readonly payload: unknown;
    constructor(errorCode: RetryErrorCode, payload?: unknown);
}
