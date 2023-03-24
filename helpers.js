
//returns the specific user based on email. 
//Input: email(email of the user), database(object where the users are stored)
const getUserByEmail = function(email, database) {
  for (let x in database) {
    if (database[x]['email'] === email) {
      return database[x].id;
    }
  }
};

function authenticateUser(req) {
  if (req.body.email === '' || req.body.password === '') {
    res.status(403).send('Sorry Invalid Credentials')
    return;
  }
  if (findUserBy(req, 'email') !== undefined) {
    res.status(403).send('Sorry an account with the same email already exist')
    return;
  }
}

module.exports = { getUserByEmail, authenticateUser }