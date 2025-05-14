import React, { Component, ErrorInfo, ReactNode } from "react";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";
import { Link } from "react-router-dom";
import Layout from "../layout/Layout";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You could log the error to an error reporting service here
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <Layout>
          <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[60vh]">
            <div className="text-center">
              <div className="rounded-full bg-red-100 p-4 inline-block mb-4">
                <FaExclamationTriangle className="text-red-600 text-4xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Something went wrong
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                We're sorry, but we encountered an error while processing your request.
              </p>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Refresh page
                </button>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white border-indigo-600 hover:bg-gray-50"
                >
                  <FaHome className="mr-2" /> Return Home
                </Link>
              </div>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mt-8 text-left bg-gray-100 p-4 rounded-md overflow-auto max-h-64">
                  <p className="font-medium mb-2 text-gray-800">Error details:</p>
                  <pre className="text-sm text-red-800">
                    {this.state.error.toString()}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </Layout>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
