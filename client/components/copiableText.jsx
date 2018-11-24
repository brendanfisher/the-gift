import React from "react";

export default class CopiableText extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            highlighted: false
        };
        this.clickEvent = this.handleClickOutsideElement.bind(this);
        this.text = React.createRef();
        this.copy = React.createRef();
    }

    highlight(e) {
        const range = document.createRange();
        range.setStart(e.target, 0);
        range.setEndAfter(e.target);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        this.setState({ highlighted: true });
    }

    handleClickOutsideElement(e) {
        if (e.target !== this.text.current && e.target !== this.copy.current) {
            this.setState({ highlighted: false });
        }
    }

    componentDidMount() {
        document.addEventListener("click", this.clickEvent);
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.clickEvent);
    }

    copyText() {
        document.execCommand('copy');
    }

    render() {
        return (
            <span>
                <b onClick={this.highlight.bind(this)} ref={this.text}>{this.props.children}</b>
                {
                    this.state.highlighted
                    && <img src="../static/copy-regular.svg" className="icon" ref={this.copy} onClick={this.copyText.bind(this)} />
                }
            </span>
        );
    }
}