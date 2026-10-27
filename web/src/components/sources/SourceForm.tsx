import { useState, type SubmitEvent } from 'react'

import type { JobSourceInput } from '@/api/sources'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type SourceFormProps = {
    initialValues?: JobSourceInput
    submitLabel?: string
    isSubmitting?: boolean
    onSubmit: (values: JobSourceInput) => void | Promise<void>
    onCancel: () => void
}

const defaultValues: JobSourceInput = {
    name: '',
    url: '',
    is_active: true,
}

function SourceForm({
    initialValues = defaultValues,
    submitLabel = 'Create source',
    isSubmitting = false,
    onSubmit,
    onCancel,
}: SourceFormProps) {
    const [name, setName] = useState(initialValues.name)
    const [url, setUrl] = useState(initialValues.url)
    const [isActive, setIsActive] = useState(initialValues.is_active)

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        await onSubmit({
            name: name.trim(),
            url: url.trim(),
            is_active: isActive,
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Source details</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="source-name" className="text-sm font-medium">
                            Name
                        </label>
                        <input
                            id="source-name"
                            name="name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="e.g. Company Careers"
                            required
                            maxLength={255}
                            disabled={isSubmitting}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="source-url" className="text-sm font-medium">
                            Feed URL
                        </label>
                        <input
                            id="source-url"
                            name="url"
                            type="url"
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                            placeholder="https://example.com/feed.xml"
                            required
                            disabled={isSubmitting}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter the URL of the RSS or Atom feed.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            id="source-active"
                            name="is_active"
                            type="checkbox"
                            checked={isActive}
                            onChange={(event) => setIsActive(event.target.checked)}
                            disabled={isSubmitting}
                            className="size-4 rounded border-input accent-primary"
                        />
                        <label htmlFor="source-active" className="text-sm font-medium">
                            Active
                        </label>
                    </div>
                    <div className="flex justify-end gap-3 border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : submitLabel}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>

        )
}

export default SourceForm