import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('quick compose dark UI', () => {
    const formSource = readFileSync('src/components/Form.jsx', 'utf8')
    const styles = readFileSync('src/styles.css', 'utf8')

    it('uses Ant Design dark tokens for the form controls', () => {
        expect(formSource).toContain('theme.darkAlgorithm')
    })

    it('keeps the popup dark-only instead of following host color scheme', () => {
        expect(styles).toContain('color-scheme: dark')
        expect(styles).not.toContain('prefers-color-scheme')
    })
})
