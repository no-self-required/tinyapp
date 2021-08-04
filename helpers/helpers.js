const createNewUser = (userDatabase, userObject) => {
  const { id } = userObject;
  if (!userDatabase[id]) {
    userDatabase[id] = userObject
    return userObject
  }
  return null
}

// const findUser = (userDatabase, email) => {
//   const user = userDatabase[email] ? userDatabase[email] : {}

//   return user
// }

module.exports = { createNewUser }