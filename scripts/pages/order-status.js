require(['modules/backbone-mozu', 'modules/api', 'hyprlive', 'hyprlivecontext','modules/jquery-mozu','underscore','modules/added-to-cart','modules/models-product',"modules/cart-monitor","modules/soft-cart"],
	function(Backbone, Api, Hypr, HyprLiveContext, $, _, addedToCart, ProductModels, CartMonitor, SoftCart){
	$(function(){
		try{
			var orderHistory=require.mozuData("customer").orderHistory.items[0].items;
			_.each(orderHistory,function(ele,idx) {
				if(ele.product.productType!=="Bundle"){
					var dndToken=_.findWhere(ele.product.options,{'attributeFQN':Hypr.getThemeSetting('productAttributes').dndToken});
					if(dndToken!==undefined){
						var dnd=dndToken.shopperEnteredValue;
						if(dnd){
							var tokens=dnd.split(":");
							if(tokens.length>0){
								var finalDND=tokens[1].replace(/"/g, "").replace("}","");
								$(".order-items-list").eq(idx).find(".mz-carttable-item-image").attr("src",Hypr.getThemeSetting("dndEngineUrl")+"preview/"+finalDND+"?max=80");							
							}
						}
					}
				}
			});
		}catch(err){
			console.log(err);
		}
		
		$('#addToCartLink').on('click',function(e){
			var customer = require.mozuData('customer');
			var items = customer.orderHistory.items[0].items;
			$.each(items,function(i,item){
				console.log(item);
				var productModel = new ProductModels.Product(item.product);
	            productModel.set('quantity',item.quantity);
				productModel.addToCart();
				CartMonitor.addToCount(productModel.get('quantity'));
                SoftCart.update();
				window.location.href="/request-quote";
			});

		});
	});
});