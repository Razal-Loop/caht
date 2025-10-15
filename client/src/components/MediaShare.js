import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, Music, Video, File, X } from 'lucide-react';
import { uploadFile, getFileType, formatFileSize, validateFile } from '../utils/fileUpload';

const MediaShare = ({ isOpen, onMediaShare, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        console.log('Escape key pressed, closing modal');
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Debug modal state
  useEffect(() => {
    console.log('MediaShare modal isOpen:', isOpen);
  }, [isOpen]);

  // Handle click outside to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      console.log('Clicked outside modal, closing');
      onClose();
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      const mediaType = getFileType(file);
      
      onMediaShare({
        mediaUrl: result.fileUrl,
        mediaType: mediaType,
        fileName: result.fileName,
        fileSize: result.fileSize
      });

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        onClose();
      }, 500);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file');
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onMediaShare, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'video/*': ['.mp4', '.webm', '.ogg']
    },
    multiple: false,
    disabled: uploading
  });

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image size={24} />;
      case 'audio': return <Music size={24} />;
      case 'video': return <Video size={24} />;
      default: return <File size={24} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="media-share-overlay" onClick={handleOverlayClick}>
      <div className="media-share-modal">
        <div className="media-share-header">
          <h3>Share Media</h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="media-share-content">
          {uploading ? (
            <div className="upload-progress">
              <div className="upload-icon">
                <Upload size={32} />
              </div>
              <h4>Uploading...</h4>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p>{uploadProgress}% complete</p>
            </div>
          ) : (
            <div 
              {...getRootProps()} 
              className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="dropzone-content">
                <Upload size={48} />
                <h4>
                  {isDragActive 
                    ? 'Drop the file here...' 
                    : 'Drag & drop a file here, or click to select'
                  }
                </h4>
                <p>Supports images, audio, and video files (max 10MB)</p>
                
                <div className="supported-formats">
                  <div className="format-item">
                    {getFileIcon('image')}
                    <span>Images</span>
                  </div>
                  <div className="format-item">
                    {getFileIcon('audio')}
                    <span>Audio</span>
                  </div>
                  <div className="format-item">
                    {getFileIcon('video')}
                    <span>Video</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaShare;

