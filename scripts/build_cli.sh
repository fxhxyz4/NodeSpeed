#!/bin/sh

npm run format
npm run jshint-cli

npm run eslint

npm run test

npm run prebuild
npm run build

