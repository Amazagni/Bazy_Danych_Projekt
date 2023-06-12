# Aplikacja webowa biblioteki
Marcin Chudy 

mchudy@student.agh.edu.pl

Adrian Madej

adrianmadej@student.agh.edu.pl

### Opis projektu:
Strona internetowa danej biblioteki. W bazie danych przechowywane są dane książek (wraz z jej autorami i wydawnictwami) oraz użytkowników danej biblioteki.

Użytkownik może przeglądać dostępne książki oraz je wypożyczać, ma również dostęp do swojej historii wypożyczeń.

Administrator może zatwierdziać zwrot danej książki.


### Technologie
MongoDB

Angular

Express

Node

### Uruchomienie aplikacji
#### Frontend
```sh
cd bd_project
npm install
ng serve --proxy-config proxy.conf.json
```
#### Backend
```sh
cd bd_project/backend
npm install
npm run dev
```
### Schemat bazy danych
Mamy 4 kolekcje:
author
```js
{"_id":{"$oid":"6460be09478e0704d8a9c19d"},
"FirstName":"Adam",
"LastName":"Mickiewicz",
"BooksID":[],
"Description":"Poeta, działacz polityczny, publicysta, filozof. Uważany za największego poetę polskiego romantyzmu."}
```
...


### Najważniejsze funkcje
#### Zwrot książki
```js
app.post('/return/:id', async (req, res) => {
  try {
    const BookID = parseInt(req.params.id);
    const uri = "mongodb+srv://marcinxkomputer:m4tB3SHDSzMIyhAg@cluster0.b1ip0ti.mongodb.net/";
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("library");

    const user = await db.collection('user').findOne({ 'Borrow.BookID': BookID, 'Borrow.ReturnDate': null })
    if (user) {
      const borrowedBook = user.Borrow.find((book) => book.BookID === BookID);
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
```
Na początku sprawdzam czy istnieje dany user, który wypożyczył daną książkę i czy ma aktualnie jakąkolwiek książkę do oddania. Jeśli istnieje to sprawdzam czy książką do oddania jest ta, której poszukujemy, jeśli tak to jest ona zwracana. W przeciwnym przypadku wyrzucany jest błąd.

#### Wypożyczenie książki
```js
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
```
Na początku sprawdzamy czy istnieje egzemplarz naszej ksiązki, który nie jest wypożyczony.
Jeśli istnieje, to oznaczamy go w bazie jako wypożyczonego oraz zapisujemy dany egzemplarz w historii danego uzytkownika.
