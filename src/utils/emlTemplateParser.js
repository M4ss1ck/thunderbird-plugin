/**
 * Utility functions for parsing .emltpl (email template) files
 */

/**
 * Parse an .emltpl file content and extract email fields
 * @param {string} content - The raw content of the .emltpl file
 * @returns {Object} Parsed email fields (to, cc, subject, from, body)
 */
export const parseEmlTemplate = (content) => {
    const lines = content.split('\n')
    const headers = {}
    let bodyStartIndex = -1

    // Parse headers
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line === '') {
            bodyStartIndex = i + 1
            break
        }

        const colonIndex = line.indexOf(':')
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim().toLowerCase()
            let value = line.substring(colonIndex + 1).trim()

            // Handle multi-line headers (continuation lines start with whitespace)
            let j = i + 1
            while (j < lines.length && lines[j].match(/^\s+/)) {
                value += ' ' + lines[j].trim()
                i = j
                j++
            }

            headers[key] = value
        }
    }

    // Extract raw HTML body content
    let body = ''

    // Look through all lines for HTML content
    for (const line of lines) {
        // Found the HTML content line - extract it directly
        if (line.includes('<!DOCTYPE') || line.startsWith('<html')) {
            body = line
            break
        }
    }

    return {
        to: headers.to ? headers.to.trim() : '',
        cc: headers.cc ? headers.cc.trim() : '',
        subject: headers.subject || '',
        from: headers.from ? headers.from.trim() : '',
        body: body,
    }
}

/**
 * Convert parsed email data to form values for a specific profile
 * @param {Object} parsedData - Data from parseEmlTemplate
 * @param {string} profile - Profile name (e.g., 'Profile1')
 * @returns {Object} Form values object
 */
export const convertToFormValues = (parsedData, profile) => {
    const formValues = {}
    formValues[profile + 'to'] = parsedData.to
    formValues[profile + 'cc'] = parsedData.cc
    formValues[profile + 'projectName'] = parsedData.subject
    // Add raw HTML body as signature if we have it
    if (parsedData.body) {
        formValues[profile + 'signature'] = parsedData.body
        formValues[profile + 'addSignature'] = true
    }

    return formValues
}
