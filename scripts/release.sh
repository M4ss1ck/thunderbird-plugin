#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"

if [ -z "$VERSION" ]; then
    echo "Usage: ./scripts/release.sh <version>"
    echo "Example: ./scripts/release.sh 0.2.0"
    exit 1
fi

# Strip leading 'v' if provided
VERSION="${VERSION#v}"

npm version "$VERSION" --no-git-tag-version
node scripts/sync-version.cjs

git add package.json src/manifest.json
git commit -m "release v${VERSION}"
git tag "v${VERSION}"
git push && git push --tags

echo "Released v${VERSION}"
