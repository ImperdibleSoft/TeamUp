<?php
	include "../functions/functions.php";
	include "connection.php";
	
	/*	Set the response	*/
    $response = array();
	
	/*	Prepare the POST object	*/
	$POST = json_decode(file_get_contents('php://input'));
	
	/*	Get http headers	*/
	$headers = getallheaders();
<<<<<<< HEAD
		
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
		$sql = "SELECT * FROM recruitings WHERE location='". $POST->location ."'";
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
		$sql = "INSERT INTO recruitings (id_recruiting, description, location, maxPlayers, players) VALUES ('". $POST->id ."', '". $POST->description ."', '". $POST->location ."', '". $POST->maxPlayers ."', '". $POST->players ."')";
		$resul = mysqli_query($conexion, $sql);
		if(!$resul){
			$error = mysqli_error($conexion);
			$response['error'][] = $error;
			echo json_encode($response);
			exit();
		}
		
		/*	Get all recruitings	*/
		$sql = "SELECT * FROM recruitings WHERE location='". $POST->location ."'";
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
=======
	
	/*	Get the tournament Modes	*/
	if(isset($_GET['action'])){
		
		switch($_GET['action']){
			case "getLocations":
			
				/* Get all locations	*/
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
			
			case "createLocation":
			
				/* Create a location	*/
				$sql = "INSERT INTO locations (name) VALUES ('". $POST['name'] ."')";
				$resul = mysqli_query($conexion, $sql);
				if(!$resul){
					$error = mysqli_error($conexion);
					$response['error'][] = $error;
					echo json_encode($response);
					exit();
				}
				break;;
			
			case "getRecruitings":
			
				/*	Get all recruitings	*/
				$sql = "SELECT * FROM recruitings WHERE location='". $POST['location'] ."'";
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
			
			case "createRecruiting":
			
				/*	Create a new Recruiting	*/
				$sql = "INSERT INTO recruitings (id_recruiting, description, location, maxPlayers, players) VALUES (". $POST['id'] .", '". $POST['description'] ."', '". $POST['location'] ."', ". $POST['maxPlayers'] .", '". $POST['players'] ."')";
				$resul = mysqli_query($conexion, $sql);
				if(!$resul){
					$error = mysqli_error($conexion);
					$response['error'][] = $error;
					echo json_encode($response);
					exit();
				}
				
				/*	Get all recruitings	*/
				$sql = "SELECT * FROM recruitings WHERE location='". $POST['location'] ."'";
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
			
			case "updateRecruiting":
			
				/*	Update a particular recruiting	*/
				$sql = "UPDATE recruitings SET players='". $POST['players'] ."' WHERE id_recruiting=". $POST['id'];
				$resul = mysqli_query($conexion, $sql);
				if(!$resul){
					$error = mysqli_error($conexion);
					$response['error'][] = $error;
					echo json_encode($response);
					exit();
				}
				
				/*	Get all recruitings	*/
				$sql = "SELECT * FROM recruitings WHERE location='". $POST['location'] ."'";
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
>>>>>>> origin/master
		}
		
	}
	
<<<<<<< HEAD
	else if( isset($_GET['action']) && $_GET['action'] == "updateRecruiting" ){
	
		/*	Update a particular recruiting	*/
		$sql = "UPDATE recruitings SET players='". $POST->players ."' WHERE id_recruiting=". $POST->id;
		$resul = mysqli_query($conexion, $sql);
		if(!$resul){
			$error = mysqli_error($conexion);
			$response['error'][] = $error;
			echo json_encode($response);
			exit();
		}
		
		/*	Get all recruitings	*/
		$sql = "SELECT * FROM recruitings WHERE location='". $POST->location ."'";
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
		
=======
>>>>>>> origin/master
	echo json_encode($response);
    exit();
?>