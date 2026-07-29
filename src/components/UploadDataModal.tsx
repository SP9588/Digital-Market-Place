import React, { useState, useRef } from 'react';
import { DigitalProduct, CategoryId } from '../types/marketplace';
import { ALL_CATEGORIES } from '../data/categories';
import {
  Upload,
  FileSpreadsheet,
  FileJson,
  Smartphone,
  Laptop,
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Download,
  Image as ImageIcon,
  Sparkles,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface UploadDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportBulkProducts: (products: DigitalProduct[]) => void;
  onAddSingleProduct: (product: DigitalProduct) => void;
}

export const UploadDataModal: React.FC<UploadDataModalProps> = ({
  isOpen,
  onClose,
  onImportBulkProducts,
  onAddSingleProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'bulk' | 'single'>('bulk');
  const [deviceType, setDeviceType] = useState<'computer' | 'phone' | 'camera'>('computer');

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Bulk Import State
  const [parsedProducts, setParsedProducts] = useState<DigitalProduct[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  // Single File / Camera State
  const [singleTitle, setSingleTitle] = useState('');
  const [singleCategory, setSingleCategory] = useState<CategoryId>('templates');
  const [singlePrice, setSinglePrice] = useState(25);
  const [singleDescription, setSingleDescription] = useState('');
  const [singleFileFormat, setSingleFileFormat] = useState('ZIP');
  const [singleFileSize, setSingleFileSize] = useState('');
  const [singlePreviewUrl, setSinglePreviewUrl] = useState<string | null>(null);

  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // CSV / JSON Parser
  const handleProcessFile = (file: File) => {
    setStatusMessage(null);
    setFileName(file.name);

    const isJson = file.name.endsWith('.json');
    const isCsv = file.name.endsWith('.csv');

    if (activeTab === 'bulk') {
      if (!isJson && !isCsv) {
        setStatusMessage({
          type: 'error',
          text: 'Invalid bulk data format. Please upload a .JSON or .CSV file from your computer or phone.',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let items: DigitalProduct[] = [];

          if (isJson) {
            const raw = JSON.parse(content);
            const arrayData = Array.isArray(raw) ? raw : raw.products || [raw];
            items = arrayData.map((item: any, idx: number) => parseProductObject(item, idx));
          } else if (isCsv) {
            items = parseCSVToProducts(content);
          }

          if (items.length === 0) {
            setStatusMessage({
              type: 'error',
              text: 'No valid product rows detected in the uploaded file.',
            });
            return;
          }

          setParsedProducts(items);
          setStatusMessage({
            type: 'success',
            text: `Successfully parsed ${items.length} digital product(s) from "${file.name}". Click "Import All" to publish them.`,
          });
        } catch (err) {
          console.error(err);
          setStatusMessage({
            type: 'error',
            text: 'Error parsing file content. Ensure valid JSON/CSV formatting.',
          });
        }
      };
      reader.readAsText(file);
    } else {
      // Single Media / Camera Upload
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setSingleFileSize(`${sizeMb} MB`);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      setSingleFileFormat(ext);

      if (!singleTitle) {
        const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setSingleTitle(titleWithoutExt.replace(/[-_]/g, ' '));
      }

      // Read image / preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSinglePreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setSinglePreviewUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800');
      }

      setStatusMessage({
        type: 'success',
        text: `Loaded "${file.name}" (${sizeMb} MB) from ${deviceType}. Complete details below to list asset.`,
      });
    }
  };

  const parseProductObject = (obj: any, idx: number): DigitalProduct => {
    const id = obj.id || `imp-${Date.now()}-${idx}`;
    const title = obj.title || obj.name || `Imported Asset #${idx + 1}`;
    const categoryId = obj.categoryId || 'templates';
    const catInfo = ALL_CATEGORIES.find((c) => c.id === categoryId) || ALL_CATEGORIES[0];

    return {
      id,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      categoryId: catInfo.id as CategoryId,
      categoryName: catInfo.name,
      subcategory: obj.subcategory || catInfo.subcategories[0] || 'General',
      price: Number(obj.price) || 19,
      currency: 'USD',
      creatorId: 'c-import-user',
      creatorName: obj.creatorName || 'Imported User Asset',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      creatorRating: 5.0,
      creatorSales: 0,
      rating: Number(obj.rating) || 5.0,
      reviewCount: Number(obj.reviewCount) || 1,
      fileFormat: obj.fileFormat || 'ZIP',
      fileSize: obj.fileSize || '12 MB',
      downloadCount: 0,
      tags: typeof obj.tags === 'string' ? obj.tags.split(',') : obj.tags || ['imported', 'custom-upload'],
      description: obj.description || 'Uploaded asset file imported into Open Ocean marketplace.',
      features: ['Verified File Upload', 'Commercial Use License', 'Instant Download'],
      previewType: 'image',
      previewUrl: obj.previewUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
      attributes: {},
      dateAdded: new Date().toISOString(),
      licenses: [
        {
          type: 'personal',
          name: 'Personal License',
          price: Number(obj.price) || 19,
          description: 'Personal single project rights.',
          features: ['1 Project'],
        },
      ],
    };
  };

  const parseCSVToProducts = (csvText: string): DigitalProduct[] => {
    const lines = csvText.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    const products: DigitalProduct[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Parse CSV line taking quotes into account
      const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      if (row.length < 2) continue;

      const obj: any = {};
      headers.forEach((h, idx) => {
        const val = row[idx] ? row[idx].replace(/^"|"$/g, '').trim() : '';
        obj[h] = val;
      });

      products.push(parseProductObject(obj, i));
    }

    return products;
  };

  const handleDownloadSampleCSV = () => {
    const sampleCsv = `title,categoryId,price,description,fileFormat,fileSize,tags
"Ultimate Mobile React Starter Kit",templates,39,"Full responsive React Native template for iOS and Android.",ZIP,"45 MB","react,mobile,starter"
"AI Voice Synthesis Audio Bundle",audio,19,"High-fidelity voice synthesis samples.",WAV,"120 MB","audio,ai,voice"
"3D Cyberpunk Avatar Pack",3d,29,"Textured FBX and OBJ 3D avatars.",FBX,"210 MB","3d,avatars,game"`;

    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'open_ocean_sample_products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSampleJSON = () => {
    const sampleJson = [
      {
        title: 'Master Next.js SaaS Boilerplate',
        categoryId: 'templates',
        price: 49,
        description: 'Complete SaaS template with authentication and payments.',
        fileFormat: 'ZIP',
        fileSize: '85 MB',
        tags: ['nextjs', 'saas', 'typescript'],
      },
      {
        title: 'Cyberpunk UI Sound FX Pack',
        categoryId: 'audio',
        price: 15,
        description: '100 sci-fi UI sound effects for games and apps.',
        fileFormat: 'WAV',
        fileSize: '65 MB',
        tags: ['audio', 'sfx', 'scifi'],
      },
    ];

    const blob = new Blob([JSON.stringify(sampleJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'open_ocean_sample_products.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCommitBulkImport = () => {
    if (parsedProducts.length === 0) return;
    onImportBulkProducts(parsedProducts);
    onClose();
  };

  const handlePublishSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleTitle) return;

    const catInfo = ALL_CATEGORIES.find((c) => c.id === singleCategory) || ALL_CATEGORIES[0];
    const newProduct: DigitalProduct = {
      id: `custom-file-${Date.now()}`,
      title: singleTitle,
      slug: singleTitle.toLowerCase().replace(/\s+/g, '-'),
      categoryId: singleCategory,
      categoryName: catInfo.name,
      subcategory: catInfo.subcategories[0] || 'General',
      price: Number(singlePrice),
      currency: 'USD',
      creatorId: 'c-phone-computer-user',
      creatorName: deviceType === 'phone' ? 'Phone Uploaded Asset' : 'Device Uploaded Asset',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      creatorRating: 5.0,
      creatorSales: 0,
      rating: 5.0,
      reviewCount: 0,
      fileFormat: singleFileFormat,
      fileSize: singleFileSize || '5 MB',
      downloadCount: 0,
      tags: ['uploaded', deviceType, 'custom-asset'],
      description: singleDescription || `Directly uploaded asset from ${deviceType}.`,
      features: ['Verified Device Upload', 'Commercial License', 'Instant Access'],
      previewType: 'image',
      previewUrl:
        singlePreviewUrl ||
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
      attributes: {},
      dateAdded: new Date().toISOString(),
      licenses: [
        {
          type: 'personal',
          name: 'Personal License',
          price: Number(singlePrice),
          description: 'Personal usage rights.',
          features: ['Single usage'],
        },
      ],
    };

    onAddSingleProduct(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Upload Data & Assets</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Computer & Phone Supported
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Import bulk CSV/JSON datasets or upload asset files from computer/mobile phone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Mode Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <div className="grid grid-cols-2 gap-1 flex-1">
              <button
                onClick={() => {
                  setActiveTab('bulk');
                  setStatusMessage(null);
                }}
                className={`py-2 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'bulk'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Bulk Data Import (CSV/JSON)</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('single');
                  setStatusMessage(null);
                }}
                className={`py-2 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'single'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Single File / Photo Upload</span>
              </button>
            </div>
          </div>

          {/* Device Selection Bar */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Choose Device Source:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setDeviceType('computer')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                  deviceType === 'computer'
                    ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Laptop className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <span className="block font-bold text-xs text-white">Computer</span>
                  <span className="text-[10px] text-slate-400 block">Drag & Drop / Files</span>
                </div>
              </button>

              <button
                onClick={() => setDeviceType('phone')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                  deviceType === 'phone'
                    ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="block font-bold text-xs text-white">Mobile Phone</span>
                  <span className="text-[10px] text-slate-400 block">Gallery / Mobile Files</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setDeviceType('camera');
                  setActiveTab('single');
                  if (cameraInputRef.current) {
                    cameraInputRef.current.click();
                  }
                }}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                  deviceType === 'camera'
                    ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Camera className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <span className="block font-bold text-xs text-white">Phone Camera</span>
                  <span className="text-[10px] text-slate-400 block">Take Photo Directly</span>
                </div>
              </button>
            </div>
          </div>

          {/* Hidden Inputs for File Selection */}
          <input
            ref={fileInputRef}
            type="file"
            accept={activeTab === 'bulk' ? '.json,.csv' : '*'}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleProcessFile(e.target.files[0]);
              }
            }}
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleProcessFile(e.target.files[0]);
              }
            }}
          />

          {/* Dropzone Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleProcessFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => {
              if (deviceType === 'camera') {
                cameraInputRef.current?.click();
              } else {
                fileInputRef.current?.click();
              }
            }}
            className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
              isDragging
                ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
                : 'border-slate-800 hover:border-sky-500/50 bg-slate-950/60 hover:bg-slate-950'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
              <FileUp className="w-6 h-6 animate-bounce" />
            </div>

            <div>
              <p className="font-extrabold text-sm text-white">
                {deviceType === 'camera'
                  ? 'Tap to Snap Photo with Phone Camera'
                  : `Click or Drag & Drop File from ${deviceType === 'phone' ? 'Phone Gallery / Files' : 'Computer Disk'}`}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                {activeTab === 'bulk'
                  ? 'Supported formats: .CSV, .JSON (Product Datasets)'
                  : 'Supported formats: Images, ZIP, PDF, Audio, Video, 3D Assets'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold text-[11px]">
              <Upload className="w-3.5 h-3.5" />
              <span>
                Browse {deviceType === 'phone' ? 'Phone Files' : 'Computer Files'}
              </span>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{statusMessage.text}</div>
            </div>
          )}

          {/* TAB 1: Bulk Import Preview & Sample Downloads */}
          {activeTab === 'bulk' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-bold text-[11px]">
                  Need a dataset template?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadSampleCSV}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-700 font-mono font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Sample CSV</span>
                  </button>
                  <button
                    onClick={handleDownloadSampleJSON}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-400 border border-slate-700 font-mono font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Sample JSON</span>
                  </button>
                </div>
              </div>

              {parsedProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs uppercase tracking-wider">
                      Parsed Products Preview ({parsedProducts.length})
                    </span>
                    <button
                      onClick={() => setParsedProducts([])}
                      className="text-[11px] text-rose-400 hover:underline"
                    >
                      Clear Parsed
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 divide-y divide-slate-800">
                    {parsedProducts.map((p, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-white block truncate">{p.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {p.categoryName} • ${p.price} • {p.fileFormat}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          Ready
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleCommitBulkImport}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish All {parsedProducts.length} Products to Marketplace</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Single File / Camera Form */}
          {activeTab === 'single' && (
            <form onSubmit={handlePublishSingle} className="space-y-3 pt-1">
              <div>
                <label className="text-slate-400 block mb-1">Asset Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Uploaded Mobile App Design File"
                  value={singleTitle}
                  onChange={(e) => setSingleTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={singleCategory}
                    onChange={(e) => setSingleCategory(e.target.value as CategoryId)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Listing Price ($ USD)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={singlePrice}
                    onChange={(e) => setSinglePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={singleDescription}
                  onChange={(e) => setSingleDescription(e.target.value)}
                  placeholder="Asset description or notes for buyers..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {singlePreviewUrl && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <img
                    src={singlePreviewUrl}
                    alt="Preview"
                    className="w-14 h-14 rounded-lg object-cover border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-white block text-xs truncate">
                      File Preview Attached
                    </span>
                    <span className="text-[10px] text-sky-400 font-mono">
                      Format: {singleFileFormat} • Size: {singleFileSize || 'Unknown'}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Asset Listing</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
