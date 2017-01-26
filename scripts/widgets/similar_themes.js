require([
    "modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu", 
    "modules/api"], function ($, Hypr, Backbone, api) {
	 

    $(document).ready(function(){
           
            var data =  require.mozuData('similar_themes');
            loadData();
            var dt = setInterval(function () {
                if(typeof  require.mozuData('similar_themes') != 'undefined')
                {
                    if( data.length !=  require.mozuData('similar_themes').length){
                        data =  require.mozuData('similar_themes');
                        loadData();
                    }else{
                        var tempData = require.mozuData('similar_themes');
                        var stopLoop = true;
                        $(data).each(function(index,id){
                            if(id != tempData[index] && stopLoop){
                                data =  require.mozuData('similar_themes');
                                loadData();
                                stopLoop = false;
                            }
                        });
                    }    
                }
            }, 1000);
           
            
            
            
            function loadData(){
                var length = data.length;
                var arrayOfData = [], result = [];
                var i = 0;          
                $(data).each(function(index,catId){ 
                    var categorydetailsurl = '/api/commerce/catalog/storefront/categories/'+catId+'?allowInactive=true';    
                    api.request('GET',categorydetailsurl).then(function(dataretrived){
                        /*api.request('GET',"/api/commerce/catalog/storefront/productsearch/search/?startIndex=0&pageSize=200&filter=categoryId+eq+"+catId).then(function(dataretrived1){
                            dataretrived1.totalCount
                        });*/

                        dataretrived.content.categoryId =dataretrived.categoryId;
                        if(dataretrived.content.categoryImages[0])dataretrived.content.logo = dataretrived.content.categoryImages[0].imageUrl; 
                        
                        arrayOfData[i++] = dataretrived.content;   
                        
                        if(arrayOfData.length == length){
                        
                            data.forEach(function(key) {
                            var found = false;
                                arrayOfData = arrayOfData.filter(function(item) {   
                                    if(!found && item.categoryId == key) {
                                        result.push(item);
                                        found = true;
                                        return false;
                                    } else 
                                        return true;
                                });
                            }); 
                            $('#similar_themes').empty();            
                            $('#similar_themes').append(Hypr.getTemplate('modules/similar-themes-widgets').render(
                                {model: result}
                            ));

                                if($('.brand-lister-similar-cat').find("img").length > 1){                                  
                                    $('.brand-lister-similar-cat .owl-next, .brand-lister-similar-cat .owl-prev').html('');
                                   $('.brand-lister-similar-cat').owlCarousel({ 
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
                                                items:5
                                            }
                                        }     
                                    });
                                }
                        }                        
                    },function(dataError){ 
                        
                    });
                });
           
            }
         
    });

});

















