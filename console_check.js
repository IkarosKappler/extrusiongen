
/**
 * This script creates a dummy console for browsers that do not support the
 * console natively.
 *
 * Found at and thanks to
 * http://opensourcehacker.com/2011/03/15/everyone-loves-and-hates-console-log/
 * 
 **/

if( typeof(window.console) == "undefined" ) { 
    console = {}; 
    console.log = console.warn = console.error = function(a) {}; 
}
