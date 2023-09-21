#!/bin/bash
for file in $(find packages/keepkey-desktop/build/ -type f); do
    openssl dgst -sha256 "$file"
done > checksum.txt
