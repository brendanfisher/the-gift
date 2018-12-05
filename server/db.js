const config = require('./config');
const Sequelize = require('sequelize');
const dbModel = require('./dbModel');
const { Op } = Sequelize;

let sequelize, Gifts;

async function initialize() {
    sequelize = new Sequelize('thegift', config.dbUsername, config.dbPassword, {
        host: config.dbURL,
        dialect: 'mysql',
        operatorsAliases: false
    });

    Gifts = sequelize.define('gifts', dbModel);
    await Gifts.sync();
}

async function rateLimitExceeded(ip) {
    let tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    const giftsCreated = await Gifts.count({
        where: {
            createdBy: ip,
            createdAt: { [Op.gt]: tenMinutesAgo }
        }
    });

    return giftsCreated >= 4;
}

async function uploadGift(id, owner, ip) {
    await Gifts.create({
        id,
        owner,
        createdAt: new Date(),
        createdBy: ip,
        pageTitle: 'Happy Celebrations!'
    });
}

async function getGift(id) {
    return await Gifts.findByPk(id);
}

async function updateTitle(id, owner, newName) {
    const returned = await Gifts.update(
        { pageTitle: newName },
        { where: { id, owner } }
    );
    return returned[0] > 0;
}

module.exports = {
    initialize,
    rateLimitExceeded,
    uploadGift,
    getGift,
    updateTitle
}