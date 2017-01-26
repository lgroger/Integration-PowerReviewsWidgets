require([
	"modules/jquery-mozu",
	'hyprlive',
	'underscore',
	"modules/api", 
	"modules/backbone-mozu"
	],function($, Hypr, _, api, Backbone){
		$(function(){
			var str = '('; 
			var menu_len = $('ul.star-header li.menu-dropdown-icon').length;
			$('ul.star-header li.menu-dropdown-icon').each(function(i,val){
				var id = this.firstElementChild.id;
				var id_arr = id.split('-');
				str += 'categoryId eq '+id_arr[1];
				if(i < menu_len-1)
				{
					str += ' or ';
				}
			});	
			str += ')';
			var url = '/api/commerce/catalog/storefront/categories/?filter='+str;
			api.request('GET',url).then(function(res){
				
				if(res.items.length>0){
					for(var i=0;i<res.items.length;i++){
						var last_image = res.items[i].content.categoryImages.length;

						if(last_image>0){
						   $('li.nav-'+res.items[i].categoryId).find('.menu-category-promo-image').html('<a href="/c/'+res.items[i].categoryId+'"><img src="'+res.items[i].content.categoryImages[last_image-1].imageUrl+'" style="width:100%;height:135px;overflow:hidden;"/></a>');
					    } 
					}
				} 
			});
		});
});