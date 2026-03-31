const http = require('http'); // Node built-in HTTP module

/* Build options for the internal API request */
const requestOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/trips',
  method: 'GET'
};

/* GET travel page - fetches trips from REST API and passes to HBS view */
const travel = (req, res) => {
  const apiReq = http.request(requestOptions, (apiRes) => {
    let body = '';
    // Accumulate response chunks
    apiRes.on('data', (chunk) => body += chunk);
    apiRes.on('end', () => {
      res.render('travel', {
        title: 'Travlr Getaways',
        trips: JSON.parse(body)
      });
    });
  });

  // Log any connection errors to the API
  apiReq.on('error', (err) => console.log('API request error: ', err));
  apiReq.end();
};

module.exports = { travel };