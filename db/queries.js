const pool = require('./pool');

const getAllUsers = async () => {
  const { rows } = await pool.query('SELECT * FROM users');
  return rows;
}

const getUserByUsername = async (username) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return rows[0];
}

const getUserById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
}

const createUser = async (firstName, lastName, username, password, isMember, isAdminUser) => {
    await pool.query('INSERT INTO users (first_name, last_name, username, password, membership, is_admin) VALUES ($1, $2, $3, $4, $5, $6) ',
    [firstName, lastName, username, password, isMember, isAdminUser]
  );
}

const getUsersPosts = async () => {
  const { rows } = await pool.query(`SELECT users.username, posts.id, posts.user_id, posts.content, posts.created_at
                                      FROM users JOIN posts 
                                      ON users.id = posts.user_id `);
  return rows;
}

const getPostById = async (postId) => {
  const { rows } = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
  return rows[0];
}

const updateMembershipStatus = async (userId, isMember) => {
  await pool.query('UPDATE users SET membership = $1 WHERE id = $2', [isMember, userId]);
}

const updateAdminStatus = async (userId, isAdmin) => {
  await pool.query('UPDATE users SET is_admin = $1 WHERE id = $2', [isAdmin, userId]);
}

const createPost = async (userId, content) => {
  await pool.query('INSERT INTO posts (user_id, content) VALUES ($1, $2)', [userId, content]);
}

const deletePost = async (postId) => {
  await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
}

const editPost = async (postId, newContent) => {
  await pool.query('UPDATE posts SET content = $1 WHERE id = $2', [newContent, postId]);
}

module.exports = {
  getAllUsers,
  getUserByUsername,
  createUser,
  getUsersPosts,
  getUserById,
  updateMembershipStatus,
  updateAdminStatus,
  deletePost,
  editPost,
  createPost,
  getPostById
};