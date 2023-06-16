const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
// const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ExpressError("Username and Password required", 404);
    }
    if (await User.authenticate(username, password)) {
      const token = jwt.sign({ username }, SECRET_KEY);
      User.updateLoginTimestamp(username);
      return res.json({ token });
    } else {
      throw new ExpressError("Invalid username/passsword", 400);
    }
  } catch (error) {
    return next(error);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function (req, res, next) {
  try {
    const { username, password, first_name, last_name, phone } = req.body;
    const user = await User.register({
      username,
      password,
      first_name,
      last_name,
      phone,
    });
    const token = jwt.sign({ username }, SECRET_KEY);
    User.updateLoginTimestamp(username);
    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
