/**
 * Requires jQuery.
 *
 * @author  Ikaros Kappler
 * @date    2016-04-18
 * @version 1.0.0
 **/


( function($) {

    window.dg_ratingDoneFor = [];

    /**
     * @param hash   - The dildo hash.
     * @param id     - yeahmm ... the id.
     * @param rating - in [0..5]
     **/
    window.dg_sendRatingRequest = function( hash, id, rating ) {

	console.debug( "hash=" + hash + ", id=" + id + ", rating=" + rating );

	$.ajax( { url     : "//www.dildo-generator.com/gallery/addRating.ajax.php",
		  type    : 'get',
		  data    : { "public_hash" : hash,
			      "id"          : id,
			      "rating"      : rating
			    },
		  success : function( data, textStatus, jqXHR ) {
		      console.debug( "Success: " + JSON.stringify(data) );

		      // Update rating count.
		      var sumContainer    = $( "#ratingCount_" + id + "_sum" );
		      var singleContainer = $( "#ratingCount_" + id + "_" + rating );
		      
		      console.debug( "sumContainer.text=" + sumContainer.text() );
		      sumContainer.empty().text(    eval(sumContainer.text()   +1) );
		      singleContainer.empty().text( eval(singleContainer.text()+1) );
		  },
		  error   : function( jqXHR, textStatus, errorThrown ) {
		      console.debug( "Error: " + JSON.stringify(errorThrown) );
		  }
		}
	      );

    };

    window.dg_highlightStar = function( dildoID, spanBase, starNumber, highlight, currentRating ) {

	var spanID = spanBase + starNumber;
	//console.debug( "window.dg_ratingDoneFor[starNumber]=" + window.dg_ratingDoneFor[dildoID] );
	if( window.dg_ratingDoneFor[dildoID] ) {
	    currentRating = window.dg_ratingDoneFor[dildoID];	    
	}

	if( highlight ) {
	    $( "#" + spanID ).css( "color", "#0088c8" );
	} else {
	    if( starNumber < currentRating )
		$( "#" + spanID ).css( "color", "#ffaa00" );
	    else
		$( "#" + spanID ).css( "color", "#000000" );
	}

    };


    window.dg_setRating = function( dildoID, spanBase, starNumber, highlight, currentRating ) {
	console.debug( "[dg_setRating] spanBase=" + spanBase + ", starNumber=" + starNumber + ", highlight=" + highlight + ", currentRating=" + currentRating );
	for( var i = 0; i < 5; i++ ) {
	    var spanID = spanBase + i;
	    if( i <= starNumber )
		$( "#" + spanID ).css( "color", "#ffaa00" );
	    else
		$( "#" + spanID ).css( "color", "#000000" );
	}
	console.debug( "setting rating for (local) " + dildoID + ": " + currentRating );
	window.dg_ratingDoneFor[dildoID] = currentRating;
    };
 


} )(jQuery);

