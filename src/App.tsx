import { useState, useRef, useEffect } from 'react';
import { Plus, Image as ImageIcon, Music, Send, X, Play, Pause, Clock, Loader2, AlertCircle, LayoutGrid, FolderPlus, ChevronLeft, ArrowRight, Layers, Sparkles, Rocket, Zap, Gem, Diamond, Search, Heart, Quote, Compass, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { User } from '@supabase/supabase-js';

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  user_id: string; // オーナー判定に必要
  share_id?: string;
}

interface ProgressEntry {
  id: string;
  type: 'image' | 'audio' | 'text';
  url?: string;
  notes: string;
  timestamp: number;
  project_id: string;
  user_id?: string;
}

// --- Components ---

function AuthView({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: username
            }
          }
        });
        if (error) throw error;
        alert('確認用メールを送信しました。メールを確認してログインしてください。');
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md p-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-xl mb-6">
            <Diamond size={32} fill="currentColor" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Kakera</h2>
          <p className="text-slate-500 font-medium">心の中のカケラを、形にする場所へ。</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="example@email.com"
              required
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">ユーザー名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="ペンネームなど（後で変更できます）"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-500 text-sm font-bold bg-rose-50 p-4 rounded-2xl">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="primary-button w-full py-4 text-lg">
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            <span>{isLogin ? 'ログイン' : 'アカウント作成'}</span>
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-bold hover:underline"
          >
            {isLogin ? 'まだアカウントをお持ちでない方' : 'すでにアカウントをお持ちの方'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ProjectCard({ project, onClick, onDelete }: { project: Project; onClick: () => void; onDelete: (e: React.MouseEvent) => void }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card p-8 cursor-pointer group relative"
    >
      <button
        onClick={onDelete}
        className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10"
        title="箱を削除する"
      >
        <Trash2 size={18} />
      </button>

      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
          <Gem size={28} />
        </div>
        <div className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
          Creation box
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors tracking-tight">{project.name}</h3>
      <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">
        {project.description || 'まだ説明がありません。'}
      </p>
      <div className="flex items-center text-indigo-600 text-sm font-bold gap-2">
        <span>カケラを集める</span>
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}

function ProgressCard({ entry, onDelete }: { entry: ProgressEntry; onDelete?: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card mb-8 group relative"
    >
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10"
          title="カケラを削除する"
        >
          <Trash2 size={16} />
        </button>
      )}

      <div className="flex flex-col md:flex-row">
        {entry.type !== 'text' && (
          <div className="w-full md:w-1/3 aspect-video md:aspect-square bg-slate-50 relative overflow-hidden">
            {entry.type === 'image' ? (
              <img src={entry.url} className="w-full h-full object-cover" alt="Progress" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-rose-50">
                <Music size={40} className="text-indigo-300 mb-4" />
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-indigo-600 hover:scale-110 transition-transform"
                >
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
                <audio ref={audioRef} src={entry.url} onEnded={() => setIsPlaying(false)} className="hidden" />
              </div>
            )}
          </div>
        )}
        <div className={`flex-1 p-8 flex flex-col justify-between ${entry.type === 'text' ? 'bg-gradient-to-br from-indigo-50/30 to-rose-50/30' : ''}`}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${entry.type === 'image' ? 'bg-indigo-100 text-indigo-600' :
                entry.type === 'audio' ? 'bg-rose-100 text-rose-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                {entry.type.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {new Date(entry.timestamp).toLocaleString('ja-JP', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
            {entry.type === 'text' && <Quote className="text-indigo-100 mb-4" size={32} />}
            <p className={`text-slate-700 leading-relaxed whitespace-pre-wrap ${entry.type === 'text' ? 'text-xl font-bold italic' : 'text-lg font-medium'}`}>
              {entry.notes || 'メモはありません。'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityHeatmap({ entries }: { entries: { timestamp: number }[] }) {
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // 直近90日間のデータを生成
  const days = Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (89 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dailyCounts = entries.reduce((acc: Record<string, number>, entry) => {
    const d = new Date(entry.timestamp);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const getLevel = (count: number) => {
    if (!count) return 'bg-slate-100';
    if (count === 1) return 'bg-indigo-200';
    if (count === 2) return 'bg-indigo-400';
    return 'bg-indigo-600';
  };

  return (
    <div className="glass-card p-8 mb-16 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-100/50 transition-colors duration-700" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
            <Zap size={18} fill="currentColor" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">あなたの創作リズム</h3>
          <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <span>Last 90 Days</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {days.map((day) => {
            const key = day.toISOString();
            const count = dailyCounts[key] || 0;
            return (
              <div
                key={key}
                onMouseEnter={() => setHoverDate(`${day.toLocaleDateString()}: ${count}個のカケラ`)}
                onMouseLeave={() => setHoverDate(null)}
                className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 hover:scale-125 hover:z-20 cursor-help ${getLevel(count)}`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 italic min-h-[1.25rem]">
            {hoverDate || 'カケラを積み上げた日数が輝きます'}
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-sm bg-slate-100" />
              <div className="w-2 h-2 rounded-sm bg-indigo-200" />
              <div className="w-2 h-2 rounded-sm bg-indigo-400" />
              <div className="w-2 h-2 rounded-sm bg-indigo-600" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Application ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'dashboard' | 'project'>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [allEntries, setAllEntries] = useState<{ timestamp: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const [uploadType, setUploadType] = useState<'image' | 'audio' | 'text' | null>(null);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // 1. セッション取得
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // 2. 共有リンクのチェック
      const params = new URLSearchParams(window.location.search);
      const shareId = params.get('share');

      if (shareId) {
        await handleLoadSharedProject(shareId, currentUser);
      } else if (currentUser) {
        await fetchProjectsWithUser(currentUser);
      }

      setLoading(false);
    };

    init();

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        // 現在共有表示中でない場合、または自分がオーナーの場合にプロジェクト一覧を更新
        fetchProjectsWithUser(currentUser);
      } else {
        const params = new URLSearchParams(window.location.search);
        if (!params.get('share')) {
          setProjects([]);
          setView('home');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoadSharedProject = async (shareId: string, currentUser: User | null) => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, description, created_at, user_id, share_id')
      .eq('share_id', shareId)
      .single();

    if (error || !data) {
      console.error('Error loading shared project:', error);
      alert('共有リンクが無効、または期限切れです。');
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      setSelectedProject(data);
      await fetchEntries(data.id);
      setView('project');
    }
  };

  const fetchProjects = () => {
    if (user) fetchProjectsWithUser(user);
  };

  const fetchProjectsWithUser = async (currentUser: User) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, description, created_at, user_id, share_id')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
      fetchAllEntries(currentUser);
    }
    setLoading(false);
  };

  const fetchAllEntries = async (currentUser: User) => {
    const { data, error } = await supabase
      .from('progress_entries')
      .select('timestamp')
      .eq('user_id', currentUser.id);

    if (!error) {
      setAllEntries(data || []);
    }
  };

  const fetchEntries = async (projectId: string) => {
    const { data, error } = await supabase
      .from('progress_entries')
      .select('id, type, url, notes, timestamp, project_id, user_id')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching entries:', error);
    } else {
      setEntries(data || []);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName) return;
    setUploading(true);
    const newProject = {
      name: newProjectName,
      description: newProjectDesc,
      user_id: user?.id,
      share_id: crypto.randomUUID() // 共有リンクを最初から作成
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select('id, name, description, created_at, user_id');

    if (error) {
      alert(`エラー: ${error.message}`);
    } else if (data && data[0]) {
      // URLから共有IDを削除して、自分のダッシュボードモードに切り替える
      if (window.location.search.includes('share=')) {
        window.history.replaceState({}, '', window.location.pathname);
      }

      const createdProject = { ...data[0], share_id: newProject.share_id };
      setProjects(prev => [createdProject, ...prev]);
      setShowCreateProject(false);
      setNewProjectName('');
      setNewProjectDesc('');

      // 作成後はダッシュボードへ遷移して選択状態にする
      setView('dashboard');
      handleSelectProject(createdProject);
    }
    setUploading(false);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    fetchEntries(project.id);
    setView('project');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    // 共有ビューから戻る際、URLパラメータをクリアする
    if (window.location.search.includes('share=')) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (view === 'project') {
      setView('dashboard');
      setSelectedProject(null);
      setEntries([]);
    } else {
      setView('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setUploadType(selectedFile.type.startsWith('image/') ? 'image' : 'audio');
    }
  };

  const handleUpload = async () => {
    if (!uploadType || !selectedProject) return;
    if (uploadType !== 'text' && !file) return;
    if (uploadType === 'text' && !notes.trim()) return;

    setUploading(true);

    try {
      let finalUrl = '';

      if (uploadType !== 'text' && file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${uploadType}s/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('progress_files')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('progress_files')
          .getPublicUrl(filePath);

        finalUrl = publicUrl;
      }

      const newEntry = {
        type: uploadType,
        url: finalUrl || null,
        notes: notes,
        timestamp: Date.now(),
        project_id: selectedProject.id,
        user_id: user?.id
      };

      const { data: uploadData, error: dbError } = await supabase
        .from('progress_entries')
        .insert([newEntry])
        .select('id, type, url, notes, timestamp, project_id, user_id');

      if (dbError) throw dbError;

      if (uploadData && uploadData[0]) {
        setEntries(prev => [uploadData[0], ...prev]);
        setAllEntries(prev => [{ timestamp: uploadData[0].timestamp }, ...prev]);
      } else {
        await fetchEntries(selectedProject.id);
      }

      setShowUpload(false);
      setNotes('');
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setUploadType(null);

      // input要素をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Detailed Upload Error:', error);
      alert(`アップロード失敗: ${error.message || '通信エラーが発生しました'}`);
    } finally {
      setUploading(false);
    }
  };
  const handleCopyShareLink = async (currentShareId: string | undefined) => {
    let shareId = currentShareId;

    if (!shareId && selectedProject) {
      // 共有IDがない場合はその場で生成して保存する（救済処置）
      const newShareId = crypto.randomUUID();
      const { error } = await supabase
        .from('projects')
        .update({ share_id: newShareId })
        .eq('id', selectedProject.id);

      if (error) {
        alert('共有リンクの作成に失敗しました。');
        return;
      }

      shareId = newShareId;
      // ステートを更新
      setSelectedProject(prev => prev ? { ...prev, share_id: newShareId } : null);
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, share_id: newShareId } : p));
    }

    if (!shareId) return;

    const url = `${window.location.origin}${window.location.pathname}?share=${shareId}`;
    await navigator.clipboard.writeText(url);
    alert('共有リンクをコピーしました！知り合いに送ってみましょう。');
  };

  const isSharedView = !!(new URLSearchParams(window.location.search).get('share'));

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('この箱を削除してもよろしいですか？記録されたすべてのカケラも失われます。')) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      alert(`削除失敗: ${error.message}`);
    } else {
      await fetchProjects();
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm('このカケラを削除してもよろしいですか？')) return;

    const { error } = await supabase
      .from('progress_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      alert(`削除失敗: ${error.message}`);
    } else if (selectedProject) {
      await fetchEntries(selectedProject.id);
    }
  };

  if (!user && !isSharedView) {
    return <AuthView onAuthSuccess={fetchProjects} />;
  }

  return (
    <div className="min-h-screen py-12 px-6 md:px-12 max-w-6xl mx-auto">

      {/* --- Header --- */}
      <header className="flex justify-between items-center mb-16 px-2">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleBack}>
          <motion.div
            whileHover={{ rotate: 180 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20"
          >
            <Diamond size={22} fill="currentColor" />
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">
              Kakera
            </h1>
            <span className="text-[10px] font-bold text-slate-400 -mt-1 uppercase tracking-widest">
              {user?.user_metadata?.display_name || 'Guest User'}'s notebook
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!isSharedView && (
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-2 text-slate-400 hover:text-rose-500 transition-colors text-xs font-bold uppercase tracking-wider"
            >
              Logout
            </button>
          )}
          {view !== 'home' && !isSharedView && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              className="secondary-button py-2 px-4 text-xs"
            >
              <ChevronLeft size={16} />
              <span>戻る</span>
            </motion.button>
          )}
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">

          {/* --- Home View (Hero + Story + Project List) --- */}
          {/* --- Home View (Menu) --- */}
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero Section */}
              <section className="mb-20 py-12 px-2 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="max-w-4xl"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-8">
                    <Sparkles size={14} />
                    <span>創作のカケラ、未来の輝き。</span>
                  </div>
                  <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none mb-8">
                    Collect <br />
                    Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">Kakera</span>
                  </h2>
                  <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-12">
                    <span className="inline-block text-slate-900 font-bold">完璧じゃなくていい。</span><br />
                    <span className="inline-block">その一歩、その一瞬。</span><br />
                    <span className="inline-block">Kakeraは、未完成の美しさを</span>
                    <span className="inline-block">大切に積み上げていく場所です。</span>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.button
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCreateProject(true)}
                      className="glass-card p-10 text-left group border-none bg-indigo-600 text-white shadow-xl shadow-indigo-200"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Plus size={32} />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">創作を始める</h3>
                      <p className="text-indigo-100/80 text-sm">新しい創作箱を作って、最初の一歩を踏み出しましょう。</p>
                      <ArrowRight size={20} className="mt-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </motion.button>

                    <motion.button
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setView('dashboard')}
                      className="glass-card p-10 text-left group border-none bg-white shadow-xl shadow-slate-200/50"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <LayoutGrid size={32} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">創作箱を見る</h3>
                      <p className="text-slate-500 text-sm">これまでに集めたカケラや、活動の記録を確認します。</p>
                      <ArrowRight size={20} className="mt-8 text-indigo-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </motion.button>

                    <motion.button
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => alert('みんなのカケラ機能は、現在準備中です！お楽しみに💎')}
                      className="glass-card p-10 text-left group border-none bg-white shadow-xl shadow-slate-200/50"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                        <Search size={32} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">みんなのかけらを見る</h3>
                      <p className="text-slate-500 text-sm">他のクリエイターのカケラを見て、刺激をもらいましょう。</p>
                      <ArrowRight size={20} className="mt-8 text-rose-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </motion.button>
                  </div>
                </motion.div>
              </section>

              {/* Story Section */}
              <section className="mb-40 px-2 relative">
                <div className="absolute -left-12 top-0 w-1 h-full bg-gradient-to-b from-indigo-500/0 via-indigo-500/20 to-rose-500/0 hidden md:block" />
                <div className="max-w-3xl">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="flex items-center gap-4 text-indigo-600 mb-6">
                      <Heart size={24} fill="currentColor" className="text-rose-400" />
                      <span className="text-sm font-bold uppercase tracking-[0.2em]">Our Thought</span>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-10 leading-tight tracking-tight uppercase">
                      「完璧な作品」の陰に、<br />
                      隠したままの想いはありませんか？
                    </h3>

                    <div className="space-y-8 text-slate-600 text-lg md:text-xl leading-relaxed font-medium">
                      <p>
                        <span className="inline-block">世の中に溢れているのは、</span>
                        <span className="inline-block">磨き上げられた「完成品」ばかり。</span><br />
                        <span className="inline-block">それを見て、自分の未完成なプロセスを</span>
                        <span className="inline-block">恥じて、隠してしまっていませんか？</span>
                      </p>
                      <div className="pl-6 border-l-4 border-indigo-100 py-2">
                        <Quote className="text-indigo-200 mb-4" size={32} />
                        <p className="text-slate-900 font-bold">
                          <span className="inline-block">創作の本当の価値は、完成品の中だけでなく</span><br />
                          <span className="inline-block">そこに至るまでの「カケラ」のような</span>
                          <span className="inline-block">日々に宿っています。</span>
                        </p>
                      </div>
                      <p>
                        <span className="inline-block">迷い、悩み、挑戦した証。</span><br />
                        <span className="inline-block">Kakeraは、未完成な美しさを</span>
                        <span className="inline-block">「いま、ここにある価値」として</span>
                        <span className="inline-block">愛でるための場所です。</span>
                      </p>
                      <p>
                        <span className="inline-block">あなたのひたむきなプロセスが、</span>
                        <span className="inline-block">いつか誰かの光になるように。</span>
                      </p>
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="glass-card p-6 bg-indigo-50/30 border-none">
                        <Zap size={24} className="text-indigo-500 mb-4" />
                        <h4 className="font-bold text-slate-900 mb-2">記録する</h4>
                        <p className="text-sm text-slate-500">飾らない、剥き出しのアイデアをありのままに。</p>
                      </div>
                      <div className="glass-card p-6 bg-rose-50/30 border-none">
                        <Compass size={24} className="text-rose-500 mb-4" />
                        <h4 className="font-bold text-slate-900 mb-2">見つける</h4>
                        <p className="text-sm text-slate-500">完璧な作品にはない、人間らしい葛藤を。</p>
                      </div>
                      <div className="glass-card p-6 bg-slate-50 border-none">
                        <Sparkles size={24} className="text-amber-500 mb-4" />
                        <h4 className="font-bold text-slate-900 mb-2">輝かせる</h4>
                        <p className="text-sm text-slate-500">未完成なカケラが、誰かの力に変わる。</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>
            </motion.div>
          )}

          {/* --- Dashboard View (Heatmap + Projects) --- */}
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <LayoutGrid size={32} className="text-indigo-600" />
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">ダッシュボード</h2>
                </div>
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="primary-button py-3 px-6"
                >
                  <Plus size={20} />
                  <span>新しい箱</span>
                </button>
              </div>

              <ActivityHeatmap entries={allEntries} />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.length === 0 ? (
                  <div
                    onClick={() => setShowCreateProject(true)}
                    className="col-span-full glass-card py-20 px-8 text-center cursor-pointer hover:bg-white transition-all group border-2 border-dashed border-slate-100 hover:border-indigo-200"
                  >
                    <FolderPlus size={40} className="mx-auto mb-6 text-indigo-400 group-hover:text-indigo-600" />
                    <h4 className="text-xl font-bold text-slate-900 mb-2">まだ創作箱がありません</h4>
                    <p className="text-slate-500 mb-8 text-sm">最初の箱を名前をつけて作りましょう。</p>
                    <button className="primary-button mx-auto py-3 px-8 text-sm">最初の箱を作る</button>
                  </div>
                ) : (
                  projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => handleSelectProject(project)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* --- Project Detail View --- */}
          {view === 'project' && selectedProject && (
            <motion.div
              key="project"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold mb-8 group transition-colors"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>ダッシュボードへ</span>
              </button>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 pb-12 border-b border-slate-100 px-2">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase leading-tight">{selectedProject.name}</h2>
                  <p className="text-slate-500 text-lg max-w-2xl">{selectedProject.description || 'この箱にはまだ説明がありません。'}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-6">
                    <button
                      onClick={() => handleCopyShareLink(selectedProject.share_id)}
                      className="secondary-button py-2 px-4 text-sm"
                    >
                      <Send size={16} />
                      <span>共有リンクをコピー</span>
                    </button>
                    {!isSharedView && (
                      <button
                        onClick={() => setShowUpload(true)}
                        className="primary-button py-2 px-5 text-sm"
                      >
                        <Plus size={18} />
                        <span>カケラを追加</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <>
                {loading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-200" size={48} />
                  </div>
                ) : entries.length === 0 ? (
                  <div className="glass-card py-24 text-center border-dashed bg-transparent border-slate-200 shadow-none">
                    <Gem className="mx-auto mb-6 text-slate-200" size={64} />
                    <p className="text-slate-400 text-lg mb-8">まだカケラがありません。輝く断片を残しましょう。</p>
                    <button onClick={() => setShowUpload(true)} className="secondary-button mx-auto">
                      カケラを記録する
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries.map((entry) => (
                      <ProgressCard
                        key={entry.id}
                        entry={entry}
                        onDelete={isSharedView ? undefined : () => handleDeleteEntry(entry.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* --- Modals --- */}

      <AnimatePresence>
        {/* Create Project Modal */}
        {showCreateProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-lg p-10 bg-white"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <FolderPlus className="text-indigo-600" />
                  新しい創作箱を作る
                </h3>
                <button onClick={() => setShowCreateProject(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={28} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">箱のなまえ</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="例: 未完成の組曲"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">どんなカケラを集める？</label>
                  <textarea
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="この創作の目的やイメージを書いておこう..."
                    className="input-field min-h-[120px] resize-none"
                  />
                </div>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName || uploading}
                  className="primary-button w-full py-5 text-lg"
                >
                  {uploading ? <Loader2 className="animate-spin" /> : <Gem size={20} />}
                  <span>創作を開始する</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Upload Progress Modal */}
        {showUpload && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-xl p-10 bg-white"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-1 font-display tracking-wider mb-2">{selectedProject.name}</p>
                  <h3 className="text-2xl font-bold text-slate-900">カケラを残す</h3>
                </div>
                <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={28} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex p-1 bg-slate-100 rounded-2xl">
                  <button
                    onClick={() => {
                      setUploadType(null);
                      setPreviewUrl(null);
                      setFile(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${uploadType !== 'text' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    <ImageIcon size={18} />
                    <span>メディア</span>
                  </button>
                  <button
                    onClick={() => {
                      setUploadType('text');
                      setPreviewUrl(null);
                      setFile(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${uploadType === 'text' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    <Quote size={18} />
                    <span>テキスト</span>
                  </button>
                </div>

                {uploadType !== 'text' ? (
                  !previewUrl ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-video rounded-3xl border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 bg-slate-50 group"
                    >
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Sparkles className="text-indigo-500" size={32} />
                      </div>
                      <p className="text-slate-400 text-sm font-bold">画像または音声のカケラを選択</p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,audio/*"
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-3xl overflow-hidden aspect-video bg-slate-50 border border-slate-100 group">
                      {uploadType === 'image' ? (
                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-50 to-rose-50">
                          <Music size={48} className="text-indigo-300" />
                          <p className="text-slate-600 font-bold">音のカケラを読み込みました</p>
                        </div>
                      )}
                      <button
                        onClick={() => { setPreviewUrl(null); setFile(null); }}
                        className="absolute top-4 right-4 p-2 bg-white/90 shadow-lg rounded-full text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )
                ) : (
                  <div className="aspect-[2/1] bg-gradient-to-br from-indigo-50 to-rose-50 rounded-3xl flex items-center justify-center border border-slate-100">
                    <Quote className="text-indigo-200" size={64} />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">今の思いをメモに残す</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="カケラについての説明や、今の気づきを自由に..."
                    className="input-field min-h-[120px] resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setShowUpload(false)} className="secondary-button flex-1 py-5">
                    やめる
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={(uploadType !== 'text' && !file) || (uploadType === 'text' && !notes.trim()) || uploading}
                    className="primary-button flex-[2] py-5"
                  >
                    {uploading ? <Loader2 className="animate-spin" /> : <Diamond size={20} />}
                    <span>{uploading ? '磨き中...' : '大切に保存する'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
