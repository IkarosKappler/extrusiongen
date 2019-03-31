/**
 * The BezierCanvasHandler holds a bezier path and a HTML5 canvas (id=bezier_canvas)
 * and manages UI events and user input.
 *
 * Initially it holds a default bezier path which is defined by the value from
 * getDefaultBezierJSON() function call.
 *
 * The redraw() function is directly connected with the canvas object and draws - if
 * triggered - the bezier curve, holding points, rulers and background.
 *
 *
 * @author   Ikaros Kappler
 * @date     2013-08-14
 * @modified 2014-06-19 Ikaros Kappler (included the configurable background image object).
 * @modified 2014-08-05 Ikaros Kappler (added function setDrawCustomBackgrundImage(...)).
 * @version  1.0.1
 **/

IKRS.BezierCanvasHandler = function() {

    IKRS.Object.call( this );
    
    // These are MouseEvent locations
    this.latestMouseDownPosition;
    this.latestMouseDragPosition;
    this.latestMouseDownTime   = null; // ms
    
    this.latestClickTime       = null;

    this.currentDragPoint;
    this.currentDraggedPointIndex;

    this.selectedPointIndices  = [];

    var draggedCurveIndex      = -1;
    var draggedPointID         = -1;


    this.millimeterPerPixel    = 0.5

    this.canvasWidth           = _DILDO_CONFIG.BEZIER_CANVAS_WIDTH;  // canvas_width;
    this.canvasHeight          = _DILDO_CONFIG.BEZIER_CANVAS_HEIGHT; // canvas_height;

    this.canvas                = document.getElementById("bezier_canvas");
    this.context               = this.canvas.getContext( "2d" );
    

    this.canvas.onmousedown    = this.mouseDownHandler;
    this.canvas.onmouseup      = this.mouseUpHandler;
    this.canvas.onmousemove    = this.mouseMoveHandler; 
    
    this.changeListeners       = [];

    // Install a mouse wheel listener
    if( this.canvas.addEventListener ) { // window.addEventListener ) {

	// For Mozilla 
	this.canvas.addEventListener( 'DOMMouseScroll', this.mouseWheelHandler, false );
    } else {

	// IE
	this.canvas.onmousewheel = document.onmousewheel = mouseWheelHandler;

    }

    window.addEventListener( "keydown", this.keyDownHandler, false );

    // Build bezier curve from a JSON string
    var jsonString                    = getDefaultBezierJSON();
    this.bezierPath                   = IKRS.BezierPath.fromJSON( jsonString );
    
    // THE UNDO-HISTORY IS REALLY BUGGY AND CURRENTLY NOT IN USE.
    // THIS IS STILL TO BE FIXED!!!
    this.undoHistory                  = new IKRS.UndoHistory( this.bezierPath,
							      32
							    );
    this.bezierPath                   = this.undoHistory.getCurrentState().clone();
    

    // Store a reverse reference inside the handler so the mousehandlers can access this object
    this.canvas.bezierCanvasHandler   = this;
        

    this.backgroundImage              = null; // undefined;
    this.customBackgroundImage        = null;
    this.loadBackgroundImage( _DILDO_CONFIG.IMAGES.BEZIER_BACKGROUND, // "bg_bezier.png", 
			      true             // redraw when ready
			    ); 
    this.drawCustomBackgroundImage    = true;

};


IKRS.BezierCanvasHandler.POINT_ID_LEFT_UPPER_BOUND  = -1001;
IKRS.BezierCanvasHandler.POINT_ID_RIGHT_UPPER_BOUND = -1002;
IKRS.BezierCanvasHandler.POINT_ID_RIGHT_LOWER_BOUND = -1003;
IKRS.BezierCanvasHandler.POINT_ID_LEFT_LOWER_BOUND  = -1004;

IKRS.BezierCanvasHandler.prototype = new IKRS.Object();
IKRS.BezierCanvasHandler.prototype.constructor = IKRS.BezierCanvasHandler;


IKRS.BezierCanvasHandler.prototype.setRendererSize = function( width, height, redraw ) {
    this.canvasWidth           = width;
    this.canvasHeight          = height;
    this.canvas.setAttribute( "width",  width+"px" );
    this.canvas.setAttribute( "height", height+"px" );
    if( redraw )
	this.redraw();
};

/**
 * This function sets the zoom factor and draw offset to those values which
 * let the bezier curve optimally to be drawn on the whole canvas area.
 *
 * The frameSize param is a THREE.Vector2. The x component defines the horizontal
 * frame border width (left and right) and the y component defines the vertical
 * frame border height (top and bottom).
 *
 * Note that the bezier polygon's center is moved to the coordinate origin (0,0) 
 * for better zooming.
 **/
IKRS.BezierCanvasHandler.prototype.acquireOptimalView = function( frameSize ) {

    if( typeof frameSize == "undefined" )
	frameSize = new THREE.Vector2( 25, 25 );

    // Compute the applicable canvas size, which leaves the passed frame untouched
    var applicableCanvasWidth  = this.canvasWidth  - frameSize.x*2;
    var applicableCanvasHeight = this.canvasHeight - frameSize.y*2;
    
    var bounds                 = this.getBezierPath().computeBoundingBox();

    // Move center of bezier polygon to (0,0)
    var bounds        = this.getBezierPath().computeBoundingBox();
    var moveAmount    = new THREE.Vector2( bounds.getWidth()/2.0 - bounds.xMax, 
					   bounds.getHeight()/2.0 - bounds.yMax 
					 );
    this.getBezierPath().translate( moveAmount );
    
    // Update bounds (values have changed now)
    bounds.xMin += moveAmount.x;
    bounds.xMax += moveAmount.x;
    bounds.yMin += moveAmount.y;
    bounds.yMax += moveAmount.y;

    var ratioX        = bounds.getWidth()  / applicableCanvasWidth;  
    var ratioY        = bounds.getHeight() / applicableCanvasHeight; 

    // The minimal match (width or height) is our choice
    this.zoomFactor   = Math.min( 1.0/ratioX, 1.0/ratioY );

    // Set the draw offset position
    this.drawOffset.x = applicableCanvasWidth/2.0  - bounds.xMin - bounds.getWidth()/2.0  + frameSize.x;
    this.drawOffset.y = applicableCanvasHeight/2.0 - bounds.yMin - bounds.getHeight()/2.0 + frameSize.y;

    // Don't forget to redraw
    this.redraw();
};




/**
 * The passed listener must be a function with two arguments:
 *   function( source, event ) { ... }
 **/
IKRS.BezierCanvasHandler.prototype.addChangeListener = function( listener ) {
    if( listener == null )
	return false;
    this.changeListeners.push( listener );
    return true;
};

IKRS.BezierCanvasHandler.prototype._fireChangeEvent = function( e ) {
    for( var i = 0; i < this.changeListeners.length; i++ ) {
	var listener = this.changeListeners[i];
	listener( this, e );
    }
};


IKRS.BezierCanvasHandler.prototype.mouseWheelHandler = function( e ) {

    var delta = 0;
    if (!e) // For IE.
	e = window.event;
    if (e.wheelDelta) { // IE/Opera.
	delta = e.wheelDelta/120;
    } else if (e.detail) { // Mozilla case. 
	// In Mozilla, sign of delta is different than in IE.
	// Also, delta is multiple of 3.
	delta = -e.detail/3;
    }
    // If delta is nonzero, handle it.
    // Basically, delta is now positive if wheel was scrolled up,
    // and negative, if wheel was scrolled down.
    if (delta) {
	
	if( delta < 0 )
	    this.bezierCanvasHandler.decreaseZoomFactor( true ); // redraw
	else
	    this.bezierCanvasHandler.increaseZoomFactor( true ); // redraw
	
    }
    // Prevent default actions caused by mouse wheel.
    // That might be ugly, but we handle scrolls somehow
    // anyway, so don't bother here..
    if( e.preventDefault )
	e.preventDefault();
    e.returnValue = false;
}


IKRS.BezierCanvasHandler.prototype.drawOffset = new THREE.Vector2( 324, 525 );
IKRS.BezierCanvasHandler.prototype.zoomFactor = 1.4;
// 0: start point
// 1: start control point
// 2: end control point
// 3: end point
IKRS.BezierCanvasHandler.prototype.draggedPointID = -1; 


IKRS.BezierCanvasHandler.prototype.increaseZoomFactor = function( redraw ) {
    this.zoomFactor *= 1.2;
    if( redraw )
	this.redraw();
};

IKRS.BezierCanvasHandler.prototype.decreaseZoomFactor = function( redraw ) {
    this.zoomFactor /= 1.2;
    if( redraw )
	this.redraw();
};

IKRS.BezierCanvasHandler.prototype.setZoomFactor = function( zoom, redraw ) {
    this.zoomFactor = zoom;
    if( redraw )
	this.redraw();
};

IKRS.BezierCanvasHandler.prototype.getMillimeterPerUnit = function() {
    return this.millimeterPerPixel;
};

IKRS.BezierCanvasHandler.prototype.setMillimeterPerUnit = function( m, redraw ) {
    this.millimeterPerPixel = m;
    if( redraw )
	this.redraw();
    this._fireChangeEvent( { nextEventFollowing: false } );
};

IKRS.BezierCanvasHandler.prototype.undo = function() {

    if( !this.undoHistory.undo() )
	return false;
     
    // this.undoHistory.createHistoryEntry();
    this.bezierPath = this.undoHistory.getCurrentState(); 
    this.redraw();
    
    return true;

}

IKRS.BezierCanvasHandler.prototype.redraw = function() {
    
    this._drawWithBackgroundImages();

};

IKRS.BezierCanvasHandler.prototype.loadBackgroundImage = function( url, redraw ) {
    var bgImage = new Image();
    bgImage.bezierCanvasHandler = this;
    bgImage.onload = function() {
	this.bezierCanvasHandler.setBackgroundImage( this, redraw );
    };
    
    bgImage.src = url; 
};

IKRS.BezierCanvasHandler.prototype.loadCustomBackgroundImage = function( url, redraw ) {
    var bgImage = new Image();
    bgImage.bezierCanvasHandler = this;
    bgImage.onload = function() {
	this.bezierCanvasHandler.setCustomBackgroundImage( this, redraw );
    };
    
    bgImage.src = url; 
};

IKRS.BezierCanvasHandler.prototype.setBackgroundImage = function( image, redraw ) {
    this.backgroundImage = image;
    if( redraw )
	this.redraw();
};

IKRS.BezierCanvasHandler.prototype.setCustomBackgroundImage = function( image, redraw ) {
    this.customBackgroundImage = image;
    if( redraw )
	this.redraw();
};

IKRS.BezierCanvasHandler.prototype.setDrawCustomBackgroundImage = function( value, redraw ) {
    this.drawCustomBackgroundImage = value;
    if( redraw )
	this.redraw();
};

IKRS.BezierCanvasHandler.prototype._drawCoordinateSystem = function() {
 
    this.context.strokeStyle = "#d0d0d0";
    this.context.lineWidth   = 1;
    
    this.context.beginPath();
    this.context.moveTo( this.drawOffset.x, 0 );
    this.context.lineTo( this.drawOffset.x, this.canvasHeight );
    this.context.stroke();
    
    this.context.beginPath();
    this.context.moveTo( 0, this.drawOffset.y );
    this.context.lineTo( this.canvasWidth, this.drawOffset.y );
    this.context.stroke();
}

IKRS.BezierCanvasHandler.prototype._drawWithBackgroundImages = function() {

    var contextWidth  = this.canvasWidth;  // 512;
    var contextHeight = this.canvasHeight; // 768;

    // Clear screen!
    this.context.fillStyle = "#FFFFFF";
    this.context.fillRect( 0, 0, contextWidth, contextHeight );
                                              
    if( this.customBackgroundImage != null && this.drawCustomBackgroundImage ) {
	this._drawAnonymousBackgroundImage( this.customBackgroundImage );
    }
    this._drawAnonymousBackgroundImage( this.backgroundImage );
    this._drawWithoutBackgroundImages();
};

IKRS.BezierCanvasHandler.prototype._drawAnonymousBackgroundImage = function( image, keepRatio ) {
    
    if( !image || typeof image == "undefined" )
	return;
    if( typeof keepRatio == "undefined" )
	keepRatio = false;


    var contextWidth  = _DILDO_CONFIG.BEZIER_CANVAS_WIDTH; // this.canvasWidth; // 512;
    var contextHeight = _DILDO_CONFIG.BEZIER_CANVAS_HEIGHT; // this.canvasHeight; // 768;
    

    var imageWidth  = image.width;
    var imageHeight = image.height;

    var widthRatio  = contextWidth  / imageWidth;
    var heightRatio = contextHeight / imageHeight;
    
    var drawWidth, drawHeight;
    if( keepRatio ) {
	if( widthRatio < heightRatio ) {
	    // normalize width
	    drawWidth = imageWidth * widthRatio;
	    drawHeight = imageHeight * widthRatio;
	} else {
	    // normalize height
	    drawWidth = imageWidth * heightRatio;
	    drawHeight = imageHeight * heightRatio;
	}
    } else {
	drawWidth  = contextWidth;
	drawHeight = contextHeight;
    }   
    

    this.context.drawImage( image,
			    (contextWidth - drawWidth)/2, 
			    (contextHeight - drawHeight)/2, 
			    drawWidth, // 512,
			    drawHeight // 768
			  );
    

};



IKRS.BezierCanvasHandler.prototype._drawWithoutBackgroundImages = function() {

    // Draw coordinate system (global crosshair)?
    // This form element is deprecated!
    if( document.forms["bezier_form"] &&
	document.forms["bezier_form"].elements["draw_coordinate_system"] &&
	document.forms["bezier_form"].elements["draw_coordinate_system"].checked ) {

	this._drawCoordinateSystem();

    }

    var drawTangents = true; // document.forms["bezier_form"].elements["draw_tangents"].checked;
    var boundingBox  = this.bezierPath.computeBoundingBox();


    // Draw rulers?
    if( document.forms["bezier_form"] &&
	document.forms["bezier_form"].elements["draw_rulers"] && 
	document.forms["bezier_form"].elements["draw_rulers"].checked ) {

	this._drawRulers( this.context,
			  this.drawOffset,
			  this.zoomFactor,
			  boundingBox
			);
			 
	
	
    }

    // Fill inner shape?
    // Note: always fill if the bounding box is drawn, too.
    if( document.forms["bezier_form"].elements["draw_bounding_box"].checked ) {

	// Fill inner shape?
	var rightLowerPoint = boundingBox.getRightLowerPoint();
	var rightUpperPoint = boundingBox.getRightUpperPoint();
	this.context.fillStyle   = "rgba(214, 214, 214, 0.9)"; // "#e8e8e8";
	this.context.beginPath();
	this.context.moveTo( rightUpperPoint.x * this.zoomFactor + this.drawOffset.x, 
			     rightUpperPoint.y * this.zoomFactor + this.drawOffset.y
			   );
	this.context.lineTo( rightLowerPoint.x * this.zoomFactor + this.drawOffset.x, 
			     rightLowerPoint.y * this.zoomFactor + this.drawOffset.y
			   );
	for( var c = 0; c < this.getBezierPath().getCurveCount(); c++ ) {

	    var curve = this.getBezierPath().getCurveAt( c );
	    
	    for( var s = 0; s < curve.segmentCache.length; s++ ) {

		var segment = curve.segmentCache[ s ];
		this.context.lineTo( segment.x * this.zoomFactor + this.drawOffset.x,
				     segment.y * this.zoomFactor + this.drawOffset.y
				   );

	    }
	    
	}
	this.context.closePath();
	this.context.fill();

    }
    
    // Draw the bounding box?
    if( document.forms["bezier_form"].elements["draw_bounding_box"].checked ) {

	this.context.strokeStyle = "#888888";
	this.context.lineWidth   = 0.5;
	this.context.strokeRect( boundingBox.xMin * this.zoomFactor + this.drawOffset.x,
				 boundingBox.yMin * this.zoomFactor + this.drawOffset.y,
				 boundingBox.getWidth() * this.zoomFactor,
				 boundingBox.getHeight() * this.zoomFactor
			       );
	// Draw bounding box handles
	var leftUpperPoint  = boundingBox.getLeftUpperPoint();
	var rightLowerPoint = boundingBox.getRightLowerPoint();
	
	this.context.lineWidth   = 1.0;
	var lineDistance = 3; // px
	// ... handle for the upper left point
	this.context.beginPath();
	this.context.moveTo( leftUpperPoint.x * this.zoomFactor + this.drawOffset.x + lineDistance,
			     leftUpperPoint.y * this.zoomFactor + this.drawOffset.y + lineDistance + 10 
			   );
	this.context.lineTo( leftUpperPoint.x * this.zoomFactor + this.drawOffset.x + lineDistance,
			     leftUpperPoint.y * this.zoomFactor + this.drawOffset.y + lineDistance 
			   );
	this.context.lineTo( leftUpperPoint.x * this.zoomFactor + this.drawOffset.x + lineDistance + 10,
			     leftUpperPoint.y * this.zoomFactor + this.drawOffset.y + lineDistance 
			   );
	this.context.stroke();

	// ... handle for the upper left point
	this.context.beginPath();
	this.context.moveTo( rightLowerPoint.x * this.zoomFactor + this.drawOffset.x - lineDistance,
			     rightLowerPoint.y * this.zoomFactor + this.drawOffset.y - lineDistance - 10 
			   );
	this.context.lineTo( rightLowerPoint.x * this.zoomFactor + this.drawOffset.x - lineDistance,
			     rightLowerPoint.y * this.zoomFactor + this.drawOffset.y - lineDistance 
			   );
	this.context.lineTo( rightLowerPoint.x * this.zoomFactor + this.drawOffset.x - lineDistance - 10,
			     rightLowerPoint.y * this.zoomFactor + this.drawOffset.y - lineDistance 
			   );
	this.context.stroke();
	

    } // END if [draw bounding box]

    this.drawBezierPath( this.context, 
			 this.bezierPath, 
			 this.drawOffset,
			 this.zoomFactor,
			 true,          // drawStartPoint
			 true,          // drawEndPoint
			 drawTangents,  // drawStartControlPoint
			 drawTangents,  // drawEndControlPoint
			 
			 drawTangents
		       );
}

IKRS.BezierCanvasHandler.prototype._drawRulers = function( context,
							   drawOffset,
							   zoomFactor,
							   bounds
							 ) {

    context.strokeStyle    = "#888888";  // For the lines
    context.fillStyle      = "#888888";  // For the text
    context.font           = "9px Monospace";
    context.lineWidth      = 0.5;
    

    IKRS.BezierCanvasHandler.drawVerticalRuler( context,
						drawOffset,
						zoomFactor,
						
						bounds,
						20.0,    // distance
						5.0,     // markerLength
						this.millimeterPerPixel, //0.5,     // millimeterPerPixel = 0.5;
						50,      // markerDistance     = 50;   // px
						5.0      // textDistance       = 5.0;
						 
						 
						 //new THREE.Vector2(0,1),  // direction
						 //0.0      // textRotation
					       );

    IKRS.BezierCanvasHandler.drawHorizontalRuler( context,
						  drawOffset,
						  zoomFactor,
						  
						  bounds,
						  20.0,    // distance
						  5.0,     // markerLength
						  this.millimeterPerPixel, // 0.5,     // millimeterPerPixel = 0.5;
						  50,      // markerDistance     = 50;   // px
						  5.0      // textDistance       = 5.0;
						  
						  
						  //new THREE.Vector2(0,1),  // direction
						  //0.0      // textRotation
						);
}

IKRS.BezierCanvasHandler.drawVerticalRuler = function( context,
						       drawOffset, 
						       zoomFactor,

						       bounds,
						       distance,           // px
						       markerLength,       // px
						       millimeterPerPixel,
						       markerDistance,     // px
						       textDistance        // px
						     ) {

    var leftUpperPoint     = bounds.getLeftUpperPoint();
    var rightUpperPoint    = bounds.getRightUpperPoint();
    var rightLowerPoint    = bounds.getRightLowerPoint();
    var leftLowerPoint     = bounds.getLeftLowerPoint();
    var width              = bounds.getWidth();
    var height             = bounds.getHeight();
    
    
    // Draw vertical ruler
    context.beginPath();
    context.moveTo( rightLowerPoint.x * zoomFactor + drawOffset.x + distance,
		    rightLowerPoint.y * zoomFactor + drawOffset.y
		  );
    context.lineTo( rightUpperPoint.x * zoomFactor + drawOffset.x + distance,
		    rightUpperPoint.y * zoomFactor + drawOffset.y
		  );    
    context.stroke();

    
    // Draw unit markers
    var i = 0;
    var x = 0, y = 0, relY;
    while( (relY = i*markerDistance) < height ) {

	x = rightLowerPoint.x * zoomFactor + drawOffset.x;
	y = rightLowerPoint.y * zoomFactor + drawOffset.y - relY * zoomFactor;
	context.beginPath();
	context.moveTo( x + distance,
			y
		      );
	context.lineTo( x + distance + markerLength, 
			y 
		      );	
	context.stroke();

	// Draw unit number
	var mm = relY * millimeterPerPixel;
	context.fillText( "" + mm + "mm", 
			  x + distance + markerLength + textDistance,
			  y );

	i++;

    }
}


IKRS.BezierCanvasHandler.drawHorizontalRuler = function( context,
							 drawOffset, 
							 zoomFactor,
							 
							 bounds,
							 distance,           // px
							 markerLength,       // px
							 millimeterPerPixel,
							 markerDistance,     // px
							 textDistance        // px
						       ) {

    var leftUpperPoint     = bounds.getLeftUpperPoint();
    var rightUpperPoint    = bounds.getRightUpperPoint();
    var rightLowerPoint    = bounds.getRightLowerPoint();
    var leftLowerPoint     = bounds.getLeftLowerPoint();
    var width              = bounds.getWidth();
    var height             = bounds.getHeight();
    
    
    // Draw vertical ruler
    context.beginPath();
    context.moveTo( rightLowerPoint.x * zoomFactor + drawOffset.x,
		    rightLowerPoint.y * zoomFactor + drawOffset.y + distance
		  );
    context.lineTo( leftLowerPoint.x * zoomFactor + drawOffset.x,
		    leftLowerPoint.y * zoomFactor + drawOffset.y + distance
		  );    
    context.stroke();

    
    // Draw unit markers
    var i = 0;
    var x = 0, y = 0, relX;
    while( (relX = i*markerDistance) < width ) {

	x = rightLowerPoint.x * zoomFactor + drawOffset.x - relX * zoomFactor;
	y = rightLowerPoint.y * zoomFactor + drawOffset.y;
	context.beginPath();
	context.moveTo( x,
			y + distance
		      );
	context.lineTo( x, 
			y + distance + markerLength
		      );	
	context.stroke();

	// Draw unit number
	var mm = relX * millimeterPerPixel;
	context.rotate(Math.PI/2);
	context.fillText( "" + mm + "mm", 
			  
			  y + distance + markerLength + textDistance, -x 
			);
	context.rotate(-Math.PI/2);

	i++;

    }
}


IKRS.BezierCanvasHandler.prototype._drawSelectedPoint = function( context,
								  point,
								  zoomFactor,
								  drawOffset
								) {

    context.beginPath();
    context.arc( point.x * zoomFactor + drawOffset.x,  // centerX
		 point.y * zoomFactor + drawOffset.y,  // centerY
		 3,          // radius,
		 0.0,         // start angle
		 2.0*Math.PI, // end angle
		 true         // anti clock wise
	       );
    context.fillStyle   = "#B400FF"; // "#FF0000";
    context.fill();
    
    
    context.beginPath();
    context.arc( point.x * zoomFactor + drawOffset.x,  // centerX
		 point.y * zoomFactor + drawOffset.y,  // centerY
		 8,          // radius,
		 0.0,         // start angle
		 2.0*Math.PI, // end angle
		 true         // anti clock wise 
	       );
    context.strokeStyle = "#B400FF"; // "#FF0000";
    context.stroke();

}

IKRS.BezierCanvasHandler.prototype.drawBezierCurve = function( context,
							       bezierCurve,
							       drawOffset,
							       zoomFactor,
							       drawStartPoint,
							       drawEndPoint,
							       drawStartControlPoint,
							       drawEndControlPoint,
							       
							       drawTangents,
							     
							       startPointIsSelected,
							       endPointIsSelected
							     ) {



    // Draw tangents?
    if( drawTangents ) {

	context.strokeStyle = "#a8a8a8";
	context.lineWidth   = 1;

	// Draw start point tangent
	context.beginPath();
	context.moveTo( bezierCurve.getStartPoint().x * zoomFactor + drawOffset.x,
			bezierCurve.getStartPoint().y * zoomFactor + drawOffset.y
		      );
	context.lineTo( bezierCurve.getStartControlPoint().x * zoomFactor + drawOffset.x,
			bezierCurve.getStartControlPoint().y * zoomFactor + drawOffset.y 
		      );
	context.stroke();

	// Draw end point tangent
	context.beginPath();
	context.moveTo( bezierCurve.getEndPoint().x * zoomFactor + drawOffset.x,
			bezierCurve.getEndPoint().y * zoomFactor + drawOffset.y
		      );
	context.lineTo( bezierCurve.getEndControlPoint().x * zoomFactor + drawOffset.x,
			bezierCurve.getEndControlPoint().y * zoomFactor + drawOffset.y 
		      );
	context.stroke();

    }


    // Draw curve itself
    context.strokeStyle = "#000000";
    context.lineWidth   = 2;
    context.beginPath();
    context.moveTo( bezierCurve.segmentCache[0].x * zoomFactor + drawOffset.x,
		    bezierCurve.segmentCache[0].y * zoomFactor + drawOffset.y
		  );
    for( var i = 1; i < bezierCurve.segmentCache.length; i++ ) {

	context.lineWidth = 2;
	context.lineTo( bezierCurve.segmentCache[i].x * zoomFactor + drawOffset.x,
			bezierCurve.segmentCache[i].y * zoomFactor + drawOffset.y
		      );	
    }
    context.stroke();


    
    // Draw the end points
    if( drawStartPoint || drawEndPoint ) {
	context.fillStyle   = "#B400FF";
	context.strokeStyle = "#B400FF";
	context.lineWidth   = 1;
	// Start point?
	if( drawStartPoint ) {
	    if( startPointIsSelected ) {
	
		this._drawSelectedPoint( context,
					 bezierCurve.getStartPoint(),
					 zoomFactor, 
					 drawOffset );
					
				    
	    } else {
                context.fillStyle   = "#B400FF";
		context.strokeStyle = "#B400FF";
		context.fillRect( bezierCurve.getStartPoint().x * zoomFactor - 2 + drawOffset.x,
				  bezierCurve.getStartPoint().y * zoomFactor - 2 + drawOffset.y,
				  5, 5 );
	    }
	}
	// End point?
	if( drawEndPoint ) {
	    if( endPointIsSelected ) {
		context.fillStyle   = "#FF0000";
		context.strokeStyle = "#FF0000";

		this._drawSelectedPoint( context,
					 bezierCurve.getEndPoint(),
					 zoomFactor, 
					 drawOffset );
				    
	    } else {
                context.fillStyle   = "#B400FF";
		context.strokeStyle = "#B400FF";
		context.fillRect( bezierCurve.getEndPoint().x * zoomFactor - 2 + drawOffset.x,
				  bezierCurve.getEndPoint().y * zoomFactor - 2 + drawOffset.y,
				  5, 5 );
	    }
	}
	
    }

    // Draw the control points?
    if( // document.forms["bezier_form"].elements["draw_tangents"].checked &&
	(drawStartControlPoint || drawEndControlPoint) ) {
	context.fillStyle = "#B8D438";
	// Start control point?
	if( drawStartControlPoint ) {
	    context.fillRect( bezierCurve.getStartControlPoint().x * zoomFactor - 2 + drawOffset.x,
			      bezierCurve.getStartControlPoint().y * zoomFactor - 2 + drawOffset.y,
			      5, 5 );
	}
	// End control point?
	if( drawEndControlPoint ) {
	    context.fillRect( bezierCurve.getEndControlPoint().x * zoomFactor - 2 + drawOffset.x,
			      bezierCurve.getEndControlPoint().y * zoomFactor - 2 + drawOffset.y,
			      5, 5 );
	}
    }
}


IKRS.BezierCanvasHandler.prototype.drawPerpendiculars = function( context,
								  bezierCurve,
								  drawOffset,
								  zoomFactor ) {

    context.strokeStyle = "#a0a0fF";
    context.lineWidth   = 0.5;
    
    // This is very ungly!
    // TODO: pass as param
    var perpendicularLength = document.forms["mesh_form"].elements["mesh_hull_strength"].value; // 20

    var pDistance = 6; // px
    var i = 0;
    while( i*pDistance <= bezierCurve.getLength() ) {
	
	
	var t             = (i*pDistance)/bezierCurve.getLength();
	var point         = bezierCurve.getPoint( t );

	// Draw inner or outer perpendicular???
	var perpendicular = bezierCurve.getPerpendicular( t ).normalize();
	
	// Draw perpendiculars?
	// Note: the perpendicular at the point is the tangent rotated by 90 deg
	context.beginPath();
	context.moveTo( point.x * zoomFactor + drawOffset.x,
			point.y * zoomFactor + drawOffset.y 
		      );
	context.lineTo( point.x * zoomFactor + drawOffset.x + perpendicular.x * (perpendicularLength*zoomFactor),
			point.y * zoomFactor + drawOffset.y + perpendicular.y * (perpendicularLength*zoomFactor)
		      );
	context.stroke();

	i++;

    }

}

IKRS.BezierCanvasHandler.prototype.setBezierPath = function( path ) {
    if( !path ) {
	console.log( "Error: cannot set bezier path to null." );
	return false;
    }
    
    this.bezierPath = path;
    this.undoHistory.createHistoryEntry( path );
    this.redraw();
}

IKRS.BezierCanvasHandler.prototype.getBezierPath = function() {
    return this.bezierPath;
}

IKRS.BezierCanvasHandler.prototype.locateCachedBezierPointNearPosition = function( point,
										   tolerance 
										 ) {
    
    //var curveIndex   = -1;
    //var segmentIndex = -1;
    for( var c = 0; c < this.getBezierPath().getCurveCount(); c++ ) {
	
	var bCurve = this.getBezierPath().getCurveAt( c );
	
	for( var s = 0; s < bCurve.segmentCache.length; s++ ) {

	    var tmpPoint = bCurve.segmentCache[ s ];
	    if( this.pointIsNearPosition( tmpPoint,
					  point.x,
					  point.y,
					  tolerance ) ) {

		return [ c, s ];
	    }

	}
    }

    return [ -1, -1 ];
}

IKRS.BezierCanvasHandler.prototype.pointIsNearPosition = function( point,
								   x, 
								   y,
								   tolerance ) {

    var distance = Math.sqrt( Math.pow(point.x-x,2) + Math.pow(point.y-y,2) );

    //window.alert( "point=(" + point.x + ", " + point.y + "), x=" + x + ", y=" + y + ", tolerance=" + tolerance + ", distance=" + distance );

    return ( distance <= tolerance );

}

IKRS.BezierCanvasHandler.prototype.translateMouseEventToRelativePosition = function( parent,
										     e ) {
    var rect = parent.getBoundingClientRect();
    var left = e.clientX - rect.left - parent.clientLeft + parent.scrollLeft;
    var top  = e.clientY - rect.top  - parent.clientTop  + parent.scrollTop;
    //window.alert( "left=" + left + ", top=" + top );

    // Add draw offset :)
    var relX = (left - this.drawOffset.x) / this.zoomFactor;
    var relY = (top  - this.drawOffset.y) / this.zoomFactor;

    return new THREE.Vector2( relX, relY );
}

IKRS.BezierCanvasHandler.prototype.mouseDownHandler = function( e ) {
    // window.alert( "mouse down. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY );
    this.bezierCanvasHandler.latestMouseDownPosition = new THREE.Vector2( e.pageX, e.pageY ); 
    this.bezierCanvasHandler.latestMouseDragPosition = new THREE.Vector2( e.pageX, e.pageY ); 
    this.bezierCanvasHandler.latestMouseDownTime = new Date().getTime();
    

    var relativeP = this.bezierCanvasHandler.translateMouseEventToRelativePosition( this, e );

    var clickTolerance = 10.0 / this.bezierCanvasHandler.zoomFactor; // px
    // Find a bezier curve and the respective point that was touched
    var pointTouched = false;
    for( var i = 0; i < this.bezierCanvasHandler.getBezierPath().getCurveCount() && !pointTouched; i++ ) {

	// Get next curve
	var bCurve = this.bezierCanvasHandler.getBezierPath().getCurveAt( i );
	
	// Find drag point?
	//  (try control point FIRST as they move WITH the start- and end- points!)
	if( this.bezierCanvasHandler.pointIsNearPosition(bCurve.getStartControlPoint(), relativeP.x, relativeP.y, clickTolerance) ) {
	    
	    this.bezierCanvasHandler.currentDragPoint = bCurve.getStartControlPoint();
	    this.bezierCanvasHandler.draggedPointID = this.bezierCanvasHandler.bezierPath.START_CONTROL_POINT;
	    this.bezierCanvasHandler.draggedCurveIndex = i;
	    pointTouched = true;

	} else if( this.bezierCanvasHandler.pointIsNearPosition(bCurve.getEndControlPoint(), relativeP.x, relativeP.y, clickTolerance) ) {
	    
	    this.bezierCanvasHandler.currentDragPoint = bCurve.getEndControlPoint();
	    this.bezierCanvasHandler.draggedPointID = this.bezierCanvasHandler.bezierPath.END_CONTROL_POINT;
	    this.bezierCanvasHandler.draggedCurveIndex = i;
	    pointTouched = true;

	} 

    } // END for

    
    if( !pointTouched ) {

	// Try again with normal start- and end-points
	for( var i = 0; i < this.bezierCanvasHandler.getBezierPath().getCurveCount() && !pointTouched; i++ ) {

	    // Get next curve
	    var bCurve = this.bezierCanvasHandler.getBezierPath().getCurveAt( i );
	    
	    // Find drag point?
	    if( this.bezierCanvasHandler.pointIsNearPosition(bCurve.getStartPoint(), relativeP.x, relativeP.y, clickTolerance) ) {

		this.bezierCanvasHandler.currentDragPoint = bCurve.getStartPoint();
		this.bezierCanvasHandler.draggedPointID = this.bezierCanvasHandler.bezierPath.START_POINT;
		this.bezierCanvasHandler.draggedCurveIndex = i;
		this.bezierCanvasHandler.currentDraggedPointIndex = i;
		pointTouched = true;
		
	    } else if( this.bezierCanvasHandler.pointIsNearPosition(bCurve.getEndPoint(), relativeP.x, relativeP.y, clickTolerance) ) {

		this.bezierCanvasHandler.currentDragPoint = bCurve.getEndPoint();
		this.bezierCanvasHandler.draggedPointID = this.bezierCanvasHandler.bezierPath.END_POINT;
		this.bezierCanvasHandler.draggedCurveIndex = i;
		this.bezierCanvasHandler.currentDraggedPointIndex = i+1;
		pointTouched = true;
		
	    } 

	} // END for
    } // END if

    
    if( !pointTouched ) {
    
	// Try to locate a bounding box point near the clicked position.
	// If there is no point function returns -1.
	this.bezierCanvasHandler.draggedPointID = this.bezierCanvasHandler.resolveBoundingBoxPointNear( relativeP, clickTolerance );
	this.bezierCanvasHandler.draggedCurveIndex = -1;
	this.bezierCanvasHandler.currentDraggedPointIndex = -1;
    } 
    
}

IKRS.BezierCanvasHandler.prototype.mouseUpHandler = function( e ) {
    //window.alert( "mouse up. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY + ", latestMouseDragPosition=(" + this.bezierCanvasHandler.latestMouseDragPosition.x + ", " + bezierCanvasHandler.latestMouseDragPosition.y + ")");

    var currentTime = new Date().getTime();
    // It is a click (mouse down and -up at the same position)
    // Check if not more than n milliseconds have passed
    if( this.bezierCanvasHandler.latestClickTime 
	&& (currentTime - this.bezierCanvasHandler.latestClickTime) < 300 ) {
	
	this.bezierCanvasHandler.doubleClickHandler( this, e );
	

    } else if( this.bezierCanvasHandler.latestClickTime &&
	       (currentTime-this.bezierCanvasHandler.latestMouseDownTime) < 300 ) {
	
	this.bezierCanvasHandler.latestClickTime = currentTime;

	if( this.bezierCanvasHandler.currentDraggedPointIndex != -1 ) {
	    this.bezierCanvasHandler.selectedPointIndices = [ this.bezierCanvasHandler.currentDraggedPointIndex ];
	} else {
	    this.bezierCanvasHandler.selectedPointIndices = [];
	}


    } 
	

    this.bezierCanvasHandler.latestClickTime = currentTime;

    // If any points were dragged: create a history entry
    var fireChangeEvent = false;
    if( this.bezierCanvasHandler.draggedPointID != -1 ) {
	this.bezierCanvasHandler.undoHistory.createHistoryEntry();
	fireChangeEvent = true;
    }

    // Clear mouse down position
    this.bezierCanvasHandler.latestMouseDownPosition = null; 
    this.bezierCanvasHandler.latestMouseDragPosition = null; 
    this.bezierCanvasHandler.currentDragPoint = null;
    this.bezierCanvasHandler.draggedPointID = -1;



    // And repaint the curve (to make the eventually hidden drag points to disappear)
    this.bezierCanvasHandler.redraw();

    if( fireChangeEvent )
	this.bezierCanvasHandler._fireChangeEvent( { nextEventFollowing: false } );
}; // END mouseUpHandler




IKRS.BezierCanvasHandler.prototype.mouseMoveHandler = function( e ) {
    
    if( this.bezierCanvasHandler.latestMouseDownPosition ) {

	var fireChangeEvent = false;

	// Update dragges point's position
	var moveX = (this.bezierCanvasHandler.latestMouseDragPosition.x - e.pageX) / this.bezierCanvasHandler.zoomFactor;
	var moveY = (this.bezierCanvasHandler.latestMouseDragPosition.y - e.pageY) / this.bezierCanvasHandler.zoomFactor;

	if( this.bezierCanvasHandler.currentDragPoint ) {

	    this.bezierCanvasHandler.getBezierPath().moveCurvePoint( this.bezierCanvasHandler.draggedCurveIndex,
								     this.bezierCanvasHandler.draggedPointID,
								     new THREE.Vector2(-moveX,-moveY)
								   );
	    

	    // And repaint the curve
	    this.bezierCanvasHandler.redraw();
	    fireChangeEvent = true;
	} else if( this.bezierCanvasHandler.draggedPointID == IKRS.BezierCanvasHandler.POINT_ID_LEFT_UPPER_BOUND 
		   && document.forms["bezier_form"].elements["draw_bounding_box"].checked ) {
	  
	    var oldBounds = this.bezierCanvasHandler.getBezierPath().computeBoundingBox();
	    var newBounds = new IKRS.BoundingBox2( oldBounds.getXMin() + moveX,
						   oldBounds.getXMax(),
						   oldBounds.getYMin() + moveY,
						   oldBounds.getYMax()
						 );	    
	    this.bezierCanvasHandler._scaleBezierPath( oldBounds,
						       newBounds,
						       oldBounds.getRightLowerPoint(), // anchor
						       true,  // redraw
						       true   // nextEventFollowing
						     );
	    fireChangeEvent = true;

	} else if( this.bezierCanvasHandler.draggedPointID == IKRS.BezierCanvasHandler.POINT_ID_RIGHT_UPPER_BOUND 
		   && document.forms["bezier_form"].elements["draw_bounding_box"].checked ) {

	    var oldBounds = this.bezierCanvasHandler.getBezierPath().computeBoundingBox();
	    var newBounds = new IKRS.BoundingBox2( oldBounds.getXMin(),
						   oldBounds.getXMax() + moveX,
						   oldBounds.getYMin() + moveY,
						   oldBounds.getYMax()
						 );	    
	    this.bezierCanvasHandler._scaleBezierPath( oldBounds,
						       newBounds,
						       oldBounds.getLeftLowerPoint(), // anchor
						       true,  // redraw
						       true   // nextEventFollowing
						     );
	    fireChangeEvent = true;
	    
	} else if( this.bezierCanvasHandler.draggedPointID == IKRS.BezierCanvasHandler.POINT_ID_RIGHT_LOWER_BOUND 
		   && document.forms["bezier_form"].elements["draw_bounding_box"].checked ) {

	    var oldBounds = this.bezierCanvasHandler.getBezierPath().computeBoundingBox();
	    var newBounds = new IKRS.BoundingBox2( oldBounds.getXMin(),
						   oldBounds.getXMax() + moveX,
						   oldBounds.getYMin(),
						   oldBounds.getYMax() + moveY
						 );	    
	    this.bezierCanvasHandler._scaleBezierPath( oldBounds,
						       newBounds,
						       oldBounds.getLeftUpperPoint(), // anchor
						       true,  // redraw
						       true   // nextEventFollowing
						     );
	    fireChangeEvent = true;

	} else if( this.bezierCanvasHandler.draggedPointID == IKRS.BezierCanvasHandler.POINT_ID_LEFT_LOWER_BOUND 
		   && document.forms["bezier_form"].elements["draw_bounding_box"].checked ) {

	    var oldBounds = this.bezierCanvasHandler.getBezierPath().computeBoundingBox();
	    var newBounds = new IKRS.BoundingBox2( oldBounds.getXMin() + moveX,
						   oldBounds.getXMax(),
						   oldBounds.getYMin(),
						   oldBounds.getYMax() + moveY
						 );	    
	    this.bezierCanvasHandler._scaleBezierPath( oldBounds,
						       newBounds,
						       oldBounds.getRightUpperPoint(), // anchor
						       true,  // redraw	
						       true   // nextEventFollowing
						     );
	    fireChangeEvent = true;
	    
	}
	

	this.bezierCanvasHandler.latestMouseDownPosition.set( e.pageX, e.pageY );
	this.bezierCanvasHandler.latestMouseDragPosition.set( e.pageX, e.pageY );
	

	// I don't think it is necessary to throw an event here.
	// It's just a sequence of events which will be ignored by the main
	// script until the last event of the sequence is triggered (indicated
	// by the event's 'nextEventFollowing' flag).
	// So avoid this call to save resources.
	
	//if( fireChangeEvent )
	//    this.bezierCanvasHandler._fireChangeEvent( { nextEventFollowing: true } );
    }
};

IKRS.BezierCanvasHandler.prototype.scaleBezierPathUniform = function( scaleFactor ) {
    
    this.getBezierPath().scale( new THREE.Vector2(0,0),
				new THREE.Vector2(scaleFactor,scaleFactor)
			      );
    
    this.redraw();
    this._fireChangeEvent( { nextEventFollowing: false  // nextEventFollowing 
			   } 
			 );
};

IKRS.BezierCanvasHandler.prototype._scaleBezierPath = function( oldBounds,
								newBounds,
								anchor,
								redraw,
								nextEventFollowing
							      ) {
    // Calculate scale factors
    var scaling    = new THREE.Vector2( oldBounds.getWidth()  / newBounds.getWidth(),
					oldBounds.getHeight() / newBounds.getHeight()
				      );

    // Warning: do not scale too small!
    // HINT: THIS DOES SOMEHOW NOT PREVENT THE PATH TO BE SCALED TOO SMALL :(
    //       THIS BUG NEEDS TO BE FIXED
    if( newBounds.getWidth() < 25 && newBounds.getWidth() < oldBounds.getWidth() )
	scaling.x = oldBounds.getWidth() / 25.0; // 1.0; 
    if( newBounds.getHeight() < 25 && newBounds.getHeight() < oldBounds.getHeight() )
	scaling.y = oldBounds.getHeight() / 25.0; // 1.0;
    
    //if( newBounds.getWidth() < 25 ) {
	//window.alert( "newBounds.width=" + newBounds.getWidth() );
	//window.alert( "scaling.x=" + scaling.x + ", scaling.y=" + scaling.y + ", newBounds=" + newBounds._toString() + ", oldBounds=" + oldBounds._toString() );
    //}
    
    this.getBezierPath().scale( anchor,
				scaling 
			      );
    if( redraw )
	this.redraw();
    

    this._fireChangeEvent( { nextEventFollowing: nextEventFollowing } );
};


IKRS.BezierCanvasHandler.prototype.doubleClickHandler = function( parent,
								  e ) {
    var relativeP = this.translateMouseEventToRelativePosition( parent, e );
    var location = locateCachedBezierPointNearPosition = 
	this.locateCachedBezierPointNearPosition( relativeP,  // point
						  10.0 / this.zoomFactor       // tolerance
						);
    
    // Will return false if any index is out of (valid) bounds
    var splitSucceeded = this.bezierPath.splitAt( location[0],   // curveIndex
						  location[1]    // segmentIndex
						);
    if( splitSucceeded ) {
	this.undoHistory.createHistoryEntry();
	this.redraw();
	
	this._fireChangeEvent( { nextEventFollowing: false } );
    }
};


IKRS.BezierCanvasHandler.prototype.keyDownHandler = function( e ) {
    
    // The key code for 'delete' is 46
    if( e.keyCode != 46 ) 
	return;

    // Are there any selected shape points at all?
    if( this.bezierCanvasHandler.selectedPointIndices.length == 0 ) 
	return;


    // window.alert( "Sorry. Deleting shape points is not yet supported. Please come back later." );

    // Join in the middle or return begin/end point?
    var pointIndex = this.bezierCanvasHandler.selectedPointIndices[0];
    //window.alert( "pointIndex=" + pointIndex + ", bezierCount=" + this.bezierCanvasHandler.getBezierPath().getCurveCount() );
    
    this.bezierCanvasHandler.selectedPointIndices = [];
    if( pointIndex == 0 ) {

	if( this.bezierCanvasHandler.getBezierPath().removeStartPoint() )
	    this.bezierCanvasHandler.redraw();

    } else if( pointIndex == this.bezierCanvasHandler.getBezierPath().getCurveCount() ) {
	
	if( this.bezierCanvasHandler.getBezierPath().removeEndPoint() )
	    this.bezierCanvasHandler.redraw();

    } else {

	this.bezierCanvasHandler.bezierPath.joinAt( pointIndex );  // Join the curve at given index with predecessor
	this.bezierCanvasHandler.redraw();
    }
  

    this.bezierCanvasHandler._fireChangeEvent( { nextEventFollowing: false } );
}


IKRS.BezierCanvasHandler.prototype.resolveBoundingBoxPointNear = function( point,
									   tolerance
									 ) {
    var bounds = this.getBezierPath().computeBoundingBox();
    if( this.pointIsNearPosition( bounds.getLeftUpperPoint(),
				  point.x,
				  point.y,
				  tolerance ) ) {
	return IKRS.BezierCanvasHandler.POINT_ID_LEFT_UPPER_BOUND;
    } else if( this.pointIsNearPosition( bounds.getRightUpperPoint(),
					 point.x,
					 point.y,
					 tolerance ) ) {
	return IKRS.BezierCanvasHandler.POINT_ID_RIGHT_UPPER_BOUND;
    } else if( this.pointIsNearPosition( bounds.getRightLowerPoint(),
					 point.x,
					 point.y,
					 tolerance ) ) {
	return IKRS.BezierCanvasHandler.POINT_ID_RIGHT_LOWER_BOUND;
    } else if( this.pointIsNearPosition( bounds.getLeftLowerPoint(),
					 point.x,
					 point.y,
					 tolerance ) ) {
	return IKRS.BezierCanvasHandler.POINT_ID_LEFT_LOWER_BOUND;
    } else {
	return -1;
    }
    
}

IKRS.BezierCanvasHandler.prototype.drawBezierPath = function( context,
							      bezierPath,
							      drawOffset,
							      zoomFactor,
							      drawStartPoint,
							      drawEndPoint,
							      drawStartControlPoint,
							      drawEndControlPoint,
							    
							      drawTangents 
							    ) { 

    // This way of rendering the curve uses the curves' internal
    // segment cache.
    // This way of retrieving random points from the curve SHOULD NOT
    // be used for further calculations (it is not accurate as the 
    // cache only contains linear approximations!)
    //
    // See below for a more accurate (but slower) algorithm.
    for( var i = 0; i < bezierPath.getCurveCount(); i++ ) {


	var bCurve = bezierPath.getCurveAt( i );


	// Clear linear path for debugging?
	if( false ) { // document.forms["bezier_form"].elements["draw_linear_path_segments"].checked ) {
	    
	    context.strokeStyle = "#c8c8ff";
	    context.lineWidth   = 1;
	    context.beginPath();
	    context.moveTo( bCurve.getStartPoint().x * zoomFactor + drawOffset.x,
			    bCurve.getStartPoint().y * zoomFactor + drawOffset.y );
	    context.lineTo( bCurve.getEndPoint().x   * zoomFactor + drawOffset.x,
			    bCurve.getEndPoint().y   * zoomFactor + drawOffset.y );
	    context.stroke();

	}

	// Draw tangent?
	// Note: the tangentVector is NOT normalized in this implementation.
	//       THREE.js normalizes tangents, my implementation does NOT!
	var tangentVector = bCurve.getTangent( 0.5 );
	var perpendicular = new THREE.Vector2( tangentVector.y, - tangentVector.x );
	var tangentPoint  = bCurve.getPoint( 0.5 );
	var tangentDrawLength = 200; // px
	// Normalize tangent
	tangentVector = tangentVector.normalize();
	context.strokeStyle = "#0000FF";
	context.lineWidth = 1;


	if( document.forms["bezier_form"].elements["draw_perpendiculars"].checked ) {
	    this.drawPerpendiculars( context,
				     bCurve,
				     drawOffset,
				     zoomFactor
			       );
	}


	// Draw the actual bezier curve
	this.drawBezierCurve( context,
			      bCurve,
			      drawOffset,
			      zoomFactor,
			      drawStartPoint, 
			      drawEndPoint && i+1 == bezierPath.getCurveCount(), // avoid to double-paint start and end points
			      drawStartControlPoint,  
			      drawEndControlPoint,

			      drawTangents,  // drawTangents
			    
			      IKRS.Utils.inArray( this.selectedPointIndices, i ),               // startPointIsSelected
			      IKRS.Utils.inArray( this.selectedPointIndices, i+1 )              // endPointIsSelected
			    );

	

    }
    
    
    // This is a different way to draw the bezier curve:
    //  it uses REAL interpolation, and NOT the segment cache!
    // This way should be used to pick random points from the curve
    // for further calculation.
    /*
    var steps = 50;
    var lastPoint = this.bezierPath.getPoint( 0.0 );
    context.strokeStyle = "#000000";
    context.beginPath();
    context.moveTo( lastPoint.x * zoomFactor + drawOffset.x, 
		    lastPoint.y * zoomFactor + drawOffset.y
		  );
    for( var i = 1; i <= steps; i++ ) {

	var t = (i/steps);
	var point = this.bezierPath.getPoint( t );
	
	//window.alert( "t=" + t + ", point=(" + point.x + ", " + point.y + ")" );
	
	context.lineTo( point.x * zoomFactor + drawOffset.x, 
			point.y * zoomFactor + drawOffset.y
		      );
	
	lastPoint = point;
    }
    context.stroke();
    */

}



//window.alert( "IKRS.BezierCanvasHandler=" + IKRS.BezierCanvasHandler );
//window.alert( "IKRS.BezierCanvasHandler.prototype=" + IKRS.BezierCanvasHandler.prototype );