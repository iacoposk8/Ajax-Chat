( function($) {
	jQuery.fn.chat = function(options) {
		options.messages = {};
		options.current_user = {token: options.current_user};
		if(typeof options.load_message === "undefined")
			options.load_message = 100;

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
		var last_gps_position = [];
		var SELFCHAT = this;
		var users = {};
		var groups = {};

		String.prototype.hexEncode = function(){
		    var hex, i;

		    var result = "";
		    for (i=0; i<this.length; i++) {
		        hex = this.charCodeAt(i).toString(16);
		        result += ("000"+hex).slice(-4);
		    }

		    return result
		}

		String.prototype.hexDecode = function(){
		    var j;
		    var hexes = this.match(/.{1,4}/g) || [];
		    var back = "";
		    for(j = 0; j<hexes.length; j++) {
		        back += String.fromCharCode(parseInt(hexes[j], 16));
		    }

		    return back;
		}
		
		function html_row(type,row,phrase){
			if(typeof row !== "undefined"){
				if(typeof phrase === "undefined")
					phrase = "";

				if(type == "groups")
					phrase = phrase.hexDecode();
				
				return '<div class="chat_user" attr-'+type+'-id="'+row.id+'"><img class="chat_user_img" src="'+row.img+'" /><span class="chat_username">'+row.name+'</span><br /><span class="chat_phrase">'+phrase+'</span><div class="chat_new_message_sym fas fa-envelope"></div></div>';
			}
		}

		function chatmap() {
			LOG("chat chatmap ",[]);

			if(last_gps_position.length == 2){
				var latlng = new google.maps.LatLng(last_gps_position[0], last_gps_position[1]);
			} else
				var latlng = new google.maps.LatLng(48.1034995,12.262864);
			var options = { 
				maxZoom: 20,
				minZoom: 12,
				zoom: 12, 
				center: latlng, 
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			
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
			
			//limit area navigation
			if(last_gps_position.length == 2){
				first_center = true;
				
				//0.1 is 11km more or less
				var strictBounds = new google.maps.LatLngBounds(
					new google.maps.LatLng(last_gps_position[0] - 0.3, last_gps_position[1] - 0.3),
					new google.maps.LatLng(last_gps_position[0] + 0.3, last_gps_position[1] + 0.3)
				);
					
				google.maps.event.addListener(map, 'dragend', function () {
					if (strictBounds.contains(map.getCenter())) return;

					var c = map.getCenter(),
						x = c.lng(),
						y = c.lat(),
						maxX = strictBounds.getNorthEast().lng(),
						maxY = strictBounds.getNorthEast().lat(),
						minX = strictBounds.getSouthWest().lng(),
						minY = strictBounds.getSouthWest().lat();

					if (x < minX) x = minX;
					if (x > maxX) x = maxX;
					if (y < minY) y = minY;
					if (y > maxY) y = maxY;

					map.setCenter(new google.maps.LatLng(y, x));
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
			$('<link rel="preconnect" href="https://fonts.gstatic.com">').insertAfter($("#chatscript"));
			$('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato&display=swap">').insertAfter($("#chatscript"));
			$('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css">').insertAfter($("#chatscript"));
			
			var langs = {
				"it": {
					"error": "Errore durante la connessione al server, controlla la tua connessione a internet o riprova in un secondo momento.",
					"profile": "Profilo",
					"block": "Blocca",
					"unblock": "Sblocca",
					"name": "Nome",
					"group_name": "Nome gruppo",
					"message": "Messaggio",
					"photo": "Foto",
					"save": "Salva",
					"nobody": "Non ci sono persone nelle vicinanze, riprova tra qualche secondo",
					"new_group": "Nuovo gruppo",
					"add_users": "Aggiungi partecipanti",
					"added_to_group": "Sei stato aggiunto al gruppo",
					"group_error": "Seleziona i partecipanti al gruppo o un nome"
				},
				"en": {
					"error": "Error connecting to server, checking your internet connection, or try again later.",
					"profile": "Profile",
					"block": "Block",
					"unblock": "Unlocks",
					"name": "Name",
					"group_name": "Nome gruppo",
					"message": "Message",
					"photo": "Photo",
					"save": "Save",
					"nobody": "There are no people nearby, try again in a few seconds",
					"new_group": "New group",
					"add_users": "Add attendees",
					"added_to_group": "You have been added to the group",
					"group_error": "Select the group participants or a name"
				}
			};
			
			var lang = langs[options.lang];
			
			/*function new_size(){
				var H = window.innerHeight - 10 - options.subtract_height;
				var h = $header.outerHeight();
				if(h == 0)
					h = 80
				$self.height(H);
				$container.outerHeight(H - h);
				$("#chat_message").outerHeight($container.height() - $("#chat_new_message").outerHeight());
			}*/
			function maxHeight(elem){
				if(elem.length){
					if(typeof elem[0].style === "undefined" || elem[0].style.height == "")
						elem.css("height", "100%");
					maxHeight(elem.parent());
				}
			}
			maxHeight($self.parent());
			$self.css("max-height", "100%");
			
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

			var private_key = 0
			var public_key = 0;

			A.request({
				id: "get_users",
				load:false,
				data:{get_users:{token: options.current_user.token, public_key: public_key}},
				success: function(list){
					LOG("chat get_users ",[list]);
					users = list;
					if(options.view == "map"){
						last_gps_position = gps;
						coords_list = [];
						for(var i in list){
							if(list[i].available){
								coords_list.push(list[i]);
							}
						}
					}
					userlist = "";
					for(var i in list){
						if(typeof list[i].current_user !== "undefined"){
							var tkn = options.current_user.token;
							options.current_user = list[i];
							options.current_user.token = tkn;
							//update_messages();
							private_key = cryptico.generateRSAKey(options.current_user.id, 1024);
							public_key = cryptico.publicKeyString(private_key);

							A.request({
								id: "public_key",
								load:false,
								data:{public_key:{token: options.current_user.token, key: public_key}},
								success: function(list){
									//
								}
							});
						} else {
							if(list[i].available)
								userlist += html_row("users", list[i],list[i].phrase);
						}
					}
				}
			});

			function messages_pack(mex, id_group){
				var users = groups[id_group].users;
				var ret = [];
				for(var i in users)
					ret.push({user:users[i].id_user, mex: cryptico.encrypt(mex, users[i].public_key).cipher});
				return ret;
			}

			function get_groups(callback){
				A.request({
					id: "get_groups",
					load:false,
					data: { get_groups : {token: options.current_user.token} },
					success: function(e){
						for(var i in e){
							group_id = e[i]["id"];
							if(typeof groups[group_id] === "undefined")
								groups[group_id] = {};
							groups[group_id] = e[i];
							change_group(e[i], false);
						}
						if(typeof callback !== "undefined")
							callback();
					}
				});
			}
				
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
			
			function render_message(mex, srvid, fromto, status, date, user_id, user_name){
				LOG("chat render_message ",[mex, srvid, fromto, status, date, user_id, user_name]);
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

					var $block_mex = $(block_mex).appendTo($("#chat_message"));

					var status_elem = "";
					if(fromto && srvid != "robot")
						status_elem = '<div class="chat_info"><div class="chat_date">'+date+'</div><div class="chat_status"><span class="fa fa-clock"></span></div></div>';
					else
						status_elem = '<div class="chat_info"><div class="chat_date">'+date+'</div></div>';

					showname = '';
					if(typeof user_id !== "undefined")
						showname = '<div class="chat_user" attr-users-id="'+user_id+'">'+user_name+'</div>';

					$block_mex.html('<div class="talktext">'+showname+mex.hexDecode()+'</div>'+status_elem);
				}
				if(typeof status !== "undefined" && status != 0)
					change_status(srvid,status);
				
				/*if ($("#chat_message").prop('offsetHeight') < $("#chat_message").prop('scrollHeight'))
					$("#empty_space").height($("#empty_space").height()-($("#chat_message").prop('scrollHeight')-$("#chat_message").prop('offsetHeight')));*/
				
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
			
			function insert_mex_form(group_id){
				LOG("chat insert_mex_form ",[group_id]);
				$new_message = $("#chat_new_message");
				$new_message.html('<input type="email" id="chat-form-control" data-emojiable="true" data-emoji-input="unicode">');
						
				window.emojiPicker = new EmojiPicker({
				  emojiable_selector: '[data-emojiable=true]',
				  assetsPath: options.path + '/emoji-picker/img',
				  popupButtonClasses: 'fa fa-smile'
				});
				window.emojiPicker.discover();
				
				$new_message.append('<div id="chat_send" class="fas fa-paper-plane" attr-groups-id="'+group_id+'"></div>');
				$new_message.find(".emoji-wysiwyg-editor").focus();
				//new_size();
			}
			
			function change_status(id,stat){
				LOG("chat change_status ", [id,stat]);
				var $stat = $('div[attr-srv-id="'+id+'"]').find(".chat_status");
				if(stat=="1")
					$stat.html('<span class="fas fa-check"></span>');
				if(stat=="2")
					$stat.html('<span class="fas fa-check fa-check1"></span><span class="fas fa-check fa-check2"></span>');
				if(stat=="3")
					$stat.html('<span class="fas fa-check fa-check1" style="color:#3498db;"></span><span class="fas fa-check fa-check2" style="color:#3498db;"></span>');
			}

			var unread = {};
			function show_all_messages(){
				LOG("chat show_all_messages ",[]);
				var group_id = $("#chat_send").attr("attr-groups-id");

				//i am not in a chat, maybe i am in main view (list of available chat)
				if(typeof group_id === "undefined" || typeof options["messages"][group_id] === "undefined")
					return false;

				var this_mex = options["messages"][group_id];
				
				//pagination: set the first message to see (from_counter)
				if(typeof this_mex !== "undefined" && typeof this_mex["from_counter"] === "undefined")
					this_mex["from_counter"] = this_mex.order.length - options.load_message;
				
				if(typeof this_mex !== "undefined" && this_mex["from_counter"]<0)
					this_mex["from_counter"] = 0;
				
				//if(!update_success && (typeof this_mex === "undefined" || this_mex.length==0)){
				//	show_error(lang.error);
				//}
				
				var count = 0;
				var is_block = false;
				for(var i in this_mex.order){
					var id = this_mex.order[i].id
					if(this_mex.list[id].message.indexOf("[BLOCK_USER") !== -1 && just_open){
						if(this_mex.list[id].from_user == options.current_user.id)
							set_menu("chat_block");
						is_block = true;
						continue;
					}
					if(this_mex.list[id].message.indexOf("[UNBLOCK_USER") != -1 && just_open){
						if(this_mex.list[id].from_user == options.current_user.id)
							set_menu("chat");
						is_block = false;
						continue;
					}
					
					if(typeof this_mex.list[id].status === "undefined" || is_block)
						continue;
					
					count++;
					//console.log(count+" > "+options["messages"][group_id].from_counter);
					if(count > options["messages"][group_id].from_counter){
						//console.log("*******************************");
						if(options.current_user.id == this_mex.list[id].from_user)
							var fromto = 1;
						else
							var fromto = 0;
						
						var mex_decrypt = cryptico.decrypt(this_mex.list[id].message, private_key).plaintext;
						if(typeof groups[group_id].owner === "undefined" || groups[group_id].owner == 0 || options.current_user.id == this_mex.list[id].from_user)
							render_message(mex_decrypt, this_mex.list[id].id_mex, fromto, this_mex.list[id].status, this_mex.list[id].date);
						else
							render_message(mex_decrypt, this_mex.list[id].id_mex, fromto, this_mex.list[id].status, this_mex.list[id].date, this_mex.list[id].from_user, this_mex.list[id].from_user_name);
						
						if(this_mex.list[id].partial_status == "2" && this_mex.list[id].from_user != options.current_user.id){
							if(typeof unread[group_id] === "undefined")
								unread[group_id] = [];
							if(unread[group_id].indexOf(this_mex.list[id].id_mex) == -1)
								unread[group_id].push(this_mex.list[id].id_mex);
						}
					}
					if(typeof this_mex.list[id].status !== "undefined" && this_mex.list[id].status != 0)
						change_status(this_mex.list[id].id_mex,this_mex.list[id].status);
				}
	
				//$('.chat_message_block').each(function() {
				//	var $this = $(this);
				//	if($this.html().replace(/\s|&nbsp;/g, '').length == 0)
				//		$this.remove();
				//});
				
				just_open = false;
				//for(var i in waiting_mex)
				//	waiting_mex[i].appendTo($("#chat_message"));
			}
			
			var last_date_new_mex;
			var new_mex_notified = []; 
			var show_text_list = {};
			function show_all_chat(){
				LOG("chat show_all_chat ",[]);

				//I am not in main view (list of available chat), maybe I am in a chat view
				var group_id = $("#chat_send").attr("attr-groups-id");
				if(typeof group_id !== "undefined")
					return false;

				var last_mexs = [];
				//if($add.css("display")!="none" && $("#edit_profile_btn").length==0 && typeof options.messages !== "undefined" && $search_input.val()==""){
				//get all last messages
				for(var i in options.messages){
					var last_message_id = options.messages[i].order.slice(-1)[0].id;
					last_mexs.push(options.messages[i].list[last_message_id]);
				}
			
				//order last messages
				for(var i in last_mexs){
					for(var j in last_mexs){
						if(last_mexs[i].date > last_mexs[j].date){
							var z = last_mexs[i];
							last_mexs[i] = last_mexs[j];
							last_mexs[j] = z;
						}						
					}	
				}

				for(var i in last_mexs){
					new_mex = false;
					if(last_mexs[i].partial_status <= "2" && last_mexs[i].from_user != options.current_user.id){
						new_mex = true;
						
						if(typeof last_date_new_mex === "undefined" || last_date_new_mex < last_mexs[i].date){
							last_date_new_mex = last_mexs[i].date;
							var optnexmex = last_mexs[i];
								
							if(typeof groups[last_mexs[i].to_group] !== "undefined" && new_mex_notified.indexOf(last_mexs[i].id_mex) == -1){
								new_mex_notified.push(last_mexs[i].id_mex);
								optnexmex.mex = cryptico.decrypt(last_mexs[i].message, private_key).plaintext.hexDecode();
								options.new_mex(optnexmex);
							}
						}
					} 
					
					if(typeof groups[last_mexs[i].to_group] === "undefined")
						get_groups();
					else{
						$this_mex = $('[attr-groups-id = "'+last_mexs[i].to_group+'"]');
						
						if(typeof show_text_list[last_mexs[i].message] === "undefined"){
							var showtext = cryptico.decrypt(last_mexs[i].message, private_key).plaintext;
							show_text_list[last_mexs[i].message] = showtext;
						} else {
							var showtext = show_text_list[last_mexs[i].message];
						}
						if($this_mex.length == 0)
							$('#all_chat').append(html_row("groups", groups[last_mexs[i].to_group], showtext));

						if(new_mex){
							$this_mex.children(".chat_new_message_sym").css("display", "block");
							$this_mex.children(".chat_phrase").html(showtext.hexDecode());
							
							if(new_mex_notified.indexOf(last_mexs[i].id_mex) == -1){
								new_mex_notified.push(last_mexs[i].id_mex);
								var optnexmex = last_mexs[i];
								optnexmex.mex = cryptico.decrypt(last_mexs[i].message, private_key).plaintext.hexDecode();
								options.new_mex(optnexmex);
							}
						}
						else
							$this_mex.children(".chat_new_message_sym").css("display", "none");
					}
				}
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
				LOG("chat isElementInView ",[fullyInView]); //if i put "element" in log i get error
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
					"from_user_name":e.from_user_name,
					"to_group":e.to_group,
					"to_group_name":e.to_group_name,
					"img": e.img,
					"status":e.status,
					"partial_status": e.partial_status,
					"date":e.date,
					"message":e.message
				};
			}
			
			function addmex(e){
				for(var i in e){								
					var speaker = e[i].to_group;

					if(typeof options.messages[speaker] === "undefined")
						options.messages[speaker]={list:{}, ids:[], order:[]};

					if(options.messages[speaker].ids.indexOf(e[i].id_mex) == -1){
						options.messages[speaker].ids.push(e[i].id_mex);
						options.messages[speaker].order.push({id: e[i].id_mex, date: e[i].date});
					}
					
					options.messages[speaker].list[e[i].id_mex] = clean_mex_obj(e[i]);
				}

				for(var i in options.messages){
					options.messages[i].order.sort((a,b) => (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0)); 
				}
			}

			get_groups(function(){
				A.request({
					id: "get_last_message_from_all_chat"+options.current_user.id,
					load: true,
					data: { get_last_message_from_all_chat : {userid: options.current_user.token} },
					success: function(e){
						addmex(e);
						show_all_chat();
					}
				});
			});

			var eventSource = new EventSource(options.server + "?check_new_message[userid]=" + options.current_user.token);
			eventSource.addEventListener("message", function(e) {
				//new_size();
				e = JSON.parse(e.data);
				addmex(e);
				show_all_messages();
				show_all_chat();
			});
			
			/*var update_success = true;
			var error_show = false;
			function update_messages(current_chat){
				LOG("chat update_messages ",[current_chat]);

				if(typeof options.current_user.id === "undefined")
					return false;

				if($add.css("display")!="none" && typeof options.messages !== "undefined" && !error_show){
					if(!update_success && $container.html()==""){
						show_error(lang.error);
						error_show = true;
					}
				}
					
				if(typeof current_chat === "undefined")
					var load = false;
				else
					var load = true;

				A.request({
					id: "chat_user_"+options.current_user.id,
					load: load,
					data: { chat_user : {userid: options.current_user.token} },
					success: function(e){
						new_size();
						update_success = true;
						for(var i in e){								
							//if(e[i].from_user != options.current_user.id)
							//	var speaker = e[i].from_user;
							//else
								var speaker = e[i].to_group;

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
									data: {get_read_messages: options.current_user.token},
									success: function(e){
										var id_list_del = [];
										for(var i in e){
											if(options.current_user.id == e[i].from_user)
												var other_user = e[i].to_group;
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
			}*/
			
			var just_read = [];
			function set_read_message(){
				LOG("chat set_read_message ",[]);
				var group_id = $("#chat_send").attr("attr-groups-id");
				for(var i in unread[group_id]){ 
					//console.log("-"+unread[group_id][i]);
					if (isElementInView($('.talk-bubble[attr-srv-id="'+unread[group_id][i]+'"]'), false) && isTabVisible()) {
						//console.log("--Visible");
						if(just_read.indexOf(unread[group_id][i])==-1){
							//console.log("---Insert");
							//console.log("-"+unread[group_id][i]);
							A.request({
								id: "message_read_"+group_id,
								load:false,
								data:{message_read:{id_mex:unread[group_id][i], from: options.current_user.token}},
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
				//$search_input.css("display", "none");

				if($search_input.val() == ""){
					$(".search_icon.fa-search").css("display", "inline");
					$(".search_icon.fa-backspace").css("display", "none");
				} else {
					$(".search_icon.fa-search").css("display", "none");
					$(".search_icon.fa-backspace").css("display", "inline");
				}
				
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
			
			var set_menu_last_type;
			function set_menu(type){
				if(type != set_menu_last_type)
					$menu.css("display","none");
				if(type == "main"){
					$profile.css("display","block");
					$block.css("display","none");
					$unblock.css("display","none");
					$back.css("display","none");
					$custom.css("display","block");
					$name.css("display","none");
				}
				if(type == "chat"){
					$profile.css("display","none");
					$block.css("display","block");
					$unblock.css("display","none");
					$back.css("display","inline");
					$custom.css("display","block");
					$name.css("display","inline-block");
				}
				if(type == "chat_block"){ //when you block a user
					$profile.css("display","none");
					$block.css("display","none");
					$unblock.css("display","block");
					$back.css("display","inline");
					$custom.css("display","block");
					$name.css("display","inline-block");
				}
				if(type == "generic"){ //user menu for example
					$profile.css("display","block");
					$block.css("display","none");
					$unblock.css("display","none");
					$back.css("display","inline");
					$custom.css("display","block");
					$name.css("display","none");
				}
				set_menu_last_type = type;
			}
			
			function block_unblock(type){
				LOG("chat block_unblock ",[type]);
				var group_id = $("#chat_send").attr("attr-groups-id");
				
				if(type == "block"){
					var mex = "[BLOCK_USER"+Date.now()+"]";
					set_menu("chat_block");
				}
				if(type == "unblock"){
					var mex = "[UNBLOCK_USER"+Date.now()+"]";
					set_menu("chat");
				}

				A.request({
					id: "send_message_"+mex,
					load:false,
					data: { send_message : {from:options.current_user.token, to:group_id, mex:mex} }
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
			
			function get_chat_messages(group, callback){
				if(typeof options.messages[group].get_first_message === "undefined"){
					A.request({
						id: "get_chat_messages"+options.current_user.id,
						load: true,
						data: { 
							get_chat_messages: {
								userid: options.current_user.token, 
								group: group,
								n: [options.messages[group].order.length,options.load_message]
							} 
						},
						success: function(e){
							if(e.length == 0)
								options.messages[group].get_first_message = true;
							else
								addmex(e);
							callback();
						}
					});
				} else {
					callback();
				}
			}

			function start_user_chat(group_id){
				set_menu("chat");
				
				$container.html("");
				$add.css("display","none");
				
				$name.html(groups[group_id]["name"]);
				just_open = true;

				var $message = $('<div id="chat_message">').appendTo($container);
				//$('<div id="empty_space" style="height:100%;">').appendTo($message);
				$('<div id="chat_new_message">').appendTo($container);
				insert_mex_form(group_id);
				
				if(typeof options.chat_open !== "undefined")
					options.chat_open(group_id);

				$("#chat_message").scroll(function(){
					set_read_message();
					
					clearTimeout($.data(this, 'scrollTimer'));
					$.data(this, 'scrollTimer', setTimeout(function() {
						if($search_input.val()!="")
							return false;
						
						if($("#chat_message").scrollTop() < scrolltopload && $("#chat_message").get(0).scrollHeight > $("#chat_message").get(0).clientHeight){
							$("#chat_message .talk-bubble").remove();
							options["messages"][group_id]["from_counter"] -= options.load_message;
							
							if(options["messages"][group_id].from_counter < 0)
								options["messages"][group_id].from_counter = 0;


							get_chat_messages(group_id, function(){
								show_all_messages();

								if(options["messages"][group_id].from_counter > 0)
									scrollToElem($("#chat_message .talk-bubble").eq(options.load_message));
								else
									scrollToElem($("#chat_message .talk-bubble").eq(0));
							});
						}
					}, 250));
				});
					
				if(typeof options["messages"][group_id] !== "undefined" && options["messages"][group_id].order.length <= 1){
					get_chat_messages(group_id, function(){
						show_all_messages();
					});
				} else {
					show_all_messages();
				}
			}

			function change_group(e, enter){
				LOG("change_group",[e, enter]);
				group_id = e["id"];
				if(typeof groups[group_id] === "undefined")
					groups[group_id] = {};

				if(typeof groups[group_id]["name"] === "undefined")
					groups[group_id]["name"] = e["name"];
				if(typeof groups[group_id]["id"] === "undefined")
					groups[group_id]["id"] = e["id"];
				if(typeof groups[group_id]["img"] === "undefined")
					groups[group_id]["img"] = e["img"];
				if(typeof groups[group_id]["owner"] === "undefined")
					groups[group_id]["owner"] = e["owner"];	
				if(typeof groups[group_id]["users"] === "undefined")
					groups[group_id]["users"] = e["users"];	

				if(typeof enter === "undefined" || enter != false)
					start_user_chat(group_id);
			}

			function create_group(detail, callback){
				LOG("group",[detail.name]);
				if(
					(typeof detail.users !== "undefined" && detail.users.length == 0)
					&&
					(typeof detail.name !== "undefined" && detail.name.trim() == "")
				){
					LOG("group",[lang.group_error]);
					show_error(lang.group_error);
					return false;
				}
				
				//console.log(JSON.stringify({name: detail.name, img: detail.img, users: detail.users, id: detail.group_id, token: options.current_user.token}));
				A.request({
					id: "group_"+detail.name,
					load:true,
					data: { group : {name: detail.name, img: detail.img, users: detail.users, id: detail.group_id, token: options.current_user.token} },
					success: function(e){
						change_group(e);
						
						var mex = messages_pack(lang.added_to_group.hexEncode(), e["id"]);
						A.request({
							id: "send_message_"+mex,
							load:false,
							data: { send_message : {from:options.current_user.token, to:e["id"], mex:mex} },
						});

						if(typeof callback !== "undefined")
							callback(e["id"]);
					}
				});
			}

			//add html element
			$self.css("position","relative");
			
			var $chat_header = $('<div id="chat_header">').appendTo($self);
			var $header = $('<div id="chat_header_container">').appendTo($chat_header);
			var $container = $('<div id="chat_container">').appendTo($self);
			$container.html('<div id="all_chat"></div>');
			var $loading = $('<div id="loading" style="display:none;"></div>').appendTo($self);
			$('<div class="la-ball-clip-rotate-pulse la-dark la-3x"><div></div><div></div></div>').appendTo($loading);
			
			var $menubtn = $('<div id="chat_menu" class="fas fa-ellipsis-v">').appendTo($header);
			var $back = $('<div id="chat_back" class="fas fa-arrow-left" style="display:none;">').appendTo($header);
			var $name = $('<div id="chat_name_to" style="display:none;">').appendTo($header);
			var $custom_head = $(options.custom_head).appendTo($header);
			var $menu = $('<div id="chat_menu_block" style="display:none;">').appendTo($menubtn);
			
			//var $search = $('<div id="chat_search">'+lang.search+'</div>').appendTo($menu);
			var $chat_search = $('<div id="chat_search"></div>').appendTo($header);
			$('<i class="fas fa-search search_icon"></i><i class="fas fa-backspace search_icon" style="display:none;"></i>').appendTo($chat_search);
			var $search_input = $('<input id="chat_search_input" data-role="none" />').appendTo($chat_search);
			
			var $profile = $('<div id="chat_profile">'+lang.profile+'</div>').appendTo($menu);
			var $block = $('<div id="chat_block">'+lang.block+'</div>').appendTo($menu);
			var $unblock = $('<div id="chat_unblock" style="display:none;">'+lang.unblock+'</div>').appendTo($menu);
			if(typeof options.custom_item_menu === "undefined")
				options.custom_item_menu = ["Credits","<h1><strong>Credits</strong></h1>"];
			var $custom = $('<div id="chat_custommenu">'+options.custom_item_menu[0]+'</div>').appendTo($menu);
			
			set_menu("main");
			
			var $add = $('<div id="chat_add" class="fas fa-plus-circle">').appendTo($self);
			
			for(var i in options["messages"])
				options["messages"][i]["from_counter"] = undefined;
			
			/*new_size();
			$self.resize(function(){
				new_size();
			});*/


			//new group
			$(document).delegate("#new_group", "click", function(e){
				e.stopImmediatePropagation();
				var new_group = "";	
				new_group += '<div id="new_group_container">';
				new_group += lang.group_name + ' <input id="new_group_name" /> ';
				new_group += '<button class="button" id="save_group">'+lang.save+'</button><br /><br />' + lang.add_users;
				new_group += userlist;
				new_group += '</div>';
				$container.html(new_group);
			});

			//add users to group
			var users_group = [];
			$(document).delegate("#new_group_container .chat_user", "click", function(e){
				e.stopImmediatePropagation();
				users_group = [];

				if($(this).attr("class").indexOf("added") == -1){
					$(this).addClass("added");
				} else {
					$(this).removeClass("added");
				}

				$("#new_group_container .chat_user.added").each(function(){
					users_group.push($(this).attr("attr-users-id"));
				});
			});
			
			//menu
			$menubtn.click(function(){
				if($menu.css("display") == "none")
					$menu.css("display","block");
				else
					$menu.css("display","none");
			});
			
			//custom menu item
			$custom.click(function(){
				set_menu("generic");
				$container.html('<div id="chat_custom_content">'+options.custom_item_menu[1]+'<br />Chat powered by <a href="https://github.com/iacoposk8/Ajax-Chat">iacoposk8</a></div>');
			});
			
			//edit profile
			$profile.click(function(){
				LOG("chat $profile.click ",[]);
				set_menu("generic");
				$container.html(''+
					'<div id="profile_container">'+
						'<div id="chatedit_name_cont">'+
							lang.name+'<br />'+
							'<input type="text" id="profile_name" value="'+options.current_user.name+'" /><br /><br />'+
						'</div>'+
						'<div id="chatedit_phrase_cont">'+
							lang.message+'<br />'+
							'<input type="text" id="profile_phrase" value="'+options.current_user.phrase+'" /><br /><br />'+
						'</div>'+
						'<div id="chatedit_photo_cont">'+
							lang.photo+'<br />'+
							'<label id="custom-file-upload">'+
								'<img src="'+options.current_user.img+'" /><br />'+
								'<div id="icon_change_img" style="background:'+options.color[0]+';">'+
									'<span class="fas fa-camera"></span>'+
								'</div>'+
								'<input type="file" accept="image/*" id="profile_img" /><br /><br />'+
							'</label>'+
						'</div>'+
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
				
				if(userlist == "")
					show_error(lang.nobody);
				
				if(options.view == "map"){
					$container.html('<div id="chatmap" style="width:100%; height:'+$("#chat_container").height()+'px;"></div>');
					chatmap();
					$container.append(userlist);
				}else
					$container.html('<div id="new_group" class="chat_user"><i class="fas fa-plus-circle"></i> <span class="chat_username">'+lang.new_group+'</span></div>' + userlist);

				$add.css("display","none");
				set_menu("generic");
			});
			
			//back button
			var just_open = false;
			$back.click(function(){
				LOG("chat $back.click ",[]);
				if($("#chat_send").length != 0){
					var group_id = $("#chat_send").attr("attr-groups-id");					
					if(typeof options["messages"][group_id] !== "undefined")
						options["messages"][group_id]["from_counter"] = undefined;
				}
				
				just_open = false;
				set_menu("main");
				$container.html('<div id="all_chat"></div>');
				$add.css("display","inline");
				$search_input.val("");
				show_all_chat();
			});
			
			//search button
			//$search.click(function(){
			//	search(true);
			//});
			
			//open chat
			$(document).delegate(".chat_user","click",function(){
				LOG("chat .chat_user.click ",[]);
				var group_id = $(this).attr("attr-groups-id");
				if(typeof group_id === "undefined"){
					var user_id = $(this).attr("attr-users-id");
					A.request({
						id: "start_chat_"+user_id,
						load:true,
						data: { start_chat : {to_user: user_id, token: options.current_user.token} },
						success: function(e){
							change_group(e);
						}
					});
				} else {
					start_user_chat(group_id);
				}		
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
				get_input_mex = get_input_mex.hexEncode();
				
				var group_id = $(this).attr("attr-groups-id");
				if(get_input_mex != ""){
					var mex = messages_pack(get_input_mex, group_id);

					var $mex_in_wait = render_message(get_input_mex, "wait", 1);
					insert_mex_form(group_id);
					
					//if(typeof waiting_mex[mex_for_me] === "undefined")
					//	waiting_mex[mex_for_me] = $mex_in_wait;

					$("#chat_new_message .emoji-wysiwyg-editor").html("");
					A.request({
						id: "send_message_"+mex,
						load:false,
						data: { send_message : {from:options.current_user.token, to:group_id, mex:mex} },
						success: function(e){
							addmex(e);
							$mex_in_wait.attr("attr-srv-id",e[0].id_mex);
							change_status(e[0].id_mex,1);
							//if(typeof waiting_mex[mex_for_me] !== "undefined")
							//	delete waiting_mex[mex_for_me];
							
							if(typeof options.send_message !== "undefined"){
								options.send_message(group_id);
							}
						}
					});
				}
			});

			$(document).delegate("#save_group", "click", function(){
				create_group({"name": $("#new_group_name").val(), "users": users_group});
			});

			$(".fa-backspace.search_icon").click(function(){
				$search_input.val("");
				search(false);
			});

			var chat_search_is_open = false;
			$(".fa-search.search_icon").click(function(){
				if(chat_search_is_open != -1){
					if(chat_search_is_open === false){
						$( ".search_icon" ).css("color", "#444");
						$( "#chat_search_input" ).css("display", "inline");
						$( "#chat_search" )
							.css("border", "1px solid #666")
							.css("background", "#fff")
							.animate({width: "60%"}, {duration: 500, complete: function(){
								chat_search_is_open = true;
							}
						});
					} else {
						$( "#chat_search" ).animate({width: "0%"}, {duration: 500, complete: function(){
								chat_search_is_open = false;
								$( ".search_icon" ).css("color", "#fff");
								$( "#chat_search_input" ).css("display", "none");
								$( "#chat_search" )
									.css("border", "none")
									.css("background", "transparent");
							}
						});
						
					}
					chat_search_is_open = -1;
				}
			});

			SELFCHAT.group = function(detail, callback){
				LOG("SELFCHAT.group",[name]);
				return create_group(detail, callback);
			}

			SELFCHAT.send_new_message = function(group_id, botname, message){
				LOG("SELFCHAT.send_new_message",[group_id, botname, message]);

				message = "<strong>"+botname+":</strong> "+message;
				var mex= messages_pack(message.hexEncode(), group_id);

				A.request({
					id: "send_message_"+mex,
					load:false,
					data: { send_message : {from:options.current_user.token, to:group_id, mex:mex} }
				});
			}
			
			document.addEventListener("backbutton", function(e){
				if($back.css("display")=="inline")
					$back.click();
				//else
				//	navigator.app.exitApp();
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
			
			//setInterval(function(){
				//update_messages();
			//},3000);
			
			setInterval(function(){
				set_read_message();
			},500);
			
			
		});
	};
}) ( jQuery );
