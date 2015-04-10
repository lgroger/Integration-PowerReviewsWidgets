define(['modules/jquery-mozu', 'hyprlive',"modules/backbone-mozu",  "modules/models-product", "modules/api",'modules/models-orders'],
    function ($, Hypr, Backbone, ProductModels, Api, OrderModels) {
		
	var res = Api.get('entity',{listName: 'mozu-powerreviews-sitesettings@a0842dd', id: Api.context.site });
		
	var merchantGroupId;
	var merchantId;
    var siteId='';
	var zip_location;
	var prStylesReview;
    var prMerchantStyles2;
		
    function writeProductListBoxes() {
        $('.mz-productlist').append('<link rel="stylesheet" href=\"'+prStylesReview+'\" type="text/css" id="prBaseStylesheet">');
        $('.mz-productlist').append('<link rel="stylesheet" href=\"'+prMerchantStyles2+'\" type="text/css" id="prMerchantOverrideStylesheet">');
        $('.mz-productlist').append('<link rel="stylesheet" href="/stylesheets/widgets/pr_category.css" type="text/css" id="prCategory">');
        $('.mz-productlist').append('<link rel="stylesheet" href="/stylesheets/widgets/pr_category_styles_review_override.css" type="text/css" id="prCategoryBaseStylesheetOverride">');
        
        var allInlineRatings = $('.pr-inline-rating');
        
        
        Api.get('entityList', {
            listName: 'mozu-powerreviews-ratings@a0842dd',
            filter: 'productCode  eq ' + allInlineRatings.map(function() { return $(this).data('mzProductCode'); }).get().join(' or productCode  eq ')
        }).then(function(collection) {
            // turn from array of ids into map with key
            var productsMap = collection.data.items.reduce(function(memo, item) {
                memo[item.productCode] = item;
                return memo;
            }, {});
            allInlineRatings.each(function() {
    			var $this = $(this);
    			var productCode = $this.data('mzProductCode');
                var data = productsMap[productCode];
                if (data) {
    			var fullReviewCount=data.fullReviews;
    			var fullReviewCountText;
    			if(data.fullReviews>1){
    				fullReviewCountText="(" +data.fullReviews+"reviews)";
    			}else if(data.fullReviews==1){ 
    				fullReviewCountText="(" +data.fullReviews+"review)";
    			}
    		
        	   if(data.averageDecimalRating>0 && data.merchantGrpId==merchantGroupId){
                	$("#PRInlineRating-"+productCode).show();
                	$("#PRInlineRating-"+productCode).find( ".pr-snippet-write-review").show();
        		    $("#PRInlineRating-"+productCode).find( ".pr-snippet-read-reviews").show();
        			$("#PRInlineRating-"+productCode).find(".pr-snippet-write-review").find("a.pr-snippet-link").attr("href", '/write-a-review?pageId='+productCode+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&zipLocation='+zip_location);
        			$("#PRInlineRating-"+productCode).find(".pr-snippet-read-reviews").find("a.pr-snippet-link").find("#pr-snippet-read-review-count").text(fullReviewCount);
        			$("#PRInlineRating-"+productCode).find("#pr-snippet-rating-decimal").text(data.averageDecimalRating);
        			$("#PRInlineRating-"+productCode).find("#pr-snippet-review-count").text(fullReviewCountText);
        			$("#PRInlineRating-"+productCode).find("#pr-snippet-star-image").addClass("pr-stars").addClass("pr-stars-small").addClass("pr-stars-"+data.averageOverallRating+"-sm");
        		}else{
        		     $( "#PRInlineRating-"+productCode).show();
        		    $("#PRInlineRating-"+productCode).find( ".pr-snippet-write-first-review").show();
        			$("#PRInlineRating-"+productCode).find(".pr-snippet-write-first-review").find("a.pr-snippet-link").attr("href", '/write-a-review?pageId='+productCode+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&zipLocation='+zip_location);
        			$("#PRInlineRating-"+productCode).find("#pr-snippet-rating-decimal").text("0.0");
        			$("#PRInlineRating-"+productCode).find("#pr-snippet-review-count").text("(No reviews)");
        			$("#PRInlineRating-"+productCode).find("#pr-snippet-star-image").addClass("pr-stars").addClass("pr-stars-small").addClass("pr-stars-0_0-sm");
        		}
        		} else {
        		    $( "#PRInlineRating-"+productCode).show();
        		    $("#PRInlineRating-"+productCode).find( ".pr-snippet-write-first-review").show();
        			$("#PRInlineRating-"+productCode).find(".pr-snippet-write-first-review").find("a.pr-snippet-link").attr("href", '/write-a-review?pageId='+productCode+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&zipLocation='+zip_location);
        			$("#PRInlineRating-"+productCode).find("#pr-snippet-rating-decimal").text("0.0");
        			$("#PRInlineRating-"+productCode).find("#pr-snippet-review-count").text("(No reviews)");
        			$("#PRInlineRating-"+productCode).find("#pr-snippet-star-image").addClass("pr-stars").addClass("pr-stars-small").addClass("pr-stars-0_0-sm");
        			
        	    }
            });
            
        });
        
	}
  
    $(document).ready(function () {
        
       res.then(function(r) { 
            var data = r.data;
            var isWidget = $("#prProductDetail").val() == 1;
            var isROIWidget = $("#prROIWidget").val() == 1;
            var isReviewSnippet = $("#productReviewSnippet").val() == 1;
            var isSocialAnswerSnippet = $("#productSocialAnswerSnippet").val() == 1;
            var isReviewDisplay = $("#productReviewDisplay").val() == 1;
            var isSocialAnswerDisplay = $("#productSocialAnswerDisplay").val() == 1;
            var isTabEnabled = $("#reviewSocialAnswerTab").val() == 1;
            var locale=data.locale;
            merchantGroupId=data.merchantGrpId;
			
            merchantId=data.merchantId;
            if(data.merchantSiteId!==null){
               siteId=data.merchantSiteId;
            }
           
            zip_location="/staticContent/pwr/"+merchantGroupId+"/";
           
            var prScript = zip_location+"pwr/engine/js/full.js";
            prStylesReview = zip_location+"pwr/engine/pr_styles_review.css";
            prMerchantStyles2 = zip_location+"pwr/engine/merchant_styles2.css";
          
            
            $.getScript(prScript).done(function( script, textStatus ) {
                var currentProduct = ProductModels.Product.fromCurrent();
                if (isWidget) {
                  
                                $('head').append('<link rel="stylesheet" href=\"'+prStylesReview+'\" type="text/css" id="prBaseStylesheet">');
                                $('<script>')
                                .attr('type', 'text/javascript')
                                .text( 'var pr_locale=\"'+locale+'\";var pr_zip_location=\"'+zip_location+'\";var pr_style_sheet=\"/stylesheets/widgets/pr_product_styles_review_override.css\"')
                                .appendTo('head');
                         
                                if(isReviewSnippet)   {
                                       if(isTabEnabled){
                                             POWERREVIEWS.display.snippet({ write : function(content) {
                                                     $("#reviewSnippetProduct").append(content); } },
                                                     { pr_page_id : currentProduct.id,
                                                     pr_read_review : 'javascript:activateTab(\'reviews\');',
                                                     pr_write_review : '/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&locale='+locale});
                                       }else{
                                            POWERREVIEWS.display.snippet({ write : function(content) {
                                                     $("#reviewSnippetProduct").append(content); } },
                                                     { pr_page_id : currentProduct.id,pr_read_review : '#ReviewHeader',
                                                     pr_write_review : '/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&locale='+locale});
                                       }
                                } 
                                if(isSocialAnswerSnippet)   {
                                        if(isTabEnabled){
                                             
                                               POWERREVIEWS.display.productAnswersSnippet({ write : function(content) {
                                               $("#socialAnswerSnippet").append(content); } }, { 
                                               pr_page_id : currentProduct.id,
                                               pr_ask_question :'/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&locale='+locale+'&appName=askQuestion',
                                               pr_answer_question :'/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&locale='+locale+'&appName=answerQuestion&questionId=@@@QUESTION_ID@@@',
                                               pr_read_qa : 'javascript:activateTab(\'socialAnswer\');'});
                                        }else{
                                             POWERREVIEWS.display.productAnswersSnippet({ write : function(content) {
                                                           $("#socialAnswerSnippet").append(content); } }, { 
                                                           pr_page_id : currentProduct.id,
                                                           pr_ask_question :'/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&locale='+locale+'&appName=askQuestion',
                                                           pr_answer_question :'/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&locale='+locale+'&appName=answerQuestion&questionId=@@@QUESTION_ID@@@',
                                                           pr_read_qa : '#QAHeader'});
                                        }
                                                
                                }  
                                if(isReviewDisplay || isTabEnabled)   {
                                           POWERREVIEWS.display.engine({ write : function(content) {
                                                               $("#reviewDisplayProduct").append(content); } }, {pr_page_id : currentProduct.id,
                                                               pr_write_review : '/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&locale='+locale});
                                 }
                                if(isSocialAnswerDisplay || isTabEnabled)   {
                                           POWERREVIEWS.display.productAnswers({ write : function(content) {
                                                       $("#socialAnswerDisplay").append(content); } }, { 
                                           pr_page_id : currentProduct.id,
                                           pr_ask_question :'/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&locale='+locale+'&appName=askQuestion',
                                           pr_answer_question :'/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&locale='+locale+'&appName=answerQuestion&questionId=@@@QUESTION_ID@@@',
                                           pr_read_qa : '#QAHeader'});
                                    }
                    }else if(isROIWidget){
                        
                            var prTrackerScript = "//static.powerreviews.com/t/v1/tracker.js";
                            $.getScript(prTrackerScript).done(function( script, textStatus ) {
                            
                                    var tracker = POWERREVIEWS.tracker.createTracker({merchantGroupId: merchantGroupId});
                                    
                                     var order = OrderModels.Order.fromCurrent().attributes;
                                     var customerId="";
                                     var firstName;
                                     var lastName;
                                     if(order.customerAccountId!==null)
                                      customerId=order.customerAccountId;
                                     if (order.fulfillmentInfo!==null && order.fulfillmentInfo.fulfillmentContact!==null){
                                	   firstName=order.fulfillmentInfo.fulfillmentContact.firstName;
                                       lastName=order.fulfillmentInfo.fulfillmentContact.lastNameOrSurname;
                                    } else {
                                            firstName=order.billingInfo.billingContact.firstName;
            	                           lastName=order.billingInfo.billingContact.lastNameOrSurname;
                                    }
                                    
                                    var items = [];
                                    var item = {};
                                    
                                    for(var i=0;i<order.items.models.length;i++) {
                                        var lineItem = order.items.models[i].attributes;
                                        item["pageId"]= lineItem.product.attributes.productCode;
                                        item["unitPrice"]= lineItem.total;
                                        item["qty"]= lineItem.quantity;
                                        item["name"]= lineItem.product.attributes.name;
                                        if (lineItem.product.attributes.imageUrl !== null)
                                                item["imageURL"]= lineItem.product.attributes.imageUrl;
                                        items[i] = item;
                                    }
                                    
                                    tracker.trackPageview("c", {
                                            merchantId: merchantId,
                                            locale: locale,
                                            merchantUserId: customerId,
                                            marketingOptIn: order.acceptsMarketing,
                                            userEmail: order.email,
                                            userFirstName: firstName,
                                            userLastName: lastName,
                                            orderId: order.orderNumber,
                                            orderSubtotal: order.total,
                                            orderNumberOfItems: items.length,
                                            orderItems:items
                                            });
                                            console.log("sent order data to PowerReviews");
                            })
                            .fail(function( jqxhr, settings, exception ) {
                                     console.log(jqxhr);
                            }); 
                        
                    }else{
                      
                      writeProductListBoxes();
                     
                   }
                 })
                 .fail(function( jqxhr, settings, exception ) {
                   console.log(jqxhr);
               });
    });
      });
       
	return {
		writeProductListBoxes: function() {
			return res.then(writeProductListBoxes);
		}
	};
      
});





















