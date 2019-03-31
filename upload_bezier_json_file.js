/**
 * @author Ikaros Kappler
 * @date 2013-08-22
 * @version 1.0.0
 **/

function upload_bezier_json_file( inputFileElement ) {

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

	//window.alert( "File uploaded. Value=" + e.target.result );
	try {
	    var bezierPath = IKRS.BezierPath.fromJSON( e.target.result );
	    setBezierPath( bezierPath );
	} catch( e ) {
	    window.alert( "Error: " + e );
	}
	
	/*
	  // Send to server?
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {

	};
	xhr.open( "POST", "ajax_file_uploader.php" );
	xhr.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );
	xhr.send( "file=" + uncodeURIComponent(e.target.result) );
	*/
	
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