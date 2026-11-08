//$Id$
/*
 *
 *

 This file taken from D3 example gallery and modified.
  https://github.com/mbostock/d3/wiki/Gallery
  https://bl.ocks.org/COLTstreet/44d1bfec7edb0e60aacb35841f625e53
 *  
 *
*/
function sunburst(divName,jsonDataChanined)
{
    var root = $.extend(true,{},jsonDataChanined);
    var width = 650,
    height = 700,
    radius = (Math.min(width, height) / 2) - 5;
    var formatNumber = d3.format(',d');//No I18N
    var x = d3.scaleLinear().range([0, 2 * Math.PI]);
    var y = d3.scaleLinear().range([0, radius]);
    var color = d3.scaleOrdinal([
        "#3182bd",//No I18N
        "#6baed6",//No I18N
        "#9ecae1",//No I18N
        "#c6dbef",//No I18N
        "#e6550d",//No I18N
        "#fd8d3c",//No I18N
        "#fdae6b",//No I18N
        "#fdd0a2",//No I18N
        "#31a354",//No I18N
        "#74c476",//No I18N
        "#a1d99b",//No I18N
        "#c7e9c0",//No I18N
        "#756bb1",//No I18N
        "#9e9ac8",//No I18N
        "#bcbddc",//No I18N
        "#dadaeb",//No I18N
        "#636363",//No I18N
        "#969696",//No I18N
        "#bdbdbd",//No I18N
        "#d9d9d9"//No I18N
    ]);
    var partition = d3.partition();
    var arc = d3.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI,x(d.x0)));})
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));})
        .innerRadius(function(d) { return Math.max(0, y(d.y0));})
        .outerRadius(function(d) { return Math.max(0, y(d.y1));});
    var svg = d3.select("#"+divName).append("svg")//No I18N
        .attr("width", width)//No I18N
        .attr("height", height)//No I18N
        .append("g")//No I18N
        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");//No I18N
    root = d3.hierarchy(root).count();
    svg.selectAll("path")//No I18N
        .data(partition(root).descendants())
        .enter().append("g").attr("class", "node");//No I18N

    path = svg.selectAll(".node")//No I18N
        .append("path")//No I18N
        .attr("d", arc)//No I18N
        .style("fill", function(d) {//No I18N
            if(d.data.val!= null){
                return d.data.val;
            }else{
                return color((d.children ? d : d.parent).data.name)
            }
        })
    .on("click", click);//No I18N

    text = svg.selectAll(".node")//No I18N
        .append("text")//No I18N
        .attr("transform", function(d) { //No I18N
            return  "rotate(" + computeTextRotation(d) + ")"; //No I18N
        })
        .attr("x", function(d) { //No I18N
            return y(d.y0); 
        })
        .attr("dx", "6") //No I18N
        .attr("dy", ".35em") //No I18N
        .text(function(d) { 
            return d.data.name === "root" ? "" : d.data.name//No I18N
        });

    function click(d){
        //Hide text while Sunburst transitions
        text.transition().attr("opacity", 0);//No I18N
        svg.transition()
            .duration(750)
            .tween("scale", function() {//No I18N
                var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                yd = d3.interpolate(y.domain(), [d.y0, 1]),
                yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
                return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
            })
            .selectAll("path")//No I18N
            .attrTween("d", function(d) { return function() { return arc(d); }; })//No I18N
            .on("end", function(e, i) {//No I18N
            // Check if the animated element's data e lies within the visible 
            // angle span given in d:
            if (e.x0 >= d.x0 && e.x0 < d.x1) {
                // get a selection of the associated text element
                var arcText = d3.select(this.parentNode).select("text");//No I18N
                // fade in the text element and recalculate positions
                arcText.transition().duration(750)
                    .attr("opacity", 1)//No I18N
                    .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })//No I18N
                    .attr("x", function(d) { return y(d.y0); })//No I18N
                    .text(function(d) { 
                    return d.data.name === "root" ? "" : d.data.name//No I18N
                });
            }
        });
    }
    d3.select(self.frameElement).style("height", height + "px");//No I18N

    // Interpolate the scales!
    function arcTween(d) {
        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
        yd = d3.interpolate(y.domain(), [d.y, 1]),
        yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
        return function(d, i) {
            return i? function(t) { return arc(d); }: function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
        };
    }

    function computeTextRotation(d) {
        if(d.data!==undefined && d.data.name==="Chassis"){//No I18N
            return 0;
        }
        var angle = (x((d.x0 + d.x1)/2) - Math.PI / 2) / Math.PI * 180;
        return (angle >  90 || angle < 270) ?  angle : 180 + angle ;
    }
}
