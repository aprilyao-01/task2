// dimensions of the plot
const width = 400;
const height = 400;

// margins of the plot
const margin = {
	top: 40,
	right: 20,
	bottom: 20,
	left: 70
};

const bar_tooltip = d3.select("#bar-tooltip");

const svg = d3.select("#bar")
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("reliability_data.csv").then(data => {
	const x = d3.scaleBand()
	.range([0, width])
	.domain(data.map(d => d.location))
	.padding(0.2);

	svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x))
	.selectAll("text")
	.style("text-anchor", "end");

	const y = d3.scaleLinear()
	.domain([0, 100])
	.range([height, 0]);

	svg.append("g")
	.attr("class", "y axis")
	.call(d3.axisLeft(y));

	svg.selectAll("rect")
	.data(data)
	.enter()
	.append("rect")
	.attr("x", d => x(d.location))
	.attr("y", d => y(d.percent_missing))
	.attr("width", x.bandwidth())
	.attr("height", d => height - y(d.percent_missing))
	.attr("fill", "#69b3a2")
	.on("mouseover", (event, d) => showTooltip(event, d))
	.on("mouseout", hideTooltip);

	// Add axis labels
	svg.append("text")
	.attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top+15) + ")")
	.attr("text-anchor", "middle")
	.text("Location");

	svg.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 0 - margin.left)
	.attr("x", 0 - (height / 2))
	.attr("dy", "2em")
	.attr("text-anchor", "middle")
	.text("Percent of Missing Reports");

	function showTooltip(event, d) {
	const xPosition = event.pageX;
		const yPosition = event.pageY;

		bar_tooltip.html(`<p>Location: ${d.location}</p><p>Percent Missing: ${(d.percent_reliable*1).toFixed(2)}%</p>`)
		.style("left", xPosition + "px")
		.style("top", yPosition + "px")
		.classed("hidden", false);
	}

	function hideTooltip() {
		bar_tooltip.classed("hidden", true);
	}
})
.catch(error => {
	console.log(error)
});
