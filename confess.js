var fs = require('fs');
var confess = {

    run: function () {

        var cliConfig = {};
        if (!this.utils.processArgs(cliConfig, [
            {name:'url', def:"http://google.com", req:true, desc:"the URL of the app to cache"},
            {name:'configFile', def:"config.json", req:false, desc:"a local configuration file of further confess settings"},
        ])) {
            phantom.exit();
            return;
        }
        this.config = this.utils.mergeConfig(cliConfig, cliConfig.configFile);

        var task = this[this.config.task];

        this.utils.load(
            this.config,
            task.pre,
            task.post,
            this
        );
    },

    appcache: {
        pre: function (page, config) { },
        post: function (page, status, config) {
            if (status!='success') {
                console.log('# FAILED TO LOAD');
                return;
            }

            var key, url,
                neverMatch = "(?!a)a",
                cacheRegex = new RegExp(config.appcache.cacheFilter || neverMatch),
                networkRegex = new RegExp(config.appcache.networkFilter || neverMatch);

            console.log('CACHE MANIFEST\n');
            console.log('# This manifest was created by confess.js, http://github.com/jamesgpearce/confess');
            console.log('#');
            console.log('# Time: ' + new Date());
            console.log('# Retrieved URL: ' + this.getFinalUrl(page));
            console.log('# User-agent: ' + page.settings.userAgent);
            console.log('#');
            console.log('# Config:');
            for (key in config) {
                console.log('#  ' + key + ': ' + config[key]);
            }
            console.log('\nCACHE:');
            for (url in this.getResourceUrls(page)) {
                if (cacheRegex.test(url) && !networkRegex.test(url)) {
                    console.log(url);
                }
            };
            console.log('\nNETWORK:\n*');
        }
    },

    getFinalUrl: function (page, config) {
        return page.evaluate(function () {
            return document.location.toString();
        });
    },

    getResourceUrls: function (page, status, config) {

        return page.evaluate(function () {
            var
                // resources referenced in DOM
                // notable exceptions: iframes, rss, links
                selectors = [
                    ['script', 'src'],
                    ['img', 'src'],
                    ['link[rel="stylesheet"]', 'href']
                ],

                // resources referenced in CSS
                properties = [
                    'background-image',
                    'list-style-image',
                ],

                resources = {},
                baseScheme = document.location.toString().split("//")[0],
                tallyResource = function (url) {
                    if (url && url.substr(0,5)!='data:') {
                        if (url.substr(0, 2)=='//') {
                            url = baseScheme + url;
                        }
                        if (!resources[url]) {
                            resources[url] = 0;
                        }
                        resources[url]++;
                    }
                },

                elements, elementsLength, e,
                stylesheets, stylesheetsLength, s,
                rules, rulesLength, r,
                computed, computedLength, c,
                value;

            // attributes in DOM
            selectors.forEach(function (selectorPair) {
                elements = document.querySelectorAll(selectorPair[0]);
                for (e = 0, elementsLength = elements.length; e < elementsLength; e++) {
                    tallyResource(elements[e].getAttribute(selectorPair[1]));
                };
            });

            // URLs in stylesheets
            stylesheets = document.styleSheets;
            for (s = 0, stylesheetsLength = stylesheets.length; s < stylesheetsLength; s++) {
                rules = stylesheets[s].rules;
                if (!rules) { continue; }
                for (r = 0, rulesLength = rules.length; r < rulesLength; r++) {
                    if (!rules[r]['style']) { continue; }
                    properties.forEach(function(property) {
                        value = rules[r].style.getPropertyCSSValue(property);
                        if (value && value.primitiveType == CSSPrimitiveValue.CSS_URI) {
                            tallyResource(value.getStringValue());
                        }
                    });
                };
            };

            // URLs in styles on DOM
            elements = document.querySelectorAll('*');
            for (e = 0, elementsLength = elements.length; e < elementsLength; e++) {
                computed = elements[e].ownerDocument.defaultView.getComputedStyle(elements[e], '');
                for (c = 0, computedLength = computed.length; c < computedLength; c++) {
                    value = computed.getPropertyCSSValue(computed[c]);
                    if (value && value.primitiveType == CSSPrimitiveValue.CSS_URI) {
                        tallyResource(value.getStringValue());
                    }
                }
            };

            return resources;
        });
    },


    utils: {

        load: function (config, pre, post, scope) {
            var page = new WebPage();
            if (config.consolePrefix) {
                page.onConsoleMessage = function (msg, line, src) {
                    console.log(config.consolePrefix + ' ' + msg + ' (' + src + ', #' + line + ')');
                }
            }
            page.onLoadStarted = function () {
                pre.call(scope, page, config);
            };
            page.onLoadFinished = function (status) {
                if (config.wait) {
                    setTimeout(
                        function () {
                            post.call(scope, page, status, config);
                            phantom.exit();
                        },
                        config.wait
                    );
                } else {
                    post.call(scope, page, status, config);
                    phantom.exit();
                }
            };
            if (config.userAgent && config.userAgent != "default") {
                page.settings.userAgent = config.userAgent;
            }
            page.open(config.url);
        },

        processArgs: function (config, contract) {
            var a = 0;
            var ok = true;
            contract.forEach(function(argument) {
                if (a < phantom.args.length) {
                    config[argument.name] = phantom.args[a];
                } else {
                    if (argument.req) {
                        console.log('"' + argument.name + '" argument is required. This ' + argument.desc + '.');
                        ok = false;
                    } else {
                        config[argument.name] = argument.def;
                    }
                }
                a++;
            });
            return ok;
        },

        mergeConfig: function (config, configFile) {
            if (!fs.exists(configFile)) {
               configFile = "config.json";
            }
            var result = JSON.parse(fs.read(configFile)),
                key;
            for (key in config) {
                result[key] = config[key];
            }
            return result;
        }

    }

}

confess.run();
