/**
 * @author Ikaros Kappler
 * @date 2013-10-06
 * @version 1.0.0
 **/

IKRS.ProcessListener = function( startCallback,
				 stepCallback,
				 terminationCallback,
				 stepIntervalLength 
			       ) {

    IKRS.Object.call( this );

    if( typeof stepInterValLength == "undefined" )
	stepInterValLength = 75;

    this.totalStepCount      = 0;
    this.currentStep         = 0;
    this.stepIntervalLength  = stepIntervalLength;
    
    this.startCallback       = startCallback;
    this.stepCallback        = stepCallback;
    this.terminationCallback = terminationCallback;

};


IKRS.ProcessListener.prototype = new IKRS.Object();
IKRS.ProcessListener.prototype.constructor = IKRS.ProcessListener;

IKRS.ProcessListener.prototype.getCurrentStep = function() {
    return this.currentStep;
}

/**
 * Get the total step count (the number of processing steps which
 * are required to terminate the whole process).
 **/
IKRS.ProcessListener.prototype.getTotalStepCount = function() {
    return this.totalStepCount;
}

/**
 * Set the total step count (the number of processing steps which
 * are required to terminate the whole process).
 **/
IKRS.ProcessListener.prototype.setTotalStepCount = function( steps ) {
    this.totalStepCount = steps;
}

IKRS.ProcessListener.prototype.getStepIntervalLength = function() {
    return this.stepIntervalLength;
}

IKRS.ProcessListener.prototype.reportStart = function( totalStepCount ) {

    this.currentStp = 0;
    this.setTotalStepCount( totalStepCount );    
    this.startCallback( 0, totalStepCount );
    
}

IKRS.ProcessListener.prototype.reportCurrentStep = function( currentStep ) {
    //window.alert( "Current step: " + currentStep );
    this.currentStep = currentStep;
    this.stepCallback( this.getCurrentStep(),
		       this.getTotalStepCount()
		     );
}

IKRS.ProcessListener.prototype.reportTemination = function() {
    this.terminationCallback( this.getTotalStepCount(),
			      this.getTotalStepCount()
			    );
}