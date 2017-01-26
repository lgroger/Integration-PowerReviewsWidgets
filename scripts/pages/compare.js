/* "modules/powerreviews", PowerReviews, */
define(["modules/jquery-mozu", "modules/api", "underscore", "hyprlive", "modules/backbone-mozu", "modules/cart-monitor", "modules/models-product", "modules/views-productimages", "modules/soft-cart", 'modules/added-to-cart', "vendor/wishlist", "hyprlivecontext","pages/dndengine", "modules/powerreviews"],function ($, Api,_, Hypr, Backbone, CartMonitor, ProductModels, ProductImageViews, SoftCart,  addedToCart, Wishlist, HyprLiveContext, DNDEngine, PowerReviews) {
    var productViews = []; 
    var loopcounter=0;
    window.compareProductCount = 0;
    var compareProductck = getCookie('compareProduct');
    var cmp_list=compareProductck.trim().split(",");
    var cmp_prod=_.filter(cmp_list, function(prod){ return prod.length> 0; });
    window.cmp_count=cmp_prod.length;
    var productAttributes = Hypr.getThemeSetting('productAttributes');
    window.personalizeBundleProducts=[];
    var getPropteryValueByAttributeFQN = function(product, attributeFQN){
            var result = null;
            var properties = product.get('properties');
            for(var i=0;i<properties.length;i++){
                if(properties[i].attributeFQN===attributeFQN){
                    for(var j=0;j<properties[i].values.length; j++){
                        result= properties[i].values[j].value;
                    }
                    break;
                }
            }
            return result;
    };
    function addSlider() {
        $('.mz-container-items').owlCarousel({
            loop:false, nav:true,items : 1,dot:false
        });
        window.owlCarouselData =  $('.mz-container-items').data('owlCarousel');
    }
    function getStandardProductDetails(productCodes){
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
                    var dndCode = getPropteryValueByAttributeFQN(product, productAttributes.dndCode);
                    if(dndCode){
                        window.personalizeBundleProducts.push(product);
                        $('.addToCart').html('Personalize').addClass('personalize').removeAttr('id');
                    }
                }
            }
        });
    }
    function getBundleProductDetails(arr){

        Api.get('product',{"productCode":arr[loopcounter]}).then(function(res){
            console.log(res);
            var product = new ProductModels.Product(res.data);
            var productImage = product.get('content.productImages');
            if(productImage.length>0){
                $('[productcode="'+arr[loopcounter]+'"]').find('.block-img-sec').html('<img class="bundle-img" src="'+productImage[0].imageUrl+'"/>');
            }

            var dndCode = getPropteryValueByAttributeFQN(product, productAttributes.dndCode);
            if(dndCode){
                window.personalizeBundleProducts.push(product);
                $('.addToCart').html('Personalize').addClass('personalize').removeAttr('id');
            }
            loopcounter++;
            if(loopcounter < arr.length){
                getBundleProductDetails(arr); 
            }else{ 
                $('.personalize').removeAttr('disabled').removeClass('is-disabled');
            }
        });
    }

    function triggerLogin(){
        $('.trigger-login').trigger('click');
        $('#cboxOverlay').show();
        $('#mz-quick-view-container').fadeOut(350);
        $('#mz-quick-view-container').empty();
    }

    function findMaxObj(myArray) {
            //var lowest = Number.POSITIVE_INFINITY;
            var highest = Number.NEGATIVE_INFINITY;
            var tmp;
            var obj = null;
            if (myArray.length > 0) {
                if (myArray.length == 1) {
                    obj = myArray[0];
                } else {
                    for (var i = myArray.length - 1; i >= 0; i--) {
                        if(myArray[i]){
                            tmp = myArray[i].deltaPrice;
                            //if (tmp < lowest) lowest = tmp;
                            if (tmp > highest) {
                                highest = tmp;
                                obj = myArray[i];
                            }
                        }
                    }
                }

            }
            return obj;
    }
    function findMinObj(myArray) {
            var lowest = Number.POSITIVE_INFINITY;
            //var highest = Number.NEGATIVE_INFINITY;
            var tmp;
            var obj = null;
            if (myArray.length > 0) {
                if (myArray.length == 1) {
                    obj = myArray[0];
                } else {
                    for (var i = myArray.length - 1; i >= 0; i--) {
                        if(myArray[i]){
                            tmp = myArray[i].deltaPrice;
                            //if (tmp < lowest) lowest = tmp;
                            if (tmp < lowest) {
                                lowest = tmp;
                                obj = myArray[i];
                            }
                        }
                    }
                }

            }
            return obj;
    }
    var ProductView = Backbone.MozuView.extend({
        templateName: 'modules/product/compare',
        autoUpdate: ['quantity'],
        additionalEvents: {
            "change [data-mz-product-option]": "onOptionChange",
            "blur [data-mz-product-option]": "onOptionChange",
            "click .floating-add-to-cart": "addToCart",
            "click button#add-to-cart": "addToCart",
            "click .personalize":"personalizeProduct",
            "click .mz-cmp-product-remove-btn": "removeProduct",
            "change [data-mz-value='quantity']": "onQuantityChange",
            "keyup input[data-mz-value='quantity']": "onQuantityChange",
            "change .mz-productlable-options": "showOptionsList"
        },
        onQuantityChange: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
              newQuantity = parseInt($qField.val(), 10);
            if (!isNaN(newQuantity)) {
                this.model.updateQuantity(newQuantity);
            }
        },500),
        showOptionsList: function(e){
            var cobj = $(e.currentTarget),
            id=cobj.val();
            var self=this;
            $(self.el).find('select.mz-productoptions-option').hide();
            $('[data-mz-product-option="'+id+'"').show();

        },
        personalizeProduct:function(){
             /** DnD Code  Start **/
            var dndUrl = Hypr.getThemeSetting('dndEngineUrl');
            var dndEngineObj = new DNDEngine.DNDEngine(this.model,dndUrl);
            dndEngineObj.initialize();
            dndEngineObj.send();
            /** DnD Code  End **/
        },
        render: function () {
            var me = this;
            var optionlist = $('[option-alternate-name]');
            $.each(optionlist, function(ind, ele){
                var id = $(ele).attr('option-alternate-name');
                var option = me.model.get('options').get(id);
                var values = option.get('values');
                for(var val in values){
                    var newValue = $.trim($(ele).find('[productCode="'+values[val].value+'"]').text());
                    if(newValue!==""){
                        values[val].stringValue = newValue;
                    }
                }
            });
            Backbone.MozuView.prototype.render.apply(this);
            this.$('[data-mz-is-datepicker]').each(function (ix, dp) {
                $(dp).dateinput().css('color', Hypr.getThemeSetting('textColor')).on('change  blur', _.bind(me.onOptionChange, me));
            });
        },
        onOptionChange: function (e) {
            return this.configure($(e.currentTarget));
        },
        configure: function ($optionEl) {
            var me = this;
            var newValue = $optionEl.val(),
                oldValue,
                id = $optionEl.data('mz-product-option'),
                optionEl = $optionEl[0],
                isPicked = (optionEl.type !== "checkbox" && optionEl.type !== "radio") || optionEl.checked,
                option = this.model.get('options').get(id);
                var objj=me.model.getConfiguredOptions();
                if(me.model.get('productType')==='Banner' ||
                    me.model.get('productType')==='BannerRectangle' ||
                    me.model.get('productType')==='BannerVertical' ||
                    me.model.get('productType')==='BackgroundVBG'){
                    _.each(objj, function(objoptions) {
                         me.model.get('options').get(objoptions.attributeFQN).unset("value"); 
                      });
                    if(id==='Tenant~outdoor-banner'){
                        me.model.set('enableSlitoption', true);
                    }else{
                        me.model.set('enableSlitoption', false);
                    }
                }
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
            if(!require.mozuData('user').isAnonymous) {
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
        addToCartAfterPersonalize:function(data){
            var productAttributes = Hypr.getThemeSetting('productAttributes');
            var self= this;
            var option = this.model.get('options').get(productAttributes.dndToken);
            option.set('value',data.projectToken);
            setTimeout(function(){
                //self.model.set({'quantity':data.quantity});
                self.model.addToCart();    
            },200);
            
        },
        afterRender: function() {
            var me = this;
            var max_h = 0;
            var empty_count=0;
            /** Code to get mfgPartNumber for extras product **/
            if(this.$('[data-mz-product-option]').attr('usageType')==='Extra' && this.$('[data-mz-product-option]').length === 1){
                if(this.$('[data-mz-product-option]').find('option').length==2){
                    this.$('[data-mz-product-option]').parents('.mz-productdetail-options').hide();
                }
            }
            if(this.model.get('productUsage')==='Bundle'){
                $('.personalize').attr('disabled',true).addClass('is-disabled');
                if($('.bundleItemDndCode').length > 0 ){
                    $('.addToCart').html('Personalize').addClass('personalize').removeAttr('id');
                }
            }
            
            var selectOptonVal = $('[data-mz-product-option="tenant~cdyper-choice"]').val();
            if(selectOptonVal!==undefined && selectOptonVal.toLowerCase()=="cdyperw-option"){
                $('[data-mz-product-option="tenant~pcdypcb"]').closest('.mz-productoptions-optioncontainer').hide();
            }

             if(me.model.get('productType')==='Banner' ||
                    me.model.get('productType')==='BannerRectangle' ||
                    me.model.get('productType')==='BannerVertical' ||
                    me.model.get('productType')==='BackgroundVBG'){
                    if($('.mz-productoptions-option:visible').val()!==undefined && 
                        $('.mz-productoptions-option:visible').val()!==""){
                        $('.personalize').prop('disabled', false);
                    }else{
                        $('.personalize').prop('disabled', true);
                    }
             }

            $(".mz-cmp-product-title").each(function() {
                max_h = Math.max(max_h, parseInt($(this).height(), 10));
            });
            $(".mz-cmp-product-title").css('min-height', max_h + 'px');
            max_h = 0;
            $(".mz-productdetail-price.mz-l-stack-section").each(function() {
                max_h = Math.max(max_h, parseInt($(this).height(), 10));
            });
            $(".mz-productdetail-price.mz-l-stack-section").css('min-height', max_h + 'px');
            max_h = 0;
            $(".mz-cmp-p-options-n-extras").each(function() {
                max_h = Math.max(max_h, parseInt($(this).height(), 10));
            });
            $(".mz-cmp-p-options-n-extras").css('min-height', max_h + 'px');
            max_h = 0;
              empty_count=0;
            $(".mz-cmp-orientation").each(function() {
                max_h = Math.max(max_h, parseInt($(this).height(), 10));
                  if($(this).find('.value').text().trim()==="-"){
                    empty_count+=1;
                  }
            });
             if(empty_count===window.cmp_count){
                $(".mz-cmp-orientation").remove();
            }
            $(".mz-cmp-orientation").css('min-height', max_h + 'px');
            max_h = 0;
            $(".mz-cmp-availability").each(function() {
                max_h = Math.max(max_h, parseInt($(this).height(), 10));
            });
            $(".mz-cmp-availability").css('min-height', max_h + 'px');
            max_h = 0;
            empty_count=0;
            $(".mz-cmp-sizes").each(function() {
                max_h = Math.max(max_h, parseInt($(this).height(), 10));
                if($(this).text().trim()==="---"){
                    empty_count+=1;
                }
            });
            if(empty_count===window.cmp_count){
                $(".mz-cmp-sizes").remove();
            }
            max_h = 0;
            empty_count=0;
            $(".mz-cmp-swatch").each(function() {
                max_h = Math.max(max_h, parseInt($(this).height(), 10));
                if($(this).text().trim()==="--"){
                    empty_count+=1;
                }
            });
            $(".mz-cmp-swatch").css('min-height', max_h + 'px');
            if(empty_count===window.cmp_count){
                $(".mz-cmp-swatch").remove();
            }
            max_h = 0;
            empty_count=0;
            $(".mz-cmp-finish").each(function() {
                max_h = Math.max(max_h, parseInt($(this).height(), 10));
                if($(this).text().trim()==="--" ||$(this).text().trim()==="" ){
                    empty_count+=1;
                }
            });
               if(empty_count===window.cmp_count){
               $(".mz-cmp-finish").remove();
            }
            $(".mz-cmp-finish").css('min-height', max_h + 'px');
            max_h = 0;
            $(".product-description").each(function() {
                max_h = Math.max(max_h, parseInt($(this).height(), 10));
            });
            $(".product-description").css('min-height', max_h + 'px');
            max_h = 0;
            $(".mz-cmp-p-options-n-extras").each(function() {
                max_h = Math.max(max_h, parseInt($(this).height(), 10));
            });
            $(".mz-cmp-p-options-n-extras").css('min-height', max_h + 'px');
            max_h = 0;
            $(".product-options-extras").each(function() {
                max_h = Math.max(max_h, parseInt($(this).height(), 10));
            });
            $(".product-options-extras").css('min-height', max_h + 'px');
             max_h = 0;
            empty_count=0;
            $(".mz-presonalize").each(function() {
                max_h = Math.max(max_h, parseInt($(this).height(), 10));
                if($(this).text().trim()==="" || $(this).text().trim()==="--"){
                    empty_count+=1;
                }
            });
            $(".mz-presonalize").css('min-height', max_h + 'px');
            
            var proCodes = $(me.el).find('ul[color-swatch-data]').attr('color-swatch-data');
            if (undefined !== proCodes) {
                var apiURL = '/api/commerce/catalog/storefront/products/?filter=' + proCodes + '&responseObject=items(content, properties)';
                Api.request('GET', apiURL, {}).then(function(responseObject) {
                    getColorSwatchByResponceObject(me.model, responseObject);
                });
            }
            PowerReviews.writeProductListBoxes();
            window.compareProductCount++;
        },
        removeProduct: function () {
            var compareProduct = getCookie('compareProduct');
            compareProduct = compareProduct.replace(this.model.apiModel.data.productCode, '');
            compareProduct = compareProduct.replace(',,', ',');
            setCookie('compareProduct', compareProduct);
            window.location.href = "/compare";
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

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; path=/;" + expires;
    }

    function removeEmptyContainer(count) {
        $('#mz-cmp-product-' + count).remove();
    }

    function initCompareProduct(productCode, count, last){
        Api.get('product', productCode).then(function(model){
            var productModel = new ProductModels.Product(model.data);
            productModel.on('addedtocart', function (cartitem) {
                if (cartitem && cartitem.prop('id')) {
                    var cartitemModel = new ProductModels.Product(cartitem.data);
                    productModel.isLoading(true);
                    $('.dnd-popup').remove();
                    $('body').css({overflow: 'auto'});
                    $('#cboxOverlay').hide();
                    CartMonitor.addToCount(productModel.get('quantity'));
                    SoftCart.update();
                    productModel.isLoading(false);
                    addedToCart.proFunction(cartitemModel);
                } else {
                    productModel.trigger("error", { message: Hypr.getLabel('unexpectedError') });
                }
            });

            productModel.on('addedtowishlist', function (cartitem) {
                $('#add-to-wishlist').prop('disabled', 'disabled').text(Hypr.getLabel('addedToWishlist'));
            });
            var tempView = new ProductView({
                    el: $('#mz-cmp-product-' + count),
                    model: productModel
                });
            productViews.push(tempView);
            tempView.render();
            if(last) {
                removeEmptyContainer(count + 1);
            }
        });
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

    $(document).ready(function(){
        var compareProduct = getCookie('compareProduct');
        $(window).resize(function(){
            if($(window).width() > 1000) {
                window.owlCarouselData.destroy();
                $('.mz-container-items').removeClass('owl-carousel');
                if($('.owl-stage-outer').length>0){
                   $('.mz-cmp-col').unwrap(); 
                }

            }else {
                addSlider();
            }
        });
        var sliderInitTimmer = setInterval(function(){
            if(window.productCodeArray.length === window.compareProductCount) {
                if($(window).width() <= 1000){
                    addSlider();
                    clearInterval(sliderInitTimmer);
                }
            }
        }, 400);
        if(compareProduct !== "") {
            compareProduct = compareProduct.replace(/(^[,\s]+)|([,\s]+$)/g, '');
            var certona_items = "";//for certona
            var productCodeArray = compareProduct.split(',');
            window.productCodeArray = productCodeArray;
            $('#mz-cmp-item-count').html(productCodeArray.length);
            if(productCodeArray.length > 0) {
                for(var i = 0; i < productCodeArray.length; i++) {
                    initCompareProduct(productCodeArray[i], i, (productCodeArray.length == (i + 1)) ? true:false);
                    certona_items +=productCodeArray[i]+';'; //for certona
                }
                certona.itemid = certona_items; //for certona
            }else {
                $("<h1 class='no-result'>No Product Selected To Compare</h1>").appendTo(".mz-container");
            }
        }else {
            $("<h1 class='no-result'>No Product Selected To Compare</h1>").appendTo(".mz-container");
        }

        $('.back-page-btn').click(function() {
            window.history.back();
        });
    });
});