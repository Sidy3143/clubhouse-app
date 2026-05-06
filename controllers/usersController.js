const db = require("../db/queries");
const passport = require("passport");  
const bcrypt = require('bcryptjs');
const {body, validationResult, matchedData} = require("express-validator");

const validateUser = [
  body("first-name").notEmpty().withMessage("First name is required"),
  body("last-name").notEmpty().withMessage("Last name is required"),
  body("username").notEmpty().withMessage("Username is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("confirm-password").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

const validateLogin = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
  body("password").custom(async (value, { req }) => {
    const user = await db.getUserByUsername(req.body.username);
    const isMatch = user ? await bcrypt.compare(value, user.password) : false;
    if (!isMatch) {
      throw new Error("Invalid username or password");
    }
    return true;
  }),
];

async function createUserPost(req, res) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).render('sign-up-form', { errors: errors.array() });
  }
  
  const { "first-name": firstName, "last-name": lastName, username, password, "confirm-password": confirmPassword, "membership-code": membershipCode, "is-admin": isAdmin } = matchedData(req, { locations: ["body"] });
  
  const isMember = membershipCode === process.env.MEMBERSHIP_CODE;
  const isAdminUser = isAdmin === process.env.ADMIN_CODE;
  try {
    await db.createUser(firstName, lastName, username, password, isMember, isAdminUser);
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(500).render('sign-up-form', { errors: [{ msg: 'Error creating user. Username may already exist.' }] });
  }
}

async function createUserGet(req, res) {
  res.render('sign-up-form', { errors: [] });
}

async function loginUserGet(req, res) {
  res.render('login', { errors: [] });
}

async function loginUserPost(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).render('login', { errors: errors.array() });
  }
  
  passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: "/login",
  })(req, res, next);
}

async function logoutUser(req, res) {
  req.logout((err) => {
    if (err) { 
      return next(err); 
    }
    res.redirect('/');
  });
}

const validateMembershipCode = [
  body("membership-code").custom((value) => {
    if (value !== process.env.MEMBERSHIP_CODE) {
      throw new Error("Invalid membership code");
    }
    return true;
  }),
];

async function becomeMember(req, res) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).render('membership', { errors: errors.array() });
  }
  
  try {
    await db.updateMembershipStatus(req.user.id, true);
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(500).render('membership', { errors: [{ msg: 'Error updating membership status.' }] });
  }
}

const validateAdminCode = [
  body("admin-code").custom((value) => {
    console.log("Validating admin code:", value);
    console.log("Expected admin code:", process.env.ADMIN_CODE);

    if (value !== process.env.ADMIN_CODE) {
      throw new Error("Invalid admin code");
    }
    return true;
  }),
];

async function becomeAdmin(req, res) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).render('admin', { errors: errors.array() });
  }
  
  try {
    await db.updateAdminStatus(req.user.id, true);
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(500).render('admin', { errors: [{ msg: 'Error updating admin status.' }] });
  }
}

async function createPost(req, res) {
  const { content } = req.body;
  try {
    await db.createPost(req.user.id, content);
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error creating post.');
  }
}

async function editPost(req, res) {
  const { post_id, new_content } = req.body;
  try {
    await db.editPost(post_id, new_content);
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error editing post.');
  }
}

const editPostGet = async (req, res) => {
  const { post_id } = req.params;
  try {
    const post = await db.getPostById(post_id);
    res.render('post', { editingPost: post });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching post for editing.');
  }
}

async function deletePost(req, res) {
  const { post_id } = req.params;
  try {
    await db.deletePost(post_id);
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error deleting post.');
  }
}

module.exports = {
  validateUser,
  createUserPost,
  createUserGet,
  validateLogin,
  loginUserPost,
  loginUserGet,
  logoutUser,
  validateMembershipCode,
  becomeMember,
  validateAdminCode,
  becomeAdmin,
  createPost,
  editPost,
  deletePost,
  editPostGet
}