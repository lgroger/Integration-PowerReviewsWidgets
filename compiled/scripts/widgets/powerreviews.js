define(["modules/jquery-mozu","hyprlive","modules/backbone-mozu","modules/models-product","modules/api","modules/models-orders","hyprlivecontext"],function(e,t,r,i,a,n,s){function p(){e(document.body).append('<link rel="stylesheet" href="'+c+'" type="text/css" id="prBaseStylesheet">'),e(document.body).append('<link rel="stylesheet" href="'+u+'" type="text/css" id="prMerchantOverrideStylesheet">'),e(document.body).append('<link rel="stylesheet" href="/stylesheets/widgets/pr_category_styles_review_override.css" type="text/css" id="prCategoryBaseStylesheetOverride">');var r=e(".pr-inline-rating");a.get("entityList",{listName:"mozu-powerreviews-ratings"+t.getThemeSetting("powerReviewsFQNID"),filter:"productCode  eq "+r.map(function(){return e(this).data("mzProductCode")}).get().join(" or productCode  eq ")}).then(function(t){var i=t.data.items.reduce(function(e,t){return e[t.productCode]=t,e},{});r.each(function(){var t=e(this);w=document.location;var r=t.data("mzProductCode"),a=i[r];if(a){var n,s=a.fullReviews;a.fullReviews>1?n="("+a.fullReviews+" reviews)":1==a.fullReviews&&(n="("+a.fullReviews+" review)"),a.averageDecimalRating>0&&a.merchantGrpId==d?(e("#PRInlineRating-"+r).show(),e("#PRInlineRating-"+r).find(".pr-snippet-write-review").show(),e("#PRInlineRating-"+r).find(".pr-snippet-read-reviews").show(),e("#PRInlineRating-"+r).find(".pr-snippet-write-review").find("a.pr-snippet-link").attr("href","/write-a-review?pageId="+r+"&merchantGroupId="+d+"&merchantId="+l+"&siteId="+I+"&zipLocation="+o+"&returlUrl="+w),e("#PRInlineRating-"+r).find(".pr-snippet-read-reviews").find("a.pr-snippet-link").find("#pr-snippet-read-review-count").text(s),e("#PRInlineRating-"+r).find("#pr-snippet-rating-decimal").text(a.averageDecimalRating),e("#PRInlineRating-"+r).find("#pr-snippet-review-count").text(n),e("#PRInlineRating-"+r).find("#pr-snippet-star-image").addClass("pr-stars").addClass("pr-stars-small").addClass("pr-stars-"+a.averageOverallRating+"-sm")):(e("#PRInlineRating-"+r).show(),e("#PRInlineRating-"+r).find(".pr-snippet-write-first-review").show(),e("#PRInlineRating-"+r).find(".pr-snippet-write-first-review").find("a.pr-snippet-link").attr("href","/write-a-review?pageId="+r+"&merchantGroupId="+d+"&merchantId="+l+"&siteId="+I+"&zipLocation="+o+"&returlUrl="+w),e("#PRInlineRating-"+r).find("#pr-snippet-rating-decimal").text("0.0"),e("#PRInlineRating-"+r).find("#pr-snippet-review-count").text("(No reviews)"),e("#PRInlineRating-"+r).find("#pr-snippet-star-image").addClass("pr-stars").addClass("pr-stars-small").addClass("pr-stars-0_0-sm"))}else e("#PRInlineRating-"+r).show(),e("#PRInlineRating-"+r).find(".pr-snippet-write-first-review").show(),e("#PRInlineRating-"+r).find(".pr-snippet-write-first-review").find("a.pr-snippet-link").attr("href","/write-a-review?pageId="+r+"&merchantGroupId="+d+"&merchantId="+l+"&siteId="+I+"&zipLocation="+o+"&returlUrl="+w),e("#PRInlineRating-"+r).find("#pr-snippet-rating-decimal").text("0.0"),e("#PRInlineRating-"+r).find("#pr-snippet-review-count").text("(No reviews)"),e("#PRInlineRating-"+r).find("#pr-snippet-star-image").addClass("pr-stars").addClass("pr-stars-small").addClass("pr-stars-0_0-sm")})})}var d,l,o,c,u,w,m=a.get("entity",{listName:"mozu-powerreviews-sitesettings"+t.getThemeSetting("powerReviewsFQNID"),id:a.context.site}),I="",v="en_US";return e(document).ready(function(){m.then(function(t){var r=t.data,a=1==e("#prProductDetail").val(),m=1==e("#prROIWidget").val(),f=1==e("#productReviewSnippet").val(),g=1==e("#productSocialAnswerSnippet").val(),h=1==e("#productReviewDisplay").val(),R=1==e("#productSocialAnswerDisplay").val(),_=1==e("#reviewSocialAnswerTab").val();w=document.location,null!==r.locale&&(v=r.locale),d=r.merchantGrpId,l=r.merchantId,null!==r.merchantSiteId&&(I=r.merchantSiteId),o="/staticContent/pwr/"+d+"/";var y=s.locals.siteContext.cdnPrefix,P=y+o+"pwr/engine/js/full.js";c=y+o+"pwr/engine/pr_styles_review.css",u=y+o+"pwr/engine/merchant_styles2.css",e.ajax({url:P}).done(function(t){var r=i.Product.fromCurrent();if(a)e("head").append('<link rel="stylesheet" href="'+c+'" type="text/css" id="prBaseStylesheet">'),e("<script>").attr("type","text/javascript").text('var pr_locale="'+v+'";var pr_zip_location="'+o+'";var pr_style_sheet="/stylesheets/widgets/pr_product_styles_review_override.css";'+t).appendTo("head"),f&&(_?POWERREVIEWS.display.snippet({write:function(t){e("#reviewSnippetProduct").append(t)}},{pr_page_id:r.id,pr_read_review:"javascript:activateTab('reviews');",pr_write_review:"/write-a-review?pageId="+r.id+"&merchantGroupId="+d+"&merchantId="+l+"&siteId="+I+"&locale="+v+"&returlUrl="+w}):POWERREVIEWS.display.snippet({write:function(t){e("#reviewSnippetProduct").append(t)}},{pr_page_id:r.id,pr_read_review:"#ReviewHeader",pr_write_review:"/write-a-review?pageId="+r.id+"&merchantGroupId="+d+"&merchantId="+l+"&siteId="+I+"&locale="+v+"&returlUrl="+w})),g&&(_?POWERREVIEWS.display.productAnswersSnippet({write:function(t){e("#socialAnswerSnippet").append(t)}},{pr_page_id:r.id,pr_ask_question:"/write-a-review?pageId="+r.id+"&merchantGroupId="+d+"&merchantId="+l+"&siteId="+I+"&locale="+v+"&returlUrl="+w+"&appName=askQuestion",pr_answer_question:"/write-a-review?pageId="+r.id+"&merchantGroupId="+d+"&merchantId="+l+"&siteId="+I+"&locale="+v+"&returlUrl="+w+"&appName=answerQuestion&questionId=@@@QUESTION_ID@@@",pr_read_qa:"javascript:activateTab('socialAnswer');"}):POWERREVIEWS.display.productAnswersSnippet({write:function(t){e("#socialAnswerSnippet").append(t)}},{pr_page_id:r.id,pr_ask_question:"/write-a-review?pageId="+r.id+"&merchantGroupId="+d+"&merchantId="+l+"&siteId="+I+"&locale="+v+"&returlUrl="+w+"&appName=askQuestion",pr_answer_question:"/write-a-review?pageId="+r.id+"&merchantGroupId="+d+"&merchantId="+l+"&siteId="+I+"&locale="+v+"&returlUrl="+w+"&appName=answerQuestion&questionId=@@@QUESTION_ID@@@",pr_read_qa:"#QAHeader"})),(h||_)&&POWERREVIEWS.display.engine({write:function(t){e("#reviewDisplayProduct").append(t)}},{pr_page_id:r.id,pr_write_review:"/write-a-review?pageId="+r.id+"&merchantGroupId="+d+"&merchantId="+l+"&siteId="+I+"&locale="+v+"&returlUrl="+w}),(R||_)&&POWERREVIEWS.display.productAnswers({write:function(t){e("#socialAnswerDisplay").append(t)}},{pr_page_id:r.id,pr_ask_question:"/write-a-review?pageId="+r.id+"&merchantGroupId="+d+"&merchantId="+l+"&siteId="+I+"&locale="+v+"&returlUrl="+w+"&appName=askQuestion",pr_answer_question:"/write-a-review?pageId="+r.id+"&merchantGroupId="+d+"&merchantId="+l+"&siteId="+I+"&locale="+v+"&returlUrl="+w+"&appName=answerQuestion&questionId=@@@QUESTION_ID@@@",pr_read_qa:"#QAHeader"});else if(m){var s="//static.powerreviews.com/t/v1/tracker.js";e.getScript(s).done(function(){var e,t,r=POWERREVIEWS.tracker.createTracker({merchantGroupId:d}),i=n.Order.fromCurrent().attributes,a="";null!==i.customerAccountId&&(a=i.customerAccountId),null!==i.fulfillmentInfo&&null!==i.fulfillmentInfo.fulfillmentContact?(e=i.fulfillmentInfo.fulfillmentContact.firstName,t=i.fulfillmentInfo.fulfillmentContact.lastNameOrSurname):(e=i.billingInfo.billingContact.firstName,t=i.billingInfo.billingContact.lastNameOrSurname);for(var s=[],p={},o=0;o<i.items.models.length;o++){var c=i.items.models[o].attributes;p.pageId=c.product.attributes.productCode,p.unitPrice=c.total,p.qty=c.quantity,p.name=c.product.attributes.name,null!==c.product.attributes.imageUrl&&(p.imageURL=c.product.attributes.imageUrl),s[o]=p}r.trackPageview("c",{merchantId:l,locale:v,merchantUserId:a,marketingOptIn:i.acceptsMarketing,userEmail:i.email,userFirstName:e,userLastName:t,orderId:i.orderNumber,orderSubtotal:i.total,orderNumberOfItems:s.length,orderItems:s})}).fail(function(){})}else p()}).fail(function(){})})}),{writeProductListBoxes:function(){return m.then(p)}}});