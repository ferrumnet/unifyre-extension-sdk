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
exports.UnifyreExtensionKitWeb = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const ClientModule_1 = require("../client/ClientModule");
const WebLocalJsonStorage_1 = require("./WebLocalJsonStorage");
const UnifyreExtensionKitClient_1 = require("../client/UnifyreExtensionKitClient");
const TEST_ENDPOINT = 'http://localhost:9000/api/';
const DEV_ENDPOINT = 'https://tbe.ferrumnetwork.io/api/';
const PROD_ENDPOINT_KUDI = 'https://minimal-cloud.com/api/'; //TODO:
const PROD_ENDPOINT_UNIFYRE = 'https://tbe.ferrumnetwork.io/api/';
class UnifyreExtensionKitWeb {
    static initializeTest(appId) {
        return __awaiter(this, void 0, void 0, function* () {
            return UnifyreExtensionKitWeb.initialize(appId, TEST_ENDPOINT);
        });
    }
    static initializeDev(appId) {
        return __awaiter(this, void 0, void 0, function* () {
            return UnifyreExtensionKitWeb.initialize(appId, DEV_ENDPOINT);
        });
    }
    static initializeKudi(appId) {
        return __awaiter(this, void 0, void 0, function* () {
            return UnifyreExtensionKitWeb.initialize(appId, PROD_ENDPOINT_KUDI);
        });
    }
    static initializeUnifyre(appId) {
        return __awaiter(this, void 0, void 0, function* () {
            return UnifyreExtensionKitWeb.initialize(appId, PROD_ENDPOINT_UNIFYRE);
        });
    }
    static initialize(appId, apiUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!UnifyreExtensionKitWeb._container) {
                return UnifyreExtensionKitWeb._container;
            }
            const c = new ferrum_plumbing_1.Container();
            c.registerSingleton(ferrum_plumbing_1.LoggerFactory, () => new ferrum_plumbing_1.LoggerFactory((name => new ferrum_plumbing_1.ConsoleLogger(name))));
            c.registerSingleton('JsonStorage', () => new WebLocalJsonStorage_1.WebLocalJsonStorage());
            yield c.registerModule(new ClientModule_1.ClientModule(apiUrl, appId));
            UnifyreExtensionKitWeb._container = c;
            return c;
        });
    }
    static client() {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!UnifyreExtensionKitWeb._container, 'Not initialized. Make sure to initialize UnifyreExtensionKitWeb.');
        return UnifyreExtensionKitWeb._container.get(UnifyreExtensionKitClient_1.UnifyreExtensionKitClient);
    }
}
exports.UnifyreExtensionKitWeb = UnifyreExtensionKitWeb;
//# sourceMappingURL=UnifyreExtensionKitWeb.js.map