import { describe, expect, it } from 'vitest'
import { createViteConfig } from '../../vite.config'

describe('vite config', () => {
    it('uses a previewable app build by default', () => {
        const config = createViteConfig({ mode: 'production' })

        expect(config.build.outDir).toBe('dist-preview')
        expect(config.build.lib).toBeUndefined()
        expect(config.optimizeDeps.entries).toEqual(['index.html'])
    })

    it('keeps the library bundle for extension exports', () => {
        const config = createViteConfig({ mode: 'extension' })

        expect(config.build.outDir).toBe('dist')
        expect(config.build.lib.entry).toEqual([
            'src/index.jsx',
            'src/background.js',
        ])
        expect(config.build.lib.formats).toEqual(['es'])
    })
})
