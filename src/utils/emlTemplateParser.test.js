import { describe, expect, it } from 'vitest'
import {
    convertToTemplatePatch,
    parseEmlTemplate,
} from './emlTemplateParser'

describe('emlTemplateParser', () => {
    it('parses emltpl headers and converts them to a template patch', () => {
        const parsed = parseEmlTemplate(
            [
                'To: boss@example.com, lead@example.com',
                'Cc: team@example.com',
                'Subject: Daily Report',
                '',
                '<html><body>Signature</body></html>',
            ].join('\n')
        )

        expect(convertToTemplatePatch(parsed)).toEqual({
            to: ['boss@example.com', 'lead@example.com'],
            cc: ['team@example.com'],
            subject: 'Daily Report',
            signature: '<html><body>Signature</body></html>',
            addSignature: true,
        })
    })

    it('does not enable signature when no body is found', () => {
        expect(
            convertToTemplatePatch({
                to: '',
                cc: '',
                subject: 'Subject',
                body: '',
            })
        ).toEqual({
            to: [],
            cc: [],
            subject: 'Subject',
        })
    })
})
