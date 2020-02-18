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
const ServerApi_1 = require("../common/ServerApi");
class WalletJsonRpcClient {
    constructor(api, repeater) {
        this.api = api;
        this.repeater = repeater;
    }
    __name__() { return 'WalletRpcClient'; }
    /**
     * Asynchronously calls the wallet. Produces a response once a result is ready.
     * This may be done through polling or websockets, but the user sees this as a
     * simple request/response.
     */
    call(appId, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { requestId } = this.jsonRpcRes(yield this.api.post('extension/walletProxy/createRequest', req));
            return this.repeater.registerPromise((id) => __awaiter(this, void 0, void 0, function* () {
                return yield this.api.get(`extension/walletProxy/getResponse/${requestId}`, {});
            }));
        });
    }
    jsonRpcRes(res) {
        if (!!res.serverError) {
            throw new ServerApi_1.ServerApiError(500, res.serverError);
        }
        return res.data;
    }
}
exports.WalletJsonRpcClient = WalletJsonRpcClient;
//# sourceMappingURL=WalletJsonRpcClient.js.map