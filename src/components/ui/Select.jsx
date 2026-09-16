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
  name, className = '',
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [dropUp, setDropUp] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const triggerId = `${id}-trigger`
  const panelId = `${id}-panel-${reactId}`

  const selected = options.find(o => o.value === value) || null
  const activeId = active >= 0 && options[active] ? `${panelId}-opt-${active}` : undefined

  function measure() {
    const el = rootRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setDropUp(rect.bottom + 280 > window.innerHeight && rect.top > 320)
  }

  function openPanel() {
    if (disabled) return
    const selectedIndex = options.findIndex(o => o.value === value)
    setActive(selectedIndex >= 0 ? selectedIndex : 0)
    measure()
    setOpen(true)
  }

  function closePanel(refocus = true) {
    setOpen(false)
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
  }, [open])

  function onTriggerKeyDown(e) {
    if (disabled) return
    if (open && ['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Tab'].includes(e.key)) {
      onPanelKeyDown(e)
      return
    }
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      openPanel()
    } else if (e.key.length === 1) {
      const hit = options.find(o => o.label.toLowerCase().startsWith(e.key.toLowerCase()))
      if (hit) onChange(hit.value)
    }
  }

  function move(delta) {
    if (options.length === 0) return
    setActive(a => (a + delta + options.length) % options.length)
  }

  function onPanelKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (options[active]) choose(options[active].value)
      else if (options.length === 1) choose(options[0].value)
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
          {options.length === 0 ? (
            <p className="select-empty" role="status">No options</p>
          ) : (
            <ul className="select-list" data-lenis-prevent>
              {options.map((o, index) => {
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
