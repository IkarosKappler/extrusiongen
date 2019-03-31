/**
 * @author Ikaros Kappler
 * @date 2013-09-11
 * @modified 2014-07-04 Ikaros Kappler (added new values shapeTwist, shapeStyle and version).
 * @version 1.0.1
 **/



ZipFileImporter = {

    _apply_mesh_settings: function( meshSettings ) {

	/*
	return { 
	    geometry:          getPreviewMesh().geometry,	    
	    bezierPath:        getBezierPath(),
	    meshSettings:      {
		shapeSegments:     document.forms[ "mesh_form" ].elements[ "shape_segments" ].value,
		pathSegments:      document.forms[ "mesh_form" ].elements[ "path_segments" ].value,
		bendAngle:         document.forms[ "mesh_form" ].elements[ "preview_bend" ].value,
		buildNegativeMesh: document.forms[ "mesh_form" ].elements[ "build_negative_mesh" ].checked,
		meshHullStrength:  document.forms[ "mesh_form" ].elements[ "mesh_hull_strength" ].value,
		closePathBegin:    document.forms[ "mesh_form" ].elements[ "mesh_close_path_begin" ].checked,
		closePathEnd:      document.forms[ "mesh_form" ].elements[ "mesh_close_path_end" ].checked,
		wireframe:         document.forms[ "mesh_form" ].elements[ "wireframe" ].checked,
		triangulate:       document.forms[ "mesh_form" ].elements[ "triangulate" ].checked,
		
		// This is new since 2013-09-16
		splitShape:        document.forms[ "mesh_form" ].elements[ "split_shape" ].checked,
		
		// This is new since 2013-10-30
		arrangeSplitsOnPlane: document.forms[ "mesh_form" ].elements[ "arrange_splits_on_plane" ].checked,

		// These are new since 2014-04-23
		directions:           getSelectedMeshDirection(),  // "xyz" or "zxy"
		meshHullType:         getSelectedMeshHullType()    // "perpendicular" or "prism"

		// This is new since 2014-04-25
		parts:                getSelectedMeshParts(),      // "both" or "left" or "right"
		
		// These are new since 2014-07-04
		shapeTwist:           getTwistValue(),             // percentage
		shapeStyle:           getSelectedShapeStyle(),     // "circle", "oval", ...
		version:              VERSION_STRING
	    },
	    
	    // This is new since 2014-04-23
	    colorSettings:  {
		color:                document.forms["color_form"].elements["color"].value
	    },

	    compress:          document.forms[ "zip_form" ].elements[ "compress_zip" ].checked
	}; // END object
	*/
	
	if( meshSettings.shapeSegments )
	    document.forms[ "mesh_form" ].elements[ "shape_segments" ].value = meshSettings.shapeSegments;

	if( meshSettings.pathSegments )
	    document.forms[ "mesh_form" ].elements[ "path_segments" ].value = meshSettings.pathSegments;

	if( typeof meshSettings.bendAngle != "undefined" ) // || meshSettings.bendAngle == 0 )
	    document.forms[ "mesh_form" ].elements[ "preview_bend" ].value = meshSettings.bendAngle;
	else
	    document.forms[ "mesh_form" ].elements[ "preview_bend" ].value = 0;
	
	if( meshSettings.buildNegativeMesh ) {
	    document.forms[ "mesh_form" ].elements[ "build_negative_mesh" ].checked = "checked";
	    document.forms[ "mesh_form" ].elements[ "mesh_hull_strength" ].disabled = false;
	} else {
	    document.forms[ "mesh_form" ].elements[ "build_negative_mesh" ].checked = false;
	    document.forms[ "mesh_form" ].elements[ "mesh_hull_strength" ].disabled = true;
	}

	if( typeof meshSettings.meshHullStrength != "undefined" )
	    document.forms[ "mesh_form" ].elements[ "mesh_hull_strength" ].value = meshSettings.meshHullStrength;

	if( meshSettings.closePathBegin )
	    document.forms[ "mesh_form" ].elements[ "mesh_close_path_begin" ].checked = "checked";
	else
	    document.forms[ "mesh_form" ].elements[ "mesh_close_path_begin" ].checked = false;

	if( meshSettings.closePathEnd )
	    document.forms[ "mesh_form" ].elements[ "mesh_close_path_end" ].checked = "checked";
	else
	    document.forms[ "mesh_form" ].elements[ "mesh_close_path_end" ].checked = false;

	if( meshSettings.wireframe )
	    document.forms[ "mesh_form" ].elements[ "wireframe" ].checked = "checked";
	else
	    document.forms[ "mesh_form" ].elements[ "wireframe" ].checked = false;

	if( meshSettings.triangulate )
	    document.forms[ "mesh_form" ].elements[ "triangulate" ].checked = "checked";
	else
	    document.forms[ "mesh_form" ].elements[ "triangulate" ].checked = false;

	if( meshSettings.splitShape ) {
	    document.forms[ "mesh_form" ].elements[ "split_shape" ].checked = "checked";
	    document.forms[ "mesh_form" ].elements[ "mesh_hull_strength" ].disabled = false;
	} else {
	    document.forms[ "mesh_form" ].elements[ "split_shape" ].checked = false;
	    document.forms[ "mesh_form" ].elements[ "mesh_hull_strength" ].disabled = true;
	}

	if( meshSettings.arrangeSplitsOnPlane ) {
	    document.forms[ "mesh_form" ].elements[ "arrange_splits_on_plane" ].checked = "checked";
	    //document.forms[ "mesh_form" ].elements[ "mesh_hull_strength" ].disabled = false;
	} else {
	    document.forms[ "mesh_form" ].elements[ "arrange_splits_on_plane" ].checked = false;
	    //document.forms[ "mesh_form" ].elements[ "mesh_hull_strength" ].disabled = true;
	}

	
	setSelectedMeshDirection( meshSettings.meshDirection ); // May be null
	setSelectedMeshHullType( meshSettings.meshHullType );   // May be null
	setSelectedMeshParts( meshSettings.parts );             // May be null
	
	if( meshSettings.shapeTwist )
	    setTwistValue( meshSettings.shapeTwist );
	else
	    setTwistValue( 0 );



	setSelectedShapeStyle( meshSettings.shapeStyle );       // May be null

	
	return true;
    },

    _apply_color_settings: function( colorSettings ) {
	
	if( !colorSettings )
	    return false;

	if( colorSettings.meshColor != null )
	    setSelectedMeshColor( colorSettings.meshColor );         // Not null
	
	return true;
    },

    importZipFile: function( inputFileElement ) {

	//window.alert( JSON.stringify(inputFileElement) );
	//window.alert( "FileReader=" + FileReader + ", type=" + (typeof FileReader) );

	if( typeof FileReader == "undefined" || !inputFileElement.files ) {

	    window.alert( "Your browser does not support the HTML5 file API!" );
	    return;

	}
	
	if( inputFileElement.files.length == 0 ) {

	    window.alert( "Please select a file." );
	    return;

	}

	// window.alert( inputFileElement.files[0] );
	
	var json_file = inputFileElement.files[ 0 ];  
	var reader = new FileReader();
	reader.onload = function( e ) {


	    try {		

		var zip                = new JSZip( e.target.result );
		
		var shapedPathFile     = zip.file( "shape.bezierpath.json" );
		var meshSettingsFile   = zip.file( "mesh_settings.json" );
		var colorSettingsFile  = zip.file( "color_settings.json" );
		

		if( !shapedPathFile ) {

		    window.alert( "The passed zip file does not contain the 'shape.bezierpath.json' file." );
		    return false;

		}

		if( !meshSettingsFile ) {

		    window.alert( "The passed zip file does not contain the 'mesh_settings.json' file." );
		    return false;

		}
		    

		// Prepare variables
		var bezierPath     = null;
		var meshSettings   = null;
		var colorSettings  = null;
		
		//window.alert( "shapedPathFile=" + shapedPathFile + ", meshSettingsFile=" + meshSettingsFile );
		
		// Parse bezier path
		try {
		    bezierPath = IKRS.BezierPath.fromJSON( shapedPathFile.asText() );		    
		} catch( e ) {
		    window.alert( "Error[0]: " + e );
		    return false;
		}
		
		
		// Parse mesh settings
		try {
		    meshSettings = JSON.parse( meshSettingsFile.asText() );
		} catch( e ) {
		    window.alert( "Error[1]: " + e );
		    return false;
		}

		// Parse color settings?
		// The color settings file 'color_settings.json' was added in a later version.
		// For backwards compatibility ignore this if the file does not exist
		if( colorSettingsFile ) {
		    try {
			colorSettings = JSON.parse( colorSettingsFile.asText() );
		    } catch( e ) {
			window.alert( "Error[2]: " + e );
			return false;
		    }
		}

		// Apply path
		setBezierPath( bezierPath );
		
		// Apply settings
		ZipFileImporter._apply_mesh_settings( meshSettings );

		// Apply color settings
		ZipFileImporter._apply_color_settings( colorSettings );

		// Enable/disable respective form elements
		toggleFormElementsEnabled();
		
		// Rebuild model with new settings
		preview_rebuild_model();

		//window.alert( "meshSettings=" + JSON.stringify(meshSettings) );

	    } catch( e ) {
		window.alert( "Error: " + e );
	    }
	    
	    
	};
	reader.onprogress = function( e ) {
	    // NOOP
	    // (display progress?)
	};
	reader.onerror = function( e ) {
	    window.alert( "File upload error (code=" + e.target.error.code+")." );
	};
	reader.readAsBinaryString( json_file );

    }


};