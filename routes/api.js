'use strict';
const bcrypt = require('bcrypt');
const { query, validationResult } = require('express-validator');
const likes_model = require('../db/likes_model');

async function fetch_stock_quote(stock) {
  const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
  if (!response.ok) {
    throw new Error(`HTTP error with status: ${response.status}`);
  }
  return await response.json();
}

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get([
      query('stock.*').isString().trim().escape(),
      query('like').optional().isBoolean().toBoolean()
    ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { stock, like } = req.query;
      if (!stock) {
        return res.json({
          error: 'Stock must be specified'
        });
      }
      if (!Array.isArray(stock)) {
        stock = [stock];
      }

      var ip_hash;
      if (like) {
        try {
          ip_hash = await bcrypt.hash(
            req.socket.remoteAddress,
            "$2b$10$nOUIs5kJ7naTuTFkBy1veu"
          );
        } catch (err) {
          return res.status(500).json({ error: 'Failed handling request' });
        }
      }

      var obj = [];
      for (let i = 0; i < stock.length; i++) {
        var data;
        try {
          data = await fetch_stock_quote(stock[i]);
        } catch (error) {
          console.error('Error fetching data:', error);
          return res.status(500).json({ error: 'Failed to fetch data from remote API' });
        }
        
        if (typeof data === 'string') {
          obj.push({ error: data });
        } else {
          const promise = like ? likes_model.addLike(stock[i], ip_hash)
                               : likes_model.getLikes(stock[i]);
          try {
            const likes = await promise;
            obj.push({ stock: stock[i], price: data.latestPrice, likes: likes });
            if (obj.length == 2) {
              obj[0].rel_likes = obj[0].likes - obj[1].likes;
              obj[1].rel_likes = obj[1].likes - obj[0].likes;
              delete obj[0].likes;
              delete obj[1].likes;
              return res.json({ stockData: obj });
            } else if (obj.length == stock.length) {
              return res.json({ stockData: obj[0] });
            }
          } catch(err) {
            return res.status(500).json({ error: 'Failed adding like' });
          };
        }
      }
    });
};
