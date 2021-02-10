import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from "../.."

// Dummy Error with api data inside
class RequestError extends Error {
  constructor(message, { body, status }) {
    super(`${status}:${message}`)

    this.name = "RequestError"
    this.status = status
    this.body = body
  }
}

test("Update - error", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "UPDATE-ERROR_TODOS",
    read: () => [{ id: 1, name: "build gdpr startup" }, { id: 2 }],
    update: (id, data) => {
      return id === 2
        ? Promise.reject(
            new RequestError("Something something API crash", {
              body: { message: "resource not found" },
              status: 404,
            })
          )
        : Promise.resolve({ id, ...data })
    },
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  todos.set({ dispatch: store.dispatch })

  await todos.read()

  try {
    await todos.update()
  } catch (error) {
    t.equals(
      error.message,
      `JustAList: "UPDATE-ERROR_TODOS".update ID param missing. Expected something, got "undefined"`,
      ".update called without valid id parameter should throw error"
    )
  }

  {
    const { error } = await todos.update(2, { name: "updated name" })

    t.deepEquals(
      error,
      todos.selector(store.getState()).error("update"),
      `Error data set to state equals error data the action promise resolves to`
    )

    t.deepEquals(
      {
        body: error.body,
        status: error.status,
      },
      {
        body: { message: "resource not found" },
        status: 404,
      },
      `Resolved error data same as slide data`
    )
  }

  {
    const { error } = await todos.update(1, { name: "updated name" })

    t.equals(
      todos.selector(store.getState()).error("update"),
      null,
      "State error is set to null after successfull delete"
    )

    t.equals(
      error,
      undefined,
      "Resolved error is null after successfull delete"
    )
  }

  try {
    await todos.update(10, { does: "not exist" })
  } catch (error) {
    t.equals(
      error.message,
      `JustAList: "UPDATE-ERROR_TODOS".update ID "10" does not exist`,
      "Calling .update with id that does not exist should throw error"
    )
  }

  t.end()
})
