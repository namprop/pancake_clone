import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { SearchInput } from "./SearchInput";
import { Button } from "./Button";
import { 
  X, 
  FolderPlus, 
  Clock, 
  Heart, 
  HelpCircle, 
  Command, 
  Plus,
  Trash2,
  PanelLeftClose,
  MoreHorizontal,
  ImageIcon,
  Folder
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (images: {id: string; url: string; name: string; file?: File}[]) => void;
}

export function ImageGalleryModal({ isOpen, onClose, onSelect }: ImageGalleryModalProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "favorites" | "all">("recent");
  const [images, setImages] = useState<{ id: string; url: string; name: string; isFavorite?: boolean; file?: File }[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayedImages = images.filter(img => activeTab === "favorites" ? img.isFavorite : true);

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folders, setFolders] = useState<{ id: string, name: string }[]>([]);
  const [isSavingFolder, setIsSavingFolder] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/image_folders');
      const data = await res.json();
      if (data.success) {
        setFolders(data.data);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || isSavingFolder) return;
    setIsSavingFolder(true);
    try {
      const res = await fetch('/api/image_folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFolders(prev => [data.data, ...prev]);
        setIsCreatingFolder(false);
        setNewFolderName("");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setIsSavingFolder(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        name: file.name,
        file: file,
      }));
      setImages((prev) => [...newImages, ...prev]);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedImageIds(prev => 
      prev.includes(id) ? prev.filter(imgId => imgId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    setImages(prev => prev.filter(img => !selectedImageIds.includes(img.id)));
    setSelectedImageIds([]);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-800">Thư mục ảnh</h2>
          
          <div className="flex items-center gap-4 flex-1 justify-center max-w-md">
             <SearchInput 
                placeholder="Tìm kiếm ảnh bằng tên" 
                className="w-full bg-gray-50 border-transparent focus:bg-white"
                width="100%"
              />
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-[260px] border-r border-gray-100 flex flex-col bg-slate-50/50">
            <div className="p-3">
              <div className="flex items-center gap-2 mb-4">
                <SearchInput 
                  placeholder="Tìm kiếm thư mục" 
                  className="bg-white"
                  width="100%"
                />
                <button 
                  onClick={() => setIsCreatingFolder(true)}
                  className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors shrink-0 border border-blue-100"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <button 
                  onClick={() => setActiveTab("recent")}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    activeTab === "recent" 
                      ? "bg-blue-50 text-blue-600 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Clock className="w-4 h-4" />
                  Tải lên gần đây
                </button>
                <button 
                  onClick={() => setActiveTab("favorites")}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    activeTab === "favorites" 
                      ? "bg-blue-50 text-blue-800 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Heart className={cn("w-4 h-4 text-pink-500", activeTab === "favorites" && "fill-pink-500")} />
                  Yêu thích
                </button>
              </div>

              {isCreatingFolder && (
                <div className="mt-2 px-1">
                  <input 
                    type="text" 
                    placeholder="Nhập tên thư mục mới" 
                    className="w-full text-[13px] text-gray-700 px-3 py-2 border border-blue-400 rounded-lg outline-none ring-2 ring-blue-100 focus:border-blue-500 transition-all placeholder:text-gray-400"
                    autoFocus
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    disabled={isSavingFolder}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleCreateFolder();
                      }
                      if (e.key === 'Escape') {
                        setIsCreatingFolder(false);
                        setNewFolderName("");
                      }
                    }}
                    onBlur={() => {
                      // We don't close on blur immediately to allow clicking the save button if we had one,
                      // but for now, we can just let Escape close it.
                    }}
                  />
                </div>
              )}

              {folders.length > 0 && (
                <div className="mt-2 space-y-1">
                  {folders.map(folder => (
                    <button 
                      key={folder.id}
                      onClick={() => setActiveTab(folder.id as any)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                        activeTab === folder.id 
                          ? "bg-blue-50 text-blue-600 font-medium" 
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <Folder className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{folder.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-auto p-3 border-t border-gray-100 bg-slate-100/50 flex items-center justify-between text-xs text-gray-500">
               <div className="flex items-center gap-2">
                 <button className="p-1 hover:bg-gray-200 rounded text-gray-400 transition-colors">
                   <HelpCircle className="w-4 h-4" />
                 </button>
                 <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border shadow-sm">
                   <span className="text-[10px]">⌥</span>
                 </div>
                 <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border shadow-sm">
                   <span className="text-[10px]">↵</span>
                 </div>
                 <span>Gửi ảnh ngay</span>
               </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              {displayedImages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="max-w-sm w-full text-center flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-blue-50 rounded-full blur-2xl opacity-60"></div>
                      <div className="relative bg-slate-50 w-32 h-32 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                        <ImageIcon className="w-12 h-12 text-slate-300" strokeWidth={1} />
                        <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full border-4 border-white shadow-sm">
                          <Plus className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-500 mb-6 text-[14px] leading-relaxed">
                      Bạn chưa có ảnh nào. Chọn thêm ảnh để thêm vào thư mục này
                    </p>

                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2.5 rounded-full text-sm font-medium shadow-blue-500/20 shadow-lg"
                    >
                      Thêm ảnh
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-12">
                    {displayedImages.map((img) => {
                      const isSelected = selectedImageIds.includes(img.id);
                      const selectionIndex = selectedImageIds.indexOf(img.id) + 1;
                      
                      return (
                        <div key={img.id} className="flex flex-col gap-2">
                          <div 
                            onClick={() => toggleSelection(img.id)}
                            className={cn(
                              "group relative aspect-square bg-gray-50 rounded-xl overflow-hidden cursor-pointer transition-all",
                              isSelected 
                                ? "border-2 border-blue-500 shadow-sm" 
                                : "border border-gray-200 hover:border-blue-300"
                            )}
                          >
                            <img src={img.url} alt={img.name} className="w-full h-full object-contain p-1" />
                            
                            {/* Selection Badge */}
                            {isSelected && (
                              <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-[13px] font-medium shadow-sm">
                                {selectionIndex}
                              </div>
                            )}

                            {/* Hover overlay (only if not selected) */}
                            {!isSelected && (
                              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                          
                          <div className="text-[13px] text-gray-600 truncate px-1" title={img.name}>
                            {img.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center text-gray-500 text-[14px] mt-8 pb-12">
                    <p>Mỗi thư mục chỉ hiển thị tối đa 80 ảnh, dù thực tế có thể nhiều hơn.</p>
                    <p>Sử dụng Tìm kiếm để tìm các ảnh thứ 81 trở đi</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 bg-white p-4 flex items-center justify-between">
               {selectedImageIds.length > 0 ? (
                  <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                    <button className="text-gray-500 hover:text-gray-800 transition-colors">
                       <PanelLeftClose className="w-4 h-4" />
                    </button>
                    <button onClick={handleDeleteSelected} className="text-red-500 hover:text-red-700 transition-colors">
                       <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 text-[14px] text-gray-700 font-medium pl-2 border-l border-gray-300">
                       Đã chọn {selectedImageIds.length} ảnh
                       <button onClick={() => setSelectedImageIds([])} className="hover:bg-gray-200 p-0.5 rounded-full text-gray-500 transition-colors">
                         <X className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
               ) : (
                  <div></div>
               )}

               <div className="flex items-center gap-0">
                 <button 
                   onClick={() => fileInputRef.current?.click()} 
                   className="bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors text-[14px] font-medium px-4 py-2 rounded-l-md border-r border-blue-200"
                 >
                   Thêm ảnh
                 </button>
                 <button className="bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors px-3 py-2 rounded-r-md mr-3">
                   <MoreHorizontal className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={() => {
                     if (onSelect) {
                       const selected = images.filter(img => selectedImageIds.includes(img.id));
                       onSelect(selected);
                       setSelectedImageIds([]);
                     }
                     onClose();
                   }}
                   className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors text-[14px] font-semibold px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                   disabled={selectedImageIds.length === 0}
                 >
                   Chọn
                 </button>
               </div>
            </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept="image/*" 
            multiple 
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
