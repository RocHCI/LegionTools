<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

include('_db.php');
$isActive = 1;

try {
    $dbh = getDatabaseHandle();
} catch( PDOException $e ) {
    echo $e->getMessage();
}


if( $dbh ) {

    $worker = $_REQUEST['workerId'];
    $projectName = $_REQUEST['task']; // TODO: should project name be task or should it be an extra parameter? 

    $stmt = $dbh->prepare("SELECT count(*) FROM `tutorialLog` WHERE `workerId` = :id and `projectName` = :pName LIMIT 1");
    $stmt->execute(array(':id' => $worker, ':pName' => $projectName));
    $number_of_rows = $stmt->fetchColumn();
    // echo $number_of_rows;

    //if there is already an entry for this worker is whois_live, return true
    if ( $number_of_rows > 0 ) {
        echo 1;
    }
    //if the worker is not currently active, return false
    else { 
        echo 0;
    }


}

//echo isActive();

?>
