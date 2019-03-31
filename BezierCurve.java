package polygon;


//import polygon.Point3D;
import java.awt.*;

public class BezierCurve {

    public static final int START_POINT = 0x01;
    public static final int END_POINT = 0x02;
    public static final int START_HELP_POINT = 0x04;
    public static final int END_HELP_POINT = 0x08;


    // p0: start of the curve
    // p3: end of the curve

    // p1: help-point of p0
    // p2: help-point of p3
   private Point3D 
       p0, 
       p1, 
       p2, 
       p3;
   private int 
       CurveIntervalls = 20,
       width, 
       height;
    
   private Color 
       CurveColor = Color.black, 
       HelplineColor = Color.green;

    private int visiblePointSize = 5;
    
    
    public BezierCurve(int width, int height) {
	this( new Point3D( width/8,   5*height/8, 0),   // p0
	      new Point3D( 7*width/8, 5*height/8, 0),   // p3
	      new Point3D( 3*width/8, height/4,   0),   // p1
	      new Point3D( 5*width/8, height/4,   0),   // p2
	      width,
	      height
	      );
    }
    
    public BezierCurve( Point3D startPoint,
			Point3D endPoint,
			Point3D startHelpPoint,
			Point3D endHelpPoint,
			int width,
			int height ) {
	this.width = width;
	this.height = height;

	this.p0 = startPoint;
	this.p3 = endPoint;
	this.p1 = startHelpPoint;
	this.p2 = endHelpPoint;
   }

    public BezierCurve( Rectangle bounds ) {
	//this.width = width;
	//this.height = height;

	this.p0 = new Point3D( bounds.getX(),
			       bounds.getY() + bounds.getHeight(),
			       0.0 );
	this.p3 = new Point3D( bounds.getX() + bounds.getWidth(),
			       bounds.getY() + bounds.getHeight(),
			       0.0 );
	this.p1 = new Point3D( p0.getX() + bounds.getWidth()*0.25,
			       p0.getY() - bounds.getHeight(),
			       0.0 );
	this.p2 = new Point3D( p3.getX() - bounds.getWidth()*0.25,
			       p3.getY() - bounds.getHeight(),
			       0.0 );
   }

    public BezierCurve( Point3D startPoint,
			Point3D endPoint,
			Point3D startHelpPoint,
			Point3D endHelpPoint ) {

	this( startPoint,
	      endPoint,
	      startHelpPoint,
	      endHelpPoint,
	      (int)(endPoint.getX()-startPoint.getX()),
	      (int)(endPoint.getY()-startPoint.getY())
	      );

    }

    public Point3D getStartPoint() {
	return this.p0;
    }

    public Point3D getEndPoint() {
	return this.p3;
    }

    public Point3D getStartHelpPoint() {
	return this.p1;
    }
    
    public Point3D getEndHelpPoint() {
	return this.p2;
    }

    public void setVisiblePointSize( int size ) {
	this.visiblePointSize = size;
    }


    private void drawRelativePoint( Graphics g,
				    Point3D p,
				    int size,
				    Point3D origin,
				    Point3D scaling ) {
	g.fillRect( (int)(p.getX()*scaling.getX()-size/2.0 + origin.getX()),
		    (int)(p.getY()*scaling.getY()-size/2.0 + origin.getY()),
		    size, size );
    }

    private void drawRelativeLine( Graphics g,
				   Point3D a,
				   Point3D b,
				   Point3D origin,
				   Point3D scaling ) {
	g.drawLine( (int)(a.getX()*scaling.getX() + origin.getX()), 
		    (int)(a.getY()*scaling.getY() + origin.getY()),
		    (int)(b.getX()*scaling.getX() + origin.getX()), 
		    (int)(b.getY()*scaling.getY() + origin.getY())
		    );
    }

    public void update(Graphics g, Point3D origin, Point3D scaling ) {
       double 
	   x1 = p0.getX(), // p0.getXMiddlePosition(),
	   y1 = p0.getY(), // p0.getYMiddlePosition(),
	   x2, y2,
	   CurveStep = 1.0/(double)CurveIntervalls,	   
	   u= CurveStep; 
       //u=(CurveStep * (scaling.getX()+scaling.getY())/2.0); // use average scaling
      g.setColor(HelplineColor);
      // draw the helpline between the start and the end of the Curve
      // WHY?
      //drawRelativeLine( g, p0, p3, origin );
      


      // draw the helplines between the startpoint and the first helppoint and 
      // between the endpoint an the secound helppoint
      drawRelativeLine( g, p0, p1, origin, scaling );
      drawRelativeLine( g, p3, p2, origin, scaling );

      // Draw the points themselves
      drawRelativePoint( g, p0, this.visiblePointSize, origin, scaling );
      drawRelativePoint( g, p1, this.visiblePointSize, origin, scaling );
      drawRelativePoint( g, p2, this.visiblePointSize, origin, scaling );
      drawRelativePoint( g, p3, this.visiblePointSize, origin, scaling );
      

      g.setColor(CurveColor);
      // draw the Bezier Curve in CurveIntervall Steps
      for (int i=0; i<CurveIntervalls; i++) {
	  x2 = p0.getX()*Math.pow(1.0-u,3)+p1.getX()*3*u*Math.pow(1.0-u,2)
	      + p2.getX()*3*Math.pow(u,2)*(1.0-u)+p3.getX()*Math.pow(u,3);

	  y2 = p0.getY()*Math.pow(1.0-u,3)+p1.getY()*3*u*Math.pow(1.0-u,2)
	    +p2.getY()*3*Math.pow(u,2)*(1.0-u)+p3.getY()*Math.pow(u,3);
	  
	  //g.drawLine((int)x1, (int)y1, (int)x2, (int)y2);
	  drawRelativeLine( g, 
			    new Point3D(x1,y1,0), 
			    new Point3D(x2,y2,0), 
			    origin, 
			    scaling );
         x1=x2;
         y1=y2;
         u+=CurveStep;
      }
      //paintComponents(g);
   }

   public void paint(Graphics g) {   
       paint( g, new Point3D(), new Point3D(1.0,1.0,0.0) );
   }

    public void paint( Graphics g, Point3D origin, Point3D scaling ) {
	update(g, origin, scaling);
   }    
}
