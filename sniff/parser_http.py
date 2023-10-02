"""
This example expands on the print_packets example. It checks for HTTP request headers and displays their contents.
NOTE: We are not reconstructing 'flows' so the request (and response if you tried to parse it) will only
      parse correctly if they fit within a single packet. Requests can often fit in a single packet but
      Responses almost never will. For proper reconstruction of flows you may want to look at other projects
      that use DPKT (http://chains.readthedocs.io and others)
"""
import dpkt
import datetime
from dpkt.utils import mac_to_str, inet_to_str
from typing import cast
import socket

from collections import OrderedDict

#file_name = "PlayOn_video1_to_tv"
file_name = "PlayOn_video1_to_laptop"
#file_name = "PlayOn_detect_defendor_renderer"

def print_http_requests(pcap):
    flows = OrderedDict()

    # For each packet in the pcap process the contents
    for timestamp, buf in pcap:

        # Unpack the Ethernet frame (mac src/dst, ethertype)
        eth = dpkt.ethernet.Ethernet(buf)

        if eth.type != dpkt.ethernet.ETH_TYPE_IP:
            continue

        ip = cast(dpkt.ip.IP, eth.data)

        if ip.p == dpkt.ip.IP_PROTO_TCP:
            process_tcp(ip, flows)
            continue

        if ip.p == dpkt.ip.IP_PROTO_UDP:
            process_udp(ip, flows)
            continue

    with open(f'../{file_name}.txt', "w", encoding="utf-8", newline='') as output:
        for tcp_stream_key in flows:

            write_out('========================================================', output)
            for stream_addr in flows[tcp_stream_key]:
                if True or "192.168.100.229" in stream_addr:
                    stream_addr_str = f'{stream_addr[1]}:{stream_addr[3]} -> {stream_addr[2]}:{stream_addr[4]} PROTO: {stream_addr[0]}'

                    write_out('-----------------------------', output)
                    write_out(stream_addr_str, output)
                    write_out('-----------------------------', output)

                    stream = flows[tcp_stream_key][stream_addr]
                    data = stream.decode(encoding="utf-8", errors="ignore")
                    #if "HTTP" in data:
                    write_out(data, output)


def write_out(value, output):
    print(f'{value}\n')
    output.write(f'{value}\n')


def process_tcp(ip, flows):
    tcp = cast(dpkt.tcp.TCP, ip.data)

    stream_addr = (str(ip.p), socket.inet_ntoa(ip.src), socket.inet_ntoa(ip.dst), str(tcp.sport), str(tcp.dport))
    tcp_stream_key = tuple(sorted(stream_addr))

    payload = tcp.data

    if tcp_stream_key in flows:
        tcp_stream = flows[tcp_stream_key]

        if stream_addr in tcp_stream:
            if len(tcp_stream[stream_addr]) > 4000:
                payload = ".".encode()

            tcp_stream[stream_addr] = tcp_stream[stream_addr] + payload
        else:
            tcp_stream[stream_addr] = payload
    else:
        rr = OrderedDict()
        rr[stream_addr] = payload
        flows[tcp_stream_key] = rr


def process_udp(ip, flows):
    udp = cast(dpkt.udp.UDP, ip.data)

    stream_addr = (str(ip.p), socket.inet_ntoa(ip.src), socket.inet_ntoa(ip.dst), str(udp.sport), str(udp.dport))
    tcp_stream_key = tuple(sorted(stream_addr))

    payload = udp.data

    if tcp_stream_key in flows:
        tcp_stream = flows[tcp_stream_key]

        if stream_addr in tcp_stream:
            if len(tcp_stream[stream_addr]) > 1000:
                payload = ".".encode()

            tcp_stream[stream_addr] = tcp_stream[stream_addr] + payload
        else:
            tcp_stream[stream_addr] = payload
    else:
        rr = OrderedDict()
        rr[stream_addr] = payload
        flows[tcp_stream_key] = rr


def test():
    """Open up a test pcap file and print out the packets"""
    with open(f'../{file_name}.pcap', 'rb') as f:
        pcap = dpkt.pcap.Reader(f)
        print_http_requests(pcap)


if __name__ == '__main__':
    test()