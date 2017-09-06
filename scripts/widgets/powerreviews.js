/* jshint scripturl: true */
/* global POWERREVIEWS */

define(['modules/jquery-mozu','underscore', 'hyprlive', "modules/backbone-mozu", "modules/models-product", "modules/api", 'modules/models-orders', 'hyprlivecontext'],
    function($, _, Hypr, Backbone, ProductModels, Api, OrderModels, HyprLiveContext) {
      var prScript = "//ui.powerreviews.com/stable/4.0/ui.js";
      var prTrackerScript = "//static.powerreviews.com/t/v1/tracker.js";
      var returnUrl = window.location.href;

      var mzPowerReview = {
         getConfig: function() {
           return Api.get('entity', {
               listName: Hypr.getThemeSetting('powerReviewsSettingsList'),
               id: Api.context.site
           }).then(function(result){
             return result.data;
           });
         },
         displayReviewsAnQA: function(config) {
           var self = this;
           $.ajax( { url: prScript } ).done(function(script, textStatus) {
               var currentProduct = require.mozuData("product");
               console.log(currentProduct);
               var product = {
                 name: currentProduct.content.productName,
                 url: window.location.protocol+"//"+window.location.host+currentProduct.url,
                 description: currentProduct.content.productShortDescription
               };

               if (currentProduct.price) {
                 product.price = currentProduct.price.price;
               } else if (currentProduct.priceRange) {
                  product.price = currentProduct.priceRange.lower.price;
               }
               if (currentProduct.upcs)
                 product.upc = currentProduct.upcs[0];

               if (currentProduct.mfgPartNumbers)
                  product.manufacturer_id = currentProduct.mfgPartNumbers[0];

               if (currentProduct.mainImage)
                   product.image_url = window.location.protocol+currentProduct.mainImage.imageUrl;

               var in_stock = 'True';
               if (currentProduct.inventoryInfo.manageStock && currentProduct.inventoryInfo.onlineStockAvailable === 0 && currentProduct.inventoryInfo.outOfStockBehavior === "")
                 in_stock = 'False';

               product.in_stock  = in_stock;
               if (currentProduct.categories)
               {
                 var primary = _.find(currentProduct.categories, function(category) {
                   return category.sequence === 1;
                 });
                 if (!primary) primary = currentProduct.categories[0];
                  product.category_name = primary.content.name; //"build category hierarchy";
               }

               if (currentProduct.properties) {
                 var brandProperty = _.find(currentProduct.properties, function(property){
                   return property.attributeFQN === "tenant~brand";
                 });
                 if (brandProperty)
                  product.brand_name  = brandProperty.values[0].stringValue; //Get from property
               }


               //TODO: add variants
               var components = {};
               if ($("#pr-reviewsnippet").length > 0) components.ReviewSnippet = "pr-reviewsnippet";
               if ($("#pr-reviewdisplay").length > 0) components.ReviewDisplay = "pr-reviewdisplay";
               if ($("#pr-qasnippet").length > 0) components.QuestionSnippet = "pr-qasnippet";
               if ($("#pr-qadisplay").length > 0) components.QuestionDisplay = "pr-qadisplay";
               if ($("#pr-wyb").length > 0) components.WhydYouBuyDisplay = "pr-wyb";

                var prConfig = self.getPrConfig(config, currentProduct.productCode);
                if ($("#reviewDisplayType").val() === "paging")
                  prConfig.REVIEW_DISPLAY_PAGINATION_TYPE="VERTICAL";
                else if ($("#reviewDisplayType").val() === "paging")
                  prConfig.REVIEW_DISPLAY_LIST_TYPE ='CONDENSED';
                else
                  prConfig.REVIEW_DISPLAY_SNAPSHOT_TYPE ='SIMPLE';

                prConfig.style_sheet = "/stylesheets/widgets/powerreview.css";
                prConfig.review_wrapper_url = '/write-a-review?pr_page_id='+currentProduct.productCode+'&locale='+config.locale+'&pr_returnUrl=' + returnUrl;
                prConfig.product = product;
                prConfig.components = components;

                POWERREVIEWS.display.render(prConfig);


             }).fail(function(jqxhr, settings, exception) {
                 console.log(jqxhr);
             });
         },
         displayRoi: function(config) {

           var order = require.mozuData('order');
           $.getScript(prTrackerScript).done(function(script, textStatus) {

               try {
                   var tracker = POWERREVIEWS.tracker.createTracker({
                       merchantGroupId: config.merchantGrpId
                   });
                   var customerId = "";
                   var firstName;
                   var lastName;
                   if (order.customerAccountId !== null)
                       customerId = order.customerAccountId;
                   if (order.fulfillmentInfo !== null && order.fulfillmentInfo.fulfillmentContact !== null) {
                       firstName = order.fulfillmentInfo.fulfillmentContact.firstName;
                       lastName = order.fulfillmentInfo.fulfillmentContact.lastNameOrSurname;
                   } else {
                       firstName = order.billingInfo.billingContact.firstName;
                       lastName = order.billingInfo.billingContact.lastNameOrSurname;
                   }

                   var items = [];
                   var item = {};

                   order.items.forEach(function(lineItem){
                     console.log(lineItem);
                     //var lineItem = order.items.models[i].attributes;
                     item.pageId = lineItem.product.productCode;
                     item.unitPrice = lineItem.total;
                     item.qty = lineItem.quantity;
                     item.name = lineItem.product.name;
                     if (lineItem.product.imageUrl !== null)
                         item.imageURL = lineItem.product.imageUrl;
                     items.push(item);
                   });

                   tracker.trackPageview("c", {
                       merchantId: config.merchantId,
                       locale: config.locale,
                       merchantUserId: customerId,
                       marketingOptIn: order.acceptsMarketing,
                       userEmail: order.email,
                       userFirstName: firstName,
                       userLastName: lastName,
                       orderId: order.orderNumber,
                       orderSubtotal: order.total,
                       orderNumberOfItems: items.length,
                       orderItems: items
                       //orderDate: TODO
                   });

                 } catch(e){
                   console.log(e);
                 }
           }).fail(function(jqxhr, settings, exception) {
                   console.log(jqxhr);
           });

           if ($(".pr-wyb")) {
             $.getScript(prScript).done(function(script, textStatus) {
               var item = _.max(order.items, function(item) {
                 return item.total;
               });
               //Get expensive items

               POWERREVIEWS.display.render({
                 api_key: config.apiKey,
                 locale: config.locale,
                 merchant_group_id: config.merchantGrpId,
                 merchant_id: config.merchantId,
                 page_id: item.product.productCode,
                 components: {
                   WhydYouBuy: 'pr-wyb'
                 }});
             }).fail(function(jqxhr, settings, exception) {
                     console.log(jqxhr);
             });
           }

           if ($("#includeSellerRatings").val() === "1") {
             var script = "(function(p, o, w, e, r) {"+
                  "p.POWERREVIEWS = p.POWERREVIEWS || {config: {}};"+
                  "p.POWERREVIEWS.config.merchant_id = "+config.merchantId+";"+
                  "p.POWERREVIEWS.config.page_id = '"+$("#sellerRatingPageId").val()+";"+
                  "p.POWERREVIEWS.config.locale = "+config.locale+";"+
                  "p.POWERREVIEWS.config.srwVariant = 'mini';"+
                  "r = o.getElementsByTagName('body')[0]; e = o.createElement('div');"+
                  "e.id = 'pr-srw-container'; e.className = 'p-w-r'; r.appendChild(e, r);"+
                  "if (!document.getElementById('pwr-ui')) {"+
                  "  e = o.createElement(w);"+
                  "  e.src = '//ui.powerreviews.com/stable/3.0/ui.js';"+
                  "  e.id = 'pwr-ui';"+
                  "  e.onload = function() {POWERREVIEWS.display.renderSRW;};"+
                  "  r.appendChild(e, r);"+
                  "}"+
                "}(window, document, 'script'))";

              $('<script>')
                            .attr('type', 'text/javascript')
                            .text(script)
                            .appendTo('head');
           }
         },
         displayInlineRatings: function(config) {
           var allInlineRatings = $('.pr-inline-rating');
           console.log(allInlineRatings);
           var productReviews = allInlineRatings.map(function() {
              var productCode = $(this).data('mzProductCode');

              return {
                locale: config.locale,
                merchant_group_id: config.merchantGrpId,
                page_id: productCode,
                merchant_id: config.merchantId,
                enable_client_side_structured_data: true,
                api_key: config.apiKey,
                review_wrapper_url: '/write-a-review?pr_page_id='+productCode+'&locale='+config.locale+'&returnUrl=' + returnUrl,
                components: {
                  CategorySnippet: 'pr-snippet-'+productCode
                }
              };
            }).get();
            console.log(productReviews);
            $.ajax( { url: prScript } ).done(function(script, textStatus) {
                POWERREVIEWS.display.render(productReviews);
            });
        },
        getPrConfig : function(config, pageId) {
          var prConfig = {
              api_key: config.apiKey,
              locale: config.locale,
              merchant_group_id: config.merchantGrpId,
              merchant_id: config.merchantId
           };

           if (pageId)
            prConfig.page_id =  pageId;

          return prConfig;
        }
      };



      $(document).ready(function() {
        var isProductDetail = $("#prProductDetail").val() == 1;
        var isROIWidget = $("#prROIWidget").val() == 1;

        mzPowerReview.getConfig().then(function(config){
          if (isProductDetail) {
            mzPowerReview.displayReviewsAnQA(config);
          } else if (isROIWidget) {
            mzPowerReview.displayRoi(config);
          } else {
            mzPowerReview.displayInlineRatings(config);
          }

        });
      });
});
