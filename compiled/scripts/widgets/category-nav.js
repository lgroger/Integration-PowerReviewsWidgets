require(["modules/jquery-mozu","hyprlive","underscore","modules/api","modules/backbone-mozu"],function(e,t,r,o){e(function(){var t="(",r=e("ul.star-header li.menu-dropdown-icon").length;e("ul.star-header li.menu-dropdown-icon").each(function(e){var o=this.firstElementChild.id,i=o.split("-");t+="categoryId eq "+i[1],r-1>e&&(t+=" or ")}),t+=")";var i="/api/commerce/catalog/storefront/categories/?filter="+t;o.request("GET",i).then(function(t){if(t.items.length>0)for(var r=0;r<t.items.length;r++){var o=t.items[r].content.categoryImages.length;o>0&&e("li.nav-"+t.items[r].categoryId).find(".menu-category-promo-image").html('<a href="/c/'+t.items[r].categoryId+'"><img src="'+t.items[r].content.categoryImages[o-1].imageUrl+'" style="width:100%;height:135px;overflow:hidden;"/></a>')}})})});