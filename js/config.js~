/**
 * This is a global config file that helps to configure basic settings for the
 * dildo generator.
 *
 * It should help the guys from wamungo.com to customize the dildo generator in 
 * a comfortable manner.
 *
 *
 * @author   Ikaros Kappler
 * @date     2014-06-10
 * @modified 2014-06-19 Ikaros Kappler (added the canvas background image settings).
 * @version  1.0.0
 **/


if( !_DILDO_CONFIG || typeof _DILDO_CONFIG === "undefined" )
    var _DILDO_CONFIG = {};

if( !_DILDO_CONFIG.IMAGES || typeof _DILDO_CONFIG.IMAGES === "undefined" )
    _DILDO_CONFIG.IMAGES = {};


/**
 * Some global constants that define the desired canvas sizes (modify when 
 * resizing the HTML5 canvas).
 * Note that these values might change in runtime if the AUTO_RESIZE_ON_DOCUMENT_LOAD
 * is set to true.
 **/
_DILDO_CONFIG.BEZIER_CANVAS_WIDTH          = 400;
_DILDO_CONFIG.BEZIER_CANVAS_HEIGHT         = 600;

_DILDO_CONFIG.PREVIEW_CANVAS_WIDTH         = 400;
_DILDO_CONFIG.PREVIEW_CANVAS_HEIGHT        = 600;

/**
 * If set to true the initialisation will resize the canvas elements
 * so they fit into the available screen dimensions.
 **/
_DILDO_CONFIG.AUTO_RESIZE_ON_DOCUMENT_LOAD = true;


/**
 * Set this flag to true if you wish the Model->Publish item to be hidden.
 * Valid values: true|false
 **/
//_DILDO_CONFIG.HIDE_PUBLISH_MESH_MENU       = !isDildoGeneratorDomain();  
_DILDO_CONFIG.HIDE_PUBLISH_MESH_MENU       = false; 


/**
 * Set this flag to true if you wish the Model->Export sub menu to be hidden.
 * Valid values: true|false
 **/
_DILDO_CONFIG.HIDE_EXPORT_MESH_MENU       = false;  
//_DILDO_CONFIG.HIDE_EXPORT_MESH_MENU       = true; 

/**
 * Set this flag to true if you wish the Model->Save (*.zip) sub menu to be
 * hidden.
 * Valid values: true|false
 **/
_DILDO_CONFIG.HIDE_SAVE_FILE_ITEM         = false; 

/**
 * Set this flag to true if you wish the Model->Load (*.zip) sub menu to be
 * hidden.
 * Valid values: true|false
 **/
_DILDO_CONFIG.HIDE_LOAD_FILE_ITEM         = false; 

/**
 * Set this flag to true if you wish the whole Print menu to be hidden.
 * Valid values: true|false
 **/
//_DILDO_CONFIG.HIDE_PRINT_MENU             = false; // true|false
_DILDO_CONFIG.HIDE_PRINT_MENU             = !isDildoGeneratorDomain(); 

/**
 * Set the Print->Order_Print sub menu action to the specific javascript action (string).
 *
 * This only takes effect if the _DILDO_CONFIG.HIDE_PRINT_MENU is set to false.
 **/
_DILDO_CONFIG.ORDER_PRINT_ACTION          = "order_print();";


/**
 * Since version 0.2.38 there is a new 'Publish' function (still testing).
 * This configures the publishing URl where the server script is located at.
 **/
_DILDO_CONFIG.PUBLISHING_URL              = "gallery/store_custom_dildo.php"; // Relative path


/**
 * Defines the bezier canvas background image to be drawn (string: url).
 **/
_DILDO_CONFIG.IMAGES.BEZIER_BACKGROUND    = "img/bg_bezier.png";



/**
 * Defines the preview canvas background image to be drawn (string: url).
 **/
_DILDO_CONFIG.IMAGES.PREVIEW_BACKGROUND   = "img/bg_preview.png";


/**
 * If the autosave function has stored a dildo design before in the session cookie
 * and this is set to true, then the stored bezier curve will be loaded (on page load)
 * instead of the default bezier curve.
 **/
_DILDO_CONFIG.AUTOLOAD_ENABLED            = true;


/**
 * This is the bezier curve to be loaded by default when the window is loaded.
 * Please note that if the autosave function has stored a design in the session cookie
 * and _DILDO_CONFIG.AUTOLOAD_ENABLED is set to true, the stored bezier curve will
 * override this one.
 **/
_DILDO_CONFIG.DEFAULT_BEZIER_JSON         = "[ { \"startPoint\" : [-122,77.80736634304651], \"endPoint\" : [-65.59022229786551,21.46778533702511], \"startControlPoint\": [-121.62058129515852,25.08908859418696], \"endControlPoint\" : [-79.33419353770395,48.71529293460728] }, { \"startPoint\" : [-65.59022229786551,21.46778533702511], \"endPoint\" : [-65.66917273472913,-149.23537680826058], \"startControlPoint\": [-52.448492057756646,-4.585775770903305], \"endControlPoint\" : [-86.1618869001374,-62.11613821618976] }, { \"startPoint\" : [-65.66917273472913,-149.23537680826058], \"endPoint\" : [-61.86203591980055,-243.8368165606738], \"startControlPoint\": [-53.701578771473564,-200.1123697454778], \"endControlPoint\" : [-69.80704300441666,-205.36451303641783] }, { \"startPoint\" : [-61.86203591980055,-243.8368165606738], \"endPoint\" : [-21.108966092052256,-323], \"startControlPoint\": [-54.08681426887413,-281.486963896856], \"endControlPoint\" : [-53.05779349623559,-323] } ]";
