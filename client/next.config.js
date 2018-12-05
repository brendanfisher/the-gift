const withSass = require('@zeit/next-sass');
const webpack = require('webpack');

module.exports = withSass({
    webpack(config, options) {
        config.plugins.push(new webpack.DefinePlugin({
            API_LOCATION: JSON.stringify(process.env.API_LOCATION ? process.env.API_LOCATION : "http://localhost:8000"),
            WEBSITE_NAME: JSON.stringify(process.env.WEBSITE_NAME ? process.env.WEBSITE_NAME : "thegift.com"),
            USE_MOCK_API: process.env.USE_MOCK_API,
            'process.browser': 'true'
        }));
        return config;
    }
});