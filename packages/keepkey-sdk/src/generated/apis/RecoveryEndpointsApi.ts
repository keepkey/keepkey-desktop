/* tslint:disable */
/* eslint-disable */
/**
 * keepkey-desktop
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.1.14
 * Contact: bithighlander@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  Press,
  RecoverDevice,
  SendCharacterProto,
  SendPassphrase,
  SendPin,
} from '../models';
import {
    PressFromJSON,
    PressToJSON,
    RecoverDeviceFromJSON,
    RecoverDeviceToJSON,
    SendCharacterProtoFromJSON,
    SendCharacterProtoToJSON,
    SendPassphraseFromJSON,
    SendPassphraseToJSON,
    SendPinFromJSON,
    SendPinToJSON,
} from '../models';

export interface ChangePinRequest {
    body: any | null;
}

export interface CipherKeyValueRequest {
    body: any | null;
}

export interface DecryptKeyValueRequest {
    body: any | null;
}

export interface PressRequest {
    press: Press;
}

export interface PressNoRequest {
    body: any | null;
}

export interface PressYesRequest {
    body: any | null;
}

export interface RecoverRequest {
    recoverDevice: RecoverDevice;
}

export interface SendCharacterRequest {
    body: string;
}

export interface SendCharacterDeleteRequest {
    body: any | null;
}

export interface SendCharacterDoneRequest {
    body: any | null;
}

export interface SendCharacterProtoRequest {
    sendCharacterProto: SendCharacterProto;
}

export interface SendPassphraseRequest {
    sendPassphrase: SendPassphrase;
}

export interface SendPinRequest {
    sendPin: SendPin;
}

export interface SendWordRequest {
    body: string;
}

/**
 * 
 */
export class RecoveryEndpointsApi extends runtime.BaseAPI {

    /**
     */
    async changePinRaw(requestParameters: ChangePinRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.body === null || requestParameters.body === undefined) {
            throw new runtime.RequiredError('body','Required parameter requestParameters.body was null or undefined when calling changePin.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["authorization"] = this.configuration.apiKey("authorization"); // api_key authentication
        }

        const response = await this.request({
            path: `/changePin`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: requestParameters.body as any,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     */
    async changePin(requestParameters: ChangePinRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.changePinRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async cipherKeyValueRaw(requestParameters: CipherKeyValueRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.body === null || requestParameters.body === undefined) {
            throw new runtime.RequiredError('body','Required parameter requestParameters.body was null or undefined when calling cipherKeyValue.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["authorization"] = this.configuration.apiKey("authorization"); // api_key authentication
        }

        const response = await this.request({
            path: `/cipherKeyValue`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: requestParameters.body as any,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     */
    async cipherKeyValue(requestParameters: CipherKeyValueRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.cipherKeyValueRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async decryptKeyValueRaw(requestParameters: DecryptKeyValueRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.body === null || requestParameters.body === undefined) {
            throw new runtime.RequiredError('body','Required parameter requestParameters.body was null or undefined when calling decryptKeyValue.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["authorization"] = this.configuration.apiKey("authorization"); // api_key authentication
        }

        const response = await this.request({
            path: `/decryptKeyValue`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: requestParameters.body as any,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     */
    async decryptKeyValue(requestParameters: DecryptKeyValueRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.decryptKeyValueRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async pressRaw(requestParameters: PressRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.press === null || requestParameters.press === undefined) {
            throw new runtime.RequiredError('press','Required parameter requestParameters.press was null or undefined when calling press.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["authorization"] = this.configuration.apiKey("authorization"); // api_key authentication
        }

        const response = await this.request({
            path: `/press`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: PressToJSON(requestParameters.press),
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     */
    async press(requestParameters: PressRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.pressRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async pressNoRaw(requestParameters: PressNoRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.body === null || requestParameters.body === undefined) {
            throw new runtime.RequiredError('body','Required parameter requestParameters.body was null or undefined when calling pressNo.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["authorization"] = this.configuration.apiKey("authorization"); // api_key authentication
        }

        const response = await this.request({
            path: `/pressNo`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: requestParameters.body as any,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     */
    async pressNo(requestParameters: PressNoRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.pressNoRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async pressYesRaw(requestParameters: PressYesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.body === null || requestParameters.body === undefined) {
            throw new runtime.RequiredError('body','Required parameter requestParameters.body was null or undefined when calling pressYes.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["authorization"] = this.configuration.apiKey("authorization"); // api_key authentication
        }

        const response = await this.request({
            path: `/pressYes`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: requestParameters.body as any,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     */
    async pressYes(requestParameters: PressYesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.pressYesRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async recoverRaw(requestParameters: RecoverRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.recoverDevice === null || requestParameters.recoverDevice === undefined) {
            throw new runtime.RequiredError('recoverDevice','Required parameter requestParameters.recoverDevice was null or undefined when calling recover.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["authorization"] = this.configuration.apiKey("authorization"); // api_key authentication
        }

        const response = await this.request({
            path: `/recover`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: RecoverDeviceToJSON(requestParameters.recoverDevice),
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     */
    async recover(requestParameters: RecoverRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.recoverRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async sendCharacterRaw(requestParameters: SendCharacterRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.body === null || requestParameters.body === undefined) {
            throw new runtime.RequiredError('body','Required parameter requestParameters.body was null or undefined when calling sendCharacter.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["authorization"] = this.configuration.apiKey("authorization"); // api_key authentication
        }

        const response = await this.request({
            path: `/sendCharacter`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: requestParameters.body as any,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     */
    async sendCharacter(requestParameters: SendCharacterRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.sendCharacterRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async sendCharacterDeleteRaw(requestParameters: SendCharacterDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.body === null || requestParameters.body === undefined) {
            throw new runtime.RequiredError('body','Required parameter requestParameters.body was null or undefined when calling sendCharacterDelete.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["authorization"] = this.configuration.apiKey("authorization"); // api_key authentication
        }

        const response = await this.request({
            path: `/sendCharacterDelete`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: requestParameters.body as any,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     */
    async sendCharacterDelete(requestParameters: SendCharacterDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.sendCharacterDeleteRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async sendCharacterDoneRaw(requestParameters: SendCharacterDoneRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.body === null || requestParameters.body === undefined) {
            throw new runtime.RequiredError('body','Required parameter requestParameters.body was null or undefined when calling sendCharacterDone.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["authorization"] = this.configuration.apiKey("authorization"); // api_key authentication
        }

        const response = await this.request({
            path: `/sendCharacterDone`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: requestParameters.body as any,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     */
    async sendCharacterDone(requestParameters: SendCharacterDoneRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.sendCharacterDoneRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async sendCharacterProtoRaw(requestParameters: SendCharacterProtoRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.sendCharacterProto === null || requestParameters.sendCharacterProto === undefined) {
            throw new runtime.RequiredError('sendCharacterProto','Required parameter requestParameters.sendCharacterProto was null or undefined when calling sendCharacterProto.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["authorization"] = this.configuration.apiKey("authorization"); // api_key authentication
        }

        const response = await this.request({
            path: `/sendCharacterProto`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: SendCharacterProtoToJSON(requestParameters.sendCharacterProto),
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     */
    async sendCharacterProto(requestParameters: SendCharacterProtoRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.sendCharacterProtoRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async sendPassphraseRaw(requestParameters: SendPassphraseRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.sendPassphrase === null || requestParameters.sendPassphrase === undefined) {
            throw new runtime.RequiredError('sendPassphrase','Required parameter requestParameters.sendPassphrase was null or undefined when calling sendPassphrase.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["authorization"] = this.configuration.apiKey("authorization"); // api_key authentication
        }

        const response = await this.request({
            path: `/sendPassphrase`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: SendPassphraseToJSON(requestParameters.sendPassphrase),
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     */
    async sendPassphrase(requestParameters: SendPassphraseRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.sendPassphraseRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async sendPinRaw(requestParameters: SendPinRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.sendPin === null || requestParameters.sendPin === undefined) {
            throw new runtime.RequiredError('sendPin','Required parameter requestParameters.sendPin was null or undefined when calling sendPin.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["authorization"] = this.configuration.apiKey("authorization"); // api_key authentication
        }

        const response = await this.request({
            path: `/sendPin`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: SendPinToJSON(requestParameters.sendPin),
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     */
    async sendPin(requestParameters: SendPinRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.sendPinRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async sendWordRaw(requestParameters: SendWordRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.body === null || requestParameters.body === undefined) {
            throw new runtime.RequiredError('body','Required parameter requestParameters.body was null or undefined when calling sendWord.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["authorization"] = this.configuration.apiKey("authorization"); // api_key authentication
        }

        const response = await this.request({
            path: `/sendWord`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: requestParameters.body as any,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     */
    async sendWord(requestParameters: SendWordRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.sendWordRaw(requestParameters, initOverrides);
        return await response.value();
    }

}