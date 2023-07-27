"use client";

import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

// TODO use the Next.js ErrorBoundary component (error.js)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
      showModal: false,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error.toString(),
      showModal: true,
    };
  }

  hideDialog = () => {
    this.setState({ showModal: false });
  };

  render() {
    const footer = (
      <div>
        <Button label="Close" icon="pi pi-check" onClick={this.hideDialog} />
      </div>
    );

    if (this.state.hasError) {
      return (
        <Dialog
          header="An error occurred!"
          visible={this.state.showModal}
          style={{ width: "50vw" }}
          footer={footer}
          onHide={this.hideDialog}
        >
          <p>{this.state.errorMessage}</p>
        </Dialog>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
