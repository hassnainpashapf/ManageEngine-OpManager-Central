//$Id$		
	(function($)
	{

		jQuery.extend({TAG_NAMES : 
			{
				'select':'input', // no i18n
				'change':'input',  // no i18n
				'submit':'form', // no i18n
				'reset':'form', // no i18n
				'error':'img', // no i18n
				'load':'img', // no i18n
				'abort':'img' // no i18n
			},

			isEventSupported : function(eventName) 
			{
				var el = document.createElement(this.TAG_NAMES[eventName] || 'div');
				eventName = 'on' + eventName;  // no i18n
				var isSupported = (eventName in el);
				if (!isSupported) 
				{
					el.setAttribute(eventName, 'return;');
					isSupported = typeof el[eventName] == 'function';
				}
				el = null;
				return isSupported;
			},
			
			isTouchDevice: function()
			{
				return this.isEventSupported('touchmove'); // no i18n
			}
	});
	})(jQuery);

	var divId = "floorDiv";//No I18N
	var light;
	var ambientLight;
	var grid;
	var cameraPositionX = 0;
	var cameraPositionZ = 0;
	var rackU = 44;
	var rackWidth = 30; 
	var rackUnitSize = 3; 
	var rackDepth = 30; 
	var baseHeight = 20;
	var rackX = 2*30;
	var rackZ = 0.9*30;
	var floorHeight = 150;
	var cpos = 0;
	var cameraX;
	var cameraY;
	var cameraZ;
	var plane;	
	var planeCube;
	var paused = false;
	var down = false;
	var tempFloorID;	
	var isCamAngleChanged = false;
	

	function setCameraAxis(direction,val)
	{
		if(direction == "X")
		{
			if(isAutoRotate == "true")
			{
				rotationCounterX = rotationCounterX+parseInt(val);	
			}
			else
			{
				camera.position.x = parseInt(camera.position.x)+parseInt(val);
			}
		}	
		if(direction == "Y")
		{
			camera.position.y = parseInt(camera.position.y)+parseInt(val);
		}	
		if(direction == "Z")
		{
			if(isAutoRotate == "true")
			{
				rotationCounterZ = rotationCounterZ+parseInt(val);					
			}
			else
			{
				camera.position.z = parseInt(camera.position.z)+parseInt(val);
			}
		}
		camera.lookAt(scene.position);
		renderer.render(scene,camera);
	}

	function setCameraPosition()
	{
		camera.position.x = document.getElementById("angleX").value;
		camera.position.y = document.getElementById("angleY").value;
		camera.position.z = document.getElementById("angleZ").value;
		camera.lookAt(scene.position);
		renderer.render(scene,camera);
	}


	function trigger3D(floorId,jsonObj,cameraType,autoRotate,divId)
	{
		$("#"+divId).empty().removeData("FloorObj");
		
		if(divId === undefined)
		{
			divId = "floorDiv";//No I18N
		}
		OPMClient.RackDetailsController.set("floorViewCamAngle",[]);//No I18N
		$("#"+divId).data("FloorObj",{//No I18N
		w:window.innerWidth,
		h:window.innerHeight-10,
		scene:"",
		camera:"",
		light:"",
		ambientLight:"",
		statPlatform:"",
		barGraph:"",
		renderer:"",
		paused:false,
		down:false,
		sx:0, 
		sy:0,
		rot:Math.PI/2,
		numRows:0,
		numCols:0,
		tileLength:30,
		tileWidth:30,
		totalLength:"", 
		totalWidth :"",
		racksObj:{},
		pathsObj:{},
		aislesObj:{},
		wallsObj:{},
		cbObj:{},
		floorColor:0xffffff,
		tileColor:0x003856,
		fov:45,
		compHeight:0,
		statusColor:"",
		isAutoRotate:"false",
		cameraModel:(cameraType !== undefined && cameraType !== "" ? cameraType : "Perspective"), // no i18N,
		projector:"",
		rotationCounterX:0,
		rotationCounterZ:0
		})

		var floorObj = $("#"+divId).data().FloorObj;
		if($.isTouchDevice())
		{
			floorObj.renderer = new THREE.CanvasRenderer({antialias: true});
		}
		else
		{
			try 
			{ 
				if(!!window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ))
				{
					//In an embed/export view the dashboard is captured with html2canvas, which reads the WebGL
					//canvas back as a bitmap. WebGL clears its drawing buffer after compositing, so without
					//preserveDrawingBuffer the captured Floor widget comes out blank. Enable it only for embed
					//(the static export path) to avoid the small perf cost on the live product.
					floorObj.renderer = new THREE.WebGLRenderer({antialias: true,logarithmicDepthBuffer: true,preserveDrawingBuffer: (window.OPM && window.OPM.isEmbed) ? true : false});
				}
				else
				{
					floorObj.renderer = new THREE.CanvasRenderer({antialias: true});
				}
			} 
			catch( e ) 
			{ 
				floorObj.renderer = new THREE.CanvasRenderer({antialias: true});
			}
		}	

		floorObj.renderer.domElement.addEventListener( 'touchstart', onTouchStart, false );	
		floorObj.renderer.domElement.addEventListener( 'touchmove', onTouchMove, false );	
		floorObj.renderer.domElement.addEventListener( 'touchend', onTouchEnd, false );	

		floorObj.renderer.domElement.addEventListener('mousedown', function (ev){down = true; floorObj.sx = ev.clientX; floorObj.sy = ev.clientY; paused = false;}, false);
		floorObj.renderer.domElement.addEventListener('mouseup', function(ev){
			down = false;
			paused = true;
			if(isCamAngleChanged)
			{
				isCamAngleChanged = false;
				if(floorObj.isAutoRotate === "false")
				{
					/*OPMClient.RackDetailsController.set("floorViewCamAngle",floorObj.camera.position);//No I18N
					$("#opm3dFloorViewAlert").show();*/
				}
			}


		}, false);
		floorObj.renderer.domElement.addEventListener('dblclick'  , onDoubleClick  , false);

		floorObj.renderer.domElement.addEventListener('mousemove', function(ev)
		{
			if (down) 
			{
				isCamAngleChanged = true;
			/*	var dx = ev.clientX - floorObj.sx;
				var dy = ev.clientY - floorObj.sy;
				floorObj.rot += dx*0.01;
				var posX = Math.cos(floorObj.rot)*floorObj.totalLength/2;
                		var posZ = Math.sin(floorObj.rot)*floorObj.totalWidth*0.65;
		                var posY = Math.max(150, floorObj.camera.position.y+dy);
                
                		if(!(isNaN(posX)) && !(isNaN(posY)) && !(isNaN(posZ)))
		                {
                		    floorObj.camera.position.x = posX;
		                    floorObj.camera.position.z = posZ;
                		    floorObj.camera.position.y = posY;
		                    floorObj.sx += dx;
				    		floorObj.sy += dy;
		                }*/
			}
			else
			{
				var mouseX = ev.clientX - getElementPosition(floorObj.renderer.domElement).left;
				var mouseY = ev.clientY - getElementPosition(floorObj.renderer.domElement).top;
				var x =   (mouseX / floorObj.renderer.domElement.width) * 2 - 1;
				var y = - (mouseY / floorObj.renderer.domElement.height) * 2 + 1; 
			}
		}, false);


		THREE.LeftAlign = 1;
		THREE.CenterAlign = 0;
		THREE.RightAlign = -1;
		THREE.TopAlign = -1;
		THREE.BottomAlign = 1;

		floorObj.w = $("#"+divId).width();
		if($('html').hasClass('onScrollTopBandHide'))
		{
			floorObj.h = ($("#"+divId).height()) - 5;
		}
		else{
			floorObj.h = ($("#"+divId).height()+80) - 5;
		}

		clearVariables(divId); 
		floorObj.isAutoRotate = (jsonObj.Rotation !== undefined ? jsonObj.Rotation : autoRotate);
		if(jsonObj.Rotation !== undefined && jsonObj.Rotation === "false" && jsonObj.Rotation_X !== undefined)
		{
			floorObj.RotationX = jsonObj.Rotation_X;
			floorObj.RotationY = jsonObj.Rotation_Y;
			floorObj.RotationZ = jsonObj.Rotation_Z;
		}
//		getFloorData(floorId);
//		alert(floorId);	
		tempFloorID = floorId;		
		parseFloorData(floorObj,jsonObj,floorId);		
		//prepareGrid();
		
		init(floorObj,divId);
		createFloor(floorObj);
		createRacks(floorObj);
		createPath(floorObj);
		createAisle(floorObj);
		createWall(floorObj);
		animate(divId);
		
	}

	function clearVariables(divId)
	{
		var floorObj = $("#"+divId).data().FloorObj;
		grid = [];
		floorObj.cbObj = {};
		rackComponents = {};
		floorObj.racksObj = {};
		floorObj.pathsObj = {};
		floorObj.aislesObj = {};
		floorObj.wallsObj = {};
		floorObj.projector = new THREE.Projector();
		floorObj.barGraph = new THREE.Object3D();
		floorObj.statPlatform = new THREE.Object3D();
		OPMClient.FloorDetailsController.floorAnimateStart = true;		
	}

/*	function getFloorData(floorId)
	{
		var jsonData;
		xhr = new XMLHttpRequest();
		url=window.OPM.apiUrlPattern + "/maps/getFloorDetails?floorId="+floorId; //No I18N
		xhr.onreadystatechange = function(e) {
		if ( xhr.readyState === 4 && xhr.status === 200 ) 
		{
			jsonData = xhr.responseText;
			jsonObj = JSON.parse(jsonData);
			parseFloorData(jsonObj,floorId);
		}
		};
		xhr.send(null);
	}		
	*/
	function parseFloorData(floorObj,jsonFloorData,floorId)
	{
		for (j in jsonFloorData.floor)
		{
			floorObj.totalWidth  = parseInt(jsonFloorData.floor[j].specification.floorLength);
			floorObj.totalLength   = parseInt(jsonFloorData.floor[j].specification.floorWidth);
			floorObj.floorColor   = jsonFloorData.floor[j].specification.floorColor;
			floorObj.tileLength   = parseInt(jsonFloorData.floor[j].specification.tileLength);
			floorObj.tileWidth    = parseInt(jsonFloorData.floor[j].specification.tileWidth);
			floorObj.tileColor    = jsonFloorData.floor[j].specification.tileColor;
			floorObj.numCols      = Math.round(floorObj.totalLength/floorObj.tileLength);
			floorObj.displayName  = jsonFloorData.floor[j].specification.displayName;
			if(floorObj.totalLength%floorObj.tileLength != 0 && floorObj.totalLength%floorObj.tileLength < (floorObj.tileLength/2))
			{
				floorObj.numCols = floorObj.numCols+1;
			}
			floorObj.numRows      = floorObj.totalWidth/floorObj.tileWidth;
			if(floorObj.totalWidth%floorObj.tileWidth != 0 && floorObj.totalWidth%floorObj.tileWidth < (floorObj.tileWidth/2))
			{
				floorObj.numRows = floorObj.numRows+1;
			}
			floorObj.racksObj     = jsonFloorData.floor[j].racks;
			floorObj.pathsObj     = jsonFloorData.floor[j].paths;
			floorObj.aislesObj    = jsonFloorData.floor[j].aisles;
			floorObj.wallsObj     = jsonFloorData.floor[j].walls;
		} 
		floorObj.numRows = parseInt(floorObj.numRows);
		floorObj.numCols = parseInt(floorObj.numCols);


		var floorCol = floorObj.floorColor;
		if (floorCol != "")
		{
			$("#myColor").val(floorCol.substring(2));
			$("#myColor").css("background","#"+floorCol.substring(2));
		}
		var tileCol = floorObj.tileColor;
		if (tileCol != "")
		{
			$("#myColor1").val(tileCol.substring(2));	
			$("#myColor1").css("background","#"+tileCol.substring(2));	
		}
	}

/*		function prepareGrid()
	{
		for (var y=0; y<numRows; y++) 
		{
        		grid[y] = [];
	        	for (var x=0; x<numCols; x++) 
			{
				grid [y] [x] = 0;
	          	}
		}
	}
*/
	function setCameraAngle()
	{
		var floorObj = $("#"+divId).data().FloorObj;
		floorObj.fov = document.getElementById("angleVal").value;
		setCameraType(floorObj,floorObj.cameraModel,false);
		floorObj.camera.lookAt(floorObj.scene.position);
		floorObj.renderer.render(floorObj.scene,floorObj.camera);
	}

	function setCameraPosition()
	{
		var floorObj = $("#"+divId).data().FloorObj;
		var camPosX = document.getElementById("angleX").value;
		var camPosY = document.getElementById("angleY").value;
		var camPosZ = document.getElementById("angleZ").value;
		if(!(isNaN(camPosX)) && !(isNaN(camPosY)) && !(isNaN(camPosZ)))
		{	
			floorObj.camera.position.x = camPosX;
			floorObj.camera.position.y = camPosY;
			floorObj.camera.position.z = camPosZ;
			floorObj.camera.lookAt(floorObj.scene.position);
			floorObj.renderer.render(floorObj.scene,camera);
		}
	}

	function setCameraType(floorObj,cameraType,setDefaultPosition)
	{
		floorObj.scene.remove(floorObj.camera);
		floorObj.cameraModel = cameraType;
		if(cameraType == "Orthographic")
		{
			floorObj.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 1000, 1000 );
			if(setDefaultPosition)
			{
				floorObj.camera.position.x = 0;
				floorObj.camera.position.y = 400;
				floorObj.camera.position.z = 0;
			}
		}
		else if(cameraType == "Combined")
		{
			floorObj.camera = new THREE.CombinedCamera( window.innerWidth / 2, window.innerHeight / 2, 70, 1, 1000, - 500, 1000 );
			if(setDefaultPosition)
			{
				floorObj.camera.position.x = 200;
				floorObj.camera.position.y = 100;
				floorObj.camera.position.z = 200;						
			}
		}
		else
		{	
			floorObj.camera = new THREE.PerspectiveCamera(floorObj.fov, floorObj.w/floorObj.h, 1, 10000 );
			if(setDefaultPosition)
			{
				floorObj.camera.position.y = floorHeight*1.75;
				floorObj.camera.position.x = floorObj.totalLength/2;
				floorObj.camera.position.z = floorObj.totalWidth*0.65;
			}

			controls = new THREE.OrbitControls(floorObj.camera, floorObj.renderer.domElement );
			controls.minDistance = 100;
			controls.maxDistance = 900;
			controls.maxPolarAngle = Math.PI / 2 - 0.15;
			controls.addEventListener('end',function(ev){//No I18N
				if(floorObj.isAutoRotate === "false")
				{
					var preVal = OPMClient.RackDetailsController.floorViewCamAngle;
					if(parseInt(preVal.x) !== parseInt(floorObj.camera.position.x) || parseInt(preVal.y) !== parseInt(floorObj.camera.position.y) || parseInt(preVal.z) !== parseInt(floorObj.camera.position.z))
					{
						OPMClient.RackDetailsController.set("floorViewCamAngle",{x:parseFloat(floorObj.camera.position.x),y: parseFloat(floorObj.camera.position.y),z: parseFloat(floorObj.camera.position.z)});//No I18N
						$("#opm3dFloorViewAlert").show();
					}
				}
			});
			controls.update();

		}		
		if(setDefaultPosition)
		{
			if($("#angleX").length)
			{
			document.getElementById("angleX").value = floorObj.camera.position.x;
			document.getElementById("angleY").value = floorObj.camera.position.y;
			document.getElementById("angleZ").value = floorObj.camera.position.z; 
			document.getElementById("angleVal").value = floorObj.fov;
			}
		}	
		else
		{
			if($("#angleX").length)
			{
			var angleXVal = document.getElementById("angleX").value;
			var angleYVal = document.getElementById("angleY").value;
			var angleZVal = document.getElementById("angleZ").value;
			if(!(isNaN(angleXVal))  && !(isNaN(angleYVal)) && !(isNaN(angleZVal)))
			{
				floorObj.camera.position.x = parseFloat(angleXVal);
				floorObj.camera.position.y = parseFloat(angleYVal);
				floorObj.camera.position.z = parseFloat(angleZVal);		
			}
			}
		}
		floorObj.scene.add(floorObj.camera);
		floorObj.camera.lookAt(floorObj.scene.position);
		floorObj.renderer.render(floorObj.scene,floorObj.camera);		
	}

	
	var controls;
	function setAutoRotate(rotateMode,isUpdate)
	{
		var floorObj = $("#"+divId).data().FloorObj;
		floorObj.isAutoRotate = rotateMode;
		paused = false;	
		if(isUpdate === undefined)	
		{
			if(rotateMode === "false")
			{
				opmUpdateFloorProps("Rotation",false); // no i18n
			}
			else{
				opmUpdateFloorProps("Rotation",true); // no i18n
			}
		}
		setCameraType(floorObj,floorObj.cameraModel,false);
		if(rotateMode == 'false')
		{
			//controls = new THREE.PointerLockControls(floorObj.camera,floorObj.renderer.domElement);
			//floorObj.scene.add( controls.getObject() );	
				floorObj.camera.position.x = parseFloat(266.3325);
				floorObj.camera.position.y = parseFloat(229.62439);
				floorObj.camera.position.z = parseFloat(335.93268);		
				floorObj.scene.add(floorObj.camera);
				floorObj.camera.lookAt(floorObj.scene.position);
				floorObj.renderer.render(floorObj.scene,floorObj.camera);	
				controls.update();
		}
		else{
			$("#opm3dFloorViewAlert").hide();
		}
	}

	function setFloorColor(isUpdate)
	{
		var floorObj = $("#"+divId).data().FloorObj;
//		var colorCode ="0x"+document.getElementById('myColor').color; // no i18n
		var colorCode ="0x"+$('#myColor').val(); // no i18n
		var colorValue = parseInt((colorCode).replace("#","0x"), 16 );// no i18n
		var colorRGB = new THREE.Color(colorValue);
		floorObj.renderer.setClearColor(colorRGB, 1);
		floorObj.camera.lookAt(floorObj.scene.position);
		floorObj.renderer.render(floorObj.scene,floorObj.camera);
		if(isUpdate !== undefined && isUpdate)
		{
			updateFloor("floorColor",colorCode,floorObj.displayName); // no i18n
		}
	}

	function setTileColor(isUpdate)
	{
		var floorObj = $("#"+divId).data().FloorObj;
//		var colorCode ="0x"+document.getElementById('myColor1').color; // no i18n
		var colorCode ="0x"+$('#myColor1').val(); // no i18n
		multiMat[0].color.setHex(colorCode);
		floorObj.camera.lookAt(floorObj.scene.position);
		floorObj.renderer.render(floorObj.scene,floorObj.camera);
		if(isUpdate !== undefined && isUpdate)
		{
			updateFloor("floorTileColor",colorCode,floorObj.displayName);	// no i18n	
		}
	}

	function init(floorObj,divId)
	{  
		floorObj.scene = new THREE.Scene();
		setCameraType(floorObj,floorObj.cameraModel,true);	

		var ambientLight1 = new THREE.PointLight(0xFFFFFF);	
		ambientLight1.position.set(0, 350, 0);
		floorObj.scene.add(ambientLight1);

		floorObj.renderer.setSize(floorObj.w, floorObj.h);
		var colorValue = parseInt((floorObj.floorColor).replace("#","0x"), 16 );// no i18n
		var colorRGB = new THREE.Color( colorValue );
		floorObj.renderer.setClearColor(colorRGB, 1);
		document.getElementById(divId).appendChild(floorObj.renderer.domElement);
	}

	function createFloor(floorObj)
	{
		var colorValue = parseInt((floorObj.tileColor).replace("#","0x"), 16 );// no i18n
		var colorRGB = new THREE.Color( colorValue );
		multiMat = [new THREE.MeshLambertMaterial({color: colorRGB}) , new THREE.MeshBasicMaterial( { color: 0xFFFFFF, wireframe: true, transparent: true, opacity: 0.1,depthWrite:false})];
		planeCube = new THREE.BoxGeometry(floorObj.totalLength,baseHeight,floorObj.totalWidth,floorObj.numCols,0,floorObj.numRows);
		plane = THREE.SceneUtils.createMultiMaterialObject(planeCube, multiMat);
		//plane = new THREE.Mesh(planeCube,new THREE.MeshBasicMaterial({color: tileColor, wireframe: true }));
		plane.receiveShadow = true;
		plane.doubleSided = true;
		floorObj.statPlatform.add(plane)
		
		var rowTitleScale = getTitleScale(floorObj.numRows);
		var columnTitleScale = getTitleScale(floorObj.numCols);

		for (var j=0; j<floorObj.numRows; j++) 
		{
			var title = alignPlane(createText2D(j,'black'), THREE.CenterAlign, THREE.CenterAlign); //No I18N
			title.scale.set(rowTitleScale, rowTitleScale, rowTitleScale);
			title.position.x = (-(floorObj.totalLength/2)-(floorObj.tileLength/2));				
			title.position.z = (floorObj.totalWidth/2)-(j*floorObj.tileWidth);
			title.position.y = baseHeight;
			//title.rotation.x = -Math.PI/2;
			floorObj.statPlatform.add(title);
		}

		for (var j=0; j<floorObj.numCols; j++) 
		{
			var c = String.fromCharCode(j+65);
			var title = alignPlane(createText2D(c,'black'), THREE.CenterAlign, THREE.CenterAlign); //No I18N
			title.scale.set(columnTitleScale, columnTitleScale, columnTitleScale);
			title.position.x = -(floorObj.totalLength/2)+(j*floorObj.tileLength);
			title.position.z = (floorObj.totalWidth/2)+(floorObj.tileWidth/2);
			if(columnTitleScale > 0.5)
			{
				title.position.z += 25;
			}
			title.position.y = baseHeight;
			//title.rotation.x = -Math.PI/2;
			floorObj.statPlatform.add(title);
		}
	}

	function createPath(floorObj)
	{
		$.each(floorObj.pathsObj,function(key,value){
			var geometry = new THREE.PlaneGeometry( 29, 29, 1 );
		       	var material = new THREE.MeshBasicMaterial( {color: 0xFFFED7, side: THREE.DoubleSide,depthWrite:false} ); 
			var plane = new THREE.Mesh( geometry, material );
		       	plane.position.x = (-(floorObj.totalLength/2))+(rackWidth/2)+parseInt(value.pathPositionX);
			plane.position.z = ((floorObj.totalWidth/2))-(rackDepth/2)-parseInt(value.pathPositionZ);
			plane.position.y = 12;	
			plane.rotation.x = -Math.PI/2;
			floorObj.statPlatform.add( plane );	
		});	
	}
	function createAisle(floorObj)
	{
		$.each(floorObj.aislesObj,function(key,value){
			var geometry = new THREE.PlaneGeometry( 29, 29, 1 );
			var texture = new THREE.TextureLoader().load("/apiclient/fluidicv2/img/rack/ColdAisle.png"); // no i18n	
		       	var material = new THREE.MeshBasicMaterial( { map:texture, side: THREE.DoubleSide,depthWrite:false} ); 
			var plane = new THREE.Mesh( geometry, material );
			plane.position.x = (-(floorObj.totalLength/2))+(rackWidth/2)+parseInt(value.aislePositionX);
			plane.position.z = ((floorObj.totalWidth/2))-(rackDepth/2)-parseInt(value.aislePositionZ);
			plane.position.y = 12;	
			plane.rotation.x = -Math.PI/2;
			floorObj.statPlatform.add( plane );	
		});	
	}
	function createWall(floorObj)
	{
		$.each(floorObj.wallsObj,function(key,value){
			var wallCube = new THREE.BoxGeometry( 30, 22*5, 5 );
			var sideTexture = new THREE.TextureLoader().load("/apiclient/fluidicv2/img/rack/Wall_plain.png"); // no i18n	
			var topTexture = new THREE.TextureLoader().load("/apiclient/fluidicv2/img/rack/Wall_top.png"); // no i18n	
		       	var wallMaterials = [
					new THREE.MeshBasicMaterial({map:sideTexture,transparent:true,depthWrite:false}),
					new THREE.MeshBasicMaterial({map:topTexture,transparent:true,depthWrite:false})
				//	new THREE.MeshBasicMaterial({map:topDoorTexture,transparent:true}), 
				//	new THREE.MeshBasicMaterial({map:topDoorTexture,transparent:true}),
				//	new THREE.MeshBasicMaterial({map:doorTexture,opacity:0.2,transparent:true}),
				//	new THREE.MeshBasicMaterial({map:backDoorTexture,opacity:0.7,transparent:true})
					];

					var material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide,depthWrite:false} );

					wallCube.materials = wallMaterials;
				
					wallCube.groups[0].materialIndex = 0;
					wallCube.groups[1].materialIndex = 0;
					wallCube.groups[2].materialIndex = 1;
					wallCube.groups[3].materialIndex = 1;
					wallCube.groups[4].materialIndex = 0;
					wallCube.groups[5].materialIndex = 0;
				

			var plane = new THREE.Mesh( wallCube, wallMaterials );
			
			if(value.position === 'V')
	  		{			
			plane.position.x =(-(floorObj.totalLength/2))+(rackWidth/2)+parseInt(value.wallPositionX)-15;
			plane.position.z = ((floorObj.totalWidth/2))-(rackDepth/2)-parseInt(value.wallPositionZ);
			plane.position.y = 10+11*5;
			plane.rotation.y = Math.PI / 2;
			}
			if(value.position === 'H')
			{
			plane.position.x =(-(floorObj.totalLength/2))+(rackWidth/2)+parseInt(value.wallPositionX);
			plane.position.z = ((floorObj.totalWidth/2))-(rackDepth/2)-parseInt(value.wallPositionZ)+15;
			plane.position.y = 10+11*5;	
			}

			floorObj.statPlatform.add( plane );
		});	
	}
	function createRacks(floorObj)
	{
		racksObj = floorObj.racksObj;
		for (l in racksObj)
		{
			var rackMesh		= null;
			var rackBladeCube	= null;
			var rackBladeMesh	= null;
			var rackFrameMaterial	= null;
			var cubeMaterials = null;
			var statusMaterial = null;
			var rackDispName   	= racksObj[l].displayName;
			var rackName   		= racksObj[l].rackMOId;
			
			var rackX      		= parseInt(racksObj[l].rackPositionX);	
			var rackZ      		= parseInt(racksObj[l].rackPositionZ);
			var rackUnits		= parseInt(racksObj[l].rackLength);
			var rackHeight 		= rackUnits*rackUnitSize;
			var rackComponents	= racksObj[l].deviceList;
			var rackType 		= racksObj[l].type;
			var rackAngle       = racksObj[l].rackAngle;
			var rackNumbering   = racksObj[l].rackNumbering;
			var maxSeverity = 5;
			var statusColorMap = {};
			statusColorMap[1] = faultSeverityColorCodes["critical"];
			statusColorMap[2] = faultSeverityColorCodes["trouble"];
			statusColorMap[3] = faultSeverityColorCodes["attention"];
			statusColorMap[4] = faultSeverityColorCodes["servicedown"];
			statusColorMap[5] = faultSeverityColorCodes["clear"];
			statusColorMap[7] = faultSeverityColorCodes["unmanaged"];

			if(rackNumbering==="true")
			{	
				for (s=0; s <= rackUnits;)
				{
					compHeight = 1;
					var componentObj;
					var statusNotNeed = false;
					if(rackComponents != undefined)
					{
						componentObj = rackComponents[s];
					}
					if(componentObj != undefined)
					{
						compHeight = parseInt(componentObj.uSize);	
						statusColor = statusColorMap[componentObj.status];
						if(statusColor === undefined)
						{
							statusColor = 0x00ff00;
						}
						if(maxSeverity > componentObj.status)
						{	
							maxSeverity = parseInt(componentObj.status);
						}
					}
					rackBladeCube = new THREE.BoxGeometry(Math.ceil((0.99*(rackWidth-4))),rackUnitSize*compHeight,rackDepth,1,1,1); 
					var statusCube = new THREE.BoxGeometry(1.8,rackUnitSize*compHeight+0.5,0,1,1,1);
					if(componentObj != undefined)
					{
						/*var imgSplit  = (componentObj.imageName).split("/");
						var imgNameSplit = (imgSplit[imgSplit.length-1]).split(".swf");
						var imgNameSplit1 = (imgNameSplit[0]).split("_");
*/

					if((componentObj.imageName).indexOf("##") !== -1)
					{
						var imgArr = (componentObj.imageName).split("##");//No I18N
						componentObj.imageName = imgArr[0];
						componentObj.rearImgName = imgArr[1];
					}

					if(componentObj.elementType !== undefined && componentObj.elementType === "PERIPHERAL")
					{
						var imageName = "/images/racks/peripherals/"+componentObj.imageName;//NO I18N
						var rearImgName = imageName;
						statusNotNeed = true;
						if(window.OPM.isEEProbeSelected !== undefined && window.OPM.isEEProbeSelected && componentObj.encodedPeripheralImg !== undefined)
						{
							var imageName = "data:image;base64,"+componentObj.encodedPeripheralImg;//No I18N
							var rearImgName = imageName;
						}
					}
					else{
						var imageName = "/images/racks/front/"+componentObj.imageName;//NO I18N

						if(componentObj.rearImgName !== undefined)
						{
							var rearImgName = "/images/racks/rear/"+componentObj.rearImgName;//NO I18N
							if((componentObj.rearImgName).indexOf("black_back") !== -1  || (componentObj.rearImgName).indexOf("white_back") !== -1)
							{
								rearImgName = "/apiclient/fluidicv2/img/rack/"+componentObj.rearImgName;//NO I18N
							}
							if(window.OPM.isEEProbeSelected !== undefined && window.OPM.isEEProbeSelected && componentObj.encodedRearImg !== undefined)
							{
								rearImgName = "data:image;base64,"+componentObj.encodedRearImg;//No I18N
							}
						}
						else{
							rearImgName = "/apiclient/fluidicv2/img/rack/"+compHeight+"u_black_back.png";//NO I18N
						}

						if(componentObj.rearImgName !== undefined && ((componentObj.imageName).indexOf("black_front") !== -1 || (componentObj.imageName).indexOf("white_front") !== -1))
						{
							imageName = "/apiclient/fluidicv2/img/rack/"+componentObj.imageName;//NO I18N
							
						}
						else if((componentObj.imageName).indexOf("black_front") !== -1 || (componentObj.imageName).indexOf("white_front") !== -1){
							imageName = "/apiclient/fluidicv2/img/rack/"+compHeight+"u_black_front.png";//NO I18N
						}
						if(window.OPM.isEEProbeSelected !== undefined && window.OPM.isEEProbeSelected && componentObj.encodedFrontImg !== undefined)
						{
							imageName = "data:image;base64,"+componentObj.encodedFrontImg;//No I18N
						}
					}

					//	var devFrontImgTexture = new THREE.TextureLoader().load("/apiclient/fluidicv2/img/rack/"+imgNameSplit1[2]+"_"+imgNameSplit1[0]+"_front.png"); // no i18n
					//	var devbackImgTexture = new THREE.TextureLoader().load("/apiclient/fluidicv2/img/rack/"+imgNameSplit1[2]+"_"+imgNameSplit1[0]+"_back.png"); // no i18n					
						var devFrontImgTexture = new THREE.TextureLoader().load(imageName); 
						var devbackImgTexture = new THREE.TextureLoader().load(rearImgName);					
					
						cubeMaterials = [new THREE.MeshBasicMaterial({color:0x4a4a4a}),
							new THREE.MeshBasicMaterial({color:0x4a4a4a}),
							new THREE.MeshBasicMaterial({color:0x4a4a4a}),
							new THREE.MeshBasicMaterial({color:0x4a4a4a}),
							new THREE.MeshBasicMaterial({map:devFrontImgTexture}),
							(statusNotNeed === false ? new THREE.MeshBasicMaterial({color:statusColor,opacity:1,map:devbackImgTexture}) : new THREE.MeshBasicMaterial({map:devbackImgTexture}))];
							statusMaterial = new THREE.MeshBasicMaterial({ color:statusColor,opacity:0.7,transparent:false});
					}
					if(componentObj != undefined)
					{
						//rackBladeCube.materials = cubeMaterials;

					/*	cubeMaterials.faces[0].materialIndex = 0;
						cubeMaterials.faces[1].materialIndex = 1;
						cubeMaterials.faces[2].materialIndex = 2;
						cubeMaterials.faces[3].materialIndex = 3;
						cubeMaterials.faces[4].materialIndex = 4;
						cubeMaterials.faces[5].materialIndex = 5;*/

						//var cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials); 
						rackBladeMesh = new THREE.Mesh(rackBladeCube,cubeMaterials);
						rackBladeMesh.position.z = (((floorObj.totalWidth/2))-(rackDepth/2)-rackZ)+0.1;
						rackBladeMesh.position.y = ((rackUnits-s+1)*rackUnitSize)+(baseHeight/2)+(rackUnitSize)/2-((compHeight-1)*(rackUnitSize/2));  
						rackBladeMesh.position.x = (-(floorObj.totalLength/2))+(rackWidth/2)+rackX;

						rackBladeMesh.names=componentObj.displayName;
						rackBladeMesh.deviceName=componentObj.deviceName;

						var satMesh = new THREE.Mesh(statusCube,statusMaterial);

						satMesh.position.z = rackBladeMesh.position.z+15.8;
						satMesh.position.y = ((rackUnits-s+1)*rackUnitSize)+(baseHeight/2)+(rackUnitSize)/2-((compHeight-1)*(rackUnitSize/2)) +0.4;  
						satMesh.position.x = rackBladeMesh.position.x+13.7; 

						var leftSatMesh = new THREE.Mesh(statusCube,statusMaterial);

						leftSatMesh.position.z = rackBladeMesh.position.z+15.8;
						leftSatMesh.position.y = ((rackUnits-s+1)*rackUnitSize)+(baseHeight/2)+(rackUnitSize)/2-((compHeight-1)*(rackUnitSize/2))+0.4;  
						leftSatMesh.position.x = (rackBladeMesh.position.x-rackWidth/2)+0.8;
						if(rackAngle=="90")
						{
							satMesh.position.x -= 30; 
							leftSatMesh.position.z -= 30;
							leftSatMesh.position.x -= 3;
							
							rackBladeMesh.rotation.y = -Math.PI/2 ; 
							satMesh.rotation.y = -Math.PI/2 ;
							leftSatMesh.rotation.y = -Math.PI/2 ;
						}
						else if(rackAngle=="180")
						{
							satMesh.position.z -= 33; 
							leftSatMesh.position.z -= 33;

							rackBladeMesh.rotation.y = Math.PI ; 
							satMesh.rotation.y = Math.PI ;
							leftSatMesh.rotation.y = Math.PI ;
						}	
						else if(rackAngle=="270")
						{
							leftSatMesh.position.x += 30;
							satMesh.position.z -= 30;
						   	satMesh.position.x += 3; 	
							
							rackBladeMesh.rotation.y = Math.PI/2 ; 
							satMesh.rotation.y = Math.PI/2 ;
							leftSatMesh.rotation.y = Math.PI/2 ;
						}
						if(!statusNotNeed)
						{
							floorObj.barGraph.add(leftSatMesh);
							floorObj.barGraph.add(satMesh);
						}
						floorObj.barGraph.add(rackBladeMesh);
					}
					s = s+compHeight;
				}	
			}	
			else
			{	
				for (s=rackUnits; s >=0;)
				{
					compHeight = 1;
					var componentObj;
					var statusNotNeed = false;
					if(rackComponents != undefined)
					{
						componentObj = rackComponents[s];
					}
					if(componentObj != undefined)
					{
						compHeight = parseInt(componentObj.uSize);	

						statusColor = statusColorMap[componentObj.status];
						if(statusColor === undefined)
						{
							statusColor = 0x00ff00; 
						}	
						if(maxSeverity > componentObj.status)
						{
							maxSeverity = parseInt(componentObj.status);
						}
					}
					rackBladeCube = new THREE.BoxGeometry(Math.ceil((0.99*(rackWidth-4))),rackUnitSize*compHeight,rackDepth,1,1,1); 
					var statusCube = new THREE.BoxGeometry(1.8,rackUnitSize*compHeight+0.5,0,1,1,1);
					if(componentObj != undefined)
					{
						/*var imgSplit  = (componentObj.imageName).split("/");
						var imgNameSplit = (imgSplit[imgSplit.length-1]).split(".swf");
						var imgNameSplit1 = (imgNameSplit[0]).split("_");*/

					if((componentObj.imageName).indexOf("##") !== -1)
					{
						var imgArr = (componentObj.imageName).split("##");//No I18N
						componentObj.imageName = imgArr[0];
						componentObj.rearImgName = imgArr[1];
					}

					if(componentObj.elementType !== undefined && componentObj.elementType === "PERIPHERAL")
					{
						var imageName = "/images/racks/peripherals/"+componentObj.imageName;//NO I18N
						var rearImgName = imageName;
						if(window.OPM.isEEProbeSelected !== undefined && window.OPM.isEEProbeSelected && componentObj.encodedPeripheralImg !== undefined)
						{
							var imageName = "data:image;base64,"+componentObj.encodedPeripheralImg;//No I18N
							var rearImgName = imageName;
						}
					}
					else{
						var imageName = "/images/racks/front/"+componentObj.imageName;//NO I18N

						if(componentObj.rearImgName !== undefined)
						{
							var rearImgName = "/images/racks/rear/"+componentObj.rearImgName;//NO I18N
							if((componentObj.rearImgName).indexOf("black_back") !== -1  || (componentObj.rearImgName).indexOf("white_back") !== -1)
							{
								rearImgName = "/apiclient/fluidicv2/img/rack/"+componentObj.rearImgName;//NO I18N
							}
							if(window.OPM.isEEProbeSelected !== undefined && window.OPM.isEEProbeSelected && componentObj.encodedRearImg !== undefined)
							{
								rearImgName = "data:image;base64,"+componentObj.encodedRearImg;//No I18N
							}
						}
						else{
							rearImgName = "/apiclient/fluidicv2/img/rack/"+compHeight+"u_black_back.png";//NO I18N
						}

						if(componentObj.rearImgName !== undefined && ((componentObj.imageName).indexOf("black_front") !== -1 || (componentObj.imageName).indexOf("white_front") !== -1))
						{
							imageName = "/apiclient/fluidicv2/img/rack/"+componentObj.imageName;//NO I18N
							
						}
						else if((componentObj.imageName).indexOf("black_front") !== -1 || (componentObj.imageName).indexOf("white_front") !== -1){
							imageName = "/apiclient/fluidicv2/img/rack/"+compHeight+"u_black_front.png";//NO I18N
						}
						if(window.OPM.isEEProbeSelected !== undefined && window.OPM.isEEProbeSelected && componentObj.encodedFrontImg !== undefined)
						{
							imageName = "data:image;base64,"+componentObj.encodedFrontImg;//No I18N
						}
					}

					//	var devFrontImgTexture = new THREE.TextureLoader().load("/apiclient/fluidicv2/img/rack/"+imgNameSplit1[2]+"_"+imgNameSplit1[0]+"_front.png"); // no i18n
					//	var devbackImgTexture = new THREE.TextureLoader().load("/apiclient/fluidicv2/img/rack/"+imgNameSplit1[2]+"_"+imgNameSplit1[0]+"_back.png"); // no i18n					
						var devFrontImgTexture = new THREE.TextureLoader().load(imageName); 
						var devbackImgTexture = new THREE.TextureLoader().load(rearImgName);
						cubeMaterials = [
							new THREE.MeshBasicMaterial({color:0x4a4a4a}),
							new THREE.MeshBasicMaterial({color:0x4a4a4a}),
							new THREE.MeshBasicMaterial({color:0x4a4a4a}),
							new THREE.MeshBasicMaterial({color:0x4a4a4a}),
							new THREE.MeshBasicMaterial({map:devFrontImgTexture}),
							(statusNotNeed === false ? new THREE.MeshBasicMaterial({color:statusColor,opacity:1,map:devbackImgTexture}) : new THREE.MeshBasicMaterial({map:devbackImgTexture}))];
							statusMaterial = new THREE.MeshBasicMaterial({ color:statusColor,opacity:0.7,transparent:false});
					}	
					if(componentObj != undefined)
					{
//						rackBladeCube.materials = cubeMaterials;

						/*cubeMaterials.faces[0].materialIndex = 0;
						cubeMaterials.faces[1].materialIndex = 1;
						cubeMaterials.faces[2].materialIndex = 2;
						cubeMaterials.faces[3].materialIndex = 3;
						cubeMaterials.faces[4].materialIndex = 4;
						cubeMaterials.faces[5].materialIndex = 5;*/

					//	cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials); 
						rackBladeMesh = new THREE.Mesh(rackBladeCube,cubeMaterials);
						rackBladeMesh.position.z = (((floorObj.totalWidth/2))-(rackDepth/2)-rackZ)+0.1;
						rackBladeMesh.position.y = ((s)*rackUnitSize)+(baseHeight/2)+(rackUnitSize)/2-((compHeight-1)*(rackUnitSize/2));  
						rackBladeMesh.position.x = (-(floorObj.totalLength/2))+(rackWidth/2)+rackX;
						
						rackBladeMesh.names=componentObj.displayName;	
						rackBladeMesh.deviceName=componentObj.deviceName;	

						var satMesh = new THREE.Mesh(statusCube,statusMaterial);

						satMesh.position.z = rackBladeMesh.position.z+15.8;
						satMesh.position.y = ((s)*rackUnitSize)+(baseHeight/2)+(rackUnitSize)/2-((compHeight-1)*(rackUnitSize/2)) +0.4;  
						satMesh.position.x = rackBladeMesh.position.x+13.7; 

						var leftSatMesh = new THREE.Mesh(statusCube,statusMaterial);

						leftSatMesh.position.z = rackBladeMesh.position.z+15.8;
						leftSatMesh.position.y = ((s)*rackUnitSize)+(baseHeight/2)+(rackUnitSize)/2-((compHeight-1)*(rackUnitSize/2))+0.4;  
						leftSatMesh.position.x = (rackBladeMesh.position.x-rackWidth/2)+0.8;
						if(rackAngle=="90")
						{
							satMesh.position.x -= 30; 
							leftSatMesh.position.z -= 30;
							leftSatMesh.position.x -= 3;
							
							rackBladeMesh.rotation.y = -Math.PI/2 ; 
							satMesh.rotation.y = -Math.PI/2 ;
							leftSatMesh.rotation.y = -Math.PI/2 ;
						}
						else if(rackAngle=="180")
						{
							satMesh.position.z -= 33; 
							leftSatMesh.position.z -= 33;

							rackBladeMesh.rotation.y = Math.PI ; 
							satMesh.rotation.y = Math.PI ;
							leftSatMesh.rotation.y = Math.PI ;
						}	
						else if(rackAngle=="270")
						{
							leftSatMesh.position.x += 30;
							satMesh.position.z -= 30;
						   	satMesh.position.x += 3; 	
							
							rackBladeMesh.rotation.y = Math.PI/2 ; 
							satMesh.rotation.y = Math.PI/2 ;
							leftSatMesh.rotation.y = Math.PI/2 ;
						}

						if(!statusNotNeed)
						{
							floorObj.barGraph.add(leftSatMesh);
							floorObj.barGraph.add(satMesh);
						}
						floorObj.barGraph.add(rackBladeMesh);
					}
					s = s-compHeight;
				}
			}	
			
			if(floorObj.renderer instanceof THREE.WebGLRenderer || floorObj.renderer instanceof THREE.CanvasRenderer)
            {
				var filterTexture = new THREE.TextureLoader().load("/apiclient/fluidicv2/img/rack/filler.png"); // no i18n	
				var doorTexture = new THREE.TextureLoader().load("/apiclient/fluidicv2/img/rack/Rack_front_image.jpg"); // no i18n	
				var sideDoorTexture = new THREE.TextureLoader().load("/apiclient/fluidicv2/img/rack/Rack_sides_image.jpg"); // no i18n	
				var backDoorTexture = new THREE.TextureLoader().load("/apiclient/fluidicv2/img/rack/Rack_back_image.jpg"); // no i18n	
				var topDoorTexture = new THREE.TextureLoader().load('data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="'+severityNumColor[maxSeverity]+'"><rect width="64" height="64" /></svg>')); // no i18n
				var rackDoorCube = new THREE.BoxGeometry(rackWidth, rackHeight+10, rackDepth,1,1,1);

				var doorMaterials = [
					new THREE.MeshBasicMaterial({map:sideDoorTexture,transparent:false}),
					new THREE.MeshBasicMaterial({map:sideDoorTexture,transparent:false}),
					new THREE.MeshBasicMaterial({map:topDoorTexture,transparent:true}), 
					new THREE.MeshBasicMaterial({map:topDoorTexture,transparent:true}),
					new THREE.MeshBasicMaterial({map:doorTexture,opacity:0.2,transparent:true}),
					new THREE.MeshBasicMaterial({map:backDoorTexture,opacity:0.7,transparent:true})
					];

				//rackDoorCube.materials = doorMaterials;
				
			/*	doorMaterials.faces[0].materialIndex = 0;
				doorMaterials.faces[1].materialIndex = 1;
				doorMaterials.faces[2].materialIndex = 2;
				doorMaterials.faces[3].materialIndex = 3;
				doorMaterials.faces[4].materialIndex = 4;
				doorMaterials.faces[5].materialIndex = 5;*/
			
				//var doorMaterial = new THREE.MeshFaceMaterial(doorMaterials); 
				var doorMesh = new THREE.Mesh( rackDoorCube, doorMaterials);
				doorMesh.position.x     = (-(floorObj.totalLength/2))+(rackWidth/2)+rackX;	
				doorMesh.position.y     = (rackHeight/2)+(baseHeight/2);
				doorMesh.position.z     = ((floorObj.totalWidth/2))-(rackDepth/2)-rackZ;
				doorMesh.name		= rackName;
				if(rackAngle=="90")
				{
					doorMesh.rotation.y = -Math.PI/2; 
				}
				else if(rackAngle=="180")
				{
					doorMesh.rotation.y = Math.PI ; 
				}
				else if(rackAngle=="270")
				{
					doorMesh.rotation.y = Math.PI/2; 
				}
				floorObj.statPlatform.add(doorMesh);				
			}

		//	var rackCube 		= new THREE.BoxGeometry(rackWidth, rackHeight, rackDepth,1,rackUnits,1);					
		//	rackFrameMaterial       = new THREE.MeshLambertMaterial({color:0x4a4a4a,wireframe:true,wireframe_linewidth:1,transparent:true});
		//	rackMesh                = new THREE.Mesh(rackCube,rackFrameMaterial);	
		//	rackMesh.position.x     = (-(totalLength/2))+(rackWidth/2)+rackX;
		//	rackMesh.position.y     = (rackHeight/2)+(baseHeight/2);
		//	rackMesh.position.z     = ((totalWidth/2))-(rackDepth/2)-rackZ;
			var x     = (-(floorObj.totalLength/2))+(rackWidth/2)+rackX;
			var y     = (rackHeight/2)+(baseHeight/2);
			var z     = ((floorObj.totalWidth/2))-(rackDepth/2)-rackZ;
				
			//createNameBoard(rackMesh.position.x,rackHeight,rackMesh.position.z+rackDepth/2+10,rackName,0.25);
			createNameBoard(floorObj.statPlatform,x,rackHeight,z+rackDepth/2+10,rackDispName,0.20,rackAngle);

		}


		if(floorObj.isAutoRotate === "false" && floorObj.RotationX !== undefined){
			
			floorObj.camera.position.x = parseFloat(floorObj.RotationX);
			floorObj.camera.position.y = parseFloat(floorObj.RotationY);
			floorObj.camera.position.z = parseFloat(floorObj.RotationZ);	
			OPMClient.RackDetailsController.set("floorViewCamAngle",{x:parseFloat(floorObj.RotationX),y:parseFloat(floorObj.RotationY),z:parseFloat(floorObj.RotationZ)});//No I18N
	
		}

		floorObj.scene.add(floorObj.statPlatform);
		floorObj.scene.add(floorObj.barGraph);
		floorObj.camera.lookAt(floorObj.scene.position);
		floorObj.renderer.render(floorObj.scene,floorObj.camera);

	}


		function getTitleScale(totalLength)
		{			
			var titleScaleVal = 0.25;
			if(totalLength <= 20)
			{
				titleScaleVal = 0.25;
			}
			else if(totalLength > 20 && totalLength <= 30)
			{
				titleScaleVal = 0.5;
			}
			else
			{
				titleScaleVal = 0.75;
			}
			return titleScaleVal;
		}

		function createTextCanvas(text, color, font, size) 
		{
			size = size || 24;
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d'); //No I18N
			var fontStr = (size + 'pt ') + (font || 'Arial'); //No I18N
			ctx.font = fontStr;
			var cw = ctx.measureText(text).width;
			var ch = Math.ceil(size*1.25);
			canvas.width = cw;
			canvas.height = ch;
			ctx.font = fontStr;
			ctx.fillStyle = color || 'black'; //No I18N
			ctx.fillText(text, 0, size);
			return canvas;
		}

		function createText2D(text, color, font, size, segW, segH) 
		{
			var canvas = createTextCanvas(text, color, font, size);
			var plane = new THREE.PlaneGeometry(canvas.width, canvas.height, segW, segH);
			var tex = new THREE.Texture(canvas);
			tex.needsUpdate = true; //if not true then letters will not be visible
			var planeMat = new THREE.MeshBasicMaterial({map: tex, color: 0xffffff, transparent: true,depthWrite:false});
			var mesh = new THREE.Mesh(plane, planeMat);
			mesh.doubleSided = false;
			return mesh;
		}

		function alignPlane(plane, horizontalAlign, verticalAlign) 
		{
			var obj = new THREE.Object3D();
			var ux = plane.geometry.attributes.position.array[0];
			var uz = plane.geometry.attributes.position.array[2];
			var vx = plane.geometry.attributes.position.array[plane.geometry.attributes.position.array.length-3];
			var vz = plane.geometry.attributes.position.array[plane.geometry.attributes.position.array.length-2];
			var width = Math.abs(ux - vx);
			var height = Math.abs(uz - vz);
			plane.position.x = (width/2) * horizontalAlign;
			plane.position.z = (height/2) * verticalAlign;
			plane.position.y = 1;
			plane.rotation.x = -Math.PI / 2; //added this to make the letters appear proper in r49 of Three.js. 
			obj.add(plane);
			return obj;
		}


		var getElementPosition = function(element) 
		{
			var top = left = 0;
			do 
			{
				top  += element.offsetTop  || 0;
				left += element.offsetLeft || 0;
				element =  element.offsetParent;
			}
			while (element);
			return {top: top, left: left};
		}

		function onDoubleClick(ev)
		{
			var divId = ev.target.parentElement.id;
			var floorObj = $("#"+divId).data().FloorObj;

			//var mouseX = ev.clientX - getElementPosition(floorObj.renderer.domElement).left;
		/*        var mouseY = ev.clientY - getElementPosition(floorObj.renderer.domElement).top;
			var x =   (mouseX / floorObj.renderer.domElement.width) * 2 - 1;
			var y = - (mouseY / floorObj.renderer.domElement.height) * 2 + 1;
			
			var vector = new THREE.Vector3(x,y,1);
		//	floorObj.projector.unprojectVector(vector, floorObj.camera);
			vector.unproject(floorObj.camera);
			var ray = new THREE.Raycaster(floorObj.camera.position, vector.sub(floorObj.camera.position).normalize());
			var intersects = ray.intersectObjects(floorObj.barGraph.children);
			var intersects1 = ray.intersectObjects(floorObj.statPlatform.children);
		*/	 
			 var elementRect = floorObj.renderer.domElement.getBoundingClientRect();
			 var raycaster = new THREE.Raycaster();
  			 var vectMouse = new THREE.Vector3();
  			 vectMouse.unproject(floorObj.camera);
			 vectMouse.x = ((event.clientX - elementRect.left) / elementRect.width) * 2 - 1;
		     vectMouse.y = -((event.clientY - elementRect.top) / elementRect.height) * 2 + 1;
			 raycaster.setFromCamera(vectMouse, floorObj.camera);
			   
  				  var intersectsNew = raycaster.intersectObjects(floorObj.scene.children);  				
			      if (intersectsNew.length > 0 && intersectsNew[0].object !== undefined && intersectsNew[0].object.name && intersectsNew[0].object.name !== "") {
			         var clicked = intersectsNew[0].object;
			         var rackName = clicked.name;
			         if(rackName != "" && rackName != undefined)
						{
							paused = false;
							window.location.href = window.OPM.apiclientUrl+"Maps/ThreeDRacks/View/"+rackName;
						}
			     }
			     else{
			     	var deviceBlade = raycaster.intersectObjects(floorObj.barGraph.children);
			     	if(deviceBlade.length > 0 && deviceBlade[0].object.deviceName !== undefined && deviceBlade[0].object.deviceName !== "")
					{
						paused = false;	
						window.location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+deviceBlade[0].object.deviceName;
					}
			     }

			      
			/*if(intersects1.length > 0)
			{
				var faces = (intersects1[0].face);
				if((faces.materialIndex != undefined) && (faces.materialIndex != 4) && (faces.materialIndex != 5))
				{
					
					if(intersects1.length > 0)
					{
						var rackName = intersects1[0].object.name;
						if(rackName != "" && rackName != undefined)
						{
							paused = false;
							window.location.href = window.OPM.apiclientUrl+"Maps/ThreeDRacks/View/"+rackName;
						}
					}
				}
				else
				{		
					if(intersects.length > 0 && intersects[0].object.deviceName !== undefined && intersects[0].object.deviceName !== "")
					{
						paused = false;	
						window.location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+intersects[0].object.deviceName;
					}
					else
					{	
						
						if(intersects1.length > 0)
						{
							var rackName = intersects1[0].object.name;
							if(rackName != "" && rackName != undefined)
							{
								paused = false;
								window.location.href = window.OPM.apiclientUrl+"Maps/ThreeDRacks/View/"+rackName;
							}
						}
					}
				}
			}
	*/		
		}

		function onTouchStart(evt) 
	        {
        		event.preventDefault();            
			down = true; 
			sx = evt.touches[0].pageX; 
			sy = evt.touches[0].pageY; 
			paused = false;
                }

	        function onTouchEnd(evt) 
        	{
			event.preventDefault();            
			down = false;
			paused = true;
                }

        	function onTouchMove( ev ) 
        	{
			event.preventDefault();            
			if (down) 
			{
                		var dx = ev.touches[0].pageX - sx;
		                var dy = ev.touches[0].pageY - sy;
                		rot += dx*0.01;
		                camera.position.x = Math.cos(rot)*totalLength/2;
                		camera.position.z = Math.sin(rot)*totalWidth*0.65;
		                sx += dx;
                		sy += dy;
			}
		}
		

		

		function clearScene()
		{
			scene.remove(barGraph);
			scene.remove(statPlatform);
			scene.remove(light);
			scene.remove(ambientLight);
			scene.remove(camera);
		}

		function createTopViewBoard(x,y,z,n,fontSize)
		{
			var nb = alignPlane(createText2D(n,'white'), THREE.CenterAlign, THREE.CenterAlign); //No I18N
			nb.scale.set(fontSize,fontSize,fontSize);
			nb.position.x = x;
			nb.position.z = z-(tileWidth/2);
			nb.position.y = y+20;
			statPlatform.add(nb);
		}

		function createNameBoard(statPlatform,x,y,z,n,fontSize,angle)
		{
			var nb = alignPlane(createText2D(n,'white'), THREE.CenterAlign, THREE.CenterAlign); //No I18N
			nb.scale.set(fontSize,fontSize,fontSize);
			nb.position.x = x;
			nb.position.z = z;
			nb.position.y = y+5;
			nb.rotation.x = Math.PI / 2;
			if(angle=="90")
			{
				nb.rotation.y = -Math.PI/2 ;
				nb.position.z = z-22;
				nb.position.x = x-20;
			}
			else if(angle=="180")
			{
				nb.rotation.y = Math.PI ;
				nb.position.z = z-50;
			}
			else if(angle=="270")
			{
				nb.rotation.y = Math.PI/2 ;
				nb.position.z = z-25;
				nb.position.x = x+30;
			}
			statPlatform.add(nb);
		}

		function animateWithAutoRotation(renderer,scene,camera) 
		{
			render(renderer,scene,camera);
		}

		function render(renderer,scene,camera) 
		{
			var timer = Date.now() * 0.0001;
			camera.position.x = Math.cos( timer ) * 400;
			camera.position.z = Math.sin( timer ) * 400;
			camera.lookAt( scene.position );
			renderer.render( scene, camera );
		}

		function animate(divId) 
		{
			if($("#"+divId).data() !== undefined)
			{
				var floorObj = $("#"+divId).data().FloorObj;
				if(floorObj.isAutoRotate == "true")
				{
					animateWithAutoRotation(floorObj.renderer,floorObj.scene,floorObj.camera);
				}
				else
				{	
					controls.update();
					floorObj.camera.lookAt(floorObj.scene.position);
					floorObj.renderer.render(floorObj.scene,floorObj.camera );

					if (!paused) 
					{
						//camera.lookAt(scene.position);
						//renderer.render(scene, camera);
						if(down)
						{
							paused = false;
						}
						else
						{
							paused = true;
						}
					}
					//window.requestAnimationFrame(animate);
				}
				if(OPMClient.FloorDetailsController.floorAnimateStart === true)
				{
					requestAnimationFrame(function(){animate(divId)});
				}
			}
		}		


		function updateFloor(varName, varValue,displayName)
		{	
			if(flrDetails.floorId !== undefined)
			{
				tempFloorID = flrDetails.floorId;
			}


			$.post(window.OPM.apiUrlPattern + "/maps/updateFloor?floorId="+tempFloorID+"&floorLabel="+displayName+"&"+varName+"="+varValue,function(data){ //No I18N
				
			if(data.UpdateFloorStatus !== undefined && data.UpdateFloorStatus === "Success")
			{
				document.getElementById('resDiv').style.backgroundColor = '#00FF00'; //No I18N
				document.getElementById('resDiv').style.display = 'block'; //No I18N
				$("#resDiv").text(Ember.I18n.t('webclient.rack.bgcolorandtilecolorupdatedsuccess',this));	//No I18N
				$("#resDiv").fadeOut(7000);
			}
			else if(data.UpdateFloorStatus !== undefined && data.UpdateFloorStatus === "Failed")
			{
				document.getElementById('resDiv').style.backgroundColor = '#FF0000'; //No I18N
				document.getElementById('resDiv').style.display = 'block'; //No I18N
				$("#resDiv").text(Ember.I18n.t('webclient.rack.bgcolorandtilecolorupdationfailed',this));	//No I18N
				$("#resDiv").fadeOut(7000);
			}
			else
			{
				showMessage(data);
			}
			});
		}

		function setDefaultColors()
		{
			$("#myColor").val("ffffff"); // no i18n
			$("#myColor").css("background","#ffffff");//No I18N
			setFloorColor(false);
			$("#myColor1").val("003856"); // no i18n
			$("#myColor1").css("background","#003856");//No I18N
			setTileColor(false);
			var floorObj = $("#"+divId).data().FloorObj;
			var url = window.OPM.apiUrlPattern + "/maps/updateFloor?floorId="+tempFloorID+"&floorLabel="+floorObj.displayName+"&floorColor=0xffffff&floorTileColor=0x003856";//No I18N
			var resp = opm_ajaxPostRequest(url);
			opmUpdateFloorProps("Rotation",true); // no i18n
			showMessage(resp);
			setAutoRotate("true",false);

		}

		function onWindowResize()
	        {
	        	var floorObj = $("#"+divId).data().FloorObj;
        		setCameraType(floorObj,cameraModel,false);
            		floorObj.camera.updateProjectionMatrix();
            		floorObj.renderer.setSize( window.innerWidth, window.innerHeight );
            		w = window.innerWidth;
            		h = window.innerHeight;        
            		render();
		}

		function showCameraOptions(obj)
		{
			var idToShow = $(obj).attr("id"); // no i18n	
			idToShow = "#"+idToShow+"submenu"; // no i18n
			$(idToShow).show();

			$(".bottommenu").mousemove(function(){
			//$(".submenu").hide(); // no i18n
			var idToShow = $(this).attr("id"); // no i18n
			idToShow = "#"+idToShow+"submenu"; // no i18n
			$(idToShow).show();
			});

			$(".submenu").mouseout(function(){$(".submenu").hide();});
		}
		function callShowPicker(obj,defaultColor,type)
		{
			//var myColor = new jscolor.color(obj).showPicker();
			var myColor = ($(obj).val() !== undefined && $(obj).val() !== "" ? $(obj).val() : defaultColor);
			$(obj).ColorPicker({
				eventName:'click', //No I18N
				color: "#"+myColor,
				onShow: function (colpkr) {
					$(obj).css('backgroundColor', '#' + $(obj).val());//No I18N
					$(colpkr).fadeIn(500);
					$(".colorpicker").css('top',($(obj).offset().top+75)+"px");//No I18N
				},
				onHide: function (colpkr) {
					$(colpkr).fadeOut(500);
				},
				onChange: function(hsb, hex, rgb) {
					$(obj).val(hex);
					$(obj).css('backgroundColor', '#' + hex);//No I18N
					if(type === 'font')	
					{
						setBvBgColorNew('font');//No I18N
					}
					else if(type === 'bg')	
					{
						setBvBgColorNew('bg');//No I18N
					}
				}

			});

		}
		function opmSetColorPicker(obj,defaultColor,type)
		{
			var myColor = ($(obj).val() !== undefined && $(obj).val() !== "" ? $(obj).val() : defaultColor);
			$(obj).ColorPicker({
				eventName:'click', //No I18N
				color: "#"+myColor,
				onShow: function (colpkr) {
					$(obj).css('backgroundColor', '#' + myColor);//No I18N
					$(colpkr).fadeIn(500);
					$(".colorpicker").css('top',($(obj).offset().top+Math.abs($("#v2HtmlHolder").position().top)+15)+"px");//No I18N
				},
				onHide: function (colpkr) {
					$(colpkr).fadeOut(500);
				},
				onChange: function(hsb, hex, rgb) {
					$(obj).val(hex);
					$(obj).css('backgroundColor', '#' + hex);//No I18N
				}

			});
			 $(".colorpicker_color").mouseup(function() {//No I18N
			    	if(type == 'floor')
			    	{
			    		setFloorColor(true)
			    	}
			    	else if(type == 'tile')
			    	{
			    		setTileColor(true);
			    	}

			   })	
		}

function fitToScreenMode()
{
	
	$("#floorView_normal").css("display","inline-block");
	$("#floorView_fit").css("display","none");
	
	if(OPMClient.RackDetailsController.rack2Dview)
	{
		var rckLen = $("#rack2DView_container .rack-table-container").length;
		if(rckLen > 2)
		{
			$(".rack-floor-pagination").addClass("active");	//No I18N
		}
		
		localStorage.setItem("rack2DViewFitScreen",false);//No I18N
		normalScreenRack2Dview();
	}
	else{
		var floorObj = $("#"+divId).data().FloorObj;
		$("#topband").css("display","none");
		$("body").css("margin-right","0px");	
		$("#col1").css("display","none");
		$("#col2").css("display","none");
		floorObj.renderer.setSize(window.innerWidth, window.innerHeight);
	}
}
function normalMode()
{

	$("#floorView_normal").css("display","none");
	$("#floorView_fit").css("display","inline-block");
	if(OPMClient.RackDetailsController.rack2Dview)
	{
		$(".rack-floor-pagination").removeClass("active");	
		localStorage.setItem("rack2DViewFitScreen",true);//No I18N
		fitToScreenRack2Dview();
	}
	else{
		var floorObj = $("#"+divId).data().FloorObj;
		$("#col1").show();	
		$("#topband").show();
		$("body").css("margin-right","50px");
		floorObj.renderer.setSize(floorObj.w, floorObj.h);
	}

}
/*
function enableDirectionKeys(camera)
{
	//camera.rotation.set( 0, 0, 0 );

	var camObj = new THREE.Object3D();
	camObj.add( camera );

	var compObj = new THREE.Object3D();
	compObj.position.y = 10;
	compObj.add( camObj );

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var prevTime = performance.now();

	var vel = new THREE.Vector3();
	
	var onKeyDown = function ( event ) {
		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;
		}	
	};

	var onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;
			case 37: // left
			case 65: // a
				moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				moveRight = false;
				break;
		}
	};

	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.getObject = function () {
		return compObj;
	};

	this.update = function () {
		var time = performance.now();
		var delta = ( time - prevTime ) / 1000;

		vel.x -= vel.x * 10.0 * delta;
		vel.z -= vel.z * 10.0 * delta;
		vel.y -= 9.8 * 100.0 * delta;

		if ( moveForward ) {vel.z -= 400.0 * delta};
		if ( moveBackward ) {vel.z += 400.0 * delta};

		if ( moveLeft ) {vel.x -= 400.0 * delta};
		if ( moveRight ) {vel.x += 400.0 * delta};

		compObj.translateX( vel.x * delta );
		compObj.translateY( vel.y * delta ); 
		compObj.translateZ( vel.z * delta );
		if ( compObj.position.y < 10 ) {
			vel.y = 0;
			compObj.position.y = 10;	
		}
		prevTime = time;
	};
}
*/

function opmSave3DviewCameraAngle()
{
	var floorObj = $("#"+divId).data().FloorObj;
	var cameraPos = OPMClient.RackDetailsController.floorViewCamAngle;
	var url = window.OPM.apiUrlPattern + "/maps/updateFloorProps?floorId="+tempFloorID+"&Rotation=false&Rotation_X="+cameraPos.x+"&Rotation_Y="+cameraPos.y+"&Rotation_Z="+cameraPos.z;//No I18N
	var resp = opm_ajaxPostRequest(url);
	showMessage(resp);
	$("#opm3dFloorViewAlert").hide();		
}
function opmUpdateFloorProps(varName,varValue)
{
	if(flrDetails.floorId !== undefined)
	{
		tempFloorID = flrDetails.floorId;
	}
	var url = window.OPM.apiUrlPattern + "/maps/updateFloorProps?floorId="+tempFloorID+"&"+varName+"="+varValue;//No I18N
	var resp = opm_ajaxPostRequest(url);
	showMessage(resp);
}
