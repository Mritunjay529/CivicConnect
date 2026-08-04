import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../../components/PageShell.jsx'
import Input from '../../components/Input.jsx'
import Button from '../../components/Button.jsx'
import Badge from '../../components/Badge.jsx'

export default function ReportIssue() {
  const navigate = useNavigate()
  const [description, setDescription] = useState('')

  const suggestedCategory = description.toLowerCase().includes('water')
    ? 'Water leakage'
    : description.toLowerCase().includes('light')
    ? 'Broken streetlight'
    : description.toLowerCase().includes('garbage')
    ? 'Garbage overflow'
    : 'Pothole'

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/complaint-tracking')
  }

  return (
    <PageShell role="citizen">
      <h1 className="text-xl font-semibold text-on-surface mb-1">Report a civic issue</h1>
      <p className="text-sm text-on-surface-variant mb-6">
        Add a photo and description — we'll route it to the right department.
      </p>

      <form onSubmit={handleSubmit} className="max-w-lg flex flex-col gap-4">
        <div className="border-2 border-dashed border-outline-variant rounded-lg p-8 text-center">
          <span className="material-symbols-outlined text-[28px] text-outline block mb-2">photo_camera</span>
          <p className="text-sm text-on-surface-variant">Add a photo of the issue</p>
          <Button type="button" variant="secondary" className="mt-3">
            Upload photo
          </Button>
        </div>

        <Input
          label="Description"
          as="textarea"
          placeholder="Large pothole near the bus stop causing traffic"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {description && (
          <div className="flex items-center gap-2 bg-primary-container/20 border border-primary-container rounded px-3 py-2">
            <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
            <p className="text-sm text-on-surface">
              AI suggests: <span className="font-medium">{suggestedCategory}</span>
            </p>
            <Badge tone="error">High priority</Badge>
          </div>
        )}

        <Input
          label="Location"
          icon="location_on"
          value="Auto-detected: MG Road, near Sector 5"
          onChange={() => {}}
        />

        <Button type="submit" fullWidth icon="send">
          Submit report
        </Button>
      </form>
    </PageShell>
  )
}
