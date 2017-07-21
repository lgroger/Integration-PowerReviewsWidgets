/* globals V: true */
define(['modules/backbone-mozu', 'underscore', 'modules/jquery-mozu','modules/api', 
    'modules/models-cart', 'modules/cart-monitor', 'hyprlivecontext', 'modules/soft-cart', 
    'hyprlive', 'modules/preserve-element-through-render', 'modules/amazonPay', 
    'vendor/wishlist', 'pages/dndengine','modules/models-product'], 
function (Backbone, _, $, Api, CartModels, CartMonitor, HyprLiveContext, SoftCart,  Hypr, preserveElement, AmazonPay, Wishlist, DNDEngine, ProductModels) {
 var productAttributes = Hypr.getThemeSetting('productAttributes');  
       var idx;var ship_default;
       var ship_flag=false;
       window.extrasProducts=[];
   
    var CartView = Backbone.MozuView.extend({
        templateName: "modules/cart/cart-table",
        couponsData:{},
        initialize: function () {
            var me = this;

            //setup coupon code text box enter.
            this.listenTo(this.model, 'change:couponCode', this.onEnterCouponCode, this);
            this.listenTo(this.model, 'change:zipCode', this.onEnterZipCode, this);
             //this.listenTo(this.model, 'change:discountedTotal', this.updateShippingAmount, this);
            this.codeEntered = !!this.model.get('couponCode');
            this.$el.on('keypress', 'input#coupon-code', function (e) {
                var couponCode = $(e.currentTarget).val();
                me.model.set('couponCode',couponCode);
                me.onEnterCouponCode(me,couponCode);
                if (e.which === 13) {
                    if (me.codeEntered) {
                        me.handleEnterKey();
                    }
                    return false;
                }
            });
            try{
                 var cartId = this.model.id;

                 //Check all applied coupon in order model if it's conatin more then one coupon check with last applied coupon in cookie and remove.
                var order_discount_code=_.filter(this.model.get('orderDiscounts'),function(dis){ return dis.couponCode!==undefined && dis.couponCode !==null;});
                var order_discount_coupons=_.uniq(_.pluck(order_discount_code,'couponCode'));

                
                var product_discount= _.flatten(_.pluck(this.model.get('items').toJSON(), 'productDiscounts'));
                var product_discount_tmp=_.filter(product_discount,function (dis) {
                    return dis.couponCode !==undefined && dis.couponCode !==null;
                });
                var product_discount_coupons=_.uniq(_.pluck(product_discount_tmp,"couponCode"));

                var full_coupon_coupon_code=[];
                full_coupon_coupon_code=full_coupon_coupon_code.concat(order_discount_coupons).concat(product_discount_coupons);
                var lower_coupon_codes=[];
                _.each(full_coupon_coupon_code,function (item) {
                 lower_coupon_codes.push(item.toLowerCase());
                });
                var last_applied=$.cookie('lastCoupon');
                if(full_coupon_coupon_code.length>1){
                if(last_applied !==undefined && last_applied.length>0 && _.indexOf(lower_coupon_codes,last_applied)>-1){
                    var coupon_remove=_.without(full_coupon_coupon_code,full_coupon_coupon_code[_.indexOf(lower_coupon_codes,last_applied)]);
                    _.each(coupon_remove,function (remove_coupon) {
                        me.model.apiRemoveCoupon(remove_coupon).then(function (res) {
                        });
                    });
                }else{
                    if(last_applied !==undefined && last_applied ===""){
                         _.each(full_coupon_coupon_code,function (remove_coupon) {
                            me.model.apiRemoveCoupon(remove_coupon).then(function (res) {
                            });
                         });
                        }else{
                            var coupon_tobe_removed=_.rest(full_coupon_coupon_code);
                            _.each(coupon_tobe_removed,function (remove_coupon) {
                            me.model.apiRemoveCoupon(remove_coupon).then(function (res) {
                            });
                            });
                        }
                }
                }
                if(full_coupon_coupon_code.length===1 && last_applied !==undefined && last_applied ==="" || full_coupon_coupon_code.length===1 && last_applied !==undefined && full_coupon_coupon_code[0].toLowerCase()!==last_applied){
                   _.each(full_coupon_coupon_code,function (remove_coupon) {
                            me.model.apiRemoveCoupon(remove_coupon).then(function (res) {
                            });
                         });
                }
            }catch(err){
                console.log("Error on Coupon Remove");
                console.log(err);
            }
            this.listenTo(this.model.get('items'), 'quantityupdatefailed', this.onQuantityUpdateFailed, this);

            AmazonPay.init(CartModels.Cart.fromCurrent().id);

            AmazonPay.init(true);
                       
        },
        getProductionTime:function(scope_obj) {
            var mozu_order_obj=scope_obj.model.toJSON().items;
            var order_products=_.pluck(mozu_order_obj,'product');
            var products_production=_.filter(order_products, function(obj) {
                return _.where(obj.properties, {'attributeFQN': Hypr.getThemeSetting('productAttributes').productionTime}).length > 0;
            });
            console.log(products_production);
             var ext_product_time=[];
            var ext_time_arr=[];
            order_products.forEach(function(obj,idl){
                if(obj.productUsage==="Standard" && obj.options.length >1 || obj.productUsage =="Standard" && obj.options.length===1 && _.findWhere(obj.options,{'attributeFQN':"tenant~dnd-token"}) ===undefined){
                    products_production.push(obj);
                    if(obj.bundledProducts.length>0){
                        if(ext_product_time[obj.bundledProducts[0].productCode]===undefined && window.product_withExtra === undefined ){
                            var pcode=obj.bundledProducts[0].productCode;
                            ext_product_time[pcode]=0;
                            ext_time_arr.push(pcode);
                        }
                    }
                }
            });
            scope_obj.getExtraProductType(ext_product_time,products_production,0,ext_time_arr,scope_obj);
        },getExtraProductType:function(ext_prop,products_production,idx,ext_arr,scope_obj){
            //Get Production time & zip for extra products usign api call append result zip,production time in property ext_prop
            if(ext_arr.length===0){
                if(window.product_withExtra!==undefined){
                    scope_obj.setProductionTime(products_production,scope_obj,window.product_withExtra);
                }else{
                    scope_obj.setProductionTime(products_production,scope_obj,ext_prop);
                }
            }else{
                try{
                     Api.request('GET','/api/commerce/catalog/storefront/products/'+ext_arr[idx]+'?responseFields=properties,productCode').then(function(res){
                       var pc=res.productCode;
                       var product_zip=res.productCode+"_zipcd";
                       var melt_code=pc+"_melt";
                       var pdt= _.where(res.properties, {'attributeFQN':Hypr.getThemeSetting('productAttributes').productionTime});
                       var zipcode= _.where(res.properties, {'attributeFQN':Hypr.getThemeSetting('productAttributes').shipZip});
                       var isMelt=_.findWhere(res.properties, {'attributeFQN': Hypr.getThemeSetting('productAttributes').productMelt});
                       if(pdt.length >0){
                         //ext_product_time.push({pc:pdt[0].values[0].value});
                         ext_prop[pc]=pdt[0].values[0].value;
                       }
                       idx++;
                       if(idx<ext_arr.length){
                        scope_obj.getExtraProductType(ext_prop,products_production,idx,ext_arr,scope_obj);
                       }else{
                            scope_obj.setProductionTime(products_production,scope_obj,ext_prop);
                       }
                    },function(err){
                        idx++;
                        if(idx<ext_arr.length){
                        scope_obj.getExtraProductType(ext_prop,products_production,idx,ext_arr,scope_obj);
                       }else{
                            scope_obj.setProductionTime(products_production,scope_obj,ext_prop);
                       }
                    });
                }catch(ex){
                    console.log("Error on getExtraProductType "+ex);
                    scope_obj.setProductionTime(products_production,scope_obj,ext_prop);
                }
            }
        },setProductionTime:function(products_production,scope_obj,ext_prop) {
            var order_items=scope_obj.model.toJSON().items;
            var order_products=_.pluck(order_items,'product');
            window.product_withExtra=ext_prop;
            var items = scope_obj.model.get('items');
            order_products.forEach(function(obj,i){
                var prod_time=_.findWhere(obj.properties, {'attributeFQN':  Hypr.getThemeSetting('productAttributes').productionTime});
                if(prod_time===undefined){
                    if(obj.bundledProducts.length>0){
                        if(ext_prop[obj.bundledProducts[0].productCode]!==undefined){
                            prod_time=ext_prop[obj.bundledProducts[0].productCode];
                        }else{
                            prod_time=1;
                        }
                    }else{
                        prod_time=1;
                    }
                }else if(prod_time.values.length>0){
                    prod_time=prod_time.values[0].value;
                }else{
                    prod_time=1;
                }
                if(prod_time<1){
                    prod_time=1;
                }
                items.models[i].get('product').set('prodTime',prod_time);
            });
            Backbone.MozuView.prototype.render.call(scope_obj);
        },
        calculateShippingSurcharge: function(){
            try{
                var self = this;
                var totalSurAmount=0;
                Api.request("GET","/api/commerce/carts/current",{}).then(function(res) {
                    //console.log("Done ",res);
                    if(res.handlingTotal && res.handlingTotal!==null  &&(self.model.get("enableSurChargeCustom")===undefined || !self.model.get("enableSurChargeCustom"))){
                        self.model.set("enableSurCharge",true);
                        Backbone.MozuView.prototype.render.call(self);
                    }else{
                        var prod_items=res.items;
                        var pr=_.pluck(prod_items,"product");
                        var item_model=self.model.get("items").models;
                        var isMozuHandlingNotEnabled=false;
                        _.each(pr,function(prod,i){
                        var sur=_.findWhere(prod.properties,{'attributeFQN': Hypr.getThemeSetting('productAttributes').surCharge});
                            if(sur && sur.values[0].value !=="0" && (prod_items[i].handlingAmount===undefined || prod_items[i].handlingAmount===null)){
                                totalSurAmount=parseFloat(totalSurAmount+(sur.values[0].value*prod_items[i].quantity));
                                item_model[i].set("handlingAmount",parseFloat(sur.values[0].value*prod_items[i].quantity));
                                isMozuHandlingNotEnabled=true;
                            }
                        });
                        if(isMozuHandlingNotEnabled){
                            console.log("Setting not enabled");
                            self.model.set("enableSurCharge",true);
                            self.model.set("enableSurChargeCustom",true);
                            self.model.set("handlingTotal",totalSurAmount);
                        }else{
                            self.model.set("enableSurCharge",false);
                            self.model.set("enableSurChargeCustom",false);
                            self.model.unset("handlingTotal");
                            Backbone.MozuView.prototype.render.call(self);
                        }
                    }
                });

            }catch(err){
                console.log(err);
            }
        },
        render: function() {
            console.log("Change "+this.model.hasChanged("discountedTotal"));
            var me= this;
            if(me.model.get('items').length>0){
                me.showPersonalizeImage();
                me.getProductionTime(this);
                me.calculateShippingSurcharge();
                me.model.set("shippingCost",7.99);
            }
            preserveElement(this, ['.v-button','.p-button', '#AmazonPayButton'], function() {
                Backbone.MozuView.prototype.render.call(this);
            });
            this.afterRender();
            // this.calculateEstimate();
        },
        afterRender: function(){
            if($.cookie('szcontinueurl')){
            var sxurl = $.cookie('szcontinueurl');
            //console.log(sxurl);
            $('.mz-sz-continue').attr("href",sxurl);
        }
     else{
        $('.mz-sz-continue').attr("href","/");
     }
            

            var self= this;
			var arr=[],arr_rem=[],match,uniqueList="";
        	$('#coupon-code-field ul span strong').each(function(k,v){
		    	arr [k] = $(v).text();
		    });
        	
        	arr.sort();
        	
        	for (var i = 0; i < arr.length - 1; i++) {
			    if (arr[i + 1] == arr[i]) {
			        match = arr[i];
			    }
			}
			
			$('#coupon-code-field ul').each(function(k,v){
				if($(v).find('span strong').text() == match){ arr_rem[k] = k; }
			});
			
			$(arr_rem).each(function(k,v){
			     if(k > 0){
			     	$('#coupon-code-field ul:eq('+v+')').remove();
				}
			});
			
			uniqueList=arr.filter(function(item,i,allItems){
			    return i==allItems.indexOf(item);
			});
			
        },
        removeCoupon : function(e){
            var self=this;
            var me= this.$el; 
            var orderId = this.model.id;
            var couponCode = $(e.currentTarget).attr('name'); 
            self.model.apiRemoveCoupon(couponCode).then(function (res) {                
            });
        },
        setestimateShipping:function(){
            var self = this;
            var subTotal = parseInt(self.model.get('discountedTotal'),10);
            var shipCost = parseInt(self.model.get('shippingCost'),10);
            var estTotal = subTotal + shipCost;
            self.render();
        },
        additionalEvents:{    
            "click input.mz-qtyincrease" : "qtyIncrease",
            "click input.mz-qtydecrease" : "qtyDecrease",
            "change input.mz-carttable-qty-field" : "updateQuantity", 
            "click .mz-carttable-item-remove a.mz-icon-close" : "removeItem",
            "click .mz-carttable-emptylink" : "empty",
            "click button#cart-coupon-code" : "addCoupon",
            "click a.remove-coupon-link" : "removeCoupon",
            "click .editpersonalize": "editPersonalize",
            // "keypress .code_input_box" : "enableZipCode",
            "click .code_input_btn" : "estimateShippingCost",
            "click a.move-to-wishlist-link" : "moveToWishList",
            'click .toggle_components':"toggleComponets",
            "click .editPersonalizeBundleItem": "editPersonalizeBundleItem",
            "click #triggerAmazon":"triggerAmazonPay"
        },triggerAmazonPay:function(){
             $('#OffAmazonPaymentsWidgets1').trigger('click'); 
        },showPersonalizeImage: function(){
            var me = this, imgsrc,dndToken;
            var dndEngineUrl = Hypr.getThemeSetting('dndEngineUrl');
            var items = me.model.get('items');
            var personslizeIds = null, personslizeJson=null;
            for(var i=0; i < items.length; i++){
                personslizeIds = null;
                personslizeJson = null;
                for(var j =0 ; j < items.models[i].get('product').get('options').length; j++){
                        if(items.models[i].get('product').get('options')[j].attributeFQN.toLowerCase() ==='tenant~dnd-token'){
                            if(items.models[i].get('product').get('options')[j].shopperEnteredValue && items.models[i].get('product').get('options')[j].shopperEnteredValue!==""){
                                personslizeIds = JSON.parse(items.models[i].get('product').get('options')[j].shopperEnteredValue);
                            }
                        }
                }
                if(personslizeIds!==null && personslizeIds!==undefined){
                    personslizeJson={};
                    for(var eku in personslizeIds){
                        if(eku.indexOf('@')!==-1){
                            var prdCode = eku.split('@')[0];
                            personslizeJson[prdCode]=personslizeIds[eku];
                        }else{
                            personslizeJson[eku]=personslizeIds[eku];
                        }
                    }
                    items.models[i].set('personslizeIds',personslizeJson);
                }
                if(items.models[i].get('product').get('productUsage') === 'Bundle'){
                    for(var k=0;k<items.models[i].get('product').get('bundledProducts').length;k++){
                        if(items.models[i].get('personslizeIds')){
                            dndToken = items.models[i].get('personslizeIds')[items.models[i].get('product').get('bundledProducts')[k].productCode];
                            if(dndToken){
                                imgsrc=dndEngineUrl+'preview/'+dndToken;
                                items.models[i].get('product').get('bundledProducts')[k].dndToken = dndToken;
                            }else
                            {
                                imgsrc = $('[componentimageid="'+items.models[i].get('id')+'-'+items.models[i].get('product').get('bundledProducts')[k].productCode+'"]').attr('src');
                            }
                            items.models[i].get('product').get('bundledProducts')[k].imageUrl = imgsrc;
                        }
                    }
                }else{
                    var dndTokenList = items.models[i].get('personslizeIds');
                    for (var prop in dndTokenList) {
                        if (dndTokenList.hasOwnProperty(prop)) {
                            //alert(dndToken[prop]);
                            dndToken = dndTokenList[prop];
                            if(dndToken){
                                imgsrc=dndEngineUrl+'preview/'+dndToken;
                                items.models[i].get('product').set('imageUrl',imgsrc);
                            }  
                        } 
                    }

                     
                }

            }
        },
        toggleComponets: function(e){
            var target = $(e.currentTarget);
            var toggleLinkId = $(target).data('parent-id');
            var targetId = $(e.target).parent().parent().next('.mz-carttable-item-shipping-info').find('.hide_bundle_products').data('parent-id');
            if(toggleLinkId == targetId){
                $('.hide_bundle_products[data-parent-id="'+targetId+'"]').slideToggle();
                target.toggleClass('show_box');
            }
            if(target.hasClass('show_box')){
                target.html('Hide Components <i class="fa fa-caret-up"></i>');
            } else {
                target.html('Show Components <i class="fa fa-caret-down"></i>');
            }
        },
        moveToWishList:function(e){
            var me = this;
            var prodId = e.target.id;
            if(require.mozuData('user').isAnonymous){
                $('#login').trigger('click');
            }
            else{
                var mod = me.model.get('items').get(prodId).get('product');
                // var mod = cartModel.get('items').where({"id":prodId})[0].get('product');
                mod.set('moveToWishList', 1);
                mod.set('cartItemId', prodId);
                Wishlist.initoWishlist(mod);
            }
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
        getSelectedExtrasInfo:function(product){
            var extrasInfo = [];
            var self =this;
            //if(selectedOptions.length>0){
               // for(var ind=0; ind<selectedOptions.length; ind++){
                    var options = product.get('options');
                    if(options.length>0){
                       for(var inc=0; inc<options.models.length; inc++){

                            var option = options.models[inc];
                            if(option.get('attributeDetail').usageType==='Extra' &&
                               option.get('attributeDetail').dataType==='ProductCode'){
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
        editPersonalize: function(e){
            var me=this;
            var dndTokenList = JSON.parse($(e.currentTarget).attr('data-mz-token'));
            var dndToken = null, eskuSplit, eskuValue;
           
            var itemId = $(e.currentTarget).attr('itemId');

            var cartItemList = this.model.get('items').where({id:itemId});
            var cartItemModel = cartItemList[0];
            window.showPageLoader();
             Api.on('success', function(res, xhr,request){
                try{
                    var productExtrasResponse = xhr.getResponseHeader("productExtras");
                    if(productExtrasResponse && productExtrasResponse!==""){
                        var productExtras = JSON.parse(productExtrasResponse);
                        if(productExtras.length>0){
                            for(var i=0;i<productExtras.length;i++){
                               window.extrasProducts.push(productExtras[i]);
                            }

                        }

                    }
                }catch(e){
                    console.log(e);
                }
            });
             Api.request('get','/api/commerce/catalog/storefront/products/'+cartItemModel.get('product').get('productCode')+'?my=1').then(function(res){
                var product=new ProductModels.Product(res);
                for (var prop in dndTokenList) {
                    if (dndTokenList.hasOwnProperty(prop)) {
                        //alert(dndToken[prop]);
                        dndToken = dndTokenList[prop];
                        eskuValue = prop;
                        if(prop.indexOf('@')!==-1){
                            eskuSplit = prop.split('@');
                            eskuValue = eskuSplit[eskuSplit.length-1];
                        }
                        cartItemModel.get('product').set('mfgPartNumber',eskuValue);
                        var extrasProductInfo = me.getSelectedExtrasInfo(product);
                        if(extrasProductInfo){cartItemModel.get('product').set('extrasProductInfo',extrasProductInfo);}
                    } 
                }
                window.removePageLoader();
                 var dndUrl = Hypr.getThemeSetting('dndEngineUrl');
                dndUrl+=dndToken+'/edit';
                var dndEngineObj = new DNDEngine.DNDEngine(cartItemModel,dndUrl);
                dndEngineObj.initialize();
                dndEngineObj.send();
                    
            });

            
            
            
            /** DnD Code  Start **/
            //Api.get('product',productData.get('productCode')).then(function(sdkProduct) {
                //var product = new ProductModels.Product(sdkProduct.data);
                
            //});
            
                /** DnD Code  End **/
        },
        editPersonalizeBundleItem: function(e){ 

            var dndToken = $(e.currentTarget).attr('data-mz-token');
           
            var itemId = $(e.currentTarget).attr('itemId');
            var productCode = $(e.currentTarget).attr('productCode');

            /*var cartItemList = this.model.get('items').where({id:itemId});
            var cartItemModel = cartItemList[0];*/

             
            /** DnD Code  Start **/
            Api.get('product',productCode).then(function(sdkProduct) {
                var product = new ProductModels.Product(sdkProduct.data);
                product.set('cartlineid',itemId);
                var dndUrl = Hypr.getThemeSetting('dndEngineUrl');
                dndUrl+=dndToken+'/edit';
                var dndEngineObj = new DNDEngine.DNDEngine(product,dndUrl);
                dndEngineObj.initialize();
                dndEngineObj.send();
            });
            
                /** DnD Code  End **/
        },
        updateQuantity: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
                newQuantity = parseInt($qField.val(), 10),
                id = $qField.data('mz-cart-item'),
                item = this.model.get("items").get(id);

            if (item && !isNaN(newQuantity)) {
                item.set('quantity', newQuantity);
                item.saveQuantity();
            }
        },400),
        onQuantityUpdateFailed: function(model, oldQuantity) {
            var field = this.$('[data-mz-cart-item=' + model.get('id') + ']');
            if (field) {
                field.val(oldQuantity);
            }
            else {
                this.render();
            }
        },
        qtyIncrease: function (e) {
            var me = this;
            var $qField = $(e.currentTarget).parent().find('input.mz-carttable-qty-field'),
            newQuantity = parseInt($qField.val(),10);
            newQuantity = newQuantity+1;
            if(newQuantity==100000){
                $(e.currentTarget).parent().find('.mz-qtyincrease').addClass('disabled');   
            }
            if(newQuantity > 1 && newQuantity < 100000)
            {
                $qField.val(newQuantity);
                var id = $qField.data('mz-cart-item'),
                item = this.model.get("items").get(id);
                if (item && !isNaN(newQuantity)) {
                    item.set('quantity', newQuantity);
                    item.saveQuantity();
                    setTimeout(function(){
                        SoftCart.update();
                    },2000);
                }
            }
            if(newQuantity > 1){
                $(e.currentTarget).parent().find('.mz-qtydecrease').removeClass('disabled');
            }
            else
            {
               $(e.currentTarget).parent().find('.mz-qtydecrease').addClass('disabled');
            }
            Api.on('error',function(xhr){
                if(xhr.errorCode == "VALIDATION_CONFLICT" && xhr.message.indexOf('out of stock')){
                    $(e.target).closest('tr').next().find('span.avail-value').html('<span style="color:brown;">Out of stock</span>');
                }
            });
        },
        qtyDecrease: function (e) {
            var me = this;
            var $qField = $(e.currentTarget).parent().find('input.mz-carttable-qty-field'),    
            newQuantity = parseInt($qField.val(),10);
            newQuantity= newQuantity-1;
            if(newQuantity>0){  
                $qField.val(newQuantity);
                $(e.currentTarget).parent().find('.mz-qtyincrease').removeClass('disabled'); 
                if(newQuantity > 1)
                {
                   $(e.currentTarget).parent().find('.mz-qtydecrease').removeClass('disabled');
                }
                else
                {
                    $(e.currentTarget).parent().find('.mz-qtydecrease').addClass('disabled');
                }
                var id = $qField.data('mz-cart-item'),
                item = this.model.get("items").get(id);
                if (item && !isNaN(newQuantity)) {
                    item.set('quantity', newQuantity);
                    item.saveQuantity();
                    setTimeout(function(){
                        SoftCart.update();
                    },2000);
                }
                
            }   

        },
        setOptionValues: function(current_item,data){
            var self= this;
            var options = current_item.get('product').get('options');
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

                if(Object.keys(extraJSON).length>0 && extraJSON[options[i].attributeFQN.toLowerCase()]){
                    options[i].value = extraJSON[options[i].attributeFQN.toLowerCase()];
                    options[i].shopperEnteredValue=extraJSON[options[i].attributeFQN.toLowerCase()];
                }
            }
            current_item.get('product').set('options', options);
        },
        updateCartItemPersonalize: function(data){
            var self = this;
            var cartlineItem = self.model.get('items').where({id:data.lineitemID});
            var current_item = cartlineItem[0];
            var options = current_item.get('product').get('options');
            var dndToken,shopperEnteredValue;
            var dndTokenList = JSON.parse(data.projectToken);
            for(var i=0; i < options.length; i++){
               if(options[i].attributeFQN.toLowerCase() === "tenant~dnd-token"){
                    if(current_item.get('product').get('productUsage')==='Bundle'){
                         for (var prop in dndTokenList) {
                            if (dndTokenList.hasOwnProperty(prop)) {
                                //alert(dndToken[prop]);
                                dndToken = dndTokenList[prop];
                                shopperEnteredValue = JSON.parse(options[i].shopperEnteredValue);
                                shopperEnteredValue[prop]=dndToken;
                                options[i].shopperEnteredValue = JSON.stringify(shopperEnteredValue);
                            } 
                        }
                    }else{
                      options[i].shopperEnteredValue = data.projectToken;
                      options[i].value = data.projectToken;
                    }
                } 
            } 
            self.setOptionValues(current_item,data);
            Api.request('put',"api/commerce/carts/current/items/"+current_item.id, current_item.toJSON()).then(function(updatedOptions){
                self.model.apiGet();
                $('.dnd-popup').remove();
                $('body').css({overflow: 'auto'});
                $('#cboxOverlay').hide();
            });     
        },
        removeItem: function(e) {
            var self = this;
            SoftCart.update();
            if(require.mozuData('pagecontext').isEditMode) {
                // 65954
                // Prevents removal of test product while in editmode
                // on the cart template
                return false;
            }
            var $removeButton = $(e.currentTarget),
            id = $removeButton.data('mz-cart-item');
            $(".compare-full-error-container").show();
            $('#btn-yes-removeitem').data('item-id',id);
            $(document).on('click','#btn-yes-removeitem',function(e){
                self.model.removeItem($(this).data('item-id'));
                $(".compare-full-error-container").hide();
                self.setestimateShipping();
                return false;
            }); 
            $('#btn-no-removeitem').on('click',function(e){
                $('.compare-full-error-container').hide();
                return false;
            });
            return false;
        },
        removeCartItem: function(id){
            var self = this;
            self.model.removeItem(id);
        },
        empty: function() {
            var me = this; 
            $(document.body).append("<div class='compare-full-error-container'><div class='remove-item-container'><p>Do you want to remove all items?</p><button id='btn-yes-empty' class='btn-remove-item'>OK</button><button id='btn-no-empty' class='btn-remove-item'>Cancel</button></div></div>"); //session-btn-rd
            $(document).on('click','#btn-yes-empty',function(e){
                me.model.apiDel().then(function() {
                    window.location.reload();
                });
            });
            $(document).on('click','#btn-no-empty',function(e){
                $('.compare-full-error-container').hide();
                return false;
            });
        },
        proceedToCheckout: function () {
            //commenting  for ssl for now...
            //this.model.toOrder();
            // return false;
            this.model.isLoading(true);
            // the rest is done through a regular HTTP POST
        },
        addCoupon: function (e) {
            var self = this;
            var couponArr = self.model.get('couponCodes');
            var couponCode = $('#coupon-code').val().toLowerCase(),
            	disFlag = "",autoDis = "";
            var orderDiscount = self.model.get('orderDiscounts');
            if(couponArr.indexOf(couponCode.toLowerCase()) < 0){
                //check for single or multiple coupon code environment
                if(!Hypr.getThemeSetting('couponCodeMultiple')){
                	//check for product discounts
	            	$(self.model.apiModel.data.items).each(function(k,v){
                		if(v.productDiscounts.length>0){
                			disFlag = true;
                		}
                	});
                	
                	//check for more than one orderDiscounts - exclude order auto discount
                	if(self.model.get('orderDiscounts').length > 0 ){
                		$(self.model.get('orderDiscounts')).each(function(k,v){
	                		if(v.couponCode !== null && v.couponCode !== undefined){
	                			autoDis = false;
	                		}else{
	                			autoDis = true;
	                		}
	                	});
                	}                	
                	
	            	if(autoDis === false || disFlag){
	            		self.model.unset('couponCode');//unset couponCode after applying one coupon code
	            		self.model.set('couponCode','');
		            	setTimeout(function(){
		            		if($('div.mz-messagebar').length>1 || $('div.mz-messagebar').html() !== ""){
		            			$('div.mz-messagebar:eq(0)').html('<ul class="is-showing mz-errors"><li class="mz-error-item">Sorry, only one promo code per order.</li></ul>');
		            		}		            		
		            	},1000);
		            	$('html, body').animate({
	                        scrollTop: $('div.cart-main-container').offset().top-100
	                    }, 300);
	            	}else{
	            		if(couponCode === 'smtpd'){
	            			self.model.unset('couponCode');//unset couponCode after applying one coupon code
	            			self.model.set('couponCode','');
	            			setTimeout(function(){
			            		if($('div.mz-messagebar').length>1 || $('div.mz-messagebar').html() !== ""){
			            			$('div.mz-messagebar:eq(0)').html('<ul class="is-showing mz-errors"><li class="mz-error-item">Please apply Military Coupon Code in checkout page.</li></ul>');
			            		}		            		
			            	},1000);
			            	$('html, body').animate({
		                        scrollTop: $('div.cart-main-container').offset().top-100
		                    }, 300);
	            		}else{
		            	//single coupon code
			            	self.model.set('couponCode',couponCode);
			            	this.model.addCoupon().ensure(function() {
				                self.$el.removeClass('is-loading');
				                console.log("Invalid Coupon");
			            		self.model.unset('couponCode');
		                		self.render();
				            });
				    	}
		            }            	
	            }else{	            	
	            	if(couponCode === 'smtpd'){
            			self.model.unset('couponCode');//unset couponCode after applying one coupon code
            			self.model.set('couponCode','');
            			setTimeout(function(){
			            		if($('div.mz-messagebar').length>1 || $('div.mz-messagebar').html() !== ""){
			            			$('div.mz-messagebar:eq(0)').html('<ul class="is-showing mz-errors"><li class="mz-error-item">Please apply Military Coupon Code in checkout page.</li></ul>');
			            		}		            		
			            	},1000);
			            	$('html, body').animate({
		                        scrollTop: $('div.cart-main-container').offset().top-100
		                    }, 300);
            		}else{
	            	//multiple coupon code
		            	self.model.set('couponCode',couponCode);
		            	this.model.addCoupon().ensure(function() {
			                self.$el.removeClass('is-loading');
			                self.model.unset('couponCode');
			                $(self.model.get('orderDiscounts')).each(function(k,v){
				            	console.log(v);
				            });
			                self.render();
			            });
			    	}
		         }
            }
            else{
                $('.coupon-code-stripe').html('Coupon already applied.').css({'color':'brown','font-weight':'bold','margin-left': '18%'});
            }
            
            if(orderDiscount.length<=0){
            	$('.coupon-code-stripe').html('Invalid Coupon').css({'color':'brown','font-weight':'bold','margin-left': '18%'});
            }
            
            setTimeout(function(){
                $('.coupon-code-stripe').hide().removeAttr('style');
                self.render();    
            },4000);
            
        },
        onEnterZipCode: function (model,code) {
            //var code = $(e.currentTarget).val();
            if (code) {
                this.$el.find('.code_input_btn').prop('disabled', false);
            }
            if (!code) {
                this.$el.find('.code_input_btn').prop('disabled', true);
            }
        },
        onEnterCouponCode: function (model,code) {
            //var code = $(e.currentTarget).val();
            if (code && !this.codeEntered) {
                this.codeEntered = true;
                this.$el.find('#cart-coupon-code').prop('disabled', false);
            }
            if (!code && this.codeEntered) {
                this.codeEntered = false;
                this.$el.find('#cart-coupon-code').prop('disabled', true);
            }
        },
        autoUpdate: [
            'couponCode',
            'zipCode'
        ],
        handleEnterKey: function () {
            this.addCoupon();
        }
    });

    /* begin visa checkout */
    function initVisaCheckout (model, subtotal) {
        var delay = 500;
        var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
        var apiKey = visaCheckoutSettings.apiKey;
        var clientId = visaCheckoutSettings.clientId;
        
        // if this function is being called on init rather than after updating cart total
        if (!model) {
            model = CartModels.Cart.fromCurrent();
            subtotal = model.get('subtotal');
            delay = 0;

            if (!window.V) {
                //console.warn( 'visa checkout has not been initilized properly');
                return false;
            }
            // on success, attach the encoded payment data to the window
            // then turn the cart into an order and advance to checkout
            window.V.on("payment.success", function(payment) {
                // payment here is an object, not a string. we'll stringify it later
                var $form = $('#cartform');
                
                _.each({

                    digitalWalletData: JSON.stringify(payment),
                    digitalWalletType: "VisaCheckout"

                }, function(value, key) {
                    
                    $form.append($('<input />', {
                        type: 'hidden',
                        name: key,
                        value: value
                    }));

                });

                $form.submit();

            });

            // for debugging purposes only. don't use this in production
            window.V.on("payment.cancel", function(payment) {
                console.log({ cancel: JSON.stringify(payment) });
            });

            // for debugging purposes only. don't use this in production
            window.V.on("payment.error", function(payment, error) {
                console.warn({ error: JSON.stringify(error) });
            });
        }

        // delay V.init() while we wait for MozuView to re-render
        // we could probably listen for a "render" event instead
        _.delay(window.V.init, delay, {
            apikey: apiKey,
            clientId: clientId,
            paymentRequest: {
                currencyCode: model ? model.get('currencyCode') : 'USD',
                subtotal: "" + subtotal
            }
        });
    }
    /* end visa checkout */

    $(document).ready(function() {
     



    /* $(document).on('click','.sz_paypal_button',function(){
        window.location.href = "/cart/checkout";   
        //$.cookie('szpaypaloption',true,{path:'/'});   
     });*/

        var cartModel = CartModels.Cart.fromCurrent(),
            // cartModel.chkoutFlag = 'chcked',
            cartViews = {

                cartView: new CartView({
                    el: $('#cart'),
                    model: cartModel,
                    messagesEl: $('[data-mz-message-bar]')
                })

            };

        cartModel.on('ordercreated', function (order) {
            cartModel.isLoading(true);
            window.location = "/checkout/" + order.prop('id');
        });

        cartModel.on('sync', function() {
            CartMonitor.setCount(cartModel.count());
        });

        window.cartView = cartViews;
        cartViews.cartView.render();

        cartViews.cartView.afterRender();

        CartMonitor.setCount(cartModel.count());
        
        if (AmazonPay.isEnabled && cartModel.count() > 0)
            AmazonPay.addCheckoutButton(cartModel.id, true);
        /*
            code for wishlist
        */
        $(document).on('click','#login-popover-close,a#login,a#float-login',function(){
            $('.chkout-login-action').hide();
            $('.default-hide').hide();
        });
         $(document).on('click','.cont-to-signup-chkout',function(){
            $('.trigger-signup').trigger('click'); 
            // $(document).scrollTop(0);
            $('#cboxOverlay').show(); 
        });

        /*$('#triggerAmazon').click(function(){
            $('#OffAmazonPaymentsWidgets1').trigger('click'); 
        }); */
  
    });/*ready-end*/   
});


