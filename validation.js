const Joi = require('joi');

// Validation schema for friend operations
const friendSchema = Joi.object({
  userId: Joi.number().integer().required(),
  friendId: Joi.number().integer().required().not(Joi.ref('userId')),
});

// Validation schema for search operation
const searchSchema = Joi.object({
  userId: Joi.number().integer().required(),
  query: Joi.string().required(),
});

// Validation middleware for friend operations
const validateFriendParams = (req, res, next) => {
  const result = friendSchema.validate(req.params);
  if (result.error) {
    res.status(400).json({
      success: false,
      error: result.error.details[0].message
    });
    return;
  }
  next();
};

// Validation middleware for search operation
const validateSearchParams = (req, res, next) => {
  const result = searchSchema.validate(req.params);
  if (result.error) {
    res.status(400).json({
      success: false,
      error: result.error.details[0].message
    });
    return;
  }
  next();
};


module.exports = {
  validateFriendParams, validateSearchParams
}