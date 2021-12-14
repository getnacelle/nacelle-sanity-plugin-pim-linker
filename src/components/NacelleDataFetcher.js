import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'

import { useHailFrequency, useInterval } from '../hooks'
import { SearchOptionsContext } from '../context'
import Gallery from './Gallery'

const NacelleResults = ({
  query,
  options,
  dataHandler,
  first,
  after,
  active,
  type
}) => {
  const data = useHailFrequency({
    query,
    options,
    dataHandler,
    first,
    after,
    type
  })
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
            value: entry.content.title
          }))
      )
    }
  }, [data, active, setSearchOptions])

  return data ? (
    <Gallery data={data} active={active} />
  ) : (
    <p>Loading{ellipses}</p>
  )
}

NacelleResults.propTypes = {
  query: PropTypes.string.isRequired,
  options: PropTypes.object,
  dataHandler: PropTypes.func,
  first: PropTypes.number,
  after: PropTypes.string,
  active: PropTypes.bool,
  type: PropTypes.oneOf(['products', 'productCollections']).isRequired
}

export default NacelleResults
