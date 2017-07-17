# Ajax-Chat
Ajax-Chat is a complete web chat in javascript, ajax, php and mysql compatible with [Phonegap](https://phonegap.com/)

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