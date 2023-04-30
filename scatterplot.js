const tooltip = d3.select("#scatter-tooltip");

// Create neighborhoods details
const neighborhoods = [
  { id: "1", name: "1. Palace Hills" },
  { id: "2", name: "2. Northwest" },
  { id: "3", name: "3. Old Town" },
  { id: "4", name: "4. Safe Town" },
  { id: "5", name: "5. Southwest" },
  { id: "6", name: "6. Downtown" },
  { id: "7", name: "7. Wilson Forest" },
  { id: "8", name: "8. Scenic Vista" },
  { id: "9", name: "9. Broadview" },
  { id: "10", name: "10. Chapparal" },
  { id: "11", name: "11. Terrapin Springs" },
  { id: "12", name: "12. Pepper Mill" },
  { id: "13", name: "13. Cheddarford" },
  { id: "14", name: "14. Easton" },
  { id: "15", name: "15. Weston" },
  { id: "16", name: "16. Southton" },
  { id: "17", name: "17. Oak Willow" },
  { id: "18", name: "18. East Parton" },
  { id: "19", name: "19. West Parton" }
];

const neighborhoodSelect = d3.select("#nb-select");

neighborhoodSelect.selectAll("option")
  .data(neighborhoods)
  .enter()
  .append("option")
  .attr("value", d => d.id)
  .text(d => d.name);


// create a new scatterPlot element
const scatterPlot = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// set up scales for x and y axis
const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

// create x and y axis
const xAxis = scatterPlot.append("g")
                          .attr("transform", "translate(0," + height + ")")
                          .attr("class", "axis");
const yAxis = scatterPlot.append("g")
                          .attr("class", "axis");

// Add axis labels
scatterPlot.append("text")
    .attr("transform", "translate(" + (width/2) + " ," + 
                  (height + margin.top+15) + ")")
    .attr("text-anchor", "middle")
    .text("Shake Intensity");

scatterPlot.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "2em")
    .attr("text-anchor", "middle")
    .text("Reported Building Damage");

// load data from csv file
d3.csv("mc1-reports-data.csv").then(data => {
    updatePlot(data, "1");
})
.catch(error => {
    console.log(error);
});

// function to update the plot based on selected location
function updatePlot(data, locationFilter) {

  // converts to a number
  data.forEach(d => {
      d.shake_intensity = +d.shake_intensity;
      d.buildings = +d.buildings;
      d.location = +d.location;
  });

  xScale.domain(d3.extent(data, d => d.shake_intensity));
  yScale.domain(d3.extent(data, d => d.buildings));

  const filteredData = data.filter(d => d.location === +locationFilter);
  xAxis.call(d3.axisBottom(xScale));
  yAxis.call(d3.axisLeft(yScale));

  const circles = scatterPlot.selectAll("circle")
      .data(filteredData, d => d.time);

  circles.exit().remove();

  // set diff colour to diff location
  const colorScale = d3.scaleOrdinal()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
    .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#98abc5", "#ffbb78", "#c5b0d5", "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5", "#aec7e8"]);

  // add new circles with tooltip
  circles.enter()
        .append("circle")
        .merge(circles)
        .attr("cx", d => xScale(d.shake_intensity))
        .attr("cy", d => yScale(d.buildings))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.location))
        .attr("stroke", "none")
        .on("mouseover", (event, d) => updateTooltip(event, d))
        .on("mousemove", (event, d) => updateTooltip(event, d))
        .on("mouseout", hideTooltip);
}

// on menu selection change
neighborhoodSelect.on("change", function() {
  const location = this.value;

  // load date and update the plot
  d3.csv("/../mc1-reports-data.csv").then(data => {
    updatePlot(data, location);
  }).catch(error => {
    console.log(error);
  });
});

// Update the tooltip content and position
function updateTooltip(event, d) {
  // Get the x/y values and adjust the position
  const xPosition = event.pageX;
  const yPosition = event.pageY;

  // Update the tooltip position and value
  tooltip.style("left", xPosition + "px")
         .style("top", yPosition + "px");

  d3.select("#shake")
      .text(d.shake_intensity);

  d3.select("#building")
      .text(d.buildings);

  // Show the tooltip
  tooltip.classed("hidden", false);
}

// Hide the tooltip
function hideTooltip() {
  // Hide the tooltip
  tooltip.classed("hidden", true);
}