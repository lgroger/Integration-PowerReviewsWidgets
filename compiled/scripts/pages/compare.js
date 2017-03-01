define(["modules/jquery-mozu","modules/api","underscore","hyprlive","modules/backbone-mozu","modules/cart-monitor","modules/models-product","modules/views-productimages","modules/soft-cart","modules/added-to-cart","vendor/wishlist","hyprlivecontext","pages/dndengine","modules/powerreviews"],function(t,e,o,n,i,a,r,c,s,d,p,l,m,u){function h(){t(".mz-container-items").owlCarousel({loop:!1,nav:!0,items:1,dot:!1}),window.owlCarouselData=t(".mz-container-items").data("owlCarousel")}function g(){t(".trigger-login").trigger("click"),t("#cboxOverlay").show(),t("#mz-quick-view-container").fadeOut(350),t("#mz-quick-view-container").empty()}function f(t){for(var e=t+"=",o=document.cookie.split(";"),n=0;n<o.length;n++){for(var i=o[n];" "==i.charAt(0);)i=i.substring(1);if(0===i.indexOf(e))return i.substring(e.length,i.length)}return""}function v(t,e,o){var n=new Date;n.setTime(n.getTime()+24*o*60*60*1e3);var i="expires="+n.toUTCString();document.cookie=t+"="+e+"; path=/;"+i}function w(e){t("#mz-cmp-product-"+e).remove()}function z(o,i,c){e.get("product",o).then(function(e){var o=new r.Product(e.data);o.on("addedtocart",function(e){if(e&&e.prop("id")){var i=new r.Product(e.data);o.isLoading(!0),t(".dnd-popup").remove(),t("body").css({overflow:"auto"}),t("#cboxOverlay").hide(),a.addToCount(o.get("quantity")),s.update(),o.isLoading(!1),d.proFunction(i)}else o.trigger("error",{message:n.getLabel("unexpectedError")})}),o.on("addedtowishlist",function(){t("#add-to-wishlist").prop("disabled","disabled").text(n.getLabel("addedToWishlist"))});var p=new k({el:t("#mz-cmp-product-"+i),model:o});b.push(p),p.render(),c&&w(i+1)})}function x(e,o){e=e.toJSON();var i=n.getThemeSetting("productAttributes"),a=0,r=0,c="asImages";for(a=0;a<e.properties.length;a++)if(e.properties[a].attributeFQN===i.displayCrossSell){c=e.properties[a].values[0].value;break}var s=null,d=null,p=null,l=null,m=o.items.length>8?8:o.items.length;for(a=0;m>a;a++)if("asColors"===c){for(t("#color-swatch-elem > span").text("Colors: "),r=0;r<o.items[a].properties.length;r++)if(o.items[a].properties[r].attributeFQN===i.colorHex&&""!==o.items[a].properties[r].values[0].value){s=o.items[a].properties[r].values[0].value;break}""!==s&&(d=document.createElement("a"),t(d).attr("href","/p/"+o.items[a].productCode).addClass("swatch-color").css("background-color",s),p=document.createElement("li"),t(p).append(d),t("ul[color-swatch-data]").append(p))}else t("#color-swatch-elem > span").text("Images: "),o.items[a].content.productImages.length>0&&""!==o.items[a].content.productImages[0].imageUrl&&(l=o.items[a].content.productImages[0].imageUrl+"?max=22",d=document.createElement("a"),t(d).attr("href","/p/"+o.items[a].productCode),t("<img/>").attr("src",l).appendTo(d),p=document.createElement("li"),t(p).addClass("swatch-image").css("border-radius","0").append(d),t("ul[color-swatch-data]").append(p));o.items.length>6&&(d=document.createElement("a"),"asColors"==c?t(d).attr("href",window.location.origin+"/p/"+e.productCode).attr("class","more-link").html("See More Colors"):t(d).attr("href",window.location.origin+"/p/"+e.productCode).attr("class","more-link").html("See More Images"),p=document.createElement("li"),t(p).addClass("more-link").append(d),t("ul[color-swatch-data]").append(p))}var b=[];window.compareProductCount=0;var C=f("compareProduct"),y=C.trim().split(","),T=o.filter(y,function(t){return t.length>0});window.cmp_count=T.length;n.getThemeSetting("productAttributes");window.personalizeBundleProducts=[];var k=i.MozuView.extend({templateName:"modules/product/compare",autoUpdate:["quantity"],additionalEvents:{"change [data-mz-product-option]":"onOptionChange","blur [data-mz-product-option]":"onOptionChange","click .floating-add-to-cart":"addToCart","click button#add-to-cart":"addToCart","click .personalize":"personalizeProduct","click .mz-cmp-product-remove-btn":"removeProduct","change [data-mz-value='quantity']":"onQuantityChange","keyup input[data-mz-value='quantity']":"onQuantityChange","change .mz-productlable-options":"showOptionsList"},onQuantityChange:o.debounce(function(e){var o=t(e.currentTarget),n=parseInt(o.val(),10);isNaN(n)||this.model.updateQuantity(n)},500),showOptionsList:function(e){var o=t(e.currentTarget),n=o.val(),i=this;t(i.el).find("select.mz-productoptions-option").hide(),t('[data-mz-product-option="'+n+'"').show()},personalizeProduct:function(){var t=n.getThemeSetting("dndEngineUrl"),e=new m.DNDEngine(this.model,t);e.initialize(),e.send()},render:function(){var e=this,a=t("[option-alternate-name]");t.each(a,function(o,n){var i=t(n).attr("option-alternate-name"),a=e.model.get("options").get(i),r=a.get("values");for(var c in r){var s=t.trim(t(n).find('[productCode="'+r[c].value+'"]').text());""!==s&&(r[c].stringValue=s)}}),i.MozuView.prototype.render.apply(this),this.$("[data-mz-is-datepicker]").each(function(i,a){t(a).dateinput().css("color",n.getThemeSetting("textColor")).on("change  blur",o.bind(e.onOptionChange,e))})},onOptionChange:function(e){return this.configure(t(e.currentTarget))},configure:function(t){var e,n=this,i=t.val(),a=t.data("mz-product-option"),r=t[0],c="checkbox"!==r.type&&"radio"!==r.type||r.checked,s=this.model.get("options").get(a),d=n.model.getConfiguredOptions();("Banner"===n.model.get("productType")||"BannerRectangle"===n.model.get("productType")||"BannerVertical"===n.model.get("productType")||"BackgroundVBG"===n.model.get("productType"))&&(o.each(d,function(t){n.model.get("options").get(t.attributeFQN).unset("value")}),"Tenant~outdoor-banner"===a?n.model.set("enableSlitoption",!0):n.model.set("enableSlitoption",!1)),s&&("YesNo"===s.get("attributeDetail").inputType?s.set("value",c):c&&(e=s.get("value"),e===i||void 0===e&&""===i||s.set("value",i)))},addToCart:function(){this.model.addToCart()},addToWishlist:function(){require.mozuData("user").isAnonymous?g():p.initoWishlist(this.model)},checkLocalStores:function(e){var o=this;e.preventDefault(),this.model.whenReady(function(){var n=t(e.currentTarget).parents("[data-mz-localstoresform]"),i=n.find("[data-mz-localstoresform-input]");i.length>0&&(i.val(JSON.stringify(o.model.toJSON())),n[0].submit())})},addToCartAfterPersonalize:function(t){var e=n.getThemeSetting("productAttributes"),o=this,i=this.model.get("options").get(e.dndToken);i.set("value",t.projectToken),setTimeout(function(){o.model.addToCart()},200)},afterRender:function(){var o=this,n=0,i=0;"Extra"===this.$("[data-mz-product-option]").attr("usageType")&&1===this.$("[data-mz-product-option]").length&&2==this.$("[data-mz-product-option]").find("option").length&&this.$("[data-mz-product-option]").parents(".mz-productdetail-options").hide(),"Bundle"===this.model.get("productUsage")&&(t(".personalize").attr("disabled",!0).addClass("is-disabled"),t(".bundleItemDndCode").length>0&&t(".addToCart").html("Personalize").addClass("personalize").removeAttr("id"));var a=t('[data-mz-product-option="tenant~cdyper-choice"]').val();void 0!==a&&"cdyperw-option"==a.toLowerCase()&&t('[data-mz-product-option="tenant~pcdypcb"]').closest(".mz-productoptions-optioncontainer").hide(),("Banner"===o.model.get("productType")||"BannerRectangle"===o.model.get("productType")||"BannerVertical"===o.model.get("productType")||"BackgroundVBG"===o.model.get("productType"))&&(void 0!==t(".mz-productoptions-option:visible").val()&&""!==t(".mz-productoptions-option:visible").val()?t(".personalize").prop("disabled",!1):t(".personalize").prop("disabled",!0)),t(".mz-cmp-product-title").each(function(){n=Math.max(n,parseInt(t(this).height(),10))}),t(".mz-cmp-product-title").css("min-height",n+"px"),n=0,t(".mz-productdetail-price.mz-l-stack-section").each(function(){n=Math.max(n,parseInt(t(this).height(),10))}),t(".mz-productdetail-price.mz-l-stack-section").css("min-height",n+"px"),n=0,t(".mz-cmp-p-options-n-extras").each(function(){n=Math.max(n,parseInt(t(this).height(),10))}),t(".mz-cmp-p-options-n-extras").css("min-height",n+"px"),n=0,i=0,t(".mz-cmp-orientation").each(function(){n=Math.max(n,parseInt(t(this).height(),10)),"-"===t(this).find(".value").text().trim()&&(i+=1)}),i===window.cmp_count&&t(".mz-cmp-orientation").remove(),t(".mz-cmp-orientation").css("min-height",n+"px"),n=0,t(".mz-cmp-availability").each(function(){n=Math.max(n,parseInt(t(this).height(),10))}),t(".mz-cmp-availability").css("min-height",n+"px"),n=0,i=0,t(".mz-cmp-sizes").each(function(){n=Math.max(n,parseInt(t(this).height(),10)),"---"===t(this).text().trim()&&(i+=1)}),i===window.cmp_count&&t(".mz-cmp-sizes").remove(),n=0,i=0,t(".mz-cmp-swatch").each(function(){n=Math.max(n,parseInt(t(this).height(),10)),"--"===t(this).text().trim()&&(i+=1)}),t(".mz-cmp-swatch").css("min-height",n+"px"),i===window.cmp_count&&t(".mz-cmp-swatch").remove(),n=0,i=0,t(".mz-cmp-finish").each(function(){n=Math.max(n,parseInt(t(this).height(),10)),("--"===t(this).text().trim()||""===t(this).text().trim())&&(i+=1)}),i===window.cmp_count&&t(".mz-cmp-finish").remove(),t(".mz-cmp-finish").css("min-height",n+"px"),n=0,t(".product-description").each(function(){n=Math.max(n,parseInt(t(this).height(),10))}),t(".product-description").css("min-height",n+"px"),n=0,t(".mz-cmp-p-options-n-extras").each(function(){n=Math.max(n,parseInt(t(this).height(),10))}),t(".mz-cmp-p-options-n-extras").css("min-height",n+"px"),n=0,t(".product-options-extras").each(function(){n=Math.max(n,parseInt(t(this).height(),10))}),t(".product-options-extras").css("min-height",n+"px"),n=0,i=0,t(".mz-presonalize").each(function(){n=Math.max(n,parseInt(t(this).height(),10)),(""===t(this).text().trim()||"--"===t(this).text().trim())&&(i+=1)}),t(".mz-presonalize").css("min-height",n+"px");var r=t(o.el).find("ul[color-swatch-data]").attr("color-swatch-data");if(void 0!==r){var c="/api/commerce/catalog/storefront/products/?filter="+r+"&responseObject=items(content, properties)";e.request("GET",c,{}).then(function(t){x(o.model,t)})}u.writeProductListBoxes(),window.compareProductCount++},removeProduct:function(){var t=f("compareProduct");t=t.replace(this.model.apiModel.data.productCode,""),t=t.replace(",,",","),v("compareProduct",t),window.location.href="/compare"},initialize:function(){var e=this;this.on("render",this.afterRender),this.$("[data-mz-product-option]").each(function(){var o,n,i=t(this);if(i.val())switch(i.attr("type")){case"checkbox":case"radio":o=i.prop("checked"),n=!!i.attr("checked"),(o&&!n||n&&!o)&&e.configure(i);break;default:e.configure(i)}})}});t(document).ready(function(){var e=f("compareProduct");t(window).resize(function(){t(window).width()>1e3?(window.owlCarouselData.destroy(),t(".mz-container-items").removeClass("owl-carousel"),t(".owl-stage-outer").length>0&&t(".mz-cmp-col").unwrap()):h()});var o=setInterval(function(){window.productCodeArray.length===window.compareProductCount&&t(window).width()<=1e3&&(h(),clearInterval(o))},400);if(""!==e){e=e.replace(/(^[,\s]+)|([,\s]+$)/g,"");var n="",i=e.split(",");if(window.productCodeArray=i,t("#mz-cmp-item-count").html(i.length),i.length>0){for(var a=0;a<i.length;a++)z(i[a],a,i.length==a+1?!0:!1),n+=i[a]+";";certona.itemid=n}else t("<h1 class='no-result'>No Product Selected To Compare</h1>").appendTo(".mz-container")}else t("<h1 class='no-result'>No Product Selected To Compare</h1>").appendTo(".mz-container");t(".back-page-btn").click(function(){window.history.back()})})});