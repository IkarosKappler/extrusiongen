/**
 * @author Ikaros Kappler
 * @date 2013-08-21
 * @version 1.0.0
 **/ 



IKRS.Utils = {};


IKRS.Utils.inArray = function( arr, x ) {

    for( var i = 0; i < arr.length; i++ ) {
	if( arr[i] == x )
	    return true;
    }
	
    return false;
};

IKRS.Utils.rotateVectorAroundZ = function( vector, axis, angle ) {


    // In Java it would look like this, where 'vector' is 'this':
    // double dX = center.getX()-this.x,
    // dY = center.getY()-this.y;
    // double pointAngle = calculateAngle(dX, dY);
    // double radius = Math.sqrt( dX*dX + dY*dY );
    // this.x = center.getX()+radius*Math.cos( angle + pointAngle );
    // this.y = center.getY()+radius*Math.sin( angle + pointAngle );
    
    var dX         = axis.x - vector.x;
    var dY         = axis.y - vector.y;
    var pointAngle = IKRS.Utils.calculateAngle( dX, dY );
    var radius     = Math.sqrt( dX*dX + dY*dY );
    vector.x       = axis.x + radius*Math.cos( angle + pointAngle );
    vector.y       = axis.x + radius*Math.sin( angle + pointAngle );  
    return vector;
};


IKRS.Utils.calculateAngle = function( distA, distB ) {
    var pointAngle = 0.0;
    if( distA == 0 ) {
        if( distB < 0 ) pointAngle = -Math.PI/2.0;
        else         pointAngle = Math.PI/2.0; //0.0;
    } else          pointAngle = Math.atan(distB/distA);

    if( distA >= 0 )
        pointAngle = Math.PI+pointAngle;

    return pointAngle;
};


IKRS.Utils.isNumeric = function(n) { 
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n); 
};

IKRS.Utils.isHexadecimal = function( str ) {
    return /^[0-9A-F]*$/i.test(str);
};



