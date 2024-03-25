import { HeadersInit } from 'node-fetch';
import IAuthentication from '../../contracts/IAuthentication';
import OAuthPersistence from './OAuthPersistence';
import { OAuthManagerOptions, OAuthFlow } from './OAuthManager';
import { OAuthScopes } from './OAuthScope';
export { OAuthFlow };
interface DatabricksOAuthOptions extends OAuthManagerOptions {
    scopes?: OAuthScopes;
    persistence?: OAuthPersistence;
    headers?: HeadersInit;
}
export default class DatabricksOAuth implements IAuthentication {
    private readonly context;
    private readonly options;
    private readonly manager;
    private readonly defaultPersistence;
    constructor(options: DatabricksOAuthOptions);
    authenticate(): Promise<HeadersInit>;
}
