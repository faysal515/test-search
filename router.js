const express = require('express');

const user = require('./user');
const {validateFriendParams, validateSearchParams} = require('./validation')

const router = express.Router();
router.get('/search/:userId/:query', validateSearchParams, user.search);

router.get('/friend/:userId/:friendId', validateFriendParams, user.makeFriend);

router.get('/unfriend/:userId/:friendId', validateFriendParams, user.makeUnFriend);

module.exports = router;