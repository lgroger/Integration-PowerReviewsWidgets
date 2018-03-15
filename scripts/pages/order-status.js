require(['modules/backbone-mozu', 'hyprlive','modules/jquery-mozu','underscore',"modules/dnd-token"],
	function(Backbone, Hypr, $, _, DNDToken){
	$(function(){
		try{
			var orderHistory=require.mozuData("customer").orderHistory.items[0].items;
			_.each(orderHistory,function(ele,idx) {
				if(ele.product.productType!=="Bundle"){
					var dndToken=_.findWhere(ele.product.options,{'attributeFQN':Hypr.getThemeSetting('productAttributes').dndToken});
					if(dndToken!==undefined){
						try{
							var dnd = JSON.parse(dndToken.shopperEnteredValue);
							var info = DNDToken.getTokenData(dnd,null,true); // notice that useLocal (3rd parameter) is true
							if(info){
								$(".order-items-list").eq(idx).find(".mz-carttable-item-image").attr("src",info.src);
							}
						}
						catch(err){
							console.log(err);
						}
					}
				}
			});
		}catch(err){
			console.log(err);
		}
	});
});