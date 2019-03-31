/**
 * The key handler just handles keyboard input.
 *
 * @author  Ikaros Kappler
 * @date    2014-08-11
 * @version 1.0.0
 **/


IKRS.ExtrusiongenKeyHandler = function() {

    IKRS.Object.call( this );

    
    this.shiftKeyDown   = false;
    this.altKeyDown     = false;
    this.controlKeyDown = false;
    this.pKeyDown       = false;
    
};

IKRS.ExtrusiongenKeyHandler.prototype              = new IKRS.Object();
IKRS.ExtrusiongenKeyHandler.prototype.constructor  = IKRS.ExtrusiongenKeyHandler;

IKRS.ExtrusiongenKeyHandler.prototype.onKeyDown    = function( e ) {
    // Wrap up the key event into a class instance
    var keyEvent = new IKRS.KeyEvent( e );
    //window.alert( keyEvent );
    //window.alert( "this=" + this );
    //window.alert( "Key down: " + keyEvent.getKeyCode() + ", isPKey=" + keyEvent.isCharacterKey("P") );
    if( keyEvent.isShiftKey() ) {
	this.keyHandler.shiftKeyDown = true;
    } else if( keyEvent.isControlKey() ) {
	this.keyHandler.controlKeyDown = true;
    } else if( keyEvent.isAltKey() ) {
	this.keyHandler.altKeyDown = true;
    } else if( keyEvent.isCharacterKey("P") ) {
	this.keyHandler.pKeyDown = true;

	//window.alert( "this.keyHandler,shiftKeyDown=" + this.keyHandler.shiftKeyDown + ", this.keyHandler.controlKeyDown=" + this.keyHandler.controlKeyDown + ", this.keyHandler.altKeyDown=" + this.keyHandler.altKeyDown );
	if( this.keyHandler.altKeyDown && this.keyHandler.controlKeyDown ) {
	    //window.alert( "TODO: auto-set printing settings!");
	    loadOptimalPrintingSettings( true );  // display_tab: true
	}
    }
};

IKRS.ExtrusiongenKeyHandler.prototype.onKeyPress    = function( e ) {
    // Wrap up the key event into a class instance
    var keyEvent = new IKRS.KeyEvent( e );   
    //window.alert( "Key press: " + keyEvent.getKeyCode() );
};

IKRS.ExtrusiongenKeyHandler.prototype.onKeyUp    = function( e ) {
    // Wrap up the key event into a class instance
    var keyEvent = new IKRS.KeyEvent( e );   
    //window.alert( "Key up: " + keyEvent.getKeyCode() );
    if( keyEvent.isShiftKey() ) {
	this.keyHandler.shiftKeyDown = false;
    } else if( keyEvent.isControlKey() ) {
	this.keyHandler.controlKeyDown = true;
    } else if( keyEvent.isAltKey() ) {
	this.keyHandler.altKeyDown = true;
    } else if( keyEvent.isCharacterKey("P") ) {
	this.keyHandler.pKeyDown = false;
    }
};

