define(['modules/backbone-mozu', 'modules/api', 'hyprlive', 'hyprlivecontext', 'modules/jquery-mozu', 'underscore', 'modules/models-customer', 'modules/views-paging', 'modules/editable-view',
    'vendor/wishlist', 'modules/models-product', 'modules/added-to-cart', 'pages/dndengine',"modules/soft-cart","modules/cart-monitor","modules/models-orders"],
    function(Backbone, Api, Hypr, HyprLiveContext, $, _, CustomerModels, PagingViews,
        EditableView, Wishlist, ProductModels, addedToCart, DNDEngine, SoftCart, CartMonitor, OrderModel){
    
    Hypr.engine.setFilter("contains",function(obj,k){ 
            return obj.indexOf(k) > -1;
    });
    /** Global variables for Banner Types **/
    var bannerProductTypes = Hypr.getThemeSetting('bannerProductTypes');
    var bannerProductsArr = bannerProductTypes.split(',');

    var productAttributes = Hypr.getThemeSetting('productAttributes');
    function triggerLogin(){
        $('.trigger-login').trigger('click');
        $('#cboxOverlay').show();
        $('#mz-quick-view-container').fadeOut(350);
        $('#mz-quick-view-container').empty();
    }

    var loopcounter=0, loopcount=0;
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
            api.get('product',{productCode:productCode}).then(function(res){
                    var product=new ProductModels.Product(res.data);
                    callback(product);
            });
        };

    var ProductView = Backbone.MozuView.extend({
            templateName: 'modules/product/quickview',
            autoUpdate: ['quantity'],
            additionalEvents: {
                "change [data-mz-product-option]": "onOptionChange",
                //"blur [data-mz-product-option]": "onOptionChange",
                "click #add-to-cart": "addToCart",
                "change [data-mz-value='quantity']": "onQuantityChange",
                "change .mz-productlable-options": "showOptionsList",
                "change .needslits":"configureSlitOption",
                "click .personalize":"personalizeProduct",
                "click .qtyplus":"increaseQty",
                "click .qtyminus":"decreaseQty"
            },
            addToCart: function () {
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
                var lineItemId = this.model.get('wishlistlineitemId');
                if(lineItemId && lineItemId!==""){
                    dndUrl=dndUrl+'?wishlistID='+lineItemId;
                }
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
                    var objj=me.model.getConfiguredOptions();
                    if(objj.length===0 && !!jsonModel.priceRange){
                          me.model.apiModel.data = jsonModel;
                          me.model.apiModel.data.hasPriceRange=true;
                          me.model.set('hasPriceRange', true);
                          me.model._hasPriceRange=true;
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
                if(bannerProductsArr.indexOf(me.model.get('productType')) > -1){
                    $('.addToCart').attr('data-tooltip',"Please select an option");
                    var warnmessage = $('.mz-productdetail-notpurchasable').text().trim();
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
                        $('.personalize').prop('disabled', false);
                        $('.custom-qty input').prop('disabled', false);
                    }else{
                        $('.personalize').prop('disabled', true);
                        $('.custom-qty input').prop('disabled', true);
                    }
                }

                if(this.$('[data-mz-product-option]').attr('usageType')==='Extra' && this.$('[data-mz-product-option]').length === 1){
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
                        if(me.model.get('purchasableState').isPurchasable && $('.mz-productoptions-option:visible:eq(1)').val()!==undefined &&
                                    $('.mz-productoptions-option:visible:eq(1)').val()!==""){
                                    $('.personalize').prop('disabled', false);
                                    $('.custom-qty input').prop('disabled', false);
                        }else{ 
                            $('.personalize').prop('disabled', true);
                            $('.custom-qty input').prop('disabled', true);
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

                $("#mz-quick-view-container").children(".qtyminus,.qtyplus").css({"background-color":"transparent","fonts-size":"1rem"});
                $(".addToWishlist-btn-extra").click(function(){
                    me.addToWishlist();
                });

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
                 $('.mz-productdetail-addtocart').prop('disabled',true);
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
                $('.mz-productdetail-addtocart').prop('disabled',true);
                var me = this;
                me.model.set('mfgPartNumber',"");
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
                            Wishlist.initoWishlist(this.model);
                    }else {
                        var produtDetailToStoreInCookie ={};
                        produtDetailToStoreInCookie.productCode=this.model.get('productCode');
                         var objj=me.model.getConfiguredOptions();
                        produtDetailToStoreInCookie.options=objj;
                        $.cookie('wishlistprouct', JSON.stringify(produtDetailToStoreInCookie),{path:'/'});
                        var ifrm = $("#homepageapicontext");
                        if(ifrm.contents().find('#data-mz-preload-apicontext').html()){
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
                        $('html').removeClass('dnd-active-noscroll');
                        $('#cboxOverlay').hide();
                        //window.location.href=location.href;
                    });
                    this.model.on('referWishlistView', function(){
                        Wishlist.getAllWishlistData().then(function(res){
                            var newModel = window.accountModel.get('wishlist');
                            newModel.clear().set(newModel.defaults);
                            newModel.set(res);
                            window.wishListObj.model = newModel;
                            window.wishListObj.render();
                        });
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
                if(data.quantity){
                    self.model.set('quantity', data.quantity);
                }
                self.addToCart();
            },
            AddToWishlistAfterPersonalize: function(data){
                var self= this;
                var option = this.model.get('options').get(productAttributes.dndToken);
                 var oldValue = option.get('value');
                var designName = null;
                var projectToken = JSON.parse(data.projectToken);
                if(oldValue && oldValue!==""){
                    var oldValueObj = JSON.parse(oldValue);
                    designName = oldValueObj.designName;
                }
                if(designName)projectToken.designName = designName;
                option.set('shopperEnteredValue',JSON.stringify(projectToken));
                option.set('value',JSON.stringify(projectToken));
                if(data.quantity){
                    self.model.set('quantity', data.quantity);
                }
                self.addToWishlistWithDesgin();
            },
            initialize: function () {
                // handle preset selects, etc
                var me = this;
                this.on('render', this.afterRender);
                var options = this.model.get('options');
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

	var loadMDY = function(day,month,year,future,past){
        	var month_list = ['January','Febraury','March','April','May','June','July','August','September','October','November','December'],
            	dt = new Date(),
            	getYear = dt.getFullYear(),
            	endYear = getYear-121;
			$(month_list).each(function(k,v){
				if(k<=8){
					month.append('<option value="0'+(k+1)+'">'+v+'</option>');
				}else{
					month.append('<option value="'+(k+1)+'">'+v+'</option>');
				}

			});

			//append no. of days to day list max set to - 31
            for(var id=1;id<=31;id++){
            	if(id<=9){
            		day.append('<option value="0'+id+'">0'+id+'</option>');
            	}else{
            		day.append('<option value="'+id+'">'+id+'</option>');
            	}
			}

			//no. of years set to past 121 max
			if(past){
				for(var iy=getYear;iy>=endYear;iy--){
					year.append('<option value="'+iy+'">'+iy+'</option>');
				}
			}

			//display 20 years from current year
			if(future){
				for(var ik=getYear+20;ik>=endYear-20;ik--){
					year.append('<option value="'+ik+'">'+ik+'</option>');
				}
			}

        };

	var updateCalendar = function(day,month,year,intYear,dayLen,attr){
		var leapYear="";
	    if(month === "02" && ((intYear % 4 === 0) && (intYear % 100 !== 0)) || month === "02" && (intYear % 400 === 0) ){
	    	attr.find('select.day option:eq(30),select.day option:eq(31)').remove();
	    	if(dayLen<30){
	    		attr.find('select.day').append('<option value=29">29</option>');
	    	}
	    	leapYear = true;
	    }else if(month == "02" && leapYear === ""){
	    	attr.find('select.day option:eq(29), select.day option:eq(30),select.day option:eq(31)').remove();
	    }else if(month === "04" || month === "06" || month === "09" || month === "11"){

	    	if(dayLen<31){
	    		var loop_ld = 31 - dayLen;
	    		for(var ld=dayLen;ld<31;ld++){
	    			attr.find('select.day').append('<option value="'+ld+'">'+ld+'</option>');
	    		}
	    	}
	    	attr.find('select.day').find('option:eq(31)').remove();
	    }else{
	    	if(dayLen<32){
	    		var loop = 32 - dayLen;
	    		for(var dl=dayLen;dl<32;dl++){
	    			attr.find('select.day').append('<option value="'+dl+'">'+dl+'</option>');
	    		}
	    	}
	    }
	};
   window.myAccProductView={
        initialize: function(model){
            this.model=model;
        },
        personalizeProduct:function(){
            var self= this;
             /** DnD Code  Start **/
            var option = this.model.get('options').get(productAttributes.dndToken);
            var dndToken = null;
            var dndkenval;
            var mfgPartNumber;
            if(option){
                var dndtokenvalue = option.get('shopperEnteredValue');
                if(dndtokenvalue===undefined || dndtokenvalue===""){
                    dndtokenvalue = option.get('value');
                }
                if(dndtokenvalue && dndtokenvalue!==""){
                    dndkenval=JSON.parse(dndtokenvalue);
                    mfgPartNumber=Object.keys(dndkenval)[0];
                    dndToken = dndkenval[mfgPartNumber];
                }
            }
            self.dndToken = dndToken;
            var productCode = this.model.get('productCode');
            getExtrasProductDetails(productCode ,function(product){
                product.set('wishlistlineitemId',self.model.get('wishlistlineitemId'));
                product.set('wishlistId',self.model.get('wishlistId'));
                var qty = self.model.get('quantity');
                if(qty>=product._minQty){
                    product.set('quantity',self.model.get('quantity'));
                }
                product.get('price').set('price',self.model.get('price').get('price'));
                var options = self.model.get('options');
                if(options.length>0){
                    for(var i=0; i< options.length;i++){
                        var value = options.models[i].get('value');
                        product.get('options').get(options.models[i].get('attributeFQN')).set('value',value);
                    }
                }
                product.on('addedtocart', function (cartitem, prdmodel) {
                    var cartitemModel = new ProductModels.Product(cartitem.data);
                    var wishlistlinitemid = prdmodel.get('wishlistlineitemId');
                    if(wishlistlinitemid){
                        $('[removeWishlistItem="'+wishlistlinitemid+'"]').trigger('click');
                    }
                    if (cartitem && cartitem.prop('id')) {
                        $('.dnd-popup').remove();
                        $('body').css({overflow: 'auto'});
                        $('html').removeClass('dnd-active-noscroll');
                        $('#cboxOverlay').hide();
                        CartMonitor.addToCount(cartitemModel.get('quantity'));
                        SoftCart.update();
                        cartitemModel.isLoading(false);
                        cartitemModel.set('quantity',prdmodel.get('quantity'));
                        addedToCart.proFunction(cartitemModel);

                        //google analytics ATC event
                        if(typeof _gaq !== 'undefined'){ _gaq.push(['_trackEvent', 'Stumpsparty', 'buy', 'addtocart']); }

                        //Bloomreach add to cart event start
                        var productUsage = cartitemModel.attributes.product.productUsage,
                            variationProductCode = cartitemModel.attributes.product.variationProductCode,
                            sku = '';
                        if(productUsage === 'Bundle' || productUsage === 'Configurable'){
                          sku = "";
                          if(variationProductCode !== undefined && variationProductCode !== 'undefined'){
                            sku = variationProductCode;
                          }
                        }
                        if(BrTrk !== 'undefined' && BrTrk !== undefined){BrTrk.getTracker().logEvent('cart', 'click-add', {'prod_id': cartitemModel.attributes.product.productCode , 'sku' : sku });}
                        //end
                        
                        $('#mz-quick-view-container').fadeOut(100, function() {
                            $('#mz-quick-view-container').remove();
                        });
                    } else {
                        cartitemModel.trigger("error", { message: Hypr.getLabel('unexpectedError') });
                    }
                });
                if(self.dndToken!==null){
                    self.model=product;
                    self.model.set('mfgPartNumber',mfgPartNumber);
                    window.productView = self;
                    self.model.on('addedtowishlist', function (cartitem) {
                        $('#add-to-wishlist').prop('disabled', 'disabled').text(Hypr.getLabel('addedToWishlist'));
                        $('.dnd-popup').remove();
                        $('body').css({overflow: 'auto'});
                        $('#cboxOverlay').hide();
                         Wishlist.getAllWishlistData().then(function(res){
                            var newModel = window.accountModel.get('wishlist');
                            newModel.clear().set(newModel.defaults);
                            newModel.set(res);
                            window.wishListObj.model = newModel;
                            window.wishListObj.render();
                        });
                        //window.location.href=location.href;
                    });
                    self.model.on('referWishlistView', function(){
                        Wishlist.getAllWishlistData().then(function(res){
                            var newModel = window.accountModel.get('wishlist');
                            newModel.clear().set(newModel.defaults);
                            newModel.set(res);
                            window.wishListObj.model = newModel;
                            window.wishListObj.render();
                        });
                    });
                    self.renderConfigure();
                }
                else{

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
                    window.removePageLoader();
                    $('#mz-quick-view-container').fadeIn(350);
                    $(document).on('click', '#mz-quick-view-container-close, #mz-quick-view-container, .popup.quickview-popup', function(e){
                        if(e.target !== e.currentTarget) return;
                        $('#mz-quick-view-container').fadeOut(350);
                        $('#mz-quick-view-container').remove();
                    });
                }

            });

            /** DnD Code  End **/
        },
        loadDND: function(){
                window.removePageLoader();
                var self = this;
                var dndUrl = Hypr.getThemeSetting('dndEngineUrl');
                var lineItemId = this.model.get('wishlistlineitemId');
                if(lineItemId && lineItemId!==""){
                    dndUrl=dndUrl+self.dndToken+'/wishlist?wishlistID='+lineItemId;
                }
                var dndEngineObj = new DNDEngine.DNDEngine(self.model,dndUrl);
                dndEngineObj.initialize();
                dndEngineObj.send();
        },
        renderConfigure: function(){
                    var  me = this, id, newValue,option,dndCode,mfgPartNumber;
                    var objj=me.model.getConfiguredOptions();
                    if(objj.length > 0){
                        id = objj[0].attributeFQN;
                        newValue = objj[0].value;
                        option = me.model.get('options').get(id);
                        if(me.model.get('productType')!=='Configurable' && option.get('attributeDetail').usageType ==='Extra' && option.get('attributeDetail').dataType==='ProductCode'){
                            dndCode = getPropteryValueByAttributeFQN(me.model, productAttributes.dndCode);
                            if(dndCode && dndCode!==""){
                                mfgPartNumber = me.model.get('mfgPartNumber');
                                if(mfgPartNumber && mfgPartNumber!==""){
                                      // Assign header mfgpartnumber
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
                                        me.loadDND();
                                    });
                                }else{
                                    Api.get('product',{productCode:newValue}).then(function(res){
                                        var product = new ProductModels.Product(res.data);
                                        if(product.get('mfgPartNumber') && product.get('mfgPartNumber')!==""){
                                            me.model.set('mfgPartNumber',res.data.mfgPartNumber);
                                        }
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
                                        me.loadDND();
                                    });
                                }
                            }else{
                                    Api.get('product',{productCode:newValue}).then(function(res){
                                        var product = new ProductModels.Product(res.data);
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
                                        me.loadDND();
                                    });
                            }
                        }else{
                            me.loadDND();
                        }
                    }
                    else{
                        me.loadDND();
                    }

        },
        addToCart: function(){
            var self= this;
            /*if($('.needslits').is(":checked")){
                //console.log("Testest");
                self.myconfigure();
                $('#add-to-cart').html('loading...');
                setTimeout(function(){
                    self.model.addToCart();
                },2000);

            }else{
                this.model.addToCart();
            }*/
             this.model.addToCart();
        },
        addToWishlist: function () {
            var me= this;
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
        addToCartAfterPersonalize:function(data){
            var self= this;
            var option = this.model.get('options').get(productAttributes.dndToken);
            option.set('value',data.projectToken);
            option.set('shopperEnteredValue',data.projectToken);
            self.model.set('quantity', data.quantity);
            setTimeout(function(){
                self.addToCart();
            },200);

        },
        AddToWishlistAfterPersonalize: function(data){
            var self= this;
            var option = this.model.get('options').get(productAttributes.dndToken);
             var oldValue = option.get('value');
            var designName = null;
            var projectToken = JSON.parse(data.projectToken);
            if(oldValue && oldValue!==""){
                var oldValueObj = JSON.parse(oldValue);
                designName = oldValueObj.designName;
            }
            if(designName)projectToken.designName = designName;
            option.set('shopperEnteredValue',JSON.stringify(projectToken));
            option.set('value',JSON.stringify(projectToken));
            self.model.set('quantity',data.quantity);
            setTimeout(function(){
                self.addToWishlist();
            },200);
        }

   };


    var AccountSettingsView = EditableView.extend({
        templateName: 'modules/my-account/my-account-settings',
        autoUpdate: [
            'firstName',
            'lastName',
            'emailAddress',
            'acceptsMarketing'
        ],
        additionalEvents: {
        	"keyup [data-mz-value='firstName']": "resetSpecialChars",
        	"keyup [data-mz-value='lastName']": "resetSpecialChars",
        	"change [data-mz-attribute='tenant~date-of-birth'] select.bd": "setBirthDate"
        },
        constructor: function () {
            EditableView.apply(this, arguments);
            this.editing = false;
            this.invalidFields = {};
        },
        initialize: function () {
            this.on('render', this.afterRender);
            return this.model.getAttributes().then(function (customer) {
                customer.get('attributes').each(function (attribute) {
                    attribute.set('attributeDefinitionId', attribute.get('id'));
                });
                return customer;
            });

        },
        afterRender: function() {
            var me = this;
        },
		resetSpecialChars:function(){
            $("[data-mz-value='firstName'],[data-mz-value='lastName']").bind('change keyup keypress', function(e) {
                $(this).val($(this).val().replace(/[0-9\s!"#$%&'()*+,-.\/`¨.<>\{\}\[\]\\\Ç¬÷“=?¿;:´'",”?ºª€£¥€••¥£€®©~!¡@#$%^&*()_|+-]/gi,''));
            });
        },
        updateAttribute: function (e) {
            var self = this;
            var attributeFQN = e.currentTarget.getAttribute('data-mz-attribute');
            var attribute = this.model.get('attributes').findWhere({ attributeFQN: attributeFQN });
            var nextValue = attribute.get('inputType') === 'YesNo' ? $(e.currentTarget).prop('checked') : $(e.currentTarget).val();
            attribute.set('values', [nextValue]);
            attribute.validate('values', {
                valid: function (view, attr, error) {
                    self.$('[data-mz-attribute="' + attributeFQN + '"]').removeClass('is-invalid')
                        .next('[data-mz-validationmessage-for="' + attr + '"]').text('');
                },
                invalid: function (view, attr, error) {
                    self.$('[data-mz-attribute="' + attributeFQN + '"]').addClass('is-invalid')
                        .next('[data-mz-validationmessage-for="' + attr + '"]').text(error);
                }
            });
        },
        setBirthDate: function(){
        	var day = $('[data-mz-attribute="tenant~date-of-birth"] select.day').val(),
		    	month = $('[data-mz-attribute="tenant~date-of-birth"] select.month').val(),
		    	year = $('[data-mz-attribute="tenant~date-of-birth"] select.year').val(),
		    	intYear = parseInt(year,10),
		    	dayLen = $('[data-mz-attribute="tenant~date-of-birth"] select.day option').length;

		    updateCalendar(day,month,year,intYear,dayLen,$('[data-mz-attribute="tenant~date-of-birth"]'));

			$("input[name='account-attribute-tenant~date-of-birth']").attr('value',""+month+'-'+day+'-'+year+"");
			$("input[name='account-attribute-tenant~date-of-birth']").trigger('change');
        },
        startEdit: function (event) {
            event.preventDefault();
            this.editing = true;
            this.render();

            //fetch stored dob and populate onto dropdowns
            var storedDOB = $("input[name='account-attribute-tenant~date-of-birth']"),
		    	day = $('[data-mz-attribute="tenant~date-of-birth"] select.day'),
		    	month = $('[data-mz-attribute="tenant~date-of-birth"] select.month'),
		    	year = $('[data-mz-attribute="tenant~date-of-birth"] select.year');

            loadMDY(day,month,year,0,1);

		    if(day.val() === null || month.val() === null || year.val() === null || day.val() === "0" || month.val() === "0" || year.val() === "0"){
		    	if(storedDOB.val() !== ''){
		    		var mdy = storedDOB.val().split('-'); // month day year
			    	$('[data-mz-attribute="tenant~date-of-birth"] select.day').val(mdy[1]); //day
			    	$('[data-mz-attribute="tenant~date-of-birth"] select.month').val(mdy[0]); //month
			    	$('[data-mz-attribute="tenant~date-of-birth"] select.year').val(mdy[2]); //year
		    	}

		    }

		    this.setBirthDate();
        },
        cancelEdit: function () {
            this.editing = false;
            var self = this;
            var customer = require.mozuData('customer');
            var arr = ['firstName','lastName','emailAddress'];

            $(arr).each(function(i,v){
            	if(self.model.get(v) === ""){
            		self.model.set(v,customer[v]);
            	}else if(self.model.get(v) !== customer[v]){
            		self.model.set(v,customer[v]);
            	}
            });

            this.afterEdit();

            window.accountViews.settingsnew.cancelEdit();
        },
        finishEdit: function () {
            var self = this,
            	day = $('[data-mz-attribute="tenant~date-of-birth"] select.day').val(),
		    	month = $('[data-mz-attribute="tenant~date-of-birth"] select.month').val(),
		    	year = $('[data-mz-attribute="tenant~date-of-birth"] select.year').val(),
		    	date = new Date(),
		    	curday = date.getDate(),
		    	curMonth = date.getMonth() + 1,
		    	curYear = date.getFullYear();

			if((parseInt(month,10) === curMonth && parseInt(day,10) > curday && parseInt(year,10) === curYear)||(parseInt(month,10) > curMonth && parseInt(day,10) === curday && parseInt(year,10) === curYear)||(parseInt(month,10) > curMonth && parseInt(day,10) > curday && parseInt(year,10) === curYear)){
				$('[data-mz-attribute="tenant~date-of-birth"] span.mz-validationmessage').html('Invalid Birthdate');
            	return;
			}else if(parseInt(month,10) > curMonth && parseInt(day,10) > curday && parseInt(year,10) > curYear){
				$('[data-mz-attribute="tenant~date-of-birth"] span.mz-validationmessage').html('Invalid Birthdate');
            	return;
			}

            if(self.model.attributes.firstName==="" || self.model.attributes.lastName===""){
                  if(self.model.attributes.firstName===""){
                    $('.error-first').html("Firstname cannot be blank");
                  }else{
                    $('.error-first').html("");
                  }
                  if(self.model.attributes.lastName===""){
                    $('.error-last').html("Lastname cannot be blank");
                }else{
                    $('.error-last').html("");
                  }
                return;
            }else if(day === null || month === null || year === null || day === "0" || month === "0" || year === "0"){ //validate for blank and null values of dob field
            	$('[data-mz-attribute="tenant~date-of-birth"] span.mz-validationmessage').html('Date, Month, Year Required for Birth Date');
            	return;
            }
            else{
                this.doModelAction('apiUpdate').then(function () {
                    self.editing = false;
                }).otherwise(function () {
                    self.editing = true;
                }).ensure(function () {
                    self.afterEdit();
                });
            }

        },
        afterEdit: function () {
            var self = this;
            self.initialize().ensure(function () {
                self.render();
            });

            window.accountViews.settingsnew.cancelEdit();
        }
    });

      var AccountSettingsViewOcassion = EditableView.extend({
        templateName: 'modules/my-account/my-account-occassion',
        autoUpdate: [
            'firstName',
            'lastName',
            'emailAddress',
            'acceptsMarketing'
        ],
        additionalEvents: {
        	"change div.dateDropdown select.bd": "setBirthDate",
        	"click button.occassionbtn": "loadData"
        },
        constructor: function () {
            EditableView.apply(this, arguments);
            this.editing = false;
            this.invalidFields = {};
        },
        loadData: function(){
        	loadMDY($('div.dateDropdown select.day'),$('div.dateDropdown select.month'),$('div.dateDropdown select.year'),1,0);
        },
        initialize: function () {
             var self = this;
            this.on('render', this.afterRender);
            return this.model.getAttributes().then(function (customer) {
                customer.get('attributes').each(function (attribute) {
                    attribute.set('attributeDefinitionId', attribute.get('id'));
                    if(attribute.attributes.attributeFQN==="tenant~ocassions"){
                        var ocassions_object = attribute.attributes.values;
                        if(undefined !== ocassions_object) {
                            var res_object=  JSON.parse(ocassions_object);
                            attribute.set('ocassionObject',res_object) ;
                        }
                        self.render();
                    }
                });
                return customer;
            });
        },
        afterRender: function() {

            $('.relation').click(function() {
                  if ($("#other-relation").is(':checked')) {
                    $('.other-relation').css("display","none");
                  }else{
                    $('.other-relation').css("display","block");
                  }
                });
            var me = this;
            $('.edit-block').click(function(){
             var idkey =   $(this).attr('data-id');
             $('.divsblock').hide();
             $("#"+idkey).hide();
             $("#"+idkey).addClass("dis");
                me.startEdit(idkey);
            });

        },
        updateAttribute: function (e) {
            var self = this;
            var currentElement = (e.currentTarget!==undefined)?e.currentTarget:e[0];
            var attributeFQN = currentElement.getAttribute('data-mz-attribute');
            var attribute = this.model.get('attributes').findWhere({ attributeFQN: attributeFQN });
            var nextValue = attribute.get('inputType') === 'List' ? $(currentElement).prop('selected') : $(currentElement).val();

            attribute.set('values', [nextValue]);
            attribute.validate('values', {
                valid: function (view, attr, error) {
                    self.$('[data-mz-attribute="' + attributeFQN + '"]').removeClass('is-invalid')
                        .next('[data-mz-validationmessage-for="' + attr + '"]').text('');
                },
                invalid: function (view, attr, error) {
                    self.$('[data-mz-attribute="' + attributeFQN + '"]').addClass('is-invalid')
                        .next('[data-mz-validationmessage-for="' + attr + '"]').text(error);
                }
            });
        },
        setBirthDate: function(e){
        	var inputId = parseInt($(e.target).siblings('input').attr('id').split('_')[1],10);
        	var day = $('div.dateDropdown:eq('+inputId+') select.day').val(),
		    	month = $('div.dateDropdown:eq('+inputId+') select.month').val(),
		    	year = $('div.dateDropdown:eq('+inputId+') select.year').val(),
		    	intYear = parseInt(year,10),
		    	dayLen = $('div.dateDropdown:eq('+inputId+') select.day option').length;

		    updateCalendar(day,month,year,intYear,dayLen,$('div.dateDropdown'));

			$(e.target).siblings('input').attr('value',""+month+'-'+day+'-'+year+"");
			$(e.target).siblings('input').trigger('change');
			//$('div.dateDropdown #dob').val(""+month+'-'+day+'-'+year+"");
        },
        startEdit: function (event) {

            this.editing = true;
            this.render();
            $('.divsblock').hide();
            $('#'+event).show();

            //fetch stored dob and populate onto dropdowns
            var storedDOB = $("div.dateDropdown input#dob_"+event+""),
		    	day = $('div.dateDropdown select.day'),
		    	month = $('div.dateDropdown select.month'),
		    	year = $('div.dateDropdown select.year'),
		    	intYear = parseInt(year,10),
		    	dayLen = $('div.dateDropdown select.day option').length;

            loadMDY(day,month,year,1,0);

		    if(day.val() === null || month.val() === null || year.val() === null || day.val() === "0" || month.val() === "0" || year.val() === "0"){
		    	if(storedDOB.val() !== ''){
		    		var mdy = storedDOB.val().split('-'); // month day year
			    	$('div.dateDropdown select.day').val(mdy[1]); //day
			    	$('div.dateDropdown select.month').val(mdy[0]); //month
			    	$('div.dateDropdown select.year').val(mdy[2]); //year
		    	}

		    }

		    updateCalendar(day,month,year,intYear,dayLen,$('div.dateDropdown'));
        },
        cancelEdit: function () {
            this.editing = false;
            this.afterEdit();
        },
        finishEdit: function (e) {
            var currentElement = (e.currentTarget!==undefined)?e.currentTarget:e[0];
            var self = this;
            var state=   $('.state').val();
            var old_obj= self.model;
            var occasion_data = require.mozuData('customer').attributes,returnData,
                pageContext = require.mozuData('pagecontext'),flag_err,
                themeSettings = require('hyprlivecontext').locals.themeSettings;
            $.each(occasion_data,function(i,v){
                if(occasion_data[i].fullyQualifiedName === "tenant~ocassions"){
                    flag_err = 0;
                    if(v.values[0].replace(" ","") !== ''){
                        returnData = JSON.parse(occasion_data[i].values[0]);
                    }else{
                        returnData = [];
                    }
                }
            });

            if(flag_err !== 0){
                flag_err = 1;returnData = [];
            }

            if(occasion_data.length === 0 || flag_err === 1){
                if(returnData === undefined){
                    var obj = {
                        "attributes": [
                            {
                             "attributeDefinitionId": Hypr.getThemeSetting('ocassions'),
                             "fullyQualifiedName": "tenant~ocassions",
                             "values": [" "]
                            }
                        ],
                        "emailAddress": pageContext.user.email,
                        "lastName": pageContext.user.lastName,
                        "firstName": pageContext.user.firstName
                    };

                    Api.request('PUT','/api/commerce/customer/accounts/'+pageContext.user.accountId+'',obj).then(
                    function(res){
                        $(res.attributes).each(function(index,val){
                             if(val.fullyQualifiedName === "tenant~ocassions"){
                                if(val.values[0].replace(" ","") !== ''){
                                    returnData = JSON.parse(val.values[0]);
                                }else{
                                    returnData = [];
                                }
                            }
                        });
                    });
                }
            }
            if(returnData !== undefined){

                var key_status = $(currentElement).attr("data-status");
                if(key_status == "delete"){
                    state = "edit";
                    var del_index = $(currentElement).attr("data-method");
                    var newdel = returnData.splice(del_index,1);
                    var jsonstrdel=JSON.stringify(returnData);
                    $(".ocassion-textarea").val(jsonstrdel);
                }
                if(state=="save"){
                    var prev,
                        relationnew = $('#relationship').val(),
                        dobnew = $('#dob').val(),
                        reltypenew = $('#r-type').val(),
                        namenew = $('#name').val(),
                        month = $('div.dateDropdown select.month').val(),
                        day = $('div.dateDropdown select.day').val(),
                        year = $('div.dateDropdown select.year').val();

					if(day !== null && month !== null && year !== null && day !== "0" && month !== "0" && year !== "0"){
						$('#dob').val(""+month+'-'+day+'-'+year+"");
						dobnew = $('#dob').val();
					}else{
						dobnew = $('#dob').val("");
						dobnew = $('#dob').val();
					}

                    //check for any previous relationship
                    if($('.previous').val().replace(" ","")!==''){
                        prev = JSON.parse($('.previous').val()); //if exist store to prev
                    }else{
                        prev = []; //no relations
                    }
                    if(relationnew === "" || dobnew==="" || reltypenew==="" || namenew===""){
                        if(relationnew === ""){
                            $('.error-block0').html("Please Select Relationship");
                        }else{
                            $('.error-block0').html("");
                        }
                        if(reltypenew === ""){
                            $('.error-block1').html("Please Select Type Of Occasion");
                        }else{
                            $('.error-block1').html("");
                        }
                        if(dobnew === ""){
                            $('.error-block2').html("Date cannot be blank");
                        }else{
                            $('.error-block2').html("");
                        }
                         if(namenew === ""){
                            $('.error-block3').html("Name cannot be blank");
                        }else{
                            $('.error-block3').html("");
                        }
                        return;
                    }else{
	                    var objrelnew = {"relation":relationnew,"dob":dobnew,"relname":namenew,"rtype":reltypenew};

	                    prev.push(objrelnew);
	                    var jsonstrnew = JSON.stringify(prev);
	                    $(".ocassion-textarea").val(jsonstrnew);
                    }
                }
                else{
                    if(key_status!=="delete"){
                        var key_index = $(currentElement).attr("data-method");
                        var relation = $('#relationship_'+key_index).val();
                        var dob = $('#dob_'+key_index).val();
                        var reltype = $('#r-type_'+key_index).val();
                        var name = $('#name_'+key_index).val(),
                        this_month = $('div.dateDropdown:eq('+key_index+') select.month').val(),
                        this_day = $('div.dateDropdown:eq('+key_index+') select.day').val(),
                        this_year = $('div.dateDropdown:eq('+key_index+') select.year').val();

						if(this_day !== null && this_month !== null && this_year !== null && this_day !== "0" && this_month !== "0" && this_year !== "0"){
							dob = $('#dob_'+key_index).val(""+this_month+'-'+this_day+'-'+this_year+"");
							dob = $('#dob_'+key_index).val();
						}else{
							$('#dob_'+key_index).val("");
							dob = $('#dob_'+key_index).val();
						}

                        if(dob==="" || reltype==="" || name===""){
                            if(dob===""){
                                $('.error-block2').html("Date cannot be blank");
                            }else{
                                $('.error-block2').html("");
                            }
                             if(reltype===""){
                                $('.error-block1').html("Type cannot be blank");
                            }else{
                                $('.error-block1').html("");
                            }
                             if(name===""){
                                $('.error-block3').html("Name cannot be blank");
                            }else{
                                $('.error-block3').html("");
                            }
                            return;
                        }else{
                        returnData[key_index].relation = relation;
                        returnData[key_index].dob = dob;
                        returnData[key_index].relname = name;
                        returnData[key_index].rtype = reltype;
                        }
                    }

                    var jsonstr=JSON.stringify(returnData);
                    $(".ocassion-textarea").val(jsonstr);
                }

            var dataval=  $(".ocassion-textarea").val();
            self.updateAttribute($(".ocassion-textarea"));
            this.doModelAction('apiUpdate').then(function () {
                self.editing = false;
            }).otherwise(function () {
                self.editing = true;
            }).ensure(function () {
                self.afterEdit();
                 window.location.reload();
            });
        }
    },
        afterEdit: function () {
            var self = this;

            self.initialize().ensure(function () {
                self.render();

            });

        }
    });

    var PasswordView = EditableView.extend({
        templateName: 'modules/my-account/my-account-password',
        autoUpdate: [
            'oldPassword',
            'password',
            'confirmPassword'
        ],
        startEditPassword: function () {
            this.editing.password = true;
            this.render();
        },
        finishEditPassword: function() {
            var self = this;
            this.doModelAction('changePassword').then(function() {
                _.delay(function() {
                    self.$('[data-mz-validationmessage-for="passwordChanged"]').show().text(Hypr.getLabel('passwordChanged')).fadeOut(3000);
                }, 250);
            }, function() {
                self.editing.password = true;
        });
        this.editing.password = false;
    },
    cancelEditPassword: function() {
        this.editing.password = false;
        this.render();
    }
    });

    var WishListModel = new  Backbone.MozuModel.extend({

    });

    var WishListView = Backbone.MozuView.extend({
        templateName: 'modules/my-account/my-account-wishlist',
        initialize: function(){
            this.on('render', this.afterRender);
        },
        additionalEvents: {
            "click .deleteWishlist": "deleteWishlist",
            "click .remove-item": "deleteItemFromWishlist",
            "click .moveToWishlist": "moveToWishlist",
            "click .mz-click-personalize":"editPersonalize",
            "click .addToCart": "addToCart"
        },
        editPersonalize: function(e){
            window.showPageLoader();
            var target =  $(e.currentTarget);
            var wishlistid = target.closest('.mz-itemlisting-details').find('[wishlist-id]').attr('wishlist-id');
            var itemid = target.attr('id');
            var wishlistCollection = this.model.get('items').where({'id':wishlistid});
            var wishlist = wishlistCollection[0];
            var wihslistitems = wishlist.get('items');
            var currentItem = null;
            for(var i=0;i<wihslistitems.length;i++){
                if(wihslistitems[i].id==itemid){
                    currentItem = wihslistitems[i];
                    break;
                }
            }
            //console.log(currentItem);
            currentItem.product.wishlistId = wishlistid;
            currentItem.product.wishlistlineitemId=itemid;
            var qty = parseInt(target.closest('.orders-body').find('[data-mz-value=quantity]').val(),10);
            if(qty>0){
                currentItem.product.quantity = qty;
            }else{
                currentItem.product.quantity = currentItem.quantity;
            }
            var productModel = new ProductModels.Product(currentItem.product);
            //productModel.set({'wishlistlineitemId':itemid});
            window.myAccProductView.initialize(productModel);
            window.myAccProductView.personalizeProduct();
        },
        addToCart: function(e) {
            window.showPageLoader();
            var target =  $(e.currentTarget);
            var wishlistid = target.closest('.mz-itemlisting-details').find('[wishlist-id]').attr('wishlist-id');
            var itemid = target.attr('id');
            var wishlistCollection = this.model.get('items').where({'id':wishlistid});
            var wishlist = wishlistCollection[0];
            var wihslistitems = wishlist.get('items');
            var currentItem = null;
            for(var i=0;i<wihslistitems.length;i++){
                if(wihslistitems[i].id==itemid){
                    currentItem = wihslistitems[i];
                    break;
                }
            }
            //console.log(currentItem);
            if(currentItem.product.productUsage ==="Bundle"){
                window.location.href="/p/"+currentItem.product.productCode;
            }else{
                currentItem.product.wishlistlineitemId=itemid;
                var productModel = new ProductModels.Product(currentItem.product);
                //Bloomreach add to cart event start
                var productUsage = productModel.attributes.productUsage,
                    variationProductCode = productModel.attributes.variationProductCode,
                    sku = "";
                if(productUsage === 'Bundle' || productUsage === 'Configurable'){
                  if(variationProductCode !== undefined && variationProductCode !== 'undefined'){
                    sku = variationProductCode;
                  }
                }
                if(BrTrk !== 'undefined' && BrTrk !== undefined){BrTrk.getTracker().logEvent('cart', 'click-add', {'prod_id': productModel.attributes.productCode , 'sku' : sku });}
                //end
                productModel.on('error', function(a){
                    console.log(a);
                    $('.addtocart-error').remove();
                    $(e.target).parents('.orders-body').prepend('<p class="addtocart-error" style="color:red;">'+a.message+'</p>');
                });
                productModel.on('addedtocart', function (cartitem, prod) {
                    var cartitemModel = new ProductModels.Product(cartitem.data);
                    cartitemModel.set('quantity', prod.get('quantity'));
                    addedToCart.proFunction(cartitemModel);
                    window.removePageLoader();
                });
                productModel.set('quantity', $(e.target).parents(".wishlist-item").find('[data-mz-value=quantity]').val());
                productModel.addToCart();
            }
        },
        deleteWishlist: function(e) {
            var me = e.target;
            $(me).click(false);
            Wishlist.deleteWishlist($(me).attr('id')).then(function(res){
                $(me).parents(".wishlist-item").remove();
            });
        },
        deleteItemFromWishlist: function(e) {
            var viewM = this;
            var me = e.target;
            var wishlistId = $(me).parents(".wishlist-item").find('.deleteWishlist').attr('id');
            Wishlist.removeWishlistItem(wishlistId, $(me).attr('id')).then(function(){
                $(me).parents(".orders-body.mz-cms-col-12-12").remove();
                Wishlist.getAllWishlistData().then(function(res){
                    var newModel = window.accountModel.get('wishlist');
                    newModel.clear().set(newModel.defaults);
                    newModel.set(res);
                    viewM.model = newModel;
                    viewM.render();
                });
            });
        },
        moveToWishlist: function(e) {
            var viewM = this;
            var me = e.target;
            var wishlistId = $(me).parents(".wishlist-item").find('.deleteWishlist').attr('id');
            Wishlist.moveToWishlistInit(wishlistId, $(me).attr('id'), $(me).attr('original-id'), function(){
                Wishlist.getAllWishlistData().then(function(res){
                    var newModel = window.accountModel.get('wishlist');
                    newModel.clear().set(newModel.defaults);
                    newModel.set(res);
                    viewM.model = newModel;
                    viewM.render();
                });
            });
        },
        redirectPDP: function(proCode, go){
            var me = this;
            if(go) {
                $("#" + proCode).click(function(e) {
                    var productCode = $(e.target).attr('id');
                    Api.get('product', productCode).then(function(model){
                        var productModel = new ProductModels.Product(model.data);
                        console.log(model);
                        productModel.on('error', function(a){
                            console.log(a);
                            $('.addtocart-error').remove();
                            $(e.target).parents('.orders-body').prepend('<p class="addtocart-error" style="color:red;">'+a.message+'</p>');
                        });
                        productModel.on('addedtocart', function (cartitem) {
                            addedToCart.proFunction(productModel);
                        });
                        productModel.set('quantity', $(e.target).parents(".wishlist-item").find('[data-mz-value=quantity]').val());
                        productModel.addToCart();
                        $(e.target).parent().find('.remove-item').trigger('click');
                    });
                });
            }else {
                $("#" + proCode).click(function() {
                    window.location.href = ("/p/" + proCode);
                });
            }
        },
        getProperBtn: function(){
            var me = this;
            Api.action('products', 'get', {
                filter: 'productCode  eq ' + $('[data-mz-item]').map(function() {
                    return $(this).attr('data-mz-item');
                }).get().join(' or productCode  eq ')}).then(function(res){
                var flag = false, i = 0, j = 0;
                for(i = 0; i < res.length; i++) {
                    flag = false;
                    for(j = 0; j < res[i].data.properties.length; j++) {
                        if(res[i].data.properties[j].attributeFQN === "Tenant~dndcode") {
                            flag = true;
                            break;
                        }
                    }
                    if(!flag) {
                        if(res[i].data.options){
                            for(j = 0; j < res[i].data.options.length; j++) {
                                if(res[i].data.options[j].attributeFQN !== "Tenant~dnd-token") {
                                    flag = true;
                                    break;
                                }
                            }
                        }
                    }
                    if(flag) {
                        me.redirectPDP(res[i].data.productCode, false);
                    }else {
                        me.redirectPDP(res[i].data.productCode, true);
                    }
                }
            });
        },
        render: function(){
            var me = this,imgsrc,dndTokenStr;
            var i = 0, j = 0, k = 0, total = 0;
            var items = me.model.get('items');
            var dndEngineUrl = Hypr.getThemeSetting('dndEngineUrl');
            for(i = 0; i < items.length; i++) {
                    //res.items[i].total = 0;
                    total = 0;
                    for(j = 0; j < items.models[i].get('items').length; j++) {
                        //res.items[i].total += res.items[i].items[j].total;
                        total += items.models[i].get('items')[j].product.price.price;

                        for(var ind=0; ind < items.models[i].get('items')[j].product.options.length; ind++){
                            if(items.models[i].get('items')[j].product.options[ind].attributeFQN.toLowerCase()==='tenant~dnd-token'){
                                  var dndToken = JSON.parse(items.models[i].get('items')[j].product.options[ind].shopperEnteredValue);
                                  if(dndToken.designName){
                                      items.models[i].get('items')[j].designName = dndToken.designName;
                                  }
                                  for (var prop in dndToken) {
                                        if (dndToken.hasOwnProperty(prop)) {
                                            dndTokenStr = dndToken[prop];
                                            if(dndTokenStr){
                                                imgsrc=dndEngineUrl+'preview/'+dndTokenStr;
                                                items.models[i].get('items')[j].product.imageUrl= imgsrc;
                                            }
                                        }
                                        break;
                                    }
                            }
                        }
                        for(k = 0; k < items.models[i].get('items')[j].product.properties.length; k++) {
                            if(items.models[i].get('items')[j].product.properties[k].attributeFQN.toLowerCase() === "tenant~dndcode") {
                                items.models[i].get('items')[j].isPersonalize = true;
                                break;
                            }
                        }
                    }
                    console.log(total);
                    items.models[i].set('total',total.toFixed(2));
                }

            Backbone.MozuView.prototype.render.apply(this);
            $("html, body").animate({ scrollTop: 0 }, "slow");
        //    console.log(this);
        },
        afterRender: function() {
            var me = this;
            var parentwislists=this.model.attributes.items.models;


            $('.custom-qty .qtyplus').click(function(e){
                e.preventDefault();
                var qntBox = $(this).parent().children("[data-mz-value=quantity]");
                var qntyVal = $(qntBox).val();
                var currentVal = parseInt(qntyVal, 10);
                if (!isNaN(currentVal)) {
                    $(qntBox).val(currentVal + 1);
                } else {
                    $(qntBox).val(1);
                }
            });
            $('.custom-qty .qtyminus').click(function(e){
                e.preventDefault();
                var qntBox = $(this).parent().children("[data-mz-value=quantity]");
                var qntyVal = $(qntBox).val();
                var currentVal = parseInt(qntyVal, 10);
                if (!isNaN(currentVal) && currentVal > 1) {
                    $(qntBox).val(currentVal - 1);
                } else {
                    $(qntyVal).val(1);
                }
            });
            $(".custom-qty").children(".qtyminus,.qtyplus").css({"background-color":"transparent","fonts-size":"1rem"});
            $('.echi-shi-related-products-slider .owl-next, .echi-shi-related-products-slider .owl-prev').html('');
            var $sliderElement = $('.echi-shi-related-products-slider .owl-carousel');
            $sliderElement.owlCarousel({loop:true, nav:true, responsive:{ 0:{ items:2 }, 600:{ items:2 }, 1000:{ items:4 }, 1200:{ items:4 }, 1400:{ items:6 }, 1600:{ items:7 }, 1800:{ items:8 }}});
            //$sliderElement.trigger('click');
           setTimeout(function(){
                $sliderElement.owlCarousel('refresh');
            }, 600);

            //me.getProperBtn();
        }
    });


    var OrderHistoryView = Backbone.MozuView.extend({
        templateName: "modules/my-account/order-history-list",
        autoUpdate: [
            'rma.returnType',
            'rma.reason',
            'rma.quantity',
            'rma.comments'
        ],
        initialize: function () {

            this.listenTo(this.model, "change:pageSize", _.bind(this.model.myAccountChangePageSize, this.model));
            //this.listenTo(this.model, "change:pageSize", _.bind(this.model.myAccountChangePageSize, this.model));
            this.model.set('pageSize',10);

        },
        getRenderContext: function () {
            var context = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            context.returning = this.returning;
            return context;
        },
        startReturnItem: function (e) {
            var $target = $(e.currentTarget),
                itemId = $target.data('mzStartReturn'),
                orderId = $target.data('mzOrderId');
            if (itemId && orderId) {
                this.returning = itemId;
                this.model.startReturn(orderId, itemId);
            }
            this.render();
        },
        cancelReturnItem: function () {
            delete this.returning;
            this.model.clearReturn();
            this.render();
        },
        finishReturnItem: function () {
            var self = this,
                op = this.model.finishReturn();
            if (op) {
                return op.then(function () {
                    delete self.returning;
                    self.render();
                });
            }
        },
        /**
            * loop throguh each items and check if there is any informations related to the items
            * in packages array. if there add new property for the line item to hold fullfilment date info
        **/
        updateShippingDateForLineItems:function(){
            console.log("Order updating");
            console.log(this.model);
            for(var i=0; i<this.model.get('items').models.length; i++){
                for(var j=0; j<this.model.get('items').models[i].get('items').models.length; j++){
                    var item = this.model.get('items').models[i].get('items').models[j];
                    this.model.get('items').models[i].get('items').models[j].set('fulfillmentDateBasedOnPackage','');
                    var productCode = item.get('product').get('productCode');
                    for(var k=0; k<this.model.get('items').models[i].get('packages').length; k++){
                        var package_item = this.model.get('items').models[i].get('packages')[k];
                        for(var l=0; l<package_item.items.length; l++){
                            if(package_item.items[l].productCode == productCode){
                                // Add new property to the current order item in the order
                                if(package_item.fulfillmentDate && package_item.fulfillmentDate.length >0){
                                    this.model.get('items').models[i].get('items').models[j].set('fulfillmentDateBasedOnPackage',package_item.fulfillmentDate.split('T')[0]);
                                }
                            }
                        }
                    }
                }
            }
            console.log(this.model);
        },
        render: function(){
            this.updateShippingDateForLineItems();
            Backbone.MozuView.prototype.render.apply(this);
        }
    }),
    QuoteOrderHistoryView = Backbone.MozuView.extend({
        templateName: "modules/my-account/quote-order-history-list",
        autoUpdate: [
            'rma.returnType',
            'rma.reason',
            'rma.quantity',
            'rma.comments'
        ],
        initialize: function () {
            var order =  this.model.get('items');
            for(var i=0;i < order.length; i++){
                order.models[i].set('viewtype', 'quote');
            }
            //this.listenTo(this.model, "change:pageSize", _.bind(this.model.changePageSize, this.model));
            this.listenTo(this.model, "change:pageSize", _.bind(this.model.myAccountQuoteChangePageSize, this.model));

        },
        reloadThisQuote: function(e){
            window.showPageLoader();
            var self = this,$target = $(e.currentTarget),
            orderId = $target.attr('currentOrderId');
            var orders =  self.model.get('items').where({id:orderId});
            var order = orders[0];
            var items = order.get('items');
            var products = [];
            for(var i=0;i<items.length;i++){
                var item = items.models[i].get('product');
                item.set('quantity',items.models[i].get('quantity'));
               products.push(item);

            }
            if(products.length>0){
                self.addToCart(products,0);
            }else{
                window.removePageLoader();
            }
        },
        addToCart : function(items, loop){
            var self= this;
            if(loop < items.length){
                var me = items[loop];
                var fulfillMethod = me.get('fulfillmentMethod');
                if (!fulfillMethod) {
                    fulfillMethod = (me.get('goodsType') === 'Physical') ? ProductModels.Product.Constants.FulfillmentMethods.SHIP : ProductModels.Product.Constants.FulfillmentMethods.DIGITAL;
                }
                me.apiAddToCart({
                    options: me.getConfiguredOptions(),
                    fulfillmentMethod: fulfillMethod,
                    quantity: me.get("quantity")
                }).then(function (item) {
                    loop+=1;
                    CartMonitor.addToCount(me.get('quantity'));
                    self.addToCart(items,loop);
                });
            }else{
                SoftCart.update();
                window.removePageLoader();
            }
        },
        getRenderContext: function () {
            var context = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            context.returning = this.returning;
            return context;
        },
        startReturnItem: function (e) {
            var $target = $(e.currentTarget),
                itemId = $target.data('mzStartReturn'),
                orderId = $target.data('mzOrderId');
            if (itemId && orderId) {
                this.returning = itemId;
                this.model.startReturn(orderId, itemId);
            }
            this.render();
        },
        cancelReturnItem: function () {
            delete this.returning;
            this.model.clearReturn();
            this.render();
        },
        finishReturnItem: function () {
            var self = this,
                op = this.model.finishReturn();
            if (op) {
                return op.then(function () {
                    delete self.returning;
                    self.render();
                });
            }
        },
        /**
            * loop throguh each items and check if there is any informations related to the items
            * in packages array. if there add new property for the line item to hold fullfilment date info
        **/
        updateShippingDateForLineItems:function(){
            console.log("Order updating");
            console.log(this.model);
            for(var i=0; i<this.model.get('items').models.length; i++){
                for(var j=0; j<this.model.get('items').models[i].get('items').models.length; j++){
                    var item = this.model.get('items').models[i].get('items').models[j];
                    this.model.get('items').models[i].get('items').models[j].set('fulfillmentDateBasedOnPackage','');
                    var productCode = item.get('product').get('productCode');
                    for(var k=0; k<this.model.get('items').models[i].get('packages').length; k++){
                        var package_item = this.model.get('items').models[i].get('packages')[k];
                        for(var l=0; l<package_item.items.length; l++){
                            if(package_item.items[l].productCode == productCode){
                                // Add new property to the current order item in the order
                                if(package_item.fulfillmentDate && package_item.fulfillmentDate.length >0){
                                    this.model.get('items').models[i].get('items').models[j].set('fulfillmentDateBasedOnPackage',package_item.fulfillmentDate.split('T')[0]);
                                }
                            }
                        }
                    }
                }
            }
            console.log(this.model);
        },
        render: function(){
            this.updateShippingDateForLineItems();
            Backbone.MozuView.prototype.render.apply(this);
        }
    }),
    ReturnHistoryView = Backbone.MozuView.extend({
        templateName: "modules/my-account/return-history-list",
        initialize: function () {
            var self = this;
            this.listenTo(this.model, "change:pageSize", _.bind(this.model.changePageSize, this.model));
            this.listenTo(this.model, 'returndisplayed', function (id) {
                var $retView = self.$('[data-mz-id="' + id + '"]');
                if ($retView.length === 0) $retView = self.$el;
                $retView.ScrollTo({ axis: 'y' });
            });
        }
    });

    //var scrollBackUp = _.debounce(function () {
    //    $('#orderhistory').ScrollTo({ axis: 'y', offsetTop: Hypr.getThemeSetting('gutterWidth') });
    //}, 100);
    //var OrderHistoryPageNumbers = PagingViews.PageNumbers.extend({
    //    previous: function () {
    //        var op = PagingViews.PageNumbers.prototype.previous.apply(this, arguments);
    //        if (op) op.then(scrollBackUp);
    //    },
    //    next: function () {
    //        var op = PagingViews.PageNumbers.prototype.next.apply(this, arguments);
    //        if (op) op.then(scrollBackUp);
    //    },
    //    page: function () {
    //        var op = PagingViews.PageNumbers.prototype.page.apply(this, arguments);
    //        if (op) op.then(scrollBackUp);
    //    }
    //});
    var PaymentMethodsView = EditableView.extend({
        templateName: "modules/my-account/my-account-paymentmethods",
        autoUpdate: [
            'editingCard.isDefaultPayMethod',
            'editingCard.paymentOrCardType',
            'editingCard.nameOnCard',
            'editingCard.cardNumberPartOrMask',
            'editingCard.expireMonth',
            'editingCard.expireYear',
            'editingCard.cvv',
            'editingCard.isCvvOptional',
            'editingCard.contactId',
            'editingContact.firstName',
            'editingContact.lastNameOrSurname',
            'editingContact.companyOrOrganization',
            'editingContact.address.address1',
            'editingContact.address.address2',
            'editingContact.address.address3',
            'editingContact.address.cityOrTown',
            'editingContact.address.countryCode',
            'editingContact.address.stateOrProvince',
            'editingContact.address.postalOrZipCode',
            'editingContact.address.addressType',
            'editingContact.phoneNumbers.home',
            'editingContact.isBillingContact',
            'editingContact.isPrimaryBillingContact',
            'editingContact.isShippingContact',
            'editingContact.isPrimaryShippingContact'
        ],
        additionalEvents: {
            "keyup [data-mz-value='editingCard.cardNumberPartOrMask']": "setCardType",
            "keyup [id='mz-payment-credit-card-number']": "resetSpecialChars"
        },
        renderOnChange: [
            'editingContact.address.countryCode',
            'editingCard.isDefaultPayMethod',
            'editingCard.contactId'
        ],
        beginEditCard: function (e) {
            var id = this.editing.card = e.currentTarget.getAttribute('data-mz-card');
            this.model.beginEditCard(id);
            if(id==="new" && (this.model.get("editingContact.address.countryCode") === undefined || this.model.get("editingContact.address.countryCode") !="US")){
                this.model.set("editingContact.address.countryCode","US");
            }else{
                this.model.set("editingContact.address.stateOrProvince","");
            }
            this.render();
            this.$el.find('button.new-card-btn').hide();

            
        },
        finishEditCard: function() {
            var self = this,
                expireMonth = this.model.get('editingCard.expireMonth'),
                expireYear = this.model.get('editingCard.expireYear'),
                operation,
                err_flag,
                cardNumber = $('#mz-payment-credit-card-number').val(),
                expMonth = $('#mz-payment-expiration-month').find('option:selected').val(),
                expYear = $('[data-mz-value="editingCard.expireYear"]').find('option:selected').val(),
                stateOrProvince = this.$el.find('select[data-mz-value="editingContact.address.stateOrProvince"]').val();

            //force state field to blank(multiple spaces) on empty status, since state is mozu mandatory field
           

            if(expYear.indexOf("Exp. Year") >= 0 || expYear === undefined || expMonth.indexOf("Exp. Month") >= 0 || expMonth === undefined){
                $("[data-mz-validationmessage-for='editingCard.expireYear']").html("Please Select Expiry Date and Year");

                this.model.set('editingCard.expireMonth','');
                this.model.set('editingCard.expireYear','');
                //operation = this.doModelAction('saveCard');
            }else if(self.model.get('editingContact.address.stateOrProvince')===undefined||self.model.get('editingContact.address.stateOrProvince')==="n/a" || self.model.get('editingContact.address.stateOrProvince')===""){
                    if($(".billing_addressform .mz-contactselector-new").length<1 && $(".billing_addressform .mz-contactselector-summarywrapper").length < 1){
                        $('.myaccountCard-alert-section').html("<div style='color:red;'>Please select billing address.</div>").fadeIn().delay(1000).fadeOut();
                    }else if($(".billing_addressform .mz-contactselector-new").length !==1){
                $("[data-mz-validationmessage-for='editingCard.expireYear']").html("");
                err_flag = 1;
                operation = this.doModelAction('saveCard');
                if (operation) {
                    operation.otherwise(function() {
                        self.editing.card = true;
                    });
                    this.editing.card = false;
                   // $('#account-messages .mz-messagebar').html('');
                    $("html, body").animate({ scrollTop: $(".billing_addressform").offset().top }, "fast");
                }else{
                    if(self.model.get("editingCard.cardNumber")===undefined || self.model.get("editingCard.cardNumber").length>16 || self.model.get("editingCard.cardNumber").length < 15){
                        $('.myaccountCard-alert-section').html("<div style='color:red;'>Card number is in an unrecognized format.</div>").fadeIn().delay(4000).fadeOut();
                    }else{
                        $('.myaccountCard-alert-section').html("<div style='color:red;'>Please fill required fields value.</div>").fadeIn().delay(4000).fadeOut();
                    }
                  
                     $('span[data-mz-validationmessage-for="editingContact.address.postalOrZipCode"]').text("");
                    $('span[data-mz-validationmessage-for="editingContact.address.stateOrProvince"]').text("");
                     //$("[data-mz-validationmessage-for='editingCard.cardNumberPartOrMask']").html("Card number is in an unrecognized format.");
                    //$("html, body").animate({ scrollTop: $(".mz-accountpaymentmethods-form .mz-creditcardform").offset().top }, "fast");
                }
                    }else{
                        $('span[data-mz-validationmessage-for="editingContact.address.stateOrProvince"]').text("State or province required");
                        $('span[data-mz-validationmessage-for="editingContact.address.postalOrZipCode"]').text("");
                    }
            }else if(self.model.get('editingContact.address.postalOrZipCode')===undefined||self.model.get('editingContact.address.postalOrZipCode')==="n/a" || self.model.get('editingContact.address.postalOrZipCode')===""){
                      $('span[data-mz-validationmessage-for="editingContact.address.postalOrZipCode"]').text("Zip Code is required");
                      $('span[data-mz-validationmessage-for="editingContact.address.stateOrProvince"]').text("");
            }else{
                $("[data-mz-validationmessage-for='editingCard.expireYear']").html("");
                err_flag = 1;
                operation = this.doModelAction('saveCard');
                if (operation) {
                    operation.otherwise(function() {
                        self.editing.card = true;
                    });
                    this.editing.card = false;
                    //$('#account-messages .mz-messagebar').html('');
                    $("html, body").animate({ scrollTop: $(".my-account-body-content").offset().top }, "fast");
                }else{
                       if(self.model.get("editingCard.cardNumber")===undefined || self.model.get("editingCard.cardNumber").length>16 || self.model.get("editingCard.cardNumber").length<15){
                        $('.myaccountCard-alert-section').html("<div style='color:red;'>Card number is in an unrecognized format.</div>").fadeIn().delay(4000).fadeOut();
                    }else{
                        $('.myaccountCard-alert-section').html("<div style='color:red;'>Please fill required fields value.</div>").fadeIn().delay(4000).fadeOut();
                    }
                     $('span[data-mz-validationmessage-for="editingContact.address.postalOrZipCode"]').text("");
                    $('span[data-mz-validationmessage-for="editingContact.address.stateOrProvince"]').text("");
                    // $("[data-mz-validationmessage-for='editingCard.cardNumberPartOrMask']").html("Card number is in an unrecognized format.");
                }
            }


        },
        resetSpecialChars:function(){
            $("#mz-payment-credit-card-number").bind('change keyup keypress', function(e) {
                $(this).val($(this).val().replace(/[A-Za-z\s!"#$%&'()*+,-.\/`¨.<>\{\}\[\]\\\Ç¬÷“=?¿;:´'",”?ºª€£¥€••¥£€®©~!¡@#$%^&*()_|+-]/gi,''));
            });
        },
        cancelEditCard: function () {
            this.editing.card = false;
            this.model.endEditCard();
            this.render();
        },
        setCardType:function(){
            var cardNumber = $('[data-mz-value="editingCard.cardNumberPartOrMask"]').val();
            var cardType = "";
            var cardTypes = [
                {
                    name: 'visa',
                    pattern: /^4/,
                    valid_length: [16]
                },
                {
                    name: 'amex',
                    pattern: /^3[47]/,
                    valid_length: [15]
                },
                {
                    name: 'mastercard',
                    pattern: /^5[1-5]/,
                    valid_length: [16]
                },
                {
                    name: 'discover',
                    pattern: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/,
                    valid_length: [16]
                }
            ];
            for(var i=0;i<cardTypes.length;i++){
                if(cardTypes[i].pattern.test(cardNumber)){
                    cardType = cardTypes[i].name;
                }
            }
            switch(cardType){ //change card icon on input
                    case 'visa':
                        $('.selected-card-icon').html('<img src="../resources/images/Visa.svg?">');
                        $('select#mz-payment-credit-card-type option[value="VISA"]').attr('selected','selected');
                        $('select#mz-payment-credit-card-type').change();
                        this.model.set('card.paymentOrCardType','VISA');
                    break;
                    case 'amex':
                        $('.selected-card-icon').html('<img src="../resources/images/Amex.svg"/>');
                        $('select#mz-payment-credit-card-type option[value="AMEX"]').attr('selected','selected');
                        this.model.set('card.paymentOrCardType','AMEX');
                        $('select#mz-payment-credit-card-type').change();
                    break;
                    case 'mastercard':
                        $('.selected-card-icon').html('<img src="../resources/images/Mastercard.svg"/>');
                        $('select#mz-payment-credit-card-type option[value="MC"]').attr('selected','selected');
                        this.model.set('card.paymentOrCardType','MC');
                        $('select#mz-payment-credit-card-type').change();
                    break;
                    case 'discover':
                        $('.selected-card-icon').html('<img src="../resources/images/Discover.svg"/>');
                        $('select#mz-payment-credit-card-type option[value="DISCOVER"]').attr('selected','selected');
                         $('select#mz-payment-credit-card-type').change();
                        this.model.set('card.paymentOrCardType','DISCOVER');
                    break;
                    default:
                        $('.selected-card-icon').html('<i class="fa fa-2x fa-credit-card"></i>');
                        $('select#mz-payment-credit-card-type option').removeAttr('selected');
                        // $('select#mz-payment-credit-card-type').change();
                    break;
                }
                this.model.set('editingCard.nameOnCard', this.model.get('firstName')+' '+this.model.get('lastName')); //set name on card while adding new card
        },
        beginDeleteCard: function (e) {
            var self = this,
                id = e.currentTarget.getAttribute('data-mz-card'),
                card = this.model.get('cards').get(id);
            if (window.confirm(Hypr.getLabel('confirmDeleteCard', card.get('cardNumberPart')))) {
                this.doModelAction('deleteCard', id);
            }
        },
        initialize: function () {
            var self = this;
            var flag = false;
            this.on('render', function(){
                if($('.mz-accountpaymentmethods-method').length>=1){
                    self.$el.find('button.add-new-card').hide(); //hide the button when able to view new card fields
                }
            });
            this.on('render',this.afterRender);
        },
        render: function(){ 
            Backbone.MozuView.prototype.render.apply(this);
            var today=new Date();
                var yearfield=$('#mz-payment-expiration-year');
                var thisyear=today.getFullYear();
                
                var currentyr=0;
                if(this.model.get('editingCard')){
                    currentyr=this.model.get('editingCard').get('expireYear');
                } 
                var yrcontent='';
                for (var y=thisyear; y<=(thisyear+15); y++){
                    var selected='';
                    if(currentyr==y){
                        selected='selected';  
                    }
                    yrcontent+='<option '+selected+' val="' + y +'">' + y +'</option>';
                }
                $(yearfield).append(yrcontent); 
                
        },
        afterRender: function(){
            $(".mz-contactselector-summarywrapper").find('input').val("");
        }
    });

    var AddressBookView = EditableView.extend({
        templateName: "modules/my-account/my-account-addressbook",
        autoUpdate: [
            'editingContact.firstName',
            'editingContact.lastNameOrSurname',
            'editingContact.companyOrOrganization', 
            'editingContact.address.address1',
            'editingContact.address.address2',
            'editingContact.address.address3',
            'editingContact.address.cityOrTown',
            'editingContact.address.countryCode',
            'editingContact.address.stateOrProvince',
            'editingContact.address.postalOrZipCode',
            'editingContact.address.addressType',
            'editingContact.phoneNumbers.home',
            'editingContact.isBillingContact',
            'editingContact.isPrimaryBillingContact',
            'editingContact.isShippingContact',
            'editingContact.isPrimaryShippingContact'
            ],
        renderOnChange: [
            'editingContact.address.countryCode',
            'editingContact.isBillingContact',
            'editingContact.isShippingContact'
        ],
        additionalEvents: {
            "keypress [data-mz-value='editingContact.address.cityOrTown']": "alphaOnly",
            "keypress [data-mz-value='editingContact.company']": "alphaOnly",
            "keypress [data-mz-value='editingContact.address.postalOrZipCode']": "blockSpecialChar"
        },
        blockSpecialChar: function(e){
            var k = document.all ? e.keyCode : e.which;
            return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
        },
        alphaOnly: function(e) {
            var k = document.all ? e.keyCode : e.which;
            return ((k >= 65 && k <= 90) || (k > 96 && k < 123) || k == 8);
        },
        beginAddContact: function () {
            this.editing.contact = "new";
            if(this.model.get("editingContact.address.countryCode") === undefined){
                this.model.set("editingContact.address.countryCode","US");
            }
            this.render();
            this.$el.find('button.add-new-address').hide();
        },
        beginEditContact: function (e) {
            console.log('bverb');
            var id = this.editing.contact = e.currentTarget.getAttribute('data-mz-contact');
            this.model.beginEditContact(id);
            this.render();
            this.$el.find('button.add-new-address').show();
        },
        finishEditContact: function () {
            var self = this,
            isAddressValidationEnabled = HyprLiveContext.locals.siteContext.generalSettings.isAddressValidationEnabled,
            stateOrProvince = this.$el.find('select[data-mz-value="editingContact.address.stateOrProvince"]').val();
            if(self.model.get('editingContact.address.countryCode')==="US"){
                var operation = this.doModelAction('saveContact', { forceIsValid: isAddressValidationEnabled }); // hack in advance of doing real validation in the myaccount page, tells the model to add isValidated: true
                if (operation) {
                    operation.otherwise(function() {
                        self.editing.contact = true;
                    });
                    this.editing.contact = false;
                     $('html, body').animate({
                        scrollTop: $('#account-addressbook').offset().top
                    }, 300);
                }
            }else{
                if(self.model.get('editingContact.address.stateOrProvince')===undefined||self.model.get('editingContact.address.stateOrProvince')==="n/a" || self.model.get('editingContact.address.stateOrProvince')===""){
                    $('span[data-mz-validationmessage-for="editingContact.address.stateOrProvince"]').text("State or province required");
                    $('span[data-mz-validationmessage-for="editingContact.address.postalOrZipCode"]').text("");
                }else if(self.model.get('editingContact.address.postalOrZipCode')===undefined||self.model.get('editingContact.address.postalOrZipCode')==="n/a" || self.model.get('editingContact.address.postalOrZipCode')===""){
                      $('span[data-mz-validationmessage-for="editingContact.address.postalOrZipCode"]').text("Zip Code is required");
                       $('span[data-mz-validationmessage-for="editingContact.address.stateOrProvince"]').text("");
                }else{
                    var operation1 = this.doModelAction('saveContact', { forceIsValid: isAddressValidationEnabled }); // hack in advance of doing real validation in the myaccount page, tells the model to add isValidated: true
                    if (operation1) {
                        operation1.otherwise(function() {
                            self.editing.contact = true;
                       });
                        this.editing.contact = false;
                         $('html, body').animate({
                            scrollTop: $('#account-addressbook').offset().top
                        }, 300);
                    }
                }
            }
        },
        cancelEditContact: function () {
            this.editing.contact = false;
            this.model.endEditContact();
            this.render();
            this.$el.find('button.add-new-address').show();
            $('html, body').animate({
                scrollTop: $('#account-addressbook').offset().top
            }, 300);

        },
        beginDeleteContact: function (e) {
            var self = this,
                contact = this.model.get('contacts').get(e.currentTarget.getAttribute('data-mz-contact')),
                associatedCards = this.model.get('cards').where({ contactId: contact.id }),
                windowMessage = Hypr.getLabel('confirmDeleteContact', contact.get('address').get('address1')),
                doDeleteContact = function() {
                    return self.doModelAction('deleteContact', contact.id);
                },
                go = doDeleteContact;


            if (associatedCards.length > 0) {
                windowMessage += ' ' + Hypr.getLabel('confirmDeleteContact2');
                go = function() {
                    return self.doModelAction('deleteMultipleCards', _.pluck(associatedCards, 'id')).then(doDeleteContact);
                };

            }
            if (window.confirm(windowMessage)) {
                return go();
            }
        },
        initialize: function () {
            var self = this;
            var flag = false;
            this.on('render', function(){
                if(self.$el.find('#isPrimaryShippingContact,#isPrimaryBillingContact').length>0 || flag === true){
                    flag = true;
                 //   self.$el.find('button.add-new-address').click();
                 //  self.$el.find('button.add-new-address').hide(); //hide the button when add new address view is viewable
                }
            });
        }
    });

    var StoreCreditView = EditableView.extend({

        templateName: 'modules/my-account/my-account-storecredit',
        rewardAttributeFQN: "tenant~enable-shipping-reward-program",
        rewardPointAttributeFQN: "tenant~shipping-reward-point-1",
        enrolledOnAttributeFQN: "tenant~rp-enrolled-on",
        addStoreCredit: function (e) {
            var self = this;
            var id = this.$('[data-mz-entering-credit]').val();
            if (id) return this.model.addStoreCredit(id).then(function () {
                return self.model.getStoreCredits();
            });
        },
        additionalEvents:{
            'click [data-mz-action="enableRewardPointSystem"]' : "enableRewardPointSystemAndSetEnrollData",
            'click .faq-category-section .faq-list-item>h3':"showFAQ"
        },showFAQ:function(event){
            if($(event.target).hasClass('show-faq')){
                $(event.target).removeClass('show-faq');
            }else{
                $(".faq-list-item>h3").removeClass('show-faq');
               $(event.target).addClass('show-faq');
                if($(window).scrollTop()>160){
                    var offset = $(event.target).offset();
                    $('html, body').animate({
                        scrollTop: offset.top- $(event.target).outerHeight()-10
                    },'fast');
                }
            }
        },enableRewardPointSystemAndSetEnrollData : function(){
            var meThis = this;
            var date =  new Date();
            var pageContext = require.mozuData('pagecontext');
            var rolledOn = (date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear();
            Api.request('PUT', '/api/commerce/customer/accounts/'+pageContext.user.accountId+'', {
                // 'customer.id': customer.id,
                "attributes": [
                    {
                        "attributeDefinitionId": 34,
                        "fullyQualifiedName": "tenant~enable-shipping-reward-program",
                        "values": [true]
                    },
                    {
                        "attributeDefinitionId":28,
                        "attributeFQN":"tenant~rp-enrolled-on",
                        "values":[rolledOn]
                    }
                ],
                "emailAddress": pageContext.user.email,
                "lastName": pageContext.user.lastName,
                "firstName": pageContext.user.firstName
            }).then(function(res){
                console.log(res);
                meThis.model.set(res);
                meThis.render();
            });
        },

        render: function(){
            var meThis = this;
            var i = 0;
            // Extracting and setting the informations about if customer is participated in reward program
            meThis.model.set('isEnabledShippingReward','no');
            meThis.model.set('rewardpoint',0);
            meThis.model.set('enrolledOn',0);

            meThis.model.set('isEnabledShippingReward','no');
            for (i = 0; i < meThis.model.get('attributes').models.length; i++) {
                if(meThis.model.get('attributes').models[i].get('attributeFQN')){
                    if(meThis.model.get('attributes').models[i].get('attributeFQN') == meThis.rewardAttributeFQN){
                        if(meThis.model.get('attributes').models[i].get('values') && meThis.model.get('attributes').models[i].get('values')[0]){
                            meThis.model.set('isEnabledShippingReward','yes');
                        }
                    }
                    if(meThis.model.get('attributes').models[i].get('attributeFQN') == meThis.rewardPointAttributeFQN){
                        if(meThis.model.get('attributes').models[i].get('values') && meThis.model.get('attributes').models[i].get('values')[0]){
                            meThis.model.set('rewardpoint',meThis.model.get('attributes').models[i].get('values')[0]);
                        }
                    }
                    if(meThis.model.get('attributes').models[i].get('attributeFQN') == meThis.enrolledOnAttributeFQN){
                        if(meThis.model.get('attributes').models[i].get('values') && meThis.model.get('attributes').models[i].get('values')[0]){
                            meThis.model.set('enrolledOn',meThis.model.get('attributes').models[i].get('values')[0]);
                        }
                    }
                }else{
                    if(meThis.model.get('attributes').models[i].get('fullyQualifiedName') == meThis.rewardAttributeFQN){
                        if(meThis.model.get('attributes').models[i].get('values') && meThis.model.get('attributes').models[i].get('values')[0]){
                            meThis.model.set('isEnabledShippingReward','yes');
                        }
                    }
                    if(meThis.model.get('attributes').models[i].get('fullyQualifiedName') == meThis.rewardPointAttributeFQN){
                        if(meThis.model.get('attributes').models[i].get('values') && meThis.model.get('attributes').models[i].get('values')[0]){
                            meThis.model.set('rewardpoint',meThis.model.get('attributes').models[i].get('values')[0]);
                        }
                    }
                    if(meThis.model.get('attributes').models[i].get('fullyQualifiedName') == meThis.enrolledOnAttributeFQN){
                        if(meThis.model.get('attributes').models[i].get('values') && meThis.model.get('attributes').models[i].get('values')[0]){
                            meThis.model.set('enrolledOn',meThis.model.get('attributes').models[i].get('values')[0]);
                        }
                    }
                }
            }
            EditableView.prototype.render.apply(meThis);
        }
    });

    var MyWishlistView = Backbone.MozuView.extend({
        templateName: 'modules/my-account/my-account-storecredit',
        addStoreCredit: function (e) {
            var self = this;
            var id = this.$('[data-mz-entering-credit]').val();
            if (id) return this.model.addStoreCredit(id).then(function () {
                return self.model.getStoreCredits();
            });
        }
    });


    $(document).on('click','.ocassionbtn',function(){
        $('.btn-close').click();
    });



      $(document).on("click",".occassionbtn",function(){
            console.log("hi");
            $( ".relation" ).show();
            $( "#other-relation" ).prop( "checked", true );
            $('.personal_others').show();
            });

    $(document).on('click','.mz-accountaddressbook-edit', function(){
        $('.mz-accountaddressbook-contact.address-block').hide();
    });
    $('.mz-contact-cancel').on('click', function(){
        // $('.mz-accountaddressbook-contact.address-block').show();
    });


    $(document).ready(function () {

        var accountModel = window.accountModel = CustomerModels.EditableCustomer.fromCurrent();

        var $accountSettingsEl = $('#account-settings'),
            $accountSettingsnewEl = $('#account-settings-ocassion'),
            $passwordEl = $('#password-section'),
            $orderHistoryEl = $('#account-orderhistory'),
            $quoteOrderHistoryEl = $('#account-quoteorderhistory'),
            $returnHistoryEl = $('#account-returnhistory'),
            $paymentMethodsEl = $('#account-paymentmethods'),
            $addressBookEl = $('#account-addressbook'),
            $wishListEl = $('#account-wishlist'),
            $messagesEl = $('#account-messages'),
            $storeCreditEl = $('#account-storecredit'),
            $rewardProgram = $('#account-storecredit'),
            orderHistory = accountModel.get('orderHistory'),
            returnHistory = accountModel.get('returnHistory');
            var QuoteOrderAttributeId = Hypr.getThemeSetting('QuoteOrderAttributeId');
             Api.get('orders', {sortBy:"createDate desc",filter:"attributes.id eq "+QuoteOrderAttributeId+" and Status ne Created and Status ne Validated and Status ne Abandoned and Status ne Errored and Status ne Pending"}).then(function(res){
                var orderModel = new OrderModel.OrderCollection(res.data);
                var quoteOrderHistory = new QuoteOrderHistoryView({
                    el: $quoteOrderHistoryEl.find('[data-mz-quoteorderlist]'),
                    model: orderModel
                });
                quoteOrderHistory.render();
            });

        var accountViews = window.accountViews = {
            settings: new AccountSettingsView({
                el: $accountSettingsEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            settingsnew: new AccountSettingsViewOcassion({
                el: $accountSettingsnewEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            password: new PasswordView({
                el: $passwordEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            orderHistory: new OrderHistoryView({
                el: $orderHistoryEl.find('[data-mz-orderlist]'),
                model: orderHistory
            }),
            orderHistoryPagingControls: new PagingViews.PagingControls({
                templateName: 'modules/my-account/order-history-paging-controls',
                el: $orderHistoryEl.find('[data-mz-pagingcontrols]'),
                model: orderHistory
            }),
            orderHistoryPageNumbers: new PagingViews.PageNumbers({
                el: $orderHistoryEl.find('[data-mz-pagenumbers]'),
                model: orderHistory
            }),
            returnHistory: new ReturnHistoryView({
                el: $returnHistoryEl.find('[data-mz-orderlist]'),
                model: returnHistory
            }),
            returnHistoryPagingControls: new PagingViews.PagingControls({
                templateName: 'modules/my-account/order-history-paging-controls',
                el: $returnHistoryEl.find('[data-mz-pagingcontrols]'),
                model: returnHistory
            }),
            returnHistoryPageNumbers: new PagingViews.PageNumbers({
                el: $returnHistoryEl.find('[data-mz-pagenumbers]'),
                model: returnHistory
            }),
            paymentMethods: new PaymentMethodsView({
                el: $paymentMethodsEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            addressBook: new AddressBookView({
                el: $addressBookEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            storeCredit: new StoreCreditView({
                el: $storeCreditEl,
                model: accountModel,
                messagesEl: $messagesEl
            })
        };

        /*
        accountViews.myWishlistView= new MyWishlistView({
            el: $wishListEl,
            model: accountModel.get('wishlist'),
            messagesEl: $messagesEl
        });
        */

        Wishlist.getAllWishlistData().then(function(res){
            if (HyprLiveContext.locals.siteContext.generalSettings.isWishlistCreationEnabled){
                //console.log(res);
                accountModel.get('wishlist').set(res);
                var wishListObj = new WishListView({
                    el: $wishListEl,
                    model: accountModel.get('wishlist'),
                    messagesEl: $messagesEl
                 });
                window.wishListObj = wishListObj;
                wishListObj.render();
                if(window.location.hash === "#wishlist") {
                    $("a#tab_5 .mz-cms-content").trigger('click');
                }
            }
        });

        // TODO: upgrade server-side models enough that there's no delta between server output and this render,
        // thus making an up-front render unnecessary.
        _.invoke(window.accountViews, 'render');
    });
});
