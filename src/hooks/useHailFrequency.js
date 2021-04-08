import { useState, useEffect } from 'react'

import useSWR from 'swr'
import fetch from 'isomorphic-unfetch'
import config from 'config:@nacelle/sanity-plugin-pim-linker'

async function fetchFromHailFrequency({
  query,
  first,
  nextToken,
  spaceId,
  spaceToken
}) {
  return await fetch('https://hailfrequency.com/v2/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-nacelle-space-id': spaceId,
      'x-nacelle-space-token': spaceToken
    },
    body: JSON.stringify({
      query,
      variables: { first, after: nextToken }
    })
  }).then((res) => res.json())
}

async function fetcher(query, spaceId, spaceToken) {
  let data = []
  let nextToken = ''
  let page = 1

  while (page === 1 || nextToken) {
    const res = await fetchFromHailFrequency({
      query,
      first: 1000,
      nextToken,
      spaceId,
      spaceToken
    })

    if (res && res.data) {
      const queryName = Object.keys(res.data).shift() // e.g. 'getProducts'
      const queryResults = res.data[queryName]

      if (queryResults && queryResults.items && queryResults.items.length) {
        data.push(...queryResults.items)
        nextToken = queryResults.nextToken
      } else {
        nextToken = ''
      }

      page += 1
    } else {
      nextToken = ''
    }
  }

  return data
}

/**
 * Fetch data from Nacelle's Hail Frequency API using non-batched queries
 * @param {Object} params - Parameters used to construct the request
 * @param {string} params.query - A single, non-batched query (do not combine, for example, `getProducts` and `getCollections` - these should be two separate queries)
 * @param {function(Object[]):Object[]} params.dataHandler - params.dataHandler - Data handler function that can be used to transform data returned from Nacelle's indices
 * @returns {Object[]} The data stored in Nacelle's indices
 */
export const useHailFrequency = ({ query, dataHandler = (data) => data }) => {
  const spaceId =
    config.nacelleSpaceId || process.env.SANITY_STUDIO_NACELLE_SPACE_ID
  const spaceToken =
    config.nacelleSpaceToken || process.env.SANITY_STUDIO_NACELLE_SPACE_TOKEN
  const { data, error } = useSWR([query, spaceId, spaceToken], fetcher)
  const [nacelleData, setNacelleData] = useState([])

  useEffect(() => {
    if (error) {
      throw new Error(error)
    }

    setNacelleData(dataHandler(data))
  }, [data, dataHandler, error, spaceId, spaceToken])

  return nacelleData
}
