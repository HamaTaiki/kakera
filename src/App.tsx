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
  share_passphrase?: string;
}

interface Reaction {
  id: string;
  entry_id: string;
  content: string;
  type: 'emoji' | 'text';
  created_at: string;
}

interface ProgressEntry {
  id: string;
  type: 'image' | 'audio';
  url: string;
  notes: string;
  timestamp: number;
  project_id: string;
  reactions?: Reaction[];
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

function ProgressCard({ entry, onDelete, onReact }: { entry: ProgressEntry; onDelete?: () => void; onReact: (emoji: string) => void }) {
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

  const emojis = ['✨', '💎', '🚀', '💖', '👏'];

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
        <div className="flex-1 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${entry.type === 'image' ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'}`}>
                {entry.type === 'image' ? 'IMAGE' : 'AUDIO'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {new Date(entry.timestamp).toLocaleString('ja-JP', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-lg font-medium">
              {entry.notes || 'メモはありません。'}
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => onReact(emoji)}
                    className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-sm hover:bg-white hover:shadow-md transition-all active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {entry.reactions && entry.reactions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(
                    entry.reactions.reduce((acc, r) => ({ ...acc, [r.content]: (acc[r.content] || 0) + 1 }), {} as Record<string, number>)
                  ).map(([content, count]) => (
                    <span key={content} className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-lg">
                      {content} {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Application ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'project'>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const [enteredPassphrase, setEnteredPassphrase] = useState('');
  const [isPassphraseVerified, setIsPassphraseVerified] = useState(false);

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const [uploadType, setUploadType] = useState<'image' | 'audio' | null>(null);
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
      .select('*')
      .eq('share_id', shareId)
      .single();

    if (error || !data) {
      console.error('Error loading shared project:', error);
      alert('共有リンクが無効、または期限切れです。');
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      setSelectedProject(data);
      // 所有者の場合は自動的に認証済みとする
      if (!data.share_passphrase || (currentUser && data.user_id === currentUser.id)) {
        setIsPassphraseVerified(true);
        await fetchEntries(data.id);
      } else {
        setIsPassphraseVerified(false);
      }
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
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const fetchEntries = async (projectId: string) => {
    const { data, error } = await supabase
      .from('progress_entries')
      .select('*, reactions(*)')
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
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name: newProjectName, description: newProjectDesc, user_id: user?.id }])
      .select();

    if (error) {
      alert(`エラー: ${error.message}`);
    } else if (data && data[0]) {
      // URLから共有IDを削除して、自分のダッシュボードモードに切り替える
      if (window.location.search.includes('share=')) {
        window.history.replaceState({}, '', window.location.pathname);
      }

      const createdProject = data[0];
      setProjects(prev => [createdProject, ...prev]);
      setShowCreateProject(false);
      setNewProjectName('');
      setNewProjectDesc('');
      handleSelectProject(createdProject);
    }
    setUploading(false);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    fetchEntries(project.id);
    setView('project');
    // 所有者の場合は常に認証済みとする
    if (!project.share_passphrase || (user && project.user_id === user.id)) {
      setIsPassphraseVerified(true);
    } else {
      setIsPassphraseVerified(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    // 共有ビューから自分のダッシュボードに戻る際、URLパラメータをクリアする
    if (window.location.search.includes('share=')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    setView('home');
    setSelectedProject(null);
    setEntries([]);
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
    if (!file || !uploadType || !selectedProject) return;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${uploadType}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('progress_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('progress_files')
        .getPublicUrl(filePath);

      const newEntry = {
        type: uploadType,
        url: publicUrl,
        notes: notes,
        timestamp: Date.now(),
        project_id: selectedProject.id,
        user_id: user?.id
      };

      const { data: uploadData, error: dbError } = await supabase
        .from('progress_entries')
        .insert([newEntry])
        .select('*, reactions(*)');

      if (dbError) throw dbError;

      if (uploadData && uploadData[0]) {
        setEntries(prev => [uploadData[0], ...prev]);
      } else {
        await fetchEntries(selectedProject.id);
      }

      setShowUpload(false);
      setNotes('');
      setFile(null);
      setPreviewUrl(null);
      setUploadType(null);
    } catch (error: any) {
      console.error('Error uploading:', error);
      alert(`アップロード失敗: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };
  const handleCopyShareLink = (shareId: string | undefined) => {
    if (!shareId) {
      alert('このプロジェクトには共有設定がありません。');
      return;
    }
    const url = `${window.location.origin}${window.location.pathname}?share=${shareId}`;
    navigator.clipboard.writeText(url);
    alert('共有リンクをコピーしました！知り合いに送ってみましょう。');
  };

  const handleUpdatePassphrase = async (projectId: string, passphrase: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ share_passphrase: passphrase || null })
      .eq('id', projectId);

    if (error) {
      alert(`合言葉の設定に失敗しました: ${error.message}`);
    } else {
      setSelectedProject(prev => prev ? { ...prev, share_passphrase: passphrase } : null);
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, share_passphrase: passphrase } : p));
      alert(passphrase ? '秘密の合言葉を設定しました。' : '合言葉を解除しました。');
    }
  };

  const handleAddReaction = async (entryId: string, content: string) => {
    const { error } = await supabase
      .from('reactions')
      .insert([{
        entry_id: entryId,
        content: content,
        type: 'emoji',
        user_id: user?.id || null
      }]);

    if (error) {
      console.error('Error adding reaction:', error);
    } else if (selectedProject) {
      fetchEntries(selectedProject.id);
    }
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
          <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <Search size={22} />
          </button>
          {!isSharedView && (
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-2 text-slate-400 hover:text-rose-500 transition-colors text-xs font-bold uppercase tracking-wider"
            >
              Logout
            </button>
          )}
          {view === 'home' && !isSharedView && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateProject(true)}
              className="primary-button"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">箱を新しく作る</span>
            </motion.button>
          )}
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">

          {/* --- Home View (Hero + Story + Project List) --- */}
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero Section */}
              <section className="mb-32 py-12 px-2">
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
                  <div className="flex flex-wrap gap-4 items-center">
                    <button
                      onClick={() => setShowCreateProject(true)}
                      className="primary-button py-5 px-10 text-lg group"
                    >
                      創作を始める
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="secondary-button py-5 px-8 text-lg">
                      みんなのカケラを見る
                      <Search size={20} />
                    </button>
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

              <div className="flex items-center justify-between mb-10 px-2">
                <div className="flex items-center gap-3">
                  <LayoutGrid size={24} className="text-indigo-600" />
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">あなたの創作箱</h3>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-indigo-200" size={48} />
                </div>
              ) : projects.length === 0 ? (
                <div
                  onClick={() => setShowCreateProject(true)}
                  className="glass-card py-20 px-8 text-center cursor-pointer hover:bg-white transition-all group border-2 border-dashed border-slate-100 hover:border-indigo-200"
                >
                  <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-400 mx-auto mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FolderPlus size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-4">まだ創作箱がありません</h4>
                  <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed text-lg">
                    世に出す前の、あなただけの大切な「プロセス」を<br />
                    収めるための箱を、まずは名前をつけて作りましょう。
                  </p>
                  <button className="primary-button mx-auto py-5 px-12 text-lg">
                    <Plus size={24} />
                    <span>最初の箱を作る</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => handleSelectProject(project)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                    />
                  ))}
                </div>
              )}
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
                      <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                        <input
                          type="text"
                          placeholder="秘密の合言葉（空で解除）"
                          defaultValue={selectedProject.share_passphrase || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (selectedProject.share_passphrase || '')) {
                              handleUpdatePassphrase(selectedProject.id, e.target.value);
                            }
                          }}
                          className="bg-transparent border-none text-xs font-bold px-3 py-1 focus:outline-none w-40"
                        />
                        <div className="p-1.5 text-slate-400" title="この合言葉を知っている人だけが中身を見られます">
                          <AlertCircle size={14} />
                        </div>
                      </div>
                    )}
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

              {!isPassphraseVerified && isSharedView && selectedProject?.share_passphrase && (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-6 border border-slate-100">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">秘密の合言葉が必要です</h3>
                  <p className="text-slate-500 mb-8 text-center max-w-sm">
                    このプロジェクトは保護されています。<br />合言葉を入力して中身を確認してください。
                  </p>
                  <div className="flex w-full max-w-xs gap-2">
                    <input
                      type="password"
                      value={enteredPassphrase}
                      onChange={(e) => setEnteredPassphrase(e.target.value)}
                      placeholder="合言葉を入力..."
                      className="input-field py-3 text-center"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && enteredPassphrase === selectedProject.share_passphrase) {
                          setIsPassphraseVerified(true);
                          fetchEntries(selectedProject.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (enteredPassphrase === selectedProject.share_passphrase) {
                          setIsPassphraseVerified(true);
                          fetchEntries(selectedProject.id);
                        } else {
                          alert('合言葉が正しくありません。');
                        }
                      }}
                      className="primary-button py-3 px-6"
                    >
                      開く
                    </button>
                  </div>
                </div>
              )}

              {(isPassphraseVerified || !isSharedView) && (
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
                          onReact={(emoji) => handleAddReaction(entry.id, emoji)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
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

              <div className="space-y-8">
                {!previewUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video rounded-3xl border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 bg-slate-50 group"
                  >
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Sparkles className="text-indigo-500" size={32} />
                    </div>
                    <p className="text-slate-400 text-sm font-bold">画像または音声のカケラを選択してください</p>
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
                    disabled={!file || uploading}
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
