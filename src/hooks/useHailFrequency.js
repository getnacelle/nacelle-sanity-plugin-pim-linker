import { useState, useEffect } from 'react'

import useSWR from 'swr'
import fetch from 'isomorphic-unfetch'
import config from 'config:@nacelle/sanity-plugin-pim-linker'

const fetcher = async (query, first, after, spaceId, spaceToken) => {
  const res = await fetch('https://hailfrequency.com/v2/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-nacelle-space-id': spaceId,
      'x-nacelle-space-token': spaceToken
    },
    body: JSON.stringify({
      query,
      variables: { first, after }
    })
  }).then((res) => res.json())

  return res && res.data
}

export const useHailFrequency = ({
  query,
  dataHandler = (data) => data,
  first = 2000,
  after
}) => {
  const spaceId =
    config.nacelleSpaceId || process.env.SANITY_STUDIO_NACELLE_SPACE_ID
  const spaceToken =
    config.nacelleSpaceToken || process.env.SANITY_STUDIO_NACELLE_SPACE_TOKEN
  const { data, error } = useSWR(
    [query, first, after, spaceId, spaceToken],
    fetcher
  )
  const [nacelleData, setNacelleData] = useState([])

  useEffect(() => {
    if (error) {
      throw new Error(error)
    }

    setNacelleData(dataHandler(data))
  }, [data, dataHandler, error, spaceId, spaceToken])

  return nacelleData
}
