# confess.js

A small script library that uses [PhantomJS 1.2](http://www.phantomjs.org/) (or later) to headlessly analyze web pages. Currently it performs two tasks:

 * Generation of an *appcache* manifest for a web app
 * Simple *performance* analysis of a web page and its resources

## Examples

confess.js can enumerate a web app's resources for the purposes of creating a cache manifest file to make your apps run offline.

For example...

    > phantomjs confess.js http://functionsource.com appcache

...will write, to stdout:

    CACHE MANIFEST

    # This manifest was created by confess.js, http://github.com/jamesgpearce/confess
    #
    # Time: Fri Dec 23 2011 13:12:32 GMT-0800 (PST)
    # Retrieved URL: http://functionsource.com/
    # User-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/...

    CACHE:
    /images/icons/netflix.png
    /javascripts/lib/legacy.js
    /stylesheets/light.css
    /stylesheets/screen.css
    /stylesheets/syntax.css
    http://functionscopedev.files.wordpress.com/2011/12/dabblet.png
    http://functionsource.com/images/avatars/ben.png
    http://functionsource.com/images/avatars/dion.png
    http://functionsource.com/images/avatars/kevin.png
    http://functionsource.com/images/avatars/ryan.png
    http://functionsource.com/images/header.png
    http://functionsource.com/images/header_wht.png
    http://functionsource.com/images/icons/facebook.png
    http://functionsource.com/images/icons/firehose.png
    http://functionsource.com/images/icons/linkedin.png
    http://functionsource.com/images/icons/podcast.png
    http://functionsource.com/images/icons/rss.png
    http://functionsource.com/images/icons/twitter.png
    http://use.typekit.com/k/tqz3zpc-b.css?3bb2a6e53c9684f...
    http://use.typekit.com/tqz3zpc.js
    http://www.google-analytics.com/ga.js

    NETWORK:
    *

The other thing it can do is generate a simple performance analysis of a site:

    > phantomjs confess.js http://functionsource.com performance

...which will write, to stdout, something like:

    Elapsed load time:   6370ms
       # of resources:       21

     Fastest resource:    147ms; http://functionsource.com/...egacy.js
     Slowest resource:   2766ms; http://use.typekit.com/...z3zpc-b.css
      Total resources:  17898ms

    Smallest resource:      35b; http://www.google-analytics.com/__...
     Largest resource:   40183b; http://functionsource.com/...ader.png
      Total resources:  107594b; (at least)

...and which can also generate an ASCII-art waterfall:

     1|-------------------                                           |
     2|                   ------                                     |
     3|                   ---                                        |
     4|                   --------                                   |
     5|                   -------                                    |
     6|                   --------                                   |
     7|                   ------------                               |
     8|                         -------------------                  |
     9|                         ------------------                   |
    10|                          ------                              |
    ...

     1:   1126ms;       -b; http://functionsource.com/
     2:    343ms;       -b; http://use.typekit.com/tqz3zpc.js
     3:    147ms;       -b; http://functionsource.com/...lib/legacy.js
     4:    438ms;       -b; http://functionsource.com/...ts/screen.css
     5:    400ms;       -b; http://functionsource.com/...ts/syntax.css
     6:    452ms;       -b; http://functionsource.com/...ets/light.css
     7:    680ms;       -b; http://www.google-analytics.com/ga.js
     8:   1142ms;   23557b; http://functionscopedev.files.wordpress...
     9:   1073ms;   17200b; http://functionsource.com/...s/netflix.png
    10:    317ms;    5165b; http://functionsource.com/...tars/dion.png
    ...

As well as using the final command line argument to perform different tasks, you can use the local <code>config.json</code> file to affect the behavior of the way in which confess.js runs.

For example, you can set the user-agent header of the request made by PhantomJS to request the page, in case you're serving mobile apps off similar entry-point URLs to your desktop content.

Similarly, if you're creating an appcache manifest, you can use filters to indicate which files should be included or excluded from the generated <code>CACHE</code> list.

## Installation & usage

The one-and-only dependency is the one-and-only [PhantomJS](http://www.phantomjs.org/), version 1.2 or later. Install this, and ensure it's all good by trying out some of its example scripts.

Then, assuming <code>phantomjs</code> is on your path, and from the directory containing <code>confess.js</code> and <code>config.json</code>, run the tasks with:

    > phantomjs confess.js URL TASK [CONFIG]

Where the <code>URL</code> is mandatory, and points to the page or app you're analyzing. <code>TASK</code> is what you want the tool to do, and <code>CONFIG</code> is the location of an alternative configuration file, if you don't want to use the default <code>config.json</code>.

## The appcache task

Using the <code>appcache</code> task argument will get confess.js to load the page, and then search the DOM and the CSSOM (and then the results of applying the latter to the former) for references to any external resources that the app needs. It can optionally also look for resource request events.

The results go to stdout, but of course you can pipe it to a file. If you want to create a cache manifest for an app, this might be called something like <code>my.appcache</code>:

    > phantomjs confess.js http://functionsource.com appcache > my.appcache

You would then need to attach add this file to your app, and reference the manifest in the <code>html</code> element:

    <!DOCTYPE html>
    <html manifest="my.appcache">
        <head>

(And ensure that the manifest file gets emitted from your web server with a content type of <code>text/cache-manifest</code>.)

To check the resulting manifest's syntax, you might like to use Frederic Hemberger's great [cache manifest validator](http://manifest-validator.com/).

## The performance task

Using the <code>performance</code> task argument will get confess.js to load the page, and then log the sizes and timings of its constituent parts.

It will list the fastest and slowest resources, and also the largest and smallest (subject to the availability of the <code>content-length</code> header). With the verbose configuration enabled, it will also list out all the resources loaded as part of the page, and display an ASCII-art waterfall chart of their timings.

## Configuration

The following is the default <code>config.json</code> file for confess.js, but you can of course alter any of the values in this file, or a new config file of your own.

    {
        "task": "appcache",
        "userAgent": "default",
        "wait": 0,
        "consolePrefix": "#",
        "verbose": true,
        "appcache": {
            "urlsFromDocument": true,
            "urlsFromRequests": false,
            "cacheFilter": ".*",
            "networkFilter": null
        }
    }

These properties are used as follows:

 * <code>task</code> - the default type of task you want confess.js to perform, if not specified on the command line. <code>appcache</code> and <code>performance</code> are the only supported values

 * <code>userAgent</code> - the user-agent to make the request as, or <code>default</code> to use PhantomJS's usual user-agent string

 * <code>wait</code> - the number of milliseconds to wait after the document has loaded before parsing for resources. This might be useful if you know that a deferred script might be making relevant additions to the DOM.

 * <code>consolePrefix</code> - if set, confess.js will output the *browser's* console to the standard output. Useful for detecting if there are also any issues with the app's execution itself.

 * <code>verbose</code> - whether to add extra output about the generator's configuration into the output. Set to true for the <code>performance</code> task in order to see the waterfall chart.

 * <code>appcache.urlsFromDocument</code> - whether to traverse the DOM and CSSOM looking for resources; the default behaviour

 * <code>appcache.urlsFromRequests</code> - whether to also (or alternatively) listen for resource loading events to detect required dependencies

 * <code>appcache.cacheFilter</code> - a regex to indicate which files to include in the <code>CACHE</code> block of the manifest. If set to <code>null</code>, none will. As a better example, <code>\\\\.png$</code> will indicate that only PNG files should be cached. (Note the double escaping: once for the regex, and once for the JSON.)

 * <code>appcache.networkFilter</code> - a regex to indicate which files *not* to include in the <code>CACHE</code> block of the manifest, and which a browser will request from the network. If set to <code>null</code>, none will. Note that matching files will *not* be explicitly listed in the <code>NETWORK</code> block of the manifest, since there is always a catch-all <code>*</code> wildcard added.

Note that there are currently no specific configuration options for the <code>performance</code> task.
