/**
 * SDP Editor Component
 * Editor for Session Description Protocol (SDP) payloads
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { FileText, Wand2 } from 'lucide-react'

interface SDPEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const DEFAULT_SDP_TEMPLATE = `v=0
o=- 3883943947 3883943947 IN IP4 127.0.0.1
s=Session
c=IN IP4 127.0.0.1
t=0 0
m=audio 5004 RTP/AVP 0 8 101
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:101 telephone-event/8000
a=fmtp:101 0-16
a=sendrecv`

export function SDPEditor({
  value,
  onChange,
  disabled = false,
}: SDPEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleUseTemplate = () => {
    onChange(DEFAULT_SDP_TEMPLATE)
    setIsExpanded(true)
  }

  const lineCount = value ? value.split('\n').length : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              SDP Body (Optional)
            </CardTitle>
            <CardDescription>
              Session Description Protocol for media negotiation
            </CardDescription>
          </div>
          {!value && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUseTemplate}
              disabled={disabled}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Use Template
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            SDP Content
            <Badge variant="outline" className="text-xs">
              {lineCount} lines
            </Badge>
          </Label>
          <Textarea
            placeholder="v=0&#10;o=- ...&#10;s=Session&#10;..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="font-mono text-sm min-h-[200px]"
            spellCheck={false}
          />
          <p className="text-xs text-muted-foreground">
            Session Description Protocol (RFC 4566). Defines media streams, codecs, 
            and connection information for the session.
          </p>
        </div>

        {/* SDP Field Explanations */}
        <div className="bg-muted/50 p-4 rounded-md text-xs space-y-2">
          <div className="font-semibold mb-2">Common SDP Fields:</div>
          <div className="grid gap-1 text-muted-foreground font-mono">
            <div><strong>v=</strong> Protocol version (always 0)</div>
            <div><strong>o=</strong> Origin (session owner)</div>
            <div><strong>s=</strong> Session name</div>
            <div><strong>c=</strong> Connection information (IP address)</div>
            <div><strong>t=</strong> Timing (0 0 = permanent session)</div>
            <div><strong>m=</strong> Media description (audio/video, port, protocol)</div>
            <div><strong>a=</strong> Attributes (rtpmap, fmtp, sendrecv, etc.)</div>
          </div>
        </div>

        {/* RFC References */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">RFC 4566 (SDP)</Badge>
          <Badge variant="outline" className="text-xs">RFC 3264 (Offer/Answer)</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
