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
        "vendor/wishlist",
        "pages/dndengine"
    ], function ($, _, Backbone, Hypr, FacetingModels, Api, ProductModels, CartMonitor, ProductImageViews, facetingProducts, HyprLiveContext, addedToCart, PowerReviews, SoftCart, Wishlist, DNDEngine) {
        Hypr.engine.setFilter("contains",function(obj,k){ 
            return obj.indexOf(k) > -1;
        });
         /** Global variables for Banner Types **/
        var bannerProductTypes = Hypr.getThemeSetting('bannerProductTypes');
        var bannerProductsArr = bannerProductTypes.split(',');

        var loopcounter=0, loopcount=0;
        var productAttributes = Hypr.getThemeSetting('productAttributes');
        window.personalizeBundleProducts=[];
        window.extrasProducts=[];

        Api.on("error", function(e) {
            $(".mz-messagebar").empty().html(e.message);
        });

        var getPropteryValueByAttributeFQN = function(product, attributeFQN){
            var result = null;
            var properties = product.get('properties')?product.get('properties'):product.properties;
            for(var i=0;i<properties.length;i++){
                if(properties[i].attributeFQN.toLowerCase()===attributeFQN.toLowerCase()){
                    for(var j=0;j<properties[i].values.length; j++){
                        result= properties[i].values[j].value;
                    }
                    break;
                }
            }
            return result;
     };

         var getPropteryByAttributeFQN = function(product, attributeFQN){
                var result = null;
                var properties = product.properties;
                for(var i=0;i<properties.length;i++){
                    if(properties[i].attributeFQN.toLowerCase()===attributeFQN.toLowerCase()){
                        for(var j=0;j<properties[i].values.length; j++){
                            result= properties[i].values[j].value;
                        }
                        break;
                    }
                }
                return result;
         };
        var getExtrasProductDetails= function(productCode, callback){
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
            api.request('get','/api/commerce/catalog/storefront/products/'+productCode+'?my=1').then(function(res){
                var product=new ProductModels.Product(res);
                callback(product);
            });
        };

        function triggerLogin(){
            $('.trigger-login').trigger('click');
            $('#cboxOverlay').show();
            $('#mz-quick-view-container').fadeOut(350);
            $('#mz-quick-view-container').empty();
        }

        function getColorSwatchByResponceObject(product, swatchProduct, totalColorSwatchCount) {
            product = product.toJSON();
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
                    $('#color-swatch-elem > span').text("Colors: ");
                    if(swatchProduct.items[i].content.productImages.length > 0 && swatchProduct.items[i].content.productImages[0].imageUrl !== "") {
                        src = swatchProduct.items[i].content.productImages[0].imageUrl + "?max=50";
                        objA = document.createElement("a");
                        $(objA).attr("href", "/p/" + swatchProduct.items[i].productCode).attr("title",swatchProduct.items[i].content.productName);
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
                    $(objA).attr("href", window.location.origin + "/p/" + product.productCode).attr("class", "more-link").html("See All Colors");
                }else{
                    $(objA).attr("href", window.location.origin + "/p/" + product.productCode).attr("class", "more-link").html("See All Colors");
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
                //"blur [data-mz-product-option]": "onOptionChange",
                "click #add-to-cart": "addToCart",
                "change [data-mz-value='quantity']": "onQuantityChange",
                //"keyup input[data-mz-value='quantity']": "onQuantityChange",
                "change .mz-productlable-options": "showOptionsList",
                "change .needslits":"configureSlitOption",
                "click .personalize":"personalizeProduct",
                "click .qtyplus":"increaseQty",
                "click .qtyminus":"decreaseQty"
            },
            setQtyModel:function (qty) {
                 var newQuantity = parseInt(qty, 10);
                  if(newQuantity < this.model._minQty){
                    $('[data-mz-validationmessage-for="quantity"]').html("Quantity should be more than minimum quantity");
                    return false;
                }else{
                     this.model.set('quantity',newQuantity);
                }
            },
            addToCart: function () {
              if(this.model.get('productUsage')=='Bundle'){
                  return true;
              }
              this.model.set('newQuantity',this.$el.find('.mz-productdetail-qty').val());
              this.model.addToCart();
              
            },
            personalizeProduct:function(e){
                /** DnD Code  Start **/
                 var $qField = $(e.currentTarget).parent().parent().find('[data-mz-value="quantity"]'),
               newQuantity = parseInt($qField.val(), 10);
                if(newQuantity <= 0){
                    $('[data-mz-validationmessage-for="quantity"]').html("Please enter a product quantity above 0");
                    return false;
                }
                if(newQuantity < this.model._minQty){
                    $('[data-mz-validationmessage-for="quantity"]').html("Quantity should be more than minimum quantity");
                    return false;
                }

                var me=this;
                var objj=me.model.getConfiguredOptions();
                var extrasProductInfo = me.getSelectedExtrasInfo(objj);
                if(extrasProductInfo){me.model.set('extrasProductInfo',extrasProductInfo);}
                var dndUrl = Hypr.getThemeSetting('dndEngineUrl');
                var dndEngineObj = new DNDEngine.DNDEngine(this.model,dndUrl);
                dndEngineObj.initialize();
                dndEngineObj.send();
                /** DnD Code  End **/
            },
            showOptionsList: function(e){
                $('.mz-productdetail-addtocart').prop('disabled',true);
                var cobj = $(e.currentTarget),
                id=cobj.val(),me=this;
                var objj=me.model.getConfiguredOptions();
                me.model.set('OptionSelectedID', id);
                if(objj.length>0){
                    _.each(objj, function(objoptions) {
                        me.model.get('options').get(objoptions.attributeFQN).unset("value");
                    });
                }
                $('select.mz-productoptions-option').hide();
                $('[data-mz-product-option="'+id+'"]').show();
            }, 
            render: function () {
                var me = this,requiredOptions;
                var objj=me.model.getConfiguredOptions();
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
                /** Banner Product Slit enable/disable **/
                if(bannerProductsArr.indexOf(me.model.get('productType')) > -1){
                    var option = me.model.get('options').get(productAttributes.outdoorbanner);
                    var slitoption = me.model.get('options').get(productAttributes.outdoorbannerslits);
                    if((option && option.get('value')) || (slitoption && slitoption.get('value'))){
                        me.model.set('enableSlitoption', true);
                    }else{
                        me.model.set('enableSlitoption', false);
                    }
                     /** Enable Price Range Flag if Price Range Is Not Null **/
                    var jsonModel = me.model.toJSON();
                    if(objj.length===0 && !!jsonModel.priceRange){
                          me.model.apiModel.data = jsonModel;
                          me.model.apiModel.data.hasPriceRange=true;
                          me.model.set('hasPriceRange', true);
                          me.model._hasPriceRange=true;
                    }
               }
                me.model.set('isConfigure', false);
                if(me.model.get('productUsage')==="Configurable"){
                    if(objj.length > 0){
                            //Check all required options value are filled(model value prop shoud not be empty and it should be required).
                            var filled_required_fileds=0;
                            me.model.get('options').toJSON().forEach(function(ele,i){
                                if(ele.hasOwnProperty('value') && ele.isRequired){
                                    filled_required_fileds+=1;
                                }
                            });
                        requiredOptions = _.where(me.model.get('options').toJSON(),{"isRequired":true});
                        if(filled_required_fileds===requiredOptions.length){
                            me.model.set('isConfigure', true);
                        }
                    }
                }

                this.hideExtras();
                this.renderConfigure();
                this.$('[data-mz-is-datepicker]').each(function (ix, dp) {
                    $(dp).dateinput().css('color', Hypr.getThemeSetting('textColor')).on('change  blur', _.bind(me.onOptionChange, me));
                });
            },
            afterRender: function(){
                var me = this;
                var selectgreetingCardVal = $('[data-mz-product-option="'+productAttributes.giantGreetingCardSize+'"]').val();
                if(selectgreetingCardVal!==""){
                    $('[data-mz-product-option="'+productAttributes.optionalEnvelope+'"]').find('option').each(function(){
                        var splitvalue = $(this).attr('value').split('_');
                        if(splitvalue.length>1){
                            if(splitvalue[0]!==selectgreetingCardVal && splitvalue[0].toLowerCase()!=='no'){
                                $(this).remove();
                            }
                        }
                    });
                }
                var warnmessage = $('.mz-productdetail-notpurchasable').text().trim();
                if(warnmessage && warnmessage!==""){
                    $('.mz-productdetail-addtocart').attr('data-tooltip',warnmessage);
                }
                
                /** Logics for banner product types **/
                if(bannerProductsArr.indexOf(me.model.get('productType')) > -1){
                    $('.addToCart').attr('data-tooltip',"Please select an option");
                    if(warnmessage && warnmessage!==""){
                        $('.mz-productdetail-addtocart').attr('data-tooltip',warnmessage);
                    }
                    if(me.model.get('OptionSelectedID') && me.model.get('OptionSelectedID')!==""){
                        $("select[mz-banner-type]").val(me.model.get('OptionSelectedID'));
                        $('select.mz-productoptions-option').hide();
                        $('[data-mz-product-option="'+me.model.get('OptionSelectedID')+'"]').show();
                    }
                    var objj=me.model.getConfiguredOptions();
                    var selectedValue=null;
                    _.each(objj, function(objoptions){
                         selectedValue = me.model.get('options').get(objoptions.attributeFQN).get("value");
                         if(selectedValue &&(objoptions.attributeFQN.toLowerCase()==='tenant~outdoor-banner'|| objoptions.attributeFQN.toLowerCase()==='tenant~outdoor-banner-with-slits')){
                            $('[mz-banner-type]').val(productAttributes.outdoorbanner);
                            $('[data-mz-product-option="'+productAttributes.outdoorbanner+'"]').show();
                            if(selectedValue.indexOf('S')!==-1){
                                var selVal = selectedValue.split('S');
                                $('[data-mz-product-option="'+productAttributes.outdoorbanner+'"]').val(selVal[0]);
                                $('.needslits').prop('checked',true);
                            }else{
                                $('[data-mz-product-option="'+productAttributes.outdoorbanner+'"]').val(selectedValue);
                            }
                        }
                    });

                    if($('.mz-productoptions-option:visible').val()!==undefined &&
                        $('.mz-productoptions-option:visible').val()!==""){
                        $('.mz-quick-view-wrapper .personalize').prop('disabled', false);
                        $('.custom-qty input').prop('disabled', false);
                        $('.personalize').attr('title', "");
                    }else{
                        $('.mz-quick-view-wrapper .personalize').prop('disabled', true);
                        $('.custom-qty input').prop('disabled', true);
                        $('.personalize').attr("title", "Please select a material and size above.");
                    }
                }

				// hides radio button if there is only one extra for specific attributeFQNs (may want to make this theme setting) - NOTE: this differs slightly than code on product.js b/c on pdp it's showing as radio but dropdown on quickview
                if(this.$('[data-mz-product-option]').attr('usageType')==='Extra' && this.$('[data-mz-product-option]').length === 1 && (this.$('[data-mz-product-option]').attr('data-mz-product-option') === "tenant~misc.-favor-with-design" || this.$('[data-mz-product-option]').attr('data-mz-product-option') === "tenant~table-top-it-runner-size")){
                    if(this.$('[data-mz-product-option]').find('option').length==2){
                        this.$('[data-mz-product-option]').parents('.mz-productdetail-options').hide();
                    }
                }
                /*if(this.model.get('productUsage')==='Bundle'){
                    $('.addToCart').attr('disabled',true).addClass('is-disabled');
                    if($('.bundleItemDndCode').length > 0 ){
                        $('.addToCart').html('Personalize').addClass('personalize').removeAttr('id');
                    }
                }*/

                if(me.model.get('productType')==='CandyBar'){   
                    var selectOptonVal = $('[data-mz-product-option="tenant~cdyper-choice"]').val();
                    if(selectOptonVal!==undefined && selectOptonVal.toLowerCase()=="cdyperw-option"){
                        $('[data-mz-product-option="tenant~pcdypcb"]').closest('.mz-productoptions-optioncontainer').hide();
                    }
                /** Product Typ candbary check options are selected or not **/
                
                    if(selectOptonVal!==undefined && selectOptonVal.toLowerCase()!=="cdyperw-option"){ 
                        if(me.model.get('purchasableState').isPurchasable && (($("[data-mz-product-option='tenant~pcdypcb']").length > 0 && typeof $("[data-mz-product-option='tenant~pcdypcb']").val()!== "undefined" && $("[data-mz-product-option='tenant~pcdypcb']").val()!=="") || $("[data-mz-product-option='tenant~pcdypcb']").length === 0)){
                            $('.mz-quick-view-wrapper .personalize').prop('disabled', false);
                            $('.custom-qty input').prop('disabled', false);
                            $('.personalize').attr('title', "");
                        }else{ 
                            $('.mz-quick-view-wrapper .personalize').prop('disabled', true);
                            $('.custom-qty input').prop('disabled', true);
                            $('.personalize').attr('title', "Please select an option above.");
                        }
                    }
                }

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
            
                var proCodes = $('ul[color-swatch-data]').attr('color-swatch-data');
                if(proCodes){
                    var procodeArray = proCodes.split(',');
                    var totalColorSwatchCount =  procodeArray.length;
                    var productCodefilter = procodeArray.slice(0,8).join(' or ProductCode eq ');
                    if (undefined !== proCodes && procodeArray.length>0) {
                        var apiURL = '/api/commerce/catalog/storefront/products/?filter=ProductCode eq ' + productCodefilter + '&responseObject=items(content, properties)';
                        //var apiURL = '/api/commerce/catalog/storefront/products/?filter=' + proCodes;
                        Api.request('GET', apiURL, {}).then(function(responseObject) {
                            getColorSwatchByResponceObject(me.model, responseObject,totalColorSwatchCount);
                        });
                    }
                }

                $("#mz-quick-view-container").children(".qtyminus,.qtyplus").css({"background-color":"transparent","fonts-size":"1rem"});
                $(".addToWishlist-btn-extra").click(function(){
                    me.addToWishlist();
                });
                  if(window.addthis!==undefined){
                    //Update addthis to currect product model and rerender.
                    try{
                        addthis.update('share', 'url',window.location.origin+me.model.toJSON().url );
                        addthis.update('share', 'title',me.model.toJSON().content.productName); 
                       addthis.toolbox(".addthis_inline_share_toolbox");
                    }catch(err){
                        console.log("Error on addthis "+err);
                    }
                }
                getReviewFromPLP(this.productCode);
            },
            getExtraProduct: function(productCode){
                var product = null;
                if(window.extrasProducts.length>0){
                        for(var i=0;i < window.extrasProducts.length;i++){
                            if(window.extrasProducts[i].productCode===productCode){
                                product = window.extrasProducts[i];
                                break;
                            }
                        }
                }
                return product;
            },
            getSelectedExtrasInfo:function(selectedOptions){
                var extrasInfo = [];
                var self =this;
                //if(selectedOptions.length>0){
                   // for(var ind=0; ind<selectedOptions.length; ind++){
                        var options = self.model.get('options');
                        if(options.length>0){
                           for(var inc=0; inc<options.models.length; inc++){

                                var option = options.models[inc];
                                if(option.get('attributeDetail').usageType==='Extra' &&
                                   option.get('attributeDetail').dataType==='ProductCode' &&
                                   option.get('isHideExtra')==="hide"){
                                    var extra ={};
                                    extra.name = option.get('attributeDetail').name;
                                    extra.isRequired = option.get('isRequired');
                                    extra.attributeCode = option.get('attributeFQN').split('~')[1];
                                    extra.values=[];
                                    var values = option.get('values');
                                    for(var l=0;l<values.length;l++){
                                        var extraValues={};
                                        var eprod = self.getExtraProduct(values[l].value);
                                        extraValues.price = values[l].deltaPrice;
                                        extraValues.name = values[l].stringValue;
                                        extraValues.value = values[l].value;


                                        if(eprod)extraValues.mfgPartNumber = eprod.mfgPartNumber;
                                        var inventoryInfo = values[l].bundledProduct.inventoryInfo;
                                        if(inventoryInfo && inventoryInfo.manageStock){
                                            extraValues.maxQty = inventoryInfo.onlineStockAvailable;
                                        }
                                        extraValues.quantity = values[l].bundledProduct.quantity;
                                        extra.values.push(extraValues);
                                    }
                                    extrasInfo.push(extra);
                                }
                            }
                        }


                    //}
                //}
                return extrasInfo;
            },
            getExtraTitle: function(productCode){
                var extraTitle=null;
                if(window.extrasProducts.length>0){
                    for(var i=0;i<window.extrasProducts.length;i++){
                        if(window.extrasProducts[i].productCode===productCode){
                            extraTitle = window.extrasProducts[i].optionTitle;
                            break;
                        }
                    }
                }
                return extraTitle;
            },
            setOptionTitle: function(){
                var self= this;
                var options = self.model.get('options');
                if( options && options.length>0){
                    for(var i =0; i < options.models.length; i++){
                        var option = options.models[i];
                        if(option.get('attributeDetail').usageType==='Extra' &&
                           option.get('attributeDetail').dataType==='ProductCode'){
                            for(var j=0;j<option.get('values').length;j++){
                               if(self.getExtraTitle(option.get('values')[j].value)){
                                    option.get('values')[j].stringValue = self.getExtraTitle(option.get('values')[j].value);
                                }
                            }
                        }
                    }
                }
            },
            hideExtras: function(){
                var me = this;
                var options = me.model.get('options');
                var extrasToHide = getPropteryValueByAttributeFQN(me.model, 'tenant~extrastohide');
                var extrastohideArr = [];
                if(extrasToHide && extrasToHide!==""){
                    extrastohideArr = extrasToHide.toLowerCase().split(',');
                }
                for(var i=0; i< options.length;i++){
                    options.models[i].set('isHideExtra',"show");
                    var attributeCode = options.models[i].get('attributeFQN').split('~');
                    if(extrastohideArr.indexOf(attributeCode[1]) > -1){
                        options.models[i].set('isHideExtra',"hide");
                        me.model.set('purchasableState.isPurchasable', true);
                    }
                }
            },
            renderConfigure: function(){
                var  me = this, id, newValue,option,dndCode,mfgPartNumber;
                var objj=me.model.getConfiguredOptions();
                me.setOptionTitle();
                me.model.set('minQty', me.model._minQty);
                if(objj.length > 0){
                    id = objj[0].attributeFQN;
                    newValue = objj[0].value;
                    option = me.model.get('options').get(id);
                        if(me.model.get('productType')!=='Configurable' && option.get('attributeDetail').usageType ==='Extra' && option.get('attributeDetail').dataType==='ProductCode'){
                            Api.get('product',{productCode:newValue}).then(function(res){
                                var product = new ProductModels.Product(res.data);
                                var uom = getPropteryValueByAttributeFQN(product, productAttributes.unitOfMeasure);
                                if(uom){
                                    me.model.set('uom',uom);
                                }
                                var productionTime = getPropteryValueByAttributeFQN(product, productAttributes.productionTime);
                                if(productionTime){
                                    me.model.set('productionTime',productionTime);
                                }
                                var inventoryInfo = product.get('inventoryInfo');
                                if(inventoryInfo.manageStock){
                                    me.model.set('inventoryInfo',inventoryInfo);
                                }
                                dndCode = getPropteryValueByAttributeFQN(me.model, productAttributes.dndCode);
                                if(dndCode && dndCode!==""){
                                    mfgPartNumber = me.model.get('mfgPartNumber');
                                    if(mfgPartNumber===null || mfgPartNumber===undefined || mfgPartNumber===""){
                                         if(product.get('mfgPartNumber') && product.get('mfgPartNumber')!==""){
                                                me.model.set('mfgPartNumber',res.data.mfgPartNumber);
                                        }

                                    }
                                }else{
                                        if(product.get('mfgPartNumber') && product.get('mfgPartNumber')!==""){
                                            me.model.set('mfgPartNumber',res.data.mfgPartNumber);
                                        }
                                        dndCode = getPropteryValueByAttributeFQN(product, productAttributes.dndCode);
                                        var designCode = getPropteryValueByAttributeFQN(product, productAttributes.designCode);
                                        if(dndCode){
                                            me.model.set('enablePersonalise',true);
                                            me.model.set('dndCode',dndCode);
                                            me.model.set('designCode',designCode);
                                        }
                                }
                            Backbone.MozuView.prototype.render.apply(me);
                        });
                    }else{
                        Backbone.MozuView.prototype.render.apply(me);
                    }
                }
                else{
                    Backbone.MozuView.prototype.render.apply(this);
                }

            },
            onOptionChange: function (e) {
                return this.configure($(e.currentTarget));
            },
           increaseQty: function(e){

                $('.mz-productdetail-addtocart').prop('disabled',true);
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
                 this.model.set('quantity',newQuantity);
                if (!isNaN(newQuantity)) {
                    this.model.updateQuantity(newQuantity);
                }
                setTimeout(function(){
                    $('.mz-productdetail-addtocart').prop('disabled',false);
                },1000);
            },
            decreaseQty: function(e){
                var $qField = $(e.currentTarget).parent().find('[data-mz-value="quantity"]'),
                newQuantity = parseInt($qField.val(), 10);
                if(!isNaN(newQuantity) && newQuantity>1){
                    newQuantity-=1;
                    if(newQuantity < this.model._minQty){
                        return false;
                    }
                    $qField.val(newQuantity);
                }else{
                    newQuantity=1;
                    $qField.val(1);
                }
                $('.mz-productdetail-addtocart').prop('disabled',true);
                this.model.set('quantity',newQuantity);
                if (!isNaN(newQuantity)) {
                    this.model.updateQuantity(newQuantity);
                }
                if(newQuantity >= this.model._minQty){
                    setTimeout(function(){
                        $('.mz-productdetail-addtocart').prop('disabled',false);
                    },1000);
                }
            },
             onQuantityChange: _.debounce(function (e) {
                $('.mz-productdetail-addtocart').prop('disabled',true);
                 var $qField = $(e.currentTarget),
                  newQuantity = parseInt($qField.val(), 10);
                  if(newQuantity===0 || newQuantity < this.model._minQty){
                    newQuantity=this.model._minQty;
                    $qField.val(newQuantity);
                  }

                this.model.set('quantity',newQuantity);
                this.model.set('newQuantity',newQuantity);
                if (!isNaN(newQuantity)){
                    this.model.updateQuantity(newQuantity);
                }
                 if(newQuantity >= this.model._minQty){
                    setTimeout(function(){
                        $('.mz-productdetail-addtocart').prop('disabled',false);
                    },1000);
                }
            },500),
            configure: function ($optionEl) {
                $('.mz-quick-view-wrapper .mz-productdetail-addtocart').prop('disabled',true);
                var me = this;
                me.model.set('mfgPartNumber',"");
                var newValue = $optionEl.val(),
                    oldValue,
                    id = $optionEl.data('mz-product-option'),
                    optionEl = $optionEl[0],
                    isPicked = (optionEl.type !== "checkbox" && optionEl.type !== "radio") || optionEl.checked,
                    option = this.model.get('options').get(id);
                    var objj=me.model.getConfiguredOptions();
                    /*Unset value if Banner Type prodduct */
                    if(bannerProductsArr.indexOf(me.model.get('productType')) > -1){
                        _.each(objj, function(objoptions) {
                             me.model.get('options').get(objoptions.attributeFQN).unset("value");
                          });
                    }
                    if(id ==="tenant~cdyper-choice"){
                        if(newValue.toLowerCase()==="cdyperw-option"){
                            _.each(objj, function(objoptions) {
                                 me.model.get('options').get(objoptions.attributeFQN).unset("value");
                              });
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
            configureSlitOption: function (e) {
                var newValue = '',
                    me=this,
                    oldValue,
                    id = $(e.currentTarget).is(':checked')?productAttributes.outdoorbanner:productAttributes.outdoorbannerslits,
                    self=this,
                    option = this.model.get('options').get(id);
                    me.model.set('mfgPartNumber',"");
                    var objj=self.model.getConfiguredOptions();
                    var newobj=[];
                    oldValue = option.get('value');
                    _.each(objj, function(objoptions) {
                         self.model.get('options').get(objoptions.attributeFQN).unset("value");
                      });
                if($(e.currentTarget).is(":checked")){
                    option = this.model.get('options').get(productAttributes.outdoorbannerslits);
                    if (option) {
                        newValue = oldValue+'S';
                        console.log(newValue);
                        if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                            option.set('value', newValue);
                        }
                    }
                }else{
                    option = this.model.get('options').get(productAttributes.outdoorbanner);
                    if (option) {
                        newValue = oldValue.split('S')[0];
                        console.log(newValue);
                        if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                            option.set('value', newValue);
                        }
                    }
                }

            },
            addToWishlist: function () {
                var me= this;
                if(!require.mozuData('user').isAnonymous) {
                            this.model.set('moveToWishList', 1);
                            Wishlist.initoWishlist(this.model);
                    }else {
                        var produtDetailToStoreInCookie ={};
                        produtDetailToStoreInCookie.productCode=this.model.get('productCode');
                         var objj=me.model.getConfiguredOptions();
                        produtDetailToStoreInCookie.options=objj;
                        $.cookie('wishlistprouct', JSON.stringify(produtDetailToStoreInCookie),{path:'/'});
                        var ifrm = $("#homepageapicontext");
                        if(ifrm.contents().find('#data-mz-preload-apicontext').html()){
                            this.model.set('moveToWishList', 1);
                            Wishlist.initoWishlist(this.model);
                        }else{
                            triggerLogin();
                        }
                }
            },
            addToWishlistWithDesgin: function(){
                var me = this;
                    this.model.on('addedtowishlist', function (cartitem) {
                        $('#add-to-wishlist').prop('disabled', 'disabled').text(Hypr.getLabel('addedToWishlist'));
                        $('.dnd-popup').remove();
                        $('body').css({overflow: 'auto'});
                        $('#cboxOverlay').hide();
                        window.location.href=location.href;
                    });
                    if(!require.mozuData('user').isAnonymous) {
                            Wishlist.initoWishlistPersonalize(this.model);
                    }else {
                        var produtDetailToStoreInCookie ={};
                        produtDetailToStoreInCookie.productCode=this.model.get('productCode');
                         var objj=me.model.getConfiguredOptions();
                        produtDetailToStoreInCookie.options=objj;
                        $.cookie('wishlistprouct', JSON.stringify(produtDetailToStoreInCookie),{path:'/'});
                        var ifrm = $("#homepageapicontext");
                        if(ifrm.contents().find('#data-mz-preload-apicontext').html()){
                            Wishlist.initoWishlistPersonalize(this.model);
                        }else{
                            triggerLogin();
                            $('.popoverLoginForm .popover-wrap').css({'border':'1px solid #000'});
                        }
                    }
            },
            addToWishlistAfterLogin: function(){
                Wishlist.initoWishlistPersonalize(this.model);
                $.cookie('wishlistprouct', "",{path:'/'});
            },
            setSelectedOptions: function(){
                var me = this;
                var wishlistprouct = $.cookie('wishlistprouct');
                if(wishlistprouct && wishlistprouct!==""){
                    var wishlistobj = JSON.parse(wishlistprouct);
                    var objj = wishlistobj.options;
                    if(objj){
                        _.each(objj, function(objoptions) {
                            var val = objoptions.value?objoptions.value:objoptions.shopperEnteredValue;
                            me.model.get('options').get(objoptions.attributeFQN).set("value",val);
                        });
                    }
                    setTimeout(function(){
                        $.cookie('wishlistprouct', "",{path:'/'});
                        me.addToWishlist();
                    },500);
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
            setOptionValues: function(data){
                var self= this;
                var options = this.model.get('options');
                /*var option = this.model.get('options').get(productAttributes.dndToken);
                option.set('value',data.projectToken);*/
                var extraAttribute =  null;
                var extraJSON ={};
                if(data.extras){
                    extraAttribute = JSON.parse(data.extras);
                    for(var l = 0; l < extraAttribute.length; l++){
                        extraJSON['tenant~'+extraAttribute[l].attributeCode] = extraAttribute[l].value;
                    }
                }
                var payload={};
                payload.options=[];
                for(var i=0; i < options.length; i++){

                    if(options.models[i].get('attributeFQN')===productAttributes.dndToken){
                        options.models[i].set('value',data.projectToken);
                        options.models[i].set('shopperEnteredValue',data.projectToken);
                    }
                    if(Object.keys(extraJSON).length>0 && extraJSON[options.models[i].get('attributeFQN').toLowerCase()]){
                        options.models[i].set('value',extraJSON[options.models[i].get('attributeFQN').toLowerCase()]);
                        options.models[i].set('shopperEnteredValue',extraJSON[options.models[i].get('attributeFQN').toLowerCase()]);
                    }
                }
                self.model.set('options', options);
            },
            addToCartAfterPersonalize:function(data){
                var self= this;
                self.setOptionValues(data);
                self.model.addToCart();
            },
            AddToWishlistAfterPersonalize: function(data){
                var self= this;
                    self.setOptionValues(data);
                    self.addToWishlistWithDesgin();
            },
            initialize: function () {
                // handle preset selects, etc
                var me = this;
                this.on('render', this.afterRender);
                var options = this.model.get('options');
                this.model.set("minQty",this.model._minQty);
                //me.setSelectedOptions();

                if(options.length > 2){
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
                }else{
                    var optionModels = options.models;
                    var flag=0;
                     for (var i =0; i< optionModels.length; i++) {

                            if(optionModels[i].get('attributeDetail').usageType==='Extra' && optionModels[i].get('attributeFQN')!=='Tenant~dnd-token'){
                                 if(optionModels[i].get('values').length===1){
                                    optionModels[i].set('value', optionModels[i].get('values')[0].value);
                                 }
                            }
                        }
                }
            }
        });

        $(document).ready(function(){
            /* OPEN */
            $(document).on('click', '.quick-view > a[data-pro-id]', function(e){
                window.showPageLoader();
                $('body').css({overflow : 'hidden'});
                var btn=$(this);
                var productCode = $(this).attr('data-pro-id'),
                    sku = "";
                getExtrasProductDetails(productCode,function(product){
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
                                    variationProductCode = cartitemModel.attributes.product.variationProductCode;
                                if(productUsage === 'Bundle' || productUsage === 'Configurable'){
                                  sku = "";
                                  if(variationProductCode !== undefined && variationProductCode !== 'undefined'){
                                    sku = variationProductCode;
                                  }
                                }
                                if(BrTrk !== 'undefined' && BrTrk !== undefined){BrTrk.getTracker().logEvent('cart', 'click-add', {'prod_id': cartitemModel.attributes.product.productCode , 'sku' : sku });}
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

                    if(ga!==undefined){
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
                                 if(pintrk!==undefined){
                                     pintrk('track','addtocart',{
                                        value:parseFloat(track_price*product.get('quantity')).toFixed(2),
                                        order_quantity:product.get('quantity'),
                                        currency:"USD",
                                        line_items:[{
                                            product_name:product.toJSON().content.productName,
                                            product_id:track_product_code[0],
                                            product_price:track_price,
                                            product_quantity:product.get('quantity')
                                        }]
                                    });
                                 }
                                  if(window.addthis!==undefined){
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
                    window.productView = new ProductView({
                        el: $('#mz-quick-view-container'),
                        messagesEl: $('[data-mz-message-bar]'),
                        model:product,
                        productCode: productCode
                    });
                    if(require.mozuData("pagecontext").cmsContext.template.path==="super-page"&& $("#qty-" + productCode).length>0){
                        window.productView.setQtyModel($("#qty-" + productCode).val());
                    }
                    window.productView.render();
                    window.removePageLoader();
                    $('#mz-quick-view-container').fadeIn(350); 

                    //bloomreach quickview integration start
                    if(product.attributes.productUsage === "Configurable" || product.attributes.productUsage === "Bundle"){
                      if(product.attributes.variations.length){
                        sku = product.attributes.productCode;
                      }
                    } 
                    if(BrTrk !== undefined && BrTrk !== 'undefined'){
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
                });
                //getReviewFromPLP(productCode);
                e.preventDefault();
            });
            /* CLOSE */
            $(document).on('click', '#mz-quick-view-container-close, #mz-quick-view-container, .popup.quickview-popup', function(e){
                $('body').css({overflow : 'scroll'});
                if(e.target !== e.currentTarget) return;
                $('#mz-quick-view-container').fadeOut(350);
                $('#mz-quick-view-container').remove();
            });
        });
    });
