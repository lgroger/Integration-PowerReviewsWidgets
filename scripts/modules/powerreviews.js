/* jshint scripturl: true */
/* global POWERREVIEWS */

define(['modules/jquery-mozu', 'hyprlive', "modules/backbone-mozu", "modules/models-product", "modules/api", 'modules/models-orders', 'hyprlivecontext'],
    function($, Hypr, Backbone, ProductModels, Api, OrderModels, HyprLiveContext) {

        var res = Api.get('entity', {
            listName: 'mozu-powerreviews-sitesettings' + Hypr.getThemeSetting('powerReviewsFQNID'),
            id: Api.context.site
        });

        var merchantGroupId;
        var merchantId;
        var siteId = '';
        var zip_location;
        var prStylesReview;
        var prMerchantStyles2;
        var locale = "en_US";
        var returnUrl;

        function writeProductListBoxes() {
            $(document.body).append('<link rel="stylesheet" href=\"' + prStylesReview + '\" type="text/css" id="prBaseStylesheet">');
            $(document.body).append('<link rel="stylesheet" href=\"' + prMerchantStyles2 + '\" type="text/css" id="prMerchantOverrideStylesheet">');
            //$(document.body).append('<link rel="stylesheet" href="/stylesheets/widgets/pr_category.css" type="text/css" id="prCategory">');
            //$(document.body).append('<link rel="stylesheet" href="/stylesheets/widgets/pr_category_styles_review_override.css" type="text/css" id="prCategoryBaseStylesheetOverride">');

            var allInlineRatings = $('.pr-inline-rating');
            /*
            Api.get('entityList', {
                listName: 'mozu-powerreviews-ratings' + Hypr.getThemeSetting('powerReviewsFQNID'),
                filter: 'productCode  eq ' + allInlineRatings.map(function() {
                    return $(this).data('mzProductCode');
                }).get().join(' or productCode  eq ')
            }).then(function(collection) {
            */
            Api.get('entityList', {
                listName: 'mozu-powerreviews-ratings' + Hypr.getThemeSetting('powerReviewsFQNID'),
                filter: 'productCode  eq ' + allInlineRatings.map(function() {
                    return $(this).data('mzProductCode');
                }).get().join(' or productCode  eq ')
            }).then(function(collection) {
                // turn from array of ids into map with key
                var productsMap = collection.data.items.reduce(function(memo, item) {
                    memo[item.productCode] = item;
                    return memo;
                }, {});
                allInlineRatings.each(function() {
                    var $this = $(this);
                    returnUrl = document.location;
                    var productCode = $this.data('mzProductCode');
                    var data = productsMap[productCode];
                    if (data) {
                        var fullReviewCount = data.fullReviews;
                        var fullReviewCountText;
                        if (data.fullReviews > 1) {
                            fullReviewCountText = "(" + data.fullReviews + " reviews)";
                            $(".tabs [for=tab2] span").html("Reviews(S) [" + data.fullReviews + "]");
                        } else if (data.fullReviews == 1) {
                            fullReviewCountText = "(" + data.fullReviews + " review)";
                            $(".tabs [for=tab2] span").html("Review(S) [" + data.fullReviews + "]");
                        }
                        $('#mz-drop-zone-review-zone .mz-cms-content').clone().appendTo('.power-review-content'); 
                        $('#mz-drop-zone-qa-widget-slot .mz-cms-content').clone().appendTo('.qa-content-dropzone');

                        if (data.averageDecimalRating > 0 && data.merchantGrpId == merchantGroupId) {
                            $("#pr-write-review").attr("href", '/write-a-review?pageId=' + productCode + '&merchantGroupId=' + merchantGroupId + '&merchantId=' + merchantId + '&siteId=' + siteId + '&zipLocation=' + zip_location + '&returlUrl=' + returnUrl);
                            $("#pr-snippet-star-image-" + productCode).addClass("pr-stars-" + data.averageOverallRating + "-sm");
                            $("#pr-snippet-read-review-count").text(fullReviewCount);
                            /*
                            $("#PRInlineRating-" + productCode).show();
                            $("#PRInlineRating-" + productCode).find(".pr-snippet-write-review").show();
                            $("#PRInlineRating-" + productCode).find(".pr-snippet-read-reviews").show();
                            $("#PRInlineRating-" + productCode).find(".pr-snippet-write-review").find("a.pr-snippet-link").attr("href", '/write-a-review?pageId=' + productCode + '&merchantGroupId=' + merchantGroupId + '&merchantId=' + merchantId + '&siteId=' + siteId + '&zipLocation=' + zip_location + '&returlUrl=' + returnUrl);
                            $("#PRInlineRating-" + productCode).find(".pr-snippet-read-reviews").find("a.pr-snippet-link").find("#pr-snippet-read-review-count").text(fullReviewCount);
                            $("#PRInlineRating-" + productCode).find("#pr-snippet-rating-decimal").text(data.averageDecimalRating);
                            $("#PRInlineRating-" + productCode).find("#pr-snippet-review-count").text(fullReviewCountText);
                            $("#PRInlineRating-" + productCode).find("#pr-snippet-star-image").addClass("pr-stars").addClass("pr-stars-small").addClass("pr-stars-" + data.averageOverallRating + "-sm");
                            */
                        } else {
                            var prWrite = $("#pr-write-review").clone();
                            prWrite.attr("href", '/write-a-review?pageId=' + productCode + '&merchantGroupId=' + merchantGroupId + '&merchantId=' + merchantId + '&siteId=' + siteId + '&zipLocation=' + zip_location + '&returlUrl=' + returnUrl).html("Be the first to Review");
                            $("[data-pr-event=snippet-read-reviews]").hide();
                            $(".product-review").empty().append(prWrite);
                            $("#pr-snippet-star-image-" + productCode).addClass("pr-stars-0_0-sm");
                            /*
                            $("#PRInlineRating-" + productCode).show();
                            $("#PRInlineRating-" + productCode).find(".pr-snippet-write-first-review").show();
                            $("#PRInlineRating-" + productCode).find(".pr-snippet-write-first-review").find("a.pr-snippet-link").attr("href", '/write-a-review?pageId=' + productCode + '&merchantGroupId=' + merchantGroupId + '&merchantId=' + merchantId + '&siteId=' + siteId + '&zipLocation=' + zip_location + '&returlUrl=' + returnUrl);
                            $("#PRInlineRating-" + productCode).find("#pr-snippet-rating-decimal").text("0.0");
                            $("#PRInlineRating-" + productCode).find("#pr-snippet-review-count").text("(No reviews)");
                            $("#PRInlineRating-" + productCode).find("#pr-snippet-star-image").addClass("pr-stars").addClass("pr-stars-small").addClass("pr-stars-0_0-sm");
                            */
                        }
                    } else {
                        $("#pr-write-review").attr("href", '/write-a-review?pageId=' + productCode + '&merchantGroupId=' + merchantGroupId + '&merchantId=' + merchantId + '&siteId=' + siteId + '&zipLocation=' + zip_location + '&returlUrl=' + returnUrl);
                        $("#pr-snippet-star-image-" + productCode).addClass("pr-stars-0_0-sm");
                        /*
                        $("#PRInlineRating-" + productCode).show();
                        $("#PRInlineRating-" + productCode).find(".pr-snippet-write-first-review").show();
                        $("#PRInlineRating-" + productCode).find(".pr-snippet-write-first-review").find("a.pr-snippet-link").attr("href", '/write-a-review?pageId=' + productCode + '&merchantGroupId=' + merchantGroupId + '&merchantId=' + merchantId + '&siteId=' + siteId + '&zipLocation=' + zip_location + '&returlUrl=' + returnUrl);
                        $("#PRInlineRating-" + productCode).find("#pr-snippet-rating-decimal").text("0.0");
                        $("#PRInlineRating-" + productCode).find("#pr-snippet-review-count").text("(No reviews)");
                        $("#PRInlineRating-" + productCode).find("#pr-snippet-star-image").addClass("pr-stars").addClass("pr-stars-small").addClass("pr-stars-0_0-sm");
                        */
                    }
                });

            });

        }

        $(document).ready(function() {

            res.then(function(r) {
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

                //writeProductListBoxes();


            });
      
        });

        return {
            writeProductListBoxes: function() {
                return res.then(writeProductListBoxes);
            }
        };

    });