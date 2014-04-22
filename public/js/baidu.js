// 百度地图API功能
/*
var map = new BMap.Map("l-map");            // 创建Map实例
map.centerAndZoom(new BMap.Point(116.404, 39.915), 12);

var transit = new BMap.TransitRoute(map, {
    renderOptions: {map: map, panel: "r-result"}
});
transit.search("王府井", "西单");
*/




var map = new BMap.Map("allmap");            // 创建Map实例
map.centerAndZoom(new BMap.Point(116.404, 39.915), 12);
var p1 = new BMap.Point(116.301934,39.977552);
var p2 = new BMap.Point(116.508328,39.919141);
var transit = new BMap.TransitRoute(map, {
    renderOptions: {panel: "r-result"}
});
transit.search(p1, p2);