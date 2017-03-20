define(['modules/jquery-mozu', 'underscore', 'hyprlive', 'modules/backbone-mozu', "modules/guidedsearch-collections", "modules/api"], function($, _, Hypr, Backbone, CollectionViewFactory,api){
	
	$(document).ready(function(){
		var facetingViews = CollectionViewFactory.createFacetedCollectionViews({
			$body: $('[data-mz-category]'),
			$facets: $('[data-mz-facets]'),
			data: require.mozuData('facetedproducts')
		});
		console.log(window.location);
		api.request('GET','/api/commerce/catalog/storefront/categories/?&pageSize=2000').then(function(res){
      console.log(res);
    });
		window.facetingViews = facetingViews;
		_.invoke(facetingViews,'render');
		//console.log("Initiating lazy load on category.js");
		// $("img.lazy-image").lazyload({
		// 	effect : "fadeIn"
		// });

	});
});

//--------- CORE CODE --------
// define(['modules/jquery-mozu', "modules/views-collections"], function($, CollectionViewFactory) {
//     $(document).ready(function() {
//         window.facetingViews = CollectionViewFactory.createFacetedCollectionViews({
//             $body: $('[data-mz-category]'),
//             template: "category-interior"
//         });
//     });
// });
