/* globals V: true */
require(["modules/jquery-mozu",'modules/dnd-token',"modules/mc-cookie"],
function ($,DNDToken,McCookie) {

	$(function(){
		var haveMc = false;
		// non-bundles
		$("img[data-fulldndtoken]").each(function(){
			var fulldndtoken = JSON.parse($(this).attr("data-fulldndtoken").replace(/!/gi,'"'));// in hyprlive, couldn't figure out how to escape quote with single quote but I could replace it with !
			//console.log(fulldndtoken);
			var info = DNDToken.getTokenData(fulldndtoken);
			if(info.type ==="mc"){
				// no action, this.getMcImages will fill it in based off of persType being set in 
				haveMc = true;
			}
			else{
				if(info.src){
					$(this).attr("src",info.src);
				}
			}
			$(this).attr("data-mz-token-type",info.type);
			$(this).attr("data-mz-token",info.token);
		});
		
		// bundle components
		$("[data-fulldndtoken-bundle]").each(function(){
			var fulldndtoken = JSON.parse($(this).attr("data-fulldndtoken-bundle").replace(/!/gi,'"'));// in hyprlive, couldn't figure out how to escape quote with single quote but I could replace it with !
			
			$(this).find("img[data-productcode]").each(function(){
				var productCode = $(this).attr("data-productcode");
				console.log(productCode);

				var info = DNDToken.getTokenData(fulldndtoken,productCode);
				console.log(info);
				if(info.type ==="mc"){
					// no action, this.getMcImages will fill it in based off of persType being set in 
					haveMc = true;
				}
				else{
					if(info.src){
						$(this).attr("src",info.src);
					}
				}
				$(this).attr("data-mz-token-type",info.type);
				$(this).attr("data-mz-token",info.token);
			});
		});
		
		if(haveMc){
			McCookie.getMcImages();
		}
	});
});
