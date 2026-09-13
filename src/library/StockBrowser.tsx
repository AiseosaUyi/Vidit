import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '../editor/types';
import { Icon } from '../components/icons';
import { useT } from '../i18n/locale';
import { fallbackDuration, nameFromUrl, probeUrl } from '../agent/tools/stock-url-utils';

// Stock-media tab: free-tier Pexels/Pixabay/Unsplash search (server proxy at
// /api/stock-search, keys configured in Settings → Stock media). Mirrors
// SoundBrowser's search+chips shape; results render as a thumbnail grid with
// a hover "add" action that materializes the pick into the media pool via
// /api/import-url + commands.addAsset (see agent/tools/stock-tools.ts for the
// server-side equivalent this client-side path parallels).

type StockKind = 'video' | 'image';

interface StockResult {
  platform: string;
  kind: 'image' | 'video' | 'audio';
  previewUrl: string;
  importUrl: string;
  width?: number;
  height?: number;
  author?: string;
  durationSeconds?: number;
}

interface StockSearchResponse {
  configured: boolean;
  results: StockResult[];
  warnings: string[];
}

interface StockBrowserProps {
  fps: number;
  onAdd: (asset: MediaAsset) => void;
}

const newId = (): string =>
  (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `a_${Date.now()}`;

async function importStockResult(result: StockResult, fps: number): Promise<MediaAsset> {
  let src = result.importUrl;
  try {
    const res = await fetch('/api/import-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: result.importUrl }),
    });
    const body = await res.json().catch(() => null) as { ok?: boolean; path?: string } | null;
    if (body?.ok && typeof body.path === 'string' && body.path.startsWith('/media/')) {
      src = body.path;
    }
  } catch {
    // keep the remote URL — the browser may still be able to stream it directly
  }
  let width = result.width;
  let height = result.height;
  let durationInFrames: number;
  if (result.kind === 'video' && result.durationSeconds) {
    durationInFrames = Math.max(1, Math.round(result.durationSeconds * fps));
  } else if (result.kind === 'image') {
    durationInFrames = fallbackDuration('image', fps);
  } else {
    try {
      const probe = await probeUrl(src, result.kind === 'video' ? 'video' : 'image', fps);
      durationInFrames = probe.durationInFrames;
      width = width ?? probe.width;
      height = height ?? probe.height;
    } catch {
      durationInFrames = fallbackDuration('video', fps);
    }
  }
  return {
    id: newId(),
    name: `${result.platform}-${nameFromUrl(result.importUrl)}`,
    kind: result.kind,
    src,
    durationInFrames,
    width,
    height,
  };
}

export const StockBrowser = memo(function StockBrowser({ fps, onAdd }: StockBrowserProps) {
  const t = useT();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<StockKind>('video');
  const [results, setResults] = useState<StockResult[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useCallback((q: string, k: StockKind) => {
    abortRef.current?.abort();
    if (!q.trim()) {
      setResults([]);
      setWarnings([]);
      setError(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ query: q.trim(), kind: k, limitPerPlatform: '8' });
    fetch(`/api/stock-search?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json() as Promise<StockSearchResponse>)
      .then((body) => {
        setConfigured(body.configured);
        setResults(body.results ?? []);
        setWarnings(body.warnings ?? []);
      })
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError(reason instanceof Error ? reason.message : String(reason));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query, kind), 350);
    return () => clearTimeout(timer);
  }, [query, kind, runSearch]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const addResult = useCallback(async (result: StockResult) => {
    const key = `${result.platform}-${result.importUrl}`;
    setAddingKey(key);
    try {
      onAdd(await importStockResult(result, fps));
    } finally {
      setAddingKey((current) => (current === key ? null : current));
    }
  }, [fps, onAdd]);

  return (
    <div className="cc-sound-browser">
      <label className="cc-sound-search" htmlFor="cc-stock-library-search">
        <Icon name="search" size={13} />
        <input
          id="cc-stock-library-search"
          type="search"
          placeholder={t('搜索免费图片 / 视频素材（Pexels · Pixabay · Unsplash）')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        {query ? (
          <button type="button" className="cc-sound-search-clear" onClick={() => setQuery('')} aria-label={t('清除')}>
            <Icon name="x" size={12} />
          </button>
        ) : null}
      </label>

      <div className="cc-sound-chips" role="tablist" aria-label={t('素材类型')}>
        <button type="button" role="tab" aria-selected={kind === 'video'}
          className={`cc-sound-chip${kind === 'video' ? ' selected' : ''}`} onClick={() => setKind('video')}>
          {t('视频')}
        </button>
        <button type="button" role="tab" aria-selected={kind === 'image'}
          className={`cc-sound-chip${kind === 'image' ? ' selected' : ''}`} onClick={() => setKind('image')}>
          {t('图片')}
        </button>
      </div>

      {!query.trim() ? (
        <div className="cc-sound-empty">{t('输入关键词搜索可商用免费素材')}</div>
      ) : loading ? (
        <div className="cc-sound-empty">{t('搜索中…')}</div>
      ) : error ? (
        <div className="cc-sound-empty">{t('搜索失败：{error}', { error })}</div>
      ) : !configured ? (
        <div className="cc-sound-empty">
          {t('未配置素材库 API key。前往 设置 → 在线图库，填入免费的 Pexels / Pixabay / Unsplash key 即可启用（均有免费额度，无需付费）。')}
        </div>
      ) : results.length === 0 ? (
        <div className="cc-sound-empty">{t('没有找到匹配的素材')}</div>
      ) : (
        <div className="cc-stock-grid">
          {results.map((result) => {
            const key = `${result.platform}-${result.importUrl}`;
            return (
              <button
                key={key}
                type="button"
                className="cc-stock-card"
                disabled={addingKey === key}
                onClick={() => void addResult(result)}
                title={t('添加到素材库：{platform}', { platform: result.platform })}
              >
                <span className="cc-stock-thumb" style={{ backgroundImage: `url(${result.previewUrl})` }}>
                  {result.kind === 'video' && result.durationSeconds ? (
                    <span className="cc-stock-badge">{Math.round(result.durationSeconds)}s</span>
                  ) : null}
                  <span className="cc-stock-add">
                    <Icon name={addingKey === key ? 'clock' : 'plus'} size={16} />
                  </span>
                </span>
                <span className="cc-stock-meta">
                  <span className="cc-stock-platform">{result.platform}</span>
                  {result.author ? <span className="cc-stock-author">{result.author}</span> : null}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {warnings.length > 0 && <div className="cc-sound-hint">{warnings.join(' · ')}</div>}
    </div>
  );
});
