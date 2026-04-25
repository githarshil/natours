const mongoose = require('mongoose');
// const { schema } = mongoose;
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
mongoose.connect(DB).then((con) => {
  // console.log(con.connections);
  console.log('DB connection successful!');
});
const port = 2000;
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
