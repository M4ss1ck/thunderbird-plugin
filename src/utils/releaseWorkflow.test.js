import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('release workflow', () => {
    it('packages the XPI with the extension build', () => {
        const workflow = readFileSync('.github/workflows/release.yml', 'utf8')

        expect(workflow).toContain('pnpm build:extension')
        expect(workflow).toContain('pnpm exec jszip-cli -c jszip.config.json')
    })

    it('packages the bundled stylesheet in the production XPI', () => {
        const config = JSON.parse(readFileSync('jszip.config.json', 'utf8'))

        expect(config.entries).toContain('dist/style.css')
    })

    it('packages the dev XPI with a generated manifest and bundled stylesheet', () => {
        const config = JSON.parse(readFileSync('jszip.dev.config.json', 'utf8'))

        expect(config.entries).toContain('dist-dev/manifest.json')
        expect(config.entries).toContain('dist/style.css')
        expect(config.outputEntry).toBe('dist-dev/daily-reports-dev.xpi')
    })

    it('uses a different Thunderbird id for dev exports', () => {
        const script = readFileSync('scripts/prepare-dev-export.cjs', 'utf8')

        expect(script).toContain('daily.report.dev@massick.dev')
    })

    it('lets packageManager define the pnpm version', () => {
        const workflow = readFileSync('.github/workflows/release.yml', 'utf8')
        const pnpmSetupStep = workflow.match(
            /- uses: pnpm\/action-setup@v4[\s\S]*?(?=\n\s*- uses:|\n\s*- name:|$)/
        )?.[0]

        expect(pnpmSetupStep).toBeDefined()
        expect(pnpmSetupStep).not.toContain('version:')
    })
})
