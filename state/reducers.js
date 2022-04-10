import {
  GET_USER_DATA
} from "./actions";


/**
 * Reducer for the user branch of data in state screen.
 */
exports.userReducer = function(inState = {}, inAction) {

  switch (inAction.type) {

    case GET_USER_DATA : {
      // Store user basic data.
      return { ...inState, ...{ userData : inAction.payload.userData } };
    }

    default : { return inState; }

  } /* End switch. */

}; /* End userReducer(). */


