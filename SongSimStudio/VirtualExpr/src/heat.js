//index.js
var scene = new THREE.Scene();
var flowTexture,curve,curves=[],flows=[],buoy;
var camera,renderer,labelRenderer;
var progress=0;
var startExperiment=true;
var flowDir=1;
var BernoulliFlow=false;
var waterTank,valveOut,valveIn,inflow,outflow,waterBin;
var selectedObject = null;// this objects is hovered at the moment
var pumpSwitch,groupMisc;
var raycaster = new THREE.Raycaster();
// this will be 2D coordinates of the current mouse position, [0,0] is middle of the screen.
var mouseVector = new THREE.Vector3();
var latestMouseProjection; // this is the latest projection of the mouse on object (i.e. intersection with ray)

var resultTag;

groupMisc = new THREE.Group();
scene.add( groupMisc );

var labID=0;
var speeds=[0.5,1,1.5];
var speed=speeds[1];
const workPlaneZ=20;
const hiddenPlaneZ=-100000;

addLights();
addCameras();
addSpriteButtons();
addMisc();
loadTexture();
addWaterPipe();
addWaterPointer();
addWorkSpace();
addDesktop();
addMeters();
addControllers();

render();

function render() {
    renderer.render(scene, camera);
    labelRenderer.render( scene, camera );
    requestAnimationFrame(render);

    if(startExperiment){
        BernoulliFlow=true;
    }else{
        BernoulliFlow=false;
    }

    if(BernoulliFlow){
        flowTexture.offset.x -= 0.05*speed*flowDir;

        if(progress>1.0){
            progress=0;
        }
        if(progress<0){
            progress=1;
        }

        progress += 0.0009*speed;

        if(curve){
            let point = curve.getPoint(progress);
            if(point&&point.x){
                buoy.position.set(point.x,point.y,point.z);
            }
        }
    }
}

function addWorkSpace(){
    valveOut=new Valve(0,0,10,5,0.7);
    //scene.add(valveOut.obj);
    valveOut.obj.position.set(121, -15, 12);

    valveIn=new Valve(0,0,10,5,0.7);
    //scene.add(valveIn.obj);
    valveIn.obj.position.set(-155,125,13);
}

function addWaterPipe(){
    var xs=[-120, -105, -90, -75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75, 90, 105, 120, 131.777128, 140.64554, 141.487596, 133.448721, 121.955656, 107.015039, 92.015039, 77.015039, 62.015039, 47.015039, 32.015039, 17.015039, 2.015039, -12.984961, -27.984961, -42.984961, -57.984961, -72.984961, -87.984961, -102.984961, -117.984961, -130.572774, -139.937302, -141.937988, -134.571805, -123.304269, -108.480145, -93.480145, -78.480145, -63.480145, -48.480145, -33.480145, -18.480145, -3.480145, 11.519855, 26.519855, 41.519855, 56.519855, 71.519855, 86.519855, 101.519855, 116.519855, 129.621722, 139.329473, 142.200504, 135.412534, 124.337361, 109.649936, 94.649936, 79.649936, 64.649936, 49.649936, 34.649936, 19.649936, 4.649936, -10.350064, -25.350064, -40.350064, -55.350064, -70.350064, -85.350064, -100.350064, -115.350064, -128.817364, -138.786898, -142.358198, -136.091958, -125.190365, -110.650502, -95.650502, -80.650502, -65.650502, -50.650502, -35.650502, -20.650502, -5.650502, 9.349498, 24.349498, 39.349498, 54.349498, 69.349498, 84.349498, 99.349498, 114.349498, 128.097965, 138.282202, 142.44955, 136.674904, 125.937747, 111.555713, 96.555713, 81.555713, 66.555713, 51.555713, 36.555713, 21.555713, 6.555713, -8.444287, -23.444287, -38.444287, -53.444287, -68.444287, -83.444287, -98.444287, -113.444287];
    var ys=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8.157632, 19.87538, 34.741357, 47.808083, 57.709732, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 66.60544, 77.812955, 92.381614, 106.010049, 116.313217, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120];
    var zs=[60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 50.71026, 38.612688, 23.636342, 10.972358, 1.333403, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7.303499, 18.738514, 33.46119, 46.837417, 56.953767, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 54.001696, 42.988916, 28.579432, 14.735536, 4.261117, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var pList=[];
    for(var i=0;i<xs.length;i++){
        var p=new THREE.Vector3(xs[i],ys[i]-45,zs[i]);
        pList.push(p);
    }
    curves[0]=new THREE.CatmullRomCurve3(pList);
    flows[0]=new WaterPipe(curves[0],2,4,true,flowTexture,'black',true);
    scene.add(flows[0].obj);
    curve=curves[0];
}

function addWaterPointer(){
    var buoyGeo = new THREE.SphereGeometry(5,16,16);
    var buoyMtrl = new THREE.MeshBasicMaterial( { color: 0x00ff00 ,side:THREE.DoubleSide} );
    buoy = new THREE.Mesh( buoyGeo, buoyMtrl );
    scene.castShadow=true;
    scene.add( buoy );

    buoy.position.set(121, -25, 20);
    resultTag=createTag("外管流动",10,buoy);
}

function addDesktop(){
    {
        var geometry = new THREE.PlaneGeometry(350, 150);
        var material = new THREE.MeshBasicMaterial({color: 0xcccccc,side: THREE.DoubleSide});
        //material.map=new THREE.TextureLoader().load("img/BBoard.jpg");
        var vPlane = new THREE.Mesh(geometry, material);
        vPlane.position.set(0, -4, -24);
        scene.add(vPlane);
    }
    {
        var geometry = new THREE.PlaneGeometry( 350, 100,);
        var material = new THREE.MeshBasicMaterial( {color: 0x666666,side: THREE.DoubleSide} );
        material.map=new THREE.TextureLoader().load("img/desktop.jpg");
        var hPlane = new THREE.Mesh( geometry, material );
        hPlane.position.set(0, -72, 20);
        hPlane.rotation.x=Math.PI/2.0;
        scene.add( hPlane );
    }

    pumpSwitch=new ToggleButton("pumpSwitch");
    pumpSwitch.obj.position.set(150,50,0);
    pumpSwitch.obj.userData.tooltipText="PowerSupply";
    groupMisc.add(pumpSwitch.obj);
    createTag("流动方向切换",10,pumpSwitch.obj);
}

function addMeters(){
}

function loadTexture(){
    var textureLoader = new THREE.TextureLoader();
    flowTexture = textureLoader.load('img/flowLike.png');

    flowTexture.wrapS = THREE.RepeatWrapping;
    flowTexture.wrapT=THREE.RepeatWrapping;

    flowTexture.repeat.x = 100;
}

function onMouseClick (event ) {
    console.log("RayCast fired!");
    event.preventDefault();
    if ( selectedObject ) {
        selectedObject = null;
        latestMouseProjection=null;
    }

    var intersects = getIntersects( event.layerX, event.layerY );
    if ( intersects.length > 0 ) {
        var res = intersects.filter( function ( res ) {
            return res && res.object;
        } )[ 0 ];
        if ( res && res.object ) {
            selectedObject = res.object;
            latestMouseProjection = res.point;
            buttonProcesser(selectedObject);
        }
    }
}

function getIntersects( x, y ) {
    x = ( x / window.innerWidth ) * 2 - 1;
    y = - ( y / window.innerHeight ) * 2 + 1;

    mouseVector.set( x, y, 0.5 );
    raycaster.setFromCamera( mouseVector, camera );

    return raycaster.intersectObject( groupMisc, true );
}

function buttonProcesser(selectedObject){
    var name=selectedObject.name;

    if(name=="pumpSwitch"){
        if(pumpSwitch.toggle()){
            valveIn.open();
            flowDir=1;
        }else{
            valveIn.close();
            flowDir=-1;
        }
    }

    if(name.substr(0,3)=="lab") {
        labID = parseInt(name.substr(3, 1));
        curve = curves[labID];
        console.info("labID->", labID, " is selected!");
        for (var i = 0; i < 3; i++) {
            if (i == labID) {
                flows[i].obj.position.z = 0;
            } else {
                flows[i].obj.position.z = hiddenPlaneZ;
            }
        }
        resultTag.textContent=results[labID];
    }
    if(name.substr(0,3)=="spd"){
        speedID=parseInt(name.substr(3,1));
        speed=speeds[speedID];
        console.info("speed->",speed," is selected!");
    }
}

function addLights(){
    var dLight = new THREE.DirectionalLight( 0xffffff,1 );
    dLight.position.set( 0, 20, 40 );
    dLight.castShadow = true;

    dLight.shadow.camera.near = 0.2;
    dLight.shadow.camera.far = 1000;
    dLight.shadow.camera.left=-125;
    dLight.shadow.camera.right=125;
    dLight.shadow.camera.top=75;
    dLight.shadow.camera.bottom=-75;
    scene.add( dLight );
    //
    var ambient = new THREE.AmbientLight(0x888888);
    scene.add(ambient);
}

function addCameras(){
    var width = window.innerWidth; //
    var height = window.innerHeight; //
    var k = width / height; //
    var s = 100; //
    //
    camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 3000);
    camera.position.set(200, 300, 200); //
    console.log("scene.position=",scene.position);
    camera.lookAt(scene.position); //

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(width, height);
    renderer.setClearColor(0xb9d3ff,1);//
    // 开启阴影支持
    renderer.shadowMap.enabled = true;
    // 阴影类型
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement); //body

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.body.appendChild( labelRenderer.domElement );
}

function addMisc(){
    //scene.add(new THREE.AxesHelper(300));

    //window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( "click", onMouseClick, false );
}

function addSpriteButtons(){
    var txtObj={width:256,height:256,color:"0xFF0000",text:""};

    for(var i=0;i<7;i++){
        var tex = new THREE.TextureLoader().load( "img/sprites/lab"+i+".png" );
        var sprite = new THREE.Sprite( new THREE.SpriteMaterial( { map:tex,color: '#aeFFff' } ) );
        sprite.position.set( i*15, 55, 2 );
        sprite.scale.set( 8, 8, 1 );
        sprite.name="lab"+i;
        sprite.userData.tooltipText="lab"+i;
        groupMisc.add( sprite );
    }

    var speedsText=["慢速","中速","快速"];
    for(var i=0;i<3;i++){
        var tex = new THREE.TextureLoader().load( "img/sprites/spd"+i+".png" );
        var sprite = new THREE.Sprite( new THREE.SpriteMaterial( { map:tex,color: '#ae53ff' } ) );
        sprite.position.set( 135+i*15, 20, 2 );
        sprite.scale.set( 10, 10, 1 );
        sprite.name="spd"+i;
        sprite.userData.tooltipText=speedsText[i];
        groupMisc.add( sprite );
    }
}

function addControllers(){
    var controls = new THREE.OrbitControls(camera,labelRenderer.domElement);
}

function onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );
    render();
}