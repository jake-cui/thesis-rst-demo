// var React = require("react");

// console.log("react");
// console.log(leaves);
// console.log("this ish work?");

// var antd = require('antd');


// Text snippets is a list of text
var text_snippets = [];
for (var txt in leaves) {
    text_snippets.push(leaves[txt]["text"]);
}
console.log(text_snippets);

// import React from "react";

// import './node_modules/antd/dist/antd.js'

class Collapsable extends React.Component {

}

// antd.Collapsible

const highlight_text = {
    background: 'rgba(125, 255, 179, 0.3)'
};

// https://material-ui.com/components/tooltips/



// import {Collapse} from './node_modules/antd';
// ReactDOM.render(<Collapse />, document.getElementById('content'))

const ArticleText = props =>
{
    const divs = [];



    for (const text of text_snippets) {
        // divs.push(<p className="dynamicText"> {text} </p> );

        divs.push(<ParagraphText text={text} style={highlight_text}/>)
        // divs.push(<p className="dynamicText"> aye </p>)
    }
    return(
        <div>
        {divs}
        </div>
    )
};

class ParagraphText extends React.Component {
    render(x) {
        return (
            <p style={this.props.style} className="dynamicText"> {this.props.text} </p>
        )
    }
    mouseEnter() {
        // console.log('mouse enter')
        this.props.style = {background: 'rgba(125, 255, 179, 0.63)'}
    }

    mouseLeave() {
        // console.log('mouse leave')
        this.props.style = {background: 'rgba(125, 255, 179, 0.3)'}
    }
}
//
// var App = React.createClass({
//     render(){
//
//     },
//
//     renderSentence() {
//
//     },
//
//     renderCollapsible() {
//
//     }
// });

class Square extends React.Component {
    render() {
        return (
            <button className="square" onClick={function() { alert('click'); }}>
                {this.props.value}
            </button>
        );
    }
}

class Board extends React.Component {
    renderSquare(i) {
        return <Square value={i}/>;
    }

    render() {
        const status = 'Next player: X';

        return (
            <div>
                <div className="status">{status}</div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    render() {
        return (
            <div className="game">
                <div className="game-board">
                    <Board />
                </div>
                <div className="game-info">
                    <div>{/* status */}</div>
                    <ol>{/* TODO */}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <ArticleText />,
    document.getElementById('content')
);



