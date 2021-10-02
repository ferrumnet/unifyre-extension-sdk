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
exports.ClientModule = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const AuthenticationContext_1 = require("../common/AuthenticationContext");
const UnifyreExtensionKitClient_1 = require("./UnifyreExtensionKitClient");
const ServerApi_1 = require("../common/ServerApi");
const WalletJsonRpcClient_1 = require("./WalletJsonRpcClient");
const AsyncRequestRepeater_1 = require("./AsyncRequestRepeater");
/**
 * Initializes a client module. The app that uses this module must register two types:
 * JsonStorage, and LoggerFactory. Plus it should pass in apiUrl, and appId
 */
class ClientModule {
    constructor(apiUrl, appId) {
        this.apiUrl = apiUrl;
        this.appId = appId;
    }
    configAsync(c) {
        return __awaiter(this, void 0, void 0, function* () {
            c.registerSingleton(AuthenticationContext_1.AuthenticationContext, () => new AuthenticationContext_1.AuthenticationContext());
            c.registerSingleton(UnifyreExtensionKitClient_1.UnifyreExtensionKitClient, c => new UnifyreExtensionKitClient_1.UnifyreExtensionKitClientImpl(c.get(ServerApi_1.ServerApi), c.get(WalletJsonRpcClient_1.WalletJsonRpcClient), this.appId));
            c.registerSingleton(ServerApi_1.ServerApi, c => new ServerApi_1.ServerApi(c.get('JsonStorage'), c.get(ferrum_plumbing_1.LoggerFactory), c.get(AuthenticationContext_1.AuthenticationContext), this.apiUrl));
            c.registerSingleton(AsyncRequestRepeater_1.AsyncRequestRepeater, () => new AsyncRequestRepeater_1.AsyncRequestRepeater());
            c.register(WalletJsonRpcClient_1.WalletJsonRpcClient, c => new WalletJsonRpcClient_1.WalletJsonRpcClient(c.get(ServerApi_1.ServerApi), c.get(AsyncRequestRepeater_1.AsyncRequestRepeater)));
        });
    }
}
exports.ClientModule = ClientModule;
//# sourceMappingURL=ClientModule.js.map