var LAST_HOVERED;
var hoverTimeout;
(function (LAST_HOVERED) {
    LAST_HOVERED[LAST_HOVERED["NODE"] = 0] = "NODE";//No I18N
    LAST_HOVERED[LAST_HOVERED["LINK"] = 1] = "LINK";//No I18N
    LAST_HOVERED[LAST_HOVERED["BACKGROUND"] = 2] = "BACKGROUND";//No I18N
})(LAST_HOVERED || (LAST_HOVERED = {}));
var L2_VIEW;
(function (L2_VIEW) {
    L2_VIEW["MAIN"] = "MAIN";//No I18N
    L2_VIEW["INSPECT"] = "INSPECT";//No I18N
})(L2_VIEW || (L2_VIEW = {}));
var layer2Constants = {
    defaultConfig: {
        lightMode: {
            node: {
                stroke: "#B8B8B8",//No I18N
                fill: "#B8B8B8",//No I18N
                zoomOutFill: "#EDEDED"//No I18N
            },
            nodeIcon: {
                defaultColor: "#7f7f7f",//No I18N
                onStatus: "#000",//No I18N
                onNodeFill: "#fff"//No I18N
            },
            text: {
                stroke: "#fff",//No I18N
                fill: "#000"//No I18N
            },
            arrow: {
                fill: "#aaa"//No I18N
            }
        },
        darkMode: {
            node: {
                stroke: "#999",//No I18N
                fill: "#0F0F14",//No I18N
                zoomOutFill: "#333"//No I18N
            },
            nodeIcon: {
                defaultColor: "#999",//No I18N
                onStatus: "#999",//No I18N
                onNodeFill: "#fff"//No I18N
            },
            text: {
                stroke: "#0F0F14",//No I18N
                fill: "#f4f4f4"//No I18N
            },
            arrow: {
                fill: "#aaa"//No I18N
            }
        }
    },
    sortingOrder: { 1: 1, 0: 2, 2: 3, 3: 4, 5: 5, 7: 6, 9: 7, 10: 8 },
    statusConfig: {
        lightMode: {
            0 : {
                nodeColor :statusColors[0], // '#F24B51'
                nodeFill: faultSeverityColorPalettes.critical[0][0], //'#FAD1D3'
                className: 'l2-status-critical'//No I18N
            },
            1 : {
                nodeColor : statusColors[1], //'#FFA442'
                nodeFill: faultSeverityColorPalettes.trouble[0][0], //'#FFE9D3'
                className: 'l2-status-trouble'//No I18N
            },
            2 : {
                nodeColor : statusColors[2], //'#e8de65'
                nodeFill: faultSeverityColorPalettes.attention[0][0], //'#F6F3C8'
                className: 'l2-status-attention'//No I18N
            },
            3 : {
                nodeColor :statusColors[3], //'#ac4cab'
                nodeFill: faultSeverityColorPalettes.servicedown[0][0],//' #ffcefe'
                className: 'l2-status-sericeDown'//No I18N
            },
            4 : {
                nodeColor : statusColors[4],  //'#49BD80'
                nodeFill: faultSeverityColorPalettes.clear[0][0], //'#D4EEE0'
                className: 'l2-status-clear'//No I18N
            },  
            5 : {
                nodeColor : statusColors[5], // '#B8B8B8'
                nodeFill: faultSeverityColorPalettes.unmanaged[0][0], //'#EDEDED'
                className: 'l2-status-unmanaged'//No I18N
            },
            6 : {
                nodeColor : statusColors[6], //'#B8B8B8'
                nodeFill: faultSeverityColorPalettes.unmanaged[0][0], //'#EDEDED'
                className: 'l2-status-maintenance'//No I18N
            },
            7 : {
                nodeColor : statusColors[7],  //'#6e91a2'
                nodeFill: faultSeverityColorPalettes.info[0][0], //'#d3dee3'
                className: 'l2-status-not-monitored'//No I18N
            },
            'default': {//No I18N
                className: 'l2-status-not-monitored'//No I18N
            }
        },
        darkMode: {
            0 : {
                nodeColor :faultSeverityColorPalettes.critical[0][3], // '#F24B51'
                nodeFill: statusColors[0], //'#831e20'
                className: 'l2-status-critical'//No I18N
            },
            1 : {
                nodeColor : faultSeverityColorPalettes.trouble[0][3], //'#FFA442'
                nodeFill: statusColors[1], //'#75440f'
                className: 'l2-status-trouble'//No I18N
            },
            2 : {
                nodeColor : faultSeverityColorPalettes.attention[0][3], //'#e8de65'
                nodeFill: statusColors[2], //'#756200'
                className: 'l2-status-attention'//No I18N
            },
            3 : {
                nodeColor :faultSeverityColorPalettes.servicedown[0][3], // '#ac4cab'
                nodeFill: statusColors[3], //'#391e65'
                className: 'l2-status-sericeDown'//No I18N
            },
            4 : {
                nodeColor :faultSeverityColorPalettes.clear[0][3], // '#49BD80', 
                nodeFill: statusColors[4], //'#0e3f26'
                className: 'l2-status-clear'//No I18N
            },  
            5 : {
                nodeColor :faultSeverityColorPalettes.unmanaged[0][3], // '#B8B8B8', 
                nodeFill: statusColors[5], //'#2d2e2e'
                className: 'l2-status-unmanaged'//No I18N
            },
            6 : {
                nodeColor :faultSeverityColorPalettes.unmanaged[0][3], // '#B8B8B8',
                nodeFill: statusColors[6], //'#2d2e2e',
                className: 'l2-status-maintenance'//No I18N
            },
            7 : {
                nodeColor :faultSeverityColorPalettes.info[0][3], // '#6e91a2', 
                nodeFill: statusColors[7], //'#2d2e2e'
                className: 'l2-status-not-monitored'//No I18N
            },
            'default': {//No I18N
                className: 'l2-status-not-monitored'//No I18N
            }
        }
    }
}


var ObservabilityMapComponent = (function () { 
    function ObservabilityMapComponent()
    {
      var _this = this;
      this.currentView = L2_VIEW.MAIN;
      this.animation = [];
      this.nodeToolTipShown = false;
      this.linkToolTipShown = false;
      this.tooltipTimeout = null;
      this.searchResults = [];  
      this.searchKeyword='';
      this.searchIndex = undefined;
      this.debounceTimer = null;
      this.isDestroyed = false;
      this.isPerformSearch = false;
      this.selectedSeverity = null;

     document.getElementById('searchNodeFromMap').oninput = function(event) {
                var searchTerm = event.target.value;
                _this.searchKeyword = searchTerm;
                clearTimeout(_this.debounceTimer);
                _this.isPerformSearch=false;
                _this.debounceTimer = setTimeout(function(){
                    _this.performSearch();
                }, 1000);
        };
     document.getElementById('searchNodeFromMap').onkeydown = function(event) {   
            _this.handleKeyEvent(event);
     };
        

    }
ObservabilityMapComponent.prototype.setSelfProps = function (callback) {
        ObservabilityMapComponent.prototype.self_propCallBack = this.self_propCallBack = callback;
        return this;
};
ObservabilityMapComponent.prototype.setNodeDetails = function (propName,nodeData) {
    this.self_propCallBack(propName,nodeData, event);
};    
ObservabilityMapComponent.prototype.getMapData = function (graphData) {    
  this.graphData = graphData;
  this.drawObservabilityMap();
}
ObservabilityMapComponent.prototype.drawObservabilityMap = function () {    
    _this = this;

      if(Object.keys(this.graphData).length <= 0)
      {
        $('.orgMap_EntitiesCnt').text(Ember.I18n.t('webclient.vmware.entities',this)+" - "+0);//No I18N
        return;
      }
    if(document.getElementById("flowmap-canvas"))//No I18N
    {
        document.getElementById("flowmap-canvas").remove();//No I18N
    }
     if(document.getElementById("flowmap-canvas_inspect"))//No I18N
    {
        document.getElementById("flowmap-canvas_inspect").remove();//No I18N
    }
    
    $('.orgMap_EntitiesCnt').text(Ember.I18n.t('webclient.vmware.entities',this)+" - "+this.graphData.nodes.length);//No I18N
    _this.isDarkMode = document.body.classList.contains('Observ-flowMap-dark-mode');//No I18N
    _this.defaultConfig = _this.isDarkMode ? layer2Constants.defaultConfig.darkMode : layer2Constants.defaultConfig.lightMode;     
    _this.statusConstants = _this.isDarkMode ? layer2Constants.statusConfig.darkMode : layer2Constants.statusConfig.lightMode;    
    _this.animation = [];
    var maxDomain = (_a = d3.max(this.graphData.nodes, function (nd) { return parseInt(nd.data.weight); })) !== null && _a !== void 0 ? _a : 1;
    var isPerformanceOk = false;
    if(this.graphData.nodes.length < 1000)
    {
        isPerformanceOk = true;
    }
    var currentHoverNode;
    var previousHoverNode;
    var nodeToolTip = d3.select("#l2-node-tooltip");//No I18N
    //var linkToolTip = d3.select("#l2-link-tooltip");
    _this.contextMenu = d3.select("#l2-context-menu");//No I18N
    nodeToolTip.on("mouseenter", function () { clearTimeout(_this.tooltipTimeout); });
    nodeToolTip.on("mouseleave", function () { _this.hideOrgMapToolTip(nodeToolTip); _this.nodeToolTipShown = false; $('#l2-node-tooltip').hide();});

    //Create forceDirected Graph Instance
    var l2Graph = new ForcedDirectedGraph()
    l2Graph.defaultConfig =layer2Constants.defaultConfig.lightMode;       
    l2Graph.statusConstants=layer2Constants.statusConfig.lightMode;   
    l2Graph.flowMapType = "layer2Map";//No I18N
    l2Graph.flowMapID = "flowmap-canvas";//No I18N
    l2Graph.isPerformanceOk = isPerformanceOk;
    l2Graph.container(document.getElementById("network_org_map"))//No I18N
           l2Graph.height(window.innerHeight-100)
            l2Graph.width(window.innerWidth)

            l2Graph.graphData(this.graphData)
            .enableLinkHover(false)
            .enableWorker({ isDefault: false, limit: 1000000 })
            .tickIteration(120)
            .linkCurve(0.1)
            .linkParticle({radius: 2.5})
            .setKeyMappings({strengthScale: "weight",linkDistanceScale: "weight"})//No I18N
            .setRadiusScale({range: [24, 32]})
            .setStrengthScale({range: [-2000, -3000],domain: [0, maxDomain]})
           /* .onNodeDraw(function (node, ctx, zoomLevel) {
                _this.drawNodeComponent(node, ctx, zoomLevel);
            })*/
          //  .linkDrawMode('after')//No I18N
           /* .onLinkDraw(function (edge, ctx, zoomLevel) {
                //_this.drawLinkComponent(edge, ctx, zoomLevel);
            })*/
            .onNodeHover(function (node, event) {
              _this.lastHovered = LAST_HOVERED.NODE;
             /* if (_this.linkToolTipShown) {
                  _this.hideOrgMapToolTip(linkToolTip);
                  _this.linkToolTipShown = false;
              }*/
              
             currentHoverNode = node;
              _this.hoveredNodeData = node.data;
              if(node.data.status !== undefined)
              {
                if(node.data.MoName !== undefined)
                {
                    if((node.data.MoName).indexOf("APM_") !== -1)
                    {
                        node.data.type = node.type;    
                    }
                    node.data.statusString = severityI18NTxtNew[Number(node.data.status) - 1];
                }else{
                    node.data.statusString = severityAsI18NTxt[Number(node.data.status) - 1];
                }
                var statusClass = "statusoffline inline-block p-none size8 --fault-severity severity_"+node.data.status;//No I18N
              }
             _this.setNodeDetails("nodeTooltipData",{"sumData":node.data,"type":node.type,"statusClass":statusClass});//No I18N
              if (!_this.nodeToolTipShown) {

                if(node.data.MoName !== undefined && ((node.data.MoName).indexOf("APM_") !== -1 || (node.data.MoName).indexOf("SPM_") !== -1))  
                {
                    $('#l2-node-tooltip').addClass('floating-popup'); //No I18N
                    var nodePosition = l2Graph.canvasToScreenCoordinates(node.x + node.radius, node.y);
                    nodeToolTip
                    .style("display", "block")//No I18N
                    .style("top", "".concat(nodePosition.clientY + 25, "px"))//No I18N
                    .style("left", "".concat(nodePosition.clientX + 10, "px"))//No I18N
                    .style("position", "absolute");//No I18N   
                    _this.nodeToolTipShown = true;
                }
                else 
                {
                    if (hoverTimeout) {
                        clearTimeout(hoverTimeout);
                    }
                    hoverTimeout = setTimeout(function() {      
                        var iconType = 'Device';//No I18N
                        var deviceName;
                        if (node.data.MoName !== undefined) {
                            deviceName = node.data.MoName;
                        } else {
                            deviceName = node.data.ipAddress;
                            iconType = 'Layer2'; //No I18N
                        }
                        var reqData = {"name": deviceName, "iconType": iconType};//No I18N 
                        var devDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/maps/getMOMarkerInfo", reqData); //No I18n
                        if (devDetails.basicDetails !== undefined) {
                            OPMClient.BVMapDetailsController.set('deviceMoreDetails', []); //No I18n
                            OPMClient.BVMapDetailsController.set('deviceMoreDetails', devDetails); //No I18n
                            $('#l2-node-tooltip').removeClass('floating-popup'); //No I18N
                            var nodePosition = l2Graph.canvasToScreenCoordinates(node.x + node.radius, node.y);
                            nodeToolTip
                                .style("display", "block")//No I18N
                                .style("top", "".concat(nodePosition.clientY + 25, "px"))//No I18N
                                .style("left", "".concat(nodePosition.clientX, "px"))//No I18N
                                .style("position", "absolute")//No I18N 
                                .style("zIndex", 99)//No I18N
                            _this.nodeToolTipShown = true;
                        }
                    }, 300);
                }
              }
              if (previousHoverNode && currentHoverNode != previousHoverNode) {
                  l2Graph.emitParticlesInAdjacentPaths(previousHoverNode, false);
              }
              l2Graph.emitParticlesInAdjacentPaths(currentHoverNode, true);
              previousHoverNode = node;
           })
            .onNodeClick(function (node) {
                /*var nodeSD = {"category":node.type}//No I18N
                if(node.data.MoName !== undefined)
                {
                    nodeSD.MoName = node.data.MoName;
                }
                _this.setNodeDetails("nodeSumData",nodeSD);//No I18N
                _this.nodeId = node.id;*/
                _this.rightClickedComponent = node;
                _this.contextMenu
                .classed("visible", false)//No I18N
                .style("display", "none");//No I18N
              _this.goToDeviceSummaryDetails(node);
            })
             .onNodeRightClick(function (node, event) {
                _this.rightClickedComponent = node;
                nodeToolTip.style("display", "none");//No I18N
                d3.select("#l2-context-menu .l2-context-map").style("display", "block");//No I18N
                _this.contextMenu
                    .classed("visible", true)//No I18N
                    .style("display", "block")//No I18N
                    .style("top", "".concat(event.clientY - 70, "px"))//No I18N
                    .style("left", "".concat(event.clientX + 10, "px"));//No I18N
            })
           .onLinkHover(function (link, event) {
                _this.lastHovered = LAST_HOVERED.LINK;
                /*if (_this.nodeToolTipShown) {
                    _this.hideOrgMapToolTip(nodeToolTip);
                    _this.nodeToolTipShown = false;
                }*/
                _this.hoveredLinkData = link.data;
                /*if (link.data.interface_id && link.data.status != '-') {
                    linkToolTip
                        .style("display", "block")
                        .style("top", "".concat(event.clientY - 90, "px"))
                        .style("left", "".concat(event.clientX - 10, "px"));
                    _this.linkToolTipShown = true;
                }*/
            })
           .backgroundCallbackMode("after")//No I18N
           .onBackgroundHover(function () {
                //_this.hideOrgMapToolTip(linkToolTip);
                if (_this.nodeToolTipShown) {
                    _this.tooltipTimeOutCallback(nodeToolTip);
                }
                _this.nodeToolTipShown = false;
                $('#l2-node-tooltip').hide();
                OPMClient.BVMapDetailsController.set('deviceMoreDetails', []); //No I18n
                if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                    hoverTimeout = null; // Reset the timeout variable
                }
                //_this.linkToolTipShown = false;
                if (previousHoverNode) {
                    l2Graph.emitParticlesInAdjacentPaths(previousHoverNode, false);
                }
                if(_this.searchKeyword.length > 0 && _this.lastHovered != LAST_HOVERED.BACKGROUND)
                {
                    _this.performSearch();
                }
                if(_this.selectedSeverity !== null && _this.lastHovered != LAST_HOVERED.BACKGROUND)
                {
                    _this.filterNodeBySeverity(true);
                }
                _this.lastHovered = LAST_HOVERED.BACKGROUND;
            })
            .onBackgroundClick(function () {
                _this.showSummaryView=false;
                _this.opm_MapToggleSummaryView(false);
                //_this.closeSlideoutMenu();
                _this.contextMenu
                .classed("visible", false)//No I18N
                .style("display", "none");//No I18N
            })
          .onSimulationEnd(function () { return l2Graph.fitToViewPort(40, 500); })
          .renderGraph();  
          _this.setFlowMapInstance(l2Graph);
          _this.setSeverityFilter();
          if(isPerformanceOk)
          {
            l2Graph.onNodeDraw(function (node, ctx, zoomLevel) {
                 if(l2Graph.isPerformanceOk)
                {
                  _this.drawNodeComponent(node, ctx, zoomLevel);
                }
            })
          }
}
ObservabilityMapComponent.prototype.destroyForcedDirected = function() {
    this.isDestroyed = true;
    if(this.l2Graph !== null && this.l2Graph !== undefined && this.l2Graph.animationFrame_Instance)
    {
        this.l2Graph.destroy();
        window.cancelAnimationFrame(this.l2Graph.animationFrame_Instance);
    }
    if(this.inspectGraph !== null && this.inspectGraph !== undefined && this.inspectGraph.animationFrame_Instance)
    {
        this.inspectGraph.destroy();
        window.cancelAnimationFrame(this.inspectGraph.animationFrame_Instance);
    }
    clearTimeout(this.debounceTimer); 
    this.l2Graph = null;
    this.inspectGraph = null;
}
ObservabilityMapComponent.prototype.tooltipTimeOutCallback = function (toolTip) {
    var _this = this;
    this.tooltipTimeout = setTimeout(function () {
          _this.hideOrgMapToolTip(toolTip);
        
    }, 200);
};
ObservabilityMapComponent.prototype.hideOrgMapToolTip = function (toolTip) {
    toolTip.style("display", "none");//No I18N
};
ObservabilityMapComponent.prototype.getHoveredNodeData = function () {
   return this;
};
ObservabilityMapComponent.prototype.setFlowMapInstance = function (instance) {
    this.l2Graph = instance;
};
ObservabilityMapComponent.prototype.goToDeviceSummaryDetails = function (nodeData) {
    this.showSummaryView=true;
    if(nodeData !== undefined && nodeData.id){
        this.nodeId = nodeData.id;
        var nodeSD = {};
        if(nodeData.data.MoName !== undefined)
        {
            nodeSD.MoName = nodeData.data.MoName;
        } 
         if(nodeData.type !== undefined)
        {
            nodeSD.category = nodeData.type;
        }
        this.setNodeDetails("nodeSumData",nodeSD);//No I18N
    }
    this.opm_MapToggleSummaryView(this.showSummaryView);
    this.onNodeClickCallBack(nodeData.data);
};
ObservabilityMapComponent.prototype.getDeviceSummaryData = function (callback) {
        ObservabilityMapComponent.prototype.nodeCallBack = this.nodeCallBack = callback;
        return this;
};
ObservabilityMapComponent.prototype.onNodeClickCallBack = function (nodeData) {
    this.nodeCallBack(nodeData, event);
};
ObservabilityMapComponent.prototype.goToInspectView = function () {
      var _a;
      if (this.rightClickedComponent) {
          this.inspectedDevice = (_a = this.rightClickedComponent) === null || _a === void 0 ? void 0 : _a.data.displayname !== undefined ? _a.data.displayname : _a.data.name;
          this.renderInspectMap(this.rightClickedComponent.id);
      }
};
ObservabilityMapComponent.prototype.renderInspectMap = function (nodeId) {    
      _this = this;
    if(document.getElementById("flowmap-canvas_inspect"))//No I18N
    {
        document.getElementById("flowmap-canvas_inspect").remove();//No I18N
    }
        //Create forceDirected Graph Instance
       var inspectGraph = new ForcedDirectedGraph()
       var _a;
        this.contextMenu.classed("visible", false)//No I18N
        .style("display", "none");//No I18N
        d3.select("#network_org_map").style("display", "none");//No I18N
        this.currentView = L2_VIEW.INSPECT;
        $('.map_inspectedParentName').text(this.inspectedDevice);
      var linkedData = Object.assign({}, this.l2Graph.links.filter(function (link) { var _a, _b; return ((_a = link === null || link === void 0 ? void 0 : link.source) === null || _a === void 0 ? void 0 : _a.id) == nodeId || ((_b = link === null || link === void 0 ? void 0 : link.target) === null || _b === void 0 ? void 0 : _b.id) == nodeId; }));
        var nodes = [];
        var nodeMap = {};
        Object.keys(linkedData).forEach(function (key) {
        //linkedData.forEach(function (ind,link) {
          var link = linkedData[key];
            [link.source, link.target].forEach(function (node) {
                if (!nodeMap[node.id]) {
                    nodes.push({
                        elementID: node.id,
                        data: node.data,
                        root: node.root,
                        type: node.type,
                        isParent:node.isParent
                    });
                    nodeMap[node.id] = true;
                    if(node.data.status)
                    {
                        inspectGraph._nodeInspSeverityList[String(node.data.status)].push({"name":node.data.displayname,"status":node.data.status});//No I18N
                    }

                }
            });
        });
        var links = Object.keys(linkedData).map(function (key) { var link = linkedData[key]; return ({
            "source": link.source.id,//No I18N
            "target": link.target.id,//No I18N
            "data": link.data//No I18N
        }); });
    //Custom Canvas
    var maxDomain = (_a = d3.max(nodes, function (nd) { return parseInt(nd.data.weight); })) !== null && _a !== void 0 ? _a : 1;
     var isPerformanceOk = false;
    if(nodes.length < 1000)
    {
        isPerformanceOk = true;
    }
    var currentHoverNode;
    var previousHoverNode;
    var nodeToolTip = d3.select("#l2-node-tooltip");//No I18N
    //var linkToolTip = d3.select("#l2-link-tooltip");
    _this.contextMenu = d3.select("#l2-context-menu");//No I18N
    nodeToolTip.on("mouseenter", function () { clearTimeout(_this.tooltipTimeout); });//No I18N
    nodeToolTip.on("mouseleave", function () { _this.hideOrgMapToolTip(nodeToolTip); _this.nodeToolTipShown = false; $('#l2-node-tooltip').hide();});//No I18N
    inspectGraph.defaultConfig =layer2Constants.defaultConfig.lightMode;       
    inspectGraph.statusConstants=layer2Constants.statusConfig.lightMode;    
    inspectGraph.flowMapType = "layer2Map";//No I18N
    inspectGraph.flowMapID = "flowmap-canvas_inspect";//No I18N
    inspectGraph.isPerformanceOk = isPerformanceOk;
    document.getElementById("network_org_map-inspect").style.display = "block";//No I18N
    document.getElementById("obserMap-breadcrumb").style.display = "block";//No I18N
    inspectGraph.container(document.getElementById("network_org_map-inspect"))//No I18N
            inspectGraph.height(window.innerHeight - 100)
            inspectGraph.width(window.innerWidth)
            //inspectGraph.width($(".business-view-inner").width()-20)
           /* if($("#v2HtmlHolder").position().top !== undefined)
            {
              inspectGraph.height($(".business-view-inner").height()+Math.abs($("#v2HtmlHolder").position().top))
            }
            else{*/
              // inspectGraph.height($(".business-view-inner").height()-10)
            //}
            
            inspectGraph.graphData({ nodes: nodes, links: links })
            .enableLinkHover(false)
            .enableWorker({ isDefault: false, limit: 1000000 })
            .tickIteration(10)
            .linkCurve(0.1)
            .linkParticle({radius: 2.5})
            .setKeyMappings({strengthScale: "weight",linkDistanceScale: "weight"})//No I18N
            .setRadiusScale({range: [25, 50]})
            .setStrengthScale({range: [-2000, -3000],domain: [0, maxDomain]})
            /*.onNodeDraw(function (node, ctx, zoomLevel) {
                _this.drawNodeComponent(node, ctx, zoomLevel);
            })*/
            /*.linkDrawMode('after')//No I18N
            .onLinkDraw(function (edge, ctx, zoomLevel) {
                _this.drawLinkComponent(edge, ctx, zoomLevel);
            })*/
            .onNodeHover(function (node, event) {
              _this.lastHovered = LAST_HOVERED.NODE;
             /* if (_this.linkToolTipShown) {
                  _this.hideOrgMapToolTip(linkToolTip);
                  _this.linkToolTipShown = false;
              }*/
              
             currentHoverNode = node;
              _this.hoveredNodeData = node.data;
              
              if(node.data.status !== undefined)
              {
                 if(node.data.MoName !== undefined)
                {
                    if((node.data.MoName).indexOf("APM_") !== -1)
                    {
                        node.data.type = node.type;    
                    }
                    node.data.statusString = severityI18NTxtNew[Number(node.data.status) - 1];
                }else{
                    node.data.statusString = severityAsI18NTxt[Number(node.data.status) - 1];
                }
                var statusClass = "statusoffline inline-block p-none size8 --fault-severity severity_"+node.data.status;//No I18N
              }
              _this.setNodeDetails("nodeTooltipData",{"sumData":node.data,"type":node.type,"statusClass":statusClass});//No I18N
            //   if (!_this.nodeToolTipShown) {
            //       var nodePosition = inspectGraph.canvasToScreenCoordinates(node.x + node.radius, node.y);
            //       nodeToolTip
            //           .style("display", "block")//No I18N
            //           .style("top", "".concat(nodePosition.clientY + 15, "px"))//No I18N
            //           .style("left", "".concat(nodePosition.clientX + 20, "px"))//No I18N
            //           .style("position", "absolute");//No I18N
            //       _this.nodeToolTipShown = true;
            //   }

            if (!_this.nodeToolTipShown) {

                if(node.data.MoName !== undefined && ((node.data.MoName).indexOf("APM_") !== -1 || (node.data.MoName).indexOf("SPM_") !== -1))  
                {
                    $('#l2-node-tooltip').addClass('floating-popup'); //No I18N
                    var nodePosition = inspectGraph.canvasToScreenCoordinates(node.x + node.radius, node.y);
                    nodeToolTip
                        .style("display", "block")//No I18N
                        .style("top", "".concat(nodePosition.clientY + 15, "px"))//No I18N
                        .style("left", "".concat(nodePosition.clientX + 20, "px"))//No I18N
                        .style("position", "absolute");//No I18N
                    _this.nodeToolTipShown = true;
                }
                else
                {
                    if (hoverTimeout) {
                        clearTimeout(hoverTimeout);
                    }
                    hoverTimeout = setTimeout(function() {

                        var deviceName;
                        var iconType = 'Device';//No I18N
                        if (node.data.MoName !== undefined) {
                            deviceName = node.data.MoName;
                        } else {
                            deviceName = node.data.ipAddress;
                            iconType = 'Layer2'; //No I18N
                        }
                        var reqData = {"name": deviceName, "iconType": iconType};//No I18N 
                        var devDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/maps/getMOMarkerInfo", reqData); //No I18n
                        if (devDetails.basicDetails !== undefined) {
                            OPMClient.BVMapDetailsController.set('deviceMoreDetails', []); //No I18n
                            OPMClient.BVMapDetailsController.set('deviceMoreDetails', devDetails); //No I18n
                            $('#l2-node-tooltip').removeClass('floating-popup'); //No I18n
                            var nodePosition = inspectGraph.canvasToScreenCoordinates(node.x + node.radius, node.y);
                            nodeToolTip
                                .style("display", "block")//No I18N
                                .style("top", "".concat(nodePosition.clientY + 15, "px"))//No I18N
                                .style("left", "".concat(nodePosition.clientX +"px"))//No I18N
                                .style("position", "absolute");//No I18N
                            _this.nodeToolTipShown = true;
                        }
                    }, 300);

                }
              }
              if (previousHoverNode && currentHoverNode != previousHoverNode) {
                  inspectGraph.emitParticlesInAdjacentPaths(previousHoverNode, false);
              }
              inspectGraph.emitParticlesInAdjacentPaths(currentHoverNode, true);
              previousHoverNode = node;
           })
            .onNodeClick(function (node) {
               /* _this.nodeId = node.id;
                 var nodeSD = {"category":node.type}//No I18N
                if(node.data.MoName !== undefined)
                {
                    nodeSD.MoName = node.data.MoName;
                }
                _this.setNodeDetails("nodeSumData",nodeSD);//No I18N*/
                _this.contextMenu
                .classed("visible", false)//No I18N
                .style("display", "none");//No I18N
              _this.goToDeviceSummaryDetails(node);
            })
             .onNodeRightClick(function (node, event) {
                _this.rightClickedComponent = node;
                nodeToolTip.style("display", "none");//No I18N
                if(_this.currentView === "INSPECT")
                {
                    d3.select("#l2-context-menu .l2-context-map").style("display", "none");//No I18N
                }
                _this.contextMenu
                    .classed("visible", true)//No I18N
                    .style("display", "block")//No I18N
                    .style("top", "".concat(event.clientY -10, "px"))//No I18N
                    .style("left", "".concat(event.clientX +10, "px"));//No I18N
            })
           .onLinkHover(function (link, event) {
                _this.lastHovered = LAST_HOVERED.LINK;
                /*if (_this.nodeToolTipShown) {
                    _this.hideOrgMapToolTip(nodeToolTip);
                    _this.nodeToolTipShown = false;
                }*/
                _this.hoveredLinkData = link.data;
                /*if (link.data.interface_id && link.data.status != '-') {
                    linkToolTip
                        .style("display", "block")
                        .style("top", "".concat(event.clientY - 90, "px"))
                        .style("left", "".concat(event.clientX - 10, "px"));
                    _this.linkToolTipShown = true;
                }*/
            })
           .backgroundCallbackMode("after")//No I18N
           .onBackgroundHover(function () {
                //_this.hideOrgMapToolTip(linkToolTip);
                if (_this.nodeToolTipShown) {
                    _this.tooltipTimeOutCallback(nodeToolTip);
                }
                _this.nodeToolTipShown = false;
                $('#l2-node-tooltip').hide();
                if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                    hoverTimeout = null; // Reset the timeout variable
                }
                OPMClient.BVMapDetailsController.set('deviceMoreDetails', []); //No I18n
                //_this.linkToolTipShown = false;
                if (previousHoverNode) {
                    inspectGraph.emitParticlesInAdjacentPaths(previousHoverNode, false);
                }
                 if(_this.searchKeyword.length > 0 && _this.lastHovered != LAST_HOVERED.BACKGROUND)
                {
                    _this.performSearch();
                }
                if(_this.selectedSeverity !== null && _this.lastHovered != LAST_HOVERED.BACKGROUND)
                {
                    _this.filterNodeBySeverity(true);
                }
                _this.lastHovered = LAST_HOVERED.BACKGROUND;
            })
            .onBackgroundClick(function () {
                _this.showSummaryView=false;
                _this.opm_MapToggleSummaryView(false);
                //_this.closeSlideoutMenu();
                _this.contextMenu
                .classed("visible", false)//No I18N
                .style("display", "none");//No I18N
            })
          .onSimulationEnd(function () {
            return inspectGraph.fitToViewPort(40, 500); 
           })
          .renderGraph();  
          _this.inspectGraph = inspectGraph;
          _this.setInspectedSeverityFilter();
        if(isPerformanceOk)
          {
            inspectGraph.onNodeDraw(function (node, ctx, zoomLevel) {
                if(inspectGraph.isPerformanceOk)
                {
                    _this.drawNodeComponent(node, ctx, zoomLevel);
                }
            })
          }
    
}
ObservabilityMapComponent.prototype.goToMainMapView = function () {
        document.getElementById("network_org_map-inspect").innerHTML = "";//No I18N
        document.getElementById("network_org_map").style.display = "block";//No I18N
        document.getElementById("obserMap-breadcrumb").style.display = "none";//No I18N
        if(this.inspectGraph !== null && this.inspectGraph !== undefined && this.inspectGraph.animationFrame_Instance)
        {
            window.cancelAnimationFrame(this.inspectGraph.animationFrame_Instance);
        }
        this.clearSearch(true);
        this.currentView = L2_VIEW.MAIN;
        this.setSeverityFilter();
        this.inspectGraph = null;
    };
/*ObservabilityMapComponent.prototype.closeSlideoutMenu = function () {
      this.inventoryView = "NONE";
      this.toggleDetailsView(false);
  };*/
ObservabilityMapComponent.prototype.opm_MapToggleSummaryView = function(showSummaryView)
{
   if(showSummaryView)
    {
      $('.ObservMap-SumView').addClass("sidebar-active");
    }
    else{
       $('.ObservMap-SumView').removeClass("sidebar-active");
    } 
    if(this.contextMenu)
    {
        this.contextMenu
          .classed("visible", false)//No I18N
          .style("display", "none");//No I18N
    }
   
}
ObservabilityMapComponent.prototype.loadConnectedDevicesList = function()
{
    var _this = this;
     if(_this.currentView === "INSPECT")
    {
         var linkedData = Object.assign({}, this.inspectGraph.links.filter(function (link) { var _a, _b; return ((_a = link === null || link === void 0 ? void 0 : link.source) === null || _a === void 0 ? void 0 : _a.id) == _this.nodeId || ((_b = link === null || link === void 0 ? void 0 : link.target) === null || _b === void 0 ? void 0 : _b.id) == _this.nodeId; }));
    }
    else{
         var linkedData = Object.assign({}, this.l2Graph.links.filter(function (link) { var _a, _b; return ((_a = link === null || link === void 0 ? void 0 : link.source) === null || _a === void 0 ? void 0 : _a.id) == _this.nodeId || ((_b = link === null || link === void 0 ? void 0 : link.target) === null || _b === void 0 ? void 0 : _b.id) == _this.nodeId; }));
    }
     var connectedDevices = [];
     var nodeMap = {};
    nodeMap[_this.nodeId] = true;
    Object.keys(linkedData).forEach(function (key) {
        var link = linkedData[key];
        [link.source, link.target].forEach(function (node) {
            if (!nodeMap[node.id]) {
                var dataObj={"displayName":node.data.displayname,"ipAddress":node.data.ipAddress,"type":node.type,"statusColor":statusColors[Number(node.data.status) - 1],"severity":node.data.status,"statusString":severityI18NTxtNew[Number(node.data.status) - 1]};//No I18N
                if(node.data.MoName !== undefined)
                {
                    dataObj.MoName=node.data.MoName;
                }
                if(node.data.noRedirectionRequired!==undefined)
                {
                    dataObj.noRedirectionRequired=node.data.noRedirectionRequired;
                }
                connectedDevices.push(dataObj);
                nodeMap[node.id] = true;
            }
        });
    });
    _this.setNodeDetails("connectedDevicesList",connectedDevices);//No I18N

}
ObservabilityMapComponent.prototype.setSeverityFilter = function() {
    _this = this;
    var severityTmpArr = [];
    var skipSeverity = ["5","6","7"];//No I18N
   if(_this.l2Graph && _this.l2Graph._nodeSeverityList) 
   {
        Object.keys(_this.l2Graph._nodeSeverityList).forEach(function (key) {
            if(_this.l2Graph._nodeSeverityList[key].length > 0 && skipSeverity.indexOf(key) === -1)
            {
                severityTmpArr.push({'statusCount':_this.l2Graph._nodeSeverityList[key].length,'severity':key,'statusString':severityI18NTxtNew[Number(key)-1],'severityClass':"observSeverity gmapSevCircle status"+key});//No I18N
            }
       });
    }
    _this.setNodeDetails("nodeSeverityList",severityTmpArr);//No I18N
}
ObservabilityMapComponent.prototype.setInspectedSeverityFilter = function() {
    _this = this;
    var severityTmpArr = [];
    var skipSeverity = ["5","6","7"];//No I18N
    if(_this.inspectGraph && _this.inspectGraph._nodeInspSeverityList)
    {
       Object.keys(_this.inspectGraph._nodeInspSeverityList).forEach(function (key) {
            if(_this.inspectGraph._nodeInspSeverityList[key].length > 0 && skipSeverity.indexOf(key) === -1)
            {
                severityTmpArr.push({'statusCount':_this.inspectGraph._nodeInspSeverityList[key].length,'severity':key,'statusString':severityI18NTxtNew[Number(key)-1],'severityClass':"observSeverity gmapSevCircle status"+key});//No I18N
            }
       });
    }
   _this.setNodeDetails("nodeSeverityList",severityTmpArr);//No I18N
}
ObservabilityMapComponent.prototype.filterNodeBySeverity = function(isBackground) {
    _this = this;
    document.getElementById('searchNodeFromMap').value="";//No I18N
    _this.searchKeyword = '';
    _this.searchResults = [];
    _this.searchIndex=undefined;
    if(_this.currentView === "INSPECT")
    {
        _this.searchResults = _this.inspectGraph.searchL2NodeBySeverity(Number(_this.selectedSeverity));
    }else{
           _this.searchResults = _this.l2Graph.searchL2NodeBySeverity(Number(_this.selectedSeverity));
    }
    _this.focusNodeBySeverity(isBackground);
}
ObservabilityMapComponent.prototype.focusNodeBySeverity = function(isBackground) {
    _this = this;
   /* if (this.searchIndex) {
        this.searchResults[this.searchIndex - 1].highlightText = false;
        this.searchIndex = this.searchIndex + 1 > this.searchResults.length ? 1 : this.searchIndex + 1;
    }
    else {
        this.searchIndex = 1;
    }
    this.searchResults[this.searchIndex - 1].highlightText = true;*/

    if(!isBackground)
    {
        if(_this.currentView === "INSPECT")
        {
           /* if(_this.previousZoomLevel !== _this.inspectGraph._zoomLevel)
            {*/
                _this.inspectGraph.fitToViewPort(40, 500,Number(_this.selectedSeverity));
                _this.previousZoomLevel = _this.inspectGraph._zoomLevel;
           // }
        }else{
          /*  if(_this.previousZoomLevel !== _this.l2Graph._zoomLevel)
            {*/
                _this.l2Graph.fitToViewPort(40, 500,Number(_this.selectedSeverity));
                _this.previousZoomLevel = _this.l2Graph._zoomLevel;
           // }
        }
        

    }
}

ObservabilityMapComponent.prototype.drawNodeComponent = function(node, ctx, zoomLevel) {
    ctx.save()
   /* if (node.clicked) {
      if (node.dataSpace.rotationSpeed) {
        node.dataSpace.rotationSpeed += 0.02
      } else {
        node.dataSpace.rotationSpeed = 0.02
      }

      ctx.setLineDash([12, 2])
      ctx.translate(node.x, node.y)
      ctx.rotate(node.dataSpace.rotationSpeed)
      ctx.translate(-node.x, -node.y)
    } else {
      ctx.setLineDash([])
    }*/
     
    //stroke

    var nodeStatusColor = this.getNodeStatusColor(node.data.status)
 //   ctx.strokeStyle = nodeStatusColor !== undefined && nodeStatusColor !== null ? nodeStatusColor : this.defaultConfig.node.stroke

    ctx.strokeStyle = nodeStatusColor !== undefined && nodeStatusColor !== null ? nodeStatusColor.nodeColor : this.defaultConfig.node.stroke
    ctx.lineWidth = 8
    var nodeRadius = node.radius;
    if(node.isParent !== undefined && node.isParent === true || node.isParent === "true")
    {
      nodeRadius = nodeRadius+8;
    }
    ctx.moveTo(node.x + nodeRadius, node.y)
    ctx.beginPath()
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI)
    ctx.closePath()
   
 /*  if (this.animation[node.id].isRunning) {
      //ctx.fillStyle = node.dataSpace.fillNode ? nodeStatusColor?.nodeColor : this.defaultConfig.node.fill
      ctx.fillStyle = nodeStatusColor !== undefined ? nodeStatusColor.nodeColor : this.defaultConfig.node.fill
    } else {*/

        if( zoomLevel < 0.3)
        {    
             ctx.fillStyle = nodeStatusColor !== undefined && nodeStatusColor !== null ? nodeStatusColor.nodeColor : this.defaultConfig.node.fill;
        }
        else{
             ctx.fillStyle = nodeStatusColor !== undefined && nodeStatusColor !== null ? nodeStatusColor.nodeFill : this.defaultConfig.node.zoomOutFill;
        }
 //   }

    ctx.fill()
    ctx.stroke()
    ctx.restore()
    if (zoomLevel > 0.3) {
      //text
      var text = node.data.displayname !== undefined ? node.data.displayname : node.data.name;
      var truncatedText = this.truncateText(text, 16);
      ctx.font = "12px LatoRegular"//No I18N
      ctx.strokeStyle =  (node.highlightText ? "#fff" : this.defaultConfig.text.stroke)//No I18N
      ctx.lineWidth = 1.5
      ctx.fillStyle = (node.highlightText ? "#000" : this.defaultConfig.text.fill)//No I18N
      ctx.textAlign = "center"//No I18N
      ctx.strokeText(
        truncatedText,
        node.x,
        node.y + nodeRadius + 16
      )
      ctx.fillText(
        truncatedText,
        node.x,
        node.y + nodeRadius + 16
      )

      //higlight
      if (node.highlightText) {
                  
        var textLen = ctx.measureText(truncatedText).width
        ctx.save()
        ctx.fillStyle = "#ff0"//No I18N
        ctx.globalCompositeOperation = "multiply"//No I18N
        ctx.fillRect(
          node.x - textLen / 2,
          node.y + nodeRadius+7,
          textLen,
          14
        )
        ctx.restore()
      }

    //  var icon = "\ue92d";//No I18N 
      //this.getNodeIcon(node.type.toUpperCase()) ?? "\ue92d" //No I18N
   //   ctx.font = "24px s24x7-icons"//No I18N
      ctx.textBaseline = "middle"//No I18N
      ctx.textAlign = "center"//No I18N

    /*  if (node.data.status) {
        ctx.fillStyle = node.dataSpace.fillNode ? this.defaultConfig.nodeIcon.onNodeFill : this.defaultConfig.nodeIcon.onStatus;
      } else {
        ctx.fillStyle = this.defaultConfig.nodeIcon.defaultColor
      }
      ctx.fillText(icon, node.x, node.y)*/
      if (node.data.status) {
        ctx.fillStyle = node.dataSpace.fillNode ? this.defaultConfig.nodeIcon.onNodeFill : this.defaultConfig.nodeIcon.onStatus;
      } else {
        ctx.fillStyle = this.defaultConfig.nodeIcon.defaultColor;
      }



    }
  }
ObservabilityMapComponent.prototype.truncateText = function (txt, truncateThreshold) {
        if (truncateThreshold && txt.length > truncateThreshold) {
            return txt.substring(0, truncateThreshold - 3) + '...'; //No I18N
        }
        else {
            return txt;
        }
    };
 ObservabilityMapComponent.prototype.drawLinkComponent = function (edge, ctx, zoomLevel) {
        // For Midpoint Calculation t = 0.5
        //
        // Quadratic curve
        //
        // MidPoint Calculation - B(t) = ((1−t)^2 ∗ P0) + 2∗(1−t)∗t∗P1 + t^2*P2  ---->  B(0.5) = (0.25 * P0) + (0.5 * P1) + (0.25 * P2);
        // Tangent Calculation - dx(t) = 2 * (1 - t) * (x1 - x0) + 2 * t * (x2 - x1); ---> dx(0.5) = x2 - x0;
        //                       dy(t) = 2 * (1 - t) * (y1 - y0) + 2 * t * (y2 - y1); ---> dy(0.5) = y2 - y0;
        //
        // Cubic Bezier Curve
        //
        // MidPoint Calculation - B(t) = ((1-t)^3 * P0) + 3*((1-t)^2)*t*P1 + 3*(1-t)*(t^2)*P2 + (t^3)*P3  ---->  B(0.5) = (0.125 ∗ P0) + (0.375 ∗ P1) + (0.375 ∗ P2) + (0.125 ∗ P3)
        // Tangent Calculation - dx(t) = (3 * (1 - t) * (1 - t) * (x1 - x0)) + (6 * (1 - t) * t * (x2 - x1)) + (3 * t * t * (x3 - x2)); ---> dx(0.5) = 0.75( x3 + x2 - x1 - x0 );
        //                       dy(t) = (3 * (1 - t) * (1 - t) * (y1 - y0)) + (6 * (1 - t) * t * (y2 - y1)) + (3 * t * t * (y3 - y2)); ---> dy(0.5) = 0.75( y3 + y2 - y1 - y0 );
        var _a, _b;
        var angle;
        var midPoint = {};
        var offset;
        var linkTextPoint = {};
        var isSourceLeftOfTarget = true;
        if (edge._controlPoints.length == 2) // Quadratic Curve
         {
            isSourceLeftOfTarget = edge.source.x < edge.target.x;
            offset = isSourceLeftOfTarget ? -5 : -10;
            midPoint.x = (0.25 * edge.source.x) + (0.5 * edge._controlPoints[0]) + (0.25 * edge.target.x);
            midPoint.y = (0.25 * edge.source.y) + (0.5 * edge._controlPoints[1]) + (0.25 * edge.target.y);
            var dx = edge.target.x - edge.source.x;
            var dy = edge.target.y - edge.source.y;
            angle = Math.atan2(dy, dx);
            linkTextPoint = this.getMidPointWithOffset(dx, dy, midPoint, offset);
        }
        else // Cubic Bezier Curve
         {
            midPoint.x = (0.125 * edge.source.x) + (0.375 * edge._controlPoints[0]) + (0.375 * edge._controlPoints[2]) + (0.125 * edge.target.x);
            midPoint.y = (0.125 * edge.source.y) + (0.375 * edge._controlPoints[1]) + (0.375 * edge._controlPoints[3]) + (0.125 * edge.target.y);
            var dx = 0.75 * (edge.target.x + edge._controlPoints[2] - edge._controlPoints[0] - edge.source.x);
            var dy = 0.75 * (edge.target.y + edge._controlPoints[3] - edge._controlPoints[1] - edge.source.y);
            angle = Math.atan2(dy, dx);
            linkTextPoint = this.getMidPointWithOffset(dx, dy, midPoint, 5);
        }
        var linkInfo = edge.data;
        ctx.save();
        if (linkInfo && !linkInfo.fadeLink && linkInfo.status != '-') {//No I18N
            if (this.animation[linkInfo.interface_id] !== undefined && this.animation[linkInfo.interface_id].isRunning) {
                ctx.lineWidth = 1.5;
            }
            ctx.strokeStyle = "#8b8b8b";//No I18N//(_b = this.statusConstants !== undefined && this.statusConstants[linkInfo.status]) === null || _b === void 0 ? void 0 : _b.nodeColor;
            ctx.stroke();
        }
        ctx.restore();
         if (zoomLevel > 0.3 && linkInfo.LinkName !== undefined && linkInfo.LinkName != '') {
              ctx.font = '6px LatoRegular';//No I18N
              ctx.textAlign = 'center';//No I18N
              ctx.fillStyle = this.defaultConfig.text.fill;
              ctx.strokeStyle = this.defaultConfig.text.stroke;
              ctx.lineWidth = 1.5;
              ctx.save();
              ctx.translate(linkTextPoint.x, linkTextPoint.y);
              ctx.rotate(angle);
              if (!isSourceLeftOfTarget) {
                ctx.rotate(135);
              }
              ctx.fillText(linkInfo.LinkName, 0, 0);
             // ctx.fillText(String(linkInfo.linkName).split('').join(' '), 0, 0);
              ctx.restore();
        }
        
        this.drawArrow(ctx, midPoint, angle, linkInfo);
    };  
    ObservabilityMapComponent.prototype.drawArrow = function (ctx, midPoint, angle, linkInfo) {
        var arrowSize = 8;
        ctx.save();
        ctx.translate(midPoint.x, midPoint.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-arrowSize, arrowSize / 3);
        ctx.lineTo(-arrowSize, -arrowSize / 3);
        //Uncomment to draw both in and out arrows once suppor for two way links is given
        // ctx.lineTo(arrowSize, arrowSize / 3);
        // ctx.lineTo(arrowSize, -arrowSize / 3);
        ctx.closePath();
        ctx.fillStyle = this.defaultConfig.arrow.fill;
        ctx.fill();
        ctx.restore();
    }; 
    ObservabilityMapComponent.prototype.getMidPointWithOffset=function(dx, dy, midPoint, offset) {
    // Calculation for Midpoint with some offset to place the link name above the arrow
        var length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        var x_perp = -dy / length;
        var y_perp = dx / length;
        return {
          x: midPoint.x + offset * x_perp,
          y: midPoint.y + offset * y_perp
        };
    }
    ObservabilityMapComponent.prototype.getNodeStatusColor = function (status) {
        return this.statusConstants[Number(status) - 1];
    }; 
    ObservabilityMapComponent.prototype.performSearch = function () {
        this.clearSearch();
          if(this.currentView === "INSPECT")
            {
                this.searchResults = this.inspectGraph.searchL2Node(this.searchKeyword);
            }
            else{
                this.searchResults = this.l2Graph.searchL2Node(this.searchKeyword);
            }
        //highlight matched nodes
        this.searchResults.map(function (node) { return node.clicked = true; });
        this.focusNodeFirstIndex();
    };
    ObservabilityMapComponent.prototype.clearSearch = function (isEmpty) {
        if(this.contextMenu)
        {
            this.contextMenu
              .classed("visible", false)//No I18N
              .style("display", "none");//No I18N
        }

        if (this.searchIndex) {
            this.searchResults[this.searchIndex - 1].highlightText = false;
        }
        this.searchIndex = undefined;
        if (this.searchResults.length) {
            this.searchResults.map(function (node) { return node.clicked = false; });
            if(this.currentView === "INSPECT")
            {
                this.inspectGraph.clearL2Search();
            }
            else{
                this.l2Graph.clearL2Search();   
            }
        }
        this.searchResults = [];
        this.isPerformSearch = false;
        this.selectedSeverity = null;
        if(isEmpty)
        {
            this.searchKeyword = '';
            document.getElementById('searchNodeFromMap').value="";
        }
        $(".observSeverity.gmapSevCircle").removeClass("active");
        
    };
    ObservabilityMapComponent.prototype.handleKeyEvent = function (event) {
        if (this.searchResults.length > 0 && (event.key == "ArrowUp" || event.key == "ArrowDown" || event.key == "Enter")) {
            if (this.searchIndex) {
                this.searchResults[this.searchIndex - 1].highlightText = false;
                if (event.key == "ArrowUp" || (!event.shiftKey && event.key == "Enter")) {
                    this.searchIndex = this.searchIndex + 1 > this.searchResults.length ? 1 : this.searchIndex + 1;
                }
                else if (event.key == "ArrowDown" || (event.shiftKey && event.key == "Enter")) {
                    this.searchIndex = this.searchIndex - 1 < 1 ? this.searchResults.length : this.searchIndex - 1;
                }
            }
            else {
                this.searchIndex = 1;
            }
            this.searchResults[this.searchIndex - 1].highlightText = true;
            if(this.currentView === "INSPECT")
            {
                this.inspectGraph.focusNode(this.searchResults[this.searchIndex - 1]);
            }
            else{
                this.l2Graph.focusNode(this.searchResults[this.searchIndex - 1]);   
            }
        }
        else if(event.key == "Enter")
        {
            this.isPerformSearch=true;
        } else if(event.key == "Escape")//No I18N
        {
            this.searchKeyword = '';
            document.getElementById('searchNodeFromMap').value="";
            this.clearSearch();
        }
    };
    ObservabilityMapComponent.prototype.focusNodeFirstIndex = function () {
        if (this.searchResults.length > 0 && this.isPerformSearch) {
            this.searchIndex = 1;
            this.searchResults[this.searchIndex - 1].highlightText = true;
            if(this.currentView === "INSPECT")
            {
                this.inspectGraph.focusNode(this.searchResults[this.searchIndex - 1]);
            }else{    
                this.l2Graph.focusNode(this.searchResults[this.searchIndex - 1]);
            }
            this.isPerformSearch = false;
        }
    };


 return ObservabilityMapComponent;
}());
