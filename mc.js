"undefined"!=typeof jQuery&&function(e){var i,t,n,o,r=["gclid","cmp_id","adg_id","kwd","device"];function a(e){for(var i=e+"=",t=document.cookie.split(";"),n=0;n<t.length;n++){for(var o=t[n];" "==o.charAt(0);)o=o.substring(1,o.length);if(0==o.indexOf(i))return o.substring(i.length,o.length)}return null}r.forEach(function(e){var i,t=(i=RegExp("[?&]"+e+"=([^&]*)").exec(window.location.search))&&decodeURIComponent(i[1].replace(/\+/g," "));t&&function(e,i){var t=new Date;t.setTime(t.getTime()+2592e6);var n="; expires="+t.toGMTString();document.cookie=e+"="+i+n+";path=/"}(e,t)}),e('form[action="/cart/add"]').on("click",(i=function(){var i={},t=!0;for(var n of r){var o=a(n);if(!o){t=!1;break}i[n]=o}t&&e.ajax({type:"POST",url:"https://shopify.cleverecommerce.com/api/v1/mc",data:{domain:Shopify.shop,id:e(this).serialize(),hash:i}})},t=1500,n=!0,function(){var e=this,r=arguments,a=n&&!o;clearTimeout(o),o=setTimeout(function(){o=null,n||i.apply(e,r)},t),a&&i.apply(e,r)}))}(jQuery);