define(['modules/jquery-mozu','hyprlive',"modules/api","modules/models-product"], function ($, Hypr,Api,ProductModels) {    
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

	//https://gist.github.com/SparK-Cruz/1570177
	var dndItem = (function(){
		var C = function(){ return constructor.apply(this,arguments); };
		var p = C.prototype;
		
		//construct
		function constructor(productID, itemDescription, ecometrySku, mcCode, dndCode, designCode, quantity, price, volumePricing, minQty, maxQty, unitOfMeasure, lineitemID, parentProductID, extras){
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
			this.extras = extras;
		}

		//define methods
		p.launch = function(){
			// open populate iframe with appropriate technology
			
		};
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
	
    var DNDEngine = function(model,url,dndToken)
    {
        var self = this;
        self.projectToken = {};
        var pageContext = require.mozuData('pagecontext');
        self.pageType = pageContext.pageType;
        if(self.pageType.toLowerCase()==='cart'){
            if(model.get('id')){
                self.lineitemID = model.get('id');
                self.model=model.get('product');
                window.prodModel = model.get('product');
            }else{
                 self.lineitemID = model.get('cartlineid');
                self.model=model;
                window.prodModel = model;
            }
        }else{
            self.model=model;
            window.prodModel = model; 
        }
        self.productUsage = self.model.get('productUsage');
        self.parentProductID=null;
        if(self.productUsage==="Bundle"){
            self.parentProductID=self.model.get('productCode');
        }
        self.bundleProducts = window.personalizeBundleProducts?window.personalizeBundleProducts:[];
        self.personalizeItemsLength = self.bundleProducts.length;
        self.itemCounter = 0;
        window.dndItemCounter = self.itemCounter;
        self.errorMsgCounter = 0;
        self.errorMsg="";
        self.productAttributes = Hypr.getThemeSetting('productAttributes');
        self.dndEngineUrl= Hypr.getThemeSetting('dndEngineUrl');
        self.time = new Date().getTime();
        self.form = $('<form action="'+url+'" target="iframe'+self.time+'" method="post" id="form'+self.time+'" name="form'+self.time+'"></form>');
        window.dndFormObj=self.form;
		
		self.getExtraProduct = function(productCode){ // very similar to getExtraProduct in product.js but action is different inside api promise
			var me = this;
			console.log("dndengine getExtraProduct");
            var product = null;
            if(window.extrasProducts.length>0){ // window.extrasProducts is shared by dndegine.js and product.js
                    for(var i=0;i < window.extrasProducts.length;i++){
                        if(window.extrasProducts[i].get('productCode')===productCode){
                            product = window.extrasProducts[i];
							console.log('found it!');
                            break;
                        }
                    }
            }
			if(product){
				return product;
			}
			else{
				// make api call to get product info and then call initializeAndSend on response
				Api.get('product',{productCode:productCode}).then(function(res){
					var product = new ProductModels.Product(res.data);
					window.extrasProducts.push(product);
					me.initializeAndSend();
				});
				return false;
			}
        };
		
        self.getParameters=function(){
            var me = this;
			var dndArr = []; // array of info
			
			/* build array of info */
			var mfgpartnumber,parentDND,parentDesign,childDND,childDesign,options,i,productCode,attributeFQN,option,product,parentUOM,childUOM,parentMC,childMC;
			if(self.model.get('productUsage') === "Bundle"){
				// loop over components
				var bp = self.model.get('bundledProducts');
				for (i =0; i< bp.length; i++) {
					var component = bp[i];
				   	console.log(component);
					
					//var product = self.getExtraProduct(productCode);
					
					//mfgpartnumber = product.get('mfgPartNumber');
					//childDND = getPropteryValueByAttributeFQN(product, self.productAttributes.dndCode);
					//childDesign = getPropteryValueByAttributeFQN(product, self.productAttributes.designCode);
				}
				
				// loop over extras
				options=me.model.getConfiguredOptions();
				for(i=0;i < options.length;i++){
                    productCode = options[i].value;
					attributeFQN = options[i].attributeFQN;
					option = me.model.get('options').get(attributeFQN);
                    if(option.get('attributeDetail').usageType ==='Extra' && option.get('attributeDetail').dataType==='ProductCode'){
						product = self.getExtraProduct(productCode);
						if(product){
							mfgpartnumber = product.get('mfgPartNumber');
							childDND = getPropteryValueByAttributeFQN(product, self.productAttributes.dndCode);
							childDesign = getPropteryValueByAttributeFQN(product, self.productAttributes.designCode);
							childUOM = getPropteryValueByAttributeFQN(product ,self.productAttributes.unitOfMeasure);
						}
						else{
							return(false);// exit, means we are waiting on api call inside getExtraProduct
						}
                    }
                }

			}
			else{
				// look at parent
				mfgpartnumber = this.model.get('mfgPartNumber');
				parentDND = getPropteryValueByAttributeFQN(this.model, self.productAttributes.dndCode);
				parentDesign = getPropteryValueByAttributeFQN(this.model, self.productAttributes.designCode);
				parentMC = getPropteryValueByAttributeFQN(this.model, self.productAttributes.mcCode);
				parentUOM = getPropteryValueByAttributeFQN(self.model, self.productAttributes.unitOfMeasure);
				
				if(mfgpartnumber && mfgpartnumber.length > 0){
					// look at extras as stand-alone components
					options=me.model.getConfiguredOptions();
					for(i=0;i < options.length;i++){
						productCode = options[i].value;
						attributeFQN = options[i].attributeFQN;
						option = me.model.get('options').get(attributeFQN);
						if(option.get('attributeDetail').usageType ==='Extra' && option.get('attributeDetail').dataType==='ProductCode'){
							product = self.getExtraProduct(productCode);
							if(product){
								mfgpartnumber = product.get('mfgPartNumber');
								childDND = getPropteryValueByAttributeFQN(product, self.productAttributes.dndCode);
								childDesign = getPropteryValueByAttributeFQN(product ,self.productAttributes.designCode);
								childUOM = getPropteryValueByAttributeFQN(product ,self.productAttributes.unitOfMeasure);
							}
							else{
								return(false);// exit, means we are waiting on api call inside getExtraProduct
							}
						}
					}
					
				}
				else{
					// look at extras for mfgpartnumber
					options=me.model.getConfiguredOptions();
					for(i=0;i < options.length;i++){
						productCode = options[i].value;
						attributeFQN = options[i].attributeFQN;
						option = me.model.get('options').get(attributeFQN);
						if(option.get('attributeDetail').usageType ==='Extra' && option.get('attributeDetail').dataType==='ProductCode'){
							product = self.getExtraProduct(productCode);
							//console.log(product);
							if(product){
								childMC = getPropteryValueByAttributeFQN(product, self.productAttributes.mcCode);
								childDND = getPropteryValueByAttributeFQN(product, self.productAttributes.dndCode);
								childDesign = getPropteryValueByAttributeFQN(product, self.productAttributes.designCode);
								childUOM = getPropteryValueByAttributeFQN(product ,self.productAttributes.unitOfMeasure);
								
								var newItem = dndItem();
								newItem.ecometrySku = product.get('mfgPartNumber');
								newItem.dndCode = (childDND && childDND.length)?childDND:parentDND;
								newItem.designCode = (childDesign && childDesign.length)?childDesign:parentDesign;
								newItem.mcCode = (childMC && childMC.length)?childMC:parentMC;
								newItem.unitOfMeasure = (childUOM && childUOM.length)?childUOM:parentUOM;

								newItem.productID = me.model.get('productCode');
								newItem.itemDescription = me.model.get('content.productName');
								newItem.parentProductID = null;
								newItem.setFromModel(me);
								
								// TO DO: this.extras = extras; - what populates this.model.get('extrasProductInfo');
								
							}
							else{
								return(false);// exit, means we are waiting on api call inside getExtraProduct
							}
						}
					}
				}
			}
			
			self.addParameter('productID',this.model.get('productCode'));
            self.addParameter('ecometrySku',this.model.get('mfgPartNumber')); // **
            var dndCode = getPropteryValueByAttributeFQN(self.model, self.productAttributes.dndCode); // **
            var designCode = getPropteryValueByAttributeFQN(self.model, self.productAttributes.designCode);// **
            if(this.model.get('designCode')){
                self.addParameter('designCode',this.model.get('designCode'));
            }else{
                self.addParameter('designCode',designCode);
            }
            if(this.model.get('dndCode')){
                self.addParameter('dndCode',this.model.get('dndCode'));
            }else{
                self.addParameter('dndCode',dndCode);
            }
            var inventoryInfo = this.model.get('inventoryInfo');
            if(inventoryInfo){
                if(inventoryInfo.manageStock)
                self.addParameter('maxQty',inventoryInfo.onlineStockAvailable);
            }
            var extrasInfo = this.model.get('extrasProductInfo');
            if(extrasInfo){
                self.addParameter('extras',JSON.stringify(extrasInfo));
            }
            var qty = this.model.get('quantity')?this.model.get('quantity'):1;
            self.addParameter('quantity',qty);
            self.addParameter('itemDescription',this.model.get('content.productName'));
            if(this.pageType.toLowerCase() === 'cart'){
				if(parseInt(this.model.get('price').salePrice,10) > 0)
                    self.addParameter('price',this.model.get('price').salePrice);
                else
                    self.addParameter('price',this.model.get('price').price);
            }else{
                if(parseInt(this.model.get('price').get('salePrice'),10) > 0)
                    self.addParameter('price',this.model.get('price').get('salePrice'));
                else
                	self.addParameter('price',this.model.get('price').get('price'));
            }
            if(self.lineitemID){
                self.addParameter('lineitemID',this.lineitemID);
            }
            var minQty = (this.model._minQty)?this.model._minQty:qty;
            self.addParameter('minQty',minQty);
            var uom = '';
            if(self.model.get('uom')){
                uom = self.model.get('uom');
            }
            var unitOfMeasure = getPropteryValueByAttributeFQN(self.model, self.productAttributes.unitOfMeasure);
            if(unitOfMeasure){
                uom = unitOfMeasure;

            }
            self.addParameter('unitOfMeasure',uom);
            var volumePriceBands = self.model.get('volumePriceBands');
            if(volumePriceBands && volumePriceBands.length>0){
                var volPrice = [];
                for(i=0; i<volumePriceBands.length;i++){
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
                self.addParameter('volumePricing', JSON.stringify(volPrice));
            }
			return(dndArr);
        };
         self.updateParameters = function(){
            var self= this;
            $(self.form).find('input[name="productID"]').val(this.model.get('productCode'));
            $(self.form).find('input[name="ecometrySku"]').val(this.model.get('mfgPartNumber'));
             var dndCode = getPropteryValueByAttributeFQN(self.model, self.productAttributes.dndCode);
             var designCode = getPropteryValueByAttributeFQN(self.model, self.productAttributes.designCode);
             $(self.form).find('input[name="dndCode"]').val(dndCode);
            $(self.form).find('input[name="designCode"]').val(designCode);
            $(self.form).find('input[name="itemDescription"]').val(this.model.get('content.productName'));
            var remainPersItems = (self.itemCounter!==(self.personalizeItemsLength-1))?true:false;
             if($(self.form).find('input[name="isBundle"]').length>0){
                    $(self.form).find('input[name="isBundle"]').val(true);
                    $(self.form).find('input[name="remainingPersItems"]').val(remainPersItems); 
                }else{
                    self.addParameter('isBundle', true);
                    self.addParameter('remainingPersItems', remainPersItems);
                }
            if(self.parentProductID){
                if($(self.form).find('input[name="parentProductID"]').length===0){
                    self.addParameter('parentProductID', self.parentProductID);
                }
            }    

        };
        self.saveCart = function(data){
            var self = this;
            //console.log(data);
            $(self.form).remove();
            switch(data.method){
                case 'AddToCart':
                    window.productView.addToCartAfterPersonalize(data);
                    break;
                case 'UpdateCart': 
                    window.cartView.cartView.updateCartItemPersonalize(data);
                    break;
                case 'AddToWishlist':
                    window.productView.AddToWishlistAfterPersonalize(data);
                    break;  
                case 'LPerror':
					/* not used anymore
                     if(data.message===self.errorMsg){
                        self.errorMsgCounter++;
                     }else{
                        self.errorMsgCounter=1;
                     }
                     self.errorMsg = data.message;
                    lpAddVars('page','DND',data.message);
                    lpAddVars('page','ErrorCounter',self.errorMsgCounter); */
                    break;      
            }
        };
        self.initializeAndSend=function(){
            var self = this;
			var dndArr = self.getParameters();
            if(!dndArr)
				return;

            // GA for personalized code
                 
            /*
            Code Added by Asaithambi
            Create IE + others compatible event handler
            */
            if(window.eventBindFlag===undefined){
                var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
                var eventer = window[eventMethod];
                var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
                window.eventBindFlag = true;
                // Listen to message from child window
                eventer(messageEvent,function(e) {
                 // console.log('parent received message!:  ',e.data);
                  self.model = window.prodModel;
                  self.itemCounter = window.dndItemCounter;
                  self.form = window.dndFormObj;
                  var responseData = e.data;
                  //$('.personalize-close').trigger('click');
                  if(responseData!=="process-tick" && responseData.projectToken){
                      var extraData = '';
                        if(responseData.ecometrySku){ 
                            var eskuSplit = null, eskuValue;
                            eskuValue = responseData.ecometrySku;
                            if(responseData.ecometrySku.indexOf('@')!==-1){
                                eskuSplit = responseData.ecometrySku.split('@');
                                eskuValue = eskuSplit[eskuSplit.length-1];
                            }
                            self.projectToken[self.model.get('productCode')+"@"+eskuValue] = responseData.projectToken;
                        }
                        else{
                            self.projectToken[self.model.get('productCode')+"@"+self.model.get('mfgPartNumber')]=responseData.projectToken;
                        }
                        extraData = JSON.stringify(self.projectToken);
                        responseData.projectToken = extraData;
                      if(self.productUsage==='Bundle'){
                        if(self.itemCounter < self.personalizeItemsLength){
                            self.dndRequest();
                        }else{ 
                            self.projectToken={};
                            self.saveCart(responseData);
                        }
                      }else{
                        self.projectToken={};
                        self.saveCart(responseData);
                      }
                    }  

                },false);
            }
            try{
                var galabel;

                if(this.model.toJSON().content && this.model.toJSON().content.productName){
                   galabel = this.model.toJSON().content.productName;
                } 
                else if(this.model.toJSON().name){
                   galabel = this.model.toJSON().name;
                }
                
               
                    
                    if(ga!==undefined){
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
             
            
            $(document).on('click', '.personalize-close', function(){
                $('.dnd-popup').remove();

                $(self.form).remove(); // LG change - added
                $('#cboxOverlay').hide();
                $('body').css({overflow: 'auto'});
                $('html').removeClass('dnd-active-noscroll');
                
                //google analytics code for personlaize close
                
                var gapersonalizeclose;
                try{
                     
                    if(self.model.toJSON().content && self.model.toJSON().content.productName){
                       gapersonalizeclose = self.model.toJSON().content.productName;
                    }
                    else if(self.model.toJSON().name){
                       gapersonalizeclose = self.model.toJSON().name;
                    }
                        if(ga!==undefined){
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
			this.send();
        };
        self.dndRequest = function(){
            $('#cboxOverlay').show();
            $('.dnd-popup').show();
            $('body').css({overflow: 'hidden'});
            if(self.productUsage==='Bundle'){
                if(self.itemCounter < self.personalizeItemsLength){
                    self.model = self.bundleProducts[self.itemCounter];
                    window.prodModel = self.bundleProducts[self.itemCounter]; 
                    self.updateParameters();
                }
            }
            self.itemCounter++;
            window.dndItemCounter = self.itemCounter;
            self.form.submit(); 
            
        };
        self.addParameter = function(parameter,value)
        {
            $("<input type='hidden' />")
             .attr("name", parameter)
             .attr("value", value)
             .appendTo(self.form);
        };
        self.send = function()
        {
            // LG change - updated dummyurl to remove doubleslash within url
            var dummyurl = self.dndEngineUrl+"ajax/nosession/loading.html"; // url of static html page that demonstrates that that loading is in progress
            var dndpopup = $('<div>').addClass('dnd-popup');
            var a = $('<a>').attr('href','#').addClass('personalize-close').html('&times;');
            var iframe = $('<iframe data-time="'+self.time+'" src="'+dummyurl+'" id="iframe'+self.time+'" name="iframe'+self.time+'" width="750" height="689"></iframe>');
            dndpopup.append(a);
            dndpopup.append(iframe);
            $( "body").append(self.form);
            $( "body").append(dndpopup);

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

            //iframe.attr('src', url);  // LG change - commented out
            self.dndRequest();
            
            // LG change - added below
            iframe.load(function(){
             $(window).resize();
            });
        };
    };
    return {
                DNDEngine:DNDEngine
        };
});