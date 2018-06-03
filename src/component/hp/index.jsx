import React, { Component } from 'react'
import './index.less'

class HP extends Component {
    render() {
        let {className, max, val, width, height, flip, ...rest} = this.props
        return <div className={`hpbar ${className} ${flip && 'flip'}`} {...rest} style={{
            width: `${width}px`,
            height: `${height}px`,
            backgroud: 'red',
        }}>
            <div className={`innerValue ${flip && 'flip'}`} style={{
                width: `${parseInt(val/max * 100)}%`,
                height: '100%',
                background: 'green'
            }}></div>
        </div>
    }
}

export default HP
