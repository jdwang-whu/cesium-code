var lastStage=null;
//天气————下雨效果
function Rain() {
    return "uniform sampler2D colorTexture;\n\
    varying vec2 v_textureCoordinates;\n\
\n\
    float hash(float x){\n\
        return fract(sin(x*133.3)*13.13);\n\
}\n\
\n\
void main(void){\n\
\n\
    float time = czm_frameNumber / 100.0;\n\
vec2 resolution = czm_viewport.zw;\n\
\n\
vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
vec3 c=vec3(.6,.7,.8);\n\
\n\
float a=-.4;\n\
float si=sin(a),co=cos(a);\n\
uv*=mat2(co,-si,si,co);\n\
uv*=length(uv+vec2(0,4.9))*.3+1.;\n\
\n\
float v=1.-sin(hash(floor(uv.x*100.))*2.);\n\
float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*12.;\n\
c*=v*b; \n\
\n\
gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5);  \n\
}\n\
";
}
function Rain_weather(){
    remove_Stage();
    var collection = viewer.scene.postProcessStages;
    var Cesium_rain = Rain();
    var rain = new Cesium.PostProcessStage({
        name: 'czm_rain',
        fragmentShader: Cesium_rain
    });
    collection.add(rain);
    lastStage=rain;
    viewer.scene.skyAtmosphere.hueShift = -0.8;
    viewer.scene.skyAtmosphere.saturationShift = -0.7;
    viewer.scene.skyAtmosphere.brightnessShift = -0.33;
    viewer.scene.fog.density = 0.001;
    viewer.scene.fog.minimumBrightness = 0.8;

}

//天气————下雪效果
function Snow() {
    return "uniform sampler2D colorTexture;\n\
varying vec2 v_textureCoordinates;\n\
\n\
float snow(vec2 uv,float scale)\n\
{\n\
float time = czm_frameNumber / 60.0;\n\
float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
return k*w;\n\
}\n\
\n\
void main(void){\n\
vec2 resolution = czm_viewport.zw;\n\
vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
vec3 finalColor=vec3(0);\n\
float c = 0.0;\n\
c+=snow(uv,30.)*.0;\n\
c+=snow(uv,20.)*.0;\n\
c+=snow(uv,15.)*.0;\n\
c+=snow(uv,10.);\n\
c+=snow(uv,8.);\n\
c+=snow(uv,6.);\n\
c+=snow(uv,5.);\n\
finalColor=(vec3(c)); \n\
gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.5); \n\
\n\
}\n\
";
}
function Snow_weather(){
    remove_Stage();
    var collection = viewer.scene.postProcessStages;
    var Cesium_snow = Snow();
    var snow = new Cesium.PostProcessStage({
        name: 'czm_rain',
        fragmentShader: Cesium_snow
    });
    collection.add(snow);
    lastStage=snow;
    viewer.scene.skyAtmosphere.hueShift = -0.8;
    viewer.scene.skyAtmosphere.saturationShift = -0.7;
    viewer.scene.skyAtmosphere.brightnessShift = -0.33;
    viewer.scene.fog.density = 0.001;
    viewer.scene.fog.minimumBrightness = 0.8;
}

//移除天气
function remove_Stage() {
    if(lastStage!= null){
        viewer.scene.postProcessStages.remove(lastStage);
        lastStage = null
    }
}

//水面shader
var waterPrimitive = new Cesium.Primitive({
    //show:false,// 默认隐藏
    allowPicking:false,
    geometryInstances : new Cesium.GeometryInstance({
        geometry : new Cesium.PolygonGeometry({
            polygonHierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights([126,30,0,126,27,0,123,27,0,123,30,0])),//需要渲染的范围
            extrudedHeight: 0,//拉伸的高度
            perPositionHeight : false
        })
    }),
    // 可以设置内置的水面shader
    appearance : new Cesium.EllipsoidSurfaceAppearance({
        material : new Cesium.Material({
            fabric : {
                type : 'Water',
                uniforms : {
                    //baseWaterColor:new Cesium.Color(0.0, 0.0, 1.0, 0.5),
                    //blendColor: new Cesium.Color(0.0, 0.0, 1.0, 0.5),
                    normalMap: 'image/waterNormals.jpg',
                    frequency: 1000.0,
                    animationSpeed: 0.02,
                    amplitude: 15.0
                }
            }
        }),
        fragmentShaderSource:'varying vec3 v_positionMC;\nvarying vec3 v_positionEC;\nvarying vec2 v_st;\nvoid main()\n{\nczm_materialInput materialInput;\nvec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));\n#ifdef FACE_FORWARD\nnormalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);\n#endif\nmaterialInput.s = v_st.s;\nmaterialInput.st = v_st;\nmaterialInput.str = vec3(v_st, 0.0);\nmaterialInput.normalEC = normalEC;\nmaterialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);\nvec3 positionToEyeEC = -v_positionEC;\nmaterialInput.positionToEyeEC = positionToEyeEC;\nczm_material material = czm_getMaterial(materialInput);\n#ifdef FLAT\ngl_FragColor = vec4(material.diffuse + material.emission, material.alpha);\n#else\ngl_FragColor = czm_phong(normalize(positionToEyeEC), material);\
                                gl_FragColor.a=0.9;\n#endif\n}\n'//重写shader，修改水面的透明度
    })
});
viewer.scene.primitives.add(waterPrimitive);
viewer.flyTo(waterPrimitive,{
    duration:2.0,
    maximumHeight:10000,
    offset:new Cesium.HeadingPitchRange(Cesium.Math.toRadians(0), Cesium.Math.toRadians(-90), Cesium.Math.toRadians(0))
});

//加载钻井平台模型
var modelMatrix_zjpt = Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(124,28.5,-2000)
)
var zjpt_model = viewer.scene.primitives.add(Cesium.Model.fromGltf({
    url:'ModelData/zjpt.gltf',
    modelMatrix: modelMatrix_zjpt,
    scale : 200
}));

//加载黄金梅利号
var modelMatrix_meili = Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(125,28.5,-1000)
)
var meili_model = viewer.scene.primitives.add(Cesium.Model.fromGltf({
    url:'ModelData/meili.gltf',
    modelMatrix: modelMatrix_meili,
    scale : 500
}));

//加载立方体
function Entity(){
    var box2 = viewer.entities.add({
        id:'1234',
        name:'another example',
        position: Cesium.Cartesian3.fromDegrees(125.0,40.0,400000.0),
        box:{
            dimensions: new Cesium.Cartesian3(400000.0,300000.0,500000.0),
            material:Cesium.Color.RED.withAlpha(0.5),
            outline:true,
            outlineColor: Cesium.Color.BLACK
        }
    })
    var box = viewer.entities.add({
        id:'123',
        name: 'example',
        position: Cesium.Cartesian3.fromDegrees(120.0,35.0,400000.0),
        box:{
            dimensions: new Cesium.Cartesian3(400000.0,300000.0,500000.0),
            material:Cesium.Color.RED.withAlpha(0.5),
            outline:true,
            outlineColor: Cesium.Color.BLACK
        },
        description : '\
        <img\
          width="50%"\
          style="float:left; margin: 0 1em 1em 0;"\
          src="//cesiumjs.org/images/2015/02-02/Flag_of_Wyoming.svg"/>\
        <p>\
          Wyoming is a state in the mountain region of the Western \
          United States.\
        </p>\
        <p>\
          Wyoming is the 10th most extensive, but the least populous \
          and the second least densely populated of the 50 United \
          States. The western two thirds of the state is covered mostly \
          with the mountain ranges and rangelands in the foothills of \
          the eastern Rocky Mountains, while the eastern third of the \
          state is high elevation prairie known as the High Plains. \
          Cheyenne is the capital and the most populous city in Wyoming, \
          with a population estimate of 62,448 in 2013.\
        </p>\
        <p>\
          Source: \
          <a style="color: WHITE"\
            target="_blank"\
            href="http://en.wikipedia.org/wiki/Wyoming">Wikpedia</a>\
        </p>'
    })
    viewer.zoomTo(viewer.entities);
}

//加载3Dtiles数据
function _3Dtiles(){
    var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url: 'cesium/Apps/SampleData/Cesium3DTiles/Tilesets/Tileset/tileset.json',
        maximumScreenSpaceError: 2,
        maximumNumberOfLoadedTiles: 100,
    }));
    viewer.zoomTo(tileset);
}
//选中实体
var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function (movement) {
    var pick = viewer.scene.pick(movement.position);
    if (Cesium.defined(pick) && (pick.id)) {
        console.log("Successul Pick!");
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);