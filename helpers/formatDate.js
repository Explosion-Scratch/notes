const moment = require('moment');
const _$ = require("bijou.js");

module.exports = (date) => {
  return _$.capitalize(`${moment(date).format("MMMM Do YYYY")}, (${moment(date).fromNow()})`);
};