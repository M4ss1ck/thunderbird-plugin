const fs = require('node:fs')
const path = require('node:path')

const DEV_EXTENSION_ID = 'daily.report.dev@massick.dev'
const manifestPath = 'src/manifest.json'
const outputDir = 'dist-dev'
const outputPath = path.join(outputDir, 'manifest.json')

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

manifest.name = `${manifest.name} Dev`
manifest.browser_specific_settings = {
    ...manifest.browser_specific_settings,
    gecko: {
        ...manifest.browser_specific_settings?.gecko,
        id: DEV_EXTENSION_ID,
    },
}

fs.mkdirSync(outputDir, { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 4) + '\n')

console.log(`Prepared dev manifest at ${outputPath}`)
