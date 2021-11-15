import React from 'react'

const HandleContext = React.createContext('')
const SearchOptionsContext = React.createContext([])
const SearchQueryContext = React.createContext('')
const SpaceOptionsContext = React.createContext(null)

export {
  HandleContext,
  SearchOptionsContext,
  SearchQueryContext,
  SpaceOptionsContext
}
