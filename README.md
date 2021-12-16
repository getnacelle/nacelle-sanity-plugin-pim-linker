# Sanity Custom Input Plugin: Nacelle PIM Linker

[Nacelle](https://docs.getnacelle.com/intro.html#what-is-nacelle) indexes data from your [PIM](https://en.wikipedia.org/wiki/Product_information_management) (e.g. Shopify, Magento) and CMS to power headless eCommerce projects. This plugin provides a [custom input component](https://www.sanity.io/docs/custom-input-widgets) for Sanity Studio that helps you reference product & collection data stored in Nacelle indices.

<details>
  <summary>Expand to see the custom input component in action!</summary>
  <img src="https://user-images.githubusercontent.com/5732000/105260780-65532a00-5b5c-11eb-9cc5-c5f8bddb89b4.gif" alt="The Nacelle PIM Linker component is used in Sanity Studio to select products stored in Nacelle's indices">
</details>

## Installation & Setup

### Install Peer Dependencies

`npm i @sanity/ui styled-components`

### Install the plugin

`sanity install @nacelle/sanity-plugin-pim-linker`

### Credentials

You'll need to provide the ID and Token associated with your Nacelle space. These credentials can be found in the [Nacelle Dashboard](https://dashboard.getnacelle.com/).

For a single space you can add these credentials in one of two ways:

#### in `./config/@nacelle/sanity-plugin-pim-linker.json`

```json
{
  "nacelleSpaceEndpoint": "your-nacelle-storefront-api-endpoint",
  "nacelleSpaceToken": "your-nacelle-graphql-token"
}
```

#### in `.env.development` / `.env.production`

```
SANITY_STUDIO_NACELLE_SPACE_ENDPOINT=your-nacelle-storefront-api-endpoint
SANITY_STUDIO_NACELLE_SPACE_TOKEN=your-nacelle-graphql-token
```

For multiple spaces you can add these credentials like this:

#### in `./config/@nacelle/sanity-plugin-pim-linker.json`

```json
"nacelleSpaces": [
    {
      "spaceName": "Space 1",
      "spaceEndpoint": "https://your-nacelle-storefront-api-endpoint",
      "spaceToken": "your-nacelle-graphql-token"
    },
    {
      "spaceName": "Space 2",
      "spaceEndpoint": "https://storefront.api.development.nacelle.com/graphql/v1/spaces/clever-owl-jr0WwlZv7L",
      "spaceToken": "2a74743f-7a00-4274-9cb6-2dfe15e89d47"
    }
  ]
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

---

## Contributing

Instructions for working on the repo directly.

### Testing Changes/Running Locally

The best way to test changes to this plugin is by using `npm link` to use it from a Sanity project with the plugin installed. The instructions for doing that should be below:

1. Open your local fork of this project in your terminal
2. Run `npm run build` to generate the dist files for this project locally.
3. Run `npm link` to setup an npm symlink for this project
4. (Optional) Run `npm run build -- --watch`, this will automatically rebuild whenever you make any local changes
5. In another terminal, navigate to an existing Sanity project which has this plugin installed. (If you don't have one, you can follow the instructions above to create one)
6. Run `npm link @nacelle/sanity-plugin-pim-linker` - this will link the version of the `@nacelle/sanity-plugin-pim-linker` in your local Sanity Project to your local clone of this repo. 
7. Run your command to start Sanity Studio, e.g. `npm run start`. You should see any changes you've made locally to this repo in your studio.
   - If you used the watch command in step 4, you should be able to make changes to this repo and then reload the page to see them reflected in the studio.
