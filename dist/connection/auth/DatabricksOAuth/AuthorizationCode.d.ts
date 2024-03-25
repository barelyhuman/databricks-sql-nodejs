import { BaseClient } from 'openid-client';
import { OAuthScopes } from './OAuthScope';
import IClientContext from '../../../contracts/IClientContext';
export interface AuthorizationCodeOptions {
    client: BaseClient;
    ports: Array<number>;
    context: IClientContext;
}
export interface AuthorizationCodeFetchResult {
    code: string;
    verifier: string;
    redirectUri: string;
}
export default class AuthorizationCode {
    private readonly context;
    private readonly client;
    private readonly host;
    private readonly ports;
    constructor(options: AuthorizationCodeOptions);
    private openUrl;
    fetch(scopes: OAuthScopes): Promise<AuthorizationCodeFetchResult>;
    private startServer;
    private renderCallbackResponse;
}
