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
exports.UnifyreExtensionKitClientImpl = exports.UnifyreExtensionKitClient = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
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
    constructor() { }
    __name__() { return 'UnifyreExtensionKitClient'; }
}
exports.UnifyreExtensionKitClient = UnifyreExtensionKitClient;
class UnifyreExtensionKitClientImpl extends UnifyreExtensionKitClient {
    constructor(api, walletProxy, appId, requestSigner) {
        super();
        this.api = api;
        this.walletProxy = walletProxy;
        this.appId = appId;
        this.requestSigner = requestSigner;
    }
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
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!this._userProfile, 'You must first sign in');
            return this._userProfile;
        });
    }
    createLinkObject(linkObject) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!linkObject, '"linkObject" must be provided');
            ferrum_plumbing_1.ValidationUtils.isTrue(!!linkObject.data && typeof linkObject.data === 'object', '"linkObject.data" must be provided and be an object');
            ferrum_plumbing_1.ValidationUtils.isTrue(!!linkObject.message, '"message" must be provided');
            ferrum_plumbing_1.ValidationUtils.isTrue(!!linkObject.imageMainLine, '"imageMainLine" must be provided');
            ferrum_plumbing_1.ValidationUtils.isTrue(!!linkObject.imageSecondLine, '"imageSecondLine" must be provided');
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
    sendMoneyAsync(toAddress, currency, amount, accountGroupId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!this.requestSigner, "'requestSigner' must be provided");
            const prof = yield this.getUserProfile();
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
                    payload,
                },
            };
            const signedReq = this.requestSigner.signProxyRequest(req);
            return yield this.walletProxy.callAsync(signedReq);
        });
    }
    getSendMoneyResponse(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.walletProxy.waitForResponse(requestId);
            return res.data;
        });
    }
    sendTransactionAsync(network, transactions, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!this.requestSigner, "'requestSigner' must be provided");
            ferrum_plumbing_1.ValidationUtils.isTrue(!!network, '"network" must be provided');
            ferrum_plumbing_1.ValidationUtils.isTrue(!!transactions && !!transactions.length, '"trasactions" must be provided');
            transactions.forEach(t => {
                ferrum_plumbing_1.ValidationUtils.isTrue(!!t.gas && !!t.gas.gasLimit, '"gasLimit" must be provided');
            });
            const prof = yield this.getUserProfile();
            const req = {
                command: 'REQUEST_SIGN_CUSTOM_TRANSACTION',
                data: {
                    network,
                    userId: prof.userId,
                    appId: prof.appId,
                    transactions,
                    payload,
                },
            };
            const signedReq = this.requestSigner.signProxyRequest(req);
            return yield this.walletProxy.callAsync(signedReq);
        });
    }
    getSendTransactionResponse(requestId, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.walletProxy.waitForResponse(requestId, timeout);
            return res.data;
        });
    }
    // async sign(network: Network,
    //            messageHex: HexString,
    //            messageType: SignableMessageType,
    //            description?: string,
    //            accountGroupId?: string): Promise<SignedMessageResponse> {
    //   ValidationUtils.isTrue(!!this.requestSigner, "'requestSigner' must be provided");
    //   ValidationUtils.isTrue(!!messageHex, '"message" must be provided');
    //   ValidationUtils.isTrue(SIGNABLE_MESSAGE_TYPES.has(messageType), 'Invalid "messageType"');
    //   const prof = this.getUserProfile();
    //   const req = {
    //     command: messageType === 'PLAIN_TEXT' ? 'REQUEST_SIGN_CLEAN_MESSAGE' : 'REQUEST_SIGN_CUSTOM_MESSAGE',
    //     data: {
    //       network,
    //       userId: prof.userId,
    //       appId: prof.appId,
    //       accountGroupId,
    //       messageHex,
    //       messageType,
    //       description,
    //     } as any,
    //   } as JsonRpcRequest;
    //   const signedReq = this.requestSigner!.signProxyRequest(req);
    //   const res = await this.walletProxy.call(this.appId, signedReq);
    //   return res.data as SignedMessageResponse;
    // }
    getTransaction(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.api.get(`extension/transaction/${transactionId}`, {});
        });
    }
}
exports.UnifyreExtensionKitClientImpl = UnifyreExtensionKitClientImpl;
//# sourceMappingURL=UnifyreExtensionKitClient.js.map