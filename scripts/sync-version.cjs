const fs = require('fs')

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const manifestPath = 'src/manifest.json'
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

manifest.version = pkg.version
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4) + '\n')

console.log(`Synced manifest version to ${pkg.version}`)
