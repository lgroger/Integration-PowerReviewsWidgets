require(["modules/backbone-mozu","modules/api","hyprlive","hyprlivecontext","modules/jquery-mozu","underscore","modules/added-to-cart","modules/models-product","modules/cart-monitor","modules/soft-cart"],function(o,t,e,u,r,d,n,a,i,c){r(function(){r("#addToCartLink").on("click",function(){var o=require.mozuData("customer"),t=o.orderHistory.items[0].items;r.each(t,function(o,t){console.log(t);var e=new a.Product(t.product);e.set("quantity",t.quantity),e.addToCart(),i.addToCount(e.get("quantity")),c.update(),window.location.href="/request-quote"})})})});