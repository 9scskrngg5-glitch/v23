import { useState, useRef, useEffect } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { C, F, card } from "../lib/design";

const useGroups = (userId) => {
  const [groups, setGroups] = useState(() => { try { return JSON.parse(localStorage.getItem("tj_groups") || "[]"); } catch { return []; } });
  const save = (next) => { setGroups(next); localStorage.setItem("tj_groups", JSON.stringify(next)); };
  const createGroup = (name, description) => {
    const group = { id: `grp_${Date.now()}`, name, description, createdBy: userId, members: [userId], inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(), posts: [], createdAt: Date.now() };
    save([...groups, group]); return group;
  };
  const joinGroup = (code) => {
    const g = groups.find(g => g.inviteCode === code.toUpperCase());
    if (!g) return null;
    if (g.members.includes(userId)) return g;
    const updated = { ...g, members: [...g.members, userId] };
    save(groups.map(gr => gr.id === g.id ? updated : gr)); return updated;
  };
  const postToGroup = (groupId, content, tradeData, imageBase64, asset) => {
    const newPost = { id: `post_${Date.now()}`, userId, content, tradeData, imageBase64, asset, createdAt: Date.now(), likes: [] };
    save(groups.map(g => g.id === groupId ? { ...g, posts: [...(g.posts || []), newPost] } : g));
  };
  const likePost = (groupId, postId) => {
    save(groups.map(g => g.id === groupId ? { ...g, posts: g.posts.map(p => p.id === postId ? { ...p, likes: p.likes?.includes(userId) ? p.likes.filter(id => id !== userId) : [...(p.likes || []), userId] } : p) } : g));
  };
  const myGroups = groups.filter(g => g.members?.includes(userId));
  return { groups: myGroups, allGroups: groups, createGroup, joinGroup, postToGroup, likePost };
};

// Mini equity chart component for hover preview
const MiniEquityChart = ({ data }) => {
  if (!data?.length) return null;
  const isPositive = data[data.length - 1]?.eq >= data[0]?.eq;
  return (
    <div style={{ width: "100%", height: 80 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="eq" stroke={isPositive ? ${C.green} : ${C.re}d} strokeWidth={2} dot={false} />
          <Tooltip contentStyle={{ background: ${C.bgCard}, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: F.mono, fontSize: 10 }} formatter={v => [`${v >= 0 ? "+" : ""}${v.toFixed(2)}$`]} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Post card with hover image and chart preview
const PostCard = ({ post, userId, onLike }) => {
  const [imgHover, setImgHover] = useState(false);
  const [imgFull, setImgFull] = useState(false);
  const liked = post.likes?.includes(userId);

  return (
    <>
      {imgFull && post.imageBase64 && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setImgFull(false)}>
          <img src={post.imageBase64} alt="trade" style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 12, objectFit: "contain" }} />
          <button onClick={() => setImgFull(false)} style={{ position: "fixed", top: 20, right: 24, background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" }}>✕</button>
        </div>
      )}

      <div style={{ ...card(), marginBottom: 10 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: ${C.bgInner}, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: ${C.textDim}, fontFamily: F.mono }}>
              {post.userId === userId ? "T" : post.userId.slice(-1).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 12, color: ${C.text}, fontFamily: F.mono }}>{post.userId === userId ? "Toi" : `Trader #${post.userId.slice(-4)}`}</div>
              <div style={{ fontSize: 10, color: ${C.textDim}, fontFamily: F.mono }}>{new Date(post.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          </div>
          {post.asset && (
            <span style={{ fontSize: 11, color: ${C.green}, fontFamily: F.mono, background: ${C.greenDim}, border: `1px solid ${C.greenBord}`, borderRadius: 20, padding: "3px 10px" }}>
              {post.asset}
            </span>
          )}
        </div>

        {/* Content */}
        {post.content && <div style={{ fontSize: 13, color: ${C.textMid}, lineHeight: 1.65, marginBottom: post.imageBase64 || post.tradeData ? 12 : 0 }}>{post.content}</div>}

        {/* Screenshot with hover preview */}
        {post.imageBase64 && (
          <div style={{ position: "relative", marginBottom: 10 }}
            onMouseEnter={() => setImgHover(true)}
            onMouseLeave={() => setImgHover(false)}
          >
            <img src={post.imageBase64} alt="chart" onClick={() => setImgFull(true)} style={{
              width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 10,
              cursor: "pointer", border: `1px solid ${C.border}`, transition: "opacity 0.15s",
              opacity: imgHover ? 0.85 : 1,
            }} />
            {imgHover && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "rgba(0,0,0,0.3)", pointerEvents: "none" }}>
                <span style={{ color: "#fff", fontFamily: F.mono, fontSize: 12, background: "rgba(0,0,0,0.6)", padding: "7px 14px", borderRadius: 20 }}>Cliquer pour agrandir</span>
              </div>
            )}
          </div>
        )}

        {/* Stats card with mini chart */}
        {post.tradeData && (
          <div style={{ background: ${C.bgInner}, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 16, marginBottom: post.tradeData.equity?.length ? 10 : 0 }}>
              {[
                ["Win Rate", `${post.tradeData.winRate}%`, Number(post.tradeData.winRate) >= 50 ? ${C.green} : ${C.red}],
                ["PnL", `${Number(post.tradeData.totalPnL) >= 0 ? "+" : ""}${post.tradeData.totalPnL}$`, Number(post.tradeData.totalPnL) >= 0 ? ${C.green} : ${C.red}],
                ["Trades", post.tradeData.total, ${C.text}],
              ].map(([l, v, c]) => (
                <div key={l}>
                  <div style={{ fontSize: 9, color: ${C.textDim}, fontFamily: F.mono, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: c, fontFamily: "'Syne', sans-serif" }}>{v}</div>
                </div>
              ))}
            </div>
            {post.tradeData.equity?.length > 1 && <MiniEquityChart data={post.tradeData.equity} />}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={onLike} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: liked ? ${C.red} : ${C.textDim}, fontFamily: F.mono, fontSize: 12, padding: 0 }}>
            {liked ? "♥" : "♡"} {post.likes?.length || 0}
          </button>
        </div>
      </div>
    </>
  );
};

// Post composer
const PostComposer = ({ groupId, userId, stats, equity, onPost }) => {
  const [content, setContent] = useState("");
  const [asset, setAsset] = useState("");
  const [shareStats, setShareStats] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      // Compress: max 800px wide
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 800;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.75);
        setImage(compressed);
        setImagePreview(compressed);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePost = () => {
    if (!content.trim() && !imagePreview) return;
    const tradeData = shareStats && stats ? { winRate: stats.winRate, totalPnL: stats.totalPnL, total: stats.total, equity: equity?.slice(-20) || [] } : null;
    onPost(groupId, content, tradeData, image, asset.trim().toUpperCase() || null);
    setContent(""); setAsset(""); setShareStats(false); setImage(null); setImagePreview(null);
  };

  return (
    <div style={{ ...card(), marginBottom: 16 }}>
      {/* Asset + content */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <input value={asset} onChange={e => setAsset(e.target.value)} placeholder="Actif (BTC, EURUSD...)"
          style={{ background: ${C.bgInner}, border: `1px solid ${C.border}`, color: ${C.text}, padding: "9px 12px", borderRadius: 8, fontSize: 12, fontFamily: F.mono, outline: "none", width: 150 }}
          onFocus={e => e.target.style.borderColor = ${C.gree}n} onBlur={e => e.target.style.borderColor = ${C.borde}r}
        />
      </div>
      <textarea value={content} onChange={e => setContent(e.target.value)}
        placeholder="Partage un setup, une analyse, un trade..."
        style={{ width: "100%", minHeight: 80, background: ${C.bgInner}, border: `1px solid ${C.border}`, color: ${C.text}, borderRadius: 9, padding: "10px 14px", fontSize: 13, fontFamily: F.mono, outline: "none", resize: "vertical", marginBottom: 10 }}
        onFocus={e => e.target.style.borderColor = ${C.gree}n} onBlur={e => e.target.style.borderColor = ${C.borde}r}
      />

      {/* Image preview */}
      {imagePreview && (
        <div style={{ position: "relative", marginBottom: 10 }}>
          <img src={imagePreview} alt="preview" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 9, border: `1px solid ${C.border}` }} />
          <button onClick={() => { setImage(null); setImagePreview(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
      )}

      {/* Actions row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
          <button onClick={() => fileRef.current?.click()} style={{ padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 11, fontFamily: F.mono }}>
            📷 Screenshot
          </button>
          {stats && (
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 11, color: C.textDim, fontFamily: F.mono }}>
              <input type="checkbox" checked={shareStats} onChange={e => setShareStats(e.target.checked)} style={{ accentColor: C.green }} />
              Stats + graphique
            </label>
          )}
        </div>
        <button onClick={handlePost} disabled={!content.trim() && !imagePreview} style={{
          padding: "8px 18px", borderRadius: 8, border: "none",
          background: (content.trim() || imagePreview) ? C.green : C.bgInner,
          color: (content.trim() || imagePreview) ? "#000" : C.textDim,
          cursor: (content.trim() || imagePreview) ? "pointer" : "not-allowed",
          fontSize: 11, fontWeight: 700, fontFamily: F.mono, transition: "all 0.15s",
        }}>PUBLIER →</button>
      </div>
    </div>
  );
};

// Main component
export const TradingGroups = ({ userId, trades, stats, equity }) => {
  const { groups, createGroup, joinGroup, postToGroup, likePost } = useGroups(userId);
  const [view, setView] = useState("list");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const g = createGroup(form.name, form.description);
    setForm({ name: "", description: "" }); setShowCreate(false);
    setSelectedGroup(g); setView("group");
  };

  const handleJoin = () => {
    setJoinError("");
    const g = joinGroup(joinCode);
    if (!g) { setJoinError("Code invalide."); return; }
    setJoinCode(""); setShowJoin(false);
    setSelectedGroup(g); setView("group");
  };

  const getGroup = () => groups.find(g => g.id === selectedGroup?.id) || selectedGroup;

  // Group detail
  if (view === "group" && selectedGroup) {
    const current = getGroup();
    return (
      <div className="fade-in">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => setView("list")} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 7, color: C.textDim, cursor: "pointer", fontSize: 10, fontFamily: F.mono, padding: "7px 14px" }}>← RETOUR</button>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: C.text, margin: 0, letterSpacing: "-0.01em" }}>{current?.name}</h2>
            <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono }}>
              {current?.members?.length} membre{current?.members?.length > 1 ? "s" : ""} · Code: <span style={{ color: C.green, letterSpacing: "0.1em" }}>{current?.inviteCode}</span>
            </div>
          </div>
        </div>

        <PostComposer groupId={current?.id} userId={userId} stats={stats} equity={equity} onPost={postToGroup} />

        <div>
          {(!current?.posts || current.posts.length === 0) ? (
            <div style={{ ...card(), textAlign: "center", color: C.textGhost, fontSize: 12, fontFamily: F.mono, padding: "32px 24px" }}>
              Aucune publication. Sois le premier à partager !
            </div>
          ) : (
            [...(current?.posts || [])].reverse().map(post => (
              <PostCard key={post.id} post={post} userId={userId}
                onLike={() => { likePost(current.id, post.id); setSelectedGroup({ ...current }); }}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // List
  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", marginBottom: 6, textTransform: "uppercase" }}>Groupes de Trading</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", margin: 0, color: C.text, letterSpacing: "-0.02em" }}>Communauté</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setShowJoin(s => !s); setShowCreate(false); }} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 11, fontFamily: F.mono }}>REJOINDRE</button>
          <button onClick={() => { setShowCreate(s => !s); setShowJoin(false); }} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: C.green, color: "#000", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: F.mono }}>+ CRÉER</button>
        </div>
      </div>

      {showJoin && (
        <div style={{ ...card(), marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Code d'invitation</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="ABC123"
              style={{ background: C.bgInner, border: `1px solid ${C.border}`, color: C.text, padding: "9px 14px", borderRadius: 8, fontSize: 14, fontFamily: F.mono, outline: "none", flex: 1, letterSpacing: "0.1em" }}
              onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
            />
            <button onClick={handleJoin} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: C.green, color: "#000", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: F.mono }}>OK</button>
          </div>
          {joinError && <div style={{ marginTop: 8, fontSize: 12, color: C.red, fontFamily: F.mono }}>{joinError}</div>}
        </div>
      )}

      {showCreate && (
        <div style={{ ...card(), marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Nouveau groupe</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["name", "Nom *", "Mon groupe de trading"], ["description", "Description", "Description optionnelle..."]].map(([k, l, ph]) => (
              <div key={k}>
                <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 5, fontFamily: F.mono, letterSpacing: "0.1em", textTransform: "uppercase" }}>{l}</label>
                <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={ph}
                  style={{ background: C.bgInner, border: `1px solid ${C.border}`, color: C.text, padding: "9px 14px", borderRadius: 8, fontSize: 13, fontFamily: F.mono, outline: "none", width: "100%" }}
                  onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
            ))}
            <button onClick={handleCreate} disabled={!form.name.trim()} style={{ padding: "10px", borderRadius: 8, border: "none", background: form.name.trim() ? C.green : C.bgInner, color: form.name.trim() ? "#000" : C.textDim, cursor: form.name.trim() ? "pointer" : "not-allowed", fontSize: 12, fontWeight: 700, fontFamily: F.mono }}>CRÉER LE GROUPE</button>
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div style={{ ...card(), textAlign: "center", color: C.textGhost, fontSize: 12, fontFamily: F.mono, padding: "48px 24px" }}>
          Rejoins ou crée un groupe pour partager tes analyses avec d'autres traders.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {groups.map(g => (
            <div key={g.id} onClick={() => { setSelectedGroup(g); setView("group"); }} style={{ ...card(), cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHov}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Syne', sans-serif", marginBottom: g.description ? 6 : 10 }}>{g.name}</div>
              {g.description && <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10, lineHeight: 1.5 }}>{g.description}</div>}
              <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono }}>{g.members?.length} membre{g.members?.length > 1 ? "s" : ""}</span>
                <span style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono }}>{g.posts?.length || 0} post{(g.posts?.length || 0) > 1 ? "s" : ""}</span>
              </div>
              <div style={{ fontSize: 10, color: C.green, fontFamily: F.mono, letterSpacing: "0.1em" }}>Code: {g.inviteCode}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
