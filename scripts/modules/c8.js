window.recommendedproducts = null;
var certonaRecommendations = function(response){
    window.recommendedproducts = response;
    require(["modules/jquery-mozu",
		"underscore",
		 "hyprlive",
		 "modules/backbone-mozu",
		 "modules/api"], function ($, _, Hypr, Backbone, api) {

    var htmlfun = function(recomm,divid){
	
	var htmltemp = " ";
    //for(var i = 0; i < recomm.resonance.schemes.length; i++){
   	//for(var j=0 ; j< recomm.resonance.schemes[i].items.length; j++ ){
   		console.log(recomm);
      _.each(recomm.items,function(v,i){	
        	
        htmltemp += '<div class="item">';
   		htmltemp += '<div class="mz-productlist-item" data-mz-product="'+recomm.items[i].productCode+'">';
   		htmltemp += '<div class="mz-productlisting mz-productlist-tiled" data-mz-product="'+recomm.items[i].productCode+'">';
   		htmltemp += '<div class="mz-productlisting-image">';
   		htmltemp += '<a href="'+recomm.items[i].content.seoFriendlyUrl+'/p/'+recomm.items[i].productCode+'?rrec=true">';
   		if(recomm.items[i].content.productImages.length > 0)
        	htmltemp += '<img src="'+ _.first(recomm.items[i].content.productImages).imageUrl+'?max=210" alt="'+recomm.items[i].content.productName+'">';
    	else
    		htmltemp += '<span class="mz-productlisting-imageplaceholder"><span class="mz-productlisting-imageplaceholdertext">Image coming soon..</span></span>';

        htmltemp += '</a>';
        htmltemp += '<div class="quick-view">';
        htmltemp += '<a href="javascript:void(0)" data-pro-id="'+recomm.items[i].productCode+'">QUICK VIEW';
        htmltemp += '</a>';
        htmltemp += '</div>';
        htmltemp += '<div class="wishlist-icon" id="'+recomm.items[i].productCode+'">';
        htmltemp +=  '<a href="#" id="'+recomm.items[i].productCode+'">';
        htmltemp +=  '</a>';
        htmltemp += '</div>';
        htmltemp += '<div class="mz-sales-ribbon">';
        htmltemp += '<span itemprop="price" class="mz-price is-saleprice">';
        htmltemp +=  '<span class="mz-price-discountname">';
        htmltemp +=  '</span>';
        htmltemp +=  '</span>';
        htmltemp += '</div>';
        htmltemp += '</div>';
        htmltemp += '<div class="mz-productlisting-info">';
        htmltemp += '<a class="mz-productlisting-title" href="'+recomm.items[i].content.seoFriendlyUrl+'/p/'+recomm.items[i].productCode+'?rrec=true">'+recomm.items[i].content.productName+'</a>';
        htmltemp += '<div itemprop="priceSpecification" itemscope="" itemtype="http://schema.org/PriceSpecification" class="mz-pricestack">';
        htmltemp += '<span>';
        if(recomm.items[i].priceRange){
        htmltemp += '<span itemprop="minPrice" class="mz-pricestack-price-lower">'+recomm.items[i].priceRange.lower.price+'</span>';
         htmltemp += '<span itemprop="maxPrice" class="mz-pricestack-price-up">'+recomm.items[i].priceRange.upper.price+'</span>';
        //htmltemp += '</span>';
        }else{
        	var crossedout = "";
        	if(recomm.items[i].price.salePrice){
        		crossedout = " is-crossedout";
        	}
        	htmltemp += '<span class="mz-price'+crossedout+'">'+recomm.items[i].price.price+'</span>';
        if(recomm.items[i].price.salePrice){
        	htmltemp += '<span itemprop="price" class="mz-price is-saleprice">'+recomm.items[i].price.salePrice+'</span>';
        }
        
        }
         htmltemp += '</span>';
        
        htmltemp += '</div>';
        htmltemp += '</div>';
        htmltemp += '<div class="mz-productlisting-is-personalize">';
        htmltemp += '<a href="javascript:void(0)"></a>';
        htmltemp += '</div>';
        htmltemp += '</div>';
        htmltemp += '</div>';
        htmltemp += '</div>';
        	
   		});
      $(divid).html('<div class="pdp-related-products"><div class="clear"></div><div class="echi-shi-related-products-slider"><div class="owl-carousel owl-theme">'+htmltemp+'</div></div></div>');
      $('.echi-shi-bundle-products-slider .owl-carousel').owlCarousel({
				loop:true, 
				margin:10,
				nav:true,
				responsive:{
				0:{items:2},
				600:{items:3},
				768:{items:4},
				1000:{items:6}
				}
				});
   	//}
		
			/*if(recomm.resonance.schemes[i].scheme === "addtocart1_rr" ){
			if($("#mz-added-to-cart").length === 0){

				setTimeout(function(){
				$('#recommended_products_slot_cart').html('<div class="pdp-related-products"><div class="clear"></div><div class="echi-shi-related-products-slider"><div class="owl-carousel owl-theme">'+htmltemp+'</div></div></div>');
				$('.echi-shi-bundle-products-slider .owl-carousel').owlCarousel({
				loop:true, 
				margin:10,
				nav:true,
				responsive:{
				0:{items:2},
				600:{items:3},
				768:{items:4},
				1000:{items:6}
				}
				});


				},2500);

			}
			}
			else if(recomm.resonance.schemes[i].scheme === "product1_rr" ){
				
				$('#recommended_products_slot_1').html('<div class="pdp-related-products"><div class="clear"></div><div class="echi-shi-related-products-slider"><div class="owl-carousel owl-theme">'+htmltemp+'</div></div></div>');
				$('.echi-shi-bundle-products-slider .owl-carousel').owlCarousel({
				loop:true,
				margin:10,
				nav:true,
				responsive:{
				0:{items:2},
				600:{items:3},
				768:{items:4},
				1000:{items:6}
				}
				});
				
			}
			else if(recomm.resonance.schemes[i].scheme === "product2_rr" ){ 
				
				$('#recommended_products_slot_2').html('<div class="pdp-related-products"><div class="clear"></div><div class="echi-shi-related-products-slider"><div class="owl-carousel owl-theme">'+htmltemp+'</div></div></div>');
				$('.echi-shi-bundle-products-slider .owl-carousel').owlCarousel({
				loop:true,
				margin:10,
				nav:true,
				responsive:{
				0:{items:2},
				600:{items:3},
				768:{items:4},
				1000:{items:6} 
				}
				});
				
			}
*/   //}
   
   

};
		 var RecommendedProductView = Backbone.MozuView.extend({
	 		templateName: 'modules/product/pdp-recommended-products',
	 		render:function(){	 			
	 			Backbone.MozuView.prototype.render.call(this);
	 			$('.echi-shi-related-products-slider .owl-next, .echi-shi-products_slider .owl-prev').html('');
				$('.pdp-related-products .echi-shi-related-products-slider .owl-carousel').owlCarousel({
					    loop:true,nav:true,responsive:{0:{items:2},600:{items:2},1000:{items:4}}
        		});
        		/*var proData = require.mozuData('facetedproducts');
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
        		//removePageLoader();*/		            		
	 		} 
	 	});


		var recommendedProductSearch = function(filter_q,flag_cart,recomm){

			var api_search_query = '/api/commerce/catalog/storefront/productsearch/search/?filter='+filter_q+'&pageSize=200';			

			api.request('GET',api_search_query).then(function(res){
 
				//console.log(res);
                 
				 
                 var id, a = [];
                 for (var l = 0; l < recomm.resonance.schemes.length; l++) {
						for(var r=0; r <recomm.resonance.schemes[l].items.length; r++) {  
									id = recomm.resonance.schemes[l].items[r].id;
									a.push(id);

								}
							}
					var response = [];
					response.items=[];
					for(var x =0;x< a.length;x++){
					for(var y=0;y<res.items.length;y++){
					if(a[x]==res.items[y].productCode){
					response.items.push(res.items[y]);
					}
					}
					}
					var addtoc = "#recommended_products_slot_cart";
					var prd1_rcc = "#recommended_products_slot_1";
					var prd2_rcc = "#recommended_products_slot_2";

					 for (var i = 0; i < recomm.resonance.schemes.length; i++){
                         if(recomm.resonance.schemes[i].scheme === "addtocart1_rr"){
						   htmlfun(response,addtoc);
						}
						else if(recomm.resonance.schemes[i].scheme === "product1_rr" ){
                           htmlfun(response,prd1_rcc);
						}
                        else if(recomm.resonance.schemes[i].scheme === "product2_rr" ){
                           htmlfun(response,prd2_rcc);
						}

					 }
 

				/*var productModels_recomm = new ProductModels.ProductCollection(response);
				//console.log(productModels_recomm);
				if(!flag_cart){
					var product1_rr=[],product2_rr=[],product;
					for (var i = 0; i < recomm.resonance.schemes.length; i++) {
						if(recomm.resonance.schemes[i].scheme === 'product1_rr'){
							for(var m=0; m <recomm.resonance.schemes[i].items.length; m++) {
								product = productModels_recomm.get('items').where({productCode:recomm.resonance.schemes[i].items[m].id});
								if(product && product.length>0){
									product1_rr.push(product[0].apiModel.data);
								}
							}
						}
						if(recomm.resonance.schemes[i].scheme === 'product2_rr'){
							for(var k=0; k <recomm.resonance.schemes[i].items.length; k++) {
								product = productModels_recomm.get('items').where({productCode:recomm.resonance.schemes[i].items[k].id});
								if(product && product.length>0){
									product2_rr.push(product[0].apiModel.data);
								}
							}
						} 
					}
					if(product1_rr.length>0){
 
					 var recommendedprodView1 = new RecommendedProductView({
				            el: $('#recommended_products_slot_1'),
				            model: new ProductModels.ProductCollection({items:product1_rr})
				        });
				        recommendedprodView1.render();
				        $('.recom_slot-heading_1').show();
					}
					if(product2_rr.length>0){
						productModels_recomm.set('items',product2_rr);
						var recommendedprodView2 = new RecommendedProductView({
				            el: $('#recommended_products_slot_2'),
				            model: new ProductModels.ProductCollection({items:product2_rr})
				        });
				        recommendedprodView2.render();
				        $('.recom_slot-heading_2').show();
					}
					if(product1_rr.length===0){
						var recommendedProductView = new RecommendedProductView({
							el: $('#recommended_products_slot'),
							model: productModels_recomm
						});

						recommendedProductView.render();
					}
				}else if(flag_cart){
					
					
			        var recommendedCartView = new RecommendedProductView({
			            el: $('#recommended_products_slot_cart'),
			            model: productModels_recomm
			        });
			        recommendedCartView.render();
				}*/
				
			});	

		};


    function triggerLogin(){
        $('.trigger-login').trigger('click');
        $('#cboxOverlay').show();
        $('#mz-quick-view-container').fadeOut(350);
        $('#mz-quick-view-container').empty();
    }

		//$('.mz-shi-heading-style').css('display','none');

		var pageContext = require.mozuData('pagecontext');
		var pageType = pageContext.pageType;

	
		var overlay_flag = 0;

			globalNameSpace.callRecomm = function(recomm){
				console.log("CallBackFunction Trigger");
				//$('.mz-shi-heading-style').css('display','block');
			 			
					
	    		if(recomm){
				var rec = recomm;
				window.rec = rec;
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
			    		recommendedProductSearch(query,0,recomm);
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
			    		recommendedProductSearch(query_1,1,recomm);
			    		overlay_flag = 0;overlay_cart = [];scheme_overlay = false; //reset the test variables		    		
			    	}
		    	}
			}; 
			setTimeout(function(){
				globalNameSpace.callRecomm(window.recommendedproducts);
			},500);
	});				


};