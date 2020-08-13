#!/usr/bin/sh

pushd hugo-blog
sh deploy.sh ".\\/" "../blog"
popd
