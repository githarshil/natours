const fs = require('fs');
const mongoose = require('mongoose');
// const { schema } = mongoose;
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourmodel');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
mongoose.connect(DB).then((con) => {
  // console.log(con.connections);
  console.log('DB connection successful!');
});
// read & parse the JSON file properly
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('data successfully loaded');
    process.exit(); // ← move inside here
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('data deleted successfully'); // ← add this
    process.exit(); // ← move inside here
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

if (process.argv[2] === '--import') {
  importData(); // ← no process.exit() here anymore
} else if (process.argv[2] === '--delete') {
  deleteData(); // ← no process.exit() here anymore
}
