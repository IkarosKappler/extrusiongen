/**
 * Some functions for the buying panel.
 *
 * @author  Ikaros Kappler
 * @date    2016-04-19
 * @version 1.0.0
 **/


(function($) {
    //$( document ).ready( function() {

	console.log( "Initializing buying panel ..." );

	window._DG_BUYINGPANEL = { };

	window._DG_BUYINGPANEL.addDildoMouldFileToCart = function( dildoID, dildoHash, buttonID ) {
	    window._DG_BUYINGPANEL._displayComingSoon( dildoID, dildoHash, buttonID );
	};

	window._DG_BUYINGPANEL.addDildoMouldPrintToCart = function( dildoID, dildoHash, buttonID ) {
	    window._DG_BUYINGPANEL._displayComingSoon( dildoID, dildoHash, buttonID );
	};

	window._DG_BUYINGPANEL.addDildoFileToCart = function( dildoID, dildoHash, buttonID ) {
	    window._DG_BUYINGPANEL._displayComingSoon( dildoID, dildoHash, buttonID );
	};

	window._DG_BUYINGPANEL._displayComingSoon = function( dildoID, dildoHash, buttonID ) {
	    console.debug( "Coming soon. (buttonID=" + buttonID + ")" );
	    $( "#" + buttonID ).val( "Coming Soon" );
	};
    
    //} );
})(jQuery);
