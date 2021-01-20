import React from 'react'
import { render, cleanup } from '@testing-library/react'
import NacelleLinker from '../components/NacelleLinker'

afterEach(cleanup)

describe('This will test MyComponent', () => {
  test('renders message', () => {
    const { getByText } = render(
      <NacelleLinker
        dataType={['products', 'collections']}
        interfaceOpen={true}
      />
    )

    expect(getByText('Hi Alejandro Roman')).toBeInTheDocument()
  })
})
