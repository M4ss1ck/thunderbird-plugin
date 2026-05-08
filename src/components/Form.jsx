import React, { useState, useEffect } from 'react'
import {
    Button,
    Checkbox,
    ConfigProvider,
    Form,
    Input,
    Modal,
    Select,
    Space,
    Tooltip,
    Typography,
    message,
} from 'antd'
import {
    CopyOutlined,
    DeleteOutlined,
    EditOutlined,
    FileAddOutlined,
} from '@ant-design/icons'
import { TemplateUpload } from './TemplateUpload'
import {
    createEmptyTemplate,
    duplicateTemplate,
    getCurrentTemplate,
    migrateDetails,
    normalizeTemplateState,
    removeTemplate,
    resetTemplate,
    templateToComposeDetails,
    updateTemplate,
} from '../utils/templateStorage'

export const MyForm = () => {
    const [form] = Form.useForm()
    const [templateState, setTemplateState] = useState(() =>
        normalizeTemplateState()
    )
    const currentTemplate = getCurrentTemplate(templateState)

    useEffect(() => {
        if (typeof browser === 'undefined') return

        browser.storage.local.get(['details']).then((result) => {
            const migrated = migrateDetails(result.details)
            setTemplateState(migrated)
            form.setFieldsValue(getCurrentTemplate(migrated))
        })
    }, [form])

    useEffect(() => {
        form.setFieldsValue(currentTemplate)
    }, [currentTemplate.id, form])

    const saveCurrentTemplatePatch = () => {
        const values = form.getFieldsValue()
        const nextState = updateTemplate(templateState, currentTemplate.id, values)
        setTemplateState(nextState)
        return nextState
    }

    const handleTemplateChange = (templateId) => {
        const nextState = normalizeTemplateState({
            ...saveCurrentTemplatePatch(),
            currentTemplateId: templateId,
        })
        setTemplateState(nextState)
        form.setFieldsValue(getCurrentTemplate(nextState))
    }

    const handleAddTemplate = () => {
        const savedState = saveCurrentTemplatePatch()
        const template = createEmptyTemplate(`Template ${savedState.templates.length + 1}`)
        const nextState = normalizeTemplateState({
            ...savedState,
            currentTemplateId: template.id,
            templates: [...savedState.templates, template],
        })
        setTemplateState(nextState)
        form.setFieldsValue(template)
    }

    const handleDuplicateTemplate = () => {
        const savedState = saveCurrentTemplatePatch()
        const copy = duplicateTemplate(getCurrentTemplate(savedState))
        const nextState = normalizeTemplateState({
            ...savedState,
            currentTemplateId: copy.id,
            templates: [...savedState.templates, copy],
        })
        setTemplateState(nextState)
        form.setFieldsValue(copy)
    }

    const handleRenameTemplate = () => {
        Modal.confirm({
            title: 'Rename Template',
            content: (
                <Input
                    autoFocus
                    defaultValue={currentTemplate.name}
                    id="rename-template-input"
                />
            ),
            onOk: () => {
                const input = document.getElementById('rename-template-input')
                const name = input?.value?.trim()

                if (!name) return

                const nextState = updateTemplate(templateState, currentTemplate.id, {
                    ...form.getFieldsValue(),
                    name,
                })
                setTemplateState(nextState)
                form.setFieldsValue(getCurrentTemplate(nextState))
            },
        })
    }

    const handleDeleteTemplate = () => {
        Modal.confirm({
            title: 'Delete Template',
            content: 'This will remove the selected template. If it is the last one, it will become a fresh empty template.',
            okText: 'Delete',
            okButtonProps: { danger: true },
            onOk: () => {
                const nextState = removeTemplate(templateState, currentTemplate.id)
                setTemplateState(nextState)
                form.setFieldsValue(getCurrentTemplate(nextState))
            },
        })
    }

    const handleClearTemplate = () => {
        Modal.confirm({
            title: 'Clear Template',
            content: 'This will clear the selected template fields.',
            okText: 'Clear',
            okButtonProps: { danger: true },
            onOk: () => {
                const cleared = resetTemplate(currentTemplate)
                const nextState = updateTemplate(templateState, currentTemplate.id, cleared)
                setTemplateState(nextState)
                form.setFieldsValue(cleared)
            },
        })
    }

    const onFinish = async (values) => {
        if (typeof browser === 'undefined') return

        const nextState = updateTemplate(templateState, currentTemplate.id, values)
        const selectedTemplate = getCurrentTemplate(nextState)
        let tabId

        const result = await browser.storage.local.get(['tabId'])
        if (result.tabId) {
            tabId = result.tabId
        }

        if (!tabId) {
            console.log('no tab id found. Closing...')
            window.close()
            return
        }

        try {
            await browser.compose.setComposeDetails(
                tabId,
                templateToComposeDetails(selectedTemplate)
            )
            await browser.storage.local.set({
                details: JSON.stringify(nextState),
            })
            window.close()
        } catch (e) {
            console.log('error setting compose details: ', e)
        }
    }

    return (
        <ConfigProvider
            theme={{
                token: {
                    borderRadius: 6,
                    colorPrimary: '#1677ff',
                },
            }}
        >
            <div className="qc-shell">
                <div className="qc-panel">
                    <header className="qc-header">
                        <Typography.Title level={3} className="qc-title">
                            Quick Compose
                        </Typography.Title>
                        <Space.Compact className="qc-template-controls">
                            <Select
                                value={templateState.currentTemplateId}
                                onChange={handleTemplateChange}
                                options={templateState.templates.map((template) => ({
                                    value: template.id,
                                    label: template.name,
                                }))}
                                className="qc-template-select"
                            />
                            <Tooltip title="Add template">
                                <Button icon={<FileAddOutlined />} onClick={handleAddTemplate} />
                            </Tooltip>
                            <Tooltip title="Rename template">
                                <Button icon={<EditOutlined />} onClick={handleRenameTemplate} />
                            </Tooltip>
                            <Tooltip title="Duplicate template">
                                <Button
                                    icon={<CopyOutlined />}
                                    onClick={handleDuplicateTemplate}
                                />
                            </Tooltip>
                            <Tooltip title="Delete template">
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={handleDeleteTemplate}
                                />
                            </Tooltip>
                        </Space.Compact>
                    </header>

                    <Form
                        form={form}
                        name="quick-compose-form"
                        onFinish={onFinish}
                        layout="vertical"
                        initialValues={currentTemplate}
                        className="qc-form"
                    >
                        <Form.Item label="Load Template">
                            <TemplateUpload
                                onTemplatePatch={(patch) => {
                                    form.setFieldsValue(patch)
                                    const nextState = updateTemplate(
                                        templateState,
                                        currentTemplate.id,
                                        {
                                            ...form.getFieldsValue(),
                                            ...patch,
                                        }
                                    )
                                    setTemplateState(nextState)
                                }}
                            />
                        </Form.Item>

                        <Form.Item name="to" label="To">
                            <Select
                                mode="tags"
                                tokenSeparators={[',']}
                                placeholder="Add recipients"
                            />
                        </Form.Item>

                        <Form.Item name="cc" label="CC">
                            <Select
                                mode="tags"
                                tokenSeparators={[',']}
                                placeholder="Add copied recipients"
                            />
                        </Form.Item>

                        <Form.Item name="subject" label="Subject">
                            <Input placeholder="Email subject" />
                        </Form.Item>

                        <Space className="qc-options">
                            <Form.Item
                                name="addDate"
                                valuePropName="checked"
                                className="qc-option"
                            >
                                <Checkbox>Add date</Checkbox>
                            </Form.Item>
                            <Form.Item
                                name="addSignature"
                                valuePropName="checked"
                                className="qc-option"
                            >
                                <Checkbox>Add signature</Checkbox>
                            </Form.Item>
                        </Space>

                        <Form.Item
                            noStyle
                            shouldUpdate={(previous, current) =>
                                previous.addSignature !== current.addSignature
                            }
                        >
                            {({ getFieldValue }) =>
                                getFieldValue('addSignature') ? (
                                    <Form.Item name="signature" label="Signature">
                                        <Input.TextArea rows={5} />
                                    </Form.Item>
                                ) : null
                            }
                        </Form.Item>

                        <footer className="qc-footer">
                            <Button onClick={handleClearTemplate}>Clear Template</Button>
                            <Button type="primary" htmlType="submit">
                                Fill Email
                            </Button>
                        </footer>
                    </Form>
                </div>
            </div>
        </ConfigProvider>
    )
}
