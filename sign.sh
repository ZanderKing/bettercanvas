#!/bin/sh
# Sign Better Canvas Lite with Mozilla (unlisted = private, not shown on addons.mozilla.org)
# so it can be installed permanently in Zen/Firefox.
#
# One-time setup: create API keys at https://addons.mozilla.org/developers/addon/api/key/
# Then run (keys stay in your shell, never in this repo):
#   WEB_EXT_API_KEY='user:...' WEB_EXT_API_SECRET='...' ./sign.sh
#
# Each signed upload needs a new version number, so this bumps the patch
# version in manifest.json (5.12.6 -> 5.12.7) before signing.
set -e
cd "$(dirname "$0")"

if [ -z "$WEB_EXT_API_KEY" ] || [ -z "$WEB_EXT_API_SECRET" ]; then
    echo "Set WEB_EXT_API_KEY and WEB_EXT_API_SECRET first (see the top of this file)." >&2
    exit 1
fi

if [ "$1" != "--no-bump" ]; then
    node -e '
const fs = require("fs");
const m = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
const v = m.version.split(".").map(Number);
v[v.length - 1] += 1;
m.version = v.join(".");
fs.writeFileSync("manifest.json", JSON.stringify(m, null, 2) + "\n");
console.log("Version bumped to " + m.version);
'
fi

npx -y web-ext@8 sign \
    --channel=unlisted \
    --source-dir . \
    --artifacts-dir dist \
    --ignore-files "dist/**" "sign.sh" "README.md" "CODE_OF_CONDUCT.md" "crowdin.yml" "icon/oldicon-128.png" "icon/icon-wide.png" "icon/iconwpadding.png"

echo
echo "Signed file:"
ls -t dist/*.xpi | head -1
echo "Install it in Zen: about:addons -> gear icon -> Install Add-on From File..."
