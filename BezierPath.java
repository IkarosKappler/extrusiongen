package polygon;

/**
 * A BezierPath is a set of BezierCurves connected with each other (non circular).
 *
 * @author Henning Diesenberg
 * @date 2011-07-08
 * @version 1.0.0
 *
 **/

import java.awt.Graphics;
import javax.swing.event.ChangeListener;
import javax.swing.event.ChangeEvent;
import java.util.ArrayList;
import java.util.Iterator;



public class BezierPath {


    /**
     * Inv: curveList[i-1].getEndPoint() == curveList[i].getStartPoint()
     *      AND
     *      curveList[i].getEndPoint() == curveList[i+1].getStartPoint()
     **/
    private ArrayList<BezierCurve> curveList;


    /**
     * This list stores the installed listener for this path.
     **/
    private ArrayList<ChangeListener> changeListeners;


    public BezierPath( BezierCurve initialCurve ) {

	super();

	this.curveList = new ArrayList<BezierCurve>(8);
	this.curveList.add( initialCurve );


	this.changeListeners = new ArrayList<ChangeListener>(1);

    }

    public boolean addChangeListener( ChangeListener l ) 
	throws NullPointerException {
	
	if( l == null )
	    throw new NullPointerException( "Cannot add null listeners." );


	for( int i = 0; i < this.changeListeners.size(); i++ ) {

	    if( this.changeListeners.get(i) == l )
		return false; // already exists

	}
	
	this.changeListeners.add( l );
	return true; // inserted
    }

    public boolean removeChangeListener( ChangeListener l ) {

	if( l == null )
	    throw new NullPointerException( "Cannot remove null listeners." );


	for( int i = 0; i < this.changeListeners.size(); i++ ) {

	    if( this.changeListeners.get(i) == l ) {

		this.changeListeners.remove( i );
		return true; // removed

	    }
	}
	
	return false; // not found
    }

    protected void fireStateChanged() {
	
	ChangeEvent e = new ChangeEvent( this );
	for( int i = 0; i < this.changeListeners.size(); i++ ) {

	    this.changeListeners.get(i).stateChanged( e );

	}
    }

    public void splitCurveAtIndex( int index ) 
	throws IndexOutOfBoundsException {
	
	if( index >= this.curveList.size() || index < 0 )
	    throw new IndexOutOfBoundsException( "Index "+index+" is out of bounds." );

	BezierCurve curve = this.curveList.get(index);
	
	// Create a new Point in the middle
	Point3D 
	    middlePoint = new Point3D( curve.getEndPoint().getX() + (curve.getStartPoint().getX() - curve.getEndPoint().getX())/2.0,
				       curve.getEndPoint().getY() + (curve.getStartPoint().getY() - curve.getEndPoint().getY())/2.0,
				       0.0
				       );
	Point3D 
	    middleHelpPoint_A = new Point3D( middlePoint.getX()-25.0,
					     middlePoint.getY(),
					     0.0 ),
	    middleHelpPoint_B = new Point3D( middlePoint.getX()+25.0,
					     middlePoint.getY(),
					     0.0 );
	BezierCurve 
	    curve_A = new BezierCurve( curve.getStartPoint(), //new Point3D( curve.getStartPoint() ),
				       middlePoint,
				       new Point3D( curve.getStartHelpPoint() ),
				       middleHelpPoint_A ),
	    curve_B = new BezierCurve( middlePoint,
				       curve.getEndPoint(),
				       middleHelpPoint_B,
				       new Point3D( curve.getEndHelpPoint() ) 
				       );

	// Replace old curve in the path by the two new curves
	this.curveList.set( index, curve_A );
	this.curveList.add( index+1, curve_B );

	fireStateChanged();
    }

    /**
     * This method moves any custom point from the bezier path.
     * The point can be a bezier start- or end-point, optionally
     * with or without none, one or both help points, or just
     * a single help point.
     *
     * @param int curveIndex the index of the curve.
     * @param int pointID the pointID to be moved (the dragged point
     *            itself).
     * @param Point3D amount the amount of the movement 
     *                (x any y are in use only).
     * @param int helpPointMask a bit field indicating the points to
     *            be moved with the dragged point (if exist).
     * @param boolean fireChangeEvent if set to true the method
     *                will fire a change event after the changes 
     *                were applied.
     **/
    public void moveCustomPoint( int curveIndex,
				 int pointID,
				 Point3D amount,
				 int helpPointMask,
				 boolean fireChangeEvent
				 ) 
	throws IndexOutOfBoundsException {

	if( curveIndex < 0 || curveIndex >= this.curveList.size() )
	    throw new IndexOutOfBoundsException( "Curve index "+curveIndex+" is out of bounds." );

	
	BezierCurve 
	    curve = this.curveList.get(curveIndex);

	if( pointID == BezierCurve.START_POINT ) {

	    // Move curve point (start)
	    curve.getStartPoint().translate( amount );

	    // Move help points?
	    if( (helpPointMask & BezierCurve.START_HELP_POINT) != 0)
		curve.getStartHelpPoint().translate( amount );
	    
	    if( (curveIndex-1 >= 0) && (helpPointMask & BezierCurve.END_HELP_POINT) != 0 )
	    	this.curveList.get(curveIndex-1).getEndHelpPoint().translate( amount );
	    

	} else if( pointID == BezierCurve.END_POINT ) {

	    curve.getEndPoint().translate( amount );

	    // Move help points?
	    if( (helpPointMask & BezierCurve.END_HELP_POINT) != 0 )
		curve.getEndHelpPoint().translate( amount );
	    
	    if( (curveIndex+1 < this.curveList.size()) && (helpPointMask & BezierCurve.START_HELP_POINT) != 0 )
	    	this.curveList.get(curveIndex+1).getStartHelpPoint().translate( amount );
	    
	} else {

	    // Then it must be a help point
	    moveHelpPoint( curveIndex,
			   pointID,
			   amount,
			   helpPointMask,
			   false // do not fire event
			   );
	    
	}

	if( fireChangeEvent )
	    fireStateChanged();
	

    }

    /**
     * This method is a sub-function of moveCustomPoint an only moves
     * help points.
     *
     * @param int curveIndex the index of the curve.
     * @param int helpPointID the pointID to be moved (the dragged point
     *            itself); MUST be a help point.
     * @param Point3D amount the amount of the movement 
     *                (x any y are in use only).
     * @param int helpPointMask a bit field indicating the point to
     *            be moved.
     * @param boolean fireChangeEvent if set to true the method
     *                will fire a change event after the changes 
     *                were applied.
     **/
    private void moveHelpPoint( int curveIndex,
				int helpPointID,
				Point3D amount,
				int helpPointMask,
				boolean fireChangeEvent ) 
	throws IndexOutOfBoundsException {
	
	if( curveIndex < 0 || curveIndex >= this.curveList.size() )
	    throw new IndexOutOfBoundsException( "Curve index "+curveIndex+" is out of bounds." );
	
	
	BezierCurve 
	    curve = this.curveList.get(curveIndex);
	

	if( helpPointID == BezierCurve.START_HELP_POINT ) {

	    curve.getStartHelpPoint().translate( amount );
	 		    
	    // Also update corresponding help point by angle (if exists)?
	    if( (helpPointMask & BezierCurve.END_HELP_POINT) != 0 && curveIndex-1 >= 0 ) {

		BezierCurve predecessor = this.curveList.get( curveIndex-1 );
		

		autoAlignNeighbourHelpPoint( curve.getStartPoint(),
					     curve.getStartHelpPoint(),
					     predecessor.getEndHelpPoint()
					     );
				

	    }

	} else if( helpPointID == BezierCurve.END_HELP_POINT ) {

	    curve.getEndHelpPoint().translate( amount );

	    // Also update corresponding help point by angle (if exists)?
	    if( (helpPointMask & BezierCurve.START_HELP_POINT) != 0 && curveIndex+1 < this.curveList.size() ) {

		BezierCurve successor = this.curveList.get( curveIndex+1 );
		
	    
		autoAlignNeighbourHelpPoint( curve.getEndPoint(),
					     curve.getEndHelpPoint(),
					     successor.getStartHelpPoint()
					     );  
	    }
	    
	} else {

	    System.out.println( "["+getClass().getName()+".moveHelpPoint(...)] Warning: helpPointID '"+helpPointID+"' is no help point!" );

	}

	if( fireChangeEvent )
	    fireStateChanged();
    }

    private void autoAlignNeighbourHelpPoint( Point3D curvePoint,
					      Point3D curveHelpPoint,
					      Point3D neighbourHelpPoint
					      ) {
	Point3D
	    oldCurveHelpLength = 
	    new Point3D( curvePoint.getX() - curveHelpPoint.getX(),
			 curvePoint.getY() - curveHelpPoint.getY(),
			 0.0 );
	Point3D
	    oldPredecessorHelpLength = 
	    new Point3D( curvePoint.getX() - neighbourHelpPoint.getX(),
			 curvePoint.getY() - neighbourHelpPoint.getY(),
			 0.0 );
	
	
	double 
	    curveHelpLength = 
	    Math.sqrt( Math.pow( oldCurveHelpLength.getX(), 
					 2.0 ) 
			       +
			       Math.pow( oldCurveHelpLength.getY(), 
					 2.0 ) 
			       );

		double 
		    predecessorHelpLength = 
		    Math.sqrt( Math.pow( oldPredecessorHelpLength.getX(),
					 2.0 ) 
			       +
			       Math.pow( oldPredecessorHelpLength.getY(), 
					 2.0 ) 
			       );
					       
			       
		// First set neighbour handle to inverted value of dragged handle
		neighbourHelpPoint.setLocation( curvePoint.getX() - 
						(curveHelpPoint.getX()-curvePoint.getX()),
						curvePoint.getY() - 
						(curveHelpPoint.getY()-curvePoint.getY()),
						0 // keep old Z?
							   );
		// Now re-scale to old length ;)
		neighbourHelpPoint.scaleX( predecessorHelpLength/curveHelpLength,
					   curvePoint.getX() // scale center
					   );
		neighbourHelpPoint.scaleY(  predecessorHelpLength/curveHelpLength,
					    curvePoint.getY() // scale center
					    );

    }

    /**
     * Get the number of bezier curves in this path.
     * There is allways at least one curve.
     **/
    public int getSize() {
	return this.curveList.size();
    }

    /**
     * Get the curve at given index.
     * Curves are addressed linear from 0 to getSize()-1.
     **/
    public BezierCurve getCurveAt( int index ) {
	return this.curveList.get(index);
    }

    public int getAbsolutePointIndex( int curveIndex,
				      int pointID ) {

	if( pointID == BezierCurve.START_POINT )
	    return curveIndex*4; //+0
	else if( pointID == BezierCurve.END_POINT )
	    return curveIndex*4 + 1;
	else if( pointID == BezierCurve.START_HELP_POINT )
	    return curveIndex*4 + 2;
	else if( pointID == BezierCurve.END_HELP_POINT )
	    return curveIndex*4 + 3;
	else
	    throw new IllegalArgumentException( "Illegal pointID ("+pointID+")." );

    }

    public Point3D getPointByAbsoluteIndex( int absoluteIndex ) {
	
	int curveIndex = this.absolutePointIndex2CurveIndex( absoluteIndex );
	int pointID = this.absolutePointIndex2PointID( absoluteIndex );

	if( pointID == BezierCurve.START_POINT ) 
	    return this.curveList.get(curveIndex).getStartPoint();
	else if( pointID == BezierCurve.END_POINT ) 
	    return this.curveList.get(curveIndex).getEndPoint();
	else if( pointID == BezierCurve.START_HELP_POINT ) 
	    return this.curveList.get(curveIndex).getStartHelpPoint();
	else //if( pointID == BezierCurve.END_HELP_POINT ) 
	    return this.curveList.get(curveIndex).getEndHelpPoint();
    }

    public int absolutePointIndex2CurveIndex( int absoluteIndex ) {
	return absoluteIndex/4;
    }

    public int absolutePointIndex2PointID( int absoluteIndex ) {
	int tmp = absoluteIndex%4;
	if( tmp == 0 )
	    return BezierCurve.START_POINT;
	else if( tmp == 1 )
	    return BezierCurve.END_POINT;
	else if( tmp == 2 )
	    return BezierCurve.START_HELP_POINT;
	else // if( tmp == 3 )
	    return BezierCurve.END_HELP_POINT;
    }

    public void paint( Graphics g ) {

	this.paint( g, new Point3D(), new Point3D(1.0, 1.0, 0.0) );

    }

    public void paint( Graphics g, Point3D origin, Point3D scaling ) {

	Iterator<BezierCurve> iter = curveList.iterator();
	while( iter.hasNext() ) {

	    iter.next().paint(g, origin, scaling);

	}

    }

    /**
     * This iterates through all bezier curves and
     * set the given point size (for drawing).
     **/
    public void setVisiblePointSize( int size ) {

	Iterator<BezierCurve> iter = curveList.iterator();
	while( iter.hasNext() ) {

	    iter.next().setVisiblePointSize( size );

	}

    }


    private static double calculateXAngle( Point3D center, Point3D point ) {
	return calculateAngle( point.getZ()-center.getZ(), point.getY()-center.getY() );
    }
    
    private static double calculateYAngle( Point3D center, Point3D point ) {
	return calculateAngle( point.getZ()-center.getZ(), point.getX()-center.getX());
    }
    
    private static double calculateZAngle( Point3D center, Point3D point ) {
	return calculateAngle( point.getX()-center.getX(), point.getY()-center.getY());
    }
    
    private static double calculateAngle( double distH, double distV ) {
	//System.out.println("distH="+distH+", distV="+distV);
	return Math.atan2(distV,distH);
    }
    
    

}
