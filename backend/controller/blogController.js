// controller/blogController.js
const pool = require('../db');

const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    const adminId = req.user.userId; // from JWT (admin)

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const image = req.files?.['image']?.[0]?.buffer || null;

    const [result] = await pool.query(
      'INSERT INTO blogs (title, image, content, admin_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      [title, image, content, adminId]
    );

    res.status(201).json({ message: 'Blog created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getBlogs = async (req, res) => {
  try {
    const adminId = req.user.userId;

    const [blogs] = await pool.query(
      'SELECT id, title, created_at FROM blogs WHERE admin_id = ? ORDER BY created_at DESC',
      [adminId]
    );

    res.json({ blogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFeaturedBlogs = async (req, res) => {
  try {
    const [blogs] = await pool.query(
      'SELECT id, title, image, created_at FROM blogs ORDER BY created_at DESC LIMIT 3'
    );

    const blogsWithImage = blogs.map(blog => ({
      ...blog,
      image: blog.image ? `data:image/jpeg;base64,${Buffer.from(blog.image).toString('base64')}` : null
    }));

    res.json({ blogs: blogsWithImage });
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const [blogs] = await pool.query(
      'SELECT id, title, content, image, created_at FROM blogs WHERE id = ?',
      [id]
    );

    if (blogs.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const blog = blogs[0];
    blog.image = blog.image ? `data:image/jpeg;base64,${Buffer.from(blog.image).toString('base64')}` : null;

    res.json({ blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateBlog = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const image = req.files?.['image']?.[0]?.buffer || null;

    const [existing] = await pool.query(
      'SELECT id FROM blogs WHERE id = ? AND admin_id = ?',
      [id, adminId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Blog not found or unauthorized' });
    }

    const updateFields = image ? 'title = ?, content = ?, image = ?' : 'title = ?, content = ?';
    const updateValues = image ? [title, content, image, id] : [title, content, id];

    await pool.query(
      `UPDATE blogs SET ${updateFields} WHERE id = ? AND admin_id = ?`,
      [...updateValues, adminId]
    );

    res.status(200).json({ message: 'Blog updated successfully' });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM blogs WHERE id = ? AND admin_id = ?',
      [id, adminId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Blog not found or unauthorized' });
    }

    await pool.query('DELETE FROM blogs WHERE id = ? AND admin_id = ?', [id, adminId]);

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createBlog, getBlogs, getFeaturedBlogs, getBlogById, updateBlog, deleteBlog };