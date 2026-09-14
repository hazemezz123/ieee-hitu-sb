import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Select from './Select'

afterEach(cleanup)

const options = [
  { value: 'ai', label: 'AI', hint: 'Explores artificial intelligence.' },
  { value: 'web', label: 'Web' },
]

describe('Select core', () => {
  it('renders placeholder and opens the panel on click', () => {
    render(<Select id="s1" label="Committee" value="" onChange={() => {}} options={options} placeholder="Select a committee" />)
    expect(screen.getByRole('combobox', { name: 'Committee' }).textContent).toMatch(/Select a committee/)
    fireEvent.click(screen.getByRole('combobox', { name: 'Committee' }))
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(screen.getByRole('option', { name: /AI/ })).toBeTruthy()
  })

  it('selects an option, calls onChange with the value, and closes', () => {
    const onChange = vi.fn()
    render(<Select id="s2" label="Committee" value="" onChange={onChange} options={options} />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Committee' }))
    fireEvent.click(screen.getByRole('option', { name: /Web/ }))
    expect(onChange).toHaveBeenCalledWith('web')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('shows the selected label and closes on Escape without selecting', () => {
    const onChange = vi.fn()
    render(<Select id="s3" label="Committee" value="ai" onChange={onChange} options={options} />)
    expect(screen.getByRole('combobox', { name: 'Committee' }).textContent).toMatch(/AI/)
    fireEvent.click(screen.getByRole('combobox', { name: 'Committee' }))
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' })
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('keeps a hidden native select carrying name, required, and value', () => {
    const { container } = render(<Select id="s4" label="Committee" name="committee" required value="web" onChange={() => {}} options={options} />)
    const native = container.querySelector('select[name="committee"]')
    expect(native.required).toBe(true)
    expect(native.value).toBe('web')
  })
})
