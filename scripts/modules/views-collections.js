/**
 * Unidirectional dispatch-driven collection views, for your pleasure.
 */


define([
    "modules/jquery-mozu",
    'backbone',
    'underscore',
    'hyprlive',
    'modules/url-dispatcher',
    'modules/intent-emitter',
    'modules/get-partial-view',
	'modules/powerreviews',
    'modules/colorswatch',
    'vendor/jQuery.selectric'
], function($, Backbone, _, Hypr, UrlDispatcher, IntentEmitter, getPartialView, PowerReviewsWidget, ColorSwatch, Selectric) {
    var list_view_checker = false;
    function factory(conf) {

        var _$body = conf.$body;
        var _dispatcher = UrlDispatcher;
        var ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND';

        function clearFilterReseter() {
            if(require.mozuData('pagecontext').pageType === "search"){
                $('[data-mz-action=clearFacets]').each(function(){
                    $(this).attr('data-mz-url', $(this).attr('data-mz-url') + removeGetParam("facetValueFilter"));
                });
            }
        }  

        function updateUi(response) {
            var url = response.canonicalUrl;
            _$body.html(response.body);
            if (url) _dispatcher.replace(url);
            if(require.mozuData("pagecontext").cmsContext.template.path==="super-page"){
                 if($(".super-page-filter-wrap").length<1){
            $(".super-page-hidden-facets li input[data-mz-facet='tenant~product-type']").parent().parent().addClass("productType clearfix");
            $('.super-page-hidden-facets .productType li input:checkbox').on("change",function() {
                    if($(this).is(":checked")) {
                        console.log("Checked");
                        $(".mz-facetingform input:checkbox").not($(this)).prop("checked",false);
                         $(".mobile-filter-footer .mz-apply-btn").click();
                    }
                });
        }
       
          } 
          if($('.mz-facetingform-facet-hierarchy').hasClass('facetli')){
            console.log('true');

            $('.facetli').each(function(i,v){
              
             var a= $(this).find('input:checked').last().attr("id");
             var b = $("#"+a).parent().index();
             if(b > 5 ){
                $(this).find('li').show(); 
                /*var q = $('.facetless').text().replace("See more","See fewer");
                        $('.facetless').text(q);*/
                        var n = $(this).next().find('.facetless').text().replace("See more","See fewer");
                        $(this).next().find('.facetless').text(n);
                        $(this).next().find('.faceticon').toggleClass('fa-caret-down').toggleClass('fa-caret-up');
                    } 
              // console.log(i); 
              // if(i>5){
              //   if($(this).children('input:checked').length !== 0){
              //       $('.facetli li').show();
              //   }
              //   var q = $('.facetless').text().replace("See more","See fewer");
              //       $('.facetless').text(q);                
              //       $('.faceticon').toggleClass('fa-caret-down').toggleClass('fa-caret-up');
              // }
               
            }); 

          }   
 
           _$body.removeClass('mz-loading');
            ColorSwatch.ColorSwatch.init(); 
			PowerReviewsWidget.writeProductListBoxes();
            window.wishlistIni();
            $(".mz-new-ribbon").each(function(){
                if(!$(this).is(':visible')){
                    var cDate = new Date($(this).attr('mz-new-flag-date'));
                    var tmp1 = new Date();
                    var daysForNewRibbon = Hypr.getThemeSetting('daysForNewRibbon');
                    tmp1.setDate(tmp1.getDate() - daysForNewRibbon);
                    if(+tmp1 <= +cDate){
                        $(this).show();
                    }
                    if($(this).find('.mz-sales-ribbon') .length>0 ){
                        if($(this).find('.mz-sales-ribbon').is(':visible')){
                            $(this).css({'top':'32px'});
                        }
                    }
                }
            });
            $('.mz-clearance-ribbon').each(function(){
                var pn = $(this).parent();
                var salerb = pn.find('.mz-sales-ribbon');
                var newrb = pn.find('.mz-new-ribbon'); 
                if(salerb.length>0 && newrb.length>0){
                        if(salerb.is(':visible') && newrb.is(':visible')){
                            $(this).css({'top':'65px'});
                        }
                }
                else {
                    if(salerb.length>0 || newrb.length > 0){
                        if(salerb.is(':visible') ||  newrb.is(':visible')){
                            $(this).css({'top':'32px'});
                        }
                     }
                }
            });
           $('.mz-pagingcontrols-pagesize-dropdown, .mz-pagingcontrols-pagesort-dropdown').selectric({
                maxHeight: 200,
                responsive:true,
                disableOnMobile:false
            });
            window.removePageLoader();
            clearFilterReseter();
            $(document).trigger("rendered-search-result");
            if(globalNameSpace && window.recommendedproducts){globalNameSpace.callRecomm(window.recommendedproducts);}
        }


        function showError(error) {
            // if (error.message === ROUTE_NOT_FOUND) {
            //     window.location.href = url;
            // }
            _$body.find('[data-mz-messages]').text(error.message);
        }

        function removeGetParam(key) {
            var url  = window.location.search;
            url = url.replace("?", "");
            var param = url.split("&");
            var checkKey = "";
            for(var i = 0; i < param.length; i++) {
                checkKey = param[i].split("=");
                if(checkKey[0] === key) {
                    param.splice(i, 1);
                }
            }
            return "?" + param.join("&");
        }

        function applyFilter(e) {
            var url_build="";
            var flag=false;
            var filter_value = [];
            var url_data = "";
            $(".mz-facetingform input:checkbox:checked").each(function(){
                if ($.inArray(this.getAttribute('data-mz-facet-value'), filter_value) < 0) {
                    filter_value.push(this.getAttribute('data-mz-facet-value'));
                    if(this.getAttribute('data-mz-facet-value').indexOf(":") > 0) {
                        url_data = this.getAttribute('data-mz-facet-value');
                    }else {
                        url_data = this.getAttribute('data-mz-facet') + ':' + this.getAttribute('data-mz-facet-value');
                    }
                    if(!flag)
                    {
                        if(window.location.search !== "") {
                            url_build = removeGetParam("facetValueFilter") + '&facetValueFilter=' + url_data;
                        }else {
                            url_build = '?facetValueFilter=' + url_data;
                        }
                        flag=true;// To trace if first query string added
                    }
                    else
                    {
                        url_build = url_build + ',' +url_data;
                    }
                }
            });
            url_build = window.location.pathname + url_build;
            return url_build;
        }

        function intentToUrl(e) {
            var elm = e.target; 
            var url,parserSearch;
            if(require.mozuData('pagecontext').isDesktop && require.mozuData("pagecontext").cmsContext.template.path !=="super-page" ){
                $('html, body').animate({
                scrollTop: $(".mz-l-paginatedlist").offset().top - 70 
                }, 1000);   
            }   
            //if(!require.mozuData('pagecontext').isMobile && !require.mozuData('pagecontext').isTablet) 
            //{
            if (elm.tagName.toLowerCase() === "select") {
                elm = elm.options[elm.selectedIndex];
            }
            url = elm.getAttribute('data-mz-url') || elm.getAttribute('href') || '';
            if (url && url[0] != "/") {
                var parser = document.createElement('a');
                parser.href = url;  
                url = window.location.pathname + parser.search;
                parserSearch = parser.search;
            }
            // if its search url 
            if(window.location.pathname == "/search"){
                // Get the current url serach value
                var currentSearch = window.location.search;   
                // if query param is empty
                if(currentSearch.indexOf('query') == -1 || currentSearch[currentSearch.indexOf('query')+6] == '&' || typeof currentSearch[currentSearch.indexOf('query')+6] ==  "undefined" ){
                    // remove the params from current url which are available in parse.serach
                    var currentSearchParams = currentSearch.substring(1,currentSearch.length).split('&');
                    var parserSearchParams = parserSearch.substring(1,parserSearch.length).split('&');
                    for (var i = 0; i < parserSearchParams.length; i++) {
                        var removeingIndex =  null;
                        for (var j = 0; j < currentSearchParams.length; j++) {
                            if(currentSearchParams[j].split('=')[0] == parserSearchParams[i].split('=')[0]){
                                // remove the item from the array
                                removeingIndex =  j;
                            }
                        }
                        currentSearchParams.splice(removeingIndex,1);
                    }
                    // append updated url to parse.search and return
                    url = window.location.pathname +'?'+currentSearchParams.join('&')+'&'+parserSearchParams.join('&');
                }
            }
            return url;
           // }
        }   
         
        var navigationIntents = IntentEmitter(
            _$body, 
            [
                'click [data-mz-pagingcontrols] a',
                'click [data-mz-pagenumbers] a',
                //'click a[data-mz-facet-value]',
                'click [data-mz-action="clearFacets"]',
                'change [data-mz-desk-facet="desk-facet"]',
                'click a[click-data]',
                'change [data-mz-value="pageSize"]',
                'change [data-mz-value="sortBy"]'
            ],
            intentToUrl
        ); 
  
        var applyFiltersBtn = IntentEmitter(
            _$body,
            [
                'click .mz-apply-btn'
            ],
            applyFilter
        );

        applyFiltersBtn.on('data', function(url, e) {
            if (url && _dispatcher.send(url)) {
                window.showPageLoader();
                e.preventDefault();
            }
        });

        navigationIntents.on('data', function(url, e) {
            if (url && _dispatcher.send(url)) {
                window.showPageLoader();
                e.preventDefault();
            }
        });
 
        _dispatcher.onChange(function(url) {
            getPartialView(url, conf.template).then(updateUi, showError);
        });

    }

    return {
        createFacetedCollectionViews: factory
    };

});