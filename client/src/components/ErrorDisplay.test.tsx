import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorDisplay from './ErrorDisplay';

describe('ErrorDisplay Component', () => {
  test('renders error message', () => {
    render(<ErrorDisplay message="Test error message" />);
    
    const errorMessage = screen.getByText(/Test error message/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('renders retry button when onRetry is provided', () => {
    const mockRetry = jest.fn();
    render(<ErrorDisplay message="Test error" onRetry={mockRetry} />);
    
    const retryButton = screen.getByText(/Try Again/i);
    expect(retryButton).toBeInTheDocument();
  });

  test('does not render retry button when onRetry is not provided', () => {
    render(<ErrorDisplay message="Test error" />);
    
    const retryButton = screen.queryByText(/Try Again/i);
    expect(retryButton).not.toBeInTheDocument();
  });

  test('calls onRetry when retry button is clicked', () => {
    const mockRetry = jest.fn();
    render(<ErrorDisplay message="Test error" onRetry={mockRetry} />);
    
    const retryButton = screen.getByText(/Try Again/i);
    fireEvent.click(retryButton);
    
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  test('renders dismiss button', () => {
    render(<ErrorDisplay message="Test error" />);
    
    const dismissButton = screen.getByLabelText(/Dismiss error/i);
    expect(dismissButton).toBeInTheDocument();
  });

  test('hides error when dismiss button is clicked', () => {
    render(<ErrorDisplay message="Test error" />);
    
    const dismissButton = screen.getByLabelText(/Dismiss error/i);
    fireEvent.click(dismissButton);
    
    const errorMessage = screen.queryByText(/Test error/i);
    expect(errorMessage).not.toBeInTheDocument();
  });

  test('has proper styling classes', () => {
    render(<ErrorDisplay message="Test error" />);
    
    const errorContainer = screen.getByText(/Test error/i).closest('div')?.parentElement?.parentElement;
    expect(errorContainer).toHaveClass('bg-red-50/80');
    expect(errorContainer).toHaveClass('border-red-300');
    expect(errorContainer).toHaveClass('text-red-700');
  });

  test('displays error icon', () => {
    render(<ErrorDisplay message="Test error" />);
    
    const errorIcon = screen.getByText(/Test error/i).closest('div')?.parentElement?.querySelector('svg');
    expect(errorIcon).toBeInTheDocument();
    expect(errorIcon).toHaveClass('text-red-400');
  });

  test('retry button has proper styling', () => {
    const mockRetry = jest.fn();
    render(<ErrorDisplay message="Test error" onRetry={mockRetry} />);
    
    const retryButton = screen.getByText(/Try Again/i);
    expect(retryButton).toHaveClass('bg-gradient-to-r');
    expect(retryButton).toHaveClass('from-pink-500');
    expect(retryButton).toHaveClass('to-indigo-500');
  });

  test('handles long error messages', () => {
    const longMessage = 'This is a very long error message that should still be displayed properly even when it contains a lot of text and might wrap to multiple lines.';
    render(<ErrorDisplay message={longMessage} />);
    
    const errorMessage = screen.getByText(longMessage);
    expect(errorMessage).toBeInTheDocument();
  });

  test('error container has animation class', () => {
    render(<ErrorDisplay message="Test error" />);
    
    const errorContainer = screen.getByText(/Test error/i).closest('div')?.parentElement?.parentElement;
    expect(errorContainer).toHaveClass('animate-fade-in');
  });

  test('shows different error types with appropriate styling', () => {
    const { rerender } = render(<ErrorDisplay message="Network error" type="network" />);
    
    let errorContainer = screen.getByText(/Network error/i).closest('div')?.parentElement?.parentElement;
    expect(errorContainer).toHaveClass('bg-red-50/80');
    
    rerender(<ErrorDisplay message="Configuration error" type="configuration" />);
    errorContainer = screen.getByText(/Configuration error/i).closest('div')?.parentElement?.parentElement;
    expect(errorContainer).toHaveClass('bg-orange-50/80');
    
    rerender(<ErrorDisplay message="Validation error" type="validation" />);
    errorContainer = screen.getByText(/Validation error/i).closest('div')?.parentElement?.parentElement;
    expect(errorContainer).toHaveClass('bg-yellow-50/80');
  });
});