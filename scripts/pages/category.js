define(['modules/jquery-mozu', "modules/views-collections", 'modules/models-faceting'], function($, CollectionViewFactory, facetingProducts) {
    $(document).ready(function() {
 		window.facetingViews = CollectionViewFactory.createFacetedCollectionViews({
            $body: $('[data-mz-category]'),
            template: "category-interior"
        });
    });
});