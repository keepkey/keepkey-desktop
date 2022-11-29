#!/bin/bash
grep -oE '@keepkey\/[a-z-]*' package.json | grep -v -e hdwallet -e web | xargs yarn link
