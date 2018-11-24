import React from "react";
import { getGift } from '../api';
import Router from 'next/router';
import Error from './_error';
import Copy from '../components/copiableText';
import '../styles.scss';

export default class Gift extends React.Component {
    static async getInitialProps({ res, query }) {
        const response = await getGift(query.id, query.owner);
        return Object.assign({}, query, response);
    }

    constructor(props) {
        super(props);
        this.state = {
            editingTitle: false
        }
    }

    render() {
        if (!this.props.success) {
            return <Error />;
        }

        return (
            <div className='container'>
                <div className='row'>
                    <h1>{this.props.title}</h1>
                </div>
                <div className='row'>
                    {
                        this.props.videoURL ?
                            <video width='640' height='480' controls>
                                <source src={this.props.videoURL} />
                            </video> :
                            <div className='videoPlaceholder'>

                            </div>
                    }
                </div>
                <div className='row'>
                    <div className='col'>
                        <p>Share this Gift with your loved ones using this URL: <Copy>thegift.com/gift/{this.props.id}</Copy></p>
                    </div>
                </div>
            </div>
        );
    }
}