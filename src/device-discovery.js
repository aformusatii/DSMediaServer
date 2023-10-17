import Client from 'node-ssdp';
import arp from '@network-utils/arp-lookup';
import {EVENTS} from "./constants.js";
import {isNotSet, objToStr} from "./utils.js";

export default class DeviceDiscovery {

    constructor(appContext) {
        this.appContext = appContext;
        this.client = new Client.Client();

        const _this = this;
        this.client.on('response', async function(headers, statusCode, rinfo) {
            await _this.onReply(headers, statusCode, rinfo);
        });

        this.appContext.eventBus.on(EVENTS.SSPD_SCAN_START, async function() {
            _this.scan();
        });
    }

    scan() {
        this.client.search('ssdp:all');
    }

    async onReply(headers, statusCode, rinfo) {
        //console.log('headers', headers);
        //console.log('statusCode', statusCode);

        if (headers.USN && headers.USN.includes('AVTransport')) {
            const deviceMAC = await arp.toMAC(rinfo.address);
            console.log('rinfo', objToStr(rinfo), 'deviceMAC', deviceMAC, 'headers', objToStr(headers));

            if (isNotSet(deviceMAC)) {
                console.log('Can not identify device map.');
                return;
            }

            const reply = {
                ip: rinfo.address,
                location: headers.LOCATION,
                mac: deviceMAC,
                usn: headers.USN
            }

            this.appContext.eventBus.emit(EVENTS.SSPD_REPLY, reply);
        }
    }

}