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
const ferrum_plumbing_1 = require("ferrum-plumbing");
const SignableMessages_1 = require("../common/model/SignableMessages");
function getAddressForCurrency(prof, currency, accountGroupId) {
    var _a;
    if (prof.accountGroups.length === 0) {
        return undefined;
    }
    const ag = !!accountGroupId ? prof.accountGroups.find(g => g.id === accountGroupId) : prof.accountGroups[0];
    if (!ag) {
        return undefined;
    }
    return (_a = ag.addresses.find(a => a.currency === currency)) === null || _a === void 0 ? void 0 : _a.address;
}
class UnifyreExtensionKitClient {
    constructor(api, walletProxy, appId, requestSigner) {
        this.api = api;
        this.walletProxy = walletProxy;
        this.appId = appId;
        this.requestSigner = requestSigner;
    }
    __name__() { return 'UnifyreExtensionKitClient'; }
    setToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.api.setBearerToken(token);
        });
    }
    signInWithToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.api.setBearerToken(token);
            this._userProfile = (yield this.api.get('extension/userProfile', {}));
        });
    }
    getUserProfile() {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this._userProfile, 'You must first sign in');
        return this._userProfile;
    }
    createLinkObject(linkObject) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!linkObject, '"linkObject" must be provided');
            ferrum_plumbing_1.ValidationUtils.isTrue(!!linkObject.data && typeof linkObject.data === 'object', '"linkObject.data" must be provided and be an object');
            ferrum_plumbing_1.ValidationUtils.isTrue(!!linkObject.message, '"message" must be provided');
            ferrum_plumbing_1.ValidationUtils.isTrue(!!linkObject.imageMainLine, '"imageMainLine" must be provided');
            ferrum_plumbing_1.ValidationUtils.isTrue(!!linkObject.imageSecondLine, '"imageSecondLinke" must be provided');
            const res = yield this.api.post(`extension/createLink`, Object.assign(Object.assign({}, linkObject), { appId: this.appId }));
            ferrum_plumbing_1.ValidationUtils.isTrue(!!res && !!(res.data || {}).objectId, "Error creating link. Unsuccessful");
            return res.data.objectId;
        });
    }
    getLinkObject(linkId) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!linkId, '"linkId" must be provided');
            const res = yield this.api.get(`extension/getLink/${linkId}`, {});
            ferrum_plumbing_1.ValidationUtils.isTrue(!!res, "Error getting link. Unsuccessful");
            return res;
        });
    }
    sendMoney(toAddress, currency, amount, accountGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!this.requestSigner, "'requestSigner' must be provided");
            const prof = this.getUserProfile();
            const fromAddress = getAddressForCurrency(prof, currency, accountGroupId);
            const req = {
                command: 'REQUEST_SEND_MONEY',
                data: {
                    userId: prof.userId,
                    appId: prof.appId,
                    currency,
                    fromAddress,
                    toAddress,
                    amount,
                    accountGroupId,
                },
            };
            const signedReq = this.requestSigner.signProxyRequest(req);
            const res = yield this.walletProxy.call(this.appId, signedReq);
            return res.data;
        });
    }
    sendTransaction(network, transaction, gasLimit, description) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!this.requestSigner, "'requestSigner' must be provided");
            ferrum_plumbing_1.ValidationUtils.isTrue(!!network, '"network" must be provided');
            ferrum_plumbing_1.ValidationUtils.isTrue(!!transaction, '"transaction" must be provided');
            ferrum_plumbing_1.ValidationUtils.isTrue(!!gasLimit, '"gasLimit" must be provided');
            const prof = this.getUserProfile();
            const req = {
                command: 'REQUEST_SIGN_CUSTOM_TRANSACTION',
                data: {
                    network,
                    userId: prof.userId,
                    appId: prof.appId,
                    transaction,
                    description,
                    gasLimit,
                },
            };
            const signedReq = this.requestSigner.signProxyRequest(req);
            const res = yield this.walletProxy.call(this.appId, signedReq);
            return res.data;
        });
    }
    sign(network, messageHex, messageType, description, accountGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!this.requestSigner, "'requestSigner' must be provided");
            ferrum_plumbing_1.ValidationUtils.isTrue(!!messageHex, '"message" must be provided');
            ferrum_plumbing_1.ValidationUtils.isTrue(SignableMessages_1.SIGNABLE_MESSAGE_TYPES.has(messageType), 'Invalid "messageType"');
            const prof = this.getUserProfile();
            const req = {
                command: messageType === 'PLAIN_TEXT' ? 'REQUEST_SIGN_CLEAN_MESSAGE' : 'REQUEST_SIGN_CUSTOM_MESSAGE',
                data: {
                    network,
                    userId: prof.userId,
                    appId: prof.appId,
                    accountGroupId,
                    messageHex,
                    messageType,
                    description,
                },
            };
            const signedReq = this.requestSigner.signProxyRequest(req);
            const res = yield this.walletProxy.call(this.appId, signedReq);
            return res.data;
        });
    }
    getTransaction(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.api.get(`extension/transaction/${transactionId}`, {});
        });
    }
}
exports.UnifyreExtensionKitClient = UnifyreExtensionKitClient;
//# sourceMappingURL=UnifyreExtensionKitClient.js.map