"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scopeDelimiter = exports.defaultOAuthScopes = exports.OAuthScope = void 0;
var OAuthScope;
(function (OAuthScope) {
    OAuthScope["offlineAccess"] = "offline_access";
    OAuthScope["SQL"] = "sql";
    OAuthScope["allAPIs"] = "all-apis";
})(OAuthScope = exports.OAuthScope || (exports.OAuthScope = {}));
exports.defaultOAuthScopes = [OAuthScope.SQL, OAuthScope.offlineAccess];
exports.scopeDelimiter = ' ';
//# sourceMappingURL=OAuthScope.js.map