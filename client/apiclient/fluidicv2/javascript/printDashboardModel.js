/*
 * printDashboardModel.js
 *
 * Session-less, printer-friendly renderer for a single dashboard.
 *
 * Renders the dashboard using the SAME Ember component as the live app
 * (OPMClient.OpmDashboardArrayComponent -> opm-dashboard-widget -> OpmDash<Type>Component),
 * so widget layout, sizing and internal rendering are identical to the real dashboard. The only
 * differences are: no app chrome (menus/nav/filters) and read-only (no drag/resize/edit).
 *
 * This works session-less because:
 *   - the widget list is fetched via the embed endpoint (/embedWidget?type=dashboard...),
 *   - the component's initial per-widget data load (dashboardWidgetSuccessCall in homeModel.js)
 *     already routes through /embedWidget when window.OPM.isEmbed is set,
 *   - the grid layout globals (columnCount/singleColumnWidth/fixedWidth) live in CCTVModel.js,
 *     which is part of the embed bundle.
 *
 * Driven by EmbedViewFilter (type=dashboard) + embedView.jsp. Sets window.canvasLoded = true once
 * all widgets have rendered so the server-side PhantomJS export can capture the page.
 */

window.OPM = window.OPM || {};
window.canvasLoded = false;

/* Session-less page: kill main.js's global 401 -> location.reload, which loops this page forever.*/
try {
	$.ajaxSetup({ statusCode: { 401: function () {} } });
} catch (e) {}

/* Generic chart-repaint pass (NOT widget-specific). Several dashboard widgets draw an SVG dial via
   Morris (e.g. Recent Alarms = severity dial + alarm grid in one tile). Morris draws once in the
   component's didInsertElement and exposes no redraw — so ANY layout reflow (e.g. growing the tile
   to fit content) leaves the dial blank, because the SVG keeps its original geometry while its
   container changed. After all reflow work is done we simply recreate
   each dial from the component's own data, exactly as didInsertElement does. Any widget carrying a
   morrisID is handled the same way; nothing here is keyed to a particular widget. */
function printDashboardRedrawDials() {
	try {
		if (typeof OpmDashwidgetComponentArray === 'undefined' || typeof morrisDonutChart !== 'function') { return; }
		for (var wid in OpmDashwidgetComponentArray) {
			if (!OpmDashwidgetComponentArray.hasOwnProperty(wid)) { continue; }
			var comp = OpmDashwidgetComponentArray[wid];
			if (!comp || !comp.widgetParams || !comp.widgetParams.morrisID) { continue; }
			var wp = comp.widgetParams;
			var jsonData = wp.apiData;
			if (!jsonData || !jsonData.WidgetData || !jsonData.WidgetData.Details) { continue; }
			if (jsonData.WidgetAdditionalData && jsonData.WidgetAdditionalData.dialHide) { continue; }
			if (!document.getElementById(wp.morrisID)) { continue; }
			try {
				$('#' + wp.morrisID + '_legend').empty(); // legend is appended, not replaced -> clear first
				var dialObj = opm_contructObjDonutDial(jsonData.WidgetData.Details);
				morrisDonutChart(wp.morrisID, dialObj.list, dialObj.colors, Ember.I18n.t('webclient.Alarm', this)); //No I18N
			} catch (e) {}
		}
	} catch (e) {}
}

/* Grow each widget's GridStack tile to fit its full content, so nothing scrolls. This touches ONLY the tile
   height (GridStack layout) — the scroll containers are already unclipped by the no-scroll rule in
   printDashboard.css, and nothing here restyles them or a chart's internals; they are just measured.
   Combo tiles (chart + grid, e.g. Recent Alarms) ARE grown here too; any dial they carry is
   repainted afterwards by printDashboardRedrawDials() (Morris doesn't survive the reflow on its own). */
function printDashboardFitTiles() {
	try {
		var gridEl = document.querySelector('#printDashboardContent .grid-stack'); //No I18N
		if (!gridEl || !gridEl.gridstack) { return; }
		var inst = gridEl.gridstack;
		var cell = (inst.opts && inst.opts.cellHeight) || 25;
		if (inst.setStatic) { inst.setStatic(false); }
		if (inst.batchUpdate) { inst.batchUpdate(); }
		var items = document.querySelectorAll('#printDashboardContent .grid-stack-item'); //No I18N
		for (var i = 0; i < items.length; i++) {
			var it = items[i];
			// Business View (JointJS paper fixed at 2000x2000) and 3D Floor View (ThreeJS canvas) widgets
			// are fixed-viewport maps: they are tile-clipped and re-fitted/re-sized to the tile (see their
			// print CSS + printDashboardRefitBVMaps / printDashboardResizeFloors), NOT grown to fit. Growing
			// them here would balloon the tile and overlap neighbouring widgets.
			if (it.querySelector('.global-bv-map') || it.querySelector('[data-widgettype="Floor"]')) { continue; } //No I18N
			// Same container set the no-scroll CSS rule unclips — measured here to size the tile.
			var conts = it.querySelectorAll('.dashboardWidget, .content, .opm_jqGridUI, .mCustomScrollBox, .mCSB_container'); //No I18N
			var needed = it.scrollHeight;
			for (var c2 = 0; c2 < conts.length; c2++) { if (conts[c2].scrollHeight > needed) { needed = conts[c2].scrollHeight; } }
			var curH = parseInt(it.getAttribute('gs-h'), 10) || 1;
			var rows = Math.ceil((needed + 10) / cell);
			if (rows > curH) { try { inst.update(it, { h: rows }); } catch (e) {} }
		}
		if (inst.commit) { inst.commit(); }
		if (inst.setStatic) { inst.setStatic(true); }
	} catch (e) {}
}

/* Business View widgets use a JointJS paper fixed at 2000x2000 (loadBusinessViewNewJoint); the map
   is scaled to fit its container via opm_bvAutoFitToScreen, which reads the paper parent's height.
   In this print view the container only reaches its final (tile) size after the .global-bv-map
   containment CSS + grid layout settle, so the initial afterRender fit can be computed against the
   wrong (2000px) height. Re-fit each BV map to its now-correct container using the map's own fit
   routine — the paper object is stashed on the paper element via jQuery data (see opmanager-mapview.js). */
function printDashboardRefitBVMaps() {
	try {
		if (typeof opm_bvAutoFitToScreen !== 'function' || typeof window.$ !== 'function') { return; }
		var papers = document.querySelectorAll('#printDashboardContent .dashboardWidget.global-bv-map .joint-paper'); //No I18N
		for (var i = 0; i < papers.length; i++) {
			var el = papers[i];
			try {
				var data = $(el).data();
				var paper = data ? data.paper : null;
				if (!paper || !paper.el) { continue; }
				opm_bvAutoFitToScreen(el.id, paper);
			} catch (e) {}
		}
	} catch (e) {}
}

/* 3D Floor View widgets render a ThreeJS canvas sized to their #gwidget<id> container (Three3DView.js).
   The widget's didInsertElement runs before the dashboard component lays out GridStack, so at render
   time the container isn't tile-sized yet and the canvas comes out tiny. After the layout settles, resize
   each floor's renderer to its now-correct container. The floor's state object is stashed on the #gwidget
   element via jQuery data (FloorObj); the widget's own requestAnimationFrame loop keeps painting, so a
   one-time setSize + camera refresh takes effect. Fully guarded — a failure just leaves the floor as-is. */
function printDashboardResizeFloors() {
	try {
		if (typeof window.$ !== 'function') { return; }
		var conts = document.querySelectorAll('#printDashboardContent .grid-stack-item-content[data-widgettype="Floor"] [id^="gwidget"]'); //No I18N
		for (var i = 0; i < conts.length; i++) {
			var el = conts[i];
			try {
				var data = $(el).data();
				var floorObj = data ? data.FloorObj : null;
				if (!floorObj || !floorObj.renderer) { continue; }
				var w = $(el).width(), h = $(el).height();
				if (!w || !h) { continue; }
				floorObj.w = w; floorObj.h = h;
				floorObj.renderer.setSize(w, h);
				if (floorObj.camera) {
					if (typeof floorObj.camera.aspect === 'number') { floorObj.camera.aspect = w / h; }
					if (typeof floorObj.camera.updateProjectionMatrix === 'function') { floorObj.camera.updateProjectionMatrix(); }
					if (floorObj.scene) { floorObj.renderer.render(floorObj.scene, floorObj.camera); }
				}
			} catch (e) {}
		}
	} catch (e) {}
}

/* Heatmap/SummaryBar gate their chart blocks on flags didInsertElement sets after the single render, and
   those conditionals carry no binding — so the tile is captured as an empty shell. Only rerender() revives
   it; notifyPropertyChange() on the flags does nothing. Must run before printDashboardFitTiles(). */
var PRINT_DASHBOARD_DEFERRED_TYPES = ['Heatmap', 'SummaryBar']; //No I18N

function printDashboardRerenderDeferredWidgets() {
	try {
		if (typeof Ember === 'undefined' || !Ember.View || !Ember.View.views) { return; }
		for (var t = 0; t < PRINT_DASHBOARD_DEFERRED_TYPES.length; t++) {
			var tiles = document.querySelectorAll('#printDashboardContent .grid-stack-item-content[data-widgettype="' + PRINT_DASHBOARD_DEFERRED_TYPES[t] + '"]'); //No I18N
			for (var i = 0; i < tiles.length; i++) {
				var views = tiles[i].querySelectorAll('[id^="ember"]'); //No I18N
				for (var v = 0; v < views.length; v++) {
					try {
						var comp = Ember.View.views[views[v].id];
						if (!comp || comp.get('isDestroyed') || comp.get('isDestroying')) { continue; }
						// Only the type component carries these; the widget shell and title views don't.
						if (!comp.get('heatMapId') && !comp.get('graphParams')) { continue; }
						if (typeof comp.rerender !== 'function') { continue; }
						Ember.run(comp, comp.rerender);
					} catch (e) {}
				}
			}
		}
	} catch (e) {}
}

function printDashboardSignalWhenReady(comp, totalWidgets) {
	var checks = 0;
	var timer = setInterval(function () {
		checks++;
		var rendered = 0;
		try { rendered = comp.get('widgetsRenderedCount') || 0; } catch (e) {}
		if ((rendered >= totalWidgets && checks >= 3) || checks >= 90) {
			clearInterval(timer);
			// Grids keep their default page of rows (screen parity). 1) rebuild deferred-render widgets,
			// 2) grow every tile to fit (no scroll), 3) repaint any Morris dial blanked by the reflow,
			// THEN 4) signal capture-ready.
			printDashboardRerenderDeferredWidgets();
			setTimeout(function () {
				printDashboardFitTiles();
				setTimeout(function () {
					printDashboardRedrawDials();
						printDashboardRefitBVMaps();
						printDashboardResizeFloors();
					setTimeout(function () {
						window.canvasLoded = true;
						// Page is fully rendered & laid out — build the report chrome + auto-download the PDF, but ONLY for an explicit export (export=true in the URL). Otherwise this stays a plain printer-friendly view: dashboard-name-only header, no footer, no download.
						if (window.OPM && window.OPM.isPrintExport) { exportPrintDashboardAsPdf(); }
					}, 1000);
				}, 800);
			}, 1500);
		}
	}, 500);
}

/* Empty / inaccessible dashboard: render the product's standard No Data block
   (OpmDashNoDataComponent -- the same component every widget body uses) instead of a
   hand-rolled div, then complete the export so a scheduled/headless run still gets a
   PDF that states why the report is empty. */
function printDashboardShowNoData(container, msgKey, accessDenied) {
	var msg = Ember.I18n.t(msgKey, this);
	$('#printDashboardContent').empty();
	if (container && typeof OPMClient !== "undefined" && OPMClient.OpmDashNoDataComponent !== undefined) {
		Ember.run(function () {
			OPMClient.OpmDashNoDataComponent.create({
				container: container,
				widgetParams: { failureMsg: msg, accessDenied: accessDenied }
			}).appendTo('#printDashboardContent'); //No I18N
		});
	} else {
		// Component/template unavailable (bundle mismatch) -- never leave a blank page.
		$('#printDashboardContent').html("<div class='noDataInfo'></div>").find('.noDataInfo').text(msg); //No I18N
	}
	// Let the append settle, then signal capture-ready. No grid/tile/dial passes are needed
	// (there are no widgets), so printDashboardSignalWhenReady is deliberately not reused.
	setTimeout(function () {
		window.canvasLoded = true;
		if (window.OPM && window.OPM.isPrintExport) {
			exportPrintDashboardAsPdf();
		}
	}, 300);
}

function loadPrintDashboard() {
	try {
		var dn = window.OPM.printDashboardName;

		// Ember app must be booted (container available) before we can instantiate the component.
		if (!window.OPM.OPMClient && typeof OPMClient === "undefined") { setTimeout(loadPrintDashboard, 300); return; }
		var container = OPMClient.__container__ || (OPMClient.ApplicationController && OPMClient.ApplicationController.container);
		if (!container || typeof OPMClient.OpmDashboardArrayComponent === "undefined" || typeof setDashboardGridLayout !== "function") {
			setTimeout(loadPrintDashboard, 300); return;
		}

		// No dashboard name resolved server-side (bad/unknown dashboardId) -> nothing to fetch.
		if (!dn) {
			printDashboardShowNoData(container, 'webclient.dashboard.noWidgets.accessible', true); //No I18N
			return;
		}

		// 1. Fetch the dashboard's widget list (session-less, via the embed endpoint).
		var widgetListUrl = '/embedWidget?type=dashboard&authKey=' + window.OPM.authKey + '&methodCall=getWidgetsList&apiKey=EmbedView&dashboardName=' + encodeURIComponent(dn); //No I18N
		var model = opm_ajaxGetResponse(widgetListUrl);

		if (!model || model.dashboardUnavailable || !model.widgetList) {
			printDashboardShowNoData(container, 'webclient.dashboard.noWidgets.accessible', true); //No I18N
			return;
		}
		if (model.widgetList.length === 0) {
			printDashboardShowNoData(container, 'webclient.dashboard.empty.addwidget', false); //No I18N
			return;
		}

		// 2. Prime the state the dashboard component/layout helper expects.
		window.OPM.dashboardViewType = model.viewType || 'normal'; //No I18N
		window.OPM.userPermissions = window.OPM.userPermissions || {};
		window.OPM.userPermissions.dashboardWrite = false; // read-only -> staticGrid (no drag/resize)
		var hd = OPMClient.HomeDetailsController;
		if (hd.set) { hd.set('dashboardLoadLimit', 9999); } else { hd.dashboardLoadLimit = 9999; } // load all widgets up-front (no scroll lazy-load)
		hd.dashboardName = dn;
		if (!hd.defaultDashboard) { hd.defaultDashboard = []; }
		model.dashboardName = dn;

		// 3. Enrich widgets with grid ids/positions/sizes exactly like the live route does.
		setDashboardGridLayout(model);

		// 4. Render the real dashboard component (read-only, no chrome) into the print container.
		// (The grid div's inline overflow:hidden is unclipped by the .grid-stack rule in printDashboard.css.)
		$('#printDashboardContent').empty();
		var comp;
		Ember.run(function () {
			comp = OPMClient.OpmDashboardArrayComponent.create({
				container: container,
				widgetList: model.widgetList.slice(),
				totalCols: model.totalCols,
				orginalCol: model.orginalCol,
				dashboardGridID: model.dashboardGridID,
				isDefaultDashboard: model.isDefaultDashboard,
				isConfigureWidget: false,
				isEditDashboard: false,
				isHideEditWidget: true,
				isDashPropsAvailable: model.isDashPropsAvailable,
				dashboardName: dn
			});
			comp.appendTo('#printDashboardContent'); //No I18N
		});
		window.__printComp = comp;

		// 5. Signal completion once all widgets have rendered (used by waiters/automation).
		printDashboardSignalWhenReady(comp, model.widgetList.length);
	} catch (err) {
		window.canvasLoded = true;
	}
}

/* ---------------------------------------------------------------------------
 * Client-side PDF export (html2canvas + jsPDF), identical in approach to the
 * live dashboard's own "Export as PDF" (homeView.js exportDashboardAsPdf):
 * snapshot the rendered DOM to a canvas, then place it into a jsPDF. Because it
 * captures the already-rendered page, the PDF matches the on-screen dashboard
 * pixel-for-pixel (same widget layout, charts, tables — even "No Data" states).
 * Both html2canvas and jsPDF are part of the embed bundle, so no extra load.
 * ------------------------------------------------------------------------- */

/* html2canvas renders these CSS-styled icon <svg>s unfaithfully: the disc (the svg's own background +
   border-radius, inset by 8px border-box padding) comes out at the content box instead of the border box,
   and the glyph lands off-centre. Rebuild each icon-only svg as a <div> holding the measured disc plus an
   <img> holding the glyph as a self-contained data URI — both render faithfully. Every value is measured
   from the live element, so this does not depend on the cascade. Skipped unless the svg contains nothing
   but the one <use>, so a chart that merely carries a sprite ref is never rebuilt. */
function printDashboardIconSvgsToImages(root) {
	try {
		var svgs = root.querySelectorAll('svg'); //No I18N
		Array.prototype.forEach.call(svgs, function (svg) {
			try {
				var uses = svg.querySelectorAll('use'); //No I18N
				if (uses.length !== 1) { return; }
				var painted = svg.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon,text,image'); //No I18N
				for (var p = 0; p < painted.length; p++) {
					if (!painted[p].closest('symbol,defs')) { return; } //No I18N
				}
				var el = uses[0];
				var href = el.getAttribute('href') || el.getAttribute('xlink:href') || ''; //No I18N
				if (href.indexOf('#') < 0) { return; } //No I18N
				var sym = svg.querySelector('symbol[id="' + href.split('#')[1] + '"]'); //No I18N
				if (!sym || !sym.children.length) { return; }
				var box = svg.getBoundingClientRect();
				// The <use> rect is the artwork's own box — what the page actually shows. Sizing the <img>
				// to the svg's content box instead renders the glyph too big, because the artwork fills the
				// standalone svg whereas live it only fills part of the symbol's viewBox.
				var gr = el.getBoundingClientRect();
				if (!box.width || !gr.width || !gr.height) { return; }
				var cs = window.getComputedStyle(svg);
				var ucs = window.getComputedStyle(el);
				var fill = (ucs.fill && ucs.fill !== 'none') ? ucs.fill : (cs.color || '#000'); //No I18N
				var ser = new XMLSerializer(), inner = '';
				for (var c = 0; c < sym.children.length; c++) { inner += ser.serializeToString(sym.children[c]); }
				var standalone = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (sym.getAttribute('viewBox') || '') + '" width="' + gr.width + '" height="' + gr.height + '" fill="' + fill + '">' + inner + '</svg>'; //No I18N
				var div = document.createElement('div'); //No I18N
				div.setAttribute('class', svg.getAttribute('class') || ''); //No I18N
				div.style.cssText = 'position:relative;display:inline-block;box-sizing:border-box;padding:0;vertical-align:middle;width:' + box.width + 'px;height:' + box.height + 'px;background:' + cs.backgroundColor + ';border-radius:' + cs.borderRadius + ';margin:' + cs.margin + ';'; //No I18N
				var img = document.createElement('img'); //No I18N
				img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(standalone); //No I18N
				img.style.cssText = 'position:absolute;left:' + (gr.left - box.left) + 'px;top:' + (gr.top - box.top) + 'px;width:' + gr.width + 'px;height:' + gr.height + 'px;'; //No I18N
				div.appendChild(img);
				svg.parentNode.replaceChild(div, svg);
			} catch (e) {}
		});
	} catch (e) {}
}

/* Best-effort: inline <use>/<image> sprite references inside the dashboard's SVGs
   so html2canvas can paint icon-sprite glyphs (it cannot follow external <use>).
   Mirrors the SVG pre-pass in the live export. Never blocks the export on failure. */
function inlinePrintDashboardSvgRefs(root, done) {
	var finished = false;
	function finish() { if (!finished) { finished = true; printDashboardIconSvgsToImages(root); done(); } }
	// Hard safety net: the export must NEVER hang waiting on sprite fetches. If the inlining
	// isn't done within this budget, proceed with the capture anyway (icons may fall back).
	var guard = setTimeout(finish, 3500);
	try {
		var svgs = root.querySelectorAll('svg'); //No I18N
		var pending = 0;
		function maybeDone() { if (pending === 0 && !finished) { clearTimeout(guard); finish(); } }
		Array.prototype.forEach.call(svgs, function (svg) {
			var refs = svg.querySelectorAll('image, use'); //No I18N
				Array.prototype.forEach.call(refs, function (el) {
					var href = el.getAttribute('href') || el.getAttribute('xlink:href'); //No I18N
					if (!href || href.charAt(0) === '#' || href.indexOf('data:') === 0) { return; } //No I18N
					var base = href.split('#')[0];
					// Raster <image> refs (e.g. Business View device-icon PNGs referenced by a relative xlink:href)
					// are NOT SVG sprites. Inline them as a data URI, because (a) parsing a PNG as image/svg+xml yields
					// a <parsererror> node that the old code swapped in for the glyph -- deleting it; and (b) html2canvas
					// cannot resolve a relative xlink:href when it serialises the SVG, so a left-alone raster ref renders
					// blank. A data URI fixes both.
					var isRaster = /\.(png|jpe?g|gif|webp|bmp|ico)(\?|$)/i.test(base);
					pending++;
					try {
						var xhr = new XMLHttpRequest();
						xhr.open('GET', base, true); //No I18N
						xhr.timeout = 2500; // never block on a slow/hung fetch
						if (isRaster) {
							xhr.responseType = 'blob'; //No I18N
							var settleRaster = function () {
								try {
									if (xhr.status === 200 && xhr.response) {
										var fr = new FileReader();
										fr.onloadend = function () {
											try {
												el.setAttribute('href', fr.result); //No I18N
												el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', fr.result); //No I18N
											} catch (e3) {}
											pending--; maybeDone();
										};
										fr.onerror = function () { pending--; maybeDone(); };
										fr.readAsDataURL(xhr.response);
										return;
									}
								} catch (e2) {}
								pending--; maybeDone();
							};
							xhr.onreadystatechange = function () { if (xhr.readyState === 4) { settleRaster(); } };
						} else {
							var settle = function () {
								try {
									if (xhr.status === 200 && xhr.responseText) {
										var hash = href.indexOf('#') >= 0 ? href.split('#')[1] : null;
										var doc = new DOMParser().parseFromString(xhr.responseText, 'image/svg+xml'); //No I18N
										// Only inline when the response really is SVG -- otherwise (an HTML error page, or a binary
										// served without extension) DOMParser returns a <parsererror> document and swapping it in
										// would delete the referenced glyph.
										if (!doc.querySelector('parsererror') && doc.documentElement && doc.documentElement.nodeName.toLowerCase() === 'svg') { //No I18N
											var node = hash ? doc.getElementById(hash) : doc.documentElement;
											if (node) {
												var imported = svg.ownerDocument.importNode(node, true);
												if (imported.nodeName.toLowerCase() === 'symbol') { //No I18N
													// A <symbol> paints only when a <use> instantiates it, so swapping it in for the
													// <use> renders nothing. Keep the <use> and repoint it at a local copy: html2canvas
													// serialises each <svg> standalone, so '#id' resolves where the sprite URL cannot.
													if (!svg.querySelector('[id="' + hash + '"]')) { svg.appendChild(imported); }
													el.setAttribute('href', '#' + hash); //No I18N
													el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + hash); //No I18N
												} else {
													el.parentNode.replaceChild(imported, el);
												}
											}
										}
									}
								} catch (e2) {}
								pending--; maybeDone();
							};
							xhr.onreadystatechange = function () { if (xhr.readyState === 4) { settle(); } };
						}
						xhr.ontimeout = function () { pending--; maybeDone(); };
						xhr.onerror = function () { pending--; maybeDone(); };
						xhr.send();
					} catch (e1) { pending--; }
				});
		});
		// Device images shown as CSS background-images (e.g. Rack View unit tiles set
		// background-image:url(...png) on their <td>) are often captured as blank boxes by html2canvas.
		// Inline each raster background-image as a data URI so it paints. //inlinePrintDashboardBgImages_marker
		// NOTE: this one must stay an INLINE style (setProperty below) — targets are found via the
		// [style*="background-image"] selector, so a stylesheet background-image would never be seen here.
		var bgEls = root.querySelectorAll('[style*="background-image"]'); //No I18N
		Array.prototype.forEach.call(bgEls, function (el) {
			var bg = '';
			try { bg = getComputedStyle(el).backgroundImage || ''; } catch (eb) { return; }
			var mm = /url\(\s*['"]?([^'")]+?)['"]?\s*\)/i.exec(bg); //No I18N
			if (!mm) { return; }
			var u = mm[1];
			if (!u || u.indexOf('data:') === 0) { return; } //No I18N
			if (!/\.(png|jpe?g|gif|webp|bmp|ico)(\?|$)/i.test(u.split('#')[0])) { return; } //No I18N
			pending++;
			try {
				var xhrb = new XMLHttpRequest();
				xhrb.open('GET', u, true); //No I18N
				xhrb.timeout = 2500;
				xhrb.responseType = 'blob'; //No I18N
				xhrb.onreadystatechange = function () {
					if (xhrb.readyState !== 4) { return; }
					try {
						if (xhrb.status === 200 && xhrb.response) {
							var frb = new FileReader();
							frb.onloadend = function () {
								try { el.style.setProperty('background-image', 'url("' + frb.result + '")', 'important'); } catch (e5) {} //No I18N
								pending--; maybeDone();
							};
							frb.onerror = function () { pending--; maybeDone(); };
							frb.readAsDataURL(xhrb.response);
							return;
						}
					} catch (e4) {}
					pending--; maybeDone();
				};
				xhrb.ontimeout = function () { pending--; maybeDone(); };
				xhrb.onerror = function () { pending--; maybeDone(); };
				xhrb.send();
			} catch (e3) { pending--; }
		});
		maybeDone(); // in case there were no refs
	} catch (e) { finish(); }
}

/* Build the report chrome straight into the page so a SINGLE capture of #printDashboardContainer
   encloses the dashboard between a product header (logo + dashboard name + generated time) and a
   disclaimer footer — same content as the live dashboard export (#dashReportHeader/#dashReportFooter).
   Doing it in one capture (rather than three) keeps the export light and reliable. Returns the title.
   Styling lives in printDashboard.css (.printDashboardReport* / #printDashboardReportFooter). */
function buildPrintReportChrome() {
	var container = document.getElementById('printDashboardContainer'); //No I18N
	var titleEl = document.getElementById('printDashboardTitle'); //No I18N
	var title = (titleEl && titleEl.textContent) ? titleEl.textContent.replace(/\s+/g, ' ').trim() : 'dashboard'; //No I18N
	if (!container) { return title; }
	var ac = (typeof OPMClient !== 'undefined' && OPMClient.ApplicationController) ? OPMClient.ApplicationController : null; //No I18N
	function acGet(k) { try { return ac ? (ac.get ? ac.get(k) : ac[k]) : null; } catch (e) { return null; } }
	var logo = acGet('rebrandImagePath') || '/apiclient/fluidicv2/img/opmanager_logo_report.gif'; //No I18N
	var ts = acGet('currentServerTime') || new Date().toLocaleString(); //No I18N
	var genAt = Ember.I18n.t('webclient.admin.notifications.generatedat', this); //No I18N

	// Header: product logo on the left; dashboard name + "Generated at" (+ user name) on the right; green divider.
	var header = document.getElementById('printDashboardHeader'); //No I18N
	if (header && !header.getAttribute('data-reportchrome')) { //No I18N
		header.setAttribute('data-reportchrome', '1'); //No I18N
		header.innerHTML =
			'<div class="printDashboardReportRow">' + //No I18N
				'<img src="' + logo + '" class="printDashboardReportLogo">' + //No I18N
				'<div class="printDashboardReportMeta">' + //No I18N
					'<div class="printDashboardReportName">' + title + '</div>' + //No I18N
					'<div class="printDashboardReportGenAt"><span class="printDashboardReportLabel">' + genAt + ':</span> ' + ts + '</div>' + //No I18N
				'</div>' +
			'</div>' +
			'<div class="printDashboardReportRule"></div>'; //No I18N

		// Built via textContent, not the innerHTML above: the name is user-controlled data.
		var printUserName = window.OPM.printDashboardUserName;
		var reportMeta = header.querySelector('.printDashboardReportMeta'); //No I18N
		if (printUserName && reportMeta) {
			var userRow = document.createElement('div'); //No I18N
			userRow.className = 'printDashboardReportGenAt'; //No I18N
			var userLabel = document.createElement('span'); //No I18N
			userLabel.className = 'printDashboardReportLabel'; //No I18N
			userLabel.textContent = Ember.I18n.t('webclient.login.username', this) + ':'; //No I18N
			userRow.appendChild(userLabel);
			userRow.appendChild(document.createTextNode(' ' + printUserName));
			reportMeta.appendChild(userRow);
		}
	}
	// Footer: disclaimer line, appended once at the end of the report.
	if (!document.getElementById('printDashboardReportFooter')) { //No I18N
		var foot = document.createElement('div'); //No I18N
		foot.id = 'printDashboardReportFooter'; //No I18N
		foot.innerHTML = '<span class="printDashboardReportLabel">' + Ember.I18n.t('Disclaimer', this) + ':</span> ' + Ember.I18n.t('nfa.GDPRalert.csvPDFMsg', this); //No I18N
		container.appendChild(foot);
	}
	return title;
}

/* Auto-invoked once the page has fully rendered (no button): snapshot the whole report
   (header + dashboard + footer) and download it as <dashboard name>.pdf. Mirrors the live
   dashboard's own html2canvas+jsPDF export, so the PDF matches the on-screen view. */
function exportPrintDashboardAsPdf() {
	if (window.__printDashboardExported) { return; } // once per page load
	if (typeof html2canvas !== 'function' || !(window.jspdf && window.jspdf.jsPDF)) { return; }
	var container = document.getElementById('printDashboardContainer'); //No I18N
	if (!container) { return; }
	window.__printDashboardExported = true;

	var title = buildPrintReportChrome();
	var fileName = (title || 'dashboard') + '.pdf'; //No I18N

	inlinePrintDashboardSvgRefs(container, function () {
		setTimeout(function () {
			// windowWidth is a WINDOW width: passing the container's own leaves the clone short by the body padding, which reflows the grid onto different sub-pixels than the page.
			var bodyStyle = window.getComputedStyle(document.body);
			var bodyPadX = (parseFloat(bodyStyle.paddingLeft) || 0) + (parseFloat(bodyStyle.paddingRight) || 0);
			var cssW = Math.max(document.documentElement.clientWidth, container.scrollWidth + bodyPadX);
			var cssH = container.scrollHeight;
			// Pin the raster scale: html2canvas defaults to devicePixelRatio, which is 1 in headless Chrome, so
			// scheduled exports would come out blurrier than interactive ones. Clamped to the browser's canvas
			// limits (65535px per side, ~268Mpx area) so a tall dashboard steps down instead of losing the canvas.
			var scale = Math.max(1, Math.min(1.5, 65535 / cssH, 65535 / cssW,
						Math.sqrt(268435456 / (cssW * cssH))));
			html2canvas(container, {
				useCORS: true,
				backgroundColor: '#ffffff', //No I18N
				scale: scale,
				scrollX: 0, scrollY: 0,
				windowWidth: cssW,
				windowHeight: cssH,
				imageTimeout: 8000
			}).then(function (canvas) {
				try {
					var jsPDFCtor = window.jspdf.jsPDF;
					var pageW = 210, margin = 6; // A4 width (mm); one long page so nothing splits
					var imgW = pageW - margin * 2;
					var imgH = imgW * canvas.height / canvas.width;
					var pageH = imgH + margin * 2;
					// jsPDF swaps custom dimensions to match the requested orientation. Short dashboards
					// therefore need landscape orientation to keep the page at 210mm wide instead of clipping it.
					var orientation = pageW > pageH ? 'l' : 'p'; //No I18N
					var pdf = new jsPDFCtor({ orientation: orientation, unit: 'mm', format: [pageW, pageH] }); //No I18N
					// JPEG keeps the file small (PNG of a full dashboard is ~20-25MB). JPEG block compression
					// would otherwise mangle thin 1px card borders into broken lines — but the print CSS gives
					// the grid a light-grey background behind white cards, so each card edge is a large white/grey
					// colour transition (JPEG-safe) and reads as a clean continuous edge regardless of the border.
					pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', margin, margin, imgW, imgH); //No I18N
					// Expose the finished PDF as base64 so a server-side/scheduled headless browser can
					// capture this exact report (no download interception needed); then do the normal
					// interactive download for users who open the link directly.
					try {
						window.__dashboardPdfBase64 = (pdf.output('datauristring') || '').split(',')[1] || ''; //No I18N
						window.__dashboardPdfName = fileName;
						window.__dashboardPdfReady = true;
					} catch (e) {}
					try { pdf.save(fileName); } catch (e) {}
				} catch (e) {}
			}, function () {});
		}, 50);
	});
}
window.exportPrintDashboardAsPdf = exportPrintDashboardAsPdf;
