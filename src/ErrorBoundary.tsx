import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // console.error("Error caught by ErrorBoundary: ", error, errorInfo);
  }

  componentDidUpdate(_: Props, prevState: State) {
    if (this.state.hasError && !prevState.hasError) {
      window.location.reload();
    }
  }

  render() {
    // if (this.state.hasError) {
    //   return null;
    // }

    return this.props.children;
  }
}

export default ErrorBoundary;
