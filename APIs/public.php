<?php
	include "../functions/functions.php";
	include "connection.php";
	
	/*	Set the response	*/
    $response = array();
	
	/*	Prepare the POST object	*/
	$POST = json_decode(file_get_contents('php://input'));
	
	/*	Get http headers	*/
	$headers = getallheaders();
	
	/*	Get the tournament Modes	*/
	if(isset($_GET['action'])){
		
		switch($_GET['action']){
			case "getLocations":
				$sql = "SELECT * FROM locations";
				$resul = mysqli_query($conexion, $sql);
				if(!$resul){
					$error = mysqli_error($conexion);
					$response['error'][] = $error;
					echo json_encode($response);
					exit();
				}
				$locations = array();
				while ($fila = mysqli_fetch_array($resul)){
					$recruitings[] = limpiar_array($fila);
				}
				$response['locations'] = $locations;
				
				break;;
			
			case "getRecruitings":
				$sql = "SELECT * FROM recruitings";
				$resul = mysqli_query($conexion, $sql);
				if(!$resul){
					$error = mysqli_error($conexion);
					$response['error'][] = $error;
					echo json_encode($response);
					exit();
				}
				$recruitings = array();
				while ($fila = mysqli_fetch_array($resul)){
					$recruitings[] = limpiar_array($fila);
				}
				$response['recruitings'] = $recruitings;
				
				break;;
		}
		
	}
	
	echo json_encode($response);
    exit();
?>