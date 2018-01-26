require(["modules/jquery-mozu", "underscore", "hyprlive", "modules/cart-monitor", "modules/models-product", "modules/soft-cart", "modules/added-to-cart", "modules/productview", "modules/powerreviews"],
function ($, _, Hypr, CartMonitor, ProductModels, SoftCart, addedToCart, ProductView,PowerReviews) {
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
	/*	
        var productImagesView = new ProductImageViews.ProductPageImagesView({
            el: $('[data-mz-productimages]'),
            model: product
        });
*/
		 // extend afterRender() to handle alternate images and power reviews display custom to PDP (not used by quick view)
		 productView.customAfterRender = function(){
			//console.log('customAfterRender');
			$('.slider-wrap').on('click','img',function(){
                    var url = $(this).attr('data-image-url');
                    $(this).parent().find("img").removeClass("active");
                    url = (url.indexOf('?')!==-1)?url+'&max=450&quality=75':'?max=450&quality=75';
                    $(".product-image > img").attr('src', url);
                    $(".product-image > img").show();
                    $("#video-frame").hide();
                    $(this).addClass("active");
                    $(".product-image > iframe").attr('src', "");
                });
            $(".video-slider img").click(function(){
                if($(this).data("video")){    
                    $(".product-image > img").hide();
                    $(".product-image > iframe").attr('src', '//www.youtube.com/embed/' + $(this).data("video")+"?autoplay=1").show();
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
	
	// get product info of all items used as extras - http.commerce.catalog.storefront.products.getProduct.after (application Pricing_Arc_Prod) returns extras as http header "productExtras"
	/*
    var getExtrasProductDetails= function(product){
        var api = Api;
        api.on('success', function(res, xhr,request){
            try{
                var productExtrasResponse = xhr.getResponseHeader("productExtras");
                if(productExtrasResponse && productExtrasResponse!==""){
                    var productExtras = JSON.parse(productExtrasResponse);
                    if(productExtras.length>0){
                        for(var i=0;i<productExtras.length;i++){
                            var dndCode = getPropteryByAttributeFQN(productExtras[i], productAttributes.dndCode);
                            if(dndCode){
                                $('.addToCart').html('Personalize').addClass('personalize').removeAttr('id').attr('disabled',true);
                            }
                            window.extrasProducts.push(productExtras[i]);
                        }

                    }

                }
            }catch(e){
                console.log(e);
            }
        }); 
        api.request('get','/api/commerce/catalog/storefront/products/'+product.get('productCode')+'?my=1').then(function(res){
			var product=new ProductModels.Product(res);
                initProductView(product);
        }); 
    }; */
	
	// get product info of bundle items with stardard productUsage (can get multiple at a time since they are available for sale on their own)
/*    function getStandardProductDetails(productCodes){
        if(productCodes.length>0){
            var filter = '';
            for(var i= 0; i<productCodes.length;i++){
                if(i > 0)
                    filter+=' or productCode eq '+productCodes[i];
                else
                   filter+='productCode eq '+productCodes[i];
            }
            Api.get('products',{filter:filter}).then(function(res){
                if(res.length>0){
                    for(var i=0;i<res.length;i++){
                        var product=new ProductModels.Product(res[i].data);
                        var uom = getPropteryValueByAttributeFQN(product, productAttributes.unitOfMeasure);
                        if(uom===null){
                            uom = '';
                        }
                        //var price = '$'+product.get('price').get('price')+" "+uom;
                        $('[productcode="'+product.get('productCode')+'"]').find('.uom').html(uom).show();
						
						var mcCode = getPropteryValueByAttributeFQN(product, productAttributes.mcCode); // mediaclip code
                        var dndCode = getPropteryValueByAttributeFQN(product, productAttributes.dndCode);
                        if(dndCode || mcCode){
                            window.personalizeBundleProducts.push(product);
                        }
                    }
                }
                getBundleProductDetails(BundleItems);

            });
        }else{
            getBundleProductDetails(BundleItems);
        }
    } */
	/*
	// get product info of bundle items with component productUsage (can only get 1 at a time in api since we are using storefront)
    function getBundleProductDetails(arr){
        if(BundleItems.length>0){
                Api.get('product',{"productCode":arr[loopcounter]}).then(function(res){
                    //console.log(res);
                    var product = new ProductModels.Product(res.data);
                    var productImage = product.get('content.productImages');
                    if(productImage.length>0){
                        $('[productcode="'+arr[loopcounter]+'"]').find('.block-img-sec').html('<img class="bundle-img" src="'+productImage[0].imageUrl+'?max=100"/>');
                    }
                    var uom = getPropteryValueByAttributeFQN(product, productAttributes.unitOfMeasure);
                    if(uom===null){
                        uom = '';
                    }
                    //var price = '$'+product.get('price').get('price')+" "+uom;
                    $('[productcode="'+arr[loopcounter]+'"]').find('.uom').html(uom).show();

                    var mcCode = getPropteryValueByAttributeFQN(product, productAttributes.mcCode); // mediaclip code
					var dndCode = getPropteryValueByAttributeFQN(product, productAttributes.dndCode);
                    if(dndCode || mcCode){
                        window.personalizeBundleProducts.push(product);
                    }
                    loopcounter++;
                    if(loopcounter < arr.length){
                        getBundleProductDetails(arr);
                    }else{
						
                     //   if(isPersonalize){
                      //      $('.addToCart').html('Personalize').addClass('personalize').removeAttr('id');
                      //  }else{
                     //       $('.addToCart').attr('disabled',true).removeClass('is-disabled');
                    //   } 
                        window.removePageLoader();
                    }
                });
        }else{
			
            // if(isPersonalize){
             //       $('.addToCart').html('Personalize').addClass('personalize').removeAttr('id');
           // }
            window.removePageLoader();

        }
    }
*/


    

		
        var product = ProductModels.Product.fromCurrent();
        
		var bp = product.get('bundledProducts');
		for (var i =0; i< bp.length; i++) {
		   //console.log(bp[i]);
		}
		
		/*  need to refigure...
        var BundleSections = $('.bundle-block').find('[productcode]');

        BundleSections.each(function(){
            if($(this).find('input[name="productUsage"]').length===0){
                BundleItems.push($(this).attr('productCode'));
            }else{
                standardProducts.push($(this).attr('productCode'));
            }
        });
		
        if(standardProducts.length > 0 || BundleItems.length>0){
            window.showPageLoader();
            getStandardProductDetails(standardProducts);
        } */
		
		//window.showPageLoader();
	
		var productView = initProductView(product);
		
        /*var options = product.get('options').toJSON();
        var extrasProductCodes = [];
        for(var ind =0 ; ind < options.length; ind++){
            if(options[ind].attributeDetail.usageType==='Extra' && options[ind].attributeDetail.dataType==='ProductCode'){
                for(var ind1=0; ind1 < options[ind].values.length; ind1++){
                    extrasProductCodes.push(options[ind].values[ind1].value);
                }
            }
        }*/
	
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
