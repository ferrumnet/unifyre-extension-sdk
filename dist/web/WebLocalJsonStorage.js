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
exports.WebLocalJsonStorage = void 0;
function jsonOrNull(v) {
    if (!v) {
        return v;
    }
    if (!v.startsWith('{') && !v.startsWith('[')) {
        return v;
    }
    return JSON.parse(v);
}
class WebLocalJsonStorage {
    load(key) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            return jsonOrNull(localStorage.getItem(key));
        });
    }
    remove(key) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            return localStorage.removeItem(key);
        });
    }
    save(key, val) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            localStorage.setItem(key, JSON.stringify(val));
        });
    }
}
exports.WebLocalJsonStorage = WebLocalJsonStorage;
//# sourceMappingURL=WebLocalJsonStorage.js.map