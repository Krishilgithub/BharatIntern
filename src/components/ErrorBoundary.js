import React from "react";

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
		this.setState({
			error,
			errorInfo,
		});
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
					<div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
						<div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
							<svg
								className="w-6 h-6 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
						<h2 className="mt-4 text-xl font-bold text-gray-900 text-center">
							Oops! Something went wrong
						</h2>
						<p className="mt-2 text-sm text-gray-600 text-center">
							We encountered an error while loading this page.
						</p>
						{this.state.error && (
							<div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-700 font-mono overflow-auto max-h-40">
								{this.state.error.toString()}
							</div>
						)}
						<div className="mt-6 flex space-x-3">
							<button
								onClick={() => window.location.reload()}
								className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
							>
								Reload Page
							</button>
							<button
								onClick={() => window.history.back()}
								className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
							>
								Go Back
							</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
