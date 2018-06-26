import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import Character from '../../core/character';
import './gallery.less';

export default class Gallery extends Component {
  static propTypes = {
    characters: PropTypes.arrayOf(Object),
  }

  static defaultProps = {
    characters: [],
  }

  renderCharacter(character, i) {
    return <section className="gallery-item" key={i}><img className="avatar" src={character.avatar} alt={character.avatar || 'avatar'} /></section>;
  }

  render() {
    return (<section className="gallery">{this.props.characters.map((character, i) => this.renderCharacter(character, i))}</section>);
  }
}
