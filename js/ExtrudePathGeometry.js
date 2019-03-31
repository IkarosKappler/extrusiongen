
/**
 * @author Ikaros Kappler
 * @date 2013-08-12
 * @version 1.0.0
 **/



THREE.ExtrudePathGeometry = function( shape,
				      path,
				      options
				    ) {


    // Call super 'constructor'
    THREE.Geometry.call( this );

    // Fetch the points from the shape
    var shapePoints = shape.extractAllPoints();
    shape = shapePoints.shape;

    // Iterate through path elements in n steps
    var vertexCount = 0;
    for( var i = 0; i <= options.curveSegments; i++ ) {

	var t = i / options.curveSegments;
	// This is a Vector2 (x,y)
	var pathPoint = path.getPointAt( t );

	// ...
	//if( !pathPoint )
	//    window.alert( "pathPoint#" + i + " (t=" + t+ "): " + JSON.stringify(pathPoint) );

	//for( var s = 0; s < shape.length; s++ ) { 
	var firstShapePointIndex = vertexCount;
	for( var s in shape ) {

	    
	    var shapePoint2 = shapePoints.shape[s];
	    var shapePoint3 = new THREE.Vector3( shapePoint2.x,
						 shapePoint2.y,
						 0  // t*options.size
					       );
	    // Translate the point along the path
	    shapePoint3.add( new THREE.Vector3( pathPoint.x, 
						pathPoint.y, 
						t * options.size // pathPoint.z 
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
	} // END for [shape points]
    }

    this.computeCentroids();
    this.computeFaceNormals();
    
    // return new THREE.ExtrudeGeometry( shape, options );
};

THREE.ExtrudePathGeometry.prototype = new THREE.Geometry();
THREE.ExtrudePathGeometry.prototype.constructor = THREE.ExtrudePathGeometry;

// window.alert( "THREE.ExtrudePathGeometry=" + THREE.ExtrudePathGeometry );