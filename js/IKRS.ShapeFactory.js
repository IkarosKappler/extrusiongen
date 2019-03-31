/**
 * This is a simple abstract shape factory class.
 *
 * The idea is to pass a shape (the default shape is a circle) to the generator
 * which 'moves' the shape along a path — applying some other modifications.
 *
 * To use different shapes it is useful to declare this abstract factory class.
 * Subclasses should inherit its functions.
 *
 * @author  Ikaros Kappler
 * @date    2014-07-03
 * @version 1.0.0
 **/ 

IKRS.ShapeFactory = function( name ) {

    IKRS.Object.call( this );
    
    this.name = name;

};

IKRS.ShapeFactory.prototype             = new IKRS.Object();
IKRS.ShapeFactory.prototype.constructor = IKRS.ShapeFactory;


/**
 * This function MUST be overridden by subclasses!
 *
 * The returned value must be an array with instances of THREE.Vector2 or THREE.Vector3 (leaving the z component empty/zero).
 *
 * @param segmentCount (integer) the number of segments/points to get from this shape.
 * @return array with the shape points.
 **/
IKRS.ShapeFactory.prototype.createShapePoints = function( segmentCount ) {
    throw "You have to subclass IKRS.ShapeFactory and implement the createShapePoints so they meet your needs.";
};





