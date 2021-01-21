# Sanity Custom Input Plugin: Nacelle PIM Linker

[Nacelle](https://docs.getnacelle.com/intro.html#what-is-nacelle) indexes data from your [PIM](https://en.wikipedia.org/wiki/Product_information_management) (e.g. Shopify, Magento) and CMS to power headless eCommerce projects. This plugin provides a [custom input component](https://www.sanity.io/docs/custom-input-widgets) for Sanity Studio that helps you reference product & collection data stored in Nacelle indices.

<details>
  <summary>Using the Nacelle PIM Linker Component</summary>
  <img src="https://user-images.githubusercontent.com/5732000/105260780-65532a00-5b5c-11eb-9cc5-c5f8bddb89b4.gif" alt="The Nacelle PIM Linker component is used in Sanity Studio to select products stored in Nacelle's indices">
</details>

## Installation & Setup

### Install Peer Dependencies

`npm i @sanity/ui styled-components`

### Install the plugin

`sanity install @nacelle/sanity-plugin-pim-linker`

### Credentials

You'll need to provide the ID and Token associated with your Nacelle space. These credentials can be found in the [Nacelle Dashboard](https://dashboard.getnacelle.com/).

You can add these credentials in one of two ways:

#### in `./config/@nacelle/sanity-plugin-pim-linker.json`

```json
{
  "nacelleSpaceId": "your-nacelle-space-id",
  "nacelleSpaceToken": "your-nacelle-graphql-token"
}
```

#### in `.env.development` / `.env.production`

```
SANITY_STUDIO_NACELLE_SPACE_ID=your-nacelle-space-id
SANITY_STUDIO_NACELLE_SPACE_TOKEN=your-nacelle-graphql-token
```

## Use in Schema Documents

Set the `type` field to `nacelleData` to use the custom input component:

```js
{
  name: 'handle',
  title: 'Handle',
  type: 'nacelleData',
}
```

### Options

By default, the custom input component allows you to choose a `handle` from either products or collections.

Realistically, you probably want to restrict the component to _either_ products or collections. To do that, provide either `['products']` or `['collections']` to `options.dataType`:

```js
// example: collections ONLY
{
  name: 'collectionHandle',
  title: 'Collection',
  type: 'nacelleData',
  options: {
    dataType: ['collections']
  }
}
```

```js
// example: products ONLY
{
  name: 'productHandle',
  title: 'Product',
  type: 'nacelleData',
  options: {
    dataType: ['products']
  }
}
```

### Using This Data in Your Frontend Project

Since this custom input component just stores the `handle` of a particular product or collection, you'll use the [Nacelle Client JS SDK](https://docs.getnacelle.com/api-reference/client-js-sdk.html) to fetch the associated product or collection object.

#### Product

```js
const product = await client.data.product({
  handle: 'handle-from-my-sanity-entry'
})
```

#### Collection

```js
const collection = await client.data.collection({
  handle: 'handle-from-my-sanity-entry'
})

const productHandles = collection.productLists[0].handles

const collectionProducts = await client.data.products({
  handles: productHandles
})
```
