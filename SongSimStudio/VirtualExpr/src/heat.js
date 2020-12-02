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
    curves[0] = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-150, -55, 50),
        new THREE.Vector3(121, -55, 50),
        new THREE.Vector3(121, -55, -5),
        new THREE.Vector3(-120, -55, -5),

        new THREE.Vector3(-120, -15, -5),
        new THREE.Vector3(121, -15, -5),
        new THREE.Vector3(121, -15, 50),
        new THREE.Vector3(-120, -15, 50),

        new THREE.Vector3(-120, 35, 50),
        new THREE.Vector3(121, 35, 50),
        new THREE.Vector3(121, 35, -5),
        new THREE.Vector3(-150, 35, -5),

    ],false);

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