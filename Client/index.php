<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="jquery-1.10.2.js"></script>
<script src="chat/chat.js" id="chatscript"></script>

<!-- Begin emoji-picker JavaScript -->
<script src="chat/emoji-picker/js/config.js"></script>
<script src="chat/emoji-picker/js/util.js"></script>
<script src="chat/emoji-picker/js/jquery.emojiarea.js"></script>
<script src="chat/emoji-picker/js/emoji-picker.js"></script>
<!-- End emoji-picker JavaScript -->

<script language="JavaScript" type="text/javascript" src="chat/wwwtyro-cryptico-9291ece/jsbn.js"></script>
<script language="JavaScript" type="text/javascript" src="chat/wwwtyro-cryptico-9291ece/random.js"></script>
<script language="JavaScript" type="text/javascript" src="chat/wwwtyro-cryptico-9291ece/hash.js"></script>
<script language="JavaScript" type="text/javascript" src="chat/wwwtyro-cryptico-9291ece/rsa.js"></script>
<script language="JavaScript" type="text/javascript" src="chat/wwwtyro-cryptico-9291ece/aes.js"></script>
<script language="JavaScript" type="text/javascript" src="chat/wwwtyro-cryptico-9291ece/api.js"></script>	

<script type='text/javascript' src='https://maps.google.com/maps/api/js?sensor=false'></script>

<style>
	#chat{
		height: calc(100% - 50px);
	}
</style>

<div id="chat"></div>
<script>
$(document).ready(function(){
	chat = $("#chat").chat({
		path: "chat",
		server: "https://iacoposk8.ipage.com/daeliminare/Server/chat.php",
		color: ["#2ecc71","#3498db","#e2ffc4","#eee"],
		debug:false,
		lang: "it",
		load_message: 10,
		custom_item_menu: ["Info", "<strong>About</strong><br />Lorem ipsum...."],
		view: "list", //map
		new_mex: function(mex){
			
		},
		chat_open: function(chat_id){
			if(typeof notification !== "undefined" && typeof notification.close !== "undefined")
				notification.close();
		},
		profile_update: function(profile){
			//When profile is updated, here you can save user data
		},
		current_user: "<?php require_once("../Server/chat.php"); echo get_token($_GET['user_id']); ?>"
	});
});
</script>
