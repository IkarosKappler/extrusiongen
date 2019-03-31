
/**
 * @author Ikaros Kappler
 * @date 2013-08-22
 * @version 1.0.0
 **/


function saveTextFile( stringData, filename, mimeType ) {

    if( !filename )
	filename = "stringData.txt";
    if( !mimeType )
	mimeType = "text/plain";
    
    var blob = new Blob([stringData], {type: mimeType});
    saveAs(blob, filename);
    
}