var parseDate = d3.time.format("%Y-%m").parse,
    formatYear = d3.format("02d"),
    formatDate = function(d) { return "Q" + ((d.getMonth() / 3 | 0) + 1) + formatYear(d.getFullYear() % 100); };

var margin = {top: 10, right: 20, bottom: 20, left: 100},
    width = 940 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

var y0 = d3.scale.ordinal()
    .rangeRoundBands([height, 0], .2);

var y1 = d3.scale.linear();

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, 0);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(formatDate);

var nest = d3.nest()
    .key(function(d) { return d.group; });

var stack = d3.layout.stack()
    .values(function(d) { return d.values; })
    .x(function(d) { return d.date; })
    .y(function(d) { return d.value; })
    .out(function(d, y0) { d.valueOffset = y0; });

var color = d3.scale.category10();


d3.select("#render").on("click", function() {

    d3.selectAll("svg")
       .remove(); 
	  
	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	txt_value = document.getElementById('input_data').value;
    data = d3.csv.parse(txt_value);
	data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.value = +d.value;
  });

  var dataByGroup = nest.entries(data);

  stack(dataByGroup);
  x.domain(dataByGroup[0].values.map(function(d) { return d.date; }));
  y0.domain(dataByGroup.map(function(d) { return d.key; }));
  y1.domain([0, d3.max(data, function(d) { return d.value; })]).range([y0.rangeBand(), 0]);

  var group = svg.selectAll(".group")
      .data(dataByGroup)
    .enter().append("g")
      .attr("class", "group")
      .attr("transform", function(d) { return "translate(0," + y0(d.key) + ")"; });

  group.append("text")
      .attr("class", "group-label")
      .attr("x", -80)
      .attr("y", function(d) { return y1(d.values[0].value / 2); })
      .attr("dy", ".35em")
      .text(function(d) { return "Group " + d.key; });

  group.selectAll("rect")
      .data(function(d) { return d.values; })
    .enter().append("rect")
      .style("fill", function(d) { return color(d.group); })
      .attr("x", function(d) { return x(d.date); })
      .attr("y", function(d) { return y1(d.value); })
      .attr("width", x.rangeBand())
      .attr("height", function(d) { return y0.rangeBand() - y1(d.value); });

  group.filter(function(d, i) { return !i; }).append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + y0.rangeBand() + ")")
      .call(xAxis);
  
d3.select("#multiples").on("click", function() {


		var t = svg.transition().duration(750),
			g = t.selectAll(".group").attr("transform", function(d) { return "translate(0," + y0(d.key) + ")"; });
		g.selectAll("rect").attr("y", function(d) { return y1(d.value); });
		g.select(".group-label").attr("y", function(d) { return y1(d.values[0].value / 2); })

        d3.select("#multiples").classed("active", true);
        d3.select("#stacked").classed("active", false);
      });
	  
	  
d3.select("#stacked").on("click", function() {
		
	   
		var t = svg.transition().duration(750),
			g = t.selectAll(".group").attr("transform", "translate(0," + y0(y0.domain()[0]) + ")");
		g.selectAll("rect").attr("y", function(d) { return y1(d.value + d.valueOffset); });
		g.select(".group-label").attr("y", function(d) { return y1(d.values[0].value / 2 + d.values[0].valueOffset); })

        d3.select("#multiples").classed("active", false);
        d3.select("#stacked").classed("active", true);
      });

});
