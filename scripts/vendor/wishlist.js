define(['modules/jquery-mozu', 'modules/api', 'hyprlive', 'modules/models-product', 'vendor/bootstrap-datetimepicker'], function($, Api, Hypr, ProductModels, SimpleDateTimePicker){
	var productAttributes = Hypr.getThemeSetting('productAttributes');
	var dndEngineUrl = Hypr.getThemeSetting('dndEngineUrl');
	function logResults(json){
		console.log(json);
		if(window.wishlistModel){
			window.wishlistModel.trigger('addedtowishlist');
		}
	}
	var wishlist = {
		getTemplate: function(){
			var template = '<div id="wishlist-overlay">';
			template += '<div class="wishlist-wrapper">';
			template += '<a id="wishlist-close" class="popup-close">&times;</a>';
			template += '<div class="list-wrapper">';
			template += '<h2>Save product to wishlist</h2>';
			template += '<p>What party are you planning?</p>';
			template += '<form action="" method="get">';
			template += '<ul class="wishlists">';
			template += '<li style="display: none;">';
			template += '<label><input type="radio" name="wishlist-radio" id="new-wishlist-radio" value="new-list" checked>Create New Wishlist</label>';
			template += '</li>';
			template += '</ul>';
			template += '<hr>';
			template += '<div class="wishlist_create_box">';
			template += '<div class="wishlist-create-new" style="display: none;">';
			template += '<input type="text" name="wishlist-new" id="new-wishlist-name" placeholder="Wishlist Name">';
			template += '<label><span class="is-required">*</span>Event Date</label>';
			template += '<input type="text" name="event-date" id="new-event-date" placeholder="MM-DD-YYYY">';
			template += '<select id="new-events-name"><option value="select-events">Event Type</option>'
			var respon = Hypr.getThemeSetting('wishlisteventtypes').split(',');
            _.each(respon,function(val,key){
			console.log(val);
			template +=	'<option value="'+val+'">'+val+'</option>';
			});
           template += '</select><button id="select-wishlist" type="button" class="btn-wishlit">Save</button>';
			template += '</div>';  
			template += '<h3 class="create_toggle" id="new-wishlist"><i class="fa fa-plus"></i> Create a New List</h3>';
			template += '</div>';
			template += '</form>';
			template += '</div>';
			template += '</div>';
			template += '</div>';
			return $(template);

		},
		getSaveDesignTemplate: function(name, model, callBackFunction) {
			var me = this;
			var template = '<div class="list-wrapper">';
			template += '<div class="save-design">';
			template += '<h2>NAME YOUR DESIGN</h2>';
			if(name !== "") {
				template += '<div id="exDesign-name"><p>Save as existing design</p><a href="javascript:void(0)" id="exname-btn">' + name + '</a></div>';
			}
			template += '<label class="design-name-lbl">Save as new design</label><input type="text" id="newDesignName">';
			template += '<button class="mz-button mz-button-large primary" id="save-design-btn">Save</button>';
			template += '</div>';
			template += '</div>';
			$('.list-wrapper').hide().last().after(template);
			$('#exname-btn').click(function(){
				var option = model.get('options').get(productAttributes.dndToken);
				var designName = $(this).text();
				if(option){
					var dndtokenvalue = option.get('value');
					dndkenval={};
					if(dndtokenvalue!==""){
						dndkenval=JSON.parse(dndtokenvalue);
					}
					dndkenval.designName = designName;
					option.set('value',JSON.stringify(dndkenval));
					option.set('shopperEnteredValue',JSON.stringify(dndkenval));
				}
				model.set('updateItem',1);
				me.saveWishlistItem(model,callBackFunction);


				//me.getLastTemplate(model, callBackFunction);
				//$('.list-wrapper').hide().last().after(template);
			});
			$('#save-design-btn').click(function(){
				var option = model.get('options').get(productAttributes.dndToken);
				var designName = $('#newDesignName').val();
				if(option){
					var dndtokenvalue = option.get('value');
					dndkenval={};
					if(dndtokenvalue!==""){
						dndkenval=JSON.parse(dndtokenvalue);
					}
					dndkenval.designName = designName;
					option.set('value',JSON.stringify(dndkenval));
					option.set('shopperEnteredValue',JSON.stringify(dndkenval));
				}
				model.set('updateItem',0);
				me.saveWishlistItem(model,callBackFunction);
				//me.getLastTemplate(model,callBackFunction);
				//$('.list-wrapper').empty().append(template);
			});
		},
		saveWishlistItem: function(model,callBackFunction){
			var me = this;
			var Successcallback = function(res,prod){
					var dndTokenVal = prod.get('dndTokenValue');
						window.wishlistModel = prod;
						try{
							$.ajax({
								url: dndEngineUrl+dndTokenVal+'/confirmWishlist?wishlistID='+res.id,
								type:'GET',
								dataType:'jsonp',
								success:function(json){
									me.getLastTemplate(prod, res, callBackFunction);
									prod.trigger('referWishlistView');
								},
								jsonpCallback: "logResults"
							});
					   }catch(e){
					   		console.log(e);
					   }
				}
				if(model.get('wishlistId')){
					me.updateItemToWishlist(model, Successcallback);
				}else{
					me.addItemToWishlist(model, Successcallback);
				}
		},
		getLastTemplate: function(model, res, callBackFunction){
			var me = this;
			var template = '<div class="list-wrapper">';
			template += '<div class="save-design-confirm">';
			template += '<button class="mz-button mz-button-large primary" id="save-design-btn-close">Continue Shopping</button>';
			template += '<button class="mz-button mz-button-large secondary" id="continue-personalizing">CONTINUE PERSONALIZING</button>';
			template += '</div>';
			template += '</div>';
			$('.list-wrapper').hide().last().after(template);
			$('#save-design-btn-close').click(function() {
				 $("#wishlist-close").trigger('click');
				 model.trigger('addedtowishlist');
			});

			$('#continue-personalizing').click(function() {
				var dndTokenVal = model.get('dndTokenValue');
				var redirectUrl = dndEngineUrl+dndTokenVal+'/wishlist?wishlistID='+res.id;
				$('.dnd-popup iframe').attr('src',redirectUrl);
				$("#wishlist-close").trigger('click');
			});
		},
		showAddedPopup: function(msg) {
	        var template = '<div style="background-color: #fff;position: fixed;top: 0;left: 0;right: 0;bottom: 0;margin: auto;border: 1px solid #cccccc;padding: 40px 30px;border-radius: 4px;width: 320px;height: 40px;text-align: center;z-index: 9999;box-shadow: 0 0 40px #666666;"><p style="font-size: 18px;color: #00b09b;">' + msg + '</p></div>';

	        $(template).appendTo(document.body).fadeOut(4000, function(){
	        	$(this).remove();
	        });
		},
		getAllWishlist: function() {
			return Api.request('GET', '/api/commerce/wishlists/?responseFields=items(id,name)', {});
		},
		getAllWishlistData: function() {
			return Api.request('GET', '/api/commerce/wishlists/', {});
		},
		getWishlistById: function(id){
			return Api.request('GET', '/api/commerce/wishlists/'+ id, {});
		},
		getWishlistByName: function(custId, name){
			return Api.request('GET', '/api/commerce/wishlists/customers/' + custId + '/' + name, {});
		},
		createNewWishlist: function(name, eventType, eventDate){
			eventType = typeof eventType !== 'undefined' ? eventType : 'No Type';
			eventDate = typeof eventDate !== 'undefined' ? eventDate : 'No Date';
			return Api.request("post", "/api/commerce/wishlists/", {
                "name": name,
                "typeTag": name,
                "extendedProperties": [
					{
						"key": "eventType",
						"value": eventType
					},
					{
						"key": "eventDate",
						"value": eventDate
					}
			   ]
			});
		},
		deleteWishlist: function(id) {
			return Api.request('DELETE', '/api/commerce/wishlists/' + id, {});
		},
		addItem: function(id, model){
			var data = {};
			if(model.toJSON !== undefined) {
				data.product = model.toJSON();
				if(model.get("quantity")) {
					data.quantity = model.get("quantity");
				}else {
					data.quantity = 1;
				}
			}else {
				data = model;
			}
			return Api.request('post', '/api/commerce/wishlists/' + id + '/items', data);
		},
		updateItem: function(id,itemid,model){
			var data = {};
			if(model.toJSON !== undefined) {
				data.product = model.toJSON();
				if(model.get("quantity")){
					data.quantity = model.get("quantity");
				}else{
					data.quantity = 1;
				}
			}else{
				data = model;
			}
			return Api.request('PUT', '/api/commerce/wishlists/' + id + '/items/'+itemid, data);
		},
		removeAllItems: function(wishlistId){
			return Api.request('DELETE', '/api/commerce/wishlists/' + wishlistId + '/items', {});
		},
		removeWishlistItem: function(wishlistId, itemId) {
			return Api.request('DELETE', '/api/commerce/wishlists/' + wishlistId + '/items/' + itemId, {});
		},
		getWishlistItems: function(wishlistId) {
			return Api.request('GET', '/api/commerce/wishlists/' + wishlistId + '/items', {});
		},
		getWishlistItemById: function(wishlistId, wishlistItemId) {
			return Api.request('GET', '/api/commerce/wishlists/' + wishlistId + '/items/' + wishlistItemId, {});
		},
		moveToWishlist: function(exWishlistId, newWishlistId, productId, callBackFunction, originalProductId) {
			var me = this;
	        if(originalProductId !== false && newWishlistId !== "") {
	        	me.createNewWishlist(newWishlistId,$('#new-events-name option:selected').val(), $("#new-event-date").val()).then(function(res) {
	        		var tempResponse = res;
	        		me.getWishlistItemById(exWishlistId, productId).then(function(productModel) {
	        			me.addItem(tempResponse.id, productModel).then(function(res) {
	        				me.removeWishlistItem(exWishlistId, productId).then(function(res1) {
	        					$("#wishlist-close").trigger('click');
	        					callBackFunction(); 
	        					me.showAddedPopup('Item Successfully Moved To Wishlist.');
	        				});
	                    });
	        		});
	        		/*
	        		Api.get('product', originalProductId).then(function(model) {
	        			me.addItem(tempResponse.id, model).then(function(res) {
	        				me.removeWishlistItem(exWishlistId, productId);
	                        callBackFunction();
	                    });
	        		});
	        		*/
                });
	        }else {
	        	me.getWishlistItemById(exWishlistId, productId).then(function(productModel) {
					Api.request('post', '/api/commerce/wishlists/' + newWishlistId + '/items', productModel).then(function() {
						me.removeWishlistItem(exWishlistId, productId);
						callBackFunction();
					});
				});
	        }
		},
		updateItemToWishlist: function(model, callBackFunction){
			callBackFunction = (undefined !== callBackFunction) ? callBackFunction:function(){};
			var me= this;
			if(model.get('updateItem')===1){
				me.updateItem(model.get('wishlistId'), model.get('wishlistlineitemId'), model).then(function(res){
	               //$("#wishlist-close").trigger('click');
	                //me.showAddedPopup('Item Successfully Added To Wishlist.');
	                callBackFunction(res,model);
	            });
			}else{
				 me.addItem(model.get('wishlistId'), model).then(function(res){
	                //me.showAddedPopup('Item Successfully Added To Wishlist.');
	                callBackFunction(res,model);
	            });
			}
		},
		addItemToWishlist: function(model, callBackFunction) {
			callBackFunction = (undefined !== callBackFunction) ? callBackFunction:function(){};
			var me =  this;
	        var id = $("[name=wishlist-radio]:checked").val();
	        if(id === "new-list") {
	            if($("#new-wishlist-name").val() !== "") {
	                me.createNewWishlist($("#new-wishlist-name").val(), $('#new-events-name option:selected').val(), $("#new-event-date").val()).then(function(res){
	                    me.addItem(res.id, model).then(function(res){
	                        /*$("#wishlist-overlay").hide();
	                        $($wishlist).remove();*/
	                         me.showAddedPopup('Item Successfully Added To Wishlist.');
	                        if(model.get('moveToWishList')){
	                        	if(model.get('cartItemId')){
	                        		//$('[data-mz-cart-item='+model.get('cartItemId')+']').trigger('click');
	                        		window.cartView.cartView.removeCartItem(model.get('cartItemId'));
	                        	}
	                        	$("#wishlist-close").trigger('click');
	                    	}
	                        callBackFunction(res,model);
	                        //model.trigger('addedtowishlist');
	                    });
	                });
	            }
	        }else {
	            me.addItem(id, model).then(function(res){
	                /*$("#wishlist-overlay").hide();
	                $($wishlist).remove();*/
	                me.showAddedPopup('Item Successfully Added To Wishlist.');
	                if(model.get('moveToWishList')){
	                    $("#wishlist-close").trigger('click');
	                    if(model.get('cartItemId')){
	                        //$('[data-mz-cart-item='+model.get('cartItemId')+']').trigger('click');
	                        window.cartView.cartView.removeCartItem(model.get('cartItemId'));
	                    }
	                }
	                callBackFunction(res,model);
	                //model.trigger('addedtowishlist');
	            });
	        }
	    var gawishlist = model.toJSON().content.productName;
			if(ga!==undefined){
				ga('send', {
				hitType: 'event',
				eventCategory: 'wishlistitem',
				eventAction: 'Item added to wishlist',
				eventLabel: gawishlist
				}); 
			}

	    },
	    initoWishlist: function(model, callBackFunction){
	    	var ifrm = $("#homepageapicontext");
	    	if(ifrm.contents().find('#data-mz-preload-apicontext').html()){
		    	var apicontext = JSON.parse(ifrm.contents().find('#data-mz-preload-apicontext').html());
		    	if(apicontext)Api.context['user-claims']=apicontext.headers['x-vol-user-claims'];
	    	}

	    	var me  = this;
	        var $wishlist = me.getTemplate();
	        $('#wishlist-overlay').remove();
	        $($wishlist).appendTo(document.body);
	        
            me.getAllWishlist().then(function(res){
	            $("#wishlist-overlay ").show();
	            if(res.items.length > 0){
	                for(var i = 0; i < res.items.length; i++) {
	                    $("<li/>").append(
	                        $("<label>").html(res.items[i].name).prepend(
	                            $("<input/>").attr("type", "radio").prop("checked", false).attr("name", "wishlist-radio").val(res.items[i].id)
	                        )
	                    ).prependTo(".wishlists");
	                }
	                $("[name=wishlist-radio]").change(function(){
	                    if($(this).attr("id") === "new-wishlist-radio"){
	                        $(".wishlist-create-new").show();
	                    }else {
	                        me.addItemToWishlist(model, callBackFunction);
	                        //$($wishlist).remove();
	                        $("#wishlist-close").trigger('click');
	                    }
	                });
	            }else {
	                console.log("Empty");
	            }
	        });
	        $("#wishlist-overlay").click(function(e){
	            if(e.target !== e.currentTarget) return;
	            /*$("#wishlist-overlay").hide();
	            $($wishlist).remove();*/
	            $("#wishlist-close").trigger('click');
	        });
	        $("#new-wishlist").click(function(){
	        	$(this).hide();
	        	$(".wishlist-create-new").show();
	        });
	        $("#wishlist-close").click(function() {
	        	$("#wishlist-overlay").hide();
	            $($wishlist).remove();
	        });
	        $($wishlist).find("#select-wishlist").click(function(){
	        	me.addItemToWishlist(model, callBackFunction);
	        });
	        //$('#new-event-date').appendDtpicker();
	        $('#new-event-date').attr("data-date-format","mm-dd-yyyy");
            $('#new-event-date').datetimepicker({
                //language:  'en',
                weekStart: 1,
                todayBtn:  1,
                autoclose: 1,
                todayHighlight: 1,
                startView: 2,
                minView: 2,
                forceParse: 0
            });
	    },
	    initoWishlistPersonalize: function(model, callBackFunction){
	    	var ifrm = $("#homepageapicontext");
	    	if(ifrm.contents().find('#data-mz-preload-apicontext').html()){
		    	var apicontext = JSON.parse(ifrm.contents().find('#data-mz-preload-apicontext').html());
		    	if(apicontext)Api.context['user-claims']=apicontext.headers['x-vol-user-claims'];
	    	}
	    	//var meTarget = (event)?event.target:'noselector';
	    	var exName = "";
	    	var option = model.get('options').get(productAttributes.dndToken);
	    	var dndToken = "";
			if(option){
				var dndtokenvalue = option.get('value');
				if(dndtokenvalue && dndtokenvalue!==""){
					dndkenval=JSON.parse(dndtokenvalue);
					exName = dndkenval.designName;
					dndToken = dndkenval[Object.keys(dndkenval)[0]];
					model.set({'dndTokenValue': dndToken});
				}
			}

	    	exName = (undefined === exName) ? "":exName;
	    	//$(meTarget).prop('disabled', true);
	    	var me  = this;
	        var $wishlist = me.getTemplate();
	        $('#wishlist-overlay').remove();
	        $($wishlist).appendTo(document.body);

	        if(model.get('wishlistlineitemId')){
	        	$("#wishlist-overlay ").show();
				me.getSaveDesignTemplate(exName, model, callBackFunction);
	        }else{
	        	me.getAllWishlist().then(function(res){
		            $("#wishlist-overlay ").show();
		            if(res.items.length > 0){
		                for(var i = 0; i < res.items.length; i++) {
		                    $("<li/>").append(
		                        $("<label>").html(res.items[i].name).prepend(
		                            $("<input/>").attr("type", "radio").prop("checked", false).attr("name", "wishlist-radio").val(res.items[i].id)
		                        )
		                    ).prependTo(".wishlists");
		                }
		                $("[name=wishlist-radio]").change(function(){
		                    if($(this).attr("id") === "new-wishlist-radio"){
		                        $(".wishlist-create-new").show();
		                    }else {
	                    		//me.addItemToWishlist(model, callBackFunction);
	                    		me.getSaveDesignTemplate(exName, model, callBackFunction);
	                    		//$("#wishlist-close").trigger('click');
	                        	//$(meTarget).prop('disabled', false);
		                    }
		                });
		            }else {
		                console.log("Empty");
		            }
		        });
			}
	        $("#wishlist-overlay").click(function(e){
	            if(e.target !== e.currentTarget) return;
	            $("#wishlist-close").trigger('click');
	            //$(meTarget).prop('disabled', false);
	        });
	        $("#new-wishlist").click(function(){
	        	$(this).hide();
	        	$(".wishlist-create-new").show();
	        });
	        $("#wishlist-close").click(function() {
	        	$("#wishlist-overlay").hide();
	            $($wishlist).remove();
	            //$(meTarget).prop('disabled', false);
	        });
	        $($wishlist).find("#select-wishlist").click(function(){
	        	//$($wishlist).find('.list-wrapper').hide();
	        	//$($wishlist).find('.save-design').show();
	        	me.getSaveDesignTemplate(exName, model, callBackFunction);
	        	//me.addItemToWishlist(model, callBackFunction);
	        	//$(meTarget).prop('disabled', false);
	        });
	        //$('#new-event-date').appendDtpicker();
	        $('#new-event-date').attr("data-date-format","mm-dd-yyyy");
            $('#new-event-date').datetimepicker({
                //language:  'en',
                weekStart: 1,
                todayBtn:  1,
                autoclose: 1,
                todayHighlight: 1,
                startView: 2,
                minView: 2,
                forceParse: 0
            });
	    },
	    moveToWishlistInit: function(exWishlistId, productId, originalProductId, callBackFunction){
	    	var me  = this;
	        var $wishlist = me.getTemplate();
	        $('#wishlist-overlay').remove();
	        $($wishlist).appendTo(document.body);
	        $.data($wishlist, 'wishlist', {exWishlistId: exWishlistId, productId: productId, originalProductId: originalProductId, callBackFunction: callBackFunction});
	        me.getAllWishlist().then(function(res){
	            $("#wishlist-overlay ").show();
	            $(".wishlist-create-new").show();
	            if(res.items.length > 0){
	                for(var i = 0; i < res.items.length; i++) {
	                	if(res.items[i].id !== exWishlistId) {
	                		$("<li/>").append(
		                        $("<label>").html(res.items[i].name).prepend(
		                            $("<input/>").attr("type", "radio").prop("checked", false).attr("name", "wishlist-radio").val(res.items[i].id)
		                        )
		                    ).prependTo(".wishlists");
	                	}
	                }
	                $("[name=wishlist-radio]").change(function(){
	                    if($(this).attr("id") === "new-wishlist"){
	                        $(".wishlist-create-new").show();
	                    }else {
	                    	me.moveToWishlist(exWishlistId, $(this).val() ,productId, callBackFunction, false);
	                        //$($wishlist).remove();
	                        $("#wishlist-close").trigger('click');
	                    }
	                });
	            }else {
	                console.log("Empty");
	            }
	        });
	        $("#wishlist-overlay").click(function(e){
	            if(e.target !== e.currentTarget) return;
	            /*$("#wishlist-overlay").hide();
	            $($wishlist).remove();*/
	            $("#wishlist-close").trigger('click');
	        });
	        $($wishlist).find("#select-wishlist").click(function(){
	        	var data = $.data($wishlist, 'wishlist');
	        	if($('[name=wishlist-new').val() !== "") {
	        		me.moveToWishlist(data.exWishlistId, $('[name=wishlist-new').val(), data.productId, data.callBackFunction, data.originalProductId);
	        		//me.addItemToWishlist(model);
	        	}else {

	        	}
	        });
	        $("#wishlist-close").click(function() {
	        	$("#wishlist-overlay").hide();
	            $($wishlist).remove();
	        });
	        //$('#new-event-date').appendDtpicker();
	        $('#new-event-date').attr("data-date-format","mm-dd-yyyy");
            $('#new-event-date').datetimepicker({
                //language:  'en',
                weekStart: 1,
                todayBtn:  1,
                autoclose: 1,
                todayHighlight: 1,
                startView: 2,
                minView: 2,
                forceParse: 0
            });
	    }
	};

	return wishlist;
});
