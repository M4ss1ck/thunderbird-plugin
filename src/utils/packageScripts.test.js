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
})
