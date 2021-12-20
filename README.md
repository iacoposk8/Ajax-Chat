


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
![chat sample](https://raw.githubusercontent.com/iacoposk8/Ajax-Chat/master/Images/phone.jpg)

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
14. Create groups

## Installation

### 1. Server
Upload "server" folder on your remote server, then open the file Server/config.php and edit these lines for database connection:

```
$col = 'mysql:host=XXXXXXXXXXXXXXXXXX;dbname=XXXXXXXXXXXXXXXXXX';
$username = "XXXXXXXXXXXXXXXXXX";
$password = "XXXXXXXXXXXXXXXXXX";
```
Then modify the $serverKey variable with a password of your choice (which you will never have to change), this will be used to generate the tokens
```
$serverKey = 'XXXXXXXXXXXXXXXXXX';
```
Now you need to indicate what is your users table and what the id and name columns are called. For example, if your table has this structure:
```
CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `username` varchar(255) NOT NULL
);
```
You will need to modify the $userTable to do this:
```
$userTable = array(
	"name" => "users",
	"columns" => array(
		"id" => "id_user",
		"name" => "username"
	)
);
```
### 2. Client
Open Client/index.html and Client/test.html and change these line for point to remote php file just uploaded

```
server: "http://XXXXXXXXXXXXXXXXXX/chat.php",
```

### 3. Test
To do a test go to: https://your-site/Client/index.php?user_id=XXXXXX

instead of the X we need to put the user id that we find in the "users" table (in our example).  

**NOTE:** This is an example only and is not safe! We shouldn't be able to see a user's private chats without a login but simply by guessing its user id.  To make the example safe, you need to edit the line:  

    current_user: "<?php require_once("../Server/chat.php"); echo get_token($_GET['user_id']); ?>"

With something like this:

    current_user: "<?php require_once("../Server/chat.php"); echo get_token(your_login_function()["id"]); ?>"

**NOTE:** At the first start some tables will be created in your database

## Method

| Method | Params | Description |
| --- | --- | --- |
| `chat_open` | chat_id | When user open a chat |
| `new_mex` | message | When arrive a new message |
| `profile_update` | profile | When profile is updated |
| `send_message` | user_id | When user send message to user_id |
| `group` | detail, callback | Create a new group. detail: `{name: "Group name", users: [id_user, id_user, id_user...], img: "url image", id: group_id_to_edit}` (`name` and `users` are mandatory) |
| `send_new_message` | to_user, display_name, message | useful for create a chatbot, if you want send "hello" to user 54 from "AppBot" set: `chat.send_new_message(54, "AppBot", "hello")` |
	
## Property

| Property | Default | Description |
| --- | --- | --- |
| `color` | (array) ["#2ecc71","#3498db","#e2ffc4","#eee"] | colors of the chat |
| `current_user` | (string) token | Current user token. You can generate the token with php function in Server/chat.php - `get_token($user_id);` |
| `custom_head` | (string) "html code" | Here you can add the html code to add to the head |
| `custom_item_menu` | (array) ["Info", "<strong>About</strong><br />Lorem ipsum...."] | This add a new item menu "Info" when write inside "<strong>About</strong><br />Lorem ipsum...." |
| `debug` | (bool) false | if you want to see console.log for debug |
| `lang` | (string) en | languages available english (en) and italian (it) |
| `load_message` | (int) 10 | Number of messages to load when you scroll up |
| `path` | (string) chat_folder | If you rename the path "Client/chat" you have to change also here |
| `server` | (string) url_chat.php | This is the remote url (file Server/chat.php see the [installation](https://github.com/iacoposk8/Ajax-Chat#installation)) |
| `view` | (string) list | you can view the user like a "list" or in a "map" (for this you have to set "lat" and "lon" in "list" property) |

## TODO
- Change status (online, writing, last login)
- Send file
- Share messages / contents (inside and outside chat)
- Delete, copy, info, star icone the message
- Vocal notes

## Libraries of this project
- [jQuery](https://jquery.com/)
- [Emoji Picker](https://github.com/OneSignal/emoji-picker)
- [cryptico](https://github.com/wwwtyro/cryptico)
- [Google Maps APIs](https://developers.google.com/maps/documentation/javascript/tutorial?csw=1)
