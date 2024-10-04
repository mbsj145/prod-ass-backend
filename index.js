process['env']['NODE_ENV'] = process['env']['NODE_ENV'] || 'development';
require('dotenv').config({ path: `./.env.${process['env']['NODE_ENV']}` });

const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('./config/environment');
const database = require('./utils/connection');
const logger = require("./utils/logger");

const port_no = process.env.PORT || 4000;

const morganFormat = ":method :url :status :response-time ms";

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });

  
let app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('combined'));
app.use(limiter);
app.use(cors());
app.use(config['assets']);

app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => {
          const logObject = {
            method: message.split(" ")[0],
            url: message.split(" ")[1],
            status: message.split(" ")[2],
            responseTime: message.split(" ")[3],
          };
          logger.info(JSON.stringify(logObject));
        },
      },
    })
  );

database.getConnection();
require('./routes')(app);
require('./config/seed');

app.get('*', (req, res) => res.sendFile(config['view']));
app.use((err, req, res, next) => {
    logger.error(`Error occurred: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
});

let server = require('http').createServer(app);

server.listen(port_no, () => {
    logger.info(`Listening on port ${port_no} in ${process.env.NODE_ENV} environment`);
    console.log(`Listening on port ${port_no} in ${process.env.NODE_ENV} environment`);
  });
  