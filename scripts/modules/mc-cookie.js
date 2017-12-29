define(["modules/jquery-mozu"],
function ($) {
	
/* 
	cookie string should be set in this format: "anon-userId-userToken" where anon is 1 (true) or 0 (false)
	ex. "0-1000-eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJodWJVc2VySWQiOiI4MjBkNDA0OS1mYmMxLTQwNjQtOGI5Zi00ZTY0Y2IzODA4MTAiLCJzdG9yZUlkIjoic2hpbmRpZ3otc3RhZ2luZyIsImhhc0FsaWFzZXMiOmZhbHNlLCJleHAiOjE1MTQ1NzY5NDl9.rN1_XVvWxVwpcHhogfEgLzBmL5p2U6Q8HrybFkbhoDN-BvKjeMRIep_-Lrvvsv3wVMcFVjG2ujG1bMwhwFEN4w"
*/
	var cnt = 0; // so we don't get stuck in infinite loop
	var cookieKey = "mc-user-token";
	var setCookie = function(user,userToken){ // user is pagecontext.user object, userToken is value from mediaclip
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
			var userToken = mcCookie.substr(mcCookie.indexOf("-",2)+1-mcCookie.length);

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
	
	var getToken = function(user,callback){ // user is pagecontext.user object
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
			return cookie.userToken;
		}
		else{
			// make api call to get a new one and call callback ...
			$.ajax({
				url: "/get-personalization-usertoken",
				dataType:"json",
				success:function(data){
					//console.log(data);
					console.log(cnt);
					setCookie(user,data.userToken);
					if(typeof callback !== "undefined" && cnt <= 999){
						callback();
					}
				}
			});
		}
	};
	
	
	return {
		setCookie: setCookie,
		getValues: getValues,
		getToken: getToken
	};
	
	
});