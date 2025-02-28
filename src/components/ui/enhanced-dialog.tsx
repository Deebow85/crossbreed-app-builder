
import React from "react";
import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogDescription as ShadcnDialogDescription,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogFooter as ShadcnDialogFooter,
  DialogTrigger as ShadcnDialogTrigger,
  DialogClose as ShadcnDialogClose,
  DialogProps as ShadcnDialogProps,
  DialogContentProps as ShadcnDialogContentProps,
} from "@/components/ui/dialog";

// Enhanced DialogContent with default description to avoid accessibility warnings
export interface EnhancedDialogContentProps extends ShadcnDialogContentProps {
  noDescription?: boolean;
  defaultDescription?: string;
}

export const EnhancedDialogContent: React.FC<EnhancedDialogContentProps> = ({
  children,
  noDescription = false,
  defaultDescription = "Dialog content",
  ...props
}) => {
  // Check if there's a DialogDescription among the children
  const hasDescription = React.Children.toArray(children).some((child) => {
    if (React.isValidElement(child) && child.type === ShadcnDialogDescription) {
      return true;
    }
    if (React.isValidElement(child) && child.type === ShadcnDialogHeader) {
      return React.Children.toArray(child.props.children).some(
        (headerChild) =>
          React.isValidElement(headerChild) && headerChild.type === ShadcnDialogDescription
      );
    }
    return false;
  });

  return (
    <ShadcnDialogContent {...props}>
      {children}
      {!hasDescription && !noDescription && (
        <span className="sr-only" id="dialog-description">
          {defaultDescription}
        </span>
      )}
    </ShadcnDialogContent>
  );
};

// Re-export all dialog components with our enhanced version
export const Dialog = ShadcnDialog;
export const DialogTrigger = ShadcnDialogTrigger;
export const DialogContent = EnhancedDialogContent;
export const DialogHeader = ShadcnDialogHeader;
export const DialogFooter = ShadcnDialogFooter;
export const DialogTitle = ShadcnDialogTitle;
export const DialogDescription = ShadcnDialogDescription;
export const DialogClose = ShadcnDialogClose;
export type DialogProps = ShadcnDialogProps;
