import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Block, { BlockType } from '../../core/block';
import { EventListener, p2rem } from '../../util';
import { Button, Anchor, List, Form, Input, Collapse, Badge } from 'antd';
import BlockEditor from './block';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/theme/github';
import './frame.less';

const last = {
  mouse: null,
};

const defaultState = {
  showOverlay: false,
  currentBlock: null,
  drawBlock: false,
  blockType: null,
  blocks: {},
};

class BlockDiv extends Component {
    attach = (ref) => {
      if (ref) {
        this.dom = ref;
      }
    }

    render() {
      const { block: b } = this.props;
      return (<div
        ref={this.attach}
        className="block"
        style={{
            width: `${p2rem(b.width)}`,
            height: `${p2rem(b.height)}`,
            left: `${p2rem(b.x)}`,
            top: `${p2rem(b.y)}`,
            border: `.01rem ${b.editing ? 'dashed' : 'solid'} ${Block.blockColor(b.type)}`,
        }}
      />);
    }
}

class FrameEditor extends Component {
    state = defaultState

    reset() {
      this.setState(defaultState);
    }

    attachCanvas = (el) => {
      if (el) {
        this.canvas = el;
        this.ctx = el.getContext('2d');
        this.redraw(this.props);
      }
    }

    componentWillReceiveProps(nextProps) {
      this.state.blocks = {};
      Block.addBlocks(this.props.frame.currentBlock({
        x: 0,
        y: this.canvas.height,
        width: this.props.frame.image.width,
        height: this.props.frame.image.height,
      }), this.state.blocks);
      this.redraw(nextProps);
    }

    redraw(props) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const { frame } = props;
      this.ctx.drawImage(
        frame.image,
        0,
        (this.canvas.height - frame.image.height) || 0,
      );


      this.ctx.strokeStyle = Block.blockColor(BlockType.target);
      this.ctx.strokeRect(0, this.canvas.height - frame.image.height, frame.image.width, frame.image.height);
    }

    drawAtt = () => {
      this.setState({
        showOverlay: true,
        drawBlock: true,
        blockType: BlockType.attack,
      });
    }

    drawDef = () => {
      this.setState({
        showOverlay: true,
        drawBlock: true,
        blockType: BlockType.defense,
      });
    }

    static createBlock(start, end, type) {
      const block = new Block({
        type, owner: null, x: 0, y: 0,
      });

      block.x = end.offsetX < start.offsetX ? end.offsetX : start.offsetX;
      block.y = end.offsetY < start.offsetY ? end.offsetY : start.offsetY;

      block.width = end.offsetX >= start.offsetX ? end.offsetX : start.offsetX;
      block.height = end.offsetY >= start.offsetY ? end.offsetY : start.offsetY;


      block.width -= block.x;
      block.height -= block.y;

      return (block.width > 0) && (block.height > 0) ? block : null;
    }

    attachOverlay = (ref) => {
      if (ref) {
        this.overlay = ref;
        EventListener.listen(ref, 'mousedown', (event) => {
          if (this.state.drawBlock) {
            this.setState({
              startEvent: event,
              currentBlock: null,
              lastMouse: event.timeStamp,
            });
          }
        });
        EventListener.listen(ref, 'mousemove', (event) => {
          if (this.state.drawBlock && this.state.startEvent && (event.timeStamp - last.mouse) > 100) {
            last.mouse = event.timeStamp;
            this.setState({
              currentBlock: FrameEditor.createBlock(this.state.startEvent, event, this.state.blockType),
            });
          }
        });

        EventListener.listen(ref, 'mouseup', (event) => {
          if (this.state.drawBlock) {
            last.mouse = null;
            this.setState({
              currentBlock: FrameEditor.createBlock(this.state.startEvent, event, this.state.blockType),
              drawBlock: false,
              startEvent: null,
            });
            this.state.currentBlock.oy = this.state.currentBlock.y - this.canvas.height;
          }
        });
      }
    }

    finishBlock = () => {
      Block.addBlocks(this.state.currentBlock, this.state.blocks);
      this.props.frame.__modified__ = true;
      this.setState({
        currentBlock: null,
        drawBlock: false,
        showOverlay: false,
        blocks: this.state.blocks,
      });
      // this.props.update()
    }

    cancelBlock = () => {
      this.setState({
        currentBlock: null,
        drawBlock: false,
        showOverlay: false,
      });
    }

    updateBlock = () => {
      this.props.frame.__modified__ = true;
      this.setState({
        blocks: this.state.blocks,
      });
      // this.props.update()
    }

    findRightbox = () => findDOMNode(this).querySelector('.frame-rightbox')

    save = () => {
      this.props.frame.attBlocks = this.state.blocks[BlockType.attack] || [];
      this.props.frame.defBlocks = this.state.blocks[BlockType.defense] || [];

      this.props.frame.attBlocks.forEach((b) => {
        b.y -= this.canvas.height;
      });

      this.props.frame.defBlocks.forEach((b) => {
        b.y -= this.canvas.height;
      });
    }

    render() {
      return (<section className="frame-editor">
        <section className="frame-content">
          <canvas className="frame-canvas" ref={this.attachCanvas} width="400" height="300" />
          <section
            className="frame-overlay"
            ref={this.attachOverlay}
            style={{
                    backgroundColor: this.state.showOverlay ? 'rgba(0,0,0,0.3)' : 'transparent',
                }}
          >
            {this.state.currentBlock && <div
              className="block"
              style={{
                        width: this.state.currentBlock.width,
                        height: this.state.currentBlock.height,
                        left: this.state.currentBlock.x,
                        top: this.state.currentBlock.y,
                        border: `.01rem dashed ${Block.blockColor(this.state.currentBlock.type)}`,
                    }}
            />}
            {this.state.blocks[BlockType.attack] && this.state.blocks[BlockType.attack].map((b, i) => <BlockDiv block={b} key={i} update={this.updateBlock} />)}
            {this.state.blocks[BlockType.defense] && this.state.blocks[BlockType.defense].map((b, i) => <BlockDiv block={b} key={i} update={this.updateBlock} />)}
          </section>
        </section>
        <section className="frame-rightbox" ref={this.attachBox}>
          <header>
            <Anchor affix={false} getContainer={this.findRightbox}>
              <Anchor.Link
                href="#att"
                title={
                  <div>攻击判定框
                    <span
                      className="block-counter"
                      style={{ backgroundColor: Block.blockColor(BlockType.attack) }}
                    >
                      {this.state.blocks[BlockType.attack] && this.state.blocks[BlockType.attack].length || 0}
                    </span>
                    <Button.Group>
                      <Button onClick={this.drawAtt} disabled={this.state.showOverlay}>创建</Button>
                      <Button disabled={!this.state.showOverlay || this.state.blockType !== BlockType.attack} onClick={this.finishBlock}>完成</Button>
                      <Button disabled={!this.state.showOverlay || this.state.blockType !== BlockType.attack} onClick={this.cancelBlock}>取消</Button>
                    </Button.Group>
                  </div>}
              />
              <Anchor.Link
                href="#def"
                title={
                  <div>防御判定框
                    <span
                      className="block-counter"
                      style={{ backgroundColor: Block.blockColor(BlockType.defense) }}
                    >
                      {this.state.blocks[BlockType.defense] && this.state.blocks[BlockType.defense].length || 0}
                    </span>
                    <Button.Group>
                      <Button onClick={this.drawDef} disabled={this.state.showOverlay}>创建</Button>
                      <Button disabled={!this.state.showOverlay || this.state.blockType !== BlockType.defense} onClick={this.finishBlock}>完成</Button>
                      <Button disabled={!this.state.showOverlay || this.state.blockType !== BlockType.defense} onClick={this.cancelBlock}>取消</Button>
                    </Button.Group>
                  </div>}
              />
            </Anchor>
          </header>
          <section>
            <a href="#att" />
            <List
              itemLayout="vertical"
              dataSource={this.state.blocks[BlockType.attack]}
              renderItem={(item, i) => (
                <List.Item
                  actions={[<a onClick={() => {
                                this.state.blocks[item.type].splice(i, 1);
                                this.updateBlock();
                            }}
                  >删除
                  </a>]}
                >
                  <List.Item.Meta
                    title={`攻击判定框${i + 1}`}
                  />
                  <BlockEditor block={item} update={this.updateBlock} />
                </List.Item>
                        )}
            />
          </section>
          <section>
            <a href="#def" />
            <List
              itemLayout="vertical"
              dataSource={this.state.blocks[BlockType.defense]}
              renderItem={(item, i) => (
                <List.Item
                  actions={[<a onClick={() => {
                                this.state.blocks[item.type].splice(i, 1);
                                this.updateBlock();
                            }}
                  >删除
                  </a>]}
                >
                  <List.Item.Meta
                    title={`防御判定框${i + 1}`}
                  />
                  <BlockEditor block={item} update={this.updateBlock} />
                </List.Item>
                        )}
            />
          </section>

          <Collapse bordered={false}>
            <Collapse.Panel header="动作帧执行代码">
              <AceEditor
                mode="javascript"
                theme="github"
                name="blah2"
                            // onLoad={this.onLoad}
                            // onChange={this.onChange}
                value={'function(test){console.log(\'test\')}'}
                fontSize={14}
                showPrintMargin
                showGutter
                highlightActiveLine
                setOptions={{
                                enableBasicAutocompletion: false,
                                enableLiveAutocompletion: false,
                                enableSnippets: false,
                                showLineNumbers: true,
                                tabSize: 2,
                            }}
              />
            </Collapse.Panel>
          </Collapse>

          <footer>
            <Button.Group>
              <Button type="primary" onClick={this.save}>保存变更{this.props.frame.__modified__ && <sup data-show="true" className="ant-scroll-number ant-badge-dot" />}</Button>
              <Button>重置设置</Button>
            </Button.Group>
          </footer>
        </section>
              </section>);
    }
}

export default FrameEditor;
