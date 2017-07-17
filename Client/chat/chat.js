/*****************************************************************/
/*****************************************************************/
/*****************************************************************/
//migliorare grafica profilo, l'area del messaggio è troppo corta
//mettere notifiche silenziose
//fare i gruppi
//mettere lo stato online, sta scrivendo, ultimo accesso
//Per risolvere il problema della paginazione nella chat al posto che renderizzare da 80 a 100 e aggiungere sopra da 60 a 80 cancellare tutto e fare da 60 a 100 sarà cmq lento ma l'utente sceglierà lui di vederle e nella situazione iniziale, sovrabbondante i messaggi verranno mostrati velocemente 
//se non ci sono cambiamenti non dovrebbe aggiornare la lista delle chat, altrimenti quando si scrolla riparte dall'inizio
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/
( function($) {
	jQuery.fn.chat = function(options) {
		function LOG(mex, data){
			data = JSON.stringify(data);
			if(
				options.debug && 
				data.length && 
				data != "[null]" && 
				data != "[]" && 
				data != "[[]]" && 
				data.indexOf('"load":false,"data":{"chat_user":{"userid":"1"}}')==-1 &&
				data.indexOf('"load":false,"data":{"get_read_messages":"1"}')==-1
			){
				console.log(mex+" "+data);
			}
		}
		
		var userlist = '';
		var coords_list;
		this.change_list = function(list){
			LOG("chat change_list ",[list]);
			options.list = list;
			if(options.view == "map"){
				coords_list = list;
			} else {
				userlist = '';
				for(var i in list){
					userlist += html_row(list[i],list[i].phrase);
				}
			}
		}
		this.change_list(options.list);
		
		function html_row(row,phrase,new_mex){
			if(typeof row !== "undefined"){
				var new_mex_html = "";
				if(new_mex)
					new_mex_html = '<div id="chat_new_message_sym" class="fa fa-envelope"></div>';

				if(typeof phrase === "undefined")
					phrase = "";
				
				return '<div class="chat_user" attr-id="'+row.id+'"><img class="chat_user_img" src="'+row.img+'" /><span class="chat_username">'+row.name+'</span><br /><span class="chat_phrase">'+phrase+'</span>'+new_mex_html+'</div>';
			}
		}

		function chatmap() {
			LOG("chat chatmap ",[]);
			var lat_sum = 0.0;
			var lon_sum = 0.0;
			var counsum = 0;
			for(var i in coords_list){
				lat_sum += parseFloat(coords_list[i].lat);
				lon_sum += parseFloat(coords_list[i].lon);
				counsum ++;
			}
			
			if(lat_sum != 0.0 && lon_sum != 0.0){
				lat_sum = parseFloat(lat_sum/counsum);
				lon_sum = parseFloat(lon_sum/counsum);

				var latlng = new google.maps.LatLng(lat_sum, lon_sum);
				var options = { zoom: 9, center: latlng, mapTypeId: google.maps.MapTypeId.ROADMAP};
			} else {
				var latlng = new google.maps.LatLng(48.1034995,12.262864);
				var options = { zoom: 6, center: latlng, mapTypeId: google.maps.MapTypeId.ROADMAP};
			}
			// crea l'oggetto mappa
			var map = new google.maps.Map($("#chatmap")[0], options);

			for(var i in coords_list){
				mar_cord = new google.maps.LatLng(parseFloat(coords_list[i].lat), parseFloat(coords_list[i].lon));

				myinfowindow = new google.maps.InfoWindow({content: html_row(coords_list[i],coords_list[i].phrase)});
				marker = new google.maps.Marker({ position: mar_cord, map: map, infowindow: myinfowindow});
				
				google.maps.event.addListener(marker, 'click', function() {
					this.infowindow.open(map, this);
				});
			}
		}
		
		return this.each(function(){
			var $self = $(this);
			scrolltopload = 10;

			$('<style>#chat_add{color:'+options.color[0]+';} #chat_header{background:'+options.color[0]+';}<style>').insertAfter($("#chatscript"));
			$('<style>.emoji-picker-icon,#chat_send{color:'+options.color[1]+';}<style>').insertAfter($("#chatscript"));
			$('<style>.tri-right{background:'+options.color[2]+';}.tri-right.left-top::after{border-color:'+options.color[2]+' transparent transparent;}<style>').insertAfter($("#chatscript"));
			$('<style>.tri-left{background:'+options.color[3]+';}.tri-left.right-top::after{border-color:'+options.color[3]+' transparent transparent;}<style>').insertAfter($("#chatscript"));
			$('<link rel="stylesheet" href="'+options.path+'/chat.css">').insertAfter($("#chatscript"));
			$('<link rel="stylesheet" href="'+options.path+'/emoji-picker/css/emoji.css">').insertAfter($("#chatscript"));
			$('<link rel="stylesheet" href="'+options.path+'/load-awesome-1.1.0/ball-clip-rotate-pulse.css">').insertAfter($("#chatscript"));
			$('<link rel="stylesheet" href="'+options.path+'/bubble.css">').insertAfter($("#chatscript"));
			$('<link rel="stylesheet" href="'+options.path+'/Lato/latofonts.css">').insertAfter($("#chatscript"));
			$('<link rel="stylesheet" href="'+options.path+'/Lato/latostyle.css">').insertAfter($("#chatscript"));
			$('<link rel="stylesheet" href="'+options.path+'/font-awesome-4.7.0/css/font-awesome.min.css">').insertAfter($("#chatscript"));
			
			var langs = {
				"it": {
					"error": "Errore durante la connessione al server, controlla la tua connessione a internet o riprova in un secondo momento.",
					"search": "Cerca",
					"profile": "Profilo",
					"block": "Blocca",
					"unblock": "Sblocca",
					"name": "Nome",
					"message": "Messaggio",
					"photo": "Foto",
					"save": "Salva"
				},
				"en": {
					"error": "Error connecting to server, checking your internet connection, or try again later.",
					"search": "Search",
					"profile": "Profile",
					"block": "Block",
					"unblock": "Unlocks",
					"name": "Name",
					"message": "Message",
					"photo": "Photo",
					"save": "Save"
				}
			};
			
			var lang = langs[options.lang];
			
			function new_size(){
				$container.outerHeight($self.height() - $header.outerHeight());
				$("#chat_message").outerHeight($container.height() - $("#chat_new_message").outerHeight());
			}
			
			function isFunction(functionToCheck) {
				var getType = {};
				return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
			}
			
			var Ajax = function(){
				var self = this;
				this.queue = [];
				this.queue_key = [];
				this.is_request = false;
				
				this.request_logic = function(opt){
					LOG("chat Ajax request_logic ",[opt]);
					if(typeof opt.load === "undefined")
						opt.load=true;
					if(typeof opt.async === "undefined")
						opt.async=true;
					if(opt.load)
						$loading.css("display","table");
					$.ajax({
						url: options.server,
						method: "POST",
						async: opt.async,
						data: opt.data,
						success: function(e){
							LOG("chat Ajax success ",[e]);
							self.is_request = false;
							self.queue.splice(0, 1);
							self.queue_key.splice(0, 1);
					
							if(opt.load)
								setTimeout(function(){$loading.css("display","none");},400);
							if(isFunction(opt.success))
								opt.success(e);
						},
						error: function(e){
							LOG("chat Ajax error ",[e]);
							self.is_request = false;
							$loading.css("display","none");
							opt.load = false;
							if(isFunction(opt.error))
								opt.error(e);
						}
					});
				}
				
				this.launc_request = function(){
					if(typeof self.queue[0] !== "undefined" && self.is_request === false){
						self.is_request = true;
						self.request_logic(self.queue[0]);
					}
				}

				this.request = function(opt){
					if(self.queue_key.indexOf(opt.id)==-1){
						self.queue.push(opt);
						self.queue_key.push(opt.id);
					}
					self.launc_request();
				}
				
				setInterval(function(){
					self.launc_request();
				},2000);
			};
			var A = new Ajax();
			
			function formatDate(date) {
				return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes();
			}
			
			function scrollToElem($elem){
				if(typeof $elem !== "undefined" && $elem.length > 0){
					var container = $('#chat_message'),
						scrollTo = $elem;

					container.scrollTop(
						scrollTo.offset().top - container.offset().top + container.scrollTop()
					);
				}
			}
			
			function render_message(mex, srvid, fromto, status, date){
				LOG("chat render_message ",[mex, srvid, fromto, status, date]);
				var enter = 0;
				
				if(typeof date === "undefined")
					var date = formatDate(new Date());
				else
					var date = formatDate(new Date(date));
				
				if($('.talk-bubble[attr-srv-id="'+srvid+'"]').length==0 || srvid == "wait"){
					enter = 1;
					if(fromto)
						var block_mex = '<div attr-srv-id="'+srvid+'" class="talk-bubble tri-right left-top">';
					else
						var block_mex = '<div attr-srv-id="'+srvid+'" class="talk-bubble tri-left right-top">';
					
					var chat_id = $("#chat_send").attr("attr-id");
					var $block = get_mex_block(chat_id);
					//console.log($block);
					var $block_mex = $(block_mex).appendTo(get_mex_block(chat_id));

					var status_elem = "";
					if(fromto)
						status_elem = '<div class="chat_info"><div class="chat_date">'+date+'</div><div class="chat_status"><span class="fa fa-clock-o"></span></div></div>';
					$block_mex.html('<div class="talktext">'+mex+'</div>'+status_elem);
				}
				if(typeof status !== "undefined" && status != 0)
					change_status(srvid,status);
				
				scrollToElem($block_mex);
				if(enter == 1){
					return $block_mex;
				}
			}
			
			function show_error(mex){
				if($("#error").length == 0){
					var $error_cont = $('<div id="error">').appendTo($self);
					var $error = $('<div>').appendTo($error_cont);
					$error.html('<div>'+mex+'</div>');
					
					$error_cont.click(function(){
						$error_cont.remove();
					});
				}
			}
			
			function insert_mex_form(chat_id){
				LOG("chat insert_mex_form ",[chat_id]);
				$new_message = $("#chat_new_message");
				$new_message.html('<input type="email" id="chat-form-control" data-emojiable="true">');
						
				window.emojiPicker = new EmojiPicker({
				  emojiable_selector: '[data-emojiable=true]',
				  assetsPath: 'chat/emoji-picker/img',
				  popupButtonClasses: 'fa fa-smile-o'
				});
				window.emojiPicker.discover();
				
				$new_message.append('<div id="chat_send" class="fa fa-paper-plane" attr-id="'+chat_id+'"></div>');
				$new_message.find(".emoji-wysiwyg-editor").focus();
				new_size();
			}
			
			function change_status(id,stat){
				LOG("chat change_status ", [id,stat]);
				var $stat = $('div[attr-srv-id="'+id+'"]').find(".chat_status");
				if(stat=="1")
					$stat.html('<span class="fa fa-check"></span>');
				if(stat=="2")
					$stat.html('<span class="fa fa-check fa-check1"></span><span class="fa fa-check fa-check2"></span>');
				if(stat=="3")
					$stat.html('<span class="fa fa-check fa-check1" style="color:#3498db;"></span><span class="fa fa-check fa-check2" style="color:#3498db;"></span>');
			}
			
			var pagination = false;
			function get_mex_block(chat_id){
				LOG("chat get_mex_block ",[chat_id]);
				if(!pagination){
					return $("#chat_message");
				}else{
					if(($("#chat_message").scrollTop() < scrolltopload && typeof options["messages"][chat_id] !== "undefined" && options["messages"][chat_id].counter >= options.load_message) || $('.chat_message_block').length == 0 ){
						//console.log("create");
						return $('<div class="chat_message_block">').prependTo($("#chat_message"));
					}else{
						//console.log("get");
						return $('.chat_message_block').last();
					}
				}
			}

			var unread = {};
			function show_all_messages(){
				LOG("chat show_all_messages ",[]);
				var chat_id = $("#chat_send").attr("attr-id");
				var this_mex = options["messages"][chat_id];
				
				if(typeof options["messages"][chat_id] !== "undefined" && typeof options["messages"][chat_id]["from_counter"] === "undefined")
					options["messages"][chat_id]["from_counter"] = options["messages"][chat_id].counter - options.load_message;
				
				if(typeof options["messages"][chat_id] !== "undefined" && options["messages"][chat_id]["from_counter"]<0)
					options["messages"][chat_id]["from_counter"] = 0;
				
				if(!update_success && (typeof this_mex === "undefined" || this_mex.length==0)){
					show_error(lang.error);
				}
				
				var count = 0;
				for(var i in this_mex){	
					if(i == "[BLOCK_USER]"){
						if(this_mex[i].from_user == options.current_user.id)
							set_menu("chat_block");
						continue;
					}
					
					if(typeof this_mex[i].status === "undefined")
						continue;
					
					count++;
					//console.log(count+" > "+options["messages"][chat_id].from_counter);
					if(!pagination || (count > options["messages"][chat_id].from_counter)){						
						if(options.current_user.id == this_mex[i].from_user)
							var fromto = 1;
						else
							var fromto = 0;
						
						var mex_decrypt = cryptico.decrypt(i, private_key).plaintext;
						render_message(mex_decrypt, this_mex[i].id_mex, fromto, this_mex[i].status, this_mex[i].date);
						
						if(this_mex[i].status == "2" && this_mex[i].from_user != options.current_user.id){
							if(typeof unread[chat_id] === "undefined")
								unread[chat_id] = [];
							if(unread[chat_id].indexOf(this_mex[i].id_mex) == -1)
								unread[chat_id].push(this_mex[i].id_mex);
						}
					}
					if(typeof this_mex[i].status !== "undefined" && this_mex[i].status != 0)
						change_status(this_mex[i].id_mex,this_mex[i].status);
				}
	
				$('.chat_message_block').each(function() {
					var $this = $(this);
					if($this.html().replace(/\s|&nbsp;/g, '').length == 0)
						$this.remove();
				});
				
				for(var i in waiting_mex)
					waiting_mex[i].appendTo($("#chat_message"));
			}
			
			var last_date_new_mex;
			function show_all_chat(){
				LOG("chat show_all_chat ",[]);
				var last_mexs = [];
				//if($add.css("display")!="none" && $("#edit_profile_btn").length==0 && typeof options.messages !== "undefined" && $search_input.val()==""){
					for(var i in options.messages){
						var add_mex = options.messages[i][options.messages[i].last_message];
						add_mex.userlist = i;
						add_mex.last_message = options.messages[i].last_message;
						last_mexs.push(add_mex);
					}
				
					for(var i in last_mexs){
						for(var j in last_mexs){
							if(last_mexs[i].date > last_mexs[j].date){
								var z = last_mexs[i];
								last_mexs[i] = last_mexs[j];
								last_mexs[j] = z;
							}						
						}	
					}
					
					var userlist = "";
					for(var i in last_mexs){
						new_mex = false;
						if(last_mexs[i].status <= "2" && last_mexs[i].to_user == options.current_user.id){
							new_mex = true;
							
							if(typeof last_date_new_mex === "undefined" || last_date_new_mex < last_mexs[i].date){
								last_date_new_mex = last_mexs[i].date;
								var optnexmex = last_mexs[i];
								optnexmex.mex = cryptico.decrypt(add_mex.last_message, private_key).plaintext;
								options.new_mex(optnexmex);
							}
						}
						userlist += html_row(options.list[last_mexs[i].userlist],cryptico.decrypt(add_mex.last_message, private_key).plaintext, new_mex);
					}

					if(typeof userlist !== "undefined" && userlist != "undefined")
						$('#all_chat').html(userlist);
				//}
			}
			
			var isTabVisible = (function(){
				var stateKey, eventKey, keys = {
					hidden: "visibilitychange",
					webkitHidden: "webkitvisibilitychange",
					mozHidden: "mozvisibilitychange",
					msHidden: "msvisibilitychange"
				};
				for (stateKey in keys) {
					if (stateKey in document) {
						eventKey = keys[stateKey];
						break;
					}
				}
				return function(c) {
					if (c) document.addEventListener(eventKey, c);
					return !document[stateKey];
				}
			})();
			
			function isElementInView(element, fullyInView) {
				LOG("chat isElementInView ",[element, fullyInView]);
				if(element.length == 0)
					return false;
				var pageTop = $(window).scrollTop();
				var pageBottom = pageTop + $(window).height();
				var elementTop = $(element).offset().top;
				var elementBottom = elementTop + $(element).height();

				if (fullyInView === true) {
					return ((pageTop < elementTop) && (pageBottom > elementBottom));
				} else {
					return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
				}
			}
			
			function clean_mex_obj(e){
				return {
					"id_mex": e.id_mex,
					"from_user":e.from_user,
					"to_user":e.to_user,
					"status":e.status,
					"date":e.date
				};
			}
			
			function associativeSize(obj) {
				var size = 0, key;
				for (key in obj) {
					if (obj.hasOwnProperty(key)) size++;
				}
				return size;
			}
			
			var update_success = true;
			var error_show = false;
			function update_messages(current_chat){
				LOG("chat update_messages ",[current_chat]);
				if($add.css("display")!="none" && typeof options.messages !== "undefined" && !error_show){
					if(!update_success && $container.html()==""){
						show_error(lang.error);
						error_show = true;
					}
				}
					
				if(typeof current_chat === "undefined"){
					var data = { chat_user : {userid:options.current_user.id} };
					var load = false;
				}else{
					var data = { chat_user : {userid:options.current_user.id, all:1} };
					var load = true;
				}
				A.request({
					id: "chat_user_"+options.current_user.id,
					load: load,
					data: data,
					success: function(e){
						new_size();
						update_success = true;
						for(var i in e){								
							if(e[i].from_user != options.current_user.id)
								var speaker = e[i].from_user;
							else
								var speaker = e[i].to_user;

							if(typeof options.messages[speaker] === "undefined")
								options.messages[speaker]={};
							options.messages[speaker][e[i].message] = clean_mex_obj(e[i]);
							options.messages[speaker].last_message = e[i].message;
							
							options.messages[speaker].counter = associativeSize(options.messages[speaker]);
						}
						show_all_messages();
						show_all_chat();
						
						if(options.locale){
							options.updated_messages(options.messages,function(up_mex){ 
								A.request({
									id: "get_read_messages",
									load:false,
									data: {get_read_messages: options.current_user.id},
									success: function(e){
										var id_list_del = [];
										for(var i in e){
											if(options.current_user.id == e[i].from_user)
												var other_user = e[i].to_user;
											else
												var other_user = e[i].from_user;
											
											if(typeof up_mex[other_user] !== "undefined" && typeof up_mex[other_user][e[i].message] !== "undefined" && up_mex[other_user][e[i].message].status == "3")
												id_list_del.push(e[i].id_mex);
										}
										
										if(id_list_del.length){
											A.request({
												id: "delete_read_messages",
												load:false,
												data: {delete_read_messages: id_list_del}
											});
										}
									}
								});
							});
						}
					},
					error: function(){
						update_success = false;
					}
				});
			}
			
			var just_read = [];
			function set_read_message(){
				LOG("chat set_read_message ",[]);
				var chat_id = $("#chat_send").attr("attr-id");
				for(var i in unread[chat_id]){ 
					//console.log("-"+unread[chat_id][i]);
					if (isElementInView($('.talk-bubble[attr-srv-id="'+unread[chat_id][i]+'"]'), false) && isTabVisible()) {
						//console.log("--Visible");
						if(just_read.indexOf(unread[chat_id][i])==-1){
							//console.log("---Insert");
							//console.log("-"+unread[chat_id][i]);
							A.request({
								id: "message_read_"+chat_id,
								load:false,
								data:{message_read:{id_mex:unread[chat_id][i]}},
								success: function(e){
									just_read.push(e[0]);
								}
							});
						}
					}
				}
			}
			
			function search(open){
				LOG("chat search ",[open]);
				if($search_input.css("display")=="none" && open){
					$search_input.css("display", "inline");
					$search_input.focus();
				} else {
					$search_input.css("display", "none");
					
					var selector = "";
					if($(".chat_user").length)
						var selector = ".chat_user";
					if($(".talk-bubble").length)
						var selector = ".talk-bubble";
					
					if(selector!=""){
						$(selector).removeClass("chat_hidden");
						$(selector+':not(:contains("'+$search_input.val()+'"))').each(function(){
							$(this).addClass("chat_hidden");
						});
					}
					if(open)
						$("#chat_message").scrollTop(0);
				}
			}
			
			var set_menu_last_type;
			function set_menu(type){
				if(type != set_menu_last_type)
					$menu.css("display","none");
				if(type == "main"){
					$search.css("display","block");
					$profile.css("display","block");
					$block.css("display","none");
					$unblock.css("display","none");
					$back.css("display","none");
					if(typeof options.custom_item_menu !== "undefined")
						$custom.css("display","block");
				}
				if(type == "chat"){
					$search.css("display","block");
					$profile.css("display","none");
					$block.css("display","block");
					$unblock.css("display","none");
					$back.css("display","inline");
					if(typeof options.custom_item_menu !== "undefined")
						$custom.css("display","block");
				}
				if(type == "chat_block"){
					$search.css("display","block");
					$profile.css("display","none");
					$block.css("display","none");
					$unblock.css("display","block");
					$back.css("display","inline");
					if(typeof options.custom_item_menu !== "undefined")
						$custom.css("display","block");
				}
				if(type == "generic"){
					$search.css("display","none");
					$profile.css("display","block");
					$block.css("display","none");
					$unblock.css("display","none");
					$back.css("display","inline");
					if(typeof options.custom_item_menu !== "undefined")
						$custom.css("display","block");
				}
				set_menu_last_type = type;
			}
			
			function block_unblock(type){
				LOG("chat block_unblock ",[type]);
				var chat_id = $("#chat_send").attr("attr-id");
				
				if(type == "block"){
					var mex_for_me = mex_for_you = "[BLOCK_USER]";
					set_menu("chat_block");
				}
				if(type == "unblock"){
					var mex_for_me = mex_for_you = "[UNBLOCK_USER]";
					set_menu("chat");
				}

				A.request({
					id: "send_message_"+mex_for_me,
					load:false,
					data: { send_message : {from:options.current_user.id, to:chat_id, mex_for_you:mex_for_you, mex_for_me:mex_for_me} }
				});
			}

			function resize_image(img, max_size) {
				LOG("chat resize_image ",[img, max_size]);
				// create an off-screen canvas
				var canvas = document.createElement('canvas'),
				ctx = canvas.getContext('2d');
					
				var image = new Image();
				image.onload = function() {
					if (image.width > image.height){
						var width = max_size;
						var height = (image.height / image.width ) * width;
					} else {
						var height = max_size;
						var width = (image.width / image.height ) * height;
					}

					canvas.width = width;
					canvas.height = height;
					ctx.drawImage(image, 0, 0, width, height);
					
					send_profile_data(canvas.toDataURL());
				};
				image.src = img;
			}
			
			function send_profile_data(img){
				options.profile_update({
					"name": $("#profile_name"),
					"phrase": $("#profile_phrase"),
					"img": img
				});
			}
			
			//generate private and public key
			var private_key = cryptico.generateRSAKey(options.current_user.key, 1024);
			var public_key = cryptico.publicKeyString(private_key);
			options.set_public_key(public_key);
			
			//add html element
			$self.css("position","relative");
			$self.css("height",options.height);
			
			var $header = $('<div id="chat_header">').appendTo($self);
			var $container = $('<div id="chat_container">').appendTo($self);
			$container.html('<div id="all_chat"></div>');
			var $loading = $('<div id="loading" style="display:none;"></div>').appendTo($self);
			$('<div class="la-ball-clip-rotate-pulse la-dark la-3x"><div></div><div></div></div>').appendTo($loading);
			
			var $back = $('<div id="chat_back" class="fa fa-arrow-left" style="display:none;">').appendTo($header);
			var $menubtn = $('<div id="chat_menu" class="fa fa-ellipsis-v">').appendTo($header);
			var $menu = $('<div id="chat_menu_block" style="display:none;">').appendTo($menubtn);
			
			var $search = $('<div id="chat_search">'+lang.search+'</div>').appendTo($menu);
			var $search_input = $('<input id="chat_search_input" style="display:none;" />').appendTo($header);
			
			var $profile = $('<div id="chat_profile">'+lang.profile+'</div>').appendTo($menu);
			var $block = $('<div id="chat_block">'+lang.block+'</div>').appendTo($menu);
			var $unblock = $('<div id="chat_unblock" style="display:none;">'+lang.unblock+'</div>').appendTo($menu);
			if(typeof options.custom_item_menu !== "undefined")
				var $custom = $('<div id="chat_custommenu">'+options.custom_item_menu[0]+'</div>').appendTo($menu);
			
			set_menu("main");
			
			var $add = $('<div id="chat_add" class="fa fa-plus-circle">').appendTo($self);
			
			for(var i in options["messages"])
				options["messages"][i]["from_counter"] = undefined;
			
			if(typeof options["messages"] === "undefined")
				options.messages={};
			
			new_size();
			$self.resize(function(){
				new_size();
			});
			
			//menu
			$menubtn.click(function(){
				if($menu.css("display") == "none")
					$menu.css("display","block");
				else
					$menu.css("display","none");
			});
			
			//custom menu item
			if(typeof options.custom_item_menu !== "undefined"){
				$custom.click(function(){
					set_menu("generic");
					$container.html('<div id="chat_custom_content">'+options.custom_item_menu[1]+'</div>');
				});
			}
			
			//edit profile
			$profile.click(function(){
				LOG("chat $profile.click ",[]);
				set_menu("generic");
				$container.html(''+
					'<div id="profile_container">'+
						lang.name+'<br />'+
						'<input type="text" id="profile_name" value="'+options.current_user.name+'" /><br /><br />'+
						lang.message+'<br />'+
						'<input type="text" id="profile_phrase" value="'+options.current_user.phrase+'" /><br /><br />'+
						lang.photo+'<br />'+
						'<label id="custom-file-upload">'+
							'<img src="'+options.current_user.img+'" /><br />'+
							'<div id="icon_change_img" style="background:'+options.color[0]+';">'+
								'<span class="fa fa-camera"></span>'+
							'</div>'+
							'<input type="file" accept="image/*" id="profile_img" /><br /><br />'+
						'</label>'+
						'<a class="button" id="edit_profile_btn" style="background:'+options.color[0]+';">'+lang.save+'</a>'+
					'</div>'+
				'');
			});

			//edit profile action
			$(document).delegate("#edit_profile_btn","click",function(){
				LOG("chat #edit_profile_btn.click ",[]);
				var newfile = document.getElementById('profile_img').files[0];
				if(typeof newfile !== "undefined"){
					var fr = new FileReader();
					fr.readAsDataURL(document.getElementById('profile_img').files[0]);
					
					fr.addEventListener("load", function(e) {
						resize_image(e.target.result, 200);
					});
				} else {
					send_profile_data("");
				}
			});
			
			//block user
			$block.click(function(){
				LOG("chat $block.click ",[]);
				block_unblock("block");
			});
			$unblock.click(function(){
				LOG("chat $unblock.click ",[]);
				block_unblock("unblock");
			});

			//add new chat button
			$add.click(function(){
				LOG("chat $add.click ",[]);
				if(options.view == "map"){
					$container.html('<div id="chatmap" style="width:100%; height:'+$("#chat_container").height()+'px;"></div>');
					chatmap();
				}else
					$container.html(userlist);

				$add.css("display","none");
				set_menu("generic");
			});
			
			//back button
			$back.click(function(){
				LOG("chat $back.click ",[]);
				if($("#chat_send").length != 0){
					var chat_id = $("#chat_send").attr("attr-id");					
					if(typeof options["messages"][chat_id] !== "undefined")
						options["messages"][chat_id]["from_counter"] = undefined;
				}
				
				set_menu("main");
				$container.html('<div id="all_chat"></div>');
				$add.css("display","inline");
				$search_input.val("");
				show_all_chat();
			});
			
			//search button
			$search.click(function(){
				search(true);
			});
			
			//open chat
			$(document).delegate(".chat_user","click",function(){
				LOG("chat .chat_user.click ",[]);
				var chat_id = $(this).attr("attr-id");
				
				set_menu("chat");
				
				$container.html("");
				$add.css("display","none");

				var $message = $('<div id="chat_message">').appendTo($container);
				$('<div id="empty_space" style="height:100%;">').appendTo($message);
				$('<div id="chat_new_message">').appendTo($container);
				insert_mex_form(chat_id);
				
				if(typeof options.chat_open !== "undefined")
					options.chat_open(chat_id);
				
				$("#chat_message").scroll(function(){
					set_read_message();
					
					clearTimeout($.data(this, 'scrollTimer'));
					$.data(this, 'scrollTimer', setTimeout(function() {
						if($search_input.val()!="")
							return false;
						
						if($("#chat_message").scrollTop() < scrolltopload){
							options["messages"][chat_id]["from_counter"] -= options.load_message;
							
							if(options["messages"][chat_id].from_counter < 0)
								options["messages"][chat_id].from_counter = 0;
							
							show_all_messages();
						}
					}, 250));
				});

				show_all_messages();
			});
			
			//send message
			var waiting_mex = {};
			$(document).delegate("#chat_send","click",function(){
				LOG("chat #chat_send.click ",[]);
				var get_input_mex = $("#chat_new_message .emoji-wysiwyg-editor").html();
				//get_input_mex = get_input_mex.replace(/(<([^>]+)>)/ig,"");
				get_input_mex = get_input_mex.trim();
				get_input_mex = get_input_mex.replace(/<div>/g,"");
				get_input_mex = get_input_mex.replace(/<\/div>/g,"");
				get_input_mex = get_input_mex.replace(/(^<br>|<br>$)/g,"");
				
				var chat_id = $(this).attr("attr-id");
				if(get_input_mex != ""){
					var mex_for_you = cryptico.encrypt(get_input_mex, options.list[chat_id].public_key).cipher;
					var mex_for_me = cryptico.encrypt(get_input_mex, public_key).cipher;

					var $mex_in_wait = render_message(get_input_mex, "wait", 1);
					insert_mex_form(chat_id);
					
					if(typeof waiting_mex[mex_for_me] === "undefined")
						waiting_mex[mex_for_me] = $mex_in_wait;

					$("#chat_new_message .emoji-wysiwyg-editor").html("");
					A.request({
						id: "send_message_"+mex_for_me,
						load:false,
						data: { send_message : {from:options.current_user.id, to:chat_id, mex_for_you:mex_for_you, mex_for_me:mex_for_me} },
						success: function(e){
							$mex_in_wait.attr("attr-srv-id",e.id);
							change_status(e.id,1);
							if(typeof waiting_mex[mex_for_me] !== "undefined")
								delete waiting_mex[mex_for_me];
						}
					});
				}
			});
			
			document.addEventListener("backbutton", function(e){
				if($back.css("display")=="inline")
					$back.click();
				else
					navigator.app.exitApp();
			}, false);

			$(document).keypress(function(e) {
				if(e.which == 13) {
					$("#chat_send").click();
					search(false);
				}
			});

			isTabVisible(function(){
				set_read_message();
			});
			
			setInterval(function(){
				update_messages();
			},3000);
			
			setInterval(function(){
				set_read_message();
			},500);
			
			update_messages(-1);
		});
	};
}) ( jQuery );
