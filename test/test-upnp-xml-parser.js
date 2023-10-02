import {parseGetPositionInfoResponse, parseGetTransportInfoResponse, parseNotify, parseDeviceInfo} from "../src/upnp-xml-parser.js";

/* =========================================================================================== */
let body = `
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><SOAP-ENV:Body><m:GetPositionInfoResponse xmlns:m="urn:schemas-upnp-org:service:AVTransport:1"><Track xmlns:dt="urn:schemas-microsoft-com:datatypes" dt:dt="ui4">1</Track><TrackDuration xmlns:dt="urn:schemas-microsoft-com:datatypes" dt:dt="string">00:00:00</TrackDuration><TrackMetaData xmlns:dt="urn:schemas-microsoft-com:datatypes" dt:dt="string">&lt;DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dlna="urn:schemas-dlna-org:metadata-1-0/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns:sec="http://www.sec.co.kr/" xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/"&gt;&lt;item restricted="1" id="PlayOn-content" parentID=""&gt;&lt;upnp:class&gt;object.item.videoItem&lt;/upnp:class&gt;&lt;dc:title&gt;video1&lt;/dc:title&gt;&lt;res protocolInfo="http-get:*:application/octet-stream:DLNA.ORG_PN=;DLNA.ORG_OP=00;DLNA.ORG_FLAGS=01700000000000000000000000000000" sec:URIType="public"&gt;http://192.168.100.109:9003/media.mpg&lt;/res&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</TrackMetaData><TrackURI xmlns:dt="urn:schemas-microsoft-com:datatypes" dt:dt="string">http://192.168.100.109:9003/media.mpg</TrackURI><RelTime xmlns:dt="urn:schemas-microsoft-com:datatypes" dt:dt="string">0:00:00</RelTime><AbsTime xmlns:dt="urn:schemas-microsoft-com:datatypes" dt:dt="string">NOT_IMPLEMENTED</AbsTime><RelCount xmlns:dt="urn:schemas-microsoft-com:datatypes" dt:dt="i4">-1</RelCount><AbsCount xmlns:dt="urn:schemas-microsoft-com:datatypes" dt:dt="i4">-1</AbsCount></m:GetPositionInfoResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>
`;

let result = parseGetPositionInfoResponse(body);
console.log(result);

/* =========================================================================================== */
body = `
<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><u:GetPositionInfoResponse xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><Track>1</Track><TrackDuration>0:00:00</TrackDuration><TrackMetaData>&lt;DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns:sec="http://www.sec.co.kr/" xmlns:dlna="urn:schemas-dlna-org:metadata-1-0/"&gt;&lt;item id="PlayOn-content" parentID="" restricted="1"&gt;&lt;dc:title&gt;video1&lt;/dc:title&gt;&lt;dc:creator&gt;Unknown&lt;/dc:creator&gt;&lt;upnp:genre&gt;Unknown&lt;/upnp:genre&gt;&lt;res protocolInfo="http-get:*:application/octet-stream:DLNA.ORG_PN=;DLNA.ORG_OP=00;DLNA.ORG_FLAGS=01700000000000000000000000000000"&gt;http://192.168.100.109:9003/media.mpg&lt;/res&gt;&lt;upnp:class&gt;object.item.videoItem&lt;/upnp:class&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</TrackMetaData><TrackURI>http://192.168.100.109:9003/media.mpg</TrackURI><RelTime>00:00:00</RelTime><AbsTime>NOT_IMPLEMENTED</AbsTime><RelCount>-1</RelCount><AbsCount>0</AbsCount></u:GetPositionInfoResponse></s:Body></s:Envelope>
`

result = parseGetPositionInfoResponse(body);
console.log('parseGetPositionInfoResponse', result);

/* =========================================================================================== */
body = `
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><SOAP-ENV:Body><m:GetTransportInfoResponse xmlns:m="urn:schemas-upnp-org:service:AVTransport:1"><CurrentTransportState xmlns:dt="urn:schemas-microsoft-com:datatypes" dt:dt="string">STOPPED</CurrentTransportState><CurrentTransportStatus xmlns:dt="urn:schemas-microsoft-com:datatypes" dt:dt="string">OK</CurrentTransportStatus><CurrentSpeed xmlns:dt="urn:schemas-microsoft-com:datatypes" dt:dt="string">1</CurrentSpeed></m:GetTransportInfoResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>
`

result = parseGetTransportInfoResponse(body);
console.log('parseGetTransportInfoResponse', result);

/* =========================================================================================== */
body = `
<?xml version="1.0" encoding="UTF-8"?>
<e:propertyset xmlns:e="urn:schemas-upnp-org:event-1-0"><e:property><LastChange>&lt;Event xmlns="urn:schemas-upnp-org:metadata-1-0/AVT/"&gt;&lt;InstanceID val="0"&gt;&lt;TransportState val="STOPPED"/&gt;&lt;TransportStatus val="OK"/&gt;&lt;PlaybackStorageMedium val="NETWORK"/&gt;&lt;RecordStorageMedium val="NOT_IMPLEMENTED"/&gt;&lt;PossiblePlaybackStorageMedia val="UNKNOWN,DV,MINI-DV,VHS,W-VHS,S-VHS,D-VHS,VHSC,VIDEO8,HI8,CD-ROM,CD-DA,CD-R,CD-RW,VIDEO-CD,SACD,MD-AUDIO,MD-PICTURE,DVD-ROM,DVD-VIDEO,DVD-R,DVD+RW,DVD-RW,DVD-RAM,DVD-AUDIO,DAT,LD,HDD,MICRO-MV,NETWORK,NONE,NOT_IMPLEMENTED"/&gt;&lt;PossibleRecordStorageMedia val=""/&gt;&lt;CurrentPlayMode val="NORMAL"/&gt;&lt;TransportPlaySpeed val="1"/&gt;&lt;RecordMediumWriteStatus val="NOT_IMPLEMENTED"/&gt;&lt;CurrentRecordQualityMode val="NOT_IMPLEMENTED"/&gt;&lt;PossibleRecordQualityModes val=""/&gt;&lt;NumberOfTracks val="1"/&gt;&lt;CurrentTrack val="1"/&gt;&lt;CurrentTrackDuration val="0:00:00"/&gt;&lt;CurrentMediaDuration val="0:00:00"/&gt;&lt;CurrentTrackMetaData val="&amp;lt;DIDL-Lite xmlns=&amp;quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&amp;quot; xmlns:dc=&amp;quot;http://purl.org/dc/elements/1.1/&amp;quot; xmlns:upnp=&amp;quot;urn:schemas-upnp-org:metadata-1-0/upnp/&amp;quot; xmlns:sec=&amp;quot;http://www.sec.co.kr/&amp;quot; xmlns:dlna=&amp;quot;urn:schemas-dlna-org:metadata-1-0/&amp;quot;&amp;gt;&amp;lt;item id=&amp;quot;PlayOn-content&amp;quot; parentID=&amp;quot;&amp;quot; restricted=&amp;quot;1&amp;quot;&amp;gt;&amp;lt;dc:title&amp;gt;video2&amp;lt;/dc:title&amp;gt;&amp;lt;dc:creator&amp;gt;Unknown&amp;lt;/dc:creator&amp;gt;&amp;lt;upnp:genre&amp;gt;Unknown&amp;lt;/upnp:genre&amp;gt;&amp;lt;res protocolInfo=&amp;quot;http-get:*:application/octet-stream:DLNA.ORG_PN=;DLNA.ORG_OP=00;DLNA.ORG_FLAGS=01700000000000000000000000000000&amp;quot;&amp;gt;http://192.168.100.109:9003/media.mpg&amp;lt;/res&amp;gt;&amp;lt;upnp:class&amp;gt;object.item.videoItem&amp;lt;/upnp:class&amp;gt;&amp;lt;/item&amp;gt;&amp;lt;/DIDL-Lite&amp;gt;"/&gt;&lt;CurrentTrackURI val="http://192.168.100.109:9003/media.mpg"/&gt;&lt;AVTransportURI val="http://192.168.100.109:9003/media.mpg"/&gt;&lt;AVTransportURIMetaData val="&amp;lt;DIDL-Lite xmlns=&amp;quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&amp;quot; xmlns:dc=&amp;quot;http://purl.org/dc/elements/1.1/&amp;quot; xmlns:upnp=&amp;quot;urn:schemas-upnp-org:metadata-1-0/upnp/&amp;quot; xmlns:sec=&amp;quot;http://www.sec.co.kr/&amp;quot; xmlns:dlna=&amp;quot;urn:schemas-dlna-org:metadata-1-0/&amp;quot;&amp;gt;&amp;lt;item id=&amp;quot;PlayOn-content&amp;quot; parentID=&amp;quot;&amp;quot; restricted=&amp;quot;1&amp;quot;&amp;gt;&amp;lt;dc:title&amp;gt;video2&amp;lt;/dc:title&amp;gt;&amp;lt;dc:creator&amp;gt;Unknown&amp;lt;/dc:creator&amp;gt;&amp;lt;upnp:genre&amp;gt;Unknown&amp;lt;/upnp:genre&amp;gt;&amp;lt;res protocolInfo=&amp;quot;http-get:*:application/octet-stream:DLNA.ORG_PN=;DLNA.ORG_OP=00;DLNA.ORG_FLAGS=01700000000000000000000000000000&amp;quot;&amp;gt;http://192.168.100.109:9003/media.mpg&amp;lt;/res&amp;gt;&amp;lt;upnp:class&amp;gt;object.item.videoItem&amp;lt;/upnp:class&amp;gt;&amp;lt;/item&amp;gt;&amp;lt;/DIDL-Lite&amp;gt;"/&gt;&lt;NextAVTransportURI val=""/&gt;&lt;NextAVTransportURIMetaData val=""/&gt;&lt;CurrentTransportActions val="Play,Stop,Seek,X_DLNA_SeekTime,X_DLNA_PS=1/2\\,4\\,-1/2\\,-2\\,-4"/&gt;&lt;/InstanceID&gt;&lt;/Event&gt;</LastChange></e:property></e:propertyset>
`

result = parseNotify(body);
console.log(result);

/* =========================================================================================== */
body = `
<?xml version="1.0" encoding="UTF-8"?>
<e:propertyset xmlns:e="urn:schemas-upnp-org:event-1-0"><e:property><LastChange>&lt;Event xmlns="urn:schemas-upnp-org:metadata-1-0/AVT/"&gt;&lt;InstanceID val="0"&gt;&lt;TransportState val="STOPPED"/&gt;&lt;TransportStatus val="OK"/&gt;&lt;PlaybackStorageMedium val="NETWORK"/&gt;&lt;RecordStorageMedium val="NOT_IMPLEMENTED"/&gt;&lt;PossiblePlaybackStorageMedia val="UNKNOWN,DV,MINI-DV,VHS,W-VHS,S-VHS,D-VHS,VHSC,VIDEO8,HI8,CD-ROM,CD-DA,CD-R,CD-RW,VIDEO-CD,SACD,MD-AUDIO,MD-PICTURE,DVD-ROM,DVD-VIDEO,DVD-R,DVD+RW,DVD-RW,DVD-RAM,DVD-AUDIO,DAT,LD,HDD,MICRO-MV,NETWORK,NONE,NOT_IMPLEMENTED"/&gt;&lt;PossibleRecordStorageMedia val=""/&gt;&lt;CurrentPlayMode val="NORMAL"/&gt;&lt;TransportPlaySpeed val="1"/&gt;&lt;RecordMediumWriteStatus val="NOT_IMPLEMENTED"/&gt;&lt;CurrentRecordQualityMode val="NOT_IMPLEMENTED"/&gt;&lt;PossibleRecordQualityModes val=""/&gt;&lt;NumberOfTracks val="1"/&gt;&lt;CurrentTrack val="1"/&gt;&lt;CurrentTrackDuration val="0:00:00"/&gt;&lt;CurrentMediaDuration val="0:00:00"/&gt;&lt;CurrentTrackMetaData val="&amp;lt;DIDL-Lite xmlns=&amp;quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&amp;quot; xmlns:dc=&amp;quot;http://purl.org/dc/elements/1.1/&amp;quot; xmlns:upnp=&amp;quot;urn:schemas-upnp-org:metadata-1-0/upnp/&amp;quot; xmlns:sec=&amp;quot;http://www.sec.co.kr/&amp;quot; xmlns:dlna=&amp;quot;urn:schemas-dlna-org:metadata-1-0/&amp;quot;&amp;gt;&amp;lt;item id=&amp;quot;PlayOn-content&amp;quot; parentID=&amp;quot;&amp;quot; restricted=&amp;quot;1&amp;quot;&amp;gt;&amp;lt;dc:title&amp;gt;video2&amp;lt;/dc:title&amp;gt;&amp;lt;dc:creator&amp;gt;Unknown&amp;lt;/dc:creator&amp;gt;&amp;lt;upnp:genre&amp;gt;Unknown&amp;lt;/upnp:genre&amp;gt;&amp;lt;res protocolInfo=&amp;quot;http-get:*:application/octet-stream:DLNA.ORG_PN=;DLNA.ORG_OP=00;DLNA.ORG_FLAGS=01700000000000000000000000000000&amp;quot;&amp;gt;http://192.168.100.109:9003/media.mpg&amp;lt;/res&amp;gt;&amp;lt;upnp:class&amp;gt;object.item.videoItem&amp;lt;/upnp:class&amp;gt;&amp;lt;/item&amp;gt;&amp;lt;/DIDL-Lite&amp;gt;"/&gt;&lt;CurrentTrackURI val="http://192.168.100.109:9003/media.mpg"/&gt;&lt;AVTransportURI val="http://192.168.100.109:9003/media.mpg"/&gt;&lt;AVTransportURIMetaData val="&amp;lt;DIDL-Lite xmlns=&amp;quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&amp;quot; xmlns:dc=&amp;quot;http://purl.org/dc/elements/1.1/&amp;quot; xmlns:upnp=&amp;quot;urn:schemas-upnp-org:metadata-1-0/upnp/&amp;quot; xmlns:sec=&amp;quot;http://www.sec.co.kr/&amp;quot; xmlns:dlna=&amp;quot;urn:schemas-dlna-org:metadata-1-0/&amp;quot;&amp;gt;&amp;lt;item id=&amp;quot;PlayOn-content&amp;quot; parentID=&amp;quot;&amp;quot; restricted=&amp;quot;1&amp;quot;&amp;gt;&amp;lt;dc:title&amp;gt;video2&amp;lt;/dc:title&amp;gt;&amp;lt;dc:creator&amp;gt;Unknown&amp;lt;/dc:creator&amp;gt;&amp;lt;upnp:genre&amp;gt;Unknown&amp;lt;/upnp:genre&amp;gt;&amp;lt;res protocolInfo=&amp;quot;http-get:*:application/octet-stream:DLNA.ORG_PN=;DLNA.ORG_OP=00;DLNA.ORG_FLAGS=01700000000000000000000000000000&amp;quot;&amp;gt;http://192.168.100.109:9003/media.mpg&amp;lt;/res&amp;gt;&amp;lt;upnp:class&amp;gt;object.item.videoItem&amp;lt;/upnp:class&amp;gt;&amp;lt;/item&amp;gt;&amp;lt;/DIDL-Lite&amp;gt;"/&gt;&lt;NextAVTransportURI val=""/&gt;&lt;NextAVTransportURIMetaData val=""/&gt;&lt;CurrentTransportActions val="Play,Stop,Seek,X_DLNA_SeekTime,X_DLNA_PS=1/2\\,4\\,-1/2\\,-2\\,-4"/&gt;&lt;/InstanceID&gt;&lt;/Event&gt;</LastChange></e:property></e:propertyset>
`

result = parseNotify(body);
console.log(result);

body = `
<?xml version="1.0"?>
<root xmlns="urn:schemas-upnp-org:device-1-0" xmlns:microsoft="urn:schemas-microsoft-com:WMPDMR-1-0">
  <specVersion>
    <major>1</major>
    <minor>0</minor>
  </specVersion>
  <device>
    <deviceType>urn:schemas-upnp-org:device:MediaRenderer:1</deviceType>
    <friendlyName>User (DESKTOP-N77S5TN : Windows Media Player)</friendlyName>
    <modelNumber>12</modelNumber>
    <modelName>Windows Media Player</modelName>
    <modelDescription>Windows Media Player Renderer</modelDescription>
    <manufacturer>Microsoft Corporation</manufacturer>
    <manufacturerURL>https://www.microsoft.com</manufacturerURL>
    <modelURL>https://go.microsoft.com/fwlink/?LinkId=105927</modelURL>
    <serialNumber>{532356D6-8286-46B1-9114-5E8303252C0A}</serialNumber>
    <UDN>uuid:f6b89a1e-06b4-4fbf-99fa-70ca132fe793</UDN>
    <dlna:X_DLNADOC xmlns:dlna="urn:schemas-dlna-org:device-1-0">DMR-1.50</dlna:X_DLNADOC>
    <microsoft:magicPacketSendSupported>1</microsoft:magicPacketSendSupported>
    <iconList>
      <icon>
        <mimetype>image/png</mimetype>
        <width>48</width>
        <height>48</height>
        <depth>24</depth>
        <url>/upnphost/udhisapi.dll?content=uuid:4713680b-6d64-457d-aa44-5de6e22addf0</url>
      </icon>
      <icon>
        <mimetype>image/png</mimetype>
        <width>120</width>
        <height>120</height>
        <depth>24</depth>
        <url>/upnphost/udhisapi.dll?content=uuid:1e9e169a-438f-4635-a3e5-3dff2f7c3f7a</url>
      </icon>
      <icon>
        <mimetype>image/jpeg</mimetype>
        <width>48</width>
        <height>48</height>
        <depth>24</depth>
        <url>/upnphost/udhisapi.dll?content=uuid:14b2c312-31a0-47e0-8ee5-0d90044943bb</url>
      </icon>
      <icon>
        <mimetype>image/jpeg</mimetype>
        <width>120</width>
        <height>120</height>
        <depth>24</depth>
        <url>/upnphost/udhisapi.dll?content=uuid:16ba30f0-5a73-4ee0-9225-1687ad866961</url>
      </icon>
    </iconList>
    <serviceList>
      <service>
        <serviceType>urn:schemas-upnp-org:service:RenderingControl:1</serviceType>
        <serviceId>urn:upnp-org:serviceId:RenderingControl</serviceId>
        <controlURL>/upnphost/udhisapi.dll?control=uuid:f6b89a1e-06b4-4fbf-99fa-70ca132fe793+urn:upnp-org:serviceId:RenderingControl</controlURL>
        <eventSubURL>/upnphost/udhisapi.dll?event=uuid:f6b89a1e-06b4-4fbf-99fa-70ca132fe793+urn:upnp-org:serviceId:RenderingControl</eventSubURL>
        <SCPDURL>/upnphost/udhisapi.dll?content=uuid:f227e80f-fde4-4abf-9868-c51ba4fde2d1</SCPDURL>
      </service>
      <service>
        <serviceType>urn:schemas-upnp-org:service:AVTransport:1</serviceType>
        <serviceId>urn:upnp-org:serviceId:AVTransport</serviceId>
        <controlURL>/upnphost/udhisapi.dll?control=uuid:f6b89a1e-06b4-4fbf-99fa-70ca132fe793+urn:upnp-org:serviceId:AVTransport</controlURL>
        <eventSubURL>/upnphost/udhisapi.dll?event=uuid:f6b89a1e-06b4-4fbf-99fa-70ca132fe793+urn:upnp-org:serviceId:AVTransport</eventSubURL>
        <SCPDURL>/upnphost/udhisapi.dll?content=uuid:52c557f3-dc08-496d-a1d9-85e3919031dd</SCPDURL>
      </service>
      <service>
        <serviceType>urn:schemas-upnp-org:service:ConnectionManager:1</serviceType>
        <serviceId>urn:upnp-org:serviceId:ConnectionManager</serviceId>
        <controlURL>/upnphost/udhisapi.dll?control=uuid:f6b89a1e-06b4-4fbf-99fa-70ca132fe793+urn:upnp-org:serviceId:ConnectionManager</controlURL>
        <eventSubURL>/upnphost/udhisapi.dll?event=uuid:f6b89a1e-06b4-4fbf-99fa-70ca132fe793+urn:upnp-org:serviceId:ConnectionManager</eventSubURL>
        <SCPDURL>/upnphost/udhisapi.dll?content=uuid:b62efef4-6c5c-4efc-8319-fc9074a0ad5c</SCPDURL>
      </service>
    </serviceList>
  </device>
</root>
`

result = parseDeviceInfo(body);
console.log(result);