define(['modules/jquery-mozu',"modules/api",'modules/backbone-mozu', 'underscore', 'hyprlivecontext', 'hyprlive'],
function($, Api, Backbone, _, HyprLiveContext, Hypr) {
    window.console.log("Guidede search");
    // Guided Search model 
    var GuidedSearchModel = Backbone.MozuModel.extend({

    });

    // Gided Search View -  updated regx
    var GuidedSearchView = Backbone.MozuView.extend({
        templateName: 'modules/search/guided-search',
        currentSelection : {},
        urlCategoryPattern: /categoryId=[0-9]+/i,
        additionalEvents: {
            'change [data-mz-change="updateAttributeValue"]': "updateAttributeValue",
            'click [data-mz-change="updateCheckboxAttributeValue"]': "updateCheckboxAttributeValue",
            'click [data-mz-action="showHideGSContainer"]': "showHideGSContainer",
            'click [data-mz-action="hideHideGSContainer"]': "hideHideGSContainer",
            'click .close-guided-search.guided-search-cancel-button': "hideHideGSContainer"
        },
        render: function(){
            Backbone.MozuView.prototype.render.apply(this);
            window.console.log("rendered");
            // check if there is facets is available
            if(this.model.get('facets') && this.model.get('facets').length > 0 && this.model.get('facets')[0].values && this.model.get('facets')[0].values.length>0){
                // activate owl carausal for category listing in search resutl page
                $('.owl-carousel-category-list').owlCarousel({
                    dots:false,
                    nav:true,
                    loop:true,
                    margin:10,
                    responsive:{
                        0:{items:1},
                        600:{items:2},
                        1000:{items:5}
                    }
                });
            }

        },
        initialize: function(){
            window.console.log("initializing view.");
            // initializing the preselection to empty
            for (var j1 = 0; j1 < this.model.get('filters').length; j1++) {
                for (var k1 = 0; k1 < this.model.get('filters')[j1].vocabularyValues.length; k1++) {
                    this.model.get('filters')[j1].vocabularyValues[k1].selected = false;
                }
            }
            if(window.location.search.indexOf('isguidedsearch=1') > -1){
                var meThis = this;
                if(meThis.model.get('facets') && meThis.model.get('facets').length>0){
                    for (var facetIndex = 0; facetIndex < meThis.model.get('facets').length; facetIndex++) {
                        if(meThis.model.get('facets')[facetIndex].field === "categoryId"){
                            if(meThis.model.get('facets')[facetIndex].values){
                                if(meThis.model.get('facets')[facetIndex].values[0].childrenFacetValues){
                                    for(var f=0; f<meThis.model.get('facets')[facetIndex].values[0].childrenFacetValues.length; f++){
                                        var url = window.location.search.replace(meThis.urlCategoryPattern,"categoryId="+meThis.model.get('facets')[facetIndex].values[0].childrenFacetValues[f].value);
                                        meThis.model.get('facets')[facetIndex].values[0].childrenFacetValues[f].guidedSearch = url;
                                    }
                                }
                            }
                        }
                    }
                }

                var serachParameters = window.location.search.split('?')[1].split('&');
                // Update the current selection informations based on the url
                var guidedSearchSelection = "";
                for (var i2 = 0; i2 < serachParameters.length; i2++) {
                    if(serachParameters[i2].split('=')[0].toLowerCase() == "facetvaluefilter"){
                        guidedSearchSelection = serachParameters[i2].split('=')[1];
                    }
                }
                guidedSearchSelection = decodeURIComponent(guidedSearchSelection);

                for (var k2 = 0; k2 < guidedSearchSelection.split(',').length; k2++) {
                    for (var j2 = 0; j2 < this.model.get('guides').length; j2++) {
                        if(guidedSearchSelection.split(',')[k2].split(':')[0] == this.model.get('guides')[j2]){
                            if(window.themeSettings.guidedSearchProperty3 == guidedSearchSelection.split(',')[k2].split(':')[0]){
                                if(this.currentSelection[guidedSearchSelection.split(',')[k2].split(':')[0]] && this.currentSelection[guidedSearchSelection.split(',')[k2].split(':')[0]].length && this.currentSelection[guidedSearchSelection.split(',')[k2].split(':')[0]].length>0){
                                    this.currentSelection[guidedSearchSelection.split(',')[k2].split(':')[0]].push(guidedSearchSelection.split(',')[k2].split(':')[1]);
                                }else{
                                    this.currentSelection[guidedSearchSelection.split(',')[k2].split(':')[0]] = [];
                                    this.currentSelection[guidedSearchSelection.split(',')[k2].split(':')[0]].push(guidedSearchSelection.split(',')[k2].split(':')[1]);
                                }

                            }else{
                                this.currentSelection[guidedSearchSelection.split(',')[k2].split(':')[0]] = guidedSearchSelection.split(',')[k2].split(':')[1];
                            }
                        }
                    }
                }
                window.console.log(this.currentSelection);
                // set selected value on the filters Object based on current url informations
                for (var j = 0; j < this.model.get('filters').length; j++) {
                    // Getting each value for each filters
                    for (var k = 0; k < this.model.get('filters')[j].vocabularyValues.length; k++) {
                        // Check if current filter value selection is string or array
                        if(typeof this.currentSelection[this.model.get('filters')[j].attributeFQN] == 'string'){
                            // if string check if the current filter value is in selection
                            if(this.model.get('filters')[j].vocabularyValues[k].value.toLowerCase() == decodeURIComponent(this.currentSelection[this.model.get('filters')[j].attributeFQN]).toLowerCase()){
                                // if selected set selected = true
                                this.model.get('filters')[j].vocabularyValues[k].selected = true;
                            }
                        }else{
                            if(this.currentSelection[this.model.get('filters')[j].attributeFQN]){
                                for(var l=0; l<this.currentSelection[this.model.get('filters')[j].attributeFQN].length; l++){
                                    if(this.model.get('filters')[j].vocabularyValues[k].value.toLowerCase() == decodeURIComponent(this.currentSelection[this.model.get('filters')[j].attributeFQN][l]).toLowerCase()){
                                        this.model.get('filters')[j].vocabularyValues[k].selected = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }


            window.console.log(this.model);
        },
        showHideGSContainer: function(){
            $('.guided_positioned_box').slideDown();
            $('.guided_selected_options').hide();
            if ($(window).width() < 768) {
                $('body').addClass('lock-verflow');
            }
        },
        hideHideGSContainer: function(){
            $('.guided_positioned_box').hide();
            $('.guided_selected_options').show();
            if ($(window).width() < 768) {
                $('body').removeClass('lock-verflow');
            }
            this.clearFields();
        },
        closeGuidedSearch: function(e){
            $('[data-container="guided-search"]').hide();
            $("body").removeClass("lock-verflow");
            this.clearFields();
        },
        search: function(e){
            $('[data-validation-message="guided-search"]').html("Validation message");
            // this.currentSelection[e.currentTarget.id] = e.currentTarget.options[e.currentTarget.selectedIndex].value;
            var selectedValues = [];
            $('[data-mz-change="updateCheckboxAttributeValue"]:checked').each(function(){
                selectedValues.push(encodeURIComponent($(this).val()));
            });
            var isValidSelection = true;
            for (var j2 = 0; j2 < this.model.get('guides').length; j2++) {
                this.currentSelection[this.model.get('guides')[j2]] = "";
                if(this.model.get('guides')[j2] == window.themeSettings.guidedSearchProperty3){
                    this.currentSelection[this.model.get('guides')[j2]] = selectedValues;
                }else{
                    var el = $('[name="'+this.model.get('guides')[j2]+'"]')[0];
                    if(el.options[el.selectedIndex].value.length === 0){
                        isValidSelection=  false;
                    }
                    this.currentSelection[this.model.get('guides')[j2]] = encodeURIComponent(el.options[el.selectedIndex].value);
                }
            }
            if($('[name="'+window.themeSettings.guidedSearchProperty1+'"]').val() === ""){
                isValidSelection = false;
            }else{
                isValidSelection =  true;
            }

            // Guided search url construction
            // Sample structure of the URL : &query=&facetValueFilter=Price:24.19,Price:49.49&categoryId=140
            if(isValidSelection){
                $('[data-validation-message="guided-search"]').html("");
                var SearchUrl = "";
                var currentSelection = this.currentSelection;
                var filterString = "";
                for (var i = 0; i < Object.keys(currentSelection).length; i++) {
                    if(typeof currentSelection[Object.keys(currentSelection)[i]] == "string"){
                        if(currentSelection[Object.keys(currentSelection)[i]].length > 0){
                            filterString += (filterString.length>0?',':'')+(Object.keys(currentSelection)[i]+":"+currentSelection[Object.keys(currentSelection)[i]]);
                        }
                    }else if(currentSelection[Object.keys(currentSelection)[i]].length > 0){
                        for (var j = 0; j < currentSelection[Object.keys(currentSelection)[i]].length; j++) {
                            if(currentSelection[Object.keys(currentSelection)[i]][j].length > 0){
                                filterString += (filterString.length>0?',':'')+(Object.keys(currentSelection)[i]+":"+currentSelection[Object.keys(currentSelection)[i]][j]);
                            }
                        }
                    }
                }
                if(filterString.length> 0){
                    var filter = "facetValueFilter="+filterString ;
                    SearchUrl= "/c/"+Hypr.getThemeSetting('allProductsCategoryCode')+"?isguidedsearch=1&"+filter+"&startIndex=0";
                }
                window.location = SearchUrl;
            }else{
                var message = "";
                if($('[name="'+window.themeSettings.guidedSearchProperty1+'"]').val() === ""){
                    message =  "Please select valid value for first option.";
                }
                $('[data-validation-message="guided-search"]').html(message);
            }
        },
        clearFields: function(){
            $('[name="'+window.themeSettings.guidedSearchProperty1+'"]').val("");
            $('[name="'+window.themeSettings.guidedSearchProperty2+'"]').val("");
            $('[data-mz-change="updateCheckboxAttributeValue"]:checked').attr('checked',false);

        }
    });

    $(document).ready(function() {
        console.log("guided search gettign themeSettings.");
        window.themeSettings = require('hyprlivecontext').locals.themeSettings;
        console.log(window.themeSettings);
        if (window.themeSettings.isEnableGuidedSearch && window.location.search.indexOf('isguidedsearch=1') == -1) {
            $('.guided-search-button').on('mouseover mouseenter',function(){
                $(this).addClass('popup-right-zero');
            }).on('mouseout',function(){
                $(this).removeClass('popup-right-zero');
            });
             
            if($.cookie("szpartyplan")){
                $('.guided-circ').show();
               $('.guided-search-button').hide();
                $('.guided-close').hide();
                $('.guided-search-button-extra').show(); 
            }
            else{
                $('.guided-tri').show();
                $('.guided-search-button-extra').hide(); 
                $('.guided-search-button').show();
                $('.guided-close').show();   
                
            }
            $('.guided-close').click(function(){
                $.cookie("szpartyplan", "true", { path: '/'});
                
                $('.guided-search-button').hide();
                $('.guided-close').hide();
                $('.guided-circ').show();
                $('.guided-search-button-extra').show(); 
                
            }); 
            
            $('.guided-search-button-extra').click(function(){
                $('.guided-search-button-extra').hide();
                $('.guided-tri').show();  
                $('.guided-search-button').show();
                $('.guided-close').show();
                
                
            });

            $('[data-mz-action="open-guided-search-popover"]').on('click',function(e){
                // Show guided search popover container in with the view.
                if($('[data-container="guided-search"]').css('display') == 'none'){
                    $('[data-container="guided-search"]').show(); 
                    $('body').addClass('lock-verflow');
                }else{
                    $('[data-container="guided-search"]').hide();
                    $('body').removeClass('lock-verflow');
                }
            });
            // Make api call to get the product properties for the guided
            // Update this attribute wrt to the requirement
            var guidedSearchAttributes = [
                window.themeSettings.guidedSearchProperty1,window.themeSettings.guidedSearchProperty2,window.themeSettings.guidedSearchProperty3
                // 'tenant~occasion-or-event','tenant~theme','tenant~super-page-product-type'
            ];
            var guidedSearchContainer = $('[data-container="guided-search"]');
            // if current page is search result page & is came from guided search : 4706
            if(window.location.search.indexOf('isguidedsearch=1') > -1){
                guidedSearchContainer = $('[data-container="guided-search-search-result-page"]');
            }else{
                guidedSearchContainer = $('[data-container="guided-search"]');
            }

            var facets = require.mozuData('facets')? require.mozuData('facets'): [];
            var modelData = {
                filters : getGuidedSearchData(),
                guides : guidedSearchAttributes,
                facets : facets,
                isGuidedSearchURL : window.location.search.indexOf('isguidedsearch=1') > -1 ? 2:1,
                search:window.location.search
            };
            var guidedSearchModel = new GuidedSearchModel(modelData);
            var guidedSearchView = new GuidedSearchView({
                model : guidedSearchModel,
                el: guidedSearchContainer
            });
            guidedSearchView.render();

            $(document).on("rendered-search-result",function(){
                // Update this attribute wrt to the requirement
                var guidedSearchAttributes = [
                    window.themeSettings.guidedSearchProperty1,window.themeSettings.guidedSearchProperty2,window.themeSettings.guidedSearchProperty3
                ];
                var guidedSearchContainer = $('[data-container="guided-search"]');
                // if current page is search result page & is came from guided search : 4706
                if(window.location.search.indexOf('isguidedsearch=1') > -1){
                    guidedSearchContainer = $('[data-container="guided-search-search-result-page"]');
                    $('[data-mz-action="open-guided-search-popover"]').hide();
                }else{
                    guidedSearchContainer = $('[data-container="guided-search"]');
                    // Show floating button
                    $('[data-mz-action="open-guided-search-popover"]').show();
                }

                var facets = require.mozuData('facets')? require.mozuData('facets'): [];
                var modelData = {
                    filters : getGuidedSearchData(),
                    guides : guidedSearchAttributes,
                    facets : facets,
                    isGuidedSearchURL : window.location.search.indexOf('isguidedsearch=1') > -1 ? 2:1
                };
                var guidedSearchModel = new GuidedSearchModel(modelData);
                var guidedSearchView = new GuidedSearchView({
                    model : guidedSearchModel,
                    el: guidedSearchContainer
                });
                guidedSearchView.render();
            });
        }else{
            console.log("Guided search not enabled for this site.");
        }


        function getGuidedSearchData(){
            // Key is strign value and value is value
            var key, data1 = [], data2 = [], data3 = [],k;
            for( key in JSON.parse(window.themeSettings.guidedSearchProperty1KeyValues)){
                if(key){
                    for(k in JSON.parse(window.themeSettings.guidedSearchProperty1KeyValues)[key]){
                        if(k){
                            data1.push({'stringValue':k,'value':JSON.parse(window.themeSettings.guidedSearchProperty1KeyValues)[key][k]});
                        }
                    }
                }
            }
            for( key in JSON.parse(window.themeSettings.guidedSearchProperty2KeyValues)){
                if(key){
                    for(k in JSON.parse(window.themeSettings.guidedSearchProperty2KeyValues)[key]){
                        if(k){
                            data2.push({'stringValue':k,'value':JSON.parse(window.themeSettings.guidedSearchProperty2KeyValues)[key][k]});
                        }
                    }
                }
            }
            for( key in JSON.parse(window.themeSettings.guidedSearchProperty3KeyValues)){
                if(key){
                    for(k in JSON.parse(window.themeSettings.guidedSearchProperty3KeyValues)[key]){
                        if(k){
                            data3.push({'stringValue':k,'value':JSON.parse(window.themeSettings.guidedSearchProperty3KeyValues)[key][k]});
                        }
                    }
                }
            }
            var guidedSearchData = [
                {
                    'attributeFQN': window.themeSettings.guidedSearchProperty1,
                    'vocabularyValues': data1
                },
                {
                    'attributeFQN': window.themeSettings.guidedSearchProperty2,
                    'vocabularyValues': data2
                },
                {
                    'attributeFQN': window.themeSettings.guidedSearchProperty3,
                    'vocabularyValues': data3
                }
            ];
            return guidedSearchData;
        }
    });
});
