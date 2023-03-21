We learned how to create a web server that has different responses depending on which route you visit. 
Finally, we learned how to test our web server using both our browser and the command line utility curl.

We used the Express render method to respond to requests by sending back a template, along with an object containing the data the template needs.
We then used EJS to render this data to our web page. 
We used Express route parameters to pass data from our frontend to our backend via the request url. 
Finally, we created a partial template for our header so that we can have the code for it in one location, 
but render it on multiple pages

We first created a form that allowed a user to input a longURL and send that data to our API via a POST request. 
We then created a route that would render this form when the user visited /urls/new.
We also created a route to handle the POST requests from our form. 
We used the Express library's body parsing middleware to make the POST request body human readable and then finally we generated a random string to serve as our shortURL.

We first learned how to respond with a redirect after receiving a POST request. 
We generated a new short URL id and then redirected the user to this new url. \
We learned that when the browser receives a redirection response, it does another GET request to the url in the response. 
We created a new route for handling our redirect links; this route obtained the id from the route parameters, looked up the corresponding longURL from our urlDatabase, and responded with a redirect to the longURL. 
Finally, we tested that our new route is working as expected by making requests to it with the command line tool curl and our browser.

