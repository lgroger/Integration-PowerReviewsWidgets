define(['shim!vendor/typeahead.js/dist/typeahead.bundle[modules/jquery-mozu=jQuery]>jQuery', 'hyprlive', 'modules/api'], function($, Hypr, api) {

var NO_RANGE_PRICE = -0.01;
var priceObject;
var getMinMax = function(optionValues,lowPrice, highPrice){
// find the lowest and highest delta prices for the extra.
    var defaultPriceAdded=0.00;
    for (var j = 0; j < optionValues.length; j++) {
        if (optionValues[j].isDefault) {
            // if there is a default, the  price is set already added to the total product price.  We'll need to subtract it our later.
            defaultPriceAdded = optionValues[j].deltaPrice;
        }
        if ((lowPrice===0.00 && j===0) || (optionValues[j].deltaPrice < lowPrice )) {
            lowPrice = optionValues[j].deltaPrice;
        }
        if (optionValues[j].deltaPrice > highPrice) {
            highPrice = optionValues[j].deltaPrice;
        }
    }
    return {lowPrice:lowPrice,highPrice:highPrice,defaultPriceAdded:defaultPriceAdded};
};
var setProductPriceRange = function(product){
    console.log(product);
    /*if (!product || (product.productUsage != 'Standard'  && !product.options)) {
        console.info('Exiting getProductForIndexing because it does not have options or is not a standard product.');
        return callback();
    }*/
    console.info("Product Usage: " + product.productUsage);
    console.info('Product Code: ' + product.productCode);

    if (product.productUsage == 'Standard' && product.options && product.options.length > 0) {
        console.info('Found some options to process for product: ' + product.productCode);
        var i = 0;
        var totalLowPrice = NO_RANGE_PRICE;
        var totalHighPrice = NO_RANGE_PRICE;
        var defaultPriceAdded = 0.00;
        var extras = product.options;
        var lowPrice = 0.00;
        var highPrice = 0.00;
        console.info('Extra length: ' + extras.length);
        for (i = 0; i < extras.length; i++) {
            console.info('Extra.isRequired? ' + extras[i].isRequired);
            // find the required extras and add them to a list.
            if (extras[i].attributeFQN.toLowerCase() !== 'tenant~dnd-token' && extras[i].attributeDetail.usageType === "Extra" && extras[i].attributeDetail.dataType === "ProductCode") {
                if (extras[i].values && extras[i].values.length > 0) {
                    // only add if the product is required.
                    var optionValues = extras[i].values;

                    if(product.productType ==='Banner' || 
                           product.productType ==='BannerRectangle' ||
                           product.productType ==='BannerVertical' ||
                           product.productType ==='BackgroundVBG'){ 
                            priceObject = getMinMax(optionValues,lowPrice,highPrice);
                            lowPrice = priceObject.lowPrice;
                            highPrice = priceObject.highPrice;
                            totalLowPrice =lowPrice;
                            totalHighPrice = highPrice;
                            defaultPriceAdded=priceObject.defaultPriceAdded;
                    }
                    else if(product.productType ==='GiantCard'){
                        priceObject = getMinMax(optionValues,lowPrice,highPrice);
                        lowPrice = priceObject.lowPrice;
                        highPrice = priceObject.highPrice;
                        if(i===1){
                            totalLowPrice = lowPrice;
                        }
                        totalHighPrice = totalHighPrice > NO_RANGE_PRICE ? totalHighPrice + highPrice : highPrice;
                        defaultPriceAdded=priceObject.defaultPriceAdded;
                        break;  
                    }
                    else{
                    //if (extras[i].isRequired && extras[i].values && extras[i].values.length > 0) {
                        console.info('Found an extras that is required!' );
                        lowPrice = 0.00;
                        highPrice = 0.00;
                        priceObject = getMinMax(optionValues,lowPrice,highPrice);
                        lowPrice = priceObject.lowPrice;
                        highPrice = priceObject.highPrice;
                        defaultPriceAdded=priceObject.defaultPriceAdded;
                        totalHighPrice = totalHighPrice > NO_RANGE_PRICE ? totalHighPrice + highPrice : highPrice;
                        totalLowPrice = totalLowPrice > NO_RANGE_PRICE ? totalLowPrice + lowPrice : lowPrice;
                        
                    //} 
                    }
                }
            }
        }
        console.info("High Price: " + totalHighPrice + ";Low Price: " + totalLowPrice);

        var basePrice = 0.00;

            if (product.price) {
                if (product.price.salePrice) {
                    basePrice = product.price.salePrice;
                } else {
                    basePrice = product.price.price;
                }
                basePrice = basePrice - defaultPriceAdded;
            }

        // check to see if we found a range while going through the extras price.
        if (totalLowPrice != NO_RANGE_PRICE  && totalHighPrice != NO_RANGE_PRICE && totalHighPrice != totalLowPrice) {
            console.info("add the range to product index!");
            

            totalLowPrice = basePrice + totalLowPrice;
            totalHighPrice = basePrice + totalHighPrice;
            console.info("High Price w basePrice: " + totalHighPrice + ";Low Price w basePrice: " + totalLowPrice);

            product.price = null;
            product.priceRange = {
              "lower": {
               "price": totalLowPrice,
               "salePrice": totalLowPrice,
               "priceType": "List",
               "catalogListPrice": lowPrice
              },
              "upper": {
               "price": totalHighPrice,
               "salePrice": totalHighPrice,
               "priceType": "List",
               "catalogListPrice": totalHighPrice
              }
           };
           product.hasPriceRange = true;
        }else{
            if(totalLowPrice!==NO_RANGE_PRICE && totalHighPrice!==NO_RANGE_PRICE && totalLowPrice===totalHighPrice){
                totalLowPrice = basePrice + totalLowPrice;
                console.info("price equal");
                product.price.price=totalLowPrice;
                product.price.catalogListPrice=totalLowPrice;
            }
        }
    }
    if(product.productUsage==='Configurable'){
        if(product.priceRange){
            product.hasPriceRange = true;
        }
    }
    return product;
 };



    // bundled typeahead saves a lot of space but exports bloodhound to the root object, let's lose it
    var Bloodhound = window.Bloodhound.noConflict();

    // bloodhound wants to make its own AJAX requests, and since it's got such good caching and tokenizing algorithms, i'm happy to help it
    // so instead of using the SDK to place the request, we just use it to get the URL configs and the required API headers
    var qs = '%QUERY',
        eqs = encodeURIComponent(qs),
        suggestPriorSearchTerms = Hypr.getThemeSetting('suggestPriorSearchTerms'),
        getApiUrl = function(groups) {
            return api.getActionConfig('suggest', 'get', { query: qs, groups: groups }).url;
        },
        termsUrl = getApiUrl('terms'),
        productsUrl = getApiUrl('pages'),
        ajaxConfig = {
            headers: api.getRequestHeaders()
        },
        i,
        nonWordRe = /\W+/,
        makeSuggestionGroupFilter = function(name) {
            return function(res) {
                var suggestionGroups = res.suggestionGroups,
                    thisGroup;
                for (i = suggestionGroups.length - 1; i >= 0; i--) {
                    if (suggestionGroups[i].name === name) {
                        thisGroup = suggestionGroups[i];
                        break;
                    }
                }
                return thisGroup.suggestions;
            };
        },

        makeTemplateFn = function(name) {
            var tpt = Hypr.getTemplate(name);
            return function(obj) {
                var product = obj.suggestion;
                obj.suggestion = setProductPriceRange(product);
                console.log(obj.suggestion);
               console.log("modify object before rendering.");
                return tpt.render(obj);
            };
        },

    // create bloodhound instances for each type of suggestion

    AutocompleteManager = {
        datasets: {
            pages: new Bloodhound({
                datumTokenizer: function(datum) { 
                    return datum.suggestion.term.split(nonWordRe);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    url: productsUrl,
                    wildcard: eqs,
                    filter: makeSuggestionGroupFilter("Pages"),
                    rateLimitWait: 400,
                    ajax: ajaxConfig
                }
            })
        }
    };

    $.each(AutocompleteManager.datasets, function(name, set) {
        set.initialize();
    });

    var dataSetConfigs = [
        {
            name: 'pages',
            displayKey: function(datum) {
                return datum.suggestion.content.productName;
            },
            templates: {
                suggestion: makeTemplateFn('modules/search/autocomplete-page-result')
            },
            source: AutocompleteManager.datasets.pages.ttAdapter()
        }
    ];

    if (suggestPriorSearchTerms) {
        AutocompleteManager.datasets.terms = new Bloodhound({
            datumTokenizer: function(datum) {
                return datum.suggestion.term.split(nonWordRe);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: termsUrl,
                wildcard: eqs,
                filter: makeSuggestionGroupFilter("Terms"),
                rateLimitWait: 100,
                ajax: ajaxConfig
            }
        });
        AutocompleteManager.datasets.terms.initialize();
        dataSetConfigs.push({
            name: 'terms',
            displayKey: function(datum) {
                return datum.suggestion.term;
            },
            source: AutocompleteManager.datasets.terms.ttAdapter()
        });
    }

    $(document).ready(function() {
        var $field = AutocompleteManager.$typeaheadField = $('[data-mz-role="searchquery"]');
        AutocompleteManager.typeaheadInstance = $field.typeahead({
            minLength: 3
        }, dataSetConfigs).data('ttTypeahead');
        // user hits enter key while menu item is selected;
        $field.on('typeahead:selected', function (e, data, set) {
            if (data.suggestion.productCode) window.location = "/p/" + data.suggestion.productCode;
        });
        // $('#popup1').css('height',$(document).height());
    });

    return AutocompleteManager;  
});
