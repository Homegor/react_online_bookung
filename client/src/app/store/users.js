import { createAction, createSlice } from "@reduxjs/toolkit"
import userService from "../services/user.service"
import authService from "../services/auth.service"
import localStorageService from "../services/localStorage.service"
import getRandomInt from "../utils/getRandomInt"
import history from "../utils/history"
import { generateAuthError } from "../utils/generateAuthError"

const initialState = localStorageService.getAccessToken()
  ? {
      entities: null,
      isLoading: true,
      error: null,
      auth: { userId: localStorageService.getUserId() },
      isLoggedIn: true,
      dataLoaded: false
    }
  : {
      entities: null,
      isLoading: false,
      error: null,
      auth: null,
      isLoggedIn: false,
      dataLoaded: false
    }

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    usersRequested: (state) => {
      state.isLoading = true
    },
    usersReceived: (state, action) => {
      state.entities = action.payload
      state.dataLoaded = true
      state.isLoading = false
    },
    usersRequestFiled: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },
    authRequestedSuccess: (state, action) => {
      state.auth = action.payload
      state.isLoggedIn = true
    },
    authRequestedFiled: (state, action) => {
      state.error = action.payload
    },
    userCreated: (state, action) => {
      if (!Array.isArray(state.entities)) {
        state.entities = []
      }
      state.entities.push(action.payload)
    },
    userLoggedOut: (state) => {
      state.entities = null
      state.isLoggedIn = false
      state.auth = null
      state.dataLoaded = false
    },
    userUpdateSuccess: (state, actions) => {
      state.entities[
        state.entities.findIndex((u) => u._id === actions.payload._id)
      ] = actions.payload
    }
  }
})

const { reducer: usersReducer, actions } = usersSlice
const {
  usersRequested,
  usersReceived,
  usersRequestFiled,
  authRequestedSuccess,
  authRequestedFiled,
  userCreated,
  userLoggedOut,
  userUpdateSuccess
} = actions

const authRequested = createAction("users/authRequested")
const userCreateRequested = createAction("users/userCreateRequested")
const createUserError = createAction("users/createUserError")
const userUpdateRequested = createAction("users/userUpdateRequested")
const userUpdateError = createAction("users/userUpdateError")

export const login =
  ({ payload, redirect }) =>
  async (dispatch) => {
    const { email, password } = payload
    dispatch(authRequested())
    try {
      const data = await authService.login({ email, password })
      dispatch(authRequestedSuccess({ userUd: data.localId }))
      localStorageService.setTokens(data)
      history.push(redirect)
    } catch (error) {
      const { code, message } = error.response.data.error
      if (code === 400) {
        const errorMessage = generateAuthError(message)
        dispatch(authRequestedFiled(errorMessage))
      } else {
        dispatch(authRequestedFiled(error.message))
      }
    }
  }
export const signUp =
  ({ email, password, ...rest }) =>
  async (dispatch) => {
    dispatch(authRequested())
    try {
      const data = await authService.register({ email, password })
      localStorageService.setTokens(data)
      dispatch(authRequestedSuccess({ userUd: data.localId }))
      dispatch(
        createUser({
          _id: data.localId,
          email,
          rate: getRandomInt(1, 5),
          completedMeetings: getRandomInt(0, 200),
          image: `https://avatars.dicebear.com/api/avataaars/${(
            Math.random() + 1
          )
            .toString(36)
            .substring(7)}.svg`,
          ...rest
        })
      )
    } catch (error) {
      dispatch(authRequestedFiled(error.message))
    }
  }

function createUser(payload) {
  return async function (dispatch) {
    dispatch(userCreateRequested())
    try {
      const { content } = await userService.create(payload)
      dispatch(userCreated(content))
      history.push("/users")
    } catch (error) {
      dispatch(createUserError(error.message))
    }
  }
}
export const loadUsersList = () => async (dispatch, getState) => {
  dispatch(usersRequested())
  try {
    const { content } = await userService.get()
    dispatch(usersReceived(content))
  } catch (error) {
    dispatch(usersRequestFiled(error.message))
  }
}
export const logOut = () => (dispatch) => {
  localStorageService.removeAuthData()
  dispatch(userLoggedOut())
  history.push("/")
}
export const updateUser = (payload) => async (dispatch) => {
  dispatch(userUpdateRequested())
  try {
    const { content } = await userService.update(payload)
    dispatch(userUpdateSuccess(content))
    history.push(`/users/${content._id}`)
  } catch (error) {
    dispatch(userUpdateError(error.message))
  }
}
export const getUsersList = () => (state) => state.users.entities
export const getUserById = (usersId) => (state) => {
  if (state.users.entities) {
    return state.users.entities.find((u) => u._id === usersId)
  }
}
export const getIsLoggedIn = () => (state) => state.users.isLoggedIn
export const getDataStatus = () => (state) => state.users.dataLoaded
export const getCurrentUserId = () => (state) => state.users.auth.userId
export const getCurrentUserData = () => (state) => {
  return state.users.entities
    ? state.users.entities.find((u) => u._id === state.users.auth.userId)
    : null
}
export const getUsersLoadingStatus = () => (state) => state.users.isLoading
export const getAuthErrors = () => (state) => state.users.error
export default usersReducer