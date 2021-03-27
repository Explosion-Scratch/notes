const moment = require('moment');

module.exports = (date) => {
  return moment(date).format('MMMM Do YYYY, h:mm:ss a');
};