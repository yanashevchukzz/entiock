(function (send) {
    XMLHttpRequest.prototype.send = function (data) {
        var requestListenUrls = ['/cart/add.js', '/cart/update.js', '/cart/change.js', '/cart/clear.js'];
        var _this = this;
        if (_this._method === 'POST' && requestListenUrls.some(function (partialUrl) {
            return _this._url.indexOf(document.location.origin + partialUrl) === 0 ||
                _this._url.indexOf(partialUrl) === 0;
        })) {
            _this.addEventListener('readystatechange', readyStateChangeHandler);
        }
        send.call(_this, data);

        function readyStateChangeHandler(event) {
            if (_this.readyState === 4) {
                refreshCart();
                _this.removeEventListener('readystatechange', readyStateChangeHandler)
            }
        }
    };

    function refreshCart() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/cart.js');
        xhr.onload = function () {
            if (xhr.status === 200 && window.connectif) {
                var cart = JSON.parse(xhr.responseText);
                var domCnCart = createCnCartDomElement(cart);
                var existingDomCnCart = document.querySelector('.cn_cart');
                if(existingDomCnCart){
                    existingDomCnCart.parentNode.replaceChild(domCnCart, existingDomCnCart);
                } else {
                    document.body.appendChild(domCnCart);
                }
                window.connectif.managed.sendEvents([]);
            }
        };
        xhr.send();
    }

    function createCnCartDomElement(cart) {
        var domCnCart = document.createElement('div');
        domCnCart.className = 'cn_cart';
        domCnCart.style.display = 'none';
        if (!cart) {
            return domCnCart;
        }
        var innerHTML = '<span class="cart_id">0</span>' +
            '<span class="total_price">' + (cart.total_price / 100) + '</span>' +
            '<span class="total_quantity">' + cart.item_count + '</span>';
        cart.items.forEach(function (item) {
            innerHTML += '<div class="product_basket_item">' +
                '<span class="quantity">' + item.quantity + '</span>' +
                '<span class="price">' + (item.line_price / 100) + '</span>' +
                '<span class="name">' + escapeHtml(item.product_title) + '</span>' +
                '<span class="url">' + document.location.origin + '/products/' + item.handle + '</span>' +
                '<span class="product_id">' + item.product_id + '</span>' +
                '<span class="unit_price">' + (item.price / 100) + '</span>' +
                '</div>'
        });
        domCnCart.innerHTML = innerHTML;
        return domCnCart;

        function escapeHtml(html){
            var text = document.createTextNode(html);
            var p = document.createElement('p');
            p.appendChild(text);
            return p.innerHTML;
        }
    }
})(XMLHttpRequest.prototype.send);