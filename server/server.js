'use strict';

const API_PORT = 6969;

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('./utilities/api_authentication').passport;

const app = express();
app.use(cors());
app.use(passport.initialize());

var jsonParser = bodyParser.json();
app.use(jsonParser);

const router = express.Router();

require('./routes/user').expose(router);
require('./routes/common').expose(router);
require('./routes/dev').expose(router);
require('./routes/customer').expose(router);
require('./routes/pm').expose(router);
require('./routes/email_verification').expose(router);
require('./routes/thirdpartyAPI').expose(router);

app.use('/pmApi', router);
app.listen(API_PORT, () => console.log('API SERVER LISTENING ON PORT %s', API_PORT));
