import Client from 'node-ssdp';
import arp from '@network-utils/arp-lookup'

export default class DeviceDiscovery {

    constructor(appContext) {
        this.appContext = appContext;
        this.client = new Client.Client();

        const _this = this;
        this.client.on('response', async function(headers, statusCode, rinfo) {
            await _this.onReply(headers, statusCode, rinfo);
        });

        this.appContext.eventBus.on('SSPD_SCAN_START', async function() {
            _this.scan();
        });
    }

    scan() {
        this.client.search('ssdp:all');
    }

    async onReply(headers, statusCode, rinfo) {
        //console.log('headers', headers);
        //console.log('statusCode', statusCode);
        //console.log('rinfo', rinfo);

        const deviceMAC = await arp.toMAC(rinfo.address);
        //console.log('deviceMAC', deviceMAC);

        const reply = {
            ip: rinfo.address,
            location: headers.LOCATION,
            mac: deviceMAC,
            usn: headers.USN
        }

        this.appContext.eventBus.emit('SSPD_REPLY', reply);
    }

}