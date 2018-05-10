require(["modules/jquery-mozu", "underscore", "hyprlive", "modules/cart-monitor", "modules/models-product", "modules/soft-cart", "modules/productview","modules/api", "vendor/wishlist", "modules/quickview-productview","modules/login-links","vendor/jquery.elevatezoom"],
function ($, _, Hypr, CartMonitor, ProductModels, SoftCart, ProductView, api, Wishlist, QuickViewProductView,LoginLinks,ElevateZoom) {
    Hypr.engine.setFilter("contains",function(obj,k){ 
        return obj.indexOf(k) > -1;
    });

     var initProductView = function(product){
		//console.log("initProductView");
        product.on('error', function(){
            $('.dnd-popup').remove();
            $('body').css({overflow: 'auto'});
            $('html').removeClass('dnd-active-noscroll');
            $('html').css({position:'static'});
            $('#cboxOverlay').hide();
        });
		
        var productView = new ProductView({
            el: $('#product-detail'),
            model: product,
            messagesEl: $('[data-mz-message-bar]')
        }); // this calls productView.initialize;

		 // extend afterRender() to handle alternate images and power reviews display custom to PDP (not used by quick view)
		 productView.customAfterRender = function(){
			//console.log('customAfterRender');
			$('.slider-wrap').on('click','img',function(){
                    var url = $(this).attr('data-image-url');
                    $(this).parent().find("img").removeClass("active");
                    url = (url.indexOf('?')!==-1)?url+'&max=950':'?max=950';
                    $(".product-image").find("#imagei").attr('src', url);
                    $(".product-image").find("img").show();
                    $("#video-frame").hide();
                    $(this).addClass("active");
                    $(".imageContainer > iframe").attr('src', "");
                    $('.mz-productimages-mainimage').data('zoom-image',url).elevateZoom(); 
                });
            $(".video-slider img").click(function(){
                if($(this).data("video")){    
                    $(".product-image .imageContainer").find('img').hide();
                    $(".product-image").find('iframe').attr('src', '//www.youtube.com/embed/' + $(this).data("video")+"?autoplay=1").show();
                    $('.zoomContainer').hide();
                }
            });
            $("#video-frame").hide();

            $(".custom-qty").children(".qtyminus,.qtyplus").css({"background-color":"transparent","fonts-size":"1rem"});
		 };
		 
        productView.render();
		return productView;
    };

    $(".show-more").on("click", function(e) {
        e.preventDefault();
        var $this = $(this); 
        var $content = $this.parent().find("div.content");
        var linkText = $this.text().toUpperCase();    
        
        if(linkText === "...READ MORE"){
            linkText = "...read less";
            $(this).addClass('show-less');
            $content.switchClass("hideContent", "showContent", 400);
        } else {
            linkText = "...read more";
            $(this).removeClass('show-less');
            $content.switchClass("showContent", "hideContent", 400);
        }
        
        $this.text(linkText);
    });
	
        var product = ProductModels.Product.fromCurrent();
        
		var bp = product.get('bundledProducts');
		for (var i =0; i< bp.length; i++) {
		   //console.log(bp[i]);
		}

	
		var productView = initProductView(product);
	
	$(document).ready(function () {
      
        api.on('error',function(xhr){
            console.log("Error");
            console.log(xhr);
            if(xhr.errorCode == "VALIDATION_CONFLICT" && xhr.message.indexOf('out of stock')){
                var errMsg = xhr.message;
                if(errMsg.indexOf("Validation Error: ") >= 0){
                    errMsg = errMsg.substr(errMsg.indexOf("Validation Error: ")+18);
                }
                window.removePageLoader();
                $(document.body).append("<div class='compare-full-error-container'><div class='remove-item-container'><p>"+errMsg+"</p><button id='btn-msg-close' class='btn-msg-close'>Okay</button></div></div>"); 
                $(document).on("click",".compare-full-error-container .btn-msg-close",function(){
                    $(".compare-full-error-container").remove();
                }); 
            }
        });

        try{
            $('.enable-slideshow').cycle();
            //console.log("cycle  started");
        }catch(err){
            console.log(err);
        }
        var shipping = $('#tab-content4 .mz-cms-content').html();
        $('.shipping-content').html(shipping);
		
		// show bundle components on "see what's included" button click
        $('.bundle-comp-pdp-section .show-cmp-bundle').click(function(e){
            $(this).toggleClass("active");
            if($(this).hasClass("active")){
                $(this).find("span").text("Hide Components");
            }else{
                $(this).find("span").text("Show Components");
            }
            $('.bundle-comp-pdp-section .bundle-block').slideToggle(); // modules/product/pdp-bundle-products
            return false;
        });
        
        $('#zoombutton').on('click', function() {
            if( $('.enabled').length === 0 ) {
                if( $('.zoomContainer').length ) {
                    $('.zoomContainer').show();
                    $(this).toggleClass('enabled');
                } else {
                    $("#imagei").elevateZoom();
                }
            } else {
                $(this).toggleClass('enabled');
                $('.zoomContainer').hide();
            }
        });
        
        $(document).on('click', '.tabbableContainer .tab span', function(e){
            var element = e.currentTarget;
            $('.tabbableContainer .tablinks').removeClass('selected');
            $(element).addClass('selected');
            var tabName = $(element).data('tabnames');
            $('.tabbableContainer .tabcontent').addClass('hide');
            $('.tabbableContainer #'+tabName).removeClass('hide');
        });
        
        $('.productExtrasContainer .item').removeClass('hide');
        $('.productExtrasContainer .owl-carousel').owlCarousel({
            loop:false,
            margin:8,
            nav:true,
            responsive:{
                0:{
                    items:10
                },
                600:{
                    items:10
                },
                1000:{
                    items:12
                }
            }
        });

        
        $(document).on('click', '.outofStock', function(e){ 
            e.preventDefault();
            $('[data-mz-validationmessage-for]').text('');
            if( $('.mz-productoptions-valuecontainer').length){
                if(jQuery('.mz-productoptions-valuecontainer form input:radio:checked').length){   
                    console.log('checked');
                }else{
                    alert('Please select an option');
                    return false;
                }
            }
            
            $("#mz-drop-zone-instock-notice .mz-cms-content").show();
            $("#mz-drop-zone-instock-notice .mz-cms-content").next('span').show();
        });
        
        $(document).on('click', '.close', function(){
            $("#mz-drop-zone-instock-notice .mz-cms-content").hide();
        });
            
            $(document).on('click', ".cross-sellContainer .addToCart", function(e){
                var ele = e.currentTarget;
                window.showPageLoader();
                
                var productCode = $(ele).data("productid"); 
                var quantity = $(ele).closest('.item').find('.qtybtn input').val();
                var gaAction = 'BuyPlp';
                var gaEvent = 'buyquickview';
                $('body').append('<div id="mz-quick-view-container"></div>');
                api.get('product', productCode).then(function(sdkProduct) {
                    var product = new ProductModels.Product(sdkProduct.data);
                    var productView = new QuickViewProductView({
                        model:product,
                        gaAction: gaAction,
                        gaEvent: gaEvent
                    });
                    
                    productView.setIsPersonalized(); 
                    if(productView.model.get('isPersonalized')){
                        $('#mz-quick-view-container').fadeIn(350);
                        productView.render();
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
                        if(productView.model.get('isPersonalized')){
                            productView.loadComponents();
                            productView.loadExtras();
                        }
                        window.removePageLoader();
                    } else {
                        
                        product.set('quantity', quantity);
                        product.addToCart();
                        window.removePageLoader();
                    }  
                });
            });
            
            
            $(document).on('click', ".cross-sellContainer .add-to-wishlist-pdp", function(e){
                var ele = e.currentTarget;
                if (!require.mozuData('user').isAnonymous) {
                    var productCode = $(ele).data("productid");
                    
                    api.get('product', productCode).then(function(sdkProduct) {
                        var PRODUCT = new ProductModels.Product(sdkProduct.data);
                        
                        if(!require.mozuData('user').isAnonymous) {
                            PRODUCT.set('moveToWishList', 1);
                            Wishlist.initoWishlist(PRODUCT);
                        }else {
                            var productDetailToStoreInCookie ={};
                            productDetailToStoreInCookie.productCode=PRODUCT.get('productCode');
                            var objj=PRODUCT.getConfiguredOptions();
                            productDetailToStoreInCookie.options=objj;
                            $.cookie('wishlistprouct','direct',{path:'/'});
                            var ifrm = $("#homepageapicontext");
                            if(ifrm.contents().find('#data-mz-preload-apicontext').html()){
                                PRODUCT.set('moveToWishList', 1);
                                Wishlist.initoWishlist(PRODUCT);
                            }else{
                                LoginLinks.triggerLogin();
                            }
                        }
                        
                    });
                    
                } else {
                    LoginLinks.triggerLogin();
                }
            });   
            
       var reviewname = $('.mz-pagetitle').text();
        $(document).on("click",'[data-pr-event="snippet-read-reviews"]',function(e){
             if(ga!==undefined){
                ga('send', {
            hitType: 'event',
            eventCategory: 'PdpreadwriteReview',
            eventAction: 'Pdp-Read-Review',
            eventLabel: reviewname
            });
            }

            $('#tab2').prop('checked', true);
            if (require.mozuData('pagecontext').isDesktop){
                 $('html, body').animate({
                    scrollTop: $("#tab-content2").offset().top - 120
                }, 1000);

             }
             else if(require.mozuData('pagecontext').isTablet){
                 $('html, body').animate({
                    scrollTop: $("#tab-content2").offset().top - 92
                }, 1000);
             }
             else{ 
                $('html, body').animate({
                    scrollTop: $("#tab-content2").offset().top - 72
                }, 1000);

             } 
            return false;
        });
        $(".pdp-bundle-close,.bundle-items-wrap-pdp").click(function () {
           $(".bundle-items-wrap-pdp").fadeOut();
           $("body").css("overflow-y","auto");
        });  
        $(".bundle-block").click(function (e) {
            e.stopPropagation();     
        });
        $("body").on("click",".image-spec-container",function (e) {
            e.stopPropagation();
        });
        $("body").on("click",".see-spec-img",function (e) {
            $(".image-spec-wrap").fadeIn();
            $(".image-spec-wrap").addClass("showDefault");
        });
        $("body").on("click",".img-close-btn,.image-spec-wrap",function () {
            $(".image-spec-wrap").removeClass("showDefault");
            $(".image-spec-wrap").hide();
        });
        $("body").on("click","#next-slider-btn",function() {
            $("#prev-slider-btn").removeClass("hide");
        });
        $(document).on("click",'[data-pr-event="snippet-write-review"]',function(e){
             if(ga!==undefined){
                ga('send', {
            hitType: 'event',
            eventCategory: 'PdpreadwriteReview',
            eventAction: 'Pdp-Write-Review',
            eventLabel: reviewname
            });
            }

        });
		
		productView.loadComponents(productView.loadComponentImages.bind(productView)); // start loading bundle component info in background (will allow better display of "what's inside" as well as less load time if customer tries to personalize)
			
		productView.loadExtras(); // start loading extras info in background (will be less load time if customer tries to personalize)
    });

});
