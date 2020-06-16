(function (algolia) {
  'use strict';

  algolia.translations = {
    search: "Busqueda actual",
    noCollectionFound: "Sin categorias encontradas",
    allProducts: "Ver todos los productos",
    matching: "que concuerdan con",
    sortBy: "Ordenar por",
    relevance: "Relevancia",
    outOf: "fuera de",
    resultsFound: "resultados encontrados",
    oneResultFound: "1 resultado encontrado",
    noResultFound: "Sin resultados encontrados",
    addToCart: "Agregar al carrito",
    searchForProduct: "Buscar productos",
    selectedFilter: "Filtros seleccionados",
    clearAll: "Limpiar",
    noPageFound: "No se encontraron paginas",
    outOfStock: "No disponible",
  };

  algolia.translation_helpers = {
    no_result_for: function (text, render) {
      return 'No hay resultados para la consulta ' + render(text) + '';
    },
    in: function (text, render) {
      return 'en ' + render(text) + 's';
    },

    try_clear_or_change_input: function (text, render) {
      var regex = new RegExp(/<\/a>|<a[a-z "-=]*>/, 'g');
      var html_tags = text.match(regex);
      return 'Intenta ' + render(html_tags[0]) + ' limpiar los filtros ' + render(html_tags[1]) + ' o ' + render(html_tags[2]) + ' cambiar la busqueda ' + render(html_tags[3]) + '';
    },
    outOf: function (text, render) {
      return '' + render(text) + ' fuera de';
    },

    by: function (text, render) {
      return 'por ' + render(text) + '';
    }
  };

}(algoliaShopify));
