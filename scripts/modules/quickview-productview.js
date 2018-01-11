define(["modules/jquery-mozu","hyprlive","modules/api", "modules/productview"],
function ($,Hypr,Api,ProductView) {

		$(document).ready(function(){
            // CLOSE quickview overlay
            $(document).on('click', '#mz-quick-view-container-close, #mz-quick-view-container, .popup.quickview-popup', function(e){
                $('body').css({overflow : 'auto'});
                if(e.target !== e.currentTarget) return;
                $('#mz-quick-view-container').fadeOut(350);
                $('#mz-quick-view-container').remove();
            });
        });
	
    var productAttributes = Hypr.getThemeSetting('productAttributes');
	var getColorSwatchByResponceObject = function (product, swatchProduct, totalColorSwatchCount, mode) {
            product = product.toJSON();
            var i = 0, j = 0;
            
            var colorName = null, href = null, objA = null, objLI = null, temp = null, src = null;
            var limit  = (swatchProduct.items.length > 8) ? 8: swatchProduct.items.length;

			if(limit > 0 && mode==="asColors"){
				var colorText = "Colors: ";
				if($('#color-swatch-elem > span').text() === colorText){ // to prevent duplicate if view is rendered multiple times and a previous api call is slow
					return;
				}
				else{
					$('#color-swatch-elem > span').text(colorText);
				}
			}
			else if(limit > 0){
				var styleText = "Styles: ";
				if($('#color-swatch-elem > span').text() === styleText){
					return; // exit to prevent duplicate if view is rendered multiple times and a previous api call is slow
				}
				else{
					$('#color-swatch-elem > span').text(styleText);
				}
			}
			
            for(i = 0; i < limit; i++) {
                if(mode === "asColors") {
                    for(j = 0; j < swatchProduct.items[i].properties.length; j++) {
                        if(swatchProduct.items[i].properties[j].attributeFQN === productAttributes.colorHex && swatchProduct.items[i].properties[j].values[0].value !== "") {
                            colorName = swatchProduct.items[i].properties[j].values[0].value;
                            break;
                        }
                    }
                    if(colorName !== "") {
                        objA = document.createElement("a");
                        $(objA).attr("href", "/"+swatchProduct.items[i].content.seoFriendlyUrl+"/p/" + swatchProduct.items[i].productCode).addClass('swatch-color').css("background-color", colorName);
                        objLI = document.createElement("li");
                        $(objLI).append(objA);
                        $('ul[color-swatch-data]').append(objLI);
                    }
                }else {
					if(swatchProduct.items[i].content.productImages.length > 0 && swatchProduct.items[i].content.productImages[0].imageUrl !== "") {
						src = swatchProduct.items[i].content.productImages[0].imageUrl + "?max=50";
						objA = document.createElement("a");
						$(objA).attr("href", "/"+swatchProduct.items[i].content.seoFriendlyUrl+"/p/" + swatchProduct.items[i].productCode).attr("title",swatchProduct.items[i].content.productName);
						$("<img/>").attr('src', src).appendTo(objA);
						objLI = document.createElement("li");
						$(objLI).addClass("swatch-image").css('border-radius', '50%').append(objA);
						$('ul[color-swatch-data]').append(objLI);
					}
                }
            }
            if(totalColorSwatchCount > 6) {
                objA = document.createElement("a");
                if(mode == "asColors") {
                    $(objA).attr("href", product.url).attr("class", "more-link").html("See All Colors");
                }else{
                    $(objA).attr("href", product.url).attr("class", "more-link").html("See All Styles");
                }
                objLI = document.createElement("li");
                $(objLI).addClass("more-link").append(objA);
                $('ul[color-swatch-data]').append(objLI);
            }
        };
	
	
	// this doesn't create a class correctly - need to fix...
	var QuickViewProductView = (function(){
		var C = function(){// constructor
			return constructor.apply(this,arguments);
		};
		var p = C.prototype;
		// example new function p.test = function(a){};

		
		var constructor = function(){
			
			// defaults for this type of view
			var opts = {
				el: $('#mz-quick-view-container'),
				messagesEl: $('[data-mz-message-bar]'),
				templateName: 'modules/product/quickview',
				noCalcDelDate: true, // remove overhead of loading holidays to calculate ship/delivery date
				customAfterRender: function(){
					console.log('customAfterRender');
					
					var me = this;

					// draw alternate image carousel
					if($('.product-image-slider .owl-carousel').length > 0){
						setTimeout(function(){
							$('.product-image-slider .owl-next, .product-image-slider .owl-prev').html('');
							$('.product-image-slider .owl-carousel')
							.owlCarousel({dots: true,loop: true,nav: true,items: 4})
							.owlCarousel('refresh');

							if($('.product-image-slider .owl-carousel .owl-item').length < 4) {
								$('.product-image-slider .owl-prev').hide();
								$('.product-image-slider .owl-next').hide();
							}
							$('.product-video .owl-next, .product-video .owl-prev').html('');
							$('.product-video .owl-carousel')
							.owlCarousel({dots: false,loop: false,nav: true,items: 1})
							.owlCarousel('refresh');
							if($('.product-video .owl-carousel .owl-item').length < 2) {
								$('.product-video .owl-next').hide();
								$('.product-video .owl-prev').hide();
							}
						}, 50);
					   $('.product-image-slider').on('click','.item',function(){
							var url = $(this).find('img').attr('data-image-url');
							url = (url.indexOf('?')!==-1)?url+'&max=350':'?max=350';
							$(".product-image > img").attr('src', url);
							$(".product-image > img").show();
							$("#video-frame").hide();
							$(".product-image > iframe").attr('src', "");
						});
					}
					$("div[video-data] > img").click(function(){
						if($(this).parent().attr("video-data")){
							$(".product-image > img").hide();
							$(".product-image > iframe").attr('src', '//www.youtube.com/embed/' + $(this).parent().attr("video-data")).show();
						}
					});
					$("#video-frame").hide();

					// load cross-sell images
					var proCodes = $('ul[color-swatch-data]').attr('color-swatch-data');
					if(proCodes){
						var procodeArray = proCodes.split(',');
						var totalColorSwatchCount =  procodeArray.length;
						// should already include 1 swatch for current product, add up to 7 more
						var productCodefilter = procodeArray.slice(0,7).join(' or ProductCode eq ');
						if (typeof proCodes !== "undefined" && procodeArray.length>0) {
							var mode = "asImages";
							var properties = me.model.get('properties');
							for(var i = 0; i < properties.length; i++) {
								if(properties[i].attributeFQN === productAttributes.displayCrossSell) {
									mode = properties[i].values[0].value;
									break;
								}
							}
							
							var responseFields = "items(productCode,content(productName,seoFriendlyUrl,productImages))";
							if(mode === "asColors"){
								responseFields= "items(productCode,content(productName,seoFriendlyUrl,productImages), properties)"; // needs properties for color hex
							}
								
							var apiURL = '/api/commerce/catalog/storefront/products/?filter=ProductCode eq ' + productCodefilter + '&responseFields='+responseFields;
							//var apiURL = '/api/commerce/catalog/storefront/products/?filter=' + proCodes;
								
							Api.request('GET', apiURL, {}).then(function(responseObject) {
								getColorSwatchByResponceObject(me.model, responseObject,totalColorSwatchCount,mode);
							});
						}
					}

					$("#mz-quick-view-container").children(".qtyminus,.qtyplus").css({"background-color":"transparent","fonts-size":"1rem"});
					$(".addToWishlist-btn-extra").click(function(){
						me.addToWishlist();
					});
					
					if(typeof window.addthis!=="undefined"){
						//Update addthis to currect product model and rerender.
						try{
							addthis.update('share', 'url',window.location.origin+me.model.toJSON().url );
							addthis.update('share', 'title',me.model.toJSON().content.productName); 
						   addthis.toolbox(".addthis_inline_share_toolbox");
						}catch(err){
							console.log("Error on addthis "+err);
						}
					}
					//getReviewFromPLP(this.productCode);
				}
			};
			
			// overwrite with any arguments passed in;
			for (var i=0; i<=arguments.length;i++) {
				for(var attrname in arguments[i]){
					opts[attrname] = arguments[i][attrname]; 
				}
			}
			var obj = new ProductView(opts);
			obj.model.on('addedtocart', function (cartitem, prod) {
				console.log("quickview on addedtocart");
				// only custom code needed for not already in productView.initialize
				$('#mz-quick-view-container').fadeOut(100, function() {
					 $('#mz-quick-view-container').remove();
				 });
			});
			
			return obj;
		};
		
		//unleash your class
		return C;
	})();

	return QuickViewProductView;
});