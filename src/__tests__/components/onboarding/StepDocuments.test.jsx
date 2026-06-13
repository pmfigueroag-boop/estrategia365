import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StepDocuments from '@/features/onboarding/components/StepDocuments';

// Mock the api module
vi.mock('@/lib/api', () => ({
  default: {
    uploadDocument: vi.fn(),
    deleteDocument: vi.fn(),
  },
}));

// Mock the ToastContext
vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

describe('StepDocuments', () => {
  let onPrev, onNext, setDocuments;

  beforeEach(() => {
    onPrev = vi.fn();
    onNext = vi.fn();
    setDocuments = vi.fn();
  });

  it('renders the document upload heading', () => {
    render(
      <StepDocuments
        onPrev={onPrev}
        onNext={onNext}
        institutionId={1}
        documents={[]}
        setDocuments={setDocuments}
      />
    );
    expect(screen.getByText(/Carga de Documentos/)).toBeInTheDocument();
  });

  it('renders drag-and-drop upload area', () => {
    render(
      <StepDocuments
        onPrev={onPrev}
        onNext={onNext}
        institutionId={1}
        documents={[]}
        setDocuments={setDocuments}
      />
    );
    expect(screen.getByText(/Arrastra un archivo/)).toBeInTheDocument();
  });

  it('renders supported file types info', () => {
    render(
      <StepDocuments
        onPrev={onPrev}
        onNext={onNext}
        institutionId={1}
        documents={[]}
        setDocuments={setDocuments}
      />
    );
    expect(screen.getByText(/PDF, TXT, CSV, MD/)).toBeInTheDocument();
  });

  it('renders document type selector with options', () => {
    render(
      <StepDocuments
        onPrev={onPrev}
        onNext={onNext}
        institutionId={1}
        documents={[]}
        setDocuments={setDocuments}
      />
    );
    expect(screen.getByText(/Tipo de documento/)).toBeInTheDocument();
    const select = screen.getByText(/Documento General/).closest('select');
    expect(select).toBeInTheDocument();
  });

  it('renders uploaded documents list when documents exist', () => {
    const docs = [
      { id: 1, filename: 'plan.pdf', doc_type: 'strategic_plan', extracted_text: 'content...' },
      { id: 2, filename: 'finances.csv', doc_type: 'financial', extracted_text: 'data...' },
    ];
    render(
      <StepDocuments
        onPrev={onPrev}
        onNext={onNext}
        institutionId={1}
        documents={docs}
        setDocuments={setDocuments}
      />
    );
    expect(screen.getByText('plan.pdf')).toBeInTheDocument();
    expect(screen.getByText('finances.csv')).toBeInTheDocument();
    expect(screen.getByText(/Documentos Cargados \(2\)/)).toBeInTheDocument();
  });

  it('does not render document list when no documents', () => {
    render(
      <StepDocuments
        onPrev={onPrev}
        onNext={onNext}
        institutionId={1}
        documents={[]}
        setDocuments={setDocuments}
      />
    );
    expect(screen.queryByText(/Documentos Cargados/)).not.toBeInTheDocument();
  });

  it('calls onPrev when "Anterior" button is clicked', () => {
    render(
      <StepDocuments
        onPrev={onPrev}
        onNext={onNext}
        institutionId={1}
        documents={[]}
        setDocuments={setDocuments}
      />
    );
    fireEvent.click(screen.getByText(/Anterior/));
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when "Siguiente" button is clicked', () => {
    render(
      <StepDocuments
        onPrev={onPrev}
        onNext={onNext}
        institutionId={1}
        documents={[]}
        setDocuments={setDocuments}
      />
    );
    fireEvent.click(screen.getByText(/Siguiente/));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('renders delete button for each document', () => {
    const docs = [
      { id: 1, filename: 'plan.pdf', doc_type: 'general', extracted_text: '' },
    ];
    render(
      <StepDocuments
        onPrev={onPrev}
        onNext={onNext}
        institutionId={1}
        documents={docs}
        setDocuments={setDocuments}
      />
    );
    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.textContent.includes('🗑')
    );
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows extracted text character count for documents', () => {
    const docs = [
      { id: 1, filename: 'report.pdf', doc_type: 'strategic_plan', extracted_text: 'x'.repeat(500) },
    ];
    render(
      <StepDocuments
        onPrev={onPrev}
        onNext={onNext}
        institutionId={1}
        documents={docs}
        setDocuments={setDocuments}
      />
    );
    expect(screen.getByText(/500 caracteres extraídos/)).toBeInTheDocument();
  });
});
