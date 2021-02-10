<!-- markdownlint-disable first-line-h1 line-length -->

[![CircleCI](https://circleci.com/gh/asd-xiv/state-list.svg?style=svg)](https://circleci.com/gh/asd-xiv/state-list)
[![npm version](https://badge.fury.io/js/%40asd14%2Fstate-list.svg)](https://badge.fury.io/js/%40asd14%2Fstate-list)
[![dev-badge](https://david-dm.org/asd-xiv/state-list.svg)](https://david-dm.org/asd-xiv/state-list)
[![Coverage Status](https://coveralls.io/repos/github/asd-xiv/state-list/badge.svg)](https://coveralls.io/github/asd-xiv/state-list)

# state-list

<!-- vim-markdown-toc GFM -->

* [Install](#install)
* [Example](#example)
* [Develop](#develop)
* [Changelog](#changelog)

<!-- vim-markdown-toc -->

## Install

```bash
npm install @asd14/state-list
```

## Example

Get Todo items from API and list them in React component.

`src/todos.list.js`

```js
import { buildList } from "@asd14/state-list"

export const TodosList = buildList({
  /**
   * Unique name used as Redux store key. Will throw if multiple lists use the 
   * same name. Slice is added on the root level of the Redux store.
   */
  name: "PAGE.SECTION.TODOS",

  /**
   * Define CRUD actions and map the internal items to one or more data sources
   * (local storage, 3rd party APIs or own API).
   *
   * Five actions can be defined: `create`, `read`, `readOne`, `update` and
   * `remove`.
   */
  create: data =>
    POST("/todos", data),

  read: () =>
    GET("/todos"),

  readOne: id =>
    GET("/comments", {
      query: { todoId: id },
    }).then(result => ({
      id,
      comments: result,
    })),

  update: (id, data) =>
    PATCH(`/todos/${id}`, date),

  remove: id =>
    DELETE(`/todos/${id}`),

  /**
   * Transformer function applyed on all list items before any reducers update
   * state (create, read, readOne, update or remove).
   *
   * Use for enforcing common transformations on external data, sorting,
   * JSON Schema checks etc.
   *
   * @param {Object[]} items All items inside list internal array
   */
  onChange: items => sortBy(prop("priority"), items)
})
```

`src/store.js` - Hook internal list reducers into the state store.

```js
import { createStore, combineReducers } from "redux"
import { TodosList } from "./todos.state"

const store = createStore(
  combineReducers({
    [TodosList.name]: TodosList.reducer,
  }),
)
```

`src/use-app-list.js` - Hook to simplify usage in Container components

```js
import { useDispatch, useSelector } from "react-redux"

export const useList = list => {
  // List actions dispatch to Redux store
  list.set({ dispatch: useDispatch() })

  return {
    selector: useSelector(list.selector),
    create: list.create,
    read: list.read,
    readOne: list.readOne,
    update: list.update,
    remove: list.remove,
    clear: list.clear,
  }
}
```

`src/todos.container.jsx` - Use list's selector to access the data

```js
import React, { useEffect } from "react"
import cx from "classnames"

import { useList } from "./use-list"
import { TodosList } from "./todos.state"

const TodosContainer = ({ projectId }) => {
  const {
    selector: { items, isLoading },
    read
  } = useList(TodosList)

  // data fetching
  useEffect(() => {
    read({ projectId })
  }, [projectId, read])

  return (
    <div
      className={cx({
        [css["todo--is-loading"]]: isLoading(),
      })}>
      {items().map(({ id, title }) => (
        <div key={id}>{title}</div>
      ))}
    </div>
  )
}
```

## Develop

```bash
git clone git@github.com:asd-xiv/state-list.git && \
  cd state-list && \
  npm run setup
```

Run all `*.test.js` in `src` folder

```bash
npm test
```

Watch `src` folder for changes and re-run tests

```bash
npm run tdd
```

## Changelog

See the [releases section](https://github.com/asd-xiv/state-list/releases) for details.
