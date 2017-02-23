define(['modules/jquery-mozu', 'modules/backbone-mozu', 'modules/api','modules/models-product','vendor/wishlist'], function ($, Backbone, api, ProductModels,Wishlist) {		
	 	 var GuidedListView = Backbone.MozuView.extend({
	 		templateName: 'modules/product/guided-search-listing',	
	 		events: {          
            "click .addToWishlist": "addToWishlist"
            
        	}, 		
	 		render:function(){	 			
	 			Backbone.MozuView.prototype.render.call(this);
	 			$('.loader').hide();
	 		},
	 		 addToWishlist: function (e) {
			            if(!require.mozuData('user').isAnonymous) {
			            	var productCode=$(e.currentTarget).data('product_id');
			            	var productModel=this.model.get('items').where({productCode:productCode});
	            			var product= productModel[0];
			                Wishlist.initoWishlist(product);
			            }else {
			                triggerLogin();
			            }
			        }
			 
	 	});   
	 	 var SearcView = Backbone.MozuView.extend({
	 		templateName: 'modules/product/guidedsearch-facets',	
	 		render:function(){	 			
	 			Backbone.MozuView.prototype.render.call(this);	 
	 			$('.loader').hide();					
	 		}
	 	});
	 	var FacetView = Backbone.MozuView.extend({
	 		templateName: 'modules/product/guided-search-facets',	 		
	 		render:function(){	 			
	 			Backbone.MozuView.prototype.render.call(this);
	 			if($('.button-search-slider-loop .owl-carousel').length > 0){
                            $('.button-search-slider-loop .owl-next, .button-search-slider-loop .owl-prev').html('');                          
                            $('.button-search-slider-loop .owl-carousel').owlCarousel({
                                dots: true,loop: true,nav: true,margin:0,
                                responsive:{ 
                                    0:{
                                        items:1
                                    }, 
                                    600:{
                                        items:2
                                    },
                                    1000:{
                                        items:5
                                    }
                                }});
                            $('.button-search-slider-loop .owl-dots').hide();
                            if($('.button-search-slider-loop .owl-carousel .owl-item').length < 5) { 
                                $('.button-search-slider-loop .owl-prev').hide();
                                    $('.button-search-slider-loop .owl-next').hide();
                            }                   
                                     
                    }
                    $('.loader').hide();
	 		}
	 		
	 	});
	 	function getCookie(cname) {
		    var name = cname + "=";
		    var ca = document.cookie.split(';');
		    for(var i = 0; i < ca.length; i++) {
		        var c = ca[i];
		        while (c.charAt(0) == ' ') {
		            c = c.substring(1);
		        }
		        if (c.indexOf(name) === 0) {
		            return c.substring(name.length, c.length);
		        }
		    }
		    return "";
		}
     var flag="";
	 	var loadfunc=function(field,flag,startid,pages,currentid){
		 	$('.wait').css("display","block");    
	    	var str="";      	
	 		var SearchUrl= "/api/commerce/catalog/storefront/productsearch/search/?filter=categoryId req "+field;
	 		SearchUrl+="&pageSize="+pages+"&facetTemplate=categoryId:"+field;
	 		SearchUrl+="&startIndex="+startid;
	 		if(flag===0){  		
	 		SearchUrl+="&facetHierValue=categoryId:"+field+"&facetHierDepth=categoryId:2";
	 	    }
	 	    function middlePageNumbers(model) {
	                var current = 1,
	                    ret = [],
	                    fristarray = [],
	                    pageCount = model.get('pageCount'),
	                    i = Math.max(Math.min(current - 2, pageCount - 4), 2),
	                    last = Math.min(i + 5, pageCount);
	                while (i < last) ret.push(i++); 
	              //  console.log(ret);            
	                return ret;   
	        }
	        var productModels;
	 		api.request('GET',SearchUrl).then(function(res){
		 		productModels = new ProductModels.ProductCollection(res);
		 		//console.log(productModels);
		 		var catUrl="/api/commerce/catalog/storefront/categories/"+field;		
		 		var originalarry = middlePageNumbers(productModels);
	 			var firstarry = middlePageNumbers(productModels);
	 			var secondarray=[];
	 			if(firstarry.length>3){
	            	secondarray=firstarry.splice(0,3);
	            }else{
	            	secondarray=firstarry;  
	            }      
		        productModels.set('currentCat', field);
		        productModels.set('allPageNumbers', originalarry);
		 		productModels.set('middlePageNumbers', secondarray);   
		 		productModels.set('lastPageNumbers', firstarry);
		 		productModels.set('PrevPage', parseInt(currentid,10)-1);
		 		productModels.set('currentPage', currentid);
		 		productModels.set('NextPage', parseInt(currentid,10)+1);
		 		var	rangelevel="";
		 		if(startid!==1){
		 			rangelevel =parseInt(startid,10)+parseInt(pages,10);
			 		if(rangelevel>productModels.attributes.totalCount){
			 			rangelevel=productModels.attributes.totalCount;
			 		}
		 		}else{
		 			rangelevel=pages;
		 		}
	 			productModels.set('rangelevel',rangelevel) ;

	 				var guidedlistView = new GuidedListView({
	 				el: $('[data-mz-guidedlisting-block]'),
	 				model: productModels
	 			});
	 			//guidedlistView.render(); 			
	 			//if(flag===0){ 
	 			 var facetView = new FacetView({
	 				el: $('[data-mz-buttons1]'),     
	 				model: productModels
	 			});
	 			 //facetView.render();
	 			//}
	 			var	searcview = new SearcView({
	 				el: $('[data-mz-search]'),     
	 				model: productModels
	 			});

		 		api.request('GET',catUrl).then(function(cats){
		 		  productModels.set('CategoryName', cats.content.name);
		 		  if(flag===0){
		 		  	facetView.render();
		 		  }
		 		  searcview.render();
		 		  guidedlistView.render();
		 		});     

	 		  
	 			//searcview.render();
	 			
	 		}); 
 		};
 	function triggerLogin(){
        $('.trigger-login').trigger('click');
        $('#cboxOverlay').show();
        $('#mz-quick-view-container').fadeOut(350);
        $('#mz-quick-view-container').empty();
    }
 
 $( document ).ready(function() {
 		$(document).on('click','.editbtn',function(){	
			$('.factes').show();
			$('.search-edit').hide();
		});
		$(document).on('click','.cancelbtn',function(){			
			$('.factes').hide();
			$('.search-edit').show();
		});
 	});  
 	$(document).on('click','.search-facet',function(){				
		$('.loader').show();		
		var pages=$('.pagesizes').val();
		var catid=$(this).data("category-id");
	//	console.log(catid);   
		loadfunc(catid,1,1,pages,1);      
	});
	$(document).on('change','.pagesizes',function(){				
		$('.loader').show();
		var categoryid=$('.categoryid').val();		
		var pages=$(this).val();
		var catid=$(this).data("category-id");
	/*	var startindex= parseInt(pages,10) * (parseInt(startid,10)-1); 
		if(startid==1){
			startindex=1;
		}	*/
	//	console.log(pages);   
		loadfunc(categoryid,1,1,pages,1);
	});
 		$(document).on('click','.pagination',function(){				
		$('.loader').show();	
		var categoryid=$('.categoryid').val();		
		var startid=$(this).data("mz-page-num");
		var pages=$('.pagesizes').val();
		var startindex= parseInt(pages,10) * (parseInt(startid,10)-1); 
		if(startid==1){
			startindex=1;  
		}		  
	//	console.log(startindex);
	//	console.log(startid);
		loadfunc(categoryid,1,startindex,pages,startid);
		$(this).addClass('pagination_active');     
	});   
 	 
		 $(document).on('click','.button-loop .btn-banner',function(){			
		    $('.button-loop .btn-banner').removeClass('active_btn');		  
		    $(this).addClass('active_btn');		
		  });
		
	 $( document ).ready(function() {
	 	var page=$('.pagesizes').val();
	 	var cookiecat_id=getCookie("guidedcategory");
	 //	console.log(cookiecat_id);
	 	$('.loader').show();
	 	loadfunc(cookiecat_id,0,1,page,1); 
	 		$(document).on('click','.guided-save',function(){ 		
	 			$('.loader').show();
	 			var event_kind = $('.event-kind').val();
	 			var event_type =  $('.event-theme').val();
	 			var guest =$('.guest').val();	 			
	 			var pages=$('.pagesizes').val();
	 		/*	var startindex= parseInt(pages,10) * (parseInt(startid,10)-1); 
				if(startid==1){
					startindex=1;
				}		 */ 
	 	//		console.log(event_type);
	 			loadfunc(event_type,0,1,pages,1); 
	 		});  
	 		

	 });
	 
});
