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
exports.AsyncRequestRepeater = exports.TimeoutError = exports.ASYNC_API_REQUEST_TIMEOUT = exports.ASYNC_API_REFRESH_TIMEOUT = void 0;
exports.ASYNC_API_REFRESH_TIMEOUT = 3000;
exports.ASYNC_API_REQUEST_TIMEOUT = 3 * 60 * 1000; // Three minute timeout
class TimeoutError extends Error {
}
exports.TimeoutError = TimeoutError;
class AsyncRequestRepeater {
    constructor() {
        this.isShutDown = false;
        this.timeOutHandle = 0;
        this.lastRequestId = 0;
        this.requests = new Map();
        this.onRefresh = this.onRefresh.bind(this);
        this.initialize();
    }
    __name__() { return 'AsyncApiRequestResponseManager'; }
    registerPromise(action, timeout) {
        return new Promise((accept, reject) => {
            this.registerRequest(action, (res) => accept(res), e => reject(e), () => reject(new TimeoutError()), timeout);
        });
    }
    registerRequest(handler, onSuccess, onError, onTimeout, timeout) {
        this.lastRequestId += 1;
        const reqId = this.lastRequestId;
        this.requests.set(reqId, { handler, onSuccess, onError, onTimeout, time: Date.now(), timeout });
        this.onRefresh();
    }
    onRefresh() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check all requests. Poll, or timeout.
            const deleteList = [];
            for (const key of this.requests.keys()) {
                const val = this.requests.get(key);
                try {
                    const res = yield val.handler(key);
                    if (!res && Date.now() - val.time > (val.timeout || exports.ASYNC_API_REQUEST_TIMEOUT)) {
                        deleteList.push(key);
                        try {
                            val.onTimeout();
                        }
                        catch (e) { }
                    }
                    if (!!res) {
                        val.onSuccess(res);
                        deleteList.push(key);
                    }
                }
                catch (e) {
                    deleteList.push(key);
                    try {
                        val.onError(e);
                    }
                    catch (e) { }
                }
            }
            deleteList.forEach(k => this.requests.delete(k));
            if (!this.isShutDown) {
                setTimeout(this.onRefresh, exports.ASYNC_API_REFRESH_TIMEOUT);
            }
        });
    }
    shutDown() {
        this.isShutDown = true;
        if (this.timeOutHandle) {
            clearTimeout(this.timeOutHandle);
        }
    }
    initialize() {
        setTimeout(this.onRefresh, exports.ASYNC_API_REFRESH_TIMEOUT);
    }
}
exports.AsyncRequestRepeater = AsyncRequestRepeater;
//# sourceMappingURL=AsyncRequestRepeater.js.map