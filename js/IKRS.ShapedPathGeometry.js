
/**
 * @author Ikaros Kappler
 * @date 2013-08-22
 * @version 1.0.0
 **/



IKRS.ShapedPathGeometry = function( shape,
				    path,
				    shapedPath,
				    options
				  ) {


    // Call super 'constructor'
    THREE.Geometry.call( this );
    
    var MAX_BEND = Math.PI;

    // Fetch the points from the shape
    var shapePoints = shape.extractAllPoints();
    shape = shapePoints.shape;

    if( !options.pathBend )
	options.pathBend = Math.PI/4.0;  // 45 degrees for testing:)
    
    //var bendRatio = options.pathBend / MAX_BEND;

    var shapedPathBounds = shapedPath.computeBoundingBox();

    // Iterate through path elements in n steps
    var vertexCount      = 0;
    // Used to determine the 'tangent' along the path
    var lastPathPoint    = null;
    var pathTangent      = null;
    var pathTangentSlope = 0.0;
    for( var i = 0; i <= options.curveSegments; i++ ) {

	var t = i / options.curveSegments;
	// This is a Vector2 (x,y)
	var pathPoint = path.getPointAt( t );
	if( i == 0 ) pathTangent = new THREE.Vector2( 0, 0 ); // No slope at first level
	else         pathTangent = new THREE.Vector2( pathPoint.x-lastPathPoint.x, pathPoint.y-lastPathPoint.y );
	
	// Calculate slope from tangent
	if( pathTangent.x == 0 ) pathTangentSlope = -Math.PI/2.0; // 90 deg
	else                     pathTangentSlope = Math.atan( pathTangent.y/pathTangent.x );
	
	
	//window.alert( "pathTangentSlope=" + ((pathTangentSlope/Math.PI)*180) + " DEG (" + pathTangentSlope + " RAD)" );
	
	// Don't forget to make a path curve by 'options.pathBend'
	var pathBendAmount = options.pathBend*t;
	//pathPoint.x += Math.cos(pathBendAmount) * options.size;
	

	//if( !pathPoint )
	//    window.alert( "pathPoint#" + i + " (t=" + t+ "): " + JSON.stringify(pathPoint) );

	var shapedPathPoint = shapedPath.getPoint( t );
	var radiusFactor    = (shapedPathBounds.getXMax() - shapedPathPoint.x) / shapedPathBounds.getWidth();
	var heightFactor    = (shapedPathBounds.getYMax() - shapedPathPoint.y) / shapedPathBounds.getHeight();

	//window.alert( "t=" + t + ", shapedPathPoint=(" + shapedPathPoint.x + ", " + shapedPathPoint.y + "), radiusFactor=" + radiusFactor );

	//for( var s = 0; s < shape.length; s++ ) { 
	var firstShapePointIndex = vertexCount;
	for( var s in shape ) {

	    
	    var shapePoint2 = shapePoints.shape[s];
	    
	    
	    var shapePoint3 = new THREE.Vector3( shapePoint2.x,
						 shapePoint2.y,
						 0  // t*options.size
					       );
					       
	    //pathTangentSlope += Math.PI/2.0;
	    /*
	    var shapePoint3 = new THREE.Vector3( Math.sin(-pathTangentSlope) * shapePoint2.x * radiusFactor, // Math.sin(-pathTangentSlope) * shapePoint2.x,
						 shapePoint2.y * radiusFactor,
						 Math.cos(-pathTangentSlope) * shapePoint2.x * radiusFactor //0 //Math.cos(-pathTangentSlope) * shapePoint2.x
					       );
					       */
	    
	    var shapeBend   = options.pathBend * heightFactor;

	    
	    // var zBendAmount = options.pathBend * heightFactor;
	    
	    // Get the (x,y) point on the shape path (sould be a bezier curve)
	    //  - use x as the radius factor
	    //  - use y as the height factor
	    
	    
	    shapePoint3.multiplyScalar( radiusFactor );
	    
	    
	    shapePoint3.add( new THREE.Vector3( pathPoint.x, // Math.cos(pathBendAmount) * options.size, 
						pathPoint.y, // pathPoint.y, 
						- options.size/2.0 + heightFactor*options.size
					      ) 
			   ); // addSelf instead of add?!			  	    
			   

	    // Add path point?	    
	    // this.vertices.push( new THREE.Vertex(shapePoint3) ); 	    
	    // ... Vertex was replaced by Vector3 (Vertex is DEPRECATED!)
	    this.vertices.push( new THREE.Vector3( shapePoint3.x, 
						   shapePoint3.y, 
						   shapePoint3.z 
						 ) 
			      );
	    // Connect previous shape/level with current?
	    if( i > 0 ) {

		
		var soffset = (s==0) ? shape.length-1 : -1;
		// Triangulate?
		if( !options.triangulate ) {
		    this.faces.push( new THREE.Face4( vertexCount + soffset,
						      vertexCount,
						      vertexCount-shape.length,
						      vertexCount-shape.length + soffset
						    ) );
		    
		} else {
		    
		    // Triangulation=on
		    // -> add two Face3 facets instead of Face4!
		    // (Otherwise the STL export will fail as it only recognizes Face3)
		    this.faces.push( new THREE.Face3( vertexCount + soffset,
						      vertexCount,
						      vertexCount-shape.length
						    ) );
		    this.faces.push( new THREE.Face3( vertexCount-shape.length,
						      vertexCount-shape.length + soffset,
						      vertexCount + soffset
						    ) );
		} // END else [triangulate]

	    } 

	    // Close first and last shape/level (if at least 3 vertices are present: s > 1)
	    if( s > 1 ) {

		
		if( i == options.curveSegments ) {

		    // Last segment
		    this.faces.push( new THREE.Face3( vertexCount,
						      vertexCount-1,
						      firstShapePointIndex
						    ) 
				   );
		} else if( i == 0 ) {

		    // First segment
		    this.faces.push( new THREE.Face3( firstShapePointIndex,
						      vertexCount-1,
						      vertexCount
						    ) 
				   );
		}
		
	    }
	    

	    vertexCount++;
	    lastPathPoint = pathPoint;
	} // END for [shape points]
    }

    this.computeCentroids();
    this.computeFaceNormals();
    
    // return new THREE.ExtrudeGeometry( shape, options );
};

IKRS.ShapedPathGeometry.prototype = new THREE.Geometry();
IKRS.ShapedPathGeometry.prototype.constructor = IKRS.ShapedPathGeometry;

// window.alert( "IKRS.ShapedPathGeometry=" + IKRS.ShapedPathGeometry );