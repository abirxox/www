const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const Article = require('../models/articleModel');

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const AppError = require('../utils/appError');

//* multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

const upload = multer({ storage: storage });

//* add article
router.post(
  '/create',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  catchAsync(async (req, res, next) => {
    const article = {
      articleAuthor: req.body.author,
      articleTitle: req.body.title,
      articleContent: req.body.content,
      imageCover: {
        data: fs.readFileSync(
          path.join(
            __dirname + '/../public/uploads/' + req.files['image'][0].filename
          )
        ),
        //? why is contentType not showing on mongoDB json object
        contentType: 'image', 
      },
    };
    const doc = await Article.create(article);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  })
);

//* delete article
router.delete(
  '/delete/:id',
  catchAsync(async (req, res, next) => {
    // const btnDelete = req.body.btnDelete;

    const doc = await Article.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  })
);

module.exports = router;
