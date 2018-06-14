import React from 'react';
import ReactDOM from 'react-dom';
import CEditor from '../../component/ceditor/';
import Character from '../../core/character';


Character.fetchAll().then((values) => {
  ReactDOM.render(<CEditor character={values[0]} />, document.getElementById('react'));
});
