
/**
 * These are some helper functions that were moved from the main.html to 
 * keep the code simple.
 *
 * Requires:
 *  - ImageFileReader
 *
 * @author Ikaros Kappler
 * @date 2014-03-19
 * @version 1.0.0
 **/

function getSelectedMeshDirection() {
    return getSelectedRadioBoxValueByName( "mesh_form", "directions" );
}

// Value must be "xyz" or "zxy"
function setSelectedMeshDirection( value ) {
    return setSelectedRadioBoxValueByName( "mesh_form", "directions", value );
}

function getSelectedMeshHullType() {
    return getSelectedRadioBoxValueByName( "mesh_form", "mesh_hull_type" );
}

function getSelectedMeshHullStyle() {
    return getSelectedRadioBoxValueByName( "mesh_form", "mesh_hull_style" );
}

// Value must be "perpendicular" or "prism"
function setSelectedMeshHullType( value ) {
    return setSelectedRadioBoxValueByName( "mesh_form", "mesh_hull_type", value );
}

function getSelectedMeshParts() {
    return getSelectedRadioBoxValueByName( "mesh_form", "parts" );
}

// Value must be "both" or "left" or "right"
function setSelectedMeshParts( value ) {
    return setSelectedRadioBoxValueByName( "mesh_form", "parts", value );
}

function setSelectedMeshColor( value ) {
    document.forms["color_form"].elements["color"].value = value;
}

function getSelectedBezierBackgroundType() {
    return getSelectedRadioBoxValueByName( "bezier_background_form", "bezier_background_type" );
}

function getSelectedRadioBoxValueByName( formName, radioName ) {
    if( !document.forms[formName] || !document.forms[formName].elements[radioName] )
	return undefined;
    var radios = document.forms[ formName ].elements[ radioName ];
    for( var i = 0; i < radios.length; i++ ) {
        if( radios[i].checked )
            return radios[i].value;
    }                                                                                 
    return undefined;
}

function setSelectedRadioBoxValueByName( formName, radioName, value ) {
    var radios = document.forms[ formName ].elements[ radioName ];
    for( var i = 0; i < radios.length; i++ ) {
        if( radios[i].value == value ) { //radios[i].checked )
	    radios[i].checked = true;
            //return radios[i].value;
	    return true;
	}
    }                                                                                 
    return false;
}

function getSelectedShapeStyle() {
    //return "oval";
    return getSelectedRadioBoxValueByName( "mesh_form", "shape_style" );
}

/**
 * Allowed values are "circle" (DEFAULT) and "oval".
 **/
function setSelectedShapeStyle( shapeStyle ) {
    if( !shapeStyle )
	shapeStyle = "circle";
    setSelectedRadioBoxValueByName( "mesh_form", "shape_style", shapeStyle );
}

function getBendingValue( value ) {
    return document.getElementById('preview_bend').value;
}

function setBendingValue( value ) {
    document.getElementById('preview_bend').value = value;
    displayBendingValue();
}

function displayBendingValue() {
    document.getElementById('preview_bend_display').innerHTML = document.getElementById('preview_bend').value;
}


function getTwistValue( value ) {
    return document.getElementById('preview_twist').value;
}

function setTwistValue( value ) {
    document.getElementById('preview_twist').value = value;
    displayTwistValue();
}

function displayTwistValue() {
    // Sorry, the Twist setting made issues when 3D printing
    //document.getElementById('preview_twist_display').innerHTML = document.getElementById('preview_twist').value;
}


function toggleFormElementsEnabled() {
    document.getElementById('mesh_hull_strength').disabled      = !document.getElementById('build_negative_mesh').checked;
    document.getElementById('arrange_splits_on_plane').disabled = !document.getElementById('split_shape').checked;
    toggleMeshDirectionEnabled();
    toggleMeshHullStyleEnabled();
    togglePartsEnabled();
}

function toggleMeshDirectionEnabled() {
    document.getElementById('directions_xyz').disabled = 
	document.getElementById('directions_yxz').disabled = 
	( !document.getElementById('split_shape').checked || 
	  !document.getElementById('arrange_splits_on_plane').checked );

    toggleMeshBaseEnabled();
}


function toggleMeshBaseEnabled() {
    document.getElementById('mesh_hull_perpendicular').disabled = 
	document.getElementById('mesh_hull_prism').disabled = 
	( !document.getElementById('split_shape').checked || 
	  !document.getElementById('arrange_splits_on_plane').checked );
}

function toggleMeshHullStyleEnabled() {
    if( !document.getElementById('mesh_hull_style_continuous') || document.getElementById('mesh_hull_style_discrete') )
	return;
    document.getElementById('mesh_hull_style_continuous').disabled = 
	document.getElementById('mesh_hull_style_discrete').disabled = 
	( !document.getElementById('split_shape').checked 	  
	  //!document.getElementById('arrange_splits_on_plane').checked 
	);
}

function togglePartsEnabled() {
    document.getElementById('parts_both').disabled = 
	document.getElementById('parts_left').disabled =
	document.getElementById('parts_right').disabled =
	( !document.getElementById('split_shape').checked );
}

/*
    function getSelectedMeshBaseType() {
    var radios = document.forms["mesh_form"].elements["mesh_base_type"];
    for( var i = 0; i < radios.length; i++ ) {
                        if( radios[i].checked )
                        return radios[i].value;
                        }
                        return undefined;
                        }  
*/

function changeBezierBackgroundType() {
    var type = getSelectedBezierBackgroundType();
    if( type == "default" ) {
	bezierCanvasHandler.setCustomBackgroundImage( null, 
			                              true             // redraw when ready
						    ); 
    } else if( type == "file" ) {
	document.forms['bezier_background_form'].elements['bezier_background_file'].click();		
    }
}

function loadBezierBackground() {
    ImageFileReader.readBezierBackgroundImage();
}
 