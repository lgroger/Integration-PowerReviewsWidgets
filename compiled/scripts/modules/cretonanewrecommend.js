window.recommendedproducts=null;var certonaRecommendations=function(e){window.recommendedproducts=e,require(["modules/jquery-mozu","underscore","hyprlive","modules/backbone-mozu","modules/api","modules/models-product","vendor/wishlist","modules/models-faceting"],function(e,s,o,r,n,t){var c=r.MozuView.extend({templateName:"modules/product/pdp-recommended-products",render:function(){r.MozuView.prototype.render.call(this),e(".echi-shi-related-products-slider .owl-next, .echi-shi-products_slider .owl-prev").html(""),e(".pdp-related-products .echi-shi-related-products-slider .owl-carousel").owlCarousel({loop:!0,nav:!0,responsive:{0:{items:2},600:{items:2},1e3:{items:4}}})}}),d=function(s,o,r){var d="/api/commerce/catalog/storefront/productsearch/search/?filter="+s+"&pageSize=200";n.request("GET",d).then(function(s){for(var n,d=[],m=0;m<r.resonance.schemes.length;m++)for(var l=0;l<r.resonance.schemes[m].items.length;l++)n=r.resonance.schemes[m].items[l].id,d.push(n);var i=[];i.items=[];for(var a=0;a<d.length;a++)for(var h=0;h<s.items.length;h++)d[a]==s.items[h].productCode&&i.items.push(s.items[h]);var u=new t.ProductCollection(i);if(o){if(o){var p=new c({el:e("#recommended_products_slot_cart"),model:u});p.render()}}else{for(var g,f=[],v=[],w=0;w<r.resonance.schemes.length;w++){if("product1_rr"===r.resonance.schemes[w].scheme)for(var _=0;_<r.resonance.schemes[w].items.length;_++)g=u.get("items").where({productCode:r.resonance.schemes[w].items[_].id}),g&&g.length>0&&f.push(g[0].apiModel.data);if("product2_rr"===r.resonance.schemes[w].scheme)for(var C=0;C<r.resonance.schemes[w].items.length;C++)g=u.get("items").where({productCode:r.resonance.schemes[w].items[C].id}),g&&g.length>0&&v.push(g[0].apiModel.data)}if(f.length>0){var q=new c({el:e("#recommended_products_slot_1"),model:new t.ProductCollection({items:f})});q.render(),e(".recom_slot-heading_1").show()}if(v.length>0){u.set("items",v);var y=new c({el:e("#recommended_products_slot_2"),model:new t.ProductCollection({items:v})});y.render(),e(".recom_slot-heading_2").show()}if(0===f.length){var z=new c({el:e("#recommended_products_slot"),model:u});z.render()}}})},m=require.mozuData("pagecontext"),l=(m.pageType,0);globalNameSpace.callRecomm=function(e){if(console.log("CallBackFunction Trigger"),e){var s=e;window.rec=s;for(var o,r,n,t=[],c=[],m=0;m<e.resonance.schemes.length;m++)if("addtocart1_rr"===e.resonance.schemes[m].scheme){if(n=!0,"yes"===e.resonance.schemes[m].display){r=e.resonance.schemes[m].items.length;for(var i=0;i<e.resonance.schemes[m].items.length;i++)o=e.resonance.schemes[m].items[i].id,c[i+m*e.resonance.schemes[m].items.length]=o}}else if(n=!1,"yes"===e.resonance.schemes[m].display){r=e.resonance.schemes[m].items.length;for(var a=0;a<e.resonance.schemes[m].items.length;a++)o=e.resonance.schemes[m].items[a].id,t[a+m*e.resonance.schemes[m].items.length]=o}for(var h="productCode eq ",u=0;u<t.length;u++)h+=u<t.length-1?t[u]+" or productCode eq ":t[u];if(0===c.length&&!n&&t.length>=1)d(h,0,e);else if(n&&0===t.length&&c.length>=1){for(var p="productCode eq ",g=0;g<c.length;g++)p+=g<c.length-1?c[g]+" or productCode eq ":c[g];d(p,1,e),l=0,c=[],n=!1}}},setTimeout(function(){globalNameSpace.callRecomm(window.recommendedproducts)},500)})};