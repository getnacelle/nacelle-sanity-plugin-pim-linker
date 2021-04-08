import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'

import { useHailFrequency, useInterval } from '../hooks'
import { SearchOptionsContext } from '../context'
import Gallery from './Gallery'

const NacelleResults = ({ query, dataHandler, first, after, active }) => {
  const data = useHailFrequency({ query, dataHandler, first, after })
  const { setSearchOptions } = useContext(SearchOptionsContext)
  const [ellipses, setEllipses] = useState('.')

  useInterval(
    () =>
      ellipses.length < 3 ? setEllipses(ellipses + '.') : setEllipses('.'),
    400
  )

  useEffect(() => {
    if (active) {
      setSearchOptions(
        data &&
          data.map((entry) => ({
            ...entry,
            value: entry.title
          }))
      )
    }
  }, [data, active, setSearchOptions])

  return data && data.length ? (
    <Gallery data={data} active={active} />
  ) : (
    <p>Loading{ellipses}</p>
  )
}

NacelleResults.propTypes = {
  query: PropTypes.string.isRequired,
  dataHandler: PropTypes.func,
  first: PropTypes.number,
  after: PropTypes.string,
  active: PropTypes.bool
}

export default NacelleResults
