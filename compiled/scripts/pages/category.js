define("pages/category",["modules/jquery-mozu","modules/views-collections","modules/models-faceting"],function(e,o){e(document).ready(function(){window.facetingViews=o.createFacetedCollectionViews({$body:e("[data-mz-category]"),template:"category-interior"})})});