(function () {
  'use strict';

  var GoogleEvent = /** @class */ (function () {
      function GoogleEvent(params) {
          this.send_to = params.conversionId;
          this.dynx_itemid = params.itemIds;
          this.dynx_pagetype = params.pageType;
          this.dynx_totalvalue = params.totalValue;
          this.value = params.value;
          this.transaction_id = params.transactionId;
          this.currency = params.currency;
      }
      return GoogleEvent;
  }());

  var EEventType;
  (function (EEventType) {
      EEventType[EEventType["PRODUCT_VIEW"] = 0] = "PRODUCT_VIEW";
      EEventType[EEventType["ADD_TO_CART"] = 1] = "ADD_TO_CART";
      EEventType[EEventType["PURCHASE"] = 2] = "PURCHASE";
  })(EEventType || (EEventType = {}));
  var EventTypeData = /** @class */ (function () {
      function EventTypeData(googleEventName, facebookEventName) {
          this.googleEventName = googleEventName;
          this.facebookEventName = facebookEventName;
      }
      return EventTypeData;
  }());
  var EVENT_TYPES = new Map([
      [EEventType.PRODUCT_VIEW, new EventTypeData("page_view", "ViewContent")],
      [EEventType.ADD_TO_CART, new EventTypeData("add_to_cart", "AddToCart")],
      [EEventType.PURCHASE, new EventTypeData("purchase", "Purchase")]
  ]);
  function getEventTypeData(eventType) {
      var eventTypeData = EVENT_TYPES.get(eventType);
      if (!eventTypeData) {
          throw new Error("Event Type data not found. EventType: " + eventType);
      }
      return eventTypeData;
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  var __assign = function() {
      __assign = Object.assign || function __assign(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };

  function __read(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      }
      catch (error) { e = { error: error }; }
      finally {
          try {
              if (r && !r.done && (m = i["return"])) m.call(i);
          }
          finally { if (e) throw e.error; }
      }
      return ar;
  }

  function __spread() {
      for (var ar = [], i = 0; i < arguments.length; i++)
          ar = ar.concat(__read(arguments[i]));
      return ar;
  }

  if (window.RhEasyGlobalState === undefined) {
      window.RhEasyGlobalState = {
          fbPixelInserted: false,
          gTagInserted: false
      };
  }
  var RhEasyShopify = window.RhEasy;
  var ShopifyObject = window.Shopify;
  var RhEasyGlobalState = window.RhEasyGlobalState;

  function trackGoogleEvent(googleEvent, eventType, conversionTrackerId) {
      if (RhEasyGlobalState.gTagInserted) {
          if (eventType === EEventType.PURCHASE) {
              trackGoogleConversion(conversionTrackerId);
          }
          trackCommonEvent(googleEvent, eventType);
          return;
      }
      var newNode = document.createElement("script");
      newNode.type = "text/javascript";
      newNode.src = "https://www.googletagmanager.com/gtag/js?id=AW-" + conversionTrackerId;
      newNode.addEventListener("load", function () {
          if (!RhEasyGlobalState.gTagInserted) {
              trackGoogleConversion(conversionTrackerId);
              RhEasyGlobalState.gTagInserted = true;
          }
          else if (eventType === EEventType.PURCHASE) {
              // always load config with conversion label for purchase event
              trackGoogleConversion(conversionTrackerId);
          }
          trackCommonEvent(googleEvent, eventType);
      });
      var existingNode = document.getElementsByTagName("script")[0];
      if (existingNode !== null && existingNode.parentNode !== null) {
          existingNode.parentNode.insertBefore(newNode, existingNode);
      }
  }
  function pushGTagArguments() {
      var _ = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          _[_i] = arguments[_i];
      }
      // @ts-ignore
      window.dataLayer.push(arguments);
  }
  function trackGoogleConversion(conversionTrackerId) {
      // @ts-ignore
      window.dataLayer = window.dataLayer || [];
      pushGTagArguments("js", new Date());
      pushGTagArguments("config", "AW-" + conversionTrackerId);
  }
  function trackCommonEvent(googleEvent, eventType) {
      var eventTypeData = getEventTypeData(eventType);
      pushGTagArguments("event", eventTypeData.googleEventName, __assign({}, googleEvent));
  }

  var EGooglePageType;
  (function (EGooglePageType) {
      EGooglePageType["ADD_TO_CART"] = "conversionintent";
      EGooglePageType["VIEW_CONTENT"] = "offerdetail";
      EGooglePageType["PURCHASE"] = "conversion";
  })(EGooglePageType || (EGooglePageType = {}));

  function buildProductIdWithVariantId(shopifyProduct) {
      if (shopifyProduct.variantId) {
          return "shopify_" + shopifyProduct.productId + "_" + shopifyProduct.variantId;
      }
      else {
          return "shopify_" + shopifyProduct.productId;
      }
  }
  function getUniqueProductIdsWithVariantIds(shopifyProducts) {
      return __spread(new Set(shopifyProducts.map(function (shopifyProduct) { return buildProductIdWithVariantId(shopifyProduct); })));
  }

  function trackShopifyViewContentGoogle(shopifyProduct, conversionsTrackerId) {
      var googleEvent = new GoogleEvent({
          conversionId: "AW-" + conversionsTrackerId,
          itemIds: [buildProductIdWithVariantId(shopifyProduct)],
          pageType: EGooglePageType.VIEW_CONTENT
      });
      trackGoogleEvent(googleEvent, EEventType.PRODUCT_VIEW, conversionsTrackerId);
  }
  function trackShopifyAddToCartGoogle(shopifyCart, conversionsTrackerId) {
      var googleEvent = new GoogleEvent({
          conversionId: "AW-" + conversionsTrackerId,
          itemIds: getUniqueProductIdsWithVariantIds(shopifyCart.items),
          pageType: EGooglePageType.ADD_TO_CART
      });
      trackGoogleEvent(googleEvent, EEventType.ADD_TO_CART, conversionsTrackerId);
  }
  function trackShopifyAddSingleProductToCartGoogle(shopifyproduct, conversionsTrackerId) {
      var googleEvent = new GoogleEvent({
          conversionId: "AW-" + conversionsTrackerId,
          itemIds: [buildProductIdWithVariantId(shopifyproduct)],
          pageType: EGooglePageType.ADD_TO_CART
      });
      trackGoogleEvent(googleEvent, EEventType.ADD_TO_CART, conversionsTrackerId);
  }
  function trackShopifyPurchaseGoogle(order, conversionsTrackerId, conversionLabel) {
      var googleEvent = new GoogleEvent({
          conversionId: "AW-" + conversionsTrackerId + "/" + conversionLabel,
          itemIds: getUniqueProductIdsWithVariantIds(order.items),
          pageType: EGooglePageType.PURCHASE,
          totalValue: order.totalPrice,
          value: order.totalPrice,
          currency: order.currency,
          transactionId: order.orderId
      });
      trackGoogleEvent(googleEvent, EEventType.PURCHASE, conversionsTrackerId);
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var objstorage = createCommonjsModule(function (module) {
  //
  // Default storage lookups, and clean object to prevent override of build-in
  // properties.
  //
  var has = Object.prototype.hasOwnProperty;
  var storage = {};
  var clean = {};

  /**
   * Calculate the lenght of the storage object.
   *
   * @returns {Number} Lenght
   * @private
   */
  function length() {
    var result = 0;

    for (var key in storage) result++;

    return result;
  }

  /**
   * objStorage is sessionStorage/localStorage backed by an plain Object.
   *
   * @type {Object}
   * @public
   */
  var objStorage = module.exports = {
    /**
     * The total number items stored in the storage.
     *
     * @type {Number}
     * @public
     */
    length: length(),

    /**
     * Find an item in the storage.
     *
     * @param {String} key Name of the value we lookup.
     * @returns {String|Null} Found item or null.
     * @public
     */
    getItem: function getItem(key) {
      if (has.call(storage, key)) return storage[key];
      return null;
    },

    /**
     * Add a new item in the storage.
     *
     * @param {String} key Name under which we store the value.
     * @param {String} value Value for the key.
     * @returns {Undefined}
     * @public
     */
    setItem: function setItem(key, value) {
      if (!(key in clean)) {
        storage[key] = value;
      }

      objStorage.length = length();
    },

    /**
     * Remove a single item from the storage.
     *
     * @param {String} key Name of the value we need to remove.
     * @returns {Undefined} Stuff.
     * @pubilc
     */
    removeItem: function removeItem(key) {
      delete storage[key];

      objStorage.length = length();
    },

    /**
     * Completely remove all items from the store.
     *
     * @returns {Undefined}
     * @public
     */
    clear: function clear() {
      storage = {};
      objStorage.length = 0;
    },

    /**
     * Is this storage system supported in the current environment.
     *
     * @type {Boolean}
     * @public
     */
     supported: true
  };
  });
  var objstorage_1 = objstorage.length;
  var objstorage_2 = objstorage.getItem;
  var objstorage_3 = objstorage.setItem;
  var objstorage_4 = objstorage.removeItem;
  var objstorage_5 = objstorage.clear;
  var objstorage_6 = objstorage.supported;

  var has = Object.prototype.hasOwnProperty;

  /**
   * Simple query string parser.
   *
   * @param {String} query The query string that needs to be parsed.
   * @returns {Object}
   * @api public
   */
  function querystring(query) {
    var parser = /([^=?&]+)=?([^&]*)/g
      , result = {}
      , part;

    //
    // Little nifty parsing hack, leverage the fact that RegExp.exec increments
    // the lastIndex property so we can continue executing this loop until we've
    // parsed all results.
    //
    for (;
      part = parser.exec(query);
      result[decodeURIComponent(part[1])] = decodeURIComponent(part[2])
    );

    return result;
  }

  /**
   * Transform a query string to an object.
   *
   * @param {Object} obj Object that should be transformed.
   * @param {String} prefix Optional prefix.
   * @returns {String}
   * @api public
   */
  function querystringify(obj, prefix) {
    prefix = prefix || '';

    var pairs = [];

    //
    // Optionally prefix with a '?' if needed
    //
    if ('string' !== typeof prefix) prefix = '?';

    for (var key in obj) {
      if (has.call(obj, key)) {
        pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
      }
    }

    return pairs.length ? prefix + pairs.join('&') : '';
  }

  //
  // Expose the module.
  //
  var stringify = querystringify;
  var parse = querystring;

  var querystringify_1 = {
  	stringify: stringify,
  	parse: parse
  };

  var window_name = createCommonjsModule(function (module) {

  var has = Object.prototype.hasOwnProperty
    , storage = {}
    , prefix = '§';

  /**
   * Refresh the storage as other users might also be writing against it.
   *
   * @api private
   */
  function update() {
    if (!windowStorage.supported) return;

    var data = window.name
      , length = 0
      , key;

    storage = data.charAt(0) === prefix
      ? querystringify_1.parse(data.slice(1))
      : {};

    for (key in storage) {
      if (has.call(storage, key)) length++;
    }

    windowStorage.length = length;
  }

  /**
   * A DOM storage wrapper which abuses the window.name property to temporarily
   * store values in the browser.
   *
   * @type {Object}
   * @public
   */
  var windowStorage = module.exports = {
    /**
     * The total number items stored in the storage.
     *
     * @type {Number}
     * @public
     */
    length: 0,

    /**
     * Find an item in the storage.
     *
     * @param {String} key Name of the value we lookup.
     * @returns {String|Null} Found item or null.
     * @api public
     */
    getItem: function getItem(key) {
      if (has.call(storage, key)) return storage[key];
      return null;
    },

    /**
     * Add a new item in the storage.
     *
     * @param {String} key Name under which we store the value.
     * @param {String} value Value for the key.
     * @returns {Undefined}
     * @api public
     */
    setItem: function setItem(key, value) {
      storage[key] = value;
      window.name = querystringify_1.stringify(storage, prefix);

      windowStorage.length++;
    },

    /**
     * Remove a single item from the storage.
     *
     * @param {String} key Name of the value we need to remove.
     * @returns {Undefined}
     * @api pubilc
     */
    removeItem: function removeItem(key) {
      delete storage[key];
      window.name = querystringify_1.stringify(storage, prefix);

      windowStorage.length--;
    },

    /**
     * Completely remove all items from the store.
     *
     * @returns {Undefined}
     * @api pubilc
     */
    clear: function clear() {
      storage = {};
      window.name = '';
      windowStorage.length = 0;
    },

    /**
     * Is this storage system supported in the current environment.
     *
     * @type {Boolean}
     * @public
     */
    supported: (function supported() {
      return 'object' === typeof window && 'string' === typeof window.name;
    }())
  };

  //
  // Make sure that we initialize the storage so it pre-fills the `.length`
  //
  update();
  });
  var window_name_1 = window_name.length;
  var window_name_2 = window_name.getItem;
  var window_name_3 = window_name.setItem;
  var window_name_4 = window_name.removeItem;
  var window_name_5 = window_name.clear;
  var window_name_6 = window_name.supported;

  /**
   * Cookie creation interface.
   *
   * @param {Object} doc Reference to the document.
   * @returns {Object} Session storage inspired API.
   * @public
   */
  var koekiemonster = function bake(doc){
    if(!doc) doc = {};
    if(typeof doc === 'string') doc = { cookie: doc };
    if(doc.cookie === undefined) doc.cookie = '';

    // Returning object
    var self = {
      /**
       * Get the contents of a cookie.
       *
       * @param {String} key Name of the cookie we want to fetch.
       * @returns {String|Undefined} Result of the cookie or nothing.
       * @public
       */
      getItem: function getItem(key){
        var cookiesSplat = doc.cookie.split(/;\s*/);

        for (var i = 0; i < cookiesSplat.length; i++) {
          var ps = cookiesSplat[i].split('=');
          var k = decodeURIComponent(ps[0]);
          if (k === key) return decodeURIComponent(ps[1]);
        }
      },

      /**
       * Set a new cookie.
       *
       * @param {String} key Name of the cookie.
       * @param {String} value Data for the cookie.
       * @param {Object} opts Options for the cookie setting
       * @returns {String} Cookie.
       * @public
       */
      setItem: function setItem(key, value, opts){
        // Checks before we start
        if (typeof key !== 'string' || typeof value !== 'string') return false;
        if (!opts) opts = {};

        // Creating new cookie string
        var newCookie = encodeURIComponent(key) + '=' + encodeURIComponent(value);
        if (opts.hasOwnProperty('expires')) newCookie += '; expires=' + opts.expires;
        if (opts.hasOwnProperty('path')) newCookie += '; path=' + opts.path;
        if (opts.hasOwnProperty('domain')) newCookie += '; domain=' + opts.domain;
        if (opts.secure) newCookie += '; secure';

        doc.cookie = newCookie;
        return newCookie;
      },

      /**
       * Remove a cookie.
       *
       * @param {String} key Name of the cookie.
       * @returns {Undefined} Void.
       * @public
       */
      removeItem: function removeCookie(key){
        doc.cookie = key + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      },

      /**
       * Clear all cookies.
       *
       * @returns {Undefined} Void.
       * @public
       */
      clear: function clear(){
        var cookiesSplat = doc.cookie.split(/;\s*/);
        for (var i = 0; i < cookiesSplat.length; i++) {
          self.removeItem(decodeURIComponent(cookiesSplat[i].split('=')[0]));
        }
      }
    };

    return self;
  };

  var has$1 = Object.prototype.hasOwnProperty;

  /**
   * Decode a URI encoded string.
   *
   * @param {String} input The URI encoded string.
   * @returns {String} The decoded string.
   * @api private
   */
  function decode(input) {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  }

  /**
   * Simple query string parser.
   *
   * @param {String} query The query string that needs to be parsed.
   * @returns {Object}
   * @api public
   */
  function querystring$1(query) {
    var parser = /([^=?&]+)=?([^&]*)/g
      , result = {}
      , part;

    //
    // Little nifty parsing hack, leverage the fact that RegExp.exec increments
    // the lastIndex property so we can continue executing this loop until we've
    // parsed all results.
    //
    for (;
      part = parser.exec(query);
      result[decode(part[1])] = decode(part[2])
    );

    return result;
  }

  /**
   * Transform a query string to an object.
   *
   * @param {Object} obj Object that should be transformed.
   * @param {String} prefix Optional prefix.
   * @returns {String}
   * @api public
   */
  function querystringify$1(obj, prefix) {
    prefix = prefix || '';

    var pairs = [];

    //
    // Optionally prefix with a '?' if needed
    //
    if ('string' !== typeof prefix) prefix = '?';

    for (var key in obj) {
      if (has$1.call(obj, key)) {
        pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
      }
    }

    return pairs.length ? prefix + pairs.join('&') : '';
  }

  //
  // Expose the module.
  //
  var stringify$1 = querystringify$1;
  var parse$1 = querystring$1;

  var querystringify_1$1 = {
  	stringify: stringify$1,
  	parse: parse$1
  };

  var koekje_1 = createCommonjsModule(function (module) {

  var has = Object.prototype.hasOwnProperty
    , storage = {}
    , prefix = '§'
    , cookie;

  //
  // The export interface of the cookie-monster module is quite odd, if there is
  // no `document` in global it will simply not export the `get` and `set`
  // methods. Causing this module to fail on `undefined` function calls. Default
  // to an empty object when document doesn't exists solves it.
  //
  cookie = koekiemonster('undefined' !== typeof document ? document : {});

  /**
   * Refresh the storage as other users might also be writing against it.
   *
   * @api private
   */
  function update() {
    if (!koekje.supported) return;

    var data = cookie.getItem('koekje')
      , length = 0
      , key;

    storage = data && data.charAt(0) === prefix
      ? querystringify_1$1.parse(data.slice(1))
      : {};

    for (key in storage) {
      if (has.call(storage, key)) length++;
    }

    koekje.length = length;
  }

  var koekje = module.exports = {
    /**
     * The total number items stored in the storage.
     *
     * @type {Number}
     * @public
     */
    length: 0,

    /**
     * Find an item in the storage.
     *
     * @param {String} key Name of the value we lookup.
     * @returns {String|Null} Found item or null.
     * @api public
     */
    getItem: function getItem(key) {
      if (has.call(storage, key)) return storage[key];
      return null;
    },

    /**
     * Add a new item in the storage.
     *
     * @param {String} key Name under which we store the value.
     * @param {String} value Value for the key.
     * @returns {Undefined}
     * @api public
     */
    setItem: function setItem(key, value) {
      storage[key] = value;
      cookie.setItem('koekje', querystringify_1$1.stringify(storage, prefix));

      koekje.length++;
    },

    /**
     * Remove a single item from the storage.
     *
     * @param {String} key Name of the value we need to remove.
     * @returns {Undefined}
     * @api pubilc
     */
    removeItem: function removeItem(key) {
      delete storage[key];
      cookie.setItem('koekje', querystringify_1$1.stringify(storage, prefix));

      koekje.length--;
    },

    /**
     * Completely remove all items from the store.
     *
     * @returns {Undefined}
     * @api pubilc
     */
    clear: function clear() {
      storage = {};

      cookie.setItem('koekje', '', {
        expires: new Date(0)
      });

      koekje.length = 0;
    },

    /**
     * Is this storage system supported in the current environment.
     *
     * @type {Boolean}
     * @public
     */
    supported: (function supported() {
      return 'object' === typeof navigator && navigator.cookieEnabled;
    }()),

    /**
     * Completely re-initiate the storage.
     *
     * @type {Function}
     * @api private
     */
    update: update
  };

  //
  // Make sure that we initialize the storage so it pre-fills the `.length`
  //
  update();
  });
  var koekje_2 = koekje_1.length;
  var koekje_3 = koekje_1.getItem;
  var koekje_4 = koekje_1.setItem;
  var koekje_5 = koekje_1.removeItem;
  var koekje_6 = koekje_1.clear;
  var koekje_7 = koekje_1.supported;
  var koekje_8 = koekje_1.update;

  var sessionstorage = (function store() {

    try {
      sessionStorage.setItem('foo', 'bar');
      if (sessionStorage.getItem('foo') !== 'bar') throw 1;
      sessionStorage.removeItem('foo');
    } catch (e) {
      var objstorage$1 = objstorage
        , storage = window_name
        , koekje = koekje_1;

      return storage.supported ? storage : (koekje.supported ? koekje : objstorage$1);
    }

    return sessionStorage;
  }());

  var FacebookEvent = /** @class */ (function () {
      function FacebookEvent(params) {
          this.owner = "rh_easy";
          this.content_type = "product";
          this.content_ids = params.itemIds;
          this.value = params.totalPrice;
          this.currency = params.currency;
          this.num_items = params.numberItems;
      }
      return FacebookEvent;
  }());

  function getFbPixelScript(fbPixelId) {
      return "!function(f,b,e,v,n,t,s)      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?      n.callMethod.apply(n,arguments):n.queue.push(arguments)};      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';      n.queue=[];t=b.createElement(e);t.async=!0;      t.src=v;s=b.getElementsByTagName(e)[0];      s.parentNode.insertBefore(t,s)}(window, document,'script',      'https://connect.facebook.net/en_US/fbevents.js');      fbq('init', '" + fbPixelId + "');      fbq('trackSingle', '" + fbPixelId + "', 'PageView');";
  }

  function trackFacebookEvent(facebookEvent, fbPixelId, eventType) {
      var fbPixelScript = getFbPixelScript(fbPixelId);
      if (!RhEasyGlobalState.fbPixelInserted) {
          var newNode = document.createElement("script");
          newNode.type = "text/javascript";
          newNode.innerHTML += fbPixelScript;
          var existingNode = document.getElementsByTagName("script")[0];
          if (existingNode !== null && existingNode.parentNode !== null) {
              existingNode.parentNode.insertBefore(newNode, existingNode);
              RhEasyGlobalState.fbPixelInserted = true;
          }
          if (!RhEasyGlobalState.fbPixelInserted) {
              throw new Error("FB Pixel injection failed. FB Pixel ID: " + fbPixelId);
          }
      }
      var eventTypeData = getEventTypeData(eventType);
      fbq("trackSingle", fbPixelId, eventTypeData.facebookEventName, facebookEvent);
  }

  function getNumberOfItems(order) {
      return order.items
          .map(function (item) { return item.quantity; })
          .reduce(function (a, b) { return Number(a) + Number(b); }, 0);
  }

  var EStorageFields;
  (function (EStorageFields) {
      EStorageFields["CART_STATE"] = "rhEasyCartState";
      EStorageFields["CURRENCY"] = "rhEasyShopCurrency";
      EStorageFields["ORDER_IDS"] = "rhEasyOrderIds";
  })(EStorageFields || (EStorageFields = {}));

  function trackShopifyViewContentFacebook(shopifyProduct, fbPixelId) {
      var facebookEvent = new FacebookEvent({ itemIds: [buildProductIdWithVariantId(shopifyProduct)] });
      trackFacebookEvent(facebookEvent, fbPixelId, EEventType.PRODUCT_VIEW);
  }
  function trackShopifyAddToCartFacebook(shopifyCart, fbPixelId) {
      var facebookEvent = new FacebookEvent({ itemIds: getUniqueProductIdsWithVariantIds(shopifyCart.items) });
      trackFacebookEvent(facebookEvent, fbPixelId, EEventType.ADD_TO_CART);
  }
  function trackShopifyAddSingleProductToCartFacebook(shopifyProduct, fbPixelId) {
      var facebookEvent = new FacebookEvent({ itemIds: [buildProductIdWithVariantId(shopifyProduct)] });
      trackFacebookEvent(facebookEvent, fbPixelId, EEventType.ADD_TO_CART);
  }
  function trackShopifyPurchaseFacebook(order, fbPixelId) {
      var storageOrderIds = JSON.parse(sessionstorage.getItem(EStorageFields.ORDER_IDS));
      var orderIds = [];
      if (storageOrderIds instanceof Array) {
          orderIds = storageOrderIds;
      }
      if (orderIds.includes(order.orderId)) {
          return; // order already tracked, exit function
      }
      sessionstorage.setItem(EStorageFields.ORDER_IDS, JSON.stringify(__spread(orderIds, [order.orderId])));
      var facebookEvent = new FacebookEvent({
          itemIds: getUniqueProductIdsWithVariantIds(order.items),
          totalPrice: order.totalPrice,
          currency: order.currency,
          numberItems: getNumberOfItems(order)
      });
      trackFacebookEvent(facebookEvent, fbPixelId, EEventType.PURCHASE);
  }

  function trackViewContent() {
      if (RhEasyShopify && RhEasyShopify.pageType === "product") {
          var conversionTrackerId = RhEasyShopify.conversionId;
          var fbPixelId = RhEasyShopify.fbPixelId;
          if (conversionTrackerId !== null) {
              trackShopifyViewContentGoogle(RhEasyShopify.product, conversionTrackerId);
          }
          if (fbPixelId !== null) {
              trackShopifyViewContentFacebook(RhEasyShopify.product, fbPixelId);
          }
      }
  }

  var ShopifyItem = /** @class */ (function () {
      function ShopifyItem(productId, variantId, quantity, price, currency) {
          this.productId = productId;
          this.variantId = variantId;
          this.quantity = quantity;
          this.price = price;
          this.currency = currency;
      }
      return ShopifyItem;
  }());
  function toShopifyItems(shopifyOrderItems, currency) {
      return shopifyOrderItems.map(function (shopifyOrderItem) { return new ShopifyItem(String(shopifyOrderItem.product_id), String(shopifyOrderItem.variant_id), shopifyOrderItem.quantity, shopifyOrderItem.price, currency); });
  }

  var ShopifyOrder = /** @class */ (function () {
      function ShopifyOrder(orderId, totalPrice, currency, items) {
          this.orderId = orderId;
          this.totalPrice = totalPrice;
          this.currency = currency;
          this.items = items;
      }
      return ShopifyOrder;
  }());
  function fromShopifyObject() {
      return new ShopifyOrder(Number(ShopifyObject.checkout.order_id), Number(ShopifyObject.checkout.subtotal_price), // subtotal_price is total_price without shipping (tax is included)
      ShopifyObject.checkout.currency, toShopifyItems(ShopifyObject.checkout.line_items, ShopifyObject.checkout.currency));
  }

  // When the Checkout page is loaded for the first time it contains object ShopifyObject.Checkout.page with value "thank_you"
  // https://community.shopify.com/c/Shopify-APIs-SDKs/How-to-load-Order-status-script-tag-only-for-the-first-time/m-p/538976
  function shouldTrackPurchase() {
      return RhEasyShopify && RhEasyShopify.pageType === 'checkout' &&
          ShopifyObject && ShopifyObject.Checkout && ShopifyObject.Checkout.page === 'thank_you' &&
          ShopifyObject.checkout && ShopifyObject.checkout.line_items && ShopifyObject.checkout.line_items.length > 0;
  }
  function trackPurchase() {
      if (shouldTrackPurchase()) {
          var conversionTrackerId = RhEasyShopify.conversionId;
          var conversionLabel = RhEasyShopify.conversionLabel;
          var fbPixelId = RhEasyShopify.fbPixelId;
          var shopifyOrder = fromShopifyObject();
          if (conversionTrackerId !== null && conversionLabel !== null) {
              trackShopifyPurchaseGoogle(shopifyOrder, conversionTrackerId, conversionLabel);
          }
          if (fbPixelId !== null) {
              trackShopifyPurchaseFacebook(shopifyOrder, fbPixelId);
          }
      }
  }

  function isDebugModeActive() {
      return Boolean(localStorage.getItem('rh-easy.debug'));
  }
  // Log to console only in debug mode
  function logMessage(message) {
      var rest = [];
      for (var _i = 1; _i < arguments.length; _i++) {
          rest[_i - 1] = arguments[_i];
      }
      if (isDebugModeActive()) {
          // tslint:disable-next-line:no-console
          console.log.apply(console, __spread([message], rest));
      }
  }

  function trackAddToCart() {
      if (RhEasyShopify && RhEasyShopify.pageType === 'cart') {
          var conversionTrackerId = RhEasyShopify.conversionId;
          var fbPixelId = RhEasyShopify.fbPixelId;
          if (conversionTrackerId !== null) {
              trackShopifyAddToCartGoogle(RhEasyShopify.cart, conversionTrackerId);
          }
          if (fbPixelId !== null) {
              trackShopifyAddToCartFacebook(RhEasyShopify.cart, fbPixelId);
          }
      }
  }
  function handleAjaxAddToCart() {
      var xhr = XMLHttpRequest;
      var send = xhr.prototype.send;
      xhr.prototype.send = function (requestBody) {
          var listener = new XhrListener(this, this._url);
          if (this.addEventListener) {
              this.addEventListener('readystatechange', listener.onReadyStateChange.bind(listener));
          }
          else {
              listener.oldOnReadyStateChange = this.onreadystatechange;
              this.onreadystatechange = listener.onReadyStateChange;
          }
          send.call(this, requestBody);
      };
  }
  var XhrListener = /** @class */ (function () {
      function XhrListener(xhr, url) {
          this.addToCartUrl = '/cart/add.js';
          this.xhr = xhr;
          this.url = url;
      }
      XhrListener.prototype.onReadyStateChange = function () {
          if (this.xhr.readyState === XMLHttpRequest.DONE && this.xhr.responseText && this.url === this.addToCartUrl) {
              try {
                  var addToCartResponse = JSON.parse(this.xhr.responseText);
                  var conversionId = RhEasyShopify.conversionId, fbPixelId = RhEasyShopify.fbPixelId;
                  var addedProduct = {
                      productId: addToCartResponse.product_id,
                      variantId: addToCartResponse.id,
                  };
                  if (conversionId) {
                      trackShopifyAddSingleProductToCartGoogle(addedProduct, conversionId);
                  }
                  if (fbPixelId) {
                      trackShopifyAddSingleProductToCartFacebook(addedProduct, fbPixelId);
                  }
              }
              catch (e) {
                  logMessage("Error while tracking Add to Cart event: " + e.message, this.xhr.responseText);
              }
          }
          if (this.oldOnReadyStateChange) {
              this.oldOnReadyStateChange();
          }
      };
      return XhrListener;
  }());

  function trackEventsOnShopify() {
      trackViewContent();
      trackAddToCart();
      trackPurchase();
      handleAjaxAddToCart();
  }

  trackEventsOnShopify();

}());
//# sourceMappingURL=shopify-tracking.js.map
