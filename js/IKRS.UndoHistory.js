/**
 * @author Ikaros Kappler
 * @date 2013-09-12
 * @version 1.0.0
 **/


IKRS.UndoHistory = function( initialValue,
			     capacity 
			   ) {

    if( !initialValue )
	throw "Error: initial value must not be null.";
    
    if( !initialValue.clone || typeof initialValue.clone != "function" )
	throw "Error: initial value has no clone() function!";
	

    if( !capacity )
	capacity = 32;

    this._undoCapacity   = capacity;
    this._undoHistory    = [ this._undoCapacity ];
    //this._undoHistory[0] = initialValue.clone(); // One history entry into the past :)
    this._undoHistory[0] = initialValue;         // The current path to work on
    this._undoFront      = 0;
    this._undoLength     = 1;
    this._undoPointer    = 0;


}

IKRS.UndoHistory.prototype = new IKRS.Object();
IKRS.UndoHistory.prototype.constructor = IKRS.UndoHistory;


IKRS.UndoHistory.prototype.getCurrentState = function() {
    //window.alert( JSON.stringify(this._undoHistory) );
    return this._undoHistory[ (this._undoFront + this._undoPointer) % this._undoCapacity ];
}


IKRS.UndoHistory.prototype.createHistoryEntry = function() {

    //window.alert( JSON.stringify(this) );

    // Clone current state
    var newItem = this.getCurrentState().clone();
    
    // Add to end of undo-history
    //this._undoPointer = (this._undoPointer + 1.0) % this._undoCapacity;

    if( this._undoPointer < this._undoCapacity ) {
	
	this._undoPointer = this._undoPointer + 1;

    } else {
                                   
	this._undoFront   = (this._undoFront + 1) % this._undoCapacity;

    }
    

    	// Undo length reached? (is in present)
	if( this._undoPointer < this._undoLength ) {
	    
	    // Cut off the trailing elements
	    if( this._undoPointer < this._undoCapacity )
		this._undoLength = this._undoPointer+1;
	    else
		this._undoLength = this._undoCapacity;

	} else { // if( this._undoPointer >= this._undoLength ) {

	    this._undoLength = Math.min( this._undoLength+1,
					 this._undoCapacity 
				       );
	} 	


       
    //window.alert( "undoLength=" + this._undoLength + ", undoFront=" + this._undoFront + ", undoPointer=" + this._undoPointer + ", undoCapacity=" + this._undoCapacity + ", newItem=" + newItem );
    

    this._undoHistory[ (this._undoFront + this._undoPointer) % this._undoCapacity ] = newItem;
}

IKRS.UndoHistory.prototype.undo = function() {

    //window.alert( "_undoPointer=" + this._undoPointer );

    // No history entries available?
    if( this._undoPointer <= 0 )
	return false;

    this._undoPointer -= 1;   

    // Fetch history entry?
    // var path = this._undoHistory[ (this._undoFront + this._undoPointer) % this._undoCapacity ];   
    //window.alert( "currentPath=" + JSON.stringify(this.bezierPath) + ",\n oldPath=" + JSON.stringify(path) + ",\n equal=" + this.bezierPath.equals(path) );
    
    return true;
}

/*
IKRS.UndoHistory.prototype.redo = function() {

    if( this._undoPointer+1 >= this._undoLength )
	return false;
    
    this._undoPointer = this._undoPointer + 1;   
    var path = this._undoHistory[ (this._undoFront + this._undoPointer) % this._undoCapacity ];   
    //window.alert( "currentPath=" + JSON.stringify(this.bezierPath) + ",\n oldPath=" + JSON.stringify(path) + ",\n equal=" + this.bezierPath.equals(path) );
    
    return true;

}

*/

IKRS.UndoHistory.prototype._toString = function() {
    return "[IKRS.UndoHistory]={ front=" + this._undoFront + ", length=" + this._undoLength + ", pointer=" + this._undoPointer + "}";
}
