'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Option {
  value: string
  label: string
  icon?: React.ReactNode
  emoji?: string
}

interface ModernSelectProps {
  label: string
  name: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  required?: boolean
  className?: string
}

export default function ModernSelect({
  label,
  name,
  options,
  value,
  onChange,
  required,
  className = ''
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value) || options[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`space-y-2 relative ${className}`} ref={containerRef}>
      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none transition-all hover:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/50 shadow-sm"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.emoji && <span className="text-lg">{selectedOption.emoji}</span>}
          {selectedOption?.icon && <span className="text-accent-blue">{selectedOption.icon}</span>}
          <span>{selectedOption?.label}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-muted-foreground" />
        </motion.div>
      </button>

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} required={required} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 min-w-full w-max mt-1 overflow-hidden rounded-2xl border border-border bg-card/98 backdrop-blur-2xl shadow-2xl perspective-2000 left-0"
          >
            <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all hover:bg-accent-blue/10 group ${
                    value === option.value ? 'bg-accent-blue/5 text-accent-blue' : 'text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {option.emoji && (
                      <span className="text-xl transition-transform group-hover:scale-125">
                        {option.emoji}
                      </span>
                    )}
                    {option.icon && (
                      <span className="text-accent-blue transition-transform group-hover:scale-110">
                        {option.icon}
                      </span>
                    )}
                    <span>{option.label}</span>
                  </div>
                  {value === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Check size={16} className="text-accent-blue" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
