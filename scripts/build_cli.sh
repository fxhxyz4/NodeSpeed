#!/bin/sh

npm run format
npm run lint

npm run prebuild
npm run build

npm run test
