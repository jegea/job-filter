import { useState, type SubmitEvent } from 'react'

import type { JobKeywordInput } from '@/api/keywords'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type KeywordFormProps = {
    initialValues?: JobKeywordInput
    submitLabel?: string
    isSubmitting?: boolean
    onSubmit: (values: JobKeywordInput) => void | Promise<void>
    onCancel: () => void
}

const defaultValues: JobKeywordInput = {
    term: '',
    keyword_type: 'positive',
    weight: 1,
    is_active: true,
}

function KeywordForm({
    initialValues = defaultValues,
    submitLabel = 'Create keyword',
    isSubmitting = false,
    onSubmit,
    onCancel,
}: KeywordFormProps) {
    const [term, setTerm] = useState(initialValues.term)
    const [keywordType, setKeywordType] = useState(initialValues.keyword_type)
    const [weight, setWeight] = useState(initialValues.weight)
    const [isActive, setIsActive] = useState(initialValues.is_active)

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        await onSubmit({
            term: term.trim(),
            keyword_type: keywordType,
            weight,
            is_active: isActive,
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Keyword details</CardTitle>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="keyword-term" className="text-sm font-medium">
                            Term
                        </label>

                        <input
                            id="keyword-term"
                            name="term"
                            type="text"
                            value={term}
                            onChange={(event) => setTerm(event.target.value)}
                            placeholder="e.g. Backend Engineer"
                            required
                            maxLength={100}
                            disabled={isSubmitting}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />

                        <p className="text-xs text-muted-foreground">
                            Enter a keyword or phrase used to filter job offers.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="keyword-type" className="text-sm font-medium">
                            Type
                        </label>

                        <select
                            id="keyword-type"
                            name="keyword_type"
                            value={keywordType}
                            onChange={(event) =>
                                setKeywordType(event.target.value as JobKeywordInput['keyword_type'])
                            }
                            disabled={isSubmitting}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="positive">Positive</option>
                            <option value="negative">Negative</option>
                        </select>

                        <p className="text-xs text-muted-foreground">
                            Positive keywords identify relevant offers; negative keywords help exclude irrelevant ones.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="keyword-weight" className="text-sm font-medium">
                            Weight
                        </label>

                        <select
                            id="keyword-weight"
                            name="weight"
                            value={weight}
                            onChange={(event) => setWeight(Number(event.target.value))}
                            disabled={isSubmitting}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {[1, 2, 3, 4, 5].map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            id="keyword-active"
                            name="is_active"
                            type="checkbox"
                            checked={isActive}
                            onChange={(event) => setIsActive(event.target.checked)}
                            disabled={isSubmitting}
                            className="size-4 rounded border-input accent-primary"
                        />

                        <label htmlFor="keyword-active" className="text-sm font-medium">
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

export default KeywordForm