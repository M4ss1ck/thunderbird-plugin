import React from 'react'
import { createRoot } from 'react-dom/client'
import { MyForm } from './components/Form'

const domNode = document.getElementById('root')
const root = createRoot(domNode)
root.render(
    <React.StrictMode>
        <MyForm />
    </React.StrictMode>
)
