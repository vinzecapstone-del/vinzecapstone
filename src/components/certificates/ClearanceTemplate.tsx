import type { CertificateTemplateData } from '@/types'

interface Props {
  data: CertificateTemplateData
}

// Generates a consistent cursive-style SVG signature from a name
function ESignature({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).join('')
  return (
    <div style={{ marginBottom: '4px', height: '56px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <svg width="220" height="52" viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg">
        {/* Decorative cursive signature lines */}
        <path
          d={`M 20 38 C 35 10, 55 8, 70 22 C 82 34, 90 12, 110 18 C 128 24, 135 8, 155 16 C 170 22, 178 36, 200 28`}
          fill="none"
          stroke="#1a3a2a"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M 15 44 C 40 42, 80 46, 110 43 C 140 40, 175 45, 205 42`}
          fill="none"
          stroke="#1a3a2a"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.4"
        />
        {/* Stylized initials */}
        <text
          x="110"
          y="35"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="22"
          fontStyle="italic"
          fontWeight="bold"
          fill="#1a3a2a"
          opacity="0.85"
          letterSpacing="3"
        >
          {initials}
        </text>
        {/* Underline flourish */}
        <path
          d={`M 60 46 Q 110 50 160 46`}
          fill="none"
          stroke="#c9a84c"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </div>
  )
}

export default function ClearanceTemplate({ data }: Props) {
  const today = new Date(data.issued_date).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
  const birthdate = data.birthdate
    ? new Date(data.birthdate).toLocaleDateString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : '—'

  return (
    <div
      id="certificate-print"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        width: '816px',
        minHeight: '1056px',
        backgroundColor: '#fff',
        padding: '60px 80px',
        color: '#111',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Watermark */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%) rotate(-35deg)',
        fontSize: '90px', fontWeight: 'bold', color: '#1a3a2a',
        opacity: 0.04, whiteSpace: 'nowrap', userSelect: 'none',
        pointerEvents: 'none', zIndex: 0,
      }}>
        BARANGAY {data.barangay_name.toUpperCase()}
      </div>

      {/* Border */}
      <div style={{
        position: 'absolute', inset: '20px',
        border: '3px double #1a3a2a',
        borderRadius: '4px',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#666', marginBottom: '4px' }}>
            Republic of the Philippines
          </p>
          <p style={{ fontSize: '11px', color: '#555', marginBottom: '2px' }}>
            Province · Municipality
          </p>
          <h1 style={{
            fontSize: '26px', fontWeight: 'bold', color: '#1a3a2a',
            margin: '8px 0 4px', letterSpacing: '1px',
          }}>
            BARANGAY {data.barangay_name.toUpperCase()}
          </h1>
          <p style={{ fontSize: '10px', color: '#777' }}>Office of the Barangay Captain</p>

          {/* Gold divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '14px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#c9a84c' }} />
            <div style={{ width: '8px', height: '8px', background: '#c9a84c', transform: 'rotate(45deg)' }} />
            <div style={{ flex: 1, height: '1px', background: '#c9a84c' }} />
          </div>

          <h2 style={{
            fontSize: '20px', fontWeight: 'bold', color: '#1a3a2a',
            letterSpacing: '3px', textDecoration: 'underline',
            textUnderlineOffset: '4px',
          }}>
            BARANGAY CLEARANCE
          </h2>
        </div>

        {/* Salutation */}
        <p style={{ marginBottom: '20px', fontSize: '13px' }}>TO WHOM IT MAY CONCERN:</p>

        {/* Body */}
        <div style={{ lineHeight: '2', fontSize: '13px', textAlign: 'justify', marginBottom: '20px' }}>
          <p>
            This is to certify that{' '}
            <strong style={{ textDecoration: 'underline' }}>{data.full_name}</strong>,
            {data.birthdate ? ` born on ${birthdate},` : ''} of legal age, a bonafide resident
            of <strong>{data.purok ?? 'this barangay'}</strong>, Barangay {data.barangay_name},
            is personally known to this office and has{' '}
            <strong>NO DEROGATORY RECORD</strong> on file in this barangay as of this date.
          </p>
        </div>

        <div style={{ lineHeight: '2', fontSize: '13px', textAlign: 'justify', marginBottom: '20px' }}>
          <p>
            The above-named person is known to be a{' '}
            <strong>law-abiding citizen</strong> of good moral character and reputable standing
            in the community.
          </p>
        </div>

        <div style={{ lineHeight: '2', fontSize: '13px', textAlign: 'justify', marginBottom: '28px' }}>
          <p>
            This certification is issued upon the request of the above-named person for{' '}
            <strong style={{ textDecoration: 'underline' }}>{data.purpose}</strong> purposes and
            to whom it may concern.
          </p>
        </div>

        {/* Issued line */}
        <p style={{ fontSize: '13px', marginBottom: '32px' }}>
          Issued this <strong>{today}</strong> at Barangay {data.barangay_name}.
        </p>

        {/* E-Signature block */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '280px', margin: '0 auto' }}>

            {/* E-signature label */}
            <p style={{
              fontSize: '8px', color: '#aaa', letterSpacing: '2px',
              textTransform: 'uppercase', marginBottom: '4px',
            }}>
              Electronically Signed
            </p>

            {/* SVG Signature */}
            <ESignature name={"Hon. Eduardo I. Madeja"} />

            {/* Signature line */}
            <div style={{ borderTop: '1.5px solid #111', marginBottom: '6px' }} />
            <p style={{ fontWeight: 'bold', fontSize: '14px' }}>Hon. Eduardo I. Madeja</p>
            <p style={{ fontSize: '11px', color: '#555' }}>Punong Barangay</p>
            <p style={{ fontSize: '10px', color: '#777' }}>Barangay {data.barangay_name}</p>

            {/* E-sig validity note */}
            <p style={{
              fontSize: '8px', color: '#c9a84c', marginTop: '6px',
              letterSpacing: '0.5px',
            }}>
              ✦ Digitally authenticated — {today}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #ccc', paddingTop: '12px',
          display: 'flex', justifyContent: 'space-between',
          fontSize: '10px', color: '#888',
        }}>
          <span>Tracking No: <strong style={{ color: '#555' }}>{data.tracking_number}</strong></span>
          <span>Official Receipt: ₱{data.amount}.00</span>
          <span>Date Issued: {today}</span>
        </div>

      </div>
    </div>
  )
}
