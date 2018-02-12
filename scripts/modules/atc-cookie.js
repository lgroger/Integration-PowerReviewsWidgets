define(["modules/jquery-mozu"],
function ($) {
	
/* 
	cookie string should be pipe delimited list of cart lineitem ids
	ex. 
*/
	var cookieKey = "mc-atc";
	var cookieStr;
	var addAtc = function(atc){
		cookieStr+="|"+atc;
		var options = {
			secure:	false,
			path: "/"
		};
		
		$.cookie(cookieKey,cookieStr,options);
	};
	
	var needToFire = function(atc){
		if(!cookieStr){
			getValues();
		}
		if(cookieStr.indexOf(atc)>= 0){
			console.log("already fired");
			return(false);
		}
		else{
			addAtc(atc);
			console.log("need to fire");
			return(true);
		}
	};
	
	var getValues = function(){
		cookieStr = $.cookie(cookieKey);
		if(!cookieStr){
			cookieStr = "";
		}
		console.log(cookieStr);
	};

	return {
		needToFire: needToFire
	};
	
	
});