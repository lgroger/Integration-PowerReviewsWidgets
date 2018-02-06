require(
    [
        "modules/jquery-mozu",
        "underscore",
        'modules/backbone-mozu',
        "hyprlive",
        "modules/api",
        'modules/models-product',
        'modules/cart-monitor',
        'hyprlivecontext',
        'modules/added-to-cart',
        "modules/soft-cart",
        "vendor/wishlist",
		"modules/quickview-productview",
		"modules/shared-product-info"
    ], function ($, _, Backbone, Hypr, Api, ProductModels, CartMonitor, HyprLiveContext, addedToCart, SoftCart, Wishlist, QuickViewProductView, SharedProductInfo) {
        Hypr.engine.setFilter("contains",function(obj,k){ 
            return obj.indexOf(k) > -1;
        });

        var productAttributes = Hypr.getThemeSetting('productAttributes');

        Api.on("error", function(e) {
            $(".mz-messagebar").empty().html(e.message);
        });

        var initProductInQuickview= function(productCode){
			//console.log("initProductInQuickview");
			
			var product = SharedProductInfo.getProductModel(productCode,initProductInQuickview.bind(null,productCode),
						function(){
							console.error('Error loading product');
							window.removePageLoader();
							console.error(arguments);
						} // on error, remove loader (mostly issues with sandbox of item not existing)
					);
			if(!product){
				return;
			}

				product.on('addedtowishlist', function (cartitem) {
					$('#add-to-wishlist').prop('disabled', 'disabled').text(Hypr.getLabel('addedToWishlist'));
				});
				
				var gaAction = 'BuyPlp';
				var gaEvent = 'buyquickview';
				
				if(require.mozuData('pagecontext').cmsContext.template.path === "super-page"){
					// use different ga events for theme pages
					gaAction = 'Buysuperpageoptions';
					gaEvent = 'buysuperpageoptions';
				}
			
				$('body').append('<div id="mz-quick-view-container"></div>');
				var productView = new QuickViewProductView({
					model:product,
					gaAction: gaAction,
					gaEvent: gaEvent
				});
				
				if($("#qty-" + productCode).length>0){
					productView.setQtyModel($("#qty-" + productCode).val());
				}
				productView.render();
				window.removePageLoader();
				$('#mz-quick-view-container').fadeIn(350); 
				
				//bloomreach quickview integration start
				var sku = "";
				if(typeof product.attributes.variationProductCode !== "undefined"){
					sku = product.attributes.variationProductCode;
				}
				if(typeof BrTrk !== "undefined" && BrTrk !== 'undefined'){
					BrTrk.getTracker().logEvent(
							  'product', // event group
							  'quickview', // event action
							  {  // product details
								'prod_id' : product.attributes.productCode,
								'prod_name': product.attributes.content.attributes.productName,
					  'sku': sku
							});
				}
				//bloomreach quickview integration end
				
				// begin pre-loading extras or components if personalized
				if(productView.model.get('isPersonalized')){
					productView.loadComponents();
					productView.loadExtras();
				}
        };

        $(document).ready(function(){
            /* OPEN */
            $(document).on('click', '.quick-view > a[data-pro-id]', function(e){
                window.showPageLoader();
                $('body').css({overflow : 'hidden'});
                var btn=$(this);
                var productCode = $(this).attr('data-pro-id');
                initProductInQuickview(productCode);
                //getReviewFromPLP(productCode);
                e.preventDefault();
            });
        });
    });
