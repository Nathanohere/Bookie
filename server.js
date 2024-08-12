const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

// const Book = require('./models/bookModel');

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log('DB connection is successfull');
});

// const books = JSON.parse(
//   fs.readFileSync(`${__dirname}/data/dev-data.json`, 'utf-8')
// );
// console.log('books', books);

// const importData = async () => {
//   try {
//     await Book.create(books);
//     console.log('Data successfully loaded');
//   } catch (error) {
//     console.log(error);
//   }
// };

// importData();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
