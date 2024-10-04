'use strict';

const winston = require("winston");
const fs = require("fs");
const path = require("path");

const currentdate = new Date().toJSON().slice(0, 10);
const tempcurrenttime = new Date().toJSON().slice(11, 19);
const currenttime = tempcurrenttime.replace(/:/g, "-");
const logfilename = currentdate;

// Define log directory paths
const logDirectory = path.join(__dirname, '../logs');
const exceptionDirectory = path.join(logDirectory, 'exceptions');

// Ensure log directories exist
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}
if (!fs.existsSync(exceptionDirectory)) {
    fs.mkdirSync(exceptionDirectory, { recursive: true });
}

// Check exception file size
const exceptionFilePath = path.join(exceptionDirectory, `exceptions_${logfilename}.log`);

fs.stat(exceptionFilePath, (error, stat) => {
    if (error) {
     console.log('No Exception file created for today');
    } else if (stat && stat.size > 10000000) {
        const newExceptionFilePath = path.join(exceptionDirectory, `exceptions_${logfilename}_${currenttime}.log`);
        fs.rename(exceptionFilePath, newExceptionFilePath, (err) => {
            if (err) {
                console.log('Error renaming exception file:', err);
            }
        });
    }
});

// Create a logger instance
const logger = winston.createLogger({
    transports: [
        new winston.transports.File({ 
            filename: path.join(logDirectory, `debug_${logfilename}.log`)
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ 
            filename: exceptionFilePath
        }),
    ],
    exitOnError: false
});

module.exports = logger;
