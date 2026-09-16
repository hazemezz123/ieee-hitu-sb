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

describe('Select keyboard', () => {
  const options = [
    { value: 'ai', label: 'AI' },
    { value: 'web', label: 'Web' },
    { value: 'pr-oc', label: 'PR & OC' },
  ]
  it('opens with ArrowDown and selects with arrows + Enter', () => {
    const onChange = vi.fn()
    render(<Select id="k1" label="Pick" value="" onChange={onChange} options={options} />)
    const trigger = screen.getByRole('combobox', { name: 'Pick' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(screen.getByRole('listbox')).toBeTruthy()
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('web')
  })
  it('navigates with arrows + Enter on the trigger', () => {
    const onChange = vi.fn()
    render(<Select id="k3" label="Pick" value="" onChange={onChange} options={options} />)
    const trigger = screen.getByRole('combobox', { name: 'Pick' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(screen.getByRole('listbox')).toBeTruthy()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('web')
  })
  it('type-ahead selects by first letter', () => {
    const onChange = vi.fn()
    render(<Select id="k2" label="Pick" value="" onChange={onChange} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />)
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Pick' }), { key: 'n' })
    expect(onChange).toHaveBeenCalledWith('no')
  })
})

describe('Select options', () => {
  it('does not render a search box', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ value: `c${i}`, label: `Committee ${i}` }))
    render(<Select id="s5" label="Pick" value="" onChange={() => {}} options={many} />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Pick' }))
    expect(screen.queryByRole('searchbox')).toBeNull()
  })
  it('shows empty state when options are empty', () => {
    render(<Select id="s-empty" label="Pick" value="" onChange={() => {}} options={[]} />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Pick' }))
    expect(screen.getByText('No options')).toBeTruthy()
  })
  it('marks the selected option with aria-selected and shows its hint', () => {
    render(<Select id="s7" label="Pick" value="ai" onChange={() => {}} options={[{ value: 'ai', label: 'AI', hint: 'Smart systems.' }]} />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Pick' }))
    expect(screen.getByRole('option', { name: /AI/ }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByText('Smart systems.')).toBeTruthy()
  })
  it('opts the options list out of Lenis smooth-scroll hijacking', () => {
    render(<Select id="s10" label="Pick" value="" onChange={() => {}} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Pick' }))
    const list = screen.getByRole('listbox').querySelector('.select-list')
    expect(list.hasAttribute('data-lenis-prevent')).toBe(true)
  })
  it('disables interaction when disabled', () => {
    render(<Select id="s8" label="Pick" value="" onChange={() => {}} options={[{ value: 'a', label: 'A' }]} disabled />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Pick' }))
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('Select contract', () => {
  it('exposes toOptions mapping slug/name/shortDescription', async () => {
    const { toOptions } = await import('./Select')
    expect(toOptions([{ slug: 'ai', name: 'AI', shortDescription: 'Smart.' }])).toEqual([{ value: 'ai', label: 'AI', hint: 'Smart.' }])
  })
  it('toggles aria-expanded on open/close', () => {
    render(<Select id="s9" label="Pick" value="" onChange={() => {}} options={[{ value: 'a', label: 'A' }]} />)
    const trigger = screen.getByRole('combobox', { name: 'Pick' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })
})
