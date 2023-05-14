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
    const db = client.db("library");

    const pipeline = [
      {
        $lookup: {
          from: "authors",
          localField: "AuthorID",
          foreignField: "_id",
          as: "authors"
        }
      },
      {
        $unwind: "$authors"
      }
    ];

    const data = await db.collection("book").aggregate(pipeline).toArray();
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

// const { MongoClient } = require('mongodb');
// const express = require('express');
// const app = express();
// const bodyParser = require("body-parser");
// const port = 3080;

// app.use(bodyParser.json());

// // Retrieve data from MongoDB and send it back to the frontend
// app.get('/api/data', async (req, res) => {
//   const uri = "mongodb+srv://marcinxkomputer:m4tB3SHDSzMIyhAg@cluster0.b1ip0ti.mongodb.net/";
//   const client = new MongoClient(uri);

//   try {
//     await client.connect();
//     const collection = client.db("library").collection("book");
//     const data = await collection.find().toArray();
//     res.json(data);
//   } catch (e) {
//     console.error(e);
//     res.json({ error: "Failed to retrieve data from database" });
//   } finally {
//     await client.close();
//   }
// });

// app.listen(port, () => {
//   console.log(`Server listening on the port::${port}`);
// });



