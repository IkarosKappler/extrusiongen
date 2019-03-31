/**
 * A Three.js geometry-to-STL converter.
 *
 * Inspired by
 *  http://buildaweso.me/project/2013/2/25/converting-threejs-objects-to-stl-files
 *
 * @author Ikaros Kappler
 * @date 2013-10-10 (based on the STLBuilder.js)
 * @modified 2013-10-15 Ikaros Kappler (Params 'millimeterPerUnit' and 'exportSingleMesh' added).
 * @version 1.0.1
 **/

IKRS.DivisibleSTLBuilder = function( meshes, 
				     filename, 
				     processListener,
				     maxChunkSize,
				     millimeterPerUnit,
				     exportSingleMesh
				   ) {
    
    IKRS.Object.call( this );

    if( !filename )
	filename = "extrusion.stl";
    
    if( !millimeterPerUnit )
	millimeterPerUnit = 0.5;  // The default value in the BezierCanvasHandler


    // It is possible to pass an array or a single gerometry
    if( typeof meshes.length === "undefined" )
	meshes = [ meshes ];

    
    this.meshes               = meshes;
    this.filename             = filename;
    this.processListener      = processListener;
    this.maxChunkSize         = maxChunkSize;
    this.millimeterPerUnit    = millimeterPerUnit;
    this.exportSingleMesh     = exportSingleMesh;

    this.currentMeshIndex     = 0;
    this.currentTriangleIndex = 0;

    this.chunkResults         = [];
    
    // Calculated projected chunk count
    var totalTriangleCount = 0;
    for( var i = 0; i < this.meshes.length; i++ ) {
	totalTriangleCount += this.meshes[i].geometry.faces.length;
    }

    // ~3167 bytes for 10 facets (triangles)
    this.projectedSize = 
	this.meshes.length*21  // "solid pixel\n" and "endsolid\n"
	+
	Math.round(totalTriangleCount/10) * 3167;
    this.projectedChunkCount  = Math.ceil( this.projectedSize / this.maxChunkSize );
    
    this.interrupted          = false;
}

IKRS.DivisibleSTLBuilder.prototype = new IKRS.Object();
IKRS.DivisibleSTLBuilder.prototype.constructor = IKRS.DivisibleSTLBuilder;

/**
 * Processes the next chunk of data.
 *
 * @return true if there is at least one next part, false otherwise.
 **/
IKRS.DivisibleSTLBuilder.prototype.processNextChunk = function() {
    
    if( this.interrupted )
	return false;

    //var startMeshIndex      = this.currentMeshIndex;
    //var startTriangleIndex  = this.currentTriangleIndex;
    
    var tmpResult = this._saveSTL( this.currentMeshIndex,
				   this.currentTriangleIndex,
				   this.maxChunkSize,
				   this.millimeterPerUnit,
				   this.exportSingleMesh
				 );    
    
    this.currentMeshIndex     = tmpResult.meshIndex;
    this.currentTriangleIndex = tmpResult.triangleIndex;
    
    //window.alert( "chunks.length=" + this.chunkResults.length );
    
    return ( tmpResult.returnCode==0 && 
	     this.currentMeshIndex < this.meshes.length &&
	     this.currentTriangleIndex < this.meshes[this.currentMeshIndex].geometry.faces.length 
	   );
}

IKRS.DivisibleSTLBuilder.prototype.interrupt = function() {
    this.interrupted = true;
}

IKRS.DivisibleSTLBuilder.prototype.isInterrupted = function() {
    return this.interrupted;
}

IKRS.DivisibleSTLBuilder.prototype.getProcessedChunkCount = function() {
    return this.chunkResults.length;
}

IKRS.DivisibleSTLBuilder.prototype.getProjectedChunkCount = function() {
    return this.projectedChunkCount;
}

IKRS.DivisibleSTLBuilder.prototype.saveSTLResult = function() {

    var stlString = this.chunkResults.join( "\n\n" );

    var blob = new Blob([stlString], {type: 'text/plain'});
    window.saveAs(blob, this.filename);

}

IKRS.DivisibleSTLBuilder.prototype._saveSTL = function( meshIndex,
							triangleIndex,
							maxChunkSize,
							millimeterPerUnit,
							exportSingleMesh
						      ) {
    
    
    var currentChunkSize = 0;
    while( meshIndex < this.meshes.length &&
	   currentChunkSize < maxChunkSize
	 ) {
	

	var currentMesh = this.meshes[ meshIndex ];
	//window.alert( meshes[i].geometry );
	var tmpResult = this._buildSTL( currentMesh.geometry,
					meshIndex,
					triangleIndex,
					currentChunkSize,
					maxChunkSize,
					millimeterPerUnit,
					exportSingleMesh
				      );
	
	this.chunkResults.push( tmpResult.value );
	currentChunkSize       += tmpResult.chunkSize;
	triangleIndex           = tmpResult.triangleIndex;
	
	// Next mesh?
	if( triangleIndex >= currentMesh.geometry.faces.length ) {
	    meshIndex++;
	    triangleIndex = 0;
	}

    }
    
    return { returnCode:    0,
	     meshIndex:     meshIndex,
	     triangleIndex: triangleIndex
	   };
};
    

IKRS.DivisibleSTLBuilder.prototype._buildSTL = function( geometry, 
							 meshIndex,
							 triangleIndex,
							 currentChunkSize,
							 maxChunkSize,
							 millimeterPerUnit,
							 exportSingleMesh
						       ) {

    var vertices  = geometry.vertices;
    // Warning!
    // The faces may be Face4 and not Face3!
    var tris      = geometry.faces;
    
    // Use an array as StringBuffer (concatenation is extremely slow in IE6).
    var stl       = [];
    var chunkSize = 0;
    
    if( triangleIndex == 0 && 
	(!exportSingleMesh || (exportSingleMesh && meshIndex==0))
	) {
	stl.push( "solid pixel\n" );
	chunkSize += ("solid pixel\n").length;
    }
 
    //for(var i = 0; i < tris.length; i++) {    
    //for( var i = triangleIndex; i < tris.length; i++ ) {
    //var tmpBuffer = [];
    while( triangleIndex < tris.length &&
	   currentChunkSize+chunkSize < maxChunkSize
	 ) {

	var tmpBuffer = [];
	var triangle = tris[triangleIndex];
	tmpBuffer.push( " facet normal " + this._stringifyVector( triangle.normal, millimeterPerUnit ) + "\n");
	tmpBuffer.push("  outer loop\n");
	tmpBuffer.push("   " + this._stringifyVertex( vertices[ triangle.a ], millimeterPerUnit ) );
	tmpBuffer.push("   " + this._stringifyVertex( vertices[ triangle.b ], millimeterPerUnit ) );
	tmpBuffer.push("   " + this._stringifyVertex( vertices[ triangle.c ], millimeterPerUnit ) );
	tmpBuffer.push("  endloop \n");
	tmpBuffer.push(" endfacet \n");
	

	triangleIndex++;
	var tmpData = tmpBuffer.join("");
	//tmpBuffer   = [];
	stl.push( tmpData );
	chunkSize += tmpData.length;
	
	
    }
    
    if( triangleIndex >= tris.length &&
	(!exportSingleMesh || (exportSingleMesh && meshIndex+1>=this.meshes.length))
	) {
	stl.push("endsolid\n");
	chunkSize += ("endsolid\n").length;
    }
    
    // Convert array to string
    var data = stl.join("");
    
    return { returnCode:       0,
	     value:            data,
	     chunkSize:        chunkSize,
	     triangleIndex:    triangleIndex
	   };
};



IKRS.DivisibleSTLBuilder.prototype._stringifyVector = function( vec, 
								millimeterPerUnit 
							      ) {
    // var mm = value * millimeterPerUnit
    return "" + 
	(vec.x*millimeterPerUnit) + 
	" " + 
	(vec.y*millimeterPerUnit) + 
	" " + 
	(vec.z*millimeterPerUnit);
};

IKRS.DivisibleSTLBuilder.prototype._stringifyVertex = function( vec, 
								millimeterPerUnit 
							      ) {
    return "vertex " + this._stringifyVector(vec,millimeterPerUnit) + " \n";
};

