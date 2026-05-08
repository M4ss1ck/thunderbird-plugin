export const TEMPLATE_STORAGE_VERSION = 2
export const DEFAULT_TEMPLATE_NAME = 'New Template'

export function createTemplateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
    }

    return `template-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function splitAddressList(value) {
    if (Array.isArray(value)) {
        return value.map(String).map((item) => item.trim()).filter(Boolean)
    }

    if (!value || typeof value !== 'string') {
        return []
    }

    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
}

export function createEmptyTemplate(name = DEFAULT_TEMPLATE_NAME) {
    return {
        id: createTemplateId(),
        name,
        to: [],
        cc: [],
        subject: '',
        addDate: false,
        addSignature: false,
        signature: '',
    }
}

export function normalizeTemplate(template, fallbackName = DEFAULT_TEMPLATE_NAME) {
    const normalized = {
        ...createEmptyTemplate(fallbackName),
        ...template,
        id: template?.id || createTemplateId(),
        name: template?.name || fallbackName,
        to: splitAddressList(template?.to),
        cc: splitAddressList(template?.cc),
        subject: template?.subject ?? template?.projectName ?? '',
        addDate: Boolean(template?.addDate),
        addSignature: Boolean(template?.addSignature),
        signature: template?.signature || '',
    }

    delete normalized.projectName
    delete normalized.currentProfile

    return normalized
}

export function normalizeTemplateState(details) {
    const templates = Array.isArray(details?.templates)
        ? details.templates.map((template, index) =>
              normalizeTemplate(template, template?.name || `Template ${index + 1}`)
          )
        : []

    const safeTemplates = templates.length > 0 ? templates : [createEmptyTemplate()]
    const currentTemplateId = safeTemplates.some(
        (template) => template.id === details?.currentTemplateId
    )
        ? details.currentTemplateId
        : safeTemplates[0].id

    return {
        version: TEMPLATE_STORAGE_VERSION,
        currentTemplateId,
        templates: safeTemplates,
    }
}

export function migrateLegacyProfiles(details) {
    const profileEntries = Object.entries(details || {}).filter(([key, value]) => {
        return /^Profile\d+$/.test(key) && value && typeof value === 'object'
    })

    if (profileEntries.length === 0) {
        return normalizeTemplateState()
    }

    const templates = profileEntries.map(([profileName, profileData]) => {
        const readableName = profileName.replace(/Profile(\d+)/, 'Profile $1')

        return normalizeTemplate(
            {
                ...profileData,
                name: readableName,
                subject: profileData.projectName || '',
            },
            readableName
        )
    })

    const currentIndex = profileEntries.findIndex(([, value]) =>
        Boolean(value.currentProfile)
    )

    return normalizeTemplateState({
        version: TEMPLATE_STORAGE_VERSION,
        currentTemplateId: templates[currentIndex >= 0 ? currentIndex : 0]?.id,
        templates,
    })
}

export function migrateDetails(details) {
    if (typeof details === 'string') {
        try {
            return migrateDetails(JSON.parse(details))
        } catch {
            return normalizeTemplateState()
        }
    }

    if (details?.version === TEMPLATE_STORAGE_VERSION) {
        return normalizeTemplateState(details)
    }

    return migrateLegacyProfiles(details)
}

export function getCurrentTemplate(state) {
    const normalized = normalizeTemplateState(state)

    return (
        normalized.templates.find(
            (template) => template.id === normalized.currentTemplateId
        ) || normalized.templates[0]
    )
}

export function duplicateTemplate(template) {
    return {
        ...normalizeTemplate(template),
        id: createTemplateId(),
        name: `${template?.name || DEFAULT_TEMPLATE_NAME} Copy`,
    }
}

export function resetTemplate(template) {
    return {
        ...createEmptyTemplate(template?.name || DEFAULT_TEMPLATE_NAME),
        id: template?.id || createTemplateId(),
        name: template?.name || DEFAULT_TEMPLATE_NAME,
    }
}

export function removeTemplate(state, templateId) {
    const normalized = normalizeTemplateState(state)
    const remaining = normalized.templates.filter(
        (template) => template.id !== templateId
    )

    if (remaining.length === 0) {
        return normalizeTemplateState({
            version: TEMPLATE_STORAGE_VERSION,
            templates: [createEmptyTemplate()],
        })
    }

    return normalizeTemplateState({
        version: TEMPLATE_STORAGE_VERSION,
        currentTemplateId: remaining[0].id,
        templates: remaining,
    })
}

export function updateTemplate(state, templateId, patch) {
    const normalized = normalizeTemplateState(state)
    const templates = normalized.templates.map((template) =>
        template.id === templateId
            ? normalizeTemplate({ ...template, ...patch }, template.name)
            : template
    )

    return normalizeTemplateState({
        ...normalized,
        templates,
    })
}
