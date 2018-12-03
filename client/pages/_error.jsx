import React from "react";
import '../styles.scss';

export default class Error extends React.Component {
    static getInitialProps({ res, err }) {
        const statusCode = res ? res.statusCode : err ? err.statusCode : null;
        return { statusCode }
    }

    render() {
        return (
            <div className='container'>
                <title>Page not found</title>
                <h1>Page not found</h1>
                <p><a href='/'>Return to upload page</a></p>
            </div>
        );
    }
}