/**
 * Flightplan Analytics Object
 * @type type
 */
var _fp_ = {};
/**
 * Facebook Website Custom Audience Pixel ID, eg '894002004011610'
 * @type String
 */
_fp_.wca_id = '347329399352133';
/**
 * Pinterest Tag
 * @type String
 */
_fp_.p_tag_id = '0';
/**
 * Whether we need to include the Pinterest pixel
 * @type Boolean
 */
_fp_.pt = (_fp_.p_tag_id !== '0');
/**
 * Snapchat Tag
 * @type String
 */
_fp_.s_tag_id = '0';
/**
 * Whether we need to include the Snapchat pixel
 * @type Boolean
 */
_fp_.sn = (_fp_.s_tag_id !== '0');
/**
 * Whether we need to fire sign_up events
 * @type Boolean
 */
_fp_.sn_sign = '0';
/**
 * Twitter Universal Website Tag, eg 'nv74k'
 * @type String
 */
_fp_.tw_uwt_id = '0';
/**
 * Twitter User ID for old-style tracking, eg 'nx28f'
 * Most likely will be empty
 * @type String
 */
_fp_.tw_usr_id = '0';
/**
 * Twitter Product View Event ID, eg 'nv7tp'
 * @type String
 */
_fp_.tw_prd_id = '0';
/**
 * Twitter Product Purchase Pixel ID, eg 'nv7to'
 * @type String
 */
_fp_.tw_pch_id = '0';
/**
 * Whether or not we're using the newer Twitter Universal Website Tag
 * @type Boolean
 */
_fp_.twu = (_fp_.tw_uwt_id !== '0');
/**
 * Whether or not we're using the old-style Twitter event pixels
 * @type Boolean
 */
_fp_.two = (!_fp_.twu && _fp_.tw_prd_id !== '0' && _fp_.tw_pch_id !== '0');
/**
 * Adwords Account Id
 * @type String
 */
_fp_.aw_act = '0';
/**
 * Adwords Use Remarketing
 * @type String
 */
_fp_.aw_rem = '0';
/**
 * Adwords View Page
 * @type String
 */
_fp_.aw_vp = Array;
/**
 * Adwords Add to Cart
 * @type String
 */
_fp_.aw_atc = Array;
/**
 * Adwords Purchase
 * @type String
 */
_fp_.aw_pur = Array;
/**
 * True if we should be sending AddToWishList
 * @type String
 */
_fp_.wl = 'false';
/**
 * True if we should be sending FlightplanPurchase ONLY, false otherwise
 * @type String
 */
_fp_.fpo = 'true';
/**
 * True if we should be sending ids with the FP prefix attached
 * @type String
 */
_fp_.fpp = 'FP';
/**
 * Store any variant IDs we detect
 * @type Array
 */
_fp_.retailer_id = [];
/**
 * Store any product IDs we detect
 * @type Array
 */
_fp_.retailer_group_id = [];
/**
 * Reference to Shopify JS page data
 * @type Window.__st|parent.__st
 */
_fp_.__st = parent.__st;
/**
 * Event object placeholder
 * @type object
 */
_fp_.event = {};
/**
 * Cart/Purchase amount placeholder
 * @type Number
 */
_fp_.amount = 0;
/**
 * Console Logging Flag
 * @type Boolean
 */
_fp_.fpdebug = false;
/**
 * Suppress Errors within this function
 * @param {string} errorMsg
 * @param {string} url
 * @param {int} lineNumber
 * @param {int} column
 * @param {object} errorObj
 * @returns {Boolean}
 */
window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
    if (_fp_.fpdebug)
        console.log('Error', errorMsg, url, lineNumber, column, errorObj, _fp_.__st, parent.Shopify, parent);
    return true;
};
(function () {
    var currency = "USD";

    if (parent.Shopify.currency.active !== undefined) {
        currency = parent.Shopify.currency.active;
    }

    try {
        // This causes a ReferenceError if fbq hasn't been created.  We'll catch it and load fbq
        if (fbq === undefined) {}

    } catch (err) {
        if (err instanceof ReferenceError) {
            !function (f, b, e, v, n, t, s) {
                n = f.fbq = function () {
                    n.callMethod ?
                            n.callMethod.apply(n, arguments) : n.queue.push(arguments);
                };
                f._fbq = n;
                n.push = n;
                n.loaded = !0;
                n.version = '5.0';// Facebook Version
                n.queue = [];
                t = b.createElement(e);
                t.async = !0;
                t.src = v;
                s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s);
            }(window, document, 'script', '//connect.facebook.net/en_US/fbevents.js');
        }
    }

    if (_fp_.fpdebug)
        console.log('FB Pixel ID ' + _fp_.wca_id + ' loaded.');
    // Insert Your Custom Audience Pixel ID below.
    var init_data = getInitData();
    if (init_data !== false) {
        fbq('init', _fp_.wca_id, init_data);
    } else {
        fbq('init', _fp_.wca_id);
    }

    if (_fp_.pt) {
        !function (e) {
            if (!window.pintrk) {
                window.pintrk = function () {
                    window.pintrk.queue.push(Array.prototype.slice.call(arguments))
                };
                var n = window.pintrk;
                n.queue = [], n.version = "3.0";
                var t = document.createElement("script");
                t.async = !0, t.src = e;
                var r = document.getElementsByTagName("script")[0];
                r.parentNode.insertBefore(t, r)
            }
        }("https://s.pinimg.com/ct/core.js");
        if (init_data !== false && init_data.em !== undefined) {
            pintrk('load', _fp_.p_tag_id,{
              em: init_data.em,
            });
        } else {
            pintrk('load', _fp_.p_tag_id);
        }

        pintrk('page', {
        });
        if (_fp_.fpdebug)
            console.log('Pinterest Tag ID ' + _fp_.p_tag_id + ' loaded.');
    }

    if (_fp_.sn) {
        (function(win, doc, sdk_url){
            if(win.snaptr) return;
            var tr=win.snaptr=function(){
                tr.handleRequest? tr.handleRequest.apply(tr, arguments):tr.queue.push(arguments);
            };

            tr.queue = [];
            var s='script';
            var new_script_section=doc.createElement(s);
            new_script_section.async=!0;
            new_script_section.src=sdk_url;
            var insert_pos=doc.getElementsByTagName(s)[0];
            insert_pos.parentNode.insertBefore(new_script_section, insert_pos);
        })(window, document, 'https://sc-static.net/scevent.min.js'); 

        // Pass email and phone number in the ‘init’ call.
        if (init_data !== false && init_data.em !== undefined) {
            snaptr('init', _fp_.s_tag_id, {
                'user_email': init_data.em
            });
        } else {
            snaptr('init', _fp_.s_tag_id, {});
        }

        if (_fp_.fpdebug)
            console.log('Snapchat Tag ID ' + _fp_.s_tag_id + ' loaded.');

        // This is special logic for a client to send signup events
        if (_fp_.sn_sign) {
            if (_fp_.fpdebug)
                console.log('Snapchat Pixel Initialized Sign Up Event');

            document.addEventListener('click',function(e){
                if(e.target && e.target.id== 'privy-submit-btn'){
                    if (_fp_.fpdebug)
                        console.log('Snapchat Pixel Initialized Click Detected');

                    var user_email = document.querySelector(".privy-email-input").value;

                    if (_fp_.fpdebug)
                        console.log('User Email Detected:' + user_email);

                    snaptr('init', _fp_.s_tag_id, {
                        'user_email': user_email
                    });

                    snaptr('track', 'SIGN_UP');
                    if (_fp_.fpdebug)
                        console.log('Snapchat Pixel SIGN UP Fired');

                    setEmailCookie(user_email);

                    if (_fp_.fpdebug)
                        console.log('Snapchat Pixel Email Cookie Set');
                }
            });
        }
    }

    if (_fp_.twu) {
        !function (e, n, u, a) {
            e.twq || (a = e.twq = function () {
                a.exe ? a.exe.apply(a, arguments) :
                        a.queue.push(arguments);
            }, a.version = '1', a.queue = [], t = n.createElement(u),
                    t.async = !0, t.src = '//static.ads-twitter.com/uwt.js', s = n.getElementsByTagName(u)[0],
                    s.parentNode.insertBefore(t, s));
        }(window, document, 'script');
        twq('init', _fp_.tw_uwt_id);
        if (_fp_.fpdebug)
            console.log('Twitter Pixel ID ' + _fp_.tw_uwt_id + ' loaded.');
    }

    if (_fp_.aw_act !== "0") {
        !function (e) {
            if (!window.gtag) {
                window.gtag = function () {
                    window.gtag.queue.push(Array.prototype.slice.call(arguments))
                };
                var n = window.gtag;
                n.queue = [], n.version = "4.0";
                var t = document.createElement("script");
                t.async = !0, t.src = e;
                var r = document.getElementsByTagName("script")[0];
                r.parentNode.insertBefore(t, r)
            }
        }("https://www.googletagmanager.com/gtag/js?id=" + _fp_.aw_act);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}

        gtag('js', new Date());
        gtag('config', _fp_.aw_act);

        if (_fp_.fpdebug)
            console.log('AdWords Pixel ID ' + _fp_.aw_act + ' loaded.');
    }

    if (_fp_.fpdebug)
        console.log('Sending FlightView');
    fbq('trackSingleCustom', _fp_.wca_id, 'FlightView');

    // Pinterest Page Visit
    if (_fp_.pt) {
        pintrk('track', 'pagevisit', {"line_items":[{"product_id":_fp_.fpp + parent.__st.rid}]});
    }

    if (_fp_.sn) {
        snaptr('track', 'PAGE_VIEW');
        if (_fp_.fpdebug)
            console.log('Snapchat Pixel Page View Fired');
    }

    // Twitter Universal Website Tag
    if (_fp_.twu) {
        twq('track', 'PageView');
    }

    // Twitter old-style tags
    if (_fp_.two) {
        !function (d, s, r, x, y) {
            x = d.createElement(s);
            x.setAttribute('style', 'width:0;height:0;position:absolute;');
            if (_fp_.tw_usr_id != '0') {
                r += '&p_user_id=' + _fp_.tw_usr_id;
            }
            x.src = r;
            y = d.getElementsByTagName('div')[0];
            y.parentNode.insertBefore(x, y);
        }(document, 'img', 'https://analytics.twitter.com/i/adsct?p_id=975');
    }

    if (_fp_.aw_act !== "0" && _fp_.aw_vp) {
        _fp_.aw_vp.forEach(function(element) {
          gtag('event', 'conversion', {'send_to': _fp_.aw_act +  '/' + element});
            if (_fp_.fpdebug)
                console.log('AdWords Pixel Page View Fired ' + element);
        });
    }

    var product;
    if (parent.__st.p === 'product') {
        _fp_.retailer_group_id.push(_fp_.fpp + parent.__st.rid);
        if (_fp_.fpdebug)
            console.log('Sending ViewContent');
        _fp_.event = {
            content_ids: _fp_.retailer_group_id,
            content_type: 'product_group'
        };
        fbq('trackSingle', _fp_.wca_id, 'ViewContent', _fp_.event);

        if (_fp_.sn) {
                snaptr('track', 'VIEW_CONTENT', {
                'item_ids': [_fp_.fpp + parent.__st.rid]
            });

            if (_fp_.fpdebug)
                console.log('Snapchat Pixel View Content Fire: ');
                console.log({'currency': currency, 'price': _fp_.amount, 'item_ids': _fp_.fpp + parent.__st.rid});
        }

        if (_fp_.twu) {
            twq('track', _fp_.event);
        }
        if (_fp_.two) {
            !function (d, s, r, x, y) {
                x = d.createElement(s);
                x.src = r;
                y = d.getElementsByTagName(s)[0];
                y.parentNode.insertBefore(x, y);
            }(document, 'script', '//platform.twitter.com/oct.js');
            try {
                _fp_.fpp += ShopifyAnalytics.meta.product.variants[0].id;
                window.setTimeout(function () {
                    twttr.conversion.trackPid(_fp_.tw_prd_id, {"tw_product_id": _fp_.fpp, "tw_country_code": 'US'});
                }, 2000);
            } catch (e) {
                if (_fp_.fpdebug)
                    console.log("Error finding Variant ID for Twitter Product View");
            }
        }

        if (_fp_.aw_rem !== "0" && _fp_.aw_rem) {
            gtag('event', 'view_item', {
                    'items': [{"id":_fp_.fpp + parent.__st.rid, "google_business_vertical": "retail"}]
                });
            if (_fp_.fpdebug)
                console.log('AdWords Pixel View Item Retarget Fired');
        }

        document.addEventListener('click',function () {
            setTimeout(function () {
                if (_fp_.fpdebug)
                    console.log('Checking cart');
                shopifyCartAjax();
            }, 3000);
        });
    } else if (_fp_.__st.pageurl.indexOf('/cart') > -1) {
        shopifyCartAjax();

    } else if (_fp_.__st.pageurl.indexOf('/collections') > -1) {
        if (_fp_.pt) {
            var url = window.location.href;
            var url_array = url.split('/');
            var collection_index = url_array.indexOf('collections');
            var category_index = collection_index + 1;
            if (collection_index !== -1 && typeof url_array[category_index] !== undefined) {
                var category = url_array[category_index];
                pintrk('track',   'viewcategory' ,  {"product_category": category});
            }
        }

    } else if (_fp_.__st.pageurl.indexOf('/thank_you') > -1) {
        _fp_.amount = parent.Shopify.checkout.total_price;
        var key = "";
        var orderId = "";
        if (parent.Shopify.checkout.hasOwnProperty('presentment_currency')) {
            currency = parent.Shopify.checkout.presentment_currency; 

        } else if (parent.Shopify.checkout.hasOwnProperty('currency')) {
            currency = parent.Shopify.checkout.currency;
        }

        if (parent.Shopify.checkout.hasOwnProperty('order_id')) {
            key = parent.Shopify.checkout.order_id;
            orderId = key;
        }

        if ("" === key) {
            key = amount;
        }

        var p_object = {"order_quantity": 0, "value": 0, "line_items": [], "currency": currency};
        var aw_items = [];

        if (orderId != "") {
            p_object.order_id = orderId;
        }

        if (currency != "") {
            p_object.currency = currency;
        }

        for (product in parent.Shopify.checkout['line_items']) {
            if (_fp_.retailer_id.indexOf(_fp_.fpp + parent.Shopify.checkout['line_items'][product]['variant_id']) === -1) {
                _fp_.retailer_id.push(_fp_.fpp + parent.Shopify.checkout['line_items'][product]['variant_id']);
                p_object.value += parent.Shopify.checkout['line_items'][product]['price'] * parent.Shopify.checkout['line_items'][product]['quantity'];
                p_object.order_quantity += parent.Shopify.checkout['line_items'][product]['quantity'];
                
                p_object.line_items.push(
                    {"product_price": parent.Shopify.checkout['line_items'][product]['price'], 
                    "product_variant_id": _fp_.fpp + parent.Shopify.checkout['line_items'][product]['variant_id'], 
                    "product_quantity": parent.Shopify.checkout['line_items'][product]['quantity'],"product_id": _fp_.fpp + parent.Shopify.checkout['line_items'][product]['product_id']});

                aw_items.push({"id": _fp_.fpp + parent.Shopify.checkout['line_items'][product]['variant_id'], "google_business_vertical":"retail"});
            }
        } 

        if (!isThankYouPage() || hasPurchaseCookie(key)) {
            event = {
                content_ids: _fp_.retailer_id,
                order_id: orderId,
                content_type: 'product',
                value: _fp_.amount,
                currency: currency
            };
            // It's ok to send a duplicate event for PurchaseDuplicate
            fbq('trackSingleCustom', _fp_.wca_id, 'PurchaseDuplicate', _fp_.event);
        } else {
            setCookie(key);
            if (_fp_.fpo === 'true') {
                // Facebook Purchase
                _fp_.event = {
                    content_ids: _fp_.retailer_id,
                    order_id: orderId,
                    content_type: 'product',
                    value: _fp_.amount,
                    currency: currency
                };
                fbq('trackSingleCustom', _fp_.wca_id, 'FlightplanPurchase', _fp_.event);
                // Pinterest Purchase
                if (_fp_.pt && p_object.line_items.length > 0) {
                    pintrk('track', 'checkout', p_object);
                }

                // Trigger Snapchat PURCHASE event
                if (_fp_.sn && init_data !== false && init_data.em !== undefined) {
                    snaptr('track', 'PURCHASE', {
                        'currency': currency, 
                        'price': _fp_.amount, 
                        'item_ids': _fp_.retailer_id,
                        'transaction_id': orderId
                    });

                    if (_fp_.fpdebug)
                        console.log('Snapchat Pixel Purchase fire: ' + {'currency': currency, 'price': _fp_.amount, 'item_ids': _fp_.retailer_id});
                }

                // Twitter Purchase Event
                if (_fp_.twu) {
                    twq('Purchase', _fp_.event);
                }
                if (_fp_.two) {
                    !function (d, s, r, x, y) {
                        x = d.createElement(s);
                        x.src = r;
                        y = d.getElementsByTagName(s)[0];
                        y.parentNode.insertBefore(x, y);
                    }(document, 'script', '//platform.twitter.com/oct.js');
                    window.setTimeout(function () {
                        twttr.conversion.trackPid(_fp_.tw_pch_id, {"tw_product_id": _fp_.event.content_ids[0], "tw_country_code": 'US', "tw_sale_amount": _fp_.event.value, "tw_order_quantity": 1});
                    }, 2000);
                }

                if (_fp_.aw_act !== "0" && _fp_.aw_pur) {
                    _fp_.aw_pur.forEach(function(element) {
                        gtag('event', 'conversion', {
                                'send_to': _fp_.aw_act +  '/' + element,
                                'currency': currency, 
                                'value': _fp_.amount,
                                'transaction_id': 'orderId'
                            });
                        if (_fp_.fpdebug)
                            console.log('AdWords Pixel Purchase Fired ' + element);
                    });
                }

                if (_fp_.aw_rem !== "0" && _fp_.aw_rem) {
                    gtag('event', 'purchase', {
                            'value': _fp_.amount,
                            'items': aw_items
                        });
                    if (_fp_.fpdebug)
                        console.log('AdWords Pixel Purchase Retarget Fired');
                }

            } else {
                // We fire BOTH a custom FlightplanPurchase event
                // AND a Standard Event if we cannot detect any other
                // purchase events on the customer's store
                _fp_.event = {
                    content_ids: _fp_.retailer_id,
                    order_id: orderId,
                    content_type: 'product',
                    value: _fp_.amount,
                    currency: currency
                };
                fbq('trackSingle', _fp_.wca_id, 'Purchase', _fp_.event);
                fbq('trackSingleCustom', _fp_.wca_id, 'FlightplanPurchase', _fp_.event);
                // Pinterest Purchase
                if (_fp_.pt && p_object.line_items.length > 0) {
                    pintrk('track', 'checkout', p_object);
                }

                if (_fp_.sn) {
                    snaptr('track', 'PURCHASE', {
                        'currency': currency, 
                        'price': _fp_.amount, 
                        'item_ids': _fp_.retailer_id,
                        'transaction_id': orderId
                    });

                    if (_fp_.fpdebug)
                        console.log('Snapchat Pixel Purchase fire: ' + {'currency': currency, 'price': _fp_.amount, 'item_ids': _fp_.retailer_id});
                }

                // Twitter Purchase Event
                if (_fp_.twu) {
                    twq('Purchase', _fp_.event);
                }
                if (_fp_.two) {
                    !function (d, s, r, x, y) {
                        x = d.createElement(s);
                        x.src = r;
                        y = d.getElementsByTagName(s)[0];
                        y.parentNode.insertBefore(x, y);
                    }(document, 'script', '//platform.twitter.com/oct.js');
                    window.setTimeout(function () {
                        twttr.conversion.trackPid(_fp_.tw_pch_id, {"tw_product_id": _fp_.event.content_ids[0], "tw_country_code": 'US', "tw_sale_amount": _fp_.event.value, "tw_order_quantity": 1});
                    }, 2000);
                }

                if (_fp_.aw_act !== "0" && _fp_.aw_pur) {
                    _fp_.aw_pur.forEach(function(element) {
                        gtag('event', 'conversion', {
                                'send_to': _fp_.aw_act +  '/' + element,
                                'currency': currency, 
                                'value': _fp_.amount,
                                'transaction_id': 'orderId'
                            });
                        if (_fp_.fpdebug)
                            console.log('AdWords Pixel Purchase Fired ' + element);
                    });
                }

                if (_fp_.aw_rem !== "0" && _fp_.aw_rem) {
                    gtag('event', 'purchase', {
                            'value': _fp_.amount,
                            'items': aw_items
                        });
                    if (_fp_.fpdebug)
                        console.log('AdWords Pixel Purchase Retarget Fired');
                }
            }
        }

    } else if (_fp_.__st.pageurl.indexOf('/checkouts') > -1) {
        amount = parent.Shopify.checkout.total_price;
        for (product in parent.Shopify.checkout['line_items']) {
            if (_fp_.retailer_id.indexOf(_fp_.fpp + parent.Shopify.checkout['line_items'][product]['variant_id']) === -1) {
                _fp_.retailer_id.push(_fp_.fpp + parent.Shopify.checkout['line_items'][product]['variant_id']);
            }
        }
        _fp_.event = {
            content_ids: _fp_.retailer_id,
            content_type: 'product',
            value: _fp_.amount,
            currency: currency
        };
        fbq('trackSingle', _fp_.wca_id, 'InitiateCheckout', _fp_.event);
        if (_fp_.twu) {
            twq('track', 'InitiateCheckout', _fp_.event);
        }
    } else if (_fp_.__st.pageurl.indexOf('payment_method') > -1) {
        _fp_.amount = parent.Shopify.checkout.total_price;
        for (product in parent.Shopify.checkout['line_items']) {
            if (_fp_.retailer_id.indexOf(_fp_.fpp + parent.Shopify.checkout['line_items'][product]['variant_id']) === -1) {
                _fp_.retailer_id.push(_fp_.fpp + parent.Shopify.checkout['line_items'][product]['variant_id']);
            }
        }

        _fp_.event = {
            content_ids: _fp_.retailer_id,
            content_type: 'product',
            value: _fp_.amount,
            currency: currency
        };
        fbq('trackSingle', _fp_.wca_id, 'AddPaymentInfo', _fp_.event);
        if (_fp_.twu) {
            twq('track', 'AddPaymentInfo', _fp_.event);
        }
    } else if (_fp_.__st.pageurl.indexOf('/account/register?sid') > -1) {
        fbq('trackSingle', _fp_.wca_id, 'Lead');
    } else if (_fp_.__st.pageurl.indexOf('/account?sid=') > -1) {
        fbq('trackSingle', _fp_.wca_id, 'CompleteRegistration');
        if (_fp_.twu) {
            twq('track', 'CompleteRegistration');
        }
    } else if (_fp_.__st.p === 'searchresults') {
        var term = _fp_.__st.pageurl.split('=');
        term = term[term.length - 1];
        _fp_.event = {
            search_string: term
        };
        fbq('trackSingle', _fp_.wca_id, 'Search', _fp_.event);
        if (_fp_.twu) {
            twq('track', 'Search', _fp_.event);
        }
    }
    
    
    
    
    
    function setCookie(key) {
        var now = new Date();
        var days = 32;
        now.setTime(now.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = "fp_purchase_" + key + "=" + key + "; expires=" + now.toUTCString() + "; path=/";
    }

    function getCookie(key) {
        var name = "fp_purchase_" + key + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ')
                c = c.substring(1);
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function setEmailCookie(email) {
        var now = new Date();
        var days = 27;
        now.setTime(now.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = "fp_email=" + email + "; expires=" + now.toUTCString() + "; path=/";
    }

    function getEmailCookie() {
        var name = "fp_email=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ')
                c = c.substring(1);
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }

        return false;
    }

    function getAddToCartCookie(value) {
        if (_fp_.fpdebug)
            console.log("Getting add to cart cookie");
        var name = "fp_add_to_cart=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ')
                c = c.substring(1);
            if (c.indexOf(name) === 0) {
                if (_fp_.fpdebug)
                    console.log("Add to cart cookie found");

                // If any of the indexes aren't in place we need to fire the event and create a new cookie
                for (var i = 0; i < value.length; i++) {
                    if (c.indexOf(value[i]) === -1) {
                        if (_fp_.fpdebug)
                            console.log("Product missing from cart" + value[i]);
                        return -1;
                    }
                };
                if (_fp_.fpdebug)
                    console.log("All products found in cookie");

                return 1;
            }
        }
        if (_fp_.fpdebug)
            console.log("Add to cart cookie not found " + value);
        return -1;
    }

    function setAddToCartCookie(value) {
        var now = new Date();
        var days = 32;
        now.setTime(now.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = "fp_add_to_cart=" + value + "; expires=" + now.toUTCString() + "; path=/";
        if (_fp_.fpdebug)
            console.log("Add to cart cookie set " + value);
    }

    function hasPurchaseCookie(key) {
        var purchase = getCookie(key);
        return (purchase !== "");
    }

    function shopifyCartAjax() {
        var date = new Date();
        var time = date.getTime();

        if ($ === undefined && jQuery !== undefined) {
            $ = jQuery;
        }

        if ($) {
            $.ajax({
                url: '/cart.js?' + time,
                dataType: 'json',
                type: 'get',
                success: function (cart) {
                    _fp_.__st.cart = cart;
                    _fp_.amount = cart['total_price'] / 100;

                    var p_object = {"order_quantity": 0, "value": 0, "line_items": [], "currency":currency};
                    var aw_items = [];

                    var value = [];
                    for (product in cart['items']) {
                        if (_fp_.retailer_id.indexOf(_fp_.fpp + cart['items'][product]['variant_id']) === -1 && cart['items'][product]['variant_id'] != undefined && cart['items'][product]['price'] != undefined) {
                            _fp_.retailer_id.push(_fp_.fpp + cart['items'][product]['variant_id']);

                            p_object.value += (cart['items'][product]['price'] / 100) * cart['items'][product]['quantity'];
                            p_object.order_quantity += cart['items'][product]['quantity'];
                            p_object.line_items.push({"product_price": cart['items'][product]['price'] / 100, "product_variant_id": _fp_.fpp + cart['items'][product]['variant_id'], "product_quantity": cart['items'][product]['quantity'],"product_id":_fp_.fpp + cart['items'][product]['product_id']});

                            value.push(_fp_.fpp + cart['items'][product]['variant_id']);

                            aw_items.push({"id": _fp_.fpp + cart['items'][product]['variant_id'], "google_business_vertical":"retail"});
                        }
                    }

                    if (_fp_.fpdebug)
                        console.log('Sending AddToCart on Cart Page');
                    if (_fp_.retailer_id.length > 0) {
                        _fp_.event = {
                            content_ids: _fp_.retailer_id,
                            content_type: 'product',
                            value: _fp_.amount,
                            currency: currency
                        };
                        fbq('init', _fp_.wca_id);
                        if (getAddToCartCookie(value) === -1) {
                            if (_fp_.fpdebug)
                                console.log("Add to cart event sent");
                            fbq('trackSingle', _fp_.wca_id, 'AddToCart', _fp_.event);
                            setAddToCartCookie(value);

                            if (_fp_.pt && p_object.line_items.length > 0) {
                                pintrk('track', 'addtocart', p_object);
                            }

                            if (_fp_.sn) {
                                    snaptr('track', 'ADD_CART', {
                                    'currency': currency, 
                                    'price': _fp_.amount, 
                                    'item_ids': _fp_.retailer_id
                                });

                                if (_fp_.fpdebug)
                                    console.log('Snapchat Pixel Add to Cart fired: ' + {'currency': currency, 'price': _fp_.amount, 'item_ids': _fp_.retailer_id});
                            }
                        }

                        if (_fp_.twu) {
                            twq('track', 'AddToCart', _fp_.event);
                        }

                        if (_fp_.aw_act !== "0" && _fp_.aw_atc) {

                            _fp_.aw_atc.forEach(function(element) {
                                gtag('event', 'conversion', {
                                        'send_to': _fp_.aw_act +  '/' + element,
                                        'currency': currency, 
                                        'value': _fp_.amount
                                    });
                                if (_fp_.fpdebug)
                                    console.log('AdWords Pixel Add to Cart Fired ' + element);
                            });
                        }

                        if (_fp_.aw_rem !== "0" && _fp_.aw_rem) {

                            gtag('event', 'add_to_cart', {
                                    'value': _fp_.amount,
                                    'items': aw_items
                                });
                            if (_fp_.fpdebug)
                                console.log('AdWords Pixel Add to Cart Retarget Fired');
                        }
                    }
                }
            });
        }

    }

    // Returns true if we are on the thank_you page, false otherwise.
    function isThankYouPage() {
        var i, content;
        var pat1 = new RegExp('window\.ShopifyAnalytics\.lib\.track', 'i');
        var pat2 = new RegExp('Completed Order', 'i');
        if (document.getElementsByClassName('analytics').length === 1) {
            if (document.getElementsByClassName('analytics')[0].tagName === 'SCRIPT') {
                content = document.getElementsByClassName('analytics')[0].innerHTML;
                if (pat1.test(content) && pat2.test(content)) {
                    return true;
                }
            }
        }
        // we only call this if we can't find by classname <script class="analytics">...</script>
        var allscripts = document.getElementsByTagName('script');
        for (i = 0; i < allscripts.length; i++) {
            content = allscripts[i].innerHTML;
            if (pat1.test(content) && pat2.test(content)) {
                return true;
            }
        }
        return false;
    }

    // Checks to see if we have user information to pass to Facebook during the init process
    function getInitData() {

        var init_data = {};
        // Get email
        if (Shopify !== undefined
                && Shopify !== null
                && Shopify.checkout !== undefined
                && Shopify.checkout !== null
                && Shopify.checkout.email !== undefined
                && Shopify.checkout.email !== null) {
            init_data.em = Shopify.checkout.email.toLowerCase();
            if (_fp_.fpdebug)
                console.log('Email sent to Facebook');

            setEmailCookie(init_data.em);
        }

        if (!init_data.em) {
            var tmp_email = getEmailCookie();
            if (tmp_email) {
                init_data.em = tmp_email;

                if (_fp_.fpdebug)
                    console.log('Email cookie found in init');
            }
        }

        // Get first name
        if (Shopify !== undefined
                && Shopify !== null
                && Shopify.checkout !== undefined
                && Shopify.checkout !== null
                && Shopify.checkout.shipping_address !== undefined
                && Shopify.checkout.shipping_address !== null
                && Shopify.checkout.shipping_address.first_name !== undefined
                && Shopify.checkout.shipping_address.first_name !== null) {
            init_data.fn = Shopify.checkout.shipping_address.first_name.toLowerCase();
            if (_fp_.fpdebug)
                console.log('User name sent to Facebook');
        }

        // Get last name
        if (Shopify !== undefined
                && Shopify !== null
                && Shopify.checkout !== undefined
                && Shopify.checkout !== null
                && Shopify.checkout.shipping_address !== undefined
                && Shopify.checkout.shipping_address !== null
                && Shopify.checkout.shipping_address.last_name !== undefined
                && Shopify.checkout.shipping_address.last_name !== null) {
            init_data.ln = Shopify.checkout.shipping_address.last_name.toLowerCase();
            if (_fp_.fpdebug)
                console.log('User name sent to Facebook');
        }

        // Get City
        if (Shopify !== undefined
                && Shopify !== null
                && Shopify.checkout !== undefined
                && Shopify.checkout !== null
                && Shopify.checkout.shipping_address !== undefined
                && Shopify.checkout.shipping_address !== null
                && Shopify.checkout.shipping_address.city !== undefined
                && Shopify.checkout.shipping_address.city !== null) {
            init_data.ct = Shopify.checkout.shipping_address.city.toLowerCase().replace(/\s+/g, '');

            if (_fp_.fpdebug)
                console.log('User address sent to Facebook');
        }

        // Get zip
        if (Shopify !== undefined
                && Shopify !== null
                && Shopify.checkout !== undefined
                && Shopify.checkout !== null
                && Shopify.checkout.shipping_address !== undefined
                && Shopify.checkout.shipping_address !== null
                && Shopify.checkout.shipping_address.zip !== undefined
                && Shopify.checkout.shipping_address.zip !== null) {
            init_data.zp = Shopify.checkout.shipping_address.zip;

            if (_fp_.fpdebug)
                console.log('User address sent to Facebook');
        }

        // Get state
        if (Shopify !== undefined
                && Shopify !== null
                && Shopify.checkout !== undefined
                && Shopify.checkout !== null
                && Shopify.checkout.shipping_address !== undefined
                && Shopify.checkout.shipping_address !== null
                && Shopify.checkout.shipping_address.province_code !== undefined
                && Shopify.checkout.shipping_address.province_code !== null) {
            init_data.st = Shopify.checkout.shipping_address.province_code.toLowerCase();;

            if (_fp_.fpdebug)
                console.log('User address sent to Facebook');
        }

        if (init_data === {}) {
            return false;
        } else {
            if (_fp_.fpdebug)
                console.log(init_data);
            return init_data;
        }
    }
})();