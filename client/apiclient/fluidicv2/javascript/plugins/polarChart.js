var width = 260,height = 240;
  // radius1 = Math.min(width, height) / 1.6,
    

var color = d3.scaleLinear()
    .range(["hsl(-180,50%,50%)", "hsl(180,50%,50%)"])//No I18N
    .interpolate(interpolateHsl);

var nodata = [{
    Count: 0,
    Label: "No Data",//No I18N
    Status: 5,
    colors: "#7f7f7f",//No I18N
    dVal: 0.7518796992481203,
    index: 0.2,
    text: "No Data",//No I18N
    value: 0.7518796992481203,
    wid: 33.234375,
    y: 12
}];

var field;
function drawPolarChart(elm,data,stroke, onClickCallback, onOutCallback,options,myself)
{
  if(options===undefined){
    options={};
  }
  if(data.length === 0)
  {
    data = [{
	    Count: 0,
	    Label: Ember.I18n.t("webclient.dials.nodata", this),//No I18N
	    Status: 5,
	    colors: "#7f7f7f",//No I18N
	    dVal: 0.7518796992481203,
	    index: 0.2,
	    text: Ember.I18n.t("webclient.dials.nodata", this),//No I18N
	    value: 0.7518796992481203,
	    wid: 33.234375,
	    y: 12
	}];
    stroke = 0.6000000000000001;
    $(elm+" .barHolder").removeAttr("barHolder");//No I18N
    $(elm+" .barHolder").addClass("barHolder data_1");//No I18N
  }
  if(options.showLabelCount){
    $(elm+" .barHolder").addClass("countView");//No I18N
  }
  var width = (options.showLabelCount)?290:260;
  var radius = Math.min(width, height) / stroke;
  var spacing = .09;
  var arc = d3.arc()
    .startAngle(0)
    .endAngle(function(d) { return d.value * 2 * Math.PI; })
    .innerRadius(function(d) { return d.index * radius; })
    .outerRadius(function(d) { return (d.index + spacing) * radius; });
     $(elm+" .barHolder svg").remove();
     
var svg = d3.select(elm+" .barHolder").append("svg")//No I18N
    .attr("width", width)//No I18N
    .attr("height", height)//No I18N
  .append("g")//No I18N
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");//No I18N


   $(elm+" .barHolder svg").after($(elm+" .barHolder #barInfoReset"));//No I18N

 field = svg.selectAll("g")//No I18N
    .data(data)
  .enter().append("g");//No I18N

 field.attr("class", function(d) {return (d.classStr); })//No I18N

  field.append("path");//No I18N

  field.append("text");//No I18N

  drawPath(data,elm,arc,radius,spacing, onClickCallback, onOutCallback,options,myself)
  d3.select(self.frameElement).style("height", height + "px");//No I18N
}


function drawPath(data,pId,arc,radius,spacing, callback, onOutCallback,options,self) {
  var tmpid = pId.substring(1,pId.length);
  field = field
      .each(function(d) { this._value = d.value; })
      .data(data)
      .each(function(d) { d.previousValue = this._value; });

  field.select("path")//No I18N
    .transition()
      .ease(d3.easeElastic)//No I18N
      .attrTween("d", function(d){//No I18N
        var i = d3.interpolateNumber(d.previousValue, d.value);
        return function(t) { d.value = i(t); return arc(d); };
      })//No I18N
      .attr("fill", function(d) { return (d.colors); })//No I18N
      .attr("data-color", function(d) { return (d.colors); })//No I18N
      .attr("id", function(d) { return tmpid+"_path_"+(d.Status); })//No I18N
      
      field.select("path")//No I18N
      .attr("class", function(d) {return (d.classStr); })//No I18N

  field.select("text")//No I18N
  .attr("x", function(d) { return -10 })//No I18N
  .attr("y",function(d) { return -(((d.index + spacing) * radius)) + (10 + d.y); })//No I18N
  .text(function(d) { return d.text})
  .attr("text-anchor","end")//No I18N
  .attr("class","svgTxt")//No I18N
  .attr("id", function(d) {d.wid = this.getBBox().width;return tmpid+"_text_"+(d.Status); })//No I18N
 
  field.insert("text", "text")//No I18N
  .attr("x", function(d) {return -(d.wid + 16) })//No I18N
  .attr("y",function(d) { return -(((d.index + spacing) * radius)) + (10 + d.y); })//No I18N
  .html(function(d) { return "&#10004;";})//No I18N
  .attr("text-anchor","end")//No I18N
  .attr("class","svgTickMark");//No I18N


  field.selectAll("path,text").on("click", function(d, i){//No I18N
	  if(callback != undefined) {
		  callback(this,d,i,pId);
	  } else {
		  opm_polarChartClickEvent(this,d,i,pId,options,self);
	  }
  });

   field.selectAll("path,text").on("mouseover", function(d, i){//No I18N
      opm_polarChartOverEvent(this,d,i,pId);
   });

   field.selectAll("path,text").on("mouseout", function(d, i){//No I18N
	   if(onOutCallback != undefined) {
		   onOutCallback(this,d,i,pId);
	   } else {
		   opm_polarChartOutEvent(this,d,i,pId,options);
	   }
  });
}


function interpolateHsl(a, b) {
  var i = d3.interpolateString(a, b);
  return function(t) {
    return d3.hsl(i(t));
  };
}
