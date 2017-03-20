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

   		console.log(recomm);
      _.each(recomm,function(v,i){	
        	
        htmltemp += '<div class="item">';
   		htmltemp += '<div class="mz-productlist-item" data-mz-product="'+recomm[i].productCode+'">';
   		htmltemp += '<div class="mz-productlisting mz-productlist-tiled" data-mz-product="'+recomm[i].productCode+'">';
   		htmltemp += '<div class="mz-productlisting-image">';
   		htmltemp += '<a href="'+recomm[i].content.seoFriendlyUrl+'/p/'+recomm[i].productCode+'?rrec=true">';
   		if(recomm[i].content.productImages.length > 0)
        	htmltemp += '<img src="'+ _.first(recomm[i].content.productImages).imageUrl+'?max=210" alt="'+recomm[i].content.productName+'">';
    	else
    		htmltemp += '<span class="mz-productlisting-imageplaceholder"><span class="mz-productlisting-imageplaceholdertext">Image coming soon..</span></span>';

        htmltemp += '</a>';
        htmltemp += '<div class="quick-view">';
        htmltemp += '<a href="javascript:void(0)" data-pro-id="'+recomm[i].productCode+'">QUICK VIEW';
        htmltemp += '</a>';
        htmltemp += '</div>';
        htmltemp += '<div class="wishlist-icon" id="'+recomm[i].productCode+'">';
        htmltemp +=  '<a href="#" id="'+recomm[i].productCode+'">';
        htmltemp +=  '</a>';
        htmltemp += '</div>';
                      if(recomm[i].priceRange){

                      }
                      else{
						if(recomm[i].price.salePrice){
						htmltemp += '<div class="mz-sales-ribbon">';
						htmltemp += '<span itemprop="price" class="mz-price is-saleprice">';
						var subAmt = recomm[i].price.price - recomm[i].price.salePrice;
						var divAmt = subAmt/recomm[i].price.price;
						var perAmt = divAmt * 100;
						var finalsale = perAmt.toPrecision(2);
						htmltemp +=  '<span class="mz-price-discountname">'+finalsale+'%</span>';
						htmltemp +=  '</span>';
						htmltemp += '</div>';          	
						}
                      }
      
        
        
        htmltemp += '</div>';
        htmltemp += '<div class="mz-productlisting-info">';
        htmltemp += '<a class="mz-productlisting-title" href="'+recomm[i].content.seoFriendlyUrl+'/p/'+recomm[i].productCode+'?rrec=true">'+recomm[i].content.productName+'</a>';
        htmltemp += '<div itemprop="priceSpecification" itemscope="" itemtype="http://schema.org/PriceSpecification" class="mz-pricestack">';
        htmltemp += '<span>';
        if(recomm[i].priceRange){
        htmltemp += '<span itemprop="minPrice" class="mz-pricestack-price-lower">$'+recomm[i].priceRange.lower.price+'</span>';
         htmltemp += '<span itemprop="maxPrice" class="mz-pricestack-price-up">$'+recomm[i].priceRange.upper.price+'</span>';
        //htmltemp += '</span>'; 
        }else{
        	var crossedout = "";
        	if(recomm[i].price.salePrice){
        		crossedout = " is-crossedout";
        	}
        	htmltemp += '<span class="mz-price'+crossedout+'">$'+recomm[i].price.price+'</span>';
        if(recomm[i].price.salePrice){
        	htmltemp += '<span itemprop="price" class="mz-price is-saleprice">$'+recomm[i].price.salePrice+'</span>';
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
      
      $('.echi-shi-related-products-slider .owl-carousel').owlCarousel({
				loop:true, 
				margin:10,
				nav:true,
				responsive:{
				0:{items:2},
				600:{items:2},
				1000:{items:4}
				}
				});
     
   

};

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
                    var products;
					 
					 //for (var i = 0; i < recomm.resonance.schemes.length; i++){
					 	_.each(recomm.resonance.schemes,function(v,i){
								if(recomm.resonance.schemes[i].scheme === "addtocart1_rr"){
								var addtocartproducts = response.items;
								htmlfun(addtocartproducts,addtoc);
								}
								else if(recomm.resonance.schemes[i].scheme === "product1_rr" ){
								var obj_prod1=_.findWhere(recomm.resonance.schemes,{"scheme":"product1_rr"});
								var arr_prodcd=_.pluck(obj_prod1.items,"id");
								products =_.filter(response.items,function(item){ return _.contains(arr_prodcd,item.productCode);});
								console.log(arr_prodcd);
								htmlfun(products,prd1_rcc);
								$('.recom_slot-heading_1').show();
								}
								else if(recomm.resonance.schemes[i].scheme === "product2_rr" ){
								var product_2 = _.difference(response.items,products);
								htmlfun(product_2,prd2_rcc);
								$('.recom_slot-heading_2').show();
								}
					 	});
                      
				
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