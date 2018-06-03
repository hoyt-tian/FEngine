import React, { Component } from 'react'
import Character from '../../core/character'

export default class Viewer extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            lastFrameTime: null,
        }
    }

    attachCanvas = (el) => {
        if (el) {
            this.canvas = el
            this.ctx = el.getContext('2d')
        }
    }

    redraw = (timestamp) => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.drawImage(this.props.character.currentFrame.image, 0, 0)
        this.props.character.next({},true)
        this.timer = requestAnimationFrame(this.redraw) 
    }

    componentDidMount() {
        this.timer = requestAnimationFrame(this.redraw)
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.timer)
        this.timer = null
    }

    render() {
        let { character, onBack } = this.props
        return (<section>
            <header><span onClick={() => {onBack()}}>返回</span></header>
            <section>
                <section>{Object.keys(character.actions).map((k) => {
                    return (<div key={k} className={character.status === k ? 'active' : ''} onClick={() => {
                        character.status = k
                    }}>{k}</div>)
                })}</section>
                <section>
                    <canvas width={200} height={200} ref={this.attachCanvas}/>
                </section>
            </section>
        </section>)
    }
}