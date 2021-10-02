"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationContext = void 0;
class AuthenticationContext {
    __name__() { return 'AuthenticationContext'; }
    setBearerAuth(token) {
        this._bearerToken = token;
    }
    setLegacySession(session) {
        this._legacySession = session;
    }
    setWsToken(token) {
        this._wsToken = token;
    }
    getBearerToken() {
        return this._bearerToken;
    }
    getLegacySession() {
        return this._legacySession;
    }
}
exports.AuthenticationContext = AuthenticationContext;
//# sourceMappingURL=AuthenticationContext.js.map