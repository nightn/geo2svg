/**
 * geo2svg.js
 * author: nightn
 * description: convert geojson to svg string or svg element given size, padding, style etc.
 * the Geojson object can be any one of the nine objects which are defined in RFC7946:
 *   Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon,
 *   GeometryCollection, Feature, FeatureCollection
 */

(function () {

    const defaultOption = {
        size: [256, 256],                // size[0] is svg width, size[1] is svg height
        padding: [0, 0, 0, 0],           // paddintTop, paddintRight, paddingBottom, paddingLeft, respectively
        output: 'string',                // output type: 'string'|'element'
        precision: 3,                    // svg coordinates precision
        stroke: 'red',                   // stroke color
        strokeWidth: '1px',              // stroke width
        background: '#fff',              // svg background color, and as the fill color of polygon hole
        fill: '#fff',                    // fill color
        fillOpacity: 1,                  // fill opacity
        radius: 5                        // only for `Point`, `MultiPoint`
    };

    const svg = {};

    svg.style = function (svgStr, option) {
        const { fill, fillOpacity, stroke, strokeWidth } = option;
        const styles = [svgStr.split('/>')[0]];
        styles.push(`fill="${fill}"`);
        styles.push(`fill-opacity="${fillOpacity}"`);
        styles.push(`stroke="${stroke}"`);
        styles.push(`stroke-width="${strokeWidth}"`);
        return (styles.join(' ') + ' />');
    }

    svg.createCircle = function (point, option) {
        let [x, y] = point;
        let { radius, precision } = option;
        let svgStr = `<circle cx="${x.toFixed(precision)}" cy="${y.toFixed(precision)}" r="${radius.toFixed(precision)}" />`;
        return svg.style(svgStr, option);
    }

    svg.createPath = function (points, option) {
        let p = option.precision;
        // firefox cannot use common as splitor, so use space
        let pathd = points.map((pt, index) => {
            return `${index === 0 ? 'M' : 'L'}${pt[0].toFixed(p)} ${pt[1].toFixed(p)}`;
        }).join(' ');
        let svgStr = `<path d="${pathd}" />`;
        return svg.style(svgStr, option);
    }

    // parse svg string to svg element
    svg.parseSVG = function (s) {
        let div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
        div.innerHTML = s;
        let frag = document.createDocumentFragment();
        while (div.firstChild)
            frag.appendChild(div.firstChild);
        return frag;
    }

    function getExtent(points) {
        let extent = [Infinity, Infinity, -Infinity, -Infinity];
        points.forEach(pt => {
            let [x, y] = pt;
            if (x < extent[0]) extent[0] = x;
            if (x > extent[2]) extent[2] = x;
            if (y < extent[1]) extent[1] = y;
            if (y > extent[3]) extent[3] = y;
        });
        return extent;
    }

    // get all points from geojson object
    function getAllPoints(geojson) {
        // get all points from geojson object
        switch (geojson.type) {
            case 'Point': {
                return [geojson.coordinates];
            }
            case 'MultiPoint':
            case 'LineString': {
                return geojson.coordinates;
                break;
            }
            case 'MultiLineString':
            case 'Polygon': {
                let pointsArr = geojson.coordinates;
                return pointsArr.reduce((prev, item) => prev.concat(item), pointsArr[0]);
            }
            case 'MultiPolygon': {
                let multiArr = geojson.coordinates;
                let arr = multiArr.reduce((prev, item) => prev.concat(item), multiArr[0]);
                return arr.reduce((prev, item) => prev.concat(item), arr[0]);
            }
            case 'GeometryCollection': {
                let geometries = geojson.geometries;
                let pointsArr = geometries.map(geom => getAllPoints(geom));
                return pointsArr.reduce((prev, item) => prev.concat(item), pointsArr[0]);
            }
            case 'Feature': {
                return getAllPoints(geojson.geometry);
            }
            case 'FeatureCollection': {
                let features = geojson.features;
                let pointsArr = features.map(feature => getAllPoints(feature));
                return pointsArr.reduce((prev, item) => prev.concat(item), pointsArr[0]);
            }
        }
    }

    function geoPointToPixelPoint(pt, geometrySize, xRes, yRes, res, extent, origin, padding) {
        let paddingLeft = padding[3];
        let paddingTop = padding[0];
        let [geometryWidth, geometryHeight] = geometrySize;
        let x = (pt[0] - origin[0]) / res + paddingLeft;
        // y direction of svg coord system is different from geojson's 
        let y = geometryHeight - (pt[1] - origin[1]) / res + paddingTop;
        // adjust shape in the middle of svg element
        if (xRes > yRes) {
            let dy = (geometryHeight - (extent[3] - extent[1]) / res) / 2;
            y = y - dy;
        } else {
            let dx = (geometryWidth - (extent[2] - extent[0]) / res) / 2;
            x = x + dx;
        }
        return [x, y]
    }

    // converter
    const converter = {};
    /**
     * 
     * @param {Array[]} points 
     * @param {string} basicGeometryType 取值 'Point' | 'LineString' | 'Polygon'
     * @param {Object} option
     * @return {string}
     */
    converter.convertBasicGeometry = function (points, basicGeometryType, option) {
        switch (basicGeometryType) {
            case 'Point': {
                return svg.createCircle(points[0], option);
            }
            case 'LineString': {
                return svg.createPath(points, option);
            }
            case 'Polygon': {
                return svg.createPath(points, option);
            }
        }
    }

    converter.getCommonOpt = function (geojson, option) {
        let [svgWidth, svgHeight] = option.size;
        let [paddingTop, paddingRight, paddingBottom, paddingLeft] = option.padding;
        let geometryWidth = svgWidth - paddingLeft - paddingRight;
        let geometryHeight = svgHeight - paddingTop - paddingBottom;
        // get the extent
        let extent = getExtent(getAllPoints(geojson));
        // calculate resolution
        let xRes = (extent[2] - extent[0]) / geometryWidth;  // x resolution
        let yRes = (extent[3] - extent[1]) / geometryHeight; // y resolution
        let res = (xRes > yRes ? xRes : yRes);              // max resolution

        let commonOpt = {
            xRes: xRes,
            yRes: yRes,
            res: res,
            extent: extent,
            origin: [extent[0], extent[1]],
            geometrySize: [geometryWidth, geometryHeight]
        }
        return commonOpt;
    }

    converter.convertPoint = function (geojson, option, commonOpt) {
        let { xRes, yRes, res, extent, origin, geometrySize } = commonOpt;
        let center = geoPointToPixelPoint(geojson.coordinates, geometrySize, xRes, yRes, res, extent, origin, option.padding);
        return svg.createCircle(center, option);
    }

    converter.convertMultiPoint = function (geojson, option, commonOpt) {
        let { xRes, yRes, res, extent, origin, geometrySize } = commonOpt;
        // callers are supposed to set reasonable padding themselves.
        // option.padding = option.padding.map(item => item + radius);  // comment it
        let svgStr = geojson.coordinates
            // map geographical point to pixel point
            .map(pt => {
                return geoPointToPixelPoint(pt, geometrySize, xRes, yRes, res, extent, origin, option.padding);
            })
            // map pixel point to svg string
            .map(pt => svg.createCircle(pt, option))
            .join('');
        return svgStr;
    }

    converter.convertLineString = function (geojson, option, commonOpt) {
        let { xRes, yRes, res, extent, origin, geometrySize } = commonOpt;
        let coords = (Array.isArray(geojson) ? geojson : geojson.coordinates);
        let pixelPoints = coords.map(pt => {
            return geoPointToPixelPoint(pt, geometrySize, xRes, yRes, res, extent, origin, option.padding);
        });
        // [Important] change linestring fill opacity, using a copy of option
        let optionForLineString = {};
        Object.assign(optionForLineString, option);
        optionForLineString.fillOpacity = 0;
        return svg.createPath(pixelPoints, optionForLineString);
    }

    converter.convertMultiLineString = function (geojson, option, commonOpt) {
        return geojson.coordinates.map(points => {
            return converter.convertLineString(points, option, commonOpt);
        }).join('');
    }

    converter.convertPolygon = function (geojson, option, commonOpt) {
        let { xRes, yRes, res, extent, origin, geometrySize } = commonOpt;
        let coords = (Array.isArray(geojson) ? geojson : geojson.coordinates);

        // option for inner polygon
        let optionForInner = {};
        Object.assign(optionForInner, option);
        optionForInner.fill = option.background;
        optionForInner.fillOpacity = 1;

        return coords.map((points, index) => {
            let pixelPoints = points.map(pt => geoPointToPixelPoint(pt, geometrySize, xRes, yRes, res, extent, origin, option.padding));
            // the first polygon is outer polygon
            if (index == 0 || Array.isArray(geojson)) {
                return svg.createPath(pixelPoints, option);
            }
            // the others are inner polygon, so change their fill style
            return svg.createPath(pixelPoints, optionForInner);
        }).join('');
    }

    converter.convertMultiPolygon = function (geojson, option, commonOpt) {
        return geojson.coordinates.map((points, index) => {
            return converter.convertPolygon(points, option, commonOpt);
        }).join('');
    }

    converter.convertGeometryCollection = function (geojson, option, commonOpt) {
        let geoms = geojson.geometries;
        return geoms.map(geom => {
            let funcName = `convert${geom.type}`;
            return converter[funcName](geom, option, commonOpt);
        }).join('');
    }

    converter.convertFeature = function (geojson, option, commonOpt) {
        let geom = geojson.geometry;
        let funcName = `convert${geom.type}`;
        return converter[funcName](geom, option, commonOpt);
    }

    converter.convertFeatureCollection = function (geojson, option, commonOpt) {
        let features = geojson.features;
        return features.map(feature => {
            return converter.convertFeature(feature, option, commonOpt);
        }).join('');
    }

    const geo2svg = function (geojson, option) {
        const type = geojson.type;
        let funcName = 'convert' + type;
        if (!converter[funcName]) {
            throw new Error('The type of input object is not supported.');
        }
        let commonOpt = converter.getCommonOpt(geojson, option);
        // init option
        option = option || {};
        for (let key in defaultOption) {
            option[key] = option[key] || defaultOption[key];
        }
        let fullSvgStr = '<svg xmlns="http://www.w3.org/2000/svg" style="background:' + option.background + '" width="' + option.size[0] + '" height="' + option.size[1] + '" >';
        let convert = converter[funcName];

        // handle one point
        // TODO more complicated situation
        if (type === 'Point' || 
           (type === 'GeometryCollection' && geojson.geometries.length === 1 && geojson.geometries[0].type === 'Point') ||
           (type === 'FeatureCollection' && geojson.features.length === 1 
            && geojson.features[0].geometry.type === 'Point' )) {
            convert = (geojson, option, commonOpt) => {
                let { xRes, yRes, res, extent, origin, geometrySize } = commonOpt;
                let [paddingTop, paddingRight, paddingBottom, paddingLeft] = option.padding;
                let center = [paddingLeft + geometrySize[0] / 2, paddingTop + geometrySize[1] / 2];
                return svg.createCircle(center, option);
            }
        }

        let svgContent = convert(geojson, option, commonOpt);
        fullSvgStr += svgContent;
        fullSvgStr += '</svg>';
        let fullSvg = fullSvgStr;
        if (option.output == 'element') {
            fullSvg = svg.parseSVG(fullSvgStr);
        }
        return fullSvg;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = geo2svg;
    }

    if (typeof window !== 'undefined') {
        window.geo2svg = geo2svg;
    }
})();
