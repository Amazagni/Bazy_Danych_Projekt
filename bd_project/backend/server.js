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

    const bookPipeline = [
      {
        $lookup: {
          from: "authors",
          localField: "AuthorID",
          foreignField: "_id",
          as: "Author"
        }
      },
      {
        $unwind: "$Author"
      },
    ];

    const userPipeline = [
      {
        $unwind: "$Borrow"
      },
      {
        $lookup: {
          from: "book",
          localField: "Borrow.BookID",
          foreignField: "Copies.BookID",
          as: "Borrow.bookDetails"
        }
      },
      {
        $unwind: "$Borrow.bookDetails"
      },
      {
        $group: {
          _id: "$_id",
          username: { $first: "$username" },
          borrowedBooks: { $push: "$Borrow" }
        }
      }
  ]

    const bookData = await db.collection("book").aggregate(bookPipeline).toArray();

    const userData = await db.collection("user").aggregate(userPipeline).toArray();

    res.json({ bookData, userData });
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



