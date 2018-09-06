# geo2svg

[English README](https://github.com/nightn/geo2svg/blob/master/README.md)

[geo2svg](https://github.com/nightn/geo2svg) 是一个非常小巧的 JavaScript 库，用于将 geojson 对象转为 svg 字符串或 svg 元素，你可以指定很多自定义的转换参数，比如尺寸、padding、样式等。一般来说，geojson 对象可以是定义在 [RFC7946](https://tools.ietf.org/html/rfc7946) 中的以下 9 种对象之一：`Point`, `LineString`, `Polygon`, `MultiPoint`, `MultiLineString`, `MultiPolygon`, `GeometryCollection`, `Feature` and `FeatureCollection`。不过目前为止，只支持 `Polygon` 和 `MultiPolygon`，以及仅由 `Polygon` 组成的 `GeometryCollection` 和 `FeatureCollection` 。

你可以访问这个 [demo](http://nightn.com/demo/geo2svg/), 来查看在线示例。

## 安装

浏览器：

```html
<script src="geo2svg.js"></script>
```

Node.js：

```shell
$ npm install --save geo2svg
```

```javascript
// Load the geo2svg
var geo2json = require('geo2svg');
```

## 使用 geo2svg

```javascript
var option = {
    size: [256, 256],           // size[0] 是 svg 宽度, size[1] 是 svg 高度
    padding: [10, 10, 10, 10],  // 分别表示 paddingTop, paddingRight, paddingBottom, paddingLeft
    output: 'string',           // 输出类型: 'string' | 'element'(仅在浏览器支持)
    precision: 3,               // svg 坐标精度
    stroke: 'red',              // 边框颜色
    strokeWidth: '1px',         // 边框尺寸
    background: '#fff',         // svg 背景颜色，也作为多边形中间空洞的填充颜色
    fill: '#fff',               // 填充颜色
    fillOpacity: 1              // 填充透明度
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
// 输出的 svgStr 如下：
// <svg xmlns="http://www.w3.org/2000/svg" style="background:#fff" width="256" height="256" ><path d="M10.000 61.087,L39.110 232.628,L188.819 233.526,L246.000 110.478,L144.115 22.474,L10.000 61.087"  fill="#fff" fill-opacity="1" stroke="red" stroke-width="1px"/></svg>
```

## Bugs

如果有任何 bug 或新特性需求，欢迎在  [GitHub issue tracker](https://github.com/nightn/geo2svg/issues)  提 issue。

