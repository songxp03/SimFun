var container, stats;
var camera, scene, renderer,labelRenderer, controls,lightL,lightR;
var textureLoader = new THREE.TextureLoader();
var raycaster = new THREE.Raycaster();

var mouse = new THREE.Vector2();
var selectedObjects = [];

var composer, effectFXAA, outlinePass;
var obj3d = new THREE.Object3D();

var group = new THREE.Group();

var finsFeatures={
	di:10.4,//管道内径di
	db:12.4,//管道外径(不含齿高)db
	dt:15.1,//管道外径dt
	delta_t:0.4,//翅宽度 δt
	Sf:1.2,//齿间距 Sf
};

var tubeFeatures={
	Qk:46000,//冷凝负荷Qk
	qo:6000,//管外热流密度qo
	tw1:30,//进水温度tw1
	tw2:35,//出水温度tw2
	Cp:4179,//水比热Cp
	rho:994.93,//水密度ρ
	w:2.5,//冷却水流速w
};

var tubeArrange={
	N:6,//流程数N
	d_tubes:21.5,//管道中心距dtb
	tubeArray:'7,8,9,10,9,8,7,6',//管道排列方式
	Download_STL_File:()=>{exportSTL()},//导出3D-stl文件
	Show_3D_Model:()=>{placeTubes()},//导出3D-stl文件
	Download_DXF_File:()=>{exportDXF(true)},//导出2D-dxf图纸
	Show_DXF_File:()=>{exportDXF(false)},//显示2D-dxf图纸
};

var params = {
	edgeStrength: 3.0,
	edgeGlow: 0.0,
	edgeThickness: 1.0,
	pulsePeriod: 0,
	rotate: false,
	shadow:false,
};

var Configuration = function () {
	this.visibleEdgeColor = '#ffffff';
	this.hiddenEdgeColor = '#190a05';
};

initGUI();
init();
animate();

function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	var width = window.innerWidth;
	var height = window.innerHeight;

	renderer = new THREE.WebGLRenderer();
	renderer.shadowMap.enabled = true;
	renderer.setClearColor( 0xbfd1e5 );
	// todo - support pixelRatio in this demo
	renderer.setSize( width, height );
	document.body.appendChild( renderer.domElement );

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 3000 );
	camera.position.set(0, 0, 2000);

	scene.add( new THREE.AmbientLight( 0xaaaaaa, 0.2 ) );

	lightL=createDLight({x:-100,y:100,z:0});
	scene.add( lightL );
	//scene.add( new THREE.DirectionalLightHelper( lightL, 5 ) );

	lightR=createDLight({x:+100,y:100,z:0});
	scene.add( lightR );
	//scene.add( new THREE.DirectionalLightHelper( lightR, 5 ) );

	//scene.add( new THREE.AxesHelper( 5 ) );//The X axis is red. The Y axis is green. The Z axis is blue.


	scene.add( group );
	group.add( obj3d );

	var floorMaterial = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide } );

	var floorGeometry = new THREE.PlaneBufferGeometry( 150, 150 );
	var floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );
	floorMesh.rotation.x -= Math.PI * 0.5;
	floorMesh.position.y -= 15;
	group.add( floorMesh );
	floorMesh.receiveShadow = true;
	textureLoader.load("img/grid.png", function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(40, 40);
        floorMesh.material.map = texture;
        floorMesh.material.needsUpdate = texture;
    });

	//
	stats = new Stats();
	container.appendChild( stats.dom );

	// postprocessing
	composer = new EffectComposer( renderer );

	var renderPass = new RenderPass( scene, camera );
	composer.addPass( renderPass );

	outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
	composer.addPass( outlinePass );


	effectFXAA = new ShaderPass( FXAAShader );
	effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
	composer.addPass( effectFXAA );

	labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.body.appendChild( labelRenderer.domElement );

	//controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls = new THREE.OrbitControls(camera,labelRenderer.domElement);
	controls.minDistance = 0.1;
	controls.maxDistance = 120;
	controls.enablePan = false;
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;

	window.addEventListener( 'resize', onWindowResize, false );

	window.addEventListener( 'mousemove', onTouchMove );
	window.addEventListener( 'touchmove', onTouchMove );

	function onTouchMove( event ) {
		var x, y;
		if ( event.changedTouches ) {
			x = event.changedTouches[ 0 ].pageX;
			y = event.changedTouches[ 0 ].pageY;
		} else {
			x = event.clientX;
			y = event.clientY;
		}
		mouse.x = ( x / window.innerWidth ) * 2 - 1;
		mouse.y = - ( y / window.innerHeight ) * 2 + 1;
		checkIntersection();
	}

	function addSelectedObject( object ) {
		selectedObjects = [];
		selectedObjects.push( object );
		//console.info("You click",object);
	}

	function checkIntersection() {
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( [ scene ], true );
		if ( intersects.length > 0 ) {
			var selectedObject = intersects[ 0 ].object;
			addSelectedObject( selectedObject );
			outlinePass.selectedObjects = selectedObjects;
		} else {
			// outlinePass.selectedObjects = [];
		}
	}
}

function onWindowResize() {
	let width = window.innerWidth;
	let height = window.innerHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize( width, height );
	composer.setSize( width, height );

	effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );

	stats.begin();

	let timer = performance.now();
	if ( params.rotate ) {
		group.rotation.y = timer * 0.0001;
	}

	controls.update();
	composer.render();
	labelRenderer.render( scene, camera );

	stats.end();
}

function isEven(num){
	if(num%2) return 0;
	else return 1;
}

function getParameters(){
	let {di,db,dt,delta_t,Sf}=finsFeatures;
	console.log(di,db,"dt=",dt,delta_t,Sf);

	let ad=Math.PI*dt*delta_t/Sf/1000;
	let af=Math.PI*(dt*dt-db*db)/Sf/2/1000;
	let ab=Math.PI*db*(Sf-delta_t)/Sf/1000;
	let ai=Math.PI*di/1000;
	let aof=ad+af+ab;
	console.log(ad,af,ab,ai,aof);

	let {Qk,qo,tw1,tw2,Cp,rho,w}=tubeFeatures;

	let Aof=Qk/qo;
	let L=Aof/aof;
	let qv=Qk/rho/Cp/Math.abs(tw1-tw2);
	let Z=qv/(Math.PI*di*di*w/4)*1000000;
	console.log(L,qv,Z);
	Z=Math.round(Z);

	let {N,d_tubes,tubeArray}=tubeArrange;
	let l=L/N/Z;
	console.log("l:",l);

	tubeArray=tubeArray.split(',');
	console.log(tubeArray,d_tubes);

	return {l,dt,d_tubes,tubeArray};
}

function placeTubes(){
	let {l,dt,d_tubes,tubeArray}=getParameters();

	let x0=0,y0=0;
	console.log(x0,y0);

	let v0=new THREE.Vector3(0,0,0);
	let v1=new THREE.Vector3(x0,y0,-l/2*1000);
	let v2=new THREE.Vector3(x0,y0,l/2*1000);
	let v3=new THREE.Vector3(x0,y0,-l/2*1000);
	v3.multiplyScalar(0.1);
	let v4=new THREE.Vector3(x0,y0,+l/2*1000);
	v4.multiplyScalar(0.1);
	let tmp=tubeFactory(v1,v2,v0,120,true);
	obj3d.add(tmp);
	createTag("管壳式换热器",10,tmp);
	obj3d.add(sphereFactory(v3,120,true,Math.PI,Math.PI*2));
	obj3d.add(sphereFactory(v4,120,true,Math.PI,Math.PI*2));

	for(let i=0,len=tubeArray.length,x,y;i<len;i++){
		for(let j=0;j<tubeArray[i]/2;j++){
			x=x0+(isEven(tubeArray[i])/2+j)*d_tubes;
			y=y0+i*d_tubes*Math.sqrt(3)/2;
			y-=50;
			let v1=new THREE.Vector3(x,y,-l/2*1000);
			let v2=new THREE.Vector3(x,y,+l/2*1000);
			obj3d.add(tubeFactory(v1,v2,v0,dt/2));
		}

		for(var j=0;j<tubeArray[i]/2;j++){
			x=x0-(isEven(tubeArray[i])/2+j)*d_tubes;
			y=y0+i*d_tubes*Math.sqrt(3)/2;
			y-=50;
			let v1=new THREE.Vector3(x,y,-l/2*1000);
			let v2=new THREE.Vector3(x,y,+l/2*1000);
			obj3d.add(tubeFactory(v1,v2,v0,dt/2));
		}
	}
}

function tubeFactory(v1,v2,pos,radius=2,transparent=false){
	let tubePath=new THREE.LineCurve3(v1,v2);

	var tubeGeometry = new THREE.TubeGeometry( tubePath, 1, radius, 48, false );
	var option={ side: THREE.DoubleSide };
	if(transparent){
		option.transparent=true;
		option.opacity=0.3;
	}
	var tubeMaterial = new THREE.MeshLambertMaterial(option);//渲染两面
	tubeMaterial.color.setHSL( Math.random(), 1.0, 0.3 );
	var tubeMesh = new THREE.Mesh( tubeGeometry, tubeMaterial );

	tubeMesh.position.set(pos.x,pos.y,pos.z);

	tubeMesh.scale.multiplyScalar( 0.1 );

	tubeMesh.receiveShadow = true;
	tubeMesh.castShadow = true;

	return tubeMesh;
}

function sphereFactory(pos,radius=2,transparent=false,phiStart,phiLength){
	var geo = new THREE.SphereBufferGeometry(radius,32,32,phiStart,phiLength);
	var option={ side: THREE.DoubleSide };
	if(transparent){
		option.transparent=true;
		option.opacity=0.3;
	}
	var mtrl = new THREE.MeshLambertMaterial(option);//渲染两面
	mtrl.color.setHSL( Math.random(), 1.0, 0.3 );
	var sphere = new THREE.Mesh( geo, mtrl );

	sphere.position.set(pos.x,pos.y,pos.z);

	sphere.scale.multiplyScalar( 0.1 );

	sphere.receiveShadow = true;
	sphere.castShadow = true;

	return sphere;
}

function createDLight(pos){
	var light = new THREE.DirectionalLight( 0xddffdd, 0.3 );
	light.position.set( pos.x, pos.y, pos.z );

	light.castShadow = false;

	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;

	var d = 10;
	light.shadow.camera.left = - d;
	light.shadow.camera.right = d;
	light.shadow.camera.top = d;
	light.shadow.camera.bottom = - d;

	light.shadow.camera.far = 1000;

	return light;
}

function initGUI(){	// Init gui
	let gui = new GUI( { width: 300 } );

	let finsGUI = gui.addFolder('翅片属性设置');

	finsGUI.add( finsFeatures, 'di', 10.4, 30 ).onChange( function ( value ) {
		finsFeatures.di = Number( value );
	} ).name('管道内径di');

	finsGUI.add( finsFeatures, 'db', 12.4, 24 ).onChange( function ( value ) {
		finsFeatures.db = Number( value );
	} ).name('管道外径(不含齿高)db');

	finsGUI.add( finsFeatures, 'dt', 15.1, 30 ).onChange( function ( value ) {
		finsFeatures.dt = Number( value );
	} ).name('管道外径dt');

	finsGUI.add( finsFeatures, 'delta_t', 0.4, 1 ).onChange( function ( value ) {
		finsFeatures.delta_t = Number( value );
	} ).name('翅宽度 δt');

	finsGUI.add( finsFeatures, 'Sf', 1.2, 3 ).onChange( function ( value ) {
		finsFeatures.Sf = Number( value );
	} ).name('齿间距 Sf');

	gui.remember(finsFeatures);

	let tubeGUI = gui.addFolder('管道属性设置');

	tubeGUI.add( tubeFeatures, 'Qk', 46000, 100000 ).onChange( function ( value ) {
		tubeFeatures.Qk = Number( value );
	} ).name('冷凝负荷Qk');

	tubeGUI.add( tubeFeatures, 'qo', 6000, 10000 ).onChange( function ( value ) {
		tubeFeatures.qo = Number( value );
	} ).name('管外热流密度qo');

	tubeGUI.add( tubeFeatures, 'tw1', 30, 35 ).onChange( function ( value ) {
		tubeFeatures.tw1 = Number( value );
	} ).name('进水温度tw1');

	tubeGUI.add( tubeFeatures, 'tw2', 35, 40 ).onChange( function ( value ) {
		tubeFeatures.tw2 = Number( value );
	} ).name('进水温度tw2');

	tubeGUI.add( tubeFeatures, 'Cp', 4179, 4300 ).onChange( function ( value ) {
		tubeFeatures.Cp = Number( value );
	} ).name('水比热Cp');

	tubeGUI.add( tubeFeatures, 'rho', 994.93, 1008 ).onChange( function ( value ) {
		tubeFeatures.rho = Number( value );
	} ).name('水密度ρ');

	tubeGUI.add( tubeFeatures, 'w', 2.5, 10 ).onChange( function ( value ) {
		tubeFeatures.w = Number( value );
	} ).name('冷却水流速w');


	let miscGUI = gui.addFolder('管道布局及图纸导出');

	miscGUI.add( tubeArrange, 'N', 2, 20 ).onChange( function ( value ) {
		tubeArrange.N = Number( value );
	} ).name('流程数N');

	miscGUI.add( tubeArrange, 'd_tubes', 10, 40 ).onChange( function ( value ) {
		tubeArrange.d_tubes = Number( value );
	} ).name('管道中心距dtb');

	miscGUI.add( tubeArrange, 'tubeArray').onChange( function ( value ) {
		tubeArrange.tubeArray = value;
	} ).name('管道布局');

	miscGUI.add(tubeArrange, 'Download_DXF_File').name('导出2D-dxf文件');
	miscGUI.add(tubeArrange, 'Show_DXF_File').name('显示2D-dxf文件');
	miscGUI.add(tubeArrange, 'Show_3D_Model').name('显示预览3D-模型文件');
	miscGUI.add(tubeArrange, 'Download_STL_File').name('导出3D-stl文件');

	let outlineGUI = gui.addFolder('3D显示属性');

	outlineGUI.add( params, 'edgeStrength', 0.01, 10 ).onChange( function ( value ) {
		outlinePass.edgeStrength = Number( value );
	} );

	outlineGUI.add( params, 'edgeGlow', 0.0, 1 ).onChange( function ( value ) {
		outlinePass.edgeGlow = Number( value );
	} );

	outlineGUI.add( params, 'edgeThickness', 1, 4 ).onChange( function ( value ) {
		outlinePass.edgeThickness = Number( value );
	} );

	outlineGUI.add( params, 'pulsePeriod', 0.0, 5 ).onChange( function ( value ) {
		outlinePass.pulsePeriod = Number( value );
	} );

	outlineGUI.add( params, 'rotate' ).name('自动旋转');

	outlineGUI.add( params, 'shadow' ).onChange( function ( value ) {
		lightR.castShadow=lightL.castShadow=params.shadow=value;
	} ).name('显示阴影');

	let conf = new Configuration();

	outlineGUI.addColor( conf, 'visibleEdgeColor' ).onChange( function ( value ) {
		outlinePass.visibleEdgeColor.set( value );
	} );

	outlineGUI.addColor( conf, 'hiddenEdgeColor' ).onChange( function ( value ) {
		outlinePass.hiddenEdgeColor.set( value );
	} );
}

function downloadBlob(blob,fileName){
	var link = document.createElement( 'a' );
	link.href = URL.createObjectURL( blob );
	link.download = fileName;
	link.dispatchEvent( new MouseEvent( 'click' ) );
}

var exportSTL=function (){
	// Instantiate an exporter
	let exporter = new THREE.STLExporter();

	// Parse the input and generate the ply output
	let buffer = exporter.parse(scene, { binary: true } );
	let blob=new Blob( [ buffer ], { type: 'application/octet-stream' } );

	downloadBlob(blob,'换热器模型.stl');
};

var exportDXF=function (dxf=false){
	let {l,dt,d_tubes,tubeArray}=getParameters();

	var myCanvas=document.getElementById("drawing-canvas");
	var ctx=myCanvas.getContext("2d");

	function drawCircle(ctx,x,y,r){
		ctx.beginPath();
		ctx.arc(x,y,r,0,2*Math.PI);
		ctx.stroke();
	}

	let Drawing = require('Drawing');
	let d = new Drawing();

	var x0=180,y0=250;
	console.log(x0,y0);
	ctx.clearRect(0,0,myCanvas.width,myCanvas.height);  
	drawCircle(ctx,x0,y0-100,120);
	if(dxf)d.drawCircle(x0,y0-100,120);
	for(var i=0,len=tubeArray.length,x,y;i<len;i++){
		for(var j=0;j<tubeArray[i]/2;j++){
			x=x0+(isEven(tubeArray[i])/2+j)*d_tubes;
			y=y0+i*d_tubes*Math.sqrt(3)/2;
			y=450-y;
			drawCircle(ctx,x,y,dt/2);
			if(dxf)d.drawCircle(x, y, dt/2);
		}
		for(var j=0;j<tubeArray[i]/2;j++){
			x=x0-(isEven(tubeArray[i])/2+j)*d_tubes;
			y=y0+i*d_tubes*Math.sqrt(3)/2;
			y=450-y;
			drawCircle(ctx,x,y,dt/2);
			if(dxf)d.drawCircle(x, y, dt/2);
		}
	}
    ctx.font = "16px serif";
    ctx.fillText("换热器管道布置图", 100, 320);

	if(dxf){
		let blob=new Blob([d.toDxfString()], {type: 'application/dxf'});
		downloadBlob(blob,"管道排列布局.dxf");
	}
};

function createTag(text,RADIUS=1,parentObj){
    var div = document.createElement( 'div' );
    div.className = 'label';
    div.textContent = text;
    div.style.marginTop = '-1em';
    var tag = new CSS2DObject( div );
    tag.position.set( 0, RADIUS, 0 );
    parentObj.add( tag );

    return div;
}