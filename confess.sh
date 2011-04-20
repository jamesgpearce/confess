#!/bin/sh

PHANTOMJS=$(command -v phantomjs)

if [ -z "$PHANTOMJS" ];then
    echo "Please install PhantomJS! See www.phantomjs.org for details."
else
    ABSPATH="$( cd "$( dirname "$0" )" && pwd )"
    CONFESS=$ABSPATH/confess.js
    if [ -f CONFESS ]; then
        echo "Error: can't find confess.js!"
    else
        $PHANTOMJS $CONFESS $1 $2 $3
    fi
fi
