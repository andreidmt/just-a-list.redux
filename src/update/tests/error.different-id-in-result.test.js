import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from "../.."

test("Update - different id in response", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "UPDATE-ERROR-DIFFERENT-ID_TODOS",
    read: () => [{ id: 1, name: "build gdpr startup" }, { id: 2 }],
    update: () => Promise.resolve({ id: 1, name: "updated different element" }),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  todos.set({ dispatch: store.dispatch })

  await todos.read()
  await todos.update(2, { name: "random" })

  const { items } = todos.selector(store.getState())

  t.deepEquals(
    items(),
    [{ id: 1, name: "updated different element" }, { id: 2 }],
    "Update should be done on the element with the id returned by .update, not the id that .update was called with"
  )

  t.end()
})
