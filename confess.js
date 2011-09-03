var confess = {

    run: function () {

        this.settings = {};
        if (!this.utils.processArgs(this.settings, [
            {name:'url', def:"http://google.com", req:true, desc:"the URL of the app to cache"},
            {name:'ua', def:"[default]", req:false, desc:"the user-agent used to request the app"},
            {name:'task', def:'manifest', req:false, desc:"the task to be performed (currently only 'manifest')"}
        ])) {
            phantom.exit();
            return;
        }

        var task = this[this.settings.task];

        this.utils.load(this.settings.url, this.settings.ua,
            task.pre,
            task.post,
            this
        );
    },

    manifest: {
        pre: function (page) { },
        post: function (page, status) {
            if (status!='success') {
                console.log('# FAILED TO LOAD');
                return;
            }
            console.log('CACHE MANIFEST\n');
            console.log('# This manifest was created by confess.js, http://github.com/jamesgpearce/confess');
            console.log('#');
            console.log('#          Time: ' + new Date());
            console.log('# Requested URL: ' + this.settings.url);
            console.log('# Retrieved URL: ' + this.getFinalUrl(page));
            console.log('#    User-agent: ' + page.settings.userAgent);
            console.log('\nCACHE:');
            for (url in this.getResourceUrls(page)) {
                console.log(url);
            };
            console.log('\nNETWORK:\n*');
        }
    },

    getFinalUrl: function (page) {
        return page.evaluate(function () {
            return document.location.toString();
        });
    },

    getResourceUrls: function (page) {
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
                value;

            selectors.forEach(function (selectorPair) {
                elements = document.querySelectorAll(selectorPair[0]);
                for (e = 0, elementsLength = elements.length; e < elementsLength; e++) {
                    tallyResource(elements[e].getAttribute(selectorPair[1]));
                };
            });

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

            return resources;
        });
    },



    utils: {

        load: function (url, ua, pre, post, scope) {
            var page = new WebPage();
            page.onConsoleMessage = function (msg, line, src) {
                //console.log(msg + ' (' + src + ', #' + line + ')');
            }
            page.onLoadStarted = function () {
                pre.call(scope, page);
            };
            page.onLoadFinished = function (status) {
                post.call(scope, page, status);
                phantom.exit();
            };
            if (ua != "[default]") {
                page.settings.userAgent = ua;
            }
            page.open(url);
        },

        processArgs: function (settings, contract) {
            var a = 0;
            contract.forEach(function(argument) {
                if (a < phantom.args.length) {
                    settings[argument.name] = phantom.args[a];
                } else {
                    if (argument.req) {
                        console.log('"' + argument.name + '" argument is required. This ' + argument.desc + '.');
                        return false;
                    }
                    settings[argument.name] = (typeof argument.def==='function') ? argument.def.call(settings) : argument.def;
                }
                a++;
                return true;
            });
            return (a > phantom.args.length);
        }

    }

}

confess.run();