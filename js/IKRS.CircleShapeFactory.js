/**
 * This is the default shape factory, making circles.
 *
 * @author  Ikaros Kappler
 * @date    2014-07-03
 * @version 1.0.0
 **/ 

IKRS.CircleShapeFactory = function( circleRadius,
				    startAngle,
				    arc 
				  ) {

    IKRS.ShapeFactory.call( this, "Circle" );
    
    this.circleRadius        = circleRadius;
    this.startAngle          = startAngle;
    this.arc                 = arc;

};


IKRS.CircleShapeFactory.prototype             = new IKRS.Object();
IKRS.CircleShapeFactory.prototype.constructor = IKRS.ShapeFactory;


/**
 * This function creates the points for a circle shape (with the given segment count).
 **/
IKRS.CircleShapeFactory.prototype.createShapePoints = function( segmentCount ) {
    
    var shapePoints = [];

    // If the mesh is split, the shape will be split into two halfs. 
    // -> eventually divide the shape's segment count by two.
    for( i = 0; i <= segmentCount; i++ ) {

	var pct = i * (1.0/segmentCount);
	var angle = this.startAngle + this.arc * pct;	    
	shapePoints.push( new THREE.Vector3( Math.sin( angle ) * this.circleRadius,
					     Math.cos( angle ) * this.circleRadius,
					     0
					   )
			);
    }
    
    return shapePoints;
};





