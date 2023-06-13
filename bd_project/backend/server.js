const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const port = 3080;
const userId = '6460d1e3ac388251224c6730';
app.use(bodyParser.json());
app.use(cors());
const uri = "mongodb+srv://marcinxkomputer:m4tB3SHDSzMIyhAg@cluster0.b1ip0ti.mongodb.net/";

app.get('/api/bookData', async (req, res) => {
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

    const bookData = await db.collection("book").aggregate(bookPipeline).toArray();

    res.json({ bookData });
  } catch (e) {
    console.error(e);
    res.json({ error: "Failed to retrieve data from database" });
  } finally {
    await client.close();
  }
});

app.get('/api/bookByAuthor/:id', async (req, res) => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("library");
  const name = req.params.id;
  const [firstName, lastName] = name.split('_');
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
      },      {
        $match: {
          "Author.FirstName": firstName,
          "Author.LastName": lastName
        }
      },
    ];

    const bookData = await db.collection("book").aggregate(bookPipeline).toArray();

    res.json({ bookData });
  } catch (e) {
    console.error(e);
    res.json({ error: "Failed to retrieve data from database" });
  } finally {
    await client.close();
  }
});

app.get('/api/userData', async (req, res) => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("library");
  try {
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

    const userData = await db.collection("user").aggregate(userPipeline).toArray();

    res.json({ userData });
  } catch (e) {
    console.error(e);
    res.json({ error: "Failed to retrieve data from database" });
  } finally {
    await client.close();
  }
});

app.get('/api/authorsData', async (req, res) => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("library");
  try {
    const authorsData = await db.collection('authors').aggregate([
      {
        $lookup: {
          from: 'book',
          localField: 'BooksID',
          foreignField: '_id',
          as: 'books'
        }
      }
    ]).toArray();

    res.json({ authorsData });
  } catch (e) {
    console.error(e);
    res.json({ error: "Failed to retrieve data from database" });
  } finally {
    await client.close();
  }
});

app.post('/api/borrow/:id', async (req, res) => {
  try {
    const _id = req.params.id;
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

app.post('/api/return/:id', async (req, res) => {
  try {
    const BookID = parseInt(req.params.id);
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("library");

    const user = await db.collection('user').findOne({ 'Borrow.BookID': BookID, 'Borrow.ReturnDate': null })
    if (user) {
      const borrowedBook = user.Borrow.find((book) => book.BookID === BookID && book.ReturnDate == null);
      if (borrowedBook == null) {
        console.log(borrowedBook)
        res.status(404).send('Nikt nie wypożyczył książki o takim ID.');
      }
      else {
      borrowedBook.ReturnDate = new Date();
      await db.collection('user').updateOne({ _id: user._id }, { $set: { Borrow: user.Borrow } });

      const returnedBook = await db.collection('book').findOne({ 'Copies.BookID': BookID });
      const copyIndex = returnedBook.Copies.findIndex((copy) => copy.BookID === BookID);

      returnedBook.InStock += 1;
      returnedBook.Copies[copyIndex].Available = true;

      await db.collection('book').updateOne(
        { _id: new mongoose.Types.ObjectId(returnedBook._id) },
        { $set: { InStock: returnedBook.InStock, Copies: returnedBook.Copies } }
      );
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

app.get('/api/checkStatus/:id', async (req, res) => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("library");
  const BookID = parseInt(req.params.id);
  try {
    let user = await db.collection('user').findOne({ 'Borrow.BookID': BookID, 'Borrow.ReturnDate': null });
    let borrowedBook = user;
    if (borrowedBook) {
      borrowedBook = borrowedBook.Borrow.find((book) => book.BookID === BookID && book.ReturnDate == null);
      borrowedBook.user = user._id
    }
    res.json({ borrowedBook });
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
