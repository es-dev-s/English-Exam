import { useRef, useState } from 'react';
import { downloadCandidateCv, uploadCandidateCv } from '../api/client';

const ACCEPTED_TYPES = '.pdf,.doc,.docx';
const ACCEPTED_LABEL = 'PDF, DOC, DOCX (max 5 MB)';

export default function CvUploadSection({ result, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasCv = Boolean(result.cv_original_name);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploading(true);
    try {
      const data = await uploadCandidateCv(result.result_id, file);
      setSuccess(data.message || 'CV uploaded successfully.');
      onUploaded?.({
        cv_stored_name: data.cv_stored_name,
        cv_original_name: data.cv_original_name,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDownload = async () => {
    setError('');
    setDownloading(true);
    try {
      const { blob, filename } = await downloadCandidateCv(result.result_id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="entegra-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
            <h3 className="font-semibold text-slate-900">Candidate CV</h3>
            <span className="text-xs text-slate-500">{ACCEPTED_LABEL}</span>
          </div>

          {hasCv ? (
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 min-w-0 max-w-full">
                <svg className="w-4 h-4 text-brand-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate">{result.cv_original_name}</span>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="entegra-btn-secondary text-sm py-1.5"
              >
                {downloading ? 'Downloading...' : 'Download CV'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 mt-1">No CV uploaded yet.</p>
          )}
        </div>

        <div className="shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="entegra-btn-primary text-sm py-2 px-4 w-full sm:w-auto"
          >
            {uploading ? 'Uploading...' : hasCv ? 'Replace CV' : 'Upload CV'}
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-xs mt-3">{error}</p>}
      {success && <p className="text-emerald-600 text-xs mt-3">{success}</p>}
    </div>
  );
}
