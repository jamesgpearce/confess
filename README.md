# confess.js

A small script library that uses [PhantomJS 1.2](http://www.phantomjs.org/) to
headlessly analyze web pages.

One useful application of this is to enumerate a web app's resources for the
purposes of creating a cache manifest file to make your apps run offline. So
useful that, right now, that's the only behavior.

For example...

    > phantomjs confess.js http://functionsource.com

...will write, to stdout:

    CACHE MANIFEST

    # This manifest was created by confess.js, http://github.com/jamesgpearce/confess
    #
    #          Time: Fri Sep 02 2011 23:25:49 GMT-0700 (PDT)
    # Requested URL: http://functionsource.com
    # Retrieved URL: http://functionsource.com/
    #    User-agent: Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en-US) AppleWebKit/533.3 (KHTML, like Gecko) PhantomJS/1.2.0 Safari/533.3

    CACHE:
    /images/icons/netflix.png
    /javascripts/lib/legacy.js
    /stylesheets/light.css
    /stylesheets/screen.css
    /stylesheets/syntax.css
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
    http://use.typekit.com/k/tqz3zpc-b.css
    http://use.typekit.com/tqz3zpc.js
    http://www.google-analytics.com/ga.js

    NETWORK:
    *

You can also set the user-agent header of the request made by PhantomJS to
request the page, in case you're serving mobile apps off similar entry-point
URLs to your desktop content. It's the optional second parameter.

## Installation & usage

The one and only dependency is [PhantomJS 1.2](http://www.phantomjs.org/).
Install this, and ensure it's all good by trying out some of its example
scripts.

Then, assuming <code>phantomjs</code> is on your path, and from the directory
containing <code>confess.js</code>, run the tasks with:

    > phantomjs confess.js URL [UA [TASK]]

Where <code>URL</code> is mandatory, and points to the app you're analyzing.
<code>UA</code> is the user-agent you'd like to use, and which defaults to
PhantomJS' WebKit string. <code>TASK</code> is the type of analysis you'd like
confess.js to perform, but right now it can only be <code>'manifest'</code>, the
default.

This loads the page, then searches the DOM (and the CSS) for references to any
external resources that the app needs.

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