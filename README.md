# confess.js

A small script library that uses [PhantomJS 1.2](http://www.phantomjs.org/) (or
later) to headlessly analyze web pages.

One useful application of this is to enumerate a web app's resources for the
purposes of creating a cache manifest file to make your apps run offline. So
useful that, right now, that's the only behavior.

For example...

    > phantomjs confess.js http://functionsource.com

...will write, to stdout:

    CACHE MANIFEST

    # This manifest was created by confess.js, http://github.com/jamesgpearce/confess
    #
    # Time: Fri Dec 23 2011 13:12:32 GMT-0800 (PST)
    # Retrieved URL: http://functionsource.com/
    # User-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.4.0 ...
    #
    # Config:
    #  task: manifest
    #  userAgent: default
    #  wait: 0
    #  consolePrefix: #
    #  cacheFilter: .*
    #  networkFilter: null
    #  url: http://functionsource.com
    #  configFile: config.json

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

Using the local config.json file, you can also affect the behavior of the way in
which confess.js runs.

For example, you can set the user-agent header of the request made by PhantomJS
to request the page, in case you're serving mobile apps off similar entry-point
URLs to your desktop content.

Similarly, you can use filters to indicate which files should be included or
excluded from the generated <code>CACHE</code> list.

## Installation & usage

The one and only dependency is [PhantomJS](http://www.phantomjs.org/), version
1.2 or later. Install this, and ensure it's all good by trying out some of its
example scripts.

Then, assuming <code>phantomjs</code> is on your path, and from the directory
containing <code>confess.js</code> and <code>config.json</code>, run the tasks
with:

    > phantomjs confess.js URL [CONFIG]

Where <code>URL</code> is mandatory, and points to the page or app you're
analyzing. <code>CONFIG</code> is the location of an alternative configuration
file, if you don't want to use the default <code>config.json</code>.

This loads the page, then searches the DOM and the CSSOM (and then the results
of applying the latter to the former) for references to any external resources
that the app needs.

The results go to stdout, but of course you can pipe it to a file. If you want
to create a cache manifest for an app, this might be called something like
<code>my.appcache</code>:

    > phantomjs confess.js http://functionsource.com > my.appcache

You would then need to attach add this file to your app, and reference the
manifest in the <code>html</code> element:

    <!DOCTYPE html>
    <html manifest="my.appcache">
        <head>

(And ensure that the manifest file gets emitted from your web server with a
content type of <code>text/cache-manifest</code>.)

To check the resulting manifest's syntax, you might like to use Frederic
Hemberger's great [cache manifest validator](http://manifest-validator.com/).

## Configuration

The following is the default <code>config.json</code> file, but you can of
course alter any of the values in this file, or a new config file of your own.

    {
        "task": "manifest",
        "userAgent": "default",
        "wait": 0,
        "consolePrefix": "#",
        "cacheFilter": ".*",
        "networkFilter": null
    }

These properties are used as follows:

 * <code>task</code> - the type of task you want confess.js to perform. <code>appcache</code> is the only supported value

 * <code>userAgent</code> - the user-agent to make the request as, or <code>default</code> to use Phantom's usual user-agent string

 * <code>wait</code> - the number of milliseconds to wait after the document has loaded before parsing for resources. This might be useful if you know that a deferred script might be making relevant additions to the DOM.

 * <code>consolePrefix</code> - if set, confess.js will output the *browser's* console to the standard output. Useful for detecting if there are also any issues with the app's execution itself.

 * <code>cacheFilter</code> - a regex to indicate which files to include in the <code>CACHE</code> block of the manifest. If set to <code>null</code>, none will. As a better example, <code>\\\\.png$</code> will indicate that only PNG files should be cached. (Note the double escaping: once for the regex, and once for the JSON.)

 * <code>networkFilter</code> - a regex to indicate which files *not* to include in the <code>CACHE</code> block of the manifest, and which a browser will request from the network. If set to <code>null</code>, none will. Note that matching files will *not* be explicitly listed in the <code>NETWORK</code> block of the manifest, since there is always a catch-all <code>*</code> wildcard added.


