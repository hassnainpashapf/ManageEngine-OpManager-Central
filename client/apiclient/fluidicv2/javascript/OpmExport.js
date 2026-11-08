
//$Id$

/* OpmExport.js
 * Report as Pdf implementation. Need to Update this js if new chart comes, or any update in thirdparty js file used for generating chart
 * 2014-09-23
 *
 * By Athavan.AP
 */

(function($) {
    $.fn.generatePDF = function(data) {
        var properties = $.extend({
            logopath: "",
            pdfContentStart: 10,
            chartattributes: {
                'inline': ['fill', 'fill-opacity', 'shape-rendering', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration', 'text-rendering', 'visibility', 'word-spacing', 'writing-mode', 'position', 'left', 'top', 'opacity']//No I18N
            },
            chartelements: {
                'inline': ['animate', 'animatecolor', 'animatemotion', 'animatetransform', 'mpath', 'set', 'circle', 'ellipse', 'line', 'polygon', 'polyline', 'rect', 'a', 'defs', 'glyph', 'g', 'marker', 'mask', 'missing-glyph', 'pattern', 'svg', 'switch', 'symbol', 'desc', 'title', 'feblend', 'fecolormatrix', 'fecomponenttransfer', 'fecomposite', 'feconvolvematrix', 'fediffuselighting', 'fedisplacementmap', 'feflood', 'fefunca', 'fefuncb', 'fefuncg', 'fefuncr', 'fegaussianblur', 'feimage', 'femerge', 'femergenode', 'femorphology', 'feoffset', 'fespecularlighting', 'fetile', 'feturbulence', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'hkern', 'vkern', 'lineargradient', 'radialgradient', 'stop', 'image', 'path', 'use', 'fedistantlight', 'fepointlight', 'fespotlight', 'altglyphdef', 'altglyphitem', 'glyphref', 'textpath', 'text', 'tref', 'altglyph', 'tspan', 'clippath', 'color-profile', 'cursor', 'filter', 'foreignobject']//No I18N
            },
            headerString: "",
            sourceHTMLString: "",
            customRenderer: "",
            toHide: "",
			isMultiplePage:false,
			contentheight:"",
			contentwidth:"",
			pagewidth:"",
			pageheight:"",
			separationClassName:"",
			pageorientation:"l",//NO I18N
			hideByClassName:'',//No I18N
			frontPage:'',//NO I18N
            sendMail:false,
            isNFAGraph:false
        }, data); 
        try
        {
            var logoElement = getLogoElement(properties.logopath);
            var headerElement = wrapHeaderElement(properties.headerString);
            var mainDivTobeConv = "#" + $(this).attr('id');
            setContentHeight(properties.pdfContentStart);
            var chartName = properties.customRenderer;
			if(chartName==="jqGrid")
				{
					$(".ui-state-default.ui-jqgrid-pager.ui-corner-bottom").hide();
					getPDFForJqgrid(mainDivTobeConv, headerElement, logoElement, properties.toHide,properties.separationClassName,properties.isMultiplePage,chartName);
				}
				
			/*if (chartName !== undefined && chartName !== null && chartName !== "")
            {
                chartToPDF($(this).attr('id'), chartName, headerElement, logoElement);
            }
			

*/
			else if (chartName==="html")
			{
			generatePdfFromHtml(mainDivTobeConv, headerElement, logoElement, properties.toHide,properties.separationClassName,properties.isMultiplePage,chartName,properties.contentwidth,properties.contentheight,properties.pagewidth,properties.pageheight,properties.pageorientation,properties.hideByClassName)
			}
			else if (chartName==="splithtml")
			{
			generatePdfFromSplitHtml(mainDivTobeConv, headerElement, logoElement, properties.toHide,properties.separationClassName,properties.isMultiplePage,chartName,properties.contentwidth,properties.contentheight,properties.pagewidth,properties.pageheight,properties.pageorientation,properties.hideByClassName,properties.frontPage,properties.sendMail,properties.isNFAGraph,properties.footerText)
			}
            else
            {
                generatePdfForAllowsvg(mainDivTobeConv, headerElement, logoElement, properties.toHide,properties.separationClassName,properties.isMultiplePage,chartName);
            }
        }
        catch (err)
        {
            $('body').removeClass('disableBodyClick');
            destructPDFelement();
            enableIDForPDF(properties.toHide);
           // console.log(err.message);
        }
    }
})(jQuery);


var pdfContentStart = 10;
var svgRules = {
     'propertyGroups': {//No I18N
        'inline': ['padding','margin','background-image','overflow-x','fill', 'fill-opacity', 'shape-rendering', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration', 'text-rendering', 'visibility', 'word-spacing', 'writing-mode', 'position', 'left', 'top', 'opacity'],'block':['overflow']//No I18N
    },
    'elementGroups': {//No I18N
        'inline': ['animate', 'animatecolor', 'animatemotion', 'animatetransform', 'mpath', 'set', 'circle', 'ellipse', 'line', 'polygon', 'polyline', 'rect', 'a', 'defs', 'glyph', 'g', 'marker', 'mask', 'missing-glyph', 'pattern', 'svg', 'switch', 'symbol', 'desc', 'title', 'feblend', 'fecolormatrix', 'fecomponenttransfer', 'fecomposite', 'feconvolvematrix', 'fediffuselighting', 'fedisplacementmap', 'feflood', 'fefunca', 'fefuncb', 'fefuncg', 'fefuncr', 'fegaussianblur', 'feimage', 'femerge', 'femergenode', 'femorphology', 'feoffset', 'fespecularlighting', 'fetile', 'feturbulence', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'hkern', 'vkern', 'lineargradient', 'radialgradient', 'stop', 'image', 'path', 'use', 'fedistantlight', 'fepointlight', 'fespotlight', 'altglyphdef', 'altglyphitem', 'glyphref', 'textpath', 'text', 'tref', 'altglyph', 'tspan', 'clippath', 'color-profile', 'cursor', 'filter', 'foreignobject', 'canvas']//No I18N
    }};
function generatePDF(sourceElement, chartName, isjqGrid, isHtmlPage, headerElement, logopath, contentHeight)
{
    var logoElement = getLogoElement('images/opmanager_logo_report.gif');//No I18N
    headerElement = wrapHeaderElement(headerElement);
    setContentHeight(contentHeight);
    if (chartName !== undefined && chartName !== null && chartName !== "")
    {
        chartToPDF(sourceElement, chartName, headerElement, logoElement);
    }

    else
    {
        var mainDivTobeConv = "#" + sourceElement;
        getPDFForHtml(mainDivTobeConv, headerElement, logoElement);
    }

}

function chartToPDF(sourceElement, chartName, headerElement, logoElement)
{
    var mainDivTobeConv = "#" + sourceElement;   
    if(($(mainDivTobeConv).height() / 3)>6000)
    {
        alert(Ember.I18n.t("webclient.reports.exceed.alert",this)); //No I18n
        return;
    }
    if (chartName === "Rickshaw")
    {
        generatePdfForChart(mainDivTobeConv, headerElement, logoElement);
    }
    else if (chartName === "svg")
    {
        generatePdfForAllowsvg(mainDivTobeConv, headerElement, logoElement);
    }
    else if (chartName === "jqGrid")
    {
        getPDFForJqgrid(mainDivTobeConv, headerElement, logoElement);
    }

    else
    {
        getPDFForHtml(mainDivTobeConv, headerElement, logoElement);
    }
}

function setContentHeight(contentHeight)
{
    if (contentHeight !== undefined && contentHeight !== null && contentHeight !== "" && isCorrectValue(contentHeight))
    {
        pdfContentStart = contentHeight;
    }
}

function isCorrectValue(contentHeight) {
    return parseFloat(contentHeight) === contentHeight >>> 0;
}

function wrapHeaderElement(headerElement)
{
    headerElement = '<div id="header_pdf_remove">' + headerElement + '<div>';
    return headerElement;
}

function getLogoElement(path)
{
    if (path !== undefined && path !== "" && path !== null)
    {
        var element = "<div id='logo_pdf_remove'><div><img src='" + path + "' width='150' height='50'/></div><div style='height:10pt'></div></div>";
        return element;
    }
    return "";
}

var pdfDivElement = '<div id="PDFDivElement"></div>'; //No I18N
function generatePdfForChart(mainDivTobeConv, headerElement, logoElement)
{
    var divID = "#PDFDivElement"; //No I18N
    constructPDFelement(mainDivTobeConv);
    $(divID).empty();
    $(divID).show();
    $(divID).append($(mainDivTobeConv).html());
    $(divID).css("background-color", "#FFFFFF");
    $(divID).prepend(headerElement);
    $(divID).prepend(logoElement);
				
    $.each($('#PDFDivElement div[id^=zcContain_reportgrap_]'), function() {
        var idval = this.id;
        var maindiv = $(this);
        $(this).css("background-color", "#FFFFFF");
        var g1, g2;
        $($(this)).find('svg').each(function(index) {
            canvas = document.createElement('canvas');

            canvas.setAttribute('width', 1000);
            canvas.setAttribute('height', 380);
            canvas.setAttribute('position', 'relative');

            if (canvas.getContext && canvas.getContext('2d')) {
                $(this).inlineStyler(svgRules);
                var idvalue = idval + "_SVGElement"; //No I18N
                var serializer = new XMLSerializer();
                var str = serializer.serializeToString($(this).get(0));
                canvas = document.createElement('canvas');
                canvas.setAttribute("id", idvalue);
                canvas.setAttribute('width', 1000);
                canvas.setAttribute('height', 380);
                var img = canvas.toDataURL("image/png"); //No I18N
                 $(this).before(str).remove();

                $(this).append('<div style="height:10pt"></div>')
            }
            ;
        }

        );
    });


    html2canvas($(divID), {
        onrendered: function(canvas) {
            var ctx = canvas.getContext('2d'); //No I18N
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;
           // var img = canvas.toDataURL("image/jpeg"); //No I18N
            //window.open(img);
           var img1 = canvas.toDataURL("image/png"); //No I18N
            var imgData = canvas.toDataURL("image/jpeg", 2.0);//No I18N
            var heightval; //No I18N
            if (($(divID).height() / 3) < 280)
            {
                heightval = 280;
            }
            else
            {
                heightval = ($(divID).height() / 3);//No I18N
            }
            var pdf = new jsPDF('p', 'mm', [310, heightval]); //No I18N
            pdf.addImage(imgData, 'jpeg', 10, pdfContentStart);//No I18N
            pdf.save("Report.pdf");//No I18N
            $(divID).remove();
        }
    });
    //
}

function getPDFForJqgrid(mainDivTobeConv, headerElement, logoElement, toHide,separationClassName,isMultiplePage,chartName)
{
  
    $(mainDivTobeConv).parent().css("background-color", "#FFFFFF");
   // $(mainDivTobeConv).inlineStyler(svgRules);
	
	
	if(toHide!==""&&toHide!==undefined)
	{
		disableIDForPDF(toHide);
	}
    var $text=$(mainDivTobeConv).parent();
	var heightval=150; //No I18N
	$(mainDivTobeConv+" ."+separationClassName).each(function(index){
	if(heightval<parseFloat($(this).css('height'))*0.5)
	{
	heightval=parseFloat($(this).css('height'))*0.5
	}
	});
	var pdf = new jsPDF('p', 'mm', [320, heightval]); //No I18N
	var total=$("."+separationClassName).length;
	var counter=0;
	var html_string_parent;
	html_string_parent=logoElement;
   html_string_parent=html_string_parent+headerElement;
   $('body').addClass('disableBodyClick');
   opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.report.pdf.export.info",this));//No I18N
   $(mainDivTobeConv+" ."+separationClassName).each(function(index){
	$(this).inlineStyler();
  var html_string=html_string_parent+$(this).html();	 
setTimeout(function(){
	var iframe=document.createElement('iframe');
	document.body.appendChild(iframe);
    var iframedoc=iframe.contentDocument||iframe.contentWindow.document;
    iframedoc.body.innerHTML=html_string;
    html2canvas(iframedoc.body, {background:'#fff',//No I18N
        onrendered: function(canvas) {
			document.body.removeChild(iframe);
			var imgData = canvas.toDataURL("image/jpeg", 1.0);//No I18N
            if (($(mainDivTobeConv).height() / 3) < 310)
            {
                heightval = 310;
            }
            else
            {
                heightval = ($(mainDivTobeConv).height() / 3);//No I18N
            }

             pdf.addImage(imgData, 'JPEG', 10, pdfContentStart,330,(canvas.height/3.5));//No I18N
           
            destructPDFelement(mainDivTobeConv);
           // enableIDForPDF(toHide);
			counter++;
	
		if(counter===total){
		
				 pdf.save("Report.pdf");//No I18N
				 $('body').removeClass('disableBodyClick');
				 $(".ui-state-default.ui-jqgrid-pager.ui-corner-bottom").show();
			}
			pdf.addPage();
			
        }
    });
}, 10);
   /*
  // $('.reportGraphContainer').scrollTop(($('#reportgrap_2').parent().offset())-155)
   html2canvas(this, {'background':'#fff',
   
   
   	
   
   
   
   
        onrendered: function(canvas) {
		
		
	
		
		
            var ctx = canvas.getContext('2d'); //No I18N
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;
			
			
            var imgData = canvas.toDataURL("image/jpeg", 1.0);//No I18N
           
            // var img = canvas.toDataURL("image/jpeg"); //No I18N
            window.open(imgData);
       
            if (($(mainDivTobeConv).height() / 3) < 310)
            {
                heightval = 310;
            }
            else
            {
                heightval = ($(mainDivTobeConv).height() / 3);//No I18N
            }
            
            pdf.addImage(imgData, 'JPEG', 10, pdfContentStart,300,150);//No I18N
           pdf.addPage();
            destructPDFelement(mainDivTobeConv);
           // enableIDForPDF(toHide);
			counter++;
console.log(counter+" "+total);		
		if(counter===total){
		
				 pdf.save("Report.pdf");//No I18N
			}
        }
		
    });
	*/
	})

	
	
	
    //
}

function generatePdfForAllowsvg(mainDivTobeConv, headerElement, logoElement, toHide,separationClassName,isMultiplePage,chartName)
{
    $(mainDivTobeConv).parent().css("background-color", "#FFFFFF");
   // $(mainDivTobeConv).inlineStyler(svgRules);
	
	
	if(toHide!==""&&toHide!==undefined)
	{
		disableIDForPDF(toHide);
	}
    var $text=$(mainDivTobeConv).parent();
	var heightval=150; //No I18N
	$(mainDivTobeConv+" ."+separationClassName).each(function(index){
	if(heightval<parseFloat($(this).css('height'))*0.4)
	{
	heightval=parseFloat($(this).css('height'))*0.4
	}
	});
	var pdf = new jsPDF('l', 'mm', [320, heightval]); //No I18N
	var total=$("."+separationClassName).length;
	var counter=0;
	var html_string_parent;
	html_string_parent=logoElement;
   html_string_parent=html_string_parent+headerElement;
   $('body').addClass('disableBodyClick');
   opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.report.pdf.export.info",this));//No I18N
   $(mainDivTobeConv+" ."+separationClassName).each(function(index){
  var html_string=html_string_parent+$(this).html();	 
setTimeout(function(){
	var iframe=document.createElement('iframe');
	document.body.appendChild(iframe);
    var iframedoc=iframe.contentDocument||iframe.contentWindow.document;
    iframedoc.body.innerHTML=html_string;
    html2canvas(iframedoc.body, {background:'#fff',//No I18N
        onrendered: function(canvas) {
			document.body.removeChild(iframe);
			var imgData = canvas.toDataURL("image/jpeg", 1.0);//No I18N
            if (($(mainDivTobeConv).height() / 3) < 310)
            {
                heightval = 310;
            }
            else
            {
                heightval = ($(mainDivTobeConv).height() / 3);//No I18N
            }

             pdf.addImage(imgData, 'JPEG', 10, pdfContentStart,310,(canvas.height/3.25));//No I18N
           
            destructPDFelement(mainDivTobeConv);
           // enableIDForPDF(toHide);
			counter++;
	
		if(counter===total){
		
				 pdf.save("Report.pdf");//No I18N
				 $('body').removeClass('disableBodyClick');
			}
			pdf.addPage();
			
        }
    });
}, 10);
   /*
  // $('.reportGraphContainer').scrollTop(($('#reportgrap_2').parent().offset())-155)
   html2canvas(this, {'background':'#fff',
   
   
   	
   
   
   
   
        onrendered: function(canvas) {
		
		
	
		
		
            var ctx = canvas.getContext('2d'); //No I18N
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;
			
			
            var imgData = canvas.toDataURL("image/jpeg", 1.0);//No I18N
           
            // var img = canvas.toDataURL("image/jpeg"); //No I18N
            window.open(imgData);
       
            if (($(mainDivTobeConv).height() / 3) < 310)
            {
                heightval = 310;
            }
            else
            {
                heightval = ($(mainDivTobeConv).height() / 3);//No I18N
            }
            
            pdf.addImage(imgData, 'JPEG', 10, pdfContentStart,300,150);//No I18N
           pdf.addPage();
            destructPDFelement(mainDivTobeConv);
           // enableIDForPDF(toHide);
			counter++;
console.log(counter+" "+total);		
		if(counter===total){
		
				 pdf.save("Report.pdf");//No I18N
			}
        }
		
    });
	*/
	})

	
	
	
    //
}



function generatePdfFromHtml(mainDivTobeConv, headerElement, logoElement, toHide,separationClassName,isMultiplePage,chartName,divwidth,divheight,pagewidth,pageheight,orientation,hideByClassName)
{
    $(mainDivTobeConv).parent().css("background-color", "#FFFFFF");
	if(toHide!==""&&toHide!==undefined)
	{
		disableIDForPDF(toHide);
	}
	var heightval=150; //No I18N
	var orien=orientation == undefined ?"l":orientation;//NO I18N
	var pdf = new jsPDF(orien, 'mm', [pagewidth, pageheight]); //No I18N
	var total=$(mainDivTobeConv+" ."+separationClassName).length;
	var counter=0;
	var html_string_parent;
	html_string_parent=logoElement;
   html_string_parent=html_string_parent+headerElement;
   $('body').addClass('disableBodyClick');
   opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.report.pdf.export.info",this));//No I18N
   $(mainDivTobeConv+" ."+separationClassName).each(function(index){
  var html_string=html_string_parent+$(this).html();	 
setTimeout(function(){
	var iframe=document.createElement('iframe');
	document.body.appendChild(iframe);
    var iframedoc=iframe.contentDocument||iframe.contentWindow.document;
    iframedoc.body.innerHTML=html_string;
    if(hideByClassName != "" && hideByClassName!= undefined){
    	var hideClass = hideByClassName.split(",");
        for (var i = 0; i < hideClass.length; i++)
        {
        	var elem=iframedoc.getElementsByClassName(hideClass[i]);
            for (var i = 0; i < elem.length; i ++) {
            	elem[i].style.display = 'none';
            }
        }
    	
    }
    html2canvas(iframedoc.body, {background:'#fff',//No I18N
        onrendered: function(canvas) {
			document.body.removeChild(iframe);
			var imgData = canvas.toDataURL("image/jpeg", 1.0);//No I18N
             pdf.addImage(imgData, 'JPEG', 10, pdfContentStart);//No I18N
           
            destructPDFelement(mainDivTobeConv);
           // enableIDForPDF(toHide);
			counter++;
	
		if(counter===total){
		
				 pdf.save("Report.pdf");//No I18N
				 $('body').removeClass('disableBodyClick');
			}
			pdf.addPage();
			
        }
    });
}, 10);
   /*
  // $('.reportGraphContainer').scrollTop(($('#reportgrap_2').parent().offset())-155)
   html2canvas(this, {'background':'#fff',
   
   
   	
   
   
   
   
        onrendered: function(canvas) {
		
		
	
		
		
            var ctx = canvas.getContext('2d'); //No I18N
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;
			
			
            var imgData = canvas.toDataURL("image/jpeg", 1.0);//No I18N
           
            // var img = canvas.toDataURL("image/jpeg"); //No I18N
            window.open(imgData);
       
            if (($(mainDivTobeConv).height() / 3) < 310)
            {
                heightval = 310;
            }
            else
            {
                heightval = ($(mainDivTobeConv).height() / 3);//No I18N
            }
            
            pdf.addImage(imgData, 'JPEG', 10, pdfContentStart,300,150);//No I18N
           pdf.addPage();
            destructPDFelement(mainDivTobeConv);
           // enableIDForPDF(toHide);
			counter++;
console.log(counter+" "+total);		
		if(counter===total){
		
				 pdf.save("Report.pdf");//No I18N
			}
        }
		
    });
	*/
	})

	
	
	
    //
}

function generatePdfFromSplitHtml(mainDivTobeConv, headerElement, logoElement, toHide,separationClassName,isMultiplePage,chartName,divwidth,divheight,pagewidth,pageheight,orientation,hideByClassName,frontPage,sendMail,isNFAGraph,footerText)
{
    sendMail = (sendMail == undefined)?false:sendMail;
    $(mainDivTobeConv).parent().css("background-color", "#FFFFFF");
	if(toHide!==""&&toHide!==undefined)
	{
		disableIDForPDF(toHide);
	}
	var heightval=150; //No I18N
	var orien=orientation == undefined ?"l":orientation;//NO I18N
	var pdf = new jsPDF(orien, 'mm',[pagewidth, pageheight]); //No I18N
	var total=$(mainDivTobeConv+" ."+separationClassName).length;
	var counter=0;
	var html_string_parent;
	html_string_parent=logoElement;
   html_string_parent=html_string_parent+headerElement;
   $('body').addClass('disableBodyClick');
   uniqueId = opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.report.pdf.export.info",this));//No I18N
   $(mainDivTobeConv).find('.svgarea ').each(function() {
		$(this).attr("width",$(this).width());
		$(this).attr("height",$(this).height());
   });
   if(frontPage!==""&&frontPage!==undefined)
   {
	   var iframe=document.createElement('iframe');
	   document.body.appendChild(iframe);
	   var iframedoc=iframe.contentDocument||iframe.contentWindow.document;
	   iframedoc.write(frontPage);
	   iframedoc.close();
	   html2canvas(iframedoc.body, {background:'#fff',//No I18N
		   onrendered: function(canvas) {
			   document.body.removeChild(iframe);
			   var imgData = canvas.toDataURL("image/jpeg", 1.0);//No I18N
			   pdf.addImage(imgData, 'JPEG', 10, pdfContentStart);//No I18N
			   destructPDFelement(mainDivTobeConv);
			   pdf.addPage();
			   $(mainDivTobeConv+" ."+separationClassName).each(function(index){
				   var html_string=html_string_parent+$(this).html();
				   if(footerText != undefined){
					   html_string=html_string+footerText;
				   }
				   var iframe=document.createElement('iframe');
				   document.body.appendChild(iframe);
				   var iframedoc=iframe.contentDocument||iframe.contentWindow.document;
				   iframedoc.write(html_string);
				   iframedoc.close();

				   if(hideByClassName != "" && hideByClassName!== undefined){
					   var hideClass = hideByClassName.split(",");
					   for (var i = 0; i < hideClass.length; i++)
					   {
						   var elem=iframedoc.getElementsByClassName(hideClass[i]);
						   for (var j = 0; j < elem.length; j++) {
							   elem[j].style.display = 'none';
						   }
					   }

				   }
				   html2canvas(iframedoc.body, {background:'#fff',//No I18N
					   onrendered: function(canvas) { 
						   counter++;
						   document.body.removeChild(iframe);
						   if(canvas.height > 980){
							   for (var i = 0; i <= canvas.height/980; i++) {
								   //! This is all just html2canvas stuff
								   var srcImg  = canvas;
								   var sX      = 0;
								   var sY      = 980*i; // start 980 pixels down for every new page
								   var sWidth  = divwidth;
								   if((canvas.height-sY) < 980){
									   var sHeight = canvas.height-sY;
								   }else{
									   var sHeight = 980;
								   }
								   var dX      = 0;
								   var dY      = 0;
								   var dWidth  = canvas.width;
								   var dHeight = sHeight;

								   var onePageCanvas = document.createElement("canvas");
								   onePageCanvas.setAttribute('width', divwidth);
								   onePageCanvas.setAttribute('height', sHeight);
								   onePageCanvas.setAttribute('background','white')
								   var ctx = onePageCanvas.getContext('2d');//NO I18N
								   // details on this usage of this function: 
								   // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images#Slicing
								   ctx.drawImage(srcImg,sX,sY,sWidth,sHeight,dX,dY,dWidth,dHeight);

								   // document.body.appendChild(canvas);
								   var canvasDataURL = onePageCanvas.toDataURL("image/jpeg", 1.0);//NO I18N
								   var width         = onePageCanvas.width;
								   var height        = onePageCanvas.clientHeight;
								   //! If we're on anything other than the first page,
								   // add another page
								   if (i > 0) {
									   pdf.addPage(); //8.5" x 11" in pts (in*72)
								   }
								   //! now we declare that we're working on that page
								   //! now we add content to that page!
								   pdf.addImage(canvasDataURL, 'JPEG', 10, 10);//NO I18N

							   }
						   }else{
							   var imgData = canvas.toDataURL("image/jpeg", 1.0);//No I18N
							   pdf.addImage(imgData, 'JPEG', 10, pdfContentStart);//No I18N
						   }
						   destructPDFelement(mainDivTobeConv);
						   //! after the for loop is finished running, we save the pdf.
						   if(counter===total){
							   $("#"+uniqueId).remove();
							   pdf.save("Report.pdf");//No I18N
							   $('body').removeClass('disableBodyClick');
						   }
						   pdf.addPage();
					   }
				   });
			   })  
		   }
	   });

   }else{
        isNFAGraph = (isNFAGraph == undefined)?false:isNFAGraph;
        if(isNFAGraph)
        {
            var divLength = $(mainDivTobeConv+" ."+separationClassName).length;
            opm_renderHtmlForPDF($(mainDivTobeConv+" ."+separationClassName),divLength,0,mainDivTobeConv, headerElement, logoElement, toHide,separationClassName,isMultiplePage,chartName,divwidth,divheight,pagewidth,pageheight,orientation,hideByClassName,frontPage,sendMail,pdf,html_string_parent);
        }
        else
        {
	   $(mainDivTobeConv+" ."+separationClassName).each(function(index){
			var html_string=html_string_parent+$(this).html();	 
			if(footerText != undefined){
				   html_string=html_string+footerText;
			  }
			var iframe=document.createElement('iframe');
			iframe.width=divwidth;
			document.body.appendChild(iframe);
			var iframedoc=iframe.contentDocument||iframe.contentWindow.document;
			iframedoc.write(html_string);
			iframedoc.close();

			if(hideByClassName != "" && hideByClassName!== undefined){
				var hideClass = hideByClassName.split(",");
				for (var i = 0; i < hideClass.length; i++)
				{
					var elem=iframedoc.getElementsByClassName(hideClass[i]);
					for (var j = 0; j < elem.length; j++) {
						elem[j].style.display = 'none';
					}
				}

			}
			html2canvas(iframedoc.body, {background:'#fff',//No I18N
				onrendered: function(canvas) { 
					counter++;
					document.body.removeChild(iframe);
					if(canvas.height > 980){
						for (var i = 0; i <= canvas.height/980; i++) {
							//! This is all just html2canvas stuff
							var srcImg  = canvas;
							var sX      = 0;
							var sY      = 980*i; // start 980 pixels down for every new page
							var sWidth  = divwidth;
							if((canvas.height-sY) < 980){
								var sHeight = canvas.height-sY;
							}else{
								var sHeight = 980;
							}
							var dX      = 0;
							var dY      = 0;
							var dWidth  = canvas.width;
							var dHeight = sHeight;

							var onePageCanvas = document.createElement("canvas");
							onePageCanvas.setAttribute('width', divwidth);
							onePageCanvas.setAttribute('height', sHeight);
							onePageCanvas.setAttribute('background','white')
							var ctx = onePageCanvas.getContext('2d');//NO I18N
							// details on this usage of this function: 
							// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images#Slicing
							ctx.drawImage(srcImg,sX,sY,sWidth,sHeight,dX,dY,dWidth,dHeight);

							// document.body.appendChild(canvas);
							var canvasDataURL = onePageCanvas.toDataURL("image/jpeg", 1.0);//NO I18N
							var width         = onePageCanvas.width;
							var height        = onePageCanvas.clientHeight;
							//! If we're on anything other than the first page,
							// add another page
							if (i > 0) {
								pdf.addPage(); //8.5" x 11" in pts (in*72)
							}
							//! now we declare that we're working on that page
							//! now we add content to that page!
							pdf.addImage(canvasDataURL, 'JPEG', 10, 10);//NO I18N

						}
					}else{
						var imgData = canvas.toDataURL("image/jpeg", 1.0);//No I18N
						pdf.addImage(imgData, 'JPEG', 10, pdfContentStart);//No I18N
					}
					destructPDFelement(mainDivTobeConv);
					//! after the for loop is finished running, we save the pdf.
					if(counter===total){
						$("#"+uniqueId).remove();
                        if(!sendMail) {
						pdf.save("Report.pdf");//No I18N
                        }else {
                            var binary = pdf.output();
                            sendPdfAsMailAttachment(btoa(binary));
                        }
						$('body').removeClass('disableBodyClick');
					}
					pdf.addPage();
				}
			});
		})  
   }
   }
   
  
}
function opm_renderHtmlForPDF(divElement, divLength, currentIndex, mainDivTobeConv, headerElement, logoElement, toHide,separationClassName,isMultiplePage,chartName,divwidth,divheight,pagewidth,pageheight,orientation,hideByClassName,frontPage,sendMail,pdf,html_string_parent){
    if(currentIndex<divLength){
        var html_string = "";
        if(currentIndex===0){
             html_string=html_string_parent+$(divElement[currentIndex]).html();
        }
        else{
             html_string=$(divElement[currentIndex]).html();
        }
        var iframe=document.createElement('iframe');
        document.body.appendChild(iframe);
        var iframedoc=iframe.contentDocument||iframe.contentWindow.document;
        iframedoc.write(html_string);
        iframedoc.close();
        if(hideByClassName != "" && hideByClassName!== undefined){
            var hideClass = hideByClassName.split(",");
            for (var i = 0; i < hideClass.length; i++)
            {
                var elem=iframedoc.getElementsByClassName(hideClass[i]);
                for (var j = 0; j < elem.length; j ++) {
                    elem[j].style.display = 'none';
                }
            }

        }
        html2canvas(iframedoc.body, {background:'#fff',//No I18N
            onrendered: function(canvas) { 
                document.body.removeChild(iframe);
                if(canvas.height > 980){
                    for (var i = 0; i <= canvas.height/980; i++) {
                        //! This is all just html2canvas stuff
                        var srcImg  = canvas;
                        var sX      = 0;
                        var sY      = 980*i; // start 980 pixels down for every new page
                        var sWidth  = divwidth;
                        if((canvas.height-sY) < 980){
                            var sHeight = canvas.height-sY;
                        }else{
                            var sHeight = 980;
                        }
                        var dX      = 0;
                        var dY      = 0;
                        var dWidth  = canvas.width;
                        var dHeight = sHeight;

                        var onePageCanvas = document.createElement("canvas");
                        onePageCanvas.setAttribute('width', divwidth);
                        onePageCanvas.setAttribute('height', sHeight);
                        onePageCanvas.setAttribute('background','white')
                        var ctx = onePageCanvas.getContext('2d');//NO I18N
                        // details on this usage of this function: 
                        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images#Slicing
                        ctx.drawImage(srcImg,sX,sY,sWidth,sHeight,dX,dY,dWidth,dHeight);

                        // document.body.appendChild(canvas);
                        var canvasDataURL = onePageCanvas.toDataURL("image/jpeg", 1.0);//NO I18N
                        var width         = onePageCanvas.width;
                        var height        = onePageCanvas.clientHeight;
                        //! If we're on anything other than the first page,
                        // add another page
                        if (i > 0) {
                            pdf.addPage(); 
                        }
                        //! now we declare that we're working on that page
                        //! now we add content to that page!
                        pdf.addImage(canvasDataURL, 'JPEG', 10, 10);//NO I18N

                    }
                }else{
                    var imgData = canvas.toDataURL("image/jpeg", 1.0);//No I18N
                    pdf.addImage(imgData, 'JPEG', 10, pdfContentStart);//No I18N
                }
                destructPDFelement(mainDivTobeConv);
                //! after the for loop is finished running, we save the pdf.
                if(divLength-1===currentIndex){
                    $("#"+uniqueId).remove();
                    if(!sendMail) {
                    pdf.save("Report.pdf");//No I18N
                    }else {
                        var binary = pdf.output();
                        sendPdfAsMailAttachment(btoa(binary));
                    }
                    $('body').removeClass('disableBodyClick');
                }
                else{
                    pdf.addPage();
                    opm_renderHtmlForPDF(divElement, divLength, currentIndex+1, mainDivTobeConv, headerElement, logoElement, toHide,separationClassName,isMultiplePage,chartName,divwidth,divheight,pagewidth,pageheight,orientation,hideByClassName,frontPage,sendMail,pdf,html_string_parent);
                }
            }
        });
    }
}
function loadPdfWithImages(mainDivTobeConv, headerElement, logoElement, toHide,separationClassName,isMultiplePage,chartName,divwidth,divheight,pagewidth,pageheight,orientation,hideByClassName,frontPage)
{
	
}
function constructPDFelement(mainDivTobeConv)
{
    $(mainDivTobeConv).clone().attr('id', "PDFDivElement").insertAfter(mainDivTobeConv)
}

//for element input later can be utilized
function updateStringToDiv(element)
{
    var element = '<div id="wrapper_pdf" style="position:absolute">' + element + '</div>';
    $(element).prepend(headerElement);
    $(element).prepend(logoElement);
    return element;
}

function disableIDForPDF(toHide)
{
    if (toHide !== null && toHide !== "")
    {
        var toHides = toHide.split(",");
        for (var i = 0; i < toHides.length; i++)
        {
            $("#" + toHides[i]).hide();
        }
    }
}

function enableIDForPDF(toHide)
{
    if (toHide !== null && toHide !== "")
    {
        var toHides = toHide.split(",");
        for (var i = 0; i < toHides.length; i++)
        {
            $("#" + toHides[i]).show();
        }
    }
}
function updatePDFelement(mainDivTobeConv, headerElement, logoElement)
{
    $(mainDivTobeConv).wrap('<div id="wrapper_pdf" style=""></div>');
//$("#wrapper_pdf").prepend(headerElement);
//$("#wrapper_pdf").prepend(logoElement);
}
function destructPDFelement(mainDivTobeConv)
{
    $('#logo_pdf_remove').remove();
    $('#header_pdf_remove').remove();
}
