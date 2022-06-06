const { MongoClient } = require("mongodb");
const { mongodburi } = require("../config");

const uri = mongodburi;
const mongoClient = new MongoClient(
  uri,
  { useNewUrlParser: true },
  { autoIndex: false },
  { useUnifiedTopology: true }
);

module.exports = {
  connectDB: async (client) => {
    await mongoClient.connect();
    client.db = {};
    client.db.channels = await mongoClient.db().collection("channels");
    console.log("mongoDB is now connected!");
    return mongoClient;
  },
};
