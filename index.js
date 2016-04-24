$(document).ready(function() {
  // data variables
  var dataURL = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json";

  // display variables
  var margin = {
      top: 0,
      right: 0,
      bottom: 50,
      left: 0
    },
    width = 1000 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;
  var legendWidth = 700;

  var colors = ["#bcbd22","#8c564b", "#9467bd", "#d62728", "#2ca02c", "#ff7f0e","#1f77b4"];
  var years = [1750,1800,1850,1900,1950,2000];
  var labels = ["pre-1749","1750-1799","1800-1849","1850-1899","1900-1949","1950-1999","post-2000"]

  var projection = d3.geo.eckert3()
    .scale(175)
    .translate([width / 2, height / 2])
    .precision(.1);

  var path = d3.geo.path()
    .projection(projection);

  var svg = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // load and display the World
  d3.json("https://raw.githubusercontent.com/mbostock/topojson/master/examples/world-50m.json", function(error, topology) {

    g.selectAll("path")
      .data(topojson.object(topology, topology.objects.countries)
        .geometries)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#fff4e2")
      .attr("stroke", "#424242");

    // load and display the meteorite strike data
    d3.json(dataURL, function(json) {
      var d = [];
      json.features.forEach(function(entry, i) {
        if (entry.geometry != null) {
          var thisEntry = {
            name: entry.properties.name,
            date: new Date(entry.properties.year),
            mass: +entry.properties.mass,
            lat: entry.geometry.coordinates[1],
            lon: entry.geometry.coordinates[0]
          }
          d.push(thisEntry);
        }
      });


      // initialize tooltip
      var tip = d3.select(".content").append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden");

      // radius and color scales
      var radius = d3.scale.threshold().range([2, 3, 5, 10, 20]).domain([0, 10000, 100000, 1000000]);
      var color = d3.scale.threshold().range(colors).domain(years);

      // add data to map
      var points = svg.append("g")
        .selectAll("path")
        .data(d);

      points.enter()
        .append("circle");

      points
        .attr("cx", function(d) {
          return projection([d.lon, d.lat])[0];
        })
        .attr("cy", function(d) {
          return projection([d.lon, d.lat])[1];
        })
        .attr("r", function(d) {
          return radius(d.mass);
        })
        .style("fill", function(d) {
          return color(d.date.getFullYear());
        })
        .style("opacity", 0.6)
        .on("mouseover", function(d) {
          d3.select(this).attr("d", path).style("fill", "black");
          // Show tooltip
          tip.style("visibility", "visible")
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY + 10) + "px")
            .html("<span>Name:</span> "+ d.name + "<br>" +
                   "<span>Mass: "+ d.mass + "</span><br>" +
                   "<span>Year:</span> "+ d.date.getFullYear() + "<br>");
        })
        .on("mouseout", function(d) {
          // Reset color of dot
          d3.select(this).attr("d", path).style("fill", function(d) {
            return color(d.date.getFullYear());
          });
          // Hide tooltip
          tip.style("visibility", "hidden");
        });

      // add legend
      var legend = svg.selectAll(".legend")
        .data(colors);

      legend.enter().append("g")
        .attr("class", "legend");

      legend.append("text")
        .attr("class", "years")
        .text(function(d,i) {
          return labels[i];
        })
        .style("fill", function(d, i) {
          return d;
        })
        .style("opacity", 0.6)
        .attr("x", function(d, i) {
          return ((legendWidth/colors.length) * i + (width/2 - legendWidth/2) + (legendWidth/colors.length)/2);
        })
        .attr("y",height + margin.bottom-25)
        .style("text-anchor", "middle");

    });
  });
});
