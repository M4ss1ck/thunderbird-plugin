import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('release workflow', () => {
    it('packages the XPI with the extension build', () => {
        const workflow = readFileSync('.github/workflows/release.yml', 'utf8')

        expect(workflow).toContain('pnpm build:extension')
        expect(workflow).toContain('pnpm exec jszip-cli -c jszip.config.json')
    })
})
