'use client'

import { useEffect, useId, useRef, useState } from 'react'

export function toOptions(items, { value = 'slug', label = 'name', hint = 'shortDescription' } = {}) {
  return (items || []).map(item => ({
    value: String(item[value] ?? ''),
    label: String(item[label] ?? ''),
    hint: item[hint] ? String(item[hint]) : '',
  }))
}

export default function Select({
  id, label, ariaLabel, value, onChange, options = [],
  placeholder = 'Select…', required = false, disabled = false,
  name, searchThreshold = 6, className = '',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(-1)
  const [dropUp, setDropUp] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const searchRef = useRef(null)
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const triggerId = `${id}-trigger`
  const panelId = `${id}-panel-${reactId}`

  const selected = options.find(o => o.value === value) || null
  const showSearch = options.length > searchThreshold
  const q = query.trim().toLowerCase()
  const filtered = q
    ? options.filter(o => `${o.label} ${o.hint || ''}`.toLowerCase().includes(q))
    : options
  const activeId = active >= 0 && filtered[active] ? `${panelId}-opt-${active}` : undefined

  function measure() {
    const el = rootRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setDropUp(rect.bottom + 280 > window.innerHeight && rect.top > 320)
  }

  function openPanel() {
    if (disabled) return
    const selectedIndex = filtered.findIndex(o => o.value === value)
    setActive(selectedIndex >= 0 ? selectedIndex : 0)
    setQuery('')
    measure()
    setOpen(true)
  }

  function closePanel(refocus = true) {
    setOpen(false)
    setQuery('')
    setActive(-1)
    if (refocus) triggerRef.current?.focus()
  }

  function choose(nextValue) {
    onChange(nextValue)
    closePanel()
  }

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fire-and-forget open side effects
    measure()
    if (showSearch) searchRef.current?.focus()
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) closePanel(false)
    }
    function onResize() { measure() }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function onTriggerKeyDown(e) {
    if (disabled) return
    if (open && ['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Tab'].includes(e.key)) {
      onPanelKeyDown(e)
      return
    }
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      openPanel()
    } else if (!showSearch && e.key.length === 1) {
      const hit = options.find(o => o.label.toLowerCase().startsWith(e.key.toLowerCase()))
      if (hit) onChange(hit.value)
    }
  }

  function move(delta) {
    if (filtered.length === 0) return
    setActive(a => (a + delta + filtered.length) % filtered.length)
  }

  function onPanelKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[active]) choose(filtered[active].value)
      else if (filtered.length === 1) choose(filtered[0].value)
    }
    else if (e.key === 'Escape') { e.preventDefault(); closePanel() }
    else if (e.key === 'Tab') { closePanel(false) }
  }

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      id={triggerId}
      role="combobox"
      aria-expanded={open}
      aria-controls={panelId}
      aria-activedescendant={open ? activeId : undefined}
      aria-label={label || ariaLabel}
      disabled={disabled}
      onClick={() => (open ? closePanel() : openPanel())}
      onKeyDown={onTriggerKeyDown}
      className={'select-trigger' + (open ? ' select-trigger--open' : '')}
    >
      <span className={'select-value' + (selected ? '' : ' select-value--placeholder')}>
        {selected ? selected.label : placeholder}
      </span>
      <span className={'material-symbols-outlined select-chevron' + (open ? ' select-chevron--open' : '')} aria-hidden="true">expand_more</span>
    </button>
  )

  return (
    <div ref={rootRef} className={'select-root ' + className}>
      {label ? <label className="form-label" htmlFor={triggerId}>{label}</label> : null}
      {trigger}
      <select
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        name={name}
        required={required}
        disabled={disabled}
        value={value}
        onChange={() => { /* single source of truth is the custom panel */ }}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {open && (
        <div id={panelId} role="listbox" aria-label={label || ariaLabel} onKeyDown={onPanelKeyDown} className={'select-panel' + (dropUp ? ' select-panel--up' : '')}>
          {showSearch && (
            <div className="select-search-row">
              <input
                ref={searchRef}
                role="searchbox"
                aria-label="Filter options"
                className="select-search"
                placeholder="Type to filter…"
                value={query}
                onChange={e => { setQuery(e.target.value); setActive(0) }}
                onKeyDown={onPanelKeyDown}
              />
              <span className="select-count" aria-hidden="true">{filtered.length} of {options.length}</span>
            </div>
          )}
          {filtered.length === 0 ? (
            <p className="select-empty" role="status">{q ? `No matches for "${query.trim()}"` : 'No options'}</p>
          ) : (
            <ul className="select-list" data-lenis-prevent>
              {filtered.map((o, index) => {
                const isSelected = o.value === value
                return (
                  <li
                    key={o.value}
                    id={`${panelId}-opt-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => choose(o.value)}
                    className={'select-option' + (index === active ? ' select-option--active' : '') + (isSelected ? ' select-option--selected' : '')}
                  >
                    <span className="select-option-main">
                      <span className="select-option-label" title={o.label}>{o.label}</span>
                      {o.hint ? <span className="select-option-hint">{o.hint}</span> : null}
                    </span>
                    {isSelected ? <span className="material-symbols-outlined select-check" aria-hidden="true">check</span> : null}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
