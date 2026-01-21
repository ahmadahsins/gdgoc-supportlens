'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, FileText, Trash2, CheckCircle, XCircle, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface KnowledgeDocument {
  id: string;
  filename: string;
  uploadedAt: string;
  size: number;
  status: 'processing' | 'ready' | 'error';
}

export default function KnowledgeBasePage() {
  const { role, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!authLoading && role === 'admin') {
      loadDocuments();
    }
  }, [authLoading, role]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.getKnowledgeBase();
      setDocuments(response.data);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload PDF, TXT, or DOCX files only');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      await api.uploadKnowledge(formData);
      await loadDocuments();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.deleteKnowledge(id);
      await loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const cardStyle = 'bg-gradient-to-br from-[#0E402D]/50 to-[#000000] border-[#295135]/50';

  // Check if user has admin access
  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9FCC2E]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (role !== 'admin') {
    return (
      <DashboardLayout>
        <div className={`rounded-xl border p-16 text-center ${cardStyle}`}>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500/20">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2 text-[#9FCC2E]">Akses Ditolak</h2>
              <p className="text-[#5A6650]">
                Hanya admin yang dapat mengakses halaman Knowledge Base.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-wide text-[#9FCC2E]" style={{ textShadow: '0 0 20px rgba(159, 204, 46, 0.3)' }}>
            KNOWLEDGE BASE
          </h1>
          <p className="mt-1 font-mono text-sm tracking-wider text-[#5A6650]">
            UPLOAD DOCUMENTS TO HELP AI PROVIDE BETTER SUPPORT RESPONSES
          </p>
        </div>

        {/* Upload Area */}
        <div className={`rounded-xl border p-6 ${cardStyle}`}>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-[#9FCC2E] bg-[#9FCC2E]/10'
                : 'border-[#295135] hover:border-[#9FCC2E]/50'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileInput}
              accept=".pdf,.txt,.docx"
              disabled={uploading}
            />
            
            {uploading ? (
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-[#9FCC2E]"></div>
                <p className="text-lg font-medium text-[#9FCC2E]">Uploading...</p>
                <p className="text-sm mt-2 text-[#5A6650]">
                  Please wait while we process your document
                </p>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 mx-auto mb-4 text-[#5A6650]" />
                <h3 className="text-lg font-medium mb-2 text-[#9FCC2E]">
                  Upload Knowledge Document
                </h3>
                <p className="text-sm mb-4 text-[#5A6650]">
                  Drag and drop your file here, or click to browse
                </p>
                <label 
                  htmlFor="file-upload" 
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors bg-[#9FCC2E] text-black hover:bg-[#9FCC2E]/80"
                >
                  Select File
                </label>
                <p className="text-xs mt-4 text-[#5A6650]/60">
                  Supported formats: PDF, TXT, DOCX (Max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Documents List */}
        <div className={`rounded-xl border ${cardStyle}`}>
          <div className="p-6 border-b border-[#295135]/50">
            <h3 className="text-lg font-semibold text-[#9FCC2E]">Uploaded Documents</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto border-[#9FCC2E]"></div>
                <p className="mt-4 text-[#5A6650]">
                  Loading documents...
                </p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-[#5A6650]" />
                <p className="text-[#5A6650]">
                  No documents uploaded yet
                </p>
                <p className="text-sm mt-2 text-[#5A6650]/60">
                  Upload your first document to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border transition-colors border-[#295135]/50 hover:bg-[#295135]/20"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <FileText className="w-8 h-8 mr-4 shrink-0 text-[#9FCC2E]" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate text-white">
                          {doc.filename}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-[#5A6650]">
                            {formatFileSize(doc.size)}
                          </span>
                          <span className="text-xs text-[#5A6650]">
                            {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                          </span>
                          {doc.status === 'ready' && (
                            <span className="inline-flex items-center text-xs text-emerald-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ready
                            </span>
                          )}
                          {doc.status === 'processing' && (
                            <span className="inline-flex items-center text-xs text-[#9FCC2E]">
                              <div className="animate-spin rounded-full h-3 w-3 border-b mr-1 border-[#9FCC2E]"></div>
                              Processing
                            </span>
                          )}
                          {doc.status === 'error' && (
                            <span className="inline-flex items-center text-xs text-red-500">
                              <XCircle className="w-3 h-3 mr-1" />
                              Error
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="ml-4 p-2 rounded-lg transition-colors text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className={`rounded-xl border ${cardStyle}`}>
          <div className="p-6 border-b border-[#295135]/50">
            <h3 className="text-lg font-semibold text-[#9FCC2E]">How it works</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3 text-sm text-[#5A6650]">
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0 bg-[#9FCC2E]/20">
                  <span className="text-xs font-bold text-[#9FCC2E]">1</span>
                </div>
                <p>
                  Upload documents containing product information, FAQs, policies, or any relevant content
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0 bg-[#9FCC2E]/20">
                  <span className="text-xs font-bold text-[#9FCC2E]">2</span>
                </div>
                <p>
                  AI processes and indexes the content to understand your knowledge base
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0 bg-[#9FCC2E]/20">
                  <span className="text-xs font-bold text-[#9FCC2E]">3</span>
                </div>
                <p>
                  When generating responses, AI references these documents to provide accurate, context-aware support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
