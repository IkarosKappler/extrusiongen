/**
 * @author Ikaros Kappler
 * @date 2013-08-14
 * @version 1.0.0
 **/

IKRS.Object = function() {

    // NOOP

}


IKRS.Object.prototype = {

    constructor: IKRS.Object,

    toString: function() { 
	return "[IKRS.Object]";
    }
};