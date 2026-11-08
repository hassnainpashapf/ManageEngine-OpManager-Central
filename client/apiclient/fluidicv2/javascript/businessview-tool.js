var customImage = null;
var bv_jointGraph = null;
var bv_jointPaper = null;
var currentElementView = null;
var preview_Link = null;
var currentSelected_Link = null;
var linkToolsView = null;
var bv_zoomLevel = 1;
var toolsView = null;
var bv_arrowSize = [10,10,12,12,16,18,20,22,24,26];
var arrowSize = 10;
var linkCreationTool = null;
var bv_selectAll = false;
var bv_peripheralsImgUrl = "/images/businessView/peripherals/";//No I18N
var selectedBVElements = [];
var selectionBVRect;
var startBvCoords = { x: 0, y: 0 };
var bv_prevCoords = { x: 0, y: 0 };
var isSelectedEleMoved = false;
var currentEle_prevCoords = { x: 0, y: 0 };
var selectedBVLinks = [];

joint.shapes.custom = {};
var bvLinkConnecters = {"1":{"connector":"normal"},"2":{"connector":"normal"},"3":{"connector":"smooth"},"4":{"router":"orthogonal","connector":"normal"},"12":{"connector":"smooth"}};//No I18N

function opm_initNewBusinessView(divId,isEdit,jsonData){
	OPMClient.BVMapDetailsController.set("elementId",divId);//No I18N
	OPMClient.BVMapDetailsController.set("isEditBV",true);//No I18N
  bv_zoomLevel = 1;
	clearBVMapData();
  if(isEdit){
    $('.bv-view__intro-msg').hide();
    $("#bv_tool_container").show();
  }
	 bv_jointGraph = new joint.dia.Graph();
	var link = new joint.shapes.standard.Link({
	  linkName:"previewLink",//No I18N
	  connector: {
	    name: "normal"//No I18N
	  },
	  attrs: {
	       
	    line: {
	      stroke: "#000",//No I18N
	      strokeDasharray: "0",//No I18N
	      strokeWidth: 2,
	      fill: "none",//No I18N
	      sourceMarker: {
	        type: "path",//No I18N
	        d: "M 0 0 0 0",//No I18N
	        stroke: "none"//No I18N
	      },
	      targetMarker: {
	        type: "path",//No I18N
	        d: "M 0 -5 -10 0 0 5 z",//No I18N
	        stroke: "none",//No I18N
	        z: -1
	      }
	    }
	  },
	  'data-type': 'link'//No I18N
	});
	var paperContainer = document.getElementById(divId);
	bv_jointPaper = new joint.dia.Paper({
	  el: paperContainer,	
	  width: 2000,
    height: 2000,
	  gridSize: 18,
    restrictTranslate: true,
	  drawGrid: {
                name: 'doubleMesh',//No I18N
                args: [
                    { color: '#e6e6e6', thickness: 1 }, //No I18N
                    { color: '#cacaca', scaleFactor: 5, thickness: 1 } //No I18N
            ]},
	  model: bv_jointGraph,
	  defaultLink:link,
	  interactive: { labelMove: false },
    async: true,
	  sorting: joint.dia.Paper.sorting.APPROX,
	  validateConnection: function(sv, _sm, tv, _tm){return sv !== tv;},
	  linkPinning: false,
  	defaultAnchor: { name: "perpendicular" }//No I18N
	  
	});

  customImage = joint.dia.Element.extend({

    defaults: joint.util.deepSupplement(
      {
        type: "custom.Image",//No I18N
        resizable: true,
        size: {
          width: 100,
          height: 100
        },
        attrs: {
          image: {
            ref: "rect"//No I18N
          }
        }
      },
      joint.dia.Element.prototype.defaults
    )
  });
  var bvimgName = "";
  if(jsonData !== undefined)
  {

      //set bg grid 
      setBGGridJointMap((jsonData.grid !== undefined && jsonData.grid=== 'false' ? false : true));//No I18N          

      //set bg color
      $("#"+divId).css("background-color", "#"+(jsonData.bgColor !== undefined?jsonData.bgColor:"fff"));  //No I18N          
      $('#bv_canvasBGColor_value').val(jsonData.bgColor !== undefined?jsonData.bgColor:"#FFFFFF");

      //set bg image
      if(jsonData.imageName !== "/maps/[None]")//No I18N
      {
        var bvimgName = "/images"+jsonData.imageName; //No I18N
        if(jsonData.encodedImageName !== undefined && jsonData.imageName.indexOf('BusinessView_BG') !== -1){
          bvimgName = 'data:image;base64,'+jsonData.encodedImageName;//No I18N
        }
      }
      setBvBgImgJointMap('default',jsonData.imageName,bvimgName);//No I18N
  }
  else{
      setBvBgImgJointMap('default',mapProps.imageName,bvimgName);//No I18N
  }

  if(!isEdit)
	{
    opm_populateMapProps();
    bvGetPeripheralsImages();
    bv_openActionsSlider("settings");//No I18N
  }
  bvZoomEvents("bv-zoom-events",bv_jointPaper);//No I18N
  $('#'+divId).data().paper = bv_jointPaper;  
  bv_jointPaper.on('scale', function(paper, scaleX, scaleY) {
        var backgroundImage = $("#"+divId+" .joint-paper-background");//No I18N
        var scaleFactor = scaleX * 100;  
        backgroundImage.css({
            'transform': $("#"+divId+" .joint-layers").attr("transform"),//No I18N
            'transform-origin': 'top left',  //No I18N
            'left': -bv_jointPaper.layers.scrollLeft.left * scaleX,  //No I18N
            'top': -bv_jointPaper.layers.scrollTop * scaleY//No I18N
        });
    });   

  //show element properties
	bv_jointPaper.on("element:pointerdblclick", function(elementView, evt, x, y) {//No I18N
  //bv_jointPaper.on("element:pointerup", function(elementView, evt, x, y) {//No I18N
    removeHighLightFromElements();
    isSelectedEleMoved = false;
    $(".bv-view__tools .bv-tool-edit").removeClass("active");
    var elementObj = elementView.model;
    if(elementObj.isElement())
    {
      bvOpenElementPropertiesSlide(elementObj);
    }
   });
    //define tools for link and resize pointers.
   bv_jointPaper.on("element:mouseenter", function(elementView, evt, x, y) { //No I18N
        //removeHighlightLink(currentSelected_Link);
        var isEnableConnectLink = true;  
        if(elementView.model.attributes.ElementType !== undefined && elementView.model.attributes.ElementType === "Text")
        {
          isEnableConnectLink = false;
        }
        if(isEnableConnectLink && currentElementView === null)
        {
          
          linkCreationTool = new joint.dia.ToolsView({
              tools:[connectRight,connectLeft,connectTop,connectBottom]
            });  
          elementView.addTools(linkCreationTool);
        }

		});
  
    bv_jointPaper.on("element:mouseleave", function(elementView, evt, x, y) { //No I18N
       if(linkCreationTool && elementView !== null && currentElementView === null){
            linkCreationTool.$el.removeClass("active");
            elementView.removeTools(linkCreationTool);
          }
    });
     bv_jointPaper.on("element:pointerdown", function(elementView, evt, x, y) { //No I18N
        bv_prevCoords = {x:elementView.model.attributes.position.x,y:elementView.model.attributes.position.y};
        currentEle_prevCoords.x = elementView.model.attributes.position.x;
        currentEle_prevCoords.y = elementView.model.attributes.position.y;
        bvRemoveElementTools(currentElementView);
        $(".bv-view__tools .bv-tool-edit").removeClass("active");
        bv_closeActionsSlider();
        currentSelected_Link = null;
        currentElementView = elementView;

        if (evt.ctrlKey || evt.metaKey) {
          var index = selectedBVElements.indexOf(elementView.model);
          if (index === -1) {
            isSelectedEleMoved = true;
              selectedBVElements.push(elementView.model);
              elementView.highlight();
          } else {
              selectedBVElements.splice(index, 1);
              elementView.unhighlight();
          }
          currentElementView = null;
        }else {

          isSelectedEleMoved = false;
           
        }

        var isEnableConnectLink = true;  
        var resizeSelector = "rect";//No I18N
        if(elementView.model.attributes.ElementType !== undefined && elementView.model.attributes.ElementType === "Text")
        {
          isEnableConnectLink = false;
        }
        if(elementView.model.attributes.ElementType !== undefined && elementView.model.attributes.ElementType === "Circle")
        {
          resizeSelector = "body";//No I18N
        }

         var toolsList = [
           /* new joint.elementTools.Remove({
              scale:1.2,
              x: "100%",//No I18N
              y: 0,
              magnet: 'base',//No I18N
              useModelGeometry: true,
              offset: {
                x: -2,
                y: -2
              },
               action: function(evt) {
                  removeBVElementsJointMap(this);
                } 
            })*/   
            new ResizeTool({
              selector: resizeSelector,
              display:"block"//No I18N
            })
          ];
        
        if(isEnableConnectLink)
        {
          toolsList.push(connectRight,connectLeft,connectTop,connectBottom);
        }

      toolsView = new joint.dia.ToolsView({
          tools:toolsList
        });  

      elementView.addTools(toolsView);
      setTimeout(function() {
        $(".joint-tool.joint-theme-default[model-id='"+elementView.model.id+"'] .resize_extras").removeAttr("style");
      },50);

    });

	   
    bv_jointPaper.on("blank:pointerclick", function() {//No I18N
      bv_selectAll = false;
          if(toolsView && currentElementView !== null){
            currentElementView.removeTools();
            currentElementView = null;
          }
        removeHighlightLink(currentSelected_Link);
        currentSelected_Link = null;
        bv_closeActionsSlider();
        $(".bv-view__tools .bv-tool-edit").removeClass("active");
        $("#bv_entities_search").blur();
      });

    //Drag and drop the Elements on paper. 
      paperContainer.addEventListener("drop", function(event) {//No I18N
        event.preventDefault();
        removeHighLightFromElements();
        var data = JSON.parse(event.dataTransfer.getData("text/plain"));//No I18N
        var isGroupDrag = $("#bv_entitiesList li").hasClass("bvEntitiesSelected"); //No I18N
        bvInsertElementsOnJointMap(isGroupDrag, data, event);
      bv_closeActionsSlider();
      });
	paperContainer.addEventListener("dragover", function(event){event.preventDefault()});//No I18N

	paperContainer.addEventListener('scroll', function() {//No I18N
	    paperscrollleft = paperContainer.scrollLeft;
	    paperscrolltop = paperContainer.scrollTop;
	});

	//Show link properties
	bv_jointGraph.on("change:target", function(link, newTarget) {//No I18N
	  if (link.isLink() && newTarget) {
	      var sourceView = bv_jointPaper.findViewByModel(link.get("source").id);
	      var targetView = bv_jointPaper.findViewByModel(newTarget.id);
	      if (sourceView && targetView) {
	          var coords = bv_jointPaper.clientToLocalPoint({
	              x: event.clientX,
	              y: event.clientY
	          });
	          preview_Link = link;
            currentSelected_Link = link;
            currentSelected_Link.sourceView = sourceView;
            currentSelected_Link.targetView = targetView;
	          bv_showLinkProperties(bv_jointGraph,sourceView,targetView);
	      }
	  }
	});

  bv_jointPaper.on('link:pointerdown', function(linkView,evt) {//No I18N
      evt.stopPropagation();
      evt.preventDefault();
     // removeHighlightLink(currentSelected_Link);
      //removeHighLightFromElements();
      $(".bv-view__tools .bv-tool-edit").removeClass("active");
      bv_closeActionsSlider();
      var currentLink = linkView.model;
      if(currentLink.attributes.linkName !== undefined && currentLink.attributes.linkName === "previewLink")
      {
        linkView.isPreviewLink = true;
      }else{
         if(toolsView && currentElementView !== null){
            toolsView.$el.removeClass("active");
            bvRemoveElementTools(currentElementView);
            currentElementView = null;
          }
        
        if (evt.ctrlKey || evt.metaKey) {
          var index = selectedBVLinks.indexOf(linkView.model);
          if (index === -1) {
            isSelectedEleMoved = true;
            linkView.linkSelected = true;
            selectedBVLinks.push(linkView.model);
              enableHighlightLink(linkView);
          } else {
              linkView.linkSelected = false;
              selectedBVLinks.splice(index, 1);
              removeHighlightLink(linkView);
          }
          currentElementView = null;
        }else {
              removeHighlightLink(currentSelected_Link);
              removeHighLightFromElements();
              currentSelected_Link = linkView;
              linkView.linkSelected = true;
              enableHighlightLink(linkView);
        }

      }

      
  });
  bv_jointPaper.on('link:pointerdblclick', function(linkView,evt) {//No I18N
    evt.stopPropagation()
    evt.preventDefault();
    return;
    /*  var currentLink = linkView.model;
        currentElementView = null;
        //currentSelected_Link = linkView;
        bv_showLinkProperties(bv_jointGraph,linkView.sourceView,linkView.targetView,linkView);*/
  });

  bv_jointPaper.on('link:contextmenu', function(linkView, evt) {
    evt.preventDefault(); 
    var currentLink = linkView.model;
     currentElementView = null;
     bv_closeActionsSlider();
    var menu = document.getElementById("l2-context-menu");//No I18N
      menu.style.display= "block";//No I18N
      menu.style.top="".concat(evt.clientY - 70, "px");//No I18N
      menu.style.left="".concat(evt.clientX + 10, "px");//No I18N
     $(".link-context-edit,.link-context-delete").off().on("click",function(evt){//No I18N
          if($(this).hasClass("link-context-edit"))//No I18N
          {
            currentSelected_Link = linkView;
            bv_showLinkProperties(bv_jointGraph,linkView.sourceView,linkView.targetView,linkView);
          }
          else if($(this).hasClass("link-context-delete"))//No I18N
          {
            //linkView.model.remove(); 
            removeBVElementsJointMap(linkView);
          }
          document.getElementById("l2-context-menu").style.display="none";//No I18N
     });

      document.addEventListener('click', function removeMenu(evt) {//No I18N
          if (document.body.contains(menu)) {
              document.getElementById("l2-context-menu").style.display="none";//No I18N
          }
          document.removeEventListener('click', removeMenu);//No I18N
      });
});
   
  bv_jointPaper.on('link:mouseenter', function(linkView,evt) {//No I18N
    evt.stopPropagation()
    if(linkView.model.isLink())
     {
      joint.linkTools.EditButton = joint.linkTools.Button.extend({
          name: 'edit-button',//No I18N
          options: {
              markup: [{
                  tagName: 'circle',//No I18N
                  selector: 'button',//No I18N
                  attributes: {
                     'r': 12,//No I18N
                      'fill': '#FFFFFF',//No I18N
                      'cursor': 'pointer',//No I18N
                      'stroke':"#FFFFFF",//No I18N
                      'strokeWidth':1,//No I18N
                      'class':"bv-linkActions"//No I18N
                  }
              }, {
                  tagName: 'image',//No I18N
                  selector: 'icon',//No I18N
                  attributes: {
                      'xlink:href': '/apiclient/fluidicv2/img/edit-pencil.svg',//No I18N
                      'fill': '#FFFFFF',//No I18N
                      'stroke': 'none',//No I18N
                      'pointer-events': 'none',//No I18N
                      width: 12,
                      height: 12,
                      x: -6, 
                      y: -6
                  }
              }],
              distance: 55,
              offset: 0,
              action: function(evt) {
                currentSelected_Link = linkView;
                bv_showLinkProperties(bv_jointGraph,linkView.sourceView,linkView.targetView,linkView);
              }
          }
      });
       joint.linkTools.DeleteButton = joint.linkTools.Button.extend({
          name: 'edit-button',//No I18N
          options: {
              markup: [{
                  tagName: 'circle',//No I18N
                  selector: 'button',//No I18N
                  attributes: {
                      'r': 12,//No I18N
                      'fill': '#FFFFFF',//No I18N
                      'cursor': 'pointer',//No I18N
                      'stroke':"#FFFFFF",//No I18N
                      'strokeWidth':1,//No I18N
                      'class':"bv-linkActions"//No I18N
                  }
              }, {
                  tagName: 'image',//No I18N
                  selector: 'icon',//No I18N
                  attributes: {
                      'xlink:href': '/apiclient/fluidicv2/img/delete.svg',//No I18N
                      'fill': '#FFFFFF',//No I18N
                      'stroke': 'none',//No I18N
                      'pointer-events': 'none',//No I18N
                      width: 12,
                      height: 12,
                      x: -6, 
                      y: -6
                  }
              }],
              distance: 25,
              offset: 0,
              action: function(evt) {
                removeBVElementsJointMap(linkView);
              }
          }
      });

      var editButton = new joint.linkTools.EditButton();
      var deleteButton = new joint.linkTools.DeleteButton();
      var currentLink = linkView.model;
        if(currentLink.attributes.linkObj && currentLink.attributes.linkObj.lineStyle === "1")//No I18N
        {
          linkToolsView = new joint.dia.ToolsView({
              tools: [
                      /*new joint.linkTools.Remove({ distance: 40,
                      action: function(evt) {
                          removeBVElementsJointMap(this);
                      } 

                      }),*/deleteButton,editButton]
          });
        }else{
          linkToolsView = new joint.dia.ToolsView({
                tools: [
                new joint.linkTools.Vertices({stopPropagation:false}),
                        /*new joint.linkTools.Remove({ distance: 40,
                        action: function(evt) {
                            removeBVElementsJointMap(this);
                        } 

                        }),*/deleteButton,editButton]
            });
        }
   
         $(".link-tools").remove();
         linkView.addTools(linkToolsView);
         linkToolsView.render();
         /* if(linkToolsView)
          {
          linkToolsView.$el.addClass("active");
        }*/
      }
      enableHighlightLink(linkView);


});

bv_jointPaper.on('link:mouseleave', function(linkView) {//No I18N
  var currentLink = linkView.model;
  //currentLink.attr('line/stroke', '#000000');
  /*if(linkToolsView)
    {
      linkToolsView.$el.removeClass("active");
    }*/
    linkView.removeTools();
    if(linkView.linkSelected === undefined || !linkView.linkSelected)
    {
      removeHighlightLink(linkView);
    }
});

// Selection rectangle
bv_jointPaper.on('blank:pointerdown', function (event, x, y) {

    removeHighLightFromElements();
    isSelectedEleMoved = false;
    startBvCoords = { x:x, y:y };
    selectionBVRect = new joint.shapes.standard.Rectangle();
    selectionBVRect.position(x, y);
    selectionBVRect.resize(0, 0);
    selectionBVRect.attr('body/fill', '#4a7bcb');//No I18N
    selectionBVRect.attr('body/stroke', '#4a7bcb');//No I18N
    selectionBVRect.attr('body/fillOpacity', 0.2);//No I18N
    selectionBVRect.set("ElementType","selectionRect");//No I18N
    selectionBVRect.set("id","selectionRect");//No I18N
    selectionBVRect.addTo(bv_jointGraph);

});


bv_jointPaper.on('blank:pointermove', function (event, x, y) {
    if (selectionBVRect) {
        var rectX = Math.min(startBvCoords.x, x);
        var rectY = Math.min(startBvCoords.y, y);
        var width = Math.abs(x - startBvCoords.x);
        var height = Math.abs(y - startBvCoords.y);

        selectionBVRect.position(rectX,rectY);
        selectionBVRect.resize(width,height);
        selectedBVElements = [];
        selectedBVLinks = [];
      /*  bv_jointGraph.getElements().forEach(function(element) {
            var bbox = element.getBBox();
            if (rectX < bbox.x + bbox.width && rectX + width > bbox.x &&
                rectY < bbox.y + bbox.height && rectY + height > bbox.y) {
                selectedBVElements.push(element);
            }
        });*/
        isSelectedEleMoved = true;
        selectedBVElements = bv_jointGraph.findModelsInArea({ x: rectX, y: rectY, width: width, height: height });
        selectedBVLinks = bv_jointGraph.findLinksInArea({ x: rectX, y: rectY, width: width, height: height });
    }
});

bv_jointPaper.on('blank:pointerup', function () {
    if (selectionBVRect) {
        selectionBVRect.remove();
        selectionBVRect = null;

          if(toolsView && currentElementView !== null){
            currentElementView.removeTools();
            currentElementView = null;
          }
    }

    // Highlight selected elements
    if(selectedBVElements.length > 0)
    {
      for (var i = 0; i < selectedBVElements.length; i++) {
           if(selectedBVElements[i].id !== undefined && selectedBVElements[i].id === "selectionRect")
          {
            selectedBVElements.splice(i,1);
          }else{
            var view = bv_jointPaper.findViewByModel(selectedBVElements[i]);
            if (view) {view.highlight();}
          }
      }
    }  

    if(selectedBVLinks.length > 0)
    {
      selectedBVLinks.forEach(function(link) {
        var view = bv_jointPaper.findViewByModel(link);
        enableHighlightLink(view);
      });
    }
});

  bv_jointPaper.on('element:pointermove', function (view,evt, dx, dy) {
      isSelectedEleMoved = true;
      evt.stopPropagation();
      if((currentEle_prevCoords.x !== view.model.attributes.position.x) || (currentEle_prevCoords.y !== view.model.attributes.position.y))
      {
        if (selectedBVElements.includes(view.model)) {
            var cx = (view.model.attributes.position.x - bv_prevCoords.x);
            var cy = (view.model.attributes.position.y - bv_prevCoords.y);
            selectedBVElements.forEach(function(element) {
               if(element.id !== view.model.id && element.attributes.nodeObj !== undefined)
               {
                 var position = element.position();
                  element.position((position.x + cx),(position.y + cy));
                }
            });
          } 
          currentEle_prevCoords.x = view.model.attributes.position.x;
          currentEle_prevCoords.y = view.model.attributes.position.y;
          bv_prevCoords = {x:view.model.attributes.position.x,y:view.model.attributes.position.y};
      }

  });
  bv_jointPaper.on('element:pointerup', function (view,evt, dx, dy) {

      /* if (selectedBVElements.includes(view.model)) {
          var cx = (dx - bv_prevCoords.x);
          var cy = (dy - bv_prevCoords.y);
          selectedBVElements.forEach(function(element) {
             if(element.id !== view.model.id)
             {
               var position = element.position();
                element.position(position.x + cx,position.y + cy);
              }

          });
              
      }*/
      if(isSelectedEleMoved)
      {
        adjustLinkVertices(bv_jointGraph,view);
      } 
      if(!isSelectedEleMoved)
      {
        removeHighLightFromElements();
      }
    
     bv_prevCoords = {x:0,y:0}; 
});
    
  //setPaperCenterPosition();
}
function enableHighlightLink(linkView){
   joint.highlighters.mask.add(linkView, { selector: 'line' }, 'my-link-highlight', {//No I18N
        layer: 'front',//No I18N
        padding: 0,
        alphaValue: 0.3,
        attrs: {
            'stroke': '#4a7bcb',//No I18N
            'stroke-width': 4,//No I18N
            'stroke-linecap': 'square',//No I18N
            'fill': '#4a7bcb',//No I18N
            'fill-opacity': 0.3,//No I18N
            'stroke-opacity': 0.3//No I18N
        }
    });
}
function removeHighlightLink(linkView){
  if(linkView)
  {
    linkView.linkSelected = false;
    joint.highlighters.mask.remove(linkView);
  }
}

function bvElementOnDragStart(event) {
  var draggedElement = event.target;

  // Check if the dragged element has the 'bvEntitiesSelected' class
  var isGroupDrag = draggedElement.classList.contains('bvEntitiesSelected'); //No i18n

  var dragData = [];
  var groupCheck = false;

  if (isGroupDrag) {
    // Get all selected elements
    var selectedEntityList = document.querySelectorAll('.bvEntitiesSelected'); //No I18n
    for (var i = 0; i < selectedEntityList.length; i++) {
      var el = selectedEntityList[i];
      dragData.push({
        iconName: el.getAttribute("iconName"),
        name: el.getAttribute("name"),
        id: el.getAttribute("id"),
        displayName: el.getAttribute("displayName"),
        elementType: el.getAttribute("elementType"),
        imgSrc: el.getAttribute("imgSrc"),
        isShortcut: el.getAttribute("isShortcut"),
        groupCheck: true
      });
    }
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData)); //No I18n
  } else {
    // Single element drag
    event.dataTransfer.setData(
      "text/plain", // No I18N
      JSON.stringify({
        iconName: draggedElement.getAttribute("iconName"), //No I18n
        name: draggedElement.getAttribute("name"), //No I18n
        id: draggedElement.getAttribute("id"), //No I18n
        displayName: draggedElement.getAttribute("displayName"), //No I18n
        elementType: draggedElement.getAttribute("elementType"), //No I18n
        imgSrc: draggedElement.getAttribute("imgSrc"), //No I18n
        isShortcut: draggedElement.getAttribute("isShortcut"), //No I18n
        groupCheck: false
      })
    );
  }

  $('.bv-view__intro-msg').hide();
  $("#bv_tool_container").show();
}

function handleDrop(event, obj,paper,isStateOnly) {
	if(event !== undefined && obj.x === undefined && obj.y === undefined)
    {
	  	var x = event.offsetX / bv_zoomLevel;
	  	var y = event.offsetY / bv_zoomLevel;
		obj.x = x;
		obj.y = y;
	}
	else{
		var x = parseInt(obj.x);
		var y = parseInt(obj.y);
	}

  var labelBg_Clr = obj.labelBGColor ? obj.labelBGColor : "#FFFFFF";//No I18N
  var nodeSeverity_Clr = rectSeverity_Clr = obj.backgroundColor ? obj.backgroundColor : "#4a7bcb";//No I18N
  var nodeBorderClr = "#4a7bcb";//No I18N
  var nodeFillOpacity = 0.3;
  var nodeBorderWidth = rectBorderWidth = 2;
  var rectLedDisplay = "block";//No I18N
  var elementCursor = "pointer";//No I18N
  var circleShape = {};
  var hexagonShape = {};

  var imageRatio = (obj.elementShape !== undefined && obj.elementShape === "circle" || obj.elementShape === "hexagon" ? 0.8 : 1);//No I18N
  if(obj.elementType !== undefined && obj.elementType === "Peripherals")
  {
    elementCursor = "default";//No I18N
  }
  if(!OPMClient.BVMapDetailsController.isEditBV)
   {
      if(obj.type !== "APM" && obj.type !== "Rack" && obj.type !== "Floor" && isStateOnly && obj.state !== undefined)
      {
        nodeSeverity_Clr = nodeBorderClr = availabiltyStatusColors[parseInt(obj.state)-1];
        nodeFillOpacity = 0.3;
        nodeBorderWidth = 4;
      }else if(obj !== undefined && obj.status !== undefined)
      {
        nodeSeverity_Clr = nodeBorderClr = statusColors[parseInt(obj.status)-1];
        nodeFillOpacity = 0.3;
        nodeBorderWidth = 4;
      }
      if(window.OPM.isNewStatusPropagation && obj.state !== undefined && obj.status !== undefined && obj.type !== "APM" && obj.type !== "Rack" && obj.type !== "Floor"){
        nodeSeverity_Clr = nodeBorderClr = availabiltyStateColors[parseInt(obj.state)-1];
        nodeFillOpacity = 0.3;
        nodeBorderWidth = 4;
      }
      // JointJS sevDot overlay — separate positioning for SVG vs PNG LED images
      var sevDotAttrs = { display: 'none' }; //No I18N
      if(window.OPM.isNewStatusPropagation && obj.state !== undefined && obj.status !== undefined
         && obj.type !== "APM" && obj.type !== "Rack" && obj.type !== "Floor" //No I18N
         && !OPMClient.BVMapDetailsController.isEditBV){
        var _sdClr = statusColors[parseInt(obj.status)-1];
        var _sdW = Number(obj.width) || 60;
        var _sdH = Number(obj.height) || 60;
        var _sdR = Math.max(7, Math.min(13, Math.round(Math.min(_sdW, _sdH) * 0.08)));
        var _sdBase = { r: _sdR, fill: _sdClr, stroke: '#fff', strokeWidth: 2, display: 'block' }; //No I18N
        var _imgRatio = (obj.elementShape === 'circle' || obj.elementShape === 'hexagon') ? 0.8 : 1; //No I18N
        var _imgW = (_sdW * _imgRatio) - 8, _imgH = (_sdH * _imgRatio) - 8, _imgOff = ((_sdW - _sdW * _imgRatio) / 2) + 4;
        var _isLedIcon = (["9","10","11","12","13"].indexOf(obj.objType) !== -1); //No I18N
        if(window.OPM.isFaultSevColorUpdated) {
          // SVG icons: dot positions for SVG coordinate space
          if(obj.objType === "13"){ // Triangle
            _sdBase.transform = 'translate(' + Math.round(_imgOff + _imgW * 0.93) + ',' + Math.round(_imgOff + _imgH * 0.95) + ')'; //No I18N
          } else if(obj.objType === "12"){ // Diamond
            _sdBase.transform = 'translate(' + Math.round(_imgOff + _imgW * 0.50) + ',' + Math.round(_imgOff + _imgH * 0.98) + ')'; //No I18N
          } else if(obj.objType === "9" || obj.objType === "10" || obj.objType === "11"){ // Circle
            _sdBase.transform = 'translate(' + Math.round(_imgOff + _imgW * 0.80) + ',' + Math.round(_imgOff + _imgH * 0.82) + ')'; //No I18N
          } else if(obj.elementShape === 'circle'){ // No I18N
            // Device icon with circle outer shape
            var _cAng = Math.PI / 5;
            _sdBase.transform = 'translate(' + Math.round(_sdW/2 + (_sdW/2)*0.85*Math.cos(_cAng)) + ',' + Math.round(_sdH/2 + (_sdH/2)*0.85*Math.sin(_cAng)) + ')'; //No I18N
          } else if(obj.elementShape === 'hexagon'){ // No I18N
            // Device icon with hexagon outer shape
            _sdBase.transform = 'translate(' + Math.round(_sdW * 0.93) + ',' + Math.round(_sdH * 0.73) + ')'; //No I18N
          } else { // Device icon with rectangle outer shape (default)
            _sdBase.transform = 'translate(' + Math.round(_sdW * 0.96) + ',' + Math.round(_sdH * 0.97) + ')'; //No I18N
          }
        } else {
          // PNG LED images: dot positions measured from actual PNG pixel boundaries
          if(obj.objType === "13"){ // Triangle
            _sdBase.transform = 'translate(' + Math.round(_imgOff + _imgW * 0.92) + ',' + Math.round(_imgOff + _imgH * 0.68) + ')'; //No I18N
          } else if(obj.objType === "12"){ // Diamond
            _sdBase.transform = 'translate(' + Math.round(_imgOff + _imgW * 0.49) + ',' + Math.round(_imgOff + _imgH * 0.85) + ')'; //No I18N
          } else if(obj.objType === "11"){ // Large circle
            _sdBase.transform = 'translate(' + Math.round(_imgOff + _imgW * 0.72) + ',' + Math.round(_imgOff + _imgH * 0.72) + ')'; //No I18N
          } else if(obj.objType === "10"){ // Medium circle
            _sdBase.transform = 'translate(' + Math.round(_imgOff + _imgW * 0.65) + ',' + Math.round(_imgOff + _imgH * 0.65) + ')'; //No I18N
          } else if(obj.objType === "9"){ // Small circle
            _sdBase.transform = 'translate(' + Math.round(_imgOff + _imgW * 0.58) + ',' + Math.round(_imgOff + _imgH * 0.58) + ')'; //No I18N
          } else if(obj.elementShape === 'circle'){ // No I18N
            // Device icon with circle outer shape
            var _cAng = Math.PI / 6;
            _sdBase.transform = 'translate(' + Math.round(_sdW/2 + (_sdW/2)*0.85*Math.cos(_cAng)) + ',' + Math.round(_sdH/2 + (_sdH/2)*0.85*Math.sin(_cAng)) + ')'; //No I18N
          } else if(obj.elementShape === 'hexagon'){ // No I18N
             // Device icon with hexagon outer shape
            _sdBase.transform = 'translate(' + Math.round(_sdW * 0.96) + ',' + Math.round(_sdH * 0.73) + ')'; //No I18N
          } else { // Device icon with rectangle outer shape (default)
            _sdBase.transform = 'translate(' + Math.round(_sdW * 0.98) + ',' + Math.round(_sdH * 0.93) + ')'; //No I18N
          }
        }
        sevDotAttrs = _sdBase;
      }
      if(["10","11","12","13"].indexOf(obj.objType) !== -1)//No I18N
      {
        rectLedDisplay = "none";//No I18N
        var labelProp = labelPositionJointMapLED(obj.labelPosition);
      }
      else{
        var labelProp = labelPositionJointMap(obj.labelPosition);
      }

   }
   else{
      var labelProp = labelPositionJointMap(obj.labelPosition);
   } 

  var strokeDasharray = 0;
  if(obj.elementType !== undefined && obj.elementType === "Peripherals" && obj.borderSize !== undefined)
  {
     nodeBorderWidth = Number(obj.borderSize);
     if(obj.borderType !== undefined && obj.borderType === "1")
     {
      nodeBorderWidth = 0;
     }
     if(obj.borderColor !== undefined)
     {
        nodeBorderClr = obj.borderColor;
     }
     nodeSeverity_Clr = obj.backgroundColor ? obj.backgroundColor : "#FFFFFF";//No I18N
     strokeDasharray = (obj.borderType === "3" ? 4 : 0);//No I18N
  }
  

  //default position of label  - Bottom Center
    
    var labelAlignment = {
          text: obj.label ? obj.label : obj.dispName,
          x: labelProp.x,
          y: labelProp.y,
          "text-anchor": labelProp.textAnchor,//No I18N
          textVerticalAnchor: labelProp.textVerticalAnchor,
          "font-size": (obj.fontSize !== undefined ? Number(obj.fontSize) : 12),//No I18N
          "fontFamily": (obj.font !== undefined ? String(obj.font) : "Open Sans"),//No I18N
          "fontWeight": (obj.bold !== undefined && obj.bold === "true" ? "bold" : 'none'),//No I18N
          "fontStyle": (obj.italic !== undefined && obj.italic === "true" ? "italic" : 'none'),//No I18N
          fill: (obj.labelColor !== undefined ? obj.labelColor : '#000000'),//No I18N
      //    "line-height": "30",//No I18N
          cursor: "pointer"//No I18N
      }
      
     //text word wrap
      if(obj.wordWrap !== undefined && String(obj.wordWrap) === "wordWrap")    
      {    
        labelAlignment.textWrap = {
           width: 'calc(w+30)', //No I18N
           height: null,
           ellipsis: false
        }    
      }
      else if(obj.wordWrap !== undefined && String(obj.wordWrap) === "none")    //No truncate label    
      { 
        delete labelAlignment.textWrap;    
      }
      else{ //truncate label - default     
        labelAlignment.textWrap = {
          width: 'calc(w + 30)',//No I18N
          height: 25,
          ellipsis: true
        }   
        
      }

      if(obj.showLabel !== undefined && obj.showLabel === "false")
      {
        labelAlignment.text = "";//No I18N
      }



  if(OPMClient.BVMapDetailsController.isEditBV)
  {
    elementCursor = "move";//No I18N
  }   
  var iconSize = { width: obj.width?Number(obj.width):60, height: obj.height?Number(obj.height):60 }
  var imgX = ((iconSize.width - (iconSize.width * imageRatio))/2) + 4; 
  var imgY = ((iconSize.height - (iconSize.height * imageRatio))/2) + 4; 

    if(obj.elementShape !== undefined && obj.elementShape === "circle")
      {
        circleShape = {
            size: { width:iconSize.width, height: iconSize.height }, 
            refCx: '50%',//No I18N
            refCy: '50%',//No I18N
            refR: '50%',//No I18N
            fill: nodeSeverity_Clr,
            fillOpacity:nodeFillOpacity,
            stroke:nodeBorderClr,
            strokeWidth:nodeBorderWidth,
            display:rectLedDisplay,
            pointerEvents: 'none'//No I18N
          }
          rectFillOpacity = 0;
          rectBorderWidth = 0;
      }else if(obj.elementShape !== undefined && obj.elementShape === "hexagon")//No I18N
      {
        hexagonShape = {
          refPoints: '50,0 93,25 93,75 50,100 7,75 7,25', //No I18N
          fill: nodeSeverity_Clr,
          fillOpacity:nodeFillOpacity,
          stroke:nodeBorderClr,
          strokeWidth:nodeBorderWidth,
          display:rectLedDisplay,
          pointerEvents: 'none'//No I18N
        }
        rectBorderWidth = 0;
        rectFillOpacity = 0;
        imageRatio = 0.8;
      }
      else{
        rectBorderWidth = nodeBorderWidth;
        rectFillOpacity = nodeFillOpacity;
      }



   if(obj.isShortcut !== undefined && obj.isShortcut)
   {
      var imageCell = new customImage({
         markup:[{
              tagName:"rect",//No I18N
              selector:"rect",//No I18N
              groupSelector:"g"//No I18N
            },
            {
              tagName:"circle",//No I18N
              selector:"circle",//No I18N
              groupSelector:"g"//No I18N
            }, 
            {
              tagName:"polygon",//No I18N
              selector:"polygon",//No I18N
              groupSelector:"g"//No I18N
            },
            {
              tagName:"image",//No I18N
              selector:"image",//No I18N
              groupSelector:"g"//No I18N
            },
            {
              tagName:"circle",//No I18N
              selector:"sevDot",//No I18N
              groupSelector:"g"//No I18N
            },
             {
              tagName:"rect",//No I18N
              selector:"labelBackground",//No I18N
              groupSelector:"g"//No I18N
            },
             {
              tagName:"text",//No I18N
              selector:"imagecellLabel",//No I18N
              groupSelector:"g"//No I18N
            }
        ],
        position: { x:x, y:y }, 
        size: { width:iconSize.width, height: iconSize.height }, 
        attrs: {
          image: { 
            "xlink:href": obj.symbolIcon,//No I18N
            refX: imgX, 
            refY: imgY, 
            width:(iconSize.width * imageRatio) - 8,
            height:(iconSize.height * imageRatio) - 8,
            cursor: elementCursor
          },
          rect: { 
            width:iconSize.width,
            height:iconSize.height,
            stroke:nodeBorderClr,
            strokeWidth:rectBorderWidth,
            fill:nodeSeverity_Clr,
            fillOpacity:rectFillOpacity,
            cursor: elementCursor,
            display:rectLedDisplay
          },
          circle:circleShape,
          polygon:hexagonShape,
          sevDot:sevDotAttrs,
          labelBackground: {
                  'ref': 'imagecellLabel', //No I18N
                  'ref-width': 'calc(w + 5)', //No I18N
                  'ref-height': 'calc(h + 5)',//No I18N 
                  width: 'calc(w + 5)', //No I18N
                  height: 'calc(h + 5)', //No I18N
                  fill: labelBg_Clr, 
                  stroke: '#b3b3b3', //No I18N
                  strokeWidth: 0.2,
                  x:'calc(x - 2)',//No I18N
                  y:'calc(y - 2)',//No I18N
                  display:(obj.showLabel !== undefined && obj.showLabel === "false" || labelAlignment.text === "" ? "none" : "block")//No I18N
          },
          imagecellLabel:labelAlignment 
        }
      });
        imageCell.set("id",obj.id);//No I18N
      //  if(OPMClient.BVMapDetailsController.isEditBV)
        //{
          imageCell.set("nodeObj",obj);//No I18N
        //}
        
    }else{    
      var imageCell = new customImage({
        markup:[{
          tagName:"rect",//No I18N
          selector:"rect",//No I18N
          groupSelector:"g"//No I18N
        },
        {
          tagName:"circle",//No I18N
          selector:"circle",//No I18N
          groupSelector:"g"//No I18N
        }, 
        {
          tagName:"polygon",//No I18N
          selector:"polygon",//No I18N
          groupSelector:"g"//No I18N
        },
        {
          tagName:"image",//No I18N
          selector:"image",//No I18N
          groupSelector:"g"//No I18N
        },
        {
          tagName:"circle",//No I18N
          selector:"sevDot",//No I18N
          groupSelector:"g"//No I18N
        },
         {
          tagName:"rect",//No I18N
          selector:"labelBackground",//No I18N
          groupSelector:"g"//No I18N
        },
         {
          tagName:"text",//No I18N
          selector:"imagecellLabel",//No I18N
          groupSelector:"g"//No I18N
        }
        ],
        position: { x:x, y:y }, 
        size: { width:iconSize.width, height: iconSize.height }, 
        attrs: {
          image: { 
            "xlink:href": obj.symbolIcon,//No I18N
            refX: imgX, 
            refY: imgY, 
            width:(iconSize.width * imageRatio) - 8,
            height:(iconSize.height * imageRatio) - 8,
            cursor: elementCursor
          },
          rect: { 
            width:iconSize.width,
            height:iconSize.height,
            stroke:nodeBorderClr,
            strokeWidth:rectBorderWidth,
            strokeDasharray:strokeDasharray,
            fill:nodeSeverity_Clr,
            fillOpacity:rectFillOpacity,
            cursor: elementCursor,
            display:rectLedDisplay
          },
          circle:circleShape,
          polygon:hexagonShape,
          sevDot:sevDotAttrs,
          labelBackground: {
                  'ref': 'imagecellLabel', //No I18N
                  'ref-width': 'calc(w + 5)', //No I18N
                  'ref-height': 'calc(h + 5)',//No I18N 
                  width: 'calc(w + 5)', //No I18N
                  height: 'calc(h + 5)', //No I18N
                  fill: labelBg_Clr,
                  stroke: '#b3b3b3', //No I18N
                  strokeWidth: 0.2,
                  x:'calc(x - 2)',//No I18N
                  y:'calc(y - 2)',//No I18N
                  display:(obj.showLabel !== undefined && obj.showLabel === "false" || labelAlignment.text === "" ? "none" : "block")//No I18N
          },
          imagecellLabel:labelAlignment
        }

      });

      if(obj.elementType !== undefined && obj.elementType === "Peripherals")
      {
        obj.entityType = "NonMO";//No I18N
        imageCell.set("ElementType","Peripherals");//No I18N
        imageCell.set("typeId",2);//No I18N
      } 
      imageCell.set("id",obj.id);//No I18N
      imageCell.set("nodeObj",obj);//No I18N
      if(obj.linkZ !== undefined)
      {
        imageCell.set("z",Number(obj.linkZ));//No I18N
      }
    }
     if(paper !== undefined)
      {
        paper.model.addCell(imageCell);
      }
      else{
        bv_jointGraph.addCell(imageCell);  
        if(obj.elementType !== undefined && obj.elementType === "Peripherals" && event !== undefined)
        {
          bvRemoveElementTools(currentElementView);
          currentElementView = bv_jointPaper.findViewByModel(imageCell);
          bvShowShapeProperties(currentElementView.model);
        }
      }
      

}

//Define object controls 
function getMarkup(angle) {
  return [
    {
      tagName: "circle",//No I18N
      selector: "button",//No I18N
      attributes: {
        r: 7,
        fill: "#4666E5",//No I18N
        stroke: "#FFFFFF",//No I18N
        cursor: "pointer"//No I18N
      }
    },
    {
      tagName: "path",//No I18N
      selector: "icon",//No I18N
      attributes: {
        transform: "rotate("+angle+")",//No I18N
        d: "M -4 -1 L 0 -1 L 0 -4 L 4 0 L 0 4 0 1 -4 1 z",//No I18N
        fill: "#FFFFFF",//No I18N
        stroke: "none",//No I18N
        "stroke-width": 2,//No I18N
        "pointer-events": "none"//No I18N
      }
    }
  ];
}
var connectRight = new joint.elementTools.Connect({
/*  x: "100%",//No I18N
  y: "40%",//No I18N */
  magnet: 'base',//No I18N
  useModelGeometry: true,
  x: '100%',
  y: '50%',
  markup: getMarkup(-10)
});

var connectBottom = new joint.elementTools.Connect({
  x: "50%",//No I18N
  y: "100%",//No I18N
  magnet: 'base',//No I18N
  useModelGeometry: true,
  markup: getMarkup(90)
});
var connectTop = new joint.elementTools.Connect({
  x: "50%",//No I18N
  y: "0%",//No I18N
  magnet: 'base',//No I18N
  useModelGeometry: true,
  markup: getMarkup(270)
});
var connectLeft = new joint.elementTools.Connect({
  x: "0%",//No I18N
  y: "50%",//No I18N
  magnet: 'base',//No I18N
  useModelGeometry: true,
  markup: getMarkup(190)
});
//Define Reize Objects
var ResizeTool = joint.elementTools.Control.extend({
  children: [
    {
      tagName: "rect",//No I18N
      selector: "handle",//No I18N
      /*attributes: {
        cursor: "se-resize",//No I18N
        r: 6,
        fill: "#4666e5"//No I18N
      }*/
      attributes: {
        width:10,
        height:10,
        cursor: "se-resize",//No I18N
        fill: "#fff",//No I18N
        stroke: "#4a7bcb",//No I18N
        "stroke-width": 1,//No I18N
        x:-4,
        y:-4
      }
    },
    {
      tagName: "rect",//No I18N
      selector: "extras",//No I18N
      attributes: {
        "pointer-events": "none",//No I18N
        fill: "#4a7bcb",//No I18N
        //stroke: "#33334F",
        "fill-opacity": 0.1,//No I18N
        stroke: "#4a7bcb",//No I18N
        "stroke-width": 2,//No I18N
        "stroke-dasharray": "2,4",//No I18N
        "class":"resize_extras",//No I18N
        rx: 5,
        ry: 5
      }
    }

  ],
  getPosition: function (view) {
    var model = view.model;
    return { x: model.size().width, y: model.size().height };
  },
  setPosition: function (view, coordinates) {
    var model = view.model;
    var newSize = {
      width: Math.max(coordinates.x - 10, 1),
      height: Math.max(coordinates.y - 10, 1)
    };
    bvResizeElements(model,newSize,true);
  }
});


function confirmRemoval(elementView) {
  elementView.model.remove();
}


function bvCreateLinks(sourceView, targetView,obj) {
  
  var line_connector = (bvLinkConnecters[obj.lineStyle].connector !== undefined ? bvLinkConnecters[obj.lineStyle].connector : "normal");
  var line_router = (bvLinkConnecters[obj.lineStyle].router !== undefined ? bvLinkConnecters[obj.lineStyle].router : "");
  arrowSize = bv_arrowSize[Number(obj.thickness) - 1];
  if(arrowSize === undefined)
  {
    arrowSize = Number(obj.thickness) * 4;
  }
  var linkSrcColor = "#000000";

  var singleArrow = {};
  var dualArrow = {};
  if(obj.arrowType !==undefined && obj.arrowType === "singleArrow")
  {
      singleArrow = {
        d: normalizeMarker('M 0 0 L '+arrowSize+' -'+(arrowSize-6)+' C '+(arrowSize-2)+' 0 '+(arrowSize-2)+' 0 '+arrowSize+' '+(arrowSize-6)+' z'),//No I18N
        fill:linkSrcColor,
        "stroke": "none", //No I18N
        args:{
          refX:15
        }
      }
      dualArrow = {};
  }
  else{
        singleArrow = {};
        dualArrow = {
          atConnectionRatio: 0.5,
          stroke: 'none',//No I18N
           display: (obj.arrowType !== undefined && obj.arrowType==="none" ? "none" : 'block'),//No I18N
          strokeWidth:0,
              d:normalizeMarker("M 0 0 l 9 0"),//No I18N
              sourceMarker:{
                d: normalizeMarker('M 0 0 L '+arrowSize+' '+(arrowSize/2)+' L 0 '+arrowSize+' Z'),//No I18N
                fill: linkSrcColor,
                "stroke": "none" //No I18N
              },
               targetMarker:{
                d: normalizeMarker('M 0 0 L '+arrowSize+' '+(arrowSize/2)+' L 0 '+arrowSize+' Z'),//No I18N
                fill:linkSrcColor,
                "stroke": "none" //No I18N
              }
          }
  }

   var SplitLink = joint.dia.Link.define('SplitLink', {//No I18N
    attrs: {
            line: {
                connection: true,
                strokeWidth: obj.thickness ? obj.thickness : 3
            },
            first: {
                stroke: linkSrcColor,
                index: 0
            },
            second: {
                stroke: linkSrcColor,
                index: 1
            },
            arrowhead: dualArrow
      }
    }, 
    {

      markup: [{
          tagName: 'path',//No I18N
          selector: 'first',//No I18N
          groupSelector:"line",//No I18N
          event:"link:pointerdown",//No I18N
           attributes: {
            stroke: linkSrcColor,
            fill:"none"//No I18N
           }
      }, {
          tagName: 'path',//No I18N
          selector: 'second',//No I18N
          groupSelector:"line",//No I18N
          event:"link:pointerdown",//No I18N
           attributes: {
            stroke: linkSrcColor,
            fill:"none"//No I18N
           }
      }, {
          tagName: 'path',//No I18N
          selector: 'arrowhead',//No I18N
          groupSelector:"path"//No I18N
      }]
    }, 
    {
        attributes: {
            index: {
                set: function(index, refBBox, node, attrs, linkView) {
                    var length = linkView.getConnectionLength() / 2;
                    if (index === 0) {
                         return { 'stroke-dasharray': length };//No I18N
                    } else {
                      return { 'stroke-dasharray': 0 +' '+length+' '+length };//No I18N
                    }
                }
            }
        }
    });

      var new_link = new SplitLink({
            "type": "SplitLink",//No I18N
            source: {
              id: sourceView.model.id,
              connectionPoint: { name: 'boundary', args: { sticky: true } }//No I18N
            },
            target: {
              id: targetView.model.id,
              connectionPoint: { name: 'boundary', args: { sticky: true, offset: (obj.arrowType !== undefined && obj.arrowType === "singleArrow" ? 8 : 1) } }//No I18N
            },
             connector: {
              name: line_connector
            },
            vertices:(obj.vertices !== undefined && obj.vertices.length > 0 ? obj.vertices : []),
            "attrs": {//No I18N
                "line": {//No I18N
                    "strokeLinejoin": "round",//No I18N
                     event:"link:pointerdown",//No I18N
                     targetMarker:singleArrow
                }
            }
        });  


    if(line_router !== undefined && line_router !== "")
    {
      new_link.router({"name":line_router});     //No I18N
    } 

  if(obj.label !== "" && obj.showLabel!==undefined && (obj.showLabel===true || obj.showLabel==="true")){
        new_link.appendLabel({
            id:"link_label",//No I18N
            markup: [{
                tagName: 'rect',//No I18N
                selector: 'labelBody'//No I18N
            }, {
                tagName: 'text',//No I18N
                selector: 'labelText'//No I18N
            }],
            attrs: {
                labelText: {
                    text: obj.label,
                    fontSize: 12,
                    fill:  obj.labelColor !== undefined ? obj.labelColor : '#2c6cd2',//No I18N
                    textAnchor: 'middle',//No I18N
                  //  yAlignment: 'middle',
                    pointerEvents: 'none',//No I18N
                    fontFamily: 'LatoRegular'//No I18N
                },
                labelBody: {
                    ref: 'labelText',//No I18N
                    x: 'calc(x - 2.5)',//No I18N
                    y: 'calc(y - 2.5)',//No I18N
                    width: 'calc(w + 5)',//No I18N
                    height: 'calc(h + 5)',//No I18N
                    stroke: '#e3e3e3',//No I18N
                    fill: '#FFFFFF',//No I18N
                    strokeWidth: 1,
                    rx: 1,
                    ry: 1
                }
            },
            position: {
                  offset:20,
             //   distance: 0.05,
               // angle: 70,
                args: {
                    keepGradient: true,
                    ensureLegibility: true
                }
            }
        });
      }

    removeLinksFromGraph(preview_Link);
    new_link.set("linkObj",obj);  //No I18N
    bv_jointGraph.addCell(new_link);
    if(obj.lineStyle === "1")
    {
      adjustLinkVertices(bv_jointGraph,new_link);
    }

}

function getLinkToolsView() {
  var verticesTool = new joint.linkTools.Vertices();
  var targetArrowheadTool = new joint.linkTools.TargetArrowhead();
  var sourceArrowheadTool = new joint.linkTools.SourceArrowhead();

  return new joint.dia.ToolsView({
    tools: [verticesTool, targetArrowheadTool, sourceArrowheadTool]
  });
}
function normalizeMarker(d, offset) {
    var path = new g.Path(V.normalizePathData(d));
    var bbox = path.bbox();
    var ty = - bbox.height / 2 - bbox.y;
    var tx = - bbox.width / 2 - bbox.x;
    if (typeof offset === 'number'){ tx -= offset;}//No I18N
    path.translate(tx, ty);
    return path.serialize();
}
function drawLinksBetweenNodes(src,dest,obj,paper)
{ 
    if(obj.linkObj.lineStyle === undefined)
    {
      obj.linkObj.lineStyle = "1";//No I18N
    }        
    var line_connector = (bvLinkConnecters[String(obj.linkObj.lineStyle)].connector !== undefined ? bvLinkConnecters[String(obj.linkObj.lineStyle)].connector : "normal");//No I18N
    var line_router = (bvLinkConnecters[String(obj.linkObj.lineStyle)].router !== undefined ? bvLinkConnecters[String(obj.linkObj.lineStyle)].router : "");
  
    var linkSrcColor = obj.color;
    var linkDestColor = obj.color;
    if(obj.isTrafficColor)
    {
      linkSrcColor = obj.trafficColors[0];
      linkDestColor = obj.trafficColors[1];
    }
    arrowSize = bv_arrowSize[Number(obj.linkObj.thickness) - 1];
    if(arrowSize === undefined)
    {
      arrowSize = Number(obj.linkObj.thickness) * 4;
    }

    var singleArrow = {};
    var dualArrow = {};
    if(obj.linkObj.arrowType !==undefined && obj.linkObj.arrowType === "singleArrow")
    {
        singleArrow = {
          d: normalizeMarker('M 0 0 L '+arrowSize+' -'+(arrowSize-6)+' C '+(arrowSize-2)+' 0 '+(arrowSize-2)+' 0 '+arrowSize+' '+(arrowSize-6)+' z'),//No I18N
          fill:linkDestColor,
          "stroke": "none" //No I18N
        }
        dualArrow = {};
    }
    else{
          singleArrow = {};
          dualArrow = {
            atConnectionRatio: 0.5,
            stroke: 'none',//No I18N
            strokeWidth:0,
            d:"M 0 0 l 9 0",//No I18N
            display: (obj.linkObj.arrowType !== undefined && obj.linkObj.arrowType==="none" ? "none" : 'block'),//No I18N
            sourceMarker:{
              d: normalizeMarker('M 0 0 L '+arrowSize+' '+(arrowSize/2)+' L 0 '+arrowSize+' Z'),//No I18N
              fill: linkSrcColor,
              "stroke": "none" //No I18N
            },
             targetMarker:{
              d: normalizeMarker('M 0 0 L '+arrowSize+' '+(arrowSize/2)+' L 0 '+arrowSize+' Z'),//No I18N
              fill:linkDestColor,
              "stroke": "none" //No I18N
            }
        }
    }


    var SplitLink = joint.dia.Link.define('SplitLink', {//No I18N
    attrs: {
            line: {
                connection: true,
                strokeWidth: obj.linkObj.thickness ? obj.linkObj.thickness : 3
            },
            first: {
                stroke: linkSrcColor,
                index: 0
            },
            second: {
                stroke: linkDestColor,
                index: 1
            },
            crossing: {
            	atConnectionRatio: 0.5
    		},
		    arrowhead: dualArrow
      }
    }, 
    {

       markup: [{
        tagName: 'path',//No I18N
        selector: 'first',//No I18N
        groupSelector:"line",//No I18N
         attributes: {
          stroke: linkSrcColor,
          fill:"none"//No I18N
         }
    }, {
        tagName: 'path',//No I18N
        selector: 'second',//No I18N
        groupSelector:"line",//No I18N
         attributes: {
          stroke: linkDestColor,
          fill:"none"//No I18N
         }
    }, {
        tagName: 'path',//No I18N
        selector: 'arrowhead',//No I18N
        groupSelector:"path"//No I18N
    }]
	  }, 
    {
        attributes: {
            index: {
                set: function(index, refBBox, node, attrs, linkView) {
                    var length = linkView.getConnectionLength() / 2;
                    if (index === 0) {
                         return { 'stroke-dasharray': length };//No I18N
                    } else {
                    	return { 'stroke-dasharray': 0 +' '+length+' '+length };//No I18N
                    }
                }
            }
        }
    });

      var linkdefault = new SplitLink({
            "type": "SplitLink",//No I18N
            "source": {//No I18N
                "id": String(src),//No I18N
                connectionPoint: { name: 'boundary', args: { sticky: true } }//No I18N
            },
            "target": {//No I18N
                "id": String(dest),//No I18N
                connectionPoint: { name: 'boundary', args: { sticky: true,offset: (obj.linkObj.arrowType !== undefined && obj.linkObj.arrowType === "singleArrow" ? 8 : 1) } }//No I18N
            },
            "connector": {//No I18N
                "name": line_connector//No I18N
            },
            vertices:(obj.linkObj.vertices !== undefined && obj.linkObj.vertices.length > 0 ? JSON.parse(obj.linkObj.vertices) : []),
            "id": obj.linkObj.name,//No I18N
            //"z": Number(obj.linkObj.linkZ),//No I18N
            "attrs": {//No I18N
                "line": {//No I18N
                    "strokeLinejoin": "round",//No I18N
                     "targetMarker":singleArrow //No I18N
                }
            }
        });  
    if(line_router !== undefined && line_router !== "")  
    {
    	linkdefault.router({"name": line_router});  //No I18N
    }
     if(obj.linkObj.linkZ !== undefined)  
    {
      linkdefault.set("z",Number(obj.linkObj.linkZ));  //No I18N
    }

    if(obj.label !== "" && obj.linkObj.showLabel!==undefined && (obj.linkObj.showLabel===true || obj.linkObj.showLabel==="true")){
        linkdefault.appendLabel({
            id:"link_label",//No I18N
            markup: [{
                tagName: 'rect',//No I18N
                selector: 'labelBody'//No I18N
            }, {
                tagName: 'text',//No I18N
                selector: 'labelText'//No I18N
            }],
            attrs: {
                labelText: {
                    text: obj.label,
                    fontSize: (obj.linkObj.fontSize !== undefined ? Number(obj.linkObj.fontSize) : 12),
                    fill: obj.linkObj.labelColor !== undefined ? obj.linkObj.labelColor : '#2c6cd2',//No I18N
                    textAnchor: 'middle',//No I18N
                    y: 'calc(h - '+(Number(obj.linkObj.fontSize)+3)+')',//No I18N
                    pointerEvents: 'none',//No I18N
                    fontFamily: 'LatoRegular'//No I18N
                },
                labelBody: {
                    ref: 'labelText',//No I18N
                    x: 'calc(x - 2.5)',//No I18N
                    y: 'calc(y - 2.5)',//No I18N
                    width: 'calc(w + 5)',//No I18N
                    height: 'calc(h + 5)',//No I18N
                    stroke: '#e3e3e3',//No I18N
                    fill: '#FFFFFF',//No I18N
                    strokeWidth: 1,
                    rx: 1,
                    ry: 1
                }
            },
            position: {
           //       offset:10,
             //   distance: 0.05,
               // angle: 70,
                args: {
                    keepGradient: true,
                    ensureLegibility: true
                }
            }
        });
      }

          if(obj.linkObj.showTrafficOverLink !== undefined && (obj.linkObj.showTrafficOverLink === "true" ||  obj.linkObj.showTrafficOverLink === true))
          {

          //show Traffic label
          if(obj.fromLabel !== ""){
          linkdefault.appendLabel({
              id:"link_FromLabel",//No I18N
              markup: [{
                  tagName: 'rect',//No I18N
                  selector: 'labelBody'//No I18N
              }, {
                  tagName: 'text',//No I18N
                  selector: 'trafficText'//No I18N
              }],
              attrs: {
                  trafficText: {
                      text: obj.fromLabel,
                      fontSize: 12,
                      fill:  obj.linkObj.labelColor !== undefined ? obj.linkObj.labelColor : '#2c6cd2',//No I18N
                      textAnchor: 'middle',//No I18N
                    //  yAlignment: 'middle',
                      pointerEvents: 'none',//No I18N
                      fontFamily: 'LatoRegular'//No I18N
                      // /display: 'none'
                  },
                  labelBody: {
                      ref: 'trafficText',//No I18N
                      x: 'calc(x - 2.5)',//No I18N
                      y: 'calc(y - 2.5)',//No I18N
                      width: 'calc(w + 5)',//No I18N
                      height: 'calc(h + 5)',//No I18N
                      stroke: '#e3e3e3',//No I18N
                      fill: '#FFFFFF',//No I18N
                      strokeWidth: 1,
                      rx: 1,
                      ry: 1
                  }
              },
              position: {
                    //offset:0.2,
                  distance: 0.2,
               //   angle: 90,
                  args: {
                      keepGradient: false,
                      ensureLegibility: true
                  }
              }
          });
        }
          if(obj.toLabel !== ""){
            linkdefault.appendLabel({
              id:"link_ToLabel",//No I18N
              markup: [{
                  tagName: 'rect',//No I18N
                  selector: 'labelBody'//No I18N
              }, {
                  tagName: 'text',//No I18N
                  selector: 'trafficText'//No I18N
              }],
              attrs: {
                  trafficText: {
                      text: obj.toLabel,
                      fontSize: 12,
                      fill:  obj.linkObj.labelColor !== undefined ? obj.linkObj.labelColor : '#2c6cd2',//No I18N
                      textAnchor: 'middle',//No I18N
                    //  yAlignment: 'middle',
                      pointerEvents: 'none',//No I18N
                      fontFamily: 'LatoRegular'//No I18N
                      // /display: 'none'
                  },
                  labelBody: {
                      ref: 'trafficText',//No I18N
                      x: 'calc(x - 2.5)',//No I18N
                      y: 'calc(y - 2.5)',//No I18N
                      width: 'calc(w + 5)',//No I18N
                      height: 'calc(h + 5)',//No I18N
                      stroke: '#e3e3e3',//No I18N
                      fill: '#FFFFFF',//No I18N
                      strokeWidth: 1,
                      rx: 1,
                      ry: 1
                  }
              },
              position: {
                    //offset:0.2,
                  distance: 0.8,
                 //angle: 90,
                  args: {
                      keepGradient: false,
                      ensureLegibility: true
                  }
              }
          });
          }
          
        }
    linkdefault.set("linkObj",obj.linkObj);  //No I18N
    if(paper !== undefined)
      {
        linkdefault.addTo(paper.model);
      }
      else{
        linkdefault.addTo(bv_jointGraph);
      }
   
}

function clearBVMapData()
{
  if(bv_jointGraph !== null)
    {
    	bv_jointGraph.clear();
    }
    currentElementView = null;
    currentSelected_Link = null;
    bv_selectAll = false;
}
function saveBVJointMap()
{
	isChanges = false;
	isSave = false;
	var allNodes = bv_jointGraph.getElements();
	var allEdges = bv_jointGraph.getLinks();
	
	if((mapProps.name).search("_bview.netmap") !== -1)
	{	
		var deviceProps = {"addedDevices":[],"selectedDevices":[],"addedShortcuts":[],"shortcuts":[],"addedLinks":[],"addedBVObjProps":[],"editedBVObjProps":[],"removedDevices":[],"removedLinks":[],"removedShortcuts":[],"removedBVObjProps":[]}//No I18N
		deviceProps.name = mapProps.name;
		deviceProps.label = mapProps.label;
		deviceProps.imageName = mapProps.imageName;
		deviceProps.grid = mapProps.grid;
		//deviceProps.font = (mapProps.font !== undefined ? mapProps.font : "Open Sans");//No I18N
		//deviceProps.bold = mapProps.bold;
		//deviceProps.italic = mapProps.italic;
		//deviceProps.fontSize = (mapProps.fontSize !== undefined ? mapProps.fontSize : "12");//No I18N
		//deviceProps.labelColor = mapProps.labelColor;
		deviceProps.bgColor = mapProps.bgColor;
    if(mapProps.linkStatusType)
    {
      deviceProps.bvProps = {"linkStatusType":mapProps.linkStatusType};//No I18N
    }

			if(devDeleteCntArr.length > 0)
			{
				$.each(devDeleteCntArr, function(ind, obj)
				{
					if(obj.type === "MOGroup")
					{
            if(obj.mapName !== undefined)
						{
                var newArray = {
  						"objName":String(obj.objName),//No I18N
  	  					"mapName":String(obj.mapName)//No I18N
  	  					}
  						deviceProps.removedShortcuts.push(newArray);
            }
					}
          else if(obj.entityType === "NonMO")
          {
            if(obj.associationID !== undefined)
            {
              deviceProps.removedBVObjProps.push(Number(obj.associationID));
            }
          }
					else
					{
  					var isRemove = false;
  					$.each(OPMClient.BVMapDetailsController.bvOldData.deviceProperties, function(j,n){
  						if(String(n.name)===String(obj.name)){
  							isRemove = true;
  						}
  					});
  					if(isRemove){
  						deviceProps.removedDevices.push(String(obj.name));
  					}
				}

				});
			}
		
		$.each(allNodes, function(key, val)
		{
			var obj = val.attributes.nodeObj;
			var x = val.attributes.position.x;
			var y = val.attributes.position.y;
			
			if(obj.entityType !== undefined && obj.entityType === "NonMO")
      {
        var newArray = {
          "name":String(obj.name),//No I18N
          "objName":String(obj.name),//No I18N
          "x":Math.round(Number(x)),//No I18N
          "y":Math.round(Number(y)),//No I18N
          "width":Math.round(Number(obj.width)),//No I18N
          "height":Math.round(Number(obj.height)),//No I18N
          "labelPosition":7//No I18N
        }
        if(window.OPM.isEEProbeSelected && obj.iconOrginName !== undefined){
          newArray.iconName="/"+String(obj.iconOrginName);
        }else if(obj.iconName !== undefined){
          newArray.iconName=String(obj.iconName);
        }

        if(val.attributes.typeId !== undefined)
        {
           newArray.typeId=val.attributes.typeId;
        }
        if(val.attributes.size.width !== undefined)
        {
           newArray.width=Math.round(Number(val.attributes.size.width));
        }
        if(val.attributes.size.height !== undefined)
        {
           newArray.height=Math.round(Number(val.attributes.size.height));
        }
        if(obj.label !== undefined)
        {
           newArray.label=String(obj.label);
        } 
         if(obj.font !== undefined)
        {
           newArray.font=obj.font;
        } 
         if(obj.bold !== undefined)
        {
           newArray.bold=String(obj.bold);
        } 
         if(obj.italic !== undefined)
        {
           newArray.italic=String(obj.italic);
        } 
         if(obj.fontSize !== undefined)
        {
           newArray.fontSize=String(obj.fontSize);
        }  
        if(obj.backgroundColor !== undefined)
        {
           newArray.backgroundColor=obj.backgroundColor;
        }  
        if(obj.labelColor !== undefined)
        {
           newArray.labelColor=obj.labelColor;
        }
        if(obj.borderColor !== undefined)
        {
           newArray.borderColor=obj.borderColor;
        }if(obj.borderSize !== undefined)
        {
           newArray.borderSize=Number(obj.borderSize);
        }if(obj.borderType !== undefined)
        {
           newArray.borderType=Number(obj.borderType);
        } 
        if(obj.showLabel !== undefined)
        {
           newArray.showLabel=String(obj.showLabel);
        } 
        if(obj.entityType !== undefined)
        {
           newArray.type=String(obj.entityType);
        } 
        if(val.attributes.z !== undefined)
        {
           newArray.linkZ = Number(val.attributes.z);
        } 
        if(obj.associationID !== undefined && !OPMClient.MapsEditBvMapController.copyAs)
        {
          newArray.associationID=Number(obj.associationID);
          deviceProps.editedBVObjProps.push(newArray);
        }else{
          deviceProps.addedBVObjProps.push(newArray);
        }
      }
      else if(obj.type !== "MOGroup" && obj.className === undefined || (obj.type !== "MOGroup" && OPMClient.MapsEditBvMapController.copyAs))
			{
				var newArray = {
					"name":String(obj.name),//No I18N
					"objName":String(obj.name),//No I18N
					"x":String(parseInt(x)),//No I18N
					"y":String(parseInt(y)),//No I18N
					"label":String(obj.label),//No I18N
					"objType":String(obj.objType),//No I18N
					"mapName":String(mapProps.name),//No I18N
					"truncateLabel":String(obj.truncateLabel),//No I18N
					"truncateVal":String(obj.truncateVal),//No I18N
				//	"className":'com.adventnet.nms.mapdb.MapSymbol',//No I18N*/
					//"iconName": String(obj.iconName),//No I18N
					"showLabel":String(obj.showLabel),//No I18N
					"apiclient":"true"//No I18N
					
				}

				if(window.OPM.isEEProbeSelected && obj.iconOrginName !== undefined){
					newArray.iconName="/"+String(obj.iconOrginName);
				}else{
					newArray.iconName=String(obj.iconName);
				}
				if(obj.iconSize!==undefined){
					newArray.iconSize=String(obj.iconSize);
				}
				/*if(obj.background!==undefined){
					newArray.background=String(obj.background);
					newArray.backgroundColor=String(obj.backgroundColor);
				}*/
				if(obj.font !== undefined){
					newArray.font=String(obj.font);
				}
				if(obj.fontSize !== undefined){
					newArray.fontSize=String(obj.fontSize);
				}
       if(obj.bold !== undefined)
        {
           newArray.bold=String(obj.bold);
        } 
         if(obj.italic !== undefined)
        {
           newArray.italic=String(obj.italic);
        } 
				if(obj.labelColor!==undefined){
					newArray.labelColor=String(obj.labelColor);
				}
        if(obj.labelBGColor !== undefined)
        {
           newArray.labelBGColor=obj.labelBGColor;
        } 
				if(obj.labelPosition!==undefined){
					newArray.labelPosition=String(obj.labelPosition);
				}
        if(obj.wordWrap!==undefined){
          newArray.wordWrap=String(obj.wordWrap);
        } if(obj.elementShape!==undefined){
          newArray.elementShape=String(obj.elementShape);
        }
        if(val.attributes.size !== undefined && val.attributes.size.width !== undefined){
          newArray.width=Math.round(Number(val.attributes.size.width));
          newArray.height=Math.round(Number(val.attributes.size.height));
        }

				var isAdd = true;
				$.each(deviceProps.removedDevices, function(k,rdev){
					if(rdev===String(newArray.name)){
						isAdd = false;
						deviceProps.removedDevices.splice(k,1);
						return false;
}
				});
				if(isAdd){
				deviceProps.addedDevices.push(newArray);
				}
				else{
					deviceProps.selectedDevices.push(newArray);
			}
			}
			else if(obj.className !== undefined && obj.type !== "MOGroup")
			{
				var newArray = {
					"name":String(obj.name),//No I18N
					"objName":String(obj.name),//No I18N
					"x":String(parseInt(x)),//No I18N
					"y":String(parseInt(y)),//No I18N
					"label":String(obj.label),//No I18N
					"objType":String(obj.objType),//No I18N
					"mapName":String(mapProps.name),//No I18N
					//"iconName":String(obj.iconName),//No I18N
					"showLabel":String(obj.showLabel),//No I18N
					"truncateLabel":String(obj.truncateLabel),//No I18N
					"truncateVal":String(obj.truncateVal),//No I18N
					"apiclient":"true"//No I18N
				}
				if(window.OPM.isEEProbeSelected && obj.iconOrginName !== undefined){
					newArray.iconName="/"+String(obj.iconOrginName);
				}else{
					newArray.iconName=String(obj.iconName);
				}
				if(obj.iconSize!==undefined){
					newArray.iconSize=String(obj.iconSize);
				}
				/*if(obj.background!==undefined){
					newArray.background=String(obj.background);
					newArray.backgroundColor=String(obj.backgroundColor);
				}*/
				if(obj.labelColor!==undefined){
					newArray.labelColor=String(obj.labelColor);
				}
        if(obj.labelBGColor !== undefined)
        {
           newArray.labelBGColor=obj.labelBGColor;
        } 
		  	if(obj.font !== undefined){
          newArray.font=String(obj.font);
        }
        if(obj.fontSize !== undefined){
          newArray.fontSize=String(obj.fontSize);
        }
        if(obj.bold !== undefined)
        {
           newArray.bold=String(obj.bold);
        } 
         if(obj.italic !== undefined)
        {
           newArray.italic=String(obj.italic);
        } 
				if(obj.labelPosition!==undefined){
					newArray.labelPosition=String(obj.labelPosition);
				}
        if(obj.wordWrap!==undefined){
          newArray.wordWrap=String(obj.wordWrap);
        }
        if(obj.elementShape!==undefined){
          newArray.elementShape=String(obj.elementShape);
        }
        if(val.attributes.size !== undefined && val.attributes.size.width !== undefined){
          newArray.width=Math.round(Number(val.attributes.size.width));
          newArray.height=Math.round(Number(val.attributes.size.height));
        }
				deviceProps.selectedDevices.push(newArray);
			}
			else if(obj.className === undefined && obj.type === "MOGroup" || OPMClient.MapsEditBvMapController.copyAs)
			{
				var icoName;
				if(obj.iconName.indexOf('../..') !== -1 ){
					iconName = obj.iconName.split('..')[2];
					obj.iconName = iconName;
				}

				var newShortcutArr = {
						"name": String(obj.name), //No I18N	
						"objName":String(obj.name), //No I18N	
						//"displayName":obj.displayName,//No I18N	
						"displayName": String(obj.displayName !== undefined ? String(obj.displayName) : String(obj.label)),//No I18N	
						"objType":String(obj.objType),//No I18N	
						"x": String(x),//No I18N	
						"y": String(y),//No I18N	
						"showLabel": String(obj.showLabel),//No I18N	
						"selectedTarget": String(obj.selectedTarget !== undefined && obj.selectedTarget !== "" ? obj.selectedTarget : obj.drillDownTo),//No I18N	
						"mapName":String(mapProps.name),//No I18N
						//"iconName":String(obj.iconName),//No I18N
						"apiclient":"true"//No I18N	
					}
					if(window.OPM.isEEProbeSelected && obj.iconOrginName !== undefined){
						newShortcutArr.iconName="/"+String(obj.iconOrginName);
					}else{
						newShortcutArr.iconName=String(obj.iconName);
					}

					if(String(obj.showLabel) === "true" && obj.truncateLabel !== undefined && String(obj.truncateLabel) === "true")
					{
						newShortcutArr.truncateLabel = String(obj.truncateLabel);
						newShortcutArr.truncateVal = String(obj.truncateVal);
					}
					if(obj.labelColor!==undefined){
						newShortcutArr.labelColor=String(obj.labelColor);
					}
  				if(obj.font !== undefined){
            newShortcutArr.font=String(obj.font);
          }
          if(obj.fontSize !== undefined){
            newShortcutArr.fontSize=String(obj.fontSize);
          }
         if(obj.bold !== undefined)
          {
             newShortcutArr.bold=String(obj.bold);
          } 
           if(obj.italic !== undefined)
          {
             newShortcutArr.italic=String(obj.italic);
          } 
					if(obj.labelPosition!==undefined){
						newShortcutArr.labelPosition=String(obj.labelPosition);
					}

					/*if(obj.background!==undefined){
						newShortcutArr.background=String(obj.background);
						newShortcutArr.backgroundColor=String(obj.backgroundColor);
					}*/
           if(obj.labelBGColor !== undefined)
          {
             newShortcutArr.labelBGColor=obj.labelBGColor;
          } 

					if(obj.iconSize!==undefined){
						newShortcutArr.iconSize=String(obj.iconSize);
					}
          if(obj.wordWrap!==undefined){
            newShortcutArr.wordWrap=String(obj.wordWrap);
          }
          if(obj.elementShape!==undefined){
            newShortcutArr.elementShape=String(obj.elementShape);
          }
           if(val.attributes.size !== undefined && val.attributes.size.width !== undefined){
          newShortcutArr.width=Math.round(Number(val.attributes.size.width));
          newShortcutArr.height=Math.round(Number(val.attributes.size.height));
        }

					var isAdd = true;
					$.each(deviceProps.removedShortcuts, function(k,rdev){
						if(rdev.mapName!==undefined && rdev.mapName===newShortcutArr.mapName){
							isAdd = false;
							deviceProps.removedShortcuts.splice(k,1);
							return false;
						}
					});
					if(isAdd){
					deviceProps.addedShortcuts.push(newShortcutArr);
					}
					else{
						deviceProps.shortcuts.push(newShortcutArr);
					}

			}
			else if(obj.className !== undefined && obj.type === "MOGroup")
			{
				var icoName;
				if(obj.iconName.indexOf('../..') !== -1 ){
					iconName = obj.iconName.split('..')[2];
					obj.iconName = iconName;
				}

				var newShortcutArr = {
						"name": String(obj.name),//No I18N	
						"objName":obj.objName,//No I18N	
						"displayName":obj.displayName,//No I18N
						"objType":String(obj.objType),//No I18N	
						"x": String(x),//No I18N	
						"y": String(y),//No I18N	
						"showLabel": String(obj.showLabel),//No I18N	
						//"selectedTarget": String(obj.selectedTarget),
						"mapName":String(mapProps.name),//No I18N
						//"iconName":String(obj.iconName),//No I18N
						"apiclient":"true"//No I18N	
					}
					if(window.OPM.isEEProbeSelected && obj.iconOrginName !== undefined){
						newShortcutArr.iconName="/"+String(obj.iconOrginName);					
					}else{
						newShortcutArr.iconName=String(obj.iconName);
					}

					if(String(obj.showLabel) === "true" && obj.truncateLabel !== undefined && String(obj.truncateLabel) === "true")
					{
						newShortcutArr.truncateLabel = String(obj.truncateLabel);
						newShortcutArr.truncateVal = String(obj.truncateVal);
					}
					if(obj.labelColor!==undefined){
						newShortcutArr.labelColor=String(obj.labelColor);
					}
					if(obj.font !== undefined){
            newShortcutArr.font=String(obj.font);
          }
          if(obj.fontSize !== undefined){
            newShortcutArr.fontSize=String(obj.fontSize);
          }
          if(obj.bold !== undefined)
          {
             newShortcutArr.bold=String(obj.bold);
          } 
           if(obj.italic !== undefined)
          {
             newShortcutArr.italic=String(obj.italic);
          }
        	if(obj.labelPosition!==undefined){
						newShortcutArr.labelPosition=String(obj.labelPosition);
					}	
					/*if(obj.background!==undefined){
						newShortcutArr.background=String(obj.background);
						newShortcutArr.backgroundColor=String(obj.backgroundColor);
					}*/
           if(obj.labelBGColor !== undefined)
          {
             newShortcutArr.labelBGColor=obj.labelBGColor;
          } 
					if(obj.iconSize!==undefined){
						newShortcutArr.iconSize=String(obj.iconSize);
					}
          if(obj.wordWrap!==undefined){
            newShortcutArr.wordWrap=String(obj.wordWrap);
          }
          if(obj.elementShape!==undefined){
            newShortcutArr.elementShape=String(obj.elementShape);
          }
            if(val.attributes.size !== undefined && val.attributes.size.width !== undefined){
          newShortcutArr.width=Math.round(Number(val.attributes.size.width));
          newShortcutArr.height=Math.round(Number(val.attributes.size.height));
        }

					deviceProps.shortcuts.push(newShortcutArr);
			}


		});

			if(linkDeleteCntArr.length > 0)
			{
				$.each(linkDeleteCntArr, function(ind, name)
				{
					deviceProps.removedLinks.push(String(name));

				});
			}

			$.each(allEdges, function(ind, obj)
			{
				var objs = obj.attributes;
				if(objs.linkObj !== undefined && objs.linkObj.linkType !== undefined && objs.linkObj.isNewLink!==true && !OPMClient.MapsEditBvMapController.copyAs)
				{
					var newArray = {
						"name":String(objs.linkObj.name),//No I18N
	  					"objName":String(objs.linkObj.objName),//No I18N
	  					"source":objs.linkObj.source,//No I18N
	  					"dest":objs.linkObj.dest,//No I18N
	  					"type":objs.linkObj.type,//No I18N
	  					"linkType":String(objs.linkObj.linkType),//No I18N
	  					//"destId":objs.linkObj,//No I18N
	  					//"sourceId":objs.linkObj,//No I18N
	  					"lineStyle":String(objs.linkObj.lineStyle),//No I18N
	  				//	"x":String(objs.linkObj.x),//No I18N
	  				//	"y":String(objs.linkObj.y),//No I18N
	  					"thickness":String(objs.linkObj.thickness),//No I18N
	  					"label":String(objs.linkObj.label),//No I18N
	  					"showLabel":String(objs.linkObj.showLabel),//No I18N
	  				//	"__ctrl_x":String(objs.linkObj.__ctrl_x),//No I18N
	  				//	"__ctrl_y":String(objs.linkObj.__ctrl_y),//No I18N
	  					"showArrow":String(objs.linkObj.showArrow === "NULL" ? false : objs.linkObj.showArrow),//No I18N
	  					"labelColor":String(objs.linkObj.labelColor),//No I18N
						"L2scope":String(objs.linkObj.L2scope)//No I18N
	  				//	"ny":String(540),//No I18N
	  				//	"nx":String(306),//No I18N
					}

					if(objs.linkObj.parentDispName !== undefined)
					{
						newArray.parentDispName = objs.linkObj.parentDispName;
					}

					if(objs.smooth !== undefined && objs.smooth.roundness !== undefined)
					{
						newArray.smoothType = objs.smooth.type;
						newArray.roundness = String(objs.smooth.roundness);
						if(objs.smooth.forceDirection !== undefined)
						{
							newArray.forceDirection = String(objs.smooth.forceDirection);
						}
						
					}
					if(newArray.linkType.indexOf("6")!==-1){
						newArray.nfaThresholdVal=String(objs.linkObj.nfaThresholdVal);
	  					newArray.nfaThresholdCondition=String(objs.linkObj.nfaThresholdCondition);
					}
					if(objs.dashes !== undefined)
					{
						newArray.isDotted = String(objs.dashes);
					}
					if(objs.linkObj.linkDevice !== undefined)
					{
						newArray.linkDevice = String(objs.linkObj.linkDevice);
					}
					if(objs.linkObj.destLinkDevice !== undefined)
					{
						newArray.destLinkDevice = String(objs.linkObj.destLinkDevice);
					}
				
					if(objs.linkObj.destObjName !== undefined)
					{
						newArray.destObjName = String(objs.linkObj.destObjName);
					}
					if(objs.linkObj.destName !== undefined)
					{
						newArray.destName = String(objs.linkObj.destName);
					}
					if(objs.linkObj.destParentDispName !== undefined)
					{
						newArray.destParentDispName = String(objs.linkObj.destParentDispName);
					}
					if(objs.linkObj.twoWay !== undefined && (objs.linkObj.twoWay == true || objs.linkObj.twoWay == "true"))
					{
						newArray.twoWay = String(objs.linkObj.twoWay);
						if(objs.linkObj.sourceIntfStatus !== undefined)
						{
							newArray.sourceIntfStatus = String(objs.linkObj.sourceIntfStatus);
						}
						if(objs.linkObj.destIntfStatus !== undefined)
						{
							newArray.destIntfStatus = String(objs.linkObj.destIntfStatus);
						}
					}
					if(objs.linkObj.showTrafficOverLink !== undefined)
					{
						newArray.showTrafficOverLink=String(objs.linkObj.showTrafficOverLink);
					}
          if(objs.linkObj.arrowType !== undefined)
          {
            newArray.arrowType=String(objs.linkObj.arrowType);
          }
          
          if(objs.z !== undefined)
          {
            newArray.linkZ=Number(objs.z);
          }
          if(objs.vertices !== undefined && objs.vertices.length > 0)
          {
            newArray.vertices=JSON.stringify(objs.vertices);
          }  if(objs.linkObj.fontSize !== undefined)
          {
            newArray.fontSize=String(objs.linkObj.fontSize);
          } 
         

					
					deviceProps.selectedDevices.push(newArray);
				}else if(objs.linkObj !== undefined)
					{
					var newArray = {
						"name":String(objs.linkObj.name),//No I18N
	  					"objName":String(objs.linkObj.objName),//No I18N
	  					"source":objs.linkObj.source,//No I18N
	  					"dest":objs.linkObj.dest,//No I18N
	  					"type":objs.linkObj.type,//No I18N
	  					"linkType":String(objs.linkObj.linkType),//No I18N
	  					"lineStyle":String(objs.linkObj.lineStyle),//No I18N
	  					"thickness":String(objs.linkObj.thickness),//No I18N
	  					"label":String(objs.linkObj.label),//No I18N
	  					"showLabel":String(objs.linkObj.showLabel),//No I18N
	  					"showArrow":String(objs.linkObj.showArrow === "NULL" ? false : objs.linkObj.showArrow),//No I18N
	  					"labelColor":String(objs.linkObj.labelColor),//No I18N
						"L2scope":String(objs.linkObj.L2scope)//No I18N
						
					}
					if(objs.linkObj.parentDispName !== undefined)
					{
						newArray.parentDispName = String(objs.linkObj.parentDispName);
					}


					if(objs.smooth !== undefined && objs.smooth.roundness !== undefined)
					{
						newArray.smoothType = objs.smooth.type;
						newArray.roundness = String(objs.smooth.roundness);
						if(objs.smooth.forceDirection !== undefined)
						{
							newArray.forceDirection = String(objs.smooth.forceDirection);
						}
					}
					if(newArray.linkType.indexOf("6")!==-1){
						newArray.nfaThresholdVal=String(objs.linkObj.nfaThresholdVal);
	  					newArray.nfaThresholdCondition=String(objs.linkObj.nfaThresholdCondition);
					}
					if(objs.dashes !== undefined)
					{
						newArray.isDotted = String(objs.dashes);
					}
					
					if(objs.linkObj.linkDevice !== undefined)
					{
						newArray.linkDevice = String(objs.linkObj.linkDevice);
					}
					if(objs.linkObj.destLinkDevice !== undefined)
					{
						newArray.destLinkDevice = String(objs.linkObj.destLinkDevice);
					}
					if(objs.linkObj.destObjName !== undefined)
					{
						newArray.destObjName = String(objs.linkObj.destObjName);
					}
					if(objs.linkObj.destName !== undefined)
					{
						newArray.destName = String(objs.linkObj.destName);
					}
					if(objs.linkObj.destParentDispName !== undefined)
					{
						newArray.destParentDispName = String(objs.linkObj.destParentDispName);
					}
					if(objs.linkObj.twoWay !== undefined && (objs.linkObj.twoWay == true || objs.linkObj.twoWay == "true"))
					{
						newArray.twoWay = String(objs.linkObj.twoWay);
						if(objs.linkObj.sourceIntfStatus !== undefined)
						{
							newArray.sourceIntfStatus = String(objs.linkObj.sourceIntfStatus);
						}
						if(objs.linkObj.destIntfStatus !== undefined)
						{
							newArray.destIntfStatus = String(objs.linkObj.destIntfStatus);
						}
					}
					if(objs.linkObj.showTrafficOverLink !== undefined)
					{
						newArray.showTrafficOverLink=String(objs.linkObj.showTrafficOverLink);
					}
          if(objs.linkObj.arrowType !== undefined)
          {
            newArray.arrowType=String(objs.linkObj.arrowType);
          }
          
					if(objs.z !== undefined)
					{
						newArray.linkZ=Number(objs.z);
					}
					if(objs.vertices !== undefined && objs.vertices.length > 0)
					{
						newArray.vertices=JSON.stringify(objs.vertices);
					}
					if(objs.linkObj.fontSize !== undefined)
          {
            newArray.fontSize=String(objs.linkObj.fontSize);
          } 

					var isAdd = true;
					$.each(deviceProps.removedLinks, function(k,rdev){
						if(rdev!==undefined && rdev===newArray.name){
							isAdd = false;
							deviceProps.removedLinks.splice(k,1);
							return false;
				}
			});
					if(isAdd){
						deviceProps.addedLinks.push(newArray);
					}
					else{
						deviceProps.selectedDevices.push(newArray);
					}
			}

				});

			var url = window.OPM.apiUrlPattern + '/businessview/saveBusinessView?bvName='+encodeURIComponent(mapProps.name); //No I18N
			if(OPMClient.MapsEditBvMapController.action === "Edit")
			{
			 url = window.OPM.apiUrlPattern + '/businessview/saveBusinessView?bvName='+encodeURIComponent(mapProps.name)+"&update=true"; //No I18N
			}
			var formdata = {deviceProps: JSON.stringify(deviceProps)};
			if(window.OPM.isMSPCentral && OPMClient.ApplicationController.isMSPCentralSelected)
			{
				formdata.customerID = $("#customerDrpDwn").val();
				formdata.probeID = $("#siteViewDrpDwn").val();
			}

			var uniqueId = '';//No I18N

			$.ajax({
		            url:url,
		            type: 'POST', //No I18N
		            data: formdata,
		            dataType: 'json',//No I18N
		            async:false,
		            beforeSend: function(XMLHttpRequest,settings){
						uniqueId = opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.map.flash.Saving',this));//No I18N
					},
		            success: function(response)
		            {
		            	$("#"+uniqueId).remove();
		            	 var message = ""; //No I18N
	               		if (response.error !== undefined)
						{
							response.error.message = opm_escapeHTML(response.error.message);
			               	showMessage(response);
							isChanges = true;
              isSave = true;
						}
						else if(response.result !== undefined)
						{
							showMessage(response);
							isChanges = false;
						}
						else if(response.mapName !== undefined)
						{
							OPMClient.MapsEditBvMapController.set("copyAs",false);//No I18N
							OPMClient.BVMapDetailsController.bvMapId = deviceProps.name.replace("_bview.netmap","");//No I18N
							var msg = Ember.I18n.t('webclient.vimonitor.snapshot.savemap',this);//No I18N
							
							/*if(isClose)
							{
								settingsGlobalRoute.transitionTo('Maps.BusinessView.BVMap',OPMClient.BVMapDetailsController.bvMapId+"_bv"); //No I18N
								//goToBVMapLink(mapProps.name);
							}
							else
							{*/
								var options={};
								options.callback_func= function(){
									isSave = true;
									if((window.OPM.currentView.name).indexOf('Maps.BusinessView.EditorTool') !== -1 || (window.OPM.currentView.name).indexOf('Maps.BusinessView.EditMap') !== -1)
									{
										settingsGlobalRoute.transitionTo('Maps.BusinessView.BVMap',OPMClient.BVMapDetailsController.bvMapId+"_bv"); //No I18N
									}
								}
								opm_infoMsgs('successMsg',msg,options);//No I18N
								isChanges = false;
							//}

						}
		            }
		       });
		}
}
function removeLinksFromGraph(link)
{
	 if (link) {
	    bv_jointGraph.removeCells([link]);
	  }
    removeHighlightLink(currentSelected_Link);
    currentSelected_Link = null;
}
function setBvBgImgJointMap(type,currentImg,imgSrc)
{
  if(type !== undefined && type === 'custom')
  {
    var imgName = $(currentImg).attr("imageName");//No I18N
    var imageSrc =  $(currentImg).attr("src");//No I18N
  }
  else{
     var imgName = currentImg;
     var imageSrc =  imgSrc;
  }
  if(imageSrc === undefined)
  {
    imgName = "[None]";//No I18N
    imageSrc = "";
  }
  $("#NoScheduleData.bvEditor").hide(); 
  isChanges = true;
  mapProps.imageName = "/maps/"+imgName;//No I18N

  if(imgName === "[None]" || imgName === "/maps/[None]"){//No I18N
     imageSrc = ""; 
  }
      if(imageSrc !== "" && imageSrc !== undefined) 
      {
        var img = new Image();
        img.onload = function() {
        
            bv_jointPaper.drawBackground({
            image: imageSrc,
            position: 'left top',//No I18N
         //  position: {x:img_x,y:img_y},//No I18N
            repeat: 'no-repeat',//No I18N
            size: 'auto auto',//No I18N
          //  size: {width:this.width,height:this.height},//No I18N
            //size: '100% 100%',
            opacity: 1
          });
          $("#"+bv_jointPaper.el.id+" .joint-paper-background").css({"width":(this.width)+"px","height":(this.height)+"px"});//No I18N
          setBVCanvasBGColor("#"+bv_jointPaper.el.id,$("#bv_canvasBGColor_value").val()); //No I18N
        }
        img.src = imageSrc;
      
      }
      else{
         bv_jointPaper.drawBackground({
              image: imageSrc,
              //position: 'top',//No I18N
              position: {x:0,y:0},
              repeat: 'no-repeat',//No I18N
             // size: 'auto auto',//No I18N
              //size: '100% 100%',
              opacity: 1
            });
            $("#"+bv_jointPaper.el.id+" .joint-paper-background").css({"width":"0px","height":"0px"});//No I18N
            setBVCanvasBGColor("#"+bv_jointPaper.el.id,$("#bv_canvasBGColor_value").val()); //No I18N
      }
     
}
function setBGGridJointMap(isGrid)
{
  if(!isGrid)
  {
    bv_jointPaper.setGrid(null);
  }
  else{
    bv_jointPaper.setGrid({
                name: 'doubleMesh',//No I18N
                args: [
                    { color: '#e6e6e6', thickness: 1 }, //No I18N
                    { color: '#cacaca', scaleFactor: 5, thickness: 1 } //No I18N
            ]});
  }
}
function redrawJointElement(elementView,obj)
{
  if(elementView !== null && elementView !== undefined)
  {


      if(obj.elementShape !== undefined && obj.elementShape === "circle")
      {
        var circleShape = {
            size: { width:Number(obj.width), height: Number(obj.height)}, 
            refCx: '50%',//No I18N
            refCy: '50%',//No I18N
            refR: '50%',//No I18N
            fill: elementView.attr('rect/fill'),//No I18N
            fillOpacity:0.3,
            stroke:elementView.attr('rect/stroke'),//No I18N
            strokeWidth:2,
            pointerEvents: 'none'//No I18N
          }
          elementView.removeAttr('polygon');//No I18N
          elementView.attr('circle', circleShape);//No I18N
          elementView.attr('rect/fillOpacity',0);//No I18N
          elementView.attr('rect/strokeWidth',0);//No I18N
      }else if(obj.elementShape !== undefined && obj.elementShape === "hexagon")//No I18N
      {
        var hexagonShape = {
          refPoints: '50,0 93,25 93,75 50,100 7,75 7,25', //No I18N
          fill: elementView.attr('rect/fill'),//No I18N
          fillOpacity:0.3,
          stroke:elementView.attr('rect/stroke'),//No I18N
          strokeWidth:2,
          pointerEvents: 'none'//No I18N
        }
        elementView.removeAttr('circle');//No I18N
        elementView.attr('polygon', hexagonShape);//No I18N
        elementView.attr('rect/fillOpacity',0);//No I18N
        elementView.attr('rect/strokeWidth',0);//No I18N
      }
      else{
        elementView.removeAttr('circle');//No I18N
        elementView.removeAttr('polygon');//No I18N
        elementView.attr('rect/fillOpacity',0.3);//No I18N
        elementView.attr('rect/strokeWidth',2);//No I18N
      }

    elementView.attr('image/xlink:href', obj.symbolIcon);//No I18N
    elementView.attr('rect/width', Number(obj.width));//No I18N
    elementView.attr('rect/height', Number(obj.height));//No I18N
    bvResizeElements(elementView,{width:Number(obj.width),height:Number(obj.height)},false);

    if(obj.showLabel !== undefined && (obj.showLabel === "true" || obj.showLabel === true))
    {
      elementView.attr('imagecellLabel/text', obj.label);//No I18N
    }
    else{
      elementView.attr('imagecellLabel/text', "");//No I18N
    }

    var labelProp = labelPositionJointMap(obj.labelPosition);
    elementView.attr('imagecellLabel/x', labelProp.x);//No I18N
    elementView.attr('imagecellLabel/y', labelProp.y);//No I18N
    elementView.attr('imagecellLabel/text-anchor', labelProp.textAnchor);//No I18N
    elementView.attr('imagecellLabel/textVerticalAnchor', labelProp.textVerticalAnchor);//No I18N
    elementView.attr('imagecellLabel/fill', obj.labelColor);//No I18N
    elementView.attr('imagecellLabel/font-size', Number(obj.fontSize));//No I18N
    elementView.attr('imagecellLabel/fontFamily', obj.font);//No I18N
    elementView.attr('imagecellLabel/fontWeight', (obj.bold === "true" ? "bold" : "none"));//No I18N
    elementView.attr('imagecellLabel/fontStyle', (obj.italic === "true" ? "italic" : "none"));//No I18N
   
    if(obj.wordWrap !== undefined && String(obj.wordWrap) === "truncate")//truncate label - default     
    {
        elementView.attr('imagecellLabel/textWrap',{//No I18N
             width: 'calc(w+30)', //No I18N
             height: 25,
             ellipsis: true
          });  
    }
    else if(obj.wordWrap !== undefined && String(obj.wordWrap) === "wordWrap")    //text word wrap
    {    
      elementView.removeAttr('imagecellLabel/textWrap');//No I18N
      elementView.attr('imagecellLabel/textWrap',{//No I18N
         width: 'calc(w+30)', //No I18N
         height: null,
         ellipsis: false
      });    
    }
    else if(obj.wordWrap !== undefined && String(obj.wordWrap) === "none")    //No truncate label    
    { 
      elementView.removeAttr('imagecellLabel/textWrap');//No I18N
    }

    if(obj.labelBGColor !== undefined){
      elementView.attr('labelBackground/fill', obj.labelBGColor);//No I18N
    }
  }
}
function labelPositionJointMap(l_type)
{
   var labelAlignment = {};
   switch(String(l_type)){
    case "1"://Top Left*/
             labelAlignment.x = 'calc(-0.1*w)',//No I18N
             labelAlignment.y = 'calc(-0.1*h)',//No I18N
            // labelAlignment.x = 'calc(-0.1*w)',//No I18N
             //labelAlignment.y = 'calc(-0.1*h)',//No I18N
             labelAlignment.textAnchor = "end",//No I18N
             labelAlignment.textVerticalAnchor='bottom'//No I18N
    break;
    case "2"://Top Center*/
             labelAlignment.x = 'calc(0.5*w)',//No I18N
             labelAlignment.y = 'calc(-0.2*h)',//No I18N
             labelAlignment.textAnchor = "middle",//No I18N
             labelAlignment.textVerticalAnchor='bottom'//No I18N
    break; 
    case "3"://Top Right*/
             labelAlignment.x = 'calc(w)',//No I18N
             labelAlignment.y = 'calc(-0.2*h)',//No I18N
             labelAlignment.textAnchor = "start",//No I18N
             labelAlignment.textVerticalAnchor='bottom'//No I18N
    break;
    case "4"://Middle Left*/
             labelAlignment.x = 'calc(-0.2*w)',//No I18N
             labelAlignment.y = 'calc(0.5*h)',//No I18N
             labelAlignment.textAnchor = "end",//No I18N
             labelAlignment.textVerticalAnchor='middle'//No I18N
    break;
     case "5"://Middle Right*/
             labelAlignment.x = 'calc(w+15)',//No I18N
             labelAlignment.y = 'calc(0.5*h)',//No I18N
             labelAlignment.textAnchor = "start",//No I18N
             labelAlignment.textVerticalAnchor='middle'//No I18N
    break;
     case "6"://Bottom Left*/
             labelAlignment.x = 'calc(-0.2*w)',//No I18N
             labelAlignment.y = 'calc(h)',//No I18N
             labelAlignment.textAnchor = "end",//No I18N
             labelAlignment.textVerticalAnchor='top'//No I18N
    break;
     case "7"://Bottom Center*/
             labelAlignment.x = 'calc(0.5*w)',//No I18N
             labelAlignment.y = 'calc(h+15)',//No I18N
             labelAlignment.textAnchor = "middle",//No I18N
             labelAlignment.textVerticalAnchor='top'//No I18N
    break;
     case "8"://Bottom Right*/
             labelAlignment.x = 'calc(w+5)',//No I18N
             labelAlignment.y = 'calc(h+2)',//No I18N
             labelAlignment.textAnchor = "start",//No I18N
             labelAlignment.textVerticalAnchor='top'//No I18N
    break;
    default://bottom middle
            labelAlignment.x = 'calc(0.5*w)',//No I18N
            labelAlignment.y = 'calc(h+15)',//No I18N
            labelAlignment.textAnchor = "middle",//No I18N
            labelAlignment.textVerticalAnchor='top'//No I18N
    break;         
            
  }
  return labelAlignment;
}
function labelPositionJointMapLED(l_type)
{
   var labelAlignment = {};
   switch(String(l_type)){
    case "1"://Top Left*/
             labelAlignment.x = 'calc(+0.1*w)',//No I18N
             labelAlignment.y = 'calc(+0.1*h)',//No I18N
            // labelAlignment.x = 'calc(-0.1*w)',//No I18N
             //labelAlignment.y = 'calc(-0.1*h)',//No I18N
             labelAlignment.textAnchor = "end",//No I18N
             labelAlignment.textVerticalAnchor='bottom'//No I18N
    break;
    case "2"://Top Center*/
             labelAlignment.x = 'calc(0.5*w)',//No I18N
             labelAlignment.y = 'calc(-0.1 * h)',//No I18N
             labelAlignment.textAnchor = "middle",//No I18N
             labelAlignment.textVerticalAnchor='bottom'//No I18N
    break; 
    case "3"://Top Right*/
             labelAlignment.x = 'calc(w-2)',//No I18N
             labelAlignment.y = 'calc(+0.1*h)',//No I18N
             labelAlignment.textAnchor = "start",//No I18N
             labelAlignment.textVerticalAnchor='bottom'//No I18N
    break;
    case "4"://Middle Left*/
             labelAlignment.x = 'calc(-0.1*w)',//No I18N
             labelAlignment.y = 'calc(0.5*h)',//No I18N
             labelAlignment.textAnchor = "end",//No I18N
             labelAlignment.textVerticalAnchor='middle'//No I18N
    break;
     case "5"://Middle Right*/
             labelAlignment.x = 'calc(w+2)',//No I18N
             labelAlignment.y = 'calc(0.5*h)',//No I18N
             labelAlignment.textAnchor = "start",//No I18N
             labelAlignment.textVerticalAnchor='middle'//No I18N
    break;
     case "6"://Bottom Left*/
             labelAlignment.x = 'calc(-0.1*w)',//No I18N
             labelAlignment.y = 'calc(h-2)',//No I18N
             labelAlignment.textAnchor = "end",//No I18N
             labelAlignment.textVerticalAnchor='top'//No I18N
    break;
     case "7"://Bottom Center*/
             labelAlignment.x = 'calc(0.5*w)',//No I18N
             labelAlignment.y = 'calc(h+5)',//No I18N
             labelAlignment.textAnchor = "middle",//No I18N
             labelAlignment.textVerticalAnchor='top'//No I18N
    break;
     case "8"://Bottom Right*/
             labelAlignment.x = 'calc(w+5)',//No I18N
             labelAlignment.y = 'calc(h+2)',//No I18N
             labelAlignment.textAnchor = "start",//No I18N
             labelAlignment.textVerticalAnchor='top'//No I18N
    break;
    default://bottom middle
            labelAlignment.x = 'calc(0.5*w)',//No I18N
            labelAlignment.y = 'calc(h+5)',//No I18N
            labelAlignment.textAnchor = "middle",//No I18N
            labelAlignment.textVerticalAnchor='top'//No I18N
    break;         
            
  }
  return labelAlignment;
}
function changeLabelSettingsJointMap(){
  isChanges = true;
  var fontSize = parseInt($("#deviceLabelSize").val());
  var fontface = $("#deviceLabelFont").val();
  var colorCode ="#"+$('#bvFontColor').val(); // No I18N
  var labelBold = $("#boldLabel").prop("checked");
  var labelItalic = $("#ItalicLabel").prop("checked");

  var bvJointNodes = bv_jointGraph.getElements();
  if(bvJointNodes !== undefined && bvJointNodes.length > 0){

      $.each(bvJointNodes, function(i,element){
        if(element.attributes.nodeObj.labelColor){
          element.attributes.nodeObj.labelColor=colorCode;
        }
        if(element.attributes.nodeObj.bold !== undefined){
          element.attributes.nodeObj.bold=labelBold;
        }
        if(element.attributes.nodeObj.font){
          element.attributes.nodeObj.font=fontface;
        }
        if(element.attributes.nodeObj.italic !== undefined){
          element.attributes.nodeObj.italic=labelItalic;
        }
        if(element.attributes.nodeObj.fontSize){
          element.attributes.nodeObj.fontSize=fontSize;
        }
        element.attr('.imagecell-label/fill', colorCode);//No I18N
        element.attr('.imagecell-label/font-size', fontSize);//No I18N
        element.attr('.imagecell-label/fontWeight', (labelBold === true ? "bold" : 'none'));//No I18N
        element.attr('.imagecell-label/fontFamily', fontface);//No I18N
        element.attr('.imagecell-label/fontStyle', (labelItalic === true ? "italic" : "none"));//No I18N
        
      });
  }
}
function bvUpdateLinks(sourceView,targetView,obj,currentLink)
{
  var updateLink = currentLink.model;

  var line_connector = (bvLinkConnecters[obj.lineStyle].connector !== undefined ? bvLinkConnecters[obj.lineStyle].connector : "normal");
  var line_router = (bvLinkConnecters[obj.lineStyle].router !== undefined ? bvLinkConnecters[obj.lineStyle].router : "");
  arrowSize = bv_arrowSize[Number(obj.thickness) - 1];
  if(arrowSize === undefined)
  {
    arrowSize = Number(obj.thickness) * 4;
  }
  var linkSrcColor = "#000000";

  var singleArrow = {};
  var dualArrow = {};
  if(obj.arrowType !==undefined && obj.arrowType === "singleArrow")
  {
      singleArrow = {
        d: normalizeMarker('M 0 0 L '+arrowSize+' -'+(arrowSize-6)+' C '+(arrowSize-2)+' 0 '+(arrowSize-2)+' 0 '+arrowSize+' '+(arrowSize-6)+' z'),//No I18N
        fill:linkSrcColor,
        "stroke": "none", //No I18N
        args:{
          refX:15
        }
      }
      dualArrow = {};
      updateLink.removeAttr('arrowhead');//No I18N
      updateLink.attr('line/targetMarker',singleArrow);//No I18N
  }
  else{
        singleArrow = {};
        dualArrow = {
          atConnectionRatio: 0.5,
          stroke: 'none',//No I18N
          display: (obj.arrowType !== undefined && obj.arrowType==="none" ? "none" : 'block'),//No I18N
          strokeWidth:0,
              d:normalizeMarker("M 0 0 l 9 0"),//No I18N
              sourceMarker:{
                d: normalizeMarker('M 0 0 L '+arrowSize+' '+(arrowSize/2)+' L 0 '+arrowSize+' Z'),//No I18N
                fill: linkSrcColor,
                "stroke": "none" //No I18N
              },
               targetMarker:{
                d: normalizeMarker('M 0 0 L '+arrowSize+' '+(arrowSize/2)+' L 0 '+arrowSize+' Z'),//No I18N
                fill:linkSrcColor,
                "stroke": "none" //No I18N
              }
          }
      updateLink.removeAttr('line/targetMarker');//No I18N
      updateLink.attr("arrowhead",dualArrow);//No I18N
      
   
  }
  updateLink.attr('line/strokeWidth', obj.thickness);//No I18N
  if(line_connector !== undefined && line_connector !== "")
  {
    updateLink.connector({"name":line_connector});     //No I18N
  }
  if(line_router !== undefined && line_router !== "")
  {
    updateLink.router({"name":line_router});     //No I18N
  }
  else{
     updateLink.unset('router');//No I18N
  }  

  if(obj.lineStyle === "1")//No I18N
  {
     updateLink.unset('vertices');//No I18N
  }

  if(obj.label !== "" && obj.showLabel !== undefined && (obj.showLabel===true || obj.showLabel==="true"))
  {
      var linkLabels = updateLink.get('labels');
      
      var labelIndex = linkLabels !== undefined && linkLabels.findIndex(function(label) { return label.id === 'link_label'; });

      if (labelIndex !== -1) 
      {
        updateLink.label(labelIndex,{
              markup: [{
                  tagName: 'rect',//No I18N
                  selector: 'labelBody'//No I18N
              }, {
                  tagName: 'text',//No I18N
                  selector: 'labelText'//No I18N
              }],
              attrs: {
                  labelText: {
                      text: obj.label,
                      fontSize: obj.fontSize !== undefined ? Number(obj.fontSize) : 12,
                      fill: obj.labelColor,
                      textAnchor: 'middle',//No I18N
                      y: 'calc(h - '+(Number(obj.fontSize)+3)+')',//No I18N
                      pointerEvents: 'none',//No I18N
                      fontFamily: 'LatoRegular'//No I18N
                  },
                  labelBody: {
                      ref: 'labelText',//No I18N
                      x: 'calc(x - 2.5)',//No I18N
                      y: 'calc(y - 2.5)',//No I18N
                      width: 'calc(w + 5)',//No I18N
                      height: 'calc(h + 5)',//No I18N
                      stroke: '#e3e3e3',//No I18N
                      fill: '#FFFFFF',//No I18N
                      strokeWidth: 1,
                      rx: 1,
                      ry: 1
                  }
              },
              position: {
                  //  offset:'calc(h)',
               //   distance: 0.05,
                 // angle: 70,
                  args: {
                      keepGradient: true,
                      ensureLegibility: true
                  }
              }
          });
      }
      else{
         updateLink.appendLabel({
            id:"link_label",//No I18N
            markup: [{
                tagName: 'rect',//No I18N
                selector: 'labelBody'//No I18N
            }, {
                tagName: 'text',//No I18N
                selector: 'labelText'//No I18N
            }],
            attrs: {
                labelText: {
                    text: obj.label,
                    fontSize: obj.fontSize !== undefined ? Number(obj.fontSize) : 12,
                    fill: obj.labelColor,
                    textAnchor: 'middle',//No I18N
                    y: 'calc(h - '+Number(obj.fontSize)+')',//No I18N
                    pointerEvents: 'none',//No I18N
                    fontFamily: 'LatoRegular'//No I18N
                },
                labelBody: {
                    ref: 'labelText',//No I18N
                    x: 'calc(x - 2.5)',//No I18N
                    y: 'calc(y - 2.5)',//No I18N
                    width: 'calc(w + 5)',//No I18N
                    height: 'calc(h + 5)',//No I18N
                    stroke: '#e3e3e3',//No I18N
                    fill: '#FFFFFF',//No I18N
                    strokeWidth: 1,
                    rx: 1,
                    ry: 1
                }
            },
            position: {
                  offset:20,
             //   distance: 0.05,
               // angle: 70,
                args: {
                    keepGradient: true,
                    ensureLegibility: true
                }
            }
        });
      }

  }else{
    var linkLabels = updateLink.get('labels');
    var labelIndex = linkLabels !== undefined && linkLabels.findIndex(function(label) { return label.id === 'link_label'; });
    if(linkLabels && labelIndex !== -1)
    {
      updateLink.removeLabel(labelIndex);
    }
  }

  removeHighlightLink(currentSelected_Link);
  currentSelected_Link = null;
}
function removeBVElementsJointMap(bvElement){
  removeDupBVDeleteLists();
  var okCallback = function()
  {
    if(bvElement !== undefined && bvElement.model.isElement())
      {
          var obj = bvElement.model.attributes.nodeObj;
          if(obj !== undefined && OPMClient.MapsEditBvMapController.action === "Edit" || (mapProps.name).search("_bview.netmap") !== -1)
          {
              var connectedLinks = bv_jointGraph.getConnectedLinks(bvElement.model);
            $.each(connectedLinks, function(i2,linkElm){
              var val = linkElm.attributes.linkObj;
              if((val.source===obj.objName || val.dest===obj.objName)){
                linkDeleteCntArr.push(val.name);
                if(val.destName !== undefined && val.destName !== "")
                {
                  linkDeleteCntArr.push(val.destName);
                }
              }
            });
            devDeleteCntArr.push(obj);
          }

          bvElement.model.remove();
          currentElementView = null;
          if(obj !== undefined && obj.isShortcut!==undefined && obj.isShortcut===true){
            opm_removeItemFromArray(shortBvListArr,obj.objName);
            var shortcut_Txt_elm = $(".bv-view__count-info .bv_shortcuts-count");//No I18N
            shortcut_Txt_elm.text(Number(shortcut_Txt_elm.text())-1);
          }else if(obj.entityType === undefined || obj.entityType !== "NonMO"){   //No I18N
            var dev_Txt_elm = $(".bv-view__count-info .bv_entities-count");//No I18N
            dev_Txt_elm.text(Number(dev_Txt_elm.text())-1);
          }
          
          /*if(devDeleteCntArr.length > 0)
          {
          */  deleteDevArr = [];
            getFilteredDevicesNew("fromDelOption"); //No I18n
          //}
    } 
      if(bvElement !== undefined && bvElement.model.isLink())
      {
      //  $.each(delList.edges, function(i,eachLink){
          if(OPMClient.MapsEditBvMapController.action === "Edit" || (mapProps.name).search("_bview.netmap") !== -1)
          {
           // var conns = bvedges.get(eachLink);
                var linkObj = bvElement.model.attributes.linkObj;
                if(linkObj !== undefined && linkObj.className !== undefined && linkObj.mapName !== undefined)
                {
                  linkDeleteCntArr.push(linkObj.name);
                  if(linkObj.destName !== undefined && linkObj.destName !== "")
                  {
                    linkDeleteCntArr.push(linkObj.destName);
                  }
                }
          }
          bvElement.model.remove();
        //});
        deleteLinkArr = [];
      }
  }



  opmConfirm(Ember.I18n.t('webclient.agent.confirm'),Ember.I18n.t('webclient.map.flash.DeleteConfirmDialog_msg'),450,okCallback,'','','','','dialogStyle2',true,false,'',true,true);//No I18N
    
 
    
}

function bv_updateZoomAndCenter(paper) {
  paper.scale(bv_zoomLevel, bv_zoomLevel);
  if(window.OPM.userPermissions.mapsWrite)
  {
    isZoomChanged = true;
  }
  bvZoom_Val = paper.scale().sx;
  if(paper.widgetID !== undefined)
  {
      bvZoomValues(paper.widgetID,bvZoom_Val);
  }
}
function opm_searchBVElements(searchEle)
{
    if(trimAll(searchEle) !== "")
    {
      if(highlightList.length > 0 || highlightEdgeList.length > 0){
        opm_clearBVElements();
      }
      highlightList = [];
      highlightEdgeList = [];
      var paper = getBVJointPaper(OPMClient.BVMapDetailsController.elementId);
      var allNodes = paper.model.getElements();
      for (var i = 0; i < allNodes.length; i++) {
          var curNode = allNodes[i].attributes;
         if(curNode.nodeObj.label !== undefined && curNode.nodeObj.label !== "" && (curNode.nodeObj.label).toLowerCase().indexOf((searchEle).toLowerCase()) >= 0 || (curNode.nodeObj.ipAddress !== undefined && (curNode.nodeObj.ipAddress).toLowerCase().indexOf((searchEle).toLowerCase()) >= 0))
          {

              var cellView = paper.findViewByModel(allNodes[i]);
              joint.highlighters.mask.add(cellView, { selector: 'root' }, 'my-element-highlight', {//No I18N
                    deep: true,
                    attrs: {
                        'stroke': '#F2CC0E',//No I18N
                        'stroke-width': 4//No I18N
                    }
              });
              highlightList.push(cellView);
          }
      }

       var allEdges = paper.model.getLinks();
       for (var j = 0; j < allEdges.length; j++) {
            var curEdge = allEdges[j].attributes;
            
           if((curEdge.linkObj.intfDisplayName !== undefined && curEdge.linkObj.intfDisplayName !== "" && (curEdge.linkObj.intfDisplayName).toLowerCase().indexOf((searchEle).toLowerCase()) >= 0) || (curEdge.linkObj.ifName !== undefined && curEdge.linkObj.ifName !== "" && (curEdge.linkObj.ifName).toLowerCase().indexOf((searchEle).toLowerCase()) >= 0))
            {
              var cellView = paper.findViewByModel(allEdges[j]);
              highlightEdgeList.push(cellView);
              opm_bvSearchLink(cellView);

            }
             if(curEdge.linkObj.destProps !== undefined && (curEdge.linkObj.destProps.intfDisplayName !== "" && (curEdge.linkObj.destProps.intfDisplayName).toLowerCase().indexOf((searchEle).toLowerCase()) >= 0 || (curEdge.linkObj.destProps.ifName !== undefined && curEdge.linkObj.destProps.ifName !== "" && (curEdge.linkObj.destProps.ifName).toLowerCase().indexOf((searchEle).toLowerCase()) >= 0)))
            {
              var cellView = paper.findViewByModel(allEdges[j]);
              highlightEdgeList.push(cellView);
              opm_bvSearchLink(cellView);
            }

        }
      
      $(".bv-view__actions .bv-search-count").text((highlightList.length+highlightEdgeList.length)).show(); //No I18N
      $(".bv-view__actions .bv-close-search").show();
    }
    else{
      opm_clearBVElements();
    }    

}
function opm_bvSearchLink(linkView){
   joint.highlighters.mask.add(linkView, { selector: 'line' }, 'my-link-highlight', {//No I18N
       // layer: 'back',//No I18N
        padding: 0,
        alphaValue: 0.3,
        attrs: {
            'stroke': '#F2CC0E',//No I18N
            'stroke-width': 4,//No I18N
            'stroke-linecap': 'square',//No I18N
            'fill': '#F2CC0E',//No I18N
            'fill-opacity': 0.3,//No I18N
            'stroke-opacity': 0.3//No I18N
        }
    });
}
function opm_clearBVElements()
{
    if(highlightList.length > 0)  
    {
      highlightList.forEach(function(cellView) {
        joint.highlighters.mask.remove(cellView)
      });
    }
    if(highlightEdgeList.length > 0)  
    {
      highlightEdgeList.forEach(function(cellView) {
        joint.highlighters.mask.remove(cellView)
      });
    }
    highlightList = [];
    highlightEdgeList = [];
    $(".bv-view__actions .bv-search-count").text("").hide(); //No I18N
    $(".bv-view__actions .bv-close-search").hide();
}
function setPaperCenterPosition()
{
  var scrollLeft = ($("#BVMapBGImg").width()/2)-($("#networkDiagramView").width()/2);
  var scrollTop = ($("#BVMapBGImg").height()/2)-($("#networkDiagramView").height()/2);
  $("#networkDiagramView").scrollLeft(scrollLeft);
  $("#networkDiagramView").scrollTop(scrollTop);
}
function bvAddDynamicShapes(type,obj,paper)
{
  if(paper === undefined)
  {
    removeHighLightFromElements();
    if(currentElementView !== null)
    {
      bvRemoveElementTools(currentElementView);
    }
  }
  var elementCursor = "default";//No I18N
  if(OPMClient.BVMapDetailsController.isEditBV)
  {
    elementCursor = "move";//No I18N
  }
  switch(Number(type))
  {
    case 4:
      if(obj === undefined)
      {
          obj = {
              name:"shapes_"+new Date().getTime(),//No I18N
              backgroundColor:"#FFFFFF",//No I18N
              borderColor:"#000000",//No I18N
              width:200,
              height:150,
              borderSize:2,
              borderType:"2",//No I18N
              x:100,
              y:100
            }
          obj.id = obj.name;  
          obj.objName = obj.name;  
          obj.isShowProp = true;  
          obj.shapeType = "Square";//No I18N
        }

      var shapeRect = new joint.shapes.standard.Rectangle({
         markup:[{
                tagName:"rect",//No I18N
                selector:"rect"//No I18N
              }],
        position: { x: obj.x, y: obj.y },
        size: { width: obj.width, height: obj.height },
        attrs: {
          rect: {
            width: obj.width, 
            height: obj.height, 
            strokeWidth: (obj.borderType == "1" ? 0 : Number(obj.borderSize)),
            stroke: obj.borderColor,
            fill: obj.backgroundColor,
            strokeDasharray:(obj.borderType === "3" ? 4 : 0),//No I18N
            cursor:elementCursor
          }
        }
      });
      obj.entityType = "NonMO";//No I18N
      shapeRect.set("id",obj.id);//No I18N
      shapeRect.set("ElementType","Square");//No I18N
      shapeRect.set("typeId",4);//No I18N
      shapeRect.set("nodeObj",obj);//No I18N
      if(obj.linkZ !== undefined)
      {
        shapeRect.set("z",Number(obj.linkZ));//No I18N
      }
      if(paper !== undefined)
      {
        shapeRect.addTo(paper.model);
      }
      else{
        shapeRect.addTo(bv_jointGraph);
        if(obj.isShowProp !== undefined && obj.isShowProp)
        {
          currentElementView = bv_jointPaper.findViewByModel(shapeRect);
          enableControlToolsForElement(currentElementView);
          bvShowShapeProperties(currentElementView.model);
        }
      }  
      
     break;
     case 3:
          if(obj === undefined)
          {
            obj = {
              name:"shapes_"+new Date().getTime(),//No I18N
              backgroundColor:"#FFFFFF",//No I18N
              borderColor:"#000000",//No I18N
              width:150,
              height:150,
              borderSize:2,
              borderType:"2",//No I18N
              x:425,
              y:10
            }
            obj.id = obj.name;
            obj.objName = obj.name;      
            obj.isShowProp = true;
            obj.shapeType = "Circle";//No I18N
          } 
          
        var shapeCircle = new joint.shapes.standard.Ellipse();
        shapeCircle.resize(obj.width, obj.height);
        shapeCircle.position(obj.x, obj.y);
        obj.entityType = "NonMO";//No I18N
        shapeCircle.set("id",obj.id);//No I18N
        shapeCircle.set("ElementType","Circle");//No I18N
        shapeCircle.set("typeId",3);//No I18N
        shapeCircle.set("nodeObj",obj);//No I18N
        shapeCircle.attr({
            body: {
                fill: obj.backgroundColor,
                stroke: obj.borderColor,
                strokeWidth: (obj.borderType == "1" ? 0 : Number(obj.borderSize)),
                strokeDasharray:(obj.borderType === "3" ? 4 : 0),//No I18N
                cursor:elementCursor
            }
        });
        if(obj.linkZ !== undefined)
        {
          shapeCircle.set("z",Number(obj.linkZ));//No I18N
        }
          if(paper !== undefined)
          {
            shapeCircle.addTo(paper.model);
          }
          else{
            shapeCircle.addTo(bv_jointGraph);
            if(obj.isShowProp !== undefined && obj.isShowProp)
            {
                currentElementView = bv_jointPaper.findViewByModel(shapeCircle);
                enableControlToolsForElement(currentElementView);
                bvShowShapeProperties(currentElementView.model);
            }
          }
        
     break;
     case 1:
          if(obj === undefined)
          {
              var textId = "shapes_"+new Date().getTime();  //No I18N          
              obj = {
                name:textId,
                label:"Text",//No I18N
                backgroundColor:"#FFFFFF",//No I18N
                labelColor:"#000000",//No I18N
                width:150,
                height:45,
                x:100,
                y:100,
                borderSize:2,
                borderType:"2",//No I18N
                "fontSize": 16,//No I18N
                "font": "Open Sans",//No I18N
                "bold": 'false',//No I18N
                "italic": 'false'//No I18N
              }  
            obj.id = obj.name;
            obj.objName = obj.name;
            obj.isShowProp = true;    
            obj.shapeType = "Text";//No I18n
          }
          

          var textRect = new joint.shapes.standard.Rectangle({
           markup:[{
                  tagName:"rect",//No I18N
                  selector:"rect"//No I18N
                },
                {
                  tagName:"text",//No I18N
                  selector:"label"//No I18N
                }
                ],
          position: { x: obj.x, y: obj.y },
          size: { width: obj.width, height: obj.height },
          attrs: {
            rect: {
              width: obj.width, 
              height:obj.height, 
              strokeWidth: (obj.borderType == "1" ? 0 : Number(obj.borderSize)),
              strokeDasharray:(obj.borderType === "3" ? 4 : 0),
              stroke: "#000000",//No I18N
              fill: obj.backgroundColor,
              cursor:elementCursor
            },
            label: {
              id:obj.id+"_text_box",//No I18N
              cursor:elementCursor,
              fill: obj.labelColor,
            //  fontSize: "calc(h/2)",//No I18N
              fontSize: Number(obj.fontSize),
              "fontFamily": obj.font,//No I18N
              "fontWeight": (obj.bold === "true" ? "bold" : "none"),//No I18N
              "fontStyle": (obj.italic === "true" ? "italic" : "none"),//No I18N
              "display":"block",//No I18N
              "class":"bv_dynamic_text",//No I18N
             //  lineHeight:30,
         //     x:"calc(w/2)",
           //   y:"calc(h/2)",
              textWrap: {
                 text: obj.label,
             //    width: 'calc(w+30)', //No I18N
                 height: null,
                 ellipsis: false
              }
            }
          }
        });
        obj.entityType = "NonMO";//No I18N
        textRect.set("id",obj.id);//No I18N
        textRect.set("ElementType","Text");//No I18N
        textRect.set("typeId",1);//No I18N
        textRect.set("nodeObj",obj);//No I18N
        if(obj.linkZ !== undefined)
        {
          textRect.set("z",Number(obj.linkZ));//No I18N
        }
       if(paper !== undefined)
        {
          textRect.addTo(paper.model);
        }
        else{
          textRect.addTo(bv_jointGraph);
          if(obj.isShowProp !== undefined && obj.isShowProp)
          {
            currentElementView = bv_jointPaper.findViewByModel(textRect);
            enableControlToolsForElement(currentElementView);
            bvShowTextProperties(currentElementView.model);
          }
        }
     break;
   }   

}
function bvUpdateDynamicText(elementView,obj)
{
  elementView.attr('label/fontSize', Number(obj.fontSize));//No I18N
 // $(".bv_dynamic_text").css("font-size",Number(obj.fontSize));
//  $(".bv_dynamic_text").css("line-height","150%");
  elementView.attr('label/textWrap/text', obj.label);//No I18N
  elementView.attr('label/fontFamily', obj.font);//No I18N
  elementView.attr('label/fontWeight', (obj.bold === "true" ? "bold" : "none"));//No I18N
  elementView.attr('label/fontStyle', (obj.italic === "true" ? "italic" : "none"));//No I18N
  elementView.attr('label/fill',obj.labelColor);//No I18N
  elementView.attr('rect/fill',obj.backgroundColor);//No I18N
  elementView.attr('rect/strokeWidth', (obj.borderType == "1" ? 0 : Number(obj.borderSize)));//No I18N
  elementView.attr('rect/strokeDasharray', (obj.borderType === "3" ? 4 : 0));//No I18N
  elementView.attr('rect/width', Number(obj.width));//No I18N
  elementView.attr('rect/height', Number(obj.height));//No I18N
  bvResizeElements(elementView,{width:Number(obj.width),height:Number(obj.height)},false);

}
function bvUpdateDynamicShapes(elementView,obj)
{ 
  if(elementView.attributes.ElementType === "Circle")
  {
    elementView.attr('body/fill', obj.backgroundColor);//No I18N
    elementView.attr('body/stroke', obj.borderColor);//No I18N
    elementView.attr('body/strokeWidth', (obj.borderType == "1" ? 0 : Number(obj.borderSize)));//No I18N
    elementView.attr('body/strokeDasharray', (obj.borderType === "3" ? 4 : 0));//No I18N
    bvResizeElements(elementView,{width:Number(obj.width),height:Number(obj.height)},false);

  }
  else if(elementView.attributes.ElementType === "Peripherals"){
    elementView.attr('rect/fill', obj.backgroundColor);//No I18N
    elementView.attr('rect/stroke', obj.borderColor);//No I18N
    elementView.attr('rect/strokeWidth', (obj.borderType == "1" ? 0 : Number(obj.borderSize)));//No I18N
    elementView.attr('rect/strokeDasharray', (obj.borderType === "3" ? 4 : 0));//No I18N
    if(obj.showLabel === "true")
    {
      elementView.attr('imagecellLabel/text', obj.label);//No I18N
    }
    else{
      elementView.attr('imagecellLabel/text', "");//No I18N
    }
    elementView.attr('rect/width', Number(obj.width));//No I18N
    elementView.attr('rect/height', Number(obj.height));//No I18N
    bvResizeElements(elementView,{width:Number(obj.width),height:Number(obj.height)},false);

  }
  else{
    elementView.attr('rect/fill', obj.backgroundColor);//No I18N
    elementView.attr('rect/stroke', obj.borderColor);//No I18N
    elementView.attr('rect/strokeWidth', (obj.borderType == "1" ? 0 : Number(obj.borderSize)));//No I18N
    elementView.attr('rect/strokeDasharray', (obj.borderType === "3" ? 4 : 0));//No I18N
    elementView.attr('rect/width', Number(obj.width));//No I18N
    elementView.attr('rect/height', Number(obj.height));//No I18N
    bvResizeElements(elementView,{width:Number(obj.width),height:Number(obj.height)},false);

  }
}
function setBVCanvasBGColor(element,colorCode)
{
  if(!opmValidateHexColorCode(colorCode))
  {
    $("#bv_canvasBGColor_value").focus();
    opmAlertPopUp('',Ember.I18n.t('webclient.opm.businessview.error.colorCode',this),'','','','','','');//No I18N
    return;
  }
  mapProps.bgColor = colorCode;
  $(element).css("background-color", "#"+colorCode);//No I18N
}
function opm_linkPropShowArrow()
{
  var isChecked = $('#showLinkArrow').is(':checked'); //No I18n
  if(isChecked){
    //$('.bv_showArrow').addClass('bordered'); //No I18n
    $('.bv_showArrow_details').show();
    $('#showSingleArrowOpt').show();
    $("#showDualArrowOpt").hide();
  } else {
 //   $('.bv_showArrow').removeClass('bordered'); //No I18n
    $('.bv_showArrow_details').hide();
  }
}

function opm_linkPropShowLabel()
{
  var isChecked = $('#showLinkLabel').is(':checked'); //No I18n
	if(isChecked){
    $('.bv_showlabel').addClass('bordered'); //No I18n
    $('.bv_label_details').show();
  } else {
    $('.bv_showlabel').removeClass('bordered'); //No I18n
    $('.bv_label_details').hide();
  }
}
function bvElementMoveToFrontBack(type)
{
  if(currentElementView !== null && currentElementView !== undefined && type === "front")
  {
    currentElementView.model.toFront();
  }else if(currentElementView !== null && currentElementView !== undefined && type === "back")//No I18n
  {
    currentElementView.model.toBack();
  }
}
function bvSelectAllElements()
{
    bv_selectAll = true;
    bv_jointGraph.getElements().forEach(function(element) {
       joint.highlighters.mask.add(bv_jointPaper.findViewByModel(element), { selector: 'root' }, 'my-element-highlight', {//No I18N
              deep: true,
              attrs: {
                  'stroke': '#4a7bcb',//No I18N
                  'stroke-width': 3//No I18N
              }
        });
    });
}
function bvClearAllElements(isBulk,bv_Elements,type)
{
  var callBackToClearBVELements = function()
  {
      removeDupBVDeleteLists();
      var bvElement = null;
      if(isBulk !== undefined && isBulk && selectedBVElements.length > 0)
      {
        $.each(selectedBVElements, function(ind, bvElement){
          if((bvElement.attributes.ElementType === undefined) || (bvElement.attributes.ElementType !== undefined && bvElement.attributes.ElementType !== "selectionRect"))
          {
            var obj = bvElement.attributes.nodeObj;
            if(obj !== undefined && obj.displayName === undefined)
            {
              obj.displayName = obj.label;
            }
            if(obj !== undefined && OPMClient.MapsEditBvMapController.action === "Edit" || (mapProps.name).search("_bview.netmap") !== -1)
            {
                var connectedLinks = bv_jointGraph.getConnectedLinks(bvElement);
              if(connectedLinks.length > 0)  
              {
                for (var i = 0; i < connectedLinks.length; i++) {
                  linkElm = connectedLinks[i];
                    var val = linkElm.attributes.linkObj;
                  if((val.source===obj.objName || val.dest===obj.objName)){
                    linkDeleteCntArr.push(val.name);
                    if(val.destName !== undefined && val.destName !== "")
                    {
                      linkDeleteCntArr.push(val.destName);
                    }
                  }
                }
              }
              devDeleteCntArr.push(obj);
            }
            bvElement.remove();
            if(obj !== undefined && obj.isShortcut!==undefined && obj.isShortcut===true){
              opm_removeItemFromArray(shortBvListArr,obj.objName);
              var shortcut_Txt_elm = $(".bv-view__count-info .bv_shortcuts-count");//No I18N
              shortcut_Txt_elm.text(Number(shortcut_Txt_elm.text())-1);
            }else if(obj.entityType === undefined || obj.entityType !== "NonMO"){    //No I18N     
              var dev_Txt_elm = $(".bv-view__count-info .bv_entities-count");//No I18N
              dev_Txt_elm = dev_Txt_elm.text(Number(dev_Txt_elm.text())-1);
            }
          }
        });
         deleteDevArr = [];
         getFilteredDevicesNew("fromDelOption"); //No I18n

      }
      if(isBulk !== undefined && isBulk && selectedBVLinks.length > 0){
         $.each(selectedBVLinks, function(ind, bvLink){
            if(bvLink !== undefined && bvLink.isLink())
            {
                if(OPMClient.MapsEditBvMapController.action === "Edit" || (mapProps.name).search("_bview.netmap") !== -1)
                {
                      var linkObj = bvLink.attributes.linkObj;
                      if(linkObj !== undefined && linkObj.className !== undefined && linkObj.mapName !== undefined)
                      {
                        linkDeleteCntArr.push(linkObj.name);
                        if(linkObj.destName !== undefined && linkObj.destName !== "")
                        {
                          linkDeleteCntArr.push(linkObj.destName);
                        }
                      }
                }
                bvLink.remove();
                deleteLinkArr = [];
            }
        });
      }
      
      if(!isBulk && bv_jointGraph !== undefined)
      {
          $.each(bv_jointGraph.getElements(), function(ind, bvElement){
          var obj = bvElement.attributes.nodeObj;
          if(obj !== undefined && obj.displayName === undefined)
          {
            obj.displayName = obj.label;
          }
          if(obj !== undefined && OPMClient.MapsEditBvMapController.action === "Edit" || (mapProps.name).search("_bview.netmap") !== -1)
          {
              var connectedLinks = bv_jointGraph.getConnectedLinks(bvElement);
            if(connectedLinks.length > 0)  
            {
              for (var i = 0; i < connectedLinks.length; i++) {
                linkElm = connectedLinks[i];
                  var val = linkElm.attributes.linkObj;
                if((val.source===obj.objName || val.dest===obj.objName)){
                  linkDeleteCntArr.push(val.name);
                  if(val.destName !== undefined && val.destName !== "")
                  {
                    linkDeleteCntArr.push(val.destName);
                  }
                }
              }
            }
            devDeleteCntArr.push(obj);
          }
          bvElement.remove();
        });

        $(".bv-view__count-info .bv_entities-count").text(0);
        $(".bv-view__count-info .bv_shortcuts-count").text(0);
         deleteDevArr = [];
         getFilteredDevicesNew("fromDelOption"); //No I18n
     }
    
  }

  if(isBulk !== undefined && isBulk)
  {
    var alertConfirmMsg = Ember.I18n.t('webclient.map.flash.DeleteConfirmDialog_msg');//No I18n
  }
  else{
    if(window.OPM.isBVAdminAccess)
    {
      opmAlertPopUp('',Ember.I18n.t('webclient.bv.delete.dev.notalloweed.info',this),'','','','','','');return false; // No I18N
    }
    var alertConfirmMsg = Ember.I18n.t('webclient.opm.bv.clearall.info');//No I18n
  }
  opmConfirm(Ember.I18n.t('webclient.agent.confirm'),alertConfirmMsg,450,callBackToClearBVELements,'','','','','dialogStyle2',true,false,'',true,true);//No I18N
    
}

function setBVLinkIconImage(obj, prefix) {

  if (obj.symbolIcon !== undefined) {
    $('#' + prefix + 'DevIconImage').attr("src", obj.symbolIcon); //No I18n
  }
  if (obj.isShortcut && obj.symbolIcon !== undefined) {
      $('#' + prefix + 'DevIconImage').attr("src", obj.symbolIcon); //No I18n
  }
  if (obj.symbolIcon !== undefined && obj.elementType === "Peripherals") { //No I18n
      $('#' + prefix + 'DevIconImage').attr("src", obj.symbolIcon); //No I18n
  }
}

function updateBVObjectIcon(obj, prefix) {

  if (obj.shapeType !== undefined) {
    if (obj.shapeType.indexOf('Circle') !== -1) {
        $('#' + prefix + 'DevIconDiv').show();
        $('#' + prefix + 'DevIconImage').hide();
        $('.bv-device-link-popup__device-icon #' + prefix + 'DevIconDiv').removeAttr('src').addClass('bv_circle_image'); //No I18n
        $('.bv-device-link-popup__device-connect-info #' + prefix + 'DevName').text(Ember.I18n.t('opm.bv.circle.text',this)); //No I18n
    } else if (obj.shapeType.indexOf('Square') !== -1 || obj.shapeType.indexOf('Text') !== -1) {
        $('#' + prefix + 'DevIconDiv').show();
        $('#' + prefix + 'DevIconImage').hide();
        $('.bv-device-link-popup__device-icon #' + prefix + 'DevIconDiv').removeAttr('src').addClass('bv_square_image'); //No I18n
        $('.bv-device-link-popup__device-connect-info #' + prefix + 'DevName').text(Ember.I18n.t('opm.bv.square.text',this)); //No I18n
    }
  }
}
function bvUpdateElementsOnResize(elementModel)
{
  if(elementModel.attributes.ElementType === "Text")
  {
    $("#bv_text_width").val(elementModel.attributes.size.width);
    $("#bv_text_height").val(elementModel.attributes.size.height);
  }
  else if(elementModel.attributes.nodeObj.entityType === "NonMO")
  {
    $("#bv_shape_width").val(elementModel.attributes.size.width);
    $("#bv_shape_height").val(elementModel.attributes.size.height);
  }
  else 
  {
    $("#bv_devIcon_width").val(elementModel.attributes.size.width);
    $("#bv_devIcon_height").val(elementModel.attributes.size.height);
  }
  elementModel.attributes.nodeObj.width = elementModel.attributes.size.width;
  elementModel.attributes.nodeObj.height = elementModel.attributes.size.height;

}
function bvResizeElements(model,newSize,isUpdate)
{

    model.resize(newSize.width, newSize.height);

    var parentWidth = newSize.width;
    var parentHeight = newSize.height;

    var childWidth = parentWidth * 1;
    var childHeight = parentHeight * 1;

    var childAttrs = {
      rect: {
        width: childWidth,

        height: childHeight
      },
      label: {}
    };
    if(model.attributes.nodeObj.elementShape !== undefined && model.attributes.nodeObj.elementShape === "hexagon" || model.attributes.nodeObj.elementShape === "circle")
    {
      var imageRatio = 0.8;
    }
    else{
      var imageRatio = 1;
    }
    var imgX = (childWidth - (childWidth * imageRatio))/2; 
    var imgY = (childHeight - (childHeight * imageRatio))/2; 
  

    if (model.attributes.type === "basic.Rect") {//No I18N
      childAttrs.image = {
        width: 30,
        height: 30,
        refX: 0, 
        refY: 0
      };
    } else if (model.attributes.type === "custom.Image") {//No I18N
      childAttrs.image = {
        width: (childWidth * imageRatio) - 8,
        height: (childHeight * imageRatio) - 8,
        refX: imgX+4,
        refY: imgY+4
      };
    }

    if (model.attributes.type !== "custom.CustomGroup") {//No I18N
      model.attr(childAttrs);
    }
    if(isUpdate !== undefined && isUpdate)
    {
      bvUpdateElementsOnResize(model);
    }

}
function bvRemoveElementTools(elementView)
{
  if(toolsView && elementView !== null){
      elementView.removeTools();
    }
}
function removePaperInstance()
{ 
  var bvMapPaper_ins = getBVJointPaper('BVMapBGImg');//No I18N
  if(bvMapPaper_ins !== null && bvMapPaper_ins !== undefined)
  {
    bvMapPaper_ins.off("scale");//No I18N
    bvMapPaper_ins.off("link:pointerclick");//No I18N
    bvMapPaper_ins.off("link:mouseenter");//No I18N
    bvMapPaper_ins.off("link:mouseleave");//No I18N
    bvMapPaper_ins.off("element:pointerclick");//No I18N
    bvMapPaper_ins.off("element:mouseenter");//No I18N
    bvMapPaper_ins.off('element:mouseleave');//No I18N
    $('#BVMapBGImg').removeData('paper');//No I18N
    $('#BVMapBGImg').find('*').remove();
  }
}
function removeHighLightFromElements()
{
   if(selectedBVElements.length > 0)
    {
       // remove highlight for selected elements
       var selectedView = null;
        selectedBVElements.forEach(function(el) {
            selectedView = bv_jointPaper.findViewByModel(el);
            if (selectedView) {selectedView.unhighlight();}
        });
        selectedBVElements = [];
    }
    if(selectedBVLinks.length > 0)
    {
      var linkView = null;
      selectedBVLinks.forEach(function(link) {
        linkView = bv_jointPaper.findViewByModel(link);
         if (linkView) {removeHighlightLink(linkView)};
       });
      selectedBVLinks = [];
    }
}
function opm_deleteBVElements()
{
  var elNotSelected = true;
  if(currentElementView !== null)
  {
    if(window.OPM.isBVAdminAccess){
      opmAlertPopUp('',Ember.I18n.t('webclient.bv.delete.dev.notalloweed.info',this),'','','','','','');return false; // No I18N
    }
    elNotSelected = false;
    removeBVElementsJointMap(currentElementView);
    return;
  }
  else if(currentSelected_Link !== null)
  {
    elNotSelected = false;
    removeBVElementsJointMap(currentSelected_Link);
    return;
  }

  if(selectedBVElements.length > 0 || selectedBVLinks.length > 0)
  {
    if(window.OPM.isBVAdminAccess && selectedBVElements.length){
      opmAlertPopUp('',Ember.I18n.t('webclient.bv.delete.dev.notalloweed.info',this),'','','','','','');return false; // No I18N
    }
    elNotSelected = false;
    bvClearAllElements(true);
  }
  /*if(selectedBVLinks.length > 0)
  {
    console.log("calll link");
    elNotSelected = false;
    bvClearAllElements(true,selectedBVLinks,"link");//No I18N
  }*/

  if(elNotSelected){
    opmAlertPopUp('',Ember.I18n.t('webclient.map.flash.selectToDelete',this),'','','','','','');//No I18N
    return false;
  }
}
function deleteCustomPeripheralsFromMap(imgName)
{
     if(bv_jointGraph !== undefined)
      {
          $.each(bv_jointGraph.getElements(), function(ind, bvElement){
          var obj = bvElement.attributes.nodeObj;
          if(obj !== undefined && obj.iconName === imgName)
          {
            bvElement.remove();
          }
        });
      }
}
function showDevListforNonMo(elementID, selectedDev) {
  //var isDest = elementID === "dest"; //No I18n
  //$('#bvLink_DevRow_dest').closest('.bv-slider__row').toggleClass('flex-right-align', isDest); //No I18n
  //$('#bvLink_DevRow_dest_Filter').closest('.bv-slider__row').toggleClass('flex-right-align', isDest); //No I18n

  var jsonData = opm_ajaxGetRequest(window.OPM.apiUrlPattern + "/device/getDeviceCategories?embodyDCDevices=true"); //No I18N
  $('#bvLink_categoryFilter_' + elementID).empty();

  var bv_GroupsListArr = [];
  var optionsHeader = {
    'Business View': Ember.I18n.t('webclient.reports.rightlist.businessview', this), //No I18n
    'Infrastructure View': Ember.I18n.t('webclient.common.widgets.category', this), //No I18n
    'General': Ember.I18n.t('webclient.devices.details.general', this), //No I18n
    'Groups': Ember.I18n.t('webclient.opm.groups', this) //No I18n
  };

  Object.keys(jsonData.data).forEach(function (key) {
    var val = jsonData.data[key];
    if (!$.isEmptyObject(val)) {
      var displayName = optionsHeader[key] || key;
      var bv_categoryListArr = Object.keys(val).map(function (i) {
        return { id: i, text: escapeHTML(val[i]) };
      });
      bv_GroupsListArr.push({ id: "4", text: displayName, children: bv_categoryListArr }); //No I18N
    }
  });

  $("#bvLink_categoryFilter_" + elementID).show(); //No I18n
  $('#bvLink_categoryFilter_' + elementID).select2({
    data: bv_GroupsListArr,
    minimumResultsForSearch: 0
  });
  $('#bvLink_categoryFilter_' + elementID + ' option[value="7"], #bvLink_categoryFilter_' + elementID + ' option[value="8"]').remove();
  $("#bvLink_categoryFilter_" + elementID).val('4').select2(); // No I18N;
  
  opm_BVNonMoDeviceFilter(elementID, selectedDev, '4', true); 
}

function opm_BVNonMoDeviceFilter(elementID, selectedDev, selectedFilter, NonMoFn) {
  $('#bvLink_devList_' + elementID).empty();
  var filterID = NonMoFn ? selectedFilter : $("#bvLink_categoryFilter_" + elementID).val();
  var jsonResp;
  
  var baseUrl = window.OPM.apiUrlPattern + "/device/getDeviceListForFilter?filterID=" + filterID + "&type=businessView"; //No I18N
  if (window.OPM.isMSPCentral && OPMClient.ApplicationController.isMSPCentralSelected) {
    var siteFilterID = $("#bvLink_probeFilter_"+elementID).val();
    var customerID = $("#customerDrpDwn").val();
    jsonResp = opm_ajaxGetRequest(baseUrl + "&customerID=" + customerID + "&probeID=" + siteFilterID); //No I18N
  } else if (window.OPM.isCentralServer) {
    var siteFilterID = $("#bvLink_probeFilter_"+elementID).val();    
    jsonResp = opm_ajaxGetRequest(baseUrl + "&probeID=" + siteFilterID); //No I18N
  } else {
    jsonResp = opm_ajaxGetRequest(baseUrl);
  }

  if (jsonResp && !jsonResp.error && jsonResp.data) {
    var devListAr = [{ id: '-1', text: Ember.I18n.t('webclient.map.gmap.selectdevname', this) }]; //No I18N
    devListAr = devListAr.concat(jsonResp.data.remainingDevices.map(function (val) {
      return { id: val.name, text: val.displayName };
    }));

    $('#bvLink_devList_' + elementID).select2({
      data: devListAr,
      minimumResultsForSearch: 0
    });
    if(selectedDev === undefined || selectedDev === "")
    {
      selectedDev = "-1";// No I18N;
    }
    $('#bvLink_devList_' + elementID).val(selectedDev).select2(); // No I18N;
  }
}
function clearConfigIntfDropDownBV(type) {
  $("#"+type+"_interfaceList").empty();
}
function opmBV_EnableLinkTrafficConfig()
{
  var isChecked = $('#showLinkTraffic').is(':checked'); //No I18n
  if(isChecked){
    var srcVal = $("#bvLink_srcIntfName").data().interfaceName;
    var destVal = $("#bvLink_destIntfName").data().interfaceName;
    if(srcVal !== undefined && srcVal !== null && srcVal !== 'null' && destVal !== undefined && destVal !== null && destVal !== 'null')
    {
      $('.showLinkTrafficBlock').addClass('bordered'); //No I18n
      $("#intfStatus_Row").show();
    }else{
      $("#intfStatus_Row").hide();
    }
  } else {
    $('.showLinkTrafficBlock').removeClass('bordered'); //No I18n
     $("#intfStatus_Row").hide();
  }
}
function redrawJointElementBulk(elementViews,updateObj)
{
  elementViews.forEach(function(elementView) {
    if(elementView !== undefined && elementView.attributes !== undefined && elementView.attributes.type === "custom.Image" && elementView.attributes.ElementType !== "Peripherals")
    {
        if(updateObj.symbolIcon !== undefined)
        {
          elementView.attributes.nodeObj.objType = updateObj.objType;
          elementView.attributes.nodeObj.iconName = updateObj.iconName;
          elementView.attr('image/xlink:href', updateObj.symbolIcon);//No I18N
        }

        if(updateObj.elementShape)
        {
            elementView.attributes.nodeObj.elementShape = updateObj.elementShape;
            if(updateObj.elementShape === "circle")
            {
              var circleShape = {
                  size: { width:Number(updateObj.width ? updateObj.width : elementView.attr('rect/width')), height: Number(updateObj.height ? updateObj.height : elementView.attr('rect/height'))}, //No I18N
                  refCx: '50%',//No I18N
                  refCy: '50%',//No I18N
                  refR: '50%',//No I18N
                  fill: elementView.attr('rect/fill'),//No I18N
                  fillOpacity:0.3,
                  stroke:elementView.attr('rect/stroke'),//No I18N
                  strokeWidth:2,
                  pointerEvents: 'none'//No I18N
                }
                elementView.removeAttr('polygon');//No I18N
                elementView.attr('circle', circleShape);//No I18N
                elementView.attr('rect/fillOpacity',0);//No I18N
                elementView.attr('rect/strokeWidth',0);//No I18N
            }else if(updateObj.elementShape === "hexagon")//No I18N
            {
              var hexagonShape = {
                refPoints: '50,0 93,25 93,75 50,100 7,75 7,25', //No I18N
                fill: elementView.attr('rect/fill'),//No I18N
                fillOpacity:0.3,
                stroke:elementView.attr('rect/stroke'),//No I18N
                strokeWidth:2,
                pointerEvents: 'none'//No I18N
              }
              elementView.removeAttr('circle');//No I18N
              elementView.attr('polygon', hexagonShape);//No I18N
              elementView.attr('rect/fillOpacity',0);//No I18N
              elementView.attr('rect/strokeWidth',0);//No I18N
            }
            else{
              elementView.removeAttr('circle');//No I18N
              elementView.removeAttr('polygon');//No I18N
              elementView.attr('rect/fillOpacity',0.3);//No I18N
              elementView.attr('rect/strokeWidth',2);//No I18N
            }
            
        }


        if(updateObj.width !== undefined && updateObj.height !== undefined)
        {
          elementView.attributes.nodeObj.width = updateObj.width;
          elementView.attributes.nodeObj.height = updateObj.height;
          elementView.attr('rect/width', Number(updateObj.width));//No I18N
          elementView.attr('rect/height', Number(updateObj.height));//No I18N
          bvResizeElements(elementView,{width:Number(updateObj.width),height:Number(updateObj.height)},false);
        }

        if(updateObj.labelPosition !== undefined)
        {
          elementView.attributes.nodeObj.labelPosition = updateObj.labelPosition;
          var labelProp = labelPositionJointMap(updateObj.labelPosition);
          elementView.attr('imagecellLabel/x', labelProp.x);//No I18N
          elementView.attr('imagecellLabel/y', labelProp.y);//No I18N
          elementView.attr('imagecellLabel/text-anchor', labelProp.textAnchor);//No I18N
          elementView.attr('imagecellLabel/textVerticalAnchor', labelProp.textVerticalAnchor);//No I18N
        }
        if(updateObj.showLabel !== undefined)
        {
          elementView.attributes.nodeObj.showLabel = updateObj.showLabel;
           if((updateObj.showLabel === "true" || updateObj.showLabel === true))
            {
              elementView.attr('imagecellLabel/text', elementView.attributes.nodeObj.label);//No I18N
            }
            else{
              elementView.attr('imagecellLabel/text', "");//No I18N
            }
        }

        if(updateObj.labelColor !== undefined)
        {
          elementView.attributes.nodeObj.labelColor = updateObj.labelColor;
          elementView.attr('imagecellLabel/fill', updateObj.labelColor);//No I18N
        }if(updateObj.fontSize !== undefined)
        {
          elementView.attributes.nodeObj.fontSize = Number(updateObj.fontSize);
          elementView.attr('imagecellLabel/font-size', Number(updateObj.fontSize));//No I18N
        } if(updateObj.font !== undefined)
        {
          elementView.attributes.nodeObj.font = updateObj.font;
          elementView.attr('imagecellLabel/fontFamily', updateObj.font);//No I18N
        } if(updateObj.bold !== undefined)
        {
           elementView.attributes.nodeObj.bold = updateObj.bold;
           elementView.attr('imagecellLabel/fontWeight', (updateObj.bold === "true" ? "bold" : "none"));//No I18N
        } if(updateObj.italic !== undefined)
        {
           elementView.attributes.nodeObj.italic = updateObj.italic;
           elementView.attr('imagecellLabel/fontStyle', (updateObj.italic === "true" ? "italic" : "none"));//No I18N
        }
         if(updateObj.labelBGColor !== undefined){
          elementView.attributes.nodeObj.labelBGColor = updateObj.labelBGColor;
          elementView.attr('labelBackground/fill', updateObj.labelBGColor);//No I18N
        }

        if(updateObj.wordWrap !== undefined && String(updateObj.wordWrap) === "truncate")//truncate label - default     
        {
          elementView.attributes.nodeObj.wordWrap = updateObj.wordWrap;
            elementView.attr('imagecellLabel/textWrap',{//No I18N
                 width: 'calc(w+30)', //No I18N
                 height: 25,
                 ellipsis: true
              });  
        }
        else if(updateObj.wordWrap !== undefined && String(updateObj.wordWrap) === "wordWrap")    //text word wrap
        { 
          elementView.attributes.nodeObj.wordWrap = updateObj.wordWrap;   
          elementView.removeAttr('imagecellLabel/textWrap');//No I18N
          elementView.attr('imagecellLabel/textWrap',{//No I18N
             width: 'calc(w+30)', //No I18N
             height: null,
             ellipsis: false
          });    
        }
        else if(updateObj.wordWrap !== undefined && String(updateObj.wordWrap) === "none")    //No truncate label    
        { 
          elementView.attributes.nodeObj.wordWrap = updateObj.wordWrap;
          elementView.removeAttr('imagecellLabel/textWrap');//No I18N
        }

    }
  });
}

function bvUpdateLinksBulk(linkViews,obj)
{

  linkViews.forEach(function(updateLink) {
    if(updateLink !== undefined && updateLink.attributes !== undefined)
    {
      var exs_Obj = updateLink.attributes.linkObj;
      
        if(obj.thickness !== undefined)
        {
          exs_Obj.thickness = obj.thickness;
          updateLink.attr('line/strokeWidth', obj.thickness);//No I18N
          if(obj.arrowType === undefined)
          {
            obj.arrowType = exs_Obj.arrowType; 
          }
        }

        if(obj.arrowType !== undefined)
        {
          exs_Obj.arrowType = obj.arrowType;
          arrowSize = bv_arrowSize[(obj.thickness !== undefined ? Number(obj.thickness) : Number(exs_Obj.thickness)) - 1];
          if(arrowSize === undefined)
          {
            arrowSize = ((obj.thickness !== undefined ? Number(obj.thickness) : Number(exs_Obj.thickness)) * 4);
          }
          var linkSrcColor = "#000000";
          var singleArrow = {};
          var dualArrow = {};
          if(obj.arrowType === "singleArrow")
          {
              singleArrow = {
                d: normalizeMarker('M 0 0 L '+arrowSize+' -'+(arrowSize-6)+' C '+(arrowSize-2)+' 0 '+(arrowSize-2)+' 0 '+arrowSize+' '+(arrowSize-6)+' z'),//No I18N
                fill:linkSrcColor,
                "stroke": "none", //No I18N
                args:{
                  refX:15
                }
              }
              dualArrow = {};
              updateLink.removeAttr('arrowhead');//No I18N
              updateLink.attr('line/targetMarker',singleArrow);//No I18N
          }
          else{
                singleArrow = {};
                dualArrow = {
                  atConnectionRatio: 0.5,
                  stroke: 'none',//No I18N
                  display: (obj.arrowType === "none" ? "none" : 'block'),//No I18N
                  strokeWidth:0,
                      d:normalizeMarker("M 0 0 l 9 0"),//No I18N
                      sourceMarker:{
                        d: normalizeMarker('M 0 0 L '+arrowSize+' '+(arrowSize/2)+' L 0 '+arrowSize+' Z'),//No I18N
                        fill: linkSrcColor,
                        "stroke": "none" //No I18N
                      },
                       targetMarker:{
                        d: normalizeMarker('M 0 0 L '+arrowSize+' '+(arrowSize/2)+' L 0 '+arrowSize+' Z'),//No I18N
                        fill:linkSrcColor,
                        "stroke": "none" //No I18N
                      }
                  }
              updateLink.removeAttr('line/targetMarker');//No I18N
              updateLink.attr("arrowhead",dualArrow);//No I18N     
          }
        }

      if(obj.lineStyle !== undefined)
      {
         exs_Obj.lineStyle = obj.lineStyle;
        var line_connector = (bvLinkConnecters[obj.lineStyle].connector !== undefined ? bvLinkConnecters[obj.lineStyle].connector : "normal");
        var line_router = (bvLinkConnecters[obj.lineStyle].router !== undefined ? bvLinkConnecters[obj.lineStyle].router : "");

        if(line_connector !== undefined && line_connector !== "")
        {
          updateLink.connector({"name":line_connector});     //No I18N
        }
        if(line_router !== undefined && line_router !== "")
        {
          updateLink.router({"name":line_router});     //No I18N
        }
        else{
           updateLink.unset('router');//No I18N
        }  

        if(obj.lineStyle === "1")//No I18N
        {
           updateLink.unset('vertices');//No I18N
        }
      }

    if(obj.showLabel !== undefined)
    {
       exs_Obj.showLabel = obj.showLabel;
    }  
    
    if(obj.showLabel !== undefined && (obj.showLabel===true || obj.showLabel==="true"))
    {
        if(obj.labelColor)
        {
          exs_Obj.labelColor = obj.labelColor;
        }
        if(obj.label !== undefined && obj.label !== "")
        {
           exs_Obj.label = obj.label;
        }
        if(obj.fontSize)
        {
          exs_Obj.fontSize = obj.fontSize;
        }

      var font_size = obj.fontSize !== undefined ? Number(obj.fontSize) : Number(exs_Obj.fontSize);
      var linkLabels = updateLink.get('labels');
      var labelIndex = linkLabels !== undefined && linkLabels.findIndex(function(label) { return label.id === 'link_label'; });
      if (labelIndex !== -1) 
      {
        updateLink.label(labelIndex,{
              markup: [{
                  tagName: 'rect',//No I18N
                  selector: 'labelBody'//No I18N
              }, {
                  tagName: 'text',//No I18N
                  selector: 'labelText'//No I18N
              }],
              attrs: {
                  labelText: {
                      text: obj.label !== undefined && obj.label !== "" ? obj.label : exs_Obj.label,
                      fontSize: font_size,
                      fill: obj.labelColor !== undefined ? obj.labelColor : exs_Obj.labelColor,
                      textAnchor: 'middle',//No I18N
                      y: 'calc(h - '+font_size+')',//No I18N
                      pointerEvents: 'none',//No I18N
                      fontFamily: 'LatoRegular'//No I18N
                  },
                  labelBody: {
                      ref: 'labelText',//No I18N
                      x: 'calc(x - 2.5)',//No I18N
                      y: 'calc(y - 2.5)',//No I18N
                      width: 'calc(w + 5)',//No I18N
                      height: 'calc(h + 5)',//No I18N
                      stroke: '#e3e3e3',//No I18N
                      fill: '#FFFFFF',//No I18N
                      strokeWidth: 1,
                      rx: 1,
                      ry: 1
                  }
              },
              position: {
                 //   offset:20,
               //   distance: 0.05,
                 // angle: 70,
                  args: {
                      keepGradient: true,
                      ensureLegibility: true
                  }
              }
          });
      }
      else if(obj.label !== "" || exs_Obj.label !== "")
      {
         updateLink.appendLabel({
            id:"link_label",//No I18N
            markup: [{
                tagName: 'rect',//No I18N
                selector: 'labelBody'//No I18N
            }, {
                tagName: 'text',//No I18N
                selector: 'labelText'//No I18N
            }],
            attrs: {
                labelText: {
                    text: obj.label !== undefined && obj.label !== "" ? obj.label : exs_Obj.label,
                    fontSize: font_size,
                    fill: obj.labelColor !== undefined ? obj.labelColor : exs_Obj.labelColor,
                    textAnchor: 'middle',//No I18N
                    y: 'calc(h - '+font_size+')',//No I18N
                    pointerEvents: 'none',//No I18N
                    fontFamily: 'LatoRegular'//No I18N
                },
                labelBody: {
                    ref: 'labelText',//No I18N
                    x: 'calc(x - 2.5)',//No I18N
                    y: 'calc(y - 2.5)',//No I18N
                    width: 'calc(w + 5)',//No I18N
                    height: 'calc(h + 5)',//No I18N
                    stroke: '#e3e3e3',//No I18N
                    fill: '#FFFFFF',//No I18N
                    strokeWidth: 1,
                    rx: 1,
                    ry: 1
                }
            },
            position: {
                  offset:20,
             //   distance: 0.05,
               // angle: 70,
                args: {
                    keepGradient: true,
                    ensureLegibility: true
                }
            }
        });
      }

    }else if(obj.showLabel !== undefined){
      var linkLabels = updateLink.get('labels');
      var labelIndex = linkLabels !== undefined && linkLabels.findIndex(function(label) { return label.id === 'link_label'; });
      if(linkLabels && labelIndex !== -1) 
      {
        updateLink.removeLabel(labelIndex);
      }
    }

    if(obj.showTrafficOverLink !== undefined)
    {
      exs_Obj.showTrafficOverLink = obj.showTrafficOverLink;
    }  
  }
  });
  removeHighLightFromElements();
  currentSelected_Link = null;
}

function adjustLinkVertices(graph, cell) {

    cell = cell.model || cell;
    if (cell instanceof joint.dia.Element) {
        _.chain(graph.getConnectedLinks(cell))
            .groupBy(function(link) {
                return _.omit([link.source().id, link.target().id], cell.id)[0];
            })
            .each(function(group, key) {
                if (key !== 'undefined') {adjustLinkVertices(graph, _.first(group));}//No I18N
            })
            .value();
        return;
    }
    var sourceId = cell.get('source').id || cell.previous('source').id;//No I18N
    var targetId = cell.get('target').id || cell.previous('target').id;//No I18N
    if (!sourceId || !targetId) {return};
    // identify link siblings from all links.
    var siblings = _.filter(graph.getLinks(), function(sibling) {

        var siblingSourceId = sibling.source().id;
        var siblingTargetId = sibling.target().id;
        return (sibling.attributes && sibling.attributes.linkObj && (sibling.attributes.linkObj.lineStyle === "1" || sibling.attributes.linkObj.lineStyle === "12") && (((siblingSourceId === sourceId) && (siblingTargetId === targetId)) || ((siblingSourceId === targetId) && (siblingTargetId === sourceId))));
    });

    var numSiblings = siblings.length;
    switch (numSiblings) {

        case 0: {
            // link has no siblings
            break;

        } case 1: {
            // there is only one link between elements
           siblings[0].unset('vertices');//No I18N
            break;

        } default: {
            // Find the center point of the link
            var sourceCenter = graph.getCell(sourceId).getBBox().center();
            var targetCenter = graph.getCell(targetId).getBBox().center();
            var midPoint = g.Line(sourceCenter, targetCenter).midpoint();

            // Find the angle of the link
            var theta = sourceCenter.theta(targetCenter);
            var GAP = 40;
            _.each(siblings, function(sibling, index) {

                var offset = GAP * Math.ceil(index / 2);
                var sign = ((index % 2) ? 1 : -1);
                if ((numSiblings % 2) === 0) {
                    offset -= ((GAP / 2) * sign);
                }

                var reverse = ((theta < 180) ? 1 : -1);
                var angle = g.toRad(theta + (sign * reverse * 90));
                var vertex = g.Point.fromPolar(offset, angle, midPoint);

                // add vertices
                sibling.connector({"name":"smooth"});     //No I18N
                sibling.vertices([vertex]);
                if(sibling.attributes.linkObj)
                {
                  sibling.attributes.linkObj.lineStyle = "12";//No I18N
                }
            });
        }
    }
}

function bvExportSVG()
{
    var bvPaper = getBVJointPaper(OPMClient.BVMapDetailsController.elementId);
    var svgElementClone = bvPaper.svg; 
    var bvElement = document.getElementById($(svgElementClone).attr("id"));//No I18N
    var svgElement = bvElement.cloneNode(true);
    var bvexport_id = "bv_diagram_1";//No I18N
    if(document.getElementById(bvexport_id) === null)
    {
      $(svgElement).attr("id",bvexport_id);//No I18N
      document.body.appendChild(svgElement);
    }
    else{
      document.getElementById(bvexport_id).remove();
       $(svgElement).attr("id",bvexport_id);//No I18N
      document.body.appendChild(svgElement);

    }
    $(svgElement).attr("style",$(".joint-paper-background").attr("style"));//No I18N
    $(svgElement).css({"width":$(svgElementClone).width()+"px","height":$(svgElementClone).width()+"px"});//No I18N
    $(svgElement).css({"background-size":""});//No I18N
    $(svgElement).css({"background-color":$("#BVMapBGImg").css('background-color')});//No I18N
    $(svgElement).css({"transform":""});//No I18N
    $(svgElement).css({"display":"none"});//No I18N
    $(svgElement).find(".joint-layers").removeAttr("transform");//No I18N
    svgElement.style.backgroundSize = $(".joint-paper-background").width()+"px "+$(".joint-paper-background").height()+"px";//No I18N
    var serializer = new XMLSerializer();
    var svgString = serializer.serializeToString(svgElement);
    var images = svgElement.getElementsByTagName('image'); //No I18N
    var promises = [];
    for (var i = 0; i < images.length; i++) {
        promises.push(processBVImage(images[i]));
    }

    Promise.all(promises).then(function() {
        svgElement.style.display = 'block';//No I18N
        var updatedSvgString = serializer.serializeToString(svgElement);
        var blob = new Blob([updatedSvgString], { type: 'image/svg+xml;charset=utf-8' });//No I18N
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');//No I18N
        link.href = url;
        link.download =($("#bvNameViewHeader").text() !== "" ? $("#bvNameViewHeader").text()+".svg" : "diagram.svg");//No I18N
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        document.body.removeChild(svgElement);
        URL.revokeObjectURL(url);
    });
}
 function processBVImage(image) {
    return new Promise(function(resolve, reject) {
        var href = image.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || image.getAttribute('href'); //No I18N

        if (!href || href.indexOf('data:') === 0) { //No I18N
            resolve();
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', href, true); //No I18N
        xhr.responseType = 'blob'; //No I18N

        xhr.onload = function() {
            if (xhr.status === 200) {
                var reader = new FileReader();
                reader.onloadend = function() {
                    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', reader.result); //No I18N
                    resolve();
                };
                reader.onerror = function() {
                    reject(new Error('Failed to read image')); //No I18N
                };
                reader.readAsDataURL(xhr.response);
            } else {
                reject(new Error('Failed to fetch image')); //No I18N
            }
        };

        xhr.onerror = function() {
            reject(new Error('Network error while fetching image')); //No I18N
        };

        xhr.send();
    });
}

function enableControlToolsForElement(elementView) {
     var isEnableConnectLink = true;  
        var resizeSelector = "rect";//No I18N
        if(elementView.model.attributes.ElementType !== undefined && elementView.model.attributes.ElementType === "Text")
        {
          isEnableConnectLink = false;
        }
        if(elementView.model.attributes.ElementType !== undefined && elementView.model.attributes.ElementType === "Circle")
        {
          resizeSelector = "body";//No I18N
        }

         var toolsList = [
           /* new joint.elementTools.Remove({
              scale:1.2,
              x: "100%",//No I18N
              y: 0,
              magnet: 'base',//No I18N
              useModelGeometry: true,
              offset: {
                x: -2,
                y: -2
              },
               action: function(evt) {
                  removeBVElementsJointMap(this);
                } 
            })*/   
            new ResizeTool({
              selector: resizeSelector,
              display:"block"//No I18N
            })
          ];
        
        if(isEnableConnectLink)
        {
          toolsList.push(connectRight,connectLeft,connectTop,connectBottom);
        }

      toolsView = new joint.dia.ToolsView({
          tools:toolsList
        });  

      elementView.addTools(toolsView);
      setTimeout(function() {
        $(".joint-tool.joint-theme-default[model-id='"+elementView.model.id+"'] .resize_extras").removeAttr("style");
      },50);
}
function clearAllAndRestoreNewBV()
{
  if(bv_jointGraph)
   {
    bv_jointGraph.clear();
    $(".bv-view__count-info .bv_entities-count").text(0);
    $(".bv-view__count-info .bv_shortcuts-count").text(0);
    deleteDevArr = [];
   // getFilteredDevicesNew("fromDelOption"); //No I18n
  }
}
function destroyJointView() {
  var bview_jointPaper = getBVJointPaper(OPMClient.BVMapDetailsController.elementId);
    try {
        if (bview_jointPaper) {
            bview_jointPaper.off();
            bview_jointPaper.stopListening();
            if (bview_jointPaper && bview_jointPaper.model) {
                bview_jointPaper.model.clear();
            }
            bview_jointPaper.remove();
            OPMClient.BVMapDetailsController.set("showBVElemDiv",false);//No I18n
        }
        // Clear global events
    $(document).off('.joint');//No I18n
    $(window).off('.joint');//No I18n

    } catch(e) {
        console.error("JointJS cleanup failed", e);//No I18n
    }
}
function destroyJointEditor() {
    try {
        if (bv_jointPaper) {
            bv_jointPaper.off();
            bv_jointPaper.stopListening();
            if (bv_jointPaper && bv_jointPaper.model) {
                bv_jointPaper.model.clear();
            }
            bv_jointPaper.remove();
        }
       
        // Clear global events
        $(document).off('.joint');//No I18n
        $(window).off('.joint');//No I18n

    } catch(e) {
        console.error("JointJS cleanup failed", e);//No I18n
    }
}
