define(['modules/jquery-mozu','underscore', 'modules/api',"modules/backbone-mozu", 'modules/models-product', "modules/soft-cart", "modules/cart-monitor", 'modules/added-to-cart','pages/colorswatch-super','vendor/wishlist',"modules/productview","hyprlive"], function($,_,api,Backbone,ProductModels, SoftCart, CartMonitor, addedToCart,ColorSwatch,Wishlist,ProductView,Hypr) {
	
	 var initProductInQuickview= function(productCode,personalizebutton){
		console.log("initProductInQuickview");
		api.request('get','/api/commerce/catalog/storefront/products/'+productCode).then(function(res){
			var product=new ProductModels.Product(res);
			var productView = new ProductView(product);
			product.on('addedtocart', function(cartitem) {
                if (cartitem && cartitem.prop('id')) {
                    var cartitemModel = new ProductModels.Product(cartitem.data);
                  
                    $('.dnd-popup').hide();
                     $('body').css({overflow: 'scroll'});
                $('html').removeClass('dnd-active-noscroll');
                $('#cboxOverlay').hide();
                    CartMonitor.addToCount(product.get('quantity'));
                    SoftCart.update();
                   window.removePageLoader();
                    addedToCart.proFunction(cartitemModel);
                    
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
                        ga('ec:setAction', 'Buysuperpagepersonal');
                        ga('send', 'event', 'buy', 'buysuperpagepersonalize', gaitem.product.name);  
 
                    } 
                                        

                    //Facebook pixcel tracking
                    var track_price= product.get("price").toJSON().price;
                         if( product.get("price").toJSON().salePrice){
                            track_price= product.get("price").toJSON().salePrice;
                         }
                        var track_product_code=[];
                         track_product_code.push(product.toJSON().productCode);
                         if(typeof fbq!=="undefined"){
                             fbq('track', 'AddToCart', {
                                content_ids:track_product_code,
                                content_type:'product',
                                value: parseFloat(track_price*product.get('quantity')).toFixed(2),
                                currency: 'USD'
                            });
                         }
                         if(typeof pintrk!=="undefined"){
                             pintrk('track','addtocart',{
                                value:parseFloat(track_price*product.get('quantity')),
                                order_quantity:parseInt(product.get('quantity'),10),
                                currency:"USD",
                                line_items:[{
                                    product_name:product.toJSON().content.productName,
                                    product_id:track_product_code[0],
                                    product_price:parseFloat(track_price),
                                    product_quantity:parseInt(product.get('quantity'),10)
                                }]
                            });
                         }
                      if(typeof window.addthis!=="undefined"){
                          ///Update addthis to currect product model and rerender.
                          try{
                              addthis.update('share', 'url',product.toJSON().url );
                              addthis.update('share', 'title',product.toJSON().content.productName); 
                             addthis.toolbox(".addthis_inline_share_toolbox");
                          }catch(err){
                              console.log("Error on addthis "+err);
                          }
                      }
                }

            });
			
			productView.personalizeProduct(personalizebutton);
		});
	 };
	
    $(document).ready(function() {
        api.on("error",function (err) {
            console.log("Error");
            console.log(err);
            if(err.errorCode==="VALIDATION_CONFLICT"){                
                 window.removePageLoader();
                 $(document.body).append("<div class='compare-full-error-container'><div class='remove-item-container'><p>"+err.message+"</p><button id='btn-msg-close' class='btn-msg-close'>Okay</button></div></div>"); 
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
            var productCode = $(e.currentTarget).data('product_id'), product, itemQty;
            api.request('GET','/api/commerce/catalog/storefront/products/'+productCode).then(function(res){
                    if(res.volumePriceBands!==undefined){
                        var minqt=_.min(_.pluck(res.volumePriceBands,"minQty"));
                        if(minqt<=$("#qty-" + productCode).val()){
                                var ProductMod= new ProductModels.Product(res);
                                var itemQty=1;
                                ProductMod.on('addedtocart', function(cartitem) {
                                    if (cartitem && cartitem.prop('id')) {
                                        var cartitemModel = new ProductModels.Product(cartitem.data);
                                      
                                        $('.dnd-popup').hide();
                                        CartMonitor.addToCount(ProductMod.get('quantity'));
                                        SoftCart.update();
                                       window.removePageLoader();
                                        addedToCart.proFunction(cartitemModel);
                                        
                                        
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

                    if(typeof ga!== "undefined"){
                        ga('ec:addProduct', {
                        'id': proID,
                        'name': gaitem.product.name,
                        'category': gaitem.product.categories[0].id,
                        'brand': 'shindigz',
                        'variant': gaoptionval,
                        'price': gaitem.unitPrice.extendedAmount,
                        'quantity': gaitem.quantity
                        });
                        ga('ec:setAction', 'Buysuperpage');
                        ga('send', 'event', 'buy', 'buysuperpagednd', gaitem.product.name);  
 
                    } 

                                          

                                        //Facebook pixel add to cart event
                                       var track_price=ProductMod.get("price").toJSON().price;
                                       if(ProductMod.get("price").toJSON().salePrice){
                                          track_price=ProductMod.get("price").toJSON().salePrice;
                                       }
                                        var track_product_code=[];
                                        track_product_code.push(ProductMod.toJSON().productCode); 
                                        if(fbq!==undefined){
                                           fbq('track', 'AddToCart', {
                                              content_ids:track_product_code,
                                              content_type:'product',
                                              value: parseFloat(track_price*ProductMod.get('quantity')).toFixed(2),
                                              currency: 'USD'
                                          });
                                       }
                                       //Pinterest tracking
                                       if(pintrk!==undefined){
                                           pintrk('track','addtocart',{
                                              value:parseFloat(track_price*ProductMod.get('quantity')),
                                              order_quantity:parseInt(ProductMod.get('quantity'),10),
                                              currency:"USD",
                                              line_items:[{
                                                  product_name:ProductMod.toJSON().content.productName,
                                                  product_id:track_product_code[0],
                                                  product_price:parseFloat(track_price).toFixed(2),
                                                  product_quantity:parseInt(ProductMod.get('quantity'),10)
                                              }]
                                          });
                                       }
                                       if(typeof window.addthis!== "undefined"){
                                    ///Update addthis to currect product model and rerender.
                                    try{
                                        addthis.update('share', 'url',window.location.origin+ProductMod.toJSON().url );
                                        addthis.update('share', 'title',ProductMod.toJSON().content.productName); 
                                       addthis.toolbox(".addthis_inline_share_toolbox");
                                    }catch(err){
                                        console.log("Error on addthis "+err);
                                    }
                                }
                                    }
                                });
                                ProductMod.set({
                                    'quantity': $("#qty-" + productCode).val()
                                });
                                  ProductMod.addToCart();
                        }else{
                            window.removePageLoader();
                            $(document.body).append("<div class='compare-full-error-container'><div class='remove-item-container'><p>"+"Sorry! Min Qty for this product is "+minqt+"</p><button id='btn-msg-close' class='btn-msg-close'>Okay</button></div></div>"); 
                         }
                    }else{
                        var ProductMod1= new ProductModels.Product(res);
                        ProductMod1.on('addedtocart', function(cartitem) {
                        if (cartitem && cartitem.prop('id')) {
                        var cartitemModel = new ProductModels.Product(cartitem.data);

                        $('.dnd-popup').hide();
                        CartMonitor.addToCount(ProductMod1.get('quantity'));
                        SoftCart.update();
                        window.removePageLoader();
                        addedToCart.proFunction(cartitemModel);

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
                        ga('ec:setAction', 'Buysuperpages');
                        ga('send', 'event', 'buy', 'buysuperpage', gaitem.product.name);  
 
                    } 
                                        

                         //Facebook pixel add to cart event
                         var track_price=ProductMod1.get("price").toJSON().price;
                         if(ProductMod1.get("price").toJSON().salePrice){
                            track_price=ProductMod1.get("price").toJSON().salePrice;
                         } 
                          var track_product_code=[];
                           track_product_code.push(ProductMod1.toJSON().productCode);
                           if(fbq!==undefined){
                               fbq('track', 'AddToCart', {
                                  content_ids:track_product_code,
                                  content_type:'product',
                                  value: parseFloat(track_price*ProductMod1.get('quantity')).toFixed(2),
                                  currency: 'USD'
                              });
                          }
                          if(typeof pintrk!== "undefined"){
                             pintrk('track','addtocart',{
                                value:parseFloat(track_price*ProductMod1.get('quantity')),
                                order_quantity:parseInt(ProductMod1.get('quantity'),10),
                                currency:"USD",
                                line_items:[{
                                    product_name:ProductMod1.toJSON().content.productName,
                                    product_id:track_product_code[0],
                                    product_price:parseFloat(track_price),
                                    product_quantity:parseInt(ProductMod1.get('quantity'),10)
                                }]
                            });
                         }
                          if(typeof window.addthis!== "undefined"){
                              ///Update addthis to currect product model and rerender.
                              try{
                                  addthis.update('share', 'url',window.location.origin+ProductMod1.toJSON().url );
                                  addthis.update('share', 'title',ProductMod1.toJSON().content.productName); 
                                 addthis.toolbox(".addthis_inline_share_toolbox");
                              }catch(err){
                                  console.log("Error on addthis "+err);
                              }
                          }
                        }

                        });
                        ProductMod1.set({
                        'quantity': $("#qty-" + productCode).val()
                        });
                        ProductMod1.addToCart();
                    }
               
            });
        });
        $(".personalize").click(function(e){
              var productCode = $(e.currentTarget).data('product_id');
              window.showPageLoader();
			initProductInQuickview(productCode,this);
        });
        $(".addToWishlist").click(function(e){
            if (!require.mozuData('user').isAnonymous) {
                var productCode = $(e.currentTarget).data('product_id');
                api.request('GET','/api/commerce/catalog/storefront/products/'+productCode).then(function(res){
                var ProductMod= new ProductModels.Product(res);
                Wishlist.initoWishlist(ProductMod);
            });
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
             console.log(currentScroll);
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