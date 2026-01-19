// Validators barrel exports
const orderValidator = require("./orderValidator");
const productValidator = require("./productValidator");
const userValidator = require("./userValidator");

module.exports = {
  ...orderValidator,
  ...productValidator,
  ...userValidator,
};
