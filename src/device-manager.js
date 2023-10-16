import {copyProperties, isNotSet, isSet, normalizeMAC, objToStr, setAsyncInterval} from './utils.js';
import Device from './device.js';
import UpnpClient from './upnp-client.js';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {CONFIG} from './configuration.js';
import {ACTIVITY, CONNECTION_STATE, EVENTS, PLAYBACK_STATE, SETTINGS} from './constants.js';

// Fix for __dirname is not defined in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEVICES_FILE = path.join(__dirname, '..', 'devices.json');

export default class DeviceManager {

    constructor(appContext) {
        this.appContext = appContext;

        const _this = this;

        this.appContext.eventBus.on(EVENTS.SSPD_REPLY, async function(message) {
            await _this.onDiscover(message);
        });

        this.appContext.eventBus.on(EVENTS.UPNP_NOTIFICATION, async function(message) {
            await _this.onAVTransportEvent(message);
        });

        this.appContext.eventBus.on(EVENTS.MEDIA_FILES_UPDATE, async function(message) {
            await _this.onMediaFilesUpdate(message);
        });

        this.appContext.eventBus.on(EVENTS.SCHEDULER_ON, async function(message) {
            await _this.setPlayback(true);
        });

        this.appContext.eventBus.on(EVENTS.SCHEDULER_OFF, async function(message) {
            await _this.setPlayback(false);
        });

        this.devicesMap = {};
        this.saveInProgress = false;
        this.playbackInProgress = false;
        this.upnpClient = new UpnpClient();
        this.latestMediaFiles = [];

        this.restoreDevices();
    }

    async onDiscover(message) {
        if (message.usn.includes('AVTransport')) {
            const deviceKey = normalizeMAC(message.mac);
            let device = null;
            let addedNew = false;

            if (isNotSet(this.devicesMap[deviceKey])) {
                device = new Device({wakeOnLanStrategy: 'None', selected: true, notification: {}});
                this.devicesMap[deviceKey] = device;
                addedNew = true;
            } else {
                // Update IP and location
                device = this.devicesMap[deviceKey];
            }

            if (!device.data.selected) {
                // not selected from UI, skip it
                console.log(device.toString(), 'onDiscover', 'Skip due to device not being selected');
                return;
            }

            if (device.isActivityDisabled(ACTIVITY.SSDP)) {
                // too fast bro, cool down a bit...
                console.log(device.toString(), 'onDiscover', 'Skip due to disabled activity.');
                return;
            }

            device.disableTemporaryActivity(ACTIVITY.SSDP, 5000);
            device.updateLastActivityTime();
            device.setMediaFiles(this.latestMediaFiles);

            if (device.hasOneOfConnectionStates(CONNECTION_STATE.CONNECTING, CONNECTION_STATE.CONNECTED)) {
                // connecting or already connected, skip it
                console.log(device.toString(), 'onDiscover', 'Skip as device already connected or trying to establish it.');

                if (this.playbackInProgress && device.hasPlaybackState(PLAYBACK_STATE.STOPPED)) {
                    console.log(device.toString(), 'onDiscover', 'Start playback');
                    await this.playNextMedia(device);
                }

                return;
            }

            console.log(device.toString(), 'onDiscover', 'Received SSDP reply');

            device.data.key = deviceKey;
            device.data.mac = message.mac;
            device.data.ip = message.ip;
            device.data.location = message.location;

            await this.upnpClient.fetchDeviceInformation(device);
            await this.reconnectToDevice(device);

            //const positionInfo = await this.upnpClient.getPositionInfo(device.data.avTransport.controlURL);
            //console.log('positionInfo', positionInfo, device.toString());

            this.saveDevicesWithDelay();

            if (this.playbackInProgress) {
                console.log(device.toString(), 'onDiscover', 'Start playback');
                await this.upnpClient.stopPlayback(device.data.avTransport.controlURL);
                await this.playNextMedia(device);
            }

            if (addedNew) {
                console.log('Added new device: ', device.toString());
            }
        }
    }

    async onAVTransportEvent(message) {
        const device = this.devicesMap[message.deviceKey];
        copyProperties(message.payload, device.data.notification);
        device.updateLastActivityTime();

        console.log(device.toString(), `NOTIFY[TransportState->${message.payload.TransportState}, TransportStatus->${message.payload.TransportStatus}, CurrentTransportActions->${message.payload.CurrentTransportActions}]`);
        //console.log('NOTIFICATION: ', message.payload);

        switch (message.payload.TransportState) {
            case 'TRANSITIONING':
            case 'PLAYING':
                device.setPlaybackState(PLAYBACK_STATE.PLAYING);
                break;

            case 'STOPPED':
                device.setPlaybackState(PLAYBACK_STATE.STOPPED);

                if (this.playbackInProgress) {
                    await this.playNextMedia(device);
                }
                break;

            default:
                // other states + undefined
                if (message.payload.TransportState) {
                    console.log(device.toString(), 'Unexpected TransportState:', message.payload.TransportState);
                }
                break;
        }
    }

    async playNextMedia(device) {
        if (device.isActivityDisabled(ACTIVITY.UPNP_CALLS)) {
            // Blocked for calls
            console.log(device.toString(), 'Skip->playNextMedia');
            return;
        }

        device.disableTemporaryActivity(ACTIVITY.UPNP_CALLS, 5000);
        device.disableTemporaryActivity(ACTIVITY.GET_POSITION_INFO, 5000);

        const mediaFile = device.getNextMediaFile();
        if (isNotSet(mediaFile)) {
            console.log(device.toString(), 'Can\'t find next media file, stop playback');
            return;
        }

        const mediaUrl = `${CONFIG.common.protocol}://${CONFIG.common.hostname}:${CONFIG.mediaFileServer.port}/media/${device.data.key}/${mediaFile.key}`;

        console.log(device.toString(), `playNextMedia[about to send]`, objToStr(mediaFile));

        const setResult = await this.upnpClient.setAVTransportURI(device.data.avTransport.controlURL, mediaUrl);
        const playResult = await this.upnpClient.startPlayback(device.data.avTransport.controlURL);

        device.disableTemporaryActivity(ACTIVITY.GET_POSITION_INFO, 10);

        console.log(device.toString(), `playNextMedia[setAVTransportURI->${setResult.ok}, play->${playResult.ok}]`);
    }

    setPlayback(play) {
        this.playbackInProgress = play;
        const $this = this;

        if (play) {

            // enable back the SSDP
            this.executeForEachDevice(async function(device) {
                if (device.data.selected) {
                    device.resetDisabledActivity(ACTIVITY.SSDP);

                    device.disableTemporaryActivity(ACTIVITY.WATCHDOG, CONFIG.common.scanDelayAfterWakeupTimeMillis + 10000);
                    // in case the device will not respond now try to periodically wake it up
                    $this.setupWatchdogJob(device);
                }
            });

            // use our fancy eventBus to start SSPD scan
            this.emitEvent(EVENTS.SSPD_SCAN_START);

            this.sendWakeOnLanAll();

            setTimeout(function(eventBus) {
                eventBus.emit(EVENTS.SSPD_SCAN_START);
            }, CONFIG.common.scanDelayAfterWakeupTimeMillis, this.appContext.eventBus);

        } else {
            this.executeForEachDevice(async function(device, upnpClient) {
                if (device.data.selected) {
                    await upnpClient.stopPlayback(device.data.avTransport.controlURL);
                }
            }, this.upnpClient);
        }
    }

    isPlaying() {
        return this.playbackInProgress;
    }

    async onPeriodicGetPositionInfo(device) {
        if (device.isActivityDisabled(ACTIVITY.GET_POSITION_INFO)) {
            // Blocked for calls
            console.log(device.toString(), 'Skip->onPeriodicGetPositionInfo');
            return;
        }

        if (device.hasOneOfConnectionStates(CONNECTION_STATE.DISCONNECTED, CONNECTION_STATE.ERROR_STATE)) {
            // Blocked for calls
            console.log(device.toString(), 'Skip->onPeriodicGetPositionInfo, device connection state DISCONNECTED or ERROR_STATE');
            return;
        }

        try {
            const positionInfoResponse = await this.upnpClient.getPositionInfo(device.data.avTransport.controlURL);
            /* const transportInfoResponse = await this.upnpClient.getTransportInfo(device.data.avTransport.controlURL);

            if (transportInfoResponse.ok) {
                console.log(device.toString(), `TransportInfo[CurrentTransportState->${transportInfoResponse.data.CurrentTransportState}, CurrentTransportStatus->${transportInfoResponse.data.CurrentTransportStatus}`);
            } */

            if (positionInfoResponse.ok) {
                device.data.positionInfo = positionInfoResponse.data;

                device.updateLastActivityTime();
                device.setConnectionState(CONNECTION_STATE.CONNECTED);
                device.resetConnectionErrorCounter();
                return;
            }

            device.incrementConnectionErrorCounter();

            if (device.getConnectionErrorCounter() > SETTINGS.MAX_GET_POSITION_INFO_ERRORS) {
                const isConnectionTimeout = positionInfoResponse.exception && (positionInfoResponse.exception.code === 'ETIMEDOUT');
                device.setConnectionState(isConnectionTimeout ? CONNECTION_STATE.DISCONNECTED : CONNECTION_STATE.ERROR_STATE);
                device.setPlaybackState(PLAYBACK_STATE.STOPPED);
            }

        } catch (exception) {
            console.log(device.toString(), 'onPeriodicGetPositionInfo', 'Exception', exception);

            device.incrementConnectionErrorCounter();

            if (device.getConnectionErrorCounter() > SETTINGS.MAX_GET_POSITION_INFO_ERRORS) {
                device.setConnectionState(CONNECTION_STATE.ERROR_STATE);
                device.setPlaybackState(PLAYBACK_STATE.STOPPED);
            }
        }
   }

   async onRenewSubscription(device) {

       if (device.hasOneOfConnectionStates(CONNECTION_STATE.DISCONNECTED, CONNECTION_STATE.ERROR_STATE)) {
           // Blocked for calls
           console.log(device.toString(), 'Skip->onRenewSubscription, device connection state DISCONNECTED or ERROR_STATE');
           return;
       }

        const renewResult = await this.renewSubscribeForAVTransportEvents(device);

        if (!renewResult) {
            await this.unsubscribeFromAVTransportEvents(device);

            const subscribeResult = await this.subscribeForAVTransportEvents(device);

            if (!subscribeResult.ok) {
                // couldn't subscribe :(
                device.setConnectionState(CONNECTION_STATE.ERROR_STATE);
            }
        }
   }

   async onWatchdogCheck(device) {
       const disconnected = device.hasOneOfConnectionStates(CONNECTION_STATE.DISCONNECTED, CONNECTION_STATE.ERROR_STATE);
       const noActivityForLongPeriodOfTime = device.getElapsedTimeInMillisFromLastActivity() > CONFIG.common.watchdogNoActivityIntervalMillis;
       const watchdogDisabled = device.isActivityDisabled(ACTIVITY.WATCHDOG);

       if (!watchdogDisabled
           && this.playbackInProgress
           && device.data.selected
           && (disconnected || noActivityForLongPeriodOfTime)) {

           if (noActivityForLongPeriodOfTime) {
                console.log(device.toString(), `No activity from this device for ${CONFIG.common.watchdogNoActivityIntervalMillis} ms, try to reset it.`);
           }

           if (disconnected) {
               console.log(device.toString(), 'Device disconnected but playback enabled, try to reset it.');
           }

           // enable back the SSDP
           device.resetDisabledActivity(ACTIVITY.SSDP);

           // use our fancy eventBus to start SSPD scan
           this.emitEvent(EVENTS.SSPD_SCAN_START);

           // Send wake-on-lan to the device
           this.emitEvent(EVENTS.WAKE_UP, device);

           setTimeout(function(eventBus) {
               eventBus.emit(EVENTS.SSPD_SCAN_START);
           }, CONFIG.common.scanDelayAfterWakeupTimeMillis, this.appContext.eventBus);
       }
   }

   async onMediaFilesUpdate(message) {
       this.latestMediaFiles = message;
       this.executeForEachDevice(device => {
            device.setMediaFiles(message);
       });
   }

   async updateDeviceData(deviceKey, data) {
        const device = this.devicesMap[deviceKey];

        const selectedFlagChanged = data.selected !== device.data.selected;

        copyProperties(data, device.data);

        if (selectedFlagChanged) {
            if (data.selected) {
                //await this.reconnectToDevice(device);
                device.setConnectionState(CONNECTION_STATE.DISCONNECTED);
            } else {
                //await this.disconnectFromDevice(device);
                device.setConnectionState(CONNECTION_STATE.DISABLED);
            }
        }

        await this.saveDevices();
    }

    async deleteDevice(deviceKey) {
        delete this.devicesMap[deviceKey];
        await this.saveDevices();
    }

    async disconnectFromDevice(device) {
        await this.upnpClient.stopPlayback(device);

        await this.unsubscribeFromAVTransportEvents(device);

        if (isSet(device.timerGetPositionInfo)) {
            clearInterval(device.timerGetPositionInfo);
        }

        if (isSet(device.timerRenewSubscription)) {
            clearInterval(device.timerRenewSubscription);
        }

        device.setConnectionState(CONNECTION_STATE.DISCONNECTED);
        device.setPlaybackState(PLAYBACK_STATE.STOPPED);
    }

    async reconnectToDevice(device) {
        await this.disconnectFromDevice(device);

        device.setConnectionState(CONNECTION_STATE.CONNECTING);

        const subscribeResult = await this.subscribeForAVTransportEvents(device);

        if (!subscribeResult.ok) {
            // couldn't subscribe :(
            device.setConnectionState(CONNECTION_STATE.ERROR_STATE);
            return;
        }

        const _this = this;

        device.timerGetPositionInfo = setAsyncInterval('GetPositionInfo', async function(device) {
            await _this.onPeriodicGetPositionInfo(device);
        }, CONFIG.common.getPositionInfoIntervalMillis, device);

        let renewSubscriptionTimeout = (subscribeResult.timeout * 1000) - 3000;
        if (renewSubscriptionTimeout > CONFIG.common.renewUPnPSubscriptionIntervalMillis) {
            renewSubscriptionTimeout = CONFIG.common.renewUPnPSubscriptionIntervalMillis;
        }

        device.timerRenewSubscription = setAsyncInterval('RenewSubscription', async function(device) {
            await _this.onRenewSubscription(device);
        }, renewSubscriptionTimeout, device);

        this.setupWatchdogJob(device);
    }

    setupWatchdogJob(device) {
        if (isSet(device.timerWatchdogCheck)) {
            clearInterval(device.timerWatchdogCheck);
        }

        const _this = this;
        device.timerWatchdogCheck = setAsyncInterval('WatchdogCheck', async function(device) {
            await _this.onWatchdogCheck(device);
        }, CONFIG.common.watchdogIntervalMillis, device);
    }

    /* ======================================================================================== */
    /*  Subscribe logic                                                                         */
    /* ======================================================================================== */
    async subscribeForAVTransportEvents(device) {
        console.log(device.toString(), 'Try to subscribe.');

        const notifyUrl = `${CONFIG.common.protocol}://${CONFIG.common.hostname}:${CONFIG.notificationServer.port}/notify/${device.data.key}`;

        const response = await this.upnpClient.sendSubscribe(
            device.data.avTransport.eventSubURL,
            notifyUrl
        );

        if (response.ok) {
            console.log(device.toString(), 'Successfully subscribed.', objToStr(response));
            device.data.subscription = {};
            device.data.subscription.SID = response.SID;
        } else {
            console.log(device.toString(), 'Couldn\'t subscribe.');
        }

        return response;
    }

    async renewSubscribeForAVTransportEvents(device) {
        console.log(device.toString(), 'Try to renew subscription.');

        const response = await this.upnpClient.sendRenewSubscribe(
            device.data.avTransport.eventSubURL,
            device.data.subscription.SID
        );

        if (response.ok) {
            console.log(device.toString(), 'Successfully renewed subscription.', objToStr(response));
            return true;
        } else {
            console.log(device.toString(), 'Couldn\'t renewed subscription.');
            return false;
        }
    }

    async unsubscribeFromAVTransportEvents(device) {
        if (isSet(device.data.subscription)) {
            console.log(device.toString(), 'Try to unsubscribe.');

            const response = await this.upnpClient.sendUnsubscribe(
                device.data.avTransport.eventSubURL,
                device.data.subscription.SID
            );

            if (response.ok) {
                console.log(device.toString(), 'Successfully unsubscribed.');
            } else {
                console.log(device.toString(), 'Couldn\'t unsubscribed.');
            }

            device.data.subscription = null;
        }
    }

    sendWakeOnLanAll() {
        this.executeForEachDevice(function(device, eventBus) {
            if (device.data.selected) {
                eventBus.emit(EVENTS.WAKE_UP, device);
            }
        }, this.appContext.eventBus);
    }

    emitEvent(eventName, ...args) {
        this.appContext.eventBus.emit(eventName, ...args);
    }

    getDevicesAsList() {
        const devices = [];

        this.executeForEachDevice(function(device) {
            devices.push(device);
        });

        return devices;
    }

    executeForEachDevice(callback, ...params) {
        Object.keys(this.devicesMap).forEach((key, index) => {
            const device = this.devicesMap[key];
            callback(device, ...params);
        });
    }

    saveDevicesWithDelay() {
        if (this.saveDevicesTimer) {
            clearTimeout(this.saveDevicesTimer);
        }

        const _this = this;

        this.saveDevicesTimer = setTimeout(async function() {
            await _this.saveDevices();
        }, 5000);
    }

    saveDevices() {
        return new Promise((resolve, reject) => {
            if (this.saveInProgress) {
                resolve();
                return;
            }

            this.saveInProgress = true;

            const _this = this;

            const devicesMapForSave = {};
            Object.keys(this.devicesMap).forEach((key, index) => {
                const device = this.devicesMap[key];

                devicesMapForSave[key] = {
                    data: device.data
                }
            });

            const data = JSON.stringify(devicesMapForSave, null, 2);

            fs.writeFile(DEVICES_FILE, data, {encoding: "utf8", flag: "w"}, (err) => {
                if (err) {
                    console.log(err);
                    reject(err)
                } else {
                    resolve();
                }

                _this.saveInProgress = false;
                console.log(`Saved devices to ${DEVICES_FILE}`);
            });
        });
    }

    restoreDevices() {
        if (!fs.existsSync(DEVICES_FILE)) {
            console.log(`No saved devices file found at ${DEVICES_FILE} location`);
            return;
        }

        const data = fs.readFileSync(DEVICES_FILE, { encoding: 'utf8', flag: 'r' });
        const parsedObj = JSON.parse(data);

        Object.keys(parsedObj).forEach((key, index) => {
            const entry = parsedObj[key];
            this.devicesMap[key] = new Device(entry.data);
        });

        console.log(`Loaded devices from ${DEVICES_FILE}`);
    }

}