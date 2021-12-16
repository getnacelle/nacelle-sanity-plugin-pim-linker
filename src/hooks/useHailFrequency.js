import { useState, useEffect } from 'react'

import useSWR from 'swr'
import fetch from 'isomorphic-unfetch'
import config from 'config:@nacelle/sanity-plugin-pim-linker'

async function fetchFromHailFrequency({
  query,
  first,
  nextToken,
  spaceId,
  spaceToken,
  endpoint
}) {
  return await fetch(endpoint, {
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

async function fetcher(query, spaceId, spaceToken, endpoint, type) {
  let data = []
  let nextToken = ''
  // fetch the data as long as there's more
  // use a do_while loop since we need to fetch at least 1 time
  do {
    const res = await fetchFromHailFrequency({
      query,
      first: 1000,
      spaceId,
      spaceToken,
      nextToken,
      endpoint
    })

    let queryResults = res?.data?.[type]

    if (queryResults?.length) {
      data.push(...queryResults)
      // since Warp2 currently doesn't have a nextToken,
      // if we get back as many entries as we requested, set the afterto the id of the last entry
      if (queryResults.length == 1000) {
        nextToken = queryResults[999]?.nacelleEntryId
      } else {
        nextToken = ''
      }
    } else {
      nextToken = ''
    }
  } while (nextToken)
  return data ?? []
}

/**
 * Fetch data from Nacelle's Hail Frequency API using non-batched queries
 * @param {Object} params - Parameters used to construct the request
 * @param {string} params.query - A single, non-batched query (do not combine, for example, `getProducts` and `getCollections` - these should be two separate queries)
 * @param {function(Object[]):Object[]} params.dataHandler - params.dataHandler - Data handler function that can be used to transform data returned from Nacelle's indices
 * @returns {Object[]} The data stored in Nacelle's indices
 */
export const useHailFrequency = ({
  query,
  options,
  type,
  dataHandler = (data) => data
}) => {
  let spaceId =
    options?.spaceToken ??
    config.nacelleSpaceId ??
    process.env.SANITY_STUDIO_NACELLE_SPACE_ID
  let spaceToken =
    options?.spaceToken ??
    config.nacelleSpaceToken ??
    process.env.SANITY_STUDIO_NACELLE_SPACE_TOKEN
  const endpoint =
    options?.spaceEndpoint ??
    config.nacelleEndpoint ??
    process.env.SANITY_STUDIO_NACELLE_ENDPOINT

  const { data, error } = useSWR(
    [query, spaceId, spaceToken, endpoint, type],
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
