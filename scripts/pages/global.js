require(['modules/jquery-mozu','underscore', 'modules/api','hyprlive' ,'vendor/jQuery.selectric'], function ($, _, api, Hypr) {
var pageContext = require.mozuData('pagecontext');
    var form_marketo_submit = function(e,f,$b,$email,tr,fa){
        //set values of form
        f.vals({"Email":e,"subscribeShindigz":tr,"unsubscribeShindigz":fa});
        window.subscribeEmailId += ";"+e;

        if(e !== ''){
            $b.next().hide();
            if (f.submittable()) {
                // Set it to be non submittable
                //window.email_pre.submittable(false);
                f.submit();
                f.onSuccess(function(values, followUpUrl) {
                    // Return false to prevent the submission handler continuing with its own processing
                    if($('.compare-full-error-container').length === 0){
                        //add overlay, close overlay & remove on click of "OK" button
                        var closeBtn = $("<button />").text("OK").attr("id","session-btn-rd").click(function(){
                            $(this).parent().parent().fadeOut(500,function(){
                                $(this).remove();
                            });
                        });
                        var popupOuter = $("<div />").attr("class","compare-full-error-container");
                        var popupInner = $("<div />").attr("class","compare-error-container");
                    	$(document.body).append($(popupOuter).append($(popupInner).append("<div>Thanks for subscribing</div>").append(closeBtn)));
                    }
                    $email.val("");
                    return false;
                });
            }
        }else{
            $b.next().show();
        }

        //upon not selecting any option show error message, if selected any option hide the error message and send data to the marketo
    };

    var validateEmail = function(email) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    };
    var lazyLoadImage = function(){
    /* Lazy load - it will replace img src with data-src attributes **/
        $('img[data-src]').each(function(index,el){
                    // Getting jquery window seector
                    var win = $(window);
                    // Storing top and left scroll position of window
                    var viewport = {
                        top : win.scrollTop(),
                        left : win.scrollLeft()
                    };
                    // Getting the right and bottom position of the view port
                    viewport.right = viewport.left + win.width();
                    viewport.bottom = viewport.top + win.height();
                    // Geting element boundary informations
                    var bounds = $(el).offset();
                    // calculating the bottom and right position of the element
                    bounds.right = bounds.left + $(el).outerWidth();
                    bounds.bottom = bounds.top + $(el).outerHeight();
                    // checking if any part of the element is not out side the view
                    // Check 1 : element left edge is above view port right edge
                    // Check 2 : element right edge is below view port left edge
                    // Check 3 : element top edge is above view port bottom
                    // Check 4 : element bottom edget is view port bottom
                    var isVisible = (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

                    if(isVisible){
                        // If image is updated with src attribute, donot process again
                        if(!$(el).attr('src')){
                                $(el).attr('src',$(el).attr('data-src'));
                        }
                    }
        });
    };

var getDateTime = function() {

    var date = new Date();

    var hour = date.getUTCHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getUTCMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getUTCSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getUTCFullYear();

    var month = date.getUTCMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getUTCDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

};

if(pageContext.pageType==="confirmation"){
            var order = require.mozuData('order');
            var orderId = order.Id;
            api.request('GET', '/api/platform/entitylists/abtestlist@shindigz/entities?filter=userSessionId eq '+pageContext.visit.visitId).then(function(res){
                var items = res.items;
                console.log(items);
                if(items.length>0){
                    var item = {
                        "orderNumber": order.orderNumber,
                        "orderStatus": order.status,
                        "shipTableReference": items[0].shipTableReference,
                        "userSessionId":items[0].userSessionId,
                        "createDate": getDateTime()
                    };
                    $(".abtestcontent-"+items[0].shipTableReference.toLowerCase()).show();
                    api.request('POST', '/api/platform/entitylists/abtestlistorders@shindigz/entities', item).then(function(res){
                        console.log("Abtesview updated successfully");
                        console.log(res);
                    });

                    /*api.request('POST','/api/commerce/orders/'+orderId+'/attributes', [{"fullyQualifiedName": "tenant~STR","values": [items[0].shipTableReference]}]).then(function(res){ 
                        console.log(res); 
                    });*/
                }
            });

}

/* Insert entity/Update entity for ABTestView */    

        /** update custom schema entity for ABTestview only in confirmation page **/
        /*if(pageContext.pageType!=="confirmation"){
             api.get('entityList', {
                        listName: 'abtestlist@shindigz',
                        filter:'userSessionId eq '+pageContext.visit.visitId
                    }).then(function(res){
                var items = res.data.items;
                console.log(items);
                var item;
                if(items.length>0){
                    item = items[0];
                    $(".abtestcontent-"+items[0].shipTableReference.toLowerCase()).show();
                        $.cookie('shiptableref',items[0].shipTableReference,{path:'/',expires:7});
                        item.userId = pageContext.user.userId;
                        var requestConfigure = {"url":pageContext.secureHost+"/api/platform/entitylists/abtestlist@shindigz/entities/"+item.userSessionId,"iframeTransportUrl":pageContext.secureHost+"/receiver?receiverVersion=2"};
                        api.request('PUT',requestConfigure, item).then(function(res){
                            console.log("Abtesview updated successfully");
                            console.log(res);
                        });
                }else{
                     api.get('entityList', {
                        listName: 'abtestlist@shindigz',
                        sortBy:'createDate desc',
                        pageSize:2
                    }).then(function(res){
                        items = res.data.items;
                        var shipType = "A";
                        if(items.length>0){
                            if(items[0].shipTableReference==="A"){
                                shipType ="B";
                            }else{
                                shipType ="A";
                            }
                        }
                        $.cookie('shiptableref',shipType,{path:'/',expires:7});
                       
                        $(".abtestcontent-"+shipType.toLowerCase()).show();
                        item = {
                                "shipTableReference": shipType,
                                "userSessionId":pageContext.visit.visitId,
                                "createDate": getDateTime(),
                                "accountId":pageContext.user.accountId?pageContext.user.accountId:"",
                                "userId": pageContext.user.userId
                            };
                        var requestConfigure = {"url":pageContext.secureHost+"/api/platform/entitylists/abtestlist@shindigz/entities/","iframeTransportUrl":pageContext.secureHost+"/receiver?receiverVersion=2"};
                        api.request('POST',requestConfigure, item).then(function(res){
                            console.log("Abtesview inserted successfully");
                            console.log(res);
                        });
                    });
                }
              });

        }*/

    //Ready Start

	$(document).ready(function(){
      
        // calling lazy load on page load first time
        lazyLoadImage();
        // calling lazy load on window srocll
        window.addEventListener('scroll',function() {
            lazyLoadImage();
        });

        

		      var errCtr=0,now=0,chg=0,
            themeSettings = require('hyprlivecontext').locals.themeSettings;
       	    window.subscribeEmailId = "";
        //live person code
        if(pageContext.pageType === 'checkout'){
            $('.mz-messagebar').bind("DOMSubtreeModified",function(e){

              if($('.mz-error-item').length>=1){
                chg++;
                    if(chg%5 === 0){
                    }
                }
                e.preventDefault();
            });
        }


        //criteo tagging for category page
		if(pageContext.pageType === "category" && $("#recommended_products_slot").length>=1){
			$('div.mz-productlist-item').each(function(k,v){
				if(k<=2){
				}
			});

			//first three products of plp page - category page
			var prod1 = $('div.mz-l-tiles div.mz-productlist-item').eq(0).attr("data-mz-product");
			var prod2 = $('div.mz-l-tiles div.mz-productlist-item').eq(1).attr("data-mz-product");
			var prod3 = $('div.mz-l-tiles div.mz-productlist-item').eq(2).attr("data-mz-product");

			//criteo tagging for category page - plp page
			$('body').append(' <!-- Criteo Integration Start--> <script type="text/javascript" src="//static.criteo.net/js/ld/ld.js"></script> <script type="text/javascript"> window.criteo_q = window.criteo_q || []; var deviceType = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(navigator.userAgent) ? "m" : "d"; window.criteo_q.push( { event: "setAccount", account: "'+ Hypr.getThemeSetting('criteoAccNum') +'"}, { event: "setSiteType", type: deviceType}, { event: "setEmail", email: ["'+require.mozuData('user').email+'"]}, { event: "viewList", item: ['+
				'"'+prod1+'", "'+prod2+'", "'+prod3+'"] }); </script> <!-- Criteo Integration End--> ');
		}


		//object to subcribe for email
        var obj_subscribe = {
            "attributes": [
                {
                 "attributeDefinitionId": Hypr.getThemeSetting('emailSubscription'),
                 "fullyQualifiedName": "tenant~email-subscription",
                 "values": [true]
                }
            ],
            "emailAddress": pageContext.user.email,
            "lastName": pageContext.user.lastName,
            "firstName": pageContext.user.firstName
        };

		//object to unsubscribe for email
        var obj_unsubscribe = {
            "attributes": [
                {
                 "attributeDefinitionId": Hypr.getThemeSetting('emailSubscription'),
                 "fullyQualifiedName": "tenant~email-subscription",
                 "values": [false]
                }
            ],
            "emailAddress": pageContext.user.email,
            "lastName": pageContext.user.lastName,
            "firstName": pageContext.user.firstName
        };

        $(".category-editor-container .readmore-btn").click(function(){
            if($(this).hasClass("less")){
                $(this).parent().find(".read-more-content").fadeOut();
                $(this).parent().find(".category-editor-list").fadeOut();
                $(this).removeClass("less");
                $(this).html("<em>"+$(this).attr("data-more")+"</em>");
            }else{
                $(this).parent().find(".read-more-content").fadeIn().css("display","inline");
                $(this).parent().find(".category-editor-list").fadeIn();
                $(this).addClass("less");
                $(this).html("<em>"+$(this).attr("data-less")+"</em>");
            }
        
        });
		if(pageContext.pageType === "my_account"){

			 var customer_attrib = require.mozuData('customer'),
			 	uniqueList,
			 	preferences = "",
			 	list_preferences,
			 	not_preferences ="",
			 	btn = document.getElementById("set_preferences"),
			 	preferences_list="";
			//Subscribe/unsubscribe on check and uncheck of checkbox field located in myacount page
            $('#email_subscribe').click(function(){
                var subscription = $("#email_subscribe").is(':checked'),unsubscribe = false;

                $(require.mozuData('customer').attributes).each(function(i,v){
                    if(v.fullyQualifiedName === "tenant~email-subscription" && v.values[0] === true){
                        unsubscribe = true;
                    }
                });

                if(!subscription && unsubscribe){  //if subscribed, on checking the field user will be unsubscribed for email

                    api.request('PUT','/api/commerce/customer/accounts/'+pageContext.user.accountId+'',obj_unsubscribe).then(
                    function(res){
                        //console.log(res);
                    });
                    //set values of form
                    window.email_signup.vals({"Email":pageContext.user.email,"subscribeShindigz":"no","unsubscribeShindigz":"yes"});

                    if (window.email_signup.submittable()) {

                        window.email_signup.submit();
                        window.email_signup.onSuccess(function(values, followUpUrl) {
                        	if(window.location.hash !== '#mz-drop-zone-holiday-preferences'){
								window.location.href = location.href + "#mz-drop-zone-holiday-preferences";
							}
							if($('.compare-full-error-container').length === 0){
                            	$(document.body).append("<div class='compare-full-error-container'><div class='compare-error-container'>Unsubscribed<br><button id='session-btn-rd' onclick='$(this).parent().parent().fadeOut(500);$(this).parent().parent().remove();'>OK</button></div></div>");
                            }
                            return false;
                        });
                    }
                }else if(subscription && !unsubscribe){   //if not subscribed, on checking the field user will be subscribed for email

                    api.request('PUT','/api/commerce/customer/accounts/'+pageContext.user.accountId+'',obj_subscribe).then(
                    function(res){
                        //console.log(res);
                    });
                    //set values of form
                    window.email_signup.vals({"Email":pageContext.user.email,"subscribeShindigz":"yes","unsubscribeShindigz":"no"});

                    if (window.email_signup.submittable()) {

                        window.email_signup.submit();
                        window.email_signup.onSuccess(function(values, followUpUrl) {
                        	if(window.location.hash !== '#mz-drop-zone-holiday-preferences'){
								window.location.href = location.href + "#mz-drop-zone-holiday-preferences";
							}
                        	if($('.compare-full-error-container').length === 0){
                        		$(document.body).append("<div class='compare-full-error-container'><div class='compare-error-container'>Thanks for subscribing<br><button id='session-btn-rd' onclick='$(this).parent().parent().fadeOut(500);$(this).parent().parent().remove();window.location.reload();'>OK</button></div></div>");
                        	}
                            return false;
                        });
                    }

                }
            });

			//acordion toogle, at a time expand one block
            $(document).on('click','.mz-orderhistory-section button.accordion,.mz-orderhistory-section button.accordion1', function(){

                if($(this).siblings().hasClass('active')){
                    $(this).siblings().removeClass('active');
                    $(this).siblings().next().removeClass('show');
                    //console.log($(this).siblings().offset().top);
                    $('html, body').animate({
                        scrollTop: $(this).siblings().offset().top
                    }, 300);
                }

            });


			//for email subscribed user, check the checkobx field by default on page load
            $(customer_attrib.attributes).each(function(i,v){
                if(v.fullyQualifiedName === "tenant~email-subscription" && v.values[0] === true){
                    $('#email_subscribe').attr('checked','checked');
                }
            });

            //hide error message after navigating to other section
            $('.my_account_left a,#account-messages').click(function(){
                if($('#account-messages .mz-messagebar').length>=1){
                    $('#account-messages .mz-messagebar').html('');
                }
            });

			//scroll top after changing password, if exist any error
            $('button[data-mz-action="finishEditPassword"]').click(function(){
                if($('.mz-error-item').length>=1){
                    $('html, body').animate({
                        scrollTop: $('#account-messages').offset().top
                    }, 300);
                }
            });

			//user holiday email preferences - marketo - start
            $('div.label-push-down input.check-acc-box').click(function(){
                $(btn).next().hide(); //hide the error message on selecting the option
            });

            //get the data from preferences customer attribute to preferences_list
        	$(require.mozuData('customer').attributes).each(function(i,v){
				if(v.fullyQualifiedName === "tenant~preferences"){
					//console.log(v.values);
					preferences_list = v.values;
					preferences_list[0].replace(/\s\s+/g, '');
				}
            });

			//if user subscribed for any events, on page load show the corresponding fields checked by default
			if(preferences_list !== ""){

	            var l = preferences_list[0].split(';'); //split the subscribed events into array;

				$('div.label-push-down input.check-acc-box').each(function(i,v){
					var k= $(v).next().text();
					$(l).each(function(m,n){
						if(k.indexOf(n)>=0){
							if(n!==""){
								$(v).attr('checked','checked'); //check the fields which are already subscribed for
							}
						}
					});
				});
            }


            //on click on save, export checked data to marketo and save same information in customer attribute
			if(btn !== null){
	            btn.onclick = function() {

	                $('div.label-push-down input.check-acc-box').each(function(){
		                $(btn).next().hide(); //hide the error message on selecting the option
		                if($(this).is(':checked') === true){
		                    preferences += $(this).next().text()+';';
		                }else if($(this).is(':checked') === false){
		                    not_preferences += $(this).next().text()+';';
		                }
		            });

	                preferences= preferences.replace(/\s\s+/g, ''); //replace blank spaces with null

					//filter duplicates	from preferences
					uniqueList=preferences.split(';').filter(function(item,i,allItems){

					    return i==allItems.indexOf(item);
					}).join(';');

					uniqueList = uniqueList.replace(/\s\s+/g, '');

					var obj = {
	                    "attributes": [
	                        {
	                         "attributeDefinitionId": Hypr.getThemeSetting('holidayPreferences'),
	                         "fullyQualifiedName": "tenant~preferences",
	                         "values": [uniqueList]
	                        }
	                    ],
	                    "emailAddress": pageContext.user.email,
	                    "lastName": pageContext.user.lastName,
	                    "firstName": pageContext.user.firstName
	                };

	                api.request('PUT','/api/commerce/customer/accounts/'+pageContext.user.accountId+'',obj).then(
	                function(res){
	                    //console.log(res);
	                });

	                //set values of form
	                window.email_pre.vals({ "emailPreferncesSZ": uniqueList, "Email": pageContext.user.email });

	                //upon not selecting any option show error message, if selected any option hide the error message and send data to the marketo
	                if(preferences !== ''){
	                    $(btn).next().hide();
	                    if (window.email_pre.submittable()) {
	                        // Set it to be non submittable
	                        //window.email_pre.submittable(false);
	                        window.email_pre.submit();
	                        window.email_pre.onSuccess(function(values, followUpUrl) {
	                        	if(window.location.hash !== '#mz-drop-zone-holiday-preferences'){
									window.location.href = location.href + "#mz-drop-zone-holiday-preferences";
								}
	                            // Return false to prevent the submission handler continuing with its own processing
	                            if($('.compare-full-error-container').length === 0){
	                            	$(document.body).append("<div class='compare-full-error-container'><div class='compare-error-container'>Thanks for subscribing<br><button id='session-btn-rd' onclick='$(this).parent().parent().fadeOut(500);$(this).parent().parent().remove();window.location.reload();'>OK</button></div></div>");
	                            }

	                            return false;
	                        });
	                    }
	                }else{
	                    $(btn).next().show();
	                }
	            };
           }
            //user holiday email preferences - marketo - end
            
        }

        var btn_email_signup = document.getElementById('subscribe_email');
        $("#signUpEmail").keypress(function(e){

			var keycode = (e.keyCode ? e.keyCode : e.which);
			if(keycode == '13'){
				$('#subscribe_email').click();
			}
			e.stopPropagation();
		});

        if(btn_email_signup !== null){

	        btn_email_signup.onclick = function() {
	            $("#signUpEmail").val($("#signUpEmail").val().replace(/[\s]/gi,''));
	            var email = $("#signUpEmail").val().replace(/[\s]/gi,''),x;
	            var reg = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
	            if(email !== "" && validateEmail(email)) {
	                x = 1;
	                $(this).next().html("");
	            }else if(email === ""){
	                $(this).next().html("* Enter your email");
		                $(this).next().css({'display':'block','color':'red'});
	                x = 0;
	            }else {
	                $(this).next().html("* Invalid email address");
		                $(this).next().css({'display':'block','color':'red'});
	                x = 0;
	            }
	            if(btn_email_signup !== null && !pageContext.user.isAnonymous && x){
	                if(pageContext.user.email === email){

	                    api.request('PUT','/api/commerce/customer/accounts/'+pageContext.user.accountId+'',obj_subscribe).then(
	                    function(res){
	                        //console.log(res);
	                    });

	                    if(window.subscribeEmailId.indexOf(email)>=0){
	                    	$(document.body).append("<div class='compare-full-error-container'><div class='compare-error-container'>You're Email Id Already Registered<br><button id='session-btn-rd' onclick='$(this).parent().parent().fadeOut(500);$(this).parent().parent().remove();'>OK</button></div></div>");
	                    	$("#signUpEmail").val("");
	                    }else{
	                    	form_marketo_submit(email,window.email_signup,$(btn_email_signup),$("#signUpEmail"),"yes","no");
	                    }

	                }else if(x){
	                	if(window.subscribeEmailId.indexOf(email)>=0){
	                    	$(document.body).append("<div class='compare-full-error-container'><div class='compare-error-container'>You're Email Id Already Registered<br><button id='session-btn-rd' onclick='$(this).parent().parent().fadeOut(500);$(this).parent().parent().remove();'>OK</button></div></div>");
	                    	$("#signUpEmail").val("");
	                    }else{
	                    	form_marketo_submit(email,window.email_signup,$(btn_email_signup),$("#signUpEmail"),"yes","no");
	                    }
	                }
	            }else if(pageContext.user.isAnonymous && x){
	            	if(window.subscribeEmailId.indexOf(email)>=0){
                    	$(document.body).append("<div class='compare-full-error-container'><div class='compare-error-container'>You're Email Id Already Registered<br><button id='session-btn-rd' onclick='$(this).parent().parent().fadeOut(500);$(this).parent().parent().remove();'>OK</button></div></div>");
                    	$("#signUpEmail").val("");
                    }else{
	                	form_marketo_submit(email,window.email_signup,$(btn_email_signup),$("#signUpEmail"),"yes","no");
	                }
	            }
        	};
    	}

	    $('.field-error').click(function(){
	        $(this).fadeOut();
	    });

	    //recommendations for firefox and safari browsers
		if(pageContext.pageType !== undefined || pageContext.pageType !== 'checkout'){
			//recommendations for firefox and safari browsers
			var ua = navigator.userAgent.toLowerCase();
			if((ua.indexOf('macintosh') >=0  && ua.indexOf('safari') >=0 ) || ua.indexOf('firefox') >=0 ){
				//console.log($('head script[src*="Resonance.aspx"]').length);
				if($('head script[src*="Resonance.aspx"]').length >= 1){
					var x = $('head script[src*="Resonance.aspx"]').attr('src');
					$('head').append('<script src='+x+'></script>');
				}
			}
		}
		//Please do not change

	    //Bloomreach breadcrumb tagging start for category filters
	    if(typeof BrTrk === "object"){
		    $('#Category a').click(function(){

		       var br_data = {};

		        br_data.acct_id = "5354";
		        if(!pageContext.user.isAnonymous){
		            br_data.user_id = pageContext.user.accountId;
		        }

		        br_data.ptype = 'category';
		        br_data.cat = "HOME|"+$(this).html();
		        br_data.cat_id = "cat0|cat"+$(this).data('mz-hierarchy-id');
		        br_data.is_conversion = 0;
		        br_data.order_id = "";
		        BrTrk.getTracker().updateBrData(br_data); // this call sets the 'ajax' flag, indicating an AJAX page refresh
		        BrTrk.getTracker().logPageView();
		    });

		    $(document).on('click','.search-item-name',function(){
				var searchData = {};
				searchData.aq = $('#search_text').val();
				searchData.q = $(this).attr('href').replace(/\/p\//g,'');

				BrTrk.getTracker().logEvent(
			        "suggest", // Type of the log Event
			        "click", // Action Type
			        searchData, // Data related to the event (defined above)
			        {}, // Empty value
		        true); // Deferred is set to true

			});

			$("#search_text").keypress(function(e){

				var keycode = (e.keyCode ? e.keyCode : e.which);
				if(keycode == '13'){

					var searchData = {};
					searchData.q = $(this).val();

					BrTrk.getTracker().logEvent(
					        "suggest", // Type of the log Event
					        "submit", // Action Type
					        searchData, // Data related to the event (defined above)
					        {}, // Empty value
					        true); // Deferred is set to true
				}
				e.stopPropagation();
			});
		}
		//Bloomreach breadcrumb tagging end for category filters


    if(require.mozuData("pagecontext").cmsContext !==undefined){
         if(require.mozuData("pagecontext").cmsContext.template.path!=="product"){
            createBreadcrumb();
         }

        window.isBreadcrumbLoaded=false;
        console.log("global");
        if(require.mozuData("pagecontext").cmsContext.template.path!=="checkout"){
            setInterval(function(){
                if(require.mozuData("pagecontext").url.toLowerCase()!==(window.location.origin+window.location.pathname+window.location.search).toLowerCase() && (!window.isBreadcrumbLoaded)){
                    createBreadcrumb();
                }else if(window.sessionStorage.getItem('lastItem')!==null){
                    if(require.mozuData("pagecontext").cmsContext.template.path==="product" && (document.referrer.toLowerCase().indexOf(window.sessionStorage.getItem('lastItem').toLowerCase())>-1||document.referrer==="")){
                        set_breadcrumb_html();
                    }else{
                         $("#page-content .mz-breadcrumbs").css("visibility","visible");
                    }
                }else{
                     $("#page-content .mz-breadcrumbs").css("visibility","visible");
                }
            },4000);
        }
    }
});/*document.ready end*/

    function getNewBreadcrumb(){
        var breadcrumb_obj={
            "home":{
                "title":"Home",
                "url":"/"
            },"superPage":{
            },"catPage":{
            },"productPage":{
            }
        };
        return breadcrumb_obj;
    }

    function reset_breadcrumb () {
        if (typeof(Storage) !== undefined) {
            try{
                 window.sessionStorage.setItem('breadcrumb',JSON.stringify(getNewBreadcrumb()));
                 window.sessionStorage.setItem('lastItem',"/");
            }catch(err){
                console.log("Cannot init local storage..!");
                 window.Storage._setItem = window.Storage.setItem;
                    window.Storage.prototype.setItem = function() {
                    console.log("Storage no not supported for private browsing mode");
                };
            }
        }else{
            console.log("sessionStorage is not supported by your browser.");
        }
    }
    //Set breadcrumb
    function set_breadcrumb_html(){
        if (typeof(Storage) !== undefined) {
            var bread_obj=JSON.parse(sessionStorage.getItem('breadcrumb'));
            var last_url=sessionStorage.getItem('lastItem').toLowerCase();
            if(document.referrer.indexOf("my-account")===-1 && (last_url===window.location.pathname.toLowerCase() || document.referrer!=="") && (bread_obj.catPage.url!==undefined|| bread_obj.superPage.url!==undefined)){
                var bread_text="<a href='/'  class='mz-breadcrumb-link'> "+bread_obj.home.title+" </a><span class='mz-breadcrumb-separator'> / </span>";
                if(bread_obj.superPage.url!==undefined){
                    bread_text+="<a href='"+bread_obj.superPage.url+"' class='mz-breadcrumb-link'> "+bread_obj.superPage.title+" </a><span class='mz-breadcrumb-separator'> / </span>";
                }
                if(bread_obj.catPage.url!==undefined){
                    bread_text+="<a href='"+bread_obj.catPage.url+"' class='mz-breadcrumb-link'> "+bread_obj.catPage.title+" </a><span class='mz-breadcrumb-separator'> / </span>";
                }
                if(bread_obj.productPage.url!==undefined){
                    bread_text+="<a href='javascript:void(0)'> "+bread_obj.productPage.title+" </a>";
                }else{
                    bread_text+="<a href='javascript:void(0)'> "+require.mozuData("product").content.productName+" </a>";
                }
                $("#page-content .mz-breadcrumbs").html(bread_text);
                $("#page-content .mz-breadcrumbs").css("visibility","visible");
            }else{
                $("#page-content .mz-breadcrumbs").css("visibility","visible");
            }
            window.isBreadcrumbLoaded=true;
        }else{
              $("#page-content .mz-breadcrumbs").css("visibility","visible");
        }
    }

    function add_breadcrumb_item (path,lvl,title_tag) {
        console.log("add new path "+path);
        var previous_url=document.referrer;
        previous_url=previous_url.substr(previous_url.indexOf("/",8));
        var tmp= JSON.parse(sessionStorage.getItem('breadcrumb'));
       if(lvl==="cat"){
        if(tmp.superPage.url!==undefined){
            if(tmp.superPage.url.indexOf(previous_url)>-1&&previous_url!==""){
               tmp.catPage.url=path;
               tmp.catPage.title=title_tag;
               tmp.productPage={};
               window.sessionStorage.setItem("breadcrumb",JSON.stringify(tmp));
            }else{
                tmp.catPage.url=path;
                tmp.catPage.title=title_tag;
                tmp.superPage={};
                tmp.productPage={};
                window.sessionStorage.setItem("breadcrumb",JSON.stringify(tmp));
            }
         }else{
            tmp.catPage.url=path;
            tmp.catPage.title=title_tag;
            tmp.superPage={};
            tmp.productPage={};
            window.sessionStorage.setItem("breadcrumb",JSON.stringify(tmp));
         }
        //cookie for cart page
        var date = new Date();
        var minutes = 60;
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        $.cookie('szcontinueurl',path,{path:'/',expires: date});

       }else if(lvl==="product"){
          tmp.productPage.url=path;
          tmp.productPage.title=title_tag;
          window.sessionStorage.setItem("breadcrumb",JSON.stringify(tmp));
          set_breadcrumb_html();
       }else if(lvl==="super"){
            tmp.catPage={};
            tmp.superPage.url=path;
            tmp.superPage.title=title_tag;
            window.sessionStorage.setItem("breadcrumb",JSON.stringify(tmp));
       }else if(lvl==="search"){
            tmp.catPage.url=path;
            tmp.catPage.title=title_tag;
            window.sessionStorage.setItem("breadcrumb",JSON.stringify(tmp));
       }else if(lvl==="cart"){
            tmp.catPage.url=path;
            tmp.catPage.title=title_tag;
            tmp.superPage={};
            tmp.productPage={};
            window.sessionStorage.setItem("breadcrumb",JSON.stringify(tmp));
       }
       window.sessionStorage.setItem('lastItem',path);
    }

    function createBreadcrumb(){
        var pagecnt=require.mozuData("pagecontext").cmsContext.template;
        //var title_tag=require.mozuData("pagecontext").title;
         if(window.sessionStorage.getItem('lastItem')!==null){
            //console.log("pa "+window.location.pathname);
            if(window.sessionStorage.getItem('lastItem')!==window.location.pathname+window.location.search){
                if(pagecnt.path==="categorylanding" || pagecnt.path==="category"){
                    add_breadcrumb_item(window.location.pathname+window.location.search,"cat",$(".mz-breadcrumbs:last .mz-breadcrumb-current").text());
                }else if(pagecnt.path==="main-page"){
                     reset_breadcrumb();
                }else if(pagecnt.path==="product"){
                   add_breadcrumb_item(window.location.pathname,"product",require.mozuData("product").content.productName);
                }else if(pagecnt.path==="super-page"){
                     add_breadcrumb_item(window.location.pathname,"super",$(".mz-breadcrumbs:last .mz-breadcrumb-current").text());
                }else if(pagecnt.path==="search-results" || pagecnt.path==="no-search-results"){
                     add_breadcrumb_item(window.location.pathname+window.location.search,"search","Search");
                }else if(pagecnt.path ==="cart"){
                    add_breadcrumb_item("/cart","cart","Cart");
                }
            }
         }else{
            reset_breadcrumb();
         }
    }
});
