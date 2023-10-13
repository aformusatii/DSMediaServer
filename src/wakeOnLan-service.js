import wol from 'wakeonlan';
import {EVENTS} from "./constants.js";

export default class WakeOnLanService {

    constructor(appContext) {
        this.appContext = appContext;

        const _this = this;
        this.appContext.eventBus.on(EVENTS.WAKE_UP, async function(device) {
            await _this.send(device);
        });
    }

    send(device) {
        switch (device.data.wakeOnLanStrategy) {
            case 'Default':
                this.sendDefault(device);
                break;
            case 'CustomV2':
                this.sendCustomV2(device);
                break;
            default:
                // do not send wakeOnLan
                break;
        }
    }

    sendDefault(device) {
        console.log(`Send WakeOnLan for ${device.toString()}`);
        wol(device.data.mac);
    }

    sendCustomV2(device) {
        console.log(`Send WakeOnLan for ${device.toString()}`);
        wol(device.data.mac);
    }

}