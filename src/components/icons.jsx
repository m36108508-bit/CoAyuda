const baseProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}

export function UserIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
      <circle cx="10" cy="7" r="4" />
    </svg>
  )
}

export function PackageIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 8.5 12 4l9 4.5-9 4.5L3 8.5Z" />
      <path d="M3 8.5V15l9 4.5 9-4.5V8.5" />
      <path d="M12 13v7" />
    </svg>
  )
}

export function ShieldIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3 5 6v6c0 4.4 2.8 8.5 7 10 4.2-1.5 7-5.6 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.5 1.5 3.5-4" />
    </svg>
  )
}

export function SearchIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="11" cy="11" r="5.5" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

export function MapPinIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

export function PhoneIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M22 16.9v2.1A2 2 0 0 1 20 21c-8.7 0-15-6.3-15-15a2 2 0 0 1 2-2h2.1a1 1 0 0 1 1 .8L10.5 9a1 1 0 0 1-.8 1.1L8 10.5A13.3 13.3 0 0 0 13.5 16l.4-1.7a1 1 0 0 1 1.1-.8l3.1.7a1 1 0 0 1 .8 1Z" />
    </svg>
  )
}

export function AlertTriangleIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3.5 21 18a1.5 1.5 0 0 1-1.3 2.3H4.3A1.5 1.5 0 0 1 3 18L12 3.5Z" />
      <path d="M12 9v4.5" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function CheckIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m5 12 4.2 4.2L19 2.5" />
    </svg>
  )
}

export function PencilIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 17.2V21h3.8l10.9-10.9-3.8-3.8L3 17.2Z" />
      <path d="m14 5 3.8 3.8" />
    </svg>
  )
}

export function TrashIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M18 6l-1 14H7L6 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  )
}

export function ShareIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.3 11 7.4-4.3" />
      <path d="m8.3 13 7.4 4.2" />
    </svg>
  )
}

export function PlusIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

export function XIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  )
}

export function SendIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </svg>
  )
}
