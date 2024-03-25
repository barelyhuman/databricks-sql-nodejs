export declare enum OAuthScope {
    offlineAccess = "offline_access",
    SQL = "sql",
    allAPIs = "all-apis"
}
export type OAuthScopes = Array<string>;
export declare const defaultOAuthScopes: OAuthScopes;
export declare const scopeDelimiter = " ";
