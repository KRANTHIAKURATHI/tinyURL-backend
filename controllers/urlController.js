const DBconnect = require('../database/DBconnect');
const { nanoid } = require('nanoid');
const validateUrl = require('../utils/validateUrl');

exports.shortenUrl = async (req, res) => {
  const { original_url } = req.body;

  // Validate input
  if (!original_url) {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  if (!validateUrl(original_url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    const db = await DBconnect();
    const short_code = nanoid(8);

    await db.query(
      'INSERT INTO urls (original_url, short_code) VALUES (?, ?)',
      [original_url, short_code]
    );

    // For production, use environment variable for base URL
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${short_code}`;

    res.status(201).json({
      short_url: shortUrl,
      original_url,
      short_code,
      message: 'Short URL created successfully!'
    });
  } catch (err) {
    console.error('Error in shortenUrl:', err.message);
    res.status(500).json({ error: 'Something went wrong while shortening URL' });
  }
};

exports.redirectUrl = async (req, res) => {
  const { code } = req.params;

  try {
    const db = await DBconnect();
    const [rows] = await db.query(
      'SELECT original_url FROM urls WHERE short_code = ?',
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).send('Short URL not found');
    }

    await db.query('UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?', [
      code,
    ]);

    res.redirect(rows[0].original_url);
  } catch (err) {
    console.error('Error in redirectUrl:', err.message);
    res.status(500).send('Something went wrong while redirecting');
  }
};
