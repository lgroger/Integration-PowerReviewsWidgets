require(['shim!//edge1.certona.net/cd/67195178/shindigz.com/scripts/resonance[modules/jquery-mozu=jQuery]>jQuery', 'underscore','modules/jquery-mozu'], function(certonaLib,_,$) {
window.recommendedproducts = null;
var certonaRecommendations = function(response){
    window.recommendedproducts = response;
    var htmlfun = function(recomm,divid){
	
	var htmltemp = " ";

   		//console.log(recomm);
      _.each(recomm,function(v,i){	
        	
        htmltemp += '<div class="item">';
   		htmltemp += '<div class="mz-productlist-item" data-mz-product="'+recomm[i].id+'">';
   		htmltemp += '<div class="mz-productlisting mz-productlist-tiled" data-mz-product="'+recomm[i].id+'">';
   		htmltemp += '<div class="mz-productlisting-image">';
   		htmltemp += '<a href="'+recomm[i].Detail_URL+'?rrec=true">';
        htmltemp += '<img src="'+ recomm[i].Image_URL.replace("http:","")+'?max=210" alt="'+recomm[i].Name+'">';
    	htmltemp += '</a>';
        htmltemp += '<div class="quick-view">';
        htmltemp += '<a href="javascript:void(0)" data-pro-id="'+recomm[i].id+'">QUICK VIEW';
        htmltemp += '</a>';
        htmltemp += '</div>';
        htmltemp += '<div class="wishlist-icon" id="'+recomm[i].id+'">';
        htmltemp +=  '<a href="#" id="'+recomm[i].id+'">';
        htmltemp +=  '</a>';
        htmltemp += '</div>';
                      
        htmltemp += '</div>'; 
        htmltemp += '<div class="mz-productlisting-info">';
        htmltemp += '<a class="mz-productlisting-title" href="'+recomm[i].Detail_URL+'?rrec=true">'+recomm[i].Name+'</a>';
        htmltemp += '<div itemprop="priceSpecification" itemscope="" itemtype="http://schema.org/PriceSpecification" class="mz-pricestack">';
        htmltemp += '<span>';
        if(parseFloat(recomm[i].MaxPrice) > parseFloat(recomm[i].Price)){
        htmltemp += '<span itemprop="minPrice" class="mz-pricestack-price-lower">$'+parseFloat(recomm[i].Price).toFixed(2)+'</span>';
         htmltemp += '<span itemprop="maxPrice" class="mz-pricestack-price-up">$'+parseFloat(recomm[i].MaxPrice).toFixed(2)+'</span>';
        //htmltemp += '</span>'; 
        }else{
        	
        	htmltemp += '<span class="mz-price">$'+parseFloat(recomm[i].Price).toFixed(2)+'</span>';
        
         
        }
         htmltemp += '</span>';
        htmltemp += '<span class="cerumo">'+recomm[i].UOM+'</span>';
        htmltemp += '</div>';
        htmltemp += '</div>';
        
        var isPersionalize=false;
        var prod_obj;
        

        if(window.recommendedproducts.resonance.schemes.length > 1){
	         if(_.findWhere(window.recommendedproducts.resonance.schemes[0].items,{id:v.id})!== undefined){
	         	 prod_obj=_.findWhere(window.recommendedproducts.resonance.schemes[0].items,{id:v.id});
		         	if(prod_obj!==undefined){
		         		if(prod_obj.Personalized==="True"){
		         			isPersionalize=true;
		         		}else{
		         			isPersionalize=false;
		         		}
		         	}
	         }else if(_.findWhere(window.recommendedproducts.resonance.schemes[1].items,{id:v.id})!== undefined){
	         	 prod_obj=_.findWhere(window.recommendedproducts.resonance.schemes[1].items,{id:v.id});
			if(prod_obj!==undefined){
		         		if(prod_obj.Personalized==="True"){
		         			isPersionalize=true;
		         		}else{
		         			isPersionalize=false;
		         		}
		         	}
	         }
	     }
             else{
         	 prod_obj=_.findWhere(window.recommendedproducts.resonance.schemes[0].items,{id:v.id});
         	if(prod_obj!==undefined){
         		if(prod_obj.Personalized === "True"){
         			isPersionalize=true;
         		}else{
         			isPersionalize=false;
         		}
         	}
         }
         var recs;
         if(isPersionalize){
         	var pagetype = require.mozuData('pagecontext').pageType;
        	
         if(pagetype === "search" || pagetype === "category" ){
         	 recs = '?rrec=true'; 
         }
        htmltemp += '<div class="mz-productlisting-is-personalize">';
        htmltemp += '<a href="'+recomm[i].Detail_URL;
        if(recs){
        	  htmltemp += recs+'">PERSONALIZE</a>';
        }
        else{
        	 htmltemp += '">PERSONALIZE</a>';
        }
        htmltemp += '</div>';
         }


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

		var recommendedProductSearch = function(recomm){

			
            var recomms = window.rec;
			response.items=[];
			var resp = [];
			for(var x =0;x<recomms.resonance.schemes.length;x++){
			for(var y=0;y<recomms.resonance.schemes[x].items.length;y++){
			if(recomms.resonance.schemes[x].scheme === 'product1_rr'){
			response.items.push(recomms.resonance.schemes[x].items[y]);
			}
			else if(recomms.resonance.schemes[x].scheme === 'product2_rr'){
			resp.push(recomms.resonance.schemes[x].items[y]);
			}
			else{
				response.items.push(recomms.resonance.schemes[x].items[y]);
			}
			}
			}

			var addtoc = "#recommended_products_slot_cart";
			var prd1_rcc = "#recommended_products_slot_1";
			var prd2_rcc = "#recommended_products_slot_2";
			var cat1_rr = "#recommended_products_slot";
            
			_.each(recomms.resonance.schemes,function(v,i){
				if(recomms.resonance.schemes[i].scheme === "addtocart1_rr"){
				//var addtocartproducts = response.items;
				htmlfun(response.items,addtoc);
				}
				else if(recomms.resonance.schemes[i].scheme === "category1_rr"){
				//var catprod = response.items;
				htmlfun(response.items,cat1_rr); 
				}
				else if(recomms.resonance.schemes[i].scheme === "cart1_rr"){
				//var catprod = response.items;
				htmlfun(response.items,cat1_rr); 
				}
				else if(recomms.resonance.schemes[i].scheme === "product1_rr" ){
				
				htmlfun(response.items,prd1_rcc); 

				if( response.items.length>0 && recomms.resonance.schemes[i].display === "yes" ){
				$('.recom_slot-heading_1').show();
				}
				}
				else if(recomms.resonance.schemes[i].scheme === "product2_rr" ){
//                console.log(resp);
				htmlfun(resp,prd2_rcc);

				if( response.items.length>0  && recomms.resonance.schemes[i].display === "yes" ){
				$('.recom_slot-heading_2').show();	
				} 

				}

			});




		};


    function triggerLogin(){
        $('.trigger-login').trigger('click');
        $('#cboxOverlay').show();
        $('#mz-quick-view-container').fadeOut(350);
        $('#mz-quick-view-container').empty();
    }

		

		var pageContext = require.mozuData('pagecontext');
		var pageType = pageContext.pageType;

	
		var overlay_flag = 0;

			globalNameSpace.callRecomm = function(recomm){
				//console.log("CallBackFunction Trigger");
					
					
	    		if(recomm){
				var rec = recomm;
				window.rec = rec;
				recommendedProductSearch(recomm);
		    		
		    	}
			};   
			setTimeout(function(){
				globalNameSpace.callRecomm(window.recommendedproducts);
			},3500);
			

 
};
window.certonaRecommendations=certonaRecommendations;
});