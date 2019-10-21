import dpkt
from flask import Flask, jsonify, request
from flask_cors import CORS
import datetime
import socket


#Converts the encoded ip, or whatever, to readable string
def inet_to_str(inet):
    try:
        return socket.inet_ntop(socket.AF_INET, inet)
    except ValueError:
        return socket.inet_ntop(socket.AF_INET6, inet)


app = Flask(__name__)
CORS(app)


@app.route('/pcap', methods=['POST'])
def pcap():
    print('Requested received')
    if request.method == 'POST':
        print('Request marked POST')
        before = datetime.datetime.now()
        print('Getting file from request at ' + str(before))

        filetype = request.form.get('filetype')
        print(filetype)
        data = request.files['pcap-file']
        print('Reading data with dpkt')

        #pcap has at least two different file types, which require different readers
        if filetype == 'pcapng':
            pcp = dpkt.pcapng.Reader(data)
        else:
            pcp = dpkt.pcap.Reader(data)

        addresses = []
        packets = {}
        oldTime = 0
        length = 0 
        time = 0
        for ts, buf in pcp:
            length += 1        
            print(length)

            #I had some issues with a PCAP file that gave errors, 
            #so to see which packets gave errors, I added the try catch
            try:
                eth = dpkt.ethernet.Ethernet(buf)
            except:
                print('exception happened')
                continue
            if type(eth.data) != dpkt.ip.IP:
                print('not ip packet.')
                continue
            ip = eth.data
            if type(ip.data) != dpkt.tcp.TCP:
                print('not tcp packet.')
                continue

            src = inet_to_str(ip.src)
            dst = inet_to_str(ip.dst)

            #Collects all the ip addresses, to let us give each address an X and Y in JS
            if src not in addresses:
                addresses.append(src)
            if dst not in addresses:
                addresses.append(dst)

            packet = {
                'src': src,
                'dst': dst
            }

            #Used to group packets by second, if the timestamp is properly new, a new array is added to the key

            newTime = datetime.datetime.utcfromtimestamp(ts)

            if oldTime == 0:
                oldTime = newTime
                time = str(oldTime)
                packets[time] = []
                
            delta = newTime - oldTime

            if delta.seconds >= 2:
                oldTime = newTime
                time = str(oldTime)
                packets[time] = []
            packets[time].append(packet)

        responseData = {
            'addresses': addresses,
            'packets': packets
        }

        response = jsonify(responseData)

        return response, 200
    else:
        return jsonify({'message': 'help me'})


if __name__ == '__main__':
    app.run(debug=True)
