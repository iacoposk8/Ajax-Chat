# Ajax Chat
Ajax Chat is a complete web chat in javascript, ajax, php and mysql compatible with [Phonegap](https://phonegap.com/)

- [Screenshots](https://github.com/iacoposk8/Ajax-Chat#screenshots)
- [Features](https://github.com/iacoposk8/Ajax-Chat#features)
- [Installation](https://github.com/iacoposk8/Ajax-Chat#installation)
- [Method](https://github.com/iacoposk8/Ajax-Chat#method)
- [Property](https://github.com/iacoposk8/Ajax-Chat#property)
- [Structures](https://github.com/iacoposk8/Ajax-Chat#structures)
- [TODO](https://github.com/iacoposk8/Ajax-Chat#todo)
- [Libraries of this project](https://github.com/iacoposk8/Ajax-Chat#libraries-of-this-project)

## Screenshots
![chat sample](https://raw.githubusercontent.com/iacoposk8/Ajax-Chat/master/Screenshots/phone.jpg)

## Features
1. Create new chat, send message, read messagge etc... (obviously :D)
2. Search chat, user, and messages
3. Edit profile (name, personal message, personal photo
4. Block user
5. Choose colors
6. Choose languages (English and Italian)
7. Choose messages storage (local or remote)
8. Add custom menu
9. When you add a new chat you can view the users in a list or in a map
10. [End to end encryption](https://en.wikipedia.org/wiki/End-to-end_encryption)
11. We have many smiles ;)
12. Messages status (sent, delivered, read. like [whatsapp](https://faq.whatsapp.com/en/general/20951546))
13. Load old messages when you scroll up

## Installation

### 1. Database
Create a new table in your database

```
CREATE TABLE IF NOT EXISTS chat_messages (
	id_mex BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	id_pair BIGINT NOT NULL,
	from_user BIGINT NOT NULL,
	to_user BIGINT NOT NULL,
	user_chat BIGINT NOT NULL,
	message TEXT NOT NULL,
	status INT(1) NOT NULL,
	`date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`date2` TIMESTAMP NOT NULL,
	`date3` TIMESTAMP NOT NULL
);
```

### 2. Server
Upload "server" folder on your remote server, then open the file Server/chat.php and edit these lines for database connection:

```
$col = 'mysql:host=XXXXXXXXXXXXXXXXXX;dbname=XXXXXXXXXXXXXXXXXX';
$username = "XXXXXXXXXXXXXXXXXX";
$password = "XXXXXXXXXXXXXXXXXX";
```

### 3. Client
Open Client/index.html and Client/test.html and change these line for point to remote php file just uploaded

```
server: "http://XXXXXXXXXXXXXXXXXX/chat.php",
```

Now you can open Client/index.html and Client/test.html and start to chat :)

## Method

| Method | Params | Description |
| --- | --- | --- |
| `change_list` | userlist, [latitude, longitude] | When the user list or geoposition (optional) is changed you can launch this function to update it |
| `chat_open` | chat_id | When user open a chat, here you can hide a notification (in phonegap for example) |
| `new_mex` | message | When arrive a new message, here you can show a notification (in phonegap for example) |
| `profile_update` | profile | When profile is updated, here you can save user data |
| `send_message` | user_id | When user send message to user_id |
| `send_new_message` | to_user, display_name, message | useful for create a chatbot, if you want send "hello" to user 54 from "AppBot" set: (54, "AppBot", "hello" |
| `set_public_key` | public_key | When the public key is generated, here you can save the key |
| `updated_messages` | messages, success | When messages are read and "locale" is true, here you can save the messages and launch success(messages), for remove data from database, [example](https://github.com/iacoposk8/Ajax-Chat#update-messages) |
	
## Property

| Property | Default | Description |
| --- | --- | --- |
| `color` | ["#2ecc71","#3498db","#e2ffc4","#eee"] | colors of the chat |
| `current_user` | | Current user info: [structure](https://github.com/iacoposk8/Ajax-Chat#current-user) |
| `custom_head` | | Here you can add the html code to add to the head |
| `custom_item_menu` | ["Info", "<strong>About</strong><br />Lorem ipsum...."] | This add a new item menu "Info" when write inside "<strong>About</strong><br />Lorem ipsum...." |
| `debug` | false | if you want to see console.log for debug |
| `height` | 500px | height of the chat |
| `lang` | en | languages available english (en) and italian (it) |
| `list` | | List of chat users, [structure](https://github.com/iacoposk8/Ajax-Chat#list-users) |
| `locale` | true | if you want to storage the message in locale set true, if you want all messages in the remote database set false |
| `load_message` | 10 | Number of messages to load when you scroll up |
| `messages` | | if "locale" is true and with "updated_messages" method you have saved the messages, you can restore it in this property |
| `path` | chat | If you rename the path "Client/chat" you have to change also here |
| `server` | http://XXXXXXXXXXXXXXXXXX/chat.php | This is the remote url (file Server/chat.php see the [installation](https://github.com/iacoposk8/Ajax-Chat#installation)) |
| `view` | list | you can view the user like a "list" or in a "map" (for this you have to set "lat" and "lon" in "list" property) |

## Structures

### Current user

```
{
	id: "number", //user's id
	name: "string", //user's name
	img: "data:image/*;base64", //user's image in base64
	phrase: "string", //user's personal phrase
	key: "string" //key for generate the encryption key
}
```

### List users

```
{
	"number": //user's id
	{
		id: "number", //user's id
		name: "string", //user's name
		img: "data:image/*;base64", //user's image in base64
		phrase: "string", //user's personal phrase
		lat: float, //user's latitude (you have to use if "view" is set like "map")
		lon: float, //user's longitude (you have to use if "view" is set like "map")
		public_key: "string" //user's public key for crittography generate from "set_public_key" method
	},
	"number": { ....... },
	"number": { ....... },
	"number": { ....... },
	.......
}
```

### Update messages

```
updated_messages: function(messages, success){
	$.ajax({
		url: "http://localhost/savechat.php",
		method: "POST",
		data: {set: messages]},
		success: function(){
			success(messages);
		}
	});
}
```

## TODO
- Create groups
- Change status (online, writing, last login)
- Send file
- Share messages / contents (inside and outside chat)
- Delete, copy, info, star icone the message

## Libraries of this project
- [jQuery](https://jquery.com/)
- [Emoji Picker](https://github.com/OneSignal/emoji-picker)
- [cryptico](https://github.com/wwwtyro/cryptico)
- [Google Maps APIs](https://developers.google.com/maps/documentation/javascript/tutorial?csw=1)