const AWS = require('aws-sdk');
const ssm = new AWS.SSM();
const { MongoClient, ServerApiVersion } = require('mongodb');

exports.handler = async (event) => {
  const { ENV } = process.env;

  const ssmParamMongoDBConnectionName = `/olx-parser/${ENV}/MONGODB_URI`;

  const { Parameter: { Value: MONGODB_URI } } = await ssm
        .getParameter({ Name: ssmParamMongoDBConnectionName }).promise()

  await connectDatabase(MONGODB_URI)

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Go Serverless v3.0! Your function executed successfully!',
          input: event,
        },
        null,
        2
      ),
    };
  };
  
  async function connectDatabase(uri) {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    try {
      await client.db("admin").command({ ping: 1 });

      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch(err) {
      await client.close();
    }

    return client
  }