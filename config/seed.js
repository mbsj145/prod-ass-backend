// /**
//  * Populate DB with sample data on server start
//  * to disable, and set `seedDB: false`
//  */

// 'use strict';

const adminCollection = require('../api/user/user.model');

// /*  Create Marketplace Collection  */
adminCollection.findOne({ role: 'admin' }).exec(async (error, collectionFound) => {
    if (!collectionFound) {
        let collection1 = new adminCollection({
            "email": process.env.EMAIL,
            "password": process.env.PASSWORD,
            "role":"admin",
        });

        collection1.save((err, saved) => {
            if (saved) console.log('Admin created');
        });
    }
})