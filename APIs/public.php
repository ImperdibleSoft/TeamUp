<?php
	include "../functions/functions.php";
	include "connection.php";
	
	/*	Set the response	*/
    $response = array();
	
	/*	Prepare the POST object	*/
	$POST = json_decode(file_get_contents('php://input'));
	
	/*	Get http headers	*/
	$headers = getallheaders();
	
	if( isset($_GET['action']) && $_GET['action'] == "getLocations" ){
		
		/* Get all locations	*/
		$sql = "SELECT id_location, name FROM locations";
		$resul = mysqli_query($conexion, $sql);
		if(!$resul){
			$error = mysqli_error($conexion);
			$response['error'][] = $error;
			echo json_encode($response);
			exit();
		}
		$locations = array();
		while ($fila = mysqli_fetch_array($resul)){
			$locations[] = limpiar_array($fila);
		}
		$response['locations'] = $locations;
	}
	
	else if( isset($_GET['action']) && $_GET['action'] == "createLocation" ){
	
		/* Create a location	*/
		$sql = "INSERT INTO locations (name) VALUES ('". $POST->name ."')";
		$resul = mysqli_query($conexion, $sql);
		if(!$resul){
			$error = mysqli_error($conexion);
			$response['error'][] = $error;
			echo json_encode($response);
			exit();
		}
	}
	
	else if( isset($_GET['action']) && $_GET['action'] == "getRecruitings" ){
	
		/*	Get all recruitings	*/
		$sql = "SELECT *, id_recruiting AS id, (NOW() - (SELECT date FROM recruitings WHERE id_recruiting = id )) AS difference FROM recruitings WHERE location='". $POST->location ."' AND cancelled='0'";
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
	}
	
	else if( isset($_GET['action']) && $_GET['action'] == "createRecruiting" ){
	
		/*	Create a new Recruiting	*/
		$sql = "INSERT INTO recruitings (id_recruiting, description, location, maxPlayers) VALUES ('". $POST->id ."', '". $POST->description ."', '". $POST->location ."', '". $POST->maxPlayers ."')";
		$resul = mysqli_query($conexion, $sql);
		if(!$resul){
			$error = mysqli_error($conexion);
			$response['error'][] = $error;
			echo json_encode($response);
			exit();
		}
		
		/*	Get all recruitings	*/
		$sql = "SELECT *, id_recruiting AS id, (NOW() - (SELECT date FROM recruitings WHERE id_recruiting = id )) AS difference FROM recruitings WHERE location='". $POST->location ."' AND cancelled='0'";
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
	}
	
	else if( isset($_GET['action']) && $_GET['action'] == "updateRecruiting" ){
	
		/*	Update a particular recruiting	*/
		$sql = "UPDATE recruitings SET ";
		foreach($POST as $key => $value){
			if($key != "id"){
				$sql .= $key ."='". $value ."', ";
			}
		}
		$sql = substr($sql, 0, -2);
		$sql .= ", cancelled='0' WHERE id_recruiting=". $POST->id;
		$resul = mysqli_query($conexion, $sql);
		if(!$resul){
			$error = mysqli_error($conexion);
			$response['error'][] = $error;
			echo json_encode($response);
			exit();
		}

		/*	Get all recruitings	*/
		$sql = "SELECT *, id_recruiting AS id, (NOW() - (SELECT date FROM recruitings WHERE id_recruiting = id )) AS difference FROM recruitings WHERE location='". $POST->location ."' AND cancelled='0'";
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
	}
	
	else if( isset($_GET['action']) && $_GET['action'] == "removeRecruiting" ){
		
		/*	Create a new Recruiting	*/
		$sql = "UPDATE recruitings SET cancelled='1' WHERE id_recruiting='". $POST->id ."'";
		$resul = mysqli_query($conexion, $sql);
		if(!$resul){
			$error = mysqli_error($conexion);
			$response['error'][] = $error;
			echo json_encode($response);
			exit();
		}
		
		/*	Get all recruitings	*/
		$sql = "SELECT *, id_recruiting AS id, (NOW() - (SELECT date FROM recruitings WHERE id_recruiting = id )) AS difference FROM recruitings WHERE location='". $POST->location ."' AND cancelled='0'";
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
	}
	
	else if( isset($_GET['action']) && $_GET['action'] == "completeRecruiting" ){
		
		/*	Create a new Recruiting	*/
		$sql = "UPDATE recruitings SET completed='1' WHERE id_recruiting='". $POST->id ."'";
		$resul = mysqli_query($conexion, $sql);
		if(!$resul){
			$error = mysqli_error($conexion);
			$response['error'][] = $error;
			echo json_encode($response);
			exit();
		}
	}
	
	echo json_encode($response);
    exit();
?>