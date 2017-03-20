/**
 * Can be used on any Backbone.MozuModel that has had the paging mixin in mixins-paging added to it.
 */
define(['modules/jquery-mozu', 'underscore', 'hyprlive', 'modules/backbone-mozu', "modules/models-faceting", "modules/views-productlists", "modules/views-paging"], function($, _, Hypr, Backbone, FacetingModels, ProductListViews, PagingViews) {

    function factory(conf) {
        var views = {},
            model,
            categoryId = conf.$body.data('mz-category'),
            searchQuery = conf.$body.data('mz-search');

        if (searchQuery) {
            model = new FacetingModels.SearchResult(conf.data);
            model.setQuery(searchQuery);
        } else {
            model = new FacetingModels.Category(conf.data);
        }
        if (categoryId) model.setHierarchy('categoryId', categoryId);

        _.extend(views, {
            pagingControls: new PagingViews.PagingControls({
                el: conf.$body.find('[data-mz-pagingcontrols]'),
                model: model
            }),
            pageNumbers: new PagingViews.TopScrollingPageNumbers({
                el: conf.$body.find('[data-mz-pagenumbers]'),
                model: model
            }),
            pageSort: new PagingViews.PageSortView({
                el: conf.$body.find('[data-mz-pagesort]'),
                model: model
            }),
            productList: new ProductListViews.List({
                el: conf.$body.find('[data-mz-productlist]'),
                model: model
            })
        });

        if (conf.$facets.length > 0) {
            views.facetPanel = new ProductListViews.FacetingPanel({
                el: conf.$facets,
                model: model
            });
        }

        Backbone.history.start({ pushState: true, root: window.location.pathname });
        var router = new Backbone.Router();

        var navigating = false;

        model.on('facetchange', function(q) {
            if (!navigating) {
                router.navigate(q);
            }
            navigating = false;
        }, router);

        model.on('change:pageSize', model.updateFacets, model);

        _.invoke(views, 'delegateEvents');

        var defaultPageSize = Hypr.getThemeSetting('defaultPageSize');
        router.route('*all', "filter", function() {
            var urlParams = $.extend({ pageSize: defaultPageSize }, $.deparam()),
                options = {},
                req = model.lastRequest;
            if (!urlParams.startIndex) options.resetIndex = true;
            if (model.hierarchyField && (urlParams[model.hierarchyField] !== model.hierarchyValue)) {
                model.setHierarchy(model.hierarchyField, urlParams[model.hierarchyField] || categoryId);
                options.force = true;
            }
            model.set(_.pick(urlParams, 'pageSize', 'startIndex', 'facetValueFilter', 'sortBy'), { silent: true });
            navigating = true;
            model.updateFacets(options);
        });

        return views;

    }

    return {
        createFacetedCollectionViews: factory
    };

});


//----------- CORE CODE ---------------
/**
 * Unidirectional dispatch-driven collection views, for your pleasure.
 */

// define([
//     'backbone',
//     'underscore',
//     'modules/url-dispatcher',
//     'modules/intent-emitter',
//     'modules/get-partial-view'
// ], function(Backbone, _, UrlDispatcher, IntentEmitter, getPartialView) {

//     function factory(conf) {

//         var _$body = conf.$body;
//         var _dispatcher = UrlDispatcher;
//         var ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND';

//         function updateUi(response) {
//             var url = response.canonicalUrl;
//             _$body.html(response.body);
//             if (url) _dispatcher.replace(url);
//             _$body.removeClass('mz-loading');
//         }

//         function showError(error) {
//             // if (error.message === ROUTE_NOT_FOUND) {
//             //     window.location.href = url;
//             // }
//             _$body.find('[data-mz-messages]').text(error.message);
//         }

//         function intentToUrl(e) {
//             var elm = e.target;
//             var url;
//             if (elm.tagName.toLowerCase() === "select") {
//                 elm = elm.options[elm.selectedIndex];
//             }
//             url = elm.getAttribute('data-mz-url') || elm.getAttribute('href') || '';
//             if (url && url[0] != "/") {
//                 var parser = document.createElement('a');
//                 parser.href = url;
//                 url = window.location.pathname + parser.search;
//             }
//             return url;
//         }

//         var navigationIntents = IntentEmitter(
//             _$body,
//             [
//                 'click [data-mz-pagingcontrols] a',
//                 'click [data-mz-pagenumbers] a',
//                 'click a[data-mz-facet-value]',
//                 'click [data-mz-action="clearFacets"]',
//                 'change input[data-mz-facet-value]',
//                 'change [data-mz-value="pageSize"]',
//                 'change [data-mz-value="sortBy"]'
//             ],
//             intentToUrl
//         );

//         navigationIntents.on('data', function(url, e) {
//             if (url && _dispatcher.send(url)) {
//                 _$body.addClass('mz-loading');
//                 e.preventDefault();
//             }
//         });

//         _dispatcher.onChange(function(url) {
//             getPartialView(url, conf.template).then(updateUi, showError);
//         });

//     }

//     return {
//         createFacetedCollectionViews: factory
//     };

// });
