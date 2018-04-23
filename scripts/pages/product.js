require(["modules/jquery-mozu", "underscore", "hyprlive", "modules/cart-monitor", "modules/models-product", "modules/soft-cart", "modules/productview", "widgets/powerreviews"],
function ($, _, Hypr, CartMonitor, ProductModels, SoftCart, ProductView,PowerReviews) {
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
		try{
			PowerReviews.writeProductListBoxes(product.get('productCode'));
		}
		catch(e){
			console.log(e); 
		}
		return productView;
    };
	
        var product = ProductModels.Product.fromCurrent();
        
		var bp = product.get('bundledProducts');
		for (var i =0; i< bp.length; i++) {
		   //console.log(bp[i]);
		}

	
		var productView = initProductView(product);
	
	$(document).ready(function () {
      
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
