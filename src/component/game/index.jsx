import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from 'react-loading-components';
import Character from '../../core/character';
import Gallery from './gallery';
import './index.less';

class Game extends Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    jsonUrl: PropTypes.string,
    bootVideo: PropTypes.string,
  }

  static defaultProps = {
    width: 1280,
    height: 720,
    jsonUrl: null,
    bootVideo: './assets/bootup.mp4',
  }

  constructor(props, context, updater) {
    super(props, context, updater);
    this.state = {
      screen: 'Boot', // Boot, Loading, Preview, Input, Error, Gallery
      jsonUrl: props.jsonUrl,
    };
  }

  loadBtnClicked = () => {
    this.loadGameJson(this.state.jsonUrl);
  }

  skipBoot = () => {
    if (this.props.jsonUrl) {
      this.loadGameJson(this.props.jsonUrl);
    } else {
      this.setState({
        screen: 'Input',
      });
    }
  }

  loadGameJson = (url) => {
    if (url) {
      this.setState({
        screen: 'Loading',
      });
      return fetch(url).then(resp => resp.json(), (res) => {
        this.setState({
          screen: 'Error',
          error: res,
        });
      }).then(data => Character.fetchAll(data.character).then((characters) => {
        this.setState({
          screen: 'Gallery',
          characters,
        });
      }));
    }
    return Promise.reject(new Error(`illegal url:${url}`));
  }

  renderBoot() {
    return (<video
      src={this.props.bootVideo}
      autoPlay
      muted={false}
      volume={0.618}
      loop={false}
      onEnded={this.skipBoot}
      onClick={this.skipBoot}
    >
            你的浏览器不支持<code>video</code> 标签.
            </video>);
  }

  renderError() {
    return <section>{JSON.stringify(this.state.error)}</section>;
  }

  renderGallery() {
    const data = new Array(18);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = { avatar: './assets/character/iori/avatar.png' };
    }
    return <Gallery characters={data || this.state.characters} />;
  }

  renderPreview() {
    return (<section>preview</section>);
  }

  renderInput() {
    return (<section className="url-input">
      <label htmlFor="jsonUrlInput">配置文件</label>
      <input
        id="jsonUrlInput"
        type="text"
        placeholder="请输入要加载的游戏配置文件"
        defaultValue={this.props.jsonUrl || 'http://localhost:8080/assets/index.json'}
        onChange={(e) => {
        this.setState({
          jsonUrl: e.target.value,
        });
      }}
      /><button onClick={this.loadBtnClicked}>加载</button>
            </section>);
  }

  renderLoading() {
    return (<Loading type="grid" fill="rgb(63, 81, 181)" />);
  }

  renderContent() {
    const { screen } = this.state;
    try {
      return this[`render${screen}`]();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  render() {
    return (<section className="reFTG" style={{ width: `${this.props.width}px`, height: `${this.props.height}px` }}>{this.renderContent()}</section>);
  }
}
export default Game;
