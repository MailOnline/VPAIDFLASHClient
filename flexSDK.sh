#! /bin/bash
if [ -f vendor/bin/mxmlc ]; then
    echo 'already installed... skipping...'
else
    mkdir vendor
    curl -o 'vendor/flex_sdk_v3_6.zip' 'http://download.macromedia.com/pub/flex/sdk/flex_sdk_3.6a.zip'
    unzip 'vendor/flex_sdk_v3_6.zip' -d 'vendor'
    rm 'vendor/flex_sdk_v3_6.zip'
    chmod -R 755 './vendor'
    echo 'installation complete...'
    exit
fi

