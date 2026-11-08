var MapDemo = MapDemo || {};

(function() {
    var buttonOptions = {
        x: null,
        y: null,
        vAlign: 'bottom', //No I18N
        hAlign: 'left', //No I18N 
        layout: 'horizontal', //No I18N
        showBrush: false,
        styles: {
            'border-radius': 0, //No I18N
            width: '27px', //No I18N
            height: '27px', //No I18N
            cursor: 'pointer', //No I18N
            'background-color': 'white', //No I18N
            border: '1px solid #ddd', //No I18N
            'background-size': '10px', //No I18N
            'background-repeat': 'no-repeat', //No I18N
            'background-position': 'center',//No I18N
            'box-shadow': 'rgba(0, 0, 0, 0.2) 2px 2px 3px' //No I18N
        },
        buttons: {
            reset: {
                title: 'Reset Zoom', //No I18N
                styles: {
                    'background-image': 'url(/images/demo/zoom/home.svg)', //No I18N
                    'border-radius': '5px', //No I18N
                    'background-size': '14px' //No I18N
                },
                events: [
                    {
                        type: 'click', //No I18N
                        action: function(chart) {
                            chart.zoomStep(0);
                        }
                    }
                ]
            },
            zoomIn: {
                title: 'Zoom In', //No I18N
                styles: {
                    'background-image': 'url(/images/demo/zoom/zoom-in.svg)', //No I18N
                    'margin-top': '8px',//No I18N
                    'border-radius': '5px 5px 0 0', //No I18N
                    'border-bottom': '0' //No I18N
                },
                events: [
                    {
                        type: 'click', //No I18N
                        action: function(chart) {
                            chart.zoomStep(1.5);
                        }
                    }
                ]
            },
            zoomOut: {
                title: 'Zoom Out', //No I18N
                styles: {
                    'background-image': 'url(/images/demo/zoom/zoom-out.svg)', //No I18N
                    'border-top': '0', //No I18N
                    'border-radius': '0 0 5px 5px' //No I18N
                },
                events: [
                    {
                        type: 'click', //No I18N
                        action: function(chart) {
                            chart.zoomStep(-1.5);
                        }
                    }
                ]
            },
            select: {
                show: false,
                title: 'Select Area', //No I18N
                styles: {
                    'background-image': 'url(/images/demo/zoom/grab.svg)', //No I18N
                    'margin-top': '8px', //No I18N
                    'border-radius': '5px', //No I18N
                    'background-position': '3.5px 3.5px', //No I18N
                    'background-size': '16px' //No I18N
                },
                events: [
                    {
                        type: 'click', //No I18N
                        action: function(chart) {
                            chart.brushEnabled = !chart.brushEnabled;
                            chart.toggleBrush(chart.brushEnabled);
                        }
                    }
                ]
            },
            move: {
                show: false,
                title: 'Move Area', //No I18N
                styles: {
                    'background-image': 'url(/images/demo/zoom/move.svg)' //No I18N
                },
                events: [
                    {
                        type: 'click', //No I18N
                        action: function(chart) {
                            chart.toggleBrush('pan', this); //No I18N
                        }
                    }
                ]
            }
        }
    };

    MapDemo.addNavigationButtonsNotes = function(events, chart) {
        var userConfig = chart.userdata.buttonOptions || {},
            options = $ZC.utils.mergeJSON(buttonOptions, userConfig, true),
            buttons = [],
            plotBrush = chart.behaviouralEvents && chart.behaviouralEvents.eventManager.behaviours.PLOT_BRUSH;

        // filter
        $ZC.utils.each(options.buttons, function(button, name) {
            if (button.show !== false) {
                button.name = name;
                buttons.push(button);
            }
        });

        var parent = $ZC.utils.createElement('div', '.zoom-buttons', chart.nochartdata ? [] : [1], chart.d3container).styles({ //No I18N
                position: 'absolute' //No I18N
            }),
            buttonsElement = $ZC.utils
                .createElement('div', '.custom-buttons', buttons, parent) //No I18N
                .styles(options.styles)
                .styles(function(d) {
                    return d.styles;
                })
                .attr('title', function(d) { //No I18N
                    return d.title;
                })
                .each(function(d) {
                    var el = d3.select(this);
                    el.classed(d.name, true);

                    if (d.class) {
                        el.classed(d.class, true);
                    }

                    if (Array.isArray(d.events)) {
                        d.events.forEach(function(e) {
                            el.on(e.type, function() {
                                e.action.call(this, chart);
                            });
                        });
                    }
                });

        parent
            .style('opacity', 0) //No I18N
            .transition()
            .style('opacity', 1); //No I18N

        if (parent.empty()) {
            return;
        }

        var bound = parent.node().getBoundingClientRect(),
            plotArea = chart.plotarea,
            groupX = plotArea.left,
            groupY = plotArea.top;

        if (options.x && options.y) {
            groupX += options.x;
            groupY += options.y;
        } else {
            var padding = 10;

            // align horizontally
            if (options.hAlign === 'left') { //No I18N
                groupX += padding;
            } else if (options.hAlign === 'right') { //No I18N
                groupX += plotArea.width - bound.width - padding;
            }
            // align vertically
            if (options.vAlign === 'top') { //No I18N
                groupY += padding;
            } else if (options.vAlign === 'bottom') { //No I18N
                groupY += plotArea.height - bound.height - padding;
            }
        }

        parent.styles({
            left: groupX + 'px', //No I18N
            top: groupY + 'px' //No I18N
        });

        // ****************** Custom Brush Util Function ******************/
        if (!plotBrush || !options.hideBrush) {
            return false;
        }

        var defaultBrushFilter = plotBrush.instance.d3_brush.filter();

        /*
         * @param enableBrush
         */

        if (!chart.addedBrushEscapeEvent) {
            chart.addedBrushEscapeEvent = true;
            window.addEventListener('keydown', function(event) {
                if (event.key === 'Escape' || event.keyCode === 27) {
                    chart.brushEnabled = false;
                    chart.toggleBrush(false);
                }
            });
        }

        chart.toggleBrush = function(enableBrush) {
            plotBrush.instance.d3_brush.filter(
                enableBrush
                    ? defaultBrushFilter
                    : function() {
                          return false;
                      }
            );
            chart.staticPaneSVG.selectAll('rect.overlay').attr('cursor', enableBrush ? 'crosshair' : null); //No I18N
            var selectButton = chart.d3container.selectAll('div.custom-buttons.select'), //No I18N
                defaultStyles = selectButton.node().defaultStyles;

            if (!defaultStyles) {
                defaultStyles = selectButton.node().defaultStyles = {
                    background: selectButton.style('background-color'), //No I18N
                    borderColor: selectButton.style('border-color') //No I18N
                };
            }

            selectButton
                .style('background-color', enableBrush ? '#B8E4FF' : defaultStyles.background) //No I18N
                .style('border-color', enableBrush ? '#6B9EE8' : defaultStyles.borderColor); //No I18N
        };

        // disable default brush
        if (!chart.updating) {
            chart.toggleBrush(false);
            chart.brushEnabled = false;
        }
    };
})();
