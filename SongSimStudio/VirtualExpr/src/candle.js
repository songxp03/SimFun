
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(3, 5, 8).setLength(15);

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xCCCCCC);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

var labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild( labelRenderer.domElement );

//var controls = new THREE.OrbitControls(camera, renderer.domElement);
var controls = new THREE.OrbitControls(camera,labelRenderer.domElement);
controls.enablePan = true;
//scene.add(new THREE.GridHelper(10, 10, 0x552222, 0x333322));

var light = new THREE.DirectionalLight(0xffffff,1);
light.position.setScalar(10);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

{// bottle
  var path = new THREE.Path();
  path.moveTo(0, 0);
  path.lineTo(1.9, 0.0);
  path.lineTo(1.8, 0.3);
  path.lineTo(3.5, 2.5);
  path.lineTo(1.5, 3.8);
  path.lineTo(1.4, 4.5);
  path.lineTo(0, 4.5);
  var geometry = new THREE.LatheBufferGeometry(path.getPoints(), 64);
  var material = new THREE.MeshPhongMaterial({color: "silver",transparent: true,opacity: 0.9});
  var bottle = new THREE.Mesh(geometry, material);
  scene.add(bottle);
  bottle.position.set(0,-3.6,0);
  bottle.castShadow = true;
}

{// candlewick 火焰芯
  var geometry = new THREE.CylinderGeometry( 0.05, 0.06, 4.5, 32 );
  var material = new THREE.MeshLambertMaterial( { color: 'black' } );
  var candlewick = new THREE.Mesh( geometry, material );
  scene.add( candlewick );
  candlewick.position.set(0,0.0,0);
}

{//塞子
  var geometry = new THREE.CylinderGeometry( 1.2, 1.0, 1.0, 32 );
  var material = new THREE.MeshPhongMaterial( { color: 0xFFA500 } );
  var plug = new THREE.Mesh( geometry, material );
  scene.add( plug );
  plug.position.set(0,0.8,0);
}

{//alcohol
  var geometry = new THREE.CylinderGeometry( 3.4, 1.60, 2.2, 32 );
  var material = new THREE.MeshPhongMaterial( { color: 0xFF0000 } );
  var alcohol = new THREE.Mesh( geometry, material );
  scene.add( alcohol );
  alcohol.position.set(0,-2.2,0);
}

{// candle light
	var candleLight = new THREE.PointLight(0xffaa33, 1, 15, 2);
	candleLight.position.set(0, 3, 0);
	candleLight.castShadow = true;
	scene.add(candleLight);

	var candleLight2 = new THREE.PointLight(0xffaa33, 1, 20, 2);
	candleLight2.position.set(0, 4, 0);
	candleLight2.castShadow = true;
	scene.add(candleLight2);
	//scene.add(new THREE.PointLightHelper(candleLight2));
  
	//var debug = new THREE.CameraHelper(candleLight2.shadow.camera);
	//debug.name = "debug";
	//scene.add(debug);
}

{// flame
  var flameMaterials = [];
  function addFlame(isFrontSide){
    var flameGeo = new THREE.SphereBufferGeometry(0.5, 32, 32);
    flameGeo.translate(0, 0.5, 0);
    var flameMat = getFlameMaterial(isFrontSide);
    flameMaterials.push(flameMat);
    var flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0.06, 1.2, 0.06);
    flame.rotation.y = THREE.Math.degToRad(-45);
    scene.add(flame);
  }

  addFlame(false);
  addFlame(true);
}

{// table
  var geometry = new THREE.BoxGeometry(25, 0.2, 16);
  geometry.translate(0, -0.25, 0);
  var material = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("img/hardwood2_diffuse.jpg")});
  var table = new THREE.Mesh(geometry, material);
  table.receiveShadow = true;
  table.position.set(0,-3.5,0);
  scene.add(table);
}

{//压力容器
  var geometry=new THREE.CylinderGeometry( 2, 2, 2, 32 );
  var material = new THREE.MeshPhongMaterial({color: 0x4488ff,transparent: true,opacity: 0.3,});
  var wrapper = new THREE.Mesh( geometry, material );
  scene.add(wrapper);
  wrapper.position.set(0,5.5,0);
}

{//水
  var geometry=new THREE.CylinderGeometry( 1.9, 1.9, 1.2, 32 );
  var material = new THREE.MeshPhongMaterial({color:"blue",transparent: true,opacity: 0.8,});
  var water = new THREE.Mesh( geometry, material );
  scene.add(water);
  water.position.set(0,5.2,0);
}

{//环状支撑
  var geometry = new THREE.TorusGeometry( 2.05, 0.1, 16, 100 );
  var material = new THREE.MeshLambertMaterial( { color: 'black' } );
  var torus = new THREE.Mesh( geometry, material );
  scene.add( torus );
  torus.position.set(0,5.2,0);
  torus.rotation.x+=Math.PI/2;
}

{//垂直支撑
  var geometry = new THREE.CylinderGeometry( 0.1, 0.1, 10, 32 );
  var material = new THREE.MeshLambertMaterial( { color: 'black' } );
  var holder = new THREE.Mesh( geometry, material );
  scene.add( holder );
  holder.position.set(4,1,0);
  holder.castShadow=true;
}

{//垂直支座
  var geometry = new THREE.CylinderGeometry( 1.1, 1.1, 0.15, 32 );
  var material = new THREE.MeshLambertMaterial( { color: 'black' } );
  var holder = new THREE.Mesh( geometry, material );
  scene.add( holder );
  holder.position.set(4,-3.5,0);
}

{//水平支撑
  var geometry = new THREE.CylinderGeometry( 0.1, 0.1, 3, 32 );
  var material = new THREE.MeshLambertMaterial( { color: 'black' } );
  var holder = new THREE.Mesh( geometry, material );
  scene.add( holder );
  holder.rotation.z+=Math.PI/2;
  holder.position.set(3.5,5.2,0);
}

var myChart,chartOption,chartMaterial;
{//charts
  var myCanvas=document.createElement("canvas");//new OffscreenCanvas(512,512);
  myCanvas.setAttribute("width", 512);
  myCanvas.setAttribute("height", 512);
  myChart = echarts.init( myCanvas );

  chartOption = {
    tooltip: {
      formatter: "{a} <br/>{c} {b}"
    },
    toolbox: {
      show: true,
      feature: {
        restore: {show: false},
        saveAsImage: {show: false}
      }
    },
    series : [
      {
        name: '温度计',
        type: 'gauge',
        center: ['62%', '50%'],    // 默认全局居中
        z: 3,
        min: 0,
        max: 220,
        splitNumber: 11,
        radius: '50%',
        axisLine: {            // 坐标轴线
          lineStyle: {       // 属性lineStyle控制线条样式
            width: 10
          }
        },
        axisTick: {            // 坐标轴小标记
          length: 15,        // 属性length控制线长
          lineStyle: {       // 属性lineStyle控制线条样式
            color: 'auto'
          }
        },
        splitLine: {           // 分隔线
          length: 20,         // 属性length控制线长
          lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
            color: 'auto'
          }
        },
        axisLabel: {
          backgroundColor: 'auto',
          borderRadius: 2,
          color: '#eee',
          padding: 3,
          textShadowBlur: 2,
          textShadowOffsetX: 1,
          textShadowOffsetY: 1,
          textShadowColor: '#222'
        },
        title: {
          // 其余属性默认使用全局文本样式，详见TEXTSTYLE
          fontWeight: 'bolder',
          fontSize: 20,
          fontStyle: 'italic'
        },
        detail: {
          // 其余属性默认使用全局文本样式，详见TEXTSTYLE
          formatter: function (value) {
            value = (value + '').split('.');
            value.length < 2 && (value.push('00'));
            return ('00' + value[0]).slice(-3)
                + '.' + (value[1] + '00').slice(0,1);
          },
          fontWeight: 'bolder',
          borderRadius: 3,
          backgroundColor: '#444',
          borderColor: '#aaa',
          shadowBlur: 5,
          shadowColor: '#333',
          shadowOffsetX: 0,
          shadowOffsetY: 3,
          borderWidth: 2,
          textBorderColor: '#000',
          textBorderWidth: 2,
          textShadowBlur: 2,
          textShadowColor: '#fff',
          textShadowOffsetX: 0,
          textShadowOffsetY: 0,
          fontFamily: 'Arial',
          width: 120,
          color: '#eee',
          rich: {}
        },
        data: [{value: 30, name: '°C'}]
      },
      {
        name: '压力',
        type: 'gauge',
        center: ['28%', '50%'],    // 默认全局居中
        radius: '35%',
        min: 0,
        max: 7,
        endAngle: 45,
        splitNumber: 7,
        axisLine: {            // 坐标轴线
          lineStyle: {       // 属性lineStyle控制线条样式
            width: 8
          }
        },
        axisTick: {            // 坐标轴小标记
          length: 12,        // 属性length控制线长
          lineStyle: {       // 属性lineStyle控制线条样式
            color: 'auto'
          }
        },
        splitLine: {           // 分隔线
          length: 20,         // 属性length控制线长
          lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
            color: 'auto'
          }
        },
        pointer: {
          width: 5
        },
        title: {
          offsetCenter: [0, '-30%'],       // x, y，单位px
        },
        detail: {
          // 其余属性默认使用全局文本样式，详见TEXTSTYLE
          fontWeight: 'bolder'
        },
        data: [{value: 0.1, name: 'atm'}]
      }
    ]
  };

  myChart.setOption(chartOption, true);

  myChart.on('finished', function () {
    var tex=new THREE.CanvasTexture(myCanvas);
    chartMaterial = new THREE.MeshBasicMaterial({color: "gray",map: tex});
	
    var geometry = new THREE.PlaneGeometry( 512, 512);
    var plane = new THREE.Mesh( geometry, chartMaterial );
    plane.position.set(-6.5, 0, -3.5);
    plane.scale.set(0.02,0.02,0.02);
    plane.rotation.x-=Math.PI/15;
    scene.add( plane );
  });
}
console.log("chartMaterial",chartMaterial);

{//charts holder
  var geometry = new THREE.BoxGeometry( 12, 1.5, 10 );
  var material = new THREE.MeshBasicMaterial( {color: "gray"} );
  var meter = new THREE.Mesh( geometry, material );
  meter.position.set(-6.5, 0.5, -4.5);
  meter.rotation.x=Math.PI/2-Math.PI/15;
  scene.add( meter );
}

{//connector
  var curve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,6.0,0),
    new THREE.Vector3(0,7.2,0),
    new THREE.Vector3(0,7.5,-1),
    new THREE.Vector3(0,7.5,-3),
    new THREE.Vector3(0,7.2,-5),
    new THREE.Vector3(0,4.5,-5),
    new THREE.Vector3(-2,2.5,-4.5),
  ],false);
  var channel=new WaterPipe(curve,0.06,0.1,false,null,'purple',false);
  scene.add(channel.obj);
}

var switchs=[];
{//switchs
  var switchGrp=new THREE.Group();

  switchs[0]=new ToggleButton("Switch0",false);
  switchs[0].obj.position.set(-12.0,4,-3.5);
  switchs[0].obj.scale.set(0.05,0.05,0.05);
  switchGrp.add(switchs[0].obj);
  createTag("1atm",10,switchs[0].obj);

  switchs[1]=new ToggleButton("Switch1",true);
  switchs[1].obj.position.set(-12.0,2,-3.5);
  switchs[1].obj.scale.set(0.05,0.05,0.05);
  switchGrp.add(switchs[1].obj);
  createTag("2atm",10,switchs[1].obj);

  switchs[2]=new ToggleButton("Switch2",true);
  switchs[2].obj.position.set(-12.0,0,-3.5);
  switchs[2].obj.scale.set(0.05,0.05,0.05);
  switchGrp.add(switchs[2].obj);
  createTag("5atm",10,switchs[2].obj);

  switchs[3]=new ToggleButton("Switch3",true);
  switchs[3].obj.position.set(-12.0,-2,-3.5);
  switchs[3].obj.scale.set(0.05,0.05,0.05);
  switchGrp.add(switchs[3].obj);
  createTag("8atm",10,switchs[3].obj);

  scene.add(switchGrp);
  switchGrp.rotation.x=-Math.PI/15;
}

var selectedObject = null;// this objects is hovered at the moment
var raycaster = new THREE.Raycaster();
// this will be 2D coordinates of the current mouse position, [0,0] is middle of the screen.
var mouseVector = new THREE.Vector3();
window.addEventListener( "click", onMouseClick, false );

function onMouseClick (event ) {
  console.log("RayCast fired!");
  event.preventDefault();
  if ( selectedObject ) {
    selectedObject = null;
  }

  var intersects = getIntersects( event.layerX, event.layerY );
  if ( intersects.length > 0 ) {
    var res = intersects.filter( function ( res ) {
      return res && res.object;
    } )[ 0 ];
    if ( res && res.object ) {
      selectedObject = res.object;
      buttonProcesser(selectedObject);
    }
  }
}

function getIntersects( x, y ) {
  x = ( x / window.innerWidth ) * 2 - 1;
  y = - ( y / window.innerHeight ) * 2 + 1;

  mouseVector.set( x, y, 0.5 );
  raycaster.setFromCamera( mouseVector, camera );

  return raycaster.intersectObject( switchGrp, true );
}

var boiling=false;
function updateChart(cP,tP,explode){
	var step=1;
	var update=function(){
		var P=cP+(tP-cP)*step/10;
		var T=100*Math.sqrt(Math.sqrt(P-0.0));
		console.log("Current Pressure/Temperature:",P,T);
		chartOption.series[0].data[0].value = T.toFixed(1) - 0.0;
      	chartOption.series[1].data[0].value = P.toFixed(1) - 0.0;
      	myChart.setOption(chartOption,true);
      	chartMaterial.needsUpdate=true;
      	if(step>3){
      		boiling=true;
      		bubbleGrp.position.y=0;
      		if(explode){
      			camera.position.z=1234;
      			alert("容器压力严重超载，设备已爆炸损坏！");
      			return;
      		}
      	}
		step++;
	}
    var timmerID=setInterval(update,2000);
    var stop=function(){ 
    	clearInterval(timmerID);
    	boiling=false;
    	bubbleGrp.position.y=-1000;
    }
    // after 10 step stop
    setTimeout(stop, 2000*10);
}

var Plist=[1,2,5,8];
var currentP=0.1,targetP=0.1;
function buttonProcesser(selectedObject) {
  var name = selectedObject.name, switchID;

  if (name.substr(0, 6) == "Switch") {
    switchID = parseInt(name.substr(6, 1));
    console.info("switchID->", switchID, " is selected!");
    for (var i = 0; i < 4; i++) {
      if (i == switchID) {
        switchs[i].toggle();
        currentP=targetP;
        targetP=Plist[i];
        var explode=(i==3)?true:false;
        updateChart(currentP,targetP,explode);
      } else {
        switchs[i].open(false);
      }
    }
  }
}

var totalBubble=20;
var bubbles=[];
var bubbleGrp=new THREE.Group();
{//气泡
    var textureLoader = new THREE.TextureLoader();
    var mapB = textureLoader.load( "img/bubble.png" );

    var material= new THREE.SpriteMaterial( { map: mapB, color: 0xffffff, fog: true } );
    material.color.setHSL( 1, 1.0, 1.0 );
    for ( var i = 0; i < totalBubble; i ++ ) {
        bubbles[i] = new THREE.Sprite( material );
        var R=0.2+1.3*Math.random();
        var theta=Math.random()*Math.PI*2;
        bubbles[i].position.x = R*Math.cos(theta);
        bubbles[i].position.y = 4.8+Math.random() * 0.6;
        bubbles[i].position.z = R*Math.sin(theta);
        bubbles[i].scale.multiplyScalar( Math.random() * 0.2 + 0.1 );
        bubbleGrp.add( bubbles[i] );
    }

    scene.add(bubbleGrp);
    bubbleGrp.position.y=-1000;
}

var clock = new THREE.Clock();
var time = 0;

render();
function render(){
	requestAnimationFrame(render);
	time += clock.getDelta();
	flameMaterials[0].uniforms.time.value = time;
	flameMaterials[1].uniforms.time.value = time;

	candleLight2.position.x = Math.sin(time * Math.PI) * 0.25;
	candleLight2.position.z = Math.cos(time * Math.PI * 0.75) * 0.25;
	candleLight2.intensity = 2 + Math.sin(time * Math.PI * 2) * Math.cos(time * Math.PI * 1.5) * 0.25;

	if(boiling){
		for(var i=0;i<totalBubble;i++){
			if(bubbles[i].position.y>5.5){
				var R=0.2+1.3*Math.random();
				var theta=Math.random()*Math.PI*2;
				bubbles[i].position.x = R*Math.cos(theta);
				bubbles[i].position.y = 4.8+Math.random() * 0.6;
				bubbles[i].position.z = R*Math.sin(theta);
			}else{
				bubbles[i].position.y+=0.05;
			}
		}
	}

	renderer.render(scene, camera);
	labelRenderer.render( scene, camera );
}