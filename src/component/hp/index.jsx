import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './index.less';

class HP extends PureComponent {
  static propTypes = {
    max: PropTypes.number,
    val: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    flip: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string,
  }

  static defaultProps = {
    max: 100,
    val: 100,
    width: 100,
    height: 40,
    flip: false,
    style: {},
    className: '',
  }

  render() {
    const {
      className, max, val, width, height, flip, ...rest
    } = this.props;
    return (
      <div
        className={`hpbar ${className} ${flip && 'flip'}`}
        {...rest}
        style={{
            width: `${width}px`,
            height: `${height}px`,
            backgroud: 'red',
        }}
      >
        <div
          className={`innerValue ${flip && 'flip'}`}
          style={{
                width: `${Math.round((val / max) * 100)}%`,
                height: '100%',
                background: 'green',
            }}
        />
      </div>);
  }
}

export default HP;
