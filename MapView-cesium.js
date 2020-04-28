document.write('<script src="Cesium_detail.js" type="text/javascript" charset="utf-8"></script>');

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MGM5OGQwNC02OTY1LTRiODEtOTE1OS1jMGM3OTM3NjBjMWMiLCJpZCI6MTE0NzcsInNjb3BlcyI6WyJhc2wiLCJhc3IiLCJhc3ciLCJnYyJdLCJpYXQiOjE1NzUzODA0ODB9.QbHMMoPNMinypYR7FHgzvOqeu6GrOILiuhc4ulhL6oI'
var viewer = new Cesium.Viewer('cesiumContainer',{
    animation: false,
    timeline: false,
    sceneModePicker: false,
    geocoder: false,
    homeButton: false,
    navigationHelpButton:false,
    fullscreenButton: false,
    baseLayerPicker:false
});
viewer._cesiumWidget._creditContainer.style.display="none";

//加载天地图影像图层
var layer= new Cesium.WebMapTileServiceImageryProvider({
    url: 'http://t0.tianditu.gov.cn/img_w/wmts?tk=ebf64362215c081f8317203220f133eb',
    layer:'img',
    style:'default',
    tileMatrixSetID:'w',
    format:'tiles',
    maximumLevel: 18
});
viewer.imageryLayers.addImageryProvider( layer );

//加载注记图层
var layer1= new Cesium.WebMapTileServiceImageryProvider({
    url: 'http://t0.tianditu.gov.cn/cia_w/wmts?tk=ebf64362215c081f8317203220f133eb',
    layer:'cia',
    style:'default',
    tileMatrixSetID:'w',
    format:'tiles',
    maximumLevel: 18
});
viewer.imageryLayers.addImageryProvider( layer1 );

//加载地形图
viewer.terrainProvider = Cesium.createWorldTerrain();
viewer.scene.globe.enableLighting = true;
//加载GeoJsonData
function GeoJsonData(){
    var dataSource = Cesium.GeoJsonDataSource.load('geo2.json');
    viewer.dataSources.add(dataSource);
    viewer.flyTo(dataSource,{
        duration:2.0,
        maximumHeight:50000,
        offset:new Cesium.HeadingPitchRange(Cesium.Math.toRadians(0), Cesium.Math.toRadians(-60), Cesium.Math.toRadians(0))
    });
}

/*
let elem1 = document.getElementsByClassName("toolLargeDivStyle");
    for (let i=0; i<elem1.length; i++){
        elem1[i].onmouseover=function(){this.style="background-color:grey"};
        elem1[i].onmouseout=function(){this.style="background-color:white"};
    };

let elem2 = document.getElementsByClassName("toolSmallDivStyle");
    for (let i=0; i<elem2.length; i++){
        elem2[i].onmouseover=function(){this.style="background-color:grey"};
        elem2[i].onmouseout=function(){this.style="background-color:white"};
    };
*/

$(document).ready(function(){
    $(".toolLargeDivStyle").click(function(){
        $(this).siblings("*").toggle();
    });
    $(".toolLargeDivStyle").mouseover(function(){
        $(this).css("background-color","grey");
    });
    $(".toolLargeDivStyle").mouseout(function(){
        $(this).css("background-color","white");
    });
    $(".toolSmallDivStyle").mouseover(function(){
        $(this).css("background-color","grey");
    });
    $(".toolSmallDivStyle").mouseout(function(){
        $(this).css("background-color","white");
    })
});
