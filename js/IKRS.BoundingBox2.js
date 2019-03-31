
/**
 * @author Ikaros Kappler
 * @date 2013-08-22
 * @version 1.0.0
 **/

IKRS.BoundingBox2 = function( _xMin,
			      _xMax,
			      _yMin,
			      _yMax ) {
    
    IKRS.Object.call( this );
    
    this.xMin = _xMin;
    this.xMax = _xMax;
    this.yMin = _yMin;
    this.yMax = _yMax;
}

IKRS.BoundingBox2.prototype = new IKRS.Object();
IKRS.BoundingBox2.prototype.constructor = IKRS.BoundingBox2;

IKRS.BoundingBox2.prototype.toString = function() {
    return "IKRS.BoundingBox2={ xMin: " + this.xMin + ", xMax: " + this.xMax + ", yMin: " + this.yMin + ", yMax: " + this.yMax + ", width: " + this.getWidth() + ", height: " + this.getHeight() + " }";
}


IKRS.BoundingBox2.prototype.getXMax = function() {
    return this.xMax;
}

IKRS.BoundingBox2.prototype.getXMin = function() {
    return this.xMin;
}

IKRS.BoundingBox2.prototype.getYMax = function() {
    return this.yMax;
}

IKRS.BoundingBox2.prototype.getYMin = function() {
    return this.yMin;
}

IKRS.BoundingBox2.prototype.getWidth = function() {
    return this.xMax - this.xMin;
}

IKRS.BoundingBox2.prototype.getHeight = function() {
    return this.yMax - this.yMin;
}

IKRS.BoundingBox2.prototype.getLeftUpperPoint = function() {
    return new THREE.Vector2( this.xMin, this.yMin );
}

IKRS.BoundingBox2.prototype.getRightUpperPoint = function() {
    return new THREE.Vector2( this.xMax, this.yMin );
}

IKRS.BoundingBox2.prototype.getRightLowerPoint = function() {
    return new THREE.Vector2( this.xMax, this.yMax );
}

IKRS.BoundingBox2.prototype.getLeftLowerPoint = function() {
    return new THREE.Vector2( this.xMin, this.yMax );
}


IKRS.BoundingBox2.prototype._toString = function() {
    return "[IKRS.BoundingBox2]={ xMin=" + this.xMin + ", xMax=" + this.xMax + ", yMin=" + this.yMin + ", yMax=" + this.yMax + ", width=" + this.getWidth() + ", height=" + this.getHeight() + " }";
}


// A static function
IKRS.BoundingBox2.computeFromPoints = function( points ) {

    if( !points )
	points = [];
    
    if( points.length == 0 )
	return new IKRS.BoundingBox2( 0, 0, 0, 0 );

    var xMin = points[0].x;
    var xMax = points[0].x;
    var yMin = points[0].y;
    var yMax = points[0].y;
    
    for( var i = 1; i < points.length; i++ ) {

	var point = points[ i ];
	xMin = Math.min( xMin, point.x );
	xMax = Math.max( xMax, point.x );
	yMin = Math.min( yMin, point.y );
	yMax = Math.max( yMax, point.y );

    }

    return new IKRS.BoundingBox2( xMin, xMax, yMin, yMax );

}





//IKRS.BoundingBox2.prototype = new IKRS.Object();
//IKRS.BoundingBox2.prototype.constructor = IKRS.BoundingBox2;