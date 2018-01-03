require(
    [
        "modules/jquery-mozu",
        "underscore",
        'modules/backbone-mozu',
        "hyprlive",
        "modules/api",
        'modules/models-product',
        'modules/cart-monitor',
        'hyprlivecontext',
        'modules/added-to-cart',
        "modules/soft-cart",
        "vendor/wishlist",
		"modules/productview"
    ], function ($, _, Backbone, Hypr, Api, ProductModels, CartMonitor, HyprLiveContext, addedToCart, SoftCart, Wishlist,ProductView) {
        Hypr.engine.setFilter("contains",function(obj,k){ 
            return obj.indexOf(k) > -1;
        });

        var productAttributes = Hypr.getThemeSetting('productAttributes');

        Api.on("error", function(e) {
            $(".mz-messagebar").empty().html(e.message);
        });

        var initProductInQuickview= function(productCode){
			console.log("initProductInQuickview");
            Api.request('get','/api/commerce/catalog/storefront/products/'+productCode).then(function(res){
                var product=new ProductModels.Product(res);
				product.on('addedtocart', function (cartitem, prod) {
					var cartitemModel = new ProductModels.Product(cartitem.data);
					if (cartitem && cartitem.prop('id')) {
						$('#mz-quick-view-container').fadeOut(100, function() {
							$('#mz-quick-view-container').remove();
							$('.dnd-popup').remove();
							$('body').css({overflow: 'auto'});
							$('html').removeClass('dnd-active-noscroll');
							$('#cboxOverlay').hide();
							cartitemModel.set('quantity',prod.get('quantity'));
							CartMonitor.addToCount(product.get('quantity'));
							addedToCart.proFunction(cartitemModel);
							SoftCart.update();

							//Bloomreach add to cart event start
							var productUsage = cartitemModel.attributes.product.productUsage,
								variationProductCode = cartitemModel.attributes.product.variationProductCode,
								sku;
							if(productUsage === 'Bundle' || productUsage === 'Configurable'){
							  
							  if(variationProductCode !== undefined && variationProductCode !== 'undefined'){
								sku = variationProductCode;
							  }
							}
							if(typeof BrTrk !== 'undefined' && BrTrk !== undefined){
								BrTrk.getTracker().logEvent('cart', 'click-add', {'prod_id': cartitemModel.attributes.product.productCode , 'sku' : sku });
							}
							//end

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
								ga('ec:setAction', 'BuyPlp');
								ga('send', 'event', 'buy', 'buyquickview', gaitem.product.name);  

							}
                                        
                                         
							//Facebook pixel add to cart event
							 var track_price=product.get("price").toJSON().price;
							 if(product.get("price").toJSON().salePrice){
								track_price=product.get("price").toJSON().salePrice;
							 } 
							  var track_product_code=[];
							 track_product_code.push(product.toJSON().productCode);
							 if(fbq!==undefined){
								 fbq('track', 'AddToCart', {
									content_ids:track_product_code,
									content_type:'product',
									value: parseFloat(track_price*product.get('quantity')).toFixed(2),
									currency: 'USD'
								});
							 }
							 //Pinterest tracking
							 if(typeof pintrk!=="undefined"){
								 pintrk('track','addtocart',{
									value:parseFloat(track_price*product.get('quantity')),
									order_quantity:product.get('quantity'),
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
									addthis.update('share', 'url',window.location.origin+product.toJSON().url );
									addthis.update('share', 'title',product.toJSON().content.productName); 
								   addthis.toolbox(".addthis_inline_share_toolbox");
								}catch(err){
									console.log("Error on addthis "+err);
								}
							}
						});
					} else {
						product.trigger("error", { message: Hypr.getLabel('unexpectedError') });
					}
				});

				product.on('addedtowishlist', function (cartitem) {
					$('#add-to-wishlist').prop('disabled', 'disabled').text(Hypr.getLabel('addedToWishlist'));
				});
				$('body').append('<div id="mz-quick-view-container"></div>');
				
				var productView = new ProductView({
					el: $('#mz-quick-view-container'),
					messagesEl: $('[data-mz-message-bar]'),
					model:product,
					productCode: productCode,
					templateName: 'modules/product/quickview',
					noCalcDelDate: true // remove overhead of loading holidays to calculate ship/delivery date
				});
				
				productView.customAfterRender = function(){
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
				};
				

				if(require.mozuData("pagecontext").cmsContext.template.path==="super-page"&& $("#qty-" + productCode).length>0){
					productView.setQtyModel($("#qty-" + productCode).val());
				}
				productView.render();
				window.removePageLoader();
				$('#mz-quick-view-container').fadeIn(350); 
				
				//bloomreach quickview integration start
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
				//bloomreach quickview integration end
				
				// begin pre-loading extras or components if personalized
				if(productView.model.get('isPersonalized')){
					productView.loadComponents();
					productView.loadExtras();
				}
            },function(e){
				console.log("error");
				console.error(e);
				if(e.message)
					alert(e.message);
				window.removePageLoader();
				$('body').css({overflow : 'scroll'});
			});
        };

        function getColorSwatchByResponceObject(product, swatchProduct, totalColorSwatchCount, mode) {
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
        }

        $(document).ready(function(){
            /* OPEN */
            $(document).on('click', '.quick-view > a[data-pro-id]', function(e){
                window.showPageLoader();
                $('body').css({overflow : 'hidden'});
                var btn=$(this);
                var productCode = $(this).attr('data-pro-id');
                initProductInQuickview(productCode);
                //getReviewFromPLP(productCode);
                e.preventDefault();
            });
			
            // CLOSE quickview overlay
            $(document).on('click', '#mz-quick-view-container-close, #mz-quick-view-container, .popup.quickview-popup', function(e){
                $('body').css({overflow : 'scroll'});
                if(e.target !== e.currentTarget) return;
                $('#mz-quick-view-container').fadeOut(350);
                $('#mz-quick-view-container').remove();
            });
        });
    });
