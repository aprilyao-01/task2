d3.csv("mc1-reports-data.csv").then(function(data) {
    data.forEach(d=>{
        d.dateAndHour = d.time.slice(0,13)
    })
    // Parse the dateAndHour to JavaScript Date objects
    let parseDate = d3.timeParse("%Y-%m-%d %H");

    data.forEach(d => {
    d.dateAndHour = parseDate(d.dateAndHour);
    d.sewer_and_water = +d.sewer_and_water;
    d.power = +d.power;
    d.roads_and_bridges = +d.roads_and_bridges;
    d.medical = +d.medical;
    d.buildings = +d.buildings;
    });

    let dropdownDiv = d3.select("#dropdownDiv");

    let dropdown = dropdownDiv.append("select");

    //Before adding the options to the dropdown, we need to extract unique locations from the data.
    let uniqueLocations = Array.from(new Set(data.map(item => item.location)));

    //add options to the dropdown.
    let options = dropdown.selectAll("option")
    .data(uniqueLocations) // bind data
    .join("option") // create elements
    .text(d => d); // set the text

    // Create tooltip
    let tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    dropdown.on("change", function() {
    let location = d3.select(this).property("value");
    updateChart(location);
    });

    // SVG size
    let margin = {top: 20, right: 200, bottom: 50, left: 50};
    let width = 1350 - margin.left - margin.right;
    let height = 560 - margin.top - margin.bottom;

    // Create SVG
    let svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create scales
    let x = d3.scaleTime().range([0, width]).nice();
    let y = d3.scaleLinear().range([height, 0]).nice();
    let z = d3.scaleOrdinal(d3.schemeCategory10);

    // Create stack layout
    let stack = d3.stack()
    .keys(["sewer_and_water", "power", "roads_and_bridges", "medical", "buildings"]);

    // Create axes
    let xAxis = d3.axisBottom(x);
    let yAxis = d3.axisLeft(y);

    // Append axes
    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

    svg.append("g")
    .attr("class", "y axis");

    // Function to update chart
    function updateChart(location) {
         // Filter data based on location
        let filteredData = data.filter(d => d.location === location);

        // Group and average the data
        let groupedData = d3.group(filteredData, d => d.dateAndHour);
        let averagedData = Array.from(groupedData, ([key, value]) => ({
            dateAndHour: key,
            sewer_and_water: d3.mean(value, d => d.sewer_and_water),
            power: d3.mean(value, d => d.power),
            roads_and_bridges: d3.mean(value, d => d.roads_and_bridges),
            medical: d3.mean(value, d => d.medical),
            buildings: d3.mean(value, d => d.buildings)
        }));

        // Update scales
        x.domain(d3.extent(averagedData, d => d.dateAndHour));
        y.domain([0, d3.max(averagedData, d => d.sewer_and_water + d.power + d.roads_and_bridges + d.medical + d.buildings)]);
        z.domain(["sewer_and_water", "power", "roads_and_bridges", "medical", "buildings"]);

        // Create bars
        let bars = svg.selectAll("g.layer")
            .data(stack(averagedData), d => d.key);

        bars.exit().remove();

        bars.enter().append("g")
        .classed("layer", true)
            .attr("fill", d => z(d.key));

        bars = svg.selectAll("g.layer");

        let rects = bars.selectAll("rect")
            .data(d => d, e => e.data.dateAndHour);

        rects.exit()
            .transition()
            .duration(500)
            .attr("y", height)
            .attr("height", 0)
            .remove();

        rects.enter().append("rect")
            .attr("x", d => x(d.data.dateAndHour))
            .attr("y", height)
            .attr("width", (width / averagedData.length)-1)
            .attr("height", 0)
            .on("mouseover", function (event, d) {  // Mouseover event
                let timeFormat = d3.timeFormat("%m.%d %I %p");
                let startDate = d.data.dateAndHour;
                let endDate = new Date(startDate);
                endDate.setHours(endDate.getHours() + 1); // Add 1 hour
                
                tooltip.transition()
                  .duration(200)
                  .style("opacity", .9);
                tooltip.html(
                  "Time: " + timeFormat(startDate) + " to " + timeFormat(endDate) +
                  "<br/>Sewer and water: " + d.data.sewer_and_water.toFixed(2) +
                  "<br/>Power: " + d.data.power.toFixed(2) +
                  "<br/>Roads and bridges: " + d.data.roads_and_bridges.toFixed(2) +
                  "<br/>Medical: " + d.data.medical.toFixed(2) +
                  "<br/>Buildings: " + d.data.buildings.toFixed(2)
                )
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
              })
              .on("mouseout", function (d) {  // Mouseout event
                tooltip.transition()
                  .duration(500)
                  .style("opacity", 0);
              })
            .merge(rects)
              .transition()
              .duration(500)
              .attr("x", d => x(d.data.dateAndHour))
              .attr("y", d => y(d[1]))
              .attr("height", d => y(d[0]) - y(d[1]));

        // Update the axes
        svg.select(".x.axis")
            .transition()
            .duration(500)
            .call(xAxis);

        svg.select(".y.axis")
            .transition()
            .duration(500)
            .call(yAxis);
  }

  // Initial update
    updateChart(data[0].location);

    svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top+15) + ")")
      .style("text-anchor", "middle")
      .text("Date and Hour");

    // Add Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Average Damage Severity");


    // Legend
    let legend = svg.selectAll(".legend")
    .data(["sewer_and_water", "power", "roads_and_bridges", "medical", "buildings"].reverse())
    .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(30," + i * 20 + ")"; });

    legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", z);

    legend.append("text")
    .attr("x", width+5)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function(d) { return d; });
  
})
.catch(function(error) {
  console.log(error);
});
