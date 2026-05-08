import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('extension html', () => {
    it('loads the bundled popup script with an explicit relative URL', () => {
        const html = readFileSync('static/index.html', 'utf8')

        expect(html).toContain('src="./index.js"')
    })
})
