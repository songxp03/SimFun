//index.js
var scene = new THREE.Scene();
var flowTexture,curve,curves=[],flows=[],buoy;
var camera,renderer;
var progress=0;
var selectedObject = null;// this objects is hovered at the moment
var pumpSwitch,fans=[],groupMisc;
var raycaster = new THREE.Raycaster();
// this will be 2D coordinates of the current mouse position, [0,0] is middle of the screen.
var mouseVector = new THREE.Vector3();
var latestMouseProjection; // this is the latest projection of the mouse on object (i.e. intersection with ray)
// tooltip will not appear immediately. If object was hovered shortly,
// - the timer will be canceled and tooltip will not appear at all.
var tooltipDisplayTimeout;

groupMisc = new THREE.Group();
scene.add( groupMisc );

const workPlaneZ=20;
const hiddenPlaneZ=-100000;
var flameMaterials = [];
var clock = new THREE.Clock();
var time = 0;

addLights();
addCameras();
//addSpriteButtons();
//addMisc();
//loadTexture();
//addWaterPipe();
//addWaterPointer();
//addWorkSpace();
addDesktop();
//addMeters();
addControllers();

render();

function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);

    fans.forEach((item,index,array)=>{
        item.rotation.z-=0.01;
    });

    time += clock.getDelta();
    flameMaterials[0].uniforms.time.value = time;
    flameMaterials[1].uniforms.time.value = time;
}

function addWorkSpace(){
    
}

function addWaterPipe(){
    
}

function addWaterPointer(){

}

function addDesktop(){
    {
        var geometry = new THREE.PlaneGeometry(350, 150);
        var material = new THREE.MeshBasicMaterial({color: 0xcccccc,side: THREE.DoubleSide});
        material.map=new THREE.TextureLoader().load("img/BBoard.jpg");
        var vPlane = new THREE.Mesh(geometry, material);
        vPlane.position.set(0, -4, -100);
        //scene.add(vPlane);
    }
    {
        var geometry = new THREE.PlaneGeometry( 350, 80,);
        var material = new THREE.MeshBasicMaterial( {color: 0x666666,side: THREE.DoubleSide} );
        material.map=new THREE.TextureLoader().load("img/desktop.jpg");
        var hPlane = new THREE.Mesh( geometry, material );
        hPlane.position.set(0, -102, 20);
        hPlane.rotation.x=Math.PI/2.0;
        scene.add( hPlane );
    }

    pumpSwitch=new ToggleButton("pumpSwitch");
    pumpSwitch.obj.position.set(150,50,0);
    pumpSwitch.obj.userData.tooltipText="PowerSupply";
    groupMisc.add(pumpSwitch.obj);

    function createFan(width,height,skew=10,phase,vane=6,Rin=0,shellColor,transparent=false,x,y,z,alpha,beta){
        var fan=new FanBase(width,height,skew,phase,vane,Rin,shellColor,transparent).obj;
        fan.rotation.y=alpha;
        fan.rotation.x=beta;
        fan.position.set(x,y,z);
        scene.add(fan);
        fans.push(fan);
        return fan;
    }

    function createStator(width,height,skew=10,phase,vane=6,Rin=0,shellColor,transparent=false,bngAle=0,endAle=Math.PI*2,x,y,z){
        var stator=new StatorBase(width,height,skew,phase,vane,Rin,shellColor,transparent,bngAle,endAle).obj;
        stator.position.set(x,y,z);
        scene.add(stator);
    }

    createFan(6,60,10,0,24,6,0x228B22,false,-290,0,0,Math.PI*0.5,0);

    createFan(15,65,10,Math.PI/2,12,4,"red",false,-260,0,0,Math.PI*0.5,Math.random()*Math.PI);
    createFan(15,65,10,Math.PI/2,12,4,"blue",false,-230,0,0,Math.PI*0.5,Math.random()*Math.PI);
    createFan(15,65,10,Math.PI/2,12,4,"teal",false,-200,0,0,Math.PI*0.5,Math.random()*Math.PI);

    createFan(5,65,10,Math.PI/2,36,10,"yellow",false,-170,0,0,Math.PI*0.5,Math.random()*Math.PI);
    createFan(5,65,10,Math.PI/2,36,10,"green",false,-150,0,0,Math.PI*0.5,Math.random()*Math.PI);
    createFan(5,65,10,Math.PI/2,36,10,"purple",false,-130,0,0,Math.PI*0.5,Math.random()*Math.PI);
    createFan(5,65,10,Math.PI/2,36,10,"silver",false,-110,0,0,Math.PI*0.5,Math.random()*Math.PI);

    createStator(5,20,5,Math.PI/6,16,50,"black",false,Math.PI/2,-Math.PI,-160,0,0);
    createStator(5,20,5,Math.PI/6,16,50,"black",false,Math.PI/2,-Math.PI,-140,0,0);
    createStator(5,20,5,Math.PI/6,16,48,"black",false,Math.PI/2,-Math.PI,-120,0,0);
    createStator(5,20,5,Math.PI/6,16,45,"black",false,Math.PI/2,-Math.PI,-100,0,0);

    createFan(15,65,20,Math.PI/3,24,4,"gray",false,50,0,0,Math.PI*0.5,Math.random()*Math.PI);
    createFan(15,65,20,Math.PI/3,24,4,"olive",false,80,0,0,Math.PI*0.5,Math.random()*Math.PI);
    createFan(15,65,20,Math.PI/3,24,4,"maroon",false,120,0,0,Math.PI*0.5,Math.random()*Math.PI);

    {
        function createFlame(isFrontSide,x,y,z){
            let flameGeo = new THREE.SphereBufferGeometry(0.5, 32, 32);
            flameGeo.translate(0, 0.5, 0);
            let flameMat = getFlameMaterial(isFrontSide);
            flameMaterials.push(flameMat);
            let flame = new THREE.Mesh(flameGeo, flameMat);
            flame.position.set(x,y,z);
            flame.scale.set(24,24,24);
            flame.rotation.z=-Math.PI/2;
            scene.add(flame);
        }

        createFlame(true,-45, 30, 0);
        createFlame(true,-45, -30, 0);
    }

    {
        var points = [];
        points.push( new THREE.Vector2(8,-10),new THREE.Vector2(18,20),new THREE.Vector2(18,50),new THREE.Vector2(5,65),);
        var geometry = new THREE.LatheGeometry( points ,24,0,Math.PI);
        geometry.rotateZ(Math.PI*0.5);
        geometry.rotateX(Math.PI*1.5);
        var material = new THREE.MeshLambertMaterial( { color: "aqua",side: THREE.DoubleSide } );
        var lathe = new THREE.Mesh( geometry, material );
        lathe.position.set(20,30,0);
        scene.add( lathe );
    }

    {
        var points = [];
        points.push( new THREE.Vector2(8,-10),new THREE.Vector2(18,20),new THREE.Vector2(18,50),new THREE.Vector2(5,65),);
        var geometry = new THREE.LatheGeometry( points ,24,0,Math.PI);
        geometry.rotateZ(Math.PI*0.5);
        geometry.rotateX(Math.PI*1.5);
        var material = new THREE.MeshLambertMaterial( { color: "navy",side: THREE.DoubleSide } );
        var lathe = new THREE.Mesh( geometry, material );
        lathe.position.set(20,-30,0);
        scene.add( lathe );
    }

    {
        var points = [];
        points.push( new THREE.Vector2(57,19),new THREE.Vector2(63,33),new THREE.Vector2(66,54),new THREE.Vector2(79,102),
            new THREE.Vector2(79,149),new THREE.Vector2(79,179),new THREE.Vector2(79,257),new THREE.Vector2(65,290),
            new THREE.Vector2(63,330),new THREE.Vector2(70,387),new THREE.Vector2(73,460),new THREE.Vector2(71,550),);
        var geometry = new THREE.LatheGeometry( points ,24,0,Math.PI*1.5);
        geometry.rotateZ(Math.PI*0.5);
        geometry.rotateX(Math.PI*1.5);
        var material = new THREE.MeshLambertMaterial( { color: 0xff66ff,side: THREE.DoubleSide } );
        var lathe = new THREE.Mesh( geometry, material );
        lathe.position.set(256,0,0);
        scene.add( lathe );
    }

    {
        var points = [];
        points.push( new THREE.Vector2(0,30),new THREE.Vector2(36,100),new THREE.Vector2(27,102),new THREE.Vector2(29,143),
            new THREE.Vector2(15,143),new THREE.Vector2(15,179),new THREE.Vector2(14,179),new THREE.Vector2(14,232),
            new THREE.Vector2(7,252),new THREE.Vector2(7,256),new THREE.Vector2(12,256),new THREE.Vector2(12,263),
            new THREE.Vector2(10,263),new THREE.Vector2(10,310),new THREE.Vector2(46,325),new THREE.Vector2(46,422),
            new THREE.Vector2(16,520),new THREE.Vector2(15,538),new THREE.Vector2(21,538),new THREE.Vector2(21,556),
            new THREE.Vector2(18,568),new THREE.Vector2(11,580),new THREE.Vector2(6,583),new THREE.Vector2(0,585),);
        var geometry = new THREE.LatheGeometry( points ,12,0,Math.PI*2);
        geometry.rotateZ(Math.PI*0.5);
        //geometry.rotateX(Math.PI/2);
        var material = new THREE.MeshLambertMaterial( { color: 0x555555,side: THREE.DoubleSide } );
        var lathe = new THREE.Mesh( geometry, material );
        lathe.position.set(256,0,0);
        scene.add( lathe );
    }
}

function addMeters(){
    
}

function loadTexture(){
    
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
            startExperiment=true;
        }else{
            valveIn.close();
            startExperiment=false;
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
}

function addMisc(){
    scene.add(new THREE.AxesHelper(300));

    window.addEventListener( 'resize', onWindowResize, false );
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
    var controls = new THREE.OrbitControls(camera);
}

function onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );
    render();
}