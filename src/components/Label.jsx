import React from 'react'

const Label = ({ children, backgroundColor, fontColor }) => {
    const labelStyle = {
        backgroundColor: backgroundColor ?? 'inherit',
        color: fontColor ?? 'white',
        // padding: '10px',
        // borderRadius: '5px',
    }

    return <label style={labelStyle}>{children}</label>
}

export default Label
