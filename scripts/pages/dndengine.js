define(['modules/jquery-mozu','hyprlive',"modules/api","modules/models-product","modules/shared-product-info","modules/mc-cookie","modules/dnd-token"], function ($, Hypr,Api,ProductModels, SharedProductInfo,McCookie,DNDToken) {    
	
	// this is similar to "modules/shared-product-info" but is meant to hold product models when a cart lineitem needs access to full product model prior to adding to cart (ex. to get extras for dnd)
	var FullProductModels = {
		models:	[],
		getProductModel: 	function(productCode,callback){
			console.log("FullProductModels.getProductModel");
			var me = this;
			if(this.models.length>0){
				for(var i=0;i < this.models.length;i++){
					if(this.models[i].get('productCode')===productCode){
						var product = this.models[i];
						return product;
					}
				}
			}
			else{
				/*
				var requesturl = '/api/commerce/catalog/storefront/products/'+productCode+'?my=1';
				
				var onSuccessFunction =  function(res, xhr,request){
					console.log('FullProductModels api on success');
					if(request === requesturl){
						try{
							var productExtrasResponse = xhr.getResponseHeader("productExtras");
							if(productExtrasResponse && productExtrasResponse!==""){
								var productExtras = JSON.parse(productExtrasResponse);
								if(productExtras.length>0){
									for(var i=0;i<productExtras.length;i++){
										console.log(productExtras[i]);
										SharedProductInfo.addExtraProduct(productExtras[i]);
									}
								}
							}
						}catch(e){
							console.log(e);
						}
						Api.off('success',onSuccessFunction); // remove api on success action
					}
					console.log(xhr);
					console.log(request);
				};
				Api.on('success',onSuccessFunction); // add on success so we can get response headers 
				
				Api.request('GET',requesturl).then(function(res){*/
				// get product
				Api.request('GET','/api/commerce/catalog/storefront/products/'+productCode).then(function(res){
					console.log('FullProductModels api request');
					var product=new ProductModels.Product(res);
					me.models.push(product);
					callback();
				});
				return false;
			}
		}
	};
	
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
	var trackBulkExtraRequests = [];
	var getDNDExtrasFromOptions = function(options,extrasToHideArr,callback){
		console.log("getDNDExtrasFromOptions");
		var productStr = "";
		var option,attributeCode,values;
		// make list of all product codes we need to get info for...
		for(var i=0; i<options.models.length; i++){
			option = options.models[i];
			attributeCode = option.get('attributeFQN').split('~')[1];
			if(option.get('attributeDetail').usageType==='Extra' &&
				option.get('attributeDetail').dataType==='ProductCode' &&
				extrasToHideArr.indexOf(attributeCode) > -1){
				values = option.get('values');
				for(var v=0;v<values.length;v++){
					productStr+=values[v].value+",";
				}
			}
		}
		
		//console.log(productStr);
		if(productStr.length > 0){
			// sort and store so we can track if we've already requested this info
			var productStrArr = productStr.split(",");  // to array
			productStrArr.sort(); // sort so it's in a consistent order to compare against
			productStr = productStrArr.join(","); // back to a list
			if(trackBulkExtraRequests.indexOf(productStr) > -1){
				// request already made, below we'll loop over records below to get actual info
				//console.log('request already made');
			}
			else{
				//console.log('make request');
				// new request, make request and exit
				trackBulkExtraRequests.push(productStr);
				SharedProductInfo.getExtras(productStr,callback);
				return;
			}
		}
		
		var extrasInfo = [];

		for(var inc=0; inc<options.models.length; inc++){
			option = options.models[inc];
			attributeCode = option.get('attributeFQN').split('~')[1];
			if(option.get('attributeDetail').usageType==='Extra' &&
				option.get('attributeDetail').dataType==='ProductCode' &&
				extrasToHideArr.indexOf(attributeCode) > -1){
				var extra ={};
				extra.name = option.get('attributeDetail').name;
				extra.isRequired = option.get('isRequired');
				extra.attributeCode = attributeCode;
				extra.values=[];
				values = option.get('values');
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
						return false;
					}
				}
				extrasInfo.push(extra);
			}
		}
		return extrasInfo;
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
	
    var DNDEngine = function(model,view,lineitemid,dndToken,mcToken,isComponent)
    {
		var pageContext = require.mozuData('pagecontext');
        var self = {};
		self.index = 0; // current index of dndArr
		self.dndArr = null; // loaded by getParameters
		self.dndExtras = null; // loaded by getDNDExtras
        self.projectToken = {}; // what will go in tenant~dnd-token
        self.pageType = pageContext.pageType;
		self.iframe = null; // defined in this.initialize()
		
		self.model = model; // product model
		self.view = view; // productView or cartView
		
		// for cart use
		self.lineitemID = lineitemid; // lineitem to update if used in cart
		self.dndToken = dndToken; // existing dnd token
		self.mcToken = mcToken; // existing mediaclip token
		self.isComponent = isComponent; // for use in cart - if lineitem being personalized is a bundledItem
		
        self.productAttributes = Hypr.getThemeSetting('productAttributes');
        self.dndEngineUrl= Hypr.getThemeSetting('dndEngineUrl');
        self.time = new Date().getTime(); // id for iframe
		
		self.getDNDExtras = function(callback){
			var extrasInfo = [];
			var self =this;
			var options = self.model.get('options');
			var extrasToHide = getPropteryValueByAttributeFQN(this.model, 'tenant~extrastohide');
            var extrasToHideArr = [];
            if(extrasToHide && extrasToHide!==""){
                extrasToHideArr = extrasToHide.toLowerCase().split(',');
            }
			if(extrasToHideArr.length>0){
				// if this is in cart, we need to make api call to get full product object model to be able to send product extras into dnd b/c that info is no longer part of product model in cart
				if(this.lineitemID){
					var productmodel = FullProductModels.getProductModel(self.model.get('productCode'),callback);
					if(productmodel){
						options = productmodel.get('options');
						extrasInfo = getDNDExtrasFromOptions(options, extrasToHideArr, callback);
						//console.log(extrasInfo);
						if(extrasInfo){
							return extrasInfo;
						}
						else{
							return false; // exit b/c callback was called in getDNDExtrasFromOptions();
						}
					}
					else{
						return false; // exit b/c callback was called in FullProductModels.getProductModel()
					}
				}
				else{
					extrasInfo = getDNDExtrasFromOptions(options, extrasToHideArr, callback);
					if(extrasInfo){
						return extrasInfo;
					}
					else{
						return false; // exit b/c callback was called in getDNDExtrasFromOptions();
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
			parentDND = getPropteryValueByAttributeFQN(this.model, this.productAttributes.dndCode);
			parentDesign = getPropteryValueByAttributeFQN(this.model, this.productAttributes.designCode);
			parentMC = getPropteryValueByAttributeFQN(this.model, this.productAttributes.mcCode, true);
			parentUOM = getPropteryValueByAttributeFQN(this.model, this.productAttributes.unitOfMeasure);
			
			if(this.lineitemID){
				// from cart
				newItem = new dndItem();
				newItem.productID = this.model.get('productCode');

				console.log(this.isComponent);
				if(this.isComponent){
					// bundle component
					newItem.itemDescription = this.model.get('content.productName');
					newItem.isBundle = true;
					newItem.dndCode = parentDND;
					newItem.mcCode = parentMC;
					newItem.ecometrySku = mfgpartnumber;
					newItem.unitOfMeasure = parentUOM;
				}
				else{
					newItem.isBundle = false;
					newItem.itemDescription = this.model.get('name');
					// could be parent or on extra (but won't be bundle)
					if(mfgpartnumber && mfgpartnumber.length > 0){
						// add parent info
						newItem.dndCode = parentDND;
						newItem.mcCode = parentMC;
						if(newItem.dndCode || newItem.mcCode){
							newItem.ecometrySku = mfgpartnumber;
							newItem.designCode = parentDesign;
							newItem.unitOfMeasure = parentUOM;
						}
					}
					else{
						// look at extras
						options=me.model.get('options');
						for(i=0;i < options.length;i++){
							productCode = options[i].value;
							option = options[i];
							//console.log(option);
							if(option.attributeFQN !== me.productAttributes.dndToken && option.value){ 
								// if not dnd-token & a value is present, loop over bundled products to find the corresponding extra
								var bundledProducts = me.model.get('bundledProducts');
								for (var j=0; j< bundledProducts.length; j++) {
									if(bundledProducts[j].productCode === option.value){
										product = SharedProductInfo.getExtraProduct(bundledProducts[j].productCode,callback);
										if(product){
											childMC = getPropteryValueByAttributeFQN(product, me.productAttributes.mcCode, true);
											childDND = getPropteryValueByAttributeFQN(product, me.productAttributes.dndCode);
											childDesign = getPropteryValueByAttributeFQN(product, me.productAttributes.designCode);
											childUOM = getPropteryValueByAttributeFQN(product ,me.productAttributes.unitOfMeasure);
											
											newItem.dndCode = (childDND && childDND.length)?childDND:parentDND;	
											newItem.mcCode = (childMC && childMC.length)?childMC:parentMC;
											
											if(newItem.dndCode || newItem.mcCode){
												newItem.ecometrySku = product.get('mfgPartNumber');
												newItem.designCode = (childDesign && childDesign.length)?childDesign:parentDesign;
												newItem.unitOfMeasure = (childUOM && childUOM.length)?childUOM:parentUOM;
											}
										}
										else{
											return false;// exit, means we are waiting on api call inside getExtraProduct
										}
										break; // exit loop over bundled products
									}
								}
								if(newItem.ecometrySku){
									break; // exit options loops
								}
							}
						}
					}
				}
				newItem.setFromModel(me);
				dndArr.push(newItem);
			}
			else if(me.model.get('productUsage') === "Bundle"){
				// loop over components
				var bp = me.model.get('bundledProducts');
				for (i =0; i< bp.length; i++) {
					var component = bp[i];
					product = SharedProductInfo.getExtraProduct(component.productCode,callback);
					if(product){
						newItem = new dndItem();
						newItem.dndCode = getPropteryValueByAttributeFQN(product, me.productAttributes.dndCode);
						newItem.mcCode = getPropteryValueByAttributeFQN(product, me.productAttributes.mcCode, true);
						if(newItem.dndCode || newItem.mcCode){
							newItem.isBundle = true;
							newItem.ecometrySku = product.get('mfgPartNumber');
							newItem.designCode = getPropteryValueByAttributeFQN(product, me.productAttributes.designCode);
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
							newItem.dndCode = getPropteryValueByAttributeFQN(product, me.productAttributes.dndCode);		
							newItem.mcCode = getPropteryValueByAttributeFQN(product, me.productAttributes.mcCode);
							if(newItem.dndCode || newItem.mcCode){
								newItem.isBundle = true;
								newItem.ecometrySku = product.get('mfgPartNumber');
								newItem.designCode = getPropteryValueByAttributeFQN(product, me.productAttributes.designCode);
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
								childMC = getPropteryValueByAttributeFQN(product, me.productAttributes.mcCode, true);
								childDND = getPropteryValueByAttributeFQN(product, me.productAttributes.dndCode);
								childDesign = getPropteryValueByAttributeFQN(product, me.productAttributes.designCode);
								childUOM = getPropteryValueByAttributeFQN(product ,me.productAttributes.unitOfMeasure);
								
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
			var me = this;
			console.log("initialize");
            // LG change - updated dummyurl to remove doubleslash within url
            var dummyurl = me.dndEngineUrl+"ajax/nosession/loading.html"; // url of static html page that demonstrates that that loading is in progress
            var dndpopup = $('<div>').addClass('dnd-popup');
            var a = $('<a>').attr('href','#').addClass('personalize-close').html('&times;');
            var iframe = $('<iframe data-time="'+me.time+'" src="'+dummyurl+'" id="iframe'+me.time+'" name="iframe'+me.time+'" width="750" height="689"></iframe>');
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
				if(me.form){
					$(me.form).remove();
				}
				me.unsend();

                //google analytics code for personlaize close
                var gapersonalizeclose;
                try{
                    if(me.model.toJSON().content && me.model.toJSON().content.productName){
                       gapersonalizeclose = me.model.toJSON().content.productName;
                    }
                    else if(me.model.toJSON().name){
                       gapersonalizeclose = me.model.toJSON().name;
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
			var me = this;
			// function that will listen for post back from iframe
			console.log('onDNDSubmit',e.data);
					
			// receive data 
			var responseData = e.data;
			if(responseData!=="process-tick" && responseData.projectToken){
				var extraData = '';
				var curObj = me.dndArr[me.index];
				console.log(curObj);
				if(responseData.ecometrySku){ 
					var eskuSplit = null, eskuValue;
					eskuValue = responseData.ecometrySku;
					if(responseData.ecometrySku.indexOf('@')!==-1){
						eskuSplit = responseData.ecometrySku.split('@');
						eskuValue = eskuSplit[eskuSplit.length-1];
					}
					me.projectToken[curObj.productID+"@"+eskuValue] = responseData.projectToken;
				}
				else{
					me.projectToken[curObj.productID+"@"+curObj.ecometrySku]=responseData.projectToken;
				}
				extraData = JSON.stringify(me.projectToken);
				responseData.projectToken = extraData;

				// increment counter
				me.index++;

				// see if we have more items to process
				if(me.index < me.dndArr.length){
					//relaunch personalization on next item
					me.doPers();
				}
				else{
					// remove form
					if(this.form){
						$(this.form).remove();
					}
					
					me.unsend(); // unbind window event listeners

					// save personalization to cart
					switch(responseData.method){
						case 'AddToCart':
							me.view.addToCartAfterPersonalize(responseData); //productview
							break;
						case 'UpdateCart': 
							me.view.updateCartItemPersonalize(responseData); //cartview
							break;
						case 'AddToWishlist':
							me.view.AddToWishlistAfterPersonalize(responseData); //productview
							break;    
					}

				}
			}
		};
		self.unsend = function(){
			// undoes event attachment done in send()
			console.log("unsend");
			var deleteMethod = window.removeEventListener ? "removeEventListener" : "detachEvent";
			var deleter = window[deleteMethod];
			var messageEvent = deleteMethod == "detachEvent" ? "onmessage" : "message";
			deleter(messageEvent,this.eventBound,false);
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

			this.eventBound = this.onDNDSubmit.bind(this); // have to set it to a variable so that we can remove event - doesn't work with "this.onDNDSubmit.bind(this)" as event (not sure why exactly https://stackoverflow.com/questions/11565471/removing-event-listener-which-was-added-with-bind)
			
			var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
			var eventer = window[eventMethod];
			var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
			eventer(messageEvent,this.eventBound,false);

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
			var form;
			
			if(this.form){
				// clean up any existing forms
				$(this.form).remove();
			}

			if(this.lineitemID){
				if(this.mcToken){
					// re-edit with mediaclip
					var userToken = McCookie.getToken(pageContext.user,this.doPers.bind(this));
					if(userToken){
						var reeditURL = "/personalize/"+this.mcToken;
						
						// create new form that posts to mediaclip url (must be get, no post)
						form = $('<form action="'+reeditURL+'" target="iframe'+me.time+'" method="get" id="form'+me.time+'_'+me.index+'" name="form'+me.time+'"></form>');
						addParameter(form,"token",userToken);
						// save to object so we can clean it up if needed
						me.form = form;

						// insert and post form
						$("body").append(me.form);
						me.form.submit();
						
					}
					return;  // exit doPers will be called again once we get a userToken
				}
				else{
					// re-edit with dnd
					var url = this.dndEngineUrl+this.dndToken+"/edit";
					//console.log(url);
					//console.log(dndItem);

					// create new form
					form = $('<form action="'+url+'" target="iframe'+this.time+'" method="post" id="form'+this.time+'_'+this.index+'" name="form'+this.time+'"></form>');
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
			}
			else if(dndItem.mcCode){
				// launch media clip window
				//console.log(dndItem.mcCode);
				
				console.log(me.model.getConfiguredOptions());
				
				/* mediaclip will add to cart by making a server-side api call - we'll need to provide it with the same info that mozu-storefront-sdk product addtocart does
				    product: {
						productCode: this.data.productCode,
						variationProductCode: this.data.variationProductCode,
						options: payload.options || this.data.options
					},
					quantity: payload.quantity || 1,
					fulfillmentLocationCode: payload.fulfillmentLocationCode,
					fulfillmentMethod: payload.fulfillmentMethod || (this.data.fulfillmentTypesSupported && catalogToCommerceFulfillmentTypeConstants[this.data.fulfillmentTypesSupported[0]]) || (this.data.goodsType === CONSTANTS.GOODS_TYPES.PHYSICAL ? CONSTANTS.COMMERCE_FULFILLMENT_METHODS.SHIP : CONSTANTS.COMMERCE_FULFILLMENT_METHODS.DIGITAL)
				*/
				
				$.ajax({
					url: "/get-personalization",
					method:"POST",
					data: {
						mcCode: dndItem.mcCode,
						productCode:  me.model.get('productCode'),
						variationProductCode: me.model.get('variationProductCode'),
						options: me.model.getConfiguredOptions(),
						quantity: me.model.get("quantity"),
						tokenPrefix:	dndItem.productID+"@"+dndItem.ecometrySku
					},
					dataType:"json",
					success:function(data){
						console.log(data);
						var url = "/personalize/"+data.id;
						console.log(url);
						
						// create new form that posts to mediaclip url (must be get, no post)
						var form = $('<form action="'+url+'" target="iframe'+me.time+'" method="get" id="form'+me.time+'_'+me.index+'" name="form'+me.time+'"></form>');
						
						McCookie.setCookie(pageContext.user,data.userToken);
						
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
				// create new form
				form = $('<form action="'+this.dndEngineUrl+'" target="iframe'+this.time+'" method="post" id="form'+this.time+'_'+this.index+'" name="form'+this.time+'"></form>');
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
    return {
		DNDEngine:DNDEngine,
		getTokenData:DNDToken.getTokenData
    };
});