import fs from 'fs';
import path from 'path';

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

export const extractTimeout = function(timeoutStr) {
    if (isSet(timeoutStr)) {
        const parts = timeoutStr.split('-');
        if (parts.length === 2 && parts[0] === 'Second') {
            const numberOfSeconds = parseInt(parts[1], 10);

            if (!isNaN(numberOfSeconds)) {
                return numberOfSeconds;
            }
        }
    }

    throw new Error(`Can't extract number of seconds from [${timeoutStr}]`);

    return -1;
}

export const setAsyncInterval = function(jobName, callback, intervalMillis, ...args) {

    const jobContext = {running: false};

    const timerRef = setInterval(function(...args) {
        (async function() {

            if (jobContext.running) {
                console.log(`Job [${jobName}] already running, skip`);
                return;
            }

            jobContext.running = true;

            try {
                await callback(...args);
            } catch (ex) {
                console.log(`Exception caught during recurring job [${jobName}]:`, ex);
            } finally {
                jobContext.running = false;
            }
        })();
    }, intervalMillis, ...args);

    return timerRef;
}

export const objToStr = function(obj) {
    return JSON.stringify(obj)
}

export const deleteFileAsync = function(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export const copyFileAsync = function(sourceFilePath, targetDirectory) {
    return new Promise((resolve, reject) => {
        const targetFileName = path.basename(sourceFilePath);
        const targetFilePath = path.join(targetDirectory, targetFileName);

        fs.copyFile(sourceFilePath, targetFilePath, (err) => {
            if (err) {
                resolve(err);
            } else {
                resolve();
            }
        });
    });
}