import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('package scripts', () => {
    const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts

    it('builds the extension with the extension Vite mode before packaging', () => {
        expect(scripts['build:extension']).toBe(
            'vite build --mode extension'
        )
        expect(scripts.export).toContain('npm run build:extension')
    })

    it('builds the local app before starting preview', () => {
        expect(scripts.preview).toContain('npm run build')
        expect(scripts.preview).toContain('vite preview')
    })

    it('exports a dev build with a generated dev manifest', () => {
        expect(scripts['prepare-export:dev']).toBe(
            'node scripts/prepare-dev-export.cjs'
        )
        expect(scripts['export:dev']).toContain('npm run build:extension')
        expect(scripts['export:dev']).toContain('npm run prepare-export:dev')
        expect(scripts['export:dev']).toContain(
            'jszip-cli -c jszip.dev.config.json'
        )
    })
})
