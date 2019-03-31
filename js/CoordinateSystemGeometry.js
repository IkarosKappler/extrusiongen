/**
 * @author Ikaros Kappler
 * @date 2013-08-12
 * @version 1.0.0
 **/

THREE.CoordinateSystemGeometry = function( size ) {


    // Call super 'constructor'
    THREE.Geometry.call( this );

    
    var points = [];
    points.push( new THREE.Vector3(0,0,0) );  // origin
    points.push( new THREE.Vector3(size,0,0) );  // x
    points.push( new THREE.Vector3(0,size,0) );  // y
    points.push( new THREE.Vector3(0,0,size) );  // z
    

    /*
    // Fetch the points from the shape
    var shapePoints = shape.extractAllPoints();
    shape = shapePoints.shape;

    // Iterate through path elements in n steps
    var vertexCount = 0;
    for( var i = 0; i <= options.curveSegments; i++ ) {

	var t = i / options.curveSegments;
	var pathPoint = path.getPointAt( t );

	// ...
	if( !pathPoint )
	    window.alert( "pathPoint#" + i + " (t=" + t+ "): " + pathPoint );

	for( var s in shape ) {

	    var shapePoint2 = shapePoints.shape[s];
	    var shapePoint3 = new THREE.Vector3( shapePoint2.x,
						 shapePoint2.y,
						 0 );
	    // Translate the point along the path
	    shapePoint3.add( new THREE.Vector3( pathPoint.x, 
						pathPoint.y, 
						pathPoint.z 
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
		this.faces.push( new THREE.Face4( vertexCount + soffset,
						  vertexCount,
						  vertexCount-shape.length,
						  vertexCount-shape.length + soffset
						) );
						

	    }

	    vertexCount++;
	}
    }

    */

    this.computeCentroids();
    this.computeFaceNormals();
    
    // return new THREE.ExtrudeGeometry( shape, options );
};

THREE.ExtrudePathGeometry.prototype = new THREE.Geometry();
THREE.ExtrudePathGeometry.prototype.constructor = THREE.CoordinateSystemGeometry;
