require([
    "modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu", 
    "modules/api"], function ($, Hypr, Backbone, api) {
     function loadCategoriesData(filter,num){
        api.request('GET','/api/commerce/catalog/storefront/categories?filter='+filter).then(function(res){
             var categoryData = res.items;
             var result = [];
             if(categoryData.length>0){
                for(var i=0;i<categoryData.length; i++){
                    var cateobj = {};
                    cateobj.categoryId = categoryData[i].categoryId;
                    cateobj.logo = categoryData[i].content.categoryImages[0]?categoryData[i].content.categoryImages[0].imageUrl:'';
                    cateobj.name = categoryData[i].content.name;
                    cateobj.slug = categoryData[i].content.slug;
                    result.push(cateobj);
                }
                 $('#popular_categories-'+num).html(Hypr.getTemplate('modules/popular_categories').render(
                                {model: result}
                    ));
                    $('#popular_categories-'+num+'.brand-lister-product-cat .owl-next, .brand-lister-product-cat .owl-prev').html('');
                                  $('#popular_categories-'+num+'.brand-lister-product-cat').owlCarousel({ 
                                        loop:true,
                                        margin:20,
                                        nav:true,
                                        responsive:{
                                            0:{
                                                items:1
                                            },
                                            600:{
                                                items:2
                                            },
                                            1000:{
                                                items:4
                                            }
                                        }     
                  });   
             }
        });
    }
    $(document).ready(function(){
          var load_data=$("script[id^='data-mz-preload-popular_categories']");
           for(var k=0;k<load_data.length;k++){
            var num =$(load_data[k]).attr("id").substring($(load_data[k]).attr("id").lastIndexOf("_")+1); 
            var dataList =  require.mozuData('popular_categories_'+num);
            var filter = '';
            if(dataList.length>0){
                for (var i = 0; i < dataList.length; i++) {
                    if(i>0){
                        filter+=' or ';
                    }
                    filter+='categoryId eq '+dataList[i];
                }
            }

            loadCategoriesData(filter,num);  
        }
         
    });

});