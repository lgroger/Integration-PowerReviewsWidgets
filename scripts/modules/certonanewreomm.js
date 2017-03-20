window.recommendedproducts = null;
var certonaRecommendations = function(response){
    window.recommendedproducts = response;
    require(["modules/jquery-mozu","modules/api"], function ($,api) {
    
    var htmlfun = function(recomm){
	
	var htmltemp;
    for(var i = 0; i < recomm.resonance.schemes.length; i++){
   	for(var j=0 ; j< recomm.resonance.schemes[i].items.length; j++ ){
   		htmltemp += '<div class="item">';
   		htmltemp += '<div class="mz-productlist-item" data-mz-product="'+recomm.resonance.schemes[i].items[j].id+'">';
   		htmltemp += '<div class="mz-productlisting mz-productlist-tiled" data-mz-product="'+recomm.resonance.schemes[i].items[j].id+'">';
   		htmltemp += '<div class="mz-productlisting-image">';
   		htmltemp += '<a href="'+recomm.resonance.schemes[i].items[j].Detail_URL+'?rrec=true">';
        htmltemp += '<img src="'+recomm.resonance.schemes[i].items[j].Image_URL+'?max=210" alt="'+recomm.resonance.schemes[i].items[j].Name+'">';
        htmltemp += '</a>';
        htmltemp += '<div class="quick-view">';
        htmltemp += '<a href="javascript:void(0)" data-pro-id="'+recomm.resonance.schemes[i].items[j].id+'">QUICK VIEW';
        htmltemp += '</a>';
        htmltemp += '</div>';
        htmltemp += '<div class="wishlist-icon" id="'+recomm.resonance.schemes[i].items[j].id+'">';
        htmltemp +=  '<a href="#" id="'+recomm.resonance.schemes[i].items[j].id+'">';
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
        htmltemp += '<a class="mz-productlisting-title" href="'+recomm.resonance.schemes[i].items[j].Detail_URL+'?rrec=true">'+recomm.resonance.schemes[i].items[j].Name+'</a>';
        htmltemp += '<div itemprop="priceSpecification" itemscope="" itemtype="http://schema.org/PriceSpecification" class="mz-pricestack">';
        htmltemp += '<span>';
        htmltemp += '<span class="mz-price is-crossedout"></span>';
        htmltemp += '<span itemprop="price" class="mz-price is-saleprice">'+recomm.resonance.schemes[i].items[j].Price+'</span>';
        htmltemp += '</span>';
        htmltemp += '</div>';
        htmltemp += '</div>';
        htmltemp += '<div class="mz-productlisting-is-personalize">';
        htmltemp += '<a href="javascript:void(0)"></a>';
        htmltemp += '</div>';
        htmltemp += '</div>';
        htmltemp += '</div>';
        htmltemp += '</div>';

   	}
		if(recomm.resonance.schemes[i].scheme === "addtocart1_rr" ){
			$('#recommended_products_slot_cart').append(htmltemp);
              
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
		else if(recomm.resonance.schemes[i].scheme === "product1_rr" ){
			$('.echi-shi-related-products-slider .owl-carousel').append(htmltemp);
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
			$('.echi-shi-related-products-slider .owl-carousel').append(htmltemp);
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
   }
   
   

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
						if(recomm.resonance.schemes[i].scheme === "addtocart1_rr"){
						   htmlfun(recomm);
						}
						else if(recomm.resonance.schemes[i].scheme === "product1_rr" ){
                           htmlfun(recomm);
						}
                        else if(recomm.resonance.schemes[i].scheme === "product2_rr" ){
                           htmlfun(recomm);
						}
					}				
			   }
			}; 
			setTimeout(function(){
				globalNameSpace.callRecomm(window.recommendedproducts);
			},500);
	});				


};