const app = require("./app");
const user = require("./user");

user.init().then(() => {
  console.log('server running.')
  app.listen(3001)
});