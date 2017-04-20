/* globals V: true */
require(["modules/jquery-mozu", "underscore", "hyprlive", "modules/backbone-mozu", "modules/models-checkout", "modules/views-messages", "modules/cart-monitor", 'hyprlivecontext', 'modules/editable-view', 'modules/preserve-element-through-render','modules/amazonpay',"modules/api"], function ($, _, Hypr, Backbone, CheckoutModels, messageViewFactory, CartMonitor, HyprLiveContext, EditableView, preserveElements,AmazonPay, api) {
    var CheckoutStepView = EditableView.extend({
        getExtraVar: function () {
            return this.model.get('address.countryCode');
        },
        edit: function () {
            var id = this.$el.attr('id');
            this.model.edit();
            if(id == "step-shipping-method"){
                this.$el.children().find('[data-mz-action="next"]').hide();
            }
        },
        next: function () {
            // wait for blur validation to complete
            var me = this; 
            var gaid = this.$el.attr('id'); 
            me.editing.savedCard = false;
            if(gaid === "step-payment-info" && me.model.toJSON().billingContact.address && me.model.toJSON().billingContact.address.address1 && me.model.toJSON().billingContact.address.address1.length>30 && me.model.toJSON().paymentType === "CreditCard" ){
              if(require.mozuData('user').isAnonymous){
                  $('.error-msg').html('Error:Please edit your billing address. Your address cannot exceed 30 characters');       
                }
                else{
                  $('.error-msg').html('Error:Please <a href="/myaccount#addressbook" class="sz-eredit" >edit</a> your billing address. Your address cannot exceed 30 characters');                  
                }    
            }
           else{  
             
            _.defer(function () {
                me.model.next();
            }); 
           }   
            if( ga!==undefined && window.ga_shippingmethod_sent === undefined && gaid === "step-shipping-method" ){
                
                var gashipmethod =  this.model.attributes.shippingMethodName;
                ga('ec:setAction','checkout', {'step': 2});
                
                ga('send', 'event','Enhanced-Ecommerce','initShippingMethod',{'nonInteraction': true});
                
                ga('ec:setAction','ShippingMethod', {
                'step': 2,
                'option': gashipmethod 
                });
                 
                ga('send', 'event','Enhanced-Ecommerce','ShippingMethod');
               
               window.ga_shippingmethod_sent = true;
             }


            if(gaid == "step-payment-info" && ga!==undefined ){
       
                 var paymentmethod = me.model.apiModel.data.paymentType;

                 ga('ec:setAction','checkout', {'step': 3});
                
                ga('send', 'event','Enhanced-Ecommerce','initPaymentMethod',{'nonInteraction': true});
                
                ga('ec:setAction','PaymentMethod', {
                'step': 3,
                'option': paymentmethod
                });
                
            ga('send', 'event','Enhanced-Ecommerce','PaymentMethod');
                
            }   
         },
        amazonShippingAndBilling: function() {
            //isLoading(true);
            window.location = "/checkout/"+window.order.id+"?isAwsCheckout=true&access_token="+window.order.get("fulfillmentInfo").get("data").addressAuthorizationToken+"&view="+AmazonPay.viewName;
        },
        choose: function () {
            var me = this;
            me.model.choose.apply(me.model, arguments);
        },
        constructor: function () {
            var me = this;
            EditableView.apply(this, arguments);
            me.resize();
            setTimeout(function () {
                me.$('.mz-panel-wrap').css({ 'overflow-y': 'hidden'});
            }, 250);
             try{
            window.usa_only="";
            window.nonlow48=["AK","HI","PR","VI","AE","AP","AA"];
            var order_item_list=require.mozuData("checkout").items;
            order_item_list=_.pluck(order_item_list,"product");
            window.usa_48="";
             window.usa_only=_.filter(order_item_list, function(obj) {
                 var usa_tmp=_.where(obj.properties, {'attributeFQN': Hypr.getThemeSetting('productAttributes').usaOnly});
                  if(usa_tmp.length>0){
                    if(usa_tmp[0].values[0].value){
                        return obj;
                    }
                }
            });
             window.usa_48=_.filter(order_item_list, function(obj) {
                 var usa_48tmp=_.where(obj.properties, {'attributeFQN': Hypr.getThemeSetting('productAttributes').usa48});
                  if(usa_48tmp.length>0){
                    if(usa_48tmp[0].values[0].value){
                        return obj;
                    }
                }
            });
             if(this.model.toJSON().shippingMethodName !== undefined){
                window.ga_shippingmethodfilled = true;
             }
             if(this.model.toJSON().address !==undefined){
               if(this.model.toJSON().address.postalOrZipCode !== undefined){
                window.ga_addressprefilled=true;
               }
                if((this.model.toJSON().address.countryCode!=="US" && window.usa_only.length>0) || (this.model.toJSON().address.countryCode!=="US" && window.usa_48.length>0)){
                   me.model.set('address.countryCode','US');
                }else if(this.model.toJSON().address.countryCode=="US" && window.usa_48.length>0 && window.nonlow48.indexOf(this.model.toJSON().address.stateOrProvince)>-1){
                    me.model.set('address.countryCode','US');
                    me.model.set('address.stateOrProvince','');
                }
             }
            }catch(err){
                console.log(err);
            }
            me.listenTo(me.model,'stepstatuschange', me.render, me);
            me.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    me.handleEnterKey(e);
                    return false;
                }
            });
        },
        initStepView: function() {
            this.model.initStep();
        },
        handleEnterKey: function (e) {
            this.model.next();
        },
        render: function () {
            this.$el.removeClass('is-new is-incomplete is-complete is-invalid').addClass('is-' + this.model.stepStatus());
            EditableView.prototype.render.apply(this, arguments);
            this.resize();

            if(this.$el.attr('id') == 'step-payment-info' && this.$el.hasClass('is-complete')){
                $('#step-review').addClass('is-incomplete');
            }
            /* call for after-render */
            if($('#mz--contactselector-savedcontact option:selected').val() == 'Add new address'){
                $('#shipping-addr-edit-link').hide();
                //$('select[data-mz-value="address.countryCode"]').val('US');
            }
        },
        resize: _.debounce(function () {
            this.$('.mz-panel-wrap').animate({'height': this.$('.mz-inner-panel').outerHeight() });
        },200)
    });

    var OrderSummaryView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/checkout-order-summary',
        self:this,
        initialize: function () {
            console.log("init order summary ");
            window.first_load=true;
            //this.showPersonalizeImage();
            //this.render();
            /* window.usa_48=_.filter(order_item_list, function(obj) {
                return  _.where(obj.properties, {'attributeFQN': Hypr.getThemeSetting('productAttributes').usa48})[0].values[0].value===true;
            });
            console.log("US ship : "+window.usa_48.length);*/
            window.order_obj_win=require.mozuData("checkout").items;
            var tmp_address=this.model.get("fulfillmentInfo.fulfillmentContact.address").toJSON();
            window.address_obj={
                "cc":tmp_address.countryCode,
                "state":tmp_address.stateOrProvince,
                "zip":tmp_address.postalOrZipCode,
                "ship_code":this.model.get("fulfillmentInfo.shippingMethodCode")
            };
            this.listenTo(this.model.get('billingInfo'), 'orderPayment', this.onOrderCreditChanged, this);
        },

        editCart: function () {
            window.location = "/cart";
        },
        events:{
            'click .toggle_components':"toggleComponets"
        },
         toggleComponets: function(e){
            var target = $(e.currentTarget);
            var targetId = $(e.target).data('container-id');
            $('.hide_bundle_products[data-parent-id="'+targetId+'"]').slideToggle();
            target.toggleClass('show_box');
            if(target.hasClass('show_box')){
                target.html('Hide Components <i class="fa fa-caret-up"></i>');
            } else {
                target.html('Show Components <i class="fa fa-caret-down"></i>');
            }
        },
        onOrderCreditChanged: function (order, scope) {
            this.render();
        },showPersonalizeImage:function () {
            var me=this,imgsrc,dndToken;
            var dndEngineUrl = Hypr.getThemeSetting('dndEngineUrl');
            var personslizeIds = null, personslizeJson=null;
            var items=_.pluck(this.model.get("items"),'product');
            _.each(items,function (item,i) {

                if(item.productType !== "Bundle"){
                personslizeIds = null;
                personslizeJson = null;
                var dndCode=_.findWhere(item.options,{'attributeFQN': Hypr.getThemeSetting('productAttributes').dndToken});
                if(dndCode!==undefined){
                    personslizeIds=JSON.parse(dndCode.shopperEnteredValue);
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
                    me.model.get("items")[i].personslizeIds=personslizeJson;
                }
                    /*for(var k=0;k<me.model.get("items")[i].product.bundledProducts.length;k++){
                        if(me.model.get("items")[i].personslizeIds){
                            dndToken = me.model.get("items")[i].personslizeIds[me.model.get("items")[i].product.bundledProducts[k].productCode];
                            if(dndToken){
                                imgsrc=dndEngineUrl+'preview/'+dndToken;
                                me.model.get("items")[i].product.bundledProducts[k].dndToken= dndToken;
                                me.model.get("items")[i].product.bundledProducts[k].imageUrl = imgsrc;
                            }else
                            {
                                //imgsrc = $('[componentimageid="'+items.models[i].get('id')+'-'+items.models[i].get('product').get('bundledProducts')[k].productCode+'"]').attr('src');
                            }
                        }
                    }*/
                    var dndTokenList = me.model.get("items")[i].personslizeIds;
                    for (var prop in dndTokenList) {
                        if (dndTokenList.hasOwnProperty(prop)) {
                            //alert(dndToken[prop]);
                            dndToken = dndTokenList[prop];
                            if(dndToken){
                                imgsrc=dndEngineUrl+'preview/'+dndToken;
                                me.model.get("items")[i].product.imageUrl=imgsrc;
                            }  
                        } 
                    }
                }
            }); 
        },render:function(){
            console.log("render on change");
            this.showPersonalizeImage();
            $(".mz-pagetitle .total_pay strong").text("$"+parseFloat(this.model.get("total")).toFixed(2));
            var order_obj=window.order.toJSON();
            //var me=this;
            var new_address=this.model.get("fulfillmentInfo.fulfillmentContact.address").toJSON();
            var add_obj={
                "cc":new_address.countryCode,
                "state":new_address.stateOrProvince,
                "zip":new_address.postalOrZipCode,
                "ship_code":this.model.get("fulfillmentInfo.shippingMethodCode")
            };
            if((!(_.isEqual(window.address_obj, add_obj))) || window.first_load){
                if(order_obj.fulfillmentInfo.fulfillmentContact.address.countryCode=="CA"){
                    this.setOrderDate(this,false);
                }else if(order_obj.fulfillmentInfo.fulfillmentContact.address.countryCode=="US"){
                    if(order_obj.fulfillmentInfo.fulfillmentContact.address.stateOrProvince=="PR" || order_obj.fulfillmentInfo.fulfillmentContact.address.stateOrProvince=="AK" || order_obj.fulfillmentInfo.fulfillmentContact.address.stateOrProvince=="HI"){
                         this.setOrderDate(this,false);
                     }else{
                        console.log("connect to UPS");
                        this.setOrderDate(this,true);
                     }
                }else{
                    //console.log("Internation Shipping"+this.model.get("items").length);
                    /*GET UST from hyper file element and making google api call to get offset and daylight
                          time next calc EST time it will return 30mins more so order after 2.30 is consider as next day.
                        */
                        var me=this;
                        var tmp= new Date($('#time-custom-now').text().replace(/"/g, ''));
                        var unix_timestamp = Math.round(+tmp/1000);
                        var utcTime = tmp.getHours();
                        var estTime = new Date();
                        try{
                            $.getJSON("https://maps.googleapis.com/maps/api/timezone/json?location=38.908133,-77.047119&timestamp="+unix_timestamp).done(function(res){
                               /* console.log("Res from gl");
                                console.log(res);*/
                                if(res.status=="OK"){
                                    var timeOffset=Math.abs(((res.rawOffset/60)/60));
                                    var dl=((res.dstOffset/60)/60);
                                    estTime.setDate(tmp.getDate());
                                    estTime.setHours(utcTime-(timeOffset-dl));
                                    console.log(estTime);
                                    if(estTime.getHours()>=15){
                                        if( estTime.getHours()==15 && estTime.getMinutes()<30){
                                            //scope_obj.checkProductionTime(scope_obj,isUSA,estTime);
                                        }else{
                                            estTime.setDate(estTime.getDate()+1);
                                        }
                                    }
                                }else{
                                    estTime.setDate(tmp.getDate());
                                }
                            });
                        }catch(err){
                            console.log("Error on tz "+err);
                             estTime.setDate(tmp.getDate());
                        }
                    var holiday_prop=_.pluck(require.mozuData("holidaylist"),'properties');
                    var shipping_holidays_list=_.pluck(holiday_prop,'holiday');
                    var mozu_order_obj=require.mozuData("checkout").items;
                    var order_products=_.pluck(mozu_order_obj,'product');
                    var products_production=_.filter(order_products, function(obj) {
                        return _.where(obj.properties, {'attributeFQN': Hypr.getThemeSetting('productAttributes').productionTime}).length > 0;
                    });
                    var product_ready=_.difference(order_products,products_production);
                     products_production.forEach(function(el){
                        var idx=-1;var production_date=0;
                        mozu_order_obj.forEach(function(ob,i){
                            if(_.isEqual(ob.product,el)){
                                idx=i;
                            }
                        });
                        me.model.get("items")[idx].est_date="No Data";
                       // console.log(idx);
                        production_date=_.where(el.properties, {'attributeFQN':  Hypr.getThemeSetting('productAttributes').productionTime});
                        production_date=production_date[0].values[0].value;
                        me.skip_holidays(estTime,(production_date+1),shipping_holidays_list,me.setShippingStartDate,idx,me);
                       // me.est_shipping_start_date(order_date,idx,production_date,shipping_holidays_list,scope_obj,true);
                    });
                      product_ready.forEach(function(el){
                        var idx=-1;
                        mozu_order_obj.forEach(function(ob,i){
                            if(_.isEqual(ob.product,el)){
                                idx=i;
                            }
                        });
                        me.model.get("items")[idx].est_date="No Data";
                        me.skip_holidays(estTime,1,shipping_holidays_list,me.setShippingStartDate,idx,me);
                    });
                     /*for (var i = 0; i < this.model.get("items").length; i++) {
                        this.model.get("items")[i].est_date="No Data";
                        this.skip_holidays(estTime,1,shipping_holidays_list,this.setShippingStartDate,i,this);
                     }*/
                     var cus_ele="";
                    _.pluck(window.order.toJSON().items,'est_date').forEach(function(el){
                    cus_ele+=el+":::";
                    });
                    var ship_attr="";
                    _.pluck(window.order.toJSON().items,'ship_date').forEach(function(el){
                        ship_attr+=el+":::";
                    });
                    this.model.set("orderAttribute-tenant~est-delivery-date",cus_ele);
                    this.model.set("orderAttribute-tenant~est-ship-date",ship_attr);
                    window.ship_start_str=ship_attr;
                    window.ship_est_str=cus_ele;
                }
                window.address_obj=add_obj;
                window.first_load=false;
            }else{
                if(window.ship_est_str!==undefined){
                    var date_arr=window.ship_est_str.split(":::");
                    var order_len=this.model.get("items").length;
                    for (var order_itr = 0; order_itr < order_len; order_itr++) {
                         this.model.get("items")[order_itr].est_date=date_arr[order_itr];
                    }
                    this.model.set("orderAttribute-tenant~est-delivery-date",window.ship_est_str);
                }
                 if(window.ship_start_str!==undefined){
                    var ship_arr=window.ship_start_str.split(":::");
                    var item_len=this.model.get("items").length;
                    for (var itr = 0; itr < item_len; itr++) {
                         this.model.get("items")[itr].ship_date=ship_arr[itr];
                    }
                    this.model.set("orderAttribute-tenant~est-ship-date",window.ship_start_str);
                }
            }
            Backbone.MozuView.prototype.render.call(this);
        },renderCustomAfterShip:function(scope_obj){
            try{
             var cus_ele="";
             _.pluck(window.order.toJSON().items,'est_date').forEach(function(el){
                    if(el!==undefined){
                        cus_ele+=el+":::";                        
                    }else{
                        cus_ele+="No Data:::";   
                    }
                });
                 var ship_attr="";
                _.pluck(window.order.toJSON().items,'ship_date').forEach(function(el){
                    if(el!==undefined){
                        ship_attr+=el+":::";
                    }else{
                        ship_attr+="No Data:::";
                    }
                });
            // scope_obj.model.get('attributes')."orderAttribute-tenant~est-delivery-date"=cus_ele;
            scope_obj.model.set("orderAttribute-tenant~est-delivery-date",cus_ele);
                scope_obj.model.set("orderAttribute-tenant~est-ship-date",ship_attr);
            window.ship_est_str=cus_ele;
                window.ship_start_str=ship_attr;
            //console.log( scope_obj.model.get('attributes'));
            Backbone.MozuView.prototype.render.call(scope_obj);
            }catch(err){
                console.log(err);
                Backbone.MozuView.prototype.render.call(scope_obj);
            }
        },setOrderDate:function(scope_obj,isUSA){
            /*GET UST from hyper file element and making google api call to get offset and daylight
              If order fall on saturday and sunday push to nearest working day.
            */
            var tmp= new Date($('#time-custom-now').attr('date-attr'));
            var unix_timestamp = Math.round(+tmp/1000);
            var utcTime = tmp.getHours();
            var estTime = new Date();
            var holiday_prop=_.pluck(require.mozuData("holidaylist"),'properties');
            var shipping_holidays_list=_.pluck(holiday_prop,'holiday');
            try{
                $.getJSON("https://maps.googleapis.com/maps/api/timezone/json?location=38.908133,-77.047119&timestamp="+unix_timestamp).done(function(res){
                   /* Time Calc using google time zone api */
                    if(res.status=="OK"){
                        var timeOffset=Math.abs(((res.rawOffset/60)/60));
                        var dl=((res.dstOffset/60)/60);
                        estTime.setDate(tmp.getDate());
                        estTime.setMonth(tmp.getMonth());
                        estTime.setFullYear(tmp.getFullYear());
                        estTime.setHours(utcTime-(timeOffset-dl));
                        estTime.setMinutes(tmp.getMinutes());
                        console.log(estTime);
                        scope_obj.checkProductionTime(scope_obj,isUSA,estTime);
                    }else{
                        scope_obj.checkProductionTime(scope_obj,isUSA,tmp);
                    }
                });
            }catch(err){
                console.log("Error on tz "+err);
                scope_obj.checkProductionTime(scope_obj,isUSA,tmp);
            }
        },checkProductionTime:function(scope_obj,isUSA,process_order_date){

            var order_date=new Date(process_order_date);
            var ext_product_time=[];
            var ext_time_arr=[];
            order_date=process_order_date.getFullYear()+"/"+("0" + (process_order_date.getMonth() + 1)).slice(-2)+"/"+("0" + process_order_date.getDate()).slice(-2);
            //Splite up the Production and ready products
            var mozu_order_obj=window.order_obj_win;
            var order_products=_.pluck(mozu_order_obj,'product');
            var products_production=_.filter(order_products, function(obj) {
                return _.where(obj.properties, {'attributeFQN': Hypr.getThemeSetting('productAttributes').productionTime}).length > 0;
            });
            order_products.forEach(function(obj,idl){
                if(obj.productUsage==="Standard" && obj.options.length >1){
                    products_production.push(obj);
                    if(obj.bundledProducts.length>0){
                        if(ext_product_time[obj.bundledProducts[0].productCode]===undefined){
                            var pcode=obj.bundledProducts[0].productCode;
                            ext_product_time[pcode]=0;
                            ext_time_arr.push(pcode);
                        }
                    }
                }
            });
            console.log("ext_product_time");
            console.log(products_production);
            scope_obj.getExtraProductType(ext_product_time,products_production,0,ext_time_arr,scope_obj,order_date,isUSA);
        },getExtraProductType:function(ext_prop,products_production,idx,ext_arr,scope_obj,order_date,isUSA){
            //Get Production time & zip for extra products usign api call append result zip,production time in property ext_prop
            if(ext_arr.length===0){
                scope_obj.startProductShiping(products_production,order_date,isUSA,scope_obj,ext_prop);
            }else{

                try{
                     api.request('GET','/api/commerce/catalog/storefront/products/'+ext_arr[idx]+'?responseFields=properties,productCode').then(function(res){
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
                       if(zipcode.length>0){
                        console.log(product_zip+" -- "+zipcode[0].values[0].stringValue);
                        window.zipArr[product_zip]=zipcode[0].values[0].stringValue;
                        }
                       if(isMelt!==undefined){
                            if(isMelt.values[0].value){
                                window.meltArr[melt_code]=isMelt.values[0].value;
                                console.log("melt "+pc);
                            }
                       }
                       idx++;
                       if(idx<ext_arr.length){
                        scope_obj.getExtraProductType(ext_prop,products_production,idx,ext_arr,scope_obj,order_date,isUSA);
                       }else{
                            scope_obj.startProductShiping(products_production,order_date,isUSA,scope_obj,ext_prop);
                       }
                    },function(err){
                        idx++;
                        if(idx<ext_arr.length){
                        scope_obj.getExtraProductType(ext_prop,products_production,idx,ext_arr,scope_obj,order_date,isUSA);
                       }else{
                            //console.log("Completed.. "+ext_prop);
                            scope_obj.startProductShiping(products_production,order_date,isUSA,scope_obj,ext_prop);
                       }
                    });
                }catch(ex){
                    console.log("Error on getExtraProductType "+ex);
                    scope_obj.startProductShiping(products_production,order_date,isUSA,scope_obj,ext_prop);
                }
            }
        },startProductShiping:function(products_production,order_date,isUSA,scope_obj,ext_prop){
            var mozu_order_obj=window.order_obj_win;
            var order_products=_.pluck(mozu_order_obj,'product');
           // var product_ready=_.difference(order_products,products_production);
            //get preload json from custom document for holiday
            var holiday_prop=_.pluck(require.mozuData("holidaylist"),'properties');
            var shipping_holidays_list=_.pluck(holiday_prop,'holiday');
            //console.log(shipping_holidays_list);

            var me=this;
            //Group all ship from indiana items and find max date and product index.
            var indiana_package=[];
            var indiana_max_prod_days=1;
            var indiana_prd_idx=0;
            var contains_melts=false;
            window.indina_idx_arr=[];

            order_products.forEach(function(obj,i){
                var ship_zip=_.findWhere(obj.properties, {'attributeFQN':  Hypr.getThemeSetting('productAttributes').shipZip});
                var prod_time=_.findWhere(obj.properties, {'attributeFQN':  Hypr.getThemeSetting('productAttributes').productionTime});
                var isMelt=_.findWhere(obj.properties, {'attributeFQN': Hypr.getThemeSetting('productAttributes').productMelt});

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
                 //console.log(obj.productCode+" - "+prod_time);
                if(ship_zip!==undefined){
                    if(ship_zip.values[0].stringValue==="46787"){
                        indiana_package.push(obj);
                        window.indina_idx_arr.push(i);
                        if(prod_time>=indiana_max_prod_days){
                            indiana_max_prod_days=prod_time;
                            indiana_prd_idx=i;
                        }
                    }
                }else{
                    if(obj.bundledProducts.length>0){
                        var zipidx=obj.bundledProducts[0].productCode+"_zipcd";
                     if(window.zipArr[zipidx]!==undefined){
                            var ship_zip_ind=window.zipArr[zipidx];
                            if(ship_zip_ind==="46787"){
                                indiana_package.push(obj);
                                window.indina_idx_arr.push(i);
                                if(prod_time>=indiana_max_prod_days){
                                    indiana_max_prod_days=prod_time;
                                    indiana_prd_idx=i;
                                }
                            }
                           // window.order.get("items")[idx].zipcode=ship_zip;
                        }else{
                            indiana_package.push(obj);
                            window.indina_idx_arr.push(i);
                            if(prod_time>=indiana_max_prod_days){
                                indiana_max_prod_days=prod_time;
                                indiana_prd_idx=i;
                            }
                        }
                    }else{
                        indiana_package.push(obj);    
                        window.indina_idx_arr.push(i);
                        if(prod_time>=indiana_max_prod_days){
                            indiana_max_prod_days=prod_time;
                            indiana_prd_idx=i;
                        }               
                    }
                }
                if(isMelt!==undefined){
                    if(isMelt.values[0].value===true && window.indina_idx_arr.indexOf(i)>=0){
                        contains_melts=true;
                    }else if(obj.bundledProducts.length>0){
                    var melt_idx=obj.bundledProducts[0].productCode+"_melt";
                     if(window.meltArr[melt_idx]!==undefined && window.indina_idx_arr.indexOf(i)>=0){
                        contains_melts=true;
                     }
                }
                }else if(obj.bundledProducts.length>0){
                    var melt_idx1=obj.bundledProducts[0].productCode+"_melt";
                     if(window.meltArr[melt_idx1]!==undefined && window.indina_idx_arr.indexOf(i)>=0){
                        contains_melts=true;
                     }
                }
            });
            //Divide the drop ship item with total order object 
            //console.log("max ind days "+indiana_max_prod_days+" prod "+indiana_prd_idx+" -- "+indiana_package[indiana_prd_idx].productCode);
            var dropship_items=_.difference(order_products,indiana_package);
            var production_dropship=_.difference(products_production,indiana_package);
            var product_ready_dropship=_.difference(dropship_items,production_dropship);
            if(isUSA){
                 if(window.indina_idx_arr.length>0){
                    me.skip_holidays(order_date,indiana_max_prod_days,shipping_holidays_list,function(result_date){
                        if(contains_melts && (result_date.getDay()>=4||result_date.getDay()===0)){
                            scope_obj.get_meltPackage_start(result_date,shipping_holidays_list,scope_obj,indiana_prd_idx);
                        }else{
                            scope_obj.UPSWebEstimate(result_date,indiana_prd_idx,shipping_holidays_list,scope_obj,false,true);
                            window.indina_idx_arr.forEach(function(idx){
                                scope_obj.model.get("items")[idx].ship_date=("0" + (result_date.getMonth() + 1)).slice(-2)+"/"+("0" + result_date.getDate()).slice(-2)+"/"+result_date.getFullYear();
                            });
                        }
                    },indiana_prd_idx,scope_obj); 
                }
                var pro_arr_idx=[];
               product_ready_dropship.forEach(function(el){
                    var idx=-1;
                    mozu_order_obj.forEach(function(ob,i){
                        if(_.isEqual(ob.product,el) && idx===-1 && pro_arr_idx.indexOf(i)<0){
                            idx=i;
                            pro_arr_idx.push(idx);
                        }
                    });

                    var isMelt=_.findWhere(scope_obj.model.get("items")[idx].product.properties, {'attributeFQN': Hypr.getThemeSetting('productAttributes').productMelt});
                    var ship_date=new Date(order_date);
                    if(isMelt!==undefined){
                        if(isMelt.values[0].value && (ship_date.getDay()>=4||ship_date.getDay()===0)){
                            scope_obj.est_date_usa(ship_date,idx,shipping_holidays_list,scope_obj);
                        }else if(scope_obj.model.get("items")[idx].product.bundledProducts.length>0){
                            var melt_idx=scope_obj.model.get("items")[idx].product.bundledProducts[0].productCode+"_melt";
                            if(window.meltArr[melt_idx]!==undefined  && (ship_date.getDay()>=3||ship_date.getDay()===0)){
                                scope_obj.est_date_usa(ship_date,idx,shipping_holidays_list,scope_obj);
                            }else{
                                scope_obj.UPSWebEstimate(ship_date,idx,shipping_holidays_list,scope_obj,true);                                
                            }
                        }else{
                             scope_obj.UPSWebEstimate(ship_date,idx,shipping_holidays_list,scope_obj,true);
                        }
                    }else if(scope_obj.model.get("items")[idx].product.bundledProducts.length>0){
                        var melt_idx1=scope_obj.model.get("items")[idx].product.bundledProducts[0].productCode+"_melt";
                        if(window.meltArr[melt_idx1]!==undefined  && (ship_date.getDay()>=3||ship_date.getDay()===0)){
                             scope_obj.est_date_usa(ship_date,idx,shipping_holidays_list,scope_obj);
                    }else{
                             scope_obj.UPSWebEstimate(ship_date,idx,shipping_holidays_list,scope_obj,true);
                        }
                    }else{
                        scope_obj.UPSWebEstimate(ship_date,idx,shipping_holidays_list,scope_obj,true);
                    }
                });
                var arr_idx=[];
                production_dropship.forEach(function(el){
                    var idx=-1;var production_date=0;
                    mozu_order_obj.forEach(function(ob,i){
                        if(_.isEqual(ob.product,el) && idx===-1 && arr_idx.indexOf(i)<0){
                            idx=i;
                            arr_idx.push(idx);
                        }
                    });
                   // console.log(idx);
                    production_date=_.where(el.properties, {'attributeFQN':  Hypr.getThemeSetting('productAttributes').productionTime});
                    if(production_date.length>0){
                        production_date=production_date[0].values[0].value;
                    }else{
                        if(ext_prop[el.bundledProducts[0].productCode]!==undefined){
                            production_date=ext_prop[el.bundledProducts[0].productCode];
                        }else{
                            production_date=0;
                        }
                    }
                    me.est_shipping_start_date(order_date,idx,production_date,shipping_holidays_list,scope_obj,true);
                });
            }else{
                if(window.indina_idx_arr.length>0){
                    me.skip_holidays(order_date,indiana_max_prod_days,shipping_holidays_list,function(result_date){
                        if(result_date.getDay()<4){
                           scope_obj.setCA_ship_start(result_date,shipping_holidays_list,scope_obj,indiana_prd_idx,true);
                        }else{
                           me.final_shipping_end(result_date,indiana_prd_idx,shipping_holidays_list,scope_obj,false,true);
                        }
                    },indiana_prd_idx,scope_obj); 
                }
                var pr_arr_idx=[];
                 product_ready_dropship.forEach(function(el){
                    var idx=-1;
                    mozu_order_obj.forEach(function(ob,i){
                        if(_.isEqual(ob.product,el)&& idx===-1 && pr_arr_idx.indexOf(i)<0){
                            idx=i;
                            pr_arr_idx.push(idx);
                        }
                    });
                   me.skip_holidays(order_date,1,shipping_holidays_list,function(result_date){
                    if(result_date.getDay()<4){
                        scope_obj.setCA_ship_start(result_date,shipping_holidays_list,scope_obj,idx);
                    }else{
                        me.final_shipping_end(result_date,idx,shipping_holidays_list,scope_obj,false,false);
                    }
                   },idx,scope_obj);
                });
                 var arr_idx_ca=[];
                production_dropship.forEach(function(el){
                    var idx=-1;var production_date=0;
                    mozu_order_obj.forEach(function(ob,i){
                        if(_.isEqual(ob.product,el) && idx===-1 && arr_idx_ca.indexOf(i)<0){
                            idx=i;
                            arr_idx_ca.push(idx);
                        }
                    });
                   // console.log(idx);
                    production_date=_.where(el.properties, {'attributeFQN': Hypr.getThemeSetting('productAttributes').productionTime});
                  if(production_date.length>0){
                        production_date=production_date[0].values[0].value;
                    }else{
                        if(ext_prop[el.bundledProducts[0].productCode]!==undefined){
                            production_date=ext_prop[el.bundledProducts[0].productCode];
                        }else{
                            production_date=0;
                        }
                    }
                    var ship_zip=_.findWhere(el.properties, {'attributeFQN':  Hypr.getThemeSetting('productAttributes').shipZip});
                    //console.log(ship_zip);
                    if(ship_zip===undefined){
                        if(scope_obj.model.get("items")[idx].product.bundledProducts.length>0){
                            var zipidx=scope_obj.model.get("items")[idx].product.bundledProducts[0].productCode+"_zipcd";
                         if(window.zipArr[zipidx]!==undefined){
                                ship_zip=window.zipArr[zipidx];
                                window.order.get("items")[idx].zipcode=ship_zip;
                            }
                        }
                    }
                    if(production_date===0){
                        production_date=1;
                    }  
                    //me.est_shipping_start_date(order_date,idx,production_date,shipping_holidays_list,scope_obj,false);
                    me.skip_holidays(order_date,production_date,shipping_holidays_list,function(result_date){
                    if(result_date.getDay()<4){
                        scope_obj.setCA_ship_start(result_date,shipping_holidays_list,scope_obj,idx);
                    }else{
                        me.final_shipping_end(result_date,idx,shipping_holidays_list,scope_obj,false,false);
                    }
                   },idx,scope_obj);
                });
            }
        },est_shipping_start_date:function(production_end_date,idx,noBusDays,shipping_holidays_list,scope_obj,isUSA){

            //console.log('Production End at '+new Date(production_end_date).toISOString().slice(0,10));
            if(isUSA){
                 var isMelt=_.findWhere(scope_obj.model.get("items")[idx].product.properties, {'attributeFQN': Hypr.getThemeSetting('productAttributes').productMelt});
                if(isMelt!==undefined){
                var ship_date=new Date(production_end_date);
                    //If Product is Mets and shipping start date after Thu then calc nearest monday.
                     scope_obj.skip_holidays(production_end_date,noBusDays,shipping_holidays_list,function(result_date,idx,holidays,scope_obj){
                        if(isMelt.values[0].value && (result_date.getDay()>=3||result_date.getDay()===0)){
                               scope_obj.est_date_usa(result_date,idx,holidays,scope_obj);
                        }else if(scope_obj.model.get("items")[idx].product.bundledProducts.length>0){
                            var melt_idx=scope_obj.model.get("items")[idx].product.bundledProducts[0].productCode+"_melt";
                             if(window.meltArr[melt_idx]!==undefined  && (result_date.getDay()>=3||result_date.getDay()===0)){
                                scope_obj.skip_holidays(result_date,1,shipping_holidays_list,scope_obj.est_date_usa,idx,scope_obj);
                               //scope_obj.est_date_usa(result_date,idx,holidays,scope_obj);
                            }else{
                                if(noBusDays===0){
                                    scope_obj.UPSWebEstimate(result_date,idx,shipping_holidays_list,scope_obj,true);
                                }else{
                                    scope_obj.skip_holidays(production_end_date,noBusDays,shipping_holidays_list,function(result_date,idx,holiday_list,scope_obj){
                                       scope_obj.UPSWebEstimate(result_date,idx,holiday_list,scope_obj,false);
                                    },idx,scope_obj);
                                }
                             }
                         }else{
                            if(scope_obj.model.get("items")[idx].product.bundledProducts.length>0){
                                var melt_idx1=scope_obj.model.get("items")[idx].product.bundledProducts[0].productCode+"_melt";
                                 if(window.meltArr[melt_idx1]!==undefined){
                                    scope_obj.skip_holidays(result_date,1,shipping_holidays_list,scope_obj.est_date_usa,idx,scope_obj);
                                 }else{
                                    if(noBusDays===0){
                                        scope_obj.UPSWebEstimate(result_date,idx,shipping_holidays_list,scope_obj,true);
                                    }else{
                                        scope_obj.skip_holidays(production_end_date,noBusDays,shipping_holidays_list,function(result_date,idx,holiday_list,scope_obj){
                                           scope_obj.UPSWebEstimate(result_date,idx,holiday_list,scope_obj,false);
                                        },idx,scope_obj);
                                    }
                                 }
                             }else{
                                if(noBusDays===0){
                                        scope_obj.UPSWebEstimate(result_date,idx,shipping_holidays_list,scope_obj,true);
                                    }else{
                                        scope_obj.skip_holidays(production_end_date,noBusDays,shipping_holidays_list,function(result_date,idx,holiday_list,scope_obj){
                                           scope_obj.UPSWebEstimate(result_date,idx,holiday_list,scope_obj,false);
                                        },idx,scope_obj);
                                    }

                             }
                        }
                     },idx,scope_obj);
                }else if(scope_obj.model.get("items")[idx].product.bundledProducts.length>0){
                    var melt_idx1=scope_obj.model.get("items")[idx].product.bundledProducts[0].productCode+"_melt";
                     if(window.meltArr[melt_idx1]!==undefined){
                        scope_obj.skip_holidays(production_end_date,noBusDays,shipping_holidays_list,function(result_date,idx,holidays,scope_obj){
                         scope_obj.skip_holidays(result_date,1,shipping_holidays_list,scope_obj.est_date_usa,idx,scope_obj);    
                    },idx,scope_obj);
                     }else{
                         if(noBusDays===0){
                              scope_obj.skip_holidays(production_end_date,1,shipping_holidays_list,scope_obj.UPSWebEstimate,idx,scope_obj);                
                         }else{
                            scope_obj.skip_holidays(production_end_date,noBusDays,shipping_holidays_list,scope_obj.UPSWebEstimate,idx,scope_obj);
                         }
                     }
                }else{
                     if(noBusDays===0){
                          scope_obj.skip_holidays(production_end_date,1,shipping_holidays_list,scope_obj.UPSWebEstimate,idx,scope_obj);                
                     }else{
                        scope_obj.skip_holidays(production_end_date,noBusDays,shipping_holidays_list,scope_obj.UPSWebEstimate,idx,scope_obj);
                     }
                }
            }
        },setShippingStartDate:function(result_date,idx,shipping_holidays_list,scope_obj){
            //Set Shipping Start Date
            //console.log(result_date);
            //scope_obj.model.get("items")[idx].ship_date=result_date.toISOString().slice(0,10).replace(/\-/g,"/");
            scope_obj.model.get("items")[idx].ship_date=("0" + (result_date.getMonth() + 1)).slice(-2)+"/"+("0" + result_date.getDate()).slice(-2)+"/"+result_date.getFullYear();
        },final_shipping_end:function(shipping_start_date,idx,shipping_holidays_list,scope_obj,add_day,isIndiana) {
            var me=this; var shipBusday;
            var ship_date=new Date(shipping_start_date);
            shipBusday=_.pluck(require.mozuData("shipBusDate"),'properties');
            shipBusday= _.findWhere(shipBusday,{'ship_code':scope_obj.model.toJSON().fulfillmentInfo.shippingMethodCode});
            //console.log("no of shipping_start_date "+ no_of_shipping_days);
            console.log('shipping start date '+new Date(shipping_start_date).toISOString().slice(0,10));
            if(add_day===undefined){
                add_day=false;
            }
            if(isIndiana===undefined){
                isIndiana=false;
            }
            if(shipBusday!==undefined){
                 shipBusday=shipBusday.no_business_day;
            }
            if(add_day){
                scope_obj.skip_holidays(shipping_start_date,1,shipping_holidays_list,scope_obj.setShippingStartDate,idx,scope_obj);
                     if(shipBusday!==undefined){
                        scope_obj.skip_holidays(shipping_start_date,shipBusday,shipping_holidays_list,function(final_delivery_date){
                            //scope_obj.model.get("items")[idx].est_date=final_delivery_date.toDateString();
                            scope_obj.model.get("items")[idx].est_date=("0" + (final_delivery_date.getMonth() + 1)).slice(-2)+"/"+("0" + final_delivery_date.getDate()).slice(-2)+"/"+final_delivery_date.getFullYear();
                            if(isIndiana){
                                var fin_date=("0" + (final_delivery_date.getMonth() + 1)).slice(-2)+"/"+("0" + final_delivery_date.getDate()).slice(-2)+"/"+final_delivery_date.getFullYear();
                                var ship_day=("0" + (shipping_start_date.getMonth() + 1)).slice(-2)+"/"+("0" + shipping_start_date.getDate()).slice(-2)+"/"+shipping_start_date.getFullYear();
                                window.indina_idx_arr.forEach(function(estidx){
                                    scope_obj.model.get("items")[estidx].est_date=fin_date;
                                      scope_obj.model.get("items")[estidx].ship_date=ship_day;
                                });
                            }
                        },idx,scope_obj);
                     }else{
                         scope_obj.model.get("items")[idx].est_date="No Data";
                        if(isIndiana){
                            var ship_day=("0" + (shipping_start_date.getMonth() + 1)).slice(-2)+"/"+("0" + shipping_start_date.getDate()).slice(-2)+"/"+shipping_start_date.getFullYear();
                            window.indina_idx_arr.forEach(function(estidx){
                                scope_obj.model.get("items")[estidx].est_date="No Data";
                                  scope_obj.model.get("items")[estidx].ship_date=ship_day;
                            });
                        }
                     }
                    scope_obj.renderCustomAfterShip(scope_obj);
            }else{
                scope_obj.setShippingStartDate(new Date(shipping_start_date),idx,shipping_holidays_list,scope_obj);
                if(shipBusday!==undefined){ 
                    scope_obj.skip_holidays(shipping_start_date,shipBusday-1,shipping_holidays_list,function(final_delivery_date){
                        console.log("Final Arrival Date "+final_delivery_date.toISOString().slice(0,10));
                        //scope_obj.model.get("items")[idx].est_date=final_delivery_date.toDateString();
                        scope_obj.model.get("items")[idx].est_date=("0" + (final_delivery_date.getMonth() + 1)).slice(-2)+"/"+("0" + final_delivery_date.getDate()).slice(-2)+"/"+final_delivery_date.getFullYear();
                        if(isIndiana){
                            var fin_date=("0" + (final_delivery_date.getMonth() + 1)).slice(-2)+"/"+("0" + final_delivery_date.getDate()).slice(-2)+"/"+final_delivery_date.getFullYear();
                             var ship_day=("0" + (shipping_start_date.getMonth() + 1)).slice(-2)+"/"+("0" + shipping_start_date.getDate()).slice(-2)+"/"+shipping_start_date.getFullYear();
                            window.indina_idx_arr.forEach(function(eidx){
                                scope_obj.model.get("items")[eidx].est_date=fin_date;
                                scope_obj.model.get("items")[eidx].ship_date=ship_day;
                            });
                        }
                    },idx,scope_obj);
                }else{
                    scope_obj.model.get("items")[idx].est_date="No Data";
                        if(isIndiana){
                            var ship_day1=("0" + (shipping_start_date.getMonth() + 1)).slice(-2)+"/"+("0" + shipping_start_date.getDate()).slice(-2)+"/"+shipping_start_date.getFullYear();
                            window.indina_idx_arr.forEach(function(estidx){
                                scope_obj.model.get("items")[estidx].est_date="No Data";
                                  scope_obj.model.get("items")[estidx].ship_date=ship_day1;
                            });
                        }
                }
                scope_obj.renderCustomAfterShip(scope_obj);
            }
        },skip_holidays:function(date,noBusDays,holidays,callback,idx,scope_obj){
            /*Function to skip saturday,sunday and holiday list and call the callback function
              With result date.
            */
            if (noBusDays < 1) {
                callback(new Date(date),idx,holidays,scope_obj);
                return true;
            }
            var result_date=new Date(date);
            var addedDays = 0;

            while (addedDays < noBusDays) {
                result_date.setDate(result_date.getDate()+1);
                /*console.log("result_date "+result_date.toISOString().slice(0,10) +" -- "+addedDays);
                console.log(result_date.getDay()<6 && result_date.getDay()!=0 && holidays.indexOf(result_date.toISOString().slice(0,10))==-1);
                console.log("arr "+holidays.indexOf(result_date.toISOString().slice(0,10))==-1);*/
                /*console.log((result_date.getDay()<6 && result_date.getDay()!=0 && holiday_list.indexOf(result_date.toISOString().slice(0,10))));*/
                if (result_date.getDay()<6 && result_date.getDay()!==0 && holidays.indexOf(result_date.getFullYear()+"-"+("0" + (result_date.getMonth() + 1)).slice(-2)+"-"+("0" + result_date.getDate()).slice(-2))==-1) {
                    ++addedDays;
                }
            }
            result_date.setDate(result_date.getDate());
            //console.log("idx "+idx+" res "+result_date);
            callback(result_date,idx,holidays,scope_obj);
        },setCA_ship_start:function(shipping_start_date,shipping_holidays_list,scope_obj,idx,isIndiana){
            var ship_start=new Date(shipping_start_date);
            var noDays;

            if(ship_start.getDay()<4){
                noDays=4-ship_start.getDay();
                scope_obj.skip_holidays(ship_start,noDays,shipping_holidays_list,function(re){
                    //Check if result date is with in Monday to Wednesday
                    var res_date=new Date(re);
                    if(res_date.getDay()<4){
                        scope_obj.setCA_ship_start(res_date,shipping_holidays_list,scope_obj,idx,isIndiana);
                    }else{
                    //Receive no of shipping and calc devlivery date
                        scope_obj.final_shipping_end(res_date,idx,shipping_holidays_list,scope_obj,false,isIndiana);
                        if(isIndiana){
                            var re_date=("0" + (res_date.getMonth() + 1)).slice(-2)+"/"+("0" + res_date.getDate()).slice(-2)+"/"+res_date.getFullYear();
                            window.indina_idx_arr.forEach(function(idx){
                                scope_obj.model.get("items")[idx].ship_date=re_date;
                            });
                        }
                    }
                },idx,scope_obj);
            }
        },get_meltPackage_start:function(shipping_start_date,shipping_holidays_list,scope_obj,idx){
            /* If Order item is melt and we need to  roll up to nearest monday, tuesday or wednesday */
            var ship_start=new Date(shipping_start_date);
            var noDays;
            if(ship_start.getDay()>=4){
                /* To reach nearest monday 7-5(Firday)=2 and minus one day to reach monday
                   because sat& sunday holiday by default.
                 noDays=7-ship_start.getDay();*/
                    noDays=1;  
                scope_obj.skip_holidays(ship_start,noDays,shipping_holidays_list,function(re){
                    //Check if result date is with in Monday to Wednesday
                    var res_date=new Date(re);
                    if(res_date.getDay()>=4){
                        scope_obj.get_meltPackage_start(res_date,shipping_holidays_list,scope_obj,idx);
                    }else{
                    //Receive no of shipping and calc devlivery date
                    scope_obj.UPSWebEstimate(res_date,idx,shipping_holidays_list,scope_obj,false,true);
                    window.indina_idx_arr.forEach(function(ind){
                        scope_obj.model.get("items")[ind].ship_date=("0" + (res_date.getMonth() + 1)).slice(-2)+"/"+("0" + res_date.getDate()).slice(-2)+"/"+res_date.getFullYear();
                    });
                    }
                });
            }else if(ship_start.getDay()===0){
                /* Sunday Calculation */
                scope_obj.skip_holidays(shipping_start_date,1,shipping_holidays_list,function(re){
                    var res_date=new Date(re);
                    if(res_date.getDay()>=4){
                        scope_obj.get_meltPackage_start(res_date,shipping_holidays_list,scope_obj,idx);
                    }else{
                        //Receive no of shipping and calc devlivery date
                       scope_obj.UPSWebEstimate(res_date,idx,shipping_holidays_list,scope_obj,false,true);
                    window.indina_idx_arr.forEach(function(ind){
                        scope_obj.model.get("items")[ind].ship_date=("0" + (res_date.getMonth() + 1)).slice(-2)+"/"+("0" + res_date.getDate()).slice(-2)+"/"+res_date.getFullYear();
                    });
                    }
                });
            }else{
                //console.log("Go Here");
               scope_obj.skip_holidays(shipping_start_date,1,shipping_holidays_list,function(res){
                    scope_obj.UPSWebEstimate(res,idx,shipping_holidays_list,scope_obj,false,true);
                    window.indina_idx_arr.forEach(function(ind){
                        scope_obj.model.get("items")[ind].ship_date=("0" + (res.getMonth() + 1)).slice(-2)+"/"+("0" + res.getDate()).slice(-2)+"/"+res.getFullYear();
                    });
               });
            }
        },est_date_usa:function(shipping_start_date,idx,shipping_holidays_list,scope_obj){
            /* If Order item is melt and we need to  roll up to nearest monday, tuesday or wednesday */
            var ship_start=new Date(shipping_start_date);
            var noDays;
            if(ship_start.getDay()>=4){
                /* To reach nearest monday 7-5(Firday)=2 and minus one day to reach monday
                   because sat& sunday holiday by default.*/
                    noDays=1;
                scope_obj.skip_holidays(ship_start,noDays,shipping_holidays_list,function(re){
                    //Check if result date is with in Monday to Wednesday
                    var res_date=new Date(re);
                    if(res_date.getDay()>=4){
                        scope_obj.est_date_usa(res_date,idx,shipping_holidays_list,scope_obj);
                    }else{
                    //Receive no of shipping and calc devlivery date
                     scope_obj.UPSWebEstimate(res_date,idx,shipping_holidays_list,scope_obj,false);
                    }
                });
            }else if(ship_start.getDay()===0){
                /* Sunday Calculation */
                scope_obj.skip_holidays(ship_start,1,shipping_holidays_list,function(re){
                    var res_date=new Date(re);
                    if(res_date.getDay()>=4){
                        scope_obj.est_date_usa(res_date,idx,shipping_holidays_list,scope_obj);
                    }else{
                        //Receive no of shipping and calc devlivery date
                     scope_obj.UPSWebEstimate(res_date,idx,shipping_holidays_list,scope_obj,false);
                    }
                });
            }else{
                //console.log("Go Here");
                scope_obj.model.get("items")[idx].est_date="No Data";
               scope_obj.skip_holidays(ship_start,1,shipping_holidays_list,scope_obj.setShippingStartDate,idx,scope_obj);
            }
        },UPSWebEstimate:function(ship_date,idx,holidays,scope_obj,add_day,isIndiana){
           //Connect to UPS for USA alone
            

                var ship_address_json=scope_obj.model.toJSON().fulfillmentInfo.fulfillmentContact.address;
                var ship_zip=_.findWhere(scope_obj.model.get("items")[idx].product.properties, {'attributeFQN':  Hypr.getThemeSetting('productAttributes').shipZip});
    
                if(ship_zip!==undefined){
                    ship_zip=ship_zip.values[0].stringValue;
                }else{
                    if(scope_obj.model.get("items")[idx].product.bundledProducts.length>0){
                        var zipidx=scope_obj.model.get("items")[idx].product.bundledProducts[0].productCode+"_zipcd";
                     if(window.zipArr[zipidx]!==undefined){
                            ship_zip=window.zipArr[zipidx];
                            window.order.get("items")[idx].zipcode=ship_zip;
                        }else{
                           ship_zip='46787';
                        }
                    }else{
                        ship_zip='46787';
                    }
                }
    
               
                //Create URL for Arc.js custom route param start with s(spc=send from post code) will be shipfrom and d will be delivery (dpc=delivery post code) 
                var urlparm="?spc="+ship_zip+"&dst="+ship_address_json.stateOrProvince+"&dct="+ship_address_json.cityOrTown+"&dpc="+ship_address_json.postalOrZipCode;
                if(add_day){
                    //scope_obj.skip_holidays(ship_date,1,holidays,scope_obj.setShippingStartDate,idx,scope_obj);
                    scope_obj.skip_holidays(ship_date,1,holidays,function(res_date,idx,holidays,scope_obj){
                        var tmp_date=res_date.getFullYear()+"/"+("0" + (res_date.getMonth() + 1)).slice(-2)+"/"+("0" + res_date.getDate()).slice(-2);
                        //tmp_date=tmp_date.toISOString().slice(0,10);
                        //UPSPostBody.TimeInTransitRequest.Pickup.Date=tmp_date.replace(/\//g, '');
                        urlparm+="&sdate="+tmp_date.replace(/\//g, '');
                        //console.log(urlparm);
                $.ajax({
                    "async": true,
                    "url": "/ups-route-custom"+urlparm,
                    "method": "GET",
                    "headers": {
                    "content-type": "application/json"
                    },
                    error:function(xhr, textStatus, errorThrown){
                        scope_obj.model.get("items")[idx].est_date="No Data";
                        scope_obj.setShippingStartDate(res_date,idx,holidays,scope_obj);
                        scope_obj.renderCustomAfterShip(scope_obj);
                    },
                    success: function(res) {
                    try{
                      if(res.TimeInTransitResponse.TransitResponse!==undefined){
                          var ups_service=res.TimeInTransitResponse.TransitResponse.ServiceSummary;
                          var shipBusday=_.pluck(require.mozuData("shipBusDate"),'properties');
                          shipBusday= _.findWhere(shipBusday,{'ship_code':scope_obj.model.toJSON().fulfillmentInfo.shippingMethodCode});
                          ups_service= _.filter(ups_service,function(obj){return obj.Service.Code ==shipBusday.no_business_day; });
                          var est_ups=new Date(ups_service[0].EstimatedArrival.Arrival.Date.slice(0,4)+"/"+ups_service[0].EstimatedArrival.Arrival.Date.slice(4,6)+"/"+ups_service[0].EstimatedArrival.Arrival.Date.slice(6,9));
                          //If UPS service is ground add one day if weekend roll up to nearest monday.
                          if(shipBusday.no_business_day==="GND"){
                                    scope_obj.setShippingStartDate(res_date,idx,holidays,scope_obj);
                                     var holiday_prop=_.pluck(require.mozuData("shipUPSDate"),'properties');
                                    var shipping_holidays_list=_.pluck(holiday_prop,'holiday');
                            scope_obj.skip_holidays(est_ups,1,shipping_holidays_list,scope_obj.endUPSShipping,idx,scope_obj);
                          }else{
                                      scope_obj.setShippingStartDate(res_date,idx,holidays,scope_obj);
                                      scope_obj.model.get("items")[idx].est_date=("0" + (est_ups.getMonth() + 1)).slice(-2)+"/"+("0" + est_ups.getDate()).slice(-2)+"/"+est_ups.getFullYear();
                                      scope_obj.renderCustomAfterShip(scope_obj);
                                  }
                              }else{
                                  scope_obj.model.get("items")[idx].est_date="No Data";
                                 scope_obj.setShippingStartDate(res_date,idx,holidays,scope_obj);
                                  scope_obj.renderCustomAfterShip(scope_obj);
                              }
                              }catch(err){
                               scope_obj.model.get("items")[idx].est_date="No Data";
                               scope_obj.setShippingStartDate(res_date,idx,holidays,scope_obj);
                              scope_obj.renderCustomAfterShip(scope_obj);
                          }
                            }
                        });
                    },idx,scope_obj);
                      }else{
                        var tmp_date=ship_date.getFullYear()+"/"+("0" + (ship_date.getMonth() + 1)).slice(-2)+"/"+("0" + ship_date.getDate()).slice(-2);
                        //UPSPostBody.TimeInTransitRequest.Pickup.Date=tmp_date.replace(/\//g, '');
                         urlparm+="&sdate="+tmp_date.replace(/\//g, '');
                        //console.log(urlparm);
                        $.ajax({
                            "async": true,
                            "url": "/ups-route-custom"+urlparm,
                            "method": "GET",
                            "headers": {
                            "content-type": "application/json"
                            },
                           error:function(xhr, textStatus, errorThrown){
                                scope_obj.model.get("items")[idx].est_date="No Data";
                                 if(isIndiana){
                                    var ship_start_tmp1= ("0" + (ship_date.getMonth() + 1)).slice(-2)+"/"+("0" + ship_date.getDate()).slice(-2)+"/"+ship_date.getFullYear();
                                     window.indina_idx_arr.forEach(function(ind_idx){
                                        scope_obj.model.get("items")[ind_idx].ship_date=ship_start_tmp1;
                                    });
                                 }else{
                                    scope_obj.setShippingStartDate(ship_date,idx,holidays,scope_obj);
                                 }
                                scope_obj.renderCustomAfterShip(scope_obj);
                           },
                            success: function(res) {
                             // console.log("Done..!");
                            try{
                              if(res.TimeInTransitResponse.TransitResponse!==undefined){
                                  var ups_service=res.TimeInTransitResponse.TransitResponse.ServiceSummary;
                                  var shipBusday=_.pluck(require.mozuData("shipBusDate"),'properties');
                                  shipBusday= _.findWhere(shipBusday,{'ship_code':scope_obj.model.toJSON().fulfillmentInfo.shippingMethodCode});
                                  ups_service= _.filter(ups_service,function(obj){return obj.Service.Code ==shipBusday.no_business_day; });
                                  var est_ups=new Date(ups_service[0].EstimatedArrival.Arrival.Date.slice(0,4)+"/"+ups_service[0].EstimatedArrival.Arrival.Date.slice(4,6)+"/"+ups_service[0].EstimatedArrival.Arrival.Date.slice(6,9));
                                  //If UPS service is ground add one day if weekend roll up to nearest monday.
                                  if(shipBusday.no_business_day==="GND"){
                                    scope_obj.setShippingStartDate(ship_date,idx,holidays,scope_obj);
                                     var holiday_prop=_.pluck(require.mozuData("shipUPSDate"),'properties');
                                    var shipping_holidays_list=_.pluck(holiday_prop,'holiday');
                                    if(isIndiana){
                                         scope_obj.skip_holidays(est_ups,1,shipping_holidays_list,function(resDate){
                                           var ship_start_tmp= ("0" + (ship_date.getMonth() + 1)).slice(-2)+"/"+("0" + ship_date.getDate()).slice(-2)+"/"+ship_date.getFullYear();
                                            window.indina_idx_arr.forEach(function(ind_idx){
                                                scope_obj.model.get("items")[ind_idx].ship_date=ship_start_tmp;
                                                scope_obj.model.get("items")[ind_idx].est_date=("0" + (resDate.getMonth() + 1)).slice(-2)+"/"+("0" + resDate.getDate()).slice(-2)+"/"+resDate.getFullYear();
                                            });
                                        },idx,scope_obj);
                                        scope_obj.renderCustomAfterShip(scope_obj);
                                    }else{
                                        scope_obj.skip_holidays(est_ups,1,shipping_holidays_list,scope_obj.endUPSShipping,idx,scope_obj);
                                    }
                                  }else{
                                     scope_obj.setShippingStartDate(ship_date,idx,holidays,scope_obj);
                                     scope_obj.model.get("items")[idx].est_date=("0" + (est_ups.getMonth() + 1)).slice(-2)+"/"+("0" + est_ups.getDate()).slice(-2)+"/"+est_ups.getFullYear();
                                     if(isIndiana){
                                        window.indina_idx_arr.forEach(function(ind_idx){
                                            scope_obj.model.get("items")[ind_idx].est_date=("0" + (est_ups.getMonth() + 1)).slice(-2)+"/"+("0" + est_ups.getDate()).slice(-2)+"/"+est_ups.getFullYear();
                                        });
                                     }
                                      //scope_obj.model.get("items")[idx].est_date=est_ups.toISOString().slice(0,10).replace(/\-/g,"/");
                                      //console.log("Date "+scope_obj.model.get("items")[idx].est_date);
                                      scope_obj.renderCustomAfterShip(scope_obj);
                                  }
                              }else{
                                  scope_obj.model.get("items")[idx].est_date="No Data";
                                  scope_obj.setShippingStartDate(ship_date,idx,holidays,scope_obj);
                                  scope_obj.renderCustomAfterShip(scope_obj);
                              }
                              }catch(err){
                                console.log("error ");
                                console.log(err);
                               scope_obj.model.get("items")[idx].est_date="No Data";
                               scope_obj.setShippingStartDate(ship_date,idx,holidays,scope_obj);
                               scope_obj.renderCustomAfterShip(scope_obj);
                            }
                            }
                        });
                }
        },endUPSShipping:function(ship_date,idx,holidays,scope_obj){
            scope_obj.model.get("items")[idx].est_date=("0" + (ship_date.getMonth() + 1)).slice(-2)+"/"+("0" + ship_date.getDate()).slice(-2)+"/"+ship_date.getFullYear();
             //scope_obj.model.get("items")[idx].est_date=ship_date.toISOString().slice(0,10).replace(/\-/g,"/");
             scope_obj.renderCustomAfterShip(scope_obj);
        },
        // override loading button changing at inappropriate times
        handleLoadingChange: function () { }
    });

    var ShippingAddressView = CheckoutStepView.extend({
        templateName: 'modules/checkout/step-shipping-address',
        isAddressEditing : "0",
        autoUpdate: [
            'firstName',
            'lastNameOrSurname',
            'companyOrOrganization', 
            'address.address1',
            'address.address2',
            'address.address3',
            'address.cityOrTown',
            'address.countryCode',
            'address.stateOrProvince',
            'address.postalOrZipCode',
            'address.addressType',
            'phoneNumbers.home',
            'contactId',
            'email'
        ],
        renderOnChange: [
            'address.countryCode',
            'contactId'
        ],
        additionalEvents:{
            "click a#shipping-addr-edit-link": "updateAddressEditingProperty"
        },
        render:function(){
              if( window.ga_addressprefilled !== undefined && ga!==undefined && window.ga_addressprefilled === true && window.ga_sent_step1 === undefined ){
                ga('ec:setAction','checkout', {'step': 1});
                
                ga('send', 'event','Enhanced-Ecommerce','initShippingInformation',{'nonInteraction': true});
                    
                    ga('ec:setAction','ShippingInformation', {
                    'step': 1,
                    'option': 'ShippingInfo'
                    }); 
                
                ga('send', 'event','Enhanced-Ecommerce','ShippingInformation');
                    window.ga_sent_step1 = true;
                  }

            CheckoutStepView.prototype.render.apply(this);
        },
        updateAddressEditingProperty: function(){
          /*   $('.mz-contactselector-contact.mz-contactselector-new.mz-checkoutform-shipping').css('display','table');
            $('.mz-contactselector .mz-addresssummary').hide();   */
            this.model.set("isAddressEditing",  "1");
            this.render();
        },
        beginAddContact: function () {
            this.model.set('contactId', 'new');
        },next:function(){
            this.validateShipItem(this);
            window.ship_changed=true;
        },validateShipItem:function(scope_obj){
            //Validate shipping address before moving to next step. Check for tenant~safety-j(USA only) and tenant~safety-k(USA 48 states) only.
            var me = scope_obj;
            try{
                var err_msg="<ul class='is-showing mz-errors'>";
                //Checking condition for non USA shipping address have any USA or USA48 products.
                if((this.model.toJSON().address.countryCode!=="US" && window.usa_only.length>0) || (this.model.toJSON().address.countryCode!=="US" && window.usa_48.length>0)){
                    err_msg+="<li class='mz-error-item'>You have items that can only ship to an address in the USA</li>";
                    var restricted_items=_.union(window.usa_only, window.usa_48);
                    restricted_items.forEach(function(el){
                        err_msg+="<li class='mz-error-item'><strong>"+el.name+"</strong></li>";
                    });
                    err_msg+="<li>Please remove these items from your cart or change your ship to address</li></ul>";
                    $(".mz-messagebar").html(err_msg);
                     $("html, body").animate({ scrollTop: 0}, "slow");
                }else if(this.model.toJSON().address.countryCode=="US" && window.usa_48.length>0 && window.nonlow48.indexOf(this.model.toJSON().address.stateOrProvince)>-1){
                     err_msg+="<li class='mz-error-item'>You have items that can only ship to an address in the Contiguous U.S.</li>";
                     window.usa_48.forEach(function(el){
                        err_msg+="<li class='mz-error-item'><strong>"+el.name+"</strong></li>";
                    });
                    err_msg+="<li>Please remove these items from your cart or change your ship to address</li></ul>";
                    $(".mz-messagebar").html(err_msg);
                    $("html, body").animate({ scrollTop: 0}, "slow");
                }else{
                    me.editing.savedCard = false;
                     this.model.set("isAddressEditing",  "0");
                if( ga!==undefined && window.ga_sent_step1 === undefined ){
                ga('ec:setAction','checkout', {'step': 1});
                
                ga('send', 'event','Enhanced-Ecommerce','initShippingInformation',{'nonInteraction': true});
                    
                    ga('ec:setAction','ShippingInformation', {
                    'step': 1,
                    'option': 'ShippingInfo'
                    });
                
                ga('send', 'event','Enhanced-Ecommerce','ShippingInformation');
                    window.ga_sent_step1 = false;
                  }
                    _.defer(function () {
                        me.model.next();
                    });
                }
            }catch(err){
                me.editing.savedCard = false;
                 this.model.set("isAddressEditing",  "0");
                _.defer(function () {
                    me.model.next();
                });
            }
        }
    });

    var ShippingInfoView = CheckoutStepView.extend({
        templateName: 'modules/checkout/step-shipping-method',
        renderOnChange: [
            'availableShippingMethods'
        ],
        initialize:function(){
            window.ga_shippingmethod=false;
        },
        render:function(){
             //restrict tenant~safety-d and tenant~safety-k products in grond level only 
             if( window.ga_shippingmethodfilled !== undefined && window.ga_shippingmethodfilled === true && ga!==undefined && window.ga_shippingmethod_sent === undefined ){
                
                var gashipmethod =  this.model.attributes.shippingMethodName;
                ga('ec:setAction','checkout', {'step': 2});
                
                ga('send', 'event','Enhanced-Ecommerce','initShippingMethod',{'nonInteraction': true});
                
                ga('ec:setAction','ShippingMethod', {
                'step': 2,
                'option': gashipmethod 
                });
                
                ga('send', 'event','Enhanced-Ecommerce','ShippingMethod');
               
               window.ga_shippingmethod_sent = true;
             }
            try{
                var order_item_list=require.mozuData("checkout").items;
                window.ground_only="";
                 order_item_list=_.pluck(order_item_list,"product");
                 window.ground_only=_.filter(order_item_list, function(obj) {
                     var ground_tmp=_.where(obj.properties, {'attributeFQN': Hypr.getThemeSetting('productAttributes').groundOnly});
                      if(ground_tmp.length>0){
                        if(ground_tmp[0].values[0].value){
                            return obj;
                        }
                    }
                });
                 if((window.ground_only.length>0||window.usa_48.length>0) && this.model.toJSON().fulfillmentContact.address.countryCode==="US"){
                    var ship_ground=_.where(this.model.get("availableShippingMethods"),{'shippingMethodCode':'24'});
                    if(ship_ground.length>0){
                        this.model.set("availableShippingMethods",ship_ground);
                    }
                 }
            }catch(err){
                console.log("Error On render");
                console.log(err);
            }
            CheckoutStepView.prototype.render.apply(this);
        },additionalEvents: {
            "change [data-mz-shipping-method]": "updateShippingMethod"
        },
        updateShippingMethod: function (e) {
            this.model.updateShippingMethod(this.$('[data-mz-shipping-method]:checked').val());
            //Set flag for checking coupon
            window.ship_changed=true;
        }
    });

    var poCustomFields = function() {
        var fieldDefs = [];
        var isEnabled = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder &&
            HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.isEnabled;

            if (isEnabled) {
                var siteSettingsCustomFields = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.customFields;
                siteSettingsCustomFields.forEach(function(field) {
                    if (field.isEnabled) {
                        fieldDefs.push('purchaseOrder.pOCustomField-' + field.code);
                    }
                }, this);
            }
        return fieldDefs;
    };

    var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
    var pageContext = require.mozuData('pagecontext');
    var BillingInfoView = CheckoutStepView.extend({
        templateName: 'modules/checkout/step-payment-info',
        autoUpdate: [
            'savedPaymentMethodId',
            'paymentType',
            'card.paymentOrCardType',
            'card.cardNumberPartOrMask',
            'card.nameOnCard',
            'card.expireMonth',
            'card.expireYear',
            'card.cvv',
            'card.isCardInfoSaved',
            'check.nameOnCheck',
            'check.routingNumber',
            'check.checkNumber',
            'isSameBillingShippingAddress',
            'billingContact.firstName',
            'billingContact.lastNameOrSurname',
            'billingContact.companyOrOrganization',   
            'billingContact.address.address1',
            'billingContact.address.address2',
            'billingContact.address.address3',
            'billingContact.address.cityOrTown',
            'billingContact.address.countryCode',
            'billingContact.address.stateOrProvince',
            'billingContact.address.postalOrZipCode',
            'billingContact.phoneNumbers.home',
            'billingContact.email',
            'creditAmountToApply',
            'digitalCreditCode',
            'purchaseOrder.purchaseOrderNumber',
            'purchaseOrder.paymentTerm'
        ].concat(poCustomFields()),
        renderOnChange: [
            'billingContact.address.countryCode',
            'paymentType',
            'isSameBillingShippingAddress',
            'usingSavedCard',
            'savedPaymentMethodId'
        ],
        additionalEvents: {
            "change [data-mz-digital-credit-enable]": "enableDigitalCredit",
            "change [data-mz-digital-credit-amount]": "applyDigitalCredit",
            "change [data-mz-digital-add-remainder-to-customer]": "addRemainderToCustomer",
            "change [name='paymentType']": "resetPaymentData",
            "change [data-mz-purchase-order-payment-term]": "updatePurchaseOrderPaymentTerm",
            "keyup [data-mz-value='card.cardNumberPartOrMask']": "setCardType",
            "change [data-mz-value='card.expireMonth']":"showSaveCardOption",
            "change [data-mz-value='card.expireYear']" :"showSaveCardOption"
        },showSaveCardOption:function(){
            if(require.mozuData("user").isAuthenticated){
                $(".mz-payment-credit-card-savepayment-row").css("display","block");
            }
        },setCardType:function(){
            var cardNumber = $('[data-mz-value="card.cardNumberPartOrMask"]').val().trim();
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
            switch(cardType){
                    case 'visa':
                        $('.selected-card-icon').html('<img src="../resources/images/Visa.svg?">');
                        $('select#mz-payment-credit-card-type option[value="VISA"]').attr('selected','selected');
                        // $('select#mz-payment-credit-card-type').change();
                        this.model.set('card.paymentOrCardType','VISA');
                    break;
                    case 'amex':
                        $('.selected-card-icon').html('<img src="../resources/images/Amex.svg"/>');
                        $('select#mz-payment-credit-card-type option[value="AMEX"]').attr('selected','selected');
                        this.model.set('card.paymentOrCardType','AMEX');
                        // $('select#mz-payment-credit-card-type').change();
                    break;
                    case 'mastercard':
                        $('.selected-card-icon').html('<img src="../resources/images/Mastercard.svg"/>');
                        $('select#mz-payment-credit-card-type option[value="MC"]').attr('selected','selected');
                        this.model.set('card.paymentOrCardType','MC');
                        // $('select#mz-payment-credit-card-type').change();
                    break;
                    case 'discover':
                        $('.selected-card-icon').html('<img src="../resources/images/Discover.svg"/>');
                        $('select#mz-payment-credit-card-type option[value="DISCOVER"]').attr('selected','selected');
                        // $('select#mz-payment-credit-card-type').change();
                        this.model.set('card.paymentOrCardType','DISCOVER');
                    break;
                    default:
                        $('.selected-card-icon').html('<i class="fa fa-2x fa-credit-card"></i>');
                        $('select#mz-payment-credit-card-type option').removeAttr('selected');
                        if(cardNumber.length>3){
                            $('[data-mz-validationmessage-for="card.cardNumberPartOrMask"]').text("Card invalid. We support Visa, Amex, Master card, Discover");
                            setTimeout(function(){
                                $('[data-mz-validationmessage-for="card.cardNumberPartOrMask"]').text("");
                            },5000);
                        }else{
                             $('[data-mz-validationmessage-for="card.cardNumberPartOrMask"]').text("");
                        }
                        // $('select#mz-payment-credit-card-type').change();
                    break;
                }
                //Display Save card option while login user editing card details.
                if(require.mozuData("user").isAuthenticated){
                    $(".mz-payment-credit-card-savepayment-row").css("display","block");
                }
                this.model.set('card.nameOnCard', this.model.get('billingContact.firstName')+' '+this.model.get('billingContact.lastNameOrSurname'));
        },
        initialize: function () {
            // this.addPOCustomFieldAutoUpdate();
            this.listenTo(this.model, 'change:digitalCreditCode', this.onEnterDigitalCreditCode, this);
            this.listenTo(this.model, 'orderPayment', function (order, scope) {
                    this.render();
            }, this);
            this.listenTo(this.model, 'change:savedPaymentMethodId', function (order, scope) {
                $('[data-mz-saved-cvv]').val('').change();
                this.render();
            }, this);
            this.codeEntered = !!this.model.get('digitalCreditCode');

            this.listenTo(this.model, 'removeAmazonPayment', function() {
                  $("#changeAwsAddress").hide();
                  $("#addressEdit").show();
            });
            
        },resetCartForm:function () {
            this.model.unset('card.cardNumberPartOrMask');
            this.model.unset('card.expireMonth');
            this.model.unset('card.expireYear');
        },
        resetPaymentData: function (e){
            try{
                if($(e.currentTarget).val() === "CreditCard"){
                    if(this.model.get("lastChoosedCard") && this.model.get("lastChoosedCard")!=="0"){
                        this.model.setSavedPaymentMethod(this.model.get("lastChoosedCard")); 
                        this.model.set('usingSavedCard', true);
                    }else{
                         if(require.mozuData("user").isAuthenticated && this.model.get("lastChoosedCard") ===undefined){
                            var userSavedCard_Custom=require.mozuData("checkout").customer.cards;
                            if(userSavedCard_Custom.length>0){
                                var primarySavedCard_Custom=_.findWhere(userSavedCard_Custom,{isDefaultPayMethod: true});
                                if(primarySavedCard_Custom){
                                    this.model.set('savedPaymentMethodId',primarySavedCard_Custom.id);
                                }else{
                                    this.model.set('savedPaymentMethodId',userSavedCard_Custom[0].id);
                                }
                            }else{
                                this.resetCartForm();
                            }
                         }else{
                             this.resetCartForm();
                         }
                    }
                    
                }else{
                    this.resetCartForm();
                }
             }catch(err){
                    console.log("Error on resetPaymentData"+err);
                    this.resetCartForm();
            }
        },updatePurchaseOrderPaymentTerm: function(e) {
            this.model.setPurchaseOrderPaymentTerm(e.target.value);
        },
        render: function() {
             var SaveCardID=$("select.mz-payment-select-saved-payments").val();
            if(typeof SaveCardID ==='undefined'&& (this.model.get("lastChoosedCard") && this.model.get("lastChoosedCard")!=="0")){
                SaveCardID="123";
            }
            this.model.set("card.CCSaveFlag",SaveCardID);
            preserveElements(this, ['.v-button','.p-button', '#amazonButonPaymentSection'], function() {
                CheckoutStepView.prototype.render.apply(this, arguments);
            });
            var status = this.model.stepStatus();
            if ($("#AmazonPayButton").length > 0 && $("#amazonButonPaymentSection").length > 0)
                $("#AmazonPayButton").removeAttr("style").appendTo("#amazonButonPaymentSection");

            if (visaCheckoutSettings.isEnabled && !this.visaCheckoutInitialized && this.$('.v-button').length > 0) {
                window.onVisaCheckoutReady = _.bind(this.initVisaCheckout, this);
                require([pageContext.visaCheckoutJavaScriptSdkUrl]);
                this.visaCheckoutInitialized = true;
            }
            this.setQuotePaymentData(); 
            try{
                if(this.model.get("isSameBillingShippingAddress")===undefined && this.model.parent.toJSON().fulfillmentInfo.fulfillmentContact.address.address1!==undefined && this.model.parent.toJSON().fulfillmentInfo.fulfillmentContact.address.address1.length>2){
                    this.model.set("isSameBillingShippingAddress",true);
                }
            }catch(err){
                console.log(err);
            }
            var today=new Date();
                var cardselcval = $('.mz-payment-select-saved-payments option:selected').val();
                
                var yearfield=$('#mz-payment-expiration-year');
                var thisyear=today.getFullYear();  
                var currentyr=0;
                if(this.model.get('card')){
                    currentyr=this.model.get('card').get('expireYear');
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
        setQuotePaymentData: function(e){
            var paymentType = $('[data-mz-payment-type]:checked').val();
            if(paymentType === 'Check'){
                this.model.set({'check.nameOnCheck':'Quote Order'});
                this.model.set({'check.routingNumber':'1111111111'});
                this.model.set({'check.checkNumber':'2222222222'});
            }
        },
        updateAcceptsMarketing: function(e) {
            this.model.getOrder().set('acceptsMarketing', $(e.currentTarget).prop('checked'));
        },
        updatePaymentType: function(e) {
            var newType = $(e.currentTarget).val();
            var isSavedCard_custom=e.currentTarget.hasAttribute('data-mz-saved-credit-card') || ( $(e.currentTarget).val() === "CreditCard" && this.model.get("lastChoosedCard") && this.model.get("lastChoosedCard")!=="0");
            this.model.set('usingSavedCard', isSavedCard_custom);
            this.model.set('paymentType', newType);
        },
        beginEditingCard: function() {
            var me = this;
            if (!this.model.isExternalCheckoutFlowComplete()) {
                this.editing.savedCard = true;
                this.render();
                try{
                    if($('input#paywithamazon').prop('disabled')){
                        $('input#paywithamazon').removeProp('disabled');
                    }
                }catch(err){
                    console.log(err);
                }
            } else {
                //this.cancelExternalCheckout();
            }
        },
        beginEditingExternalPayment: function () {
            var me = this;
            if (this.model.isExternalCheckoutFlowComplete()) {
                this.doModelAction('cancelExternalCheckout').then(function () {
                    me.editing.savedCard = true;
                    me.render();
                });
            }
        },
        beginEditingBillingAddress: function() {
            this.editing.savedBillingAddress = true;
            this.render();
        },
        beginApplyCredit: function () {
            this.model.beginApplyCredit();
            this.render();
        },
        cancelApplyCredit: function () {
            this.model.closeApplyCredit();
            this.render();
        },
        cancelExternalCheckout: function () {
            var me = this;
            this.doModelAction('cancelExternalCheckout').then(function () {
                me.editing.savedCard = false;
                me.render();
            });
        },
        finishApplyCredit: function () {
            var self = this;
            this.model.finishApplyCredit().then(function() {
                self.render();
            });
        },
        removeCredit: function (e) {
            var self = this,
                id = $(e.currentTarget).data('mzCreditId');
            this.model.removeCredit(id).then(function () {
                self.render();
            });
        },
        getDigitalCredit: function (e) {
            var self = this;
            this.$el.addClass('is-loading');
            this.model.getDigitalCredit().ensure(function () {
                self.$el.removeClass('is-loading');
            });
        },
        stripNonNumericAndParseFloat: function (val) {
            if (!val) return 0;
            var result = parseFloat(val.replace(/[^\d\.]/g, ''));
            return isNaN(result) ? 0 : result;
        },
        applyDigitalCredit: function(e) {
            var val = $(e.currentTarget).prop('value'),
                creditCode = $(e.currentTarget).attr('data-mz-credit-code-target');  //target
            if (!creditCode) {
                //console.log('checkout.applyDigitalCredit could not find target.');
                return;
            }
            var amtToApply = this.stripNonNumericAndParseFloat(val);

            this.model.applyDigitalCredit(creditCode, amtToApply, true);
            this.render();
        },
        onEnterDigitalCreditCode: function(model, code) {
            if (code && !this.codeEntered) {
                this.codeEntered = true;
                this.$el.find('button').prop('disabled', false);
            }
            if (!code && this.codeEntered) {
                this.codeEntered = false;
                this.$el.find('button').prop('disabled', true);
            }
        },
        enableDigitalCredit: function(e) {
            var creditCode = $(e.currentTarget).attr('data-mz-credit-code-source'),
                isEnabled = $(e.currentTarget).prop('checked') === true,
                targetCreditAmtEl = this.$el.find("input[data-mz-credit-code-target='" + creditCode + "']"),
                me = this;

            if (isEnabled) {
                targetCreditAmtEl.prop('disabled', false);
                me.model.applyDigitalCredit(creditCode, null, true);
            } else {
                targetCreditAmtEl.prop('disabled', true);
                me.model.applyDigitalCredit(creditCode, 0, false);
                me.render();
            }
        },
        addRemainderToCustomer: function (e) {
            var creditCode = $(e.currentTarget).attr('data-mz-credit-code-to-tie-to-customer'),
                isEnabled = $(e.currentTarget).prop('checked') === true;
            this.model.addRemainingCreditToCustomerAccount(creditCode, isEnabled);
        },
        handleEnterKey: function (e) {
            var source = $(e.currentTarget).attr('data-mz-value');
            if (!source) return;
            switch (source) {
                case "creditAmountApplied":
                    return this.applyDigitalCredit(e);
                case "digitalCreditCode":
                    return this.getDigitalCredit(e);
            }
        },
        /* begin visa checkout */
        initVisaCheckout: function () {
            var me = this;
            var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
            var apiKey = visaCheckoutSettings.apiKey || '0H1JJQFW9MUVTXPU5EFD13fucnCWg42uLzRQMIPHHNEuQLyYk';
            var clientId = visaCheckoutSettings.clientId || 'mozu_test1';
            var orderModel = this.model.getOrder();


            if (!window.V) {
                //console.warn( 'visa checkout has not been initilized properly');
                return false;
            }
            // on success, attach the encoded payment data to the window
            // then call the sdk's api method for digital wallets, via models-checkout's helper
            window.V.on("payment.success", function(payment) {
                //console.log({ success: payment });
                me.editing.savedCard = false;
                me.model.parent.processDigitalWallet('VisaCheckout', payment);
            });



            window.V.init({
                apikey: apiKey,
                clientId: clientId,
                paymentRequest: {
                    currencyCode: orderModel.get('currencyCode'),
                    subtotal: "" + orderModel.get('subtotal')
                }
            });
        }
        /* end visa checkout */
    });

    var CouponView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/coupon-code-field',
        couponsData:{},
        handleLoadingChange: function (isLoading) {
            // override adding the isLoading class so the apply button
            // doesn't go loading whenever other parts of the order change
        },
        additionalEvents:{
            "click a.remove-coupon-link" : "removeCoupon"
        },
        initialize: function () {
            var me = this;
            this.listenTo(this.model, 'change:couponCode', this.onEnterCouponCode, this);
            this.codeEntered = !!this.model.get('couponCode');
            this.$el.on('keypress', 'input', function (e) {
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

                var order_discount_code=_.filter(this.model.get('orderDiscounts'),function(dis){ return dis.couponCode!==undefined;});
                var order_discount_coupons=_.uniq(_.pluck(order_discount_code,'couponCode'));

                var shipping_discount=_.filter(this.model.get('shippingDiscounts'),function(dis){ return dis.discount.couponCode!==undefined;});
                var ship_discount_tmp=_.pluck(shipping_discount,'discount');
                var shipping_discount_coupons=_.uniq(_.pluck(ship_discount_tmp,'couponCode'));

                var product_discount= _.flatten(_.pluck(this.model.get('items'), 'productDiscounts'));
                var product_discount_tmp=_.filter(product_discount,function (dis) {
                    return dis.couponCode !==undefined;
                });
                var product_discount_coupons=_.uniq(_.pluck(product_discount_tmp,"couponCode"));

                var full_coupon_coupon_code=[];
                full_coupon_coupon_code=full_coupon_coupon_code.concat(order_discount_coupons).concat(shipping_discount_coupons).concat(product_discount_coupons);

                var lower_coupon_codes=[];
                _.each(full_coupon_coupon_code,function (item) {
                    lower_coupon_codes.push(item.toLowerCase());
                });
                var last_applied=$.cookie('lastCoupon');
                if(full_coupon_coupon_code.length>1){
                    if(last_applied !==undefined && last_applied.length>0 && _.indexOf(lower_coupon_codes,last_applied)>-1){
                        var coupon_remove=_.without(full_coupon_coupon_code,full_coupon_coupon_code[_.indexOf(lower_coupon_codes,last_applied)]);
                        _.each(coupon_remove,function (remove_coupon) {
                            me.model.apiRemoveCoupon(remove_coupon).then(function(res){
                                me.deleteCoupon(full_coupon_coupon_code,res.data,me,1);
                            });
                        });
                    }else{
                        if(last_applied !==undefined && last_applied ===""){
                            _.each(full_coupon_coupon_code,function (remove_coupon) {
                                 me.model.apiRemoveCoupon(remove_coupon).then(function(res){
                                    me.deleteCoupon(full_coupon_coupon_code,res.data,me,1);
                                 });
                            });
                        }else{
                            var coupon_tobe_removed=_.rest(full_coupon_coupon_code);
                            $.cookie("lastCoupon", full_coupon_coupon_code[0].toLowerCase(), {  path: '/',expires: 5 });
                            _.each(coupon_tobe_removed,function (remove_coupon) {
                                me.model.apiRemoveCoupon(remove_coupon).then(function(res){
                                    me.deleteCoupon(full_coupon_coupon_code,res.data,me,1);
                                });
                            });
                        }
                    }
                }
                if(full_coupon_coupon_code.length===1 && last_applied !==undefined && last_applied ===""){
                    _.each(full_coupon_coupon_code,function (remove_coupon) {
                         me.model.apiRemoveCoupon(remove_coupon).then(function(res){
                         });
                    });
                }

            }catch(err){
                console.log("Error on coupon init",err);
            }
        },deleteCoupon:function(full_code,resp,scope,counter){
            //Check if any new coupons are getting added by mozu if we removed one max 4 recursion.
            var me=scope;
            var cartId = this.model.id;
            console.log("Received "+resp);
            var order_discount_code=_.filter(resp.orderDiscounts,function(dis){ return dis.couponCode!==undefined;});
            var order_discount_coupons=_.uniq(_.pluck(order_discount_code,'couponCode'));

            var shipping_discount=_.filter(resp.shippingDiscounts,function(dis){ return dis.discount.couponCode!==undefined;});
            var ship_discount_tmp=_.pluck(shipping_discount,'discount');
            var shipping_discount_coupons=_.uniq(_.pluck(ship_discount_tmp,'couponCode'));

            var product_discount= _.flatten(_.pluck(resp.items, 'productDiscounts'));
            var product_discount_tmp=_.filter(product_discount,function (dis) {
                return dis.couponCode !==undefined;
            });
            var product_discount_coupons=_.uniq(_.pluck(product_discount_tmp,"couponCode"));

            var full_coupon_coupon_code=[];
            full_coupon_coupon_code=full_coupon_coupon_code.concat(order_discount_coupons).concat(shipping_discount_coupons).concat(product_discount_coupons);
            var newly_added=_.difference(full_coupon_coupon_code,full_code);

            if(newly_added.length>0 && counter < 5){
                me.model.apiRemoveCoupon(newly_added[0]).then(function(res){
                   me.deleteCoupon(full_code,res.data,me,counter++);
                });
            }else{
                setTimeout(function () {
                    me.render();    
                },3000);
            }
        },onEnterCouponCode: function (model, code) {
            if (code && !this.codeEntered) {
                this.codeEntered = true;
                this.$el.find('button').prop('disabled', false);
            }
            if (!code && this.codeEntered) {
                this.codeEntered = false;
                this.$el.find('button').prop('disabled', true);
            }
        },render:function () {
          this.syncCouponView();
          Backbone.MozuView.prototype.render.call(this);
        },autoUpdate: [
            'couponCode'
        ],setCookieCoupon:function(couponCode,flag){
            var self = this;
                var getExistsData = $.cookie('coupon');
               if(getExistsData && getExistsData!== ""){
                  self.couponsData = JSON.parse(getExistsData);
               }
               self.couponsData[couponCode]= flag;
               $.cookie("coupon", JSON.stringify(self.couponsData), {  path: '/',expires: 7 });
               //Check
        },
        addCoupon: function (e) {
            // add the default behavior for loadingchanges
            // but scoped to this button alone
            var self = this;
            var self_me = this;

            var disFlag = "",autoDis="",shipDisFlag="";
            var couponCode = $('#coupon-code').val().toLowerCase();
           /* var couponArr = self.model.get('couponCodes');
            if(couponArr.indexOf(couponCode.toLowerCase()) < 0){
                this.setCookieCoupon(couponCode,false);
            }*/
            var lowerCode = this.$el.find('#coupon-code').val().toLowerCase().trim();

            this.$el.addClass('is-loading');
            $('#coupon-code').prop('disabled',true);
            //check for single or multiple coupon code environment
            if(!Hypr.getThemeSetting('couponCodeMultiple')){
            	//check for product discounts
            	$(self.model.apiModel.data.items).each(function(k,v){
                    var isPromoCode=_.pluck(v.productDiscounts,"couponCode");
            		if(v.productDiscounts.length>0 && isPromoCode.length>0){
                        if(isPromoCode[0]!==undefined){
            			     disFlag = true;                            
                        }
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

                if(self.model.get('shippingDiscounts').length > 0 ){
                    $(self.model.get('shippingDiscounts')).each(function(k,v){
                        if(v.discount.couponCode !== null && v.discount.couponCode !== undefined){
                            shipDisFlag = false;
                        }else{
                            shipDisFlag = true;
                        }
                    });
                }else{
                     shipDisFlag = true;
                }

            	if(autoDis === false || disFlag ||shipDisFlag===false ){
            		self.model.unset('couponCode'); //unset couponCode after applying one coupon code
	            	setTimeout(function(){
	            		$('div.mz-messagebar:eq(0)').html('<ul class="is-showing mz-errors"><li class="mz-error-item">Sorry, only one promo code per order.</li></ul>');
	            	},1000);
	            	$('html, body').animate({
                    scrollTop: $('div.mz-messagebar:eq(0)').offset().top-100
                }, 300);
            	}
            }

      			var customerType = "",
                  themeSettings = require('hyprlivecontext').locals.themeSettings;
      			//fetch the customer type attribute of signed in user
      			if(pageContext.user.isAuthenticated){
      				var customerAttributes_custom = require.mozuData('customer').customer.attributes;

      				$.each(customerAttributes_custom,function(i,v){
      					if(customerAttributes_custom[i].fullyQualifiedName === "tenant~customertype" && customerAttributes_custom[i].values[0] === "MLT"){
      						customerType = customerAttributes_custom[i].values[0];
      					}
      				});
      			}
      			//coupon code - SMTPD(Shindigz Military Promotional Discount) applied for only registered user's
      			//if user already in military customer segment(used custom attribute-tenant~customertype) - addCoupon else
      			//verify the user with sheerID, add verified user to military customer segment and add coupon(applies discount)
      			if((lowerCode === 'smtpd' && customerType === "MLT" && pageContext.user.isAuthenticated) || lowerCode !== 'smtpd'){
      				this.model.addCoupon().ensure(function() {
      					self_me.$el.removeClass('is-loading');
                        if(self_me.checkCouponStatus(couponCode)){
                            $.cookie("lastCoupon",couponCode, {  path: '/',expires: 5 });
                        }
                          setTimeout(function(){
                              self_me.model.unset('couponCode');
                              self_me.render();
                          },100);

      				});
      				customerType = "";
      			}else if(pageContext.user.isAuthenticated && customerType === "" && lowerCode === "smtpd"){
      				// Get the modal
      				var modal = document.getElementById('myModal');

      				$('span.close').click(function(){

      					if(document.getElementById('asset_verify') !== null){
      						$('iframe#asset_verify').remove();
      					}

      					modal.style.display = "none";
      					setTimeout(function(){
                  self_me.$el.removeClass('is-loading');
                  self_me.model.unset('couponCode');
                  self_me.render();
      					},500);
      				});

              $('input[name="servicetype"]').on('change',function(){
                  if($('input[name="servicetype"]:checked').val() === "VETERAN"){
                      $('#discharge_div').show();
                  }else{
                      $('#discharge_div').hide();
                  }
              });

      				// When the user clicks anywhere outside of the modal, close it
      				window.onclick = function(event) {
      					if (event.target == modal) {
      						if(document.getElementById('asset_verify') !== null){
      							$('iframe#asset_verify').remove();
      						}
      						modal.style.display = "none";
      						setTimeout(function(){
                    self_me.$el.removeClass('is-loading');
      							self_me.model.unset('couponCode');
      							self_me.render();
      						},500);
      					}
      				};

              $('#firstname,#lastname,#email,#birthdate,#separationdate').on('change keypress keyup',function(e){
                  if($(this).val() !== ""){
                      $(this).next().hide();
                  }
              });

              //append datepicker to date of birth and separation date

              $("#ref_verify_div #birthdate,#ref_verify_div #separationdate").attr("data-date-format","yyyy-dd-mm");
              $("#ref_verify_div #birthdate,#ref_verify_div #separationdate").datetimepicker({
                  //language:  'en',
                  weekStart: 1,
                  todayBtn:  1,
                  autoclose: 1,
                  todayHighlight: 1,
                  startView: 2,
                  minView: 2,
                  forceParse: 0
              });

      				$('#ref_verify_div').css('display','table-cell');

      				modal.style.display = "block"; //dialog display

      				$('#verify-military').click(function(e){
      					$('#verify-military').addClass('is-loading');

                  var arr_req_field = ['#firstname','#lastname','#email','#birthdate','#separationdate'];
                  var err_flag,x,y,z;
                  //var pattern_dob_sd = /^\d{4}-\d{2}-\d{2}$/g;

                  var pat_dob_sep_date = /(?:19|20|21)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))/g;
                  var email_patt = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/g;

                  $(arr_req_field).each(function(k,v){

                      //shows error message on field blank else hide
                      if($(v).val() === ""){$(v).next().show();}else{$(v).next().hide();err_flag=true;}
                      //check dob and separation date pattern for yyyy-mm-dd
                      if(k === 2 && email_patt.test($(v).val())){
                          x = true;
                      }else if(k === 2 && !email_patt.test($(v).val())){
                          err_flag = false;$(v).next().show();
                      }
                      if(k === 3 && pat_dob_sep_date.test($(v).val())){
                          y = true;
                      }else if(k === 3 && !pat_dob_sep_date.test($(v).val())){
                          err_flag = false;$(v).next().text("Please Enter Valid Date").show();
                      }
                      if(k==4 && $('#discharge_div').css('display') !== "none"){
                          if(pat_dob_sep_date.test($(v).val())){
                              z = true;
                          }else{
                              err_flag = false;$(v).next().show();
                          }
                      }

                  });

                  if(x && y || z && $('#discharge_div').css('display') !== "none"){
                      err_flag = true;
                  }
        					var url = Hypr.getThemeSetting('sheerIDAuthUrl'); // the script where you handle the form input.
        					//serialized form data
        					var post_data = "firstname="+$('#firstname').val()+"&lastname="+$('#lastname').val()+"&servicetype="+$('input[name="servicetype"]:checked').val()+"&email="+$("#email").val()+"&birthdate="+$('#birthdate').val()+"&separationdate="+$('#separationdate').val()+"&organizationId="+$('select#organizationId option:selected').text();

                    if(err_flag){
                        $('<div></div>').addClass('page-loading').appendTo(document.body);
                        $('#verify-military').attr('value','PLEASE WAIT');
              					$.ajax({
              					   type: "POST",
              					   url: url,
              					   dataType: 'json',
              					   data: post_data,
              					   success: function(data)
              					   {
              						   //if instant verification results true the customer will be added to the MLT- customer segment
              						   if(data.result === true){
                                var obj = {
                                        "attributes": [
                                            {
                                             "attributeDefinitionId": Hypr.getThemeSetting('customerType'),
                                             "fullyQualifiedName": "tenant~customertype",
                                             "values": ['MLT']
                                            }
                                        ],
                                        "emailAddress": pageContext.user.email,
                                        "lastName": pageContext.user.lastName,
                                        "firstName": pageContext.user.firstName
                                };

                                api.request('PUT','/api/commerce/customer/accounts/'+pageContext.user.accountId+'',obj).then(
                                function(res){
                                    console.log(res);
                                });

          							        self_me.model.addCoupon();
                                $('.page-loading').remove();
                                $('#verify-military').attr('value','SUBMIT');
							                  $('div#model-sheerid').html('Discount Applied. Thank YOU');

              								setTimeout(function(){
              									self_me.model.unset('couponCode');
              									self_me.render();
              								},2000);
              							}
              						}, //instant verification failed condition, the customer will be asked to upload the supporting document
              						error: function(data){
              							var html_data = data.responseText;
              							//console.log(html_data);
              							$('div#model-sheerid').append(html_data);
              							$('div#model-sheerid').html("");
              							$('div#model-sheerid').css('display','none');
              							$(function(){
              								$('<iframe id="asset_verify" style="background-color:#fefefe;margin:15%;padding:20px;border:1px solid #888;width:50%;font-family: MonstserratLight;"/>').appendTo('#res_sheerid');
              								$('iframe#asset_verify').contents().find('body').append("<h1>Unable to verify</h1><h3>Please upload supporting documentation</h3>");
              								$('iframe#asset_verify').contents().find('body').append(html_data);
                              $('.page-loading').remove();
              							});
              							var success_url = $('iframe#asset_verify').contents().find('input[name="success"]').val();
              						}
              					});
                    }
                    e.preventDefault(); // avoid to execute the actual submit of the form.
      				});
      				self_me.$el.removeClass('is-loading');
      			}else if(lowerCode === 'smtpd' && !pageContext.user.isAuthenticated){
      				// alert("Please register to avail military discount");
      				self_me.$el.removeClass('is-loading');
      				self_me.model.unset('couponCode');
      				self_me.render();
      			}

        },
        removeCoupon: function(e){
            var self=this;
            var me= this.$el;
            var orderId = this.model.id;
            var couponCode = $(e.currentTarget).attr('name');
            self.model.apiRemoveCoupon(couponCode).then(function (res) {
                $.cookie("lastCoupon","", {  path: '/',expires: 5 });
                self.render();
            });

        },checkCouponStatus:function (CCode) {
            var isApplied=false;

            var order_discount_code=_.filter(this.model.get('orderDiscounts'),function(dis){ return dis.couponCode!==undefined;});
            var order_discount_coupons=_.uniq(_.pluck(order_discount_code,'couponCode'));

             var shipping_discount=_.filter(this.model.get('shippingDiscounts'),function(dis){ return dis.discount.couponCode!==undefined;});
            var ship_discount_tmp=_.pluck(shipping_discount,'discount');
            var shipping_discount_coupons=_.uniq(_.pluck(ship_discount_tmp,'couponCode'));

            var product_discount= _.flatten(_.pluck(this.model.get('items'), 'productDiscounts'));
            var product_discount_tmp=_.filter(product_discount,function (dis) {
                return dis.couponCode !==undefined;
            });
            var product_discount_coupons=_.uniq(_.pluck(product_discount_tmp,"couponCode"));

            var full_coupon_coupon_code=[];
            full_coupon_coupon_code=full_coupon_coupon_code.concat(order_discount_coupons).concat(shipping_discount_coupons).concat(product_discount_coupons);
            var match_coupon=_.find(full_coupon_coupon_code,function (coupon_item) {
               if(coupon_item.toLowerCase()===CCode.toLowerCase()){
                    return true;
               }
            });
            if(match_coupon){
                isApplied=true;
            }
            return isApplied;
        },syncCouponView:function () {
            var me=this;
            //Check all coupon code available in order object if it's contains one then disable the coupon text box.
            var order_discount_code=_.filter(this.model.get('orderDiscounts'),function(dis){ return dis.couponCode!==undefined;});
            var order_discount_coupons=_.uniq(_.pluck(order_discount_code,'couponCode'));

            var shipping_discount=_.filter(this.model.get('shippingDiscounts'),function(dis){ return dis.discount.couponCode!==undefined;});
           var ship_discount_tmp=_.pluck(shipping_discount,'discount');
            var shipping_discount_coupons=_.uniq(_.pluck(ship_discount_tmp,'couponCode'));

            var product_discount= _.flatten(_.pluck(this.model.get('items'), 'productDiscounts'));
            var product_discount_tmp=_.filter(product_discount,function (dis) {
                return dis.couponCode !==undefined;
            });
            var product_discount_coupons=_.uniq(_.pluck(product_discount_tmp,"couponCode"));

            var full_coupon_coupon_code=[];
            full_coupon_coupon_code=full_coupon_coupon_code.concat(order_discount_coupons).concat(shipping_discount_coupons).concat(product_discount_coupons);

            if(full_coupon_coupon_code.length>0){
                this.model.set('allowCoupon',false);  
                try{
                    if(full_coupon_coupon_code.length>1 && window.ship_changed !== undefined && window.ship_changed===true){
                         var last_applied=$.cookie('lastCoupon');
                          var lower_coupon_codes=[];
                        _.each(full_coupon_coupon_code,function (item) {
                            lower_coupon_codes.push(item.toLowerCase());
                        });
                        if(last_applied !==undefined && last_applied.length>0 && _.indexOf(lower_coupon_codes,last_applied)>-1){
                            var coupon_remove=_.without(full_coupon_coupon_code,full_coupon_coupon_code[_.indexOf(lower_coupon_codes,last_applied)]);
                            _.each(coupon_remove,function (remove_coupon) {
                                me.model.apiRemoveCoupon(remove_coupon).then(function(res){   
                                    me.deleteCoupon(full_coupon_coupon_code,res.data,me,1);                             
                                });
                            });
                        }else{
                            var coupon_tobe_removed=_.rest(full_coupon_coupon_code);
                            $.cookie("lastCoupon", full_coupon_coupon_code[0].toLowerCase(), {  path: '/',expires: 5 });
                            _.each(coupon_tobe_removed,function (remove_coupon) {
                                me.model.apiRemoveCoupon(remove_coupon).then(function(res){
                                    me.deleteCoupon(full_coupon_coupon_code,res.data,me,1);
                                });
                            });
                        }
                        window.ship_changed=false;
                    }               
                }catch(err){
                    console.log("Error or syncCouponView "+err);
                    window.ship_changed=false;
                }              
            }else{
                this.model.set('allowCoupon',true);
            }            
        },
        handleEnterKey: function () {
            this.addCoupon();
        }
    });


    var CommentsView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/comments-field',
        autoUpdate: ['shopperNotes.comments']
    });
    var attributeFields = function(){
        var me = this;

        var fields = [];

        var storefrontOrderAttributes = require.mozuData('pagecontext').storefrontOrderAttributes;
        if(storefrontOrderAttributes && storefrontOrderAttributes.length > 0) {

            storefrontOrderAttributes.forEach(function(attributeDef){
                fields.push('orderAttribute-' + attributeDef.attributeFQN);
            }, this);

        }
        console.log("fields");
        console.log(fields);

        return fields;
    };

    var ReviewOrderView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/step-review',
        autoUpdate: [
            'createAccount',
            'agreeToTerms',
            'emailAddress',
            'password',
            'confirmPassword'
        ].concat(attributeFields()),
        renderOnChange: [
            'createAccount',
            'isReady'
        ],
        initialize: function () {
            var me = this;
            this.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    me.handleEnterKey();
                    return false;
                }
            });

            this.model.on('passwordinvalid', function(message) {
                me.$('[data-mz-validationmessage-for="password"]').text(message);
            });
            this.model.on('userexists', function (user) {
                me.$('[data-mz-validationmessage-for="emailAddress"]').html(Hypr.getLabel("customerAlreadyExists", user, encodeURIComponent(window.location.pathname)));
            });
        },render:function () {
            //Check if it's Quote payment and update the submit button text in step-review section.
            var isQuotePayment=_.findWhere(this.model.toJSON().payments,{"paymentType":"Check","status":"New"});
            if(isQuotePayment!==undefined){
                this.model.set("isQuotePayment",true);
            }else{
                 this.model.set("isQuotePayment",false);
            }
            Backbone.MozuView.prototype.render.call(this);
        },
        submit: function () {
            var self = this;
            try{
                var isQuote=_.findWhere(this.model.toJSON().payments,{"paymentType":"Check","status":"New"});
                if(isQuote!==undefined){
                   // console.log("Set Quote Order Option in order attribute");
                    self.model.set("orderAttribute-tenant~QOFLAG",true);
                }
            }catch(err){
                console.log(err);
            }
                 if(ga!==undefined){
                
                ga('ec:setAction','checkout', {'step': 4});
                
                ga('send', 'event','Enhanced-Ecommerce','initPlaceOrder',{'nonInteraction': true});

                ga('ec:setAction','PlaceOrder', {
                'step': 4,
                'option': 'ReviewOrderandPlace'
                });
                 
                ga('send', 'event','Enhanced-Ecommerce','PlaceOrder');
                }
            _.defer(function () {
            self.model.submit();

            });
        },
        handleEnterKey: function () {
            this.submit();
        }
    });

    var ParentView = function(conf) {
      var gutter = parseInt(Hypr.getThemeSetting('gutterWidth'), 10);
      if (isNaN(gutter)) gutter = 15;
      var mask;
      conf.model.on('beforerefresh', function() {
         killMask();
         conf.el.css('opacity',0.5);
         var pos = conf.el.position();
         mask = $('<div></div>', {
           'class': 'mz-checkout-mask'
         }).css({
           width: conf.el.outerWidth() + (gutter * 2),
           height: conf.el.outerHeight() + (gutter * 2),
           top: pos.top - gutter,
           left: pos.left - gutter
         }).insertAfter(conf.el);
      });
      function killMask() {
        conf.el.css('opacity',1);
        if (mask) mask.remove();
      }
      conf.model.on('refresh', killMask);
      conf.model.on('error', killMask);
      return conf;
    };

    $(document).ready(function () {

        var $checkoutView = $('#checkout-form'),
            checkoutData = require.mozuData('checkout');

        AmazonPay.init(true);
        checkoutData.isAmazonPayEnable = AmazonPay.isEnabled;

        var checkoutModel = window.order = new CheckoutModels.CheckoutPage(checkoutData),
            checkoutViews = {
                parentView: new ParentView({
                  el: $checkoutView,
                  model: checkoutModel
                }),
                steps: {
                    shippingAddress: new ShippingAddressView({
                        el: $('#step-shipping-address'),
                        model: checkoutModel.get("fulfillmentInfo").get("fulfillmentContact")
                    }),
                    shippingInfo: new ShippingInfoView({
                        el: $('#step-shipping-method'),
                        model: checkoutModel.get('fulfillmentInfo')
                    }),
                    paymentInfo: new BillingInfoView({
                        el: $('#step-payment-info'),
                        model: checkoutModel.get('billingInfo')
                    })
                },
                orderSummary: new OrderSummaryView({
                    el: $('#order-summary'),
                    model: checkoutModel
                }),
                couponCode: new CouponView({
                    el: $('#coupon-code-field'),
                    model: checkoutModel
                }),
                comments: Hypr.getThemeSetting('showCheckoutCommentsField') && new CommentsView({
                    el: $('#comments-field'),
                    model: checkoutModel
                }),

                reviewPanel: new ReviewOrderView({
                    el: $('#step-review'),
                    model: checkoutModel
                }),
                messageView: messageViewFactory({
                    el: $checkoutView.find('[data-mz-message-bar]'),
                    model: checkoutModel.messages
                })
            };

        window.checkoutViews = checkoutViews;
        //non lower 48 states array
        try{
            if(!require.mozuData("user").isAuthenticated && !checkoutModel.get("fulfillmentInfo.fulfillmentContact.address").attributes.hasOwnProperty("address1")){
                window.checkoutViews.orderSummary.render();
            }
        }catch(err){
            console.log(err);
        }
        checkoutModel.on('complete', function() {
            CartMonitor.setCount(0);
            if (window.amazon)
                window.amazon.Login.logout();
            window.location = "/checkout/" + checkoutModel.get('id') + "/confirmation";
        });

        var $reviewPanel = $('#step-review');
        checkoutModel.on('change:isReady',function (model, isReady) {
            if (isReady) {
                setTimeout(function () { window.scrollTo(0, $reviewPanel.offset().top); }, 750);
            }
        });

        _.invoke(checkoutViews.steps, 'initStepView');

        $checkoutView.noFlickerFadeIn();

        if (AmazonPay.isEnabled)
            AmazonPay.addCheckoutButton(window.order.id, false);


        window.removePageLoader();

    });
     window.zipArr=[];
     window.meltArr=[];
    // $(document).on('click','a#shipping-addr-edit-link',function(){
    //     $('.mz-contactselector-contact.mz-contactselector-new.mz-checkoutform-shipping').css('display','table');
    //     $('.mz-contactselector .mz-addresssummary').hide();
    // });
     $(document).on('click','.gift_input_toggle',function(e){
        $('.giftcode_box').slideToggle();
        $('.gift_input_toggle .fa').toggleClass('fa-minus');
    });
     $(document).on('click','.summarybox_toggle',function(e){
        $('.summary_box').slideToggle();
        $('.checkout_coupan').slideToggle();
        $('.summary_edit').slideToggle();
        $('.summarybox_toggle .fa').toggleClass('fa-minus');
    });
    $(document).on('click','#paypalexpress2',function(){ $('#btn_xpressPaypal').trigger('click'); });
    $(document).on('click','#paywithamazon',function(){ $('#OffAmazonPaymentsWidgets0').trigger('click'); });

});
