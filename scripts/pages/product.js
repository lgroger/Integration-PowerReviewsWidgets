require(["modules/jquery-mozu", "underscore", "hyprlive", "modules/api", "modules/backbone-mozu", "modules/cart-monitor", "modules/models-product", "modules/views-productimages", "modules/soft-cart", 'modules/added-to-cart', "modules/powerreviews", "vendor/wishlist", "hyprlivecontext","pages/dndengine"],
function ($, _, Hypr, Api, Backbone, CartMonitor, ProductModels, ProductImageViews, SoftCart,  addedToCart, PowerReviews, Wishlist, HyprLiveContext, DNDEngine) {
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
    var BundleItems=[];
    var standardProducts=[];
    var isPurchasableState;
    var isPersonalize = 0;
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
     var initProductView = function(product){
        product.on('error', function(){
            $('.dnd-popup').remove();
            $('body').css({overflow: 'auto'});
            $('html').removeClass('dnd-active-noscroll');
            $('html').css({position:'static'});
            $('#cboxOverlay').hide();
        });
        product.on('addedtocart', function (cartitem, prod) {
            var newQuant = $('.product-quantity input[data-mz-value="quantity"]').val();

            if (cartitem && cartitem.prop('id')) {
                var cartitemModel = new ProductModels.Product(cartitem.data);
                product.isLoading(true);
                $('.dnd-popup').remove();
                $('body').css({overflow: 'auto'});
                $('html').removeClass('dnd-active-noscroll');
                $('#cboxOverlay').hide();
                CartMonitor.addToCount(product.get('quantity'));
                SoftCart.update();
                //SoftCart.update().then(SoftCart.show).then(function() {
                    //SoftCart.show();
                    //SoftCart.highlightItem(cartitem.prop('id'));
                //});
                product.isLoading(false);
                cartitemModel.set('quantity',prod.get('quantity'));
                addedToCart.proFunction(cartitemModel);
                //window.location.href = "/cart";
                 
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
                        ga('ec:setAction', 'BuyPdp');
                        ga('send', 'event', 'buy', 'buypdp', gaitem.product.name);  
 
                    } 
                    



                 //Facebook pixel add to cart event
                 var track_price=product.get("price").toJSON().price;
                 if(product.get("price").toJSON().salePrice){
                    track_price=product.get("price").toJSON().salePrice;
                 } 
                 var track_product_code=[];
                 track_product_code.push(product.toJSON().productCode);
                /* if(product.toJSON().variationProductCode){
                    fb_product_code[0]=product.toJSON().variationProductCode;
                 }*/
                 if(fbq!==undefined){
                     fbq('track', 'AddToCart', {
                        content_ids:track_product_code,
                        content_type:'product',
                        value: parseFloat(track_price*prod.get('quantity')).toFixed(2),
                        currency: 'USD'
                    });
                 }



                 //Pinterest tracking
                 if(pintrk!==undefined){
                     pintrk('track','addtocart',{
                        value:parseFloat(track_price*prod.get('quantity')),
                        order_quantity:parseInt(prod.get('quantity'),10),
                        currency:"USD",
                        line_items:[{
                            product_name:product.toJSON().content.productName,
                            product_id:track_product_code[0],
                            product_price:parseFloat(track_price),
                            product_quantity:parseInt(prod.get('quantity'),10)
                        }]
                    });
                 }
                   if(addthis!==undefined){
                    //Rerender addthis buttons
                    addthis.toolbox('.cart-over-addthis');
                }
            } else {
                product.trigger("error", { message: Hypr.getLabel('unexpectedError') });
            }
        });

        product.on('addedtowishlist', function (cartitem) {
            $('#add-to-wishlist').prop('disabled', 'disabled').text(Hypr.getLabel('addedToWishlist'));
            $('.dnd-popup').remove();
            $('body').css({overflow: 'auto'});
            $('html').removeClass('dnd-active-noscroll');
            $('#cboxOverlay').hide();
            window.location.href=location.href;
        });

        var productView = new ProductView({
            el: $('#product-detail'),
            model: product,
            messagesEl: $('[data-mz-message-bar]')
        });

        var productImagesView = new ProductImageViews.ProductPageImagesView({
            el: $('[data-mz-productimages]'),
            model: product
        });

        window.productView = productView;

        productView.render();
    };
	
	// get product info of all items used as extras - http.commerce.catalog.storefront.products.getProduct.after (application Pricing_Arc_Prod) returns extras as http header "productExtras"
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
    };
	
	// get product info of bundle items with stardard productUsage (can get multiple at a time since they are available for sale on their own)
    function getStandardProductDetails(productCodes){
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
                        var dndCode = getPropteryValueByAttributeFQN(product, productAttributes.dndCode);
                        if(dndCode){
                            window.personalizeBundleProducts.push(product);
                            isPersonalize=1;
                        }
                    }
                }
                getBundleProductDetails(BundleItems);

            });
        }else{
            getBundleProductDetails(BundleItems);
        }
    }
	
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

                    var dndCode = getPropteryValueByAttributeFQN(product, productAttributes.dndCode);
                    if(dndCode){
                        window.personalizeBundleProducts.push(product);
                       isPersonalize =1;
                    }
                    loopcounter++;
                    if(loopcounter < arr.length){
                        getBundleProductDetails(arr);
                    }else{
                        if(isPersonalize){
                            $('.addToCart').html('Personalize').addClass('personalize').removeAttr('id');
                            if(isPurchasableState){
                                $('.addToCart').attr('disabled',false).removeClass('is-disabled');
                            }
                        }else{
                            $('.addToCart').attr('disabled',true).removeClass('is-disabled');
                            if(isPurchasableState){
                                $('.addToCart').attr('disabled',false).removeClass('is-disabled');
                            }
                        }
                        window.removePageLoader();
                    }
                });
        }else{
             if(isPersonalize){
                    $('.addToCart').html('Personalize').addClass('personalize').removeAttr('id');
                    if(isPurchasableState){
                        $('.addToCart').attr('disabled',false).removeClass('is-disabled');
                    }
            }else{
                    if(isPurchasableState){
                        $('.addToCart').attr('disabled',false).removeClass('is-disabled');
                    }
            }
            window.removePageLoader();

        }
    }

    function triggerLogin(){
        $('.trigger-login').trigger('click');
        $('#cboxOverlay').show();
        $('#mz-quick-view-container').fadeOut(350);
        $('#mz-quick-view-container').empty();
    }

    var ProductView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-detail-custom',
        autoUpdate: ['quantity'],
        additionalEvents: {
            "change [data-mz-product-option]": "onOptionChange",
            //"blur [data-mz-product-option]": "onOptionChange",
            "click button#add-to-cart": "addToCart",
            "click .personalize":"personalizeProduct",
            "change [data-mz-value='quantity']": "onQuantityChange",
            // "keyup input[data-mz-value='quantity']": "onQuantityChange",
            "change .mz-productlable-options": "showOptionsList",
            "change .needslits":"configureSlitOption",
            "click .qtyplus":"increaseQty",
            "click #morelink":"moreDetail",
            "click .bundle-btn":"showBundle",
            "click .qtyminus":"decreaseQty"
        },moreDetail:function (e) {
            $('#tab1').prop('checked', true); 
            $('html, body').animate({
                    scrollTop: $("#description").offset().top-80
                }, 1000);  
        },showBundle:function () {
            $("body").css("overflow-y","hidden");
            $(".bundle-items-wrap-pdp").fadeIn();
        },increaseQty: function(e){

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
            }else{
                $qField.next().html('Minimum required quantity for purchase is '+this.model._minQty);
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
            $('[data-mz-product-option="'+id+'"]').css("display","inline-block");
            if($('[data-mz-product-option="'+me.model.get('OptionSelectedID')+'"]').length>0){
                            $(".selction-size-caption").hide();
                        }else{
                            $(".selction-size-caption").show();
                        }
            $('.sl-no-options').removeClass('show-no');
            $('[data-lbl-option="'+id+'"]').addClass("show-no");
        },
        personalizeProduct:function(e){
        	//check for 0 quantity, display error message
           
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
           	/** DnD Code  Start **/
            var me= this;
            var dndUrl = Hypr.getThemeSetting('dndEngineUrl');
            var dndEngineObj = new DNDEngine.DNDEngine(me.model,dndUrl);
            dndEngineObj.initialize();
            dndEngineObj.send();
            /** DnD Code  End **/

        },
        render: function () {
            var me = this,requiredOptions;
            var objj=me.model.getConfiguredOptions();
            if($(".delivery-date").length>1){
                $(".delivery-date").eq(0).remove();
            }
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
           //Enable Personalize
           if(window.personalizeBundleProducts.length>0){
                me.model.set('enablePersonalise', true);
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
            var extrasProductInfo = me.getSelectedExtrasInfo(objj);
            if(extrasProductInfo){me.model.set('extrasProductInfo',extrasProductInfo);}
            if(me.model.apiModel.data.price){
                me.model.attributes.price.attributes=me.model.apiModel.data.price;
            }
            /* Custom logic for Radio to Select */
            var option6Plus = _.filter(this.model.get("options").toJSON(), function(current) {
                return (current.values.length > 6);
            });
            if(option6Plus.length > 0) {
                this.model.set("option6plus", true);
            }
            this.renderConfigure();
            this.$('[data-mz-is-datepicker]').each(function (ix, dp) {
                $(dp).dateinput().css('color', Hypr.getThemeSetting('textColor')).on('change  blur', _.bind(me.onOptionChange, me));
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
                var estTime= window.timeNow || new Date();
                if(objj.length > 0){
                    id = objj[0].attributeFQN;
                    newValue = objj[0].value;
                    option = me.model.get('options').get(id);
                
                        if(me.model.get('productType')!=='Configurable' && option.get('attributeDetail').usageType ==='Extra' && option.get('attributeDetail').dataType==='ProductCode'){
                            window.isStd=false;
                            Api.get('product',{productCode:newValue}).then(function(res){
                                var product = new ProductModels.Product(res.data);
                                var uom = getPropteryValueByAttributeFQN(product, productAttributes.unitOfMeasure);
                                if(uom){
                                    me.model.set('uom',uom);
                                }
                                var inventoryInfo = product.get('inventoryInfo');
                                if(inventoryInfo.manageStock) {
                                    me.model.set('inventoryInfo',inventoryInfo);
                                }
                                var productionTime = getPropteryValueByAttributeFQN(product, productAttributes.productionTime);
                                if(productionTime ===null || productionTime===0){
                                    productionTime=1;
                                }
                                var melt=true;
                                var melt_obj=getPropteryValueByAttributeFQN(me.model, productAttributes.productMelt);
                                if(melt_obj===null){
                                    melt=false;
                                }else if(melt_obj===false){
                                    melt=false;
                                }
                                if(productionTime){
                                    me.model.set('productionTime',productionTime);
                                    me.model.set('data',productionTime);
                                    var holidays=window.holidayList || [];
                                    if(melt){
                                        me.calc_only_productionTime(estTime,productionTime,window.holidayList,me,me.calcMeltProduct);
                                    }else{
                                        me.skip_holidays(estTime,productionTime,window.holidayList,me,false);
                                    }
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
                        if(objj.length > 0){
                            window.isStd=false;
                                var selected_id = objj[0].attributeFQN;
                                var selected_newValue = objj[0].value;
                                var selected_option = me.model.get('options').get(id);
                                if(me.model.get('productType')==='CandyBar' && selected_option.get('attributeDetail').usageType ==="Option"){
                                    var productionTime = getPropteryValueByAttributeFQN(me.model, productAttributes.productionTime);
                                    var holidays=window.holidayList || [];
                                    if(productionTime===null || productionTime===0){
                                        productionTime=1;
                                    }
                                    if(selected_newValue==="cdyperw-option"){
                                        me.skip_holidays(estTime,productionTime,window.holidayList,me,false);
                                    }else{
                                        me.calc_only_productionTime(estTime,productionTime,window.holidayList,me,me.calcMeltProduct);
                                    }
                                }else if(me.model.get('productType')!=='CandyBar'){
                                     var productionTime1 = getPropteryValueByAttributeFQN(me.model, productAttributes.productionTime);
                                    var holidays1=window.holidayList || [];
                                    if(productionTime1===undefined || productionTime1===null || productionTime1===0){
                                        productionTime1=1;
                                    }
                                    me.skip_holidays(estTime,productionTime1,window.holidayList,me,false);
                                }
                        }
                        Backbone.MozuView.prototype.render.apply(me);
                    }
                }
                else{
                    Backbone.MozuView.prototype.render.apply(this);
                }

        },skip_holidays:function(date,noBusDays,holidays,scope_obj,isMelt){
            /*Function to skip saturday,sunday and holiday list and call the callback function
              With result date.
            */
            var produtionTime=noBusDays;
            if (noBusDays < 1 && !isMelt) {
                noBusDays=1;
                produtionTime=1;
            }
            var result_date=new Date(date);
            var addedDays = 0;
            noBusDays+=5;
            while (addedDays < noBusDays) {
                result_date.setDate(result_date.getDate()+1);
                if (result_date.getDay()<6 && result_date.getDay()!==0 && holidays.indexOf(result_date.getFullYear()+"-"+("0" + (result_date.getMonth() + 1)).slice(-2)+"-"+("0" + result_date.getDate()).slice(-2))==-1) {
                    ++addedDays;
                    if(addedDays===produtionTime+1){
                        var dateEndFormat="<sup>th</sup>";
                        if(result_date.getDate()<=3 || result_date.getDate()>=21 && window.dateFormatArr[result_date.getDate()%10]){
                         dateEndFormat="<sup>"+window.dateFormatArr[result_date.getDate()%10]+"</sup>";
                        }
                        var overDate=window.weekdayArr[result_date.getDay()]+", "+window.monthArr[result_date.getMonth()]+" "+result_date.getDate()+dateEndFormat;
                        scope_obj.model.set("overnightDate",overDate);
                    }else if(addedDays===produtionTime+2){
                        var expressEndFormat="<sup>th</sup>";
                        if(result_date.getDate()<=3 || result_date.getDate()>=21 && window.dateFormatArr[result_date.getDate()%10]){
                         expressEndFormat="<sup>"+window.dateFormatArr[result_date.getDate()%10]+"</sup>";
                        }
                        var expressDate=window.weekdayArr[result_date.getDay()]+", "+window.monthArr[result_date.getMonth()]+" "+result_date.getDate()+expressEndFormat;
                        scope_obj.model.set("expressDate",expressDate);
                    }else if(addedDays===produtionTime+5){
                        var stdEndFormat="<sup>th</sup>";
                        if(result_date.getDate()<=3 || result_date.getDate()>=21 && window.dateFormatArr[result_date.getDate()%10]){
                         stdEndFormat="<sup>"+window.dateFormatArr[result_date.getDate()%10]+"</sup>";
                        }
                        var stdDate=window.weekdayArr[result_date.getDay()]+", "+window.monthArr[result_date.getMonth()]+" "+result_date.getDate()+stdEndFormat;
                        scope_obj.model.set("delDate",stdDate);
                    }
                }
            }
             if(window.initload && $(".delivery-date").length===0 && window.isStd){
                setTimeout(function() {
                    var delivery_html="<span class='delivery-date'> <span>Get it by <strong>";
                    if(scope_obj.model.get("delDate")){
                        delivery_html=delivery_html+""+scope_obj.model.get("delDate")+"</strong>" +Hypr.getLabel('stdShippingWith')+ "</span> <br> ";
                        if(scope_obj.model.get("groundOnly")===undefined){
                            delivery_html=delivery_html+"<span>Get it by <strong>"+scope_obj.model.get("expressDate")+"</strong>" +Hypr.getLabel('expShippingWith')+ "</span> <br> Get it by <strong>"+scope_obj.model.get("overnightDate")+" </strong>" +Hypr.getLabel('ovrShippingWith')+ "<br> ";
                        }
                    }
                    $("#product-detail > p ").after(delivery_html);
                    if($(".delivery-date").length>1){
                        $(".delivery-date").eq(0).remove();
                    }
                },500);
             }
            /*result_date.setDate(result_date.getDate());
            //console.log("idx "+idx+" res "+result_date);
            var delDate=new Date(result_date);
            callback(delDate,noBusDays,holidays,scope_obj);*/
        }, onOptionChange: function (e) {
            return this.configure($(e.currentTarget));
        },calc_only_productionTime:function(date,noBusDays,holidays,scope_obj,callback){
            /*Function to skip saturday,sunday and holiday list and call the callback function
            With result date.
            */
            if (noBusDays < 1){
                noBusDays=1;
            }
            var result_date=new Date(date);
            var addedDays = 0;
            while (addedDays < noBusDays) {
                result_date.setDate(result_date.getDate()+1);
                if (result_date.getDay()<6 && result_date.getDay()!==0 && holidays.indexOf(result_date.getFullYear()+"-"+("0" + (result_date.getMonth() + 1)).slice(-2)+"-"+("0" + result_date.getDate()).slice(-2))==-1) {
                    ++addedDays;
                }
            }
            var delDate=new Date(result_date);
            callback(delDate,noBusDays,holidays,scope_obj);
        },calcMeltProduct:function (ddate,prod_time,holidayList,scope_obj,noOfDays){
            if(ddate.getDay()>=4){
                scope_obj.calc_only_productionTime(ddate,1,holidayList,scope_obj,scope_obj.calcMeltProduct);
            }else{
                 scope_obj.skip_holidays(ddate,0,holidayList,scope_obj,true);
                 //scope_obj.skip_holidays(ddate,2,holidayList,scope_obj,true,scope_obj.setExpressDeliveryDate,0);
            }
        },configure: function ($optionEl) {
            $('.mz-productdetail-addtocart').prop('disabled',true);
            var me= this;
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
                    }else{
                        $('.mz-productdetail-addtocart').prop('disabled',false);
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
                    //console.log(newValue);
                    if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                        option.set('value', newValue);
                    }
                }
            }else{
                option = this.model.get('options').get(productAttributes.outdoorbanner);
                if (option) {
                    newValue = oldValue.split('S')[0];
                    //console.log(newValue);
                    if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                        option.set('value', newValue);
                    }
                }
            }
        },
        addToCart: function () {
            var self= this;
            var $qField = $(self.el).find('[data-mz-value="quantity"]'),
            newQuantity = parseInt($qField.val(), 10),
            sku = "";

            //Bloomreach add to cart event
            if(this.model.attributes.variationProductCode !== undefined && this.model.attributes.variationProductCode !== 'undefined'){
              sku = this.model.attributes.variationProductCode;
            }
            if(BrTrk !== 'undefined' && BrTrk !== undefined){BrTrk.getTracker().logEvent('cart', 'click-add', {'prod_id': this.model.attributes.productCode , 'sku' : sku });}
            //end

            this.model.set('quantity',newQuantity);
            this.model.addToCart();
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
                    $.cookie('wishlistprouct','direct',{path:'/'});
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
                    $('html').removeClass('dnd-active-noscroll');
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
             Wishlist.initoWishlist(this.model);
            $.cookie('wishlistprouct', "",{path:'/'});
        },
        addToWishlistAfterLoginPersonalize: function(){
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
            self.model.addToCart();

            //google analytics event tracking for personalised products
            // if(typeof _gaq !== "undefined"){
            //   _gaq.push(['_trackEvent', 'shindigz', 'buy', 'addtocart']);
            // }
            //Bloomreach add to cart event
            var productUsage = this.model.attributes.productUsage,
                variationProductCode = this.model.attributes.variationProductCode,
                sku = "";

            if(variationProductCode !== 'undefined' && variationProductCode !== undefined){
              sku = variationProductCode;
            }

            if(BrTrk !== 'undefined' && BrTrk !== undefined){BrTrk.getTracker().logEvent('cart', 'click-add', {'prod_id': this.model.attributes.productCode , 'sku' : sku });}
            //end

        },
        AddToWishlistAfterPersonalize: function(data){
            var self= this;
                self.setOptionValues(data);
                if(data.quantity){
                    self.model.set('quantity', data.quantity);
                }
                self.addToWishlistWithDesgin();
        },
        afterRender: function() {
            var me = this;
            /** Code to get mfgPartNumber for extras product **/
            /*if(me.model.get('productUsage')==="Bundle" && me.model.get('bundledProducts').length>0){
                $('.addToCart').addClass('is-disabled').attr('disabled',true);
            }*/
            //greeting Card
            var selectgreetingCardVal =$('[data-mz-product-option="'+productAttributes.giantGreetingCardSize+'"]:checked').val();
            if(selectgreetingCardVal){
                $('[data-mz-product-option="'+productAttributes.optionalEnvelope+'"]').each(function(idx,ele){
                    var splitvalue = $(this).attr('value').split('_');
                    if(splitvalue.length>1){
                        if(splitvalue[0]!==selectgreetingCardVal && splitvalue[0].toLowerCase()!=='no'){
                            //me.model.get('options').get(productAttributes.optionalEnvelope).unset("value");
                            if(me.model.get("options").get("tenant~optional-envelope") && $(ele).is(":checked")){
                                me.model.get("options").get("tenant~optional-envelope").unset("value");
                            }
                            $(ele).parent().next("br").remove();
                            $(ele).parent().remove();
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
				//.addtocart is what's used in quickview, .mz-productdetail-addtocart is used on pdp
                    $('.addToCart').attr('data-tooltip',"Please select an option");
                    if(warnmessage && warnmessage!==""){
                        $('.mz-productdetail-addtocart').attr('data-tooltip',warnmessage);
                    }
                    if(me.model.get('OptionSelectedID') && me.model.get('OptionSelectedID')!==""){
                        $("select[mz-banner-type]").val(me.model.get('OptionSelectedID'));
                        $('select.mz-productoptions-option').hide();
                        if($('[data-mz-product-option="'+me.model.get('OptionSelectedID')+'"]').length>0){
                            $(".selction-size-caption").hide();
                        }else{
                            $(".selction-size-caption").show();
                        }
                        $('[data-mz-product-option="'+me.model.get('OptionSelectedID')+'"]').show();
                        $('.sl-no-options').removeClass('show-no');
                        $('[data-lbl-option="'+me.model.get('OptionSelectedID')+'"]').addClass("show-no");
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
                    /** If Product Type banner check options are selected or not **/
                    if($('.mz-productoptions-option:visible').val()!==undefined &&
                        $('.mz-productoptions-option:visible').val()!==""){
                        $('.personalize').prop('disabled', false);
                        $('.custom-qty input').prop('disabled', false);
                        $('.personalize').attr("title", "");
                    }else{
                        $('.personalize').prop('disabled', true);
                        $('.custom-qty input').prop('disabled', true);
                        $('.personalize').attr("title", "Please select a material and size above.");
                    }

             }
            
			// hides radio button if there is only one extra for specific attributeFQNs (may want to make this theme setting)
			if(this.$('[data-mz-product-option]').attr('usageType')==='Extra' && this.$('[data-mz-product-option]').length === 1 && (this.$('[data-mz-product-option]').attr('name') === "tenant~misc.-favor-with-design" || this.$('[data-mz-product-option]').attr('name') === "tenant~table-top-it-runner-size")) {
                if(this.$('[data-mz-product-option]').find('option').length === 0){
                    this.$('[data-mz-product-option]').parents('form').hide();
                    this.$('[data-mz-product-option]').parents('.mz-productoptions-container').hide();
                }
            }

            /*if(this.model.get('productUsage')==='Bundle'){
                $('.addToCart').attr('disabled',true).addClass('is-disabled');
                if($('.bundleItemDndCode').length > 0 ){
                    $('.addToCart').html('Personalize').addClass('personalize').removeAttr('id').removeAttr('disabled').removeClass('is-disabled');
                }
            }*/

            if(me.model.get('productType')==='CandyBar'){
                var selectOptonVal = $('[data-mz-product-option="tenant~cdyper-choice"]:checked').val();
                if(selectOptonVal!==undefined && selectOptonVal.toLowerCase()=="cdyperw-option"){
                    $('[data-mz-product-option="tenant~pcdypcb"]').addClass("hide");
                }else if(selectOptonVal!==undefined){
                    $('[data-mz-product-option="tenant~pcdypcb"]').removeClass("hide");
                }
            /** Product Typ candbar check options are selected or not **/
            
                if(selectOptonVal!==undefined && selectOptonVal.toLowerCase()!=="cdyperw-option"){ 
                    if(me.model.get('purchasableState').isPurchasable && (($("[data-mz-product-option='tenant~pcdypcb']").length > 0 && typeof $("[data-mz-product-option='tenant~pcdypcb']").val()!== "undefined" && $("[data-mz-product-option='tenant~pcdypcb']").val()!=="") || $("[data-mz-product-option='tenant~pcdypcb']").length === 0)) {
                        $('.personalize').prop('disabled', false);
                        $('.custom-qty input').prop('disabled', false);
                        $('.personalize').attr('title', "");
                    }else{ 
                        $('.personalize').prop('disabled', true);
                        $('.custom-qty input').prop('disabled', true);
                        $('.personalize').attr('title', "Please select an option above.");
                    }
                }
            }



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
            PowerReviews.writeProductListBoxes();

           /*$('.custom-qty input[data-mz-value="quantity"]').bind('change keyup keypress',function(){
                $('.custom-qty input[data-mz-value="quantity"]').trigger('change');
                console.log("test");
            });*/

            $(".custom-qty").children(".qtyminus,.qtyplus").css({"background-color":"transparent","fonts-size":"1rem"});

            $('#addThis-conainer').attr('data-url', window.location.origin + $('#addThis-conainer').attr('data-url'));
        },
        initialize: function () {
            // handle preset selects, etc
            var me = this;
            this.on('render', this.afterRender);
            var options = this.model.get('options');
            this.model.set("minQty",this.model._minQty);
            //me.setSelectedOptions();

            var requestConfigure = {"url":require.mozuData("pagecontext").secureHost+"/api/content/documentlists/UPSholidayList@shindigz/views/holidayView/documents/?responseFields=items(properties(holiday))","iframeTransportUrl":require.mozuData("pagecontext").secureHost+"/receiver?receiverVersion=2"};
            var localStorageSupport=false;
            window.holidayList=[];
             try {
                localStorageSupport= 'localStorage' in window && window.localStorage !== null;
              } catch (e) {
                localStorageSupport= false;
              }
              
            //Read UTC time from server and reset 4 hours to convert as EST.
            var tmp= new Date($('#time-custom-now').text().replace(/"/g, ''));
            tmp.setHours(tmp.getHours()-4);
            window.timeNow=new Date(tmp);
            var estTime= window.timeNow || new Date();
            var unix_timestamp = Math.round(+tmp/1000);

            var prodTime=1;
            var prod_obj=_.findWhere(require.mozuData("product").properties,{'attributeFQN':productAttributes.productionTime});
            var melt=false;
            var melt_obj=_.findWhere(require.mozuData("product").properties,{'attributeFQN':productAttributes.productMelt});
            if(melt_obj){
                melt=melt_obj.values[0].value;
            }
            var extraHide=getPropteryValueByAttributeFQN(this.model, 'tenant~extrastohide');
            var optionsInDND=false;
            if(extraHide!==null && prod_obj!==undefined){
               optionsInDND=true;
            }
            //Check if product only need to ship via ground if yes then hide express and overnight dates
            var is_safety_d=_.findWhere(require.mozuData("product").properties,{'attributeFQN':productAttributes.groundOnly});
            var is_safety_k=_.findWhere(require.mozuData("product").properties,{'attributeFQN':productAttributes.usa48});
            if(is_safety_d !==undefined && is_safety_d.values[0].value){
                me.model.set("groundOnly",true);
            }else if(is_safety_k !==undefined && is_safety_k.values[0].value){
                me.model.set("groundOnly",true);
            }

            try{
                //Check if holiday list is already available in Local Storage(LS) and expire stamp is less then current time then read holiday list form LS and process else make api call.
              if(localStorageSupport && localStorage.getItem("hdList") && JSON.parse(localStorage.getItem("hdList")).expire > unix_timestamp){
                 window.holidayList=JSON.parse(localStorage.getItem("hdList")).value;
                  if(prod_obj){
                    prodTime=prod_obj.values[0].value;
                    if(prodTime>0){
                        me.model.set('productionTime',prodTime);
                        me.model.set('data',prodTime);
                    }
                        if((this.model.get("productUsage")==="Standard" && this.model.get("options").length===0) || optionsInDND){
                            if(melt){
                                me.calc_only_productionTime(estTime,prodTime,window.holidayList,me,me.calcMeltProduct);
                            }else{
                                me.skip_holidays(estTime,prodTime,window.holidayList,me,false);
                            }
                        }else if(this.model.get("productUsage")==="Standard" && this.model.get("options").length===1 && _.findWhere(require.mozuData("product").options,{'attributeFQN':productAttributes.dndToken}) !==undefined ){
                            if(melt){ 
                                me.calc_only_productionTime(estTime,prodTime,window.holidayList,me,me.calcMeltProduct);
                            }else{
                                me.skip_holidays(estTime,prodTime,window.holidayList,me,false);
                            }
                        }else if(this.model.get("productUsage")==="Standard" && this.model.get("options").length===2 && _.findWhere(require.mozuData("product").options,{'attributeFQN':productAttributes.dndToken}) !==undefined){
                            var idx1=-1;
                            me.model.get("options").toJSON().forEach(function(option,i) {
                               if(option.attributeFQN.toLowerCase()==="tenant~dnd-token"){
                                idx1=i;
                               } 
                            });
                            if(idx1>-1){
                                var opt1=me.model.get("options").toJSON();
                                delete opt1[idx1];
                                opt1.splice(idx1,1);
                                if(opt1[0].values.length===1){
                                    if(melt){ 
                                        me.calc_only_productionTime(estTime,prodTime,window.holidayList,me,me.calcMeltProduct);
                                    }else{
                                        me.skip_holidays(estTime,prodTime,window.holidayList,me,false);
                                    }
                                }
                            }
                        }else if(this.model.get("productUsage")==="Bundle"){
                            if(melt){ 
                                me.calc_only_productionTime(estTime,prodTime,window.holidayList,me,me.calcMeltProduct);
                            }else{
                                me.skip_holidays(estTime,prodTime,window.holidayList,me,false);
                            }
                        }
                    }else if(this.model.get("productUsage")==="Standard" && this.model.get("options").length===0){
                        if(melt){ 
                            me.calc_only_productionTime(estTime,prodTime,window.holidayList,me,me.calcMeltProduct);
                        }else{
                            me.skip_holidays(estTime,prodTime,window.holidayList,me,false);
                        }
                    }else if(this.model.get("productUsage")==="Standard" && this.model.get("options").length===1 && _.findWhere(require.mozuData("product").options,{'attributeFQN':productAttributes.dndToken}) !==undefined ){
                        if(melt){ 
                            me.calc_only_productionTime(estTime,prodTime,window.holidayList,me,me.calcMeltProduct);
                        }else{
                            me.skip_holidays(estTime,prodTime,window.holidayList,me,false);
                        }
                    }else if(this.model.get("productUsage")==="Standard" && this.model.get("options").length===2 && _.findWhere(require.mozuData("product").options,{'attributeFQN':productAttributes.dndToken}) !==undefined){
                        var idx=-1;
                        me.model.get("options").toJSON().forEach(function(option,i) {
                           if(option.attributeFQN.toLowerCase()==="tenant~dnd-token"){
                            idx=i;
                           } 
                        });
                        if(idx>-1){
                            var opt=me.model.get("options").toJSON();
                            delete opt[idx];
                            opt.splice(idx,1);
                            if(opt[0].values.length===1){
                                if(melt){ 
                                    me.calc_only_productionTime(estTime,prodTime,window.holidayList,me,me.calcMeltProduct);
                                }else{
                                    me.skip_holidays(estTime,prodTime,window.holidayList,me,false);
                                }
                            }
                        }
                    }
              }else{
                    //Get holiday list from custom document and store in local storeage with expire time.
                     Api.request('GET',requestConfigure).then(function(res){
                         window.holidayList=_.pluck(_.pluck(res.items,"properties"),"holiday");
                         var current_time=window.timeNow || new Date();
                          if(localStorageSupport){
                            tmp.setDate(tmp.getDate()+1);
                            var cacheData={value: window.holidayList,"expire":Math.round(+tmp/1000)};
                                localStorage.setItem("hdList",JSON.stringify(cacheData));
                            }
                            window.initload=true;
                            window.isStd=true;
                            if(prod_obj){
                            prodTime=prod_obj.values[0].value;
                                if(prodTime>0){
                                    me.model.set('productionTime',prodTime);
                                    me.model.set('data',prodTime);
                                }
                                if((me.model.get("productUsage")==="Standard" && me.model.get("options").length===0)||optionsInDND){
                                    if(melt){ 
                                        me.calc_only_productionTime(current_time,prodTime,window.holidayList,me,me.calcMeltProduct);
                                    }else{
                                        me.skip_holidays(current_time,prodTime,window.holidayList,me,false);
                                    }
                                }else if(me.model.get("productUsage")==="Standard" && me.model.get("options").length===1 && _.findWhere(require.mozuData("product").options,{'attributeFQN':productAttributes.dndToken}) !==undefined ){
                                    if(melt){ 
                                        me.calc_only_productionTime(current_time,prodTime,window.holidayList,me,me.calcMeltProduct);
                                    }else{
                                       me.skip_holidays(current_time,prodTime,window.holidayList,me,false);
                                    }
                                }else if(me.model.get("productUsage")==="Standard" && me.model.get("options").length===2 && _.findWhere(require.mozuData("product").options,{'attributeFQN':productAttributes.dndToken}) !==undefined){
                                    var idx1=-1;
                                    me.model.get("options").toJSON().forEach(function(option,i) {
                                       if(option.attributeFQN.toLowerCase()==="tenant~dnd-token"){
                                        idx1=i;
                                       } 
                                    });
                                    if(idx1>-1){
                                        var opt1=me.model.get("options").toJSON();
                                        delete opt1[idx1];
                                        opt1.splice(idx1,1);
                                        if(opt1[0].values.length===1){
                                            if(melt){ 
                                                me.calc_only_productionTime(current_time,prodTime,window.holidayList,me,me.calcMeltProduct);
                                            }else{
                                                me.skip_holidays(current_time,prodTime,window.holidayList,me,false);
                                            }
                                        }
                                    }
                                }else if(me.model.get("productUsage")==="Bundle"){
                                    if(melt){ 
                                            me.calc_only_productionTime(current_time,prodTime,window.holidayList,me,me.calcMeltProduct);
                                        }else{
                                            me.skip_holidays(current_time,prodTime,window.holidayList,me,false);
                                        }
                                }
                            }else if(me.model.get("productUsage")==="Standard" && me.model.get("options").length===0){
                                if(melt){
                                    me.calc_only_productionTime(current_time,prodTime,window.holidayList,me,me.calcMeltProduct);
                                }else{
                                    me.skip_holidays(current_time,prodTime,window.holidayList,me,false);
                                }
                            }else if(me.model.get("productUsage")==="Standard" && me.model.get("options").length===1 && _.findWhere(require.mozuData("product").options,{'attributeFQN':productAttributes.dndToken}) !==undefined ){
                                if(melt){ 
                                    me.calc_only_productionTime(current_time,prodTime,window.holidayList,me,me.calcMeltProduct);
                                }else{
                                    me.skip_holidays(current_time,prodTime,window.holidayList,me,false);
                                }
                            }else if(me.model.get("productUsage")==="Standard" && this.model.get("options").length===2 && _.findWhere(require.mozuData("product").options,{'attributeFQN':productAttributes.dndToken}) !==undefined){
                                var idx=-1;
                                me.model.get("options").toJSON().forEach(function(option,i) {
                                   if(option.attributeFQN.toLowerCase()==="tenant~dnd-token"){
                                    idx=i;
                                   } 
                                });
                                if(idx>-1){
                                    var opt=me.model.get("options").toJSON();
                                    delete opt[idx];
                                    opt.splice(idx,1);
                                    if(opt[0].values.length===1){
                                        if(melt){ 
                                            me.calc_only_productionTime(current_time,prodTime,window.holidayList,me,me.calcMeltProduct);
                                        }else{
                                            me.skip_holidays(current_time,prodTime,window.holidayList,me,false);
                                        }
                                    }
                                }
                            }else if(me.model.get("productUsage")==="Bundle"){
                                if(melt){ 
                                    me.calc_only_productionTime(current_time,prodTime,window.holidayList,me,me.calcMeltProduct);
                                }else{
                                    me.skip_holidays(current_time,prodTime,window.holidayList,me,false);
                                }
                            }
                    },function(err) {
                        console.log("Error in reading holidays",err);
                    });
                }
            }catch(err){
                console.log(err);    
            }
           

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
                // if there is only one extra, select it
					   if(optionModels[i].get('attributeDetail').usageType==='Extra' && optionModels[i].get('attributeDetail').dataType==='ProductCode'){
                             if(optionModels[i].get('values').length===1){
                                optionModels[i].set('value', optionModels[i].get('values')[0].value);
                             }
                        }
                    }
            }
        }
    });


    $(document).ready(function () {
      
        try{
            $('.enable-slideshow').cycle();
            //console.log("cycle  started");
        }catch(err){
            console.log(err);
        }

        var warnmessage = $('.mz-productdetail-notpurchasable').text().trim();
        $('.mz-productdetail-addtocart').attr('data-tooltip',warnmessage);
        var product = ProductModels.Product.fromCurrent();
        isPurchasableState = product.get('purchasableState').isPurchasable;
        
        var BundleSections = $('.bundle-block').find('[productcode]');

        BundleSections.each(function(){
            if($(this).find('input[name="productUsage"]').length===0){
                BundleItems.push($(this).attr('productCode'));
            }else{
                standardProducts.push($(this).attr('productCode'));
            }
        });
        //console.log(BundleItems);
        if(standardProducts.length > 0 || BundleItems.length>0){
            window.showPageLoader();
            getStandardProductDetails(standardProducts);
        }
        /*var options = product.get('options').toJSON();
        var extrasProductCodes = [];
        for(var ind =0 ; ind < options.length; ind++){
            if(options[ind].attributeDetail.usageType==='Extra' && options[ind].attributeDetail.dataType==='ProductCode'){
                for(var ind1=0; ind1 < options[ind].values.length; ind1++){
                    extrasProductCodes.push(options[ind].values[ind1].value);
                }
            }
        }*/
        //if(extrasProductCodes.length>0){
            getExtrasProductDetails(product);
        //}
        var shipping = $('#tab-content4 .mz-cms-content').html();
        $('.shipping-content').html(shipping);
        $('.bundle-comp-pdp-section .show-cmp-bundle').click(function(e){
            $(this).toggleClass("active");
            if($(this).hasClass("active")){
                $(this).find("span").text("Hide Components");
            }else{
                $(this).find("span").text("Show Components");
            }
            $('.bundle-comp-pdp-section .bundle-block').slideToggle();
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
        window.monthArr=["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
        window.weekdayArr=[  'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        window.dateFormatArr=["th","st","nd","rd"];
    });

});
