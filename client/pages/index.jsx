import '../styles.scss';
import Dropzone from 'react-dropzone';
import ImageEditor from '../components/imageEditor';

export default class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            photo: null,
            width: null,
            height: null,
            showCropMessage: false
        };
    }

    onDrop(files) {
        if (files.length === 1) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => this.setState({
                    photo: img,
                    showCropMessage: true
                });
            };
            reader.readAsDataURL(files[0]);
        }
    }

    clearImage() {
        this.setState({
            photo: null,
            showCropMessage: false
        })
    }

    clearCropMessage() {
        this.setState({
            showCropMessage: false
        })
    }

    render() {
        return (
            <div className='container'>
                <div className='row'>
                    <h1>The Gift</h1>
                </div>
                <div className='row'>
                    <h6>Send your loved one The Gift today.</h6>
                </div>
                <div className='row'>
                    <div className='dropzone'>
                        <Dropzone
                            accept='image/jpeg, image/png'
                            multiple={false}
                            onDrop={this.onDrop.bind(this)}
                            disabled={this.state.photo !== null}
                        >
                            {
                                this.state.photo === null
                                    ? <p>Upload or drag an image of your face here.</p>
                                    : <ImageEditor photo={this.state.photo} onInteract={this.clearCropMessage.bind(this)} />
                            }
                        </Dropzone>
                    </div>
                </div>
                <div className='row'>
                    {
                        this.state.photo !== null &&
                        <>
                            <div className='col col-sm-6'>
                                <button type="button" className="btn btn-primary right-align">Create</button>
                            </div>
                            <div className='col col-sm-6'>
                                <button type="button" className="btn btn-danger" onClick={this.clearImage.bind(this)}>Cancel</button>
                            </div>
                        </>
                    }
                </div>
                <div className='row'>
                    <div className='col'>
                        {this.state.showCropMessage && <p>Drag and scroll your image to crop.</p>}
                    </div>
                </div>
            </div>
        );
    }
}