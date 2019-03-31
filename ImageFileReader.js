/**
 * This is a simple Javascript image reader that reads image files from the local
 * file system and applies it to the bezier canvas handler (or any other component
 * that can handle Image objects --- just implement it).
 *
 *
 * Thanks to "Blake Plumb" at 
 *   http://stackoverflow.com/questions/13373834/upload-image-using-javascript
 *
 * @author Ikaros Kappler
 * @date 2014-03-18
 * @version 1.0.0
 **/

ImageFileReader = {

    readBezierBackgroundImage : function() {
	var imgFile = document.forms["bezier_background_form"].elements["bezier_background_file"];
	ImageFileReader._readImageFile( imgFile,
					function(image) {
					    //alert( "width=" + image.width + ", height=" + image.height );
					    bezierCanvasHandler.setCustomBackgroundImage(image,true); // redraw=true
					}
				      );
    },

    _readImageFile : function( imgFile, successCallback ) {
	
	//window.alert( imgFile );
	
	//var imgFile = document.getElementById('submitfile');	
	if( imgFile.files && imgFile.files[0] ) {
	    var width;
	    var height;
	    var fileSize;
	    var reader = new FileReader();
	    reader.onload = function(event) {
		var dataUri = event.target.result;

		var image = new Image();
		image.onload = function( event ) {
		    //alert( "width=" + this.width + ", height=" + this.height );
		    successCallback( image );
		};
		// This works because the file was read as Data-URL
		image.src = dataUri; 
		
	    };
	    reader.onerror = function(event) {
		console.error("File could not be read! Code " + event.target.error.code);
		window.alert( "File could not be read! Code " + event.target.error.code );
	    };
	    reader.readAsDataURL(imgFile.files[0]);
	}
    }
};