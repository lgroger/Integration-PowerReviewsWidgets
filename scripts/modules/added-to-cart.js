define(
[
    "modules/jquery-mozu",
    "underscore",
    'modules/backbone-mozu',
    "hyprlive",
	"modules/dnd-token",
	"modules/cart-monitor",
	"modules/mc-cookie"
], function ($, _, Backbone, Hypr,DNDToken, CartMonitor,McCookie) {
	var productAttributes = Hypr.getThemeSetting('productAttributes');
    var AddedToCartOverlay = Backbone.MozuView.extend({
        templateName: 'modules/product/added-to-cart-overlay',
        additionalEvents: {
            "click #mz-added-to-cart-close": "closeView",
            "click #mz-go-to-cart": "jumpToCart"
          /*  "click #mz-go-to-checkout": "jumpToCheckOut" */
        },
        closeView: function(e) {
            if(e.target !== e.currentTarget) return;
            $('#mz-added-to-cart').fadeOut(350);
            $('#mz-added-to-cart').remove();
        },
        jumpToCart: function() {
            //window.location.href = "/cart";
        },
    /*    jumpToCheckOut: function() {
            window.location.href = "/cart";
        }, */
        render: function () {
            var me = this;
            Backbone.MozuView.prototype.render.apply(this);
        },
        afterRender: function() {
            var me = this;
            if($('#mz-added-to-cart .owl-carousel .item').length > 0){
                setTimeout(function(){
                    $('#mz-added-to-cart .owl-next, #mz-quick-view-container .owl-prev').html('');
                    $('#mz-added-to-cart .owl-carousel').owlCarousel({
                        loop:true, nav:true, responsive:{0:{items:2}, 600:{items:2}, 1000:{items:4}}
                    });
                }, 50);
            }
            $('#mz-added-to-cart, .popup').fadeIn(300); 

            $("#mz-added-to-cart:empty").remove();
			McCookie.getMcImagesFromCache();
			if(window.recommendedproducts){
				window.certonaRecommendations(window.recommendedproducts); // this is automatically fired by certona on add to cart but we need to retrigger it if we re-render, variable & function are both set in certonanewrecommv2.js
			}
		},
        showPersonalizeImage: function(){
            var self = this;
            var product = this.model.get('product');
			if(product.productUsage !== 'Bundle'){
				var dndTokenJSON = null;
				for(var j =0 ; j < product.options.length; j++){
					if(product.options[j].attributeFQN === productAttributes.dndToken){
						if(product.options[j].shopperEnteredValue && product.options[j].shopperEnteredValue!==""){
							try{
								dndTokenJSON = JSON.parse(product.options[j].shopperEnteredValue);
							}
							catch(e){
								console.log(e);
							}
						}
					}
				}
				if(dndTokenJSON){
					var info = DNDToken.getTokenData(dndTokenJSON);
					if(info.type ==="mc"){
						//getMcImages will request image from mediaclip, getMcImagesFromCache in afterRender will display the image saved to cache
						McCookie.getMcImages([info.token]);
					}
					else{
						product.imageUrl = info.src;
					}
					product.token = info.token;
					product.persType = info.type;
				}
			}
        },
        initialize: function () {
            var me = this;
            me.showPersonalizeImage();
			this.on('render', this.afterRender);
			this.listenTo(this.model, 'sync', this.showPersonalizeImage, this);
        }
    });

    var proFunction = function(model) {
        if($("#mz-added-to-cart").length === 0) {
            $('body').append('<div id="mz-added-to-cart"></div>');
        }
        var addedToCartOverlay = new AddedToCartOverlay({
            el: $('#mz-added-to-cart'),
            model: model
        });
        addedToCartOverlay.render();
    };
	
	var atcActions = function(cartitemModel, gaAction, gaEvent){
		//console.log('atcActions');
		var qty = cartitemModel.get('quantity');
					CartMonitor.addToCount(qty);
					proFunction(cartitemModel);

					//google analytics code for add to cart event
					var gaitem = cartitemModel.apiModel.data;
					var proID = gaitem.product.productCode;

					var gaoptionval; 
						if(gaitem.product.productUsage == "Configurable" ){
						  proID = gaitem.product.variationProductCode; 
						}

					if(gaitem.product.options.length > 0 && gaitem.product.options !== undefined){
						_.each(gaitem.product.options,function(opt,i){
							if(opt.name=="dnd-token"){

							}
							else if(opt.name == 'Color'){
								gaoptionval = opt.value;
							}
							else{
								gaoptionval =  opt.value;
							}
						});  
					}

					if(typeof ga!=="undefined"){
						ga('ec:addProduct', {
							'id': proID,
							'name': gaitem.product.name,
							'category': gaitem.product.categories[0].id,
							'brand': 'shindigz',
							'variant': gaoptionval,
							'price': gaitem.unitPrice.extendedAmount,
							'quantity': gaitem.quantity
						});
						ga('ec:setAction', gaAction);
						ga('send', 'event', 'buy', gaEvent, gaitem.product.name);
					} 


					//Bloomreach add to cart event
					var variationProductCode = gaitem.product.variationProductCode,sku = "";

					if(typeof variationProductCode !== 'undefined'){
						sku = variationProductCode;
					}
					
					//console.log('br added-to-cart atcActions:' +sku);
					//console.log('br added-to-cart atcActions:' +gaitem.product.productCode);

					if(typeof BrTrk !== 'undefined'){BrTrk.getTracker().logEvent('cart', 'click-add', {'prod_id': gaitem.product.productCode , 'sku' : sku });}
					//end

					 //Facebook pixel add to cart event
					 var track_price=cartitemModel.get('product').price.price;
					 if(cartitemModel.get('product').price.salePrice){
						track_price=cartitemModel.get('product').price.salePrice;
					 }
		//console.log(track_price);
		var pUrl = cartitemModel.get('url');
		if(pUrl.substr(0,1) !== "/"){
			pUrl = "/"+pUrl;
		}
		pUrl = window.location.origin+pUrl;
		//console.log(pUrl);
		//console.log(qty);

					 var track_product_code=[];
					 track_product_code.push(gaitem.product.productCode);
					 if(typeof fbq!=="undefined"){
						 fbq('track', 'AddToCart', {
							content_ids:track_product_code,
							content_type:'product',
							value: parseFloat(track_price*qty).toFixed(2),
							currency: 'USD'
						});
					 }

					 //Pinterest tracking
					 if(typeof pintrk !== "undefined"){
						 pintrk('track','addtocart',{
							value:parseFloat(track_price*qty),
							order_quantity:parseInt(qty,10),
							currency:"USD",
							line_items:[{
								product_name:gaitem.product.name,
								product_id:track_product_code[0],
								product_price:parseFloat(track_price),
								product_quantity:parseInt(qty,10)
							}]
						});
					}

					if(typeof addthis !== "undefined"){
						//Rerender addthis buttons
						addthis.update('share', 'url',pUrl );
						addthis.update('share', 'title',gaitem.product.name); 
						addthis.toolbox(".addthis_inline_share_toolbox"); // quickview had this
						addthis.toolbox('.cart-over-addthis'); // product page had this
					}
	};
	
    return {
        proFunction : proFunction,
		atcActions: atcActions
    };
});