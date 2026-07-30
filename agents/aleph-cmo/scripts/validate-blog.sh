#!/bin/sh
set -eu

bundle_dir="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
node "$bundle_dir/scripts/validate-blog.mjs" "${1:?usage: validate-blog.sh PATH_TO_BLOG_POST}"
