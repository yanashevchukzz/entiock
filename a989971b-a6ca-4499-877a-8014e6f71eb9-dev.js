"use strict";(function () {function r(e, n, t) {function o(i, f) {if (!n[i]) {if (!e[i]) {var c = "function" == typeof require && require;if (!f && c) return c(i, !0);if (u) return u(i, !0);var a = new Error("Cannot find module '" + i + "'");throw a.code = "MODULE_NOT_FOUND", a;}var p = n[i] = { exports: {} };e[i][0].call(p.exports, function (r) {var n = e[i][1][r];return o(n || r);}, p, p.exports, r, e, n, t);}return n[i].exports;}for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {o(t[i]);}return o;}return r;})()({ 1: [function (require, module, exports) {
    "use strict";

    /**
                   * Implementation of atob() according to the HTML and Infra specs, except that
                   * instead of throwing INVALID_CHARACTER_ERR we return null.
                   */
    function atob(data) {
      // Web IDL requires DOMStrings to just be converted using ECMAScript
      // ToString, which in our case amounts to using a template literal.
      data = "" + data;
      // "Remove all ASCII whitespace from data."
      data = data.replace(/[ \t\n\f\r]/g, "");
      // "If data's length divides by 4 leaving no remainder, then: if data ends
      // with one or two U+003D (=) code points, then remove them from data."
      if (data.length % 4 === 0) {
        data = data.replace(/==?$/, "");
      }
      // "If data's length divides by 4 leaving a remainder of 1, then return
      // failure."
      //
      // "If data contains a code point that is not one of
      //
      // U+002B (+)
      // U+002F (/)
      // ASCII alphanumeric
      //
      // then return failure."
      if (data.length % 4 === 1 || /[^+/0-9A-Za-z]/.test(data)) {
        return null;
      }
      // "Let output be an empty byte sequence."
      var output = "";
      // "Let buffer be an empty buffer that can have bits appended to it."
      //
      // We append bits via left-shift and or.  accumulatedBits is used to track
      // when we've gotten to 24 bits.
      var buffer = 0;
      var accumulatedBits = 0;
      // "Let position be a position variable for data, initially pointing at the
      // start of data."
      //
      // "While position does not point past the end of data:"
      for (var i = 0; i < data.length; i++) {
        // "Find the code point pointed to by position in the second column of
        // Table 1: The Base 64 Alphabet of RFC 4648. Let n be the number given in
        // the first cell of the same row.
        //
        // "Append to buffer the six bits corresponding to n, most significant bit
        // first."
        //
        // atobLookup() implements the table from RFC 4648.
        buffer <<= 6;
        buffer |= atobLookup(data[i]);
        accumulatedBits += 6;
        // "If buffer has accumulated 24 bits, interpret them as three 8-bit
        // big-endian numbers. Append three bytes with values equal to those
        // numbers to output, in the same order, and then empty buffer."
        if (accumulatedBits === 24) {
          output += String.fromCharCode((buffer & 0xff0000) >> 16);
          output += String.fromCharCode((buffer & 0xff00) >> 8);
          output += String.fromCharCode(buffer & 0xff);
          buffer = accumulatedBits = 0;
        }
        // "Advance position by 1."
      }
      // "If buffer is not empty, it contains either 12 or 18 bits. If it contains
      // 12 bits, then discard the last four and interpret the remaining eight as
      // an 8-bit big-endian number. If it contains 18 bits, then discard the last
      // two and interpret the remaining 16 as two 8-bit big-endian numbers. Append
      // the one or two bytes with values equal to those one or two numbers to
      // output, in the same order."
      if (accumulatedBits === 12) {
        buffer >>= 4;
        output += String.fromCharCode(buffer);
      } else if (accumulatedBits === 18) {
        buffer >>= 2;
        output += String.fromCharCode((buffer & 0xff00) >> 8);
        output += String.fromCharCode(buffer & 0xff);
      }
      // "Return output."
      return output;
    }
    /**
       * A lookup table for atob(), which converts an ASCII character to the
       * corresponding six-bit number.
       */
    function atobLookup(chr) {
      if (/[A-Z]/.test(chr)) {
        return chr.charCodeAt(0) - "A".charCodeAt(0);
      }
      if (/[a-z]/.test(chr)) {
        return chr.charCodeAt(0) - "a".charCodeAt(0) + 26;
      }
      if (/[0-9]/.test(chr)) {
        return chr.charCodeAt(0) - "0".charCodeAt(0) + 52;
      }
      if (chr === "+") {
        return 62;
      }
      if (chr === "/") {
        return 63;
      }
      // Throw exception; should not be hit in tests
      return undefined;
    }

    module.exports = atob;

  }, {}], 2: [function (require, module, exports) {
    "use strict";

    /**
                   * btoa() as defined by the HTML and Infra specs, which mostly just references
                   * RFC 4648.
                   */
    function btoa(s) {
      var i;
      // String conversion as required by Web IDL.
      s = "" + s;
      // "The btoa() method must throw an "InvalidCharacterError" DOMException if
      // data contains any character whose code point is greater than U+00FF."
      for (i = 0; i < s.length; i++) {
        if (s.charCodeAt(i) > 255) {
          return null;
        }
      }
      var out = "";
      for (i = 0; i < s.length; i += 3) {
        var groupsOfSix = [undefined, undefined, undefined, undefined];
        groupsOfSix[0] = s.charCodeAt(i) >> 2;
        groupsOfSix[1] = (s.charCodeAt(i) & 0x03) << 4;
        if (s.length > i + 1) {
          groupsOfSix[1] |= s.charCodeAt(i + 1) >> 4;
          groupsOfSix[2] = (s.charCodeAt(i + 1) & 0x0f) << 2;
        }
        if (s.length > i + 2) {
          groupsOfSix[2] |= s.charCodeAt(i + 2) >> 6;
          groupsOfSix[3] = s.charCodeAt(i + 2) & 0x3f;
        }
        for (var j = 0; j < groupsOfSix.length; j++) {
          if (typeof groupsOfSix[j] === "undefined") {
            out += "=";
          } else {
            out += btoaLookup(groupsOfSix[j]);
          }
        }
      }
      return out;
    }

    /**
       * Lookup table for btoa(), which converts a six-bit number into the
       * corresponding ASCII character.
       */
    function btoaLookup(idx) {
      if (idx < 26) {
        return String.fromCharCode(idx + "A".charCodeAt(0));
      }
      if (idx < 52) {
        return String.fromCharCode(idx - 26 + "a".charCodeAt(0));
      }
      if (idx < 62) {
        return String.fromCharCode(idx - 52 + "0".charCodeAt(0));
      }
      if (idx === 62) {
        return "+";
      }
      if (idx === 63) {
        return "/";
      }
      // Throw INVALID_CHARACTER_ERR exception here -- won't be hit in the tests.
      return undefined;
    }

    module.exports = btoa;

  }, {}], 3: [function (require, module, exports) {
    // shim for using process in browser
    var process = module.exports = {};

    // cached from whatever global is present so that test runners that stub it
    // don't break things.  But we need to wrap it in a try catch in case it is
    // wrapped in strict mode code which doesn't define any globals.  It's inside a
    // function because try/catches deoptimize in certain engines.

    var cachedSetTimeout;
    var cachedClearTimeout;

    function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout() {
      throw new Error('clearTimeout has not been defined');
    }
    (function () {
      try {
        if (typeof setTimeout === 'function') {
          cachedSetTimeout = setTimeout;
        } else {
          cachedSetTimeout = defaultSetTimout;
        }
      } catch (e) {
        cachedSetTimeout = defaultSetTimout;
      }
      try {
        if (typeof clearTimeout === 'function') {
          cachedClearTimeout = clearTimeout;
        } else {
          cachedClearTimeout = defaultClearTimeout;
        }
      } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
      }
    })();
    function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
      }
      // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
      }
      try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
      } catch (e) {
        try {
          // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
          return cachedSetTimeout.call(null, fun, 0);
        } catch (e) {
          // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
          return cachedSetTimeout.call(this, fun, 0);
        }
      }


    }
    function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
      }
      // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
      }
      try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
      } catch (e) {
        try {
          // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
          return cachedClearTimeout.call(null, marker);
        } catch (e) {
          // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
          // Some versions of I.E. have different rules for clearTimeout vs setTimeout
          return cachedClearTimeout.call(this, marker);
        }
      }



    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
      if (!draining || !currentQueue) {
        return;
      }
      draining = false;
      if (currentQueue.length) {
        queue = currentQueue.concat(queue);
      } else {
        queueIndex = -1;
      }
      if (queue.length) {
        drainQueue();
      }
    }

    function drainQueue() {
      if (draining) {
        return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;

      var len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
          if (currentQueue) {
            currentQueue[queueIndex].run();
          }
        }
        queueIndex = -1;
        len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
    }

    process.nextTick = function (fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
          args[i - 1] = arguments[i];
        }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
      }
    };

    // v8 likes predictible objects
    function Item(fun, array) {
      this.fun = fun;
      this.array = array;
    }
    Item.prototype.run = function () {
      this.fun.apply(null, this.array);
    };
    process.title = 'browser';
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = ''; // empty string to avoid regexp issues
    process.versions = {};

    function noop() {}

    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.prependListener = noop;
    process.prependOnceListener = noop;

    process.listeners = function (name) {return [];};

    process.binding = function (name) {
      throw new Error('process.binding is not supported');
    };

    process.cwd = function () {return '/';};
    process.chdir = function (dir) {
      throw new Error('process.chdir is not supported');
    };
    process.umask = function () {return 0;};

  }, {}], 4: [function (require, module, exports) {
    (function (setImmediate, clearImmediate) {
      var nextTick = require('process/browser.js').nextTick;
      var apply = Function.prototype.apply;
      var slice = Array.prototype.slice;
      var immediateIds = {};
      var nextImmediateId = 0;

      // DOM APIs, for completeness

      exports.setTimeout = function () {
        return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
      };
      exports.setInterval = function () {
        return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
      };
      exports.clearTimeout =
      exports.clearInterval = function (timeout) {timeout.close();};

      function Timeout(id, clearFn) {
        this._id = id;
        this._clearFn = clearFn;
      }
      Timeout.prototype.unref = Timeout.prototype.ref = function () {};
      Timeout.prototype.close = function () {
        this._clearFn.call(window, this._id);
      };

      // Does not start the time, just sets up the members needed.
      exports.enroll = function (item, msecs) {
        clearTimeout(item._idleTimeoutId);
        item._idleTimeout = msecs;
      };

      exports.unenroll = function (item) {
        clearTimeout(item._idleTimeoutId);
        item._idleTimeout = -1;
      };

      exports._unrefActive = exports.active = function (item) {
        clearTimeout(item._idleTimeoutId);

        var msecs = item._idleTimeout;
        if (msecs >= 0) {
          item._idleTimeoutId = setTimeout(function onTimeout() {
            if (item._onTimeout)
            item._onTimeout();
          }, msecs);
        }
      };

      // That's not how node.js implements it but the exposed api is the same.
      exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function (fn) {
        var id = nextImmediateId++;
        var args = arguments.length < 2 ? false : slice.call(arguments, 1);

        immediateIds[id] = true;

        nextTick(function onNextTick() {
          if (immediateIds[id]) {
            // fn.call() is faster so we optimize for the common use-case
            // @see http://jsperf.com/call-apply-segu
            if (args) {
              fn.apply(null, args);
            } else {
              fn.call(null);
            }
            // Prevent ids from leaking
            exports.clearImmediate(id);
          }
        });

        return id;
      };

      exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function (id) {
        delete immediateIds[id];
      };
    }).call(this, require("timers").setImmediate, require("timers").clearImmediate);
  }, { "process/browser.js": 3, "timers": 4 }], 5: [function (require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });var _require =
    require('./dom-utils'),listByClass = _require.listByClass;
    var lory;
    function initializeCarousels(domElement) {
      var carousels = listByClass(domElement, 'cn__slider');
      if (carousels) {
        carousels.forEach(function (carousel) {
          _initializeCarousel(carousel);
        });
      }
      function _initializeCarousel(carousel) {
        var originalListItems = Array.prototype.slice.call(carousel.querySelectorAll('.js_slide'));
        if (originalListItems.length === 0) {
          return;
        }
        var columnQuantity = Math.min(originalListItems.length, parseInt(carousel.getAttribute('data-column-quantity'), 10));
        var carouselInterval = parseInt(carousel.getAttribute('data-carousel-interval'), 10);
        var responsiveColumnQuantity = Math.min(originalListItems.length, parseInt(carousel.getAttribute('data-responsive-column-quantity'), 10));
        var responsiveBreakpoint = parseInt(carousel.getAttribute('data-content-responsive-breakpoint'), 10);
        var itemDesktopWidth = 100 / columnQuantity;
        var itemResponsiveWidth = 100 / responsiveColumnQuantity;
        var autoPlayTimer;
        var options = {
          infinite: columnQuantity };

        var isStaticMode = false;
        var myLory = lory(carousel, options);
        var isResponsive = false;
        updateCarouselListItems(window);
        Array.prototype.slice.call(carousel.querySelectorAll('.cn__prev, .cn__next')).forEach(function (element, index) {
          element.setAttribute('data-cn-original-display', element.style.display);
        });
        window.addEventListener('resize', function (evt) {
          updateCarouselListItems(evt.target);
        });
        carousel.querySelector('.js_prev').addEventListener('click', resetCarouselAutoplay);
        carousel.querySelector('.js_next').addEventListener('click', resetCarouselAutoplay);
        carousel.addEventListener('mouseleave', resetCarouselAutoplay);
        carousel.addEventListener('mouseover', stopCarouselAutoplay);
        if (options.infinite < originalListItems.length) {
          startCarouselAutoplay();
        }
        function resetCarouselAutoplay() {
          stopCarouselAutoplay();
          startCarouselAutoplay();
        }
        function updateCarouselListItems(window) {
          if (window.innerWidth < responsiveBreakpoint && !isResponsive) {
            isResponsive = true;
            options.infinite = responsiveColumnQuantity;
          } else
          if (window.innerWidth >= responsiveBreakpoint && isResponsive) {
            isResponsive = false;
            options.infinite = columnQuantity;
          }
          if (options.infinite === originalListItems.length) {
            activateStaticMode();
          } else
          {
            deactivateStaticMode();
          }
          myLory.destroy();
          resetAllItems();
          setWidthToAllCarouselListItems(isResponsive);
          myLory.setup();
        }
        function setWidthToAllCarouselListItems(isResponsive) {
          Array.prototype.slice.call(carousel.querySelectorAll('.js_slide')).forEach(function (element) {
            element.style.width = (isResponsive ? itemResponsiveWidth : itemDesktopWidth) + '%';
          });
        }
        function resetAllItems() {
          var slidesContainer = carousel.querySelector('.js_slides');
          slidesContainer.innerHtml = '';
          originalListItems.forEach(function (li) {
            slidesContainer.appendChild(li);
          });
        }
        function stopCarouselAutoplay() {
          clearTimeout(autoPlayTimer);
        }
        function startCarouselAutoplay() {
          if (carouselInterval <= 0) {
            return;
          }
          autoPlayTimer = setTimeout(function goToNextSlide() {
            if (!isStaticMode && !myLory.isTouching()) {
              myLory.next();
            }
            startCarouselAutoplay();
          }, carouselInterval * 1000);
        }
        function activateStaticMode() {
          isStaticMode = true;
          Array.prototype.slice.call(carousel.querySelectorAll('.cn__prev, .cn__next')).forEach(function (element) {
            element.style.display = 'none';
          });
        }
        function deactivateStaticMode() {
          isStaticMode = false;
          Array.prototype.slice.call(carousel.querySelectorAll('.cn__prev, .cn__next')).forEach(function (element) {
            element.style.display = element.getAttribute('data-cn-original-display');
          });
        }
      }
    }
    exports.initializeCarousels = initializeCarousels;
    // internal and private lory.js implementation.
    (function () {
      var slice = Array.prototype.slice;
      var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }return target;};
      function detectPrefixes() {
        var transform = void 0;
        var transition = void 0;
        var transitionEnd = void 0;
        var hasTranslate3d = void 0;
        (function () {
          var el = document.createElement('_');
          var style = el.style;
          var prop = void 0;
          if (style[prop = 'webkitTransition'] === '') {
            transitionEnd = 'webkitTransitionEnd';
            transition = prop;
          }
          if (style[prop = 'transition'] === '') {
            transitionEnd = 'transitionend';
            transition = prop;
          }
          if (style[prop = 'webkitTransform'] === '') {
            transform = prop;
          }
          if (style[prop = 'msTransform'] === '') {
            transform = prop;
          }
          if (style[prop = 'transform'] === '') {
            transform = prop;
          }
          document.body.insertBefore(el, null);
          style[transform] = 'translate3d(0, 0, 0)';
          hasTranslate3d = !!window.getComputedStyle(el).getPropertyValue(transform);
          document.body.removeChild(el);
        })();
        return {
          transform: transform,
          transition: transition,
          transitionEnd: transitionEnd,
          hasTranslate3d: hasTranslate3d };

      }
      var CustomEvent = function () {
        var NativeCustomEvent = window.CustomEvent;
        function useNative() {
          try {
            var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
            return 'cat' === p.type && 'bar' === p.detail.foo;
          }
          catch (e) {
          }
          return false;
        }
        return useNative() ? NativeCustomEvent :
        // IE >= 9
        'undefined' !== typeof document && 'function' === typeof document.createEvent ? function CustomEvent(type, params) {
          var e = document.createEvent('CustomEvent');
          if (params) {
            e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
          } else
          {
            e.initCustomEvent(type, false, false, void 0);
          }
          return e;
        } :
        // IE <= 8
        function CustomEvent(type, params) {
          var e = document.createEventObject();
          e.type = type;
          if (params) {
            e.bubbles = Boolean(params.bubbles);
            e.cancelable = Boolean(params.cancelable);
            e.detail = params.detail;
          } else
          {
            e.bubbles = false;
            e.cancelable = false;
            e.detail = void 0;
          }
          return e;
        };
      }();
      function detectSupportsPassive() {
        var supportsPassive = false;
        try {
          var opts = Object.defineProperty({}, 'passive', {
            get: function get() {
              supportsPassive = true;
            } });

          window.addEventListener('testPassive', null, opts);
          window.removeEventListener('testPassive', null, opts);
        }
        catch (e) {}
        return supportsPassive;
      }
      var defaults = {
        slidesToScroll: 1,
        slideSpeed: 300,
        rewindSpeed: 600,
        snapBackSpeed: 200,
        ease: 'ease',
        rewind: false,
        infinite: false,
        initialIndex: 0,
        classNameFrame: 'js_frame',
        classNameSlideContainer: 'js_slides',
        classNamePrevCtrl: 'js_prev',
        classNameNextCtrl: 'js_next',
        classNameActiveSlide: 'active',
        enableMouseEvents: false,
        window: typeof window !== 'undefined' ? window : null,
        rewindOnResize: true };

      function dispatchEvent(target, type, detail) {
        var event = new CustomEvent(type, {
          bubbles: true,
          cancelable: true,
          detail: detail });

        target.dispatchEvent(event);
      }
      function _lory(slider, opts) {
        var position = void 0;
        var slidesWidth = void 0;
        var frameWidth = void 0;
        var slides = void 0;
        /**
                              * slider DOM elements
                              */
        var frame = void 0;
        var slideContainer = void 0;
        var prevCtrl = void 0;
        var nextCtrl = void 0;
        var prefixes = void 0;
        var transitionEndCallback = void 0;
        var index = 0;
        var options = {};
        var touchEventParams = detectSupportsPassive() ? { passive: true } : false;
        var isTouching = false;
        /**
                                 * private
                                 * set active class to element which is the current slide
                                 */
        function setActiveElement(slides, currentIndex) {
          var _options = options,classNameActiveSlide = _options.classNameActiveSlide;
          slides.forEach(function (element, index) {
            if (element.classList.contains(classNameActiveSlide)) {
              element.classList.remove(classNameActiveSlide);
            }
          });
          slides[currentIndex].classList.add(classNameActiveSlide);
        }
        /**
           * private
           * setupInfinite: function to setup if infinite is set
           *
           * @param  {array} slideArray
           * @return {array} array of updated slideContainer elements
           */
        function setupInfinite(slideArray) {
          var _options2 = options,infinite = _options2.infinite;
          var front = slideArray.slice(0, infinite);
          var back = slideArray.slice(slideArray.length - infinite, slideArray.length);
          front.forEach(function (element) {
            var cloned = element.cloneNode(true);
            slideContainer.appendChild(cloned);
          });
          back.reverse().forEach(function (element) {
            var cloned = element.cloneNode(true);
            slideContainer.insertBefore(cloned, slideContainer.firstChild);
          });
          slideContainer.addEventListener(prefixes.transitionEnd, onTransitionEnd);
          return slice.call(slideContainer.children);
        }
        /**
           * [dispatchSliderEvent description]
           * @return {[type]} [description]
           */
        function dispatchSliderEvent(phase, type, detail) {
          dispatchEvent(slider, phase + '.lory.' + type, detail);
        }
        /**
           * translates to a given position in a given time in milliseconds
           *
           * @to        {number} number in pixels where to translate to
           * @duration  {number} time in milliseconds for the transistion
           * @ease      {string} easing css property
           */
        function translate(to, duration, ease) {
          var style = slideContainer && slideContainer.style;
          if (style) {
            style[prefixes.transition + 'TimingFunction'] = ease;
            style[prefixes.transition + 'Duration'] = duration + 'ms';
            if (prefixes.hasTranslate3d) {
              style[prefixes.transform] = 'translate3d(' + to + 'px, 0, 0)';
            } else
            {
              style[prefixes.transform] = 'translate(' + to + 'px, 0)';
            }
          }
        }
        /**
           * slidefunction called by prev, next & touchend
           *
           * determine nextIndex and slide to next postion
           * under restrictions of the defined options
           *
           * @direction  {boolean}
           */
        function slide(nextIndex, direction) {
          var _options3 = options,slideSpeed = _options3.slideSpeed,slidesToScroll = _options3.slidesToScroll,infinite = _options3.infinite,rewind = _options3.rewind,rewindSpeed = _options3.rewindSpeed,ease = _options3.ease,classNameActiveSlide = _options3.classNameActiveSlide;
          var duration = slideSpeed;
          var nextSlide = direction ? index + 1 : index - 1;
          var maxOffset = Math.round(slidesWidth - frameWidth);
          dispatchSliderEvent('before', 'slide', {
            index: index,
            nextSlide: nextSlide });

          /**
                                      * Reset control classes
                                      */
          if (prevCtrl) {
            prevCtrl.classList.remove('disabled');
          }
          if (nextCtrl) {
            nextCtrl.classList.remove('disabled');
          }
          if (typeof nextIndex !== 'number') {
            if (direction) {
              nextIndex = index + slidesToScroll;
            } else
            {
              nextIndex = index - slidesToScroll;
            }
          }
          nextIndex = Math.min(Math.max(nextIndex, 0), slides.length - 1);
          if (infinite && direction === undefined) {
            nextIndex += infinite;
          }
          var nextOffset = Math.min(Math.max(slides[nextIndex].offsetLeft * -1, maxOffset * -1), 0);
          if (rewind && Math.abs(position.x) === maxOffset && direction) {
            nextOffset = 0;
            nextIndex = 0;
            duration = rewindSpeed;
          }
          /**
             * translate to the nextOffset by a defined duration and ease function
             */
          translate(nextOffset, duration, ease);
          /**
                                                  * update the position with the next position
                                                  */
          position.x = nextOffset;
          /**
                                    * update the index with the nextIndex only if
                                    * the offset of the nextIndex is in the range of the maxOffset
                                    */
          if (slides[nextIndex].offsetLeft <= maxOffset) {
            index = nextIndex;
          }
          if (infinite && (nextIndex === slides.length - infinite || nextIndex === 0)) {
            if (direction) {
              index = infinite;
            }
            if (!direction) {
              index = slides.length - infinite * 2;
            }
            position.x = slides[index].offsetLeft * -1;
            transitionEndCallback = function transitionEndCallback() {
              translate(slides[index].offsetLeft * -1, 0, undefined);
            };
          }
          if (classNameActiveSlide) {
            setActiveElement(slice.call(slides), index);
          }
          /**
             * update classes for next and prev arrows
             * based on user settings
             */
          if (prevCtrl && !infinite && nextIndex === 0) {
            prevCtrl.classList.add('disabled');
          }
          if (nextCtrl && !infinite && !rewind && nextIndex + 1 === slides.length) {
            nextCtrl.classList.add('disabled');
          }
          dispatchSliderEvent('after', 'slide', {
            currentSlide: index });

        }
        /**
           * public
           * setup function
           */
        function setup() {
          dispatchSliderEvent('before', 'init');
          prefixes = detectPrefixes();
          options = _extends({}, defaults, opts);
          var _options4 = options,classNameFrame = _options4.classNameFrame,classNameSlideContainer = _options4.classNameSlideContainer,classNamePrevCtrl = _options4.classNamePrevCtrl,classNameNextCtrl = _options4.classNameNextCtrl,enableMouseEvents = _options4.enableMouseEvents,classNameActiveSlide = _options4.classNameActiveSlide,initialIndex = _options4.initialIndex;
          index = initialIndex;
          frame = slider.getElementsByClassName(classNameFrame)[0];
          slideContainer = frame.getElementsByClassName(classNameSlideContainer)[0];
          prevCtrl = slider.getElementsByClassName(classNamePrevCtrl)[0];
          nextCtrl = slider.getElementsByClassName(classNameNextCtrl)[0];
          position = {
            x: slideContainer.offsetLeft,
            y: slideContainer.offsetTop };

          if (options.infinite) {
            slides = setupInfinite(slice.call(slideContainer.children));
          } else
          {
            slides = slice.call(slideContainer.children);
            if (prevCtrl) {
              prevCtrl.classList.add('disabled');
            }
            if (nextCtrl && slides.length === 1 && !options.rewind) {
              nextCtrl.classList.add('disabled');
            }
          }
          reset();
          if (classNameActiveSlide) {
            setActiveElement(slides, index);
          }
          if (prevCtrl && nextCtrl) {
            prevCtrl.addEventListener('click', prev);
            nextCtrl.addEventListener('click', next);
          }
          frame.addEventListener('touchstart', onTouchstart, touchEventParams);
          if (enableMouseEvents) {
            frame.addEventListener('mousedown', onTouchstart);
            frame.addEventListener('click', onClick);
          }
          options.window.addEventListener('resize', onResize);
          dispatchSliderEvent('after', 'init');
        }
        /**
           * public
           * reset function: called on resize
           */
        function reset() {
          var _options5 = options,infinite = _options5.infinite,ease = _options5.ease,rewindSpeed = _options5.rewindSpeed,rewindOnResize = _options5.rewindOnResize,classNameActiveSlide = _options5.classNameActiveSlide,initialIndex = _options5.initialIndex;
          slidesWidth = slideContainer.getBoundingClientRect().width || slideContainer.offsetWidth;
          frameWidth = frame.getBoundingClientRect().width || frame.offsetWidth;
          if (frameWidth === slidesWidth) {
            slidesWidth = slides.reduce(function (previousValue, slide) {
              return previousValue + slide.getBoundingClientRect().width || slide.offsetWidth;
            }, 0);
          }
          if (rewindOnResize) {
            index = initialIndex;
          } else
          {
            ease = null;
            rewindSpeed = 0;
          }
          if (infinite) {
            translate(slides[index + infinite].offsetLeft * -1, 0, null);
            index = index + infinite;
            position.x = slides[index].offsetLeft * -1;
          } else
          {
            translate(slides[index].offsetLeft * -1, rewindSpeed, ease);
            position.x = slides[index].offsetLeft * -1;
          }
          if (classNameActiveSlide) {
            setActiveElement(slice.call(slides), index);
          }
        }
        /**
           * public
           * slideTo: called on clickhandler
           */
        function slideTo(index) {
          slide(index);
        }
        /**
           * public
           * returnIndex function: called on clickhandler
           */
        function returnIndex() {
          return index - options.infinite || 0;
        }
        /**
           * public
           * prev function: called on clickhandler
           */
        function prev() {
          slide(false, false);
        }
        /**
           * public
           * next function: called on clickhandler
           */
        function next() {
          slide(false, true);
        }
        /**
           * public
           * destroy function: called to gracefully destroy the lory instance
           */
        function destroy() {
          dispatchSliderEvent('before', 'destroy');
          // remove event listeners
          frame.removeEventListener(prefixes.transitionEnd, onTransitionEnd);
          frame.removeEventListener('touchstart', onTouchstart, touchEventParams);
          frame.removeEventListener('touchmove', onTouchmove, touchEventParams);
          frame.removeEventListener('touchend', onTouchend);
          frame.removeEventListener('mousemove', onTouchmove);
          frame.removeEventListener('mousedown', onTouchstart);
          frame.removeEventListener('mouseup', onTouchend);
          frame.removeEventListener('mouseleave', onTouchend);
          frame.removeEventListener('click', onClick);
          options.window.removeEventListener('resize', onResize);
          if (prevCtrl) {
            prevCtrl.removeEventListener('click', prev);
          }
          if (nextCtrl) {
            nextCtrl.removeEventListener('click', next);
          }
          // remove cloned slides if infinite is set
          if (options.infinite) {
            Array.apply(null, Array(options.infinite)).forEach(function () {
              slideContainer.removeChild(slideContainer.firstChild);
              slideContainer.removeChild(slideContainer.lastChild);
            });
          }
          dispatchSliderEvent('after', 'destroy');
        }
        // event handling
        var touchOffset = void 0;
        var delta = void 0;
        var isScrolling = void 0;
        function onTransitionEnd() {
          if (transitionEndCallback) {
            transitionEndCallback();
            transitionEndCallback = undefined;
          }
        }
        function onTouchstart(event) {
          var _options6 = options,enableMouseEvents = _options6.enableMouseEvents;
          var touches = event.touches ? event.touches[0] : event;
          if (enableMouseEvents) {
            frame.addEventListener('mousemove', onTouchmove);
            frame.addEventListener('mouseup', onTouchend);
            frame.addEventListener('mouseleave', onTouchend);
          }
          frame.addEventListener('touchmove', onTouchmove, touchEventParams);
          frame.addEventListener('touchend', onTouchend);
          var pageX = touches.pageX,pageY = touches.pageY;
          touchOffset = {
            x: pageX,
            y: pageY,
            time: Date.now() };

          isScrolling = undefined;
          isTouching = true;
          delta = {};
          dispatchSliderEvent('on', 'touchstart', {
            event: event });

        }
        function onTouchmove(event) {
          var touches = event.touches ? event.touches[0] : event;
          var pageX = touches.pageX,pageY = touches.pageY;
          delta = {
            x: pageX - touchOffset.x,
            y: pageY - touchOffset.y };

          if (typeof isScrolling === 'undefined') {
            isScrolling = !!(isScrolling || Math.abs(delta.x) < Math.abs(delta.y));
          }
          if (!isScrolling && touchOffset) {
            translate(position.x + delta.x, 0, null);
          }
          // may be
          dispatchSliderEvent('on', 'touchmove', {
            event: event });

        }
        function onTouchend(event) {
          /**
                                     * time between touchstart and touchend in milliseconds
                                     * @duration {number}
                                     */
          var duration = touchOffset ? Date.now() - touchOffset.time : undefined;
          /**
                                                                                   * is valid if:
                                                                                   *
                                                                                   * -> swipe attempt time is over 300 ms
                                                                                   * and
                                                                                   * -> swipe distance is greater than 25px
                                                                                   * or
                                                                                   * -> swipe distance is more then a third of the swipe area
                                                                                   *
                                                                                   * @isValidSlide {Boolean}
                                                                                   */
          var isValid = Number(duration) < 300 && Math.abs(delta.x) > 25 || Math.abs(delta.x) > frameWidth / 3;
          /**
                                                                                                                 * is out of bounds if:
                                                                                                                 *
                                                                                                                 * -> index is 0 and delta x is greater than 0
                                                                                                                 * or
                                                                                                                 * -> index is the last slide and delta is smaller than 0
                                                                                                                 *
                                                                                                                 * @isOutOfBounds {Boolean}
                                                                                                                 */
          var isOutOfBounds = !index && delta.x > 0 || index === slides.length - 1 && delta.x < 0;
          var direction = delta.x < 0;
          if (!isScrolling) {
            if (isValid && !isOutOfBounds) {
              slide(false, direction);
            } else
            {
              translate(position.x, options.snapBackSpeed);
            }
          }
          touchOffset = undefined;
          isTouching = false;
          /**
                               * remove eventlisteners after swipe attempt
                               */
          frame.removeEventListener('touchmove', onTouchmove);
          frame.removeEventListener('touchend', onTouchend);
          frame.removeEventListener('mousemove', onTouchmove);
          frame.removeEventListener('mouseup', onTouchend);
          frame.removeEventListener('mouseleave', onTouchend);
          dispatchSliderEvent('on', 'touchend', {
            event: event });

        }
        function onClick(event) {
          if (delta.x) {
            event.preventDefault();
          }
        }
        function onResize(event) {
          reset();
          dispatchSliderEvent('on', 'resize', {
            event: event });

        }
        // trigger initial setup
        setup();
        function getIsTouching() {
          return isTouching;
        }
        // expose public api
        return {
          setup: setup,
          reset: reset,
          slideTo: slideTo,
          returnIndex: returnIndex,
          prev: prev,
          next: next,
          destroy: destroy,
          isTouching: getIsTouching };

      }
      lory = _lory;
    })();
    // end of internal private lory.js implementation

  }, { "./dom-utils": 7 }], 6: [function (require, module, exports) {
    "use strict";
    (function (window) {
      if (window.connectif) {
        return;
      }var _require2 =
      require('./dom-utils'),createTag = _require2.createTag,removeElement = _require2.removeElement,getAllAncestorsFromElement = _require2.getAllAncestorsFromElement,listByClass = _require2.listByClass,triggerEvent = _require2.triggerEvent;var _require3 =
      require('./carousel'),initializeCarousels = _require3.initializeCarousels;var _require4 =
      require('./web-content'),_showWebContent = _require4.showWebContent,isSomeWebContentOpened = _require4.isSomeWebContentOpened;
      var atob = require('abab/lib/atob');
      var btoa = require('abab/lib/btoa');
      var _baseUrl;
      var _token;
      var _serviceWorkerUrl;
      var _vapidPublicKey;
      var _swRegistration;
      var _iframeContentWindow;
      var _iframeCallbacks = {};
      var _iframeSource;
      var _iframeReadyTimeout;
      var doc = window.document;
      var hookHandlers = {};
      window.connectif = {
        version: '1.3.0',
        initialize: initialize,
        triggerEvent: _triggerEvent,
        set: set,
        get: get,
        getAsync: getAsync,
        unset: unset,
        getClientInfo: getClientInfo,
        getPageVisitEvent: getPageVisitEvent,
        getVisitedProductEvents: getVisitedProductEvents,
        getSearchedProductEvents: getSearchedProductEvents,
        getProductsNotFoundEvents: getProductsNotFoundEvents,
        getLoginEvent: getLoginEvent,
        getRegisterEvent: getRegisterEvent,
        getSearchEvent: getSearchEvent,
        getNewsletterSubscribeEvent: getNewsletterSubscribeEvent,
        getPurchaseEvents: getPurchaseEvents,
        getCartModel: getCartModel,
        getEmbeddedBlockPlaceholderIds: getEmbeddedBlockPlaceholderIds,
        getPushSubscription: getPushSubscription,
        getPageInfo: getPageInfo,
        sendData: sendData,
        isSomeModalOpened: isSomeModalOpened,
        hideModal: hideModal,
        showModal: showModal,
        showBanner: showBanner,
        showWebContent: function showWebContent(webContentDisplay) {return _showWebContent(doc, webContentDisplay);},
        isSomeWebContentOpened: isSomeWebContentOpened,
        subscribeToPushNotifications: subscribeToPushNotifications,
        unsubscribeFromPushNotification: unsubscribeFromPushNotification,
        doesPushSubscriptionPublicKeyMatch: doesPushSubscriptionPublicKeyMatch,
        onEmbeddedFormSubmit: null,
        onModalOpened: null,
        onModalClosed: null,
        onAskForPushNotifications: null,
        initializeCarousels: initializeCarousels,
        addHookHandler: addHookHandler,
        removeHookHandler: removeHookHandler,
        setInnerHtmlWithScripts: _setInnerHtmlWithScripts };

      _triggerEvent('connectif.loaded');
      function initialize(config, onInitialized) {
        if (typeof config !== 'object' || typeof config.token !== 'string') {
          throw Error('Connectif: config.token must be provided on initialize');
        }
        _token = config.token;
        _serviceWorkerUrl = config.serviceWorkerUrl;
        _vapidPublicKey = config.vapidPublicKey;
        _baseUrl = config.baseUrl;
        _iframeSource = config.iframeSource;
        Promise.all([
        initIframe(),
        initPushNotifications()]).
        then(function () {
          if (typeof onInitialized === 'function') {
            onInitialized();
          }
          _triggerEvent('connectif.initialized');
        });
      }
      function initPushNotifications() {
        return new Promise(function (resolve) {
          if (_vapidPublicKey && _serviceWorkerUrl && 'serviceWorker' in navigator && 'PushManager' in window) {
            return navigator.serviceWorker.register(_serviceWorkerUrl).
            then(function (swReg) {
              _swRegistration = swReg;
              resolve();
            }, resolve);
          } else
          {
            resolve();
          }
        });
      }
      function initIframe() {
        return new Promise(function (resolve) {
          if (!_iframeSource) {
            resolve();
            return;
          }
          window.addEventListener('message', function (event) {
            if (event.data.id === 'ready') {
              clearTimeout(_iframeReadyTimeout);
              resolve();
              return;
            } else
            if (event.data.id === 'connectif.3PCookiesNotAllowed') {
              _iframeSource = null;
              resolve();
              return;
            }
            var callback = _iframeCallbacks[event.data.id];
            if (callback) {
              delete _iframeCallbacks[event.data.id];
              callback(event.data.value);
            }
          });
          var existingIframe = document.getElementById('connectif-iframe');
          if (existingIframe) {
            _iframeContentWindow = existingIframe.contentWindow;
            checkReady();
          } else
          {
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', _iframeSource);
            iframe.setAttribute('style', 'display: none;');
            iframe.setAttribute('width', 0);
            iframe.setAttribute('height', 0);
            document.body.appendChild(iframe);
            _iframeContentWindow = iframe.contentWindow;
          }
        });
      }
      function checkReady() {
        _iframeContentWindow.postMessage({ method: 'check-ready' }, _iframeSource);
        _iframeReadyTimeout = setTimeout(checkReady, 100);
      }
      function addHookHandler(hook, handler) {
        if (typeof handler !== 'function') {
          throw new Error('handler must be a function');
        }
        if (typeof hook !== 'string') {
          throw new Error('hook must be a string');
        }
        if (!(hook in hookHandlers)) {
          hookHandlers[hook] = [];
        }
        hookHandlers[hook].push(handler);
      }
      function removeHookHandler(hook, handler) {
        if (typeof handler !== 'function') {
          throw new Error('handler must be a function');
        }
        if (typeof hook !== 'string') {
          throw new Error('hook must be a string');
        }
        if (Array.isArray(hookHandlers[hook])) {
          var index = hookHandlers[hook].indexOf(handler);
          if (index >= 0) {
            hookHandlers[hook].splice(index, 1);
          }
        }
      }
      function executeHook(hook, data, callback) {
        if (!(hook in hookHandlers) || hookHandlers[hook].length === 0) {
          callback(data);
          return;
        }
        var handlers = hookHandlers[hook].slice();
        _executeHook(data, 0);
        function _executeHook(data, index) {
          if (handlers.length === index) {
            callback(data);
            return;
          }
          var handler = handlers[index];
          handler(data, function done(error, data) {
            if (error) {
              console.error(error);
            }
            _executeHook(data, index += 1);
          });
        }
      }
      function _triggerEvent(eventName, detail) {
        return triggerEvent(doc, eventName, detail);
      }
      function set(key, value) {
        window.localStorage.setItem(key, value);
        if (_iframeSource) {
          _iframeContentWindow.postMessage({
            method: 'set',
            key: getSharedKey(key),
            value: value },
          _iframeSource);
        }
      }
      /**
         * @deprecated use getAsync()
         */
      function get(key) {
        if (_iframeSource) {
          throw Error('connectif: Cannot use get method when cross domain storage is enabled');
        }
        return window.localStorage.getItem(key);
      }
      function getAsync(key) {
        if (!_iframeSource) {
          return Promise.resolve(window.localStorage.getItem(key));
        } else
        {
          return new Promise(function (resolve) {
            var id = Math.random().toString(36).substr(2, 9);
            _iframeCallbacks[id] = resolve;
            _iframeContentWindow.postMessage({
              method: 'get',
              key: getSharedKey(key),
              id: id },
            _iframeSource);
          }).then(function (value) {
            if (value === null) {
              value = window.localStorage.getItem(key);
              if (value !== null) {
                set(key, value);
                _iframeContentWindow.postMessage({
                  method: 'set',
                  key: getSharedKey(key),
                  value: value },
                _iframeSource);
              }
            }
            return value;
          });
        }
      }
      function unset(key) {
        window.localStorage.removeItem(key);
        if (_iframeSource) {
          _iframeContentWindow.postMessage({
            method: 'remove',
            key: getSharedKey(key) },
          _iframeSource);
        }
      }
      function getSharedKey(key) {
        return _token + '_' + key;
      }
      function getClientInfo() {
        var clientInfoElm = listByClass(doc, 'cn_client_info')[0];
        var clientInfo = {};
        if (!clientInfoElm || !clientInfoElm.children) {
          return clientInfo;
        }
        var entityProps = clientInfoElm.children;
        for (var i = 0; i < entityProps.length; i++) {
          var propName = entityProps[i].className;
          if (propName === 'primary_key') {
            clientInfo.primaryKey = _getText(listByClass(clientInfoElm, propName)[0]);
          } else
          if (propName === 'tracker_id') {
            clientInfo.trackerId = _getText(listByClass(clientInfoElm, propName)[0]);
          } else
          if (propName === '_email_status') {
            clientInfo._emailStatus = _getText(listByClass(clientInfoElm, propName)[0]);
          } else
          if (propName === '_newsletter_subscription_status') {
            clientInfo._newsletterSubscriptionStatus = _getText(listByClass(clientInfoElm, propName)[0]);
          } else
          {
            clientInfo[propName] = _getText(listByClass(clientInfoElm, propName)[0]);
          }
        }
        return clientInfo;
      }
      function getPageVisitEvent() {
        return { type: 'page-visit' };
      }
      function getVisitedProductEvents() {
        return _getListOfProductsModel(doc, 'cn_product_visited').
        map(function (model) {return { type: 'product-visited', product: model };});
      }
      function getSearchedProductEvents() {
        return _getListOfProductsModel(doc, 'cn_product_searched').
        map(function (model) {return { type: 'product-searched', product: model };});
      }
      function getProductsNotFoundEvents() {
        return listByClass(doc, 'cn_product_not_found').map(_getProductModel).
        filter(function (model) {return !!model.productId;}).
        map(function (model) {return { type: 'product-not-found', productId: model.productId };});
      }
      function getLoginEvent() {
        return listByClass(doc, 'cn_login')[0] ? { type: 'login' } : undefined;
      }
      function getRegisterEvent() {
        return listByClass(doc, 'cn_register')[0] ? { type: 'register' } : undefined;
      }
      function getSearchEvent() {
        var element = listByClass(doc, 'cn_search')[0];
        var searchText = _getText(listByClass(element, 'search_text')[0]);
        return searchText ? { type: 'search', searchText: searchText } : undefined;
      }
      function getNewsletterSubscribeEvent() {
        var element = listByClass(doc, 'cn_newsletter_subscribe')[0];
        var email = _getText(listByClass(element, 'email')[0]);
        return element ? { type: 'newsletter-subscribe', email: email } : undefined;
      }
      function getPurchaseEvents() {
        return listByClass(doc, 'cn_purchase').map(function (element) {return _getPurchaseModel(element);}).
        filter(function (model) {return model.purchaseId && model.totalQuantity >= 0 && model.totalPrice >= 0;}).
        map(function (model) {return { type: 'purchase', purchase: model };});
      }
      function getCartModel() {
        var model = _getCartModel(listByClass(doc, 'cn_cart')[0]);
        return model.cartId && model.totalQuantity >= 0 && model.totalPrice >= 0 ? model : undefined;
      }
      function getEmbeddedBlockPlaceholderIds() {
        return listByClass(doc, 'cn_banner_placeholder').map(function (element) {
          return element.id;
        }).filter(_isFulfilledText);
      }
      function getPageInfo() {
        return {
          categories: listByClass(doc, 'cn_page_category').map(_getText).filter(_isFulfilledText).slice(0, 10),
          title: document.title.substring(0, 50),
          keywords: _getMetaKeywordsInfo(),
          tags: listByClass(doc, 'cn_page_tag').map(_getText).filter(_isFulfilledText).
          map(function (t) {return t.trim().substring(0, 25);}).slice(0, 10) };

      }
      function _getMetaKeywordsInfo() {
        var keywords = [],keywordsString,metaKeywords = document.querySelector("meta[name='keywords']");
        if (metaKeywords) {
          keywordsString = metaKeywords.getAttribute('content');
        }
        if (keywordsString) {
          keywords = keywordsString.split(',');
          keywords.map(function (k) {return k.trim().substring(0, 25);});
          keywords.slice(0, 10);
        }
        return keywords;
      }
      function isValidSubscription(subscription) {
        if (!subscription || typeof subscription.toJSON !== 'function') {
          return false;
        }
        var s = subscription.toJSON();
        return typeof s.endpoint === 'string' &&
        s.keys &&
        typeof s.keys.p256dh === 'string' && s.keys.p256dh.length > 0 &&
        typeof s.keys.auth === 'string' && s.keys.auth.length > 0;
      }
      function getPushSubscription() {
        if (!_token) {
          throw Error('Connectif: cannot getSubscription before initialize');
        }
        if (_swRegistration) {
          return _swRegistration.pushManager.getSubscription().
          then(function (subscription) {return isValidSubscription(subscription) ? subscription : undefined;});
        } else
        {
          return Promise.resolve();
        }
      }
      function sendData(data, callback) {
        if (!_token) {
          throw Error('Connectif: cannot sendData before initialize');
        }
        if (typeof data !== 'object' || data === null) {
          throw Error('Connectif: invalid data to send: ' + data);
        }
        data.browserInfo = data.browserInfo || {
          windowWidth: window.outerWidth,
          windowHeight: window.outerHeight,
          screenHeight: window.screen.height,
          screenWidth: window.screen.width,
          colorDepth: screen.colorDepth,
          cookieEnabled: navigator.cookieEnabled,
          language: navigator.language,
          platform: navigator.platform,
          url: encodeURIComponent(window.location.href),
          referer: document.referrer,
          device: typeof window.matchMedia === 'function' && window.matchMedia('only screen and (max-width: 760px)').matches ? 'mobile' : 'desktop' };

        executeHook('before-send-data', data, function (data) {
          var req = new (XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
          req.open('POST', _baseUrl + 'integration-type/system/scrippet-notification/' + _token, 1);
          req.setRequestHeader('Content-type', 'text/plain');
          req.onreadystatechange = function () {
            req.readyState > 3 && callback && callback(JSON.parse(req.responseText), req);
          };
          req.send(JSON.stringify(data));
        });
      }
      function isSomeModalOpened() {
        return listByClass(doc, 'cn_modal_iframe').length > 0;
      }
      function hideModal(webModal) {
        removeElement(doc.getElementById('cn_modal_overlay_' + webModal.uuid));
        removeElement(doc.getElementById('cn_modal_backdrop_' + webModal.uuid));
        if (typeof window.connectif.onModalClosed === 'function') {
          window.connectif.onModalClosed(webModal);
        }
      }
      function showModal(webModal) {
        executeHook('before-show-modal', {
          webModal: webModal },
        function (data) {
          webModal = data.webModal;
          var overlay = createTag(doc, 'div', {
            id: 'cn_modal_overlay_' + webModal.uuid,
            className: 'cn_modal_overlay' },
          {
            backgroundColor: 'rgba(35, 41, 47, 0.3)',
            position: 'fixed',
            top: '0',
            bottom: '0',
            left: '0',
            right: '0',
            width: '100%',
            height: '100%',
            zIndex: '10000' });

          doc.body.appendChild(overlay);
          var iframe = createTag(doc, 'iframe', {
            id: 'cn_modal_iframe_' + webModal.uuid,
            className: 'cn_modal_iframe' },
          {
            border: 'none',
            padding: '0',
            margin: '0',
            width: '100%',
            height: '100%',
            overflow: 'auto' });

          var backdrop = createTag(doc, 'div', {
            id: 'cn_modal_backdrop_' + webModal.uuid,
            className: 'cn_modal_backdrop ' + webModal.enterAnimation },
          {
            display: 'none',
            backgroundColor: 'transparent',
            position: 'fixed',
            top: '0',
            bottom: '0',
            left: '0',
            right: '0',
            width: '100%',
            height: '100%',
            zIndex: '10001',
            overflow: 'hidden',
            cursor: 'pointer',
            boxSizing: 'border-box' });

          backdrop.appendChild(iframe);
          doc.body.appendChild(backdrop);
          var iframedoc = iframe.contentDocument || iframe.contentWindow.document;
          iframe.onload = onIframeLoad;
          iframedoc.open();
          iframedoc.write(webModal.html);
          iframedoc.close();
          var forms = iframedoc.getElementsByClassName('cn__form');
          for (var i = 0; i < forms.length; i++) {
            if (webModal.contentId) {
              forms[i].setAttribute('data-cn-content-id', webModal.contentId);
            }
            if (webModal.workflowDefinitionId) {
              forms[i].setAttribute('data-cn-workflow-definition-id', webModal.workflowDefinitionId);
            }
            if (webModal.uuid) {
              forms[i].setAttribute('data-cn-send-uuid', webModal.uuid);
            }
          }
          function onIframeLoad() {
            iframedoc = iframe.contentDocument || iframe.contentWindow.document;
            backdrop.style.display = 'block';
            if (typeof window.connectif.onModalOpened === 'function') {
              window.connectif.onModalOpened(webModal, iframedoc);
            }
            // Initialize carousels if any
            if (typeof window.connectif.initializeCarousels === 'function') {
              window.connectif.initializeCarousels(iframedoc, webModal);
            }
            // click handler for closing modal
            iframedoc.addEventListener('click', function (event) {
              var ancestors = getAllAncestorsFromElement(event.target);
              var askForPush = false;
              var closed = ancestors.some(function (element) {
                if (element.getAttribute('href') === '#__cn_ask_for_push_subscription') {
                  askForPush = true;
                  return true;
                }
                return element.getAttribute('href') === '#__cn_close_modal';
              });
              closed = closed || webModal.closeOnBackdropClick && !ancestors.some(function (element) {
                return element.classList.contains('cn_content');
              });
              if (askForPush && typeof window.connectif.onAskForPushNotifications === 'function') {
                window.connectif.onAskForPushNotifications();
              }
              if (closed) {
                hideModal(webModal);
                event.preventDefault();
                return false;
              }
            });
            // set all <a> tags a target="_blank" or a target="_top"
            _listByTagName(iframedoc, 'a').forEach(function (a) {
              if (a.getAttribute('target') !== '_blank') {
                a.setAttribute('target', '_top');
              }
            });
            // handle embedded forms
            _listByTagName(iframedoc, 'form').forEach(function (form) {
              if (form.hasAttribute('data-cn-embedded-form')) {
                form.onsubmit = window.connectif.onEmbeddedFormSubmit;
              }
            });
          }
        });
      }
      function showBanner(banner, callback) {
        if (!banner || !banner.placeholderBannerId) {
          return;
        }
        executeHook('before-show-banner', {
          banner: banner,
          placeholderElement: doc.getElementById(banner.placeholderBannerId) },
        function (data) {
          banner = data.banner;
          var element = data.placeholderElement;
          if (element) {
            _setInnerHtmlWithScripts(element, banner.html);
            var forms = element.getElementsByClassName('cn__form');
            for (var i = 0; i < forms.length; i++) {
              if (banner.contentId) {
                forms[i].setAttribute('data-cn-content-id', banner.contentId);
              }
              if (banner.workflowDefinitionId) {
                forms[i].setAttribute('data-cn-workflow-definition-id', banner.workflowDefinitionId);
              }
            }
          }
          // Initialize carousels if any
          if (typeof window.connectif.initializeCarousels === 'function') {
            window.connectif.initializeCarousels(element, banner);
          }
          if (typeof callback === 'function') {
            callback(data);
          }
        });
      }
      function _setInnerHtmlWithScripts(elm, html) {
        elm.innerHTML = html;
        var scripts = elm.getElementsByTagName("script");
        // If we don't clone the results then "scripts"
        // will actually update live as we insert the new
        // tags, and we'll get caught in an endless loop
        var scriptsClone = [];
        for (var i = 0; i < scripts.length; i++) {
          scriptsClone.push(scripts[i]);
        }
        for (var i = 0; i < scriptsClone.length; i++) {
          var currentScript = scriptsClone[i];
          var s = document.createElement("script");
          // Copy all the attributes from the original script
          for (var j = 0; j < currentScript.attributes.length; j++) {
            var a = currentScript.attributes[j];
            s.setAttribute(a.name, a.value);
          }
          s.appendChild(document.createTextNode(currentScript.innerHTML));
          currentScript.parentNode.replaceChild(s, currentScript);
        }
      }
      function _getListOfProductsModel(element, className, extended) {
        return listByClass(element, className).map(function (element) {return _getProductModel(element, extended);}).
        filter(function (model) {return model.name && model.productDetailUrl && model.productId && model.unitPrice >= 0;});
      }
      function _getProductModel(element, extended) {
        var model = {
          name: _getText(listByClass(element, 'name')[0]),
          productDetailUrl: _getText(listByClass(element, 'url')[0]),
          productId: _getText(listByClass(element, 'product_id')[0]),
          unitPrice: _getFloat(listByClass(element, 'unit_price')[0]),
          availability: _getText(listByClass(element, 'availability')[0]),
          imageUrl: _getText(listByClass(element, 'image_url')[0]),
          description: _getText(listByClass(element, 'description')[0]),
          thumbnailUrl: _getText(listByClass(element, 'thumbnail_url')[0]),
          priority: _getInt(listByClass(element, 'priority')[0]),
          rating: _getFloat(listByClass(element, 'rating_value')[0]),
          reviewCount: _getInt(listByClass(element, 'review_count')[0]),
          categories: listByClass(element, 'category').map(_getText).filter(_isFulfilledText),
          tags: listByClass(element, 'tag').map(_getText).filter(_isFulfilledText),
          relatedExternalProductIds: listByClass(element, 'related_external_product_id').map(_getText).filter(_isFulfilledText),
          unitPriceOriginal: _getFloat(listByClass(element, 'unit_price_original')[0]),
          unitPriceWithoutVAT: _getFloat(listByClass(element, 'unit_price_without_vat')[0]),
          discountedAmount: _getFloat(listByClass(element, 'discounted_amount')[0]),
          discountedPercentage: _getFloat(listByClass(element, 'discounted_percentage')[0]),
          ratingCount: _getInt(listByClass(element, 'rating_count')[0]),
          brand: _getText(listByClass(element, 'brand')[0]),
          customField1: _getText(listByClass(element, 'custom_field_1')[0]),
          customField2: _getText(listByClass(element, 'custom_field_2')[0]),
          customField3: _getText(listByClass(element, 'custom_field_3')[0]) };

        if (extended) {
          model.quantity = _getInt(listByClass(element, 'quantity')[0]);
          model.price = _getFloat(listByClass(element, 'price')[0]);
        }
        return model;
      }
      function _getCartModel(element) {
        return {
          cartId: _getText(listByClass(element, 'cart_id')[0]),
          totalQuantity: _getInt(listByClass(element, 'total_quantity')[0]),
          totalPrice: _getFloat(listByClass(element, 'total_price')[0]),
          products: _getListOfProductsModel(element, 'product_basket_item', true) };

      }
      function _getPurchaseModel(element) {
        var model = _getCartModel(element);
        model.purchaseId = _getText(listByClass(element, 'purchase_id')[0]);
        model.paymentMethod = _getText(listByClass(element, 'payment_method')[0]);
        model.purchaseDate = _getText(listByClass(element, 'purchase_date')[0]);
        return model;
      }
      function _listByTagName(element, tagName) {
        if (!element) {
          return [];
        }
        return [].slice.call(element.getElementsByTagName(tagName));
      }
      function _getText(element) {
        if (!element) {
          return;
        }
        return _getElementValue(element).trim();
      }
      function _getFloat(element) {
        if (!element) {
          return;
        }
        var text = _getElementValue(element).trim();
        var _float = parseFloat(text);
        if (!isNaN(_float) && isFinite(_float)) {
          return _float;
        }
      }
      function _getInt(element) {
        if (!element) {
          return;
        }
        var text = _getElementValue(element).trim();
        var _int = parseInt(text, 10);
        if (!isNaN(_int) && isFinite(_int)) {
          return _int;
        }
      }
      function _getElementValue(element) {
        return element.innerText || element.textContent;
      }
      function _isNilOrEmpty(text) {
        return text === null || text === undefined || text === '';
      }
      function _isFulfilledText(text) {
        return !_isNilOrEmpty(text);
      }
      function subscribeToPushNotifications(callback) {
        if (typeof callback !== 'function') {
          callback = function callback() {};
        }
        if (!_swRegistration) {
          callback(null, null);
          return;
        }
        return _swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: _urlB64ToUint8Array(_vapidPublicKey) }).

        then(function (subscription) {
          if (!isValidSubscription(subscription)) {
            callback(Error('Connectif: The subscription is not valid'));
          } else
          {
            callback(null, subscription.toJSON());
          }
        }, callback);
      }
      function unsubscribeFromPushNotification(subscription) {
        return subscription.unsubscribe();
      }
      function doesPushSubscriptionPublicKeyMatch(subscription) {
        var applicationServerKey = subscription.options.applicationServerKey;
        return btoa(new Uint8Array(applicationServerKey)) === btoa(_urlB64ToUint8Array(_vapidPublicKey));
      }
      function _urlB64ToUint8Array(base64String) {
        var padding = repeat('=', (4 - base64String.length % 4) % 4);
        var base64 = (base64String + padding).
        replace(/\-/g, '+').
        replace(/_/g, '/');
        var rawData = atob(base64);
        // NOTE: abab/lib/atob returns null if not valid param is provided
        if (!rawData) {
          return [];
        }
        var outputArray = new Uint8Array(rawData.length);
        for (var i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        function repeat(stringElement, count) {
          return new Array(count + 1).join(stringElement);
        }
        return outputArray;
      }
    })(window);

  }, { "./carousel": 5, "./dom-utils": 7, "./web-content": 12, "abab/lib/atob": 1, "abab/lib/btoa": 2 }], 7: [function (require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createTag(doc, tagName, attrs, style) {if (attrs === void 0) {attrs = {};}if (style === void 0) {style = {};}
      var element = doc.createElement(tagName);
      Object.keys(attrs).forEach(function (attrKey) {return element[attrKey] = attrs[attrKey];});
      Object.keys(style).forEach(function (styleKey) {return element.style[styleKey] = style[styleKey];});
      return element;
    }
    exports.createTag = createTag;
    function removeElement(element) {
      var _a;
      (_a = element === null || element === void 0 ? void 0 : element.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(element);
    }
    exports.removeElement = removeElement;
    function getAllAncestorsFromElement(element) {
      var ancestors = [];
      while (element.parentNode) {
        ancestors.push(element);
        element = element.parentNode;
      }
      return ancestors;
    }
    exports.getAllAncestorsFromElement = getAllAncestorsFromElement;
    function listByClass(element, className) {
      if (!element) {
        return [];
      }
      return [].slice.call(element.getElementsByClassName(className));
    }
    exports.listByClass = listByClass;
    function disableScroll(doc) {
      if (doc.defaultView && doc.defaultView.innerWidth > doc.documentElement.clientWidth) {
        var scrollBarWidth = doc.defaultView.innerWidth - doc.documentElement.clientWidth;var _doc$documentElement$ =
        doc.documentElement.style,overflow = _doc$documentElement$.overflow,paddingRight = _doc$documentElement$.paddingRight;
        doc.documentElement.style.overflow = 'hidden';
        doc.documentElement.style.paddingRight = scrollBarWidth + "px";
        return { overflow: overflow, paddingRight: paddingRight };
      }
      return {};
    }
    exports.disableScroll = disableScroll;
    function restoreScroll(doc, status) {
      var _a, _b;
      doc.documentElement.style.overflow = (_a = status.overflow) !== null && _a !== void 0 ? _a : '';
      doc.documentElement.style.paddingRight = (_b = status.paddingRight) !== null && _b !== void 0 ? _b : '';
    }
    exports.restoreScroll = restoreScroll;
    function addStyle(doc, id, css) {
      var existing = doc.getElementById(id);
      if (existing) {
        return existing;
      }
      var style = createTag(doc, 'style', { id: id, type: 'text/css' });
      style.appendChild(document.createTextNode(css));
      doc.head.appendChild(style);
      return style;
    }
    exports.addStyle = addStyle;
    function triggerEvent(doc, eventName, detail) {
      if (typeof window.CustomEvent === 'function' && doc) {
        return doc.dispatchEvent(new window.CustomEvent(eventName, { detail: detail }));
      }
      return true;
    }
    exports.triggerEvent = triggerEvent;

  }, {}], 8: [function (require, module, exports) {
    "use strict";
    require('./promise-polyfill');
    require('./connectif.js');
    (function (window) {
      function initializeConnectif(conf) {
        if (!Array.isArray(conf.forms)) {
          conf.forms = [];
        }
        if (!Array.isArray(conf.webEventPayloadDefinitions)) {
          conf.webEventPayloadDefinitions = [];
        }
        var connectif = window.connectif;
        getAndRemoveCnTrackerFromLocationSearch();
        var managed = {
          sendEvents: sendEvents,
          getAllEvents: getAllEvents,
          getAllEventsAsync: getAllEventsAsync,
          deepEquals: deepEquals,
          isExcludedPage: isExcludedPage,
          getSamplingValue: getSamplingValue,
          isAllowedDomain: isAllowedDomain };

        connectif.managed = managed;
        var doc = window.document;
        var _webModals = {
          onLeavePage: null,
          onScroll: null,
          onTimer: null };

        var _readyWebContents = [];
        var _waitingWebContents = [];
        var samplingValue = conf.samplingValue || Math.floor(Math.random() * 100); // random value between 0-100
        var webModalOnTimerTimeout = null;
        var currentOpenedModal = null;
        var lastSubmittedFormPrimaryKey = undefined;
        var sendModalCloseEvent = true;
        var inactiveSince = new Date();
        window.addEventListener('scroll', onWindowScrolled);
        doc.addEventListener('mouseout', onDocumentMouseOut);
        ['mousemove', 'click', 'keydown', 'change', 'wheel', 'scroll'].forEach(function (eventName) {
          window.addEventListener(eventName, onWindowActivity);
        });
        setInterval(onActivityCheckerIntervalExpired, 1000);
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          setTimeout(initialize, 0);
        } else
        {
          doc.addEventListener('DOMContentLoaded', initialize);
        }
        function getAndRemoveCnTrackerFromLocationSearch() {
          var regexRecToken = /[\?&]__cn_tracker=([^&#]*)/i;
          var resultsRecToken = regexRecToken.exec(location.search);
          if (resultsRecToken) {
            var cnTrackerToken = decodeURIComponent(resultsRecToken[1].replace(/\+/g, ' ')).substring(0, 24);
            connectif.set('cn_tracker', JSON.stringify({ id: cnTrackerToken }));
            var paramRecToken = resultsRecToken[0].substring(1);
            var query = location.search.
            replace('?' + paramRecToken + '&', '?').
            replace('?' + paramRecToken, '').
            replace('&' + paramRecToken, '');
            if (location.hash) {
              query += location.hash;
            }
            history.replaceState(null, '', location.pathname + query);
          }
        }
        function initialize() {
          connectif.onModalOpened = onModalOpened;
          connectif.onModalClosed = onModalClosed;
          connectif.onEmbeddedFormSubmit = onEmbeddedFormSubmit;
          connectif.onAskForPushNotifications = onAskForPushNotifications;
          initializeIntegratedForms();
          initializeWebEventPayloadDefinitions();
          connectif.initialize(conf, onInitialized);
          doc.addEventListener('connectif.webContent.afterClose', onCloseWebContent);
        }
        function onInitialized(error) {
          if (error) {
            throw Error(error);
          }
          connectif.triggerEvent('connectif.managed.initialized');
          if (conf.autoSendEventsOnInit) {
            getAllEventsAsync().then(sendEvents);
          }
          initializeEmbeddedForms();
        }
        function initializeEmbeddedForms(domElement) {
          if (!domElement) {
            domElement = document;
          }
          var forms = Array.prototype.slice.call(domElement.querySelectorAll('[data-cn-embedded-form]:not(.cn__initialized)'));
          var client = connectif.getClientInfo();
          var entityInfo = {
            trackerId: client.trackerId,
            primaryKey: client.primaryKey };

          return getTrackerAndPrimaryKeyInfo(entityInfo).then(function (trackerAndPrimaryKeyInfo) {
            forms.forEach(function (form) {
              Object.keys(client).forEach(function (key) {
                if (key === 'trackerId' || key === 'primaryKey') {
                  return;
                }
                addInputField(form, key, client[key]);
              });
              addInputField(form, 'eventType', 'form-submitted');
              addInputField(form, 'formId', form.getAttribute('data-form-id'));
              addInputField(form, 'contentId', form.getAttribute('data-cn-content-id'));
              addInputField(form, 'workflowDefinitionId', form.getAttribute('data-cn-workflow-definition-id'));
              addInputField(form, 'sendUuid', form.getAttribute('data-cn-send-uuid'));
              addInputField(form, 'redirectUrl', form.getAttribute('data-cn-redirect-url'));
              addInputField(form, 'primaryKeyFieldName', form.getAttribute('data-cn-primary-key-field-name'));
              addInputField(form, 'primaryKey', trackerAndPrimaryKeyInfo.primaryKey);
              addInputField(form, 'trackerId', trackerAndPrimaryKeyInfo.trackerId);
              form.classList.add('cn__initialized');
            });
          });
        }
        function addInputField(form, name, value) {
          var input = document.createElement('input');
          if (!value) {
            return;
          }
          input.setAttribute('type', 'hidden');
          input.setAttribute('name', 'cn__' + name);
          input.setAttribute('value', value);
          form.appendChild(input);
        }
        function isWebTrackingEnabled() {
          return conf.webTrackingEnabled;
        }
        function sendEvents(events, options) {
          if (typeof options !== 'object' || options === null) {
            options = {};
          }
          if (!isAllowedDomain() ||
          isExcludedPage() ||
          !isWebTrackingEnabled()) {
            if (typeof options.onResponded === 'function') {
              setTimeout(options.onResponded, 0);
            }
            return Promise.resolve();
          }
          return connectif.getPushSubscription().then(function (pushSubscription) {
            if ('Notification' in window && Notification.permission === 'granted') {
              if (pushSubscription && !connectif.doesPushSubscriptionPublicKeyMatch(pushSubscription)) {
                return connectif.unsubscribeFromPushNotification(pushSubscription).
                then(function () {return subscribeToPushNotificationsAndSendEvents();})["catch"](
                function () {return subscribeToPushNotificationsAndSendEvents();});
              }
              // Subscribe without showing (if not already subscribed)
              if (!pushSubscription) {
                return subscribeToPushNotificationsAndSendEvents();
              }
            }
            return _sendEvents();
            function subscribeToPushNotificationsAndSendEvents() {
              return new Promise(function (resolve) {
                connectif.subscribeToPushNotifications(function (err, result) {
                  pushSubscription = result;
                  return _sendEvents().then(resolve);
                });
              });
            }
            function _sendEvents() {
              var request = {
                entityInfo: options.entityInfo || connectif.getClientInfo(),
                cart: options.cart || connectif.getCartModel(),
                pushSubscription: pushSubscription,
                events: Array.isArray(events) ? events : [],
                bannerPlaceholders: connectif.getEmbeddedBlockPlaceholderIds(),
                pageInfo: connectif.getPageInfo() };

              return getTrackerAndPrimaryKeyInfo(request.entityInfo).then(function (trackerAndPrimaryKeyInfo) {
                request.entityInfo.trackerId = trackerAndPrimaryKeyInfo.trackerId;
                request.entityInfo.primaryKey = trackerAndPrimaryKeyInfo.primaryKey;
                return Promise.all([
                hasChangedEntityInfo(request.entityInfo),
                hasChangedPushSubscription(request.pushSubscription),
                removeCartIfNotModified(request)]).
                then(function (_ref) {var entityInfoChanged = _ref[0],pushSubscriptionChanged = _ref[1];
                  if (entityInfoChanged ||
                  request.cart ||
                  request.events.length > 0 ||
                  pushSubscriptionChanged) {
                    connectif.set('cn_previous_entity_info', JSON.stringify(request.entityInfo));
                    if (request.pushSubscription) {
                      connectif.set('cn_previous_push_subscription', request.pushSubscription.endpoint);
                    } else
                    {
                      connectif.unset('cn_previous_push_subscription');
                    }
                    connectif.sendData(request, function (result, xhr) {
                      onResponse(result, xhr);
                      if (typeof options.onResponded === 'function') {
                        options.onResponded();
                      }
                    });
                  } else
                  {
                    // request is skipped
                    if (typeof options.onResponded === 'function') {
                      options.onResponded();
                    }
                  }
                });
              });
            }
          });
        }
        function hasChangedEntityInfo(entityInfo) {
          return connectif.getAsync('cn_previous_entity_info').then(function (cn_previous_entity_info) {
            if (cn_previous_entity_info) {
              var prevEntityInfo = JSON.parse(cn_previous_entity_info);
              return !deepEquals(entityInfo, prevEntityInfo);
            }
            return true;
          })["catch"](function () {
            connectif.unset('cn_previous_entity_info');
            return true;
          });
        }
        function hasChangedPushSubscription(pushSubscription) {
          return connectif.getAsync('cn_previous_push_subscription').then(function (prevPushSubscription) {
            if (!pushSubscription && prevPushSubscription) {
              return true;
            }
            if (pushSubscription && !prevPushSubscription) {
              return true;
            }
            if (!pushSubscription && !prevPushSubscription) {
              return false;
            }
            if (pushSubscription && prevPushSubscription) {
              return pushSubscription.endpoint !== prevPushSubscription;
            }
          });
        }
        function deepEquals(obj1, obj2) {
          if (typeof obj1 !== typeof obj2) {
            return false;
          }
          if (Array.isArray(obj1)) {
            if (!Array.isArray(obj2)) {
              return false;
            }
            return obj1.length === obj2.length &&
            obj1.every(function (item, index) {
              return deepEquals(item, obj2[index]);
            });
          } else
          if (Array.isArray(obj2)) {
            return false;
          }
          if (typeof obj1 === 'object') {
            if (obj1 === null) {
              return obj2 === null;
            }
            return Object.keys(obj1).every(function (key) {
              return deepEquals(obj1[key], obj2[key]);
            }) &&
            Object.keys(obj2).every(function (key) {
              return deepEquals(obj1[key], obj2[key]);
            });
          }
          return obj1 === obj2;
        }
        function removeCartIfNotModified(request) {
          var currentCart = request.cart;
          if (typeof currentCart !== 'object') {
            return;
          }
          return connectif.getAsync('cn_previous_cart').then(function (cn_previous_cart) {
            if (cn_previous_cart) {
              var prevCart = JSON.parse(cn_previous_cart);
              if (areCartEquals(currentCart, prevCart)) {
                delete request.cart;
              }
            }
            connectif.set('cn_previous_cart', JSON.stringify(currentCart));
          })["catch"](function () {
            connectif.unset('cn_previous_cart');
          });
        }
        function areCartEquals(cart1, cart2) {
          return cart1.cartId === cart2.cartId &&
          cart1.totalPrice === cart2.totalPrice &&
          cart1.totalQuantity === cart2.totalQuantity &&
          Array.isArray(cart1.products) &&
          Array.isArray(cart2.products) &&
          cart1.products.length === cart2.products.length &&
          cart1.products.every(function (product1) {
            return cart2.products.some(function (product2) {
              return product1.quantity === product2.quantity &&
              product1.price === product2.price &&
              product1.productId === product2.productId;
            });
          });
        }
        function getTrackerAndPrimaryKeyInfo(entityInfo) {
          return connectif.getAsync('cn_tracker').then(function (cn_tracker) {
            var localTrackerId = cn_tracker ? JSON.parse(cn_tracker).id : undefined;
            var trackerId = entityInfo.trackerId || localTrackerId || getParameterByName('__cn_tracker');
            return {
              trackerId: trackerId ? trackerId.substring(0, 24) : undefined,
              primaryKey: lastSubmittedFormPrimaryKey || entityInfo.primaryKey };

          });
        }
        function onResponse(result, xhr) {
          connectif.set('cn_tracker', JSON.stringify({ id: result.trackerId }));
          connectif.getPushSubscription().then(function (pushSubscription) {
            var allowedToShowSubscriptionModal = true;
            if (!('Notification' in window) || Notification.permission === 'denied') {
              // Dont show if subscription is required
              allowedToShowSubscriptionModal = false;
            } else
            if (Notification.permission === 'default') {
              // Show modal
            } else
            if (Notification.permission === 'granted') {
              // Subscribe without showing (if not already subscribed)
              allowedToShowSubscriptionModal = false;
              if (!pushSubscription) {
                connectif.subscribeToPushNotifications();
              }
            }
            if (result.webModals) {
              if (result.webModals.immediate && !connectif.isSomeModalOpened() && (allowedToShowSubscriptionModal || !result.webModals.immediate.onlyShowIfPushUnsubscribed)) {
                connectif.showModal(result.webModals.immediate);
                currentOpenedModal = result.webModals.immediate;
              }
              if (result.webModals.onLeavePage && (allowedToShowSubscriptionModal || !result.webModals.onLeavePage.onlyShowIfPushUnsubscribed)) {
                _webModals.onLeavePage = result.webModals.onLeavePage;
              }
              if (result.webModals.onScroll && (allowedToShowSubscriptionModal || !result.webModals.onScroll.onlyShowIfPushUnsubscribed)) {
                _webModals.onScroll = result.webModals.onScroll;
              }
              if (result.webModals.onTimer && (allowedToShowSubscriptionModal || !result.webModals.onTimer.onlyShowIfPushUnsubscribed)) {
                _webModals.onTimer = result.webModals.onTimer;
                scheduleWebModal();
              }
            }
            if (Array.isArray(result.banners)) {
              result.banners.forEach(function (banner) {
                connectif.showBanner(banner, function onBannerShown(data) {
                  if (data.placeholderElement) {
                    initializeEmbeddedForms(data.placeholderElement);
                  }
                });
              });
            }
            if (Array.isArray(result.webContents)) {
              result.webContents.forEach(function (webContentDisplay) {
                switch (webContentDisplay.showOn) {
                  case 'immediate':
                    _readyWebContents.push(webContentDisplay);
                    break;
                  case 'on-leave-page':
                  case 'on-scroll':
                  case 'on-activity-timeout':
                    _waitingWebContents.push(webContentDisplay);
                    break;
                  case 'on-timeout':
                    _waitingWebContents.push(webContentDisplay);
                    scheduleWebContent(webContentDisplay);
                    break;}

              });
            }
            showAllReadyWebContent();
          });
        }
        function showAllReadyWebContent() {
          var events = [];
          if (!connectif.isSomeModalOpened() && !connectif.isSomeWebContentOpened(doc, ['popup', 'full-screen'])) {
            events.push.apply(events, showFirstReadyWebContentOfTypes(['popup', 'full-screen']));
          }
          if (!connectif.isSomeWebContentOpened(doc, ['slide-in'])) {
            events.push.apply(events, showFirstReadyWebContentOfTypes(['slide-in']));
          }
          if (!connectif.isSomeWebContentOpened(doc, ['floating-bar'])) {
            events.push.apply(events, showFirstReadyWebContentOfTypes(['floating-bar']));
          }
          showFirstReadyWebContentOfTypes(['inline']);
          if (events.length > 0) {
            sendEvents(events);
          }
        }
        function showFirstReadyWebContentOfTypes(webContentTypeIds) {
          var webContentDisplays = _readyWebContents.filter(function (webContentDisplay) {return webContentTypeIds.indexOf(webContentDisplay.webContent.webContentTypeId) >= 0;});
          if (webContentDisplays.length > 0) {
            var webContentToShow = webContentDisplays[0];
            _readyWebContents = _readyWebContents.filter(function (webContentDisplay) {return webContentDisplay !== webContentToShow;});
            connectif.showWebContent(webContentToShow);var
            workflowDefinitionId = webContentToShow.workflowDefinitionId,_webContentToShow$web = webContentToShow.webContent,contentId = _webContentToShow$web.id,webContentTypeId = _webContentToShow$web.webContentTypeId;
            if (webContentToShow.webContent.webContentTypeId !== 'inline') {
              return [{
                type: 'web-content-opened',
                contentId: contentId,
                webContentTypeId: webContentTypeId,
                workflowDefinitionId: workflowDefinitionId }];

            }
          }
          return [];
        }
        function onActivityCheckerIntervalExpired() {
          var inactivityDuration = new Date().getTime() - inactiveSince.getTime();
          var expiredWebContents = _waitingWebContents.filter(function (webContentDisplay) {return webContentDisplay.showOn === 'on-activity-timeout' && webContentDisplay.milliseconds < inactivityDuration;});
          expiredWebContents.forEach(moveWaitingWebContentToReady);
          showAllReadyWebContent();
        }
        function scheduleWebContent(webContentDisplay) {
          setTimeout(function () {
            moveWaitingWebContentToReady(webContentDisplay);
            showAllReadyWebContent();
          }, webContentDisplay.milliseconds);
        }
        function moveWaitingWebContentToReady(webContentDisplay) {
          _waitingWebContents = _waitingWebContents.filter(function (c) {return c !== webContentDisplay;});
          _readyWebContents.push(webContentDisplay);
        }
        function getAllEvents() {
          return getAllEventsInternal([
          getLastSubmittedFormEvent(),
          getLastCustomEvent()]);

        }
        function getAllEventsAsync() {
          return Promise.all([
          getLastSubmittedFormEventAsync(),
          getLastCustomEventAsync()]).
          then(getAllEventsInternal);
        }
        function getAllEventsInternal(_ref2) {var lastSubmittedFormEvent = _ref2[0],lastCustomEvent = _ref2[1];
          return lastSubmittedFormEvent.
          concat(lastCustomEvent).
          concat(connectif.getVisitedProductEvents()).
          concat(connectif.getSearchedProductEvents()).
          concat(connectif.getProductsNotFoundEvents()).
          concat([connectif.getLoginEvent()]).
          concat([connectif.getRegisterEvent()]).
          concat([connectif.getSearchEvent()]).
          concat([connectif.getNewsletterSubscribeEvent()]).
          concat(connectif.getPurchaseEvents()).
          concat([connectif.getPageVisitEvent()]).filter(function (event) {
            return !!event;
          });
        }
        function onDocumentMouseOut(event) {
          var isMouseOutsideDocument = event.relatedTarget === null,topOffset = 60;
          if (!isMouseOutsideDocument) {
            return;
          }
          if (_webModals.onLeavePage && event.clientY <= topOffset && !connectif.isSomeModalOpened()) {
            connectif.showModal(_webModals.onLeavePage);
            currentOpenedModal = _webModals.onLeavePage;
            _webModals.onLeavePage = null;
          }
          var webContentDisplaysOnLeavePage = _waitingWebContents.filter(function (webContentDisplay) {return webContentDisplay.showOn === 'on-leave-page';});
          webContentDisplaysOnLeavePage.forEach(moveWaitingWebContentToReady);
          showAllReadyWebContent();
        }
        function onWindowActivity() {
          inactiveSince = new Date();
        }
        function onWindowScrolled() {
          var st = window.pageYOffset || document.documentElement.scrollTop;
          var wh = window.innerHeight;
          var dh = document.documentElement.scrollHeight;
          var perc = st * 100 / (dh - wh);
          if (_webModals.onScroll && _webModals.onScroll.scrollPercentage <= perc && !connectif.isSomeModalOpened()) {
            connectif.showModal(_webModals.onScroll);
            currentOpenedModal = _webModals.onScroll;
            _webModals.onScroll = null;
          }
          var webContentDisplaysOnScroll = _waitingWebContents.filter(function (webContentDisplay) {return webContentDisplay.showOn === 'on-scroll' && webContentDisplay.scrollPercentage <= perc;});
          webContentDisplaysOnScroll.forEach(moveWaitingWebContentToReady);
          showAllReadyWebContent();
        }
        function scheduleWebModal() {
          clearTimeout(webModalOnTimerTimeout);
          webModalOnTimerTimeout = setTimeout(function () {
            if (!connectif.isSomeModalOpened()) {
              connectif.showModal(_webModals.onTimer);
              currentOpenedModal = _webModals.onTimer;
              _webModals.onTimer = null;
            }
          }, _webModals.onTimer.timerSeconds * 1000);
        }
        function onModalOpened(webModal) {
          delete webModal.html;
          sendEvents([{
            type: 'modal-opened',
            modalOpened: webModal }]);

        }
        function onModalClosed() {
          delete currentOpenedModal.html;
          if (sendModalCloseEvent) {
            sendEvents([{
              type: 'modal-closed',
              modalClosed: currentOpenedModal }]);

          }
          sendModalCloseEvent = true;
          currentOpenedModal = null;
        }
        function onCloseWebContent() {
          showAllReadyWebContent();
        }
        function onAskForPushNotifications() {
          connectif.subscribeToPushNotifications(function (error) {
            if (!error) {
              sendEvents([]);
            }
          });
        }
        function onEmbeddedFormSubmit(event) {
          event.preventDefault();
          if (!isEmbeddedFormValid(event.target)) {
            return;
          }
          var payload = getFormData(event.target);
          var pkField = event.target.getAttribute('data-cn-primary-key-field-name');
          if (pkField) {
            lastSubmittedFormPrimaryKey = payload[pkField];
          }
          sendEvents([{
            type: 'form-submitted',
            formId: event.target.getAttribute('data-form-id'),
            contentId: event.target.getAttribute('data-cn-content-id'),
            workflowDefinitionId: event.target.getAttribute('data-cn-workflow-definition-id'),
            sendUuid: event.target.getAttribute('data-cn-send-uuid'),
            payload: payload }],
          {
            onResponded: onResponded });

          function onResponded() {
            var redirectUrl = event.target.getAttribute('data-cn-redirect-url');
            if (redirectUrl) {
              var pattern = /^https?:\/\//i;
              if (!pattern.test(redirectUrl)) {
                redirectUrl = '//' + redirectUrl;
              }
              window.location.href = redirectUrl;
            }
          }
          if (currentOpenedModal) {
            sendModalCloseEvent = false;
            connectif.hideModal(currentOpenedModal);
          }
        }
        function isEmbeddedFormValid(form) {
          var validationFunctionName = 'cn__validateForm';
          var frame = window.document.querySelector('iframe.cn_modal_iframe');
          if (frame && frame.contentWindow) {
            var validationFunction = frame.contentWindow[validationFunctionName];
            if (typeof validationFunction === 'function') {
              return validationFunction(form);
            }
          }
          var windowValidationFunction = window[validationFunctionName];
          if (typeof windowValidationFunction === 'function') {
            return windowValidationFunction(form);
          }
          return true;
        }
        function getFormData(form) {
          var data = {};
          for (var i = 0; i < form.length; i += 1) {var _form$elements$i =
            form.elements[i],name = _form$elements$i.name,value = _form$elements$i.value;
            if (form.elements[i].getAttribute('type') === 'checkbox') {
              if (form.elements[i].checked) {
                if (typeof data[name] === 'string') {
                  data[name] = [data[name]];
                }
                if (typeof data[name] === 'object' && data[name].length >= 0) {
                  data[name].push(value);
                } else
                {
                  data[name] = value;
                }
              } else
              {
                data[name] = data[name] || [];
              }
            } else
            if (form.elements[i].getAttribute('type') === 'radio') {
              if (form.elements[i].checked) {
                data[name] = value;
              }
            } else
            {
              data[name] = value;
            }
          }
          return data;
        }
        function getLastSubmittedFormEvent() {
          return getLastSubmittedFormEventInternal([
          connectif.get('cn_last_submitted_form_id'),
          connectif.get('cn_last_submitted_form_data'),
          connectif.get('cn_last_submitted_form_primary_key_field')]);

        }
        function getLastSubmittedFormEventAsync() {
          return Promise.all([
          connectif.getAsync('cn_last_submitted_form_id'),
          connectif.getAsync('cn_last_submitted_form_data'),
          connectif.getAsync('cn_last_submitted_form_primary_key_field')]).
          then(getLastSubmittedFormEventInternal);
        }
        function getLastSubmittedFormEventInternal(_ref3) {var lastSubmittedFormId = _ref3[0],lastSubmittedFormData = _ref3[1],lastSubmittedFormPrimaryKeyField = _ref3[2];
          if (lastSubmittedFormId) {
            connectif.unset('cn_last_submitted_form_id');
            connectif.unset('cn_last_submitted_form_data');
            connectif.unset('cn_last_submitted_form_primary_key_field');
            var event = {
              type: 'form-submitted',
              formId: lastSubmittedFormId,
              payload: JSON.parse(lastSubmittedFormData) };

            if (lastSubmittedFormPrimaryKeyField) {
              event.primaryKeyField = lastSubmittedFormPrimaryKeyField;
            }
            return [event];
          }
          return [];
        }
        function initializeIntegratedForms() {
          for (var counter = 0; counter < conf.forms.length; counter += 1) {
            var elemForm = void 0;
            var form = conf.forms[counter];
            if (!matchesUrl(form)) {
              continue;
            }
            var identificationOptions = form.identificationOptions;
            if (form.htmlId && (!identificationOptions || identificationOptions.useHtmlId)) {// first try by id
              elemForm = doc.getElementById(form.htmlId);
            }
            if (!elemForm && form.htmlName && (!identificationOptions || identificationOptions.useHtmlName)) {
              elemForm = doc.querySelector('form[name="' + form.htmlName + '"]');
            }
            if (!elemForm && form.htmlAction && (!identificationOptions || identificationOptions.useHtmlAction)) {
              elemForm = doc.querySelector('form[action="' + form.htmlAction + '"]');
            }
            if (!elemForm && form.htmlClass && (!identificationOptions || identificationOptions.useHtmlClass)) {
              elemForm = doc.querySelector('form[class="' + form.htmlClass + '"]');
            }
            if (!elemForm || elemForm.getAttribute('data-cn-form-id')) {
              continue;
            }
            elemForm.setAttribute('data-cn-form-id', form.id);
            if (form.primaryKeyField) {
              // Not all forms will have primaryKeyFields, thus we have to do this optional.
              elemForm.setAttribute('data-cn-primary-key-field', form.primaryKeyField);
            }
            elemForm.addEventListener('submit', onSubmit, true);
          }
          function onSubmit(event) {
            connectif.set('cn_last_submitted_form_id', event.target.getAttribute('data-cn-form-id'));
            if (event.target.getAttribute('data-cn-primary-key-field')) {
              // Not all forms will have primaryKeyFields, thus we have to do this optional.
              connectif.set('cn_last_submitted_form_primary_key_field', event.target.getAttribute('data-cn-primary-key-field'));
            }
            connectif.set('cn_last_submitted_form_data', JSON.stringify(getFormData(event.target)));
          }
          function matchesUrl(form) {
            var counter;
            var url;
            var startsWithUrlLength;
            switch (form.urlSourceId) {
              case 'any':
                return true;
              case 'exact':
                for (counter = 0; counter < form.exactUrls.length; counter += 1) {
                  url = form.exactUrls[counter].url;
                  if (window.location.href === url) {
                    return true;
                  }
                }
                return false;
              case 'startsWith':
                for (counter = 0; counter < form.startsWithUrls.length; counter += 1) {
                  url = form.startsWithUrls[counter].url;
                  startsWithUrlLength = url.length;
                  if (window.location.href.substring(0, startsWithUrlLength) === url) {
                    return true;
                  }
                }
                return false;}

            return false;
          }
        }
        // #region web event payload definitions
        function initializeWebEventPayloadDefinitions() {
          var wepds = conf.webEventPayloadDefinitions;
          if (wepds.length === 0) {
            return;
          }
          doc.addEventListener('click', checkAndLaunchCustomEvent, true);
          function checkAndLaunchCustomEvent(event) {
            wepds.forEach(function (mapping) {
              var triggerMapping = mapping.triggerMapping;
              var triggeringElements = findSimilarElements(triggerMapping.metadata);
              var finished = false;
              triggeringElements.forEach(function (triggeringElement) {
                if (!finished && (event.target === triggeringElement || elementIsDescendant(triggeringElement, event.target))) {
                  triggerCustomEvent(mapping, event);
                  finished = true;
                }
              });
            });
          }
        }
        function getLastCustomEvent() {
          return getLastCustomEventInternal([
          connectif.get('cn_last_custom_event_id'),
          connectif.get('cn_last_custom_event_payloads')]);

        }
        function getLastCustomEventAsync() {
          return Promise.all([
          connectif.getAsync('cn_last_custom_event_id'),
          connectif.getAsync('cn_last_custom_event_payloads')]).
          then(getLastCustomEventInternal);
        }
        function getLastCustomEventInternal(_ref4) {var lastCustomEventId = _ref4[0],lastCustomEventPayloads = _ref4[1];
          if (lastCustomEventId) {
            connectif.unset('cn_last_custom_event_id');
            connectif.unset('cn_last_custom_event_payloads');
            var events = JSON.parse(lastCustomEventPayloads).map(function (payload) {
              return {
                type: 'custom',
                eventId: lastCustomEventId,
                payload: payload };

            });
            return events;
          }
          return [];
        }
        function triggerCustomEvent(mapping, event) {
          var triggerElement = event.target;
          var payloads = getPayloads(triggerElement, mapping);
          if (mapping.triggerMapping.causesNavigation) {
            connectif.set('cn_last_custom_event_id', mapping.triggerMapping.eventId);
            connectif.set('cn_last_custom_event_payloads', JSON.stringify(payloads));
          } else
          {
            var events = payloads.map(function (payload) {
              return {
                type: 'custom',
                eventId: mapping.triggerMapping.eventId,
                payload: payload };

            });
            sendEvents(events);
          }
        }
        function findSimilarElements(metadata) {
          return Array.prototype.slice.call(doc.getElementsByTagName(metadata.nodeName)).
          filter(function (element) {
            return isSimilar(element, metadata);
          });
        }
        function isSimilar(node, metadata) {
          var nodeMetadata = getMetadata(node);
          var metadataClasses = metadata.className.split(' ');
          var nodeClasses = nodeMetadata.className.split(' ');
          return nodeMetadata.nodeName === metadata.nodeName &&
          nodeMetadata.treeDepth === metadata.treeDepth &&
          nodeMetadata.childNodes === metadata.childNodes &&
          nodeMetadata.children === metadata.children &&
          nodeMetadata.parent.localeCompare(metadata.parent) === 0 &&
          containsAll(metadataClasses, nodeClasses) &&
          matchesNodeAttributes(metadata, nodeMetadata);
        }
        function matchesNodeAttributes(metadata1, metadata2) {
          if (!Array.isArray(metadata1.nodeAttributes) || metadata1.nodeAttributes.length === 0) {
            return true;
          }
          if (!Array.isArray(metadata2.nodeAttributes) || metadata2.nodeAttributes.length === 0) {
            return false;
          }
          var ignoreNodeAttributes = Array.isArray(metadata1.ignoreNodeAttributes) ? metadata1.ignoreNodeAttributes : [];
          return metadata1.nodeAttributes.filter(function (attr) {return !ignoreNodeAttributes.some(function (ignoredAttrName) {return ignoredAttrName === attr.name;});}).every(function (attr1) {return metadata2.nodeAttributes.some(function (attr2) {return attr1.name === attr2.name && attr1.value === attr2.value;});});
        }
        function containsAll(needles, haystack) {
          for (var i = 0, len = needles.length; i < len; i++) {
            if (haystack.indexOf(needles[i]) === -1)
            return false;
          }
          return true;
        }
        function getMetadata(node) {
          return {
            nodeName: node.nodeName,
            treeDepth: treeDepth(doc, node),
            childNodes: node.childNodes.length,
            children: node.children.length,
            parent: node.parentElement.nodeName,
            className: node.className,
            nodeAttributes: Array.prototype.slice.call(node.attributes).
            filter(function (attr) {return attr.name !== 'class';}).
            map(function (attr) {return {
                name: attr.name,
                value: attr.value };}) };


        }
        function treeDepth(environment, element) {
          var depth = 0;
          while (element !== environment) {
            depth += 1;
            element = element.parentNode;
          }
          return depth;
        }
        function elementIsDescendant(parent, child) {
          child = child.parentNode;
          while (child.parentNode) {
            if (child === parent) {
              return true;
            }
            child = child.parentNode;
          }
          return false;
        }
        function getPayloads(triggerElement, mapping) {
          var isSingleModeTrigging = mapping.triggerMapping.type === 'oneToOne';
          var groups = findSimilarElements(mapping.groupMapping.metadata);
          if (isSingleModeTrigging) {
            groups = [getTriggerGroup(triggerElement, groups)];
          }
          var payloads = getGroupsValues(groups, mapping.fieldsMapping);
          return payloads;
        }
        function getTriggerGroup(triggerElement, groups) {
          for (var i = 0; i < groups.length; i++) {
            if (elementIsDescendant(groups[i], triggerElement)) {
              return groups[i];
            }
          }
        }
        function getGroupsValues(groups, mappings) {
          var result = [];
          groups.forEach(function (group) {
            result.push(getValues(group, mappings));
          });
          return result;
        }
        function getValues(groupElement, mappings) {
          var values = {};
          mappings.forEach(function (mapping) {
            var elements = findSimilarElements(mapping.metadata);
            var fieldElement = getFieldElementInGroup(groupElement, elements);
            var value = getValue(fieldElement, mapping.valueDefinition);
            values[mapping.fieldId] = value;
          });
          return values;
        }
        function getFieldElementInGroup(groupElement, fieldElements) {
          for (var i = 0; i < fieldElements.length; i += 1) {
            if (groupElement === fieldElements[i] || elementIsDescendant(groupElement, fieldElements[i])) {
              return fieldElements[i];
            }
          }
        }
        function getValue(element, valueDefinition) {
          var resultValue = '';
          var attributeName = valueDefinition.attributeName;
          var regularExpression = valueDefinition.regularExpression;
          // FIXME: CONNECTIF-243 'element' can be sometimes undefined. If that occurs, return always an empty string
          if (!element) {
            return '';
          }
          var elementToGetValue = getElementToGetValue(element, valueDefinition);
          if (!elementToGetValue) {
            return '';
          }
          if (attributeName) {
            resultValue = getAttributeValue(elementToGetValue, attributeName);
          }
          // CONNECTIF-244 Implement here the logic if retrieving the value from the DOM Element properties.
          // Meanwhile, if element is an input, we always get the "value" property.
          else if (elementToGetValue.nodeName === 'INPUT' || elementToGetValue.nodeName === 'TEXTAREA') {
              return elementToGetValue.value;
            } else
            {
              resultValue = elementToGetValue.textContent;
            }
          if (regularExpression) {
            resultValue = applyRegExp(resultValue, regularExpression);
          }
          return resultValue;
        }
        function getElementToGetValue(element, valueDefinition) {
          var elementToGetValue = element;
          var locationLevel = valueDefinition.locationLevel;
          var childPosition = valueDefinition.childPosition;
          switch (valueDefinition.location) {
            case 'Child':
              for (var index = 0; index < locationLevel; index++) {
                if (!elementToGetValue) {
                  break;
                }
                elementToGetValue = elementToGetValue.firstElementChild;
              }
              for (var index = 1; index < childPosition; index++) {
                if (!elementToGetValue) {
                  break;
                }
                elementToGetValue = elementToGetValue.nextElementSibling;
              }
              break;
            case 'Parent':
              for (var index = 0; index < locationLevel; index++) {
                elementToGetValue = elementToGetValue.parentElement;
              }
              break;
            case 'Self':
              break;}

          return elementToGetValue;
        }
        function getAttributeValue(element, attributeName) {
          if (element && element.attributes[attributeName]) {
            return element.attributes[attributeName].value;
          }
          return '';
        }
        function applyRegExp(value, regExp) {
          if (!regExp) {
            return value;
          }
          try {
            var reg = new RegExp(regExp, 'gm');
            var result = reg.exec(value);
            if (result[1] === undefined) {
              return result[0] || '';
            }
            return result[1] || '';
          }
          catch (e) {
            return '';
          }
        }
        // #endregion web event payload definitions
        function getParameterByName(name) {
          var url = window.location.href;
          name = name.replace(/[\[\]]/g, '\\$&');
          var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),results = regex.exec(url);
          if (!results)
          return null;
          if (!results[2])
          return '';
          return decodeURIComponent(results[2].replace(/\+/g, ' '));
        }
        function isAllowedDomain() {
          if (!conf.allowedDomains || conf.allowedDomains.length === 0) {
            return true;
          }
          var url = window.location.href;
          return conf.allowedDomains.some(function (domain) {return url.indexOf(domain) === 0;});
        }
        function isExcludedPage() {
          if (conf.trackAllByDefault) {
            if (Array.isArray(conf.excludeTracking) && conf.excludeTracking.some(matchUrl)) {
              return true;
            }
            if (!conf.samplingTrackingPercent) {
              return false;
            }
            return samplingValue > conf.samplingTrackingPercent;
          } else
          {
            if (Array.isArray(conf.includeTracking) && conf.includeTracking.some(matchUrl)) {
              return false;
            }
            if (!conf.samplingTrackingPercent) {
              return true;
            }
            return samplingValue > conf.samplingTrackingPercent;
          }
          function matchUrl(url) {
            return typeof url === 'string' && new RegExp(url).test(window.location.href);
          }
        }
        function getSamplingValue() {
          return samplingValue;
        }
      }
      ;
      window.initializeConnectif = initializeConnectif;
    })(window);

  }, { "./connectif.js": 6, "./promise-polyfill": 9 }], 9: [function (require, module, exports) {
    (function (global, setImmediate) {
      "use strict";
      /** This file is a fork of library promise-polyfill version 8.1.0
                      * npm: https://www.npmjs.com/package/promise-polyfill
                      * github: https://github.com/taylorhakes/promise-polyfill
                      * we have modified the wrapping IIFE to remove support for AMD (see CONNECTIF-2828)
                     **/
      (function () {
        'use strict';
        /**
                       * @this {Promise}
                       */
        function finallyConstructor(callback) {
          var constructor = this.constructor;
          return this.then(function (value) {
            return constructor.resolve(callback()).then(function () {
              return value;
            });
          }, function (reason) {
            return constructor.resolve(callback()).then(function () {
              return constructor.reject(reason);
            });
          });
        }
        // Store setTimeout reference so promise-polyfill will be unaffected by
        // other code modifying setTimeout (like sinon.useFakeTimers())
        var setTimeoutFunc = setTimeout;
        function noop() {}
        // Polyfill for Function.prototype.bind
        function bind(fn, thisArg) {
          return function () {
            fn.apply(thisArg, arguments);
          };
        }
        /**
           * @constructor
           * @param {Function} fn
           */
        function Promise(fn) {
          if (!(this instanceof Promise))
          throw new TypeError('Promises must be constructed via new');
          if (typeof fn !== 'function')
          throw new TypeError('not a function');
          /** @type {!number} */
          this._state = 0;
          /** @type {!boolean} */
          this._handled = false;
          /** @type {Promise|undefined} */
          this._value = undefined;
          /** @type {!Array<!Function>} */
          this._deferreds = [];
          doResolve(fn, this);
        }
        function handle(self, deferred) {
          while (self._state === 3) {
            self = self._value;
          }
          if (self._state === 0) {
            self._deferreds.push(deferred);
            return;
          }
          self._handled = true;
          Promise._immediateFn(function () {
            var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
            if (cb === null) {
              (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
              return;
            }
            var ret;
            try {
              ret = cb(self._value);
            }
            catch (e) {
              reject(deferred.promise, e);
              return;
            }
            resolve(deferred.promise, ret);
          });
        }
        function resolve(self, newValue) {
          try {
            // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
            if (newValue === self)
            throw new TypeError('A promise cannot be resolved with itself.');
            if (newValue && (
            typeof newValue === 'object' || typeof newValue === 'function')) {
              var then = newValue.then;
              if (newValue instanceof Promise) {
                self._state = 3;
                self._value = newValue;
                finale(self);
                return;
              } else
              if (typeof then === 'function') {
                doResolve(bind(then, newValue), self);
                return;
              }
            }
            self._state = 1;
            self._value = newValue;
            finale(self);
          }
          catch (e) {
            reject(self, e);
          }
        }
        function reject(self, newValue) {
          self._state = 2;
          self._value = newValue;
          finale(self);
        }
        function finale(self) {
          if (self._state === 2 && self._deferreds.length === 0) {
            Promise._immediateFn(function () {
              if (!self._handled) {
                Promise._unhandledRejectionFn(self._value);
              }
            });
          }
          for (var i = 0, len = self._deferreds.length; i < len; i++) {
            handle(self, self._deferreds[i]);
          }
          self._deferreds = null;
        }
        /**
           * @constructor
           */
        function Handler(onFulfilled, onRejected, promise) {
          this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
          this.onRejected = typeof onRejected === 'function' ? onRejected : null;
          this.promise = promise;
        }
        /**
           * Take a potentially misbehaving resolver function and make sure
           * onFulfilled and onRejected are only called once.
           *
           * Makes no guarantees about asynchrony.
           */
        function doResolve(fn, self) {
          var done = false;
          try {
            fn(function (value) {
              if (done)
              return;
              done = true;
              resolve(self, value);
            }, function (reason) {
              if (done)
              return;
              done = true;
              reject(self, reason);
            });
          }
          catch (ex) {
            if (done)
            return;
            done = true;
            reject(self, ex);
          }
        }
        Promise.prototype['catch'] = function (onRejected) {
          return this.then(null, onRejected);
        };
        Promise.prototype.then = function (onFulfilled, onRejected) {
          // @ts-ignore
          var prom = new this.constructor(noop);
          handle(this, new Handler(onFulfilled, onRejected, prom));
          return prom;
        };
        Promise.prototype['finally'] = finallyConstructor;
        Promise.all = function (arr) {
          return new Promise(function (resolve, reject) {
            if (!arr || typeof arr.length === 'undefined')
            throw new TypeError('Promise.all accepts an array');
            var args = Array.prototype.slice.call(arr);
            if (args.length === 0)
            return resolve([]);
            var remaining = args.length;
            function res(i, val) {
              try {
                if (val && (typeof val === 'object' || typeof val === 'function')) {
                  var then = val.then;
                  if (typeof then === 'function') {
                    then.call(val, function (val) {
                      res(i, val);
                    }, reject);
                    return;
                  }
                }
                args[i] = val;
                if (--remaining === 0) {
                  resolve(args);
                }
              }
              catch (ex) {
                reject(ex);
              }
            }
            for (var i = 0; i < args.length; i++) {
              res(i, args[i]);
            }
          });
        };
        Promise.resolve = function (value) {
          if (value && typeof value === 'object' && value.constructor === Promise) {
            return value;
          }
          return new Promise(function (resolve) {
            resolve(value);
          });
        };
        Promise.reject = function (value) {
          return new Promise(function (resolve, reject) {
            reject(value);
          });
        };
        Promise.race = function (values) {
          return new Promise(function (resolve, reject) {
            for (var i = 0, len = values.length; i < len; i++) {
              values[i].then(resolve, reject);
            }
          });
        };
        // Use polyfill for setImmediate for performance gains
        Promise._immediateFn =
        typeof setImmediate === 'function' &&
        function (fn) {
          setImmediate(fn);
        } ||
        function (fn) {
          setTimeoutFunc(fn, 0);
        };
        Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
          if (typeof console !== 'undefined' && console) {
            console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
          }
        };
        /** @suppress {undefinedVars} */
        var globalNS = function () {
          // the only reliable means to get the global object is
          // `Function('return this')()`
          // However, this causes CSP violations in Chrome apps.
          if (typeof self !== 'undefined') {
            return self;
          }
          if (typeof window !== 'undefined') {
            return window;
          }
          if (typeof global !== 'undefined') {
            return global;
          }
          throw new Error('unable to locate global object');
        }();
        if (!('Promise' in globalNS)) {
          globalNS['Promise'] = Promise;
        } else
        if (!globalNS.Promise.prototype['finally']) {
          globalNS.Promise.prototype['finally'] = finallyConstructor;
        }
      })();

    }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("timers").setImmediate);
  }, { "timers": 4 }], 10: [function (require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function renderContent(webContentDisplay) {
      return webContentDisplay.webContent.sections.map(function (s) {return renderSection(s, webContentDisplay);}).join('');
    }
    exports.renderContent = renderContent;
    function renderSection(section, webContentDisplay) {
      var innerHtml = section.blocks.map(function (b) {return renderBlock(b, webContentDisplay);}).join('');
      return "<div class=\"" + ['cn_section', "id-" + section.id].concat(section.classes).join(' ') + "\" style=\"" + renderSectionStyle(section) + "\">" + innerHtml + "</div>";
    }
    function renderSectionStyle(section) {
      return 'width: 100%;' + (section.backgroundColor ? "background-color: " + section.backgroundColor + ";" : '');
    }
    function renderBlock(block, webContentDisplay) {
      var innerHtml = block.cells.map(function (c) {return renderCell(c, webContentDisplay);}).join(' ');
      return "<div class=\"" + ['cn_block', "id-" + block.id].concat(block.classes).join(' ') + "\" style=\"" + renderBlockStyle(block) + "\">" + innerHtml + "</div>";
    }
    function renderBlockStyle(block) {
      return 'display: flex;' + (block.backgroundColor ? "background-color: " + block.backgroundColor + ";" : '');
    }
    function renderCell(cell, webContentDisplay) {
      var innerHtml = cell.elements.map(function (e) {return renderElement(e, webContentDisplay);}).join(' ');
      return "<div class=\"" + ['cn_cell', "id-" + cell.id].concat(cell.classes).join(' ') + "\" style=\"" + renderCellStyle(cell) + "\">" + innerHtml + "</div>";
    }
    function renderCellStyle(cell) {
      return (cell.backgroundColor ? "background-color: " + cell.backgroundColor + ";" : '') + (
      cell.width ? "width: " + cell.width + ";" : '');
    }
    function renderElement(element, webContentDisplay) {var
      variableValues = webContentDisplay.variableValues;
      switch (element.elementTypeId) {
        case 'broke':
          return renderBaseElement(element, '&nbsp;', variableValues, { style: "line-height: " + element.distance + ";" });
        case 'button-link':
          var buttonLinkHtml = "<a href=\"" + element.buttonLink + "\" title=\"" + element.buttonTitle + "\"><div style=\"" + renderButtonLinkStyle(element) + "\">" + element.html + "</div></a>";
          return renderBaseElement(element, buttonLinkHtml, variableValues, { style: "text-align: " + element.buttonAlign + ";" });
        case 'divider':
          var dividerHtml = "<div style=\"border-top: 1px solid " + element.color + "; width:100%; font-size:1px;\">&nbsp;</div>";
          return renderBaseElement(element, dividerHtml, variableValues);
        case 'products':
          return renderProductsElement(element, webContentDisplay);
        case 'empty':
          return renderBaseElement(element, '', variableValues);
        case 'html':
          return renderBaseElement(element, element.html, variableValues);
        case 'image':{var
            imageUrl = element.imageUrl,imageAlt = element.imageAlt,imageTitle = element.imageTitle;
            var imgHtml = "<img src=\"" + imageUrl + "\" alt=\"" + imageAlt + "\" title=\"" + imageTitle + "\" style=\"max-width: 100%\">";
            return renderBaseElement(element, element.imageLink ? "<a href=\"" + element.imageLink + "\" target=\"_blank\">" + imgHtml + "</a>" : imgHtml, variableValues, { style: "text-align: " + element.imageAlign + ";" });
          }
        case 'text':
          return renderBaseElement(element, element.html, variableValues);}

    }
    function renderProductsElement(element, webContentDisplay) {
      var _a, _b;var
      variableValues = webContentDisplay.variableValues,webContent = webContentDisplay.webContent;
      var products = (_b = (_a = webContentDisplay.products) === null || _a === void 0 ? void 0 : _a[element.id]) !== null && _b !== void 0 ? _b : [];
      return element.type === 'static' ?
      renderProductsStatic(element, variableValues, products) :
      renderProductsCarousel(element, variableValues, products, webContent.responsiveBreakpoint);
    }
    function renderProductsStatic(element, variableValues, products) {
      var width = 100 / element.columnQuantity;
      var renderProduct = function renderProduct(product) {return "<div style=\"width:" + width + "%;float:left;\">" + replaceVariables(element.templateHtml, product) + "</div>";};
      var html = products.map(renderProduct).join('');
      return renderBaseElement(element, html, variableValues);
    }
    function renderProductsCarousel(element, variableValues, products, responsiveBreakpoint) {
      var renderProduct = function renderProduct(product) {return "<li class=\"cn__li js_slide\">" + replaceVariables(element.templateHtml, product) + "</li>";};
      var elementToRender = Object.assign(Object.assign({}, element), { classes: [].concat(element.classes, ['cn__slider', 'js_slide']) });
      var html = "<div class=\"cn__frame js_frame\">\n        <ul class=\"cn__slides js_slides\">" +
      products.map(renderProduct).join('') + "</ul>\n    </div>\n    <span class=\"js_prev cn__prev\">" +

      element.carouselLeftArrowHtml + "</span>\n    <span class=\"js_next cn__next\">" +
      element.carouselRightArrowHtml + "</span>";
      var attributes = {
        'data-column-quantity': element.columnQuantity.toString(),
        'data-carousel-interval': element.carouselInterval.toString(),
        'data-responsive-column-quantity': element.responsiveColumnQuantity.toString(),
        'data-content-responsive-breakpoint': responsiveBreakpoint };

      return renderBaseElement(elementToRender, html, variableValues, attributes);
    }
    function renderButtonLinkStyle(element) {
      return 'display: inline-block;word-wrap: break-word;min-height: 18px;min-width: 18px;' + (
      element.buttonTextColor ? "color: " + element.buttonTextColor + ";" : '') + (
      element.buttonAdjustToWidth ? 'width: 100%;' : '') + (
      element.borderTopLeftRadius ? "border-top-left-radius: " + element.borderTopLeftRadius + ";" : '') + (
      element.borderTopRightRadius ? "border-top-right-radius: " + element.borderTopRightRadius + ";" : '') + (
      element.borderBottomLeftRadius ? "border-bottom-left-radius: " + element.borderBottomLeftRadius + ";" : '') + (
      element.borderBottomRightRadius ? "border-bottom-right-radius: " + element.borderBottomRightRadius + ";" : '') + (
      element.buttonBackgroundColor ? "background-color: " + element.buttonBackgroundColor + ";" : '') + (
      element.borderWidth ? "border-width: " + element.borderWidth + ";" : '') + (
      element.borderWidth ? "border-style: " + element.borderStyle + ";" : '') + (
      element.borderColor ? "border-color: " + element.borderColor + ";" : '') + (
      element.buttonPaddingTop ? "padding-top: " + element.buttonPaddingTop + ";" : '') + (
      element.buttonPaddingBottom ? "padding-bottom: " + element.buttonPaddingBottom + ";" : '') + (
      element.buttonPaddingLeft ? "padding-left: " + element.buttonPaddingLeft + ";" : '') + (
      element.buttonPaddingRight ? "padding-right: " + element.buttonPaddingRight + ";" : '');
    }
    function replaceVariables(html, variableValues) {
      return Object.entries(variableValues).
      reduce(function (html, _ref5) {var name = _ref5[0],value = _ref5[1];return html.replace(new RegExp("{{" + name + "}}", 'g'), value);}, html);
    }
    function renderBaseElement(element, innerHtml, variableValues, attributes) {
      var htmlWithResolvedVars = replaceVariables(innerHtml, variableValues);
      var elementTypeClass = "cn_" + element.elementTypeId.replace('-', '_');
      var className = ['cn_element', elementTypeClass, "id-" + element.id].concat(element.classes).join(' ');
      var attributesToRender = Object.assign(Object.assign({ 'class': className }, attributes), { 'style': renderElementStyle(element, attributes === null || attributes === void 0 ? void 0 : attributes.style) });
      var renderedAttributes = Object.entries(attributesToRender).map(function (_ref6) {var name = _ref6[0],value = _ref6[1];return name + "=\"" + value + "\"";}).join(' ');
      return "<div " + renderedAttributes + "\">" + htmlWithResolvedVars + "</div>";
    }
    function renderElementStyle(element, additionalStyles) {
      return (element.backgroundColor ? "background-color: " + element.backgroundColor + ";" : '') + (
      element.paddingTop ? "padding-top: " + element.paddingTop + ";" : '') + (
      element.paddingBottom ? "padding-bottom: " + element.paddingBottom + ";" : '') + (
      element.paddingLeft ? "padding-left: " + element.paddingLeft + ";" : '') + (
      element.paddingRight ? "padding-right: " + element.paddingRight + ";" : '') + (
      additionalStyles !== null && additionalStyles !== void 0 ? additionalStyles : '');
    }

  }, {}], 11: [function (require, module, exports) {
    module.exports = "@keyframes cn_fadeIn {\n    from {\n        opacity: 0;\n    }\n    to {\n        opacity: 1;\n    }\n}\n\n@keyframes cn_fadeInLeft {\n    from {\n        opacity: 0;\n        transform: translate3d(-100%, 0, 0);\n    }\n    to {\n        opacity: 1;\n        transform: none;\n    }\n}\n\n@keyframes cn_fadeInDown {\n    from {\n        opacity: 0;\n        transform: translate3d(0, 100px, 0);\n    }\n    to {\n        opacity: 1;\n        transform: none;\n    }\n}\n\n@keyframes cn_fadeInRight {\n    from {\n        opacity: 0;\n        transform: translate3d(100%, 0, 0);\n    }\n    to {\n        opacity: 1;\n        transform: none;\n    }\n}\n\n@keyframes cn_fadeInUp {\n    from {\n        opacity: 0;\n        transform: translate3d(0, 100%, 0);\n    }\n    to {\n        opacity: 1;\n        transform: none;\n    }\n}\n\n@keyframes cn_zoomIn {\n    from {\n        opacity: 0;\n        transform: scale3d(.3, .3, .3);\n    }\n    50% {\n        opacity: 1;\n    }\n}\n\n@keyframes cn_bounceIn {\n    from, 20%, 40%, 60%, 80%, to {\n        animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    }\n    0% {\n        opacity: 0;\n        transform: scale3d(.3, .3, .3);\n    }\n    20% {\n        transform: scale3d(1.1, 1.1, 1.1);\n    }\n    40% {\n        transform: scale3d(.9, .9, .9);\n    }\n    60% {\n        opacity: 1;\n        transform: scale3d(1.03, 1.03, 1.03);\n    }\n    80% {\n        transform: scale3d(.97, .97, .97);\n    }\n    to {\n        opacity: 1;\n        transform: scale3d(1, 1, 1);\n    }\n}\n\n@keyframes cn_fadeOut {\n    from {\n        opacity: 1;\n    }\n    to {\n        opacity: 0;\n    }\n}\n\n@keyframes cn_fadeOutLeft {\n    from {\n        opacity: 1;\n    }\n    to {\n        opacity: 0;\n        transform: translate3d(-100%, 0, 0);\n    }\n}\n\n@keyframes cn_fadeOutDown {\n    from {\n        opacity: 1;\n    }\n    to {\n        opacity: 0;\n        transform: translate3d(0, 100%, 0);\n    }\n}\n\n@keyframes cn_fadeOutRight {\n    from {\n        opacity: 1;\n    }\n    to {\n        opacity: 0;\n        transform: translate3d(100%, 0, 0);\n    }\n}\n\n@keyframes cn_fadeOutUp {\n    from {\n        opacity: 1;\n    }\n    to {\n        opacity: 0;\n        transform: translate3d(0, -100%, 0);\n    }\n}\n\n@keyframes cn_zoomOut {\n    from {\n        opacity: 1;\n    }\n    50% {\n        opacity: 0;\n        transform: scale3d(0.3, 0.3, 0.3);\n    }\n    to {\n        opacity: 0;\n    }\n}\n\n@keyframes cn_bounceOut {\n    20% {\n        transform: scale3d(0.9, 0.9, 0.9);\n    }\n    50%,\n    55% {\n        opacity: 1;\n        transform: scale3d(1.1, 1.1, 1.1);\n    }\n    to {\n        opacity: 0;\n        transform: scale3d(0.3, 0.3, 0.3);\n    }\n}\n\n.cn__slider {\n    position: relative;\n    overflow: hidden;\n}\n\n.cn__frame {\n    width: 100%;\n    position: relative;\n    overflow: hidden;\n    white-space: nowrap;\n}\n\n.cn__slides {\n    display: block;\n    margin: 0;\n    padding: 0;\n    font-size: 0;\n    line-height: 0;\n}\n\nli.cn__li {\n    position: relative;\n    display: inline-block;\n    overflow: hidden;\n    font-size: 14px;\n    line-height: 14px;\n    vertical-align: top;\n}\n\n.cn__prev, .cn__next {\n    position: absolute;\n    top: 50%;\n    margin-top: -25px;\n    display: block;\n    cursor: pointer;\n}\n\n.cn__next {\n    right: 0;\n}\n\n.cn__prev {\n    left: 0;\n}\n\n.cn__next svg, .cn__prev svg {\n    width: 25px;\n}\n";

  }, {}], 12: [function (require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dom_utils_1 = require("./dom-utils");
    var web_content_rendering_1 = require("./web-content-rendering");
    var carousel_1 = require("./carousel");
    function showWebContent(doc, webContentDisplay) {
      switch (webContentDisplay.webContent.webContentTypeId) {
        case 'popup':return showPopup(doc, webContentDisplay);
        case 'full-screen':return showFullScreen(doc, webContentDisplay);
        case 'slide-in':return showSlideIn(doc, webContentDisplay);
        case 'floating-bar':return showFloatingBar(doc, webContentDisplay);
        case 'inline':return showInline(doc, webContentDisplay);}

    }
    exports.showWebContent = showWebContent;
    function isSomeWebContentOpened(doc, webContentTypeIds)

    {if (webContentTypeIds === void 0) {webContentTypeIds = ['popup', 'full-screen', 'slide-in', 'floating-bar', 'inline'];}
      return !!doc.querySelector(webContentTypeIds.map(function (type) {return ".cn_content_type_" + type;}).join(', '));
    }
    exports.isSomeWebContentOpened = isSomeWebContentOpened;
    function showPopup(doc, webContentDisplay) {var
      webContent = webContentDisplay.webContent;
      addGlobalStyle(doc);
      var style = createStyle(doc, webContent);var
      uuid = webContent.uuid,backdropColor = webContent.backdropColor,backgroundColor = webContent.backgroundColor,borderBottomLeftRadius = webContent.borderBottomLeftRadius,borderBottomRightRadius = webContent.borderBottomRightRadius,borderTopLeftRadius = webContent.borderTopLeftRadius,borderTopRightRadius = webContent.borderTopRightRadius,width = webContent.width,position = webContent.position,distanceToWindow = webContent.distanceToWindow;
      var backdrop = dom_utils_1.createTag(doc, 'div', {
        className: "cn_content_backdrop-" + uuid },
      {
        backgroundColor: backdropColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
        zIndex: '10000' });

      var popup = dom_utils_1.createTag(doc, 'div', {
        className: "cn_content_popup-" + uuid },
      Object.assign(Object.assign({ position: 'absolute', maxWidth: '100%' }, getPopupPositioning(position, distanceToWindow)), getEntranceAnimation(webContent)));
      backdrop.appendChild(popup);
      var content = createContentElement(doc, webContentDisplay, {
        backgroundColor: backgroundColor,
        borderBottomLeftRadius: borderBottomLeftRadius,
        borderBottomRightRadius: borderBottomRightRadius,
        borderTopLeftRadius: borderTopLeftRadius,
        borderTopRightRadius: borderTopRightRadius,
        width: width,
        maxWidth: '100%',
        overflow: 'hidden' });

      popup.appendChild(content);
      popup.appendChild(createCloseElement(doc, webContent));
      backdrop.onclick = function (e) {
        if (e.target === backdrop && webContent.backdropClosePopupOnClick || isClickOnClose(e)) {
          e.preventDefault();
          closeWebContent(popup, webContent, function () {
            dom_utils_1.removeElement(backdrop);
            dom_utils_1.removeElement(style);
            dom_utils_1.restoreScroll(doc, scrollStatus);
          });
        }
      };
      var scrollStatus = dom_utils_1.disableScroll(doc);
      doc.body.appendChild(backdrop);
      carousel_1.initializeCarousels(content);
    }
    function addGlobalStyle(doc) {
      dom_utils_1.addStyle(doc, 'cn_style', require('./web-content.css'));
    }
    function createStyle(doc, _ref7) {var uuid = _ref7.uuid,styles = _ref7.styles,responsiveBreakpoint = _ref7.responsiveBreakpoint,responsiveStyles = _ref7.responsiveStyles;
      return dom_utils_1.addStyle(doc, "cn_style_" + uuid, ".cn_content.id-" + uuid + " .cn_button_link p{margin: 0; line-height: 1em;}\n    " +
      styles + "\n    @media (max-width: " +
      responsiveBreakpoint + ") {\n        " +
      responsiveStyles + "\n    }");

    }
    function createCloseElement(doc, webContent) {var
      uuid = webContent.uuid,closeButtonHtml = webContent.closeButtonHtml;
      var close = dom_utils_1.createTag(doc, 'div', {
        className: "cn_content_close-" + uuid });

      close.innerHTML = closeButtonHtml;
      return close;
    }
    function createContentElement(doc, webContentDisplay, style) {var _webContentDisplay$we =
      webContentDisplay.webContent,uuid = _webContentDisplay$we.uuid,classes = _webContentDisplay$we.classes,webContentTypeId = _webContentDisplay$we.webContentTypeId;
      var content = dom_utils_1.createTag(doc, 'div', {
        className: ['cn_content', "cn_content_type_" + webContentTypeId, "id-" + uuid].concat(classes).join(' ') },
      style);
      content.innerHTML = web_content_rendering_1.renderContent(webContentDisplay);
      return content;
    }
    function isClickOnClose(event) {
      var isCloseLink = function isCloseLink(e) {return e.getAttribute && e.getAttribute('href') === '#__cn_close_content';};
      return dom_utils_1.getAllAncestorsFromElement(event.target).some(isCloseLink);
    }
    function closeWebContent(elementToAnimate, webContent, onClosed) {
      var onClosedFinished = function onClosedFinished() {
        onClosed();
        dom_utils_1.triggerEvent(elementToAnimate.ownerDocument, 'connectif.webContent.afterClose', {
          webContent: webContent });

      };
      var canContinue = dom_utils_1.triggerEvent(elementToAnimate.ownerDocument, 'connectif.webContent.beforeClose', {
        webContent: webContent });

      if (!canContinue) {
        return;
      }
      switch (webContent.exitAnimation) {
        case 'fadeOut':
        case 'fadeOutLeft':
        case 'fadeOutDown':
        case 'fadeOutRight':
        case 'fadeOutUp':
        case 'zoomOut':
        case 'bounceOut':
          elementToAnimate.style.animationName = "cn_" + webContent.exitAnimation;
          elementToAnimate.style.animationDuration = webContent.exitAnimationDuration + "ms";
          elementToAnimate.onanimationend = onClosedFinished;
          break;
        case 'none':
        default:
          onClosedFinished();}

    }
    function getEntranceAnimation(webContent) {
      return {
        animationName: "cn_" + webContent.entranceAnimation,
        animationDuration: webContent.entranceAnimationDuration + "ms" };

    }
    function getPopupPositioning(position, distanceToWindow) {
      switch (position) {
        case 'top':
          return { top: distanceToWindow };
        case 'bottom':
          return { bottom: distanceToWindow };
        case 'left':
          return { left: distanceToWindow };
        case 'right':
          return { right: distanceToWindow };
        case 'top-left':
          return { top: distanceToWindow, left: distanceToWindow };
        case 'top-right':
          return { top: distanceToWindow, right: distanceToWindow };
        case 'bottom-left':
          return { bottom: distanceToWindow, left: distanceToWindow };
        case 'bottom-right':
          return { bottom: distanceToWindow, right: distanceToWindow };
        case 'center':
        default:
          return {};}

    }
    function showFullScreen(doc, webContentDisplay) {var
      webContent = webContentDisplay.webContent;
      addGlobalStyle(doc);
      var style = createStyle(doc, webContent);var
      uuid = webContent.uuid,backgroundColor = webContent.backgroundColor,width = webContent.width;
      var backdrop = dom_utils_1.createTag(doc, 'div', {
        className: "cn_content_backdrop-" + uuid },
      Object.assign(Object.assign({ backgroundColor: backgroundColor }, getEntranceAnimation(webContent)), { display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: '0', bottom: '0', left: '0', right: '0', zIndex: '10000' }));
      var content = createContentElement(doc, webContentDisplay, { width: width });
      backdrop.appendChild(content);
      backdrop.appendChild(createCloseElement(doc, webContent));
      backdrop.onclick = function (e) {
        if (isClickOnClose(e)) {
          e.preventDefault();
          closeWebContent(backdrop, webContent, function () {
            dom_utils_1.restoreScroll(doc, scrollStatus);
            dom_utils_1.removeElement(backdrop);
            dom_utils_1.removeElement(style);
          });
        }
      };
      var scrollStatus = dom_utils_1.disableScroll(doc);
      doc.body.appendChild(backdrop);
      carousel_1.initializeCarousels(content);
    }
    function showSlideIn(doc, webContentDisplay) {var
      webContent = webContentDisplay.webContent;
      addGlobalStyle(doc);
      var style = createStyle(doc, webContent);var
      uuid = webContent.uuid,backgroundColor = webContent.backgroundColor,borderBottomLeftRadius = webContent.borderBottomLeftRadius,borderBottomRightRadius = webContent.borderBottomRightRadius,borderTopLeftRadius = webContent.borderTopLeftRadius,borderTopRightRadius = webContent.borderTopRightRadius,position = webContent.position,distanceToWindow = webContent.distanceToWindow,width = webContent.width;
      var slideIn = dom_utils_1.createTag(doc, 'div', {
        className: "cn_content_slide_in-" + uuid },
      Object.assign(Object.assign({ position: 'fixed', width: width }, getSlideInPositioning(position, distanceToWindow)), getEntranceAnimation(webContent)));
      var content = createContentElement(doc, webContentDisplay, {
        display: 'flex',
        backgroundColor: backgroundColor,
        borderBottomLeftRadius: borderBottomLeftRadius,
        borderBottomRightRadius: borderBottomRightRadius,
        borderTopLeftRadius: borderTopLeftRadius,
        borderTopRightRadius: borderTopRightRadius,
        overflow: 'hidden' });

      slideIn.appendChild(content);
      slideIn.appendChild(createCloseElement(doc, webContent));
      slideIn.onclick = function (e) {
        if (isClickOnClose(e)) {
          e.preventDefault();
          closeWebContent(slideIn, webContent, function () {
            dom_utils_1.removeElement(slideIn);
            dom_utils_1.removeElement(style);
          });
        }
      };
      doc.body.appendChild(slideIn);
      carousel_1.initializeCarousels(content);
    }
    function getSlideInPositioning(position, distanceToWindow) {
      switch (position) {
        case 'bottom-left':
          return { bottom: distanceToWindow, left: distanceToWindow };
        case 'bottom-right':
          return { bottom: distanceToWindow, right: distanceToWindow };
        default:
          return {};}

    }
    function showFloatingBar(doc, webContentDisplay) {var
      webContent = webContentDisplay.webContent;
      addGlobalStyle(doc);
      createStyle(doc, webContent);var
      backgroundColor = webContent.backgroundColor,position = webContent.position;
      var content = createContentElement(doc, webContentDisplay, Object.assign(Object.assign({ display: 'flex', backgroundColor: backgroundColor }, getFloatingBarPositioning(position)), { position: 'fixed' }));
      doc.body.appendChild(content);
      carousel_1.initializeCarousels(content);
    }
    function getFloatingBarPositioning(position) {
      switch (position) {
        case 'top':
          return { top: '0', left: '0', right: '0' };
        case 'bottom':
          return { bottom: '0', left: '0', right: '0' };
        default:
          return {};}

    }
    function showInline(doc, webContentDisplay) {
      var _a, _b;var
      webContent = webContentDisplay.webContent,selector = webContentDisplay.selector,position = webContentDisplay.position;
      addGlobalStyle(doc);
      createStyle(doc, webContent);
      var target = doc.querySelector(selector);
      if (!target) {
        return;
      }var
      backgroundColor = webContent.backgroundColor;
      var content = createContentElement(doc, webContentDisplay, {
        display: 'flex',
        backgroundColor: backgroundColor });

      switch (position) {
        case 'before':
          (_a = target.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(content, target);
          break;
        case 'after':
          (_b = target.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(content, target.nextSibling);
          break;
        case 'append':
          target.appendChild(content);
          break;
        case 'replace':
        default:
          target.innerHTML = '';
          target.appendChild(content);
          break;}

      carousel_1.initializeCarousels(content);
    }

  }, { "./carousel": 5, "./dom-utils": 7, "./web-content-rendering": 10, "./web-content.css": 11 }] }, {}, [8]);window.connectifConfiguration={"baseUrl":"https://eu3-api.connectif.cloud:443/","token":"a989971b-a6ca-4499-877a-8014e6f71eb9","forms":[],"webEventPayloadDefinitions":[],"webTrackingEnabled":false,"vapidPublicKey":"BMeYAguefGV4shFNAO_qkSAsXsrlLIl-tdAXahC5lGfqT50ymljWAq91djS8WNDTkAFy5RoJx4tMbOdZL2TbYq0","serviceWorkerUrl":"https://ordena.com/apps/connectif/service-worker.js","autoInitialize":true,"autoSendEventsOnInit":true,"trackAllByDefault":true,"excludeTracking":[]};window.initializeConnectif(window.connectifConfiguration);