import React, { useState, useEffect } from 'react'
import { Button, Form, Input, Select, Space } from 'antd'
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
    // const [toArray, setToArray] = useState('')
    // const [ccArray, setCcArray] = useState('')
    // const [projectName, setProjectName] = useState('')

    const [form] = Form.useForm()

    useEffect(() => {
        if (typeof browser !== 'undefined') {
            browser.storage.local
                .get(['toArray', 'ccArray', 'projectName'])
                .then((result) => {
                    // setToArray(result.toArray?.join(',') || '')
                    // setCcArray(result.ccArray?.join(',') || '')
                    // setProjectName(result.projectName || '')
                    form.setFieldsValue({
                        to: result.toArray?.join(',') || '',
                        cc: result.ccArray?.join(',') || '',
                        projectName: result.projectName || '',
                    })
                })
        }
    }, [])

    const onFinish = async (values) => {
        console.log(values)
        if (!browser) return
        let tabId = undefined

        await browser.storage.local.get(['tabId']).then((result) => {
            if (result.tabId) {
                tabId = result.tabId
            }
        })

        const toArray = values?.to.split(',') || []
        const ccArray = values?.cc.split(',') || []
        const projectName = values?.projectName || ''

        if (tabId) {
            const date = new Date()
            const subject = `${projectName} Work (${
                months[date.getMonth()]
            } ${date.getDate()})`
            browser.compose
                .setComposeDetails(tabId, {
                    to: toArray,
                    cc: ccArray,
                    subject,
                })
                .then(() => {
                    browser.storage.local
                        .set({
                            toArray,
                            ccArray,
                            projectName,
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
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 400 }}
            >
                {/* <Form.Item
                    name="profile"
                    label={
                        <label>
                            <strong>Profile:</strong>
                        </label>
                    }
                    rules={[{ required: false }]}
                >
                    <Select>
                        <Select.Option value="1">Profile 1</Select.Option>
                        <Select.Option value="2">Profile 2</Select.Option>
                        <Select.Option value="3">Profile 3</Select.Option>
                    </Select>
                </Form.Item> */}
                <Form.Item
                    name="to"
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
                    name="cc"
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
                    name="projectName"
                    label={
                        <Label fontColor="white">
                            <strong>Project Name:</strong>
                        </Label>
                    }
                    rules={[{ required: false }]}
                >
                    <Input />
                </Form.Item>
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
