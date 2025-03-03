
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
  children?: React.ReactNode;
}

// Define a type-safe helper to check if a React element is a DialogHeader
function isDialogHeader(element: React.ReactElement): element is React.ReactElement<{children: React.ReactNode}> {
  return element.type === ShadcnDialogHeader;
}

// Define a type-safe helper to check if a React element is a DialogDescription
function isDialogDescription(element: React.ReactElement): boolean {
  return element.type === ShadcnDialogDescription;
}

export const EnhancedDialogContent: React.FC<EnhancedDialogContentProps> = ({
  children,
  noDescription = false,
  defaultDescription = "Dialog content",
  ...props
}) => {
  // Check if there's a DialogDescription among the children
  const hasDescription = React.Children.toArray(children).some((child) => {
    // Check for direct DialogDescription
    if (React.isValidElement(child) && isDialogDescription(child)) {
      return true;
    }
    
    // Check for DialogDescription inside DialogHeader
    if (React.isValidElement(child) && isDialogHeader(child)) {
      const headerChildren = React.Children.toArray(child.props.children);
      return headerChildren.some(
        (headerChild) => 
          React.isValidElement(headerChild) && 
          isDialogDescription(headerChild)
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
export type DialogProps = React.ComponentProps<typeof ShadcnDialog>;
