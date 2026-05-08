import React from 'react'
import { Upload, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import {
    convertToTemplatePatch,
    parseEmlTemplate,
} from '../utils/emlTemplateParser'

/**
 * Component for uploading and parsing .emltpl template files
 */
export const TemplateUpload = ({ onTemplatePatch }) => {
    const handleTemplateLoad = (file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target.result
                const parsedData = parseEmlTemplate(content)
                const patch = convertToTemplatePatch(parsedData)
                const loadedFields = [
                    patch.to?.length ? 'recipients' : null,
                    patch.cc?.length ? 'cc' : null,
                    patch.subject ? 'subject' : null,
                    patch.signature ? 'body' : null,
                ].filter(Boolean)

                onTemplatePatch(patch)

                if (loadedFields.length > 0) {
                    message.success(`Loaded ${loadedFields.join(', ')}`)
                } else {
                    message.warning('Template loaded, but no supported fields were found')
                }
            } catch (error) {
                message.error('Failed to parse template file')
                console.error('Template parsing error:', error)
            }
        }
        reader.readAsText(file)
        return false // Prevent default upload behavior
    }

    return (
        <Upload
            beforeUpload={handleTemplateLoad}
            accept=".emltpl"
            showUploadList={false}
            maxCount={1}
        >
            <Button
                icon={<UploadOutlined />}
                style={{
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff',
                    color: 'white',
                }}
            >
                Load .emltpl File
            </Button>
        </Upload>
    )
}
