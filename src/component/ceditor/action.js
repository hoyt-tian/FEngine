import React, { Component } from 'react';
import { Card, Icon, Switch, Button, Tabs, Badge } from 'antd';
import Character from '../../core/character';
import Battle from '../battle/index.jsx';
import FrameEditor from './frame';
import './action.less';

export default class ActionEditor extends Component {
    state = {
      selected: 0,
      update: 0,
    }

    setBattle = (ref) => {
      if (ref) {
        ref.p1.controller.work = function (battle) {
          this.character.x = 0;
          battle.clearBg();
          battle.place(this.character);
          this.character.doAction(this, battle, this.character.status);
        };
      }
    }

    reset() {
      this.setState({
        selected: 0,
      });
      if (this.frameEditor) this.frameEditor.reset();
    }

    selectFrame = (evt) => {
      this.setState({
        selected: parseInt(evt.currentTarget.dataset.idx),
      });
    }

    preview = () => {
      this.setState({
        selected: -1,
      });
    }

    update = () => {
      this.setState({
        update: this.state.update + 1,
      });
    }

    attachFrameEditor = (ref) => {
      if (ref) this.frameEditor = ref;
    }

    render() {
      const { action, character, motion } = this.props;
      const loop = action.loop;
      const cancelable = action.cancelable;
      action.loop = true;
      action.cancelable = true;
      // character.speed = 0
      character.setStatus(motion);
      return (<section className="actionEditor">
        <section className="toolbar">
          <div className="toolbar-item"><label>总帧数</label><span>{action.frames.length}</span></div>
          <div className="toolbar-item"><label>单帧重绘设置</label><span>{action.duration instanceof Array ? '每帧单独设值' : `根据持续时间自动计算，持续${action.duration}毫秒，单帧重绘:${Math.ceil(action.duration / 1000 * 60 / action.total)}次`}</span></div>
          <div className="toolbar-item">  <Switch checked={cancelable === false} />不可打断</div>
          <div className="toolbar-item">  <Switch checked={loop} />自动循环</div>
          <div className="toolbar-item"><Button onClick={this.preview}>预览动作序列</Button></div>

        </section>
        <Tabs defaultActiveKey="edit" className="tabs">
          <Tabs.TabPane tab="编辑" key="edit">
            <FrameEditor ref={this.attachFrameEditor} frame={action.frames[this.state.selected]} update={this.update} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="预览" key="preview">
            <section className="canvas">
              <Battle character={this.props.character} width={400} height={300} ref={this.setBattle} />
            </section>
          </Tabs.TabPane>
        </Tabs>

        <section className="preview">
          {action.frames.map((frame, idx) => (<Card
            className={`frame-card ${(this.state.selected === idx) ? 'selected' : ''}`}
            key={idx}
            data-idx={idx}
            onClick={this.selectFrame}
            cover={<img src={frame.image.src} />}
          >
            <Card.Meta title={
                        frame.__modified__ ?
                          <Badge dot>{`第${idx + 1}帧`}</Badge>
                        : `第${idx + 1}帧`
                    }
            />
          </Card>))}
        </section>
      </section>);
    }
}
