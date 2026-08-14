import type { JobStatus, AlgorithmStatus, RequestStatus } from '@/types/common'

type Status = JobStatus | AlgorithmStatus | RequestStatus

interface Config {
  label: string
  bg: string
  text: string
  border: string
}

const CONFIG: Record<string, Config> = {
  // JobStatus (QPUaaS)
  initiated: { label: 'Initiated', bg: 'rgb(242,242,242)',  text: 'rgb(119,119,119)', border: 'rgb(204,204,204)' },
  estimate:  { label: 'Estimate',  bg: 'rgb(255,251,235)',  text: 'rgb(161,98,7)',    border: 'rgb(255,177,68)'  },
  submitted: { label: 'Submitted', bg: 'rgb(219,234,254)',  text: 'rgb(37,99,235)',   border: 'rgb(96,165,250)'  },
  running:   { label: 'Running',   bg: 'rgb(211,232,247)',  text: 'rgb(36,142,213)',  border: 'rgb(36,142,213)'  },
  done:      { label: 'Done',      bg: 'rgb(240,253,244)',  text: 'rgb(34,197,94)',   border: 'rgb(34,197,94)'   },
  failed:    { label: 'Failed',    bg: 'rgb(254,242,242)',  text: 'rgb(239,68,68)',   border: 'rgb(239,68,68)'   },
  cancelled: { label: 'Cancelled', bg: 'rgb(242,242,242)',  text: 'rgb(119,119,119)', border: 'rgb(204,204,204)' },
  // legacy (backward compat)
  queued:    { label: 'Initiated', bg: 'rgb(242,242,242)',  text: 'rgb(119,119,119)', border: 'rgb(204,204,204)' },
  success:   { label: 'Done',      bg: 'rgb(240,253,244)',  text: 'rgb(34,197,94)',   border: 'rgb(34,197,94)'   },
  // AlgorithmStatus
  draft:     { label: '임시저장', bg: 'rgb(242,242,242)',  text: 'rgb(119,119,119)', border: 'rgb(204,204,204)' },
  pending:   { label: '검토중',   bg: 'rgb(255,251,235)',  text: 'rgb(255,177,68)',  border: 'rgb(255,177,68)'  },
  rejected:  { label: '반려',     bg: 'rgb(254,242,242)',  text: 'rgb(239,68,68)',   border: 'rgb(239,68,68)'   },
  published: { label: '게시중',   bg: 'rgb(240,253,244)',  text: 'rgb(34,197,94)',   border: 'rgb(34,197,94)'   },
  inactive:  { label: '비활성',   bg: 'rgb(242,242,242)',  text: 'rgb(119,119,119)', border: 'rgb(204,204,204)' },
  // RequestStatus
  approved:  { label: '승인',     bg: 'rgb(240,253,244)',  text: 'rgb(34,197,94)',   border: 'rgb(34,197,94)'   },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = CONFIG[status] ?? { label: status, bg: 'rgb(242,242,242)', text: 'rgb(119,119,119)', border: 'rgb(204,204,204)' }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 20,
      padding: '0 7px',
      borderRadius: 9999,
      fontSize: 11,
      fontWeight: 600,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      backgroundColor: cfg.bg,
      color: cfg.text,
      border: `1px solid ${cfg.border}40`,
    }}>
      {cfg.label}
    </span>
  )
}
