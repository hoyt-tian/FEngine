import React from 'react';
import ReactDOM from 'react-dom';
import Battle from '../../component/battle/index.jsx';
import Character from '../../core/character';
import Stage from '../../core/stage';
import { HD } from '../../util';
import './index.less';


HD(window);

Character.fetchAll().then((values) => {
  const p1 = values[0];
  p1.name = 'P1';
  const p2 = new Character(p1._config);
  p2.loadResources().then(() => {
    // values[0].flip = true
    p2.name = 'P2';

    const stage = new Stage({
      name: 'street',
      frames: [
        {
          imgUrl: './assets/stage/street.jpg',
          redrawCount: 2,
        },
      ],
      audioUrl: './assets/stage/street.mp3',
      horizontalOffset: 0,
    });

    stage.loadResources().then(() => {
      const config = {
        width: 800,
        height: 720,
        rotate: false,
        useJoystick: navigator && navigator.userAgent && ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'].some(v => navigator.userAgent.indexOf(v) > -1),
      };


      ReactDOM.render(<Battle {...config} stage={stage} p1={p1} p2={p2} showBlock showP1HP showP2HP />, document.getElementById('react'));
    });
  });
});

