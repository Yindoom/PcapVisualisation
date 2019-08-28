function readinput() {
    let input = document.getElementById('fileInput').files[0];

    console.log('Input read, name of file is ' + input.name);
    let formData = fileAsFormdata(input);

    sendRequest(formData);
}

function fileAsFormdata(file) {
    const formData = new FormData();
    filetype = file.name.split(".")[1];
    console.log(filetype);
    formData.append('filetype', filetype);
    formData.append('pcap-file', file, 'test');
    console.log('Data appended as form');
    return formData;
}

function sendRequest(file) {
    console.log('sending file');
    fetch('http://localhost:5000/pcap', {

        method: 'POST',

        body: file
    }).then(function (response) {
        return response.text();
    }).then(function (data) {
        console.log('GET STUFF');
        console.log(data);
        showDataOnPage(data);
    })
}

function showDataOnPage(json) { 
    let data = JSON.parse(json);
    let addressPoints = getAddressPoints(data['addresses']);
    let packets = data['packets'];
    //let packetsValues = Object.values(data['packets']);
    let packetsKeys = Object.keys(data['packets']);
    packetsKeys.forEach(key => {
        plotPoints(addressPoints, packets[key])
    });
}

function plotPoints(addressPoints, packets) {
    
    const svgSize = 500, circSize = 10;

    const axisScale = d3.scaleLinear();
    axisScale.domain([0, 1]).range([10, svgSize-10]);

    const svg = d3.select('body').append('svg')
        .attr('width', svgSize)
        .attr('height', svgSize);

    const thing = svg.selectAll('circle').data(packets).enter();
        
    thing.append('circle').attr('cx', d => {
            debugger;
            add = d['src'];
            points = addressPoints[add];
            return axisScale(points['x']);
        })
        .attr('cy', d => {
            add = d['src'];
            points = addressPoints[add];
            return axisScale(points['y']);
        })
        .attr('r', () => {
            return circSize;
        });
        
        thing.append('circle').attr('cx', d => {
            add = d['dst'];
            points = addressPoints[add];
            return axisScale(points['x']);
        })
        .attr('cy', d => {
            add = d['dst'];
            points = addressPoints[add];
            return axisScale(points['y']);
        })
        .attr('r', () => {
            return circSize;
        })

}

function getAddressPoints(addresses) {
    let addressPoints = {}
    addresses.forEach(address => {
        let x = Math.random();
        while(x > 0.4 && x < 0.6) {
            x = Math.random();
        }
        let y = Math.random();
        while (y > 0.4 && y < 0.6) {
            y = Math.random();
        }
        addressPoints[address] = {'y': y,'x': x};
    });

    addressPoints[addresses[0]] = {'y': 0.5, 'x': 0.5};

    return addressPoints;
}