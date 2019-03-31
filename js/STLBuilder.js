
/**
 * A Three.js geometry-to-STL converter.
 *
 * Inspired by
 *  http://buildaweso.me/project/2013/2/25/converting-threejs-objects-to-stl-files
 *
 * @author Ikaros Kappler
 * @date 2013-08-14
 * @version 1.0.0
 **/

STLBuilder = {

    saveSTL: function( meshes, filename, processListener ) {

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
	    buffer[i] = STLBuilder.buildSTL( meshes[i].geometry );

	}

	var stlString = buffer.join( "\n\n" );

	var blob = new Blob([stlString], {type: 'text/plain'});
	window.saveAs(blob, filename);
	
    },

    buildSTLFromMeshArray: function( meshes, processListener ) {

	var buffer = [];
	for( var i = 0; i < meshes.length; i++ ) {

	    //window.alert( meshes[i].geometry );
	    buffer[i] = STLBuilder.buildSTL( meshes[i].geometry );

	}

	var stlString = buffer.join( "\n\n" );
	return stlString;

    },

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
	    stl.push("  outer loop\n");
	    stl.push("   " + STLBuilder._stringifyVertex( vertices[ tris[i].a ] ) );
	    stl.push("   " + STLBuilder._stringifyVertex( vertices[ tris[i].b ] ) );
	    stl.push("   " + STLBuilder._stringifyVertex( vertices[ tris[i].c ] ) );
	    stl.push("  endloop \n");
	    stl.push(" endfacet \n");
	    
	    // Is the facet a Face4 instance?
	    /*
	      if( tris[i].d ) {
	      stl += (" facet normal "+stringifyVector( tris[i].normal )+"\n");
	      stl += ("  outer loop\n");
	      stl += "   " + stringifyVertex( vertices[ tris[i].a ] );
	      stl += "   " + stringifyVertex( vertices[ tris[i].b ] );
	      stl += "   " + stringifyVertex( vertices[ tris[i].c ] );
	      stl += ("  endloop \n");
	      stl += (" endfacet \n");
	      }
	    */
	}
	stl.push("endsolid");
	
	// Convert array to string
	return stl.join("");
    },



    _stringifyVector: function(vec) {
	return ""+vec.x+" "+vec.y+" "+vec.z;
    },

    _stringifyVertex: function(vec) {
	return "vertex " + STLBuilder._stringifyVector(vec) + " \n";
    }

} // END STLBuilder