
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
} from "@/components/ui/dialog";
import { ComponentPropsWithoutRef } from "react";

// Define proper interface for DialogContent props
export interface EnhancedDialogContentProps extends ComponentPropsWithoutRef<typeof ShadcnDialogContent> {
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
      const headerChild = child.props.children;
      if (Array.isArray(headerChild)) {
        return headerChild.some(
          (hc) => React.isValidElement(hc) && hc.type === ShadcnDialogDescription
        );
      }
      return React.isValidElement(headerChild) && headerChild.type === ShadcnDialogDescription;
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
export type DialogProps = React.ComponentProps<typeof ShadcnDialog>;
