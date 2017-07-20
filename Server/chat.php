<?php
	error_reporting(E_ALL);
	ini_set('display_errors', 1);

	header('Access-Control-Allow-Origin: *'); 
	header("Access-Control-Allow-Credentials: true");
	header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
	header('Access-Control-Max-Age: 1000');
	header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token , Authorization');
	
	header('Content-Type: application/json');
	
	$col = 'mysql:host=custsql-spro-ipg04.ipagemysql.com;dbname=chat';
	$username = "chat_user";
	$password = "LSyZ&[dbU,E6>tNb";
	$debug = false;
	
	try {
		$db = new PDO($col , $username, $password);
	} catch(PDOException $e) {
		echo $e->getMessage();
	}

	function get_query($query,$vals){
		global $db;
		foreach($vals as $val)
			$query = preg_replace('/%/', $db->quote($val), $query, 1);
			
		global $debug;
		if($debug){
			$log = fopen("log.txt", "a+") or die("Unable to open file!");
			fwrite($log, $query."\n");
			fclose($log);
		}	
		
		return $query;
	}
	function select($query,$vals){
			global $db;
			$db->beginTransaction();
			$query = get_query($query, $vals);
			try{
				$sql = $db->prepare($query);
				$sql->execute(); 
				$res = $sql->fetchAll();
				$db->commit();
				return $res;
			} catch(Exception $e) {
				$db->rollback();
				return false;
			}
	}
	function execsql($query,$vals=array()){
		global $db;
		$db->beginTransaction();
		$query = get_query($query, $vals);
		try{
			$sql = $db->prepare($query);
			//die(var_dump(($db->errorInfo())));
			$sql->execute(); 
			$id = $db->lastInsertId();
			$db->commit();
			return $id;
		} catch(Exception $e) {
			//die(var_dump($e));
			$db->rollback();
			return false;
		}
	}

	if(isset($_POST["send_message"])){
		//unblock
		if($_POST["send_message"]["mex_for_me"] == "[UNBLOCK_USER]"){
			execsql('DELETE FROM chat_messages WHERE message = % AND ((from_user = % AND to_user = %) OR (from_user = % AND to_user = %))', array("[BLOCK_USER]", $_POST["send_message"]["from"], $_POST["send_message"]["to"], $_POST["send_message"]["to"], $_POST["send_message"]["from"]));
			die(json_encode(array("id"=>-1)));
		}
		
		//block
		$if_block = select('SELECT id_mex FROM chat_messages WHERE message = % AND ((from_user = % AND to_user = %) OR (from_user = % AND to_user = %))',array("[BLOCK_USER]", $_POST["send_message"]["from"], $_POST["send_message"]["to"], $_POST["send_message"]["to"], $_POST["send_message"]["from"]));
		if(count($if_block))
			die(json_encode(array("id"=>-1)));
		
		$id_pair=select('SELECT id_pair FROM chat_messages ORDER BY id_pair DESC LIMIT 0,1',array());
		if(count($id_pair))
			$id_pair=$id_pair[0]["id_pair"]+1;
		else
			$id_pair = 1;

		execsql("INSERT INTO chat_messages (id_pair, from_user, to_user, user_chat, message, status) VALUES (%, %, %, %, %, %)", array($id_pair, $_POST["send_message"]["from"],$_POST["send_message"]["to"],$_POST["send_message"]["to"],$_POST["send_message"]["mex_for_you"], 1));
		die(json_encode(array("id"=>execsql("INSERT INTO chat_messages (id_pair, from_user, to_user, user_chat, message, status) VALUES (%, %, %, %, %, %)", array($id_pair, $_POST["send_message"]["from"],$_POST["send_message"]["to"],$_POST["send_message"]["from"],$_POST["send_message"]["mex_for_me"], 1)))));
	}
	if(isset($_POST["chat_user"])){
		$ids = "";
		foreach(select('SELECT id_pair FROM chat_messages WHERE to_user = % AND status = %', array($_POST["chat_user"]["userid"],1)) as $id){
			$ids .= $id["id_pair"].",";
		}
		execsql('UPDATE chat_messages SET status = 2, date2 = NOW() WHERE id_pair IN ('.substr($ids,0,-1).')', array());
		die(json_encode(select('SELECT * FROM chat_messages WHERE user_chat = %', array($_POST["chat_user"]["userid"]))));
	}
	if(isset($_POST["message_read"])){
		$id_pair=select('SELECT id_pair FROM chat_messages WHERE id_mex = %',array($_POST["message_read"]["id_mex"]));
		$id_pair=$id_pair[0]["id_pair"];
		
		execsql('UPDATE chat_messages SET status = 3, date3 = NOW() WHERE id_pair = % OR id_pair = %',array($id_pair, $id_pair));
		die(json_encode(array($_POST["message_read"]["id_mex"])));
	}
	if(isset($_POST["get_read_messages"])){
		$ret = array();
		die(json_encode(select('SELECT * FROM chat_messages WHERE user_chat = %',array($_POST["get_read_messages"]))));
	}
	if(isset($_POST["delete_read_messages"])){
		execsql('DELETE FROM chat_messages WHERE id_mex in ('.implode(",",$_POST["delete_read_messages"]).')');
		die(json_encode(array()));
	}
