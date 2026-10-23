import type { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'

type SummaryCardProps = {
    title: string
    value: number | string
    description: string
    icon: ReactNode
}

export default function SummaryCard({
    title,
    value,
    description,
    icon,
}: SummaryCardProps) {
    return (
        <Card className="gap-4 py-5">
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-muted-foreground">
                    {title}
                </p>

                <span className="text-muted-foreground">{icon}</span>
                </div>

                <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {value}
                </p>

                <p className="text-xs leading-relaxed text-muted-foreground">
                {description}
                </p>
            </CardContent>
        </Card>
    )
}