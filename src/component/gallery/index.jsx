import React, { Component } from 'react'
import Character from '../../core/character'
import Viewer from '../viewer/index.jsx'

export default class Gallery extends Component{
    constructor(props, context) {
        super(props, context)
        this.state = {
            characters: null,
            current: null,
        }
    }

    componentDidMount() {
        Character.fetchAll().then((values) => {
            let map = {}
            values.map(i => map[i.name] = i)
            this.setState({
                characters: map
            })
        }, (e) => {
            console.log(`加载失败${e}`)
        })
        .catch(() => {
            console.log('资源加载异常')
        })
    }

    back = () => {
        this.setState({current: null})
    }

    render() {
        if (this.state.characters === null) {
            return (<span>正在加载图片资源</span>)
        }
        if (this.state.current === null)
        return (<section>
            {Object.values(this.state.characters).map((item) => {
                return (<section key={item.name} onClick={() => this.setState({current: item})}><img src={`${item.base}/${item.avatar}`} /></section>)
            })}
        </section>)
        return (<Viewer character={this.state.current} onBack={this.back} />)
    }
}