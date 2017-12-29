define(['hyprlive'], function (Hypr) {    
	
	var getTokenData = function(dndTokenJson,productCode){ // pass in productCode if for a bundle component
        var dndEngineUrl = Hypr.getThemeSetting('dndEngineUrl');
		var tokenObj = {}; // object holding dnd codes
		var mcObj = {}; // object holding mediaclip codes
		var dndToken,mcToken; // variable to return
		var prdCode;
		
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
				return({"src":null,"token":mcToken,"type":"mc"});
			}
			dndToken = tokenObj[productCode];
			if(dndToken){
				return({"src":dndEngineUrl+'preview/'+dndToken,"token":dndToken});
			}
		}else{
			for(var mc in mcObj) {
				if (mcObj.hasOwnProperty(mc)) {
					mcToken = mcObj[mc];
					if(mcToken){
						return({"src":null,"token":mcToken,"type":"mc"});
					}  
				} 
			}
			for(var prop in tokenObj) {
				if (tokenObj.hasOwnProperty(prop)) {
					dndToken = tokenObj[prop];
					if(dndToken){
						return({"src":dndEngineUrl+'preview/'+dndToken,"token":dndToken,"type":"dnd"});
					}  
				} 
			}
		}
		return({"src":null,"token":null,"type":null});
	};
    return {
		getTokenData:getTokenData
    };
});