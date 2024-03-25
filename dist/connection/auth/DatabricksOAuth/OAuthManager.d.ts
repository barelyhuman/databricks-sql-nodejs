/// <reference types="node" />
import http from 'http';
import { Issuer, BaseClient } from 'openid-client';
import OAuthToken from './OAuthToken';
import { OAuthScopes } from './OAuthScope';
import IClientContext from '../../../contracts/IClientContext';
export declare enum OAuthFlow {
    U2M = "U2M",
    M2M = "M2M"
}
export interface OAuthManagerOptions {
    flow: OAuthFlow;
    host: string;
    callbackPorts?: Array<number>;
    clientId?: string;
    azureTenantId?: string;
    clientSecret?: string;
    useDatabricksOAuthInAzure?: boolean;
    context: IClientContext;
}
export default abstract class OAuthManager {
    protected readonly context: IClientContext;
    protected readonly options: OAuthManagerOptions;
    protected agent?: http.Agent;
    protected issuer?: Issuer;
    protected client?: BaseClient;
    constructor(options: OAuthManagerOptions);
    protected abstract getOIDCConfigUrl(): string;
    protected abstract getAuthorizationUrl(): string;
    protected abstract getClientId(): string;
    protected abstract getCallbackPorts(): Array<number>;
    protected abstract getScopes(requestedScopes: OAuthScopes): OAuthScopes;
    protected getClient(): Promise<BaseClient>;
    private refreshAccessTokenU2M;
    private refreshAccessTokenM2M;
    refreshAccessToken(token: OAuthToken): Promise<OAuthToken>;
    private getTokenU2M;
    private getTokenM2M;
    getToken(scopes: OAuthScopes): Promise<OAuthToken>;
    static getManager(options: OAuthManagerOptions): OAuthManager;
}
export declare class DatabricksOAuthManager extends OAuthManager {
    static defaultClientId: string;
    static defaultCallbackPorts: number[];
    protected getOIDCConfigUrl(): string;
    protected getAuthorizationUrl(): string;
    protected getClientId(): string;
    protected getCallbackPorts(): Array<number>;
    protected getScopes(requestedScopes: OAuthScopes): OAuthScopes;
}
export declare class AzureOAuthManager extends OAuthManager {
    static defaultClientId: string;
    static defaultCallbackPorts: number[];
    static datatricksAzureApp: string;
    protected getOIDCConfigUrl(): string;
    protected getAuthorizationUrl(): string;
    protected getClientId(): string;
    protected getCallbackPorts(): Array<number>;
    protected getScopes(requestedScopes: OAuthScopes): OAuthScopes;
}
