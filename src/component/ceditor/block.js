import React, { Component } from 'react';
import Block, { BlockType } from '../../core/block';
import { Button, Form, InputNumber, Collapse } from 'antd';
import { EventListener } from '../../util';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/theme/github';

class FInputNumber extends Component {
    attach = (ref) => {
      if (ref) {
        this.inputRef = ref.inputNumberRef.input;
        EventListener.listen(this.inputRef, 'focus', this.focus);
        EventListener.listen(this.inputRef, 'blur', this.blur);
      }
    }

    focus = () => {
      this.props.block.editing = true;
      this.props.update();
    }

    blur = () => {
      this.props.block.editing = false;
      this.props.update();
    }

    render() {
      const { block, update, ...rest } = this.props;
      return <InputNumber ref={this.attach} {...rest} />;
    }
}

class BlockEditor extends Component {
  render() {
    const { block: item, update } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (<Form layout="inline">
      <Form.Item label="宽度">
        {getFieldDecorator('width', {
                initialValue: item.width,
                normalize: val => parseInt(val),
                rules: [{
                    type: 'integer',
                    message: 'width must be an integer',
                }],
            })(<FInputNumber block={item} update={update} />)}
      </Form.Item>
      <Form.Item label="高度">
        {getFieldDecorator('height', {
                initialValue: item.height,
                normalize: val => parseInt(val),
                rules: [{
                    type: 'integer',
                    message: 'height must be an integer',
                }],
            })(<FInputNumber block={item} update={update} />)}
      </Form.Item>
      <Form.Item label="水平">
        {getFieldDecorator('x', {
                initialValue: item.x,
                normalize: val => parseInt(val),
                rules: [{
                    type: 'integer',
                    message: 'left must be an integer',
                }],
            })(<FInputNumber block={item} update={update} />)}
      </Form.Item>
      <Form.Item label="垂直">
        {getFieldDecorator('y', {
                initialValue: item.y,
                normalize: val => parseInt(val),
                rules: [{
                    type: 'integer',
                    message: 'top must be an integer',
                }],
            })(<FInputNumber block={item} update={update} />)}
      </Form.Item>
      <Form.Item label="偏移量">
        {getFieldDecorator('offsetY', {
                initialValue: item.oy + item.height || 0,
                normalize: val => parseInt(val),
                rules: [{
                    type: 'integer',
                    message: 'offset Y',
                }],
            })(<FInputNumber block={item} update={update} />)}
      </Form.Item>

      <Form.Item label="伤害">
        {getFieldDecorator('hurt', {
                initialValue: item.hurt || 0,
            })(<FInputNumber block={item} update={update} />)}
      </Form.Item>

      <Collapse bordered={false}>
        <Collapse.Panel header="判定框可执行代码">
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
            </Form>);
  }
}

export default Form.create({
  onFieldsChange: (props, fields) => {
    const { block, update } = props;
    Object.keys(fields).forEach((k) => {
      block[k] = fields[k].value;
    });
    update();
  },
})(BlockEditor);
