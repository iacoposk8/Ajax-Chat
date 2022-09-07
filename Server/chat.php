<?php
	error_reporting(E_ALL);
	ini_set('display_errors', 0);

	header('Access-Control-Allow-Origin: *'); 
	header("Access-Control-Allow-Credentials: true");
	header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
	header('Access-Control-Max-Age: 1000');
	header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token , Authorization');
	
	header('Content-Type: application/json');
	
	require_once("config.php");

	try {
		$db = new PDO($col , $username, $password);
	} catch(PDOException $e) {
		echo $e->getMessage();
	}

	try {
		$db = new PDO($col, $username, $password);
	} catch(PDOException $e) {
		echo $e->getMessage();
	}

	function check_token($token){
		global $serverKey;
		if(isset($token)){
            require_once('jwt.php');
            try {
                $payload = JWT::decode($token, $serverKey, array('HS256'));
                $returnArray = array('id' => $payload->id);
                if (isset($payload->exp)) {
                    $returnArray['exp'] = date(DateTime::ISO8601, $payload->exp);;
                }
            }
            catch(Exception $e) {
                $returnArray = array('error' => $e->getMessage());
            }
        } 
        else {
            $returnArray = array('error' => 'You are not logged in with a valid token.');
        }
        
        // return to caller
        return $returnArray;
	}

	function get_token($id){
		global $serverKey;
		require_once('jwt.php');
		/**
		 * Uncomment the following line and add an appropriate date to enable the 
		 * "not before" feature.
		 */
		// $nbf = strtotime('2021-01-01 00:00:01');

		/**
		 * Uncomment the following line and add an appropriate date and time to enable the 
		 * "expire" feature.
		 */
		// $exp = strtotime('2021-01-01 00:00:01');

		// create a token
		$payloadArray = array();
		$payloadArray['id'] = $id;
		if (isset($nbf)) {$payloadArray['nbf'] = $nbf;}
		if (isset($exp)) {$payloadArray['exp'] = $exp;}
		$token = JWT::encode($payloadArray, $serverKey);

		// return to caller
		return $token;
	}

	function select($query,$vals){
			global $db;
			$db->beginTransaction();
			//$query = get_query($query, $vals);
			try{
				$sql = $db->prepare($query);
				$sql->execute($vals); 
				$res = $sql->fetchAll(PDO::FETCH_CLASS);
				$db->commit();

				$sql = $db->prepare('INSERT INTO log (query) VALUES (:query)');
				$sql->execute([":query" => $query]); 

				return $res;
			} catch(Exception $e) {
				$db->rollback();
				return false;
			}
	}
	function execsql($query,$vals=array()){
		global $db;
		$db->beginTransaction();
		//$query = get_query($query, $vals);
		try{
			$sql = $db->prepare($query);
			//die(var_dump(($db->errorInfo())));
			$sql->execute($vals); 
			$id = $db->lastInsertId();
			$db->commit();

			$sql = $db->prepare('INSERT INTO log (query) VALUES (:query)');
			$sql->execute([":query" => $query]); 

			return $id;
		} catch(Exception $e) {
			//die(var_dump($e));
			$db->rollback();
			return false;
		}
	}

	function get_user_list($user_id){
		global $userTable;
		//return select('SELECT u.*, c.public_key FROM `'.$userTable["name"].'` as u, chat_users as c WHERE c.id_user = u.'.$userTable["columns"]["id"], array());
		return select('SELECT * FROM `'.$userTable["name"].'`', array());
	}

	function get_user($user, $current_user = False){
		global $userTable;
		$ret = [];
		if(isset($user->{$userTable["columns"]["id"]}) && $user->{$userTable["columns"]["id"]} == $current_user){
			$ret["current_user"] = "1";
		}

		$default = Array(
			"id" => "",
			"name" => "",
			"available" => "true",
			"lat" => "",
			"lon" => "",
			"img" => "https://raw.githubusercontent.com/iacoposk8/Ajax-Chat/master/Images/user.png",
			"phrase" => "Hi! I am a new user :)"
		);
		foreach($default as $key => $val){
			if(isset($user->{$key}))
				$ret[$key] = $user->{$key};
			else
				$ret[$key] = $default[$key];
		}

		//$ret["public_key"] = $user->{"public_key"};
		return $ret;
	}

	function sendMsg($id, $message ) {
		echo "id: $id" . PHP_EOL;
		echo "data: $message" . PHP_EOL;
		echo PHP_EOL;
		ob_flush();	
		flush();
	}

	function get_groups($id){
		$groups = select('SELECT id_group FROM chat_group_users WHERE id_user = :id', array(":id" => $id));
		$id_groups = [];
		foreach($groups as $group)
			$id_groups[] = $group->{"id_group"}; 

		return(implode(",", $id_groups));
	}

	function change_status($id_mex){
		$id_mex_merge = select('SELECT id_mex_merge FROM chat_messages WHERE id_mex = :id_mex', array(":id_mex" => $id_mex))[0];
		$id_mex_merge = $id_mex_merge->{"id_mex_merge"};

		foreach(array(3,2) as $status){
			$res = select('SELECT (SELECT COUNT(*) FROM chat_status as s, chat_messages as m WHERE m.id_mex_merge = :id_mex_merge AND m.id_mex = s.id_mex AND s.status = :status) as partial, (SELECT COUNT(*) FROM chat_messages as m, chat_group_users as g WHERE id_mex = :id_mex 
				AND m.to_group = g.id_group) as total', array(":id_mex_merge" => $id_mex_merge, ":id_mex" => $id_mex, ":status" => $status));

			if(
				($res[0]->{"partial"} == $res[0]->{"total"} && $status == 2) ||
				($res[0]->{"partial"} == $res[0]->{"total"} - 1 && $status == 3)
			){
				execsql("UPDATE chat_messages SET status = :status WHERE id_mex_merge = :id_mex_merge", array(":status" => $status, ":id_mex_merge" => $id_mex_merge));

				break;
			}
		}
	}

	function get_groups_ajax($user, $group_id = "%"){
		global $userTable;

		$groups = select('SELECT g.id, g.name, g.owner, u.id_user FROM chat_group_users as u, chat_groups as g WHERE u.id_user = :id AND u.id_group = g.id AND g.id LIKE :group_id', array(":id" => $user, ":group_id" => $group_id));

		foreach($groups as $group){
			if($group->{"name"} == ""){
				$user = select('SELECT u.* FROM '.$userTable["name"].' as u, chat_group_users as g WHERE g.id_user = u.'.$userTable["columns"]["id"].' AND g.id_user != :id', array(":id" => $group->{"id_user"}));
				$usr = get_user($user[0]);
				$group->{"name"} = $usr["name"];
				$group->{"img"} = $usr["img"];
				$group->{"phrase"} = $usr["phrase"];
			}
			$group->{"users"} = select('SELECT u.id_user, u.public_key FROM chat_users as u, chat_group_users as g WHERE g.id_user = u.id_user AND g.id_group = :id_group', array(":id_group" => $group->{"id"}));
		}

		if($group_id == "%")
			return $groups;
		else
			return $groups[0];
	}

	$sql = $db->prepare('SELECT 1 from chat_messages limit 1');
	$sql->execute(); 
	if(!count($sql->fetchAll(PDO::FETCH_CLASS))){
		//create tables if don't exists
		$count_table = select('DESCRIBE `chat_messages`',array());
		if(!count($count_table)){
			$sql = file_get_contents("chat.sql");   
			$db->exec($sql);
			//print_r($db->errorInfo()); 
		}
	}

	if(isset($_POST["get_users"])){
		$ret = [];
		$tkn = check_token($_POST["get_users"]["token"]);
		if(isset($tkn["id"])){
			$users = get_user_list($tkn["id"]);
			foreach($users as $user){
				$usr = get_user($user, $tkn["id"]);
				$ret[$usr["id"]] = $usr;
			}
		}
		die(json_encode($ret));
	}

	if(isset($_POST["get_groups"])){
		global $userTable;
		$tkn = check_token($_POST["get_groups"]["token"]);
		if(isset($tkn["id"])){ 
			//$groups = select('SELECT a.*, u.id_user FROM (SELECT g.id, g.name, g.password, g.owner, g.img FROM chat_group_users as u, chat_groups as g WHERE u.id_user = :id AND u.id_group = g.id) as a, chat_group_users as u WHERE a.id = u.id_group AND u.id_user != :id GROUP BY a.id', array(":id" => $tkn["id"]));
			
			die(json_encode(get_groups_ajax($tkn["id"])));
		}
	}

	if(isset($_POST["start_chat"])){
		global $userTable;
		$tkn = check_token($_POST["start_chat"]["token"]);
		if(isset($tkn["id"]) && @$_POST["start_chat"]["to_user"] != ""){
			$group = select('SELECT id_group FROM (SELECT u.id_group, COUNT(*) as count FROM chat_group_users as u, chat_groups as g WHERE (u.id_user = :id_from OR u.id_user = :id_to) AND u.id_group = g.id AND g.owner = 0 GROUP BY u.id_group) as a WHERE count = 2', array(":id_from" => $tkn["id"], ":id_to" => $_POST["start_chat"]["to_user"]));

			if(!count($group)){
				$group = execsql("INSERT INTO chat_groups (name) VALUES ('')", array());
				execsql("INSERT INTO chat_group_users (id_user, id_group) VALUES (:id_user, :id_group)", array(":id_user" => $tkn["id"], ":id_group" => $group));
				execsql("INSERT INTO chat_group_users (id_user, id_group) VALUES (:id_user, :id_group)", array(":id_user" => $_POST["start_chat"]["to_user"], ":id_group" => $group));
			} else {
				$group = $group[0]->{"id_group"};
			}

			die(json_encode(get_groups_ajax($tkn["id"], $group)));
		}
	}

	if(isset($_POST["send_message"])){
		$tkn = check_token($_POST["send_message"]["from"]);
		if(isset($tkn["id"])){
			$ret = "1";
			$id_merge = $tkn["id"] . $_POST["send_message"]["to"] . time() . rand(111111111,999999999);
			foreach($_POST["send_message"]["mex"] as $mex){
				//unblock
				if($mex["mex"] == "[UNBLOCK_USER]"){
					execsql('DELETE FROM chat_messages WHERE message = :message AND from_user = ":from_user" AND to_group = :to_group', array(":message" => "[BLOCK_USER]", ":from_user" => $tkn["id"], ":to_group" => $_POST["send_message"]["to"]));
					die(json_encode(array("id"=>-1)));
				}
				
				//block
				$if_block = select('SELECT id_mex FROM chat_messages WHERE message = :message AND from_user = :from_user AND to_group = :to_group',array(":message" => "[BLOCK_USER]", ":from_user" => $tkn["id"], ":to_group" => $_POST["send_message"]["to"]));
				if(count($if_block))
					die(json_encode(array("id"=>-1)));
				
				//insert message
				$query = "INSERT INTO chat_messages (id_mex_merge, from_user, to_group, to_user, message, status) VALUES (:id_mex_merge, :from_user, :to_group, :to_user, :message, 1)";
				$values = array("id_mex_merge" => $id_merge, ":from_user" => $tkn["id"], ":to_group" => $_POST["send_message"]["to"], ":to_user" => $mex["user"], ":message" => $mex["mex"]);

				//die(var_dump($values));
				//execsql($query, $values);
				$id = execsql($query, $values);

				if($tkn["id"] == $mex["user"])
					$ret = select('SELECT m.*, g.name as to_group_name, u.'.$userTable["columns"]["name"].' as from_user_name FROM chat_messages as m, chat_groups as g, '.$userTable["name"].' as u WHERE m.to_group = g.id AND m.id_mex = :id AND m.from_user = u.'.$userTable["columns"]["id"], array(":id" => $id));
			}
			die(json_encode($ret));
		}
	}
	
	if(isset($_GET["check_new_message"])){
		header('Content-Type: text/event-stream');
		header('Cache-Control: no-cache');

		global $userTable;
		$tkn = check_token($_GET["check_new_message"]["userid"]);
		if(isset($tkn["id"])){
			$grp = get_groups($tkn["id"]);

			$new_updates = 'SELECT a.*, b.status as partial_status
			FROM (SELECT m.*, g.name as to_group_name, u.'.$userTable["columns"]["name"].' as from_user_name FROM chat_messages as m, chat_groups as g, '.$userTable["name"].' as u WHERE m.to_user = :to_user AND m.to_group = g.id AND m.to_group IN ('.$grp.') AND m.from_user = u.'.$userTable["columns"]["id"].') as a
			LEFT JOIN chat_status as b
			ON a.id_mex = b.id_mex';

			//die($new_updates);
			$new_mex = select($new_updates, array(":to_user" => $tkn["id"]));

			foreach($new_mex as $row){
				if($row->{"partial_status"} == "1" || is_null($row->{"partial_status"})){
					execsql("INSERT INTO chat_status (id_user, id_mex, status) VALUES (:id_user, :id_mex, :status)", array(":id_user" => $tkn["id"], ":id_mex" => $row->{"id_mex"}, ":status" => 2));

					change_status($row->{"id_mex"});
				}
			}

			sendMsg( time() , json_encode($new_mex));	
		}
	}

	if(isset($_POST["get_last_message_from_all_chat"])){
		global $userTable;
		$tkn = check_token($_POST["get_last_message_from_all_chat"]["userid"]);
		if(isset($tkn["id"])){
			die(json_encode(select('SELECT * FROM (SELECT m.*, g.name as to_group_name, u.'.$userTable["columns"]["name"].' as from_user_name FROM chat_messages as m, chat_groups as g, '.$userTable["name"].' as u WHERE m.to_user = :to_user AND m.to_group = g.id AND m.to_group IN ('.get_groups($tkn["id"]).') AND m.from_user = u.'.$userTable["columns"]["id"].' ORDER BY m.date DESC) as a GROUP BY a.to_group', array(":to_user" => $tkn["id"]))));
		}
	}
	
	if(isset($_POST["get_chat_messages"])){
		global $userTable;
		$tkn = check_token($_POST["get_chat_messages"]["userid"]);
		if(isset($tkn["id"]) && in_array($_POST["get_chat_messages"]["group"], explode(",",get_groups($tkn["id"])))){
			die(json_encode(select('SELECT m.*, g.name as to_group_name, u.'.$userTable["columns"]["name"].' as from_user_name FROM chat_messages as m, chat_groups as g, '.$userTable["name"].' as u WHERE m.to_user = :to_user AND m.to_group = g.id AND m.to_group = :to_group AND m.from_user = u.'.$userTable["columns"]["id"].' ORDER BY m.date DESC LIMIT '.$_POST["get_chat_messages"]["n"][0].','.$_POST["get_chat_messages"]["n"][1], array(':to_user' => $tkn["id"], ':to_group' => $_POST["get_chat_messages"]["group"]))));
		}
	}
	
	if(isset($_POST["message_read"])){
		$tkn = check_token($_POST["message_read"]["from"]);
		if(isset($tkn["id"])){
			execsql("INSERT INTO chat_status (id_user, id_mex, status) VALUES (:id_user, :id_mex, :status)", array(":id_user" => $tkn["id"], ":id_mex" => $_POST["message_read"]["id_mex"], ":status" => 3));

			change_status($_POST["message_read"]["id_mex"]);

			die(json_encode(array($_POST["message_read"]["id_mex"])));
		}
	}
	/*if(isset($_POST["get_read_messages"])){
		$tkn = check_token($_POST["get_read_messages"]);
		if(isset($tkn["id"])){
			die(json_encode(select('SELECT * FROM chat_messages WHERE user_chat = :id',array(":id" => $tkn["id"]))));
		}
	}*/

	if(isset($_POST["group"])){
		$tkn = check_token($_POST["group"]["token"]);
		if(isset($tkn["id"])){
			if(isset($_POST["group"]["id"])){ //edit group
				$id = $_POST["group"]["id"];
				if(isset($_POST["group"]["name"]))
					execsql("UPDATE chat_groups set name = :name WHERE owner = :owner AND id = :id", array(":name" => $_POST["group"]["name"], ":owner" => $tkn["id"], ":id" => $id));

				if(isset($_POST["group"]["img"]))
					execsql("UPDATE chat_groups set img = :img WHERE owner = :owner AND id = :id", array(":img" => $_POST["group"]["img"], ":owner" => $tkn["id"], ":id" => $id));

				if(count($_POST["group"]["users"]))
					execsql("DELETE FROM chat_group_users WHERE id_group = :id_group", array(":id_group" => $id));
			} else { //new group
				if(!isset($_POST["group"]["img"]))
					$img = "https://raw.githubusercontent.com/iacoposk8/Ajax-Chat/master/Images/group.png";
				else
					$img = $_POST["group"]["img"];

				$id = execsql("INSERT INTO chat_groups (name, owner, img) VALUES (:name, :owner, :img)", array(":name" => $_POST["group"]["name"], ":owner" => $tkn["id"], ":img" => $img));	
			}

			//add partecipants
			if(!isset($_POST["group"]["users"])){
				$_POST["group"]["users"] = array();	
			}

			$_POST["group"]["users"][] = $tkn["id"];
			foreach($_POST["group"]["users"] as $user){
				if(!count(select('SELECT * FROM chat_group_users WHERE id_user = :id_user AND id_group = :id_group', array(":id_user" => $user, ":id_group" => $id))))
					execsql("INSERT INTO chat_group_users (id_user, id_group) VALUES (:id_user, :id_group)", array(":id_user" => $user, ":id_group" => $id));
			}

			//$info = select('SELECT name FROM chat_groups WHERE id = :id', array(":id" => $id));
			//die(json_encode(array("name" => $info[0]->{"name"}, "id" => $id)));
			die(json_encode(get_groups_ajax($tkn["id"], $id)));
		}
	}

	if(isset($_POST["public_key"])){
		$tkn = check_token($_POST["public_key"]["token"]);
		if(isset($tkn["id"])){
			execsql("REPLACE INTO chat_users (id_user, public_key) VALUES (:id_user, :public_key)", array(":id_user" => $tkn["id"], ":public_key" => $_POST["public_key"]["key"]));
		}
		die(json_encode(array(1)));
	}
