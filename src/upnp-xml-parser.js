import convert from 'xml-js';
import {isNotEmpty, getNestedPropertyValueByPartialKey} from './utils.js';

export const parseDeviceInfo = function(xmlBody) {
    const result = {data:{}, raw: {}};

    try {
        const rootObj = convert.xml2js(xmlBody, {compact: true, spaces: 4});
        const rootDevice = rootObj.root.device;

        Object.keys(rootDevice).forEach((key, index) => {
            const element = rootDevice[key];
            if (element && ((typeof element._text) === 'string')) {
                result.data[key] = element._text;
            }
        });

        result.raw.serviceList = rootDevice.serviceList;

        rootDevice.serviceList.service.forEach((service) => {
            const serviceType = service.serviceType._text;

            if (serviceType.includes('AVTransport')) {
                result.data.avTransport = {};
                result.data.avTransport.controlURL = service.controlURL._text;
                result.data.avTransport.eventSubURL = service.eventSubURL._text;
            }

            if (serviceType.includes('RenderingControl')) {
                result.data.renderingControl = {};
                result.data.renderingControl.controlURL = service.controlURL._text;
                result.data.renderingControl.eventSubURL = service.eventSubURL._text;
            }
        });

    } catch (exception) {
        console.log('Error while parsing DeviceInfo', xmlBody, exception);
        result.exception = exception;
    }

    return result;

}

export const parseNotify = function(xmlBody) {
    const result = {};

    try {
        const rootObj = convert.xml2js(xmlBody, {compact: true, spaces: 4});

        const lastChangeXML = getNestedPropertyValueByPartialKey(rootObj, 'propertyset.property.LastChange._text');
        //console.log('LastChange', lastChangeXML);

        const lastChangeObj = convert.xml2js(lastChangeXML, {compact: true, spaces: 4});
        const instanceID = lastChangeObj.Event.InstanceID;
        //console.log('Event->InstanceID:', lastChangeObj.Event.InstanceID);

        Object.keys(instanceID).forEach((key, index) => {
            const element = instanceID[key];

            if (element && element._attributes && isNotEmpty(element._attributes.val)) {
                const value = element._attributes.val;

                if (value.includes('DIDL-Lite')) {
                    result[key] = parseDIDLLite(value);
                } else {
                    result[key] = value;
                }
            }
        });

    } catch (exception) {
        console.log('Error while parsing UPnP notification', xmlBody, exception);
        result.exception = exception;
    }

    return result;
}

export const parseGetPositionInfoResponse = function(xmlBody) {
    const result = {};
    try {
        const rootObj = convert.xml2js(xmlBody, {compact: true, nativeType: false});

        const getPositionInfoResponseObj = getNestedPropertyValueByPartialKey(rootObj, 'Envelope.Body.GetPositionInfoResponse');

        Object.keys(getPositionInfoResponseObj).forEach((key, index) => {
            const value = getPositionInfoResponseObj[key];

            if (value._text) {
                if (value._text.includes('DIDL-Lite')) {
                    result[key] = parseDIDLLite(value._text);
                } else {
                    result[key] = value._text;
                }
            }
        });

    } catch (exception) {
        console.log('Error while parsing UPnP GetPositionInfoResponse', xmlBody, exception);
        result.exception = exception;
    }

    return result;
}

export const parseGetTransportInfoResponse = function(xmlBody) {
    const result = {};
    try {
        const rootObj = convert.xml2js(xmlBody, {compact: true, nativeType: false});

        const getTransportInfoResponseObj = getNestedPropertyValueByPartialKey(rootObj, 'Envelope.Body.GetTransportInfoResponse');

        Object.keys(getTransportInfoResponseObj).forEach((key, index) => {
            const value = getTransportInfoResponseObj[key];

            if (value._text) {
                result[key] = value._text;
            }
        });

    } catch (exception) {
        console.log('Error while parsing UPnP GetTransportInfoResponse', xmlBody, exception);
        result.exception = exception;
    }

    return result;
}

const parseDIDLLite = function(valueXML) {
    const trackMetaDataObj = convert.xml2js(valueXML, {compact: true, spaces: 4});

    const result = {
        title: trackMetaDataObj['DIDL-Lite'].item['dc:title'],
        value: trackMetaDataObj['DIDL-Lite'].item.res._text
    }

    return result;
}

const isPresent = function(element) {
    return element && isNotEmpty(element._attributes.val);
}