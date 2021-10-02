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
exports.ServerApi = exports.ServerApiError = exports.ServerApiHeaders = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
// import fetch from "cross-fetch";
const node_fetch_1 = __importDefault(require("node-fetch"));
class ServerApiHeaders {
}
exports.ServerApiHeaders = ServerApiHeaders;
class ServerApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }
    static translate(e) {
        if (e.indexOf('api.model.ApiError:') >= 0) {
            return e.split('api.model.ApiError:')[1];
        }
        return e;
    }
    static fromError(e) {
        return ServerApiError.translate(e.message ?
            ServerApiError.cleanError(e.message) : e.toString());
    }
    static stringify(e) {
        if (typeof e === 'object' && e !== null) {
            return JSON.stringify(e, Object.getOwnPropertyNames(e));
        }
        else
            return JSON.stringify(e);
    }
    static cleanError(error) {
        if ((error || '').indexOf(':') >= 0) {
            const afterColon = error.substr(error.indexOf(':') + 1).trim();
            if (afterColon.indexOf(':') >= 0) {
                return afterColon.substr(0, afterColon.indexOf(':')).trim();
            }
            else {
                return afterColon;
            }
        }
        return error;
    }
}
exports.ServerApiError = ServerApiError;
class DummyServerApiCustomizer {
    startMetric(command) { return {}; }
    endMetric(metric) { return; }
    ;
    getCustomHeaders(command) { return {}; }
    ;
    processCustomResult(res) { return Promise.resolve('ok'); }
}
class ServerApi {
    constructor(storage, loggerFactory, context, host, customizer = new DummyServerApiCustomizer()) {
        this.storage = storage;
        this.context = context;
        this.host = host;
        this.customizer = customizer;
        this.log = loggerFactory.getLogger(ServerApi);
        ferrum_plumbing_1.ValidationUtils.isTrue(host.endsWith('/'), '"host" must end with slash (/)');
    }
    __name__() { return 'ServerApi'; }
    /**
     * Authenticate user using provided token
     */
    setBearerToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            this.context.setBearerAuth(token);
        });
    }
    post(command, data, extraHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fetchUrl(command, 'POST', {}, data, extraHeaders);
        });
    }
    get(command, args, extraHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fetchUrl(command, 'GET', args, undefined, extraHeaders);
        });
    }
    fetchUrl(command, method, args, data, extraHeaders, retry = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let fullCommand = args && Object.keys(args).length ?
                command + '?' + Object.keys(args)
                    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(args[k]))
                    .join('&') :
                command;
            const bearerToken = this.context.getBearerToken();
            const sessionHeader = this.context.getLegacySession();
            this.log.debug(`calling api '${this.host}${fullCommand}'`, data);
            let res;
            try {
                const metric = this.customizer.startMetric(command);
                const headers = Object.assign({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Session': sessionHeader }, this.customizer.getCustomHeaders(command));
                if (bearerToken) {
                    headers['Authorization'] = `Bearer ${bearerToken}`;
                }
                if (extraHeaders) {
                    Object.keys(extraHeaders).forEach(k => { headers[k] = extraHeaders[k]; });
                }
                this.log.debug('Headers are', headers);
                res = yield node_fetch_1.default(this.host + fullCommand, {
                    method: method,
                    headers: headers,
                    body: JSON.stringify(data),
                });
                this.customizer.endMetric(metric);
            }
            catch (e) {
                const errorText = ServerApiError.fromError(e);
                this.log.error('Error calling server', e);
                throw new ServerApiError(0, errorText);
            }
            const text = yield res.text();
            if ((yield this.customizer.processCustomResult(res.status, text)) === 'retry' && retry < 3) {
                return this.fetchUrl(command, method, args, data, extraHeaders, retry + 1);
            }
            if (res.ok) {
                return text ? JSON.parse(text) : {};
            }
            else {
                const errorText = text;
                this.log.error('Error calling server' + command + args + res.status + res.statusText + errorText);
                throw new ServerApiError(res.status, errorText);
            }
        });
    }
}
exports.ServerApi = ServerApi;
//# sourceMappingURL=ServerApi.js.map