(function (algolia, instantsearch) {

  var collectionFacetConstraint = !!algolia.is_collection_results_page &&
    !!algolia.config.instant_search_enabled_on_collection;


  if (
      (!algolia.full_results && !collectionFacetConstraint) || !algolia.config.instant_search_enabled
    ) {
    return;
  }

  var _ = algolia._,
      $ = algolia.jQuery;

  var collectionFacetValue = null;
  if (collectionFacetConstraint) {
    var matches = window.location.pathname.match(/\/collections\/([^/]+)/i);
    if (!!matches && matches.length === 2) {
      collectionFacetValue = matches[1];
    }
  }

  algolia.config.results_selector += ', .algolia-shopify-instantsearch';

  var $hiding = $('<style>' + algolia.config.results_selector + ' { visibility: hidden }</style>');
  $hiding.appendTo($('head'));

  var instant = algolia.instantsearch = {
    colors: algolia.config.colors,
    distinct: !!algolia.config.show_products,
    facets: {
      hidden: algolia.hiddenFacets,
      shown: algolia.shownFacets,
      list: algolia.facets,
      widgets: algolia.facetsWidgets
    },
    hitsPerPage: algolia.config.products_full_results_hits_per_page,
    poweredBy: algolia.config.powered_by,
    search: instantsearch({
      appId: algolia.config.app_id,
      apiKey: algolia.config.search_api_key,
      indexName: '' + algolia.config.index_prefix + 'products',
      searchParameters: {
       clickAnalytics: true
      },
      urlSync: {},
      searchFunction: function (searchFunctionHelper) {
        // Set query parameters here because they're not kept when someone
        // presses the Back button if set in the `init` function of a custom widget
        var helper = instant.search.helper;
        var page = helper.getPage();
        helper.setQueryParameter('highlightPreTag', '<span class="ais-highlight">');
        helper.setQueryParameter('highlightPostTag', '</span>');
        if (instant.distinct) {
          helper.setQueryParameter('distinct', true);
        }
        if (!!collectionFacetConstraint && !!collectionFacetValue) {
          helper.setQueryParameter('filters', 'collections:"' + collectionFacetValue + '"');
        }
        helper.setPage(page);
        searchFunctionHelper.search();
      }
    }),
    selector: algolia.config.results_selector + ', .algolia-shopify-instantsearch',
    sortOrders: algolia.sortOrders,
    storeName: algolia.storeName,
    templates: {
      currentItem: algolia.getTemplate('instant_search_current_refined_values_item'),
      empty: algolia.getTemplate('instant_search_no_result'),
      page: algolia.compileTemplate('instant_search'),
      product: algolia.getTemplate('instant_search_product'),
      stats: algolia.getTemplate('instant_search_stats'),
      style: algolia.compileTemplate('instant_search.css')
    }
  };

  if (instant.poweredBy) {
    console.log('Algolia: Instant-Search');
  }

  function readjust() {
    var width = instant.$results.outerWidth();

    var suffix = 'lg';
    if (width < 400) suffix = 'xs';
    else if (width < 800) suffix = 'sm';
    else if (width < 1200) suffix = 'md';

    instant.$results
      .removeClass('ais-results-size-xs')
      .removeClass('ais-results-size-sm')
      .removeClass('ais-results-size-md')
      .removeClass('ais-results-size-lg')
      .addClass('ais-results-size-' + suffix);
  }

  // Bind helpers
  _.forEach(Object.assign({}, algolia.helpers, algolia.translation_helpers), function (helper, name) {
    instant.search.templatesConfig.helpers[name] = helper;
  });
  instant.search.templatesConfig.compileOptions = algolia.hoganOptions;

  algolia.appendStyle(algolia.render(instant.templates.style, {
    distinct: instant.distinct,
    colors: instant.colors
  }));

  $(document).ready(function () {

    if ($(algoliaShopify.config.results_selector).length == 0) {
      throw new Error('Instant search CSS selector is incorrect\nFore more info see : https://community.algolia.com/shopify/css_selector.html#algolia-search');
    }

    instant.$results = $(instant.selector);

    instant.$results.html(algolia.render(instant.templates.page, {
      facets: instant.facets.list,
      storeName: instant.storeName,
      translations: algolia.translations
    }));

    readjust();

    $(window).resize(function () {
      readjust();
    });

    // Mobile facets display
    instant.search.addWidget({
      init: function (opts) {
        var $button = $('.ais-facets-button');
        $button.on('click', function () {
          var $facets = $('.ais-facets');

          if ($facets.hasClass('ais-facets__shown')) {
            $button.text('Show filters');
            $facets.removeClass('ais-facets__shown');
          } else {
            $button.text('Hide filters');
            $facets.addClass('ais-facets__shown');
          }
        });
      }
    });

    // Search input
    instant.search.addWidget(
      instantsearch.widgets.searchBox({
        container: '.ais-search-box-container',
        placeholder: algolia.translations.searchForProduct,
        poweredBy: false
      })
    );

    // Logo & clear
    instant.search.addWidget({
      init: function (opts) {
        if (!instant.poweredBy) {
          $('.ais-algolia-icon').hide();
        }
        $('.ais-clear-input-icon').on('click', function () {
          opts.helper.setQuery('').search();
          $('.ais-search-box--input').val('').focus();
        });
      },
      render: function (opts) {
        if (!opts.state.query) {
          if (instant.poweredBy) {
            $('.ais-algolia-icon').show();
          }
          $('.ais-clear-input-icon').hide();
        } else {
          $('.ais-clear-input-icon').show();
          $('.ais-algolia-icon').hide();
        }
      }
    });

    // Stats
    instant.search.addWidget(
      instantsearch.widgets.stats({
        container: '.ais-stats-container',
        templates: {
          body: instant.templates.stats,
        },
        transformData: {
          body: function (data) {
            data.processingTimeS = data.processingTimeMS / 1000;
            data.start = data.page * data.hitsPerPage + 1;
            data.end = Math.min((data.page + 1) * data.hitsPerPage, data.nbHits);
            data.translations = algolia.translations;
            return data;
          }
        }
      })
    );

    // Sort orders
    instant.search.addWidget(
      instantsearch.widgets.sortBySelector({
        container: '.ais-sort-orders-container',
        indices: instant.sortOrders
      })
    );

    // Change display
    instant.search.addWidget({
      init: function (opts) {
        $('.ais-search-header').on('click', '.ais-change-display-block', function () {
          $('.ais-change-display-block:not(.ais-change-display-selected)').addClass('ais-change-display-selected');
          $('.ais-change-display-list.ais-change-display-selected').removeClass('ais-change-display-selected');
          $('.ais-results-as-list').removeClass('ais-results-as-list').addClass('ais-results-as-block');
        });
        $('.ais-search-header').on('click', '.ais-change-display-list', function () {
          $('.ais-change-display-list:not(.ais-change-display-selected)').addClass('ais-change-display-selected');
          $('.ais-change-display-block.ais-change-display-selected').removeClass('ais-change-display-selected');
          $('.ais-results-as-block').removeClass('ais-results-as-block').addClass('ais-results-as-list');
        });
      }
    });

    // Hidden facets
    var list = _.map(instant.facets.hidden, function (facet) { return facet.name; });
    instant.search.addWidget({
      getConfiguration: function () {
        return {
          facets: list,
          disjunctiveFacets: list
        };
      },
      init: function () {}
    });

    // Current refined values
    var attributes = _.map(instant.facets.shown, function (facet) {
      return {
        name: facet.name,
        label: facet.title
      }
    });
    instant.search.addWidget(
      instantsearch.widgets.currentRefinedValues({
        container: '.ais-current-refined-values-container',
        cssClasses: {
          root: 'ais-facet',
          header: 'ais-facet--header',
          body: 'ais-facet--body'
        },
        templates: {
          header: algolia.translations.selectedFilter,
          item: instant.templates.currentItem,
          clearAll: algolia.translations.clearAll
        },
        onlyListedAttributes: true,
        attributes: attributes
      })
    );

    // Facets
    _.forEach(instant.facets.widgets, function (widget) {
      instant.search.addWidget(instantsearch.widgets[widget.name](widget.params));
    });

    // Hits
    instant.search.addWidget(
      instantsearch.widgets.hits({
        container: '.ais-hits-container',
        hitsPerPage: instant.hitsPerPage,
        templates: {
          empty: instant.templates.empty,
          item: instant.templates.product
        },
        transformData: {
          item: function (product) {
            product._distinct = instant.distinct;
            product.can_order = (
              product.inventory_management !== 'shopify' ||
              product.inventory_policy === 'continue' ||
              product.inventory_quantity > 0
            );
            product.translations = algolia.translations;
            product.queryID = instant.search.helper.lastResults._rawResults[0].queryID;
            product.productPosition = product.__hitIndex + 1;
            return product;
          },
          empty: function (params) {
            params.translations = algolia.translations;
            return params;
          }
        }
      })
    );

    // Redirect to product on click
    instant.search.addWidget({
      init: function (opts) {
        $('.ais-hits-container').on('click', '.ais-hit', function (e) {
          var $this = $(this),
              handle = $this.attr('data-handle'),
              variant_id = $this.attr('data-variant-id')
              distinct = $this.attr('data-distinct');

          var link = '/products/' + handle;
          if (distinct !== 'true') {
            link += '?variant=' + variant_id;
          }
          if (algolia.config.analytics_enabled) {
            algolia.clickTracker(e);
          }
          window.location.href = link;
        });
        $('.ais-hits-container').on('click', '.ais-hit a', function (e) {
          e.stopPropagation();
          if (algolia.config.analytics_enabled) {
            algolia.clickTracker(e);
          }
        });
      }
    });

    // Add to cart
    instant.search.addWidget({
      init: function (opts) {
        $('.ais-hits-container').on('click', '.ais-hit--cart-button', function (e) {
          e.stopPropagation();
          var $this = $(this),
              formId = $this.attr('data-form-id');

          if (formId) {
            document.getElementById(formId).submit();
          }
        });
      }
    });

    // No result actions
    instant.search.addWidget({
      init: function (opts) {
        $('.ais-hits-container').on('click', '.ais-hit-empty--clear-filters', function () {
          var helper = opts.helper;
          helper.clearTags();
          _.forEach(instant.facets.list, function (facet) {
            helper.clearRefinements(facet.name);
          });
          helper.search();
        });

        $('.ais-hits-container').on('click', '.ais-hit-empty--clear-input', function () {
          opts.helper.setQuery('').search();
          $('.ais-search-box--input').val('').focus();
        });
      }
    });

    
    // Hide out-stock products from resulsts
    instant.search.addWidget({
  // getConfiguration: only needed if you're not already displaying tags in the front-end
  getConfiguration: function () {
    return {
      facets: ['Inventory'] // In case you're not using a price facet in the sidebar
    };
  },
  init: function (opts) {
    var helper = opts.helper;
    var page = helper.getPage();
    helper.addNumericRefinement('inventory_quantity', '!=', 0);
    helper.setPage(page);
  }
})
    //finish hide out-stock
    
    
    
    
    instant.search.addWidget({
  // getConfiguration: only needed if you're not already displaying tags in the front-end
  getConfiguration: function () {
    return {
      facets: ['price'] // In case you're not using a price facet in the sidebar
    };
  },
  init: function (opts) {
    var helper = opts.helper;
    var page = helper.getPage();
    helper.addNumericRefinement('price', '!=', 0.01);
    helper.setPage(page);
  }
})
    
    
    
    
    // Pagination
    instant.search.addWidget(
      instantsearch.widgets.pagination({
        container: '.ais-pagination-container',
        padding: 2,
        maxPages: 20
      })
    );

    // Main
    instant.search.start();

    $hiding.remove();
  });
}(algoliaShopify, instantsearch));
