import HttpCustomClient from './http-custom-client.js';
import {copyProperties, extractBaseUrl, isSet} from "./utils.js";
import CONFIG from "./config.cjs";
import {GetPositionInfo, GetTransportInfo, SetAVTransportURI, StartPlayback, StopPlayback} from './upnp-requests.js';
import got from 'got';
import {parseDeviceInfo, parseGetPositionInfoResponse, parseGetTransportInfoResponse} from './upnp-xml-parser.js';

export default class UpnpClient {

    constructor() {
    }

    async fetchDeviceInformation(device) {
        const location = device.data.location;

        const baseUrl = extractBaseUrl(location);
        const reply = await got.get(location);

        const deviceInfo = parseDeviceInfo(reply.body);

        copyProperties(deviceInfo.data, device.data);

        if (device.data.avTransport) {
            device.data.avTransport.controlURL = `${baseUrl}${device.data.avTransport.controlURL}`
            device.data.avTransport.eventSubURL = `${baseUrl}${device.data.avTransport.eventSubURL}`
        }

        if (device.data.renderingControl) {
            device.data.renderingControl.controlURL = `${baseUrl}${device.data.renderingControl.controlURL}`
            device.data.renderingControl.eventSubURL = `${baseUrl}${device.data.renderingControl.eventSubURL}`
        }
    }

    async subscribeForAVTransportEvents(device) {
        const notifyUrl = `${CONFIG.common.protocol}://${CONFIG.common.hostname}:${CONFIG.notificationServer.port}/notify/${device.data.key}`;
        console.log(device.toString(), 'Try to subscribe.');

        const response = await this.sendSubscribe({
            url: device.data.avTransport.eventSubURL,
            callbackUrl: notifyUrl
        });

        if (response.ok) {
            console.log(device.toString(), 'Successfully subscribed.');
            device.data.subscription = {};
            device.data.subscription.SID = response.SID;
        } else {
            console.log(device.toString(), 'Couldn\'t subscribe.');
        }

        return response;
    }

    async unsubscribeFromAVTransportEvents(device) {
        if (isSet(device.data.subscription)) {
            const response = await this.sendUnsubscribe({
                url: device.data.avTransport.eventSubURL,
                SID: device.data.subscription.SID
            });

            if (response.ok) {
                console.log(device.toString(), 'Successfully unsubscribed.');
            } else {
                console.log(device.toString(), 'Couldn\'t unsubscribed.');
            }

            device.data.subscription = null;
        }
    }

    async getPositionInfo(controlURL) {
        const httpResponse = await this._soapCall(controlURL, GetPositionInfo, '"urn:schemas-upnp-org:service:AVTransport:1#GetPositionInfo"');
        const result = {};

        if (httpResponse.statusCode === 200) {
            result.ok = true;
            result.data = parseGetPositionInfoResponse(httpResponse.body);
        } else {
            result.ok = false;
            result.exception = httpResponse.exception;
            result.data = null;
        }

        return result;
    }

    async getTransportInfo(controlURL) {
        const httpResponse = await this._soapCall(controlURL, GetTransportInfo, '"urn:schemas-upnp-org:service:AVTransport:1#GetTransportInfo"');
        const result = {};

        if (httpResponse.statusCode === 200) {
            result.ok = true;
            result.data = parseGetTransportInfoResponse(httpResponse.body);
        } else {
            result.ok = false;
            result.exception = httpResponse.exception;
            result.data = null;
        }

        return result;
    }

    async startPlayback(controlURL) {
        const reply = await this._soapCall(controlURL, StartPlayback,'"urn:schemas-upnp-org:service:AVTransport:1#Play"');
        const result = {
            ok: reply.statusCode === 200
        };
        return result;
    }

    async stopPlayback(controlURL) {
        const reply = await this._soapCall(controlURL, StopPlayback,'"urn:schemas-upnp-org:service:AVTransport:1#Stop"');
        const result = {
            ok: reply.statusCode === 200
        };
        return result;
    }

    async setAVTransportURI(controlURL, sourceMediaUrl) {
        const reqBody = SetAVTransportURI.replaceAll('[source_media_url]', sourceMediaUrl);
        const reply = await this._soapCall(controlURL, reqBody,'"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"');
        const result = {
            ok: reply.statusCode === 200
        };
        return result;
    }

    async _soapCall(url, reqBody, soapAction) {
        try {
            const reply = await got.post(url, {
                body: reqBody,
                headers: {
                    'User-Agent': 'DLNA Controller',
                    'Content-Type': 'text/xml; charset="utf-8"',
                    'SOAPAction': soapAction,
                    'Accept-Encoding': 'identity',
                    'Connection': 'close'
                },
                throwHttpErrors: false,
                timeout: {
                    connect: 2000,
                    response: 5000
                }
            });

            if (reply.statusCode > 399) {
                // something went wrong :(
                console.log(`Unexpected status code ${reply.statusCode} received for ${soapAction} operation.`, reply.body);

                return {
                    statusCode: reply.statusCode,
                    body: null
                };
            }

            return reply;

        } catch (exception) {
            console.log(`Exception with ${soapAction} operation.`, String(exception));

            return {
                statusCode: 500,
                exception: exception,
                body: null
            };
        }
    }

    async sendSubscribe(options) {
        const result = {ok: false};

        try {
            const client = new HttpCustomClient();

            const httpOptions = {
                method: 'SUBSCRIBE',
                url: options.url,
                headers: {
                    'Callback': `<${options.callbackUrl}>`,
                    'NT': 'upnp:event',
                    'Timeout': 'Second-36000',
                    'Accept-Encoding': 'identity',
                    'Connection': 'close'
                }
            }

            const response = await client.sendRequest(httpOptions);

            if (response.statusCode === 200) {
                result.SID = response.headers['sid'];
                result.ok = true;
            } else {
                console.log('NativeClient->sendSubscribe', `Unexpected HTTP Status Code [${response.statusCode}]`, response.body);
            }

        } catch (error) {
            console.log('NativeClient->sendSubscribe', 'Error:', error);
        }

        return result;
    }

    async sendUnsubscribe(options) {
        const result = {ok: false};

        try {
            const client = new HttpCustomClient();

            const httpOptions = {
                method: 'UNSUBSCRIBE',
                url: options.url,
                headers: {
                    'SID': options.SID,
                    'Accept-Encoding': 'identity',
                    'Connection': 'close'
                }
            }

            const response = await client.sendRequest(httpOptions);

            if (response.statusCode === 200) {
                result.ok = true;
            } else {
                console.log('NativeClient->sendUnsubscribe', `Unexpected HTTP Status Code [${response.statusCode}]`, response.body);
            }

        } catch (error) {
            console.log('NativeClient->sendUnsubscribe', 'Error:', error);
        }

        return result;
    }

}

/* const test = async function() {
    const client = new UpnpClient();
    const result = await client.sendSubscribe({
        url: 'http://192.168.100.109:5000/upnphost/udhisapi.dll?event=uuid:f6b89a1e-06b4-4fbf-99fa-70ca132fe793+urn:upnp-org:serviceId:AVTransport',
        callbackUrl: 'http://192.168.100.109:3001/notify/18-56-80-25-05-99',
        SID: 'asdfsdaf'
    });
    console.log('result', result);
}

test(); */

/* const test2 = async function() {
    const client = new UpnpClient();
    await client.getPositionInfo(null);
}

test2(); */