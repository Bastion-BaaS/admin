const mongoose = require('mongoose');
const RulePriority = require('../models/listenerRulesPriority');

const configureMongo = (env, user, password, host, port, dbName) => {
  mongoose.connection.on('error', err => {
    console.error(`Mongoose Error: ${err}`);
  });

  if (env === 'production') {
    mongoose.set('debug', { color: false, shell: true });
  } else {
    mongoose.set('debug', { color: true, shell: true });
  }
  const connectionURL = `mongodb://${user}:${password}@${host}:${port}/${dbName}?authSource=admin`;

  mongoose.connect(connectionURL)
    .then(() => console.log(`Connected to MongoDB: ${dbName}`))
    .catch(err => console.error(`Failed to connect to MongoDB: ${connectionURL} \n error: ${err}`));
};

const setRulePriority = async () => {
  let result;

  try {
    const rulePriority = await RulePriority.find({})
    if (rulePriority.length !== 0) {
      // if a rule priority exists, do nothing
      console.log(`Rule priority is checked. It was: ${rulePriority}`);
      result = 'connected';
    } else {
      // if no rule priority exists, make one with value of 2
      await RulePriority.create({ Current: 2 })
      console.log('Rule priority is set');
      result = 'connected';
    }
  } catch(err) {
    result = err;
  }

  return result;
};

module.exports = { configureMongo, setRulePriority }