require(["modules/jquery-mozu", "underscore", "hyprlive", "modules/api", "modules/backbone-mozu", "modules/cart-monitor", "modules/models-product", /* "modules/views-productimages",*/ "modules/soft-cart", 'modules/added-to-cart', "modules/powerreviews", "vendor/wishlist", "hyprlivecontext","pages/dndengine","modules/shared-product-info"],
function ($, _, Hypr, Api, Backbone, CartMonitor, ProductModels, /*ProductImageViews, */ SoftCart,  addedToCart, PowerReviews, Wishlist, HyprLiveContext, DNDEngine, SharedProductInfo) {
    Hypr.engine.setFilter("contains",function(obj,k){ 
        return obj.indexOf(k) > -1;
    });

    /** Global variables for Banner Types **/
    var bannerProductTypes = Hypr.getThemeSetting('bannerProductTypes');
    var bannerProductsArr = bannerProductTypes.split(',');

    var productAttributes = Hypr.getThemeSetting('productAttributes');

	//var loopcounter=0;
   // var BundleItems=[];
    //var standardProducts=[];
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
		console.log("initProductView");
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
                 if(typeof pintrk !== "undefined"){
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
                if(typeof addthis !== "undefined"){
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
        }); // this calls productView.initialize;
	/*	
        var productImagesView = new ProductImageViews.ProductPageImagesView({
            el: $('[data-mz-productimages]'),
            model: product
        });
*/
        productView.render();
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
    var triggerLogin = function(){
        $('.trigger-login').trigger('click');
        $('#cboxOverlay').show();
        $('#mz-quick-view-container').fadeOut(350);
        $('#mz-quick-view-container').empty();
    };

    var ProductView = Backbone.MozuView.extend({
		holidayList: null, // set in this.getHolidays() ShippingholidayList@shindigz
		UPSholidayList: null, //UPSholidayList@shindigz
		noCalcDelDate: false,  //if true, holidayList & UPSholidayList won't be loaded and delivery/ship dates won't be calculated (will be used for quickview)
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
			console.log("moreDetail");
            $('#tab1').prop('checked', true); 
            $('html, body').animate({
                    scrollTop: $("#description").offset().top-80
                }, 1000);  
        },showBundle:function () {
			console.log("showBundle");
            $("body").css("overflow-y","hidden");
            $(".bundle-items-wrap-pdp").fadeIn();
        },increaseQty: function(e){
			console.log("increaseQty");
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
			console.log("decreaseQty");
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
			console.log("onQuantityChange");
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
			console.log("showOptionsList");
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
			console.log("personalizeProduct");
        	//check for 0 quantity, display error message
           
           var $qField = $(e.currentTarget).parent().parent().find('[data-mz-value="quantity"]'),
           newQuantity = parseInt($qField.val(), 10);
            if(newQuantity < this.model._minQty){
                $('[data-mz-validationmessage-for="quantity"]').html("Quantity should be more than minimum quantity: "+this.model._minQty);
                return false;
            }
           	/** DnD Code  Start **/
            var me= this;
            var dndUrl = Hypr.getThemeSetting('dndEngineUrl');
            var dndEngineObj = new DNDEngine.DNDEngine(me.model,dndUrl,me);
            dndEngineObj.initializeAndSend();
            /** DnD Code  End **/

        },
        render: function () {
			console.log("render");
			if(!this.noCalcDelDate){ // we don't need to load holiday lists for shipdate calculations for quickview
				this.getHolidays(this.render.bind(this));
				if(!this.holidayList){
					return; // this.render() will be called again once api call to get holiday list completes
				}

				this.getUPSHolidays(this.render.bind(this));
				if(!this.UPSholidayList){
					return; // this.render() will be called again once api call to get UPSholiday list completes
				}
			}
			
			this.setIsPersonalized();
			this.setAllowATC();
			
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
/*        getExtraTitle: function(productCode){
			console.log("getExtraTitle");
            var extraTitle=null;
            if(SharedProductInfo.products.length>0){
                for(var i=0;i<SharedProductInfo.products.length;i++){
                    if(SharedProductInfo.products[i].productCode===productCode){
                        extraTitle = SharedProductInfo.products[i].optionTitle;
						console.log(extraTitle);
                        break;
                    }
                }
            }
            return extraTitle;
        },
        setOptionTitle: function(){
			console.log("setOptionTitle");
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
        }, */
        hideOptions: function(){
			console.log("hideOptions");
            var options = this.model.get('options'); // includes extras and configurable options
            var extrasToHide = getPropteryValueByAttributeFQN(this.model, 'tenant~extrastohide');
            var extrastohideArr = [];
            if(extrasToHide && extrasToHide!==""){
                extrastohideArr = extrasToHide.toLowerCase().split(',');
            }
            for(var i=0; i< options.length;i++){
				var option = options.models[i];
                var attributeCode = option.get('attributeFQN').split('~');
                if(extrastohideArr.indexOf(attributeCode[1]) > -1){
					option.set('isOptionForDND',true);
                	option.set('isVisibleOption',false); // hide extras in extrastohide list
                }
				else if(option.get('attributeFQN')===productAttributes.dndToken){
					option.set('isOptionForDND',true);
					option.set('isVisibleOption',false); // hide dndtoken
				}
				else if(option.get('attributeDetail').usageType==='Extra' && option.get('attributeDetail').dataType==='ProductCode' && (option.get('attributeFQN') === "tenant~misc.-favor-with-design" || option.get('attributeFQN') === "tenant~table-top-it-runner-size")) {
					option.set('isOptionForDND',false);
					option.set('isVisibleOption',false); // hide extras used for inventory only of design items
				}
				else{
					option.set('isOptionForDND',false);
					option.set('isVisibleOption',true);
				}
            }
        },
        renderConfigure: function(){
			console.log("renderConfigure");
                var  me = this, id, newValue,option;//,dndCode,mfgPartNumber,mcCode;
                var objj=me.model.getConfiguredOptions();
                //me.setOptionTitle();
                me.model.set('minQty', me.model._minQty);
			
				var childProductionTime;
				var productionTime = getPropteryValueByAttributeFQN(me.model, productAttributes.productionTime);
			
				var melt=true;
				var melt_obj=getPropteryValueByAttributeFQN(me.model, productAttributes.productMelt);
				if(melt_obj===null){
					melt=false;
				}else if(melt_obj===false){
					melt=false;
				}
				var mfgpartnumber = me.model.get('mfgPartNumber');
				var uom = getPropteryValueByAttributeFQN(me.model, productAttributes.unitOfMeasure);
			
				// we are making the assumption that if a bundle has components with production time that the parent already reflects the production time of the component with the longest time
			
                if(objj.length > 0){
					for(var i=0;i < objj.length;i++){
						newValue = objj[i].value;
						id = objj[i].attributeFQN;
						option = me.model.get('options').get(id);

						if(me.model.get('productUsage')!=='Configurable' && option.get('attributeDetail').usageType ==='Extra' && option.get('attributeDetail').dataType==='ProductCode'){
							console.log(newValue);
							var product = SharedProductInfo.getExtraProduct(newValue,me.render.bind(me)); // me.render() will be called again if product needs to be retrieved still via api
							if(product){
								if(me.model.get('productUsage')!=='Bundle' & !(mfgpartnumber && mfgpartnumber.length > 0)){
									// don't look at uom of extras if parent is bundle (ex. punch game is each but tissue paper prompt options are pkg/8 - we want to keep each as uom) or if parent has mfgpartnumber (ex. CASCPC)
									var childuom = getPropteryValueByAttributeFQN(product, productAttributes.unitOfMeasure);
									if(childuom && !(uom && uom.length > 0)){
										uom = childuom;
									}
								}
							// use the greater of the 2 production times (parent vs extra)
                                childProductionTime = getPropteryValueByAttributeFQN(product, productAttributes.productionTime);
                                if(productionTime && childProductionTime){
									productionTime = Math.max(productionTime,childProductionTime);
								}
								else if(childProductionTime){
									productionTime = childProductionTime;
								}
							}
							else{
								return; // exit b/c getExtraProduct is making api call to get product info now
							}
						}else if(option.get('attributeDetail').usageType === "Option"){
                            //window.isStd=false; // not sure what this is for
							if(me.model.get('productType')==='CandyBar'){
								if(newValue==="cdyperw-option"){
									melt = false;
								}else{
									melt = true;
								}
							}
                    	}
					} // end loop
                }
			
				// make sure dnd-token have value if set to required
				option = me.model.get('options').get(productAttributes.dndToken);
				if(option && option.get('isRequired') && !option.get('value')){
					 // dnd-token shouldn't be required but in case it is, give it a dummy value so that it passes validation
					 option.set('value','PLACEHOLDER'); // fires this.render
					 return; // exit so we don't call render multiple times
				}
			
				if(me.model.get('baseIsConfigured')){ // don't show delivery dates if baseIsConfigured is false b/c we could show inaccurate information based on where productionTime is stored on a product (ex. banner doesn't have productionTime on parent, just on the extras and if no extras are selected yet, we could show a date too early)
					if(productionTime){
						me.model.set('productionTime',productionTime);
						if(!this.noCalcDelDate){ // we don't need to calculate these on quickview
							if(melt){
								me.calc_only_productionTime(this.timeNow,productionTime);
							}else{
								me.skip_holidays(this.timeNow,productionTime,false);
							}
						}
					}
					else{
						if(!this.noCalcDelDate){ // we don't need to calculate these on quickview
							if(melt){
								me.calc_only_productionTime(this.timeNow,0);
							}else{
								me.skip_holidays(this.timeNow,0,false);
							}
						}
					}
				} // on
			
				if(uom)
					me.model.set('uom',uom);
			
				// if we made it here, call render
				Backbone.MozuView.prototype.render.apply(me);

        },formatDateString:function(result_date){
			var shipDateEndFormat="<sup>th</sup>";
			var monthArr=["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
			var weekdayArr=[  'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
			var dateFormatArr=["th","st","nd","rd"];
			if(result_date.getUTCDate()<=3 || result_date.getUTCDate()>=21 && dateFormatArr[result_date.getUTCDate()%10]){
			 shipDateEndFormat="<sup>"+dateFormatArr[result_date.getUTCDate()%10]+"</sup>";
			}
			var shipDateStr=weekdayArr[result_date.getUTCDay()]+", "+monthArr[result_date.getUTCMonth()]+" "+result_date.getUTCDate()+shipDateEndFormat;
			return(shipDateStr);
			
		},skip_holidays:function(date,noBusDays,isMelt){ //Function to skip saturday,sunday and holidays
			console.log("skip_holidays");
			//console.log(isMelt+" "+noBusDays);
			//console.log(date);
			var holidays = this.holidayList;
			var UPSholidays = this.UPSholidayList;
			var me = this;
           
            if (productionTime < 1 && !isMelt) { // production time was already factored in for items that melt before calling this function
                productionTime=1;
            }
			var productionTime=noBusDays;
            var result_date=new Date(date);
            var addedDays = 0;
            noBusDays+=5; // add 5 since that's how many days we are using to calculate delDate (standard shipping is slowest)
			
			// this is for when isMelt = 1 and productionTime = 0 basically - notice we are comparing to holidays
			if (result_date.getUTCDay()<6 && result_date.getUTCDay()!==0 && holidays.indexOf(result_date.getFullYear()+"-"+("0" + (result_date.getUTCMonth() + 1)).slice(-2)+"-"+("0" + result_date.getUTCDate()).slice(-2))==-1 && productionTime===0){
				me.model.set("shipDate",me.formatDateString(result_date));
			}
			
            while (addedDays < noBusDays) {
                result_date = new Date(result_date.getTime()+24*60*60*1000); // add a day
				//console.log(result_date);
				//console.log(addedDays + " "+productionTime);
				if(addedDays < productionTime){
					// compare to holidays list & get shipdate
					if (result_date.getUTCDay()<6 && result_date.getUTCDay()!==0 && holidays.indexOf(result_date.getFullYear()+"-"+("0" + (result_date.getUTCMonth() + 1)).slice(-2)+"-"+("0" + result_date.getUTCDate()).slice(-2))==-1) {
						++addedDays;
						if(addedDays===productionTime){
							me.model.set("shipDate",me.formatDateString(result_date));
						}
					}
				}
				else{
					// compare to UPSholidays list & get delivery dates
					if (result_date.getUTCDay()<6 && result_date.getUTCDay()!==0 && UPSholidays.indexOf(result_date.getFullYear()+"-"+("0" + (result_date.getUTCMonth() + 1)).slice(-2)+"-"+("0" + result_date.getUTCDate()).slice(-2))==-1) { 
						++addedDays;
						if(addedDays===productionTime+1){
							// 1 day for overnight
							me.model.set("overnightDate",me.formatDateString(result_date));
						}else if(addedDays===productionTime+2){
							// 3 days for express
							me.model.set("expressDate",me.formatDateString(result_date));
						}
						if((!isMelt && addedDays===productionTime+5) ||(isMelt && addedDays===productionTime+2)){ // if it melts, we'll ship it 2 day even if they select Ground since we only ship M-W
							// 5 days for standard
							me.model.set("delDate",me.formatDateString(result_date));
						}
						
					}
				}
            }
			/* not sure what this is for...
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
             }*/
        }, onOptionChange: function (e) {
			console.log("onOptionChange");
            return this.configure($(e.currentTarget)); //fires this.render
        },calc_only_productionTime:function(date,noBusDays){
			console.log("calc_only_productionTime");
            /*Function to skip saturday,sunday and holiday list and call the callback function
            With result date.
            */
			var holidays = this.holidayList;
            if (noBusDays < 1){
                noBusDays=1; // no same-day shipping
            }
			console.log(noBusDays);
            var result_date=new Date(date);
            var addedDays = 0;
            while (addedDays < noBusDays) {
				result_date = new Date(result_date.getTime()+24*60*60*1000); 
                if (result_date.getUTCDay()<6 && result_date.getUTCDay()!==0 && holidays.indexOf(result_date.getFullYear()+"-"+("0" + (result_date.getUTCMonth() + 1)).slice(-2)+"-"+("0" + result_date.getDate()).slice(-2))==-1) {
                    ++addedDays;
					console.log(result_date);
                }
				else{
					console.log(result_date);
					console.log("add another day...");
				}
            }
            var delDate=new Date(result_date);
            this.calcMeltProduct(delDate,noBusDays,holidays);
        },calcMeltProduct:function (ddate,prod_time,noOfDays){
			console.log("calcMeltProduct");
			console.log(ddate);
            if(ddate.getUTCDay()>=4){
                this.calc_only_productionTime(ddate,1);
            }else{
                this.skip_holidays(ddate,0,true);
            }
        },configure: function ($optionEl) {
			console.log("configure");

            var me= this;
            //me.model.set('mfgPartNumber',"");
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

            if(option) {
                if (option.get('attributeDetail').inputType === "YesNo") {
                    option.set("value", isPicked); // fires this.render() (?);
                } else if (isPicked) {
                    oldValue = option.get('value');
                    if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                        option.set('value', newValue); // fires this.render();
                    }
                }
            }
        },
        configureSlitOption: function (e) {
			console.log("configureSlitOption");
            var newValue = '',
                me=this,
                oldValue,
                id = $(e.currentTarget).is(':checked')?productAttributes.outdoorbanner:productAttributes.outdoorbannerslits,
                self=this,
                option = this.model.get('options').get(id);
                //me.model.set('mfgPartNumber',"");
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
                    if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                        option.set('value', newValue);
                    }
                }
            }
        },
        addToCart: function () {
			console.log("addToCart");
            var self= this;
            var $qField = $(self.el).find('[data-mz-value="quantity"]'),
            newQuantity = parseInt($qField.val(), 10),
            sku = "";

            //Bloomreach add to cart event
            if(this.model.attributes.variationProductCode !== undefined && this.model.attributes.variationProductCode !== 'undefined'){
              sku = this.model.attributes.variationProductCode;
            }
            if(typeof BrTrk !== 'undefined'){BrTrk.getTracker().logEvent('cart', 'click-add', {'prod_id': this.model.attributes.productCode , 'sku' : sku });}
            //end

            this.model.set('quantity',newQuantity);
            this.model.addToCart();
        },
        addToWishlist: function () {
			console.log("addToWishlist");
            if(!require.mozuData('user').isAnonymous) {
                        this.model.set('moveToWishList', 1);
                        Wishlist.initoWishlist(this.model);
                }else {
                    var produtDetailToStoreInCookie ={};
                    produtDetailToStoreInCookie.productCode=this.model.get('productCode');
                     var objj=this.model.getConfiguredOptions();
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
			console.log("addToWishlistWithDesgin");
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
			console.log("addToWishlistAfterLogin");
             Wishlist.initoWishlist(this.model);
            $.cookie('wishlistprouct', "",{path:'/'});
        },
        addToWishlistAfterLoginPersonalize: function(){
			console.log("addToWishlistAfterLoginPersonalize");
            Wishlist.initoWishlistPersonalize(this.model);
            $.cookie('wishlistprouct', "",{path:'/'});
        },
        setSelectedOptions: function(){
			console.log("setSelectedOptions");
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
        setOptionValues: function(data){
		// applies extras that were chosen through dnd personalization
			console.log("setOptionValues");
            var options = this.model.get('options');
            var extraAttribute =  null;
            var extraJSON ={};
            if(data.extras){
                extraAttribute = JSON.parse(data.extras);
                for(var l = 0; l < extraAttribute.length; l++){
                    extraJSON['tenant~'+extraAttribute[l].attributeCode] = extraAttribute[l].value;
                }
            }
			//console.log(extraJSON);
            var payload={};
            payload.options=[];
            for(var i=0; i < options.length; i++){

                if(options.models[i].get('attributeFQN')===productAttributes.dndToken){
                    options.models[i].set('value',data.projectToken);
                    options.models[i].set('shopperEnteredValue',data.projectToken);
					console.log('dndtoken');
                }
                if(Object.keys(extraJSON).length>0 && extraJSON[options.models[i].get('attributeFQN').toLowerCase()]){
                    options.models[i].set('value',extraJSON[options.models[i].get('attributeFQN').toLowerCase()]);
                    options.models[i].set('shopperEnteredValue',extraJSON[options.models[i].get('attributeFQN').toLowerCase()]);
                }
            }
            this.model.set('options', options);
        },
        addToCartAfterPersonalize:function(data){ // used by dndengine.js
            var self= this;
            self.setOptionValues(data);
            if(data.quantity){
                self.model.set('quantity', data.quantity);
            }
            self.model.addToCart();

            //Bloomreach add to cart event
            var productUsage = this.model.attributes.productUsage,
                variationProductCode = this.model.attributes.variationProductCode,
                sku = "";

            if(variationProductCode !== 'undefined' && variationProductCode !== undefined){
              sku = variationProductCode;
            }

            if(typeof BrTrk !== 'undefined'){BrTrk.getTracker().logEvent('cart', 'click-add', {'prod_id': this.model.attributes.productCode , 'sku' : sku });}
            //end

        },
        AddToWishlistAfterPersonalize: function(data){ // used by dndengine.js
			console.log("AddToWishlistAfterPersonalize");
            var self= this;
                self.setOptionValues(data);
                if(data.quantity){
                    self.model.set('quantity', data.quantity);
                }
                self.addToWishlistWithDesgin();
        },
        afterRender: function() {
			console.log("afterRender");
            var me = this;
			
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

            /** Logics for banner product types **/
            if(bannerProductsArr.indexOf(me.model.get('productType')) > -1){
				//.addtocart is what's used in quickview, .mz-productdetail-addtocart is used on pdp
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

             }
            
			// hides radio button if there is only one extra for specific attributeFQNs (may want to make this theme setting)
			if(this.$('[data-mz-product-option]').attr('usageType')==='Extra' && this.$('[data-mz-product-option]').length === 1 && (this.$('[data-mz-product-option]').attr('name') === "tenant~misc.-favor-with-design" || this.$('[data-mz-product-option]').attr('name') === "tenant~table-top-it-runner-size")) {
                if(this.$('[data-mz-product-option]').find('option').length === 0){
                    this.$('[data-mz-product-option]').parents('form').hide();
                    this.$('[data-mz-product-option]').parents('.mz-productoptions-container').hide();
                }
            }

            if(me.model.get('productType')==='CandyBar'){
                var selectOptonVal = $('[data-mz-product-option="tenant~cdyper-choice"]:checked').val();
                if(selectOptonVal!==undefined && selectOptonVal.toLowerCase()=="cdyperw-option"){
                    $('[data-mz-product-option="tenant~pcdypcb"]').addClass("hide");
                }else if(selectOptonVal!==undefined){
                    $('[data-mz-product-option="tenant~pcdypcb"]').removeClass("hide");
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
		setIsPersonalized: function(){
		// asssumption - if a product has dnd-token extra, then it's personalized (personalization can be on parent or components or extras) - we only look at parent for dnd-token
			console.log("setIsPersonalized");
			this.model.set('isPersonalized',false);
			var options = this.model.get('options');
		 	for(var i=0; i < options.length; i++){
                if(options.models[i].get('attributeFQN')===productAttributes.dndToken){
                    this.model.set('isPersonalized',true);
					break;
                }
            }
			
		},
		setAllowATC: function(){
			console.log("setAllowATC");
			// sets model.isConfigured, model.isInStock, model.baseIsConfigured - if model.isConfigure==true  && model.isInstock==true, then allow add-to-cart action
			// isConfigured means it's fully configured and ready to add to cart or begin personalization
			// baseIsConfigured means a base product is selected but not necessarily all extras (if true, show delDate)
			
			this.hideOptions(); // sets isVisibleOption & isOptionForDND per option which is used below
			
			var options = this.model.get('options');
			var inc,l,option,isSelected,isInStock,values,inventoryInfo;
			var minqty = this.model._minQty;
			if(bannerProductsArr.indexOf(this.model.get('productType')) > -1){
				 // if it's a banner product type, make sure an extra is selected and it's in stock
				
				isSelected = false; // whether we have at least one extra selected
				isInStock = false;
				var hasSelectableExtras = false; // track whether there are actually extras to select (when an extra)
				if(options.length>0){
				   for(inc=0; inc<options.models.length; inc++){
						option = options.models[inc];
						if(option.get('attributeDetail').usageType==='Extra' &&
						   option.get('attributeDetail').dataType==='ProductCode'){

							values = option.get('values');
							for(l=0;l<values.length;l++){
								hasSelectableExtras = true;// has at least one selectable extra
								if(values[l].isSelected){
									isSelected = true;
									isInStock = false;
									inventoryInfo = values[l].bundledProduct.inventoryInfo;
									if(inventoryInfo && inventoryInfo.manageStock && inventoryInfo.onlineStockAvailable >= minqty){
										isInStock= true;
									}
									else if(inventoryInfo && ! inventoryInfo.manageStock){
										isInStock= true;
									}
									break; // exit values loop
								}
							}
						}
					}
				}
				
				if(!hasSelectableExtras){ // if no extras to select, mark entire product as out of stock
					this.model.set('isConfigured',true);
					this.model.set('baseIsConfigured',true);
					this.model.set('isInStock',false);
				}
				else if(isSelected && isInStock){
					this.model.set('isConfigured',true);
					this.model.set('baseIsConfigured',true);
					this.model.set('isInStock',true);
				}
				else if(!isSelected){
					this.model.set('isConfigured',false);
					this.model.set('baseIsConfigured',false);
					this.model.set('isInStock',true);
				}
				else if(isSelected && !isInStock){
					this.model.set('isConfigured',true);
					this.model.set('baseIsConfigured',true);
					this.model.set('isInStock',false);
				}
					
            }
			else{
				// not a banner type - see if we have required extras and configured options selected
				var configurableOptionsConfigured = true; // if all configurable options have a selection
				var requiredExtrasConfigured = true; // if all required extras have a selection
				var extrasInStock = true; // if all selected extras are in stock
				var productInventoryInfo = this.model.get('inventoryInfo'); // inventory info of parent - if this is configurable item, this will be info for variant selected
				var hasOptionsForDND = false;
				var purchasableState = this.model.get('purchasableState');
				
				if(options.length>0){
				   for(inc=0; inc<options.models.length; inc++){ // options includes both extras and configurable options
						option = options.models[inc];
						if(option.get('attributeDetail').usageType==='Extra' && option.get('attributeDetail').dataType==='ProductCode'){
							var isRequired = option.get('isRequired');
							var isVisibleOption = option.get('isVisibleOption'); // set in this.hideOptions()
							var isOptionForDND = option.get('isOptionForDND'); // set in this.hideOptions()
							if(isOptionForDND){
								hasOptionsForDND = true;
							}	
							isSelected = false; // whether this choice has a selection
							isInStock = false; // whether selected choice has stock, fail to start and set to pass if we find valid values
							values = option.get('values');
							for(l=0;l<values.length;l++){ // loop over values to see if we have any selected values and if they are in stock
								if(values[l].isSelected){
									isSelected = true;
									inventoryInfo = values[l].bundledProduct.inventoryInfo;
									if(inventoryInfo && inventoryInfo.manageStock && inventoryInfo.onlineStockAvailable >= minqty){
										isInStock= true;
									}
									else if(inventoryInfo && !inventoryInfo.manageStock){
										isInStock= true;
									}
									break; // exit values loop
								}
							}
							if(isSelected && !isInStock){
								extrasInStock = false;
							}
							if(isRequired && !isOptionForDND){ // if required and not a hidden option (tenant~extrastohide)
								if(!isSelected){
									extrasInStock = false;
									requiredExtrasConfigured = false;
								}
							}
						}
					   else if(option.get('attributeDetail').usageType==='Option'){
							isSelected = false; // set to true if we find one
							values = option.get('values');
							for(l=0;l<values.length;l++){
								if(values[l].isSelected){
									isSelected = true;
									break; // exit values loop
								}
							}
						   if(!isSelected){
							   configurableOptionsConfigured = false;
						   }
					   }
					}
				}
				
				if(configurableOptionsConfigured && requiredExtrasConfigured){
					this.model.set('isConfigured',true);
					this.model.set('baseIsConfigured',true);
					// if product itself is in stock and any required extras are selected, set allowATC to true
					if(purchasableState.isPurchasable){
						this.model.set('isInStock',true);
					}
					else if(hasOptionsForDND){
						// if hasOptionsForDND is true, purchasableState.isPurchasable will be false since those prompts are required and don't have a selection yet.  need to inspect inventory, potential flaw if all of the options for an extra that is in dnd is out of stock but not sure how to detect that... it will error after personalization
						if((productInventoryInfo && productInventoryInfo.manageStock && productInventoryInfo.onlineStockAvailable >= minqty) || (productInventoryInfo && !productInventoryInfo.manageStock)){
							if(extrasInStock){
								this.model.set('isInStock',true);
							}
							else{
								this.model.set('isInStock',false);
							}
						}
						else{
							this.model.set('atcHint',"Product is out of stock.");
						}
					}
					else{
						// this will catch scenarios where an extra is required but all options are out of stock - (you won't even see the option on the product but purchasableState.isPurchasable will be false since it doesn't pass validation)
						this.model.set('isInStock',false);
					}
				}
				else{
					var mfgpartnumber = this.model.get('mfgPartNumber');
					if(configurableOptionsConfigured && (this.model.get('productUsage')==='Bundle' ||  (mfgpartnumber && mfgpartnumber.length > 0))){
						this.model.set('baseIsConfigured',true);
					}
					else{
						this.model.set('baseIsConfigured',false);
					}
					this.model.set('isConfigured',false);
					this.model.set('isInStock',false);
				}
			}
		},
		getHolidays: function(callback){
			console.log("getHolidays");
			
			if(this.holidayList){
				return; // exit if it's already set
			}
			
		    var requestConfigure = {"url":require.mozuData("pagecontext").secureHost+"/api/content/documentlists/ShippingholidayList@shindigz/views/holidayView/documents/?responseFields=items(properties(holiday))","iframeTransportUrl":require.mozuData("pagecontext").secureHost+"/receiver?receiverVersion=2"};
            var localStorageSupport=false;
			try {
				localStorageSupport= 'localStorage' in window && window.localStorage !== null;
			} catch (e) {
				localStorageSupport= false;
			}
			
			var unix_timestamp = Math.round(this.timeNow/1000); // what we'll compare to expire value in localStorage
			var expire = new Date(this.timeNow.getTime()+24*60*60*1000); // add a day
			expire = Math.round(expire/1000); //what we'll store in localStorage to compare to next time
			
			try{
                //Check if holiday list is already available in Local Storage(LS) and expire stamp is less then current time then read holiday list form LS and process else make api call.
              if(localStorageSupport && localStorage.getItem("hdList") && JSON.parse(localStorage.getItem("hdList")).expire > unix_timestamp){
                 this.holidayList=JSON.parse(localStorage.getItem("hdList")).value;
              }else{
                    //Get holiday list from custom document and store in local storeage with expire time.
                     Api.request('GET',requestConfigure).then(function(res){
                         this.holidayList=_.pluck(_.pluck(res.items,"properties"),"holiday");
                          if(localStorageSupport){
                            var cacheData={value: this.holidayList,"expire":expire};
                               localStorage.setItem("hdList",JSON.stringify(cacheData));
                          }
						 callback();
						 
                    },function(err) {
                        console.log("Error in reading holidays",err);
                    });
                }
            }catch(err){
                console.log(err);
				this.holidayList = [];
            }
		},
		getUPSHolidays: function(callback){
			console.log("getUPSHolidays");
			if(this.UPSholidayList){
				return; // exit if it's already set
			}
		    var requestConfigure = {"url":require.mozuData("pagecontext").secureHost+"/api/content/documentlists/UPSholidayList@shindigz/views/holidayView/documents/?responseFields=items(properties(holiday))","iframeTransportUrl":require.mozuData("pagecontext").secureHost+"/receiver?receiverVersion=2"};
            var localStorageSupport=false;
			try {
				localStorageSupport= 'localStorage' in window && window.localStorage !== null;
			} catch (e) {
				localStorageSupport= false;
			}
			
			var unix_timestamp = Math.round(this.timeNow/1000); // what we'll compare to expire value in localStorage
			var expire = new Date(this.timeNow.getTime()+24*60*60*1000); // add a day
			expire = Math.round(expire/1000); //what we'll store in localStorage to compare to next time
			
			try{
                //Check if holiday list is already available in Local Storage(LS) and expire stamp is less then current time then read holiday list form LS and process else make api call.
              if(localStorageSupport && localStorage.getItem("UPShdList") && JSON.parse(localStorage.getItem("UPShdList")).expire > unix_timestamp  && JSON.parse(localStorage.getItem("UPShdList")).value){
                 this.UPSholidayList=JSON.parse(localStorage.getItem("UPShdList")).value;
              }else{
                    //Get holiday list from custom document and store in local storeage with expire time.
                     Api.request('GET',requestConfigure).then(function(res){
                         this.UPSholidayList=_.pluck(_.pluck(res.items,"properties"),"holiday");
                         if(localStorageSupport){
                            var cacheData={value: this.UPSholidayList,"expire":expire};
                            localStorage.setItem("UPShdList",JSON.stringify(cacheData));
                         }
						 callback();
						 
                    },function(err) {
                        console.log("Error in reading holidays",err);
                    });
                }
            }catch(err){
                console.log(err);
				this.UPSholidayList = [];
            }
		},
        initialize: function () {
			console.log("initialize");

			var estTime = new Date(); // time in UTC format
			estTime.setTime(estTime.getTime()-5*60*60*1000); //subtract difference from GMT to Eastern so that when you use getUTCDay, getUTCHours, (etc) it will reflect value in Eastern timezone
			this.timeNow=estTime;
			
            // handle preset selects, etc
            var me = this;
            this.on('render', this.afterRender);
            this.model.set("minQty",this.model._minQty);

            //Check if product only need to ship via ground if yes then hide express and overnight dates
            var is_safety_d=_.findWhere(require.mozuData("product").properties,{'attributeFQN':productAttributes.groundOnly});
            var is_safety_k=_.findWhere(require.mozuData("product").properties,{'attributeFQN':productAttributes.usa48});
            if(is_safety_d !==undefined && is_safety_d.values[0].value){
                me.model.set("groundOnly",true);
            }else if(is_safety_k !==undefined && is_safety_k.values[0].value){
                me.model.set("groundOnly",true);
            }

            var options = this.model.get('options');
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
		initProductView(product);
		
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
            //getExtrasProductDetails(product);
        //}
	
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
    });

});
