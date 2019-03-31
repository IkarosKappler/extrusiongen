/**
 * This is a plain file defining a single javasscript object for
 * the presets.
 *
 * The presets defined in the object specify the preset menu strucure.
 *
 *
 * Additionally there is a function for populating the menu structure
 * for the presets.
 *
 *
 * @author  Ikaros Kappler
 * @date    2014-06-19
 * @version 1.0.0
 **/


if( !_DILDO_PRESETS || typeof _DILDO_PRESETS === "undefined" )
    var _DILDO_PRESETS = {};


/**
 * Note that the bezier JSON member names need to be put into double quotes.
 **/
_DILDO_PRESETS.plugs = { label:    "Plugs",
			 elements: [

			     { name:        "bender",
			       label:       "Bender",
			       bezier_json: "[ { \"startPoint\" : [-82,121], \"endPoint\" : [-65.6632547130022,66.86253028822362], \"startControlPoint\": [-90,87], \"endControlPoint\" : [-65.1280116275288,79.81498568733232] }, { \"startPoint\" : [-65.6632547130022,66.86253028822362], \"endPoint\" : [-57.454814814814796,5.460592592592583], \"startControlPoint\": [-67.90083458315588,12.714883626940079], \"endControlPoint\" : [-66.28766869253815,34.77964111961321] }, { \"startPoint\" : [-57.454814814814796,5.460592592592583], \"endPoint\" : [-55,-139], \"startControlPoint\": [-50.31974300727449,-18.222977798698675], \"endControlPoint\" : [-84.38654635129569,-50.09980658609145] }, { \"startPoint\" : [-55,-139], \"endPoint\" : [-51.66118578883062,-227.750293953586], \"startControlPoint\": [-39.46858425198657,-185.98564599883105], \"endControlPoint\" : [-56.750583998055625,-189.07086756347596] }, { \"startPoint\" : [-51.66118578883062,-227.750293953586], \"endPoint\" : [-2,-323], \"startControlPoint\": [-46.66118578883062,-265.75029395358604], \"endControlPoint\" : [-34,-323] } ]",
			       bend_angle:  15
			     },

			     { name:        "simple",
			       label:       "Simple",
			       bezier_json: "[ { \"startPoint\" : [-122,77.80736634304651], \"endPoint\" : [-65.59022229786551,21.46778533702511], \"startControlPoint\": [-121.62058129515852,25.08908859418696], \"endControlPoint\" : [-79.33419353770395,48.71529293460728] }, { \"startPoint\" : [-65.59022229786551,21.46778533702511], \"endPoint\" : [-67.81202987758626,-127.8068053796891], \"startControlPoint\": [-52.448492057756646,-4.585775770903305], \"endControlPoint\" : [-118.74009448772384,-54.213019624416724] }, { \"startPoint\" : [-67.81202987758626,-127.8068053796891], \"endPoint\" : [-66.86203591980056,-242.40824513210237], \"startControlPoint\": [-36.55872162861639,-172.9695126026205], \"endControlPoint\" : [-84.09275729013092,-204.6502273221321] }, { \"startPoint\" : [-66.86203591980056,-242.40824513210237], \"endPoint\" : [-21.108966092052256,-323], \"startControlPoint\": [-50.901371329358476,-277.3831626014642], \"endControlPoint\" : [-53.05779349623559,-323] } ]",
			       bend_angle:  0
			     },


			     { name:        "flashlight_case",
			       label:       "Flashlight Case",
			       bezier_json: "[ { \"startPoint\" : [49.31656749329055,184.31019787698517], \"endPoint\" : [-20.656367534471443,184.1283063613685], \"startControlPoint\": [22.342837241573182,184.176953428286], \"endControlPoint\" : [0.7865752907139978,184.26633602505484] }, { \"startPoint\" : [-20.656367534471443,184.1283063613685], \"endPoint\" : [-30.920064533370052,-47.92240276579001], \"startControlPoint\": [-21.09178868610296,184.12550352616012], \"endControlPoint\" : [-22.33879495164605,-26.747775156408167] }, { \"startPoint\" : [-30.920064533370052,-47.92240276579001], \"endPoint\" : [-49.31656749329054,-183.964110294922], \"startControlPoint\": [-49.127541905814546,-92.85008501561195], \"endControlPoint\" : [-48.627775538041526,-153.81082685191055] }, { \"startPoint\" : [-49.31656749329054,-183.964110294922], \"endPoint\" : [-41.266901452446675,-184.11345201774816], \"startControlPoint\": [-49.321103068647524,-184.16266442766724], \"endControlPoint\" : [-41.245927172287544,-184.54396913964078] }, { \"startPoint\" : [-41.266901452446675,-184.11345201774816], \"endPoint\" : [-23.815273849922335,-49.35491697738382], \"startControlPoint\": [-42.7369597943179,-153.93910126268645], \"endControlPoint\" : [-41.86329574917294,-92.47993839854082] }, { \"startPoint\" : [-23.815273849922335,-49.35491697738382], \"endPoint\" : [-12.443572772396593,177.4919391300525], \"startControlPoint\": [-14.591581659114304,-27.31527598341588], \"endControlPoint\" : [-13.861960285858942,177.49215134477654] }, { \"startPoint\" : [-12.443572772396593,177.4919391300525], \"endPoint\" : [49.16841852088815,177.83475853216748], \"startControlPoint\": [10.018205797540002,177.48857846867057], \"endControlPoint\" : [37.12352127306426,177.83475853216748] } ]",
			       bend_angle:  0
			     },

			     { name:        "the_five_hills",
			       label:       "The Five Hills",
			       bezier_json: "[ { \"startPoint\" : [-42.6,198.4], \"endPoint\" : [-3.3,152.8], \"startControlPoint\": [-42.3,155.1], \"endControlPoint\" : [-14.9,171.1] }, { \"startPoint\" : [-3.3,152.8], \"endPoint\" : [-9.4,130.4], \"startControlPoint\": [0.5,146.8], \"endControlPoint\" : [-7.2,139.9] }, { \"startPoint\" : [-9.4,130.4], \"endPoint\" : [-6.6,92.1], \"startControlPoint\": [-12.9,115.5], \"endControlPoint\" : [-10.8,102.4] }, { \"startPoint\" : [-6.6,92.1], \"endPoint\" : [-2.7,60.1], \"startControlPoint\": [-2.7,82.3], \"endControlPoint\" : [2.5,74.2] }, { \"startPoint\" : [-2.7,60.1], \"endPoint\" : [0.2,20.8], \"startControlPoint\": [-6.6,49.7], \"endControlPoint\" : [-5,32.1] }, { \"startPoint\" : [0.2,20.8], \"endPoint\" : [2.7,-6.7], \"startControlPoint\": [4.4,11.8], \"endControlPoint\" : [5.8,3.3] }, { \"startPoint\" : [2.7,-6.7], \"endPoint\" : [5,-43.8], \"startControlPoint\": [-1.2,-19.4], \"endControlPoint\" : [0.6,-31.9] }, { \"startPoint\" : [5,-43.8], \"endPoint\" : [8.5,-71.2], \"startControlPoint\": [8,-52.2], \"endControlPoint\" : [11.8,-60] }, { \"startPoint\" : [8.5,-71.2], \"endPoint\" : [10.2,-107.6], \"startControlPoint\": [5,-83], \"endControlPoint\" : [5.5,-97.3] }, { \"startPoint\" : [10.2,-107.6], \"endPoint\" : [10.5,-144.7], \"startControlPoint\": [15.1,-118.6], \"endControlPoint\" : [7.5,-130.2] }, { \"startPoint\" : [10.5,-144.7], \"endPoint\" : [42.6,-198.4], \"startControlPoint\": [16.8,-175.7], \"endControlPoint\" : [16.3,-198.4] } ]",
			       bend_angle:  36
			     },
			     
			     { name:        "vibrator_shell_A",
			       label:       "Vibrator Shell",
			       bezier_json: "[ { \"startPoint\" : [-12.24460949331966,66.35580804959842], \"endPoint\" : [-11.390491940515977,42.66592990975844], \"startControlPoint\": [-12.1723879306861,54.62256314217003], \"endControlPoint\" : [-12.984159248123326,46.549300122607185] }, { \"startPoint\" : [-11.390491940515977,42.66592990975844], \"endPoint\" : [-11.424712212539148,25.45666313315025], \"startControlPoint\": [-8.6626618403858,36.0188875151562], \"endControlPoint\" : [-14.335782556342924,32.90111536436448] }, { \"startPoint\" : [-11.424712212539148,25.45666313315025], \"endPoint\" : [-11.542290239407812,8.16017451974707], \"startControlPoint\": [-8.88076250656111,18.95104498308552], \"endControlPoint\" : [-13.913715785394531,14.254001785446897] }, { \"startPoint\" : [-11.542290239407812,8.16017451974707], \"endPoint\" : [-12.016389595247214,-8.443883750949281], \"startControlPoint\": [-8.792530268505844,1.094145264403029], \"endControlPoint\" : [-13.170422227179952,-5.0293887585482535] }, { \"startPoint\" : [-12.016389595247214,-8.443883750949281], \"endPoint\" : [-12.052284340633147,-29.711860650901855], \"startControlPoint\": [-8.053815687376309,-20.16815253768573], \"endControlPoint\" : [-13.164093726253906,-20.98743843149324] }, { \"startPoint\" : [-12.052284340633147,-29.711860650901855], \"endPoint\" : [12.388092871282993,-66.35580804959842], \"startControlPoint\": [-9.296478330167345,-51.33680418981928], \"endControlPoint\" : [-3.2449667106017763,-66.56673860081109] } ]",
			       bend_angle:  0
			     },

			     { name:        "vibrator_shell_B",
			       label:       "Vibrato Mold",
			       bezier_json: "[ { \"startPoint\" : [-12.24460949331966,66.35580804959842], \"endPoint\" : [-11.390491940515977,42.66592990975844], \"startControlPoint\": [-12.1723879306861,54.62256314217003], \"endControlPoint\" : [-12.984159248123326,46.549300122607185] }, { \"startPoint\" : [-11.390491940515977,42.66592990975844], \"endPoint\" : [-11.424712212539148,25.45666313315025], \"startControlPoint\": [-8.6626618403858,36.0188875151562], \"endControlPoint\" : [-14.335782556342924,32.90111536436448] }, { \"startPoint\" : [-11.424712212539148,25.45666313315025], \"endPoint\" : [-11.542290239407812,8.16017451974707], \"startControlPoint\": [-8.88076250656111,18.95104498308552], \"endControlPoint\" : [-13.913715785394531,14.254001785446897] }, { \"startPoint\" : [-11.542290239407812,8.16017451974707], \"endPoint\" : [-12.016389595247214,-8.443883750949281], \"startControlPoint\": [-8.792530268505844,1.094145264403029], \"endControlPoint\" : [-13.170422227179952,-5.0293887585482535] }, { \"startPoint\" : [-12.016389595247214,-8.443883750949281], \"endPoint\" : [-12.052284340633147,-29.711860650901855], \"startControlPoint\": [-8.053815687376309,-20.16815253768573], \"endControlPoint\" : [-13.164093726253906,-20.98743843149324] }, { \"startPoint\" : [-12.052284340633147,-29.711860650901855], \"endPoint\" : [17.26774003704734,-73.231674510448], \"startControlPoint\": [-9.296478330167345,-51.33680418981928], \"endControlPoint\" : [1.6346804551625649,-73.44260506166067] } ]",
			       bend_angle:  0
			     }
			 ]
		       };





function populate_dildo_presets_menu( presets ) {


    for( var category_name in presets ) {
	
	var category = presets[ category_name ];

	document.write( "<li><a href=\"#\" class=\"popout\">Presets &gt;</a>\n" );
	document.write( "<ul>\n" );
	
	for( var i in category.elements ) {

	    var preset      = category.elements[i];
	    document.write( "<li><a href=\"#\" onclick=\"setBezierPathFromJSON(_DILDO_PRESETS." + category_name + ".elements[" + i + "].bezier_json,_DILDO_PRESETS." + category_name + ".elements[" + i + "].bend_angle);\">" + preset.label + "</a></li>\n" );
	    
	}
	
	
	document.write( "</ul>\n" );
	document.write( "</li>\n" );

    }


}