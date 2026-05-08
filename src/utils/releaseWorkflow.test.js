import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('release workflow', () => {
    it('packages the XPI with the extension build', () => {
        const workflow = readFileSync('.github/workflows/release.yml', 'utf8')

        expect(workflow).toContain('pnpm build:extension')
        expect(workflow).toContain('pnpm exec jszip-cli -c jszip.config.json')
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
