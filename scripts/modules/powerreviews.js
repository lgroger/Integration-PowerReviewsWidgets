define(['modules/jquery-mozu', 'hyprlive',   "modules/api", 'hyprlivecontext'],
    function($, Hypr, Api, HyprLiveContext) {
		var merchantGroupId;
        var merchantId;
        var siteId = '';
        var zip_location;
        var prStylesReview;
        var prMerchantStyles2;
        var locale = "en_US";
        var returnUrl;
	// Note: this is only meant to be called once, if it needs to be called multiple times, it needs to be refactored so that multiple api calls aren't being made to get entitylist if we already have it.
        var writeProductListBoxes = function(productCode) {
			var res = Api.get('entity', {
				listName: 'mozu-powerreviews-sitesettings' + Hypr.getThemeSetting('powerReviewsFQNID'),
				id: Api.context.site
			}).then(function(r) {
                var data = r.data;
                var isWidget = $("#prProductDetail").val() == 1;
                var isROIWidget = $("#prROIWidget").val() == 1;
                var isReviewSnippet = $("#productReviewSnippet").val() == 1;
                var isSocialAnswerSnippet = $("#productSocialAnswerSnippet").val() == 1;
                var isReviewDisplay = $("#productReviewDisplay").val() == 1;
                var isSocialAnswerDisplay = $("#productSocialAnswerDisplay").val() == 1;
                var isTabEnabled = $("#reviewSocialAnswerTab").val() == 1;
                returnUrl = document.location;

                if (data.locale !== null)
                    locale = data.locale;

                merchantGroupId = data.merchantGrpId;
                merchantId = data.merchantId;

                if (data.merchantSiteId !== null) {
                    siteId = data.merchantSiteId;
                }

                zip_location = "/staticContent/pwr/" + merchantGroupId + "/";

                var host = HyprLiveContext.locals.siteContext.cdnPrefix,
                prScript = host + zip_location + "pwr/engine/js/full.js";
                prStylesReview = host + zip_location + "pwr/engine/pr_styles_review.css";
                prMerchantStyles2 = host + zip_location + "pwr/engine/merchant_styles2.css";
			
				$(document.body).append('<link rel="stylesheet" href=\"' + prStylesReview + '\" type="text/css" id="prBaseStylesheet">');
				$(document.body).append('<link rel="stylesheet" href=\"' + prMerchantStyles2 + '\" type="text/css" id="prMerchantOverrideStylesheet">');

				var allInlineRatings = $('.pr-inline-rating');

				Api.get('entityList', {
					listName: 'mozu-powerreviews-ratings' + Hypr.getThemeSetting('powerReviewsFQNID'),
					filter: 'productCode  eq ' + productCode
				}).then(function(collection) {
					// turn from array of ids into map with key
					var productsMap = collection.data.items.reduce(function(memo, item) {
						memo[item.productCode] = item;
						return memo;
					}, {});
					var prWrite;
					allInlineRatings.each(function() {
						returnUrl = document.location;
						var data = productsMap[productCode];
						if (data) {
							var fullReviewCount = data.fullReviews;
							if (data.fullReviews > 0) {
								$(".tabs [for=tab2] span").html("Review(s) [" + data.fullReviews + "]");
							}
							//not sure what this does but I'll leave it ...
							$('#mz-drop-zone-review-zone .mz-cms-content').clone().appendTo('.power-review-content'); 
							$('#mz-drop-zone-qa-widget-slot .mz-cms-content').clone().appendTo('.qa-content-dropzone');

							if (data.averageDecimalRating > 0 && data.merchantGrpId == merchantGroupId) {
								$("#pr-write-review").attr("href", '/write-a-review?pageId=' + productCode + '&merchantGroupId=' + merchantGroupId + '&merchantId=' + merchantId + '&siteId=' + siteId + '&zipLocation=' + zip_location + '&returlUrl=' + returnUrl);
								//$("#pr-snippet-star-image-" + productCode).addClass("pr-stars-" + data.averageOverallRating + "-sm");
								$("#pr-snippet-read-review-count").text(fullReviewCount);
							} else {
								prWrite = $("#pr-write-review").clone();
								prWrite.attr("href", '/write-a-review?pageId=' + productCode + '&merchantGroupId=' + merchantGroupId + '&merchantId=' + merchantId + '&siteId=' + siteId + '&zipLocation=' + zip_location + '&returlUrl=' + returnUrl).html("Be the first to Review");
								$("[data-pr-event=snippet-read-reviews]").hide();
								$(".product-review").empty().append(prWrite);// empty b/c it has | in it 
								//$("#pr-snippet-star-image-" + productCode).addClass("pr-stars-0_0-sm");
							}
						} else {
								prWrite = $("#pr-write-review").clone();
								prWrite.attr("href", '/write-a-review?pageId=' + productCode + '&merchantGroupId=' + merchantGroupId + '&merchantId=' + merchantId + '&siteId=' + siteId + '&zipLocation=' + zip_location + '&returlUrl=' + returnUrl).html("Be the first to Review");
								$("[data-pr-event=snippet-read-reviews]").hide();
								$(".product-review").empty().append(prWrite);// empty b/c it has | in it 
							//$("#pr-snippet-star-image-" + productCode).addClass("pr-stars-0_0-sm");
						}
					});

				});
			});
        };

        return {
            writeProductListBoxes: writeProductListBoxes
            };
    });