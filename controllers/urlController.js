const DBconnect = require('../database/DBconnect');
const { nanoid } = require('nanoid');
const validateUrl = require('../utils/validateUrl');

/*
|--------------------------------------------------------------------------
| CREATE SHORT URL
|--------------------------------------------------------------------------
*/
exports.shortenUrl = async (req, res) => {
  try {
    const { original_url } = req.body;

    // Validate input
    if (!original_url) {
      return res.status(400).json({
        error: 'Original URL is required'
      });
    }

    if (!validateUrl(original_url)) {
      return res.status(400).json({
        error: 'Invalid URL format'
      });
    }

    const db = await DBconnect();

    const short_code = nanoid(8);

    // Insert into database
    const [result] = await db.query(
      'INSERT INTO urls (original_url, short_code) VALUES (?, ?)',
      [original_url, short_code]
    );

    console.log("Inserted row ID:", result.insertId);

    // Use environment BASE_URL if set (recommended in production)
    const baseUrl =
      process.env.BASE_URL ||
      `${req.protocol}://${req.get('host')}`;

    const shortUrl = `${baseUrl}/${short_code}`;

    return res.status(201).json({
      success: true,
      short_url: shortUrl,
      original_url,
      short_code
    });

  } catch (err) {
    console.error("FULL ERROR IN shortenUrl:");
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    console.error("SQL Message:", err.sqlMessage);
    console.error("Stack:", err.stack);

    return res.status(500).json({
      success: false,
      error: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage
    });
  }
};


/*
|--------------------------------------------------------------------------
| REDIRECT SHORT URL
|--------------------------------------------------------------------------
*/
exports.redirectUrl = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).send("Short code is required");
    }

    const db = await DBconnect();

    const [rows] = await db.query(
      'SELECT original_url FROM urls WHERE short_code = ?',
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).send("Short URL not found");
    }

    // Increment clicks
    await db.query(
      'UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?',
      [code]
    );

    return res.redirect(rows[0].original_url);

  } catch (err) {
    console.error("FULL ERROR IN redirectUrl:");
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    console.error("SQL Message:", err.sqlMessage);
    console.error("Stack:", err.stack);

    return res.status(500).send("Something went wrong while redirecting");
  }
};