const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const port = 3080;
const userId = '6460d1e3ac388251224c672f';
app.use(bodyParser.json());
app.use(cors());

// Retrieve data from MongoDB and send it back to the frontend
app.get('/api/data', async (req, res) => {
  const uri = "mongodb+srv://marcinxkomputer:m4tB3SHDSzMIyhAg@cluster0.b1ip0ti.mongodb.net/";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("library");
  try {
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
        $match: {
          _id: new mongoose.Types.ObjectId(userId)
        }
      },
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

app.post('/borrow/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const uri = "mongodb+srv://marcinxkomputer:m4tB3SHDSzMIyhAg@cluster0.b1ip0ti.mongodb.net/";
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("library");

    const Copy = await db.collection("book").aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(_id) } },
      { $unwind: '$Copies' },
      { $match: { 'Copies.Available': true } },
      { $sample: { size: 1 } }
    ]).toArray();

    if (Copy.length === 0) {
      res.status(404).send('Brak dostępnych egzemplarzy');
      return;
    }
    console.log(Copy[0].Copies.BookID)
    const result = await db.collection("book").updateOne(
      {
        _id: new mongoose.Types.ObjectId(_id),
        'Copies.BookID': Copy[0].Copies.BookID
      },
      {
        $inc: { InStock: -1 },
        $set: { 'Copies.$.Available': false }
      }
    );

    if (result.modifiedCount === 0) {
      res.status(404).send('Egzemplarz książki nie jest dostępny.');
    } else {
      await db.collection("user").updateOne(
        {_id: new mongoose.Types.ObjectId(userId)},
        { $push: {Borrow: {
          BookID: Copy[0].Copies.BookID,
          BorrowDate: new Date(),
          ReturnDate: null,
          ExpectedReturnDate: new Date(new Date().getTime() + (14 * 24 * 60 * 60 * 1000))
        }}})
      res.send('Książka została wypożyczona.');
    }

    client.close();
  } catch (err) {
    console.error('Błąd przy wypożyczaniu książki:', err);
    res.status(500).send('Wystąpił błąd przy wypożyczaniu książki.');
  }
});

app.post('/return/:id', async (req, res) => {
  try {
    const BookID = parseInt(req.params.id);
    const uri = "mongodb+srv://marcinxkomputer:m4tB3SHDSzMIyhAg@cluster0.b1ip0ti.mongodb.net/";
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("library");

    const user = await db.collection('user').findOne({ 'Borrow.BookID': BookID, 'Borrow.ReturnDate': null })
    console.log(user)
    if (user) {
      const borrowedBook = user.Borrow.find((book) => book.BookID === BookID);
      console.log(borrowedBook.ReturnDate)
      if (borrowedBook.ReturnDate != null) {
        res.status(404).send('Nikt nie wypożyczył książki o takim ID.');
      }
      else {
      borrowedBook.ReturnDate = new Date();
      await db.collection('user').updateOne({ _id: user._id }, { $set: { Borrow: user.Borrow } });
      res.send('Książka została zwrócona.');
      }}
    else {
      res.status(404).send('Nikt nie wypożyczył książki o takim ID.');
    }

    client.close();
  } catch (err) {
    console.error('Błąd podczas aktualizacji ReturnDate:', err);
  }
});


app.listen(port, () => {
  console.log(`Server listening on the port::${port}`);
});



