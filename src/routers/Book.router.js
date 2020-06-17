const router=require('express').Router();
let Book =require('../models/Book');
let auth = require('../middleware/auth');
var fs = require('fs');
let img = require('../models/img');
// Book Router ----------------------------------------------------------------------
// GET All Books  ___________________________________
router.get('/',(req,res)=>{

    Book.find()
     .then(books=>res.json(books))
     .catch(err => res.status(400).json('Error : '+err));
});

// Get book By id ____________________________________
router.get('/:id',(req,res)=>{
    Book.findById(req.params.id)
     .then(book=>res.json(book))
     .catch(err => res.status(400).json('Error : '+err));
});

// Delete book By id -----------------------------------------
router.delete('/:id',auth,(req,res)=>{

    Book.findOneAndDelete(req.params.id)
     .then(()=>res.json('Book deleted'))
     .catch(err => res.status(400).json('Error : '+err));
});



// Add New Book
router.post('/add',(req,res)=>{
 
    const BookName = req.body.BookName;
    const BookAuther = req.body.BookAuther;
   const BookDes = req.body.BookDes;
   const BookPrice =req.body.BookPrice;
    var BookImg =new img ;
    BookImg.data = fs.readFileSync(req.body.BookImg);
    BookImg.contentType = 'image/png';
   
 
    const NewBook=new Book({
        BookName,
        BookAuther,
        BookDes,
        BookPrice,
        BookImg
    });
    NewBook.save()
    
    .then(Book =>res.json( Book + '\n'+'Book Added! '))
    .catch(err=> res.status(400).send('Error :'+err));
});

// Update Book --------------------------------------

router.patch('/update/:id',auth,(req,res)=>{
   
    Book.findById(req.params.id)
    .then(book =>{
        book.BookName = req.body.BookName;
        book.BookAuther = req.body.BookAuther;
        book.BookDes = req.body.BookDes;
        book.BookPrice =req.body.BookPrice;
        book.BookImg = req.body.BookImg;
        var a = new A;
        a.img.data = fs.readFileSync(req.body.BookImg);
        a.img.contentType = 'image/jpg';
        book.BookImg = a;

        book.save()
    .then(()=>res.json('book Updated'))
    .catch(err=>res.status(400).json('Error: '+err))
    })

    .catch(err=>res.status(400).json('Error : '+err));
});
//---------------------------------------------------------------------------------------------   

module.exports=router;