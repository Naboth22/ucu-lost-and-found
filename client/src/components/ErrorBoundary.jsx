import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F5F9] p-6 text-center">
          <div className="max-w-md rounded-xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#172B4D]">Something went wrong</h2>
            <p className="mt-2 text-sm text-[#64748B]">
              An unexpected interface error occurred. Please reload the page to continue.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-[#183B63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2878B9]"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
