// import React from 'react';
// import ReactDOM from 'react-dom';

import { Tooltip, Collapse, Form, Select, InputNumber, DatePicker, Switch, Slider, Button } from 'antd';

// import './App.css';
// import './css/medium.css'
// import './css/style.css'
console.log("pls work");
// console.log(leaves);

// import './js/tree_parse'


// const { Option } = Select;



const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
const { Panel } = Collapse;

var tt = "Elaboration";



const test = <p>I'm a beautiful dropdown. I'm a beautiful dropdown. I'm a beautiful dropdown. I'm a beautiful dropdown. I'm a beautiful dropdown. I'm a beautiful dropdown. I'm a beautiful dropdown. </p>;


// Collapsible with custom inputs
// header: Header text
// bodytext: Body text
// tooltip: Tooltip
// id: id
// Can add class if we want
class CollapsibleSentence extends React.Component {
    render() {
        return (
            <Tooltip placement={"right"} title={this.props.tooltip}>
                <div>
                    <Collapse bordered={false} defaultActiveKey={['-1']} >
                        <Panel class="collapse-text" id={this.props.id} header={this.props.header} key="1" showArrow={false}>
                            <p >{this.props.bodytext}</p>
                        </Panel>
                    </Collapse>
                </div>
            </Tooltip>
        )
    }
}

// Standard paragraph text
// text: what you want it to say
// classname:
class ParagraphText extends React.Component {
    render(x) {
        return (
            <p style={this.props.style} className={this.props.classname + "dynamicText"}> {this.props.text} </p>
        )
    }
}

// have list input:


const App = () => {
    // Divs to output
    const divs = [];

    // Test header
    return(
        <CollapsibleSentence header={<p>Test. This is the header. This should look better when the sentence is longer. Lorem Ipsum Test. This is the header. This should look better when the sentence is longer. Lorem IpsumTest. This is the header. This should look better when the sentence is longer. Lorem IpsumTest. This is the header. This should look better when the sentence is longer. Lorem Ipsum</p>} bodytext="This should also look better when the sentence is longer. This should also look better when the sentence is longer. This should also look better when the sentence is longer." tooltip="This is tooltip" id="testaroni" />
    )

};
console.log("this ish running");
console.log(leaves);
// export default App;

ReactDOM.render(<App />, document.getElementById('root'));


