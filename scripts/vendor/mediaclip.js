/**
https://api.mediacliphub.com/scripts/hub.min.js
**/
function MediaclipError(a, b, c, d, e, f) {
    this.message = a, this.publicTitle = b, this.publicMessage = c, this.logLevel = d || "ERROR", this.isRetriable = void 0 === e || e, this.technicalMessage = f, this.stack = Error().stack
}
if (! function(a, b, c) {
        function d(a, b) {
            return typeof a === b
        }

        function e(a) {
            var b = t.className,
                c = r._config.classPrefix || "";
            if (u && (b = b.baseVal), r._config.enableJSClass) {
                var d = new RegExp("(^|\\s)" + c + "no-js(\\s|$)");
                b = b.replace(d, "$1" + c + "js$2")
            }
            r._config.enableClasses && (b += " " + c + a.join(" " + c), u ? t.className.baseVal = b : t.className = b)
        }

        function f(a, b) {
            if ("object" == typeof a)
                for (var c in a) s(a, c) && f(c, a[c]);
            else {
                var d = (a = a.toLowerCase()).split("."),
                    g = r[d[0]];
                if (2 == d.length && (g = g[d[1]]), void 0 !== g) return r;
                b = "function" == typeof b ? b() : b, 1 == d.length ? r[d[0]] = b : (!r[d[0]] || r[d[0]] instanceof Boolean || (r[d[0]] = new Boolean(r[d[0]])), r[d[0]][d[1]] = b), e([(b && 0 != b ? "" : "no-") + d.join("-")]), r._trigger(a, b)
            }
            return r
        }

        function g() {
            return "function" != typeof b.createElement ? b.createElement(arguments[0]) : u ? b.createElementNS.call(b, "http://www.w3.org/2000/svg", arguments[0]) : b.createElement.apply(b, arguments)
        }

        function h(a) {
            return a.replace(/([a-z])-([a-z])/g, function(a, b, c) {
                return b + c.toUpperCase()
            }).replace(/^-/, "")
        }

        function i(a, b) {
            return !!~("" + a).indexOf(b)
        }

        function j(a, b) {
            return function() {
                return a.apply(b, arguments)
            }
        }

        function k(a) {
            return a.replace(/([A-Z])/g, function(a, b) {
                return "-" + b.toLowerCase()
            }).replace(/^ms-/, "-ms-")
        }

        function l(a, c, d, e) {
            var f, h, i, j, k = "modernizr",
                l = g("div"),
                m = function() {
                    var a = b.body;
                    return a || ((a = g(u ? "svg" : "body")).fake = !0), a
                }();
            if (parseInt(d, 10))
                for (; d--;)(i = g("div")).id = e ? e[d] : k + (d + 1), l.appendChild(i);
            return f = g("style"), f.type = "text/css", f.id = "s" + k, (m.fake ? m : l).appendChild(f), m.appendChild(l), f.styleSheet ? f.styleSheet.cssText = a : f.appendChild(b.createTextNode(a)), l.id = k, m.fake && (m.style.background = "", m.style.overflow = "hidden", j = t.style.overflow, t.style.overflow = "hidden", t.appendChild(m)), h = c(l, a), m.fake ? (m.parentNode.removeChild(m), t.style.overflow = j, t.offsetHeight) : l.parentNode.removeChild(l), !!h
        }

        function m(b, d) {
            var e = b.length;
            if ("CSS" in a && "supports" in a.CSS) {
                for (; e--;)
                    if (a.CSS.supports(k(b[e]), d)) return !0;
                return !1
            }
            if ("CSSSupportsRule" in a) {
                for (var f = []; e--;) f.push("(" + k(b[e]) + ":" + d + ")");
                return f = f.join(" or "), l("@supports (" + f + ") { #modernizr { position: absolute; } }", function(b) {
                    return "absolute" == function(b, c, d) {
                        var e;
                        if ("getComputedStyle" in a) {
                            e = getComputedStyle.call(a, b, null);
                            var f = a.console;
                            null !== e ? e = e.getPropertyValue(d) : f && f[f.error ? "error" : "log"].call(f, "getComputedStyle returning null, its possible modernizr test results are inaccurate")
                        } else e = b.currentStyle && b.currentStyle[d];
                        return e
                    }(b, 0, "position")
                })
            }
            return c
        }

        function n(a, b, e, f, k) {
            var l = a.charAt(0).toUpperCase() + a.slice(1),
                n = (a + " " + y.join(l + " ") + l).split(" ");
            return d(b, "string") || d(b, "undefined") ? function(a, b, e, f) {
                function j() {
                    l && (delete C.style, delete C.modElem)
                }
                if (f = !d(f, "undefined") && f, !d(e, "undefined")) {
                    var k = m(a, e);
                    if (!d(k, "undefined")) return k
                }
                for (var l, n, o, p, q, r = ["modernizr", "tspan", "samp"]; !C.style && r.length;) l = !0, C.modElem = g(r.shift()), C.style = C.modElem.style;
                for (o = a.length, n = 0; n < o; n++)
                    if (p = a[n], q = C.style[p], i(p, "-") && (p = h(p)), C.style[p] !== c) {
                        if (f || d(e, "undefined")) return j(), "pfx" != b || p;
                        try {
                            C.style[p] = e
                        } catch (a) {}
                        if (C.style[p] != q) return j(), "pfx" != b || p
                    }
                return j(), !1
            }(n, b, f, k) : (n = (a + " " + A.join(l + " ") + l).split(" "), function(a, b, c) {
                var e;
                for (var f in a)
                    if (a[f] in b) return !1 === c ? a[f] : (e = b[a[f]], d(e, "function") ? j(e, c || b) : e);
                return !1
            }(n, b, e))
        }
        var o = [],
            p = [],
            q = {
                _version: "3.5.0",
                _config: {
                    classPrefix: "",
                    enableClasses: !0,
                    enableJSClass: !0,
                    usePrefixes: !0
                },
                _q: [],
                on: function(a, b) {
                    var c = this;
                    setTimeout(function() {
                        b(c[a])
                    }, 0)
                },
                addTest: function(a, b, c) {
                    p.push({
                        name: a,
                        fn: b,
                        options: c
                    })
                },
                addAsyncTest: function(a) {
                    p.push({
                        name: null,
                        fn: a
                    })
                }
            },
            r = function() {};
        r.prototype = q, (r = new r).addTest("blobconstructor", function() {
            try {
                return !!new Blob
            } catch (a) {
                return !1
            }
        }, {
            aliases: ["blob-constructor"]
        }), r.addTest("svg", !!b.createElementNS && !!b.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect);
        var s, t = b.documentElement,
            u = "svg" === t.nodeName.toLowerCase();
        ! function() {
            var a = {}.hasOwnProperty;
            s = d(a, "undefined") || d(a.call, "undefined") ? function(a, b) {
                return b in a && d(a.constructor.prototype[b], "undefined")
            } : function(b, c) {
                return a.call(b, c)
            }
        }(), q._l = {}, q.on = function(a, b) {
            this._l[a] || (this._l[a] = []), this._l[a].push(b), r.hasOwnProperty(a) && setTimeout(function() {
                r._trigger(a, r[a])
            }, 0)
        }, q._trigger = function(a, b) {
            if (this._l[a]) {
                var c = this._l[a];
                setTimeout(function() {
                    var a;
                    for (a = 0; a < c.length; a++)(0, c[a])(b)
                }, 0), delete this._l[a]
            }
        }, r._q.push(function() {
            q.addTest = f
        }), r.addTest("canvas", function() {
            var a = g("canvas");
            return !(!a.getContext || !a.getContext("2d"))
        });
        var v = g("canvas");
        r.addTest("todataurljpeg", function() {
            return !!r.canvas && 0 === v.toDataURL("image/jpeg").indexOf("data:image/jpeg")
        }), r.addTest("todataurlpng", function() {
            return !!r.canvas && 0 === v.toDataURL("image/png").indexOf("data:image/png")
        }), r.addTest("todataurlwebp", function() {
            var a = !1;
            try {
                a = !!r.canvas && 0 === v.toDataURL("image/webp").indexOf("data:image/webp")
            } catch (a) {}
            return a
        });
        var w = q._config.usePrefixes ? " -webkit- -moz- -o- -ms- ".split(" ") : ["", ""];
        q._prefixes = w;
        var x = "Moz O ms Webkit",
            y = q._config.usePrefixes ? x.split(" ") : [];
        q._cssomPrefixes = y;
        var z = function(b) {
            var d, e = w.length,
                f = a.CSSRule;
            if (void 0 === f) return c;
            if (!b) return !1;
            if (b = b.replace(/^@/, ""), (d = b.replace(/-/g, "_").toUpperCase() + "_RULE") in f) return "@" + b;
            for (var g = 0; g < e; g++) {
                var h = w[g];
                if (h.toUpperCase() + "_" + d in f) return "@-" + h.toLowerCase() + "-" + b
            }
            return !1
        };
        q.atRule = z;
        var A = q._config.usePrefixes ? x.toLowerCase().split(" ") : [];
        q._domPrefixes = A;
        var B = {
            elem: g("modernizr")
        };
        r._q.push(function() {
            delete B.elem
        });
        var C = {
            style: B.elem.style
        };
        r._q.unshift(function() {
            delete C.style
        });
        var D = q.testStyles = l;
        r.addTest("touchevents", function() {
            var c;
            if ("ontouchstart" in a || a.DocumentTouch && b instanceof DocumentTouch) c = !0;
            else {
                var d = ["@media (", w.join("touch-enabled),("), "heartz", ")", "{#modernizr{top:9px;position:absolute}}"].join("");
                D(d, function(a) {
                    c = 9 === a.offsetTop
                })
            }
            return c
        }), q.testAllProps = n;
        var E = (q.prefixed = function(a, b, c) {
            return 0 === a.indexOf("@") ? z(a) : (-1 != a.indexOf("-") && (a = h(a)), b ? n(a, b, c) : n(a, "pfx"))
        })("URL", a, !1);
        E = E && a[E], r.addTest("bloburls", E && "revokeObjectURL" in E && "createObjectURL" in E),
            function() {
                var a, b, c, e, f, g;
                for (var h in p)
                    if (p.hasOwnProperty(h)) {
                        if (a = [], (b = p[h]).name && (a.push(b.name.toLowerCase()), b.options && b.options.aliases && b.options.aliases.length))
                            for (c = 0; c < b.options.aliases.length; c++) a.push(b.options.aliases[c].toLowerCase());
                        for (e = d(b.fn, "function") ? b.fn() : b.fn, f = 0; f < a.length; f++) 1 === (g = a[f].split(".")).length ? r[g[0]] = e : (!r[g[0]] || r[g[0]] instanceof Boolean || (r[g[0]] = new Boolean(r[g[0]])), r[g[0]][g[1]] = e), o.push((e ? "" : "no-") + g.join("-"))
                    }
            }(), e(o), delete q.addTest, delete q.addAsyncTest;
        for (var F = 0; F < r._q.length; F++) r._q[F]();
        a.Modernizr = r
    }(window, document), function(a) {
        "use strict";

        function b(b) {
            for (var d = function() {
                    var b, c = a.mediaclip.browser.userAgent,
                        d = c.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
                    return /trident/i.test(d[1]) ? "IE " + ((b = /\brv[ :]+(\d+)/g.exec(c) || [])[1] || "") : "Chrome" === d[1] && null !== (b = c.match(/\bOPR\/(\d+)/)) ? "Opera " + b[1] : ("Safari" === (d = d[2] ? [d[1], d[2]] : [a.mediaclip.browser.appName, a.mediaclip.browser.appVersion, "-?"])[0] && null !== (b = c.match(/version\/(\d+)/i)) && d.splice(1, 1, b[1]), d.join(" "))
                }(), e = function(a) {
                    return a.split(" ")[0]
                }(d), f = function(a) {
                    return a.split(" ")[1]
                }(d), g = 0; g < b.length; g++)
                if (e.toLowerCase() === b[g].name && function(a, b) {
                        if (a === b) return 0;
                        for (var c = a.split("."), d = b.split("."), e = Math.min(c.length, d.length), f = 0; f < e; f++) {
                            if (parseInt(c[f]) > parseInt(d[f])) return 1;
                            if (parseInt(c[f]) < parseInt(d[f])) return -1
                        }
                        return c.length > d.length ? 1 : c.length < d.length ? -1 : 0
                    }(f, b[g].version) >= 0) return !0;
            return !!c(navigator.userAgent)
        }

        function c(a) {
            return /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(a)
        }
        var d;
        if (a.Modernizr) {
            Modernizr.addTest("formdata", function() {
                try {
                    return !!new FormData
                } catch (a) {
                    return !1
                }
            });
            var e = [Modernizr.canvas, Modernizr.svg, Modernizr.blobconstructor, Modernizr.formdata];
            d = function() {
                for (var a = 0; a < e.length; a++)
                    if (!e[a]) return !1;
                return !0
            }
        } else d = function() {
            return !0
        };
        var f = [{
            name: "opera",
            version: "15"
        }, {
            name: "chrome",
            version: "24"
        }, {
            name: "safari",
            version: "7"
        }, {
            name: "firefox",
            version: "16"
        }, {
            name: "msie",
            version: "11"
        }, {
            name: "ie",
            version: "11"
        }];
        a.mediaclip || (a.mediaclip = {}), a.mediaclip.designers || (a.mediaclip.designers = {}), a.mediaclip.designers.html5 || (a.mediaclip.designers.html5 = {}), a.mediaclip.designers.html5.isSupported = function() {
            return b(f) && d()
        }, a.mediaclip.designers.html5.isIosWebView = c, a.mediaclip.browser = {
            userAgent: navigator.userAgent,
            appName: navigator.appName,
            appVersion: navigator.appVersion
        }
    }(window), function(a, b) {
        function c() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(a) {
                var b = 16 * Math.random() | 0;
                return ("x" == a ? b : 3 & b | 8).toString(16)
            })
        }

        function d() {
            this.key = !1, this.sendConsoleErrors = !1, this.tag = "jslogger", this.useDomainProxy = !1
        }

        function e(a, b) {
            a.key = b, a.setSession(), i(a)
        }

        function f(a, b) {
            a.tag = b
        }

        function g(a, b) {
            a.useDomainProxy = b, i(a)
        }

        function h(b, c) {
            if (b.sendConsoleErrors = c, !0 === b.sendConsoleErrors) {
                var d = a.onerror;
                a.onerror = function(c, e, f, g) {
                    b.push({
                        category: "BrowserJsException",
                        exception: {
                            message: c,
                            url: e,
                            lineno: f,
                            colno: g
                        }
                    }), d && "function" == typeof d && d.apply(a, arguments)
                }
            }
        }

        function i(b) {
            1 == b.useDomainProxy ? b.inputUrl = j + a.location.host + "/" + LOGGLY_PROXY_DOMAIN + "/inputs/" + b.key + "/tag/" + b.tag : b.inputUrl = j + (b.logglyCollectorDomain || k) + "/inputs/" + b.key + "/tag/" + b.tag
        }
        var j = "http" + ("https:" === b.location.protocol ? "s" : "") + "://",
            k = "logs-01.loggly.com",
            l = "logglytrackingsession",
            m = l.length + 1;
        LOGGLY_PROXY_DOMAIN = "loggly", d.prototype = {
            setSession: function(a) {
                a ? (this.session_id = a, this.setCookie(this.session_id)) : this.session_id || (this.session_id = this.readCookie(), this.session_id || (this.session_id = c(), this.setCookie(this.session_id)))
            },
            push: function(a) {
                var b = typeof a;
                if (a && ("object" === b || "string" === b)) {
                    var c = this;
                    if ("string" === b) a = {
                        text: a
                    };
                    else {
                        if (a.logglyCollectorDomain) return void(c.logglyCollectorDomain = a.logglyCollectorDomain);
                        if (void 0 !== a.sendConsoleErrors && h(c, a.sendConsoleErrors), a.tag && f(c, a.tag), a.useDomainProxy && g(c, a.useDomainProxy), a.logglyKey) return void e(c, a.logglyKey);
                        if (a.session_id) return void c.setSession(a.session_id)
                    }
                    c.key && c.track(a)
                }
            },
            track: function(b) {
                b.sessionId = this.session_id;
                try {
                    var c = new XMLHttpRequest;
                    c.open("POST", this.inputUrl, !0), c.send(JSON.stringify(b))
                } catch (c) {
                    a && a.console && "function" == typeof a.console.log && (console.log("Failed to log to loggly because of this exception:\n" + c), console.log("Failed log data:", b))
                }
            },
            readCookie: function() {
                var a = b.cookie,
                    c = a.indexOf(l);
                if (0 > c) return !1;
                var d = a.indexOf(";", c + 1);
                return d = 0 > d ? a.length : d, a.slice(c + m, d)
            },
            setCookie: function(a) {
                b.cookie = l + "=" + a
            }
        };
        var n = a._LTracker,
            o = new d;
        if (n && n.length) {
            var p = 0,
                q = n.length;
            for (p = 0; q > p; p++) o.push(n[p])
        }
        a._LTracker = o, a.LogglyTracker = d
    }(window, document), function(a, b) {
        "use strict";

        function c(a) {
            e ? d.logglyTracker.push(a) : console.log("Logging disabled", a)
        }
        var d = {},
            e = !0,
            f = {
                logglyKey: "3b6cf35b-faba-435b-8991-e3a7c6ac5f9b",
                sendConsoleErrors: !1,
                tag: "Prod,Launcher"
            };
        d.logglyTracker = new LogglyTracker, d.logglyTracker.push(f), d.log = function(a, d, e) {
            c(b.extend({
                utcdate: new Date,
                level: e || "ERROR",
                message: a
            }, d))
        }, d.logError = function(a, d, e) {
            c(b.extend({
                utcdate: new Date,
                level: e || "ERROR",
                message: a.message,
                error: a
            }, d))
        }, a.mediaclip = a.mediaclip || {}, a.mediaclip.hub = a.mediaclip.hub || {}, a.mediaclip.hub.logger = d
    }(window, window.jQuery), function(a) {
        "use strict";
        var b = function(c) {
            function d(a, b) {
                for (var c = a.length; c--;)
                    if (a[c] === b) return !0;
                return !1
            }
            var e;
            b.ignoredOrigins = [], this.init = function(a) {
                e = a || {}, e.targetOrigins = e.targetOrigins || [], e.targetOrigins = Array.isArray(e.targetOrigins) ? e.targetOrigins : [e.targetOrigins]
            }, this.init(c), this.post = function(a, b) {
                if (b) {
                    if (0 !== e.targetOrigins.length && !d(e.targetOrigins, b)) throw new Error('Domain "' + b + '" is not in the list of accepted domains')
                } else b = e.targetOrigins[0] || "*";
                var c = this.getTarget();
                "object" == typeof a && (a = JSON.parse(JSON.stringify(a))), c.postMessage(a, b)
            }, this.listen = function(b) {
                a.addEventListener("message", this.wrapListenHandler(b), !1)
            }, this.getTarget = function() {
                return e.targetId ? document.getElementById(e.targetId).contentWindow : a.parent
            }, this.wrapListenHandler = function(a) {
                return function(c) {
                    if (e.targetOrigins.length > 0 && !d(e.targetOrigins, c.origin)) return void(console.log && !d(b.ignoredOrigins, c.origin) && (console.log("Message ignored from " + c.origin), b.ignoredOrigins.push(c.origin)));
                    a(c)
                }
            }
        };
        a.mediaclip = a.mediaclip || {}, a.mediaclip.hub = a.mediaclip.hub || {}, a.mediaclip.hub.ProxyService = b
    }(window), function(a) {
        "use strict";

        function b(a) {
            var b = a.indexOf("-");
            return b > 1 ? a.substring(0, b) : a !== e ? e : null
        }

        function c(a) {
            function b(a, d) {
                if (Object(a) !== a) c[d] = a;
                else if (Array.isArray(a)) {
                    for (var e = a.length, f = 0; f < e; f++) b(a[f], d + "[" + f + "]");
                    0 === e && (c[d] = [])
                } else {
                    var g = !0;
                    for (var h in a) a.hasOwnProperty(h) && (g = !1, b(a[h], d ? d + "." + h : h));
                    g && d && (c[d] = {})
                }
            }
            var c = {};
            return b(a, ""), c
        }
        var d, e = "en",
            f = {};
        f.initializeLocales = function(a) {
            d = {};
            for (var b in a) a.hasOwnProperty(b) && (d[b] = c(a[b]))
        }, f.get = function(a, c) {
            if (!d) throw "Locales are not initialized";
            for (var f = c || e; f;) {
                var g;
                if (d[f] && (g = d[f][a]), g) return g;
                f = b(f)
            }
            return a
        }, a.mediaclip = a.mediaclip || {}, a.mediaclip.hub = a.mediaclip.hub || {}, a.mediaclip.hub.localizationService = f
    }(window), function(a) {
        "use strict";
        var b = {};
        b.getQuerystringParameter = function(b) {
            b = b.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var c = new RegExp("[\\?&]" + b + "=([^&#]*)"),
                d = c.exec(a.location.search);
            return null === d ? "" : decodeURIComponent(d[1].replace(/\+/g, " "))
        }, b.buildQuerystring = function(a) {
            if (void 0 === a || "object" != typeof a || !a) return "";
            var b = "?",
                c = 0;
            for (var d in a)
                if (a.hasOwnProperty(d)) {
                    c++;
                    var e = d,
                        f = a[d];
                    1 !== c && (b += "&"), b += e + "=" + encodeURIComponent(f)
                }
            return 0 === c ? "" : b
        }, b.redirectTop = function(b) {
            a.top.location = b
        }, b.getOriginFromUrl = function(a) {
            var b = /^(?:https?:\/\/[^:\/\n]+)/;
            return a.match(b)[0]
        };
        var c = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        b.newGuid = function() {
            for (var a = "", b = 0; b < 32; b++) a += c.charAt(Math.floor(Math.random() * c.length));
            return a
        }, a.mediaclip = a.mediaclip || {}, a.mediaclip.hub = a.mediaclip.hub || {}, a.mediaclip.hub.utils = b
    }(window), "undefined" == typeof jQuery) throw new Error("Mediaclip Hub's Javascript Launcher requires jQuery >= v1.5. Please see https://code.jquery.com/");
! function(a, b) {
    "use strict";

    function c(b) {
        e(b, "storeUserToken"), b.hubUrl = b.hubUrl || "https://api.mediacliphub.com";
        var c = a.mediaclip.hub.utils.getQuerystringParameter("mediaclip-hub-flags");
        b.flags = f.mergeSettingAndQuerystringFlags(c, b.flags), a.mediaclip.hub.localizationService.initializeLocales(a.mediaclip.hub.locales)
    }

    function d(a, b) {
        for (var c = 0; c < a.length; ++c) {
            var d = b.indexOf(a[c]); - 1 !== d && b.splice(d, 1)
        }
        return a.concat(b)
    }

    function e(a, b) {
        if (!a[b]) throw new Error('Missing "' + b + '" in the "settings" argument', "")
    }
    a.mediaclip = a.mediaclip || {};
    var f = a.mediaclip.hub || {};
    f.init = function(a) {
        try {
            f.initSettings = a || {}, c(f.initSettings)
        } catch (a) {
            console.error(a)
        }
    }, f.unregister = function() {
        delete a.mediaclip.hub
    }, f.launch = function(d) {
        try {
            d = d || {}, f.initSettings && b.extend(d, f.initSettings), c(d), a.mediaclip.hub.launcher.start(d)
        } catch (b) {
            a.mediaclip.hub.launcher.handleError(b)
        }
    }, f.mergeSettingAndQuerystringFlags = function(a, b) {
        return b ? a ? d(b.split(","), a.split(",")).join() : b : a || ""
    }, f.redirect = function(b) {
        a.mediaclip.hub.launcher.redirect(b)
    }, f.updateStoreUserToken = function(b) {
        a.mediaclip.hub.launcher.updateStoreUserToken(b)
    }, f.getProjectThumbnailSrc = function(b) {
        if (!f.initSettings) throw new Error("Call init() first");
        return a.mediaclip.hub.thumbnailService.getThumbnailSrc(f.initSettings, b)
    }, a.mediaclip.hub = f
}(window, jQuery),
function(a, b) {
    "use strict";

    function c() {
        m.killSwitchTriggered = !0, m.handleError(new MediaclipError("Designer failed to load within alloted time.", null, g("designerFailedToLaunchTime"), "ERROR", !0))
    }

    function d() {
        var a = b("#" + n);
        a.siblings().remove(), a.css("height", "100%")
    }

    function e() {
        m.perf.readyToLoaded.timeStamp = h(), m.perf.readyToLoaded.timeFrame = k()
    }

    function f(a) {
        location.reload(a)
    }

    function g(b) {
        return a.mediaclip.hub.localizationService.get(b, m.settings.culture)
    }

    function h() {
        return (new Date).getTime()
    }

    function i(a) {
        return !isNaN(parseFloat(a)) && isFinite(a)
    }

    function j() {
        return m.perf.iframeInjectedToReady.timeStamp - m.perf.startToIframeInjected.timeStamp
    }

    function k() {
        return m.perf.readyToLoaded.timeStamp - m.perf.iframeInjectedToReady.timeStamp
    }

    function l(a, b) {
        return "<h1>" + (a || g("somethingWentWrong")) + "</h1><p>" + (b || g("designerCouldNotLaunchTryAgain")) + "</p>"
    }
    var m = {},
        n = "designerFrame",
        o = new RegExp("^[A-Za-z0-9-_]+\\.([A-Za-z0-9-_]+)\\.[A-Za-z0-9-_]*$");
    m.settings = null, m.nextCallToKeepAlive = null, m.keepAlivePollingIntervalId = null, m.proxyService = null, m.activeFrameDomain = null, m.killSwitchTimer = null, m.context = {
        logger: "Mediaclip.Hub.Launcher",
        authorization: {
            hubUserId: null,
            storeId: null,
            jwt: null,
            runId: a.mediaclip.hub.utils.newGuid()
        },
        httpContext: {
            location: a.location.href,
            userAgent: a.navigator.userAgent
        },
        initializationSteps: []
    }, m.perf = {
        startToIframeInjected: {},
        iframeInjectedToReady: {},
        readyToLoaded: {}
    }, m.start = function(a) {
        try {
            m.settings = a, m.perf.startToIframeInjected.timeStamp = h(), m.ensureSettingExists("projectId"), m.ensureSettingExists("storeUserToken"), m.context.authorization.jwt = m.settings.storeUserToken;
            var c = m.extractJwtInfo(m.settings.storeUserToken);
            m.settings.keepAliveIntervalMs = m.extractTimeToNextRenew(c, m.settings.keepAliveIntervalMs), m.context.authorization.storeId = m.settings.storeId = c.storeId, m.context.authorization.hubUserId = c.hubUserId, m.ensureSupportedBrowser(), m.addWrapperCss(), m.killSwitchTimer = m.createKillSwitchTimer();
            var d = m.getLaunchSettingsUrl();
            b.ajax({
                url: d,
                method: "GET",
                dataType: "json",
                headers: {
                    Authorization: "HubStoreUserToken " + m.settings.storeUserToken
                }
            }).done(function(a) {
                if (!m.killSwitchTriggered) {
                    m.proxyService = m.createProxy(a.launchUrl, a.ecbUrl), m.proxyService.listen(m.onProxyMessage);
                    var b = m.getContainer();
                    m.createDesignerFrame(b, a.launchUrl), m.startKeepAliveTimer()
                }
            }).fail(function(a) {
                var b, c = g("designerCannotLaunchContent");
                a.responseJSON && a.responseJSON.message && (b = a.responseJSON.message), m.handleError(new MediaclipError(a.responseText || "(no response text from getLaunchSettingsUrl())", g("designerFailedToLaunch"), c, "ERROR", !0, b || "(no message in JSON response)"))
            })
        } catch (a) {
            m.handleError(a)
        }
    }, m.updateStoreUserToken = function(a) {
        m.postToFrame({
            action: "updateSessionId",
            token: a
        })
    }, m.getLaunchSettingsUrl = function() {
        var b = {
            projectId: m.settings.projectId,
            storeId: m.settings.storeId,
            runId: m.context.authorization.runId
        };
        return m.settings.flags && (b.flags = m.settings.flags), m.settings.culture && (b.culture = m.settings.culture), m.settings.mode && (b.mode = m.settings.mode), m.settings.e2e && (b.animations = !1), m.settings.hubUrl + "/launchsettings" + a.mediaclip.hub.utils.buildQuerystring(b)
    }, m.createProxy = function(b, c) {
        return new a.mediaclip.hub.ProxyService({
            targetId: n,
            targetDomain: [a.mediaclip.hub.utils.getOriginFromUrl(b), a.mediaclip.hub.utils.getOriginFromUrl(c)]
        })
    }, m.getContainer = function() {
        var a = b(m.settings.container);
        if (0 === a.length) {
            var c = 'The container element specified in the launcher settings ("' + m.settings.container + '") does not exist in the DOM. Cannot launch the Designer.';
            throw new MediaclipError(c, null, c, "WARN", !1)
        }
        return a
    }, m.createKillSwitchTimer = function() {
        return setTimeout(c, 6e4)
    }, m.ensureSupportedBrowser = function() {
        if (!a.mediaclip.designers.html5.isSupported()) throw new MediaclipError("Browser not supported.", g("browserNotSupportedHeader"), g("browserNotSupportedMessage"), "WARN", !1)
    }, m.addWrapperCss = function() {
        var a = document.getElementsByTagName("head")[0];
        if (!document.getElementById("mediaclip-required-css")) {
            var b = document.createElement("style");
            b.setAttribute("id", "mediaclip-required-css"), b.innerHTML = "body,html{height:100%}html{-ms-content-zooming:none}body{margin:0;overflow:hidden;-ms-touch-action:none}.mediaclip-designer-wrapper{position:fixed;-webkit-overflow-scrolling:touch;right:0;bottom:0;left:0}iframe.mediaclip-designer{border:0;width:100%;height:100%}", a.appendChild(b)
        }
    }, m.onProxyMessage = function(b) {
        m.activeFrameDomain = b.origin, "ready" === b.data.action ? (m.perf.iframeInjectedToReady.timeStamp = h(), m.perf.iframeInjectedToReady.timeFrame = j(), a.clearTimeout(m.killSwitchTimer), d(), a.setTimeout(function() {
            m.postToFrame({
                action: "readyComplete",
                startTime: m.perf.startToIframeInjected.timeStamp
            })
        }, 0)) : "onSaveComplete" === b.data.action ? m.settings.onSaveComplete && m.settings.onSaveComplete() : "onError" === b.data.action ? m.handleError(b.data.data.details) : "renewToken" === b.data.action ? m.keepAlive() : "reinitialize" === b.data.action ? (document.getElementById(n).remove(), m.start(m.settings)) : "trackInitializationStep" === b.data.action && b.data.step && m.context.initializationSteps.push(b.data.step)
    }, m.createDesignerFrame = function(a, b) {
        var c = document.createElement("IFRAME");
        c.id = n, c.name = n, c.src = b, c.setAttribute("class", "mediaclip-designer"), c.style.height = "0", c.onload = e, a.append(c), m.perf.startToIframeInjected.timeFrame = h() - m.perf.startToIframeInjected.timeStamp
    }, m.startKeepAliveTimer = function() {
        m.nextCallToKeepAlive = h() + m.settings.keepAliveIntervalMs, m.keepAlivePollingIntervalId && a.clearInterval(m.keepAlivePollingIntervalId), m.keepAlivePollingIntervalId = a.setInterval(m.keepAlivePolling, 3e4)
    }, m.ensureSettingExists = function(a) {
        if (!m.settings[a]) {
            var b = 'Missing "' + a + '" in the "settings" argument';
            throw new MediaclipError(b, null, b, "WARN", !1)
        }
    }, m.extractJwtInfo = function(b) {
        if (!b) return null;
        var c = b.match(o);
        if (!c) {
            var d = 'Invalid Jwt: "' + b + '"';
            throw new MediaclipError(d, null, d, "WARN", !1)
        }
        return JSON.parse(a.atob(c[1]))
    }, m.extractTimeToNextRenew = function(a, b) {
        if (i(b)) return b;
        if (a && a.exp) {
            return (1e3 * a.exp - h()) / 2
        }
        var c = "Could not extract time from undefined jwt.";
        throw new MediaclipError(c, null, c, "WARN", !1)
    }, m.postToFrame = function(a) {
        m.proxyService && m.proxyService.post(a, m.activeFrameDomain)
    }, m.keepAlivePolling = function() {
        h() > m.nextCallToKeepAlive && m.keepAlive()
    }, m.keepAlive = function() {
        b.ajax({
            url: m.settings.keepAliveUrl,
            method: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                token: m.settings.storeUserToken
            })
        }).done(function(a) {
            if (a) {
                if (a.redirectUrl || a.RedirectUrl) return void m.redirect(a.redirectUrl);
                var b = a.Token || a.token;
                if (!b) {
                    var c = "Unexpected KeepAlive response received. Please stream the response as is, including response code.";
                    throw new MediaclipError(c, null, c, "WARN", !1)
                }
                m.settings.storeUserToken = b;
                var d = m.extractJwtInfo(m.settings.storeUserToken);
                m.settings.keepAliveIntervalMs = m.extractTimeToNextRenew(d, m.settings.keepAliveIntervalMs), m.postToFrame({
                    action: "updateSessionId",
                    token: b
                })
            }
            m.startKeepAliveTimer()
        }).fail(function(b, c, d) {
            a.clearInterval(m.keepAlivePollingIntervalId), m.postToFrame({
                action: "disableExitWarning"
            }), m.handleError({
                message: g("cannotKeepAliveToken"),
                details: d
            }), f(!0)
        })
    }, m.redirect = function(b) {
        m.proxyService ? m.postToFrame({
            action: "redirect",
            url: b
        }) : a.location.href = b
    }, m.handleError = function(b) {
        a.clearTimeout(m.killSwitchTimer), m.showErrorMessage(l(b.publicTitle, b.publicMessage), b.isRetriable, b.technicalMessage), a.mediaclip.hub.logger.logError(b, m.context, b.logLevel || "ERROR"), m.settings.onError && m.settings.onError(b.message, b.stack)
    }, m.showErrorMessage = function(a, c, d) {
        var e = b(m.settings.container),
            f = "<section class='mediaclip-technical-section'>" + g("technicalSection") + "</section>";
        f = d ? f.replace("{technical}", "<code>" + d + "</code>") : f.replace("{technical}", "<code>(null)<code>"), f = f.replace("{code}", "<code>" + m.context.authorization.runId + "</code>"), e.html("<style> \t\t\thtml { height: 100% } \t\t\t.mediaclip-error-section { background-color: #e8ebee; color: #111125; width: 100%; height: 100%; display: -webkit-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-flex-direction: column; -ms-flex-direction: column; flex-direction: column; -webkit-align-items: center; -ms-flex-align: center; align-items: center; \t\t\t-webkit-justify-content: center; -ms-flex-pack: center; justify-content: center; text-align: center; } \t\t\t.mediaclip-error-section h1 { font-size: 24px; margin: 0; } \t\t\t.mediaclip-error-section h2 { font-size: 16px; margin: 0 0 15px 0; } \t\t\t.mediaclip-technical-section { text-align: left; margin-top: 5px; border: solid 1px #cdcdcd; border-radius: 6px; padding: 10px; margin-top: 30px } \t\t\t.mediaclip-technical-section code { color: #404040; background: none repeat scroll 0 0 #F8F8FF; border: 1px solid #DEDEDE; border-radius: 3px; padding: 0 0.2em; display: block; max-height: 7vh; overflow: auto; } \t\t\t.mediaclip-error-section p { font-size: 16px; line-height: 30px; padding: 20px; } \t\t\t.mediaclip-error-section a { font-size: 16px; color: #fff; text-decoration: none; padding: 16px 20px; background-color: #18A0DE; box-sizing: border-box; border-radius: 4px; min-width: 130px; display: block; text-transform: uppercase; } \t\t\t.mediaclip-error-section div { max-width: 600px; padding: 40px; background-color: #FEFEFF; border-radius: 6px; box-shadow: 0 2px 0 rgba(0,0,0,0.08); } \t\t\t#designerContainer { height: 100%} \t\t\t</style> \t\t\t<section class='mediaclip-error-section'> \t\t\t<div>" + a + (c ? "<a href='javascript:window.location.href=window.location.href'>" + g("tryAgain") + "</a>" : "") + (f || "") + "</div></section>")
    }, a.mediaclip = a.mediaclip || {}, a.mediaclip.hub = a.mediaclip.hub || {}, a.mediaclip.hub.launcher = m
}(window, jQuery), MediaclipError.prototype = Object.create(Error.prototype), MediaclipError.prototype.name = "MediaclipError",
    function(a) {
        "use strict";
        var b = {
            en: {
                tryAgain: "Try again",
                browserNotSupportedHeader: "Browser not supported",
                browserNotSupportedMessage: "Your browser is not supported, please update or switch to another browser.",
                designerFailedToLaunch: "Designer failed to launch.",
                designerFailedToLaunchTime: "Designer failed to load within alloted time. Please try launching it again.",
                cannotKeepAliveToken: "Session expired, reloading designer page...",
                somethingWentWrong: "Something went wrong :(",
                designerCannotLaunchContent: "The Designer could not launch the specified project. If this happens again, please contact the system administrator with details about your issue.",
                designerCouldNotLaunchTryAgain: "An unexpected error occurred.",
                technicalSection: "Code: {code}<br>Technical message: {technical}"
            },
            fr: {
                tryAgain: "RÃ©essayer",
                browserNotSupportedHeader: "Navigateur non pris en charge",
                browserNotSupportedMessage: "Votre navigateur n'est pas pris en charge, veuillez le mettre Ã  jour ou utiliser un autre navigateur.",
                designerFailedToLaunch: "L'Ã©diteur n'a pas pu dÃ©marrer.",
                designerFailedToLaunchTime: "L'Ã©diteur n'a pas pu dÃ©marrer dans le temps allouÃ©. SVP, essayez de le relancer.",
                cannotKeepAliveToken: "Session expirÃ©e, rechargement de la page de l'Ã©diteur...",
                somethingWentWrong: "Quelque chose n'a pas fonctionnÃ© :(",
                designerCannotLaunchContent: "L'Ã©diteur ne peut dÃ©marrer. Si ceci se produit encore, svp contactez l'administrateur du systÃ¨me avec les dÃ©tails de votre problÃ¨me",
                designerCouldNotLaunchTryAgain: "Une erreur inattendue s'est produite.",
                technicalSection: "Code: {code}<br>Message technique: {technical}"
            }
        };
        a.mediaclip = a.mediaclip || {}, a.mediaclip.hub = a.mediaclip.hub || {}, a.mediaclip.hub.locales = b
    }(window),
    function(a, b) {
        "use strict";
        var c = {};
        c.getThumbnailSrc = function(c, d) {
            var e = function(a) {
                    return sessionStorage && sessionStorage[a] ? sessionStorage[a] : null
                },
                f = function(a, b) {
                    sessionStorage && (sessionStorage[a] = b)
                },
                g = c.hubUrl,
                h = c.storeUserToken,
                i = d + "-thumbnail-imgData",
                j = d + "-thumbnail-etag",
                k = {
                    encodeToBase64: !0
                };
            if (c.flags && (k.flags = c.flags), c.storeId && (k.storeId = c.storeId), !d) throw new Error('Failed to get thumbnail with null "projectId".');
            var l = g + "/projects/" + d + "/storage/thumb.png" + a.mediaclip.hub.utils.buildQuerystring(k),
                m = b.Deferred(),
                n = {
                    Authorization: "HubStoreUserToken " + h
                },
                o = e(j),
                p = e(i);
            return o && p && (n["If-None-Match"] = o), b.ajax({
                url: l,
                method: "GET",
                headers: n
            }).then(function(a, b, c) {
                return 304 === c.status ? m.resolve("data:image/png;base64," + p) : 204 === c.status ? m.resolve(null) : (f(i, a), f(j, c.getResponseHeader("etag")), m.resolve("data:image/png;base64," + a))
            }).fail(function(a, b, c) {
                m.reject(a, b, c)
            }), m.promise()
        }, a.mediaclip.hub.thumbnailService = c
    }(window, jQuery);