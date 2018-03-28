define(["modules/jquery-mozu"],
function ($) {
	
/* 
	cookie string should be set in this format: "anon|userId|expirationUtc|token" where anon is 1 (true) or 0 (false)
	ex. "0|1000|2015-01-15T10:14:00.0000000Z|eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJodWJVc2VySWQiOiI4MjBkNDA0OS1mYmMxLTQwNjQtOGI5Zi00ZTY0Y2IzODA4MTAiLCJzdG9yZUlkIjoic2hpbmRpZ3otc3RhZ2luZyIsImhhc0FsaWFzZXMiOmZhbHNlLCJleHAiOjE1MTQ1NzY5NDl9.rN1_XVvWxVwpcHhogfEgLzBmL5p2U6Q8HrybFkbhoDN-BvKjeMRIep_-Lrvvsv3wVMcFVjG2ujG1bMwhwFEN4w"
*/
	var mcHubLoaded = false; // track when mediaclip hub file has successfully loaded
	var mcHubInited = null; // user token the mediaclip was initialized with
	var cnt = 0; // so we don't get stuck in infinite loop
	var cookieKey = "mc-user-token";
	var token;
	var options = {
		secure:	false,
		path: "/"
	};
	var setCookie = function(newUserToken,expirationUtc){
		var user = require.mozuData('pagecontext').user;
		var str,userId;
		if(user.isAnonymous || user.accountId === 0){
			str = "1|";
			userId = user.userId;
		}
		else{
			str = "0|";
			userId = user.accountId;
		}
		str+=userId+"|";
		str+=expirationUtc+"|";
		str+=newUserToken;
		//console.log(str);
		
		$.cookie(cookieKey,str,options);
	};
	var getValues = function(){
		var mcCookie = $.cookie(cookieKey);
		if(mcCookie){
			var anonStr = mcCookie.substr(0,1);
			var anon;
			if(anonStr==="0"){
				anon=false;
			}
			else if(anonStr==="1"){
				anon=true;
			}
			//console.log(mcCookie);

			var userId = mcCookie.substr(2,mcCookie.indexOf("|",2)-2);
			var start = mcCookie.indexOf("|",2)+1;
			var expirationUtc = mcCookie.substr(start,mcCookie.indexOf("|",start)-start); // expirationUtc is name from mediaclip but it's actually ISO-8601 format

			// ISO-8601 regex - https://www.regextester.com/97766 
			if(!expirationUtc.match(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)$/)){
				expirationUtc = null;
			}
			
			start = mcCookie.indexOf("|",start)+1;
			token = mcCookie.substr(start-mcCookie.length);
			return {
				"token": token,
				"userId": userId,
				"anon": anon,
				"expirationUtc":expirationUtc
			};
		}
		else{
			return null;
		}
	};
	
	var getToken = function(callback){ // user is pagecontext.user object
		//console.log("getToken");
		
		var user = require.mozuData('pagecontext').user;
		cnt++; // keep count of how many times this is called so we don't get stuck in infinite loop
		var cookie = getValues();
		var userId;
		//console.log(cookie);
		//console.log(user);
		
		if(user.isAnonymous || user.accountId === 0){
			userId = user.userId;
		}
		else{
			userId = user.accountId.toString(); // numeric value must be converted to string so we can compare string to string below
		}
		
		if(cookie){
			if((user.isAnonymous || user.accountId === 0) === cookie.anon && cookie.userId === userId){
				//console.log(user);
				//console.log(cookie);
				// see if it's still valid
				if(cookie.expirationUtc){
					var d1 = new Date(); // now
					var d2 = new Date(cookie.expirationUtc); // expirationUtc is name from mediaclip but it's actually ISO-8601 format
					//console.log(cookie.expirationUtc); 
					//var nowISO = d1.toISOString();console.log(nowISO);
					//console.log(d1);
					//console.log(d2);
					if(d2 > d1){
						// still valid
						if(typeof callback !== "undefined" && cnt <= 999){
							callback(cookie.token);
						}
					}
					else{
						//expired
						renewToken(callback,cookie.expirationUtc);
					}
				}
				else{
					renewToken(callback);
				}
			}
			else if(!(user.isAnonymous || user.accountId === 0) && cookie.anon){
				// anonymous user was converted to logged in user
				convertToken(cookie,callback);
			}
			else{
				getNewToken(callback,userId);
			}
		}
		else{
			// make api call to get a new one and call callback ...
			getNewToken(callback,userId);
		}
	};
	
	var renewToken = function(callback,expirationUtc){
		//console.log("renewToken");
		$.post({
			url: '/renew-personalization',
			data:{"token":token,"expirationUtc":expirationUtc} // this is just so that request is unique by expirationUc since Promises are not supposed to repeat the exact requests (?)
		}).done(function(data){
			if(data.expirationUtc){
				token = data.token;
				setCookie(token,data.expirationUtc); // save for later
				//console.log(data);
				if(typeof callback !== "undefined" && cnt <= 999){
					callback(token);
				}
			}
			else{
				getNewToken(callback);
			}
		});
	};
	var convertToken = function(cookie,callback){
		//console.log("convertToken");
		$.ajax({
			url: "/get-personalization-usertoken",
			dataType:"json",
			data:{"anonymous": cookie.userId}
		}).done(function(data){
			//console.log(data);
			token = data.token;
			//console.log(cnt);
			setCookie(token,data.expirationUtc); // save for later
			if(typeof callback !== "undefined" && cnt <= 999){
				callback(token);
			}
		});
	};

	var getNewToken = function(callback,userId){
		//console.log("getNewToken");

		$.ajax({
			url: "/get-personalization-usertoken",
			dataType:"json",
			data: {"userId":userId} // this is just so that request is unique by userId since Promises are not supposed to repeat the exact requests (?)
		}).done(function(data){
			//console.log(data);
			token = data.token;
			//console.log(cnt);
			setCookie(token,data.expirationUtc); // save for later
			if(typeof callback !== "undefined" && cnt <= 999){
				callback(token);
			}
		});
	};
	
	var storedMCimages = []; // array of all project images we've already pulled down from Mediaclip
	var findMcSrc = function(token){
		for(var i=0;i<storedMCimages.length;i++){
			if(storedMCimages[i].token === token){
				//console.log('found mcsrc' + storedMCimages[i].src);
				return storedMCimages[i].src;
			}
		}
		//console.log('no find');
		return null;
	};
	var storeMcSrc = function(token, src){
		var newEntry = {"token":token,"src":src};
		storedMCimages.push(newEntry);
	};
	
	var hubcallback = function(callback){
		//console.log('hubcallback');
		if(mcHubInited !== token){
			//console.log(token);
			window.mediaclip.hub.init({storeUserToken:token, keepAliveUrl: "/renew-personalization"});
			mcHubInited = token;
		}
		if(typeof callback === "function"){
			callback();
		}
	};

	var initializeHub = function(callback){
		//console.log('initializeHub start');
		var newCallback = function(){
			//console.log('initializeHub callback');
			mcHubLoaded = true;

			getToken(hubcallback.bind(null,callback));
		};
		
		if(mcHubLoaded){
			// already loaded
			newCallback();
		}
		else{
			//console.log("getscript");
			// load it now
			$.getScript("//api.mediacliphub.com/scripts/hub.min.js").done(newCallback);
		}
	};
	
	var getProjectThumbnailSrc = function(projectId,callback){
		if(mcHubLoaded){		
			var mcsrc = findMcSrc(projectId);
			if(mcsrc){
				callback(mcsrc);
			}
			else{
				window.mediaclip.hub.getProjectThumbnailSrc(projectId).done(function(newsrc){
					// store for later
					storeMcSrc(projectId, newsrc);
					callback(newsrc,projectId);

				}).fail(function(jqXhr, textStatus, errorThrown){
					// need to get userId of original project and convert to migrate anonymous user to logged in user

					var user = require.mozuData('pagecontext').user;
					if(!(user.isAnonymous || user.accountId === 0) && errorThrown == "Forbidden"){
						//console.log(textStatus);
						//console.log(errorThrown);
						//console.log('isAnonymous false');

						$.ajax({
							url: '/mcpreview-error/'+projectId
						}).done(function(data){
							//console.log(data);
							token = data.token;
							setCookie(token,data.expirationUtc); // save for later
							hubcallback(callback);
						});

					}
					else{
						console.error('Failed loading project thumbnail for ' + projectId, textStatus, errorThrown);
						getNewToken(callback);
					}
				});
			}
		}
		else{
			// problem...
		}
	};

	var loopOverImages = function(projectList){
		var imgCallback = function(newsrc,projectId){
			$("img[data-mz-token-type='mc'][data-mz-token='"+projectId+"']").attr("src",newsrc);
		};

		for(var pid = 0; pid < projectList.length;pid++){
			var projectId = projectList[pid];
			getProjectThumbnailSrc(projectId,imgCallback);
		}

	};
	var getMcImages = function(projectList){
		//console.trace('getMcImages');
		//console.log(projectList);
		if($("img[data-mz-token-type='mc']").length > 0 || (projectList && projectList.length)){
			if(!projectList){
				projectList = [];
				// since we have different html for desktop vs mobile, gather up list of all tokens first to try to eliminate duplicate
				$("img[data-mz-token-type='mc']").each(function(){
					var projectId = $(this).attr("data-mz-token");
		
					if(projectList.indexOf(projectId) === -1){
						projectList.push(projectId);
					}
				});
			}
			
			initializeHub(loopOverImages.bind(null,projectList));
		}
	};

	// getMcImages() will get images from mediaclip hub script, getMcImageFromCache() will only look at what we've already pulled from mediaclip - due to lots of async calls firing rerendering of cart, many duplicate calls to mediaclip were being sent
	var getMcImagesFromCache = function(){
		//console.log('getMcImagesFromCache');
		$("img[data-mz-token-type='mc']").each(function(){
			var projectId = $(this).attr("data-mz-token");
			var mcsrc = findMcSrc(projectId);
			if(mcsrc){
				$(this).attr("src",mcsrc);
			}
			else{
				console.log('not found'+projectId);
			}
		});
	};

	var onUserLogin = function(callback){
		//console.log('onUserLogin');
		var cookie = getValues();
		if(cookie){
			var user = require.mozuData('pagecontext').user;
			if(!(user.isAnonymous || user.accountId === 0) && cookie.anon){
				// anonymous user was converted to logged in user
				convertToken(cookie,callback);
			}
			else{
				callback();
			}
		}
		else{
			callback();
		}
	};

	var deleteCookie = function(){
		//console.log('deleteCookie');
		var cookie = getValues();
		if(cookie){
			$.cookie(cookieKey,"",options);
		}
	};
	return {
		setCookie: setCookie,
		getToken:getToken,
		getMcImages: getMcImages,
		deleteCookie: deleteCookie,
		onUserLogin: onUserLogin,
		getMcImagesFromCache: getMcImagesFromCache
	};
	
	
});