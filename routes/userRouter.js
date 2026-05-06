const {Router} = require("express");
const usersRouter = Router();
const db = require("../db/queries");

const usersController = require("../controllers/usersController");

usersRouter.get('/', async (req, res) => {
    const posts = await db.getUsersPosts();
    res.render('index', {user: req.user, posts: posts});
});

usersRouter.get('/sign-up', usersController.createUserGet);
usersRouter.post('/sign-up', usersController.validateUser, usersController.createUserPost);

usersRouter.get('/login', usersController.loginUserGet);
usersRouter.post('/login', usersController.validateLogin, usersController.loginUserPost);

usersRouter.get('/logout', usersController.logoutUser);

usersRouter.get('/become-member', (req, res) => {
  res.render('membership', { errors: null });
});
usersRouter.post('/become-member', usersController.validateMembershipCode, usersController.becomeMember);

usersRouter.get('/become-admin', (req, res) => {
  res.render('admin', { errors: null });
});
usersRouter.post('/become-admin', usersController.validateAdminCode, usersController.becomeAdmin);

usersRouter.get('/create-post', (req, res) => {
  res.render('post', { editingPost: null });
});
usersRouter.post('/create-post', usersController.createPost);

usersRouter.get('/edit-post/:post_id', usersController.editPostGet);
usersRouter.post('/edit-post', usersController.editPost);

usersRouter.post('/delete-post/:post_id', usersController.deletePost);

module.exports = usersRouter;