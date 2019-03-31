/**
 * @author   Ikaros Kappler
 * @date     2013-08-14
 * @modified 2014-06-19 Ikaros Kappler (included the configurable background image object).
 * @version  1.0.0
 **/

IKRS.PreviewCanvasHandler = function( bezierCanvasHandler,
				      preview_canvas_width,
				      preview_canvas_height 
				    ) {


    this.bezierCanvasHandler = bezierCanvasHandler;

    this.preview_canvas   = document.getElementById("preview_canvas");
    //window.alert( JSON.stringify(this.preview_canvas.parentNode) );
    this.preview_renderer = new THREE.WebGLRenderer( { canvas: this.preview_canvas,
						       preserveDrawingBuffer: true,   // This is required to take screen shots
						       antialias: true
						     } );


    // An array to store the meshes in.
    this.preview_meshes = [];
    this.preview_scene = new THREE.Scene(); 
    this.preview_camera = new THREE.PerspectiveCamera( 75, 
						       preview_canvas_width/preview_canvas_height,  
						       0.1,  // 0.1, 
						       8000  // 2000   // max draw depth (on z)
						     ); 
    // Add custom settings to the camera to we can store the mouse movement inside.   
    this.preview_camera.ikrsSettings = { 
	lastRotationStep: new THREE.Vector2(0,0),
	rotation:         new THREE.Vector4(1.57,3.92,0,0),
	rotationRadius:   500.0
    };
    
    this.preview_camera.position = new THREE.Vector3( 0.39816335536663167, -376.42747328364794,    170.90660641346517 );
    this.preview_camera.rotation = new THREE.Vector3( 1.144602197912255,   0.0009631226746176703, -0.0021213060976673294 );

    
    // create a point light
    this.preview_pointLight =
	new THREE.PointLight(0xFFFFFF);
    
    // set its position
    this.preview_pointLight.position.x = 10;
    this.preview_pointLight.position.y = 50;
    this.preview_pointLight.position.z = 600;

    // add to the scene
    this.preview_scene.add( this.preview_pointLight );
    
    this.preview_canvas.onmousedown = this.preview_mouseDownHandler;
    this.preview_canvas.onmouseup   = this.preview_mouseUpHandler;
    this.preview_canvas.onmousemove = this.preview_mouseMoveHandler;


    // Install a mouse wheel listener
    if( this.preview_canvas.addEventListener ) { 
	// For Mozilla 
	this.preview_canvas.addEventListener( 'DOMMouseScroll', this.mouseWheelHandler, false );
    } else {
	// IE
	this.preview_canvas.onmousewheel = document.onmousewheel = mouseWheelHandler;
    }


    // Prepare a second scene that contains the background only
    //var backgroundTexture = THREE.ImageUtils.loadTexture( "bg_preview.png" );
    var backgroundTexture = THREE.ImageUtils.loadTexture( _DILDO_CONFIG.IMAGES.PREVIEW_BACKGROUND );
    var bg = new THREE.Mesh(
	new THREE.PlaneGeometry( 2, 2, 0 ),
	new THREE.MeshBasicMaterial( { map: backgroundTexture } )
    );
    // The bg plane shouldn't care about the z-buffer.
    bg.material.depthTest = false;
    bg.material.depthWrite = false;    
    this.backgroundScene = new THREE.Scene();
    this.backgroundCam = new THREE.Camera();
    this.backgroundScene.add( this.backgroundCam );
    this.backgroundScene.add( bg );


    
    this.preview_renderer.setSize( preview_canvas_width, 
				   preview_canvas_height 
				 ); 
    // This seems not to be required when the canvas is already defined in the HTML document.
    //document.body.appendChild( this.preview_renderer.domElement );
    //this.preview_canvas.parentNode.appendChild( this.preview_renderer.domElement );


    // Create a backward-link to this so the canvas events have access!
    this.preview_canvas.previewCanvasHandler = this;

    
    this._setCameraPositionFromLocalSettings();
}


IKRS.PreviewCanvasHandler.prototype = new IKRS.Object();
IKRS.PreviewCanvasHandler.prototype.constructor = IKRS.PreviewCanvasHandler;

IKRS.PreviewCanvasHandler.prototype.setRendererSize = function( width, height ) {
     this.preview_renderer.setSize( width, 
				    height 
				  ); 
};

IKRS.PreviewCanvasHandler.prototype.mouseWheelHandler = function( e ) {

    var delta = 0;
    if (!e) // For IE.
	e = window.event;
    if (e.wheelDelta) { // IE/Opera.
	delta = e.wheelDelta/120;
    } else if (e.detail) { // Mozilla case. 
	// In Mozilla, sign of delta is different than in IE.
	// Also, delta is multiple of 3.
	delta = -e.detail/3;
    }
    // If delta is nonzero, handle it.
    // Basically, delta is now positive if wheel was scrolled up,
    // and negative, if wheel was scrolled down.
    if (delta) {
	
	if( delta > 0 )
	    increaseZoomFactor( true ); // redraw
	else
	    decreaseZoomFactor( true ); // redraw
	

    }
    // Prevent default actions caused by mouse wheel.
    // That might be ugly, but we handle scrolls somehow
    // anyway, so don't bother here..
    if (e.preventDefault)
	e.preventDefault();
    e.returnValue = false;

};

IKRS.PreviewCanvasHandler.prototype.getCanvas = function() {
    return this.preview_canvas;
};

IKRS.PreviewCanvasHandler.prototype.getMeshes = function() {
    return this.preview_meshes;
};

/**
 * Due to the THREE.js documentation a CSS-style string is explicitly allowed.
 * @see http://threejs.org/docs/#Reference/Math/Color
 **/
IKRS.PreviewCanvasHandler.prototype.setMaterialColorRGB = function( c, redraw ) {
    for( var i = 0; i < this.preview_meshes.length; i++ ) {
	
	//window.alert( JSON.stringify(this.preview_meshes[i].material.color) );
	this.preview_meshes[i].material.color = new THREE.Color(c);

    }
    if( redraw )
	this.redraw();
};

IKRS.PreviewCanvasHandler.prototype.increaseZoomFactor = function() {
    
    // Would the increase zoom hit the max draw range? (the camera frustum far plane)
    if( this.preview_camera.ikrsSettings.rotationRadius / 1.2 >= this.preview_camera.far )
    	return false; 

    this.preview_camera.ikrsSettings.rotationRadius /= 1.2;
    this._setCameraPositionFromLocalSettings();
    
    return true;
};

IKRS.PreviewCanvasHandler.prototype.decreaseZoomFactor = function() {

    // Would the increase zoom hit the min draw range? (the camera frustum near plane)
    if( this.preview_camera.ikrsSettings.rotationRadius * 1.2 <= this.preview_camera.near )
	return false; 

    this.preview_camera.ikrsSettings.rotationRadius *= 1.2;
    this._setCameraPositionFromLocalSettings();

    return true;
};

IKRS.PreviewCanvasHandler.prototype.preview_mouseMoveHandler = function ( e ) {
  //window.alert( "clicked. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY );
  
  if( this.previewCanvasHandler.latestMouseDownPosition ) {
      
      for( var i = 0; i < this.previewCanvasHandler.preview_meshes.length; i++ ) {
	  this.previewCanvasHandler.preview_meshes[i].rotation.y += (0.01 * (this.previewCanvasHandler.latestMouseDragPosition.x - e.pageX)); 
	  this.previewCanvasHandler.preview_meshes[i].rotation.x += (0.01 * (this.previewCanvasHandler.latestMouseDragPosition.y - e.pageY)); 
      }

      this.previewCanvasHandler.latestMouseDragPosition = new THREE.Vector2( e.pageX, e.pageY );    
  } 
};



IKRS.PreviewCanvasHandler.prototype._setCameraPositionFromLocalSettings = function() {
    
    
    var newCameraOffset_X = new THREE.Vector3( Math.cos( this.preview_camera.ikrsSettings.rotation.x ),
					       Math.sin( this.preview_camera.ikrsSettings.rotation.x ),
					       0 
					     );
    var newCameraOffset_Y = new THREE.Vector3( Math.cos( this.preview_camera.ikrsSettings.rotation.y ),
					       Math.sin( this.preview_camera.ikrsSettings.rotation.y ),
					       0 
					     );

    
    var targetPosition = new THREE.Vector3(0,0,0); // target.position; 
    var radius         = this.preview_camera.ikrsSettings.rotationRadius; // 500.0;

    this.preview_camera.position.x = targetPosition.x + newCameraOffset_X.x * radius;    
    this.preview_camera.position.y = targetPosition.y + newCameraOffset_X.y * radius;


    this.preview_camera.position.y = targetPosition.y + newCameraOffset_Y.x * radius;    
    this.preview_camera.position.z = targetPosition.z + (newCameraOffset_Y.y + newCameraOffset_X.y) * radius;
    
    this.preview_camera.lookAt( targetPosition );
    
    // Also move the point light with the camera	
    this.preview_pointLight.position.set( this.preview_camera.position.x,
					  this.preview_camera.position.y,
					  this.preview_camera.position.z
					);
					
   
}


IKRS.PreviewCanvasHandler.prototype.preview_mouseDownHandler = function( e ) {
  // window.alert( "clicked. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY );
  this.previewCanvasHandler.latestMouseDownPosition = new THREE.Vector2( e.pageX, e.pageY ); 
  this.previewCanvasHandler.latestMouseDragPosition = new THREE.Vector2( e.pageX, e.pageY ); 
}

IKRS.PreviewCanvasHandler.prototype.preview_mouseUpHandler = function( e ) {
  // Clear mouse down position
  this.previewCanvasHandler.latestMouseDownPosition = null;
}



IKRS.PreviewCanvasHandler.prototype.preview_rebuild_model = function() {


    // Fetch bezier path from bezier canvas handler.
    var shapedPath           = this.bezierCanvasHandler.getBezierPath();
 
    // Fetch segment settings.
    var circleSegmentCount   = document.forms["mesh_form"].elements["shape_segments"].value; 
    var pathSegments         = document.forms["mesh_form"].elements["path_segments"].value;


    if( circleSegmentCount*pathSegments > 400*400 ) {
	var confirmed = window.confirm( "The total face count is more than 160000 with these settings.\n" +
					"This might render and process VERY slowly.\n" +
					"\n" +
					"Do you want to continue though?" );
	
	if( !confirmed )
	    return;
    }

    var build_negative_mesh      = document.forms["mesh_form"].elements["build_negative_mesh"].checked;
    var mesh_hull_strength       = document.forms["mesh_form"].elements["mesh_hull_strength"].value;      // in mm
    var mesh_close_path_begin    = document.forms["mesh_form"].elements["mesh_close_path_begin"].checked;
    var mesh_close_path_end      = document.forms["mesh_form"].elements["mesh_close_path_end"].checked;
    var wireFrame                = document.forms["mesh_form"].elements["wireframe"].checked; 
    var triangulate              = document.forms["mesh_form"].elements["triangulate"].checked; 
    var split_shape              = document.forms["mesh_form"].elements["split_shape"].checked;
    var arrange_splits_on_plane  = document.forms["mesh_form"].elements["arrange_splits_on_plane"].checked;
    var pathBendAngle            = Math.max( document.getElementById( "preview_bend" ).value,
					     0.01
					   );
  
    var shapeAxisDistance_pct    = 0.0;
    if( document.getElementById( "preview_axis_offset" ) )
	shapeAxisDistance_pct = document.getElementById( "preview_axis_offset" ).value; // units? pixels? mm?
    
    var twistValue               = 0.0;
    if( getTwistValue )
	twistValue = getTwistValue();  // A value in 0..25 (%)
    var twistAngle               = Math.PI*2.0 * (twistValue/100.0);
    
    
    var shapeStyle               = getSelectedShapeStyle(); // "circle" (default) or "oval"


    var meshDirection            = getSelectedMeshDirection(); // "xyz" or "zxy"
    var hullType                 = getSelectedMeshHullType();  // "perpendicular" or "prism"
    var makeParts                = getSelectedMeshParts();     // "both" or "left" or "right"
    
    // !!! This value is NOT YET INTERPRETED !!!
    var meshHullStyle            = getSelectedMeshHullStyle(); // "continuous" or "discrete"
    

    // "prism" hull type only allowed when split!
    if( !split_shape && hullType == "prism" )
	hullType = "perpendicular";


    // Convert numeric text values to numbers!
    mesh_hull_strength           = parseInt( mesh_hull_strength );
    circleSegmentCount           = parseInt( circleSegmentCount );
    pathSegments                 = parseInt( pathSegments );
    

    // Convert mesh hull strength to bezier units
    mesh_hull_strength  = mesh_hull_strength / this.bezierCanvasHandler.getMillimeterPerUnit();


    var vectorFactories;
    var offsets;
    if( split_shape && arrange_splits_on_plane ) {

	var bezierBounds = shapedPath.computeBoundingBox();

	// Use different vector factories for both splits
	var tmpFactory_A; 
	var tmpFactory_B; 
	if( meshDirection == "xyz" ) {
	    tmpFactory_A = new IKRS.VectorFactory( 1, 1, 1 );
	    tmpFactory_B = new IKRS.VectorFactory( 1, -1, -1 );
	    tmpFactory_A.createVector3 = function( x, y, z ) { 
		return new THREE.Vector3(z,x,y); 
	    };
	    tmpFactory_B.createVector3 = function( x, y, z ) { 
		return new THREE.Vector3(-z,x,-y); 
	    };
	} else {
	    tmpFactory_A = new IKRS.VectorFactory( 1, -1, -1 );
	    tmpFactory_B = new IKRS.VectorFactory( 1, 1, 1 );
	    tmpFactory_A.createVector3 = function( x, y, z ) { 
		return new THREE.Vector3(-z,x,-y); 
	    };
	    tmpFactory_B.createVector3 = function( x, y, z ) { 
		return new THREE.Vector3(z,x,y); 
	    };
	}
	vectorFactories = [
	    tmpFactory_A,
	    tmpFactory_B
	];
	offsets = [
	    new THREE.Vector3( 0, 0,  50 + bezierBounds.getWidth()/2 ),    // Create two 'lying' objects with a distance of 100 px
	    new THREE.Vector3( 0, 0, -50 - bezierBounds.getWidth()/2 )     // NOTE: recognize diameter
	];
    } else {
	vectorFactories = [
	    new IKRS.VectorFactory( 1, 1, 1 ),       // use default factories (x,y,z)
	    new IKRS.VectorFactory( 1, 1, 1 )
	];
	
	offsets = [
	    new THREE.Vector3(0,  50, 0),   // Create two 'standing' objects with a distance of 300 px
	    new THREE.Vector3(0, -50, 0)
	];
    }


    // Temp backup the mesh/view settings.
    var viewSettings = this._getViewSettings();

    // Remove all existing meshes.
    this._clearScene();
    //window.alert( "makeParts=" + makeParts );

    if( !split_shape ||
	makeParts == "both" || 
	makeParts == "left" 
      ) {
	var new_mesh_left = this._buildMeshFromSettings( shapedPath,
							 circleSegmentCount,
							 pathSegments,
							 build_negative_mesh,
							 mesh_hull_strength,
							 mesh_close_path_begin,
							 mesh_close_path_end,
							 wireFrame,
							 triangulate,
							 split_shape,
							 
							 -Math.PI/2.0,  // shape_start_angle
							 
							 offsets[0], // new THREE.Vector3(0,50,0),  // offset,
							 
							 vectorFactories[0],
							 hullType,
							 shapeAxisDistance_pct,
							 pathBendAngle,
							 twistAngle,
							 shapeStyle
						       );
        
	this._addMeshToScene( new_mesh_left, 
			      viewSettings,
			      null  // (split_shape ? new THREE.Vector3(0,50,0) : null)   // offset
			    );
    }
    
    if( split_shape && 
	(makeParts == "both" || makeParts == "right")
      ) {
	//window.alert( "right" );
	var new_mesh_right = this._buildMeshFromSettings( shapedPath,
							  circleSegmentCount,
							  pathSegments,
							  build_negative_mesh,
							  mesh_hull_strength,
							  mesh_close_path_begin,
							  mesh_close_path_end,
							  wireFrame,
							  triangulate,
							  split_shape,
							  
							  // 90DEG more than in the left part!
							  Math.PI/2.0,  // shape_start_angle

							  offsets[1], // new THREE.Vector3(0,-50,0),  // offset
							  vectorFactories[1],
							  hullType,
							  shapeAxisDistance_pct,
							  pathBendAngle,
							  twistAngle,
							  shapeStyle
							);
        
	this._addMeshToScene( new_mesh_right, 
			      viewSettings,
			      null  // (split_shape ? new THREE.Vector3(0,-50,0) : null)  // offset
			    );

    }
    
    
}


IKRS.PreviewCanvasHandler.prototype._addMeshToScene = function( new_mesh,
								viewSettings,
								optionalOffset
							      ) {

    if( !viewSettings )
	viewSettings = this._getViewSettings();

    new_mesh.overdraw    = true;
    new_mesh.doubleSided = false;  // true

    
    
    // Apply view settings
    if( viewSettings.rotation ) {
	
	new_mesh.rotation.set( viewSettings.rotation.x,
			       viewSettings.rotation.y,
			       viewSettings.rotation.z 
			     );

    } else {

	viewSettings.rotation = new THREE.Vector2( 0, 0, 0 ); // new THREE.Vector2( -1.38, 0, 0 );
	new_mesh.rotation.x = viewSettings.rotation.x; // -1.38;
	
    }
    

    if( viewSettings.scale ) {
	new_mesh.scale.set( viewSettings.scale.x,
			    viewSettings.scale.y,
			    viewSettings.scale.z
			  );

    } else {

	viewSettings.scale = new THREE.Vector3( 1.5, 1.5, 1.5 );
	new_mesh.scale.multiplyScalar( 1.5 );
	

    }


    if( optionalOffset ) 
	new_mesh.position.add( optionalOffset );

    
    // Add new meshes to scene.
    this.preview_scene.add( new_mesh );
    this.preview_meshes.push( new_mesh );


    // this._setCameraPositionFromLocalSettings();
}

IKRS.PreviewCanvasHandler.prototype._buildMeshFromSettings = function( shapedPath,
								       circleSegmentCount,
								       pathSegments,
								       build_negative_mesh,
								       mesh_hull_strength,
								       mesh_close_path_begin,
								       mesh_close_path_end,
								       wireFrame,
								       triangulate,
								       split_shape,
								       
								       shape_start_angle,
								       
								       mesh_offset,       // Vector3

								       vectorFactory,
								       meshHullType,      // "perpendicular" or "box"
								       
								       shapeAxisDistance_pct, // float
								       pathBendAngle,
								       twistAngle,
								       shapeStyle
								     ) {
    
    var shapedPathBounds     = shapedPath.computeBoundingBox();
    var circleRadius         = shapedPathBounds.getWidth();

    var shapeAxisDistance    = shapedPathBounds.getHeight() * (shapeAxisDistance_pct/100.0);
    
    //var shapeStyle           = "oval";
    shapePoints              = this._createShapePoints( shapeStyle, split_shape, circleSegmentCount, circleRadius, shape_start_angle );
    /*
	shapePoints = this._createCircleShapePoints( (split_shape ? circleSegmentCount/2 : circleSegmentCount),
						     circleRadius,
						     shape_start_angle, // -Math.PI/2.0,                            // startAngle
						     (split_shape ? Math.PI : Math.PI * 2.0)  // arc
						   );
    */	

    

    var extrusionShape = new THREE.Shape( shapePoints );

    // Extract visual path length (pixels) from bezier's bounding box.
    var pathLength     = shapedPathBounds.getHeight();

    // HINT: THREE.path points do not recognize the z component!
    var pathPoints = [];  
    // Note: the new implementation ALWAYS uses the curved path.
    //       As a curve bend of 0 DEG is not allowd (division by zereo) use a minimal
    //       non-zero angle (e.g. 0.01 DEG).
    /* var pathBendAngle = Math.max( document.getElementById( "preview_bend" ).value,
				  0.01
				);*/

    // The length of the circle arc must be exactly the shape's length
    var tmpCircleRadius   = pathLength / ((pathBendAngle/180.0)*Math.PI);

    for( var i = 0; i < pathSegments; i++ ) {
	var t     = i/ (pathSegments);
	//var angle = Math.PI * t * 0.75;
	var angle = Math.PI * (pathBendAngle/180.0) * t;
	var sin   = Math.sin( angle );
	var cos   = Math.cos( angle );

	
	var pathPoint = new THREE.Vector3( cos * tmpCircleRadius,  // 110?
					   sin * tmpCircleRadius, // 110?
					   0 
					 );

	// translate to center
	pathPoint.add( new THREE.Vector3( -tmpCircleRadius,
					  -pathLength/2, 
					  0
					)
		     );
	pathPoints.push( pathPoint );

    }

 
    
    
    var extrusionPath = new THREE.Path( pathPoints );
    
    
    var extrusionGeometry = new IKRS.PathDirectedExtrudeGeometry( extrusionShape, 
								  extrusionPath,
								  shapedPath,
								  { size:                       pathLength,   // 300,
								    height:                     10,
								    curveSegments:              pathSegments, // 3,
								    triangulate:                triangulate,
								    hollow:                     build_negative_mesh,
								    closePathBegin:             mesh_close_path_begin,
								    closePathEnd:               mesh_close_path_end,
								    perpendicularHullStrength:  mesh_hull_strength,
								    closeShape:                 !split_shape,
								    meshOffset:                 mesh_offset,
								    meshHullType:               meshHullType,
								    shapeAxisDistance:          shapeAxisDistance,
								    twistAngle:                 twistAngle
								  },
								  
								  vectorFactory
								);	
	

    var color            = document.forms["color_form"].elements["color"].value;
    var extrusionMaterial = new THREE.MeshPhongMaterial( 
	{ color: color, // 0x151D28, //0x2D303D, 
	  ambient: 0x996633, // 0xffffff, // 0x996633, // should generally match color
	  specular: 0x888888, // 0x050505,
	  shininess: 50, //100,
	  //emissive: 0x101010, // 0x000000, 
	  wireframe: wireFrame, 
	  shading: THREE.LambertShading // THREE.FlatShading 
	} 
    );

    // As many as there are extrusion steps
    /*
    var extrusionMaterialArray = [ extrusionMaterial,
				   extrusionMaterial
				 ];
    var meshFaceMaterial = new THREE.MeshFaceMaterial( extrusionMaterialArray );
    */

    
    var new_mesh = new THREE.Mesh( extrusionGeometry,
				   extrusionMaterial  // meshFaceMaterial
				 );
    
    return new_mesh;
};
    
IKRS.PreviewCanvasHandler.prototype._createShapePoints = function( shapeStyle,
								   
								   split_shape, 
								   circleSegmentCount, 
								   circleRadius, 
								   shape_start_angle 
								 ) {
    if( shapeStyle == "oval" ) {
	var ovalFactory = new IKRS.OvalShapeFactory( circleRadius,      // radiusX
						     circleRadius*0.66, // radiusY
						     shape_start_angle, 
						     (split_shape ? Math.PI : Math.PI * 2.0) 
						   );
	//window.alert( circleFactory.createShapePoints );
	return ovalFactory.createShapePoints( (split_shape ? circleSegmentCount/2 : circleSegmentCount) );

    } else { // if( shapeStyle == "circle" ) { // DEFAULT
	return this._createCircleShapePoints( (split_shape ? circleSegmentCount/2 : circleSegmentCount),
					      circleRadius,
					      shape_start_angle, // -Math.PI/2.0,                            // startAngle
					      (split_shape ? Math.PI : Math.PI * 2.0)  // arc
					    );
    }
};

/**
 * This function creates the points for a circle shape (with the given segment count).
 **/
IKRS.PreviewCanvasHandler.prototype._createCircleShapePoints = function( circleSegmentCount,
									 circleRadius,
									 startAngle,
									 arc						    
								       ) {
    /*
    var shapePoints = [];

    // If the mesh is split, the shape will be split into two halfs. 
    // -> eventually divide the shape's segment count by two.
    for( i = 0; i <= circleSegmentCount; i++ ) {

	var pct = i * (1.0/circleSegmentCount);
	var angle = startAngle + arc * pct;	    
	shapePoints.push( new THREE.Vector3( Math.sin( angle ) * circleRadius,
					     Math.cos( angle ) * circleRadius,
					     0
					   )
			);
    }
    
    return shapePoints;
    */
    var circleFactory = new IKRS.CircleShapeFactory( circleRadius, startAngle, arc );
    //window.alert( circleFactory.createShapePoints );
    return circleFactory.createShapePoints( circleSegmentCount );
};


IKRS.PreviewCanvasHandler.prototype._getViewSettings = function() {

    var previewSettings = {};

    if( this.preview_meshes.length > 0 ) {

	var mesh = this.preview_meshes[ 0 ];
	previewSettings.rotation = mesh.rotation.clone();
	previewSettings.scale    = mesh.scale.clone();

    } else {

	previewSettings.rotation = new THREE.Vector4(0,0,0,0); // new THREE.Vector4(-1.38,0,0,0);
	previewSettings.scale    = new THREE.Vector3(1,1,1);

    }

    return previewSettings;
}

IKRS.PreviewCanvasHandler.prototype._clearScene = function() {

    // Clear scene
    for( var i = 0; i < this.preview_meshes.length; i++ ) {	    
	this.preview_scene.remove( this.preview_meshes[i] );
    }
    this.preview_meshes = [];

}

IKRS.PreviewCanvasHandler.prototype.render = function() {
    
    // Draw background image
    this.preview_renderer.autoClear = false;
    this.preview_renderer.clear();
    this.preview_renderer.render( this.backgroundScene, this.backgroundCam );
    
    // Draw main scene
    this.preview_renderer.render( this.preview_scene, this.preview_camera ); 
}




// Render first time only if the DOM is fully loaded!
//window.onload = preview_render;
