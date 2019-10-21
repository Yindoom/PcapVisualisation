function plotPoints(addressPoints, packets, svg, scale) {
  const circSize = 7.5;

  const circles = svg
    .selectAll("circle")
    .data(packets)
    .enter();

  circles
    .append("circle")
    .attr("cx", d => {
      src = d["src"];
      dst = d["dst"];
      points = addressPoints[src];
      if (points["x"] === 0.5 && points["y"] === 0.5) {
        return scale(addressPoints[dst]["x"]);
      }
      return scale(points["x"]);
    })
    .attr("cy", d => {
      src = d["src"];
      dst = d["dst"];
      points = addressPoints[src];
      if (points["x"] === 0.5 && points["y"] === 0.5) {
        return scale(addressPoints[dst]["y"]);
      }
      return scale(points["y"]);
    })
    .attr("r", () => {
      return circSize;
    })
    .attr("stroke", d => {
      return "black";
    });

  svg
    .append("circle")
    .attr("cx", scale(0.5))
    .attr("cy", scale(0.5))
    .attr("r", circSize * 1.5)
    .attr("fill", "green")
    .attr("stroke", "green");
}

function drawLines(addressPoints, packets, svg, scale) {
  const stroke = 5;

  const path = svg
    .selectAll("path")
    .filter(".line")
    .data(packets)
    .enter();

  path
    .append("path")
    .attr("d", d => {
      return getStraightPath(d, addressPoints, scale);
      //FOR JAGGED LINES
      //return getLinePath(d, addressPoints, scale);
    })
    .attr("stroke", d => {
      let brightness = "hsl(100, 0%, " + d["connections"] + "%)";
      let saturation = "hsl(1, " + d["connections"] + "%, 50%)";
      let hue = "hsl(" + (d["connections"] % 360) + ", 100%, 50%)";
      d["colour"];
      return "black";
    })
    .attr("stroke-width", d => {
      return stroke;
    })
    .attr("fill", "none")
    /*.attr("stroke-opacity", d => {
      return d["size"];
    })*/

    //For the filter
    .attr("filter", d => {
      return d["filter"];
    })

    .attr("class", "line");
}

function getLinePath(d, addressPoints, scale) {
  let src = d["src"];
  let dst = d["dst"];
  let addPointsSrc = addressPoints[src];
  let addPointsDst = addressPoints[dst];

  let arrSrc = [scale(addPointsSrc["x"]), scale(addPointsSrc["y"])];
  let arrDst = [scale(addPointsDst["x"]), scale(addPointsDst["y"])];
  let maxPeakHeight, minDistance;
  let number = d["connections"];

  if (number < 2) {
    maxPeakHeight = 30;
    minDistance = 10;
  }
  if (number >= 2 && number < 5) {
    maxPeakHeight = 10;
    minDistance = 10;
  }
  if (number >= 5 && number <= 10) {
    maxPeakHeight = 1;
    minDistance = 5;
  }
  if (number > 10) {
    const [x1, y1] = arrSrc,
      [x2, y2] = arrDst;
    return "M " + x1 + " " + y1 + " " + "L " + x2 + " " + y2;
  }

  let path = "M ";
  const points = createJaggedPoints(arrSrc, arrDst, maxPeakHeight, minDistance);
  for (let index = 0; index < points.length; index++) {
    const [x, y] = points[index];
    if (index === 0) {
      path = path + x + " " + y;
    } else {
      path = path + " L " + x + " " + y;
    }
  }
  return path;
}

function getStraightPath(d, addressPoints, scale) {
  let src = d["src"];
  let dst = d["dst"];
  let addPointsSrc = addressPoints[src];
  let addPointsDst = addressPoints[dst];

  let arrSrc = [scale(addPointsSrc["x"]), scale(addPointsSrc["y"])];
  let arrDst = [scale(addPointsDst["x"]), scale(addPointsDst["y"])];
  const [x1, y1] = arrSrc,
    [x2, y2] = arrDst;
  return "M " + x1 + " " + y1 + " " + "L " + x2 + " " + y2;
}

function getRoof(x, y, shapeSize) {
  let path =
    "M " +
    (x - shapeSize * 1.5) +
    " " +
    (y - shapeSize) +
    " L " +
    x +
    " " +
    (y - shapeSize * 2.75) +
    " L " +
    (x + shapeSize * 1.5) +
    " " +
    (y - shapeSize);

  return path;
}

function getCenterColour(data, addressPoints) {
  x = addressPoints[data]["x"];
  y = addressPoints[data]["y"];

  if (x == 0.5 && y == 0.5) return "green";

  return "black";
}

function drawHouses(addressPoints, packets, svg, scale) {
  const shapeSize = 20;

  const rects = svg
    .selectAll("rect")
    .data(packets)
    .enter();

  const roof = svg
    .selectAll("path")
    .filter(".roof")
    .data(packets)
    .enter();

  rects
    .append("rect")
    .attr("x", d => {
      add = d["src"];
      points = addressPoints[add];
      return scale(points["x"]) - shapeSize;
    })
    .attr("y", d => {
      add = d["src"];
      points = addressPoints[add];
      return scale(points["y"]) - shapeSize;
    })
    .attr("height", shapeSize * 2)
    .attr("width", shapeSize * 2)
    .attr("fill", d => {
      return getCenterColour(d["src"], addressPoints);
    });

  rects
    .append("rect")
    .attr("x", d => {
      add = d["dst"];
      points = addressPoints[add];
      return scale(points["x"]) - shapeSize;
    })
    .attr("y", d => {
      add = d["dst"];
      points = addressPoints[add];
      return scale(points["y"]) - shapeSize;
    })
    .attr("height", shapeSize * 2)
    .attr("width", shapeSize * 2)
    .attr("fill", d => {
      return getCenterColour(d["dst"], addressPoints);
    });

  roof
    .append("path")
    .attr("d", d => {
      let x1 = scale(addressPoints[d["src"]]["x"]);
      let y1 = scale(addressPoints[d["src"]]["y"]);

      return getRoof(x1, y1, shapeSize);
    })
    .attr("fill", d => {
      return getCenterColour(d["src"], addressPoints);
    })
    .attr("class", "roof");

  roof
    .append("path")
    .attr("d", d => {
      let x2 = scale(addressPoints[d["dst"]]["x"]);
      let y2 = scale(addressPoints[d["dst"]]["y"]);

      return getRoof(x2, y2, shapeSize);
    })
    .attr("fill", d => {
      return getCenterColour(d["dst"], addressPoints);
    });
}
