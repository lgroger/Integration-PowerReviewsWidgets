require(['modules/backbone-mozu', 'modules/api', 'hyprlive', 'hyprlivecontext','modules/jquery-mozu','underscore','modules/added-to-cart','modules/models-product',"modules/cart-monitor","modules/soft-cart"],
	function(Backbone, Api, Hypr, HyprLiveContext, $, _, addedToCart, ProductModels, CartMonitor, SoftCart){
	$(function(){
		

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