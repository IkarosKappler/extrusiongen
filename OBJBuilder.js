/**
 * Thanks to AlexChet for this snippet:
 *  http://stackoverflow.com/questions/11367822/exporting-a-three-js-mesh-as-an-obj-or-stl
 *
 * @author  Ikaros Kappler
 * @date    2014-04-25
 * @version 1.0.0
 **/

/*
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
*/


OBJBuilder = {

    saveOBJ: function( meshes, filename, processListener ) {

	//window.alert( meshes.length );

	if( !filename )
	    filename = "extrusion.stl";
	
	//window.alert( meshes.length );

	// It is possible to pass an array or a single gerometry
	if( typeof meshes.length === "undefined" )
	    meshes = [ meshes ];
	
	// First step: calculate total triganle count
	var totalTriCount = 0;
	for( var i = 0; i < meshes.length; i++ ) {

	    totalTriCount += meshes[ i ].geometry.faces.length;

	}
	

	var buffer = [];
	for( var i = 0; i < meshes.length; i++ ) {

	    //window.alert( meshes[i].geometry );
	    buffer[i] = OBJBuilder.buildOBJ( meshes[i].geometry );

	}

	var objString = buffer.join( "\n\n" );

	var blob = new Blob([objString], {type: 'text/plain'});
	window.saveAs(blob, filename);
	
    },

    /*
    buildOBJFromMeshArray: function( meshes, processListener ) {

	var buffer = [];
	for( var i = 0; i < meshes.length; i++ ) {

	    //window.alert( meshes[i].geometry );
	    buffer[i] = STLBuilder.buildSTL( meshes[i].geometry );

	}

	var stlString = buffer.join( "\n\n" );
	return stlString;

    },
    */

    buildOBJ: function( geometry ) {
	var s = "";
	for( var i = 0; i < geometry.vertices.length; i++ ) {
	    s+= "v " + (geometry.vertices[i].x) + " " +
		geometry.vertices[i].y + " " +
		geometry.vertices[i].z + "\n";
	}

	for (i = 0; i < geometry.faces.length; i++) {

	    s+= "f "+ (geometry.faces[i].a+1) + " " +
		(geometry.faces[i].b+1) + " " +
		(geometry.faces[i].c+1);
	    
	    if (geometry.faces[i].d !== undefined) {
		s+= " " + (geometry.faces[i].d+1);
	    }
	    s+= "\n";
	}

	return s;
    },


    /*
    buildSTL: function( geometry ) {

	var vertices = geometry.vertices;
	// Warning!
	// The faces may be Face4 and not Face3!
	var tris     = geometry.faces;
	
	// Use an array as StringBuffer (concatenation is extremely slow in IE6).
	var stl = [];
	stl.push( "solid pixel\n" );
	for(var i = 0; i < tris.length; i++) {

	    stl.push( " facet normal "+ STLBuilder._stringifyVector( tris[i].normal )+"\n");
	    stl.push( "  outer loop\n");
	    stl.push( "   " + STLBuilder._stringifyVertex( vertices[ tris[i].a ] ) );
	    stl.push( "   " + STLBuilder._stringifyVertex( vertices[ tris[i].b ] ) );
	    stl.push( "   " + STLBuilder._stringifyVertex( vertices[ tris[i].c ] ) );
	    stl.push( "  endloop \n");
	    stl.push( " endfacet \n");
	    
	}
	stl.push("endsolid");
	
	// Convert array to string
	return stl.join("");
    },
    */


/*
    _stringifyVector: function(vec) {
	return ""+vec.x+" "+vec.y+" "+vec.z;
    },

    _stringifyVertex: function(vec) {
	return "vertex " + STLBuilder._stringifyVector(vec) + " \n";
    }
*/

} // END STLBuilder