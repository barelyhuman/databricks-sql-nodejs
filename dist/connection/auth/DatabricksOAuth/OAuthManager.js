"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureOAuthManager = exports.DatabricksOAuthManager = exports.OAuthFlow = void 0;
const openid_client_1 = require("openid-client");
const HiveDriverError_1 = __importDefault(require("../../../errors/HiveDriverError"));
const IDBSQLLogger_1 = require("../../../contracts/IDBSQLLogger");
const OAuthToken_1 = __importDefault(require("./OAuthToken"));
const AuthorizationCode_1 = __importDefault(require("./AuthorizationCode"));
const OAuthScope_1 = require("./OAuthScope");
var OAuthFlow;
(function (OAuthFlow) {
    OAuthFlow["U2M"] = "U2M";
    OAuthFlow["M2M"] = "M2M";
})(OAuthFlow = exports.OAuthFlow || (exports.OAuthFlow = {}));
function getDatabricksOIDCUrl(host) {
    const schema = host.startsWith('https://') ? '' : 'https://';
    const trailingSlash = host.endsWith('/') ? '' : '/';
    return `${schema}${host}${trailingSlash}oidc`;
}
class OAuthManager {
    constructor(options) {
        this.options = options;
        this.context = options.context;
    }
    getClient() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Obtain http agent each time when we need an OAuth client
            // to ensure that we always use a valid agent instance
            const connectionProvider = yield this.context.getConnectionProvider();
            this.agent = yield connectionProvider.getAgent();
            const getHttpOptions = () => ({
                agent: this.agent,
            });
            if (!this.issuer) {
                // To use custom http agent in Issuer.discover(), we'd have to set Issuer[custom.http_options].
                // However, that's a static field, and if multiple instances of OAuthManager used, race condition
                // may occur when they simultaneously override that field and then try to use Issuer.discover().
                // Therefore we create a local class derived from Issuer, and set that field for it, thus making
                // sure that it will not interfere with other instances (or other code that may use Issuer)
                class CustomIssuer extends openid_client_1.Issuer {
                }
                _a = openid_client_1.custom.http_options;
                CustomIssuer[_a] = getHttpOptions;
                const issuer = yield CustomIssuer.discover(this.getOIDCConfigUrl());
                // Overwrite `authorization_endpoint` in default config (specifically needed for Azure flow
                // where this URL has to be different)
                this.issuer = new openid_client_1.Issuer(Object.assign(Object.assign({}, issuer.metadata), { authorization_endpoint: this.getAuthorizationUrl() }));
                this.issuer[openid_client_1.custom.http_options] = getHttpOptions;
            }
            if (!this.client) {
                this.client = new this.issuer.Client({
                    client_id: this.getClientId(),
                    client_secret: this.options.clientSecret,
                    token_endpoint_auth_method: this.options.clientSecret === undefined ? 'none' : 'client_secret_basic',
                });
                this.client[openid_client_1.custom.http_options] = getHttpOptions;
            }
            return this.client;
        });
    }
    refreshAccessTokenU2M(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token.refreshToken) {
                const message = `OAuth access token expired on ${token.expirationTime}.`;
                this.context.getLogger().log(IDBSQLLogger_1.LogLevel.error, message);
                throw new HiveDriverError_1.default(message);
            }
            // Try to refresh using the refresh token
            this.context
                .getLogger()
                .log(IDBSQLLogger_1.LogLevel.debug, `Attempting to refresh OAuth access token that expired on ${token.expirationTime}`);
            const client = yield this.getClient();
            const { access_token: accessToken, refresh_token: refreshToken } = yield client.refresh(token.refreshToken);
            if (!accessToken || !refreshToken) {
                throw new Error('Failed to refresh token: invalid response');
            }
            return new OAuthToken_1.default(accessToken, refreshToken, token.scopes);
        });
    }
    refreshAccessTokenM2M(token) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return this.getTokenM2M((_a = token.scopes) !== null && _a !== void 0 ? _a : []);
        });
    }
    refreshAccessToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!token.hasExpired) {
                    // The access token is fine. Just return it.
                    return token;
                }
            }
            catch (error) {
                this.context.getLogger().log(IDBSQLLogger_1.LogLevel.error, `${error}`);
                throw error;
            }
            switch (this.options.flow) {
                case OAuthFlow.U2M:
                    return this.refreshAccessTokenU2M(token);
                case OAuthFlow.M2M:
                    return this.refreshAccessTokenM2M(token);
                // no default
            }
        });
    }
    getTokenU2M(scopes) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.getClient();
            const authCode = new AuthorizationCode_1.default({
                client,
                ports: this.getCallbackPorts(),
                context: this.context,
            });
            const mappedScopes = this.getScopes(scopes);
            const { code, verifier, redirectUri } = yield authCode.fetch(mappedScopes);
            const { access_token: accessToken, refresh_token: refreshToken } = yield client.grant({
                grant_type: 'authorization_code',
                code,
                code_verifier: verifier,
                redirect_uri: redirectUri,
            });
            if (!accessToken) {
                throw new Error('Failed to fetch access token');
            }
            return new OAuthToken_1.default(accessToken, refreshToken, mappedScopes);
        });
    }
    getTokenM2M(scopes) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.getClient();
            const mappedScopes = this.getScopes(scopes);
            // M2M flow doesn't really support token refreshing, and refresh should not be available
            // in response. Each time access token expires, client can just acquire a new one using
            // client secret. Here we explicitly return access token only as a sign that we're not going
            // to use refresh token for M2M flow anywhere later
            const { access_token: accessToken } = yield client.grant({
                grant_type: 'client_credentials',
                scope: mappedScopes.join(OAuthScope_1.scopeDelimiter),
            });
            if (!accessToken) {
                throw new Error('Failed to fetch access token');
            }
            return new OAuthToken_1.default(accessToken, undefined, mappedScopes);
        });
    }
    getToken(scopes) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.options.flow) {
                case OAuthFlow.U2M:
                    return this.getTokenU2M(scopes);
                case OAuthFlow.M2M:
                    return this.getTokenM2M(scopes);
                // no default
            }
        });
    }
    static getManager(options) {
        // normalize
        const host = options.host.toLowerCase().replace('https://', '').split('/')[0];
        const awsDomains = ['.cloud.databricks.com', '.dev.databricks.com'];
        const isAWSDomain = awsDomains.some((domain) => host.endsWith(domain));
        if (isAWSDomain) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return new DatabricksOAuthManager(options);
        }
        const gcpDomains = ['.gcp.databricks.com'];
        const isGCPDomain = gcpDomains.some((domain) => host.endsWith(domain));
        if (isGCPDomain) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return new DatabricksOAuthManager(options);
        }
        if (options.useDatabricksOAuthInAzure) {
            const azureDomains = ['.azuredatabricks.net'];
            const isAzureDomain = azureDomains.some((domain) => host.endsWith(domain));
            if (isAzureDomain) {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                return new DatabricksOAuthManager(options);
            }
        }
        else {
            const azureDomains = ['.azuredatabricks.net', '.databricks.azure.us', '.databricks.azure.cn'];
            const isAzureDomain = azureDomains.some((domain) => host.endsWith(domain));
            if (isAzureDomain) {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                return new AzureOAuthManager(options);
            }
        }
        throw new Error(`OAuth is not supported for ${options.host}`);
    }
}
exports.default = OAuthManager;
// Databricks InHouse OAuth Manager
class DatabricksOAuthManager extends OAuthManager {
    getOIDCConfigUrl() {
        return `${getDatabricksOIDCUrl(this.options.host)}/.well-known/oauth-authorization-server`;
    }
    getAuthorizationUrl() {
        return `${getDatabricksOIDCUrl(this.options.host)}/oauth2/v2.0/authorize`;
    }
    getClientId() {
        var _a;
        return (_a = this.options.clientId) !== null && _a !== void 0 ? _a : DatabricksOAuthManager.defaultClientId;
    }
    getCallbackPorts() {
        var _a;
        return (_a = this.options.callbackPorts) !== null && _a !== void 0 ? _a : DatabricksOAuthManager.defaultCallbackPorts;
    }
    getScopes(requestedScopes) {
        if (this.options.flow === OAuthFlow.M2M) {
            // this is the only allowed scope for M2M flow
            return [OAuthScope_1.OAuthScope.allAPIs];
        }
        return requestedScopes;
    }
}
exports.DatabricksOAuthManager = DatabricksOAuthManager;
DatabricksOAuthManager.defaultClientId = 'databricks-sql-connector';
DatabricksOAuthManager.defaultCallbackPorts = [8030];
class AzureOAuthManager extends OAuthManager {
    getOIDCConfigUrl() {
        return 'https://login.microsoftonline.com/organizations/v2.0/.well-known/openid-configuration';
    }
    getAuthorizationUrl() {
        return `${getDatabricksOIDCUrl(this.options.host)}/oauth2/v2.0/authorize`;
    }
    getClientId() {
        var _a;
        return (_a = this.options.clientId) !== null && _a !== void 0 ? _a : AzureOAuthManager.defaultClientId;
    }
    getCallbackPorts() {
        var _a;
        return (_a = this.options.callbackPorts) !== null && _a !== void 0 ? _a : AzureOAuthManager.defaultCallbackPorts;
    }
    getScopes(requestedScopes) {
        var _a;
        // There is no corresponding scopes in Azure, instead, access control will be delegated to Databricks
        const tenantId = (_a = this.options.azureTenantId) !== null && _a !== void 0 ? _a : AzureOAuthManager.datatricksAzureApp;
        const azureScopes = [];
        switch (this.options.flow) {
            case OAuthFlow.U2M:
                azureScopes.push(`${tenantId}/user_impersonation`);
                break;
            case OAuthFlow.M2M:
                azureScopes.push(`${tenantId}/.default`);
                break;
            // no default
        }
        if (requestedScopes.includes(OAuthScope_1.OAuthScope.offlineAccess)) {
            azureScopes.push(OAuthScope_1.OAuthScope.offlineAccess);
        }
        return azureScopes;
    }
}
exports.AzureOAuthManager = AzureOAuthManager;
AzureOAuthManager.defaultClientId = '96eecda7-19ea-49cc-abb5-240097d554f5';
AzureOAuthManager.defaultCallbackPorts = [8030];
AzureOAuthManager.datatricksAzureApp = '2ff814a6-3304-4ab8-85cb-cd0e6f879c1d';
//# sourceMappingURL=OAuthManager.js.map