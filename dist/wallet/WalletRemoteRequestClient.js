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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRemoteRequestClient = exports.InvalidRequestSignatureError = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const RequestSigner_1 = require("../crypto/RequestSigner");
class InvalidRequestSignatureError extends Error {
}
exports.InvalidRequestSignatureError = InvalidRequestSignatureError;
function createQueryString(queryParams) {
    return encodeURI(Object.keys(queryParams).map(k => `${k}=${queryParams[k]}`).join('&'));
}
class WalletRemoteRequestClient {
    constructor(api) {
        this.api = api;
    }
    __name__() { return 'WalletRemoteRequestClient'; }
    getRequest(requestId, publicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!requestId, '"requestId" must be provided');
            const res = yield this.api.get(`extension/walletProxy/getRequest/${requestId}`, {});
            if (!res) {
                return undefined;
            }
            if (!!publicKey) {
                const signableCommand = {
                    command: res.method || res.command,
                    params: [],
                    data: res.data,
                };
                const signer = new RequestSigner_1.RequestSigner();
                const verified = signer.verifyProxyRequest(publicKey, signableCommand);
                if (!verified) {
                    throw new InvalidRequestSignatureError();
                }
            }
            const request = {
                appId: res.policyData.EXTENSION_APP_ID,
                requestId: res.requestId,
                requestType: res.method,
                request: res.data,
            };
            ferrum_plumbing_1.ValidationUtils.isTrue(!!request.appId, 'Retrieved request has no "appId"');
            ferrum_plumbing_1.ValidationUtils.isTrue(request.requestId === requestId, 'Retrieved "requetId" does not match provided');
            return request;
        });
    }
    getSignedRequest(publicKey, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!requestId, '"requestId" must be provided');
            ferrum_plumbing_1.ValidationUtils.isTrue(!!publicKey, '"publicKey" must be provided');
            const res = yield this.api.get(`extension/walletProxy/getRequest/${requestId}`, {});
            if (!res) {
                return undefined;
            }
            const signer = new RequestSigner_1.RequestSigner();
            signer.verifyProxyRequest(publicKey, res);
            const request = {
                appId: res.policyData.EXTENSION_APP_ID,
                requestId: res.requestId,
                requestType: res.method,
                request: res.data,
            };
            ferrum_plumbing_1.ValidationUtils.isTrue(!!request.appId, 'Retrieved request has no "appId"');
            ferrum_plumbing_1.ValidationUtils.isTrue(request.requestId === requestId, 'Retrieved "requetId" does not match provided');
            return request;
        });
    }
    sendResponse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!response.requestId, '"requestId" must be provided');
            const res = yield this.api.post(`extension/walletProxy/setResponse/${response.requestId}`, response);
            return !!res;
        });
    }
    getAppLink(appId, walletAccountGroupId, walletCurrency, queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.api.post(`extension/appSignInRedirect`, {
                appId, walletAccountGroupId, walletCurrency, queryString: createQueryString(queryParams || {})
            });
            if (!res) {
                return undefined;
            }
            return res.redirectUrl;
        });
    }
    getAppLinkFromLinkId(linkId, walletAccountGroupId, walletCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.api.post(`extension/appSignInRedirectFromLink`, {
                linkId, walletAccountGroupId, walletCurrency
            });
            if (!res) {
                return undefined;
            }
            return res.redirectUrl;
        });
    }
}
exports.WalletRemoteRequestClient = WalletRemoteRequestClient;
//# sourceMappingURL=WalletRemoteRequestClient.js.map