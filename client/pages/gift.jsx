import React from "react";

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