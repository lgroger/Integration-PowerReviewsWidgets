define(['modules/jquery-mozu','hyprlive',"modules/api","modules/models-product","modules/shared-product-info"], function ($, Hypr,Api,ProductModels, SharedProductInfo) {    
	var getPropteryValueByAttributeFQN = function(product, attributeFQN, useStringValue){ // I've found that a product attribute over 50 characters is trunctated to 50 characters for "value" but "stringValue" isn't
            var result = null;
            var properties = product.get('properties')?product.get('properties'):product.properties;
            for(var i=0;i<properties.length;i++){
                if(properties[i].attributeFQN.toLowerCase()===attributeFQN.toLowerCase()){
                    for(var j=0;j<properties[i].values.length; j++){
                        result= properties[i].values[j].stringValue;
						if(useStringValue){
							result= properties[i].values[j].stringValue;
						}
						else{
							result= properties[i].values[j].value;
						}
						if(properties[i].values[j].value !== properties[i].values[j].stringValue){
							console.log(properties[i].values[j].value);
							console.log(properties[i].values[j].stringValue);
						}
                    }
                    break;
                }
            }
            return result;
     };
	var addParameter = function(form,parameter,value){
            $("<input type='hidden' />")
             .attr("name", parameter)
             .attr("value", value)
             .appendTo(form);
        };
	
	//https://gist.github.com/SparK-Cruz/1570177
	var dndItem = (function(){
		var C = function(){ return constructor.apply(this,arguments); };
		var p = C.prototype;
		
		//construct
		function constructor(productID, itemDescription, ecometrySku, mcCode, dndCode, designCode, quantity, price, volumePricing, minQty, maxQty, unitOfMeasure, lineitemID, parentProductID, isBundle){
			this.productID = productID;
			this.itemDescription = itemDescription;
			this.ecometrySku = ecometrySku;
			this.mcCode = mcCode;
			this.dndCode = dndCode;
			this.designCode = designCode;
			this.quantity = quantity;
			this.price = price;
			this.volumePricing = volumePricing;
			this.minQty = minQty;
			this.maxQty = maxQty;
			this.unitOfMeasure = unitOfMeasure;
			this.lineitemID = lineitemID;
			this.parentProductID = parentProductID;
			this.isBundle = isBundle;
		}

		//define methods
		p.setFromModel = function(me){
			this.quantity = me.model.get('quantity')?me.model.get('quantity'):1;
			this.minQty = (me.model._minQty)?me.model._minQty:this.quantity;
			var inventoryInfo = me.model.get('inventoryInfo');
			if(inventoryInfo){
				if(inventoryInfo.manageStock){
					this.maxQty = inventoryInfo.onlineStockAvailable;
				}
			}
			if(me.pageType.toLowerCase() === 'cart'){
				if(parseInt(me.model.get('price').salePrice,10) > 0){
					this.price = me.model.get('price').salePrice;
				}
				else{
					this.price = me.model.get('price').price;
				}
			}else{
				if(parseInt(me.model.get('price').get('salePrice'),10) > 0){
					this.price = me.model.get('price').get('salePrice');
				}
				else{
					this.price = me.model.get('price').get('price');
				}
			}

			if(me.lineitemID){
				this.lineitemID = me.lineitemID;
			}
			
			var volumePriceBands = me.model.get('volumePriceBands');
            if(volumePriceBands && volumePriceBands.length>0){
                var volPrice = [];
                for(var i=0; i<volumePriceBands.length;i++){
                    var volobj ={};
                    volobj.minQty = volumePriceBands[i].minQty;
                    volobj.maxQty = volumePriceBands[i].maxQty;
                    if(volumePriceBands[i].price){
						// TO DO - check for sale price?
                        volobj.price = volumePriceBands[i].price.price;
                    }else{
                       if(volumePriceBands[i].priceRange){
                            if(volumePriceBands[i].priceRange.upper.salePrice){
                                volobj.price = volumePriceBands[i].priceRange.upper.salePrice;
                            }else{
                                volobj.price = volumePriceBands[i].priceRange.upper.price;
                            }
                       }
                    }
                    volPrice.push(volobj);
                }
                this.volumePricing = JSON.stringify(volPrice);
			}
		};

		//unleash your class
		return C;
	})();
	
    var DNDEngine = function(model,view)
    {
		var pageContext = require.mozuData('pagecontext');
		
        var self = {};
		self.index = 0; // current index of dndArr
		self.dndArr = null; // loaded by getParameters
		self.dndExtras = null; // loaded by getDNDExtras
        self.projectToken = {}; // what will go in tenant~dnd-token
        self.pageType = pageContext.pageType;
		self.iframe = null; // defined in this.initialize()
        if(self.pageType.toLowerCase()==='cart'){
            if(model.get('id')){
                self.lineitemID = model.get('id');
                self.model=model.get('product');
            }else{
                self.lineitemID = model.get('cartlineid');
                self.model=model;
            }
        }else{
			// pdp or quickview
            self.model=model;
        }
		self.view = view; // productView or cartView
        self.productAttributes = Hypr.getThemeSetting('productAttributes');
        self.dndEngineUrl= Hypr.getThemeSetting('dndEngineUrl');
        self.time = new Date().getTime(); // id for iframe
		
		self.getDNDExtras = function(callback){
			var extrasInfo = [];
			var self =this;
			var options = self.model.get('options');
			var extrasToHide = getPropteryValueByAttributeFQN(this.model, 'tenant~extrastohide');
            var extrastohideArr = [];
            if(extrasToHide && extrasToHide!==""){
                extrastohideArr = extrasToHide.toLowerCase().split(',');
            }
			
			if(options.length>0){
			   for(var inc=0; inc<options.models.length; inc++){
					var option = options.models[inc];
				   	var attributeCode = option.get('attributeFQN').split('~')[1];
					if(option.get('attributeDetail').usageType==='Extra' &&
						option.get('attributeDetail').dataType==='ProductCode' &&
						extrastohideArr.indexOf(attributeCode) > -1){
						var extra ={};
						extra.name = option.get('attributeDetail').name;
						extra.isRequired = option.get('isRequired');
						extra.attributeCode = attributeCode;
						extra.values=[];
						var values = option.get('values');
						for(var l=0;l<values.length;l++){
							var eprod = SharedProductInfo.getExtraProduct(values[l].value,callback);
							if(eprod){
								var extraValues={};
								extraValues.price = values[l].deltaPrice;
								extraValues.name = values[l].stringValue;
								extraValues.value = values[l].value;
								extraValues.mfgPartNumber = eprod.get('mfgPartNumber');
								var inventoryInfo = values[l].bundledProduct.inventoryInfo;
								if(inventoryInfo && inventoryInfo.manageStock){
									extraValues.maxQty = inventoryInfo.onlineStockAvailable;
								}
								extraValues.quantity = values[l].bundledProduct.quantity;
								extra.values.push(extraValues);
							}
							else{
								return;
							}
						}
						extrasInfo.push(extra);
					}
				}
			}
			return extrasInfo;
		};
        self.getParameters=function(callback){
            var me = this;
			var dndArr = []; // array of personalized item info
			var mfgpartnumber,parentDND,parentDesign,childDND,childDesign,options,i,productCode,attributeFQN,option,product,parentUOM,childUOM,parentMC,childMC,newItem;

			// parent info
			mfgpartnumber = this.model.get('mfgPartNumber');
			parentDND = getPropteryValueByAttributeFQN(this.model, self.productAttributes.dndCode);
			parentDesign = getPropteryValueByAttributeFQN(this.model, self.productAttributes.designCode);
			parentMC = getPropteryValueByAttributeFQN(this.model, self.productAttributes.mcCode, true);
			parentUOM = getPropteryValueByAttributeFQN(self.model, self.productAttributes.unitOfMeasure);
			
			if(self.model.get('productUsage') === "Bundle"){
				// loop over components
				var bp = self.model.get('bundledProducts');
				for (i =0; i< bp.length; i++) {
					var component = bp[i];
					product = SharedProductInfo.getExtraProduct(component.productCode,callback);
					if(product){
						newItem = new dndItem();
						newItem.dndCode = getPropteryValueByAttributeFQN(product, self.productAttributes.dndCode);
						newItem.mcCode = getPropteryValueByAttributeFQN(product, self.productAttributes.mcCode, true);
						if(newItem.dndCode || newItem.mcCode){
							newItem.isBundle = true;
							newItem.ecometrySku = product.get('mfgPartNumber');
							newItem.designCode = getPropteryValueByAttributeFQN(product, self.productAttributes.designCode);
							newItem.unitOfMeasure = parentUOM;
							newItem.productID = product.get('productCode');
							newItem.itemDescription = product.get('content.productName');
							newItem.parentProductID = me.model.get('productCode');
							newItem.setFromModel(me);
							dndArr.push(newItem);
						}
					}
					else{
						return(false);// exit, means we are waiting on api call inside getExtraProduct
					}
				}
				
				// loop over extras
				options=me.model.getConfiguredOptions();
				for(i=0;i < options.length;i++){
                    productCode = options[i].value;
					attributeFQN = options[i].attributeFQN;
					option = me.model.get('options').get(attributeFQN);
                    if(option.get('attributeDetail').usageType ==='Extra' && option.get('attributeDetail').dataType==='ProductCode'){
						product = SharedProductInfo.getExtraProduct(productCode,callback);
						if(product){
							newItem = new dndItem();
							newItem.dndCode = getPropteryValueByAttributeFQN(product, self.productAttributes.dndCode);		
							newItem.mcCode = getPropteryValueByAttributeFQN(product, self.productAttributes.mcCode);
							if(newItem.dndCode || newItem.mcCode){
								newItem.isBundle = true;
								newItem.ecometrySku = product.get('mfgPartNumber');
								newItem.designCode = getPropteryValueByAttributeFQN(product, self.productAttributes.designCode);
								newItem.unitOfMeasure = parentUOM;
								newItem.productID = product.get('productCode');
								newItem.itemDescription = product.get('content.productName');
								newItem.parentProductID = me.model.get('productCode');
								newItem.setFromModel(me);
								dndArr.push(newItem);
							}
						}
						else{
							return(false);// exit, means we are waiting on api call inside getExtraProduct
						}
                    }
                }
			}
			else{	
				if(mfgpartnumber && mfgpartnumber.length > 0){
					// add parent info
					newItem = new dndItem();
					newItem.dndCode = parentDND;
					newItem.mcCode = parentMC;
					if(newItem.dndCode || newItem.mcCode){
						newItem.isBundle = false;
						newItem.ecometrySku = mfgpartnumber;
						newItem.designCode = parentDesign;
						newItem.unitOfMeasure = parentUOM;
						newItem.productID = me.model.get('productCode');
						newItem.itemDescription = me.model.get('content.productName');
						newItem.parentProductID = null;
						newItem.setFromModel(me);
						dndArr.push(newItem);
					}
					
					// if non-bundle and have manufacturere part number on parent, ignore extras
				}
				else{
					// look at extras for mfgpartnumber
					options=me.model.getConfiguredOptions();
					for(i=0;i < options.length;i++){
						productCode = options[i].value;
						attributeFQN = options[i].attributeFQN;
						option = me.model.get('options').get(attributeFQN);
						if(option.get('attributeDetail').usageType ==='Extra' && option.get('attributeDetail').dataType==='ProductCode'){
							product = SharedProductInfo.getExtraProduct(productCode,callback);
							if(product){
								// look for dnd/mediaclip code on extra first. if none, fall back to parent's
								childMC = getPropteryValueByAttributeFQN(product, self.productAttributes.mcCode, true);
								childDND = getPropteryValueByAttributeFQN(product, self.productAttributes.dndCode);
								childDesign = getPropteryValueByAttributeFQN(product, self.productAttributes.designCode);
								childUOM = getPropteryValueByAttributeFQN(product ,self.productAttributes.unitOfMeasure);
								
								newItem = new dndItem();
								newItem.dndCode = (childDND && childDND.length)?childDND:parentDND;								
								newItem.mcCode = (childMC && childMC.length)?childMC:parentMC;
								
								if(newItem.dndCode || newItem.mcCode){
									newItem.isBundle = false;
									newItem.ecometrySku = product.get('mfgPartNumber');
									newItem.designCode = (childDesign && childDesign.length)?childDesign:parentDesign;
									newItem.unitOfMeasure = (childUOM && childUOM.length)?childUOM:parentUOM;
									newItem.productID = me.model.get('productCode');
									newItem.itemDescription = me.model.get('content.productName');
									newItem.parentProductID = null;
									newItem.setFromModel(me);
									dndArr.push(newItem);
								}
							}
							else{
								return(false);// exit, means we are waiting on api call inside getExtraProduct
							}
						}
					}
				}
			}

			return(dndArr);
        };
		self.initializeAndSend = function(){
			console.log("initializeAndSend");
			this.initialize();
			this.send();
		};
        self.initialize = function(){
			console.log("initialize");
            // LG change - updated dummyurl to remove doubleslash within url
            var dummyurl = self.dndEngineUrl+"ajax/nosession/loading.html"; // url of static html page that demonstrates that that loading is in progress
            var dndpopup = $('<div>').addClass('dnd-popup');
            var a = $('<a>').attr('href','#').addClass('personalize-close').html('&times;');
            var iframe = $('<iframe data-time="'+self.time+'" src="'+dummyurl+'" id="iframe'+self.time+'" name="iframe'+self.time+'" width="750" height="689"></iframe>');
            dndpopup.append(a);
            dndpopup.append(iframe);
            $("body").append(dndpopup);

            var pagecontext = require.mozuData('pagecontext');

            // Resize the iframes when the window is resized
            $( window ).resize( function () {
                // Find all iframes
                var $iframes = $( ".dnd-popup iframe");// LG change - moved from before window.resize
                if($iframes.length)// LG change - added if statement
                     $('html').addClass('dnd-active-noscroll'); // LG change - changed from removeClass to addClass

              $iframes.each( function() {
                var screenWidth = window.innerWidth,
                screenHeight = window.innerHeight,iframewidth,iframeheight;
                if(pagecontext.isDesktop || pagecontext.isTablet){
                    iframewidth = screenWidth-50;
                    iframeheight = screenHeight-50;
                }else{
                    iframewidth = screenWidth-20;
                    iframeheight = screenHeight-20; 
                }
                if(iframewidth > 1297)
                    iframewidth = 1297;
                if(iframeheight > 900)
                    iframeheight = 900;

                var left = (screenWidth/2)-(iframewidth/2), top=(screenHeight/2)-(iframeheight/2);
                $('.dnd-popup').css({position:'fixed',top:top,left:left,width:iframewidth,height:iframeheight});
                $(this).attr({"width":iframewidth,"height":iframeheight});
                $(this).width(iframewidth).height(iframeheight);
              });
              // LG change - removed addClass()
            // Resize to fix all iframes on page load.
            }).resize();
			
			$('#cboxOverlay').show();
            $(dndpopup).show();
            $('body').css({overflow: 'hidden'});
			
			// attach actions to closing of iframe
            $(a).click(function(){
                $('.dnd-popup').remove();
                $('#cboxOverlay').hide();
                $('body').css({overflow: 'auto'});
                $('html').removeClass('dnd-active-noscroll');
				if(self.form){
					$(self.form).remove();
				}
				self.unsend();

                //google analytics code for personlaize close
                var gapersonalizeclose;
                try{
                    if(self.model.toJSON().content && self.model.toJSON().content.productName){
                       gapersonalizeclose = self.model.toJSON().content.productName;
                    }
                    else if(self.model.toJSON().name){
                       gapersonalizeclose = self.model.toJSON().name;
                    }
					
					if(typeof ga !== "undefined"){
						ga('send', {
							hitType: 'event',
							eventCategory: 'Personalize Product click',
							eventAction: 'close',
							eventLabel: gapersonalizeclose
							}); 
					}
                }
                catch(err){
                   console.log(err);
                }
                 
                return false;
            });
			
			this.iframe = iframe; // so it can accessed in this.send
		};
		self.onDNDSubmit = function(e){
			var self = this;
			// function that will listen for post back from iframe
			console.log('onDNDSubmit',e.data);
					
			// receive data 
			var responseData = e.data;
			if(responseData!=="process-tick" && responseData.projectToken){
				var extraData = '';
				var curObj = self.dndArr[self.index];
				console.log(curObj);
				if(responseData.ecometrySku){ 
					var eskuSplit = null, eskuValue;
					eskuValue = responseData.ecometrySku;
					if(responseData.ecometrySku.indexOf('@')!==-1){
						eskuSplit = responseData.ecometrySku.split('@');
						eskuValue = eskuSplit[eskuSplit.length-1];
					}
					self.projectToken[curObj.productID+"@"+eskuValue] = responseData.projectToken;
				}
				else{
					self.projectToken[curObj.productID+"@"+curObj.ecometrySku]=responseData.projectToken;
				}
				extraData = JSON.stringify(self.projectToken);
				responseData.projectToken = extraData;

				// increment counter
				self.index++;

				// see if we have more items to process
				if(self.index < self.dndArr.length){
					//relaunch personalization on next item
					self.doPers();
				}
				else{
					// remove form
					if(this.form){
						$(this.form).remove();
					}
					
					self.unsend(); // unbind window event listeners

					// save personalization to cart
					switch(responseData.method){
						case 'AddToCart':
							self.view.addToCartAfterPersonalize(responseData); //productview
							break;
						case 'UpdateCart': 
							self.view.cartView.updateCartItemPersonalize(responseData); //cartview
							break;
						case 'AddToWishlist':
							self.view.AddToWishlistAfterPersonalize(responseData); //productview
							break;    
					}

				}
			}
		};
		self.unsend = function(){
			// undoes event attachment
			console.log("unsend");
			var deleteMethod = window.removeEventListener ? "removeEventListener" : "detachEvent";
			console.log(deleteMethod);
			var deleter = window[deleteMethod];
			var messageEvent = deleteMethod == "detachEvent" ? "onmessage" : "message";
			deleter(messageEvent,this.onDNDSubmit.bind(this),false);
		};
		self.send = function(){
			console.log("send");
			this.dndArr = this.getParameters(this.send.bind(this));
            if(!this.dndArr){
				return; // if not returned, exit b/c we are waiting on api call and this will automatically be called again....
			}
			
			this.dndExtras = this.getDNDExtras(this.send.bind(this));
            if(!this.dndExtras){
				return; // if not returned, exit b/c we are waiting on api call and this will automatically be called again....
			}
			
			var self = this;
     
            /* 
            Code Added by Asaithambi
            Create IE + others compatible event handler
            */
			
			// create eventer listener for iframe
           // if(typeof window.eventBindFlag === "undefined"){
                var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
                var eventer = window[eventMethod];
                var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
                //window.eventBindFlag = true;
                eventer(messageEvent,this.onDNDSubmit.bind(this),false);
           // }
			
			// GA for personalized code
            try{
                var galabel;

                if(this.model.toJSON().content && this.model.toJSON().content.productName){
                   galabel = this.model.toJSON().content.productName;
                } 
                else if(this.model.toJSON().name){
                   galabel = this.model.toJSON().name;
                }

				if(typeof ga !== "undefined"){
					ga('send', {
						hitType: 'event',
						eventCategory: 'Personalize Product click',
						eventAction: 'Personalize',
						eventLabel: galabel
						});
				}
            }
            catch(err){
                console.log(err);
            }

			this.doPers();  // begin personalization on first item
            
			// resize window once everything in iframe completes loading
            this.iframe.load(function(){
            	$(window).resize();
            });
        };
		self.doPers = function(){
			console.log("doPers");
			var dndItem = this.dndArr[this.index];
			var remainPersItems = (this.index!==(this.dndArr.length-1))?true:false;
			var me = this;

			if(dndItem.mcCode){
				// launch media clip window
				//console.log(dndItem.mcCode);
				$.ajax({
					url: "/get-personalization",
					method:"POST",
					data: { productId: dndItem.mcCode},
					dataType:"json",
					success:function(data){
						console.log(data);
						var url = "/personalize/"+data.id;
						console.log(url);
						if(me.form){
							// clean up any existing forms
							$(me.form).remove();
						}

						// create new form that posts to mediaclip url (must be get, no post)
						var form = $('<form action="'+url+'" target="iframe'+me.time+'" method="get" id="form'+me.time+'_'+me.index+'" name="form'+me.time+'"></form>');
						addParameter(form,"token",data.userToken);
						// save to object so we can clean it up if needed
						me.form = form;

						// insert and post form
						$("body").append(me.form);
						me.form.submit();
					}
				});
			}
			else{
				if(this.form){
					// clean up any existing forms
					$(this.form).remove();
				}
				
				// create new form
				var form = $('<form action="'+this.dndEngineUrl+'" target="iframe'+this.time+'" method="post" id="form'+this.time+'_'+this.index+'" name="form'+this.time+'"></form>');
				addParameter(form,"productID",dndItem.productID);
				addParameter(form,"itemDescription",dndItem.itemDescription);
				addParameter(form,"ecometrySku",dndItem.ecometrySku);
				addParameter(form,"dndCode",dndItem.dndCode);
				addParameter(form,"designCode",dndItem.designCode);
				addParameter(form,"quantity",dndItem.quantity);
				addParameter(form,"price",dndItem.price);
				addParameter(form,"volumePricing",dndItem.volumePricing);
				addParameter(form,"minQty",dndItem.minQty);
				addParameter(form,"maxQty",dndItem.maxQty);
				addParameter(form,"unitOfMeasure",dndItem.unitOfMeasure);
				addParameter(form,"lineitemID",dndItem.lineitemID);
				addParameter(form,"parentProductID",dndItem.parentProductID);
				addParameter(form,"isBundle",dndItem.isBundle);
				addParameter(form,"remainingPersItems",remainPersItems);
				
				addParameter(form,"extras",JSON.stringify(this.dndExtras));

				// save to object so we can clean it up if needed
				this.form = form;
				
				// insert and post form
				$("body").append(this.form);
				this.form.submit();
			}
		};
		return(self);
    };
	var getTokenData = function(dndTokenJson,productCode){ // pass in productCode if for a bundle component
        var dndEngineUrl = Hypr.getThemeSetting('dndEngineUrl');
		var tokenObj = {};
		var dndToken;
		
		for(var sku in dndTokenJson){
			// if "@" present, that means it's in this format "KIBO-PROUDCT-CODE@MFGPARTNUM"
			if(sku.indexOf('@')!==-1){
				var prdCode = sku.split('@')[0];
				tokenObj[prdCode]=dndTokenJson[sku];
			}else{
				tokenObj[sku]=dndTokenJson[sku];
			}
		}

		if(productCode){
			dndToken = tokenObj[productCode];
			if(dndToken){
				return({"src":dndEngineUrl+'preview/'+dndToken,"token":dndToken});
			}
		}else{
			for (var prop in tokenObj) {
				if (tokenObj.hasOwnProperty(prop)) {
					dndToken = tokenObj[prop];
					if(dndToken){
						return({"src":dndEngineUrl+'preview/'+dndToken,"token":dndToken});
					}  
				} 
			}
		}
		return({"src":null,"token":null});
	};
    return {
		DNDEngine:DNDEngine,
		getTokenData:getTokenData
    };
});