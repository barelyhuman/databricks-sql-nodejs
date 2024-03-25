import { OAuthScopes } from './OAuthScope';
export default class OAuthToken {
    private readonly _accessToken;
    private readonly _refreshToken?;
    private readonly _scopes?;
    private _expirationTime?;
    constructor(accessToken: string, refreshToken?: string, scopes?: OAuthScopes);
    get accessToken(): string;
    get refreshToken(): string | undefined;
    get scopes(): OAuthScopes | undefined;
    get expirationTime(): number;
    get hasExpired(): boolean;
}
