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

function setNoiseFilters(svg) {
  defs = svg.append("defs");

  let filterLow = defs
    .append("filter")
    .attr("id", "low")
    .append("feTurbulence")
    .attr("type", "fractalNoise")
    .attr("baseFrequency", 0.2)
    .attr("numOctaves", 1)
    .attr("stitchTiles", "noStitch")
    .attr("seed", "0")
    .attr("result", "f1");

  let filterLowMed = defs
    .append("filter")
    .attr("id", "lowMedium")
    .append("feTurbulence")
    .attr("type", "fractalNoise")
    .attr("baseFrequency", 0.4)
    .attr("numOctaves", 1)
    .attr("stitchTiles", "noStitch")
    .attr("seed", "0")
    .attr("result", "f1");

  let filterMed = defs
    .append("filter")
    .attr("id", "medium")
    .append("feTurbulence")
    .attr("type", "fractalNoise")
    .attr("baseFrequency", 0.6)
    .attr("numOctaves", 1)
    .attr("stitchTiles", "noStitch")
    .attr("seed", "0")
    .attr("result", "f1");

  let filterHighMed = defs
    .append("filter")
    .attr("id", "highMedium")
    .append("feTurbulence")
    .attr("type", "fractalNoise")
    .attr("baseFrequency", 1)
    .attr("numOctaves", 1)
    .attr("stitchTiles", "noStitch")
    .attr("seed", "0")
    .attr("result", "f1");

  appendThings(filterLow);
  appendThings(filterLowMed);
  appendThings(filterMed);
  appendThings(filterHighMed);
}

function appendThings(filter) {
  filter
    .append("feColorMatrix")
    .attr("type", "matrix")
    .attr("values", "-18 0 0 0 8     -18 0 0 0 8     -18 0 0 0 8     0 0 0 0 1")
    .attr("in", "f1")
    .attr("result", "f2");

  filter
    .append("feColorMatrix")
    .attr("type", "luminanceToAlpha")
    .attr("in", "f2")
    .attr("result", "f3");

  filter
    .append("feComposite")
    .attr("in", "SourceGraphic")
    .attr("in2", "f3")
    .attr("result", "f4")
    .attr("operator", "in");

  filter
    .append("feColorMatrix")
    .attr("type", "matrix")
    .attr(
      "values",
      "1 0 0 0 0.22      0 1 0 0 0.22      0 0 1 0 0.22      0 0 0 1 0"
    )
    .attr("in", "f4")
    .attr("result", "f5");

  let feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");
  feMerge.append("feMergeNode").attr("in", "f5");
}

function setSaturationFilters(svg) {
  let defs = svg.append("defs");

  defs
    .append("filter")
    .attr("id", "low")
    .append("feColorMatrix")
    .attr("in", "SourceGraphic")
    .attr("type", "saturate")
    .attr("values", "0.1");
  defs
    .append("filter")
    .attr("id", "lowMedium")
    .append("feColorMatrix")
    .attr("in", "SourceGraphic")
    .attr("type", "saturate")
    .attr("values", "0.2");

  defs
    .append("filter")
    .attr("id", "medium")
    .append("feColorMatrix")
    .attr("in", "SourceGraphic")
    .attr("type", "saturate")
    .attr("values", "0.4");

  defs
    .append("filter")
    .attr("id", "highMedium")
    .append("feColorMatrix")
    .attr("in", "SourceGraphic")
    .attr("type", "saturate")
    .attr("values", "0.8");
}

function setBlurFilters(svg) {
  defs = svg.append("defs");

  let filter = defs
    .append("filter")
    .attr("id", "low")
    .append("feGaussianBlur")
    .attr("class", "blur")
    .attr('stdDeviation', '20')
    .attr("result", "coloredBlur");

  let feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  filter = defs
    .append("filter")
    .attr("id", "lowMedium")
    .append("feGaussianBlur")
    .attr("class", "blur")
    .attr("stdDeviation", "10")
    //.attr("stdDeviation", "2")
    .attr("result", "coloredBlur");

  feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  filter = defs
    .append("filter")
    .attr("id", "medium")
    .append("feGaussianBlur")
    .attr("class", "blur")
    .attr('stdDeviation', '5')
    //.attr("stdDeviation", "1")
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
    //.attr("stdDeviation", "0.5")
    .attr("result", "coloredBlur");

  feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");
}
