
# Path Extrusion Generator (Dildo Generator)

* author   Ikaros Kappler
* date     2013-09-11
* modified 2014-08-29
* modified 2015-01-30
* modified 2019-04-01 Restored from the archives.
* version  0.3.21



## License:
CC BY-NC-SA
Please keep the '@author' tags when sharing the code.


[Dildo-Generator.com](https://www.dildo-generator.com "Dildo-Generator.com")

![Dildo-Generator screenshot]("screenshots/Screenshot - 05162014 - 101050 PM.png" "Screenshot of the Dildo-Generator website")


If you have questions about the project just send a email to info@dildo-generator.com.



### Notes
 * Currently the gallery is disabled.
 * Storing dildos and loading from the database is disabled.

Of course you can build models, save setups to your hard drive, load setups from your hard drive and
download STL files as usual.


#### Older notes from 2015
Note that since version 0.3.4 the gallery has social media integration (using
a Two-Click plugin).

Note that since version 0.3.0 the app is capable to store dildo designs in a
databse.

Note that since version 0.2.37 the app tries to store designs in cookies. Before
no data had been saved anywhere. I switched to a new privacy policy.




### Changelog

[2015-01-30] v0.3.21
 - Added decodeURI() to the GET params handling in the main.js file.
   Even encoded URL strings can be handled now without any error 
   messages popping up.

[2014-11-24] v0.3.20
 - Finished the canvas autoreize function (the donation button still
   needed to be moved to its dynamic position).
 - Fixed the preview image issue on resized canvas sizes.


[2014-11-13] v0.3.19
 - Added function IKRS.BezierCanvasHandler.setRendererSize(int,int).
 - Added function IKRS.PreviewCanvasHandler.setRendererSize(int,int).
 - Added an auto-rescale function on document load.
 

[2014-11-12] v0.3.18
 - Added functions increaseGUISize() and decreaseGUISize() to the 
   main.js file.
 - Added two new menu items to the 'Help' menu:
   	 + Interface/Smaller (-10%)
	 + Interface/Bigger  (+10%)

[2014-11-10] v0.3.17
 - Moved BEZIER_CANVAS_WIDTH/-HEIGHT and PREVIEW_CANVAS_WIDTH/-HEIGHT 
   from the main.js file to the config.js file. They are now member
   variables in the _DILDO_CONFIG object.
 - Modified the IKRS.BezierCanvasHandler to match the new setting
   locations.
 - Added the getBezierCanvas() and getPreviewCanvas() functions to
   the main.js file.
 - Added the function getPreviewCanvas() to the main.js file.
 - Added the function getBezierCanvas() to the main.js file.
 - Added the function _resizeCanvasComponents() to the main.js file.
 - Added the function _repositionComponentsBySize() to the main.js 
   file.
 - Added the 'keepRatio' parameter to 
   IKRS.BezierCanvasHandler._drawAnonymousBackgroundImage(...).
 - Added function isDefaultCanvasSize() to the ain.js file.

[2014-10-27] v0.3.16
 - Changed the gallery upload scripts: images can now be strored inside 
   the file system (to save database memory).
 - Added the inc/config.inc.php file for server script settings.

[2014-10-08] v0.3.15
 - Fixed a bug in the form_utils.

[2014-08-29] v0.3.13
 - Fixed a bug in IKRS.BezierPath._roundToDigits(...); the  'enforceInvisibleDigits'
   param was not recognized and caused an error in the reduced list representation.
 - Fixed a bug in the IKRS.BezierPath.fromJSON(...) function; the conversion did fail
   on paths with only one curve.
 - All models from the gallery can now be loaded.
 - Activated antialiasing :)

[2014-08-28] v0.3.12
 - Added the 'digits' parameter to the function 
   IKRS.BezierPath.toReducedListRepresentation(...).
 - Added the function setBezierPathFromReducedListRepresentation(...)
   to the main.js file.
 - It is now also possible to load the bezier path from reduced list 
   representations (use the 'Load Bezier JSON ...' menu item).

[2014-08-21] v0.3.11
 - Fixed a typo in the main.js file. Object-Export works again now.

[2014-08-18] v0.3.10
 - Added a IKRS.BezierPath.toReducedListRepresentation() function.
 - Added a IKRS.BezierPath.fromReducedListRepresentation() function.
 - Added a IKRS.BezierPath._roundToDigits() function (static class member).
 - Added the display_bezier_string() function to the main.js file.
 - Added the rdbata parameter to pass reduced bezier path data to the 
   main.html file.
 - Added a 'Load' button to the gallery; if a user allowed to download
   his/her dildo model, it can now be restored in 3D directly from
   the gallery.
 - Moved the table_structure.sql file to the ./gallery/ directory.
 - Moved the store_dildo.js file to the ./gallery/ directory.
 - Added some more name presets to the publish dialog.

[2014-08-15] v0.3.9
 - Added an area reserved for donation buttons :)

[2014-08-13] v0.3.8
 - Added the show_bezier_input_dialog() to the main.js file.
 - Added a new item to the Help menu: 'Paste Bezier String ...'

[2014-08-12] v0.3.7
 - Added a key handler class: IKRS.ExtrusiongenKeyHandler.
 - Added an extended key event class: IKRS.KeyEvent.
 - Added the function loadOptimalPrintingSettings() to the main.js file.
 - Added the function _applyParamsToMainForm() to the main.js file.
 - Added the function loadOptimalPrintingSettings() to the main.js file.
 - Press [Ctrl] + [Alt] + [P] to restore the optimal 3D printing settings.

[2014-08-06] v0.3.6
 - Added the function acquireOptimalBezierView() to the main.js
 - Added the function acquireOptimalBezierView(...) to the IKRS.BezierCanvasHandler
   class.
 - Added the function translate(...) to the IKRS.BezierPath class.

[2014-08-05] v0.3.4
 - Added social media integration (Two-Click!) for Facebook, G+ and 
   Twitter to the gallery.
 - Added the function IKRS.BezierCanvasHandler.drawCustomBackgroundImage(...).
 - Uploaded bezier preview images are no longer stored with custom background
   images. Visitores stored too much pr0n. Sorry.

[2014-07-25]
 - Replacing HTML entities in the gallery now (security issue 
   javascript injection).

[2014-07-24] v0.3.0 (new features published: storing in DB and gallery)
 - Feature published: store designs in an online database
 - Feature published: view stored designs in the gallery.
 - Added _DILDO_CONFIG.AUTOLOAD_ENABLED to the config.js file.
 - Added _DILDO_CONFIG.DEFAULT_BEZIER_JSON to the config.js file.
 - Added the 'disabled_by_moderator' column to the database table.	
 - Added the 'keywords' column to the databse table.
 - Added the getBezierScreenshotData() function to the main.js file.
 - Added the 'bezier_image' column to the database table.

[2014-07-20] v0.2.39
 - Fixed a bug in the screenshot storing routine (for existing IDs).
 - Added the gallery script in ./gallery/index.php (only server version).
 - Added the date_created and date_upated fields to the database table structure.

[2014-07-16] v0.2.38
 - Added the getCurrentDildoID() function to main.js file.
 - Added the setCurrentDildoID(dildoID) function to the main.js file.
 - Added the publish_dildo.js file which handles the publishing process.
 - Added the publishDildoDesign() function to the main.js file.
 - Added _DILDO_CONFIG.PUBLISHING_URL to the config.js file.
 - Added member function setVisibility(visible) to the IKRS.MessageBox.js class.
 - Fixed a bug in IKRS.MessageBox.show(...) function: calling show(...) twice
   made the message box invisible again.
 - Added new columns to the database/table:
    + name
    + user_name
    + email_address
    + hide_email_address
    + allow_download
    + allow_edit [currently not in use]
    + preview_image (base64 string)
    + public_hash   (to hide real database IDs).
   See table_structure.sql for details.
 - Added the new storage/publishing features to the main.js and the 
   store_custom_dildo.php files.
 - Added isHexadecimal() to the IKRS.Utils.js file.

[2014-07-13] v0.2.37
 - Added the Base64 encoder/decoder class (should later replace base64-binary).
 - Added the IKRS.Utils.isNumeric function.
 - Activated the AUTOSAVE function which tries to store dildo designs in cookie!

[2014-07-04] v0.2.36
 - Added two new mesh features
   	 + shapeStyle: "circle" (default) or "oval"
	 + shapeTwist: percentage of rotations (still experimental)
 - Fixed a form issue: when de-selecting the 'split shape' options (the
   'base type' settings was still recognized which broke the mesh). 
 - Fixed the createHumanReadableTimestamp() function: added leading zeros.
 - Changed the default output file names to more expressive ones.

[2014-07-03]
 - IKRS.PathDirectedExtrudeGeometry.js: added the 'options.shapeTwist'
   param to the constructor.
 - Added the IKRS.ShapeFactory class and subclasses for circles and ovals.

[2014-07-02] v2.0.35
 - store_custom_dildo.php: changed the submit method to HTTP POST.
 - Added the setCookie() and getCookie() functions (main.js).
 - Added the saveInCookie() and loadFromCookie() functions (main.js, still testing, 
   not yet in use).
 - Added the Model->Publish menu (not yet visible).
 - Added the 'preserveDrawingBuffer' flag to the THREE.WebGLRenderer to enable
   taking screenshots.
 - New function: get3DScreenshotData() for taking screenshots (not yet in use).

[2014-07-01] v2.0.34
 - main.js: function createXMLHttpRequest() added.
 - Replaced the remote (!) save function by a less brute-force solution
   by using AJAX.
 - Added the idForm form to store remote IDs inside.
 - Added the UPDATE function for existing dildo designs (depending on passed id
   and user_id); if id is missing, a regular INSERT is made.
 
 - Note: Merchants should have a look at the new function in the 
         merchant_tools.js file. I also added the %id% placeholder
	 to the configured storage URL.

[2014-06-25]
 - IKRS.PathDirectedExtrudeGeometry: options.shapeAxisDistance added.

[2014-06-25] v0.2.33
 - Updated the FAQs: added the Presets howto.

[2014-06-19] v0.2.32
 - Added the preset menu and the presets.js config file.

[2014-06-19] v0.2.31
 - Updated JSZip to version 2.3.0, which fixed the "Constructor TextDecoder 
   requires 'new'" issue with FireFox.
 - ZIP files are now readable again.

[2014-06-19] v0.2.30
 - Fixed the DOM canvas issue (DOM element was moved by constructor).

[2014-06-19] v0.2.29
 - Made the canvas background images configurable. See the config.js file 
   near lines 52 and 59: 
   _DILDO_CONFIG.IMAGES.BEZIER_BACKGROUND and
   _DILDO_CONFIG.IMAGES.PREVIEW_BACKGROUND

[2014-06-17] v0.2.27
 - Since this version there is a code snippet example explaining how to
   to store dildo design on a server (in a database). This is just an example
   and not active. The site dildo-generator.com does _not_ store any design
   data.

[2014-05-16] v0.2.20
 - Click area bug fixed (zoom issue)

[2013-10-30]
 - Added background images to the 2D- and 3D-canvas.

[2013-10-29]
 - Added the VectorFactory to the preview handler.
 - Added a new function that arranges the wto splits (if split)
   on the horizontal plane.

[2013-10-25]
 - Moved all secondary controls the the new menu bar.

[2013-10-22]
 - Added a basic menu bar library (moo-tools_dropdown-menu).

[2013-10-15]
 - The mm-measurements are now applied to the STL models.

[2013-10-04]
 - Added process bar (display in the CSS message box).

[2013-10-02]
 - Added CSS message box for errors and warnings.

[2013-09-24]
 - Added ruler/measurements (in mm).
 - Shape scaling by moving bounding box nodes implemented.

[2013-09-18]
 - Bug fixed: the second last bezier point can be deleted now.

[2013-09-16]
 - The second last bezier curve was not deletable. This is fixed now.

[2013-09-12] 
   Implemented a better bezier curve splitting.

[2013-09-11] 
 - Zip file import implemented.





TODO
----
[2014-10-27]
 - Check if $_DILDO_SETTINGS["gallery_settings"]["DILDO_UPDATE_ALLOWED"] = TRUE
   works (in the inc/config.inc.php file).

[2013-10-15]
 - The 'Merge Meshes' STL option should be included into the settings 
   import/export.

[2013-09-24]
 - The bezier scaling by bounding-box works so far but there is a
   boundary required to avoid the path to be scale to width=0 or	
   height=0.
 - [DONE 2013-10-15]
   The mm-measurements are not yet applied to the STL models.
 - The bezier-Settings file should also store scaling and
   draw offset.
   When loading a file these settings should be restored so the bezier
   path is at the same position.

[2013-09-16]
 - Add an enhanced polygon triangulation algorithm for the case
   the mesh is split; the cut is not yet properly filled. Vertically
   non-convex bezier curves cause errors in the mesh.
 - [DONE 2013-09-18]
   Bug: the second last bezier point cannot be deleted.

[2013-09-13]
 - Fix Safari incompatibility.
 - [DONE 2013-10-02]
   Add CSS message box for errors and warnings.
 - [DONE 2013-10-04]
   Add process bar.
 - Add a compatibility check with error message.

[2013-09-12]
 - Add dummy console for older browsers

[2013-09-11]
 - [DONE 2013-09-11] 
   Zip file import
 - [DONE 2013-09-24]
   Add ruler/measurements
 - [DONE 2013-09-18]
   Implement split mesh
 - Implement second inner perpendicular hull (for wax)
 - [DONE 2013-09-12] 
   Implement a better bezier curve splitting
 - Add an undo-function to the bezier editor
 - [DONE 2013-09-24]
   Shape scaling by moving bounding box nodes








Used libraries
--------------

 - three.js
 - jszip.js (v1.0.1-23)
 - jszip-deflate.js
 - jszip-load.js
 - base64-binary.js
 - FileSaver.js
 - Blob.js
 - Moo-Tools (dropdown-menu, core 1.4.5)





Thanks to
---------
 
 [three.js]
   mrdoob / http://mrdoob.com/ 
   Larry Battle / http://bateru.com/news

 [baseg64-binary.js]
   Daniel Guerrero

 [jszip.js]
   Stuart Knightley <stuart [at] stuartk.com>

 [FileSaver.js]
  Eli Grey

 [STLBuilder inspirations]
   Paul Kaplan
 
 [Moo-Tools dropdown menu]
   mootools / https://github.com/mootools  
   <unknown author>
 
 [mono-dc-monochrome-social-icons]
   Natko Hasiæ & designchair.com

 [WebGL screenshot howto]
   Dinesh Saravanan

 [Base64 encoder/decoder]
   <unknown author>

 [Facebook / G+ Two-Click]
   <unknwn author> / http://turkeyland.net/projects/two-click/


Special thanks to the YOUin3D team, particulary to
  Jan, who supports this with all his passion.
  Sami, who manages the financial issues of this assembly.
  Frank, who set up Piwik for me (to avoid google).
  Angelo, who processes the shipping.
  Frank and Sam, who maintain the 3D printers.
  Tx-Oh, who maintains the server and keeps the network running.


Thanks to Atze, Clemens, Anne, Tobi, Gideon, Rin,
Peggy, Viki, the cool older Lady passing by who 
asked for a beer, you all make this a good time.
