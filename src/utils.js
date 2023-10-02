export const isSet = function(value) {
    return (value !== null) && (typeof value) !== 'undefined';
}

export const isNotSet = function(value) {
    return (value === null) || (typeof value) === 'undefined';
}

export const isNotEmpty = function(value) {
    if ((typeof value) === 'undefined' || (value === null)) {
        return false;
    }

    if (value.trim().length > 0) {
        return true;
    }
    return false;
}

export const getNestedPropertyValueByKey = function(obj, key) {
    return key.split(".").reduce(function(o, x) {
        return (typeof o == "undefined" || o === null)? o: o[x]
    }, obj);
}

export const getNestedPropertyValueByPartialKey = function(obj, partialKey) {
    return partialKey.split(".").reduce(function(o, x) {
        let foundKey = null;

        if (typeof o == "undefined" || o === null) {
            return o;
        }

        Object.keys(o).forEach((key, index) => {
            if (key.includes(x)) {
                foundKey = key;
            }
        });

        return o[foundKey];

    }, obj);
}

export const parseUri = function(fullURI) {
    const urlObj = new URL(fullURI);
    return {
        protocol: urlObj.protocol,
        host: urlObj.host,
        hostname: urlObj.hostname,
        port: parseInt(urlObj.port),
        path: urlObj.pathname + urlObj.search
    };
}

export const extractBaseUrl = function(fullURI) {
    const urlObj = new URL(fullURI);
    return `${urlObj.protocol}//${urlObj.host}`
}

export const normalizeMAC = function(mac) {
    return mac.replaceAll(':', '-');
}

export const copyProperties = function(sourceObj, destinationObj) {
    Object.keys(sourceObj).forEach((key, index) => {
        destinationObj[key] = sourceObj[key];
    });
}