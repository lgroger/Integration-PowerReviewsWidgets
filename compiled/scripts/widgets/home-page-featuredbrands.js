require(["modules/jquery-mozu","hyprlive","modules/backbone-mozu","modules/api"],function(e,t,o,r){function a(o,a){r.request("GET","/api/commerce/catalog/storefront/categories?filter="+o).then(function(o){var r=o.items,n=[];if(r.length>0){for(var g=0;g<r.length;g++){var i={};i.categoryId=r[g].categoryId,i.logo=r[g].content.categoryImages[0]?r[g].content.categoryImages[0].imageUrl:"",i.name=r[g].content.name,i.slug=r[g].content.slug,n.push(i)}console.log("Len "+e("#home_featured_categories-"+a+".brand-lister").find("img").length),e("#home_featured_categories-"+a).html(t.getTemplate("modules/homepage-brands-listing").render({model:n}))}})}e(document).ready(function(){for(var t=e("script[id^='data-mz-preload-home_featured_categories']"),o=0;o<t.length;o++){var r=e(t[o]).attr("id").substring(e(t[o]).attr("id").lastIndexOf("_")+1),n=require.mozuData("home_featured_categories_"+r);console.log("dataList"),console.log(n);var g="";if(n.length>0)for(var i=0;i<n.length;i++)i>0&&(g+=" or "),g+="categoryId eq "+n[i];a(g,r)}})});