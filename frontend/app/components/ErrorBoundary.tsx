"use client";
import { Component, ErrorInfo, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[S-TAG ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-white">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
              <span
                className="material-symbols-outlined text-red-500 text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                error
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Noe gikk galt
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              En uventet feil oppsto. Prøv å laste siden på nytt.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-block px-8 py-3 rounded-xl bg-[#0f2a5c] text-white font-bold hover:bg-[#1a3d7c] transition"
            >
              Last inn på nytt
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="mt-6 text-left text-xs text-red-600 bg-red-50 rounded-xl p-4 overflow-x-auto border border-red-200">
                {this.state.error.message}
                {"\n"}
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
