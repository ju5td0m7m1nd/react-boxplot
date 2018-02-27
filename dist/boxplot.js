(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(
      ["react", "create-react-class", "prop-types", "underscore"],
      factory
    );
  } else if (typeof exports === "object") {
    module.exports = factory(
      require("react"),
      require("create-react-class"),
      require("prop-types"),
      require("underscore")
    );
  } else {
    root.Boxplot = factory(
      root.React,
      root.createReactClass,
      root.PropTypes,
      root._
    );
  }
})(this, function(React, createReactClass, PropTypes, _) {
  // Inspiration:
  //
  // - https://turgar.github.io/
  // - http://bl.ocks.org/mbostock/4061502
  // - http://bl.ocks.org/jensgrubert/7789216
  // - http://flowingdata.com/2008/02/15/how-to-read-and-use-a-box-and-whisker-plot/
  //
  var Boxplot = createReactClass({
    propTypes: {
      // Width of the svg element
      width: PropTypes.number.isRequired,
      // Height of the svg element
      height: PropTypes.number.isRequired,
      // Orientation of the plot. vertical means min values at the left,
      // horizontal means min values at the bottom.
      orientation: PropTypes.oneOf(["vertical", "horizontal"]),

      // Minimum and maximum values for the axis. Values outside this
      // range are clipped.
      min: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,

      // The stats to plot.
      stats: PropTypes.shape({
        // The tick of the lower whisker.
        whiskerLow: PropTypes.number.isRequired,
        // The lower end of the box.
        quartile1: PropTypes.number.isRequired,
        // The median.
        quartile2: PropTypes.number.isRequired,
        // The upper end of the box.
        quartile3: PropTypes.number.isRequired,
        // The tick of the upper whisker.
        whiskerHigh: PropTypes.number.isRequired,
        // The outliers.
        outliers: PropTypes.array
      }),

      style: PropTypes.object,
      tickStyle: PropTypes.object,
      whiskerStrokeWidth: PropTypes.number,
      whiskerStyle: PropTypes.object,
      boxStyle: PropTypes.object,
      medianStrokeWidth: PropTypes.number,
      medianStyle: PropTypes.object,
      outlierRadius: PropTypes.number,
      outlierStyle: PropTypes.object
    },

    getDefaultProps: function() {
      return {
        orientation: "vertical",
        style: { strokeOpacity: 1, fillOpacity: 0.75 },
        // tickStyle: { stroke: 'black', strokeDasharray: '2,2' },
        tickStyle: { stroke: "black" },
        whiskerStrokeWidth: 1,
        // whiskerStyle: { stroke: 'black', strokeDasharray: '2,2' },
        whiskerStyle: { stroke: "black" },
        boxStyle: { stroke: "black", fill: "black" },
        medianStrokeWidth: 2,
        medianStyle: { stroke: "white" },
        outlierRadius: 2.5,
        outlierStyle: { stroke: "black", fill: "black" }
      };
    },

    displayName: "Boxplot",

    render: function() {
      var component = this,
        stats = this.props.stats;

      var xMax, horizScaleFactor, vertScaleFactor, transform;
      if (this.props.orientation == "vertical") {
        xMax = this.props.width;

        vertScaleFactor = this.props.height / (this.props.max - this.props.min);
        horizScaleFactor = 1.0;

        // Coordinate system: +y at the top, +x to the right.
        transform =
          "translate (" +
          -this.props.min +
          ", 0) " +
          "translate (0, " +
          this.props.height +
          ") " +
          "scale(1, -" +
          vertScaleFactor +
          ")";
      } else {
        xMax = this.props.height;

        horizScaleFactor = this.props.width / (this.props.max - this.props.min);
        vertScaleFactor = 1.0;

        // Coordinate system: +y at the right, +x to the top.
        transform =
          "scale(" +
          horizScaleFactor +
          ", 1) " +
          "translate (" +
          -this.props.min +
          ", 0) " +
          "translate (0, " +
          this.props.height +
          ") " +
          "rotate(-90)";
      }

      var xMin = 0,
        xCenter = xMax / 2;

      return (
        React.createElement("svg", {width: this.props.width, height: this.props.height}, 
          React.createElement("g", {transform: transform, style: this.props.style}, 
            /* <line
                            key="tick-low"
                            x1={ xMin } x2={ xMax }
                            y1={ stats.whiskerLow } y2={ stats.whiskerLow }
                            strokeWidth={ this.props.whiskerStrokeWidth / horizScaleFactor }
                            style={ Object.assign({}, this.props.tickStyle, {
              stroke: stats.whiskerLow > 0 ? "red" : "green"
            })
 } /> */
            React.createElement("line", {
              key: "whisker-low", 
              x1: xCenter, 
              x2: xCenter, 
              y1: stats.whiskerLow, 
              y2: stats.quartile1, 
              strokeWidth: this.props.whiskerStrokeWidth / vertScaleFactor + 1, 
              style: this.props.whiskerStyle}
            ), 
            React.createElement("rect", {
              key: "box", 
              x: xMin, 
              width: xMax - xMin, 
              y: stats.quartile1, 
              height: stats.quartile3 - stats.quartile1, 
              strokeWidth: "0", 
              style: this.props.boxStyle}
            ), 
            /* <line
                            key="median"
                            x1={ xMin } x2={ xMax }
                            y1={ stats.quartile2 } y2={ stats.quartile2 }
                            strokeWidth={ this.props.medianStrokeWidth / horizScaleFactor }
                            style={ this.props.medianStyle } /> */
            React.createElement("line", {
              key: "whisker-high", 
              x1: xCenter, 
              x2: xCenter, 
              y1: stats.whiskerHigh, 
              y2: stats.quartile3, 
              strokeWidth: this.props.whiskerStrokeWidth / vertScaleFactor + 1, 
              style: this.props.whiskerStyle}
            ), 
            /* <line
                            key="tick-high"
                            x1={ xMin } x2={ xMax }
                            y1={ stats.whiskerHigh } y2={ stats.whiskerHigh }
                            strokeWidth={ this.props.whiskerStrokeWidth / horizScaleFactor }
                            style={ Object.assign({}, this.props.tickStyle, {
              stroke: stats.whiskerHigh > 0 ? "red" : "green"
            })
 } /> */
            _(stats.outliers).map(function(outlier, index) {
              return (
                React.createElement("ellipse", {
                  key: "outlier-" + index, 
                  cx: xCenter, 
                  cy: outlier, 
                  rx: component.props.outlierRadius / vertScaleFactor, 
                  ry: component.props.outlierRadius / horizScaleFactor, 
                  strokeWidth: "0", 
                  style: component.props.outlierStyle}
                )
              );
            })
          )
        )
      );
    }
  });

  return Boxplot;
});
