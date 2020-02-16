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
class ServerApiHeaders {
}
exports.ServerApiHeaders = ServerApiHeaders;
// TODO: Add metrics
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
class ServerApi {
    constructor(storage, loggerFactory, context, host) {
        this.storage = storage;
        this.context = context;
        this.host = host;
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
    fetchUrl(command, method, args, data, extraHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            let fullCommand = args && Object.keys(args).length ?
                command + '?' + Object.keys(args)
                    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(args[k]))
                    .join('&') :
                command;
            const bearerToken = this.context.getBearerToken();
            const sessionHeader = this.context.getSession();
            this.log.debug(`calling api '${this.host}${fullCommand}'`, data);
            let res;
            try {
                // const metricCommand = command.split('/')[0];
                // const metric = this.metric.start(metricCommand);
                const headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Session': sessionHeader,
                };
                if (bearerToken) {
                    headers['Authorization'] = `Bearer ${bearerToken}`;
                }
                if (extraHeaders) {
                    Object.keys(extraHeaders).forEach(k => { headers[k] = extraHeaders[k]; });
                }
                this.log.debug('Headers are', headers);
                // @ts-ignore
                res = yield fetch(this.host + fullCommand, {
                    method: method,
                    headers: headers,
                    body: JSON.stringify(data),
                });
                // metric.done();
            }
            catch (e) {
                const errorText = ServerApiError.fromError(e);
                this.log.error('Error calling server', e);
                throw new ServerApiError(0, errorText);
            }
            if (res.ok) {
                const text = yield res.text();
                return text ? JSON.parse(text) : {};
            }
            else {
                const errorText = yield res.text();
                this.log.error('Error calling server' + command + args + res.status + res.statusText + errorText);
                throw new ServerApiError(res.status, errorText);
            }
        });
    }
}
exports.ServerApi = ServerApi;
//# sourceMappingURL=ServerApi.js.map