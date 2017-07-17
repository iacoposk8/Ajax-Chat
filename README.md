# Ajax Chat
Ajax Chat is a complete web chat in javascript, ajax, php and mysql compatible with [Phonegap](https://phonegap.com/)

## Features
1. Create new chat, send message, read messagge etc... (obviously :D)
2. Search chat, user, and messages
3. Edit profile (name, personal message, personal photo
4. Block user
5. Choose color
6. Choose languages (English and Italian)
7. Choose messages storage (local or remote)
8. Add custom menu
9. When you add a new chat you can view the users in a list or in a map
10. [End to end encryption](https://en.wikipedia.org/wiki/End-to-end_encryption)
11. We have many smiles ;)
12. Messages status (sent, delivered, read. like [whatsapp](https://faq.whatsapp.com/en/general/20951546))

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
Upload "server" folder on your remote server
Then open the file Server/chat.php and edit these lines for database connection:

```
$col = 'mysql:host=XXXXXXXXXXXXXXXXXX;dbname=XXXXXXXXXXXXXXXXXX';
$username = "XXXXXXXXXXXXXXXXXX";
$password = "XXXXXXXXXXXXXXXXXX";
```

### 3. Client
Open Client/index.html and Client/test.html
and change these line for point to remote php file just uploaded

```
server: "http://XXXXXXXXXXXXXXXXXX/chat.php",
```

Now you can open Client/index.html and Client/test.html and start to chat :)

## Method

## Property
- updated_messages: function(messages, success)
	When messages are read and "locale" is true, here you can save the messages and launch success(messages), for remove data from database, example:
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

- set_public_key: function(public_key)
	When the public key is generated, here you can save the key

- new_mex: function(mex)
	When arrive a new message, here you can show a notification (in phonegap for example)	

- chat_open: function(chat_id)
	When user open a chat, here you can hide a notification (in phonegap for example)	

- profile_update: function(profile)
	When profile is updated, here you can save user data
	
- change_list(userlist)
	When the user list is changed you can launch this function to update it

## TODO
- Create groups
- Change status (online, writing, last login)
- Load messages when you scroll up

## Libraries of this project
[jQuery](https://jquery.com/)
[Emoji Picker](https://github.com/OneSignal/emoji-picker)
[cryptico](https://github.com/wwwtyro/cryptico)
[Google Maps APIs](https://developers.google.com/maps/documentation/javascript/tutorial?csw=1)