import OAuthToken from './OAuthToken';
export default interface OAuthPersistence {
    persist(host: string, token: OAuthToken): Promise<void>;
    read(host: string): Promise<OAuthToken | undefined>;
}
export declare class OAuthPersistenceCache implements OAuthPersistence {
    private tokens;
    persist(host: string, token: OAuthToken): Promise<void>;
    read(host: string): Promise<OAuthToken | undefined>;
}
