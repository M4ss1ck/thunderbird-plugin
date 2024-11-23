import React, { useState, useEffect } from 'react'
import { Button, Form, Input, Radio, Space, Checkbox } from 'antd'
import Label from './Label'

const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
]

const { TextArea } = Input

const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
}

export const MyForm = () => {
    const profiles = ['Profile1', 'Profile2', 'Profile3']
    const [profile, setProfile] = useState(profiles[0])

    const [form] = Form.useForm()

    useEffect(() => {
        if (typeof browser !== 'undefined') {
            browser.storage.local.get(['details']).then((result) => {
                if (!result.details) return
                const details = JSON.parse(result.details)
                const values = revertProfiles(details)
                const currentProfile = Object.keys(details).find(
                    (key) => details[key].currentProfile
                )
                if (currentProfile) {
                    setProfile(currentProfile)
                }
                form.setFieldsValue({
                    ...values,
                    profile: currentProfile ?? profiles[0],
                })
            })
        }
    }, [])

    const onFinish = async (values) => {
        if (typeof browser === 'undefined') return
        let tabId = undefined

        const parsedValues = convertProfiles(values)
        for (const key in parsedValues) {
            if (key === profile) {
                parsedValues[key].currentProfile = true
                break
            }
        }

        await browser.storage.local.get(['tabId']).then((result) => {
            if (result.tabId) {
                tabId = result.tabId
            }
        })

        const profileData = parsedValues[profile]
        const toArray = profileData?.to?.split(',') || []
        const ccArray = profileData?.cc?.split(',') || []
        const projectName = profileData?.projectName || ''
        const addDate = profileData?.addDate || false
        const addSignature = profileData?.addSignature || false
        const signature = profileData?.signature || ''

        if (tabId) {
            const date = new Date()
            let subject = `${projectName}`
            let body = ''
            if (addDate) {
                subject += ` (${months[date.getMonth()]} ${date.getDate()})`
            }
            if (addSignature) {
                body += `\n\n${signature}`
            }
            // https://webextension-api.thunderbird.net/en/latest/compose.html#compose-composedetails
            browser.compose
                .setComposeDetails(tabId, {
                    to: toArray,
                    cc: ccArray,
                    subject,
                    body,
                })
                .then(() => {
                    browser.storage.local
                        .set({
                            details: JSON.stringify(parsedValues),
                        })
                        .then(() => window.close())
                })
                .catch((e) => console.log('error setting compose details: ', e))
        } else {
            console.log('no tab id found. Closing...')
            window.close()
        }
    }

    const onReset = () => {
        form.resetFields()
    }

    const handleProfileChange = (e) => {
        setProfile(e.target.value)
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(46, 45, 45)',
                color: 'white',
                height: '100vh',
                width: '100vw',
                overflowX: 'hidden',
            }}
        >
            <Form
                form={form}
                name="my-form"
                onFinish={onFinish}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                style={{ maxWidth: 700 }}
            >
                <Form.Item
                    name="profile"
                    label={
                        <Label fontColor="white">
                            <strong>Profile:</strong>
                        </Label>
                    }
                    rules={[{ required: false }]}
                >
                    <Radio.Group onChange={handleProfileChange} value={profile}>
                        {profiles.map((p) => (
                            <Radio key={'radio-' + p} value={p}>
                                <Label fontColor="white">{p}</Label>
                            </Radio>
                        ))}
                    </Radio.Group>
                </Form.Item>

                {profiles.map((p) => (
                    <FormItems key={p} profile={p} visible={p === profile} />
                ))}

                <Form.Item {...tailLayout}>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                        <Button htmlType="button" onClick={onReset}>
                            Reset
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    )
}

const FormItems = ({ profile = '', visible = false }) => {
    return (
        <div
            style={{
                display: visible ? 'block' : 'none',
            }}
        >
            <Form.Item
                name={profile + 'to'}
                label={
                    <Label fontColor="white">
                        <strong>To:</strong>
                    </Label>
                }
                rules={[{ required: false }]}
            >
                <TextArea rows={5} />
            </Form.Item>
            <Form.Item
                name={profile + 'cc'}
                label={
                    <Label fontColor="white">
                        <strong>CC:</strong>
                    </Label>
                }
                rules={[{ required: false }]}
            >
                <TextArea rows={5} />
            </Form.Item>
            <Form.Item
                name={profile + 'projectName'}
                label={
                    <Label fontColor="white">
                        <strong>Subject:</strong>
                    </Label>
                }
                rules={[{ required: false }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name={profile + 'addDate'}
                label={
                    <Label fontColor="white">
                        <strong>Add date:</strong>
                    </Label>
                }
                rules={[{ required: false }]}
                valuePropName="checked"
            >
                <Checkbox />
            </Form.Item>
            <Form.Item
                name={profile + 'addSignature'}
                label={
                    <Label fontColor="white">
                        <strong>Add signature:</strong>
                    </Label>
                }
                rules={[{ required: false }]}
                valuePropName="checked"
            >
                <Checkbox />
            </Form.Item>
            <Form.Item
                name={profile + 'signature'}
                label={
                    <Label fontColor="white">
                        <strong>Signature:</strong>
                    </Label>
                }
                rules={[{ required: false }]}
            >
                <TextArea rows={5} />
            </Form.Item>
        </div>
    )
}

function convertProfiles(obj) {
    const profiles = {}

    for (const key in obj) {
        const match = key.match(/(Profile\d+)(\w+)/)
        if (match) {
            const profileName = match[1]
            const fieldName = match[2]
            if (!profiles[profileName]) {
                profiles[profileName] = {}
            }
            profiles[profileName][fieldName] = obj[key]
        }
    }
    return profiles
}

function revertProfiles(profiles) {
    const obj = {}
    for (const profileName in profiles) {
        for (const fieldName in profiles[profileName]) {
            const newKey = `${profileName}${fieldName}`
            obj[newKey] = profiles[profileName][fieldName]
        }
    }
    return obj
}
