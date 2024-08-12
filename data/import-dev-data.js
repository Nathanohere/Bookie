const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('../models/bookModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log('DB connection is successfull');
});

// READ JSON FILE

const books = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data.json`, 'utf-8')
);
// console.log('books', books);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Book.create(books);
    console.log('Data successfully loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Book.deleteMany();
    console.log('Data successfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
