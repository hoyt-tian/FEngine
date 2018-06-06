import React from 'react'
import ReactDOM from 'react-dom'
import Battle from '../../component/battle/index.jsx'
import Character from '../../core/character'
import Stage from '../../core/stage'
import './index.less'

Character.fetchAll().then( (values) => {
  values[0].name = 'P1'
  let p2 = new Character(values[0]._config)
  p2.loadResources().then(() => {
    // values[0].flip = true
    p2.name = 'P2'

    let stage = new Stage({
      "name": "street",
      "frames": [
        {
          "imgUrl": "./assets/stage/street.jpg",
          "redrawCount": 2
        }
      ],
      "audioUrl": null,
      "horizontalOffset": 0
    })

    stage.loadResources().then(() => {
      ReactDOM.render(<Battle height={720} stage={stage} character={values[0]} p2={p2} showP1HP={true} showP2HP={true}/>, document.getElementById('react'))
    })
  }) 
  
} )


