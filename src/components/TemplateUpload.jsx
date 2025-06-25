import React from 'react'
import { Upload, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import {
    parseEmlTemplate,
    convertToFormValues,
} from '../utils/emlTemplateParser'

/**
 * Component for uploading and parsing .emltpl template files
 */
export const TemplateUpload = ({ form, profile }) => {
    const handleTemplateLoad = (file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target.result
                const parsedData = parseEmlTemplate(content)
                const formValues = convertToFormValues(parsedData, profile)

                // Update form with parsed data
                form.setFieldsValue(formValues)

                message.success('Template loaded successfully!')
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
