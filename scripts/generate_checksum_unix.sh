#!/bin/bash
find packages/keepkey-desktop/build/ -type f -exec openssl dgst -sha256 {} \; > checksum.txt
