import { useState, useEffect } from 'react'

import useSWR from 'swr'
import fetch from 'isomorphic-unfetch'

const fetcher = async (query, first, after) => {
  const res = await fetch('https://hailfrequency.com/v2/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-nacelle-space-id': process.env.SANITY_STUDIO_NACELLE_SPACE_ID,
      'x-nacelle-space-token': process.env.SANITY_STUDIO_NACELLE_SPACE_TOKEN,
    },
    body: JSON.stringify({
      query,
      variables: { first, after },
    }),
  }).then((res) => res.json())

  return res && res.data
}

export const useHailFrequency = ({
  query,
  dataHandler = (data) => data,
  first = 2000,
  after,
}) => {
  const res = useSWR([query, first, after], fetcher)
  const [data, setData] = useState([])

  useEffect(() => {
    if (res.error) {
      throw new Error(res.error)
    }

    setData(dataHandler(res))
  }, [res, dataHandler])

  return data
}
