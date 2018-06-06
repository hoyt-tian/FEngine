import React, { Component } from 'react'
import Character from '../../core/character'
import ActionEditor from './action'
import { Menu } from 'antd'
import { connect } from 'react-redux'
import './index.less'

class CEditor extends Component{

    state = {
        editType: 1,    // 1:基本属性, 2: 基本动作， 3: 特技， 4: 其他
        currentAction: null, // 当前
        key: null,
    }

    basicActions() {
        const {Item} = Menu
        let actions = [
            {name: '站立', key: 'stand'},
            {name: '前进', key: 'walk'},
            {name: '后退', key: 'back'},
            {name: '跑', key: 'run'},
            {name: '下蹲', key: 'squat'},
            {name: '跳跃', key: 'jump'},
            {name: '急退', key: 'slipback'},
            {name: '轻拳', key: 'lp'},
            {name: '轻腿', key: 'lk'},
            {name: '重拳', key: 'hp'},
            {name: '重腿', key: 'hk'},
            {name: '受伤', key: 'hm'},
            {name: '坠落', key: 'drop'},
            {name: '起身', key: 'getup'},
            {name: '轻拳（空中）', key: 'jlp'}

        ]
        return actions.map(i => <Item key={i.key}>{i.name}</Item>)
    }

    onSelect = ({item, key, selectedKeys}) => {
        let t = 0
        let currentAction = null
        let motion = null
        const character = this.props.character
        if (key in character.specialActions) {
            t = 3
            currentAction = character.actions[key]
            motion = key
        } else if (key in character.actions) {
            t = 2
            currentAction = character.actions[key]
            motion = key
        } else if (key === '__basic___') {
            t = 1
        } else {
            t = 4
        }
        this.setState({
            editType: t,
            currentAction,
            motion
        })
        if(this.actionEditor) {
            this.actionEditor.reset()
            console.log(JSON.stringify(this.props.character))
        }
    }

    render() {
        const {SubMenu, Item} = Menu
        const {character} = this.props
        return (
            <section className="ceditor">
                <Menu mode="inline" className="menu" defaultOpenKeys={['basic','special']} onSelect={this.onSelect}>
                    <Item key="__basic__">基本属性</Item>
                    <SubMenu title="基本动作" key="basic">
                        {this.basicActions()}
                    </SubMenu>
                    <SubMenu title="特有技能" key="special">
                        {Object.keys(character.specialActions).map(k => {
                            let sp = character.specialActions[k]
                            return (<Item key={k}>{sp.name || sp.k}</Item>)
                        })}
                    </SubMenu>
                    <SubMenu title="其他">
                    </SubMenu>
                </Menu>
                {this.state.editType === 1 && <section>props Editor</section>}
                { ([2, 3].indexOf(this.state.editType) > -1)  && <ActionEditor action={this.state.currentAction} character={this.props.character} motion={this.state.motion}/>}
                {this.state.editType === 4 && <section>props Editor</section>}
            </section>
        )
    }
}



export default CEditor