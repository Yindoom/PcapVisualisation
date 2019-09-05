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
    fetch('http://localhost:5000/pcap', {

        method: 'POST',

        body: file
    }).then(function (response) {
        return response.text();
    }).then(function (data) {
        showDataOnPage(data);
    })
}

function showDataOnPage(json) { 
    const data = JSON.parse(json);
    const addressPoints = getAddressPoints(data['addresses']);
    const packetsCollection = data['packets'];
    const packetsKeys = Object.keys(packetsCollection);

    const svgSize = 500;

    const scale = d3.scaleLinear();
    scale.domain([0, 1]).range([10, svgSize - 10]);

    packetsKeys.forEach(key => {
        let packets = filterPackets(packetsCollection[key]);
        
        let svg = d3.select('body').append('svg')
        .attr('width', svgSize)
        .attr('height', svgSize);
        
        setFilters(svg);

        plotPoints(addressPoints, packets, svg, scale);
        drawLines(addressPoints, packets, svg, scale);
    });
}

function filterPackets(packets) {
    let checkedPackets = [];
    packets.forEach(packet1 => {
    
        let checked = false;
        if(checkedPackets.length > 0) {
            checkedPackets.forEach(checkedPacket => {
                if(checkPacketSimilarity(packet1, checkedPacket)) {
                    checked = true;
                    return;
                } 
            });
        }

        if(!checked) {
            let size = 0;
            let numberOfSimilarPackets = 0;
            packets.forEach(packet2 => {
                if (checkPacketSimilarity(packet1, packet2)){
                    size += 0.1;
                    numberOfSimilarPackets++;
                }
            });
            packet1['size'] = size;
            packet1['colour'] = getLineColour(numberOfSimilarPackets);
            packet1['filter'] = getFilter(numberOfSimilarPackets)
            checkedPackets.push(packet1);
        }
    })
    return checkedPackets;
}

function getLineColour(colourRef) {

    const colourSelection = colourConf4();
    if(colourRef < 2) 
        return colourSelection['low'];
    if(colourRef >= 2 && colourRef < 5)
        return colourSelection['lowMedium'];
    if(colourRef >= 5 && colourRef < 10)
        return colourSelection['medium'];
    if(colourRef >= 10 && colourRef < 20)
        return colourSelection['highMedium'];
    if(colourRef >= 20)
        return colourSelection['high'];
}

function checkPacketSimilarity(packet1, packet2) {
    if(packet1['src'] == packet2['src'] && packet1['dst'] == packet2['dst']){
        return true;
    }
        
    if(packet1['src'] == packet2['dst'] && packet1['dst'] == packet2['src']){
        return true;
    }
        
    return false;
} 

function plotPoints(addressPoints, packets, svg, scale) {
    
    const circSize = 5;

    const circles = svg.selectAll('circle').data(packets).enter();
        
    circles.append('circle').attr('cx', d => {
            add = d['src'];
            points = addressPoints[add];
            return scale(points['x']);
        })
        .attr('cy', d => {
            add = d['src'];
            points = addressPoints[add];
            return scale(points['y']);
        })
        .attr('r', () => {
            return circSize;
        });
        
        circles.append('circle').attr('cx', d => {
            add = d['dst'];
            points = addressPoints[add];
            return scale(points['x']);
        })
        .attr('cy', d => {
            add = d['dst'];
            points = addressPoints[add];
            return scale(points['y']);
        })
        .attr('r', () => {
            return circSize;
        })

}

function drawLines(addressPoints, packets, svg, scale) {
    const stroke = 5;

    const path = svg.selectAll('path').data(packets).enter()
        .append('path').attr('d', d => {
            return getLinePath(d, addressPoints, scale);
        }).attr('stroke', d => {
            return 'black';
        })
        .attr('stroke-width', stroke)
        .attr('fill', 'none')
        .attr('filter', d => {
            return d['filter'];
        });

   /* const lines = svg.selectAll('line').data(packets).enter()
        .append('line').attr('y1', d => {
             add = d["src"];
             points = addressPoints[add];
             return scale(points["y"]);
        })
        .attr('x1', d => {
             add = d["src"];
             points = addressPoints[add];
             return scale(points["x"]);
        })
        .attr('y2', d => {
             add = d["dst"];
             points = addressPoints[add];
             return scale(points["y"]);
        })
        .attr('x2', d => {
             add = d["dst"];
             points = addressPoints[add];
             return scale(points["x"]);
        })
        .style('stroke', d => {
            return d['colour']
        }).style('stroke-width', d => {
            return stroke;
        });*/

}

function getAddressPoints(addresses) {
    let addressPoints = {}
    let x;
    let y;
    addresses.forEach(address => {
        do { 
            x = Math.random();
            y = Math.random();

        } while(x < 0.6 && x > 0.4 && y < 0.6 && y > 0.4)
       
        addressPoints[address] = {'y': y,'x': x};
    });

    addressPoints[addresses[0]] = {'y': 0.5, 'x': 0.5};

    return addressPoints;
}

function getLinePath(d, addressPoints, scale) {
    let src = d['src'];
    let dst = d['dst'];

    let addPointsSrc = addressPoints[src];
    let addPointsDst = addressPoints[dst];

    let y1 = scale(addPointsSrc['y']);
    let x1 = scale(addPointsSrc['x']);
    let y2 = scale(addPointsDst['y']);
    let x2 = scale(addPointsDst['x']);

    return "M " + x1 + " " + y1 + " " + "L " + x2 + " " + y2
}

function setFilters(svg) {

    defs = svg.append("defs");

    let filter = defs
      .append("filter")
      .attr("id", "low")
      .append("feGaussianBlur")
      .attr("class", "blur")
      .attr("stdDeviation", "8")
      .attr("result", "coloredBlur");

    let feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    filter = defs
      .append("filter")
      .attr("id", "lowMedium")
      .append("feGaussianBlur")
      .attr("class", "blur")
      .attr("stdDeviation", "5")
      .attr("result", "coloredBlur");

    feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    filter = defs
        .append("filter")
        .attr("id", "medium")
        .append("feGaussianBlur")
        .attr("class", "blur")
        .attr("stdDeviation", "3.5")
        .attr("result", "coloredBlur");

    feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");    

    filter = defs
        .append("filter")
        .attr("id", "highMedium")
        .append("feGaussianBlur")
        .attr("class", "blur")
        .attr("stdDeviation", "2")
        .attr("result", "coloredBlur");

    feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");    

}

function getFilter(numberOfSimilarPackets) {
     if (numberOfSimilarPackets < 2) return "url(#low)";
     if (numberOfSimilarPackets >= 2 && numberOfSimilarPackets < 5)
       return "url(#lowMedium)";
     if (numberOfSimilarPackets >= 5 && numberOfSimilarPackets < 10)
       return "url(#medium)";
     if (numberOfSimilarPackets >= 10 && numberOfSimilarPackets < 20)
       return "url(#highMedium)";
     if (numberOfSimilarPackets >= 20) return "none";
}