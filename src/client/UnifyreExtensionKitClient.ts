import {Injectable, JsonRpcRequest, Network, ValidationUtils} from "ferrum-plumbing";
import {ServerApi} from "../common/ServerApi";
import {WalletJsonRpcClient} from "./WalletJsonRpcClient";
import {AppUserProfile} from "./model/AppUserProfile";
import {SendMoneyResponse, CustomTransactionCallRequest, CustomTransactionCallResponse} from "../common/model/Types";
import { AppLinkRequest } from "./model/AppLink";
import { RequestSigner } from "src/crypto/RequestSigner";

function getAddressForCurrency(prof: AppUserProfile, currency: string, accountGroupId?: string): string|undefined {
  if (prof.accountGroups.length === 0) {
    return undefined;
  }
  const ag = !!accountGroupId ? prof.accountGroups.find(g => g.id === accountGroupId) : prof.accountGroups[0];
  if (!ag) {
    return undefined;
  }
  return ag.addresses.find(a => a.currency === currency)?.address;
}

export abstract class UnifyreExtensionKitClient implements Injectable {
  constructor() { }

  __name__() { return 'UnifyreExtensionKitClient'; }

  abstract setToken(token: string): Promise<void>;

  abstract signInWithToken(token: string): Promise<void>;

  abstract getUserProfile(): Promise<AppUserProfile>;

  abstract createLinkObject<T>(linkObject: AppLinkRequest<T>): Promise<string>;

  abstract getLinkObject<T>(linkId: string): Promise<T>;

  abstract sendMoneyAsync(
    toAddress: string, currency: string, amount: string,
    accountGroupId?: string, payload?: any): Promise<string>;

  abstract getSendMoneyResponse(requestId: string): Promise<SendMoneyResponse>;

  abstract sendTransactionAsync(network: Network,
             transactions: CustomTransactionCallRequest[],
             payload?: any,
             ): Promise<string>;

  abstract getSendTransactionResponse(requestId: string,
    timeout?: number): Promise<CustomTransactionCallResponse>;

  abstract getTransaction(transactionId: string): Promise<any>;
}

export class UnifyreExtensionKitClientImpl extends UnifyreExtensionKitClient {
  private _userProfile: AppUserProfile|undefined;
  constructor(
    private api: ServerApi,
    private walletProxy: WalletJsonRpcClient,
    private appId: string,
    private requestSigner?: RequestSigner,
  ) {
    super();
  }

  async setToken(token: string) {
    await this.api.setBearerToken(token);
  }

  async signInWithToken(token: string) {
    await this.api.setBearerToken(token);
    this._userProfile = await this.api.get('extension/userProfile', {}) as AppUserProfile
  }

  async getUserProfile() {
    ValidationUtils.isTrue(!!this._userProfile, 'You must first sign in');
    return this._userProfile!;
  }

  async createLinkObject<T>(linkObject: AppLinkRequest<T>): Promise<string> {
    ValidationUtils.isTrue(!!linkObject, '"linkObject" must be provided');
    ValidationUtils.isTrue(!!linkObject.data && typeof linkObject.data === 'object',
      '"linkObject.data" must be provided and be an object');
    ValidationUtils.isTrue(!!linkObject.message, '"message" must be provided');
    ValidationUtils.isTrue(!!linkObject.imageMainLine, '"imageMainLine" must be provided');
    ValidationUtils.isTrue(!!linkObject.imageSecondLine, '"imageSecondLine" must be provided');
    const res = await this.api.post(`extension/createLink`, {...linkObject, appId: this.appId}) as any;
    ValidationUtils.isTrue(!!res && !!(res.data || {}).objectId, "Error creating link. Unsuccessful");
    return res.data.objectId;
  }

  async getLinkObject<T>(linkId: string) {
    ValidationUtils.isTrue(!!linkId, '"linkId" must be provided');
    const res = await this.api.get(`extension/getLink/${linkId}`, {}) as T;
    ValidationUtils.isTrue(!!res, "Error getting link. Unsuccessful");
    return res;
  }

  async sendMoneyAsync(toAddress: string, currency: string, amount: string,
      accountGroupId?: string, payload?: any): Promise<string> {
    ValidationUtils.isTrue(!!this.requestSigner, "'requestSigner' must be provided");
    const prof = await this.getUserProfile();
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
      } as any,
    } as JsonRpcRequest;
    const signedReq = this.requestSigner!.signProxyRequest(req);
    return await this.walletProxy.callAsync(signedReq);
  }

  async getSendMoneyResponse(requestId: string) {
    const res = await this.walletProxy.waitForResponse(requestId);
    return res.data as SendMoneyResponse;
  }

  async sendTransactionAsync(network: Network,
             transactions: CustomTransactionCallRequest[],
             payload?: any,
             ): Promise<string> {
    ValidationUtils.isTrue(!!this.requestSigner, "'requestSigner' must be provided");
    ValidationUtils.isTrue(!!network, '"network" must be provided');
    ValidationUtils.isTrue(!!transactions && !!transactions.length, '"trasactions" must be provided');
    transactions.forEach(t => {
      ValidationUtils.isTrue(!!t.gas && !!t.gas.gasLimit, '"gasLimit" must be provided');
    });
    const prof = await this.getUserProfile();
    const req = {
      command: 'REQUEST_SIGN_CUSTOM_TRANSACTION',
      data: {
        network,
        userId: prof.userId,
        appId: prof.appId,
        transactions,
        payload,
      } as any,
    } as JsonRpcRequest;
    const signedReq = this.requestSigner!.signProxyRequest(req);
    return await this.walletProxy.callAsync(signedReq);
  }

  async getSendTransactionResponse(requestId: string, timeout?: number): Promise<CustomTransactionCallResponse> {
    const res = await this.walletProxy.waitForResponse(requestId, timeout);
    return res.data;
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

  async getTransaction(transactionId: string): Promise<any> {
    return this.api.get(`extension/transaction/${transactionId}`, {});
  }
}