function readinput() {
  let input = document.getElementById("fileInput").files[0];

  console.log("Input read, name of file is " + input.name);
  let formData = fileAsFormdata(input);

  sendRequest(formData);
}

function fileAsFormdata(file) {
  const formData = new FormData();
  filetype = file.name.split(".")[1];
  console.log(filetype);
  formData.append("filetype", filetype);
  formData.append("pcap-file", file, "test");
  console.log("Data appended as form");
  return formData;
}

function sendRequest(file) {
  fetch("http://localhost:5000/pcap", {
    method: "POST",

    body: file
  })
    .then(function(response) {
      return response.text();
    })
    .then(function(data) {
      showDataOnPage(data);
    });
}

function showDataOnPage(json) {
  const data = JSON.parse(json);
  const addressPoints = getAddressPoints(data["addresses"]);
  const packetsCollection = data["packets"];
  const packetsKeys = Object.keys(packetsCollection);

  const svgSize = 900;

  const scale = d3.scaleLinear();
  scale.domain([0, 1]).range([50, svgSize - 50]);

  let count = 0;
  packetsKeys.forEach(key => {
    count++;
    let packets = filterPackets(packetsCollection[key]);

    let svg = d3
      .select("body")
      .append("svg")
      .attr("width", svgSize)
      .attr("height", svgSize)
      .attr("id", count);

    setBlurFilters(svg);
    //setNoiseFilters(svg);
    //setSaturationFilters(svg);

    drawLines(addressPoints, packets, svg, scale);

    //plotPoints(addressPoints, packets, svg, scale);
    drawHouses(addressPoints, packets, svg, scale);
  });
}

function filterPackets(packets) {
  let checkedPackets = [];
  packets.forEach(packet1 => {
    let checked = false;
    if (checkedPackets.length > 0) {
      checkedPackets.forEach(checkedPacket => {
        if (checkPacketSimilarity(packet1, checkedPacket)) {
          checked = true;
          return;
        }
      });
    }

    if (!checked) {
      let size = 0;
      let numberOfSimilarPackets = 0;
      packets.forEach(packet2 => {
        if (checkPacketSimilarity(packet1, packet2)) {
          size += 0.1;
          numberOfSimilarPackets++;
        }
      });
      packet1["size"] = size;
      packet1["connections"] = numberOfSimilarPackets;
      packet1["colour"] = getLineColour(numberOfSimilarPackets);
      packet1["filter"] = getFilter(numberOfSimilarPackets);
      checkedPackets.push(packet1);
    }
  });
  return checkedPackets;
}

function getLineColour(colourRef) {
  const colourSelection = colourHSL240_120();
  if (colourRef < 2) return colourSelection["low"];
  if (colourRef >= 2 && colourRef < 5) return colourSelection["lowMedium"];
  if (colourRef >= 5 && colourRef < 10) return colourSelection["medium"];
  if (colourRef >= 10 && colourRef < 20) return colourSelection["highMedium"];
  if (colourRef >= 20) return colourSelection["high"];
}

function checkPacketSimilarity(packet1, packet2) {
  if (packet1["src"] == packet2["src"] && packet1["dst"] == packet2["dst"]) {
    return true;
  }

  if (packet1["src"] == packet2["dst"] && packet1["dst"] == packet2["src"]) {
    return true;
  }

  return false;
}

function getAddressPoints(addresses) {
  let addressPoints = {};
  let x;
  let y;
  addresses.forEach(address => {
    do {
      x = Math.random();
      y = Math.random();
    } while (x < 0.6 && x > 0.4 && y < 0.6 && y > 0.4);

    addressPoints[address] = {
      y: y,
      x: x
    };
  });

  addressPoints[addresses[0]] = {
    y: 0.5,
    x: 0.5
  };

  return addressPoints;
}
