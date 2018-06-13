import React, { Component } from 'react'

class SVGButton extends Component {

    constructor(props, context, updater) {
      super(props, context, updater)
      this.state = {
        loading: true,
        toggled: false || this.props.toggled
      }
    }

    componentDidMount() {
      fetch(this.props.src).then(res => res.text()).then(xml => {
          this.setState({
            loading: false,
            data: xml,
          }) 
      })
    }

    onClick = () => {
      if (this.props.onChange) {
        const ret = this.props.onChange(!this.state.toggled, this.state.toggled)
        if (ret === false) {
          return
        } else {
          this.setState({
            toggled: !this.state.toggled
          })
        }
      }
    }

    render() {
        if (this.state.loading) {
          return <span />
        }
        const {className, style} = this.props
        return (<span className={`svg-icon ${className?className:''} ${this.state.toggled?'active': ''}`} 
        style={style} onClick={this.onClick} 
        dangerouslySetInnerHTML={{__html: this.state.data}}></span>)
    }
}

export default SVGButton