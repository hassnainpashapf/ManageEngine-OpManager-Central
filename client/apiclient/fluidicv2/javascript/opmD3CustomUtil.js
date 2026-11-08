var ForcedDirectedGraph = (function () {
    function ForcedDirectedGraph() {
        var _this = this;

        this._container=HTMLElement | null;
        //this._graphData;
        this._canvas=HTMLCanvasElement;
        this._ctx=CanvasRenderingContext2D;
        this._canvasRect=DOMRect;
       // this.flowMapType;

        //simulation
        this._simulation;
        this._mouseX=Number;
        this._mouseY=Number;

        this._panStartX=Number;
        this._panStartY=Number;
    

        this._nodes = [];
        this._links = [];
        this._currentIteration = 0;
        this._zoomLevel = 0.2;
        this._zoomScale = [0.07, 2];
        this._isPanning = false;
        this._panOffsetX = 0;
        this._panOffsetY = 0;
        this._isEventInit = true;
        this._isOutOfZoomScale = false;
        //simulation
        this._isSimulatioRunning = true;
        this._linkedByIndex = {};
        this._notHoverCount = 0;
        this._linkHoverEnabled = false;
        this._currentClickedNode=opm_Node;
        this._previousClickedNode=opm_Node;
        this._currentHoveredNode=opm_Node;
        this._previousHoveredNode=opm_Node;

        this._currentClickedLink=Edge;
        this._previousClickedLink=Edge;
        this._currentHoveredLink=Edge;
        this._previousHoveredLink=Edge;

        //severity filter list array
        this._nodeSeverityList = {"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[]};//No I18N
        this._nodeInspSeverityList = {"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[]};//No I18N

        //update config need to update key in draw loop
        this._config = {
            height: window.innerHeight,
            width: window.innerWidth,
            node: {
                mode: "replace",//No I18N
                color: "#78f542"//No I18N
            },
            link: {
                mode: "replace",//No I18N
                curvature: 0,
                color: "#8b8b8b",//No I18N
                particle: {
                    color: 'grey',//No I18N
                    speed: 0.003,
                    radius: 3
                }
            },
            background: {
                mode: "before"//No I18N
            },
            tick_iteration: 120,
            scale: {
                strength: {
                    range: [-2000, -4000],
                    domain: [0, 1]
                },
                radius: {
                    range: [20, 60],
                    domain: [0, 1]
                },
                stroke: {
                    range: [1, 5],
                    domain: [0, 1]
                }
            },
            key_mappings: {
                radiusScale: "",
                strengthScale: "",
                strokeScale: ""
            }
        };
        //this._worker=Worker;
        this._worker;
        this._workerProperties = { isDefault: false, limit: 1000000 };

        //optimization
        this._quadTree;
        this._visibleRect;

        this._update = function () {
            _this._ctx.save();            

            if (!_this._worker && _this._currentIteration < _this._config.tick_iteration) {
                _this._simulation.tick();
                _this._currentIteration++;
            }
            else {
                if (_this._isSimulatioRunning) {
                    _this._createQuadTreeLayout();
                    if (typeof _this.simulationEndCallBack === 'function') {//No I18N
                        if(_this.isPerformanceOk)
                        {
                            _this.simulationEndCallBack();
                        }
                    }
                }
                _this._isSimulatioRunning = false;
            }
            // Apply the zoom transformation
            _this._ctx.scale(_this._zoomLevel, _this._zoomLevel);
            // Apply the pan transformation
            if(_this._panOffsetX === 0 && _this._panOffsetY === 0)
            {
                _this._panOffsetX = (_this._config.width)/2.5;
                _this._panOffsetY = (_this._config.height)/2.5;
            }
            _this._ctx.translate(_this._panOffsetX / _this._zoomLevel, _this._panOffsetY / _this._zoomLevel);
            _this._calculateViewPortBounding();
            _this._ctx.clearRect(_this._visibleRect.topLeftX, _this._visibleRect.topLeftY, _this._visibleRect.bottomRightX - _this._visibleRect.topLeftX, _this._visibleRect.bottomRightY - _this._visibleRect.topLeftY);
            _this._drawNodesAndLinks();
            // Restore the default transformation
            _this._ctx.setTransform(1, 0, 0, 1, 0, 0);
            _this._ctx.restore();        
            _this.animationFrame_Instance = window.requestAnimationFrame(_this._update);
           
        };
    }
    Object.defineProperty(ForcedDirectedGraph.prototype, "nodes", {//No I18N
        get: function () {
            return this._nodes;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ForcedDirectedGraph.prototype, "links", {//No I18N
        get: function () {
            return this._links;
        },
        enumerable: false,
        configurable: true
    });
    /* Graph Properties */
    //setting container element to render
    ForcedDirectedGraph.prototype.container = function (container) {
        this._container = container;
        return this;
    };
    //setting graphdata
    ForcedDirectedGraph.prototype.graphData = function (data) {
        this._graphData = data;
        return this;
    };
    //set height
    ForcedDirectedGraph.prototype.height = function (value) {
        this._config.height = value;
        return this;
    };
    //set width
    ForcedDirectedGraph.prototype.width = function (value) {
        this._config.width = value;
        return this;
    };
    /* Link Properties */
    ForcedDirectedGraph.prototype.enableLinkHover = function (linkHover) {
        this._linkHoverEnabled = linkHover;
        return this;
    };
    /* set Tick_iteration  */
    ForcedDirectedGraph.prototype.tickIteration = function (iteration) {
        this._config.tick_iteration = iteration;
        return this;
    };
    //set link curvature 0 - 1
    ForcedDirectedGraph.prototype.linkCurve = function (curvature) {
        this._config.link.curvature = curvature;
        return this;
    };
    /* Particle Properties */
    //set particle radius
    ForcedDirectedGraph.prototype.linkParticle = function (config) {
         //this._config.link.particle = { ...this._config.link.particle, ...config };
         this._config.link.particle = Object.assign({}, this._config.link.particle, config);
        return this;
    };
    /* Worker Properties */
    ForcedDirectedGraph.prototype.enableWorker = function (workerConfig) {
        this._workerProperties = workerConfig;
        return this;
    };
    /* Scale Properties */
    ForcedDirectedGraph.prototype.setRadiusScale = function (config) {
        //this._config.scale.radius = { ...this._config.scale.radius, ...config }
        this._config.scale.radius = Object.assign({}, this._config.scale.radius, config);
        return this;
    };
    ForcedDirectedGraph.prototype.setStrengthScale = function (config) {
         //this._config.scale.strength = { ...this._config.scale.strength, ...config }
         this._config.scale.strength = Object.assign({}, this._config.scale.strength, config);
        return this;
    };
    ForcedDirectedGraph.prototype.setStrokeScale = function (config) {
        //this._config.scale.stroke = { ...this._config.scale.stroke, ...config }
        this._config.scale.stroke = Object.assign({}, this._config.scale.stroke, config);
        return this;
    };
    /*Set KeyMappings */
    ForcedDirectedGraph.prototype.setKeyMappings = function (map) {
        //this._config.key_mappings = __assign(__assign({}, this._config.key_mappings), map);
         //this._config.key_mappings = { ...this._config.key_mappings, ...map }
         this._config.key_mappings = Object.assign({}, this._config.key_mappings, map);
        return this;
    };
    /* Draw Modes */
    ForcedDirectedGraph.prototype.nodeDrawMode = function (mode) {
        this._config.node.mode = mode;
        return this;
    };
    ForcedDirectedGraph.prototype.linkDrawMode = function (mode) {
        this._config.link.mode = mode;
        return this;
    };
    ForcedDirectedGraph.prototype.backgroundCallbackMode = function (mode) {
        this._config.background.mode = mode;
        return this;
    };
    //define scale to scale based on values
    var radiusScale;
    var strenghtScale;
    var strokeScale;

    //entry point - rendering starts
    ForcedDirectedGraph.prototype.renderGraph = function () {
        var _this = this;
        ForcedDirectedGraph.prototype.radiusScale = function (value) { return d3.scaleSqrt().range(_this._config.scale.radius.range).domain(_this._config.scale.radius.domain)(value !== null && value !== void 0 ? value : 0); };
        ForcedDirectedGraph.prototype.strenghtScale = function (value) { return d3.scaleLinear().range(_this._config.scale.strength.range).domain(_this._config.scale.strength.domain)(value !== null && value !== void 0 ? value : 0); };
        ForcedDirectedGraph.prototype.strokeScale = function (value) { return d3.scaleLinear().range(_this._config.scale.stroke.range).domain(_this._config.scale.stroke.range)(value !== null && value !== void 0 ? value : 0); };
     //   var workerSuccess = false;
        this._createNodesAndLinks();
        this._createForceSimulation();
        this._createCanvasAndSetProperties();
        this._update();
    
       
    };
    ForcedDirectedGraph.prototype._createQuadTreeLayout = function () {
        //using quadtree layout to get node position at optimal time, also for viewport rendering(Viewing-frustum culling)
        this._quadTree = d3.quadtree()
            .x(function (node) { return node.x; })
            .y(function (node) { return node.y; })
            .addAll(this._nodes);
    };
    ForcedDirectedGraph.prototype.updateQuadTree = function () {
        debugger;
        this._createQuadTreeLayout();
    };
    ForcedDirectedGraph.prototype._createNodesAndLinks = function () {
        var _this = this;
        var nodeMap = {};
        var nodeColor = this.defaultConfig.node.fill;
        this._nodes = this._graphData.nodes.map(function (nd, index) {
            nodeColor =  _this.setNodeSeverityList(nd);
            nodeMap[nd.elementID] = index;
            return _this._worker ? new opm_Node(nd.elementID, nd.data, _this._config, nd.root, nd.type, nd.isParent,nodeColor,_this.isPerformanceOk, nd.x, nd.y, nd.vx, nd.vy) : new opm_Node(nd.elementID, nd.data, _this._config, nd.root, nd.type,nd.isParent,nodeColor,_this.isPerformanceOk);
        });
        if (this.flowMapType == "layer2Map") {//No I18N
            this._links = this._graphData.links.map(function (lk) {
                var _a, _b;
                var source = (_a = lk.source.name) !== null && _a !== void 0 ? _a : lk.source;
                var target = (_b = lk.target.name) !== null && _b !== void 0 ? _b : lk.target;
                _this._linkedByIndex[source + "," + target] = true;//No I18N
                _this._nodes[nodeMap[source]].isConnected = _this._nodes[nodeMap[target]].isConnected = true;
                var sourceNode = _this._nodes[nodeMap[source]];

              //  return new Edge(sourceNode, _this._nodes[nodeMap[target]], _this._config, __assign(__assign({}, lk.data), underscore_1.default.findWhere(sourceNode.data.interfaces, { if_name: lk.data.linkName })));
                  return new Edge(sourceNode, _this._nodes[nodeMap[target]],_this._config, Object.assign({}, lk.data, _.findWhere(sourceNode.data.interfaces, { if_name: (lk.data !== undefined && lk.data.LinkName !== undefined ? lk.data.LinkName : "") }) ));

            });
        }
        else {
            this._links = this._graphData.links.map(function (lk) {
                var _a, _b;
                var source = (_a = lk.source.name) !== null && _a !== void 0 ? _a : lk.source;
                var target = (_b = lk.target.name) !== null && _b !== void 0 ? _b : lk.target;
                _this._linkedByIndex[source + "," + target] = true;//No I18N
                _this._nodes[nodeMap[source]].isConnected = _this._nodes[nodeMap[target]].isConnected = true;
                return new Edge(_this._nodes[nodeMap[source]], _this._nodes[nodeMap[target]], _this._config);
            });
        }
    };
    ForcedDirectedGraph.prototype._createForceSimulation = function () {
        var _this = this;
        this._simulation = (0, d3.forceSimulation)(this._nodes);
        if (this.flowMapType == "layer2Map") {//No I18N
            this._simulation.force('x', (0, d3.forceX)(this._config.width / 2))//No I18N
                .force('y', (0, d3.forceY)(this._config.height / 2));//No I18N
        }
        this._simulation
            .force("link", (0, d3.forceLink)(this._links).id(function (d) { return d.id; }).distance(function (link) {//No I18N
            if (_this.flowMapType == "correlationMap") {//No I18N
                return 500;
            }
            else if (_this.flowMapType == "layer2Map") {//No I18N
                var nodeAddress = link.source.data.weight > link.target.data.weight ? "source" : "target";//No I18N
                var weight = link[nodeAddress].data.weight;
                if (weight > 15 && weight <= 30) {
                    return 250;
                }
                else if (weight > 30) {
                    return 300;
                }
                else {
                    return 150;
                }
            }
            else {
                return link.source.root && !link.target.root ? 300 : 30;
            }
        }))
            .force("charge", (0, d3.forceManyBody)().strength(function (d) {//No I18N
            return d.root ? NaN : _this.strenghtScale(d.data[_this._config.key_mappings.strengthScale]);
        }))
            .force("center", (0, d3.forceCenter)().x(this._config.width / 2).y(this._config.height / 2))//No I18N
            .force("collide", (0, d3.forceCollide)(function (d) {//No I18N
            var _a, _b;
            if (_this.flowMapType == "layer2Map") {//No I18N
                return _this.radiusScale((_a = d.data[_this._config.key_mappings.radiusScale]) !== null && _a !== void 0 ? _a : 0) + 25;
            }
            else {
                return d.root ? 40 : _this.radiusScale((_b = d.data[_this._config.key_mappings.radiusScale]) !== null && _b !== void 0 ? _b : 0);
            }
        }).strength(0.3))
            .stop();
    };
    ForcedDirectedGraph.prototype._createCanvasAndSetProperties = function () {
        if (this._container != null) {
            var container = d3.select(this._container)
                .append("canvas")//No I18N
                .attr("id", (this.flowMapID ? this.flowMapID : "flowmap-canvas"))//No I18N
                .attr("height", this._config.height * window.devicePixelRatio)//No I18N
                .attr("width", this._config.width * window.devicePixelRatio)//No I18N
                .style("height", this._config.height + "px")//No I18N
                .style("width", this._config.width + "px");//No I18N
            this._canvas = container.node();
            this._ctx = this._canvas.getContext("2d");//No I18N
            this._ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            this._attachEventListeners();
        }
        else {
            throw new Error('ForcedDirectedGraph - container is null');//No I18N
        }
    };
    ForcedDirectedGraph.prototype._calculateViewPortBounding = function () {
        var inverseMatrix = this._ctx.getTransform().invertSelf();
        var topLeft = inverseMatrix.transformPoint({ x: 0, y: 0 });
        var bottomRight = inverseMatrix.transformPoint({
            x: this._canvas.width,
            y: this._canvas.height
        });
        this._visibleRect = {
            topLeftX: topLeft.x,
            topLeftY: topLeft.y,
            bottomRightX: bottomRight.x,
            bottomRightY: bottomRight.y
        };
    };
    ForcedDirectedGraph.prototype.fitToViewPort = function (padding, animationDuration,isStatus) {
        var _this = this;
        //fit to view only to filters by severity
        if(isStatus !== undefined && isStatus !== null)
        {
            var nodes = this._nodes.filter(function (node) { return node.data.status === isStatus; });
        }
        else{       //fit to view only to connected nodes
            var nodes = this._nodes.filter(function (node) { return node.isConnected; });
        }
        if (nodes.length == 0) {
            nodes = this._nodes;
        }
        if(nodes.length == 1) {
            _this.focusNode(nodes[0]);
        }else{
            var boundaries = {
                left: d3.min(nodes, function (node) { return node.x - node.radius; }),
                right: d3.max(nodes, function (node) { return node.x + node.radius; }),
                top: d3.min(nodes, function (node) { return node.y - node.radius; }),
                bottom: d3.max(nodes, function (node) { return node.y + node.radius; })
            };
            var center = {
                x: (boundaries.left + boundaries.right) / 2,
                y: (boundaries.top + boundaries.bottom) / 2
            };

            var scale = Math.max(1e-12, Math.min(1e12, (this._config.width - (padding * 2)) / (boundaries.right - boundaries.left), (this._config.height - (padding * 2)) / (boundaries.bottom - boundaries.top)));
            var transitionDuration = animationDuration !== null && animationDuration !== void 0 ? animationDuration : 750;
            var st = performance.now();
            var animateFitToView = function (timeStamp) {
                var elapsed = timeStamp - st;
                var progress = Math.min(elapsed / transitionDuration, 1);
                if (progress < 1) {
                    //animation step for each frame
                    _this._zoomLevel = _this._zoomLevel - ((_this._zoomLevel - scale) * progress);
                    _this._panOffsetX = (_this._config.width * 0.5) - (center.x * _this._zoomLevel);
                    _this._panOffsetY = (_this._config.height * 0.5) - (center.y * _this._zoomLevel);
                    requestAnimationFrame(animateFitToView);
                }
            };
            requestAnimationFrame(animateFitToView);
        }
    };
    //Viewing-frustum culling - iterating quadtree to find node position fall under current viewport
    ForcedDirectedGraph.prototype._getViewPortNodes = function () {
        var _this = this;
        var results = [];
        this._quadTree.visit(function (node, x1, y1, x2, y2) {
            if (!node.length) {
                var d = node.data;
                if (d.x >= _this._visibleRect.topLeftX && d.x < _this._visibleRect.bottomRightX && d.y >= _this._visibleRect.topLeftY && d.y < _this._visibleRect.bottomRightY) {
                    results.push(d);
                }
            }
            return x1 >= _this._visibleRect.bottomRightX || y1 >= _this._visibleRect.bottomRightY || x2 < _this._visibleRect.topLeftX || y2 < _this._visibleRect.topLeftY;
        });
        return results;
    };
    ForcedDirectedGraph.prototype._drawNodesAndLinks = function () {
        var _this = this;
        if (!this._isSimulatioRunning) {
            // //draw links
            this._links.forEach(function (link) {
                var isSourceNodeUnderVisibleRect = link.source.x >= _this._visibleRect.topLeftX && link.source.x < _this._visibleRect.bottomRightX && link.source.y >= _this._visibleRect.topLeftY && link.source.y < _this._visibleRect.bottomRightY;
                var isTargetNodeUnderVisibleRect = link.target.x >= _this._visibleRect.topLeftX && link.target.x < _this._visibleRect.bottomRightX && link.target.y >= _this._visibleRect.topLeftY && link.target.y < _this._visibleRect.bottomRightY;
                if (isSourceNodeUnderVisibleRect || isTargetNodeUnderVisibleRect) {
                    link.draw(_this._ctx, _this._zoomLevel, _this._isSimulatioRunning);
                }
            });
            //draw nodes
            var nodes = this._getViewPortNodes();
            nodes.forEach(function (node) {
                node.draw(_this._ctx, _this._zoomLevel);
            });
        }
        else{
            //draw nodes
            this._links.forEach(function (link) { return link.draw(_this._ctx, _this._zoomLevel, _this._isSimulatioRunning); });
            //draw links
            this._nodes.forEach(function (node) { return node.draw(_this._ctx, _this._zoomLevel); });
        }
    };
    ForcedDirectedGraph.prototype._attachEventListeners = function () {
        var _this = this;
        this._canvas.addEventListener('wheel', function (event) { return _this._onWheelEvent(event); });//No I18N
        this._canvas.addEventListener('mousedown', function (event) { return _this._onMouseDown(event); });//No I18N
        this._canvas.addEventListener('mousemove', function (event) { return _this._onMouseMove(event); });//No I18N
        this._canvas.addEventListener('mouseup', function (event) { return _this._onMouseUp(event); });//No I18N
        this._canvas.addEventListener('mouseout', function (event) { return _this._onMouseOut(event); });//No I18N
        this._canvas.addEventListener('click', function (event) { return _this._onMouseClick(event); });//No I18N
        this._canvas.addEventListener('contextmenu', function (event) { return _this._onContextMenu(event); });//No I18N
        this._canvas.addEventListener('mouseenter', function (event) { return _this._onMouseEnter(event); });//No I18N
    };
     ForcedDirectedGraph.prototype._detachEventListeners = function () {
        this._canvas.removeEventListener('wheel', this._onWheelEvent);//No I18N
        this._canvas.removeEventListener('mousedown', this._onMouseDown);//No I18N
        this._canvas.removeEventListener('mousemove', this._onMouseMove);//No I18N
        this._canvas.removeEventListener('mouseup', this._onMouseUp);//No I18N
        this._canvas.removeEventListener('mouseout', this._onMouseOut);//No I18N
        this._canvas.removeEventListener('click', this._onMouseClick);//No I18N
        this._canvas.removeEventListener('contextmenu', this._onContextMenu);//No I18N
    };
     ForcedDirectedGraph.prototype.destroy = function () {
        this._detachEventListeners();
        this._graphData = null; 
        this._quadTree = null;
        this._nodes.length = 0;
        this._links.length = 0;
        this._visibleRect = null;
        this._linkedByIndex = null;
        this._canvasRect = null;
        this._canvas = null;
        this._ctx = null;
        this._previousClickedNode = null;
        this._currentClickedNode = null;
        this._previousHoveredLink = null;
        this._previousHoveredNode = null;  
        this._currentHoveredNode = null;
        this._currentHoveredLink = null;
        this._previousClickedLink = null;
        this._currentClickedLink = null;
        this._container=null;
        this.defaultConfig = {};
        this._config = {};
        this.statusConstants = {};
        this._nodeInspSeverityList = [];
        this._nodeSeverityList = [];
        this._simulation = null;
    };
    ForcedDirectedGraph.prototype._onMouseEnter = function (event) {
        this._canvasRect = this._canvas.getBoundingClientRect();
    };
    ForcedDirectedGraph.prototype._onContextMenu = function (event) {
        event.preventDefault();
        if (this._currentHoveredNode && typeof this.nodeRightClickCallBack === "function") {//No I18N
            this.nodeRightClickCallBack(this._currentHoveredNode, event);
        }
    };
    ForcedDirectedGraph.prototype._onMouseOut = function (event) {
        event.preventDefault();
        this._isPanning = false;
    };
    ForcedDirectedGraph.prototype._onMouseClick = function (event) {
        this._currentClickedNode = this._currentHoveredNode;
        this._currentClickedLink = this._currentHoveredLink;
        if (this._currentClickedNode && this._previousClickedNode && this._currentClickedNode != this._previousClickedNode) {
            this._previousClickedNode.clicked = false;
        }
        if (this._currentClickedLink && this._previousClickedLink && this._currentClickedLink != this._previousClickedLink) {
            this._previousClickedLink.clicked = false;
        }
        if (this._currentClickedNode && typeof this.nodeClickCallBack === "function") {//No I18N
            this._currentClickedNode.clicked = this.flowMapType != "layer2Map";//No I18N
            this.nodeClickCallBack(this._currentClickedNode, event);
            this._previousClickedNode = this._currentClickedNode;
        }
        else if (this._currentClickedLink && typeof this.linkClickCallBack === "function") {//No I18N
            // this._currentClickedLink.clicked = this.flowMapType != "layer2Map";
            this.linkClickCallBack(this._currentClickedLink, event);
            this._previousClickedLink = this._currentClickedLink;
        }
        else if (!this._currentClickedNode && typeof this.backgroundClickCallBack === "function") {//No I18N
            this.backgroundClickCallBack();
        }
    };
    ForcedDirectedGraph.prototype.focusNode = function (node, targetZoom, animationDuration) {
        var _this = this;
        var targetZoomLevel = targetZoom !== null && targetZoom !== void 0 ? targetZoom : 2;
        var transitionDuration = animationDuration !== null && animationDuration !== void 0 ? animationDuration : 750;
        var st = performance.now();
        var animateFocus = function (timeStamp) {
            var elapsed = timeStamp - st;
            var progress = Math.min(elapsed / transitionDuration, 1);
            if (progress < 1) {
                //animation step for each frame
                _this._zoomLevel = _this._zoomLevel + ((targetZoomLevel - _this._zoomLevel) * progress);
                _this._panOffsetX = (_this._config.width * 0.5) - (_this._zoomLevel * node.x);
                _this._panOffsetY = (_this._config.height * 0.5) - (_this._zoomLevel * node.y);
                requestAnimationFrame(animateFocus);
            }
        };
        requestAnimationFrame(animateFocus);
    };
    ForcedDirectedGraph.prototype._fadeNodesAndLinks = function (node, hoveredLink) {
        var _this = this;
        if (node) {
            this._nodes.forEach(function (nd) {
                nd.fade = !_this._isConnected(node, nd);
            });
            if (node.data.isCorrelationMap) {
                this._links
                    .filter(function (link) { return link.source.id !== node.id && link.target.id !== node.id; })
                    .map(function (link) { return link.fade = true; });
            }
            else if (this.flowMapType == "layer2Map") {//No I18N
                this._links.map(function (link) { return link.fade = link.source.id !== node.id && link.target.id !== node.id; });
            }
            else {
                this._links
                    .filter(function (link) { return link[node.root ? "source" : "target"].id != node.id; })//No I18N
                    .map(function (link) { return link.fade = true; });
            }
        }
        else if (this._linkHoverEnabled && hoveredLink) {
            this._nodes.forEach(function (nd) { return nd.fade = !(hoveredLink.source.id == nd.id || hoveredLink.target.id == nd.id); });
            this._links.map(function (link) { return link.fade = link.source.id != hoveredLink.source.id || link.target.id != hoveredLink.target.id; });
        }
        else if (this._notHoverCount < 2) {
            this._nodes.map(function (node) { return node.fade = false; });
            this._links.map(function (link) { return link.fade = false; });
            if (typeof this.backgroundHoverCallBack === "function" && this._config.background.mode == "after") {//No I18N
                this.backgroundHoverCallBack();
            }
        }
    };
     ForcedDirectedGraph.prototype.setNodeSeverityList = function (node) {
        node.data.displayname = node.data.displayname !== "" ? node.data.displayname : node.data.name;
        if(node.data.status)
        {
            this._nodeSeverityList[String(node.data.status)].push({"name":node.data.displayname,"status":node.data.status});//No I18N
            return this.statusConstants[Number(node.data.status) - 1] !== undefined ? this.statusConstants[Number(node.data.status) - 1].nodeColor : this.defaultConfig.node.fill;
        }
    };
    ForcedDirectedGraph.prototype._onWheelEvent = function (event) {
        event.preventDefault();
        if (this._isEventInit || this._isSimulatioRunning) {
            this._canvasRect = this._canvas.getBoundingClientRect();
            this._isEventInit = false;
        }
        var zoomSpeed = 0.1;
        var zoomDelta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
        var zoomFactor = 1 + zoomDelta;
        var mouseX = event.clientX - this._canvasRect.left;
        var mouseY = event.clientY - this._canvasRect.top;
        var nextZoom = event.deltaY > 0 ? Math.max(this._zoomScale[0], this._zoomLevel * zoomFactor) : Math.min(this._zoomScale[1], this._zoomLevel * zoomFactor);
        this._isOutOfZoomScale = nextZoom == this._zoomScale[0] || nextZoom == this._zoomScale[1];
        if (!this._isOutOfZoomScale) {
            // Adjust the zoom level
            this._zoomLevel = nextZoom;
            // Adjust the pan offset based on the zoom factor and mouse position
            this._panOffsetX = mouseX - ((mouseX - this._panOffsetX) * zoomFactor);
            this._panOffsetY = mouseY - ((mouseY - this._panOffsetY) * zoomFactor);
        }
        // this.zoomCallBack(event);
    };
    ForcedDirectedGraph.prototype._onMouseMove = function (event) {
        var _this = this;
        event.preventDefault();
        if (this._isEventInit || this._isSimulatioRunning) {
            this._canvasRect = this._canvas.getBoundingClientRect();
            this._isEventInit = false;
        }
        this._mouseX = (event.clientX - this._canvasRect.left - this._panOffsetX) / this._zoomLevel;
        this._mouseY = (event.clientY - this._canvasRect.top - this._panOffsetY) / this._zoomLevel;
        if (this.flowMapType == "layer2Map") {//No I18N
            this._currentHoveredNode = !this._isSimulatioRunning ? this._quadTree.find(this._mouseX, this._mouseY, this._config.scale.radius.range[0]) : undefined;
        }
        else {
            this._currentHoveredNode = !this._isSimulatioRunning ? this._quadTree.find(this._mouseX, this._mouseY, 20) : undefined;
        }
        if (this._currentHoveredNode && this._previousHoveredNode && this._currentHoveredNode != this._previousHoveredNode) {
            this._previousHoveredNode.hover = false;
        }
        if (this._linkHoverEnabled && !this._isSimulatioRunning) {
            var point_1 = {
                x: this._mouseX,
                y: this._mouseY
            };
            this._currentHoveredLink = this._links.find(function (link) {
                var source = { x: link.source.x, y: link.source.y };
                var target = { x: link.target.x, y: link.target.y };
                var cp1 = { x: link._controlPoints[0], y: link._controlPoints[1], target: target };
                var controlPoints = link._controlPoints.length == 2 ? [source, cp1, target] : [source, cp1, { x: link._controlPoints[2], y: link._controlPoints[3] }, target];
                var pointOnCurve = _this.isPointOnCurve(point_1, controlPoints);
                if (pointOnCurve) {
                    //Distance = Sqrt((px - cx)^2 + (py - cy)^2)
                    var sourceToCenter = Math.sqrt((Math.pow((_this._mouseX - link.source.x), 2)) + (Math.pow((_this._mouseY - link.source.y), 2)));
                    var targetToCenter = Math.sqrt((Math.pow((_this._mouseX - link.target.x), 2)) + (Math.pow((_this._mouseY - link.target.y), 2)));
                    return sourceToCenter > link.source.radius && targetToCenter > link.target.radius;
                }
                else {
                    return pointOnCurve;
                }
            });
        }
        else {
            this._currentHoveredLink = undefined;
        }
        if (this._linkHoverEnabled && this._currentHoveredLink && this._previousHoveredLink && this._currentHoveredLink != this._previousHoveredLink) {
            this._previousHoveredLink.hover = false;
        }
        if (this._currentHoveredNode) {
            this._currentHoveredNode.hover = true;
            this._notHoverCount = 0;
            if (typeof this.nodeHoverCallBack === "function") {//No I18N
                this.nodeHoverCallBack(this._currentHoveredNode, event);
            }
            this._previousHoveredNode = this._currentHoveredNode;
        }
        else if (this._linkHoverEnabled && this._currentHoveredLink) {
            this._currentHoveredLink.hover = true;
            this._notHoverCount = 0;
            if (typeof this.linkHoverCallBack === "function") {//No I18N
                this.linkHoverCallBack(this._currentHoveredLink, event);
            }
            this._previousHoveredLink = this._currentHoveredLink;
        }
        else {
            this._notHoverCount++;
            if (typeof this.backgroundHoverCallBack === "function" && this._config.background.mode == "before") {//No I18N
                this.backgroundHoverCallBack();
            }
        }
        this._fadeNodesAndLinks(this._currentHoveredNode, this._currentHoveredLink);
        this._canvas.style.cursor = (this._currentHoveredNode || this._currentHoveredLink) && this._canvas.classList.length == 0 ? "pointer" : "default";//No I18N
        if (this._isPanning) {
            var deltaX = event.clientX - this._panStartX;
            var deltaY = event.clientY - this._panStartY;
            this._panOffsetX += deltaX;
            this._panOffsetY += deltaY;
            this._panStartX = event.clientX;
            this._panStartY = event.clientY;
            // this.panCallBack(event, this._panStartX, this._panStartY);
        }
    };
    ForcedDirectedGraph.prototype.isPointOnCurve = function (point, controlPoints) {
        var numPoints = 100; // Number of points to calculate along the curve
        var threshold = 5; // Distance threshold for hover detection
        for (var t = 0; t <= 1; t += 1 / numPoints) {
            var curvePoint = this.getCurvePoint(t, controlPoints);
            var distance = Math.sqrt((Math.pow((point.x - curvePoint.x), 2)) + (Math.pow((point.y - curvePoint.y), 2)));
            if (distance < threshold) {
                return true;
            }
        }
        return false;
    };
    ForcedDirectedGraph.prototype.getCurvePoint = function (t, controlPoints) {
        var x = this.getCurveCoordinate(t, controlPoints.map(function (p) { return p.x; }));
        var y = this.getCurveCoordinate(t, controlPoints.map(function (p) { return p.y; }));
        return { x: x, y: y };
    };
    ForcedDirectedGraph.prototype.getCurveCoordinate = function (t, points) {
        var n = points.length - 1;
        var result = 0;
        for (var i = 0; i <= n; i++) {
            result += this.binomialCoefficient(n, i) * (Math.pow((1 - t), (n - i))) * (Math.pow(t, i)) * points[i];
        }
        return result;
    };
    ForcedDirectedGraph.prototype.binomialCoefficient = function (n, k) {
        if (k === 0 || k === n) {
            return 1;
        }
        var result = 1;
        for (var i = 1; i <= k; i++) {
            result *= (n - i + 1) / i;
        }
        return result;
    };
    ForcedDirectedGraph.prototype._onMouseDown = function (event) {
        event.preventDefault();
        this._isPanning = true;
        this._panStartX = event.clientX;
        this._panStartY = event.clientY;
    };
    ForcedDirectedGraph.prototype._onMouseUp = function (event) {
        event.preventDefault();
        this._isPanning = false;
    };
    ForcedDirectedGraph.prototype.emitParticles = function (node, activate) {
        this._links
            .filter(function (link) { return link[node.root ? "source" : "target"].id == node.id; })//No I18N
            .map(function (link) { return link.emitParticle = activate; });
    };
    ForcedDirectedGraph.prototype.emitParticlesInAdjacentPaths = function (node, activate) {
        this._links
            .filter(function (link) { return link.source.id === node.id || link.target.id === node.id; })
            .forEach(function (link) { return link.emitParticle = activate; });
    };
    ForcedDirectedGraph.prototype.highlightpath = function (nodes) {
        // Reset all nodes and links to their default state
        this.resetHighlight();
        // Highlight nodes
        nodes.forEach(function (node) {
            node.isHighlighted = true; // Assuming you have a property like 'highlight' in your opm_Node class //No I18N
        });
        // Highlight links between highlighted nodes
        this._links.forEach(function (link) {
            var sourceHighlighted = nodes.some(function (node) { return node.id === link.source.id; });
            var targetHighlighted = nodes.some(function (node) { return node.id === link.target.id; });
            if (sourceHighlighted && targetHighlighted) {
                link.hightlightLink = true; // Assuming you have a property like 'highlight' in your Link class //No I18N
            }
        });
    };
    ForcedDirectedGraph.prototype.resetHighlight = function () {
        this._nodes.forEach(function (node) {
            node.isHighlighted = false; // Reset all nodes to default state
        });
        this._links.forEach(function (link) {
            link.hightlightLink = false; // Reset all links to default state
        });
    };
    ForcedDirectedGraph.prototype.searchL2Node = function (keyword) {
        if (keyword && keyword != '') {
            var searchedNodes = this._nodes.filter(function (node) { return node.data.displayname.toLowerCase().includes(keyword.toLowerCase()) || node.data.ipAddress.toLowerCase().includes(keyword.toLowerCase()); });
            if (searchedNodes.length > 0) {
                this._nodes.map(function (node) { return node.fade = !node.data.displayname.toLowerCase().includes(keyword.toLowerCase()) && !node.data.ipAddress.toLowerCase().includes(keyword.toLowerCase()); });
                this._links.map(function (link) { return link.fade = true; });
            }
            return searchedNodes;
        }
        return [];
    };
    ForcedDirectedGraph.prototype.searchL2NodeBySeverity = function (keyword) {
        if (keyword && keyword != '') {
            var searchedNodes = this._nodes.filter(function (node) { return node.data.status === keyword;});
            if (searchedNodes.length > 0) {
                this._nodes.map(function (node) { return node.fade = !(node.data.status === keyword); });
                this._links.map(function (link) { return link.fade = true; });
            }
            return searchedNodes;
        }
        return [];
    };
    ForcedDirectedGraph.prototype.getNode = function (nodeId) {
        return _.findWhere(this._nodes, { id: nodeId });
    };
    ForcedDirectedGraph.prototype.getLink = function (interfaceId) {
        return _.find(this._links, function (link) { return link.data.interface_id == interfaceId; });
    };
    ForcedDirectedGraph.prototype.clearL2Search = function () {
        this._nodes.map(function (node) { return node.fade = false; });
        this._links.map(function (link) { return link.fade = false; });
    };
    ForcedDirectedGraph.prototype.canvasToScreenCoordinates = function (x, y) {
        return {
            clientX: (x * this._zoomLevel) + this._panOffsetX,
            clientY: (y * this._zoomLevel) + this._panOffsetY
        };
    };
    ForcedDirectedGraph.prototype.terminateWorker = function () {
        if (this._worker) {
            this._worker.terminate();
        }
    };
    ForcedDirectedGraph.prototype._isConnected = function (a, b) {
        return this._linkedByIndex[a.id + "," + b.id] || this._linkedByIndex[b.id + "," + a.id] || a.id == b.id;//No I18N
    };

    /* Interation CallBacks */
    var nodeClickCallBack;
    var nodeRightClickCallBack;
    var nodeHoverCallBack;
    var linkClickCallBack;
    var linkRightClickCallBack;
    var linkHoverCallBack;
    var nodeDrawCallBack;
    var linkDrawCallBack;
    var zoomCallBack;
    var panCallBack;
    var simulationEndCallBack;
    var backgroundClickCallBack;
    var backgroundHoverCallBack;
    

    /* Properties CallBack*/
    ForcedDirectedGraph.prototype.onNodeClick = function (callback) {
        ForcedDirectedGraph.prototype.nodeClickCallBack = this.nodeClickCallBack = callback;
        return this;
    };
    ForcedDirectedGraph.prototype.onNodeRightClick = function (callback) {
        ForcedDirectedGraph.prototype.nodeRightClickCallBack = this.nodeRightClickCallBack = callback;
        return this;
    };
    ForcedDirectedGraph.prototype.onNodeHover = function (callback) {
        ForcedDirectedGraph.prototype.nodeHoverCallBack = this.nodeHoverCallBack = callback;
        return this;
    };
    ForcedDirectedGraph.prototype.onLinkClick = function (callback) {
        ForcedDirectedGraph.prototype.linkClickCallBack = this.linkClickCallBack = callback;
        return this;
    };
    ForcedDirectedGraph.prototype.onLinkRightClick = function (callback) {
        ForcedDirectedGraph.prototype.linkRightClickCallBack = this.linkRightClickCallBack = callback;
        return this;
    };
    ForcedDirectedGraph.prototype.onLinkHover = function (callback) {
        ForcedDirectedGraph.prototype.linkHoverCallBack = this.linkHoverCallBack = callback;
        return this;
    };
    ForcedDirectedGraph.prototype.onNodeDraw = function (callback) {
        ForcedDirectedGraph.prototype.nodeDrawCallBack = this.nodeDrawCallBack = callback;
        return this;
    };
    ForcedDirectedGraph.prototype.onLinkDraw = function (callback) {
        ForcedDirectedGraph.prototype.linkDrawCallBack = this.linkDrawCallBack = callback;
        return this;
    };
   /* ForcedDirectedGraph.prototype.onGraphZoom = function (callback) {
        ForcedDirectedGraph.prototype.zoomCallBack = this.zoomCallBack = callback;
        return this;
    };
    ForcedDirectedGraph.prototype.onGraphPan = function (callback) {
        ForcedDirectedGraph.prototype.panCallBack = this.panCallBack = callback;
        return this;
    };*/
    ForcedDirectedGraph.prototype.onSimulationEnd = function (callback) {
        ForcedDirectedGraph.prototype.simulationEndCallBack = this.simulationEndCallBack = callback;
        return this;
    };
    ForcedDirectedGraph.prototype.onBackgroundClick = function (callback) {
        ForcedDirectedGraph.prototype.backgroundClickCallBack = this.backgroundClickCallBack = callback;
        return this;
    };
    ForcedDirectedGraph.prototype.onBackgroundHover = function (callback) {
        ForcedDirectedGraph.prototype.backgroundHoverCallBack = this.backgroundHoverCallBack = callback;
        return this;
    };
    return ForcedDirectedGraph;
}());
 //class opm_Node{
/*  clicked = false
  highlightText = false
  fade = false
  hover = false
  isConnected = false
  dataSpace = {}
  isHighlighted = false
*/ 

function opm_Node(id, data, config, root, type, isParent,nodeFillColor,isPerformanceOk, x, y, vx, vy) {
    //super()
    this.id = id
    this.data = data
    this.config = config
    this.root = root
    this.type = type
    this.x = x || 0
    this.y = y || 0
    this.vx = vx || 0
    this.vy = vy || 0
    this.clicked = false
    this.highlightText = false
    this.fade = false
    this.hover = false
    this.isConnected = false
    this.dataSpace = {}
    this.isHighlighted = false
    this.isParent = isParent
    this.nodeFillColor = nodeFillColor
    this.isPerformanceOk = isPerformanceOk
    this.radius = this.radiusScale(
      this.data[this.config.key_mappings.radiusScale] || 0
    )
    this.fillColor = d3.interpolateHcl("#23A96E", "#362142")(Math.random())//No I18N
  //}
}
opm_Node.prototype = Object.create(ForcedDirectedGraph.prototype);
opm_Node.prototype.constructor = opm_Node;

 opm_Node.prototype.draw = function (ctx, zoomLevel) {
        ctx.globalAlpha = this.fade ? 0.2 : 1
        if (
          typeof this.nodeDrawCallBack === "function" &&//No I18N
          (this.config.node.mode == "before" || this.config.node.mode == "replace")//No I18N
        ) {
          if(this.isPerformanceOk)  
          {
              this.nodeDrawCallBack(this, ctx, zoomLevel)
              if (this.config.node.mode == "replace") {//No I18N
                return
              }
          }

        }
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false)
        //ctx.fillStyle = "green"//No I18N
        ctx.fillStyle = this.nodeFillColor
        ctx.fill()
     
        if (
          typeof this.nodeDrawCallBack === "function" &&//No I18N
          this.config.node.mode == "after"//No I18N
        ) {
        
        
          this.nodeDrawCallBack(this, ctx, zoomLevel)
      
        }
}


/*class Edge extends ForcedDirectedGraph {
  hightlightLink = false
  hover = false
  clicked = false
  fade = false
  emitParticle = false
  _progress = 0
  _init = true
*/
function Edge(source, target, config, data) {
  //  super()
    this.source = source
    this.target = target
    this.config = config
    this.hightlightLink = false
    this.hover = false
    this.clicked = false
    this.fade = false
    this.emitParticle = false
    this._progress = 0
    this._init = true
    if (data) {
      this.data = data
    }
  }
Edge.prototype = Object.create(ForcedDirectedGraph.prototype);
Edge.prototype.constructor = Edge;
Edge.prototype.draw = function(ctx, zoomLevel, isSimulatioRunning) {
   // var start = this.source
    //var end = this.target
    if (this._init || isSimulatioRunning) {
      var distance = Math.sqrt(
        Math.pow(this.target.x - this.source.x, 2) + Math.pow(this.target.y - this.source.y, 2)
      )
      if (distance > 0) {
        var angle = Math.atan2(this.target.y - this.source.y, this.target.x - this.source.x)
        var ctrl_point_dist = distance * this.config.link.curvature

        var ctrl_point = {
          x:
            (this.source.x + this.target.x) / 2 +
            ctrl_point_dist * Math.cos(angle - Math.PI / 2),
          y:
            (this.source.y + this.target.y) / 2 +
            ctrl_point_dist * Math.sin(angle - Math.PI / 2)
        }
        this._controlPoints = [ctrl_point.x, ctrl_point.y]
      } else {
        this._setControlPointsForBeizerCurve(this.source.x, this.source.y, 100)
      }
      this._init = false
    }
    ctx.globalAlpha = this.fade ? 0.2 : 1

   /* if (
      typeof this.linkDrawCallBack === "function" &&//No I18N
      (this.config.link.mode == "before" || this.config.link.mode == "replace")//No I18N
    ) {
      this.linkDrawCallBack(this, ctx, zoomLevel)

      if (this.config.link.mode == "replace") {//No I18N
        return
      }
    }*/
    ctx.beginPath()
    ctx.moveTo(this.source.x, this.source.y)
    if (this._controlPoints.length == 2) {
      var ct = this._controlPoints
      ctx.quadraticCurveTo(ct[0],ct[1], this.target.x, this.target.y)
    } else {
      var ct = this._controlPoints
         if(this._controlPoints.length == 4) 
          {
            ctx.bezierCurveTo(ct[0], ct[1],ct[2],ct[3], this.source.x, this.source.y)
          }
          else
          {
            ctx.bezierCurveTo(ct[0], ct[1], this.source.x, this.source.y)
          }
    }
    this.curveType = this._controlPoints.length == 2 ? "quadratic" : "bezier"//No I18N
    ctx.lineWidth = zoomLevel > 0.7 ? 1 / (zoomLevel + 1) : 1
    ctx.strokeStyle = this.config.link.color
    ctx.stroke()

   /* if (
      typeof this.linkDrawCallBack === "function" &&//No I18N
      this.config.link.mode == "after"//No I18N
    ) {
      this.linkDrawCallBack(this, ctx, zoomLevel)
    }*/
    if (this.emitParticle) {
      if (this._particle) {
        this._particle =
          this.curveType == "quadratic"//No I18N
            ? this._calculateQuadraticPoint()
            : this._calulateBeizerPoint()
      } else {
        this._particle = { x: this.source.x, y: this.source.y }
      }
      if (
        (this.curveType == "bezier" && this._progress > 1) ||//No I18N
        this.curveType == "quadratic"//No I18N
      ) {
        if (this._isParticleInsideCircle(this._particle, this.target)) {
          this._progress = 0
        }
      }

      //particle speed
      this._progress += this.config.link.particle.speed
      ctx.beginPath()
      ctx.arc(
        this._particle.x,
        this._particle.y,
        this.config.link.particle.radius / (zoomLevel > 0.8 ? zoomLevel : 1),
        0,
        Math.PI * 2
      )
      ctx.fillStyle = this.config.link.particle.color
      ctx.fill()
    }
  }

 Edge.prototype._isParticleInsideCircle = function(particle, target) {
    //return (Math.sqrt((target.x - particle.x) ** 2 + (target.y - particle.y) ** 2) <= target.radius)
    return (Math.sqrt(Math.pow(target.x - particle.x, 2) + Math.pow(target.y - particle.y, 2)) <= target.radius);
  }
 Edge.prototype._calculateQuadraticPoint = function() {
    var t = this._progress
    var u = 1 - t
    var tt = t * t
    var uu = u * u
    var x = uu * this.source.x + 2 * u * t * this._controlPoints[0] + tt * this.target.x;
    var y = uu * this.source.y + 2 * u * t * this._controlPoints[1] + tt * this.target.y;
    return { x:x, y:y }
  }
Edge.prototype._calulateBeizerPoint = function(){
    //var x = (1 - this._progress) ** 3 * this.source.x + 3 * (1 - this._progress) ** 2 * this._progress * this._controlPoints[0] + 3 * (1 - this._progress) * this._progress ** 2 * this._controlPoints[2] + this._progress ** 3 * this.target.x;
    var x = Math.pow(1 - this._progress, 3) * this.source.x + 
          3 * Math.pow(1 - this._progress, 2) * this._progress * this._controlPoints[0] + 
          3 * (1 - this._progress) * Math.pow(this._progress, 2) * this._controlPoints[2] + 
          Math.pow(this._progress, 3) * this.target.x;

    var y = Math.pow(1 - this._progress, 3) * this.source.y +
          3 * Math.pow(1 - this._progress, 2) * this._progress * this._controlPoints[1] +
          3 * (1 - this._progress) * Math.pow(this._progress, 2) * this._controlPoints[3] +
          Math.pow(this._progress, 3) * this.target.y;


    return { x:x, y:y }
  }
Edge.prototype._setControlPointsForBeizerCurve = function(x, y, distance) {
  
    var direction = Math.floor(Math.random() * 4)
    switch (direction) {
      case 0: //UP
        this._controlPoints = [x, y - distance, x - distance, y]
        break
      case 1: //DOWN
        this._controlPoints = [x, y + distance, x + distance, y]
        break
      case 2: //LEFT
        this._controlPoints = [x - distance, y, x, y + distance]
        break
      case 3: //RIGHT
        this._controlPoints = [x + distance, y, x, y - distance]
        break
      default:
        break
    }
  }

