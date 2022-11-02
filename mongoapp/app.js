const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
   
const app = express();
const jsonParser = express.json();
 
const mongoClient = new MongoClient
("mongodb://localhost:27017/", { useUnifiedTopology: true });
 
let dbClient;
 
app.use(express.static(__dirname + "/public"));

// підключення до бази даних 
mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("booksdb")
    .collection("books");
    app.listen(3000, function(){
        console.log("Сервер чекає на підключення...");
    });
});

// для отримання книг
app.get("/api/books", function(req, res){
        
    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, books){
         
        if(err) return console.log(err);
        res.send(books)
    });
     
});
// для отримання книги
app.get("/api/books/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}, function(err, book){
               
        if(err) return console.log(err);
        res.send(book);
    });
});

// для додавання книги в базу даних
app.post("/api/books", jsonParser, function (req, res) {
       
    if(!req.body) return res.sendStatus(400);
       
    const bookName = req.body.name;
    const bookAuthor = req.body.author;
    const bookGenre = req.body.genre;
    const bookPages = req.body.pages; 
    const book = {name: bookName, author: bookAuthor, 
        genre: bookGenre, pages: bookPages};
       
    const collection = req.app.locals.collection;
    collection.insertOne(book, function(err, result){
               
        if(err) return console.log(err);
        res.send(book);
    });
});

// для вилучення книги із бази даних
app.delete("/api/books/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({_id: id}, function(err, result){
               
        if(err) return console.log(err);    
        let book = result.value;
        res.send(book);
    });
});

// для оновлення інформації про книгу
app.put("/api/books", jsonParser, function(req, res){
        
    if(!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);
    const bookName = req.body.name;
    const bookAuthor = req.body.author;
    const bookGenre = req.body.genre;
    const bookPages = req.body.pages; 
       
    const collection = req.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, { $set: {name: bookName, 
        author: bookAuthor, genre: bookGenre, pages: bookPages}},
         {returnOriginal: false },function(err, result){
               
        if(err) return console.log(err);     
        const book = result.value;
        res.send(book);
    });
});
 
// цей фрагмент очікує на завершення роботи (Ctrl+C) 
process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});
