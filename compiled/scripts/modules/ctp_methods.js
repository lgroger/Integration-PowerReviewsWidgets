require(["modules/jquery-mozu","underscore","hyprlive","modules/backbone-mozu","hyprlivecontext","modules/editable-view","modules/preserve-element-through-render","modules/api","modules/models-product","vendor/wishlist","modules/models-faceting"],function(e,o,r,t,s,n,c,i,l,a,d){function m(){e(".trigger-login").trigger("click"),e("#cboxOverlay").show(),e("#mz-quick-view-container").fadeOut(350),e("#mz-quick-view-container").empty()}var u=t.MozuView.extend({templateName:"modules/product/pdp-recommended-products",render:function(){t.MozuView.prototype.render.call(this),e(".echi-shi-related-products-slider .owl-next, .echi-shi-products_slider .owl-prev").html(""),e(".pdp-related-products .echi-shi-related-products-slider .owl-carousel").owlCarousel({loop:!0,nav:!0,responsive:{0:{items:2},600:{items:2},1e3:{items:4}}});var o=require.mozuData("facetedproducts"),r=new d.FacetedProductCollection(o);e(".wishlist-icon > a, .wishlist-icon-tablet>a").click(function(){if(require.mozuData("user").isAnonymous)m();else{var o=e(this).attr("id"),t=r.get("items").where({productCode:o});a.initoWishlist(t[0])}})}}),h=function(o,r){var t="/api/commerce/catalog/storefront/productsearch/search/?filter="+o+"&pageSize=200";i.request("GET",t).then(function(o){var t=new l.ProductCollection(o);if(r){if(r){var s=new u({el:e("#recommended_products_slot_cart"),model:t});s.render()}}else{var n=new u({el:e("#recommended_products_slot"),model:t});n.render()}})};e(document).ready(function(){var e=require.mozuData("pagecontext"),o=(e.pageType,0);globalNameSpace.callRecomm=function(e){console.log("CallBackFunction Trigger");for(var r,t,s,n=[],c=[],i=0;i<e.resonance.schemes.length;i++)if("addtocart1_rr"===e.resonance.schemes[i].scheme){if(s=!0,"yes"===e.resonance.schemes[i].display){t=e.resonance.schemes[i].items.length;for(var l=0;l<e.resonance.schemes[i].items.length;l++)r=e.resonance.schemes[i].items[l].id,c[l+i*e.resonance.schemes[i].items.length]=r}}else if(s=!1,"yes"===e.resonance.schemes[i].display){t=e.resonance.schemes[i].items.length;for(var a=0;a<e.resonance.schemes[i].items.length;a++)r=e.resonance.schemes[i].items[a].id,n[a+i*e.resonance.schemes[i].items.length]=r}for(var d="productCode eq ",m=0;m<n.length;m++)d+=m<n.length-1?n[m]+" or productCode eq ":n[m];if(0===c.length&&!s&&n.length>=1)h(d,0);else if(s&&0===n.length&&c.length>=1){for(var u="productCode eq ",p=0;p<c.length;p++)u+=p<c.length-1?c[p]+" or productCode eq ":c[p];h(u,1),o=0,c=[],s=!1}}})});