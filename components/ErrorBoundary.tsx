"use client"

import { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
children: ReactNode
fallback?: ReactNode
}

interface ErrorBoundaryState {
hasError: boolean
error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
constructor(props: ErrorBoundaryProps) {
super(props)
this.state = { hasError: false }
}

static getDerivedStateFromError(error: Error): ErrorBoundaryState {
return { hasError: true, error }
}

componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
console.error("Error caught by ErrorBoundary:", error, errorInfo)
// Here you could also log to an error reporting service
}

render() {
if (this.state.hasError) {
if (this.props.fallback) {
return this.props.fallback
}

return (
<Card className="w-full max-w-md mx-auto my-8 border-red-300">
<CardHeader className="bg-red-50 text-red-700">
<CardTitle className="flex items-center gap-2">
<AlertTriangle size={20} />
Something went wrong
</CardTitle>
</CardHeader>
<CardContent className="pt-6">
<p className="text-sm text-gray-600 mb-4">
We encountered an error while trying to display this content.
</p>
{this.state.error && (
<div className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
{this.state.error.toString()}
</div>
)}
</CardContent>
<CardFooter>
<Button
variant="outline"
onClick={() => this.setState({ hasError: false, error: undefined })}
className="w-full"
>
Try again
</Button>
</CardFooter>
</Card>
)
}

return this.props.children
}
}

// HOC to wrap components with ErrorBoundary
export function withErrorBoundary<P extends object>(
Component: React.ComponentType<P>,
fallback?: ReactNode
) {
return function WithErrorBoundary(props: P) {
return (
<ErrorBoundary fallback={fallback}>
<Component {...props} />
</ErrorBoundary>
)
}
}