const AWS = require('aws-sdk');
const ssm = new AWS.SSM();
const mongoose = require('mongoose');

const parserService = require('./services/parser.service.js');

exports.handler = async (event) => {
  await connectDatabase()
  await parserService.parseOlxData()

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Your function executed successfully!',
          input: event,
        },
        null,
        2
      ),
    };
  };
  
  async function connectDatabase() {
    const { ENV } = process.env;

    const ssmParamMongoDBConnectionName = `/olx-parser/${ENV}/MONGODB_URI`;
  
    const { Parameter: { Value: MONGODB_URI } } = await ssm
          .getParameter({ Name: ssmParamMongoDBConnectionName }).promise()

    try {
       await mongoose.connect(MONGODB_URI);

       console.log('Mongoose has been successfully connected!')
    } catch(err) {
      console.log(err)
    }
  }