/**
 * CV/Resume Tab Component - PDF Upload Only
 * Users can upload, view, and delete their CV as a PDF file
 */
import React, { useState, useEffect } from "react";
import cvAPI from "../../services/cvService";

const CVTab = ({ profile, onUpdate, onError, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFilename, setPdfFilename] = useState(null);
  const [uploadingPDF, setUploadingPDF] = useState(false);

  // Load CV PDF info on mount
  useEffect(() => {
    loadCVPDF();
  }, []);

  const loadCVPDF = async () => {
    try {
      setLoading(true);
      const cv = await cvAPI.getCV();
      setPdfFilename(cv.cv_pdf_filename || null);
    } catch (err) {
      // CV doesn't exist yet, that's okay
      if (err.response?.status !== 404) {
        console.error("Error loading CV:", err);
        onError(
          "Failed to load CV: " + (err.response?.data?.detail || err.message)
        );
      } else {
        console.log("No CV found yet - this is normal for new users");
      }
    } finally {
      setLoading(false);
    }
  };

  // PDF handlers
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        onError("Only PDF files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        onError("File size exceeds 10MB limit");
        return;
      }
      setPdfFile(file);
    }
  };

  const handleUploadPDF = async () => {
    if (!pdfFile) {
      onError("Please select a PDF file first");
      return;
    }

    try {
      setUploadingPDF(true);
      onError(null);
      const result = await cvAPI.uploadPDF(pdfFile);
      setPdfFilename(pdfFile.name);
      setPdfFile(null);
      // Reset file input
      const fileInput = document.getElementById("cv-pdf-upload");
      if (fileInput) fileInput.value = "";
      onSuccess(result.message || "CV PDF uploaded successfully!");
    } catch (err) {
      onError(err.response?.data?.detail || "Failed to upload PDF");
      console.error("Error uploading PDF:", err);
    } finally {
      setUploadingPDF(false);
    }
  };

  const handleViewPDF = async () => {
    try {
      const blob = await cvAPI.downloadPDF();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      onError(err.response?.data?.detail || "Failed to download PDF");
      console.error("Error downloading PDF:", err);
    }
  };

  const handleDeletePDF = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your CV PDF? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setUploadingPDF(true);
      onError(null);
      await cvAPI.deletePDF();
      setPdfFilename(null);
      onSuccess("CV PDF deleted successfully!");
    } catch (err) {
      onError(err.response?.data?.detail || "Failed to delete PDF");
      console.error("Error deleting PDF:", err);
    } finally {
      setUploadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="tab-panel">
        <div className="profile-loading">Loading CV...</div>
      </div>
    );
  }

  return (
    <div className="tab-panel">
      <div>
        <h2>CV/Resume</h2>
        <p className="tab-description">
          Upload your CV/resume as a PDF file. You can only have one PDF at a
          time. To upload a new PDF, delete the current one first.
        </p>
      </div>

      <div className="cv-section" style={{ marginTop: "30px" }}>
        <h3>CV/Resume PDF</h3>
        <p
          className="read-only-note"
          style={{ marginBottom: "20px", color: "#94a3b8" }}
        >
          Upload your CV/resume as a PDF file (max 10MB). The PDF will be stored
          securely and can be viewed or downloaded later.
        </p>

        {pdfFilename ? (
          <div
            style={{
              padding: "20px",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "12px",
              marginBottom: "25px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
              }}
            >
              <div style={{ flex: 1, minWidth: "200px" }}>
                <p
                  style={{
                    margin: "0 0 8px 0",
                    color: "#86efac",
                    fontWeight: "600",
                    fontSize: "16px",
                  }}
                >
                  ✓ PDF Uploaded
                </p>
                <p
                  style={{
                    margin: "0",
                    color: "#cbd5e1",
                    fontSize: "14px",
                    wordBreak: "break-word",
                  }}
                >
                  📄 {pdfFilename}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleViewPDF}
                  className="home-btn home-btn-primary"
                  style={{ padding: "10px 20px", fontSize: "14px" }}
                >
                  👁️ View PDF
                </button>
                <button
                  type="button"
                  onClick={handleDeletePDF}
                  className="home-btn"
                  style={{
                    padding: "10px 20px",
                    fontSize: "14px",
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    color: "#fca5a5",
                  }}
                  disabled={uploadingPDF}
                >
                  {uploadingPDF ? "Deleting..." : "🗑️ Delete"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "20px",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "12px",
              marginBottom: "25px",
            }}
          >
            <p
              style={{
                margin: "0 0 15px 0",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              No CV PDF uploaded yet. Select a PDF file below to upload.
            </p>
          </div>
        )}

        <div className="form-group">
          <label>Upload CV PDF</label>
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              id="cv-pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              disabled={uploadingPDF || !!pdfFilename}
              style={{
                flex: 1,
                minWidth: "250px",
                padding: "12px",
                backgroundColor: "rgba(15, 23, 42, 0.7)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "8px",
                color: "#ffffff",
                cursor: pdfFilename ? "not-allowed" : "pointer",
                opacity: pdfFilename ? 0.6 : 1,
              }}
            />
            {pdfFile && !pdfFilename && (
              <button
                type="button"
                onClick={handleUploadPDF}
                className="home-btn home-btn-primary"
                disabled={uploadingPDF}
                style={{ minWidth: "140px", padding: "12px 20px" }}
              >
                {uploadingPDF ? "Uploading..." : "📤 Upload PDF"}
              </button>
            )}
          </div>
          {pdfFile && !pdfFilename && (
            <p
              style={{
                margin: "10px 0 0 0",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              Selected:{" "}
              <strong style={{ color: "#ffffff" }}>{pdfFile.name}</strong> (
              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          {pdfFilename && (
            <p
              style={{
                margin: "10px 0 0 0",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              To upload a new PDF, delete the current one first.
            </p>
          )}
          {!pdfFilename && (
            <p
              style={{
                margin: "10px 0 0 0",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              <strong>Note:</strong> Only PDF files are accepted. Maximum file
              size is 10MB.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVTab;
