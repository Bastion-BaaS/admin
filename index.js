const express = require('express');
const mongoose = require('mongoose');

const instanceRoutes = require('./routes/instanceRouter');
const dbRoutes = require('./routes/dbRouter');
const dataRoutes = require('./routes/dataRouter');
const RulePriority = require('./models/listenerRulesPriority');

const PORT = 3001;

const test = (req, res, next) => {
  res.json({ test: 'hi' });
}

const env = (req, res, next) => {
  const envVars = {
    VpcId: process.env.VpcId,
    DBTierSubnet: process.env.DBTierSubnet,
    AppTierSubnet: process.env.AppTierSubnet,
    EFSSecurityGroup: process.env.EFSSecurityGroup,
    SGAppServer: process.env.SGAppServer,
    SGDBServer: process.env.SGDBServer,
    AppServerIAMRole: process.env.AppServerIAMRole,
    DBServerIAMRole: process.env.DBServerIAMRole,
    AppServerIAMRoleArn: process.env.AppServerIAMRoleArn,
    DBServerIAMRoleArn: process.env.DBServerIAMRoleArn,
    ALBListener: process.env.ALBListener,
    AppServerLG: process.env.AppServerLG,
  };
  res.json(envVars);
}

const db = (req, res, next) => {
  mongoose.connect('mongodb://localhost:27017')
    .then(() => {
      RulePriority.find({})
        .then(rulePriority => {
          if (rulePriority.length !== 0) {
            // if a rule priority exists, do nothing
            console.log('connected to mongo');
            res.json({ status: 'connected' })
          } else {
            // if no rule priority exists, make one with value of 2
            RulePriority.create({ Current: 2 })
              .then(() => {
                console.log('connected to mongo');
                res.json({ status: 'connected' });
              })
              .catch(err => {
                console.log(err);
                res.send(err);
              });
          }
        })
        .catch(err => {
          console.log(err);
          res.send(err);
        })
    })
    .catch(error => {
      console.log(error);
      res.send(error);
    });
}

const resetRulePriority = (req, res, next) => {
  RulePriority.deleteMany({})
    .then(result => res.json(result))
    .catch(err => {
      console.log(err);
      res.send(err);
    });
};

const app = express();
app.use(express.json());

app.get('/', test);
app.get('/admin/', test);
app.get('/admin/env', env);
app.get('/admin/db', db);
app.get('/admin/resetRulePriority', resetRulePriority);

app.use('/admin/instances', instanceRoutes);
app.use('/admin/db', dbRoutes);
app.use('/admin/data', dataRoutes);

// error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.code || 500).json({ error: err.message || "An unknown error occured" });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
