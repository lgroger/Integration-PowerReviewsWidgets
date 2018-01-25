define(['modules/jquery-mozu','underscore', 'modules/api',"modules/backbone-mozu", 'modules/models-product', "modules/soft-cart", "modules/cart-monitor", 'modules/added-to-cart','modules/colorswatch','vendor/wishlist',"modules/quickview-productview","hyprlive", "modules/shared-product-info"], function($,_,api,Backbone,ProductModels, SoftCart, CartMonitor, addedToCart,ColorSwatch,Wishlist,QuickViewProductView,Hypr,SharedProductInfo) {
	
	//	NOTE: modules/quick-view.js handles the action when clicking on "Options" for products that don't have "add to cart" or "personalize" buttons
	
	var initProductForWishlist= function(productCode){
		var product = SharedProductInfo.getProductModel(productCode,initProductForWishlist.bind(null,productCode));
		if(!product){
			 return;
		}
		Wishlist.initoWishlist(product);
	};
	var initProductToPersonalize= function(productCode,personalizebutton){
		//console.log("initProductToPersonalize");
		var product = SharedProductInfo.getProductModel(productCode,initProductToPersonalize.bind(null,productCode,personalizebutton));
		if(!product){
			 return;
		}

		product.set({
			'quantity': $("#qty-" + productCode).val()
		});
		
		var productView = new QuickViewProductView({
			model: product,
			gaAction: 'Buysuperpages',
			gaEvent: 'buysuperpage',
			el: $(personalizebutton).parents("[id='product-"+productCode+"']"),
			additionalEvents:{},
			templateName: 'modules/product/super-page-product'
		});

		productView.personalizeProduct(personalizebutton);
		window.removePageLoader();
	};
	var initProductToAddToCart = function(productCode,button){
		var product = SharedProductInfo.getProductModel(productCode,initProductToAddToCart.bind(null,productCode,button));
		if(!product){
			return;
		}
		
		if(product.get('volumePriceBands')){
			var minqt=_.min(_.pluck(product.get('volumePriceBands'),"minQty"));
			if(minqt>$("#qty-" + productCode).val()){
				window.removePageLoader();
				$(document.body).append("<div class='compare-full-error-container'><div class='remove-item-container'><p>"+"Sorry! Min Qty for this product is "+minqt+"</p><button id='btn-msg-close' class='btn-msg-close'>Okay</button></div></div>");
				return;
			 }
	  	}
		
		var productView = new QuickViewProductView({
			model: product,
			gaAction: 'Buysuperpages',
			gaEvent: 'buysuperpage',
			el: $(button).parents("[id='product-"+productCode+"']"),
			additionalEvents:{},
			templateName: 'modules/product/super-page-product'
		}); // this will run productView.initialize which will set the shared code that needs to fire for product.on('addedtocart')
		
		product.set({
			'quantity': $("#qty-" + productCode).val()
		});
		productView.addToCart();
		
	};
	
    $(document).ready(function() {
        api.on("error",function (err) {
            console.log("Error");
            console.log(err);
            if(err.errorCode==="VALIDATION_CONFLICT"){                
                 window.removePageLoader();
                 $(document.body).append("<div class='compare-full-error-container'><div class='remove-item-container'><p>"+err.message+"</p><button id='btn-msg-close' class='btn-msg-close'>Okay</button></div></div>"); 
            }
			else if(err.message==="Missing or invalid parameter: variationProductCode Product is configurable. Variation code must be specified"){
               window.removePageLoader();
              $(document.body).append("<div class='compare-full-error-container'><div class='remove-item-container'><p> This Product contains options that must be selected before adding to Wishlist. Please select the product to choose an option.</p><button id='btn-msg-close' class='btn-msg-close'>Okay</button></div></div>"); 
            }
        });
    	var filter_end_limit=5;
        if($(window).width()<700){
            filter_end_limit=20;
        }

        $(document).on("click",".super-page-btn a,.super-page-btn-fixed a",function(){
            $(".super-page-btn-fixed").addClass("scrolling");
            var tp=$(".header-float").height()+$(".super-page-btn-fixed").height();
            if( $("#"+$(this).data("prop")).length>0){
                $('.super-page-btn a,.super-page-btn-fixed a').removeClass('active');
                $("a[data-prop='"+$(this).data("prop")+"']").addClass("active");
                 $(".super-page-filter-wrap").css("visibility","hidden");
                     $(".super-btn-fixed-wrap").removeClass("visHidden");
        		 $('html,body').animate({
    		        scrollTop: $("#"+$(this).data("prop")).offset().top-tp+filter_end_limit},
    		        'fast',function () {
                        $(".super-page-btn-fixed").removeClass("scrolling");
                    });
               if($(window).width()<1025){
                 var left_pos=$(this).offset().left;
                 var curr_left=$(".super-page-btn-fixed").scrollLeft();
                 var fixed_mid=Math.round($(".super-page-btn-fixed").width()/2);
                 $(".super-page-btn-fixed").scrollLeft(left_pos+curr_left-fixed_mid);
               }
            }
    	});
        $(document).on("click",".swatch-color",function(){
            if($(window).width>700){
                return false;                
            }
        });
         ColorSwatch.ColorSwatch.init(); 
        $(".qtyplus").click(function(e){
            var $qField = $(e.currentTarget).parent().find('[data-mz-value="quantity"]'),
            newQuantity = parseInt($qField.val(), 10);
            if(!isNaN(newQuantity)){
                newQuantity+=1;
                $qField.val(newQuantity);
            }else{
                newQuantity=1;
                $qField.val(1);
            }
            //if qunatity is greater than 9999 reset qunatity value to 9999, maxlength = 4
            if(newQuantity > 9999){
                newQuantity=9999;
                $qField.val(9999);
            }
        });
        $(".qtyminus").click(function(e){
            var $qField = $(e.currentTarget).parent().find('[data-mz-value="quantity"]'),
            newQuantity = parseInt($qField.val(), 10);
            if(!isNaN(newQuantity) && newQuantity>1){
                newQuantity-=1;
                $qField.val(newQuantity);
            }else{
                newQuantity=1;
                $qField.val(1);
            }
        });
        $('.addToCart').click(function(e){
            window.showPageLoader();
            var productCode = $(e.currentTarget).data('product_id');
			initProductToAddToCart(productCode,$(e.currentTarget));
        });
        $(".personalize").click(function(e){
            var productCode = $(e.currentTarget).data('product_id');
			//console.log(productCode);
            window.showPageLoader();
			initProductToPersonalize(productCode,this);
        });
        $(".addToWishlist").click(function(e){
            if (!require.mozuData('user').isAnonymous) {
                var productCode = $(e.currentTarget).data('product_id');
				initProductForWishlist(productCode);
            } else {
                triggerLogin();
            }
        });
        var ulWidth=0;
       $(".super-page-btn a").each(function(e){
            ulWidth+=$(this).width()+50;
        });
       $(".super-btn-fixed-wrap").appendTo(".header-float");
       $(".super-btn-fixed-wrap").removeClass("hide");
     /* var $owl_fix=$(".super-page-btn-fixed").owlCarousel({
            loop:true,
            margin:10,
            nav:true,
            dots: false,
            autoWidth:true,
            responsive:{
                600:{
                    items:5
                },
                1000:{
                    items:9
                }
            }
        });*/
        var total = 0,
            buttonlist = $('.super-page-btn-fixed li') ;
        buttonlist.each(function(i,v){
            total += (parseInt($(this).width(),10)+parseInt($(this).css("margin-left"),10));
        });
       
        $(".btn-next-fixed").click(function () {
            var avgSize=Math.floor($(".super-page-btn-fixed").width()/$(".super-page-btn-fixed li").length);
             avgSize+=80;
              $('.super-page-btn-fixed').animate({scrollLeft:avgSize +buttonlist.parent().scrollLeft()}, "fast");
        });
        $(".btn-prev-fixed").click(function () {
            var avgSize=Math.floor($(".super-page-btn-fixed").width()/$(".super-page-btn-fixed li").length);
             avgSize+=80;
              $('.super-page-btn-fixed').animate({scrollLeft: buttonlist.parent().scrollLeft()-avgSize}, "fast");
        });
          $(" .btn-next-opt").click(function () {
            var avgSize=Math.floor($(".super-page-btn").width()/$(".super-page-btn li").length);
             avgSize+=80;
              $('.super-page-btn').animate({scrollLeft:avgSize +$(".super-page-btn").scrollLeft()}, "fast");
        });
        $(" .btn-prev-opt").click(function () {
            var avgSize=Math.floor($(".super-page-btn").width()/$(".super-page-btn li").length);
             avgSize+=80;
              $('.super-page-btn').animate({scrollLeft: $(".super-page-btn").scrollLeft()-avgSize}, "fast");
        });
        
       var total_fixed_height=$(".header-float").height()+$(".header-float .super-page-btn-fixed ").height()+$(".product-section-title").first().height()+40;
         var $sections =$(".super-page-section-list");
        window.sectionTopArr=[];
        $sections.each(function(){   
            var divPosition = $(this).offset().top;
            window.sectionTopArr.push({"num":parseInt(divPosition-total_fixed_height,10),"id":$(this).attr("id")});
                
        });
      /*var $owl=$(".super-page-btn.enable-slider").owlCarousel({
            loop:false,
            margin:10,
            nav:true,
            dots: false,
            autoWidth:true,
            responsive:{
                600:{
                    items:5
                },
                1000:{
                    items:6
                }
            }
        });*/

        var super_filter_pos=parseInt($(".super-page-filter-wrap").offset().top,10)-25;
       /* var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if(isFirefox){
            $(window).scroll(_.throttle(function(){
               scrollListerFirefox();
            }, 400));
        }else{

        }*/
            $(window).scroll(_.throttle(function(){
               scrollLister();
            }, 400));
    	function scrollLister(){
             var currentScroll = $(window).scrollTop();
            if(currentScroll>super_filter_pos){
                if($(".super-btn-fixed-wrap").hasClass("visHidden")){
                    $(".super-page-filter-wrap").css("visibility","hidden");
                     $(".super-btn-fixed-wrap").removeClass("visHidden");
                }
        }else{
                 $(".super-page-filter-wrap").css("visibility","visible");
                $(".super-btn-fixed-wrap").addClass("visHidden");
            }
               
            /*var $sections =$(".super-page-section-list");
                var $currentSection;
               $sections.each(function(){   
                  var divPosition = $(this).offset().top;
                  if( divPosition -total_fixed_height  < currentScroll ){
                    $currentSection = $(this);
                  }
                  
                  if($currentSection){
                    var id = $currentSection.attr('id');
                    $('.super-page-btn a,.super-page-btn-fixed a').removeClass('active');
                    $(".super-page-btn  a[data-prop="+id+"],.super-page-btn-fixed a[data-prop="+id+"]").addClass('active');
                  }
                });*/
            if(!$(".super-page-btn-fixed").hasClass("scrolling")){
                var matchs_div=[];
                window.sectionTopArr.forEach(function (el,idx) {
                    if(el.num<currentScroll){
                        matchs_div.push(idx);
                    }
                });
                if(matchs_div.length>0){
                    var min_idx=_.max(matchs_div);
                     $('.super-page-btn a,.super-page-btn-fixed a').removeClass('active');
                      $(".super-page-btn  a[data-prop="+window.sectionTopArr[min_idx].id+"],.super-page-btn-fixed a[data-prop="+window.sectionTopArr[min_idx].id+"]").addClass('active');
                }
            }
    	}
        function scrollListerFirefox(){
             var currentScroll = $(window).scrollTop();
             //console.log(currentScroll);
            if(currentScroll>super_filter_pos){
                if($(".super-btn-fixed-wrap").hasClass("visHidden")){
                    $(".super-page-filter-wrap").css("visibility","hidden");
                     $(".super-btn-fixed-wrap").removeClass("visHidden");
                }
        }else{
                 $(".super-page-filter-wrap").css("visibility","visible");
                $(".super-btn-fixed-wrap").addClass("visHidden");
            }
               
            var $sections =$(".super-page-section-list");
                var $currentSection;
               $sections.each(function(){   
                  var divPosition = $(this).offset().top;
                  if( divPosition -total_fixed_height  < currentScroll ){
                    $currentSection = $(this);
                  }
                  
                  if($currentSection){
                    var id = $currentSection.attr('id');
                    $('.super-page-btn a,.super-page-btn-fixed a').removeClass('active');
                    $(".super-page-btn  a[data-prop="+id+"],.super-page-btn-fixed a[data-prop="+id+"]").addClass('active');
                  }
                });
        }
        $( window ).resize(function() {
             var $sections =$(".super-page-section-list");
        window.sectionTopArr=[];
        $sections.each(function(){   
            var divPosition = $(this).offset().top;
            window.sectionTopArr.push({"num":parseInt(divPosition-total_fixed_height,10),"id":$(this).attr("id")});
                
        });
        });
      
         var triggerLogin = function() {
            $('.trigger-login').trigger('click');
            $('#cboxOverlay').show();
            $('#mz-quick-view-container').fadeOut(350);
            $('#mz-quick-view-container').empty();
        };
        
        function initialize_owl(el) {
            window.owlFixed=el.owlCarousel({
                loop:false,
                margin:10,
                nav:true,
                dots: false,
                autoWidth:true,
                responsive:{
                    0:{
                        items:3
                    },
                    600:{
                        items:5
                    },
                    1000:{
                        items:9
                    }
                }
            });
            window.owlInit=true;
        }
        $(document).on("click",".btn-msg-close",function(){
            $(".compare-full-error-container").remove();
        });       
    });
});