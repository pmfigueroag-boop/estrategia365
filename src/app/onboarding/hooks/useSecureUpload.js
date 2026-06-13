'use client';
/**
 * useSecureUpload — Hardened File Upload Validation
 * ===================================================
 * Client-side security layer for document uploads.
 * Validates: file type, extension, size, magic bytes, filename.
 * Designed to complement server-side validation (defense in depth).
 */
import { useCallback } from 'react';

// ── Security Constants ───────────────────────────────────

const ALLOWED_TYPES = {
  // Documents
  'application/pdf': { ext: ['.pdf'], maxMB: 25 },
  'application/msword': { ext: ['.doc'], maxMB: 15 },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: ['.docx'], maxMB: 15 },
  'application/vnd.ms-excel': { ext: ['.xls'], maxMB: 15 },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: ['.xlsx'], maxMB: 15 },
  'application/vnd.ms-powerpoint': { ext: ['.ppt'], maxMB: 30 },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: ['.pptx'], maxMB: 30 },
  // Images
  'image/jpeg': { ext: ['.jpg', '.jpeg'], maxMB: 10 },
  'image/png': { ext: ['.png'], maxMB: 10 },
  'image/webp': { ext: ['.webp'], maxMB: 10 },
  // Text
  'text/plain': { ext: ['.txt'], maxMB: 5 },
  'text/csv': { ext: ['.csv'], maxMB: 10 },
};

const GLOBAL_MAX_SIZE_MB = 30;
const MAX_FILENAME_LENGTH = 200;
const DANGEROUS_PATTERNS = /[<>:"/\\|?*\x00-\x1f]/g;
const DOUBLE_EXTENSION_PATTERN = /\.\w+\.\w+$/;

// Magic bytes for common file types
const MAGIC_BYTES = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47], // .PNG
  'image/webp': null, // RIFF header — complex check
};

// ── Validation Functions ─────────────────────────────────

function validateFileType(file) {
  const typeConfig = ALLOWED_TYPES[file.type];
  if (!typeConfig) {
    return { valid: false, error: `Tipo de archivo no permitido: ${file.type || 'desconocido'}` };
  }
  return { valid: true };
}

function validateExtension(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const typeConfig = ALLOWED_TYPES[file.type];
  if (!typeConfig || !typeConfig.ext.includes(ext)) {
    return { valid: false, error: `Extensión no permitida: ${ext}` };
  }
  return { valid: true };
}

function validateSize(file) {
  const typeConfig = ALLOWED_TYPES[file.type];
  const maxMB = typeConfig?.maxMB || GLOBAL_MAX_SIZE_MB;
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(1)}MB (máx: ${maxMB}MB)` };
  }
  if (file.size === 0) {
    return { valid: false, error: 'Archivo vacío' };
  }
  return { valid: true };
}

function validateFilename(file) {
  if (file.name.length > MAX_FILENAME_LENGTH) {
    return { valid: false, error: `Nombre de archivo demasiado largo (máx: ${MAX_FILENAME_LENGTH} caracteres)` };
  }
  if (DANGEROUS_PATTERNS.test(file.name)) {
    return { valid: false, error: 'Nombre de archivo contiene caracteres no permitidos' };
  }
  if (DOUBLE_EXTENSION_PATTERN.test(file.name)) {
    return { valid: false, error: 'Archivos con doble extensión no son permitidos' };
  }
  return { valid: true };
}

async function validateMagicBytes(file) {
  const expectedBytes = MAGIC_BYTES[file.type];
  if (!expectedBytes) return { valid: true }; // No magic bytes check available

  try {
    const slice = file.slice(0, expectedBytes.length);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    for (let i = 0; i < expectedBytes.length; i++) {
      if (bytes[i] !== expectedBytes[i]) {
        return { valid: false, error: 'El contenido del archivo no coincide con su tipo declarado' };
      }
    }
  } catch {
    return { valid: false, error: 'No se pudo verificar el contenido del archivo' };
  }
  return { valid: true };
}

// ── Hook ─────────────────────────────────────────────────

export function useSecureUpload({ onUpload, onReject, analytics } = {}) {

  const validateFile = useCallback(async (file) => {
    const checks = [
      validateFileType(file),
      validateExtension(file),
      validateSize(file),
      validateFilename(file),
    ];

    for (const check of checks) {
      if (!check.valid) {
        analytics?.trackDocumentRejected?.(file.name, check.error);
        onReject?.(file, check.error);
        return { valid: false, error: check.error };
      }
    }

    // Async check: magic bytes
    const magicCheck = await validateMagicBytes(file);
    if (!magicCheck.valid) {
      analytics?.trackDocumentRejected?.(file.name, magicCheck.error);
      onReject?.(file, magicCheck.error);
      return { valid: false, error: magicCheck.error };
    }

    return { valid: true };
  }, [analytics, onReject]);

  const handleUpload = useCallback(async (file) => {
    const result = await validateFile(file);
    if (!result.valid) return result;

    analytics?.trackDocumentUploaded?.(file.name, file.size);
    onUpload?.(file);
    return { valid: true, file };
  }, [validateFile, analytics, onUpload]);

  const handleMultipleUpload = useCallback(async (files) => {
    const results = [];
    for (const file of files) {
      results.push(await handleUpload(file));
    }
    return results;
  }, [handleUpload]);

  return {
    validateFile,
    handleUpload,
    handleMultipleUpload,
    ALLOWED_TYPES,
    GLOBAL_MAX_SIZE_MB,
    // Convenience: accept string for <input type="file">
    acceptString: Object.values(ALLOWED_TYPES)
      .flatMap(c => c.ext)
      .join(','),
  };
}
