const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
var sessionstorage = require('sessionstorage');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const { fileLoader } = require('ejs');


app.get('/customerlist', (req, res) => {
    res.render('customerlist');
});

app.post('/addCustomerForm', (req, res) => {
    res.render('addCustomer');
});

app.post('/addCustomer', (req, res) => {
    var token = sessionstorage.getItem('token'); // Get the Bearer token from the request headers
    console.log(req.body.first_name);
    const customerData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      street: req.body.street,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      email: req.body.email,
      phone: req.body.phone
    };
    console.log('Bearer ' + token);
    // Call the API to create a new customer
    request.post({
      url: 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=create',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token // Set the Bearer token in the request headers
      },
      body: JSON.stringify(customerData)
    }, (error, response, body) => {
      if (error) {
        // Handle error
        res.status(500).send('Error: ' + error.message);
      } else if (response.statusCode === 200) {
        // Print the response status code
        res.status(200).send('Customer created successfully');
      } else {
        // Display an error message
        res.status(response.statusCode).send('Failed to create customer');
      }
    });
  });

app.get('/displaycustomerlist', (req, res) => {
  var options = {
    'method': 'GET',
    'url': 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=get_customer_list',
    'headers': {
      'Authorization': 'Bearer dGVzdEBzdW5iYXNlZGF0YS5jb206VGVzdEAxMjM= '
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    // console.log(response.body);
    var data = JSON.parse(response.body);
    // console.log(data);
    res.render('customerlist', {data: data});
  });
  
});

app.post('/login', (req, res) => {
  const loginId = req.body.login_id;
  const password = req.body.password;

  // Call the API to authenticate the user
  request.post({
    url: 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      login_id: loginId,
      password: password
    })
  }, (error, response, body) => {
    if (error) {
      // Handle error
      res.status(500).send('Error: ' + error.message);
    } else if (response.statusCode === 200) {
      const data = JSON.parse(body);
      sessionstorage.setItem('token', data.access_token);
      console.log(data.access_token) // Get the bearer token from the response data
      // Redirect to the customer list page or display a success message
      res.redirect('/displaycustomerlist');
    } else {
      // Display an error message
      res.status(response.statusCode).send('Invalid login credentials');
    }
  });
});
app.get('/', function(req, res){
    res.render('login');

});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});