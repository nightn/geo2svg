var geo2svg = require('../geo2svg');

var option = {
    size: [512, 512],           // size[0] is svg width, size[1] is svg height
    padding: [10, 10, 10, 10],  // paddingTop, paddingRight, paddingBottom, paddingLeft, respectively
    output: 'string',           // output type: 'string' | 'element'(only supported in browser)
    precision: 3,               // svg coordinates precision
    stroke: 'red',              // stroke color
    strokeWidth: '2px',         // stroke width
    background: '#ccc',         // svg background color, and as the fill color of polygon hole
    fill: 'green',              // fill color
    fillOpacity: 0.5,           // fill opacity
    radius: 5                   // only for `Point`, `MultiPoint`
};
var geojson = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [120.12159347534178, 30.260105112263386],
                        [120.12639999389648, 30.23178108955747],
                        [120.15111923217772, 30.231632774762375],
                        [120.16056060791016, 30.25194981710498],
                        [120.14373779296875, 30.266480598629396],
                        [120.12159347534178, 30.260105112263386]
                    ]
                ]
            }
        }
    ]
};
var svgStr = geo2svg(geojson, option);
console.log(svgStr);
