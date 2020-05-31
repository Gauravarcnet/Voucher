require('dotenv').config(); //using dotenv to separate secrets my source code

// reading port number from .env file otherwise by default is 1337
const port = process.env.PORT || 3000; 
const app = require('./app'); 
process.on('SIGINT', () => {  //when Ctrl+C in pressed i am exit app
  process.exit(1);
});

app.listen(port);
console.log(`Process ${process.pid} is listening to all incoming requests at: ${port}`);
