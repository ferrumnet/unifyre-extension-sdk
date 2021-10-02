"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestSigner = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const ferrum_crypto_1 = require("ferrum-crypto");
class RequestSigner {
    constructor(privateKey) {
        this.privateKey = privateKey;
    }
    __name__() { return 'RequestSigner'; }
    signProxyRequest(req) {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this.privateKey, '"privateKey" is not provided to RequestSigner');
        req.data = (req.data || {});
        req.data._timestamp = Date.now();
        const msg = this.prepRequest(req);
        const msgHash = ferrum_crypto_1.sha256sync(ferrum_crypto_1.utf8ToHex(msg));
        const sig = ferrum_crypto_1.Eddsa.sign(this.privateKey, msgHash);
        return Object.assign(Object.assign({}, req), { data: Object.assign(Object.assign({}, req.data), { _signature: sig }) });
    }
    verifyProxyRequest(publicKey, req) {
        const msg = this.prepRequest(req);
        const msgHash = ferrum_crypto_1.sha256sync(ferrum_crypto_1.utf8ToHex(msg));
        const sig = req.data._signature;
        return ferrum_crypto_1.Eddsa.verify(publicKey, msgHash, sig);
    }
    prepRequest(req) {
        const params = [...(req.params || [])].map(i => i.toString()).join(',');
        const data = Object.assign({}, req.data || {});
        delete data._signature;
        ferrum_plumbing_1.ValidationUtils.isTrue(timeInRange(data._timestamp), 'Invalid _timestamp on signable data');
        const kvp = objToStrSorted(data);
        return `${req.command || '_'}&pars=${params}&${kvp}`;
    }
}
exports.RequestSigner = RequestSigner;
function objToStrSorted(obj) {
    if (typeof obj !== 'object') {
        if (obj === undefined) {
            return '';
        }
        return obj.toString();
    }
    const dataKeys = Object.keys(obj).sort();
    return dataKeys.map(k => `${k.toString()}=${(objToStrSorted(obj[k])).toString()}`).join('&');
}
const TIMESTAMP_RANGE = 10 * 60 * 1000;
function timeInRange(t) {
    if (!t) {
        return false;
    }
    const now = Date.now();
    return t > (now - TIMESTAMP_RANGE) && t < (now + TIMESTAMP_RANGE);
}
//# sourceMappingURL=RequestSigner.js.map