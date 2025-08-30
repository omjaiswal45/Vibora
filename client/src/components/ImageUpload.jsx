import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";

const ImageUpload = ({ onImagesSelected, maxImages = 5 }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (selectedImages.length + imageFiles.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    const newImages = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
    onImagesSelected([...selectedImages, ...newImages].map(img => img.file));
  };

  const removeImage = (imageId) => {
    setSelectedImages(prev => {
      const filtered = prev.filter(img => img.id !== imageId);
      onImagesSelected(filtered.map(img => img.file));
      return filtered;
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Drag & Drop Area */}
      {selectedImages.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-purple-500 bg-purple-50"
              : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-2">
            <Upload 
              size={24} 
              className={`${
                dragActive ? "text-purple-500" : "text-gray-400"
              }`} 
            />
            <p className="text-sm text-gray-600">
              Drag and drop images here, or{" "}
              <button
                type="button"
                onClick={openFileDialog}
                className="text-purple-500 hover:text-purple-600 font-medium"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Maximum {maxImages} images, 5MB each
            </p>
          </div>
        </div>
      )}

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedImages.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.preview}
                alt="Preview"
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image Count */}
      {selectedImages.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          {selectedImages.length} of {maxImages} images selected
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
