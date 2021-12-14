export const GET_PRODUCTS = `
query getProducts($first: Int, $after: String) {
  products(filter: {first: $first, after: $after}) {
  nacelleEntryId
    content {
      featuredMedia {
        thumbnailSrc
      }
      handle
      title
    }
      tags
      productType
      variants{
        content {
          title
        }
        sku

    }
  }
}`

export const GET_COLLECTIONS = `
query getCollections($first: Int, $after: String) {
	productCollections(filter: { first: $first, after: $after }) {
		nacelleEntryId
    content {
      title
      handle
    }
		products {
      nacelleEntryId
			content {
        title
        handle
        nacelleEntryId
				featuredMedia {
					id
					thumbnailSrc
				}
			}
		}
	}
}
`
