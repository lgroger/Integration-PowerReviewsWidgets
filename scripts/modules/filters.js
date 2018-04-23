define(['modules/jquery-mozu', 'modules/api', 'hyprlive', 'modules/models-product', 'vendor/wishlist', 'vendor/jQuery.selectric',"modules/login-links"], function ($, api, Hypr, ProductModels, Wishlist, Selectric,LoginLinks) {    
    function initSelectedFilters() {
        if($(".mz-facetingform-value:checked").length > 0) {
            $(".mz-facetingform-value:checked").each(function(i, el) {
                var idText = $(el).attr("id");
                $("<div/>")
                .addClass("selected-filter")
                .text($(el).siblings("label").text())
                .append($("<a/>")
                        .text("x")
                        .attr("click-data", idText).get())
                .appendTo("#selected-filters-collection");
            });
            $(".mz-button.mz-facetingform-clearall").clone().appendTo("#selected-filters-collection");
        }
    }  
    function hideMoreContent() {
        var showChar = 500;
        var ellipsestext = "...";
        var moretext = "read more";
        var lesstext = "less";
        var content = $("#mz-cat-description-hide-more").text();
        if(content.length > showChar) {
            var c = content.substr(0, showChar);
            var h = content.substr(showChar, content.length - showChar);
            var html = c + '<span class="moreellipses">' + ellipsestext+ '&nbsp;</span><span class="morecontent"><span>' + h + '</span>&nbsp;&nbsp;<a href="" class="morelink">' + moretext + '</a></span>';
            $("#mz-cat-description-hide-more").html(html);
        }
        $("#mz-cat-description-hide-more .morelink").click(function(){
            if($(this).hasClass("less")) {
                $(this).removeClass("less");
                $(this).html(moretext);
            } else {
                $(this).addClass("less");
                $(this).html(lesstext);
            }
            $(this).parent().prev().toggle();
            $(this).prev().toggle();
            return false;
        });
    }

    window.wishlistSelected = function () {
        var newPromise = api.get('wishlist').then(function(wishlist) {
        var wishlistItems = wishlist.data.items;
        var products = [];
        for(var i = 0; i < wishlistItems.length; i++) { 
            for(var j = 0; j < wishlistItems[i].items.length; j++) { 
                products.push(wishlistItems[i].items[j].product.productCode);
            }
        }
        return products;
        }).then(function(wishlist) {
            $("#" + wishlist.join(",#")).addClass('active');
        });
    };
    window.wishlistIni = function () {
        $('.wishlist-icon > a, .wishlist-icon-tablet>a').click(function(e) {
            e.preventDefault();
            if(!require.mozuData('user').isAnonymous) {
                var productCode = $(this).attr('id');
                window.showPageLoader();
                api.get('product',{'productCode':productCode}).then(function(res){
                    var product=new ProductModels.Product(res.data);
                    product.set('moveToWishList', 1);
                    Wishlist.initoWishlist(product);
                    window.removePageLoader();
                });
            }else {
                LoginLinks.triggerLogin();
            }
        });
        /*
        $(document).on('click', '.wishlist-icon > a', function(e) {
            e.preventDefault();
            if(!require.mozuData('user').isAnonymous) {
                var productCode = $(this).attr('id');
                var product = facetingModel.get("items").where({'productCode':productCode});
                Wishlist.initoWishlist(product[0]);
            }else {
                LoginLinks.triggerLogin();
            }
        });
        */
        /* window.wishlistSelected(); */
    };   
    $(document).ready(function() {      
        var mzFilterBarFixed = false;
        /* var mzFilterBarY = $('.mz-l-paginatedlist-header').offset().top - 180; */
        var mzFilterBarY = 190;
   
        $(document).on('click','.facet-heading',function(e){
          $(this).next().slideToggle();
          $(this).children('i').toggleClass('fa-minus').toggleClass('fa-plus');
          
        });    

        $(document).on('click','.facetsclick',function(e){ 
            var cnt = $(this).attr("show-count");
            if(parseInt(cnt,10)!=cnt)
                cnt = 5;
            else
                cnt = parseInt(cnt,10)-1;
          $(this).parents().prevAll('.mz-facetingform-facet').find('li:gt('+cnt+')').slideToggle();  
          //$(this).next('i').toggleClass('fa-caret-down').toggleClass('fa-caret-up'); 
          $(this).children('i').toggleClass('fa-minus').toggleClass('fa-plus'); 
         var a =  $(this).find('.facets-more').text();
         var b = $.trim(a);
          var c; 
        if(b === "See more"){
            c = $(this).find('.facets-more').text().replace("See more","See fewer");
            
            $(this).find('.facets-more').text(c);
          
                  }
        else{ 
          c = $(this).find('.facets-more').text().replace("See fewer","See more");
          
            $(this).find('.facets-more').text(c); 
                  }

        }); 

        


 

        hideMoreContent();
        $('.mz-pagingcontrols-pagesize-dropdown, .mz-pagingcontrols-pagesort-dropdown').selectric({
            maxHeight: 200,
            responsive:true,
            disableOnMobile:false
        });
        if( !$.trim($('#mz-drop-zone-category-page-bottom').html()) ){
            $('.mz-plp-btw-promo-slot').css('display', 'none');
        }else {
            $('.mz-plp-btw-promo-slot').empty();
            $('#mz-drop-zone-category-page-bottom').appendTo('.mz-plp-btw-promo-slot');
        }
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
                    if($('.mz-sales-ribbon').is(':visible')){
                        $(this).css({'top':'32px'});
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
        $(document).on("scroll", window, function(){
            var mzScrollTop = $(window).scrollTop();
            var mzShouldBeFixed = mzScrollTop > mzFilterBarY;
            if (mzShouldBeFixed && !mzFilterBarFixed) {
                $('.mz-l-paginatedlist-header').addClass("mz-l-paginatedlist-header-fixed");
                $('#selected-filters-mobile').show();
                $('#selected-filters-mobile-static').hide();
                mzFilterBarFixed = true;
            }
            else if (!mzShouldBeFixed && mzFilterBarFixed)
            {
                $('.mz-l-paginatedlist-header')
                    .removeClass("mz-l-paginatedlist-header-fixed");
                $('#selected-filters-mobile').hide();
                $('#selected-filters-mobile-static').show();
                mzFilterBarFixed = false;
            }
        });
        $(document).on("click", ".selected-filter > a", function(){
            $("#" + $(this).attr("click-data")).trigger("change");
        });
        if(!$.trim($(".mz-filter-options").html())) { 
            $(".mz-filters-btn").addClass("disabled");
        }else {
            $(document).on("click", ".desktop .mz-filters-btn, .desktop .mz-filters i, .desktop .mz-filters img", function (e) {
                if(e.target !== e.currentTarget) return;
                //$(".mz-filter-options").slideToggle();
                if($(".mz-filter-options").is(":visible")){
                    var firstChild = $('.mz-filters .mz-l-sidebaritem li:first');
                    $(".mz-filter-inputs > .mz-facetingform-facet").hide();
                    firstChild.addClass('active');
                    $("#" + firstChild.attr('containerid')).show();
                }
                $('.mz-filters-bar .mz-filters-btn').find('i').toggleClass('fa-caret-down fa-caret-up');
            });
            $(document).on("click", ".mobile .mz-filters-btn", function () {
                $(".mz-filter-mobile-options").toggle();
                if($(".mz-filter-options").is(":visible")){
                    var firstChild = $('.mz-filters .mz-l-sidebaritem li:first');
                    $(".mz-filter-inputs > .mz-facetingform-facet").hide();
                    firstChild.addClass('active');
                    $("#" + firstChild.attr('containerid')).show();
                }
                $('.menu-custom label.menu-toggle').addClass('hide_mob_icon');
                $('.header-float').addClass('add_z_index');
            }); 
            $(document).on("click", ".close-option", function () {
                $(".mz-filter-mobile-options").toggle();
                $('.menu-custom label.menu-toggle').removeClass('hide_mob_icon');
                $('.header-float').removeClass('add_z_index');
            });
            $(document).on("click", ".filter-level-1 > a", function () {
                $(this).children('i').toggleClass('fa-plus').toggleClass('fa-minus');
                $(this).parent().children('.filter-level-2').slideToggle();
                $(this).parent().toggleClass('active_mob_filter'); 
            });
            $(document).on("click", "#filters-close-btn", function(){
                $(".mz-filter-options").slideUp();
                $('.mz-filters-bar .mz-filters-btn').find('i').removeClass('fa-caret-up');
            });
            $(document).on("click", ".filter-level-2 label", function(){
                if($(this).prev("input").prop("checked")){
                    $(this).prev("input").prop("checked", false);
                }else {
                    $(this).prev("input").prop("checked", true);
                }
            });

            $(document).on("mouseover", "ul.mz-l-sidebaritem > li", function () {
                $("ul.mz-l-sidebaritem > li").removeClass("active");
                $(this).addClass("active");
                $(".mz-filter-inputs > .mz-facetingform-facet").hide();
                $("#" + $(this).attr('containerid')).show();
            });
        }
    });
});