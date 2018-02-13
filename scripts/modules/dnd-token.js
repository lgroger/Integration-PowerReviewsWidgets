define(['hyprlive'], function (Hypr) {    
	
	var getTokenData = function(dndTokenJson,productCode,useMcLocal){
		// pass in productCode if for a bundle components only
		// if useMcLocal is passed in as true, then we'll return an image url for mediaclip images - this should only be passed in as true for confirmed orders since the intent is to donwload them from the stumps file server since we will store them longer than mediaclip will
        var dndEngineUrl = Hypr.getThemeSetting('dndEngineUrl');
		var mcImageLocation = Hypr.getThemeSetting('mcImageLocation'); // this will first look to stumps file server, if not found, it will fall back to api call to mediaclip which mediaclip discouraged us from using
		var tokenObj = {}; // object holding dnd codes
		var mcObj = {}; // object holding mediaclip codes
		var dndToken,mcToken; // variable to return
		var prdCode,designName;
		
		for(var sku in dndTokenJson){
			if(sku === "mc"){
				// if the key is "mc", look at its value in the same way that we do for the dnd token except any values found will be a token for mediaclip, not dnd
				var mcTokenJson = dndTokenJson[sku];
				for(var mcsku in mcTokenJson){
					if(mcsku.indexOf('@')!==-1){
						prdCode = mcsku.split('@')[0];
						mcObj[prdCode]=mcTokenJson[mcsku];
					}else{
						mcObj[mcsku]=mcTokenJson[mcsku];
					}
				}
			}
			else if(sku === "designName"){ // used to store project name when saving to wishlist
				designName = dndTokenJson[sku];
			}
			else if(sku.indexOf('@')!==-1){
				// if "@" present, that means it's in this format "KIBO-PROUDCT-CODE@MFGPARTNUM"
				prdCode = sku.split('@')[0];
				tokenObj[prdCode]=dndTokenJson[sku];
			}else{
				tokenObj[sku]=dndTokenJson[sku];
			}
		}

		if(productCode){
			mcToken = mcObj[productCode];
			if(mcToken){
				if(useMcLocal){
					return({"src":mcImageLocation+mcToken,"token":mcToken,"type":"mc"});
				}
				else{
					return({"src":null,"token":mcToken,"type":"mc"});
				}
			}
			dndToken = tokenObj[productCode];
			if(dndToken){
				return({"src":dndEngineUrl+'preview/'+dndToken,"token":dndToken,"designName":designName});
			}
		}else{
			for(var mc in mcObj) {
				if (mcObj.hasOwnProperty(mc)) {
					mcToken = mcObj[mc];
					if(mcToken){
						if(useMcLocal){
							return({"src":mcImageLocation+mcToken,"token":mcToken,"type":"mc","designName":designName});
						}
						else{
							return({"src":null,"token":mcToken,"type":"mc","designName":designName});
						}
					}  
				} 
			}
			for(var prop in tokenObj) {
				if (tokenObj.hasOwnProperty(prop)) {
					dndToken = tokenObj[prop];
					if(dndToken){
						return({"src":dndEngineUrl+'preview/'+dndToken,"token":dndToken,"type":"dnd","designName":designName});
					}  
				} 
			}
		}
		return({"src":null,"token":null,"type":null,"designName":null});
	};
    return {
		getTokenData:getTokenData
    };
});