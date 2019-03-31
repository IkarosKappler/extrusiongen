
/**
 * @author Ikaros Kappler
 * @date 2014-03-30
 * @version 1.0.0
 **/

IKRS.BoundingBox3 = function( _xMin,
			      _xMax,
			      _yMin,
			      _yMax,
			      _zMin,
			      _zMax
			    ) {
    
    IKRS.Object.call( this );
    
    this.xMin = _xMin;
    this.xMax = _xMax;
    this.yMin = _yMin;
    this.yMax = _yMax;
    this.zMin = _zMin;
    this.zmax = _zMax;
}

IKRS.BoundingBox3.prototype = new IKRS.Object();
IKRS.BoundingBox3.prototype.constructor = IKRS.BoundingBox3;

IKRS.BoundingBox3.prototype.toString = function() {
    return "IKRS.BoundingBox3={ xMin: " + this.xMin + ", xMax: " + this.xMax + ", yMin: " + this.yMin + ", yMax: " + this.yMax + ", zMin: " + this.zMin + ", zMax: " + this.zMax + ", width: " + this.getWidth() + ", height: " + this.getHeight() + ", depth: " + this.getDepth() + " }";
}


IKRS.BoundingBox3.prototype.getXMax = function() {
    return this.xMax;
}

IKRS.BoundingBox3.prototype.getXMin = function() {
    return this.xMin;
}

IKRS.BoundingBox3.prototype.getYMax = function() {
    return this.yMax;
}

IKRS.BoundingBox3.prototype.getYMin = function() {
    return this.yMin;
}

IKRS.BoundingBox3.prototype.getZMax = function() {
    return this.zMax;
}

IKRS.BoundingBox3.prototype.getZMin = function() {
    return this.zMin;
}

IKRS.BoundingBox3.prototype.getWidth = function() {
    return this.xMax - this.xMin;
}

IKRS.BoundingBox3.prototype.getHeight = function() {
    return this.yMax - this.yMin;
}

/*
IKRS.BoundingBox3.prototype.getLeftUpperPoint = function() {
    return new THREE.Vector2( this.xMin, this.yMin );
}

IKRS.BoundingBox3.prototype.getRightUpperPoint = function() {
    return new THREE.Vector2( this.xMax, this.yMin );
}

IKRS.BoundingBox3.prototype.getRightLowerPoint = function() {
    return new THREE.Vector2( this.xMax, this.yMax );
}

IKRS.BoundingBox3.prototype.getLeftLowerPoint = function() {
    return new THREE.Vector2( this.xMin, this.yMax );
}
*/


IKRS.BoundingBox3.prototype._toString = function() {
    return "IKRS.BoundingBox3={ xMin: " + this.xMin + ", xMax: " + this.xMax + ", yMin: " + this.yMin + ", yMax: " + this.yMax + ", zMin: " + this.zMin + ", zMax: " + this.zMax + ", width: " + this.getWidth() + ", height: " + this.getHeight() + ", depth: " + this.getDepth() + " }";
    // return "[IKRS.BoundingBox2]={ xMin=" + this.xMin + ", xMax=" + this.xMax + ", yMin=" + this.yMin + ", yMax=" + this.yMax + ", width=" + this.getWidth() + ", height=" + this.getHeight() + " }";
}


// A static function
IKRS.BoundingBox3.computeFromPoints = function( points ) {

    if( !points )
	points = [];
    
    if( points.length == 0 )
	return new IKRS.BoundingBox3( 0, 0, 0, 0, 0, 0 );

    var xMin = points[0].x;
    var xMax = points[0].x;
    var yMin = points[0].y;
    var yMax = points[0].y;
    var zMin = points[0].z;
    var zMax = points[0].z;
    
    for( var i = 1; i < points.length; i++ ) {

	var point = points[ i ];
	xMin = Math.min( xMin, point.x );
	xMax = Math.max( xMax, point.x );
	yMin = Math.min( yMin, point.y );
	yMax = Math.max( yMax, point.y );
	zMin = Math.min( zMin, point.z );
	zMax = Math.max( zMax, point.z );

    }

    return new IKRS.BoundingBox2( xMin, xMax, yMin, yMax, zMin, zMax );

}


