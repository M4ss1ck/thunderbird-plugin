import { describe, expect, it } from 'vitest'
import { createEmptyTemplate } from './templateStorage'

describe('createEmptyTemplate', () => {
    it('creates a named empty template', () => {
        expect(createEmptyTemplate('New Template')).toMatchObject({
            name: 'New Template',
            to: [],
            cc: [],
            subject: '',
            addDate: false,
            addSignature: false,
            signature: '',
        })
    })
})
