define(['modules/jquery-mozu', "modules/views-collections", 'modules/models-faceting'], function($, CollectionViewFactory, facetingProducts) {
    $(document).ready(function() {
        window.facetingViews = CollectionViewFactory.createFacetedCollectionViews({
            $body: $('[data-mz-category]'),
            template: "super-page-view"
        });
        if($(".super-page-hidden-facets input:checked").length>0){
             $(".super-page-filter-wrap  a[data-prop='"+$(".super-page-hidden-facets input:checked").attr("id")+"']").addClass("active");           
        }
        if($(window).width()<700){
            if($(".super-page-filter-wrap").length>0){
                if( !$(".super-page-filter-wrap > ul").hasClass("owl-carousel")){
                    $(".super-page-filter-wrap > ul").addClass("owl-carousel");
                }
            }
        }
        var owl = $('.owl-carousel');
        owl.owlCarousel({
            loop:true,
            margin:10,
            nav:true,
            dots: false,
        onRefresh: function () {
           updateSize();
        },
        onRefreshed: function () {
           updateSize();
        },
            responsive:{
                0:{
                    items:3
                },
                600:{
                    items:5
                },
                1000:{
                    items:7
                }
            }
        });
        function updateSize(){
            var minHeight=parseInt($('.super-page-filter-wrap .owl-item').eq(0).css('height'),10);
            $('.super-page-filter-wrap .owl-item').each(function () {
                var thisHeight = parseInt($(this).css('height'),10);
                minHeight=(minHeight<=thisHeight?minHeight:thisHeight);
            });
            $('.super-page-filter-wrap .owl-item').css('height',minHeight+'px');
        }
       /* $(".mz-l-sidebaritem-mobile ul.productType").owlCarousel({
            loop:true,
            margin:10,
            nav:true,
            dots: false,
            responsive:{
                0:{
                    items:1
                },
                600:{
                    items:3
                },
                1000:{
                    items:4
                }
            }
        });*/
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
       
        $(".super-page-filter-wrap  ul  li  a").click(function(){
            var prop=$(this).attr("data-prop");
        	if(prop){
                if(prop==="*"){
                    if($(".super-page-filter-wrap  ul  li  a.active").length >0){
                        $(".mz-facetingform-clearall").click();                       
                        $(".super-page-filter-wrap ul  li  a").removeClass("active");
                    }
                }else{
                    if($(".mz-facetingform input#"+prop).length>0){
                        $(".super-page-filter-wrap  ul  li  a").removeClass("active");
                        $(this).addClass("active");
                    	$(".mz-facetingform input:checkbox").prop("checked",false);
                    	$(".mz-facetingform input#"+prop).prop("checked","true");
                        $(".mobile-filter-footer .mz-apply-btn").click();
                    }else{
                        console.log("Not Found..!");
                        $(".mz-facetingform-clearall").click(); 
                        $(".super-page-filter-wrap  ul  li  a").removeClass("active");
                       /* $(this).addClass("active");
                        //$(".mz-facetingform input:checkbox").prop("checked",false);
                        $(".mz-facetingform input#"+prop).prop("checked","true");
                        $(".mobile-filter-footer .mz-apply-btn").click();*/
                    }
                }
            }
        });	
    });
});