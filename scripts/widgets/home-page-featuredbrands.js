require([
    "modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu", 
    "modules/api"], function ($, Hypr, Backbone, api) {
     function loadCategoriesData(filter,idNum){
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
                console.log( "Len "+$('#home_featured_categories-'+idNum+'.brand-lister').find("img").length);
                $('#home_featured_categories-'+idNum).html(Hypr.getTemplate('modules/homepage-brands-listing').render(
                                {model: result}
                 ));

                     /*   if($('#home_featured_categories-'+idNum+'.brand-lister').find("img").length > 1){ 
                            
                            $('#home_featured_categories-'+idNum+'.brand-lister').owlCarousel({ 
                                items : 4,
                                itemsCustom:      [[0, 2], [480,2], [700, 2], [1000, 4]],
                                nav: true,
                                rewindNav: false  ,
                                dots:false       
                            });
                        } */  
             }
        });
    }

    $(document).ready(function(){
           var load_data=$("script[id^='data-mz-preload-home_featured_categories']");
           for(var k=0;k<load_data.length;k++){
              var num =$(load_data[k]).attr("id").substring($(load_data[k]).attr("id").lastIndexOf("_")+1); 
                var dataList =  require.mozuData('home_featured_categories_'+num);
                console.log("dataList");
                console.log(dataList);
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
             // console.log(num);
            }
                       
    });

});