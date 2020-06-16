// to test jQuery availability
// $ = undefined;
// jQuery = undefined;
function loadScriptSrc(src, onLoadCallback) {
  if(!src) {
    console.warn("ac could not load script without src")
    return;
  }
  var headTag = document.getElementsByTagName("head")[0];
    var jqTag = document.createElement('script');
    jqTag.type = 'application/javascript';
    jqTag.src = src;
    if(onLoadCallback) {
      jqTag.onload = onLoadCallback;
    }
    headTag.appendChild(jqTag);
}

function startAcRecommenderPage() {
  acRecommenderPageInit()
}

// make sure we have only one version of jQuery loaded
let jQueryVersionAC = null
let jQueryCDNUrlAC = 'https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js'
if($ && jQuery && ($.fn.jquery != jQuery.fn.jquery)) {
  console.log("Multiple version of jQuery found. Cleaning up: ", $.fn.jquery, jQuery.fn.jquery)
  jQueryVersionAC = jQuery.fn.jquery
  jQueryCDNUrlAC = `https://ajax.googleapis.com/ajax/libs/jquery/${jQueryVersionAC}/jquery.min.js`
  $ = undefined;
  jQuery = undefined;  
}
// test for cases when jQuery is missing
// $ = undefined;
// jQuery = undefined;
if(!$) {
  if(jQuery) {
    // console.log("there was a jquery for page")
    $ = jQuery;
    startAcRecommenderPage()
  } else {
    console.log("load jQuery again for recommender: ", jQueryCDNUrlAC)
    // loadScriptSrc('https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js', function(){
    // loadScriptSrc('https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js', function(){
    // loadScriptSrc('https://ajax.googleapis.com/ajax/libs/jquery/2.2.3/jquery.min.js', function(){
    loadScriptSrc(jQueryCDNUrlAC, function(){
      console.log("jQuery loaded from CDN for page")
      startAcRecommenderPage()
    });
  }
} else {
  // console.log("there was a $ for page")
  startAcRecommenderPage()
}


function acRecommenderPageInit() {
  /* eslint-disable */
  var ac_siteId = Shopify.shop
  var ac_productId = null
  var ac_pageType
  var ac_currentPage
  var ac_categories = []
  var ac_categoriesProductId = []
  var ac_currency = '$'
  var ac_currencyPosition = 'left'
  var ac_moneyFormat
  if (window.theme && theme.moneyFormat) {
    ac_moneyFormat = theme.moneyFormat
  } else if (window.Theme && Theme.moneyFormat) {
    ac_moneyFormat = Theme.moneyFormat
  } else if (window.moneyFormat) {
    ac_moneyFormat = moneyFormat
  } else if (window.theme && window.theme.strings && window.theme.strings.moneyFormat) {
    ac_moneyFormat = window.theme.strings.moneyFormat
  } else if (window.theme && window.theme.settings && window.theme.settings.moneyFormat) {
    ac_moneyFormat = window.theme.settings.moneyFormat
  } else if (window.Currency && Currency.moneyFormats && window.shopCurrency) {
    ac_moneyFormat = Currency.moneyFormats[shopCurrency].money_with_currency_format
  } else if (ac_currency && ac_currencyPosition) {
    if (ac_currencyPosition === 'right') {
      ac_moneyFormat = '<span class=money>{{ amount }} ' + ac_currency + '</span>'
    } else {
      ac_moneyFormat = '<span class=money>' + ac_currency + ' {{ amount }}</span>'
    }
  } else {
    ac_moneyFormat = '<span class=money>{{ amount }}</span>'
  }
  if (!ac_moneyFormat.match(/<span\s*class=['"]?money['"]?>/i)) {
    ac_moneyFormat = '<span class=money>' + ac_moneyFormat + '</span>'
  }

  function getPageType() {
    var pageType = null

    try {
      pageType = ShopifyAnalytics.meta.page.pageType
      if(!pageType) throw new Error("ShopifyAnalytics.meta.page.pageType is empty: " + pageType )
      return pageType
    } catch(e) {
      console.info(e)
      console.info("Fallback logic initiated")
    }
    // theme editor complient
    var path = window.location.pathname
    if(path.indexOf("/editor") > -1){
      console.log("We are in editor mode")
    }

    if(path.indexOf("/products/") > -1) {
      pageType = "product"
    } 
    else if(path.indexOf("/cart") > -1) {
      pageType = "cart"
    }
    else if(path.indexOf("/collection") > -1) {
      pageType = "collection"
    }
    else if (path === '/' || (path.indexOf("/editor") > -1) && (path.indexOf("/editor#/") == -1)) {
      pageType = "home"
    } else {
      pageType = "other"
    }

    console.log("page type = " + pageType)

    return pageType
  }

  var pageType = getPageType()
  if ($('#shopify-section-product-template').length === 1 || pageType === 'product') {
    // this works both on frontend and admin theme editor
    ac_productId = $('#ProductJson-product-template').length
      ? String(JSON.parse($('#ProductJson-product-template').html()).id)
      : ( (meta && meta.page)
        ? meta.page.resourceId
        : 0
      )
    ac_pageType = 'product'
    ac_currentPage = 'product'
  } else if (pageType === 'cart') {
    ac_pageType = 'other'
    ac_currentPage = 'cart'
  } else if (window.location.pathname === '/' || pageType === 'home') {
    ac_pageType = 'home'
    ac_currentPage = 'home'
  }

  var orcinusUserId = 0;
  var ac_matchKey = document.cookie.match(new RegExp('OrcinusTracker=([^;]+)'));
  if (ac_matchKey) {
    orcinusUserId = ac_matchKey[1];
  }

  // TODO - seperate to 3 arrays for product, cart and home page
  var ac_position = [ '#ur-custom-widget', '#shopify-section-product-template', '#page-content', '#main', '#pageContent', 'main .content-wrapper', 'main>div.wrapper', 'main', 'main#main-content', 'main.main-content', '#content', '#main-wrap', '#MainContent', 'footer', '#footer', '.footer', '#pagefooter']

  if (ac_currentPage === 'product') {

    $.get('https://rec.autocommerce.io/get_product_page_recommendation',{
      shopName: ac_siteId,
      productId: ac_productId,
      pageType: ac_pageType,
      isDebug: '0',
      moneyFormat: ac_moneyFormat
    })
    .done(function(d) {
      let customPlacement = []
      customPlacement = ac_position
      customPlacement.unshift('')
      customPlacement = customPlacement.concat(ac_position)
      customPlacement.every( function (e) {
        if($(e).length === 1) {
          $(e).append(d)
          return false
        } else {
          return true
        }
      })
    })

  } else if (ac_currentPage === 'cart') {
    if (document.readyState === 'complete') {
      cartPageTrigger()
    } else {
      $(document).ready(function() {
        cartPageTrigger()
      })
    }
  } else if (ac_currentPage === 'home') {
    $(document).ready(function() {
      $.get('https://rec.autocommerce.io/get_home_page_recommendation',{
        shopName: ac_siteId,
        orcinusUserId: orcinusUserId,
        pageType: ac_pageType,
        isDebug: '0',
        moneyFormat: ac_moneyFormat
      })
      .done(function(d) {
        let customPlacement = []
        customPlacement = ac_position
        customPlacement.unshift('')
        customPlacement = customPlacement.concat(ac_position)
        customPlacement.every( function (e) {
          if($(e).length === 1) {
            $(e).append(d)
            return false
          } else {
            return true
          }
        })
      })
      }
    )
  }

  var parseSerializesDetails = function parse_query_string(query) {
    var vars = query.split("&");
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      // If first entry with this name
      if (typeof query_string[pair[0]] === "undefined") {
        query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
      } else if (typeof query_string[pair[0]] === "string") {
        var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
        query_string[pair[0]] = arr;
        // If third or later entry with this name
      } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]));
      }
    }
    if (query_string.quantity === undefined) {
      return {
        quantity: '1',
        id: query_string.id
      }
    } else if ( Array.isArray(query_string.quantity) === true && Array.isArray(query_string.id) === true){
        return {
          quantity: query_string.quantity[0],
          id: query_string.id[0]
        }
    } else {
      return {
        quantity: query_string.quantity,
        id: query_string.id
      }
    }
  }

  function cartPageTrigger() {
    $.getJSON('/cart.js', function (cart) {
      $.each(cart.items, function (i, item) {
        ac_categories.push(item.id)
        ac_categoriesProductId.push(item.product_id)
      })
      $.get('https://rec.autocommerce.io/get_cart_page_recommendation',{
        shopName: ac_siteId,
        categories: JSON.stringify(ac_categories),
        categoriesProductId: JSON.stringify(ac_categoriesProductId),
        pageType: 'cart',
        isDebug: '0',
        moneyFormat: ac_moneyFormat
      })
      .done(function(d) {
        let customPlacement = []
        customPlacement = ac_position
        customPlacement.unshift('')
        customPlacement = customPlacement.concat(ac_position)
        customPlacement.every( function (e) {
          if($(e).length >= 1) {
            $($(e)[0]).append(d)
            return false
          } else {
            return true
          }
        })
      })
    })
  }
}