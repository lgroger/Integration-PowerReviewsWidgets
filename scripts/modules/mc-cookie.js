define(["modules/jquery-mozu"],
function ($) {
	
/* 
	cookie string should be set in this format: "anon-userId-userToken" where anon is 1 (true) or 0 (false)
	ex. "0-1000-eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJodWJVc2VySWQiOiI4MjBkNDA0OS1mYmMxLTQwNjQtOGI5Zi00ZTY0Y2IzODA4MTAiLCJzdG9yZUlkIjoic2hpbmRpZ3otc3RhZ2luZyIsImhhc0FsaWFzZXMiOmZhbHNlLCJleHAiOjE1MTQ1NzY5NDl9.rN1_XVvWxVwpcHhogfEgLzBmL5p2U6Q8HrybFkbhoDN-BvKjeMRIep_-Lrvvsv3wVMcFVjG2ujG1bMwhwFEN4w"
*/
	var mcHubLoaded = false; // track when mediaclip hub file has successfully loaded
	var cnt = 0; // so we don't get stuck in infinite loop
	var cookieKey = "mc-user-token";
	var userToken;
	var setCookie = function(user){ // user is pagecontext.user object, userToken is value from mediaclip
		var str,userId;
		if(user.isAnonymous){
			str = "1-";
			userId = user.userId;
		}
		else{
			str = "0-";
			userId = user.accountId;
		}
		str+=userId+"-";
		str+=userToken;
		console.log(str);
		
		var options = {
			secure:	false,
			path: "/"
		};
		
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

			var userId = mcCookie.substr(2,mcCookie.indexOf("-",2)-2);
			userToken = mcCookie.substr(mcCookie.indexOf("-",2)+1-mcCookie.length);

			return {
				"userToken": userToken,
				"userId": userId,
				"anon": anon
			};
		}
		else{
			return null;
		}
	};
	
	var getToken = function(callback){ // user is pagecontext.user object
		console.log("getToken");
		
		var user = require.mozuData('pagecontext').user;
		cnt++; // keep count of how many times this is called so we don't get stuck in infinite loop
		var cookie = getValues();
		var userId;
		//console.log(cookie);
		//console.log(user);
		
		if(user.isAnonymous){
			userId = user.userId;
		}
		else{
			userId = user.accountId.toString(); // numeric value must be converted to string so we can compare string to string below
		}
		
		if(cookie && user.isAnonymous === cookie.anon && cookie.userId === userId){
		//	console.log('it matches!');
			if(typeof callback !== "undefined" && cnt <= 999){
				callback();
			}
		}
		else{
			// make api call to get a new one and call callback ...
			$.ajax({
				url: "/get-personalization-usertoken",
				dataType:"json",
				success:function(data){
					//console.log(data);
					userToken = data.userToken;
					console.log(cnt);
					setCookie(user); // save for later
					if(typeof callback !== "undefined" && cnt <= 999){
						callback();
					}
				}
			});
		}
	};
	
	var storedMCimages = [];
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
	
	var initializeHub = function(callback){
		console.log('initializeHub start');
		var newCallback = function(){
			console.log('initializeHub callback');
			mcHubLoaded = true;

			var hubcallback = function(){
				console.log('initializeHub newCallback hubcallback');
				window.mediaclip.hub.init({storeUserToken:userToken, keepAliveUrl: "/renew-personalization"});
				if(typeof callback === "function"){
					callback();    
				}
			};
			getToken(hubcallback);
		};
		
		if(mcHubLoaded){
			// already loaded
			newCallback();
		}
		else{
			console.log("getscript");
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
					callback(newsrc);

				}).fail(function(jqXhr, textStatus, errorThrown){
					console.error('Failed loading project thumbnail for ' + projectId, textStatus, errorThrown);
				});
			}
		}
		else{
			// problem...
		}
	};
	
	return {
		initializeHub: initializeHub,
		getProjectThumbnailSrc: getProjectThumbnailSrc
	};
	
	
});