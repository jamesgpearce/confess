# confess.js

A small script library that uses [PhantomJS](http://www.phantomjs.org/) to
headlessly analyze web pages.

One useful application of this is to enumerate a web app's resources for the
purposes of creating a cache manifest file to make your apps run offline. So
useful that, right now, that's the only behavior.

For example...

    > confess.sh http://functionsource.com

...will write, to stdout:

    CACHE MANIFEST

    # This manifest was created by confess.js, http://github.com/jamesgpearce/confess
    #
    # Time: Wed Apr 13 2011 15:40:27 GMT-0700 (PDT)
    #  URL: http://functionsource.com
    #   UA: Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en-US) AppleWebKit/533.3 (KHTML, like Gecko) PhantomJS/1.1.0 Safari/533.3
    #

    CACHE:
    /javascripts/lib/jquery.js
    /javascripts/lib/underscore.js
    /javascripts/lib/backbone.js
    /javascripts/lib/view.js
    /javascripts/lib/jquery.timeago.js
    /javascripts/lib/text-linker.js
    /javascripts/templates.js
    /javascripts/models/post.js
    /javascripts/views/helpers.js
    /javascripts/views/application.js
    /javascripts/views/mixins.js
    /javascripts/views/index.js
    http://use.typekit.com/tqz3zpc.js
    /stylesheets/vendor-prefix.css
    /stylesheets/screen.css
    /stylesheets/syntax.css
    http://functionsource.com/images/header.png
    http://functionsource.com/images/featured.jpg
    http://functionsource.com/images/avatars/dion.png
    http://functionsource.com/images/avatars/ben.png
    http://functionsource.com/images/avatars/kevin.png
    http://functionsource.com/images/avatars/ryan.png
    http://functionsource.com/images/icons/twitter.png
    http://functionsource.com/images/icons/linkedin.png
    http://functionsource.com/images/icons/facebook.png
    http://functionsource.com/images/icons/rss.png
    http://functionsource.com/images/icons/podcast.png
    http://functionsource.com/images/icons/firehose.png

    NETWORK:
    *

You can also set the user-agent header of the request made by PhantomJS to
request the page, in case you're serving mobile apps off similar entry-point
URLs to your desktop content.

## Installation & usage

The one and only dependency is [PhantomJS](http://www.phantomjs.org/). Install
this, and ensure it's all good by trying out some of its example scripts.

Then, assuming <code>phantomjs</code> is on your path, and from the directory
containing <code>confess.sh</code>, run tasks with:

    > confess.sh URL [UA [TASK]]

Where <code>URL</code> is mandatory, and points to the app you're analyzing.
<code>UA</code> is the user-agent you'd like to use, and which defaults to
PhantomJS' WebKit string. <code>TASK</code> is the type of analysis you'd like
confess.js to perform, but right now it can only be <code>'manifest'</code>, the
default.

This loads the page, then searches the DOM (and the CSS) for references to any
external resources that the app needs.

The results go to stdout, but of course you can pipe it to a file. If you want
to create a cache manifest for an app, this is my be called something like
<code>my.appcache</code>:

    > confess.sh http://functionsource.com > my.appcache

You would then need to attach add this file to your app, and reference the
manifest in the <code>html</code> element:

    <!DOCTYPE html>
    <html manifest="my.appcache">
        <head>

(And ensure that the manifest file gets emitted from your web server with a
content type of <code>text/cache-manifest</code>.)

You might also like to check it against Frederic Hemberger's great
[cache manifest validator](http://manifest-validator.com/).
