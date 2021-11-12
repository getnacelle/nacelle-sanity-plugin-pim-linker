import React, { useState, useEffect, useCallback, useContext } from 'react'
import PropTypes from 'prop-types'

import PatchEvent, { set, unset } from 'part:@sanity/form-builder/patch-event'
import FormField from 'part:@sanity/components/formfields/default'
import { useId } from '@reach/auto-id'

import config from 'config:@nacelle/sanity-plugin-pim-linker'

import {
  ThemeProvider,
  studioTheme,
  Box,
  TextInput,
  Button,
  Dialog,
  Select,
  Tab,
  TabList,
  Autocomplete,
  Stack,
  Flex
} from '@sanity/ui'
import NacelleDataFetcher from './NacelleDataFetcher'
import { GET_PRODUCTS, GET_COLLECTIONS } from '../queries'
import {
  HandleContext,
  SearchOptionsContext,
  SearchQueryContext,
  SpaceOptionsContext
} from '../context'

const createPatchFrom = (value) =>
  PatchEvent.from(value === '' ? unset() : set(value))

const NacelleData = ({ dataType, active }) => {
  const { spaceOptions } = useContext(SpaceOptionsContext)

  switch (dataType) {
    case 'products':
      return (
        <NacelleDataFetcher
          query={GET_PRODUCTS}
          options={spaceOptions}
          className="tabContent"
          active={active}
        />
      )
    case 'collections':
      return (
        <NacelleDataFetcher
          query={GET_COLLECTIONS}
          options={spaceOptions}
          className="tabContent"
          active={active}
        />
      )
  }
}

NacelleData.propTypes = {
  dataType: PropTypes.string.isRequired,
  active: PropTypes.bool
}

const SearchIcon = () => (
  <svg
    data-sanity-icon="search"
    width="1em"
    height="1em"
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="10.5"
      cy="10.5"
      r="5"
      stroke="currentColor"
      strokeWidth="1.2"
    ></circle>
    <path d="M14 14L20 20" stroke="currentColor" strokeWidth="1.2"></path>
  </svg>
)

const Interface = ({
  dataType,
  interfaceOpen,
  children,
  activeTab,
  setActiveTab
}) => {
  const { spaceOptions, setSpaceOptions } = useContext(SpaceOptionsContext)

  const dataTypes = Array.isArray(dataType) ? dataType.sort() : [dataType]
  const multiTab = dataTypes.length > 1

  const multiSelect =
    Array.isArray(config.nacelleSpaces) &&
    config.nacelleSpaces.length > 1 &&
    config.nacelleSpaces.some((s) => s.spaceId && s.spaceToken && s.spaceName)

  const onSelect = (e) => {
    const activeSpace = config.nacelleSpaces.find(
      (space) => space.spaceId == e.target.value
    )
    setSpaceOptions(activeSpace)
  }

  return (
    <Box style={{ display: interfaceOpen ? 'block' : 'none' }} padding={4}>
      {multiSelect && (
        <Select
          className="select"
          onChange={onSelect}
          defaultValue={spaceOptions.spaceId}
        >
          {config.nacelleSpaces.map((space, idx) => (
            <option value={space.spaceId} key={`${space.spaceId}-${idx}`}>
              {space.spaceName}
            </option>
          ))}
        </Select>
      )}
      {multiTab && (
        <TabList className="tab">
          {dataTypes.map((type, idx) => (
            <Tab
              key={type}
              label={type}
              aria-controls={`${type}-panel`}
              selected={idx === activeTab}
              className="tablinks"
              onClick={() => setActiveTab(idx)}
              space={2}
            />
          ))}
        </TabList>
      )}
      {children}
    </Box>
  )
}

Interface.propTypes = {
  dataType: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  interfaceOpen: PropTypes.bool.isRequired,
  activeTab: PropTypes.number,
  setActiveTab: PropTypes.func,
  children: PropTypes.node
}

const NacelleLinker = ({ type, onChange, value, markers, level, readOnly }) => {
  const [searchOptions, setSearchOptions] = useState([])
  const [searchQuery, setSearchQuery] = useState(null)
  const [spaceOptions, setSpaceOptions] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [interfaceOpen, setInterfaceOpen] = useState(false)
  const onClose = useCallback(() => setInterfaceOpen(false), [])
  const onQueryUpdate = useCallback((query) => setSearchQuery(query), [])

  useEffect(() => {
    if (!spaceOptions) {
      const initialSpace =
        Array.isArray(config.nacelleSpaces) &&
        config.nacelleSpaces.find(
          (s) => s.spaceId && s.spaceToken && s.spaceName
        )
      setSpaceOptions(initialSpace)
    }
  }, [spaceOptions])

  const handle = value || ''

  const inputId = useId()

  const filterOption = (query, option) => {
    const queryText = query.toLowerCase().trim()
    const titleMatch = option.title.toLowerCase().includes(queryText)
    const handleMatch = option.handle.replace('/-/g', '').includes(queryText)
    const tagsMatch =
      Array.isArray(option.tags) &&
      option.tags.find((tag) => tag.toLowerCase().includes(queryText))
    const variantsMatch =
      Array.isArray(option.variants) &&
      option.variants.find((variant) => {
        const titleMatch = variant.title.toLowerCase().includes(queryText)
        const skuMatch =
          variant.sku &&
          variant.sku.toLowerCase().replace('/-/g', '').includes(queryText)
        return titleMatch || skuMatch
      })
    return titleMatch || handleMatch || tagsMatch || variantsMatch
  }

  const selectItem = (handle) => {
    onChange(createPatchFrom(handle))
    onClose()
  }

  const dataTypeFromOptions = type.options && type.options.dataType
  let dataType

  if (!dataTypeFromOptions) {
    dataType = ['collections', 'products']
  } else {
    dataType = Array.isArray(dataTypeFromOptions)
      ? dataTypeFromOptions
      : [dataTypeFromOptions]
  }

  return (
    <ThemeProvider theme={studioTheme}>
      {interfaceOpen && (
        <Dialog
          header="Indexed PIM Data"
          id="dialog-example"
          onClose={onClose}
          width={1}
          zOffset={1000}
        >
          <HandleContext.Provider value={{ handle, setHandle: selectItem }}>
            <SearchOptionsContext.Provider
              value={{ searchOptions, setSearchOptions }}
            >
              <SearchQueryContext.Provider
                value={{ searchQuery, setSearchQuery }}
              >
                <SpaceOptionsContext.Provider
                  value={{ spaceOptions, setSpaceOptions }}
                >
                  <Interface
                    dataType={dataType}
                    interfaceOpen={interfaceOpen}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  >
                    <Autocomplete
                      fontSize={[2, 2, 3]}
                      icon={SearchIcon}
                      options={searchOptions}
                      placeholder="Search indexed entries"
                      onSelect={onQueryUpdate}
                      onChange={onQueryUpdate}
                      value={searchQuery || ''}
                      filterOption={filterOption}
                    />
                    {dataType.map((type, idx) => (
                      <NacelleData
                        key={type}
                        dataType={type}
                        active={idx === activeTab}
                      />
                    ))}
                  </Interface>
                </SpaceOptionsContext.Provider>
              </SearchQueryContext.Provider>
            </SearchOptionsContext.Provider>
          </HandleContext.Provider>
        </Dialog>
      )}
      <FormField
        label={type.title}
        markers={markers}
        description={type.description}
        level={level}
      >
        <Stack space={3}>
          <Flex>
            <Box flex={1}>
              <TextInput
                id={inputId}
                value={handle}
                readOnly={readOnly}
                disabled
              />
            </Box>
            <Box marginLeft={1}>
              <Button
                mode="ghost"
                type="button"
                tone={interfaceOpen ? 'critical' : 'default'}
                disabled={readOnly}
                onClick={() => setInterfaceOpen(!interfaceOpen)}
                text={'Select'}
              />
              <Button
                mode="ghost"
                type="button"
                tone={interfaceOpen ? 'critical' : 'default'}
                disabled={readOnly}
                onClick={() => selectItem('')}
                text={'Clear'}
              />
            </Box>
          </Flex>
        </Stack>
      </FormField>
    </ThemeProvider>
  )
}

NacelleLinker.propTypes = {
  type: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    options: PropTypes.shape({
      dataType: PropTypes.oneOfType([PropTypes.array, PropTypes.string])
    })
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  markers: PropTypes.arrayOf.any,
  level: PropTypes.number,
  value: PropTypes.string,
  readOnly: PropTypes.bool
}

export default React.forwardRef((props, ref) => (
  <NacelleLinker {...props} forwardedRef={ref} />
))
