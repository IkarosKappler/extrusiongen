/**
 * @author Ikaros Kappler
 * @date 2013-10-29
 * @version 1.0.0
 **/


IKRS.VectorFactory = function( p_signX, p_signY, p_signZ ) {
    
    IKRS.Object.call( this );
    
    if( typeof p_signX == "undefined" )
	signX = 1;
    if( typeof p_signY == "undefined" )
	signY = 1;
    if( typeof p_signZ == "undefined" )
	signZ = 1;


    this.signX = p_signX;
    this.signY = p_signY;
    this.signZ = p_signZ;
};

IKRS.VectorFactory.prototype = new IKRS.Object();
IKRS.VectorFactory.prototype.constructor = IKRS.VectorFactory;

/*
IKRS.VectorFactory.prototype.getSignX = function() {
    return this.signX;
};

IKRS.VectorFactory.prototype.getSignY = function() {
    return this.signY;
};

IKRS.VectorFactory.prototype.getSignZ = function() {
    return this.signZ;
};
*/

IKRS.VectorFactory.prototype.createVector2 = function( x, y ) {
    return new THREE.Vector2( this.signX * x, this.signY * y );
};

IKRS.VectorFactory.prototype.createVector3 = function( x, y, z ) {
    return new THREE.Vector3( this.signX * x, this.signY * y, this.signZ * z );
};

/*
IKRS.VectorFactory.prototype.toString = function() {

    var tmp    = this.createVector3( 1, 2, 3 );
    var result = "[IKRS.VectorFactory] mapping=(";
    var rX = "", rY = "", rZ = "";
    
    tmp.x = Math.abs(tmp.x);
    tmp.y = Math.abs(tmp.y);
    tmp.z = Math.abs(tmp.z);

    if( tmp.x == 1 )      rX = "x";
    else if( tmp.x == 2 ) rX = "y";
    else if( tmp.x == 3 ) rX = "z";

    if( tmp.y == 1 )      rY = "x";
    else if( tmp.y == 2 ) rY = "y";
    else if( tmp.y == 3 ) rY = "z";

    if( tmp.z == 1 )      rZ = "x";
    else if( tmp.z == 2 ) rZ = "y";
    else if( tmp.z == 3 ) rZ = "z";

    if( this.signX
}
*/