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
const http_1 = __importDefault(require("http"));
const openid_client_1 = require("openid-client");
const open_1 = __importDefault(require("open"));
const IDBSQLLogger_1 = require("../../../contracts/IDBSQLLogger");
const OAuthScope_1 = require("./OAuthScope");
function startServer(host, port, requestHandler) {
    return __awaiter(this, void 0, void 0, function* () {
        const server = http_1.default.createServer(requestHandler);
        return new Promise((resolve, reject) => {
            const errorListener = (error) => {
                server.off('error', errorListener);
                reject(error);
            };
            server.on('error', errorListener);
            server.listen(port, host, () => {
                server.off('error', errorListener);
                resolve(server);
            });
        });
    });
}
function stopServer(server) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!server.listening) {
            return;
        }
        return new Promise((resolve, reject) => {
            const errorListener = (error) => {
                server.off('error', errorListener);
                reject(error);
            };
            server.on('error', errorListener);
            server.close(() => {
                server.off('error', errorListener);
                resolve();
            });
        });
    });
}
class AuthorizationCode {
    constructor(options) {
        this.host = 'localhost';
        this.client = options.client;
        this.ports = options.ports;
        this.context = options.context;
    }
    openUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, open_1.default)(url);
        });
    }
    fetch(scopes) {
        return __awaiter(this, void 0, void 0, function* () {
            const verifierString = openid_client_1.generators.codeVerifier(32);
            const challengeString = openid_client_1.generators.codeChallenge(verifierString);
            const state = openid_client_1.generators.state(16);
            let receivedParams;
            const server = yield this.startServer((req, res) => {
                const params = this.client.callbackParams(req);
                if (params.state === state) {
                    receivedParams = params;
                    res.writeHead(200);
                    res.end(this.renderCallbackResponse());
                    server.stop();
                }
                else {
                    res.writeHead(404);
                    res.end();
                }
            });
            const redirectUri = `http://${server.host}:${server.port}`;
            const authUrl = this.client.authorizationUrl({
                response_type: 'code',
                response_mode: 'query',
                scope: scopes.join(OAuthScope_1.scopeDelimiter),
                code_challenge: challengeString,
                code_challenge_method: 'S256',
                state,
                redirect_uri: redirectUri,
            });
            yield this.openUrl(authUrl);
            yield server.stopped();
            if (!receivedParams || !receivedParams.code) {
                if (receivedParams === null || receivedParams === void 0 ? void 0 : receivedParams.error) {
                    const errorMessage = `OAuth error: ${receivedParams.error} ${receivedParams.error_description}`;
                    throw new Error(errorMessage);
                }
                throw new Error(`No path parameters were returned to the callback at ${redirectUri}`);
            }
            return { code: receivedParams.code, verifier: verifierString, redirectUri };
        });
    }
    startServer(requestHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const port of this.ports) {
                const host = this.host; // eslint-disable-line prefer-destructuring
                try {
                    const server = yield startServer(host, port, requestHandler); // eslint-disable-line no-await-in-loop
                    this.context.getLogger().log(IDBSQLLogger_1.LogLevel.info, `Listening for OAuth authorization callback at ${host}:${port}`);
                    let resolveStopped;
                    let rejectStopped;
                    const stoppedPromise = new Promise((resolve, reject) => {
                        resolveStopped = resolve;
                        rejectStopped = reject;
                    });
                    return {
                        host,
                        port,
                        server,
                        stop: () => stopServer(server).then(resolveStopped).catch(rejectStopped),
                        stopped: () => stoppedPromise,
                    };
                }
                catch (error) {
                    // if port already in use - try another one, otherwise re-throw an exception
                    if (error instanceof Error && 'code' in error && error.code === 'EADDRINUSE') {
                        this.context.getLogger().log(IDBSQLLogger_1.LogLevel.debug, `Failed to start server at ${host}:${port}: ${error.code}`);
                    }
                    else {
                        throw error;
                    }
                }
            }
            throw new Error('Failed to start server: all ports are in use');
        });
    }
    renderCallbackResponse() {
        const applicationName = 'Databricks Sql Connector';
        return `<html lang="en">
<head>
  <title>Close this Tab</title>
  <style>
    body {
      font-family: "Barlow", Helvetica, Arial, sans-serif;
      padding: 20px;
      background-color: #f3f3f3;
    }
  </style>
</head>
<body>
  <h1>Please close this tab.</h1>
  <p>
    The ${applicationName} received a response. You may close this tab.
  </p>
</body>
</html>`;
    }
}
exports.default = AuthorizationCode;
//# sourceMappingURL=AuthorizationCode.js.map