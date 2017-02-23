define(["modules/jquery-mozu","modules/backbone-mozu","modules/api","modules/models-product","vendor/wishlist"],function(e,t,o,a,n){function r(e){for(var t=e+"=",o=document.cookie.split(";"),a=0;a<o.length;a++){for(var n=o[a];" "==n.charAt(0);)n=n.substring(1);if(0===n.indexOf(t))return n.substring(t.length,n.length)}return""}function i(){e(".trigger-login").trigger("click"),e("#cboxOverlay").show(),e("#mz-quick-view-container").fadeOut(350),e("#mz-quick-view-container").empty()}var s=t.MozuView.extend({templateName:"modules/product/guided-search-listing",events:{"click .addToWishlist":"addToWishlist"},render:function(){t.MozuView.prototype.render.call(this),e(".loader").hide()},addToWishlist:function(t){if(require.mozuData("user").isAnonymous)i();else{var o=e(t.currentTarget).data("product_id"),a=this.model.get("items").where({productCode:o}),r=a[0];n.initoWishlist(r)}}}),c=t.MozuView.extend({templateName:"modules/product/guidedsearch-facets",render:function(){t.MozuView.prototype.render.call(this),e(".loader").hide()}}),l=t.MozuView.extend({templateName:"modules/product/guided-search-facets",render:function(){t.MozuView.prototype.render.call(this),e(".button-search-slider-loop .owl-carousel").length>0&&(e(".button-search-slider-loop .owl-next, .button-search-slider-loop .owl-prev").html(""),e(".button-search-slider-loop .owl-carousel").owlCarousel({dots:!0,loop:!0,nav:!0,margin:0,responsive:{0:{items:1},600:{items:2},1e3:{items:5}}}),e(".button-search-slider-loop .owl-dots").hide(),e(".button-search-slider-loop .owl-carousel .owl-item").length<5&&(e(".button-search-slider-loop .owl-prev").hide(),e(".button-search-slider-loop .owl-next").hide())),e(".loader").hide()}}),d=function(t,n,r,i,d){function u(e){for(var t=1,o=[],a=e.get("pageCount"),n=Math.max(Math.min(t-2,a-4),2),r=Math.min(n+5,a);r>n;)o.push(n++);return o}e(".wait").css("display","block");var h="/api/commerce/catalog/storefront/productsearch/search/?filter=categoryId req "+t;h+="&pageSize="+i+"&facetTemplate=categoryId:"+t,h+="&startIndex="+r,0===n&&(h+="&facetHierValue=categoryId:"+t+"&facetHierDepth=categoryId:2");var m;o.request("GET",h).then(function(h){m=new a.ProductCollection(h);var g="/api/commerce/catalog/storefront/categories/"+t,p=u(m),v=u(m),f=[];f=v.length>3?v.splice(0,3):v,m.set("currentCat",t),m.set("allPageNumbers",p),m.set("middlePageNumbers",f),m.set("lastPageNumbers",v),m.set("PrevPage",parseInt(d,10)-1),m.set("currentPage",d),m.set("NextPage",parseInt(d,10)+1);var w="";1!==r?(w=parseInt(r,10)+parseInt(i,10),w>m.attributes.totalCount&&(w=m.attributes.totalCount)):w=i,m.set("rangelevel",w);var b=new s({el:e("[data-mz-guidedlisting-block]"),model:m}),z=new l({el:e("[data-mz-buttons1]"),model:m}),y=new c({el:e("[data-mz-search]"),model:m});o.request("GET",g).then(function(e){m.set("CategoryName",e.content.name),0===n&&z.render(),y.render(),b.render()})})};e(document).ready(function(){e(document).on("click",".editbtn",function(){e(".factes").show(),e(".search-edit").hide()}),e(document).on("click",".cancelbtn",function(){e(".factes").hide(),e(".search-edit").show()})}),e(document).on("click",".search-facet",function(){e(".loader").show();var t=e(".pagesizes").val(),o=e(this).data("category-id");d(o,1,1,t,1)}),e(document).on("change",".pagesizes",function(){e(".loader").show();{var t=e(".categoryid").val(),o=e(this).val();e(this).data("category-id")}d(t,1,1,o,1)}),e(document).on("click",".pagination",function(){e(".loader").show();var t=e(".categoryid").val(),o=e(this).data("mz-page-num"),a=e(".pagesizes").val(),n=parseInt(a,10)*(parseInt(o,10)-1);1==o&&(n=1),d(t,1,n,a,o),e(this).addClass("pagination_active")}),e(document).on("click",".button-loop .btn-banner",function(){e(".button-loop .btn-banner").removeClass("active_btn"),e(this).addClass("active_btn")}),e(document).ready(function(){var t=e(".pagesizes").val(),o=r("guidedcategory");e(".loader").show(),d(o,0,1,t,1),e(document).on("click",".guided-save",function(){e(".loader").show();var t=(e(".event-kind").val(),e(".event-theme").val()),o=(e(".guest").val(),e(".pagesizes").val());d(t,0,1,o,1)})})});