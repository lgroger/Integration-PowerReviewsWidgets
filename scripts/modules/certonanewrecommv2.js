require(['shim!//edge1.certona.net/cd/67195178/shindigz.com/scripts/resonance[modules/jquery-mozu=jQuery]>jQuery', 'underscore','modules/jquery-mozu'], function(certonaLib,_,$) {
window.recommendedproducts = null;
var certonaRecommendations = function(response){
	window.recommendedproducts = response;
	
    var htmlfun = function(recomm,divid){
		var htmltemp = " ";

   		//console.log(recomm);
		_.each(recomm,function(v,i){	
			htmltemp += '<div class="item">';
			htmltemp += '<div class="mz-productlist-item" data-mz-product="'+recomm[i].id+'">';
			htmltemp += '<div class="mz-productlisting mz-productlist-tiled" data-mz-product="'+recomm[i].id+'">';
			htmltemp += '<div class="mz-productlisting-image">';
			htmltemp += '<a href="'+recomm[i].Detail_URL+'?rrec=true">';
			htmltemp += '<img src="'+ recomm[i].Image_URL.replace("http:","")+'?max=210" alt="'+recomm[i].Name+'">';
			htmltemp += '</a>';
			htmltemp += '<div class="quick-view">';
			htmltemp += '<a href="javascript:void(0)" data-pro-id="'+recomm[i].id+'">QUICK VIEW';
			htmltemp += '</a>';
			htmltemp += '</div>';
			htmltemp += '<div class="wishlist-icon" id="'+recomm[i].id+'">';
			htmltemp +=  '<a href="#" id="'+recomm[i].id+'">';
			htmltemp +=  '</a>';
			htmltemp += '</div>';
						
			htmltemp += '</div>'; 
			htmltemp += '<div class="mz-productlisting-info">';
			htmltemp += '<a class="mz-productlisting-title" href="'+recomm[i].Detail_URL+'?rrec=true">'+recomm[i].Name+'</a>';
			htmltemp += '<div itemprop="priceSpecification" itemscope="" itemtype="http://schema.org/PriceSpecification" class="mz-pricestack">';
			htmltemp += '<span>';
			if(parseFloat(recomm[i].MaxPrice) > parseFloat(recomm[i].Price)){
				htmltemp += '<span itemprop="minPrice" class="mz-pricestack-price-lower">$'+parseFloat(recomm[i].Price).toFixed(2)+'</span>';
				htmltemp += '<span itemprop="maxPrice" class="mz-pricestack-price-up">$'+parseFloat(recomm[i].MaxPrice).toFixed(2)+'</span>';
				//htmltemp += '</span>'; 
			}else{
				htmltemp += '<span class="mz-price">$'+parseFloat(recomm[i].Price).toFixed(2)+'</span>';
			}
			htmltemp += '</span>';
			htmltemp += '<span class="cerumo">'+recomm[i].UOM+'</span>';
			htmltemp += '</div>';
			htmltemp += '</div>';
			
			var isPersionalize=false;
			var prod_obj;
			

			if(window.recommendedproducts.resonance.schemes.length > 1){
				if(_.findWhere(window.recommendedproducts.resonance.schemes[0].items,{id:v.id})!== undefined){
					prod_obj=_.findWhere(window.recommendedproducts.resonance.schemes[0].items,{id:v.id});
						if(prod_obj!==undefined){
							if(prod_obj.Personalized==="True"){
								isPersionalize=true;
							}else{
								isPersionalize=false;
							}
						}
				}else if(_.findWhere(window.recommendedproducts.resonance.schemes[1].items,{id:v.id})!== undefined){
					prod_obj=_.findWhere(window.recommendedproducts.resonance.schemes[1].items,{id:v.id});
				if(prod_obj!==undefined){
							if(prod_obj.Personalized==="True"){
								isPersionalize=true;
							}else{
								isPersionalize=false;
							}
						}
				}
			}
				else{
				prod_obj=_.findWhere(window.recommendedproducts.resonance.schemes[0].items,{id:v.id});
				if(prod_obj!==undefined){
					if(prod_obj.Personalized === "True"){
						isPersionalize=true;
					}else{
						isPersionalize=false;
					}
				}
			}
			var recs;
			if(isPersionalize){
				var pagetype = require.mozuData('pagecontext').pageType;
				
			if(pagetype === "search" || pagetype === "category" ){
				recs = '?rrec=true'; 
			}
			htmltemp += '<div class="mz-productlisting-is-personalize">';
			htmltemp += '<a href="'+recomm[i].Detail_URL;
			if(recs){
				htmltemp += recs+'">PERSONALIZE</a>';
			}
			else{
				htmltemp += '">PERSONALIZE</a>';
			}
			htmltemp += '</div>';
			}


			htmltemp += '</div>';
			htmltemp += '</div>';
			htmltemp += '</div>';
        	
   		}); 
      $(divid).html('<div class="pdp-related-products"><div class="clear"></div><div class="echi-shi-related-products-slider"><div class="owl-carousel owl-theme">'+htmltemp+'</div></div></div>');
      
      $('.echi-shi-related-products-slider .owl-carousel').owlCarousel({
				loop:true, 
				margin:10,
				nav:true,
				responsive:{
				0:{items:2},
				600:{items:2},
				1000:{items:4}
				}
				});
	}; 

		var recommendedProductSearch = function(recomms){
			response.items=[];
			var resp = [];
			for(var x =0;x<recomms.resonance.schemes.length;x++){
				for(var y=0;y<recomms.resonance.schemes[x].items.length;y++){
					if(recomms.resonance.schemes[x].scheme === 'product1_rr'){
						response.items.push(recomms.resonance.schemes[x].items[y]);
					}
					else if(recomms.resonance.schemes[x].scheme === 'product2_rr'){
						resp.push(recomms.resonance.schemes[x].items[y]);
					}
					else{
						response.items.push(recomms.resonance.schemes[x].items[y]);
					}
				}
			}

			var addtoc = "#recommended_products_slot_cart";
			var prd1_rcc = "#recommended_products_slot_1";
			var prd2_rcc = "#recommended_products_slot_2";
			var cat1_rr = "#recommended_products_slot";
            
			_.each(recomms.resonance.schemes,function(v,i){
				if(recomms.resonance.schemes[i].scheme === "addtocart1_rr"){
					//var addtocartproducts = response.items;
					htmlfun(response.items,addtoc);
				}
				else if(recomms.resonance.schemes[i].scheme === "category1_rr"){
					//var catprod = response.items;
					htmlfun(response.items,cat1_rr); 
				}
				else if(recomms.resonance.schemes[i].scheme === "cart1_rr"){
					//var catprod = response.items;
					htmlfun(response.items,cat1_rr); 
				}
				else if(recomms.resonance.schemes[i].scheme === "nosearch1_rr"){
					//var catprod = response.items;
					htmlfun(response.items,cat1_rr); 
				}
				else if(recomms.resonance.schemes[i].scheme === "product1_rr" ){
					htmlfun(response.items,prd1_rcc); 

					if( response.items.length>0 && recomms.resonance.schemes[i].display === "yes" ){
						$('.recom_slot-heading_1').show();
					}
				}
				else if(recomms.resonance.schemes[i].scheme === "product2_rr" ){
//                console.log(resp);
					htmlfun(resp,prd2_rcc);

					if( response.items.length>0  && recomms.resonance.schemes[i].display === "yes" ){
						$('.recom_slot-heading_2').show();	
					}
				}

			});




		};
	
	if(window.recommendedproducts){
		recommendedProductSearch(window.recommendedproducts);	
	}
};
window.certonaRecommendations=certonaRecommendations;
});

/* beautified version of //edge1.certona.net/cd/67195178/shindigz.com/scripts/resonance 03/27/18 
//resxclsx.js v5.5 Copyright 2004-2017 Certona Corporation www.certona.com. All rights reserved.
//shindigz.com
var certonaResx = function() {
    "use strict";
    var e, n = "certonaResx.showResponse",
        r = "",
        t, i, s = false,
        c, f, l, a, o, u;

    function d(e) {
        return parseInt(e, 10)
    }

    function x(e) {
        try {
            var n;
            if (e !== undefined && e !== null && e !== "null" && e !== "") {
                n = true;
                return n
            }
        } catch (r) {}
        return false
    }

    function m() {
        return resx.rrelem
    }

    function h(e) {
        try {
            var n = null,
                r, t;
            if (x(e)) {
                n = [];
                if (x(document.getElementById(e))) {
                    n[0] = e
                } else {
                    t = e.replace(/[,;]/g, ".").split(".");
                    for (r = 0; r < t.length; r += 1) {
                        if (t[r] !== "" && x(document.getElementById(t[r]))) {
                            n[r] = t[r]
                        } else {
                            n[r] = ""
                        }
                    }
                }
            }
            return n
        } catch (i) {}
        return null
    }

    function p() {
        try {
            var e, n, r;
            if (resx.rrelem !== undefined) {
                r = h(m());
                if (r !== undefined && r !== null) {
                    for (e = 0; e < r.length; e += 1) {
                        if (r[e] !== "") {
                            n = document.getElementById(r[e])
                        } else {
                            n = null
                        }
                        if (x(n)) {
                            n.style.visibility = "visible"
                        }
                    }
                }
            }
        } catch (t) {}
    }

    function g(e, n) {
        try {
            if (!s) {
                s = true;
                r = e + "|" + (n.number !== undefined ? n.number : "undefined") + "|" + (n.name !== undefined ? n.name : "undefined") + "|" + (n.description !== undefined ? n.description : "undefined")
            }
        } catch (t) {} finally {
            p()
        }
    }

    function y(e) {
        try {
            var n, r, t;
            if (document.cookie.length > 0) {
                n = document.cookie;
                r = n.indexOf(e + "=");
                if (r !== -1) {
                    r += e.length + 1;
                    t = n.indexOf(";", r);
                    if (t === -1) {
                        t = n.length
                    }
                    return decodeURIComponent(n.slice(r, t))
                }
            }
        } catch (i) {
            g("", i)
        }
        return null
    }

    function R(e, n, r, t) {
        try {
            var i = new Date;
            if (r !== null) {
                i.setTime(i.getTime() + r * 3600 * 1e3)
            }
            document.cookie = e + "=" + encodeURIComponent(n) + (r !== null ? "; expires=" + i.toGMTString() : "") + "; path=/" + (x(t) ? "; domain=" + t : "")
        } catch (s) {
            g("", s)
        }
    }

    function v(e, n) {
        try {
            var r;
            if (n !== undefined && n !== null) {
                for (r = 0; r < n.length; r += 1) {
                    if (n[r] === e) {
                        return true
                    }
                }
            }
        } catch (t) {}
        return false
    }

    function k() {
        try {
            var e, n, r, t, c;
            n = resx.rrec !== undefined && (resx.rrec === true || resx.rrec === "true") && a === "1" && resx.rrelem !== undefined && resx.rrelem !== null && !s;
            if (n) {
                if (!i) {
                    n = false;
                    c = h(m());
                    if (c !== undefined && c !== null) {
                        for (e = 0; e < c.length; e += 1) {
                            if (x(c[e])) {
                                n = true;
                                break
                            }
                        }
                    }
                }
                if (n) {
                    if (!x(resx.useitems)) {
                        n = false;
                        if (resx.rrnum !== undefined) {
                            r = resx.rrnum;
                            r += "";
                            r = r.replace(/,/g, ";");
                            t = r.split(";");
                            for (e = 0; e < t.length; e += 1) {
                                if (!isNaN(t[e]) && d(t[e]) > 0) {
                                    n = true;
                                    break
                                }
                            }
                        }
                    }
                }
            }
            return n
        } catch (f) {}
        return false
    }

    function N(e) {
        try {
            var n, r = "";
            e += "";
            for (n = e.length - 1; n >= 0; n -= 1) {
                r += e.charAt(n)
            }
            return r
        } catch (t) {}
        return ""
    }

    function w() {
        try {
            var e, n, r, t, i;
            if (navigator.userAgent.toLowerCase().indexOf("mac") === -1) {
                i = Math.floor(Math.random() * 1e15);
                i += ""
            } else {
                r = Math.floor(Math.random() * 1e6);
                e = new Date;
                n = e.getTime();
                n += "";
                t = N(n);
                r += "";
                i = r + t.slice(0, 11)
            }
            return i
        } catch (s) {
            g("guid", s)
        }
        return ""
    }

    function b(e, n, r, t, i, s) {
        try {
            var c, f, l, a = "",
                o, u, d, m, h, p, y, R, k, N, w = "";
            if (typeof e === "object") {
                f = document.getElementsByTagName("a")
            } else {
                l = document.getElementById(e);
                if (x(l)) {
                    f = l.getElementsByTagName("a");
                    a = e
                }
            }
            if (f !== undefined && f !== null) {
                p = [];
                if (n !== undefined && n !== null) {
                    for (o = 0; o < n.length; o += 1) {
                        if (n[o] !== "") {
                            h = document.getElementById(n[o])
                        } else {
                            h = null
                        }
                        if (x(h)) {
                            N = h.getElementsByTagName("a");
                            for (d = 0; d < N.length; d += 1) {
                                p.push(N[d])
                            }
                        }
                    }
                }
                y = 0;
                for (o = 0; o < f.length; o += 1) {
                    if (y === s) {
                        break
                    }
                    c = f[o];
                    if (x(c)) {
                        u = "";
                        k = encodeURIComponent(c);
                        if (x(r)) {
                            k = k.match(r);
                            k += ""
                        }
                        if (x(k)) {
                            u = k.match(t);
                            u += ""
                        }
                        if (x(u)) {
                            if (!v(c, p)) {
                                m = k.match(i);
                                m += "";
                                R = u + encodeURIComponent("|") + a + encodeURIComponent("|") + (x(m) ? m : "") + ";";
                                if (w.indexOf(R) === -1) {
                                    w += R;
                                    y += 1
                                }
                            }
                        }
                    }
                }
            }
            return w
        } catch (b) {
            g("gpl", b)
        }
        return ""
    }

    function I(e) {
        try {
            t = true;
            var n, r, s, c;
            if (!i) {
                for (n = 0; n < e.Resonance.Response.length; n += 1) {
                    r = false;
                    s = e.Resonance.Response[n].scheme;
                    if (e.Resonance.Response[n].display === "yes") {
                        r = true;
                        c = document.getElementById(s);
                        if (x(c)) {
                            c.innerHTML = e.Resonance.Response[n].output
                        }
                    }
                    if (typeof resonanceResponseLoaded === "function") {
                        resonanceResponseLoaded(s, r)
                    }
                }
                if (typeof resonanceResponseLoadedAll === "function") {
                    resonanceResponseLoadedAll()
                }
            }
        } catch (f) {} finally {
            p()
        }
    }

    function C() {
        try {
            if (!t && !i) {
                if (e < 2e3) {
                    e = e + 10;
                    window.setTimeout(certonaResx.checkCallback, 10)
                } else {
                    i = true;
                    p()
                }
            }
        } catch (n) {
            p()
        }
    }

    function E(e) {
        try {
            var r = "",
                t = "",
                i;
            if (typeof e === "boolean" && e === true) {
                if (x(resx.rrcall)) {
                    r = resx.rrcall
                } else {
                    r = n
                }
            } else if (typeof e === "string") {
                r = e
            }
            if (r.length > 0) {
                if (r === n) {
                    t = "&cb="
                } else {
                    t = "&ccb="
                }
                t += r
            }
            i = (x(resx.useitems) ? "&ui=" + resx.useitems : "&no=" + resx.rrnum) + (x(resx.exitemid) ? "&ex=" + resx.exitemid : "") + (x(resx.rrqs) ? "&" + resx.rrqs : "") + t;
            return i
        } catch (s) {}
        return ""
    }

    function B() {
        try {
            var e, n, r = window.location.hostname;
            if (x(r)) {
                if (!r.match(/(\d{1,3}\.){3}\d{1,3}/)) {
                    e = r.split(".");
                    if (e.length > 1) {
                        r = "." + e[e.length - 2] + "." + e[e.length - 1];
                        n = /\.(co|com)\.\w{2}$/;
                        if (r.toLowerCase().match(n) && e.length > 2) {
                            r = "." + e[e.length - 3] + r
                        }
                    }
                }
                return r
            }
        } catch (t) {
            g("gsd", t)
        }
        return null
    }

    function T(e) {
        try {
            return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(e).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"))
        } catch (n) {}
        return null
    }

    function U() {
        try {
            var e, n = "",
                r;
            for (e = 0; e < 51; e += 1) {
                if (resx["cv" + e] !== undefined) {
                    r = resx["cv" + e];
                    r += "";
                    r = r.replace(/\+/g, "%2B");
                    n += "&cv" + e + "=" + encodeURIComponent(r)
                }
            }
            return n
        } catch (t) {
            g("gcv", t)
        }
        return ""
    }

    function L(v) {
        try {
            var N = {
                    callback: false
                },
                I, C, E, U, L, S, M, O, q, A, D, $, j, G, _, H, K;
            if (v === undefined) {
                v = N
            } else {
                for (U = 0; U < N.length; U += 1) {
                    if (v[U] === undefined) {
                        v[U] = N[U]
                    }
                }
            }
            s = false;
            r = "";
            u = "";
            o = "";
            a = "";
            f = "";
            l = "";
            c = false;
            t = false;
            i = false;
            e = 0;
            I = B();
            $ = "RES_TRACKINGID";
            D = "RES_SESSIONID";
            A = "ResonanceSegment";
            if (window.location.search.indexOf("resxtrack=") > 0 && !x(resx.trackingid)) {
                u = T("resxtrack")
            }
            if (!x(resx.trackingid)) {
                if (!isNaN(d(u))) {
                    R($, u, 17520, I);
                    if (!x(y($))) {
                        R($, u, null, I)
                    }
                    R(D, "", -1, I)
                } else {
                    u = y($);
                    if (isNaN(d(u))) {
                        u = w()
                    }
                    R($, u, 17520, I);
                    if (!x(y($))) {
                        R($, u, null, I)
                    }
                }
                if (!x(resx.segment)) {
                    K = d(u);
                    if (!isNaN(K) && K > 0) {
                        K += "";
                        K = K.slice(1, 6);
                        K = d(K);
                        j = d(resx.top1);
                        G = d(resx.top2);
                        _ = d(resx.top3);
                        H = 1e5;
                        if (!(isNaN(j) && isNaN(G) && isNaN(_))) {
                            if (isNaN(j)) {
                                j = 0
                            }
                            if (isNaN(G)) {
                                G = j
                            }
                            if (isNaN(_)) {
                                _ = G
                            }
                            if (K < j) {
                                a = "1"
                            } else if (K < G) {
                                a = "2"
                            } else if (K < _) {
                                a = "3"
                            } else if (K < H) {
                                a = "4"
                            }
                        }
                    }
                    R(A, a, 1440, I);
                    if (!x(y(A))) {
                        R(A, a, null, I)
                    }
                }
            } else {
                u = resx.trackingid
            }
            if (!x(resx.sessionid) && !x(resx.trackingid)) {
                o = y(D);
                if (!x(o)) {
                    o = w()
                }
                R(D, o, .5, I);
                if (!x(y(D))) {
                    R(D, o, null, I)
                }
            } else {
                o = resx.sessionid
            }
            if (x(resx.segment)) {
                a = resx.segment;
                a += ""
            }
            if (isNaN(d(a))) {
                a = "1"
            }
            if (x(resx.pageid)) {
                f = resx.pageid
            } else {
                f = w()
            }
            C = resx.links !== undefined ? String(resx.links) : "";
            if (x(C)) {
                E = C.replace(/\,/g, ";").replace(/\|/g, "%7C").split(";", 50);
                for (U = 0; U < E.length; U += 1) {
                    l += E[U] + ";"
                }
            }
            M = resx.maxl !== undefined && !isNaN(d(resx.maxl)) ? d(resx.maxl) : 20;
            L = resx.lkmatch !== undefined ? resx.lkmatch : "";
            S = resx.ltmatch !== undefined ? resx.ltmatch : "";
            if (x(L)) {
                O = resx.plkmatch !== undefined ? resx.plkmatch : "";
                if (resx.rrelem !== undefined) {
                    q = h(m())
                }
                if (q !== undefined && q !== null && q.length > 0) {
                    for (U = 0; U < q.length; U += 1) {
                        if (x(q[U])) {
                            l += b(q[U], null, O, L, S, 50)
                        }
                    }
                }
                if (M > 0) {
                    l += b(document, q, O, L, S, M)
                }
            }
            if (typeof v.callback === "string" && v.callback !== n || v.callback === false || x(resx.rrcall) && resx.rrcall !== n) {
                i = true
            }
            c = k() && x(u) && x(f);
            if (!c) {
                p()
            }
        } catch (z) {
            g("pv", z)
        }
    }

    function S(e) {
        try {
            var n, t, i, d, h, p, g, y = "5.5x";
            if (a === "1" || a === "2" || a === "3") {
                if (c) {
                    window.setTimeout(certonaResx.checkCallback, 50)
                }
                t = window.location.protocol.toLowerCase() === "https:" ? "https://" : "http://";
                h = "www.res-x.com";
                if (x(resx.host)) {
                    h = resx.host
                }
                i = "appid=" + (resx.appid !== undefined ? resx.appid : "") + "&tk=" + (x(u) ? u : "") + "&ss=" + (x(o) ? o : "") + "&sg=" + (x(a) ? a : "") + "&pg=" + (x(f) ? f : "") + "&vr=" + y + "&bx=" + c;
                g = "";
                if (resx.rrelem !== undefined && resx.rrelem !== null) {
                    p = m().replace(/[,;]/g, ".").split(".");
                    if (p !== null) {
                        for (n = 0; n < p.length; n += 1) {
                            g += "&sc=" + p[n]
                        }
                    }
                }
                i += g + (resx.event !== undefined ? "&ev=" + resx.event : "") + (resx.itemid !== undefined ? "&ei=" + resx.itemid : "") + (resx.qty !== undefined ? "&qty=" + resx.qty : "") + (resx.price !== undefined ? "&pr=" + resx.price : "") + (resx.shipping !== undefined ? "&sh=" + resx.shipping : "") + (resx.total !== undefined ? "&tt=" + resx.total : "") + (resx.currencycode !== undefined ? "&cc=" + resx.currencycode : "") + (resx.customerid !== undefined ? "&cu=" + resx.customerid : "") + (resx.transactionid !== undefined ? "&tr=" + resx.transactionid : "");
                i += (c ? E(e) : "") + U() + "&ur=" + encodeURIComponent(window.location.href.slice(0, 400)) + "&plk=" + (x(l) ? l : "") + "&rf=" + encodeURIComponent(document.referrer) + (s === true ? "&er=" + s + "&em=" + encodeURIComponent(r) : "");
                d = t + h + "/ws/r2/Resonance.aspx" + "?" + i;
                return d.slice(0, 2013)
            }
        } catch (R) {}
        return ""
    }

    function M(e) {
        try {
            if (e !== "") {
                var n = document.createElement("script"),
                    r = document.getElementsByTagName("script")[0];
                n.type = "text/javascript";
                n.async = true;
                n.src = e;
                r.parentNode.insertBefore(n, r)
            }
        } catch (t) {}
    }

    function O(e) {
        var n = {
                callback: false
            },
            r;
        if (e === undefined) {
            e = n
        } else {
            for (r = 0; r < n.length; r += 1) {
                if (e[r] === undefined) {
                    e[r] = n[r]
                }
            }
        }
        return S(e.callback)
    }

    function q() {
        L({
            callback: true
        });
        var e = S(true);
        M(e)
    }
    return {
        checkCallback: function() {
            C()
        },
        showResponse: function(e) {
            I(e)
        },
        getURL: function(e) {
            L(e);
            return O(e)
        },
        run: function() {
            q()
        }
    }
}();
var ready = function() {
    function g() {
        if (!a.isReady) {
            try {
                document.documentElement.doScroll("left")
            } catch (b) {
                setTimeout(g, 1);
                return
            }
            a.ready()
        }
    }
    var e, c, m = {
            "[object Boolean]": "boolean",
            "[object Number]": "number",
            "[object String]": "string",
            "[object Function]": "function",
            "[object Array]": "array",
            "[object Date]": "date",
            "[object RegExp]": "regexp",
            "[object Object]": "object"
        },
        a = {
            isReady: !1,
            readyWait: 1,
            holdReady: function(b) {
                b ? a.readyWait++ : a.ready(!0)
            },
            ready: function(b) {
                if (!0 === b && !--a.readyWait || !0 !== b && !a.isReady) {
                    if (!document.body) return setTimeout(a.ready, 1);
                    a.isReady = !0;
                    !0 !== b && 0 < --a.readyWait || e.resolveWith(document, [a])
                }
            },
            bindReady: function() {
                if (!e) {
                    e = a._Deferred();
                    if ("complete" === document.readyState) return setTimeout(a.ready, 1);
                    if (document.addEventListener) document.addEventListener("DOMContentLoaded", c, !1), window.addEventListener("load", a.ready, !1);
                    else if (document.attachEvent) {
                        document.attachEvent("onreadystatechange", c);
                        window.attachEvent("onload", a.ready);
                        var b = !1;
                        try {
                            b = null == window.frameElement
                        } catch (f) {}
                        document.documentElement.doScroll && b && g()
                    }
                }
            },
            _Deferred: function() {
                var b = [],
                    f, c, e, h = {
                        done: function() {
                            if (!e) {
                                var c = arguments,
                                    d, g, j, l, k;
                                f && (k = f, f = 0);
                                d = 0;
                                for (g = c.length; d < g; d++) j = c[d], l = a.type(j), "array" === l ? h.done.apply(h, j) : "function" === l && b.push(j);
                                k && h.resolveWith(k[0], k[1])
                            }
                            return this
                        },
                        resolveWith: function(a, d) {
                            if (!e && !f && !c) {
                                d = d || [];
                                c = 1;
                                try {
                                    for (; b[0];) b.shift().apply(a, d)
                                } finally {
                                    f = [a, d], c = 0
                                }
                            }
                            return this
                        },
                        resolve: function() {
                            h.resolveWith(this, arguments);
                            return this
                        },
                        isResolved: function() {
                            return !(!c && !f)
                        },
                        cancel: function() {
                            e = 1;
                            b = [];
                            return this
                        }
                    };
                return h
            },
            type: function(a) {
                return null == a ? String(a) : m[Object.prototype.toString.call(a)] || "object"
            }
        };
    document.addEventListener ? c = function() {
        document.removeEventListener("DOMContentLoaded", c, !1);
        a.ready()
    } : document.attachEvent && (c = function() {
        "complete" === document.readyState && (document.detachEvent("onreadystatechange", c), a.ready())
    });
    return function(b) {
        a.bindReady();
        a.type(b);
        e.done(b)
    }
}();
var resx = {};
resx.appid = "shindigz01";
resx.top1 = 1e5;
resx.top2 = 1e5;
resx.rrec = false;

function waitForElement() {
    try {
        var e = Array.prototype.slice.call(arguments);
        if (typeof e[2] !== "number") {
            e.splice(2, 0, e[1] / 10)
        }
        e[1] -= e[2];
        if (document.querySelector(e[0])) {
            e.forEach(function(e) {
                if (typeof e === "function") {
                    e()
                }
            })
        } else {
            window.setTimeout(function() {
                if (e[1] > 0) {
                    waitForElement.apply(null, e)
                }
            }, e[2])
        }
    } catch (r) {}
}

function setAddToBagRecs() {
    try {
        resx.event = "addtocart_op";
        resx.rrelem = "addtocart1_rr";
        resx.rrnum = 20;
        resx.rrec = true;
        resx.rrcall = "certonaRecommendations";
        certonaResx.run()
    } catch (e) {}
}

function receiveMessage(e) {
    try {
        if (e.origin === "https://pers.shindigz.com" && e.data.upload === true) {
            waitForElement("div#mz-added-to-cart", 4e3, 10, function() {
                resx.itemid = e.data.itemID;
                setAddToBagRecs()
            })
        }
    } catch (r) {}
}

function quickviewEvents() {
    try {
        var e = function(e, r) {
            try {
                resx.event = e === "OPR" ? "quickview_opr" : "quickview_op";
                resx.itemid = jQuery(r).attr("data-pro-id");
                resx.rrelem = "";
                resx.rrnum = "";
                resx.rrec = false;
                certonaResx.run();
                jQuery("body").off("click", "button[id='add-to-cart']").on("click", "button[id='add-to-cart']", function() {
                    try {
                        if (jQuery("select.mz-productoptions-option").length === jQuery('select.mz-productoptions-option option[selected="true"]').length) {
                            resx.event = e === "OPR" ? "addtocart_opr" : "addtocart_op";
                            resx.rrelem = "";
                            resx.rrnum = "";
                            resx.rrec = false;
                            setAddToBagRecs()
                        }
                    } catch (r) {}
                });
                jQuery("body").off("click", 'input[name="wishlist-radio"], button#select-wishlist').on("click", 'input[name="wishlist-radio"], button#select-wishlist', function() {
                    try {
                        resx.event = e === "OPR" ? "wishlist_opr" : "wishlist_op";
                        certonaResx.run()
                    } catch (r) {}
                })
            } catch (t) {}
        };
        jQuery("body").off("click", "div.quick-view a").on("click", "div.quick-view a", function() {
            try {
                e("OP", this)
            } catch (r) {}
        });
        jQuery("body").off("click", "div.pdp-related-products div.quick-view a").on("click", "div.pdp-related-products div.quick-view a", function() {
            try {
                e("OPR", this)
            } catch (r) {}
        })
    } catch (r) {}
}

function excludeItems() {
    try {
        var e = [];
        if (jQuery("div.product-color-swatch").length > 0) {
            jQuery("div.product-color-swatch li.item a").each(function() {
                try {
                    e.push(jQuery(this).attr("href").match(/[A-Z0-9\-]+$/))
                } catch (r) {}
            })
        }
        return e.join(";")
    } catch (r) {}
}
ready(function() {
    try {
        var e, r, t, c, i, n = {};
        t = window.addEventListener ? "addEventListener" : "attachEvent";
        c = t === "attachEvent" ? "onmessage" : "message";
        i = window[t];
        i(c, function(e) {
            try {
                receiveMessage(e)
            } catch (r) {}
        }, false);
        if (typeof certona !== "undefined") {
            e = certona.pagetype !== undefined ? certona.pagetype : "";
            resx.customerid = certona.customerid !== undefined ? certona.customerid : ""
        }
        switch (e) {
            case "HOME":
                if (certona.recommendations === true) {
                    resx.rrelem = "home1_rr";
                    resx.rrnum = 20;
                    resx.rrec = true;
                    resx.rrcall = "certonaRecommendations";
                    quickviewEvents()
                }
                break;
            case "CATEGORYLANDING":
                jQuery("body").off("click", "button[id='add-to-cart']").on("click", "button[id='add-to-cart']", function() {
                    try {
                        if (jQuery("select.mz-productoptions-option").length === jQuery('select.mz-productoptions-option option[selected="true"]').length) {
                            setAddToBagRecs()
                        }
                    } catch (e) {}
                });
                break;
            case "CATEGORY":
                if (certona.recommendations === true) {
                    resx.rrelem = "category1_rr";
                    resx.rrqs = "categoryid=" + encodeURIComponent(certona.categoryid !== undefined ? certona.categoryid : "");
                    resx.rrnum = 20;
                    resx.rrec = true;
                    resx.rrcall = "certonaRecommendations"
                }
            case "SEARCH":
                jQuery("div.wishlist-icon a").click(function() {
                    try {
                        resx.event = "wishlist_op";
                        resx.itemid = jQuery(this).attr("id");
                        resx.rrelem = "";
                        resx.rrnum = "";
                        resx.rrec = false;
                        certonaResx.run()
                    } catch (e) {}
                });
                quickviewEvents();
                break;
            case "NOSEARCH":
                if (certona.recommendations === true) {
                    resx.rrelem = "nosearch1_rr";
                    resx.rrnum = 20;
                    resx.rrec = true;
                    resx.rrcall = "certonaRecommendations";
                    quickviewEvents()
                }
                break;
            case "COMPARE":
                resx.event = "compare";
                resx.itemid = certona.itemid !== undefined ? certona.itemid : "";
                resx.rrelem = "";
                resx.rrnum = "";
                resx.rrec = false;
                jQuery("body").off("click", "button#add-to-wishlist").on("click", "button#add-to-wishlist", function() {
                    try {
                        resx.event = "wishlist_op";
                        resx.itemid = jQuery("button#add-to-wishlist").closest("div.product-cart-wishlist").find("button.mz-productdetail-addtocart").attr("onclick").match(/\/p\/([A-Za-z0-9\-]+)/)[1];
                        resx.rrelem = "";
                        resx.rrnum = "";
                        resx.rrec = false;
                        certonaResx.run()
                    } catch (e) {}
                });
                break;
            case "PRODUCT":
                resx.event = location.href.indexOf("rrec=true") >= 0 ? "product_r" : "product";
                resx.itemid = certona.itemid !== undefined ? certona.itemid : "";
                if (certona.recommendations === true) {
                    resx.rrelem = "product1_rr;product2_rr";
                    resx.exitemid = excludeItems();
                    resx.rrnum = 20;
                    resx.rrec = true;
                    resx.rrcall = "certonaRecommendations";
                    quickviewEvents()
                }
                jQuery("body").off("click", "button[id='add-to-cart']").on("click", "button[id='add-to-cart']", function() {
                    try {
                        if (jQuery("select.mz-productoptions-option").length === jQuery('select.mz-productoptions-option option[selected="true"]').length) {
                            setAddToBagRecs()
                        }
                    } catch (e) {}
                });
                jQuery("body").off("click", 'input[name="wishlist-radio"], button#select-wishlist').on("click", 'input[name="wishlist-radio"], button#select-wishlist', function() {
                    try {
                        resx.event = "wishlist_op";
                        resx.rrelem = "";
                        resx.rrnum = "";
                        resx.rrec = false;
                        certonaResx.run()
                    } catch (e) {}
                });
                break;
            case "UPLOAD":
                r = certona.itemid !== undefined ? certona.itemid : "";
                jQuery("body").off("click", "button#DndAgree").on("click", "button#DndAgree", function() {
                    try {
                        if (jQuery("input#rIAgree:checked").length > 0) {
                            n.upload = true;
                            n.itemID = r;
                            window.parent.postMessage(n, "https://www.shindigz.com")
                        }
                    } catch (e) {}
                });
                jQuery("body").off("click", "button#dndAddToWishlist").on("click", "button#dndAddToWishlist", function() {
                    try {
                        resx.event = "wishlist_op";
                        resx.itemid = r;
                        resx.rrelem = "";
                        resx.rrnum = "";
                        resx.rrec = false;
                        certonaResx.run()
                    } catch (e) {}
                });
                break;
            case "ACCOUNT":
                if (/myaccount#wishlist/.test(window.location.href)) {
                    resx.event = "wishlist";
                    resx.itemid = certona.itemid !== undefined ? certona.itemid : "";
                    resx.rrelem = "";
                    resx.rrnum = "";
                    resx.rrec = false
                }
                jQuery("body").off("click", "a#tab_5").on("click", "a#tab_5", function() {
                    try {
                        if (jQuery('div#tab_5[style*="block"]').length > 0) {
                            resx.event = "wishlist";
                            resx.itemid = certona.itemid !== undefined ? certona.itemid : "";
                            resx.rrelem = "";
                            resx.rrnum = "";
                            resx.rrec = false;
                            certonaResx.run()
                        }
                    } catch (e) {}
                });
                break;
            case "CART":
                resx.event = "viewcart";
                resx.itemid = certona.itemid !== undefined ? certona.itemid : "";
                if (certona.recommendations === true) {
                    resx.rrelem = "cart1_rr";
                    resx.rrnum = 20;
                    resx.rrec = true;
                    resx.rrcall = "certonaRecommendations";
                    quickviewEvents()
                }
                break;
            case "PURCHASE":
                resx.event = "purchase";
                resx.itemid = certona.itemid !== undefined ? certona.itemid : "";
                resx.qty = certona.qty !== undefined ? certona.qty : "";
                resx.price = certona.price !== undefined ? certona.price : "";
                resx.total = certona.total !== undefined ? certona.total : "";
                resx.transactionid = certona.transactionid !== undefined ? certona.transactionid : "";
                if (certona.recommendations === true) {
                    resx.rrelem = "orderconfirmation1_rr";
                    resx.rrnum = 20;
                    resx.rrec = true;
                    resx.rrcall = "certonaRecommendations";
                    quickviewEvents()
                }
                break;
            default:
                return
        }
        certonaResx.run()
    } catch (o) {}
});

*/