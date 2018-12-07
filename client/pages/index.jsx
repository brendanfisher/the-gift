import { submitFile } from '../api';
import Dropzone from 'react-dropzone';
import ImageEditor from '../components/imageEditor';
import Router from 'next/router';
import '../styles.scss';
import Footer from '../components/footer';

const WIDTH = 180;

export default class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            photo: null,
            photoData: null,
            width: null,
            height: null,
            showCropMessage: false,
            submitting: false,
            uploadFailed: false,
            editX: null,
            editY: null,
            editZoom: null
        };
    }

    onDrop(files) {
        if (files.length === 1) {
            this.setState({
                photo: null,
                photoData: files[0]
            });
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
            showCropMessage: false,
            uploadFailed: false
        });
    }

    clearCropMessage() {
        this.setState({
            showCropMessage: false,
            uploadFailed: false
        });
    }

    disabled() {
        return this.state.submitting;
    }

    getCropDimensions() {
        const width = this.state.editZoom * this.state.photo.width;
        const height = this.state.editZoom * this.state.photo.height;

        const left = (-this.state.editX + (width - this.state.photo.width) / 2) / this.state.editZoom;
        const top = (-this.state.editY + (height - this.state.photo.height) / 2) / this.state.editZoom;
        const dim = WIDTH / this.state.editZoom;

        return [left, top, dim];
    }

    async createGift() {
        if (this.state.photo === null) return;

        this.setState({
            submitting: true,
            showCropMessage: false,
            uploadFailed: false
        });
        
        const [left, top, width] = this.getCropDimensions();

        let response = {};
        try {
            response = await submitFile(this.state.photoData, left, top, width);
        } catch(e) {
            console.log(e);
        }
        if (response.success) {
            Router.push(`/gift/${response.giftID}?owner=${response.owner}`);
        } else {
            this.setState({
                submitting: false,
                uploadFailed: true
            });
        }
    }

    render() {
        return (
            <>
                <title>Send your loved one The Gift</title>
                <div className='container'>
                    <div className='row'>
                        <div className='col'>
                            <h1>The Gift</h1>
                            <h6>Send your loved one The Gift today.</h6>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='dropzone'>
                            <Dropzone
                                accept='image/jpeg, image/png'
                                multiple={false}
                                onDrop={this.onDrop.bind(this)}
                                disableClick={this.state.photo !== null}
                            >
                                {
                                    this.state.photo === null
                                        ? <p>Upload or drag an image of your face here.</p>
                                        : <ImageEditor
                                            photo={this.state.photo}
                                            disabled={this.disabled.bind(this)}
                                            onInteract={this.clearCropMessage.bind(this)}
                                            passToParent={this.setState.bind(this)} />
                                }
                            </Dropzone>
                        </div>
                    </div>
                    <div className='row'>
                        {
                            this.state.photo !== null &&
                            <>
                                <div className='col col-sm-6'>
                                    <button
                                        type="button"
                                        className="btn btn-primary right-align"
                                        disabled={this.state.submitting}
                                        onClick={this.createGift.bind(this)}>
                                        Create
                                    </button>
                                </div>
                                <div className='col col-sm-6'>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        disabled={this.state.submitting}
                                        onClick={this.clearImage.bind(this)}>
                                        Cancel
                                    </button>
                                </div>
                            </>
                        }
                    </div>
                    <div className='row'>
                        <div className='col'>
                            {this.state.showCropMessage && <p>Drag and scroll your image to crop.</p>}
                            {this.state.submitting && <p>Uploading...</p>}
                            {this.state.uploadFailed && <p className='red'>Upload failed.</p>}
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }
}