export default class CopiableText extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <b>{this.props.children}</b>;
    }
}