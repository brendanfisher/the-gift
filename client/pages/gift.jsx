import React from "react";
import '../styles.scss';

export default class Gift extends React.Component {
    static async getInitialProps({ query }) {
        return query;
    }

    render() {
        return (
            <div>
                The gift!
            </div>
        );
    }
}