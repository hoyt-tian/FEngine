import React from 'react';
import ReactDOM from 'react-dom';
import Game from '../../component/game/index.jsx';
import './index.less';
import { HD } from '../../util';

HD(window);
ReactDOM.render(<Game jsonUrl="./assets/index.json" />, document.getElementById('react'));
