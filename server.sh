#!/bin/bash

if [ "$1" = "dev" ]; then
	echo "Running server for development environment."
	node app.js --node-args="--max-old-space-size=3072"
elif [ "$1" = "prod" ]; then
	echo "Running server for production environment."
	pm2 start app.js --node-args="--max-old-space-size=6144"
elif [ "$1" = "pull" ]; then
	echo "Pulling code from repository."
	git pull origin master
fi
