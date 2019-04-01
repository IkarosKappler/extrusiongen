
/**
 * This is just a (dirty) collection of javascript functions the main page
 * uses.
 *
 *
 * The actual generator logic is located in the class files.
 *
 *
 * @author   Ikaros Kappler
 * @date     2013-10-13
 * @modified 2015-01-30 Ikaros Kappler (GET params handling: added decodeURI()).
 * @version  1.0.1
 **/


// Will be initialised on initWebGL()
this.bezierCanvasHandler   = null;
this.previewCanvasHandler  = null;

this.keyHandler            = null;


/**
 * This function creates a human-readable date/time string.
 * Format: YYYY-MM-DD_H.i.s
 **/
function createHumanReadableTimestamp() {

    // Append the current date to the output filename values
    var curDate = new Date();
    var year    = curDate.getFullYear();
    var month   = curDate.getMonth() + 1;  // months start at 0
    var day     = curDate.getDate();
    var hours   = curDate.getHours();
    var minutes = curDate.getMinutes();
    var seconds = curDate.getSeconds();

    if( month < 10 )   month   = "0" + month;
    if( day < 10 )     day     = "0" + day;
    if( hours < 10 )   hours   = "0" + hours;
    if( minutes < 10 ) minutes = "0" + minutes;
    if( seconds < 10 ) seconds = "0" + seconds;

    var ts        = "" +
	year +
	"-" +
	month +
	"-" +
	day +
	"_" +
	hours +
	"." +
	minutes +
	"." +
	seconds
	;

    return ts;
}

/**
 * The signum function is not native part of the javascript Math class.
 * Add Math.sign function if not present (Mozilla, ...).
 **/
if( !Math.sign ) {
    Math.sign = function( x ) {	
	// Better:
	if( x == 0 )
	    return 0;
	else
	    return Math.round( x / Math.abs(x) ); // round: convert to integer
    }
}

/**
 * This function returns the default bezier path the application initially displays.
 * Note that the returned curve is a JSON string which can be parsed by 
 *  IKRS.BezierPath.fromJSON( string ).
 **/
function getDefaultBezierJSON() {
    return _DILDO_CONFIG.DEFAULT_BEZIER_JSON;
}

/**
 * This function simply returns the "preview_canvas" DOM element (canvas).
 **/
function getPreviewCanvas() {
    return document.getElementById( "preview_canvas" );
}

/**
 * This function simply returns the "bezier_canvas" DOM element (canvas).
 **/
function getBezierCanvas() {
    return document.getElementById( "bezier_canvas" );
}

/**
 * This function simply eturns the "status_bar" DOM element (div).
 **/
function getStatusBar() {
    return document.getElementById( "status_bar" );
}

/**
 * Checks if the current canvas sizes are 512x768 pixels.
 **/
function isDefaultCanvasSize() {
    return (
	_DILDO_CONFIG.PREVIEW_CANVAS_WIDTH == 512 &&
	    _DILDO_CONFIG.BEZIER_CANVAS_WIDTH == 512 &&	
	    _DILDO_CONFIG.PREVIEW_CANVAS_HEIGHT == 768 &&
	    _DILDO_CONFIG.BEZIER_CANVAS_HEIGHT == 768
    )
}

/**
 * This function is called when the page was completely loaded.
 **/
function onloadHandler() {
    
    // Display current version
    if( document.getElementById( "version_tag" ) )
	document.getElementById( "version_tag" ).innerHTML = VERSION_STRING;


    // Prepare the sizes for the screen components?
    if( _DILDO_CONFIG.AUTO_RESIZE_ON_DOCUMENT_LOAD ) {

	//var maxCanvasWidth  = Math.max( _DILDO_CONFIG.PREVIEW_CANVAS_WIDTH,  _DILDO_CONFIG.BEZIER_CANVAS_WIDTH );
	var maxCanvasHeight = Math.max( _DILDO_CONFIG.PREVIEW_CANVAS_HEIGHT, _DILDO_CONFIG.BEZIER_CANVAS_HEIGHT );
	var defaultHeight   = 10 + 25 + maxCanvasHeight + 10 + 25 + 10 + 50;
	var defaultWidth    = 10 + _DILDO_CONFIG.PREVIEW_CANVAS_WIDTH + 10 + _DILDO_CONFIG.BEZIER_CANVAS_WIDTH + 10 + 400 + 10 + 50;
	// Resize at all?
	if( defaultHeight > window.innerHeight || defaultWidth > window.innerWidth ) {
	    if( (window.innerHeight-defaultHeight) > (window.innerWidth-defaultWidth) ) {

		// Height weights more than width
		var effectiveHeight = Math.round( (window.innerWidth - 3*10 - 2*25 - 50)/2 );
		_DILDO_CONFIG.PREVIEW_CANVAS_HEIGHT = _DILDO_CONFIG.BEZIER_CANVAS_HEIGHT = effectiveHeight;
		_DILDO_CONFIG.PREVIEW_CANVAS_WIDTH  = _DILDO_CONFIG.BEZIER_CANVAS_WIDTH  = Math.round( effectiveHeight * (512.0/768.0) );

	    } else {

		// Width weights more than height (or equals)
		var effectiveWidth = Math.round( (window.innerWidth - 4*10 - 400 - 50)/2 );
		_DILDO_CONFIG.PREVIEW_CANVAS_WIDTH  = _DILDO_CONFIG.BEZIER_CANVAS_WIDTH  = effectiveWidth;
		_DILDO_CONFIG.PREVIEW_CANVAS_HEIGHT = _DILDO_CONFIG.BEZIER_CANVAS_HEIGHT = Math.round( effectiveWidth * (768.0/512.0) );

	    }
	} // END if [current canvas sizes are out of screen bounds]

    } // END if [auto resize on document load allowed]


    // Add the canvas components
    _deployCanvasComponents();
    _resizeCanvasComponents();
    _repositionComponentsBySize();

    // Install the key handler
    _installKeyHandler();

    // Try to init WebGL
    if( !initWebGL() ) {

	// Show error message.
	messageBox.show( "<br/>\n" +
			 "<br/>\n" +
			 "<h3>No WebGL!</h3><br/>\n" +
			 //"<br/>\n" +
			 "Maybe you want to visit the WebGL support site.<br/>\n" +
			 "<a href=\"http://get.webgl.org/\" target=\"_new\">http://get.webgl.org/</a><br/>\n" 
			 //"<button onclick=\"messageBox.hide()\" disabled=\"disabled\">Close</button>\n"
		       );
	return;

    }

    
    // Fetch the GET params
    // Thanks to weltraumpirat
    //   http://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript
    function getSearchParameters() {
	var url = window.location.href; //search;
	var index = url.indexOf("?");
	if( index == -1 || index+1 >= url.length ) 
	    return {};

	var prmstr = url.substr( index+1 );
	prmstr     = decodeURI(prmstr);     // '[' and ']' might be encoded!
	return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
    }
    function transformToAssocArray( prmstr ) {
	var params = {};
	var prmarr = prmstr.split("&");
	for ( var i = 0; i < prmarr.length; i++) {
            var tmparr = prmarr[i].split("=");
            params[tmparr[0]] = tmparr[1];
	}
	return params;
    }

    var params = getSearchParameters();
    //window.alert( "params=" + JSON.stringify(params) );
    _applyParamsToMainForm( params );

 

    // Try to load dildo design from last session cookie (if allowed and if no data is passed)
    if( _DILDO_CONFIG && _DILDO_CONFIG.AUTOLOAD_ENABLED && !params.rbdata )
	loadFromCookie(true); // retainErrorStatus
    if( params.rbdata )
	_applyReducedBezierData( params.rbdata );
    

    displayBendingValue();
    toggleFormElementsEnabled();
    updateBezierStatistics( null, null );


    // Scale to perfect screen fit?
    if( params._screenfit && params._screenfit == "1" ) {
	//window.alert( "Scale to screen fit." );
	acquireOptimalBezierView();
    }

    
    // Is the rendering engine available?
    // Does this browser support WebGL?
    previewCanvasHandler.preview_rebuild_model();
    // Does the configured canvas size differ from the default (hard coded) bezier size?
    if( !isDefaultCanvasSize() ) // _DILDO_CONFIG.BEZIER_CANVAS_WIDTH != 512 || _DILDO_CONFIG.BEZIER_CANVAS_HEIGHT != 768 )
	acquireOptimalBezierView();
    preview_render();


    // Finally set a timeout for auto-saving
    window.setInterval( "autosaveInCookie()", 1000*30 );

  
}

/**
 * This function add the two canvas objects to the DOM (preview_canvas for 3D,
 * bezier_canvas for 2D view).
 **/
function _deployCanvasComponents() {
    _deployCanvasComponentWith( "bezier_canvas",
				_DILDO_CONFIG.BEZIER_CANVAS_WIDTH,
				_DILDO_CONFIG.BEZIER_CANVAS_HEIGHT,
				"Double click onto the curve to add new control points. Press the [DEL] key to delete selected points.",
				"setStatus('Double click onto the curve to add new control points. Press the [DEL] key to delete selected points.');",
				"setStatus('');",
				"bezier_canvas_div"
			       );
    _deployCanvasComponentWith( "preview_canvas",
				_DILDO_CONFIG.PREVIEW_CANVAS_WIDTH,
				_DILDO_CONFIG.PREVIEW_CANVAS_HEIGHT,
				"Click, hold and drag to rotate the view.",
				"setStatus('Click, hold and drag to rotate the view.');",
				"setStatus('');",
				"preview_canvas_div"
			       );    
} 

function _deployCanvasComponentWith( id,
				     width,
				     height,
				     title,
				     mouseover,
				     mouseout,
				     div_id
				   ) {

    var canvas     = document.createElement( "canvas" );
    canvas.setAttribute( "id",         id );
    canvas.setAttribute( "width",      width );
    canvas.setAttribute( "height",     height );
    canvas.setAttribute( "title",      title );
    canvas.setAttribute( "class",      "tooltip" );
    canvas.setAttribute( "mouseover",  mouseover );
    canvas.setAttribute( "mouseout",   mouseout );
    var preview_canvas_div = document.getElementById( div_id );
    document.body.appendChild( canvas );
    
}

/**
 * This function simply applies the dimension set in _DILDO_CONFIG to
 * the canvas elements.
 *  - _DILDO_CONFIG.PREVIEW_CANVAS_WIDTH
 *  - _DILDO_CONFIG.PREVIEW_CANVAS_HEIGHT
 *  - _DILDO_CONFIG.BEZIER_CANVAS_WIDTH
 *  - _DILDO_CONFIG.BEZIER_CANVAS_HEIGHT
 **/
function _resizeCanvasComponents() {
    var preview_canvas          = getPreviewCanvas(); 
    var bezier_canvas           = getBezierCanvas();

    preview_canvas.style.width  = _DILDO_CONFIG.PREVIEW_CANVAS_WIDTH   + "px";
    preview_canvas.style.height = _DILDO_CONFIG.PREVIEW_CANVAS_HEIGHT  + "px";  
    // Might be called during initialisation
    if( this.previewCanvasHandler ) {
	this.previewCanvasHandler.setRendererSize( _DILDO_CONFIG.PREVIEW_CANVAS_WIDTH, 
						   _DILDO_CONFIG.PREVIEW_CANVAS_HEIGHT
						 );
    }

    bezier_canvas.style.width   = _DILDO_CONFIG.BEZIER_CANVAS_WIDTH    + "px";
    bezier_canvas.style.height  = _DILDO_CONFIG.BEZIER_CANVAS_HEIGHT   + "px";
    // Might be called during initialisation
    if( this.bezierCanvasHandler ) {
	this.bezierCanvasHandler.setRendererSize( _DILDO_CONFIG.BEZIER_CANVAS_WIDTH, 
						  _DILDO_CONFIG.BEZIER_CANVAS_HEIGHT,
						  true  // redraw
						);
    }
    
}

function _repositionComponentsBySize() {
    var preview_canvas        = getPreviewCanvas(); 
    var bezier_canvas         = getBezierCanvas(); 
    
    // Note: the members 'x' and 'y' somehow don't seem to work here.
    preview_canvas.style.x    = preview_canvas.style.left = "10px";
    preview_canvas.style.y    = preview_canvas.style.top  = "40px";
    
    var bezierLeft            = (10 + _DILDO_CONFIG.PREVIEW_CANVAS_WIDTH + 10);
    bezier_canvas.style.x     = bezier_canvas.style.left = bezierLeft + "px";
    bezier_canvas.style.y     = bezier_canvas.style.top  = "40px";
    
    var maxCanvasHeight       = Math.max( _DILDO_CONFIG.BEZIER_CANVAS_HEIGHT, 
					  _DILDO_CONFIG.PREVIEW_CANVAS_HEIGHT
					);
    var status_bar            = getStatusBar();
    status_bar.style.y        = status_bar.style.top = (40 + maxCanvasHeight + 10) + "px";
    status_bar.style.width    = (_DILDO_CONFIG.PREVIEW_CANVAS_WIDTH + 10 + _DILDO_CONFIG.BEZIER_CANVAS_WIDTH) + "px";
    

    //window.alert( bezier_canvas.style.x );
    
    // Re-align register-head
    var registerHead          = document.getElementById( "register_head" );
    var registerLeft          = ( 10 + 
				  _DILDO_CONFIG.PREVIEW_CANVAS_WIDTH + 
				  10 + 
				  _DILDO_CONFIG.BEZIER_CANVAS_WIDTH + 
				  10 );
    registerHead.style.x      = registerHead.style.left = registerLeft + "px";
    
    // Re-align register-cards
    var divs = document.getElementsByTagName( "DIV" );
    for( var i = 0; i < divs.length; i++ ) {

	var entry = divs[i];
	if( !entry.className || entry.className != "register_card" )
	    continue;

	entry.style.x        = entry.style.left =  registerLeft+ "px";

    }

    // Reposition the Gallery-Links
    var galleryLinks            = document.getElementById( "gallery_links" );
    gallery_links.style.x       = gallery_links.style.left = bezierLeft + "px";


    // Reposition the 'informational' area (div)
    var informational           = document.getElementById( "informational" );
    informational.style.x       = informational.style.left = registerLeft + "px";
    
    // Reposition the 'license' area (div)
    var license                 = document.getElementById( "license" );
    license.style.x             = license.style.left       = registerLeft + "px";
    
    // Reposition the 'preview_controls' area (div)
    var previewControls         = document.getElementById( "preview_controls" );
    previewControls.style.width = _DILDO_CONFIG.PREVIEW_CANVAS_WIDTH + "px";
    // previewControls.style.backgroundColor = "#ff0000";
    previewControls.style.x     = previewControls.style.left = "10px";
    previewControls.style.y     = previewControls.style.top  = (40 + _DILDO_CONFIG.PREVIEW_CANVAS_HEIGHT + 10 + 16 + 10) + "px";

    var bezierControls          = document.getElementById( "bezier_controls" );
    bezierControls.style.width  = _DILDO_CONFIG.BEZIER_CANVAS_WIDTH + "px";
    bezierControls.style.x      = bezierControls.style.left = bezierLeft + "px";
    bezierControls.style.y      = bezierControls.style.top  = (40 + _DILDO_CONFIG.BEZIER_CANVAS_HEIGHT + 10 + 16 + 10) + "px";

    var donations               = document.getElementById( "donations" );
    donations.style.x           = donations.style.left   = (bezierLeft + _DILDO_CONFIG.BEZIER_CANVAS_WIDTH + 75) + "px";
    
    var versionTag              = document.getElementById( "version_tag" );
    // 400px is the _constant_ width of the control panel
    versionTag.style.width      = "300px";
    versionTag.style.x          = versionTag.style.left  = (bezierLeft + _DILDO_CONFIG.BEZIER_CANVAS_WIDTH + 280 + 10) + "px"; 
    versionTag.style.y          = versionTag.style.top   = "200px";
    //versionTag.style.backgroundColor = "#ff0000";
}

/**
 * 'params' must be an object.
 **/  
function _applyParamsToMainForm( params ) {

    // Now display the get params in the main form.
    //var params = getSearchParameters();
    var inputs = document.getElementsByTagName( "input" );
    for( var i = 0; i < inputs.length; i++ ) {

	for( var key in params ) {

	    if( params.hasOwnProperty(key) ) {

		//window.alert( key );

		var value = params[ key ];
		if( value == "" )
	    	    continue;


		var element = inputs[ i ];
		if( element.type.toLowerCase() == "checkbox" ) {

		    // This element is a checkbox. Set checked?		    
		    if( element.name.toLowerCase() == key )
			element.checked = (value != "0");


		} else if( element.type.toLowerCase() == "radio" ) {
		    
		    // This element is a radio button. Set selected?
		    if( element.name.toLowerCase() == key && element.value == value )
			element.checked = true;

		} else if( element.type.toLowerCase() == "text" || 
			   element.type.toLowerCase() == "number" || 
			   element.type.toLowerCase() == "range" ||
			   element.type.toLowerCase() == "hidden" 
			 ) {
		    
		    //if( element.type.toLowerCase() == "hidden" )
		//	window.alert( "element.name=" + element.name + ", passedKey=" + key + ", passedValue=" + value );
		    
		    // This element is a text/number/range. Set value?
		    if( element.name.toLowerCase() == key.toLowerCase() ) {
			//window.alert( "Setting element value: element.name=" + element.name + ", passedKey=" + key + ", passedValue=" + value );
			element.value = value;
		    }
		}

	    } // END for
	} // END if
    } // END for

    toggleFormElementsEnabled();
    preview_rebuild_model();
}

/**
 * The JSON representation of a bezier path can be very long.
 * This function loads the integer-bezier-representation into the current 
 * bezier canvas handler.
 * The integer-bezier-data is _much_ shorter than the JSON representation
 * and should in most cases fit into the max-2048-character request URL 
 * (GET param).
 **/
function _applyReducedBezierData( reducedBezierData ) {
    
    try {
	// Parse the point data and convert it to a bezier curve
	var bezierPath = IKRS.BezierPath.fromReducedListRepresentation( reducedBezierData );
	
	//window.alert( bezierPath );

	// Set the created curve
	setBezierPath( bezierPath );
	return true;
	
    } catch( e ) {
	console.log( "Failed to load bezier path from GET params: " + e );
	setStatus( "Failed to load bezier path from GET params: " + e );
	return false;
    }
}

/**
 * This function installs the key handler into the window object.
 *
 * The key handler itself is stored in this.keyHandler.
 **/  
function _installKeyHandler() {
    // Install the key handler
    this.keyHandler   = new IKRS.ExtrusiongenKeyHandler();
    window.onkeydown  = this.keyHandler.onKeyDown;
    window.onkeypress = this.keyHandler.onKeyPress;
    window.onkeyup    = this.keyHandler.onKeyUp;
}

// IE < v9 does not support this function.
if( window.addEventListener ) {
    window.addEventListener( "load",
			     onloadHandler,
			     false
			   );
} else {
    window.onload = onloadHandler;
}




function getPreviewMeshes() {

    return previewCanvasHandler.getMeshes();
}

function bezier_undo() {
    var hasMoreUndoSteps = this.bezierCanvasHandler.undo();
    
    window.alert( this.bezierCanvasHandler.undoHistory._toString() );
    
}

function bezier_redo() {
    var hasMoreRedoteps = this.bezierCanvasHandler.redo();
}

/*
function setBezierPathFromJSONString( bezierString ) {
    //window.alert( bezierString );
      
}
*/

function setBezierPath( bezierPath ) {

    this.bezierCanvasHandler.setBezierPath( bezierPath );    
    preview_rebuild_model();
}

function getBezierPath() {
    return this.bezierCanvasHandler.bezierPath;
}

function initWebGL() {

    try {
	this.bezierCanvasHandler = new IKRS.BezierCanvasHandler();
	this.bezierCanvasHandler.addChangeListener( updateBezierStatistics );  // A function
	this.previewCanvasHandler = new IKRS.PreviewCanvasHandler( this.bezierCanvasHandler,
								   _DILDO_CONFIG.PREVIEW_CANVAS_WIDTH,     // 512, 
								   _DILDO_CONFIG.PREVIEW_CANVAS_HEIGHT     // 768 
								 );
    
	// Indicate success.
	setStatus( "WebGL initialized. Ready." );
	return true;
    } catch( e ) {
	console.log( "Error: failed to initiate canvas handlers. Is WebGL enabled/supported?" );
	setStatus( "Error: failed to initiate canvas handlers. Is WebGL enabled/supported?" );
	// Indicate error.
	return false;
    }
}

/**
 * Signature as a bezier canvas listener :)
 **/
function updateBezierStatistics( source, event ) {
    if( event && event.nextEventFollowing )
	return; // Wait for last event in sequence, THEN update (saves resources)

    // Calculate the bezier curves inner area size.
    // The resulting value is in square units.
    var bezierAreaSize = this.bezierCanvasHandler.getBezierPath().computeVerticalAreaSize( 1.0,   // deltaSize
											   true   // useAbsoluteValues
											 );
    var bounds         = this.bezierCanvasHandler.getBezierPath().computeBoundingBox();
    // Now imagine the whole are to be a rectangle with the same height.
    // The resulting radius is then:
    //var imaginaryRectangleWidth = bezierAreaSize / bounds.getHeight();
    
    // Now imagine the solid revolution of that rectangle.
    // It's volume is the value we are interesed in. It equals the volume of the present mesh.
    // Volume = PI * square(radius) * height
    //var volumeInUnits_old = Math.PI * Math.pow(imaginaryRectangleWidth,2) * bounds.getHeight();
    var volumeInUnits     = this.bezierCanvasHandler.getBezierPath().computeVerticalRevolutionVolumeSize( //1.0,   // deltaSize
													  true   // useAbsoluteValues
													);
    

    var areaSize_squareMillimeters = bezierAreaSize * Math.pow( this.bezierCanvasHandler.getMillimeterPerUnit(), 2.0 );
    var volume_cubeMillimeters     = volumeInUnits * Math.pow( this.bezierCanvasHandler.getMillimeterPerUnit(), 3.0 );

    // There is a serious bug in the calculation:
    //  The computed volume is about 25%-30& too high!
    //  Didn't find the cause so far :(
    volume_cubeMillimeters *= 0.75;

    var volume_cubeMilliLiters     = volume_cubeMillimeters / 1000.0;
    var lowDensity                 = 0.76;
    var highDensity                = 1.07;
    var imperialCup                = 284.130642624675; // ml
    var usCup                      = 236.5882365;      // ml
    var weight_lowDensity          = roundToDigits((volume_cubeMillimeters/1000)*lowDensity,0);
    var weight_highDensity         = roundToDigits((volume_cubeMillimeters/1000)*highDensity,0);
    var tableData = [
	[ "Diameter",     roundToDigits((bounds.getWidth()/10)*2*this.bezierCanvasHandler.getMillimeterPerUnit(),1,3),            "cm"  ],
	[ "Height",       roundToDigits((bounds.getHeight()/10)*this.bezierCanvasHandler.getMillimeterPerUnit(),1,3),             "cm"  ],
	[ "Bezier Area",  roundToDigits((areaSize_squareMillimeters/100.0),2,3),                                                  "cm<sup>2</sup>"  ],
	[ "Volume",       roundToDigits((volume_cubeMillimeters/1000.0),1,3),                                                     "cm<sup>3</sup> | ml"  ],
	[ "",             roundToDigits((volume_cubeMilliLiters/imperialCup),1,3),                                                " Imperial Cups"  ],
	[ "",             roundToDigits((volume_cubeMilliLiters/usCup),1,3),                                                      " US Cups"  ],
	[ "Weight<br/>&nbsp;[low density silicone, " + lowDensity + "g/cm<sup>3</sup>]", roundToDigits(weight_lowDensity,0,3),    "g"  ],
	[ "Weight<br/>&nbsp;[high density silicone, " + highDensity + "g/cm<sup>3</sup>]", roundToDigits(weight_highDensity,0,3), "g"  ]
    ];
    document.getElementById( "volume_and_weight" ).innerHTML = makeTable( tableData );

    preview_rebuild_model();
}

function makeTable( tableData ) {
    // I know, this is ugly.
    // String concatenation _and_ direct HTML insert insert DOM use. Bah!
    // Please optimize.
    var result = "<table style=\"border: 1px solid #686868;\">";
    for( var r = 0; r < tableData.length; r++ ) {

	result += "<tr>\n";
	for( var c = 0; c < tableData[r].length; c++ ) {

	    //var valign = "top";
	    //var align  = "left";

	    if( c == 1 )
		result += "<td valign=\"bottom\" align=\"right\">" + tableData[r][c] + "&nbsp;</td>\n";
	    else
		result += "<td valign=\"bottom\">" + tableData[r][c] + "&nbsp;</td>\n";

	}
	result += "</tr>\n";

    }
    result += "</table>\n";
    return result;
}

function preview_render() {
  
  // Recursive call
  requestAnimationFrame( this.preview_render ); 
  previewCanvasHandler.render( this.preview_scene, 
			       this.preview_camera 
			       ); 
}

function decreaseZoomFactor( redraw ) {
    this.previewCanvasHandler.decreaseZoomFactor();
    if( redraw )
	preview_render();
}

function increaseZoomFactor( redraw ) {
    this.previewCanvasHandler.increaseZoomFactor();
    if( redraw )
	preview_render();
}

function increaseGUISize() {
    changeGUISizeByFactor(1.1);
}

function decreaseGUISize() {
    changeGUISizeByFactor(1.0/1.1);
}

function changeGUISizeByFactor( factor ) {
    _DILDO_CONFIG.PREVIEW_CANVAS_WIDTH *= factor;
    _DILDO_CONFIG.PREVIEW_CANVAS_HEIGHT *= factor;
    _DILDO_CONFIG.BEZIER_CANVAS_WIDTH *= factor;
    _DILDO_CONFIG.BEZIER_CANVAS_HEIGHT *= factor;

    _resizeCanvasComponents();
    _repositionComponentsBySize();
}


function increase_mesh_details() {
	var shape_segments = this.document.forms["mesh_form"].elements["shape_segments"].value;
	var path_segments  = this.document.forms["mesh_form"].elements["path_segments"].value;		
			
	shape_segments     = parseInt( shape_segments );
	path_segments      = parseInt( path_segments );
			
	shape_segments     = Math.ceil( shape_segments * 1.2 );
	path_segments      = Math.ceil( path_segments  * 1.2 );
			
	this.document.forms["mesh_form"].elements["shape_segments"].value = shape_segments;
	this.document.forms["mesh_form"].elements["path_segments"].value  = path_segments;
			
	preview_rebuild_model();
}

function decrease_mesh_details() {

	var shape_segments = this.document.forms["mesh_form"].elements["shape_segments"].value;
	var path_segments  = this.document.forms["mesh_form"].elements["path_segments"].value;		
			
	shape_segments     = parseInt( shape_segments );
	path_segments      = parseInt( path_segments );
			
	shape_segments     = Math.max( 3, Math.floor( shape_segments / 1.2 ) );
	path_segments      = Math.max( 2, Math.floor( path_segments  / 1.2 ) );

        if( shape_segments < 3 && path_segments < 2 )
	    return; // No change

    // The min or max bound might have been reached and the segment values
    // were re-adjusted. Display the new value in the HTML form.
	this.document.forms["mesh_form"].elements["shape_segments"].value = shape_segments;
	this.document.forms["mesh_form"].elements["path_segments"].value  = path_segments;
			
	preview_rebuild_model();

}

function preview_rebuild_model() {
  this.previewCanvasHandler.preview_rebuild_model();
}


function newScene() {
      
    var defaultSettings = {
	shapeSegments:     80,
	pathSegments:      80,
	bendAngle:         0,
	buildNegativeMesh: false,
	meshHullStrength:  12,
	closePathBegin:    false,
	closePathEnd:      true,
	wireframe:         false,
	triangulate:       true,
	parts:             null,  // default: "both"
	shapeTwist:        0,
	shapeStyle:        null   // default: "circle"
    };

    ZipFileImporter._apply_mesh_settings( defaultSettings );


    var json = getDefaultBezierJSON();
    setBezierPathFromJSON( json,  // a JSON string containing the bezier data
			   0      // bend_angle
			 );
    
    // Clear dildo ID (otherwise the new design cannot be published)
    setCurrentDildoID( -1, "" );
    
    if( !isDefaultCanvasSize() )
	acquireOptimalBezierView();
}

function setBezierPathFromJSON( bezier_json, bend_angle ) {

    var bezierPath = null;
    try {
	bezierPath = IKRS.BezierPath.fromJSON( bezier_json );		    
    } catch( e ) {
	window.alert( "Error: " + e );
	return false;
    }
    setBezierPath( bezierPath );
    setBendingValue( bend_angle );
    updateBezierStatistics( null, null );
    toggleFormElementsEnabled();

    preview_rebuild_model();
    return true;
}

function setBezierPathFromReducedListRepresentation( array_json, bend_angle ) {

    var bezierPath = null;
    try {
	bezierPath = IKRS.BezierPath.fromReducedListRepresentation( array_json );		    
    } catch( e ) {
	window.alert( "Error: " + e );
	return false;
    }
    setBezierPath( bezierPath );
    setBendingValue( bend_angle );
    updateBezierStatistics( null, null );
    toggleFormElementsEnabled();

    preview_rebuild_model();
    return true;
}

function saveShape() {

    saveTextFile( bezierCanvasHandler.bezierPath.toJSON(), 'dildo_bezier_shape_' + createHumanReadableTimestamp() + '.json', 'application/json' );

}

function loadShape() {
    upload_bezier_json_file( document.forms['bezier_file_upload_form'].elements['bezier_json_file'] );
    toggleFormElementsEnabled();
}

function exportZIP() {

    // Check size
    if( !checkSizeBeforeSaving() )
	return false;

    var zip_filename = "dildo_settings_" + createHumanReadableTimestamp() + ".zip";
    ZipFileExporter.exportZipFile( zip_filename );
}

function importZIP() {
    var zip_filename = document.forms['zip_import_form'].elements['zip_upload_file'];
    if( zip_filename ) {
	ZipFileImporter.importZipFile( zip_filename );
    }
}

function publishDildoDesign() {

    var dongNames  = new Array( "Karl", 
				"Intruder Alert",  
				"Silicone Redeemer",
				"Love Machine",
				"It's a fap!",
				"Snoosnoo Enhancer",
				"Absolutely Fapulous",
				"Mind The Fap",
				
				"Faporatory",
				"Faporizer",
				"The Gender Bender",
				"Large Hardon Collider",			
				"Oh Long Johnson",
				"Cereal Port",
				"Needle"
			      );
    var userNames  = new Array( "Señor Pijo",
				"Madame Laineux",
				"Bernd",
				"Navel Fluff",
				"Sev",
				"Fap Dancer",
				"I.C. Weener",

				"Captain Harrrrrdon",
				"Polygon Faprications",
				"Dong Quixote",
				"Master Baiter",
				"Obi Wank Kenobi",
				"The Nice King",
				"Ygritte",
				"Tank Girl",
				"Booga",
				"Shrub-Niggurath",
				"Homer Sexual",
				"King Dong"
			      );
    var dongIndex        = Math.floor( Math.random() * dongNames.length );
    var userIndex        = Math.floor( Math.random() * userNames.length );
    //window.alert( random + ", " + names.length );

    // Clear bezier background data!
    // Some visitors used it to upload p0rn
    this.bezierCanvasHandler.setDrawCustomBackgroundImage( false, true ); // redraw=true


    var imageData        = get3DScreenshotData();
    var bezierImageData  = getBezierScreenshotData();
    var currentDildoHash = getCurrentDildoHash();
    
    // Restore the old custom background image
    this.bezierCanvasHandler.setDrawCustomBackgroundImage( true, true ); // redraw=true
    
    messageBox.show( "<br/>\n" +
		     "<h3>Publish your Dildo</h3>\n" +
		     "This will publish your dildo and add it to the gallery.<br/>\n" +
		     //"<div style=\"text-align: center;\">\n" +
		     "<form name=\"publish_form\" onkeypress=\"return event.keyCode != 13;\">\n" +
		     "   <input type=\"hidden\" name=\"image_data\" value=\"" + imageData + "\" />\n" +
		     "   <input type=\"hidden\" name=\"bezier_image_data\" value=\"" + bezierImageData + "\" />\n" +
		     //"   <div id=\"screenshot_div\"></div>\n" +
		     "   <table border=\"0\" style=\"text-align: left; margin-left: 5%; margin-right: 5%;\">\n" +
		     "      <tr>\n" +
		     "         <td rowspan=\"14\" style=\"padding: 10px;\"><img src=\"" + imageData + "\" width=\"256\" height=\"384\" alt=\"Preview\" /></td>\n" +
		     "      </tr>\n" +

		     "      <tr>\n" +
		     "         <td>Give&nbsp;your&nbsp;dong&nbsp;a&nbsp;name:</td>\n" +
		     "         <td><input type=\"text\" maxlength=\"64\" name=\"dong_name\" value=\"" + dongNames[dongIndex] + "\" /></td>\n" +
		     "      </tr>\n" +

		     "      <tr>\n" +
		     "         <td>Your&nbsp;name/alias:</td>\n" +
		     "         <td><input type=\"text\" name=\"user_name\" maxlength=\"128\" value=\"" + userNames[userIndex] + "\"\" /></td>\n" +
		     "      </tr>\n" +

		     "      <tr>\n" +
		     "         <td style=\"vertical-align: top;\">Email&nbsp;address:</td>\n" +
		     "         <td style=\"vertical-align: top;\"><input type=\"text\" id=\"hide_email_address\" name=\"email_address\" value=\"you@domain.com\" /> (optional)<br/>\n" +
		     "                                            <input type=\"checkbox\" name=\"hide_email_address\" value=\"1\" checked=\"checked\" /> " +
		     "                                            <label for=\"hide_email_address\">Hide email address from public</label>\n" +
		     "             </td>\n" +
		     "      </tr>\n" +

		     "      <tr>\n" +
		     "         <td><label for=\"allow_download\">Allow&nbsp;download:</label></td>\n" +
		     "         <td><input type=\"checkbox\" id=\"allow_download\" name=\"allow_download\" value=\"1\" checked=\"checked\" />\n" +
		     "             </td>\n" +
		     "      </tr>\n" +

		     "      <tr>\n" +
		     "         <td>Keywords:</td>\n" +
		     "         <td><input type=\"text\" name=\"keywords\" maxlength=\"1024\" value=\"\" /></td>\n" +
		     "      </tr>\n" +

		     /*
		     "      <tr>\n" +
		     "         <td><label for=\"allow_edit\">Allow&nbsp;edit:</label></td>\n" +
		     "         <td><input type=\"checkbox\" id=\"allow_edit\" name=\"allow_edit\" value=\"1\" />\n" +
		     "             </td>\n" +
		     "      </tr>\n" +
		     */

		     "      <tr>\n" +
		     "         <td></td>\n" +
		     "         <td><div style=\"font-size: 8pt; text-align: right;\">What does this do? Where is my dong published? See the <a href=\"javascript:open_faqs('privacy_publishing');\">FAQ</a> (popup)</div></td>\n" +
		     "      </tr>\n" +

		     "      <tr>\n" +
		     "         <td></td>\n" +
		     "         <td><div style=\"text-align: right;\">To the <a href=\"javascript:open_gallery();\">Gallery</a>.</div></td>\n" +
		     "      </tr>\n" +
		     
		     
		     "      <tr><td>&nbsp;</td><td></td></tr>\n" +
		     "      <tr><td>&nbsp;</td><td></td></tr>\n" +
		     "      <tr><td>&nbsp;</td><td></td></tr>\n" +
		     "      <tr><td>&nbsp;</td><td><span id=\"loading_span_static\"></span></td></tr>\n" +
		     "      <tr><td>&nbsp;</td><td><span id=\"loading_span\"></span></td></tr>\n" +
		     "      <tr><td>&nbsp;</td><td></td></tr>\n" +
		     
		     //"      <tr>\n" +
		     //"         <td></td>\n" +
		     //"         <td><button onclick=\"_publish_dildo_design();\">Save</button> <button onclick=\"messageBox.hide();\">Cancel</button></td>\n" +
		     //"      </tr>\n" +

		     //"      <tr><td>&nbsp;</td><td>" + (currentDildoHash ? "Your design was already saved with ID " + currentDildoHash + "." : "") + "</td></tr>\n" +
		     
		     "      </tr>\n" +
		     "      </table>\n" +
		     "</form>\n" +
		     "<button onclick=\"_publish_dildo_design();\"" + (currentDildoHash ? "disabled=\"disabled\"" : "") + ">Publish!</button> <button onclick=\"messageBox.hide()\">Cancel</button><br/>\n" + 
		     (currentDildoHash ? "<div class=\"error\">Your design was already saved under ID <a href=\"javascript:open_gallery('?public_hash=" + currentDildoHash + "');\">" + currentDildoHash + "</a>.<br/>If you want to publish a different design please create a new scene first (go to Model&rarr;New).</div>" : ""),
		     //"</div>\n",
		     800,
		     600 
		   );

    // Now display the screenshot image
    
    /*var img       = document.createElement('img');
    //img.src       = 'data:image/jpeg;base64,' + btoa('your-binary-data');
    img.src       = imageData;
    img.width     = 256; // 512/2
    img.height    = 384; // 768/2
    document.getElementById("screenshot_div").appendChild( img );
*/

    //window.alert( "Sorry, this function is not yet implemented." );
}

/**
 * Toggles the 'about' dialog.
 **/
function about() {

    var buttonHandler = "messageBox.hide()";
    
    messageBox.setSize( 300, 340 );
    messageBox.show( 
        "<br/><br/>Extrusion/Revolution Generator<br/>\n" +
	    "(a.k.a. Dildo Generator)<br/>\n" + 
            "<br/>\n" +
	    "extrusiongen<br/>\n" + 
	    VERSION_STRING + "<br/>\n" + 
	    "<img src=\"img/I_eat_food_quadratisch_0_-_0.jpg\" alt=\"Logo - I eat food\" width=\"120\" height=\"120\" /><br/>\n" +
	    "<br/>\n" +
	    "<a href=\"https://github.com/IkarosKappler/extrusiongen\" target=\"_blank\">Ikaros Kappler @ github</a><br/>\n" +
            "<br/><button onclick=\"" + buttonHandler + "\"" + (buttonHandler?"":" disabled") + ">Close</button>" 
    );
    
}

function autosaveInCookie() {
    saveInCookie();
    setStatus( "Autosaved in cookie." );
}

function saveInCookie() {
    setCookie( "bend", getBendingValue(), 60*24 );
    setCookie( "bezier_path", getBezierPath().toJSON(), 60*24 );
}

function loadFromCookie( retainErrorStatus ) {
    var bend       = getCookie( "bend" );
    var bezierJSON = getCookie( "bezier_path" );
    //window.alert( "bend=" + bend + ", bezier_path=" + bezierJSON );
    
    // Try to convert JSON string to BezierPath object
    try {
	var bezier_path = IKRS.BezierPath.fromJSON( bezierJSON );
	setBendingValue( bend );
	setBezierPath( bezier_path );
	return true;
    } catch( e ) {
	if( !retainErrorStatus ) {
	    console.log( "Failed to load bezier path from cookie: " + e );
	    setStatus( "Failed to load bezier path from cookie: " + e );
	}
	return false;
    }
}

/**
 * Thanks to
 *  http://www.w3schools.com/js/js_cookies.asp
 **/
function setCookie( cname, cvalue, exminutes ) {
    var d = new Date();
    d.setTime(d.getTime() + (exminutes*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
} 

/**
 * Thanks to
 *  http://www.w3schools.com/js/js_cookies.asp
 **/
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
} 


function debug() {
    saveInCookie();
}

function debug_B() {
    loadFromCookie();
}

function debug_C() {
    //var screenshotData = get3DScreenshotData();
    var screenshotData = getBezierScreenshotData();
    //window.alert( screenshotData );
    window.open( screenshotData );
}

/**
 * This returns a MIME/Base64 string containing the screenshot data (usually a PNG image).
 **/
function get3DScreenshotData() {
    // This requires that the preview_renderer was initialized with the preserveDrawingBuffer=true flag.

    // Thanks to Dinesh Saravanan for the Screenshot howto at
    // http://stackoverflow.com/questions/15558418/how-do-you-save-an-image-from-a-three-js-canvas
    return this.previewCanvasHandler.preview_renderer.domElement.toDataURL();  // image/png is default
}

function getBezierScreenshotData() {
    return this.bezierCanvasHandler.canvas.toDataURL(); // image/png is default
}

/**
 * This function is called from the Help->Display_Bezier_String menu entry.
 * It is required by merchants to retrieve the bezier string for setting up presets.
 **/
/*
function display_bezier_string() {
    //window.alert( this.bezierCanvasHandler.getBezierPath().toJSON().replace( /"/g, "" ) );
    //window.alert( "\"" + this.bezierCanvasHandler.getBezierPath().toJSON().replace( /"/g, "\\\"" ) + "\"" );
    
}
*/


function checkSizeBeforeSaving() {
    var bezierBounds        = this.bezierCanvasHandler.getBezierPath().computeBoundingBox();
    var heightInMillimeters = (bezierBounds.getHeight()/1.0) * this.bezierCanvasHandler.getMillimeterPerUnit();
    //window.alert( heightInMillimeters );
    if( heightInMillimeters > 210 ) {	
	//window.alert( "The shape must not be bigger than 200mm." );
	/*
	messageBox.show(
	    "<br/><br/>\n" +
		"The shape must not be bigger than 200mm.<br/>\n"
	);
	*/
	return window.confirm( "The shape is bigger than 210mm (height) and cannot be printed this way.\n" +
			       "\n" +
			       "Do you want to continue though?\n" 
			     );
    }

    return true;
}


var divisibleSTLBuilder = null;
function exportSTL() {

    if( !divisibleSTLBuilder ) { 
	
	// Check size
	if( !checkSizeBeforeSaving() )
	    return false;

	var meshes        = getPreviewMeshes();
	var filename      = null;
	if( document.forms['stl_form'].elements['stl_filename'] )
	    filename =  document.forms['stl_form'].elements['stl_filename'].value;
	else
	    filename = "mesh.stl";

	var merge_meshes  = false;
	if( document.forms["stl_form"] &&
	    document.forms["stl_form"].elements["stl_merge_meshes"] &&
	    document.forms["stl_form"].elements["stl_merge_meshes"].checked ) {

	    merge_meshes = true;
	}
	
	// Init the divisible STL builder
	divisibleSTLBuilder = new IKRS.DivisibleSTLBuilder( meshes,
							    filename,
							    function( e ) { },
							    1024*128,    // 128 kB chunks,
							    this.bezierCanvasHandler.getMillimeterPerUnit(),
							    !merge_meshes        // export as single mesh?
							  );
	
	showLoadingBar( "exportSTL_cancelHandler()" );

    }
    
    if( divisibleSTLBuilder.isInterrupted() ) {

	divisibleSTLBuilder = null;
	hideLoadingBar();
	return;

    }

    //console.log( "Next chunk (" + divisibleSTLBuilder.chunkResults.length + ")." );
    displayProcessState( divisibleSTLBuilder.getProcessedChunkCount(),
			 divisibleSTLBuilder.getProjectedChunkCount() 
		       );

    var hasNextChunk = divisibleSTLBuilder.processNextChunk();
    
    if( hasNextChunk ) 
	window.setTimeout( "exportSTL();", 100 );
    else {
	
	//window.alert( "Finished. " + divisibleSTLBuilder.chunkResults.length + " chunks calculated." );
	displayProcessState( divisibleSTLBuilder.getProcessedChunkCount(), 
			     divisibleSTLBuilder.getProjectedChunkCount() 
			   );
	divisibleSTLBuilder.saveSTLResult();
	divisibleSTLBuilder = null;
	
	hideLoadingBar();

    }
    
}

function exportSTL_cancelHandler() {
    if( divisibleSTLBuilder ) {
	
	divisibleSTLBuilder.interrupt();
	stopLoadingAnimation() ;
	
    }
}


var divisibleOBJBuilder = null;
function exportOBJ() {

    if( !divisibleOBJBuilder ) { 
	
	// Check size
	if( !checkSizeBeforeSaving() )
	    return false;
	
	var meshes        = getPreviewMeshes();
	var filename      = null;
	if( document.forms['obj_form'].elements['obj_filename'] )
	    filename =  document.forms['obj_form'].elements['obj_filename'].value;
	else
	    filename = "mesh.obj";

	var merge_meshes  = false;
	if( document.forms["obj_form"] &&
	    document.forms["obj_form"].elements["obj_merge_meshes"] &&
	    document.forms["obj_form"].elements["obj_merge_meshes"].checked ) {

	    merge_meshes = true;
	}
	
	// Init the divisible STL builder
	divisibleOBJBuilder = new IKRS.DivisibleOBJBuilder( meshes,
							    filename,
							    function( e ) { },
							    1024*128,    // 128 kB chunks,
							    this.bezierCanvasHandler.getMillimeterPerUnit(),
							    !merge_meshes        // export as single mesh?
							  );
	
	showLoadingBar( "exportOBJ_cancelHandler()" );

    }
    
    if( divisibleOBJBuilder.isInterrupted() ) {

	divisibleOBJBuilder = null;
	hideLoadingBar();
	return;

    }

    //console.log( "Next chunk (" + divisibleSTLBuilder.chunkResults.length + ")." );
    displayProcessState( divisibleOBJBuilder.getProcessedChunkCount(),
			 divisibleOBJBuilder.getProjectedChunkCount() 
		       );

    var hasNextChunk = divisibleOBJBuilder.processNextChunk();
    
    if( hasNextChunk ) 
	window.setTimeout( "exportOBJ();", 100 );
    else {
	
	//window.alert( "Finished. " + divisibleSTLBuilder.chunkResults.length + " chunks calculated." );
	displayProcessState( divisibleOBJBuilder.getProcessedChunkCount(), 
			     divisibleOBJBuilder.getProjectedChunkCount() 
			   );
	divisibleOBJBuilder.saveOBJResult();
	divisibleOBJBuilder = null;
	
	hideLoadingBar();

    }
    
}

function exportOBJ_cancelHandler() {
    if( divisibleOBJBuilder ) {
	
	//messageBox.show( "<br/><br/>Interrupted ...<br/><br/>Please wait for process to terminate.<br/>\n" );
	divisibleOBJBuilder.interrupt();
	stopLoadingAnimation() ;
	
    }
}



/*
function _exportOBJ_simple() {

    var meshes        = getPreviewMeshes();
    var filename      = null;
    if( document.forms['obj_form'].elements['obj_filename'] )
	filename =  document.forms['obj_form'].elements['obj_filename'].value;
    else
	filename = "mesh.stl";

    OBJBuilder.saveOBJ( meshes, filename, function() { } );

}
*/

/**
 * This script adds the message box/layer to the DOM and initializes
 * the process listener.
 **/

var messageBox = new IKRS.MessageBox( "message_layer" );

function displayProcessState( currentStep, maxStep ) {
    var pct = ( (1.0 * currentStep) / maxStep ) * 100;
    pct = pct.toFixed( 2 );
    document.getElementById( "process_div" ).innerHTML = "" + currentStep + "/" + maxStep + " [" + pct + "%]";
}


function showLoadingBar( buttonHandler ) {
    
    if( !buttonHandler )
	buttonHandler = "hideLoadingBar()";
       
    messageBox.setSize( 300, 180 );
    messageBox.show( 
        "<br/><br/>Loading ...<br/>\n" +
            "<br/>\n" +
            "<span id=\"loading_span\"></span><br/>\n" +
            "<div id=\"process_div\">X</div><br/>\n" +
            "<br/><button onclick=\"" + buttonHandler + "\"" + (buttonHandler?"":" disabled") + ">Cancel</button>" 
    );

    startLoadingAnimation();

}

function hideLoadingBar() {

    // !!! FIX THIS !!!
    // THIS SOMEHOW MAKES THE PROGRESS INDICATOR TO FAIL!
    //stopLoadingAnimation();
    
    
    messageBox.hide();
    stopLoadingAnimation();
}


var loadingAnimationKey         = null;
var loadingAnimationInterrupted = false;
var loadingAnimationElements    = [ '|', '/', '&ndash;', '\\' ];
var loadingAnimationPointer     = 0;
function startLoadingAnimation() {
    if( !loadingAnimationKey )
        loadingAnimationKey = window.setInterval( "nextLoadingAnimationStep();", 250 ); // "startLoadingAnimation();", 250 );

} 

function nextLoadingAnimationStep() {
    if( !loadingAnimationKey )
	return;
    
    // Be sure the loading_span is really there 
    // (otherwise stop the animation automatically)
    if( document.getElementById("loading_span") ) 
	document.getElementById("loading_span").innerHTML = loadingAnimationElements[loadingAnimationPointer];
    else if( loadingAnimationKey ) 
    	stopLoadingAnimation();

    loadingAnimationPointer = (loadingAnimationPointer + 1) % loadingAnimationElements.length;
}



function stopLoadingAnimation() {
    if( loadingAnimationKey )
        window.clearInterval( loadingAnimationKey );

    loadingAnimationKey = null;
}

function order_print() {
    var html = 
	"<br/>\n" +
	"<h2 style=\"color: #000000;\">This project is not in development any more</h2>\n" +
	// "<img src=\"img/YOUin3D.com_A.png\" width=\"131\" height=\"118\" alt=\"Featured by YOUin3D.com\" /><br/>\n" +
	"Sorry.<br/>\n" +
	"<br/>\n" +
	"</div>\n" +
	"<br/>\n"+
	"<span style=\"font-size: 10pt;\">Thanks for all the help, fun and the cool time!</span><br/>\n" +
	//"I love you all.<br/>\n" +
	"<br/>\n"+
	"<br/><button onclick=\"messageBox.hide();\">Close</button>" 

    messageBox.show( html, 
		     
		     // Make this message box extra large
		     IKRS.MessageBox.DEFAULT_WIDTH*2, 
		     IKRS.MessageBox.DEFAULT_HEIGHT*2.5 
		   );
}

function open_faqs( anchor ) {
    window.open( "faq.html" + (anchor ? "#"+anchor : ""),
		 "dildogenerator_faq",
		 "height=480,width=800,location=yes,toolbar=no,dependent=no,scrollbars=yes"
	       );
}

function open_legal_notice() {
    window.open( "legal_notice.html",
		 "dildogenerator_legal_notice",
		 "height=480,width=640,location=yes,toolbar=no,dependent=no,scrollbars=yes"
	       );
}

function open_gallery( query_string ) {
    window.open( "gallery/" + (query_string ? query_string : ""),
		 "dildogenerator_gallery",
		 "location=yes,toolbar=yes,dependent=no,scrollbars=yes"
	       );
}


/**
 * If the current dildo design was already saved before the returned dildo ID is stored
 * in an hidden form field.
 *
 * This function returns the stored dildoID or -1 if not available/not set.
 **/
function getCurrentDildoID() {
    // Early versions might not yet have the form/element.
    if( document.getElementById("dildoID") )
	return document.getElementById("dildoID").value;
    else
	return -1;
}

function getCurrentDildoHash() {
    if( document.getElementById("publicDildoHash") )
	return document.getElementById("publicDildoHash").value;
    else
	return "";
}

/**
 * This function stores the passed dildoID inside the hidden form field (if avaiable).
 **/
function setCurrentDildoID( dildoID, public_hash ) {
    var result = true;
    if( document.getElementById("dildoID") ) 
	document.getElementById("dildoID").value = dildoID;
    else
	result = false;
	
    if( document.getElementById("publicDildoHash") )
	document.getElementById("publicDildoHash").value = public_hash;
    else
	result = false;
    
    return result;
}

function acquireOptimalBezierView() {
    
    // Optimize view:
    this.bezierCanvasHandler.acquireOptimalView( new THREE.Vector2(75,75) );
}

/**
 *
 **/
function loadOptimalPrintingSettings( display_tab ) {
    //window.alert( "Loading optimal printing settings." );
    _applyParamsToMainForm( {
	build_negative_mesh:     1, // 'hollow'
	mesh_close_path_begin:   0,
	mesh_close_path_end:     1,
	mesh_hull_strength:      6, // mm
	triangulate:             1,
	split_shape:             1,
	parts:                   "both",
	arrange_splits_on_plane: 1,
	directions:              "zxy",
	mesh_hull_type:          "prism"
    } );

    if( display_tab )
	show_register_card( "print_controls" );
       
}

function show_bezier_input_dialog() {
    var html = 
	"<br/>\n" +
	"Bezier String (JSON):<br/>\n" +
	"<textarea id=\"bezier_input_area\" cols=\"70\" rows=\"22\">" + getDefaultBezierJSON() + "</textarea><br/>\n" +
	"<button onclick=\"_load_bezier_input_dialog_data();\">Load</button>\n" +
	"<button onclick=\"document.getElementById('bezier_input_area').value = '';\">Clear</button>\n" +
	"<button onclick=\"messageBox.hide();\">Close</button>\n";

    messageBox.show( html, 
		     
		     // Make this message box extra large
		     IKRS.MessageBox.DEFAULT_WIDTH*2, 
		     IKRS.MessageBox.DEFAULT_HEIGHT*2.5 
		   );
}

function _load_bezier_input_dialog_data() {
    var input = document.getElementById('bezier_input_area').value;
    if( input && input.indexOf("\"") != -1 ) {
	// Input contains quotation marks, so it is probably a JSON bezier path
	if( setBezierPathFromJSON(input,0) ) 
	    messageBox.hide();
    } else {

	// Input contains to quotation marks, so it is probably a reduced list representation
	if( setBezierPathFromReducedListRepresentation(input,0) )
	    messageBox.hide();

    }
}


/**
 * This function is called from the Help->Display_Bezier_String menu entry.
 * It is required by merchants to retrieve the bezier string for setting up presets.
 **/
function display_bezier_string() {
    //window.alert( "\"" + this.bezierCanvasHandler.getBezierPath().toJSON().replace( /"/g, "\\\"" ) + "\"" );

    var bezierJSON = this.bezierCanvasHandler.getBezierPath().toJSON();
    //var reducedBezierJSON = this.bezierCanvasHandler.getBezierPath().toReducedListRepresentation( 1 ); // one digit

    var html = 
	"<br/>\n" +
	"Bezier String (JSON):<br/>\n" +
	"<textarea id=\"bezier_input_area\" cols=\"70\" rows=\"22\" readonly=\"readonly\">" + bezierJSON + "</textarea><br/>\n" +
	//"<button onclick=\"if( setBezierPathFromJSON(document.getElementById('bezier_input_area').value,0) ) messageBox.hide();\">Load</button>\n" +
	//"<button onclick=\"document.getElementById('bezier_input_area').value = '';\">Clear</button>\n" +
	"<button onclick=\"messageBox.hide();\">Close</button>\n";

    messageBox.show( html, 
		     
		     // Make this message box extra large
		     IKRS.MessageBox.DEFAULT_WIDTH*2, 
		     IKRS.MessageBox.DEFAULT_HEIGHT*2.5 
		   );
}


/**
 * Sets the status bar message.
 * If there is currently no status bar defined this function does just nothing.
 **/
function setStatus( msg ) {
    var status_bar = document.getElementById("status_bar");
    
    // Early integrated versions might not have a status bar
    if( !status_bar )
	return false;
    
    if( msg )
	status_bar.innerHTML = "$status: " + msg;
    else
	status_bar.innerHTML = "$status: &lt;ready&gt;";
}


/**
 * This function creates a new XMLHttpRequest.
 * I is a browser safe version for FireFox, Opera 8.0+, Safari, IE, Chrome.
 **/
function createXMLHttpRequest() {
    var xmlHttp=null;
    try {
	// Firefox, Opera 8.0+, Safari
	xmlHttp=new XMLHttpRequest();
    } catch (e) {
	//Internet Explorer
	
	try {
	    xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
	    xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
    }
    return xmlHttp;
} 


function roundToDigits( number, digits, enforceInvisibleDigits ) {
    var magnitude = Math.pow( 10, digits ); // This could be LARGE :/
    number = Math.round( number * magnitude );
    var result = "" + (number / magnitude);
    var index = result.lastIndexOf(".");
    if( index == -1 ) {	
	//result += ".0";
	index = result.length;
    }
    var digitsAfterPoint = result.length - index - 1;
    var digitsMissing    = enforceInvisibleDigits - digitsAfterPoint;
    while( digitsMissing-- > 0 )
	result += "&nbsp;";
    
    return result;
};
