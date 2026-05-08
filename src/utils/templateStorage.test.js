import { describe, expect, it } from 'vitest'
import {
    createEmptyTemplate,
    duplicateTemplate,
    migrateDetails,
    normalizeTemplateState,
    removeTemplate,
    resetTemplate,
    templateToComposeDetails,
} from './templateStorage'

describe('template storage', () => {
    it('creates a named empty template', () => {
        const template = createEmptyTemplate('New Template')

        expect(template).toMatchObject({
            name: 'New Template',
            to: [],
            cc: [],
            subject: '',
            addDate: false,
            addSignature: false,
            signature: '',
        })
        expect(template.id).toEqual(expect.any(String))
    })

    it('migrates legacy profiles to version 2 templates', () => {
        const migrated = migrateDetails({
            Profile1: {
                to: 'boss@example.com, lead@example.com',
                cc: 'team@example.com',
                projectName: 'Daily Report',
                addDate: true,
                addSignature: true,
                signature: 'Thanks',
            },
            Profile2: {
                to: '',
                cc: '',
                projectName: 'Weekly Summary',
                addDate: false,
                addSignature: false,
                signature: '',
                currentProfile: true,
            },
        })

        expect(migrated.version).toBe(2)
        expect(migrated.templates).toHaveLength(2)
        expect(migrated.templates[0]).toMatchObject({
            name: 'Profile 1',
            to: ['boss@example.com', 'lead@example.com'],
            cc: ['team@example.com'],
            subject: 'Daily Report',
            addDate: true,
            addSignature: true,
            signature: 'Thanks',
        })
        expect(migrated.currentTemplateId).toBe(migrated.templates[1].id)
    })

    it('normalizes malformed version 2 data to at least one template', () => {
        const normalized = normalizeTemplateState({
            version: 2,
            currentTemplateId: 'missing',
            templates: [],
        })

        expect(normalized.version).toBe(2)
        expect(normalized.templates).toHaveLength(1)
        expect(normalized.currentTemplateId).toBe(normalized.templates[0].id)
    })

    it('duplicates templates with a new id and copy name', () => {
        const template = createEmptyTemplate('Daily Report')
        const copy = duplicateTemplate(template)

        expect(copy.id).not.toBe(template.id)
        expect(copy.name).toBe('Daily Report Copy')
    })

    it('removes a template and keeps another selected', () => {
        const first = createEmptyTemplate('First')
        const second = createEmptyTemplate('Second')
        const state = normalizeTemplateState({
            version: 2,
            currentTemplateId: first.id,
            templates: [first, second],
        })

        const next = removeTemplate(state, first.id)

        expect(next.templates).toHaveLength(1)
        expect(next.templates[0].id).toBe(second.id)
        expect(next.currentTemplateId).toBe(second.id)
    })

    it('removing the last template creates a fresh empty one', () => {
        const only = createEmptyTemplate('Only')
        const state = normalizeTemplateState({
            version: 2,
            currentTemplateId: only.id,
            templates: [only],
        })

        const next = removeTemplate(state, only.id)

        expect(next.templates).toHaveLength(1)
        expect(next.templates[0].id).not.toBe(only.id)
        expect(next.templates[0].name).toBe('New Template')
    })

    it('resetting a template preserves id and name by default', () => {
        const template = {
            ...createEmptyTemplate('Daily Report'),
            to: ['boss@example.com'],
            subject: 'Subject',
            addDate: true,
        }

        const reset = resetTemplate(template)

        expect(reset).toMatchObject({
            id: template.id,
            name: 'Daily Report',
            to: [],
            cc: [],
            subject: '',
            addDate: false,
            addSignature: false,
            signature: '',
        })
    })
})

describe('templateToComposeDetails', () => {
    it('maps template fields to Thunderbird compose details', () => {
        const details = templateToComposeDetails(
            {
                ...createEmptyTemplate('Daily'),
                to: ['boss@example.com'],
                cc: ['lead@example.com'],
                subject: 'Daily Report',
                addDate: false,
                addSignature: true,
                signature: 'Thanks',
            },
            new Date('2026-05-08T12:00:00Z')
        )

        expect(details).toEqual({
            to: ['boss@example.com'],
            cc: ['lead@example.com'],
            subject: 'Daily Report',
            body: '\n\nThanks',
        })
    })

    it('appends date when enabled', () => {
        const details = templateToComposeDetails(
            {
                ...createEmptyTemplate('Daily'),
                subject: 'Daily Report',
                addDate: true,
            },
            new Date('2026-05-08T12:00:00Z')
        )

        expect(details.subject).toBe('Daily Report (May 8)')
    })
})
