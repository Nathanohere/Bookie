const https = require('https');
const asyncHandler = require('express-async-handler');

exports.acceptPayment = asyncHandler(async (req, res) => {
  try {
    // request body from the clients
    const email = req.body.email;
    const amount = req.body.amount;
    // params
    const params = JSON.stringify({
      email: email,
      amount: amount * 100,
    });
    // options
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization:
          'Bearer sk_test_16f67f36df64f7eba5e6390f28aedefa7756e030', // where you place your secret key copied from your dashboard
        'Content-Type': 'application/json',
      },
    };
    // client request to paystack API
    const clientReq = https
      .request(options, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => {
          data += chunk;
        });
        apiRes.on('end', () => {
          return res.status(200).json(data);
        });
      })
      .on('error', (error) => {
        console.error(error);
      });
    clientReq.write(params);
    clientReq.end();
  } catch (error) {
    // Handle any errors that occur during the request
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

exports.statusPayment = asyncHandler(async (req, res) => {
  try {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/verify/:reference',
      method: 'GET',
      headers: {
        Authorization:
          'Bearer sk_test_16f67f36df64f7eba5e6390f28aedefa7756e030',
      },
    };

    https
      .request(options, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
          data += chunk;
        });

        apiRes.on('end', () => {
          return res.status(200).json(data);
        });
      })
      .on('error', (error) => {
        console.error(error);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});
