require(["modules/jquery-mozu",
		"underscore",
		 "hyprlive",
		 "modules/backbone-mozu",
		 'hyprlivecontext', 
		 'modules/editable-view', 
		 'modules/preserve-element-through-render',
		 "modules/api",
		 "modules/models-product",
		 "vendor/wishlist",
		 "modules/models-faceting"], function ($, _, Hypr, Backbone, HyprLiveContext, EditableView, preserveElements, api, ProductModels, Wishlist,facetingProducts) {


		 var RecommendedProductView = Backbone.MozuView.extend({
	 		templateName: 'modules/product/pdp-recommended-products',
	 		render:function(){	 			
	 			Backbone.MozuView.prototype.render.call(this);
	 			$('.echi-shi-related-products-slider .owl-next, .echi-shi-products_slider .owl-prev').html('');
				$('.pdp-related-products .echi-shi-related-products-slider .owl-carousel').owlCarousel({
					    loop:true,nav:true,responsive:{0:{items:2},600:{items:2},1000:{items:4}}
        		});
        		var proData = require.mozuData('facetedproducts');
                var facetingModel = new facetingProducts.FacetedProductCollection(proData);
                $('.wishlist-icon > a, .wishlist-icon-tablet>a').click(function() { 
                    if(!require.mozuData('user').isAnonymous) {
                        var productCode = $(this).attr('id');
                        var product = facetingModel.get("items").where({'productCode':productCode});
                        Wishlist.initoWishlist(product[0]);
                    }else {
                        triggerLogin();
                    }
                });
        		//removePageLoader();		            		
	 		} 
	 	});

		var recommendedProductSearch = function(filter_q,flag_cart){

			var api_search_query = '/api/commerce/catalog/storefront/productsearch/search/?filter='+filter_q+'&pageSize=200';			

			api.request('GET',api_search_query).then(function(res){

				//console.log(res);

				var productModels_recomm = new ProductModels.ProductCollection(res);

				//console.log(productModels_recomm);

				if(!flag_cart){
					var recommendedProductView = new RecommendedProductView({
						el: $('#recommended_products_slot'),
						model: productModels_recomm
					});

					recommendedProductView.render();
				}else if(flag_cart){
					
			        var recommendedCartView = new RecommendedProductView({
			            el: $('#recommended_products_slot_cart'),
			            model: productModels_recomm
			        });
			        recommendedCartView.render();
				}
				
			});	

		};

	function showPageLoader(){
        $('<div></div>').addClass('page-loading').appendTo(document.body);
        
        //$('<div></div>').addClass('loader').appendTo(".page-loading");
    }

    function removePageLoader(){
        $('.page-loading').remove();
    }

    function triggerLogin(){
        $('.trigger-login').trigger('click');
        $('#cboxOverlay').show();
        $('#mz-quick-view-container').fadeOut(350);
        $('#mz-quick-view-container').empty();
    }

	$(document).ready(function(){

		//$('.mz-shi-heading-style').css('display','none');

		var pageContext = require.mozuData('pagecontext');
		var pageType = pageContext.pageType;

	
		var overlay_flag = 0;

			globalNameSpace.callRecomm = function(recomm){
				console.log("CallBackFunction Trigger");
				//$('.mz-shi-heading-style').css('display','block');				
	    		var id,arr = [];
	    		var items_len;
	    		var overlay_cart = [],scheme_overlay;
				for (var i = 0; i < recomm.resonance.schemes.length; i++) {
					if(recomm.resonance.schemes[i].scheme === 'addtocart1_rr'){
						scheme_overlay = true;
						if (recomm.resonance.schemes[i].display === "yes") {  
							items_len = recomm.resonance.schemes[i].items.length;
							for(var m=0; m <recomm.resonance.schemes[i].items.length; m++) {  
								id = recomm.resonance.schemes[i].items[m].id;
								overlay_cart[m+(i*recomm.resonance.schemes[i].items.length)] = id;
							}
						}
					}else{
						scheme_overlay = false;
						if (recomm.resonance.schemes[i].display === "yes") {  
							items_len = recomm.resonance.schemes[i].items.length;
							for(var j=0; j <recomm.resonance.schemes[i].items.length; j++) {  
								id = recomm.resonance.schemes[i].items[j].id;
								arr[j+(i*recomm.resonance.schemes[i].items.length)] = id;			
							}
						}
					}
				}				
				
				var query = "productCode eq ";
		    	for(var l=0;l<arr.length;l++){
		    		if(l < arr.length -1){
		    			query += arr[l] + " or productCode eq ";
		    		}else{
		    			query += arr[l];
		    		}		    		
		    	}			    	

		    	if(overlay_cart.length === 0 && !scheme_overlay && arr.length >= 1){
		    		//showPageLoader();
		    		recommendedProductSearch(query,0);
		    	}else if(scheme_overlay && arr.length === 0 && overlay_cart.length >= 1 ){
		    		//forOverlayCart(overlay_cart);
		    		var query_1 = "productCode eq ";
			    	for(var f=0;f<overlay_cart.length;f++){
			    		if(f < overlay_cart.length -1){
			    			query_1 += overlay_cart[f] + " or productCode eq ";
			    		}else{
			    			query_1 += overlay_cart[f];
			    		}		    		
			    	}
		    		recommendedProductSearch(query_1,1);
		    		overlay_flag = 0;overlay_cart = [];scheme_overlay = false; //reset the test variables		    		
		    	}
			};
	});
});				