require(
    [
        "modules/jquery-mozu",
        "underscore",
        'modules/backbone-mozu',
        "hyprlive",
        'modules/models-faceting',
        "modules/api",
        'modules/models-product',
        'modules/cart-monitor',
        'modules/views-productimages',
        'modules/models-faceting',
        'hyprlivecontext',
        'modules/added-to-cart',
        'modules/powerreviews',
        "modules/soft-cart",
        "vendor/wishlist"
    ], function ($, _, Backbone, Hypr, FacetingModels, Api, ProductModels, CartMonitor, ProductImageViews, facetingProducts, HyprLiveContext, addedToCart, PowerReviews, SoftCart, Wishlist) {

        Api.on("error", function(e) {
            $(".mz-messagebar").empty().html(e.message);
        });

        function triggerLogin(){   
            $('.trigger-login').trigger('click');
            $('#cboxOverlay').show();
            $('#mz-quick-view-container').fadeOut(350);
            $('#mz-quick-view-container').empty();
        }

        function getColorSwatchByResponceObject(product, swatchProduct) {
            product = product.toJSON();
            var productAttributes = Hypr.getThemeSetting('productAttributes');
            var i = 0, j = 0;
            var mode = "asImages";
            for(i = 0; i < product.properties.length; i++) {
                if(product.properties[i].attributeFQN === productAttributes.displayCrossSell) {
                    mode = product.properties[i].values[0].value;
                    break;
                }
            }
            var colorName = null, href = null, objA = null, objLI = null, temp = null, src = null;
            var limit  = (swatchProduct.items.length > 8) ? 8: swatchProduct.items.length;
            for(i = 0; i < limit; i++) {
                if(mode === "asColors") {
                    $('#color-swatch-elem > span').text("Colors: ");
                    for(j = 0; j < swatchProduct.items[i].properties.length; j++) {
                        if(swatchProduct.items[i].properties[j].attributeFQN === productAttributes.colorHex && swatchProduct.items[i].properties[j].values[0].value !== "") {
                            colorName = swatchProduct.items[i].properties[j].values[0].value;
                            break;
                        }
                    }
                    if(colorName !== "") {
                        objA = document.createElement("a");
                        $(objA).attr("href", "/p/" + swatchProduct.items[i].productCode).addClass('swatch-color').css("background-color", colorName);
                        objLI = document.createElement("li");
                        $(objLI).append(objA);
                        $('ul[color-swatch-data]').append(objLI);
                    }
                }else {
                    $('#color-swatch-elem > span').text("Images: ");
                    if(swatchProduct.items[i].content.productImages.length > 0 && swatchProduct.items[i].content.productImages[0].imageUrl !== "") {
                        src = swatchProduct.items[i].content.productImages[0].imageUrl + "?max=22";
                        objA = document.createElement("a");
                        $(objA).attr("href", "/p/" + swatchProduct.items[i].productCode);
                        $("<img/>").attr('src', src).appendTo(objA);
                        objLI = document.createElement("li");
                        $(objLI).addClass("swatch-image").css('border-radius', '0').append(objA);
                        $('ul[color-swatch-data]').append(objLI);
                    }
                }
            }
            if(swatchProduct.items.length > 6) {
                objA = document.createElement("a");
                if(mode == "asColors") {
                    $(objA).attr("href", window.location.origin + "/p/" + product.productCode).attr("class", "more-link").html("See More Colors");
                }else{
                    $(objA).attr("href", window.location.origin + "/p/" + product.productCode).attr("class", "more-link").html("See More Images");
                }
                objLI = document.createElement("li");
                $(objLI).addClass("more-link").append(objA);
                $('ul[color-swatch-data]').append(objLI);
            }
        }

        function getReviewFromPLP(proID) {
            PowerReviews.writeProductListBoxes();
        }

        var ProductView = Backbone.MozuView.extend({
            templateName: 'modules/product/quickview',
            autoUpdate: ['quantity'],
            additionalEvents: {
                "change [data-mz-product-option]": "onOptionChange",
                "blur [data-mz-product-option]": "onOptionChange",
                "click #add-to-cart": "addToCart"
            },
            render: function () {
                var me = this;
                Backbone.MozuView.prototype.render.apply(this);
                this.$('[data-mz-is-datepicker]').each(function (ix, dp) {
                    $(dp).dateinput().css('color', Hypr.getThemeSetting('textColor')).on('change  blur', _.bind(me.onOptionChange, me));
                });
            },
            afterRender: function(){
                var me = this;
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
                    $('.item > img').click(function(){
                        $(".product-image > img").show();
                        $(".product-image > img").attr('src', $(this).attr('src'));
                        $("#video-frame").hide();
                        $(".product-image > iframe").attr('src', "");
                    });
                }
                $("div[video-data] > img").click(function(){
                    $(".product-image > img").hide();
                    $(".product-image > iframe").attr('src', 'http://www.youtube.com/embed/' + $(this).parent().attr("video-data")).show();
                });
                $("#video-frame").hide();
                $('#addThis-conainer').attr('data-url', window.location.origin + $('#addThis-conainer').attr('data-url'));
                var interTimeObj = setInterval(function(){
                    if($(".at4-share-outer.addthis-smartlayers.addthis-smartlayers-desktop").length > 0) {
                        $(".at4-share-outer.addthis-smartlayers.addthis-smartlayers-desktop").remove();
                        clearInterval(interTimeObj);
                    }
                }, 200);
                var proCodes = $('ul[color-swatch-data]').attr('color-swatch-data');
                if (undefined !== proCodes) {
                    var apiURL = '/api/commerce/catalog/storefront/products/?filter=' + proCodes + '&responseObject=items(content, properties)';
                    //var apiURL = '/api/commerce/catalog/storefront/products/?filter=' + proCodes;
                    Api.request('GET', apiURL, {}).then(function(responseObject) {
                        getColorSwatchByResponceObject(me.model, responseObject);
                    });
                }
                $('#mz-quick-view-container .qtyplus').click(function(e){
                    e.preventDefault();
                    var fieldName = $(this).attr('field');
                    var currentVal = parseInt($('#mz-quick-view-container input[name='+fieldName+']').val(), 10);
                    if (!isNaN(currentVal)) {
                        $('#mz-quick-view-container input[name='+fieldName+']').val(currentVal + 1);
                    } else {
                        $('#mz-quick-view-container input[name='+fieldName+']').val(1);
                    }
                    $('.custom-qty input[data-mz-value="quantity"]').trigger('change');
                });
                $("#mz-quick-view-container .qtyminus").click(function(e) {
                    e.preventDefault();
                    var fieldName = $(this).attr('field');
                    var currentVal = parseInt($('#mz-quick-view-container input[name='+fieldName+']').val(), 10);
                    if (!isNaN(currentVal) && currentVal > 1) {
                        $('#mz-quick-view-container input[name='+fieldName+']').val(currentVal - 1);
                    } else {
                        $('#mz-quick-view-container input[name='+fieldName+']').val(1);
                    }
                    $('.custom-qty input[data-mz-value="quantity"]').trigger('change');
                });
                $("#mz-quick-view-container").children(".qtyminus,.qtyplus").css({"background-color":"transparent","fonts-size":"1rem"});
                $(".addToWishlist-btn-extra").click(function(){
                    me.addToWishlist();
                });

                getReviewFromPLP(this.productCode);
            },
            onOptionChange: function (e) {
                return this.configure($(e.currentTarget));
            },
            configure: function ($optionEl) {
                var newValue = $optionEl.val(),
                    oldValue,
                    id = $optionEl.data('mz-product-option'),
                    optionEl = $optionEl[0],
                    isPicked = (optionEl.type !== "checkbox" && optionEl.type !== "radio") || optionEl.checked,
                    option = this.model.get('options').get(id);
                if (option) {
                    if (option.get('attributeDetail').inputType === "YesNo") {
                        option.set("value", isPicked);
                    } else if (isPicked) {
                        oldValue = option.get('value');
                        if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                            option.set('value', newValue);
                        }
                    }
                }
            },
            addToCart: function () {
                this.model.addToCart();
            },
            addToWishlist: function () {
                if(require.mozuData('user').isAuthenticated) {
                    Wishlist.initoWishlist(this.model);
                }else {
                    triggerLogin();
                }
            },
            checkLocalStores: function (e) {
                var me = this;
                e.preventDefault();
                this.model.whenReady(function () {
                    var $localStoresForm = $(e.currentTarget).parents('[data-mz-localstoresform]'),
                        $input = $localStoresForm.find('[data-mz-localstoresform-input]');
                    if ($input.length > 0) {
                        $input.val(JSON.stringify(me.model.toJSON()));
                        $localStoresForm[0].submit();
                    }
                });

            },
            update: function(m){
                this.model = m;
                this.render();
            },
            initialize: function () {
                // handle preset selects, etc
                var me = this;
                this.on('render', this.afterRender);
                this.$('[data-mz-product-option]').each(function () {
                    var $this = $(this), isChecked, wasChecked;
                    if ($this.val()) {
                        switch ($this.attr('type')) {
                            case "checkbox":
                            case "radio":
                                isChecked = $this.prop('checked');
                                wasChecked = !!$this.attr('checked');
                                if ((isChecked && !wasChecked) || (wasChecked && !isChecked)) {
                                    me.configure($this);
                                }
                                break;
                            default:
                                me.configure($this);
                        }
                    }
                });
            }
        });
        $(document).ready(function(){
            /* OPEN */ 
            $(document).on('click', '.quick-view > a[data-pro-id]', function(e){
             //   var proData = require.mozuData('facetedproducts');
                var categoryid=$('.categoryid').val();  
                var productCode = $(e.target).attr('data-pro-id');
                var SearchUrl= "/api/commerce/catalog/storefront/productsearch/search/?filter=categoryId req "+categoryid+"&pageSize=200";  
                Api.request('GET',SearchUrl).then(function(res){
                    console.log(res);
            //    var productModels = new ProductModels.ProductCollection(res);
               var facetingModel = new facetingProducts.FacetedProductCollection(res);
                
                console.log(productCode);
                var productList = facetingModel.get("items").where({'productCode':productCode});
                var product = productList[0];  
                console.log(product); 

                product.on('addedtocart', function (cartitem) {
                    if (cartitem && cartitem.prop('id')) {
                        $('#mz-quick-view-container').fadeOut(100, function() {
                            $('#mz-quick-view-container').remove();
                            addedToCart.proFunction(product);
                            CartMonitor.addToCount(product.get('quantity'));
                            SoftCart.update();
                        });
                    } else {
                        product.trigger("error", { message: Hypr.getLabel('unexpectedError') });
                    }
                });

                product.on('addedtowishlist', function (cartitem) {
                    $('#add-to-wishlist').prop('disabled', 'disabled').text(Hypr.getLabel('addedToWishlist'));
                });
                $('body').append('<div id="mz-quick-view-container"></div>');
                window.productView = new ProductView({
                    el: $('#mz-quick-view-container'),
                    messagesEl: $('[data-mz-message-bar]'),
                    model:product,
                    productCode: productCode
                });
                window.productView.render();

                $('#mz-quick-view-container').fadeIn(350);
                //getReviewFromPLP(productCode);
                e.preventDefault();
                });
            });
            /* CLOSE */
            $(document).on('click', '#mz-quick-view-container-close, #mz-quick-view-container, .popup.quickview-popup', function(e){
                if(e.target !== e.currentTarget) return;
                $('#mz-quick-view-container').fadeOut(350);
                $('#mz-quick-view-container').remove();
            });
        });
    });