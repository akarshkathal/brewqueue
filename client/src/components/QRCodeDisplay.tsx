import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'

interface Props {
  shopSlug: string
  shopName: string
}

export default function QRCodeDisplay({ shopSlug, shopName }: Props) {
  const [expanded, setExpanded] = useState(false)

  // The URL customers will land on when they scan
  const queueUrl = `${window.location.origin}/shop/${shopSlug}`

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Customer QR Code</h3>
          <p className="text-gray-400 text-xs mt-1">
            Customers scan this to join the queue
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg
                     text-sm font-medium hover:bg-amber-200 transition"
        >
          {expanded ? 'Hide' : 'Show QR'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="p-4 bg-white border-2 border-amber-200 rounded-xl">
            <QRCodeSVG
              value={queueUrl}
              size={180}
              bgColor="#ffffff"
              fgColor="#1a1a1a"
              level="M"
            />
          </div>
          <p className="text-gray-400 text-xs text-center">{queueUrl}</p>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg
                       text-sm font-medium hover:bg-amber-600 transition"
          >
            🖨️ Print QR Code
          </button>
        </div>
      )}
    </div>
  )
}