<?php
/**
 * This script can be used to store dildo settings on a remote or local databse server.
 *
 * It is NOT IN USE by the default settings, but an example for how to do it.
 *
 *
 * @author   Ikaros Kappler
 * @date     2014-06-11
 * @modified 2014-07-01 Ikaros Kappler (added the UPDATE function for remote storage, if $id is passed).
 * @modified 2014-07-02 Ikaros Kappler (changed the submit method to HTTP POST).
 * @modified 2014-07-13 Ikaros Kappler (added IP check).
 * @modified 2014-07-16 Ikaros Kappler (added additional publishing data: user_name, email_address, ...).
 * @modified 2014-07-24 Ikaros Kappler (updating designs is now opt-out by $_DILDO_UPDATE_ALLOWED for security reasons).
 * @version  1.0.2
 **/

header( "Content-Type: text/plain; charset=utf-8" );

$your_mail_address     = "published@dildo-generator.com";
$_DILDO_UPDATE_ALLOWED = FALSE;



// Fetch the params from the GET or the POST request.
// (Better send dildo data via HTTP POST?)
if( $_SERVER['REQUEST_METHOD'] == "POST" ) {
  $bend                = $_POST["bend"];
  $id                  = $_POST["id"];
  $public_hash         = $_POST["public_hash"];
  $bezier_path         = $_POST["bezier_path"];
  $dildo_name          = $_POST["dildo_name"];
  $user_name           = $_POST["user_name"];
  $email_address       = $_POST["email_address"];
  $hide_email_address  = $_POST["hide_email_address"];
  $allow_download      = $_POST["allow_download"];
  $allow_edit          = $_POST["allow_edit"];
  $keywords            = $_POST["keywords"];
  $image_data          = $_POST["image_data"];
  $bezier_image_data   = $_POST["bezier_image_data"];
  $originb64           = $_POST["originb64"];

} else {
  header( "HTTP/1.1 405 Method Not Allowed", TRUE ); 
  die( "The requested method '" . $_SERVER['REQUEST_METHOD'] . "' is not allowed here.\n" );

}



$originb64_clean = str_replace( array("-", "_"), //  "\"",   "'"), 
				array("+", "/"), // "\\\"", "\\'"), 
				$originb64 
				);
$origin_decoded  = base64_decode( $originb64_clean, 
				  false             // Don't throw error
				  );

if( $_SERVER["SERVER_ADDR"] != "127.0.0.1" && 
    base64_decode($originb64_clean) != "www.dildo-generator.com" &&
    base64_decode($originb64_clean) != "dildo-generator.com"
    ) {

  //die( "1 " . base64_decode($originb64_clean) );
  header( "HTTP/1.1 401 Unauthorized", TRUE ); 
  die( "You are not authorized.\n" );

}



if( $id && !is_numeric($id) ) {
  header( "HTTP/1.1 400 Bad Request", TRUE ); 
  die( "The passed ID '" . $id . "' is not numeric.\n" );
}


// Get user-ID from the current apache session
session_start();
$user_id     = $_SESSION["user_id"]; 



// Establish a database connection
require_once( "inc/function.mcon.inc.php" );
$mcon = mcon();

if( !$mcon ) {
  header( "HTTP/1.1 500 No Database Connection", TRUE ); 
  mail( $your_mail_address, "No database connection!", mysql_error($mcon) );
  die();
}



// Restore original base64 data (was modified for HTTP POST transfer)
$image_data_clean = str_replace( array("-", "_"), 
				 array("+", "/"), 
				 $image_data 
				 );
$bezier_image_data_clean = str_replace( array("-", "_"), 
					array("+", "/"), 
					$bezier_image_data 
					);


// INSERT or UPDATE?
$query    = "";
if( !$id || $id == -1 || !$public_hash ) {

  // Make a public hash
  $salt = rand(0, 65535);
  $time = time();
  $raw  = $bend . "#" . $salt . "$" . $time . "*" . $name . "/" . $user_name . "\"" . $user_id . "-" . $origin_b64;
  $public_hash = md5($raw);
  
  

  $query =
    "INSERT INTO " . addslashes($db_name) . ".custom_dildos " .
    "( bend, date_created, date_updated, bezier_path, user_id, name, user_name, email_address, hide_email_address, allow_download, allow_edit, preview_image, bezier_image, public_hash, disabled_by_moderator, keywords ) " .
    "VALUES ( " .
    "'" . addslashes($bend) . "', " .
    "'" . addslashes(time()) . "', " .
    "'" . addslashes(time()) . "', " .
    "'" . addslashes($bezier_path) . "', " .
    "'" . addslashes($user_id) . "', ".
    "'" . addslashes($dildo_name) . "', " .
    "'" . addslashes($user_name) . "', " .
    "'" . addslashes($email_address) . "', " .
    "'" . ($hide_email_address ? 'Y' : 'N') . "', " .
    "'" . ($allow_download ? 'Y' : 'N') . "', " .
    "'" . ($allow_edit ? 'Y' : 'N') . "', " .
    "'" . addslashes($image_data_clean) . "', " .
    "'" . addslashes($bezier_image_data_clean) . "', " .
    "'" . addslashes($public_hash) . "', " .
    "'N', " .  // disabled_by_moderator
    "'" . addslashes($keywords) . "' " .
    ");";

} else {
  if( !$_DILDO_UPDATE_ALLOWED ) {
    header( "HTTP/1.1 500 Update not allowed.", TRUE ); 
    mysql_close( $mcon );
    die();
  } else {
    $query = 
      "UPDATE " . addslashes($db_name) . ".custom_dildos SET " .
      "bend                  = '" . addslashes($bend) . "', " .
      "date_updated          = '" . addslashes(time()) . "', " .
      "bezier_path           = '" . addslashes($bezier_path) . "', " .
      //"user_id               = '" . addslashes($user_id) . "', " .
      "name                  = '" . addslashes($dildo_name) . "', " .
      "user_name             = '" . addslashes($user_name) . "', " .
      "email_address         = '" . addslashes($email_address) . "', " .
      "hide_email_address    = '" . ($hide_email_address ? 'Y' : 'N') . "', " .
      "allow_download        = '" . ($allow_download ? 'Y' : 'N') . "', " .
      "allow_edit            = '" . ($allow_edit ? 'Y' : 'N') . "', " .
      "keywords              = '" . addslashes($keywords) . "', " .
      "preview_image         = '" . addslashes($image_data_clean) . "', " .
      "bezier_image          = '" . addslashes($bezier_image_data_clean) . "' " .
      //"disabled_by_mederator = 'N' " .
      "WHERE id              = '" . addslashes($id) . "' ".
      "AND   public_hash     = '" . addslashes($public_hash) . "' " .
      "AND   user_id         = '" . addslashes($user_id) . "' " .
      "LIMIT 1;";
  }

}
//echo "Executing query: " . $query . "\n";


$message = 
  "Server-IP:      " . $_SERVER["SERVER_ADDR"] . ",\n" .
  "Server-Name:    " . $_SERVER["SERVER_NAME"] . ",\n" .
  "Passed server name (base64): " . $originb64 . ",\n" .
  "Passed server name (base64_clean): " . $originb64_clean . ",\n" .
  "Passed server name (decoded): " . $origin_decoded . ",\n" .
  "Script:         " . $_SERVER["PHP_SELF"] . ",\n" .
  
  "\n" .
  "Request method: " . $_SERVER["REQUEST_METHOD"] . ",\n" .
  "HTTP referer:   " . $_SERVER["HTTP_REFERER"] . ",\n" .
  "User agent:     " . $_SERVER["HTTP_USER_AGENT"] . ",\n" .
  "Remote address: " . $_SERVER["REMOTE_ADDR"] . ",\n" .
  "Remote host:    " . $_SERVER["REMOTE_HOST"] . ",\n" .
  //"Query:          " . $query . "\n" .  

  "\n\n";
  
if( !mysql_query($query,$mcon) ) {

  header( "HTTP/1.1 500 x " . mysql_error($mcon), TRUE ); 
  $errmsg = "Error: " . substr(mysql_error($mcon),0,20) . "\n";

  echo $errmsg;
  
  mail( $your_mail_address, 
	"Failed to store dildo!", 
	"Failed to store dildo\n" .
	   $message . $errmsg 
	);
	

} else if( $id && $id != -1 ) {

  // This was an UPDATE. 
  mail( $your_mail_address, 
	"Dildo (id=" . $id . ") was updated!", 
	$message . "Dildo was updated. ID=" . $id . ", hash=" . $public_hash . "\n" 
	);
  

} else {
  
  // This was an INSERT.
  $id  = mysql_insert_id($mcon);
  mail( $your_mail_address, 
	"Dildo (id=" . $id . ") was stored!", 
	$message . "Dildo was stored. ID=" . $id . ", hash=" . $public_hash . "\n" 
	);

}


//echo $id . " " . $image_data; // $public_hash;
echo $id . " " . $public_hash;


// Don't forget to close the connection!
mysql_close( $mcon );


?>