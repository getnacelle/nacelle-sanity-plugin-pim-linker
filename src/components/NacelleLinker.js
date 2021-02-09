import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import PatchEvent, { set, unset } from 'part:@sanity/form-builder/patch-event'
import FormField from 'part:@sanity/components/formfields/default'
import { useId } from '@reach/auto-id'

import {
  ThemeProvider,
  studioTheme,
  Box,
  TextInput,
  Button,
  Dialog,
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
  SearchQueryContext
} from '../context'

const createPatchFrom = (value) =>
  PatchEvent.from(value === '' ? unset() : set(value))

const handleHailFrequencyData = (data, queryName) =>
  data && data[queryName] && data[queryName].items

const NacelleData = ({ dataType, active }) => {
  const getProducts = useCallback(
    (data) => handleHailFrequencyData(data, 'getProducts'),
    []
  )
  const getCollections = useCallback(
    (data) => handleHailFrequencyData(data, 'getCollections'),
    []
  )

  switch (dataType) {
    case 'products':
      return (
        <NacelleDataFetcher
          query={GET_PRODUCTS}
          dataHandler={getProducts}
          className="tabContent"
          active={active}
        />
      )
    case 'collections':
      return (
        <NacelleDataFetcher
          query={GET_COLLECTIONS}
          dataHandler={getCollections}
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
  const dataTypes = Array.isArray(dataType) ? dataType.sort() : [dataType]
  const multiTab = dataTypes.length > 1

  return (
    <Box style={{ display: interfaceOpen ? 'block' : 'none' }} padding={4}>
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
  const [activeTab, setActiveTab] = useState(0)
  const [interfaceOpen, setInerfaceOpen] = useState(false)
  const onClose = useCallback(() => setInerfaceOpen(false), [])
  const onQueryUpdate = useCallback((query) => setSearchQuery(query), [])

  const handle = value || ''

  const inputId = useId()

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
          zOffset={1000}
        >
          <HandleContext.Provider value={{ handle, setHandle: selectItem }}>
            <SearchOptionsContext.Provider
              value={{ searchOptions, setSearchOptions }}
            >
              <SearchQueryContext.Provider
                value={{ searchQuery, setSearchQuery }}
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
                  />
                  {dataType.map((type, idx) => (
                    <NacelleData
                      key={type}
                      dataType={type}
                      active={idx === activeTab}
                    />
                  ))}
                </Interface>
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
                onClick={() => setInerfaceOpen(!interfaceOpen)}
                text={'Select'}
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
