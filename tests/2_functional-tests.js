const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    test('Viewing one stock: GET request to /api/stock-prices/', function(done) {
        chai.request(server)
        .get('/api/stock-prices/')
        .query({ stock: "AMZN" })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData.stock, "AMZN");
            assert.exists(res.body.stockData.price, "Missing price");
            done();
        });
    });

    test('Viewing one stock and liking it: GET request to /api/stock-prices/', function(done) {
        chai.request(server)
        .get('/api/stock-prices/')
        .query({ stock: "GOOG", like: true })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData.stock, "GOOG");
            assert.exists(res.body.stockData.price, "Missing price");
            assert.equal(res.body.stockData.likes, 1);
            done();
        });
    });

    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
        chai.request(server)
        .get('/api/stock-prices/')
        .query({ stock: "GOOG", like: true })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData.stock, "GOOG");
            assert.exists(res.body.stockData.price, "Missing price");
            assert.equal(res.body.stockData.likes, 1);
            done();
        });
    });

    test('Viewing two stocks: GET request to /api/stock-prices/', function(done) {
        chai.request(server)
        .get('/api/stock-prices/')
        .query({ stock: ["GOOG", "TSLA"] })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData[0].stock, "GOOG");
            assert.exists(res.body.stockData[0].price, "GOOG Missing price");
            assert.equal(res.body.stockData[0].rel_likes, 1);
            assert.equal(res.body.stockData[1].stock, "TSLA");
            assert.exists(res.body.stockData[1].price, "TSLA Missing price");
            assert.equal(res.body.stockData[1].rel_likes, -1);
            done();
        });
    });

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function(done) {
        chai.request(server)
        .get('/api/stock-prices/')
        .query({ stock: ["GOOG", "TSLA"], like: true })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData[0].stock, "GOOG");
            assert.exists(res.body.stockData[0].price, "GOOG Missing price");
            assert.equal(res.body.stockData[0].rel_likes, 0);
            assert.equal(res.body.stockData[1].stock, "TSLA");
            assert.exists(res.body.stockData[1].price, "TSLA Missing price");
            assert.equal(res.body.stockData[1].rel_likes, 0);
            done();
        });
    });
});
