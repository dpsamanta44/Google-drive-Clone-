import React, { useState, useEffect } from 'react';
import { Upload, Folder, File, Search, Grid, List, Download, Trash2, Plus, Home, Star, Clock, FolderPlus, X, Eye, ChevronRight } from 'lucide-react';

export default function DriveClone() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'My Drive' }]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    // Initialize with sample data
    const sampleFolders = [
      { id: 'f1', name: 'Documents', parentId: null, createdAt: new Date('2025-01-15') },
      { id: 'f2', name: 'Images', parentId: null, createdAt: new Date('2025-02-10') },
      { id: 'f3', name: 'Work Projects', parentId: null, createdAt: new Date('2025-03-05') }
    ];
    setFolders(sampleFolders);
  }, []);

  const getCurrentItems = () => {
    const currentFiles = files.filter(f => f.parentId === currentFolder);
    const currentFolders = folders.filter(f => f.parentId === currentFolder);
    
    if (searchQuery) {
      return {
        files: currentFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())),
        folders: currentFolders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      };
    }
    
    return { files: currentFiles, folders: currentFolders };
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const newFiles = uploadedFiles.map(file => ({
      id: `file_${Date.now()}_${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      parentId: currentFolder,
      createdAt: new Date(),
      data: file,
      url: URL.createObjectURL(file)
    }));
    
    setFiles([...files, ...newFiles]);
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder = {
      id: `folder_${Date.now()}`,
      name: newFolderName,
      parentId: currentFolder,
      createdAt: new Date()
    };
    
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const openFolder = (folder) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
    setSelectedItems(new Set());
  };

  const navigateToBreadcrumb = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    setSelectedItems(new Set());
  };

  const deleteSelected = () => {
    setFiles(files.filter(f => !selectedItems.has(f.id)));
    setFolders(folders.filter(f => !selectedItems.has(f.id)));
    setSelectedItems(new Set());
  };

  const downloadFile = (file) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    a.click();
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return '🖼️';
    if (type?.startsWith('video/')) return '🎥';
    if (type?.startsWith('audio/')) return '🎵';
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('document') || type?.includes('text')) return '📝';
    if (type?.includes('spreadsheet') || type?.includes('excel')) return '📊';
    return '📄';
  };

  const { files: displayFiles, folders: displayFolders } = getCurrentItems();

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Google Drive</h1>
          
          <label className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition mb-4">
            <Plus size={20} />
            <span className="font-medium">New</span>
            <input type="file" multiple onChange={handleFileUpload} className="hidden" />
          </label>
          
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <FolderPlus size={20} />
            <span>New Folder</span>
          </button>
        </div>
        
        <nav className="flex-1 px-2">
          <button
            onClick={() => navigateToBreadcrumb(0)}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <Home size={20} />
            <span>My Drive</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
              <Search size={20} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search in Drive"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mt-3 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                {index > 0 && <ChevronRight size={16} className="text-gray-400" />}
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className="text-gray-700 hover:text-blue-600"
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        {selectedItems.size > 0 && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-4">
            <span className="text-sm font-medium">{selectedItems.size} selected</span>
            <button
              onClick={deleteSelected}
              className="flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-100 rounded"
            >
              <Trash2 size={16} />
              Delete
            </button>
            <button
              onClick={() => setSelectedItems(new Set())}
              className="ml-auto text-sm text-gray-600 hover:text-gray-800"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* File Grid/List */}
        <div className="flex-1 overflow-auto p-6">
          {displayFolders.length === 0 && displayFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Folder size={64} className="mb-4" />
              <p className="text-lg">No files or folders</p>
              <p className="text-sm">Upload files or create folders to get started</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayFolders.map(folder => (
                <div
                  key={folder.id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition ${
                    selectedItems.has(folder.id) ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                  }`}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      toggleSelect(folder.id);
                    } else {
                      openFolder(folder);
                    }
                  }}
                >
                  <Folder size={40} className="text-gray-400 mb-2" />
                  <p className="font-medium truncate">{folder.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(folder.createdAt)}</p>
                </div>
              ))}
              
              {displayFiles.map(file => (
                <div
                  key={file.id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition group ${
                    selectedItems.has(file.id) ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                  }`}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      toggleSelect(file.id);
                    }
                  }}
                >
                  <div className="text-4xl mb-2">{getFileIcon(file.type)}</div>
                  <p className="font-medium truncate text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                  <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewFile(file);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(file);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Name</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Modified</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Size</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayFolders.map(folder => (
                    <tr
                      key={folder.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        selectedItems.has(folder.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                          toggleSelect(folder.id);
                        } else {
                          openFolder(folder);
                        }
                      }}
                    >
                      <td className="p-3 flex items-center gap-3">
                        <Folder size={20} className="text-gray-400" />
                        <span className="font-medium">{folder.name}</span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{formatDate(folder.createdAt)}</td>
                      <td className="p-3 text-sm text-gray-600">—</td>
                      <td className="p-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(folder.id);
                          }}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          •••
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {displayFiles.map(file => (
                    <tr
                      key={file.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        selectedItems.has(file.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                          toggleSelect(file.id);
                        }
                      }}
                    >
                      <td className="p-3 flex items-center gap-3">
                        <span className="text-2xl">{getFileIcon(file.type)}</span>
                        <span className="font-medium">{file.name}</span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{formatDate(file.createdAt)}</td>
                      <td className="p-3 text-sm text-gray-600">{formatFileSize(file.size)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewFile(file);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Preview"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadFile(file);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">New Folder</h2>
              <button onClick={() => setShowNewFolderModal(false)}>
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 outline-none focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{previewFile.name}</h2>
              <button onClick={() => setPreviewFile(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="flex justify-center">
              {previewFile.type?.startsWith('image/') ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[70vh]" />
              ) : previewFile.type?.startsWith('video/') ? (
                <video src={previewFile.url} controls className="max-w-full max-h-[70vh]" />
              ) : previewFile.type?.startsWith('audio/') ? (
                <audio src={previewFile.url} controls className="w-full" />
              ) : (
                <div className="text-center py-12">
                  <File size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Preview not available for this file type</p>
                  <button
                    onClick={() => downloadFile(previewFile)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
