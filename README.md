# geo2svg

[Simplified Chinese (简体中文) README](https://github.com/nightn/geo2svg/blob/master/README-zh.md)

[geo2svg](https://github.com/nightn/geo2svg) is a tiny JavaScript library for converting geojson object to svg string or svg element given your options including size, padding, style etc. Generally, the geojson object can be any one of the nice objects defined in [RFC7946](https://tools.ietf.org/html/rfc7946):  `Point`, `LineString`, `Polygon`, `MultiPoint`, `MultiLineString`, `MultiPolygon`, `GeometryCollection`, `Feature` and `FeatureCollection`. 

To examine the demo online, please visit this [demo](http://nightn.com/demo/geo2svg/).

## Installation

In a browser:

```html
<script src="geo2svg.js"></script>
```

In Node.js:

```shell
$ npm install --save geo2svg
```

```javascript
// Load the geo2svg
var geo2json = require('geo2svg');
```

## Use geo2svg

```javascript
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
// Then you will get this:
// <svg xmlns="http://www.w3.org/2000/svg" style="background:#ccc" width="512" height="512" ><path d="M10.000 116.502,L70.687 474.122,L382.793 475.995,L502.000 219.471,L289.595 36.005,L10.000 116.502"  fill="green" fill-opacity="0.5" stroke="red" stroke-width="2px" /></svg>
```

## Bugs

Please use the [GitHub issue tracker](https://github.com/nightn/geo2svg/issues) for all bugs and feature requests.

