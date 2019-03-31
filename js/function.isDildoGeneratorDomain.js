/**
 * Yep, just a small function to check whether the app is running online on the 
 * 'official' domain or in any other location (it's free, so it may run anywhere).
 *
 *
 * @author  Ikaros Kappler
 * @date    2014-07-13
 * @version 1.0.0
 **/

function isDildoGeneratorDomain() {
    return ( window.location.host.toLowerCase().indexOf("dildo-generator.com") != -1 ||
             window.location.host.toLowerCase().indexOf("dildogenerator.com") != -1 ||
	     window.location.host.toLowerCase().indexOf("wenn-der-dödel-drei-mal-rödelt-dann.com") != -1
           );    
}