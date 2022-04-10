// Action types.  These must be unique in both name and value.
exports.GET_USER_DATA = "gud";


/**
 * For settings the user data.
 *
 * @param uData The userData object returned from DB.
 */
exports.getUserData = (uData) => {
  return {
    type : exports.GET_USER_DATA,
    payload : { userData : uData }
  };

}; /* getUserData(). */