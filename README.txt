We used the Express render method to respond to requests by sending back a template, along with an object containing the data the template needs.
We then used EJS to render this data to our web page. 
We used Express route parameters to pass data from our frontend to our backend via the request url. 
Finally, we created a partial template for our header so that we can have the code for it in one location, 
but render it on multiple pages

We first created a form that allowed a user to input a longURL and send that data to our API via a POST request. 
We then created a route that would render this form when the user visited /urls/new.
We also created a route to handle the POST requests from our form. 
We used the Express library's body parsing middleware to make the POST request body human readable and then finally we generated a random string to serve as our shortURL.