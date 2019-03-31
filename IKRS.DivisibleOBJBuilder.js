/**
 * A Three.js geometry-to-OBJ converter.
 *
 * Thanks to AlexChet for the code snippet:
 *  http://stackoverflow.com/questions/11367822/exporting-a-three-js-mesh-as-an-obj-or-stl
 *
 *
 * @author  Ikaros Kappler
 * @date    2014-04-25
 * @version 1.0.0
 **/

/** 
THREE.saveGeometryToObj = function (geometry) {
var s = '';
for (i = 0; i < geometry.vertices.length; i++) {
    s+= 'v '+(geometry.vertices[i].x) + ' ' +
    geometry.vertices[i].y + ' '+
    geometry.vertices[i].z + '\n';
}

for (i = 0; i < geometry.faces.length; i++) {

    s+= 'f '+ (geometry.faces[i].a+1) + ' ' +
    (geometry.faces[i].b+1) + ' '+
    (geometry.faces[i].c+1);

    if (geometry.faces[i].d !== undefined) {
        s+= ' '+ (geometry.faces[i].d+1);
    }
    s+= '\n';
}

return s;
}
**/

IKRS.DivisibleOBJBuilder = function( meshes, 
				     filename, 
				     processListener,
				     maxChunkSize,
				     millimeterPerUnit,
				     exportSingleMesh
				   ) {
    
    IKRS.Object.call( this );

    if( !filename )
	filename = "extrusion.obj";
    
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
    this.currentVertexIndex   = 0;
    this.currentTriangleIndex = 0;

    this.chunkResults         = [];
    
    /*
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
    */


    var vertexDataSize = 0;
    var faceDataSize   = 0;

    for( var i = 0; i < meshes.length; i++ ) {

	// Vertices are stored as
	//  "v " + <x> + " " + <y> " " + <z> + "\n"   
	//    => 5 constant bytes + 3*float [16 characters]
	vertexDataSize += meshes[i].geometry.vertices.length * (6 + 3 * 16);
	
	
	// Faces are stored as
	//  "f " + <a> + " " + <b> + " " + " " <c>\n"   
	//    => 5 constant bytes + 3*int (let's say at 100*100 vertices the average int length is 5).
	// NOTE THAT QUAD FACES ARE NOT RESPECTED HERE.
	faceDataSize += meshes[i].geometry.vertices.length * (6 + 3 * 5);
    }



    this.projectedSize = 
	this.meshes.length*10  // "o " + <name> + "\n"
	+
	vertexDataSize 
	+
	faceDataSize;
    this.projectedChunkCount  = Math.ceil( this.projectedSize / this.maxChunkSize );
    
    
    
    this.interrupted          = false;
}

IKRS.DivisibleOBJBuilder.prototype = new IKRS.Object();
IKRS.DivisibleOBJBuilder.prototype.constructor = IKRS.DivisibleOBJBuilder;

/**
 * Processes the next chunk of data.
 *
 * @return true if there is at least one next part, false otherwise.
 **/
IKRS.DivisibleOBJBuilder.prototype.processNextChunk = function() {
    
    if( this.interrupted )
	return false;

    
    var tmpResult = this._saveOBJ( this.currentMeshIndex,
				   this.currentVertexIndex,
				   this.currentTriangleIndex,
				   this.maxChunkSize,
				   this.millimeterPerUnit,
				   this.exportSingleMesh
				 );    
    
    this.currentMeshIndex     = tmpResult.meshIndex;
    this.currentVertexIndex   = tmpResult.vertexIndex;
    this.currentTriangleIndex = tmpResult.triangleIndex;
    
    //window.alert( "chunks.length=" + this.chunkResults.length );
    
    return ( tmpResult.returnCode==0 && 
	     this.currentMeshIndex < this.meshes.length &&
	     this.currentTriangleIndex < this.meshes[this.currentMeshIndex].geometry.faces.length 
	   );
}

IKRS.DivisibleOBJBuilder.prototype.interrupt = function() {
    this.interrupted = true;
}

IKRS.DivisibleOBJBuilder.prototype.isInterrupted = function() {
    return this.interrupted;
}

IKRS.DivisibleOBJBuilder.prototype.getProcessedChunkCount = function() {
    return this.chunkResults.length;
}

IKRS.DivisibleOBJBuilder.prototype.getProjectedChunkCount = function() {
    return this.projectedChunkCount;
}

IKRS.DivisibleOBJBuilder.prototype.saveOBJResult = function() {

    var objString = this.chunkResults.join( "\n\n" );

    var blob = new Blob([objString], {type: 'text/plain'});
    window.saveAs(blob, this.filename);

}

IKRS.DivisibleOBJBuilder.prototype._saveOBJ = function( meshIndex,
							vertexIndex,
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
	var tmpResult = this._buildOBJ( currentMesh.geometry,
					meshIndex,
					vertexIndex,
					triangleIndex,
					currentChunkSize,
					maxChunkSize,
					millimeterPerUnit,
					exportSingleMesh
				      );
	
	this.chunkResults.push( tmpResult.value );
	currentChunkSize       += tmpResult.chunkSize;
	vertexIndex             = tmpResult.vertexIndex;
	triangleIndex           = tmpResult.triangleIndex;
	
	// Next mesh?
	if( triangleIndex >= currentMesh.geometry.faces.length ) {
	    meshIndex++;
	    vertexIndex   = 0;
	    triangleIndex = 0;
	}

    }
    
    return { returnCode:    0,
	     meshIndex:     meshIndex,
	     vertexIndex:   vertexIndex,
	     triangleIndex: triangleIndex
	   };
};
    

IKRS.DivisibleOBJBuilder.prototype._buildOBJ = function( geometry, 
							 meshIndex,
							 vertexIndex,
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
    var obj       = [];
    var chunkSize = 0;
    
    
    // Next mesh following?
    if( triangleIndex == 0 && 
	(!exportSingleMesh || (exportSingleMesh && meshIndex==0))
	) {
	//stl.push( "solid pixel\n" );
	//chunkSize += ("solid pixel\n").length;
	var objectLine = "o mesh[" + meshIndex + "]\n";
	obj.push( objectLine );
	chunkSize += objectLine.length;
    }


    // Fist print triangles
    while( vertexIndex < vertices.length && 
	   currentChunkSize+chunkSize < maxChunkSize
	 ) {

	var tmpData = 
	    "v " + 
	    vertices[vertexIndex].x + " " +
	    vertices[vertexIndex].y + " " +
	    vertices[vertexIndex].z + "\n";


	vertexIndex++;
	obj.push( tmpData );
	chunkSize += tmpData.length;
    }



    // Add an empty line after the vertex list
    if( vertexIndex >= vertices.length ) {

	obj.push( "\n\n" );
	chunkSize += 2;

    }



    while( triangleIndex < tris.length &&
	   currentChunkSize+chunkSize < maxChunkSize
	 ) {

	/*
	var tmpBuffer = [];
	var triangle = tris[triangleIndex];
	tmpBuffer.push( " facet normal " + this._stringifyVector( triangle.normal, millimeterPerUnit ) + "\n");
	tmpBuffer.push("  outer loop\n");
	tmpBuffer.push("   " + this._stringifyVertex( vertices[ triangle.a ], millimeterPerUnit ) );
	tmpBuffer.push("   " + this._stringifyVertex( vertices[ triangle.b ], millimeterPerUnit ) );
	tmpBuffer.push("   " + this._stringifyVertex( vertices[ triangle.c ], millimeterPerUnit ) );
	tmpBuffer.push("  endloop \n");
	tmpBuffer.push(" endfacet \n");
	var tmpData = tmpBuffer.join("");
	*/

	var triangle = tris[triangleIndex];

	// Note that OBJ indices start at 1.
	var tmpData = 
	    "f " + 
	    (triangle.a+1) + " " +
	    (triangle.b+1) + " " +
	    (triangle.c+1) + "\n";
	    

	triangleIndex++;
	obj.push( tmpData );
	chunkSize += tmpData.length;
	
	
    }
    

    // Add to empty lines after face list.
    if( triangleIndex >= tris.length &&
	(!exportSingleMesh || (exportSingleMesh && meshIndex+1>=this.meshes.length))
	) {
	
	obj.push( "\n\n" );
	chunkSize += 2;
    }
    
    // Convert array to string
    var data = obj.join("");
    
    return { returnCode:       0,
	     value:            data,
	     chunkSize:        chunkSize,
	     vertexIndex:      vertexIndex,
	     triangleIndex:    triangleIndex
	   };
};


/*
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

*/