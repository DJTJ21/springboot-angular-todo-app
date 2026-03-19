#!/bin/sh

# Generate config file with environment variables
envsubst < /usr/share/nginx/html/assets/config.json.template > /usr/share/nginx/html/assets/config.json

# Start nginx
nginx -g "daemon off;"
