
var geo2svg = require('../geo2svg');
var option = {
    size: [256, 256],
    padding: [10, 10, 10, 10],
    output: 'string',
    precision: 3,
    stroke: 'red',
    strokeWidth: '1px',
    background: '#fff',
    fill: '#fff',
    fillOpacity: 1
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
