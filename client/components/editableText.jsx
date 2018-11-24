export default class EditableText extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editing: false,
            updating: false,
            text: props.children,
            textChanges: props.children
        }
    }

    editText() {
        this.setState({ editing: true });
    }

    async saveChanges() {
        this.setState({ updating: true });

        const success = await this.props.onUpdate(this.state.textChanges);

        if (success) {
            // Change was successful
            this.setState((state, props) => ({
                updating: false,
                editing: false,
                text: state.textChanges
            }));
        } else {
            // Change was unsuccessful, revert
            this.setState((state, props) => ({
                updating: false,
                editing: false,
                textChanges: state.text
            }));
        }
    }

    cancelChanges() {
        this.setState((state, props) => ({
            editing: false,
            textChanges: state.text
        }));
    }

    changeText(e) {
        this.setState({ textChanges: e.target.value });
    }

    render() {
        if (this.state.editing) {
            return (
                <div className='centered'>
                    {
                        this.state.updating ? <p>Updating...</p> :
                        <>
                            <input
                                type='text'
                                onChange={this.changeText.bind(this)}
                                value={this.state.textChanges}
                                maxLength={24} />
                            <img src="../static/check-solid.svg" className="icon" onClick={this.saveChanges.bind(this)} />
                            <img src="../static/times-solid.svg" className="icon" onClick={this.cancelChanges.bind(this)} />
                        </>
                    }
                </div>
            );
        }
        return (
            <h1>
                {this.state.text}
                <img src="../static/edit-regular.svg" className="icon" onClick={this.editText.bind(this)} />
            </h1>
        );
    }
}