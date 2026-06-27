/**
 * SocialSell — Cloudinary Integration
 *
 * Uses Cloudinary's Upload Widget (no server needed for unsigned uploads)
 * and generates signed URLs for protected product files.
 *
 * Cloudinary free tier: 25GB storage, 25GB bandwidth/month — plenty for early stage.
 *
 * Setup:
 *  1. Create a Cloudinary account at cloudinary.com
 *  2. Note your Cloud Name from the Dashboard
 *  3. Create an unsigned upload preset:
 *     Settings → Upload → Upload Presets → Add Preset → Unsigned
 *  4. Create a SECOND preset "socialsell_products" for product files with:
 *     - Allowed formats: pdf, zip, mp3, mp4, png, jpg, gif
 *     - Max file size: 500MB
 *     - Auto-tagging: on
 */

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET_PUBLIC  = process.env.REACT_APP_CLOUDINARY_PRESET_PUBLIC;   // for images
const UPLOAD_PRESET_PRIVATE = process.env.REACT_APP_CLOUDINARY_PRESET_PRIVATE;  // for product files

// ─── URL builders ─────────────────────────────────────────────────────────────

/** Build an optimised public image URL */
export function imageUrl(publicId, { width, height, quality = "auto", format = "auto" } = {}) {
  const transforms = [
    `q_${quality}`,
    `f_${format}`,
    width  ? `w_${width}`  : null,
    height ? `h_${height}` : null,
    "c_fill",
  ].filter(Boolean).join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

/** Build a video/preview URL */
export function videoUrl(publicId, { width } = {}) {
  const transforms = [`q_auto`, `f_auto`, width ? `w_${width}` : null].filter(Boolean).join(",");
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${transforms}/${publicId}`;
}

/**
 * Build a signed, expiring URL for purchased product files.
 * IMPORTANT: Signing must happen server-side (Edge Function).
 * This function calls your Supabase Edge Function which does the signing.
 */
export async function signedDownloadUrl(publicId, orderId) {
  const res = await fetch(
    `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/sign-download`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}`,
      },
      body: JSON.stringify({ publicId, orderId }),
    }
  );
  if (!res.ok) throw new Error("Could not generate download link");
  const { url } = await res.json();
  return url;                        // expires in 1 hour
}

// ─── Upload Widget ─────────────────────────────────────────────────────────────

/**
 * Lazy-load Cloudinary Upload Widget script.
 * Returns a promise that resolves when the script is ready.
 */
function loadCloudinaryWidget() {
  return new Promise((resolve, reject) => {
    if (window.cloudinary) return resolve(window.cloudinary);
    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.onload  = () => resolve(window.cloudinary);
    script.onerror = () => reject(new Error("Failed to load Cloudinary widget"));
    document.head.appendChild(script);
  });
}

/**
 * Open the Cloudinary Upload Widget.
 *
 * @param {object} options
 * @param {"image"|"file"} options.type    - "image" for covers/avatars, "file" for product files
 * @param {function} options.onUpload      - Called with { public_id, secure_url, format, bytes }
 * @param {function} [options.onError]     - Called with error
 * @param {number}   [options.maxFiles]    - Default 1
 */
export async function openUploadWidget({ type = "image", onUpload, onError, maxFiles = 1 }) {
  const cld = await loadCloudinaryWidget();

  const preset = type === "image" ? UPLOAD_PRESET_PUBLIC : UPLOAD_PRESET_PRIVATE;

  const baseOptions = {
    cloudName:     CLOUD_NAME,
    uploadPreset:  preset,
    multiple:      maxFiles > 1,
    maxFiles,
    resourceType:  type === "image" ? "image" : "raw",
  };

  const imageOptions = {
    ...baseOptions,
    sources:        ["local", "url", "camera"],
    cropping:       true,
    croppingAspectRatio: 16 / 9,
    croppingDefaultSelectionRatio: 0.8,
    clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif"],
    maxFileSize:    10_000_000,     // 10MB
    styles: {
      palette: {
        window:      "#FFFFFF",
        windowBorder:"#6C63FF",
        tabIcon:     "#6C63FF",
        menuIcons:   "#5A616A",
        textDark:    "#000000",
        textLight:   "#FFFFFF",
        link:        "#6C63FF",
        action:      "#4F46E5",
        inactiveTabIcon: "#0E2F5A",
        error:       "#F44235",
        inProgress:  "#6C63FF",
        complete:    "#10B981",
        sourceBg:    "#F4F5F5",
      },
    },
  };

  const fileOptions = {
    ...baseOptions,
    sources:        ["local"],
    clientAllowedFormats: ["pdf", "zip", "mp3", "mp4", "epub", "mobi"],
    maxFileSize:    500_000_000,    // 500MB
  };

  const widget = cld.createUploadWidget(
    type === "image" ? imageOptions : fileOptions,
    (error, result) => {
      if (error) { if (onError) onError(error); return; }
      if (result.event === "success") {
        const { public_id, secure_url, format, bytes } = result.info;
        onUpload({ publicId: public_id, url: secure_url, format, sizeBytes: bytes });
      }
    }
  );

  widget.open();
  return widget;
}

// ─── React hook ───────────────────────────────────────────────────────────────
import { useState, useCallback } from "react";

/**
 * useCloudinaryUpload()
 *
 * const { upload, uploading, result, error } = useCloudinaryUpload();
 *
 * <button onClick={() => upload({ type: "image", onUpload: setImage })}>
 *   Upload cover image
 * </button>
 */
export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);

  const upload = useCallback(({ type = "image", maxFiles = 1 } = {}) => {
    return new Promise((resolve, reject) => {
      setUploading(true);
      setError(null);
      openUploadWidget({
        type,
        maxFiles,
        onUpload: (data) => {
          setResult(data);
          setUploading(false);
          resolve(data);
        },
        onError: (err) => {
          setError(err);
          setUploading(false);
          reject(err);
        },
      });
    });
  }, []);

  return { upload, uploading, result, error };
}

// ─── ImageUpload component ────────────────────────────────────────────────────
import React from "react";

/**
 * Drop-in image upload button with preview.
 *
 * <ImageUpload
 *   label="Cover image"
 *   value={coverUrl}
 *   onChange={(url) => setCoverUrl(url)}
 * />
 */
export function ImageUpload({ label, value, onChange, type = "image", style }) {
  const { upload, uploading } = useCloudinaryUpload();

  const handleClick = async () => {
    try {
      const res = await upload({ type });
      onChange(res.url);
    } catch (e) {
      console.error("Upload failed:", e);
    }
  };

  return (
    <div style={style}>
      {label && <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6, fontWeight: 600 }}>{label}</label>}
      <div
        onClick={handleClick}
        style={{
          border: "2px dashed #c4c0f5",
          borderRadius: 10,
          padding: value ? 0 : "24px 16px",
          textAlign: "center",
          cursor: "pointer",
          overflow: "hidden",
          background: "#f8f7ff",
          transition: "border-color .2s",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#6C63FF"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#c4c0f5"}
      >
        {value ? (
          <div style={{ position: "relative" }}>
            <img src={value} alt="Upload preview" style={{ width: "100%", display: "block", maxHeight: 200, objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity .2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Change image</span>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{uploading ? "⏳" : "☁️"}</div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>{uploading ? "Uploading..." : "Click to upload"}</p>
            <p style={{ fontSize: 11, color: "#bbb" }}>JPG, PNG, WEBP · max 10MB</p>
          </>
        )}
      </div>
    </div>
  );
}
