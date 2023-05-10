const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const port = 3080;

app.use(bodyParser.json());

// Retrieve data from MongoDB and send it back to the frontend
app.get('/api/data', async (req, res) => {
  const uri = "mongodb+srv://marcinxkomputer:m4tB3SHDSzMIyhAg@cluster0.b1ip0ti.mongodb.net/";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const collection = client.db("library").collection("books");
    const data = await collection.find().toArray();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.json({ error: "Failed to retrieve data from database" });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server listening on the port::${port}`);
});


// const {MongoClient} = require('mongodb');

// async function listDatabases(client){
//   databasesList = await client.db().admin().listDatabases();

//   console.log("Databases:");
//   databasesList.databases.forEach(db => console.log(` - ${db.name}`));
// };

// async function main(){

//   const uri = "mongodb+srv://marcinxkomputer:m4tB3SHDSzMIyhAg@cluster0.b1ip0ti.mongodb.net/";
//   const client = new MongoClient(uri);

//   try {
//       // Connect to the MongoDB cluster
//       await client.connect();

//       // Make the appropriate DB calls
//       await listDatabases(client);

//   } catch (e) {
//       console.error(e);
//   } finally {
//       await client.close();
//   }
// }

// main().catch(console.error);

