import { useState, useEffect, useRef } from 'react'
import {
  loadAiConfig, saveAiConfig, encodeImageForAi, runPrecheck,
  mapAreaToMarkType, SEVERITY_ORDER, DEFAULT_MODEL,
} from './aiPrecheck.js'

const GUIDE_PREFS_KEY = 'jcviz-self-qc-guides-v1'
const PHI = 1.6180339887498949

// Build a corner-anchored golden spiral as a sequence of quarter arcs.
function buildSpiralPath(W, H) {
  let rH = Math.min(H, W / PHI)
  let rW = PHI * rH
  if (rW > W) { rW = W; rH = W / PHI }
  const ox = (W - rW) / 2
  const oy = (H - rH) / 2

  const sequences = {
    left: (x, y, w, h) => ({
      size: h, entry: [x, y], exit: [x + h, y + h],
      next: { x: x + h, y, w: w - h, h },
    }),
    bottom: (x, y, w, h) => ({
      size: w, entry: [x, y + h], exit: [x + w, y + h - w],
      next: { x, y, w, h: h - w },
    }),
    right: (x, y, w, h) => ({
      size: h, entry: [x + w, y + h], exit: [x + w - h, y],
      next: { x, y, w: w - h, h },
    }),
    top: (x, y, w, h) => ({
      size: w, entry: [x + w, y], exit: [x, y + w],
      next: { x, y: y + w, w, h: h - w },
    }),
  }
  const cutOrder = ['left', 'bottom', 'right', 'top']

  let x = ox, y = oy, w = rW, h = rH
  let path = ''
  let started = false
  const minSize = Math.min(rW, rH) * 0.01

  for (let i = 0; i < 12; i++) {
    const step = sequences[cutOrder[i % 4]](x, y, w, h)
    if (step.size < minSize) break
    if (!started) {
      path += `M ${step.entry[0].toFixed(2)} ${step.entry[1].toFixed(2)} `
      started = true
    }
    path += `A ${step.size.toFixed(2)} ${step.size.toFixed(2)} 0 0 0 ${step.exit[0].toFixed(2)} ${step.exit[1].toFixed(2)} `
    x = step.next.x; y = step.next.y; w = step.next.w; h = step.next.h
    if (Math.min(w, h) < minSize) break
  }
  return path.trim()
}

function loadGuidePrefs() {
  try {
    const raw = localStorage.getItem(GUIDE_PREFS_KEY)
    if (raw) return new Set(JSON.parse(raw))
  } catch { /* ignore */ }
  return new Set(['thirds'])
}

const clamp01to100 = (v) => Math.max(0, Math.min(100, v))

export default function ImageReviewHelper({ phase, marking, aiContext }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [imageDims, setImageDims] = useState(null)
  const [activeGuides, setActiveGuides] = useState(loadGuidePrefs)
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [drawingState, setDrawingState] = useState(null)

  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const objectUrlRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(GUIDE_PREFS_KEY, JSON.stringify([...activeGuides]))
  }, [activeGuides])

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setImageDims(null)
    setImageUrl(url)
  }

  const clearImage = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
    setImageDims(null)
    setImageUrl(null)
  }

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    setIsDragging(false)
  }
  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) handleFile(file)
  }

  const toggleGuide = (id) =>
    setActiveGuides((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleFullscreen = async () => {
    const el = containerRef.current
    if (!el) return
    try {
      if (!document.fullscreenElement) await el.requestFullscreen()
      else await document.exitFullscreen()
    } catch { /* fullscreen denied */ }
  }

  const onImageLoad = (e) => {
    const img = e.currentTarget
    setImageDims({ w: img.naturalWidth, h: img.naturalHeight })
  }

  // Phase-scoped guides
  const phaseGuides = phase.guides
  const activeCompositionIds = new Set(
    phaseGuides
      .filter((g) => g.kind === 'composition' && activeGuides.has(g.id))
      .map((g) => g.id)
  )
  const activeHintGuides = phaseGuides.filter(
    (g) => g.kind === 'hint' && activeGuides.has(g.id)
  )

  // Drawing math
  const computeXY = (clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 0, y: 0 }
    return {
      x: clamp01to100(((clientX - rect.left) / rect.width) * 100),
      y: clamp01to100(((clientY - rect.top) / rect.height) * 100),
    }
  }

  const isDrawingMode = marking.mode !== 'select'
  const isPinMode = marking.mode === 'pin'

  const handleDrawPointerDown = (e) => {
    if (!imageUrl) return
    if (isPinMode) return // pin uses click, not drag
    const { x, y } = computeXY(e.clientX, e.clientY)
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrawingState({ pointerId: e.pointerId, startX: x, startY: y, currentX: x, currentY: y })
  }

  const handleDrawPointerMove = (e) => {
    if (!drawingState || drawingState.pointerId !== e.pointerId) return
    const { x, y } = computeXY(e.clientX, e.clientY)
    setDrawingState((prev) => prev && { ...prev, currentX: x, currentY: y })
  }

  const handleDrawPointerUp = (e) => {
    if (!drawingState || drawingState.pointerId !== e.pointerId) {
      setDrawingState(null)
      return
    }
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
    const { startX, startY, currentX, currentY } = drawingState
    const x = Math.min(startX, currentX)
    const y = Math.min(startY, currentY)
    const w = Math.abs(currentX - startX)
    const h = Math.abs(currentY - startY)
    setDrawingState(null)
    if (w < 1 || h < 1) return // ignore tiny drags
    marking.onAdd({
      type: marking.mode,
      xPercent: x,
      yPercent: y,
      widthPercent: w,
      heightPercent: h,
    })
  }

  const handlePinClick = (e) => {
    if (!imageUrl || !isPinMode) return
    const { x, y } = computeXY(e.clientX, e.clientY)
    marking.onAdd({ type: 'pin', xPercent: x, yPercent: y, note: '' })
  }

  // Pin numbering (1-indexed by createdAt)
  const pinsSorted = [...marking.marks]
    .filter((m) => m.type === 'pin')
    .sort((a, b) => a.createdAt - b.createdAt)
  const pinNumberOf = (id) => pinsSorted.findIndex((p) => p.id === id) + 1

  return (
    <section className="bg-white border border-slate-200 rounded-lg h-full flex flex-col overflow-hidden dark:bg-[#111827] dark:border-white/10">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-slate-200 shrink-0 dark:border-white/10">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-slate-700 dark:text-slate-200">Image Review Helper</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Mở ảnh từ máy để soi. Ảnh chỉ nằm trong trình duyệt, không upload đi đâu.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {imageUrl && (
            <button
              onClick={clearImage}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition"
            >
              Xóa ảnh
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10 transition"
          >
            {imageUrl ? 'Đổi ảnh' : 'Mở ảnh'}
          </button>
        </div>
      </div>

      {/* Mark toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-200 dark:border-white/10 shrink-0 flex-wrap">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">Mark</span>
        <button
          type="button"
          onClick={() => marking.setMode('select')}
          className={`px-2.5 py-1 text-[11px] font-medium rounded transition ${
            marking.mode === 'select'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
          }`}
        >
          Chọn
        </button>
        {marking.types.map((t) => {
          const active = marking.mode === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => marking.setMode(active ? 'select' : t.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition flex items-center gap-1.5 ${
                active
                  ? `${t.activeBgCls} text-white`
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
              }`}
            >
              <span className={`w-2 h-2 rounded-sm ${t.dotCls}`} />
              {t.label}
            </button>
          )
        })}
        <span className="grow" />
        <button
          type="button"
          onClick={marking.onDeleteSelected}
          disabled={!marking.selectedId}
          className="px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 disabled:text-slate-400 disabled:hover:bg-transparent disabled:cursor-not-allowed dark:text-rose-400 dark:hover:bg-rose-500/10 dark:disabled:text-slate-500 transition rounded"
        >
          Xóa mark đang chọn
        </button>
        <button
          type="button"
          onClick={marking.onClearAll}
          disabled={marking.marks.length === 0}
          className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed dark:text-slate-400 dark:hover:text-slate-100 dark:disabled:text-slate-600 transition rounded"
        >
          Xóa tất cả
        </button>
      </div>

      {/* AI pre-check panel (additive — gọi vision LLM qua gateway LAN) */}
      <AIPrecheckPanel
        imageUrl={imageUrl}
        aiContext={aiContext}
        onAddMark={marking.onAdd}
        markTypes={marking.types}
      />

      {/* Body */}
      {!imageUrl ? (
        <div className="flex-1 min-h-0 p-3">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`h-full flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg cursor-pointer transition select-none ${
              isDragging
                ? 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-white/10'
                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 dark:border-white/15 dark:hover:border-white/30 dark:hover:bg-white/5'
            }`}
          >
            <svg className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1.5M16 10l-4-4m0 0-4 4m4-4v12" />
            </svg>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Kéo ảnh vào đây</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">hoặc bấm để chọn file</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3">Hỗ trợ JPG, PNG, WebP — ảnh chỉ nằm trong trình duyệt của bạn</p>

            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-6 max-w-md text-left text-[11px] leading-relaxed bg-slate-50 border border-slate-200 rounded-md px-3.5 py-2.5 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-slate-300"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Hướng dẫn nhanh
              </div>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Mở ảnh từ máy</li>
                <li>Chọn phase cần kiểm</li>
                <li>Đọc Focus Coach + checklist + lens</li>
                <li>Mark vùng cần chú ý lên ảnh</li>
                <li>Đánh dấu Đạt / Cần sửa từng mục</li>
              </ol>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 p-3">
          <div
            ref={containerRef}
            className={`relative bg-[#080A0F] overflow-hidden h-full flex items-center justify-center ${
              isFullscreen ? 'rounded-none' : 'rounded-lg'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <img
              src={imageUrl}
              onLoad={onImageLoad}
              alt=""
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain z-0 select-none"
            />

            {/* Composition guides — z-10, no pointer events */}
            {imageDims && activeCompositionIds.size > 0 && (
              <svg
                viewBox={`0 0 ${imageDims.w} ${imageDims.h}`}
                className="absolute inset-0 w-full h-full z-10 pointer-events-none"
              >
                <CompositionShapes dims={imageDims} activeIds={activeCompositionIds} />
              </svg>
            )}

            {/* Marks layer — z-20 */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              {marking.marks.map((mark) => (
                <MarkOverlay
                  key={mark.id}
                  mark={mark}
                  type={marking.types.find((t) => t.id === mark.type)}
                  isSelected={marking.selectedId === mark.id}
                  pinNumber={mark.type === 'pin' ? pinNumberOf(mark.id) : null}
                  // marks are clickable only when in select mode (otherwise drawing layer is on top)
                  onSelect={(id) => marking.setSelectedId(id)}
                  selectable={marking.mode === 'select'}
                />
              ))}
            </div>

            {/* Drawing interaction layer — z-30, only in drawing mode */}
            {isDrawingMode && (
              <div
                className="absolute inset-0 z-30 cursor-crosshair touch-none"
                onPointerDown={handleDrawPointerDown}
                onPointerMove={handleDrawPointerMove}
                onPointerUp={handleDrawPointerUp}
                onPointerCancel={() => setDrawingState(null)}
                onClick={isPinMode ? handlePinClick : undefined}
              >
                {/* Drawing preview rectangle */}
                {drawingState && !isPinMode && (() => {
                  const t = marking.types.find((x) => x.id === marking.mode)
                  const x = Math.min(drawingState.startX, drawingState.currentX)
                  const y = Math.min(drawingState.startY, drawingState.currentY)
                  const w = Math.abs(drawingState.currentX - drawingState.startX)
                  const h = Math.abs(drawingState.currentY - drawingState.startY)
                  return (
                    <div
                      className={`absolute border-2 border-dashed ${t?.borderCls || ''} ${t?.fillCls || ''} pointer-events-none`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${w}%`,
                        height: `${h}%`,
                      }}
                    />
                  )
                })()}
              </div>
            )}

            {/* Hint badges — z-40 */}
            {activeHintGuides.length > 0 && (
              <div className="absolute top-3 left-3 z-40 flex flex-col gap-1.5 max-w-[300px] pointer-events-none">
                {activeHintGuides.map((g) => (
                  <div
                    key={g.id}
                    className="px-3 py-2 bg-black/65 backdrop-blur-sm rounded-md text-white shadow"
                  >
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {g.label}
                    </div>
                    {g.hint && (
                      <div className="text-[11px] text-slate-200 mt-0.5 leading-snug">{g.hint}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Top-right: fullscreen toggle — z-40 */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-3 right-3 z-40 px-3 py-1.5 text-xs font-medium bg-black/60 text-white rounded-md backdrop-blur hover:bg-black/80 transition"
            >
              {isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            </button>

            {/* Bottom-center: phase-specific guide toolbar — z-40 */}
            {phaseGuides.length > 0 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex flex-wrap justify-center gap-1.5 max-w-[calc(100%-2rem)] px-2 py-1.5 bg-black/60 rounded-md backdrop-blur">
                {phaseGuides.map((g) => {
                  const active = activeGuides.has(g.id)
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGuide(g.id)}
                      title={g.hint || g.label}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition ${
                        active
                          ? 'bg-white text-slate-900'
                          : 'text-slate-200 hover:bg-white/15'
                      }`}
                    >
                      {g.label}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Drag-over indicator — top z, non-interactive */}
            {isDragging && (
              <div className="absolute inset-0 z-50 bg-slate-900/85 flex items-center justify-center text-white text-sm font-medium pointer-events-none">
                Thả để đổi ảnh
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function MarkOverlay({ mark, type, isSelected, pinNumber, onSelect, selectable }) {
  if (!type) return null

  const stop = (e) => e.stopPropagation()

  if (mark.type === 'pin') {
    return (
      <button
        type="button"
        style={{
          left: `${mark.xPercent}%`,
          top: `${mark.yPercent}%`,
        }}
        onClick={(e) => { stop(e); onSelect(mark.id) }}
        title={mark.note || `Pin #${pinNumber}`}
        className={`absolute -translate-x-1/2 -translate-y-1/2 ${selectable ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'} ${isSelected ? 'scale-125' : ''} transition-transform`}
      >
        <span className={`block w-6 h-6 rounded-full ${type.dotCls} text-white text-[11px] font-semibold flex items-center justify-center shadow-lg ring-2 ${isSelected ? 'ring-white' : 'ring-white/40'}`}>
          {pinNumber}
        </span>
      </button>
    )
  }

  return (
    <div
      onClick={(e) => { if (selectable) { stop(e); onSelect(mark.id) } }}
      style={{
        left: `${mark.xPercent}%`,
        top: `${mark.yPercent}%`,
        width: `${mark.widthPercent}%`,
        height: `${mark.heightPercent}%`,
      }}
      className={`absolute border-2 ${type.borderCls} ${type.fillCls} ${selectable ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'} ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-black/40' : ''}`}
    >
      <span className={`absolute -top-5 left-0 px-1.5 py-0.5 text-[10px] font-semibold rounded text-white whitespace-nowrap ${type.dotCls}`}>
        {type.label}
      </span>
    </div>
  )
}

function CompositionShapes({ dims, activeIds }) {
  const { w, h } = dims
  return (
    <g
      fill="none"
      stroke="white"
      strokeOpacity="0.65"
      strokeWidth="1.25"
      vectorEffect="non-scaling-stroke"
    >
      {activeIds.has('thirds') && (
        <>
          <line x1={w / 3} y1={0} x2={w / 3} y2={h} />
          <line x1={(2 * w) / 3} y1={0} x2={(2 * w) / 3} y2={h} />
          <line x1={0} y1={h / 3} x2={w} y2={h / 3} />
          <line x1={0} y1={(2 * h) / 3} x2={w} y2={(2 * h) / 3} />
        </>
      )}
      {activeIds.has('center') && (
        <g strokeDasharray="6 5">
          <line x1={w / 2} y1={0} x2={w / 2} y2={h} />
          <line x1={0} y1={h / 2} x2={w} y2={h / 2} />
        </g>
      )}
      {activeIds.has('safe') && (
        <rect x={w * 0.05} y={h * 0.05} width={w * 0.9} height={h * 0.9} strokeDasharray="8 5" />
      )}
      {activeIds.has('diagonal') && (
        <>
          <line x1={0} y1={0} x2={w} y2={h} />
          <line x1={w} y1={0} x2={0} y2={h} />
        </>
      )}
      {activeIds.has('golden') && (
        <g stroke="#67e8f9" strokeOpacity="0.7">
          <line x1={w * 0.382} y1={0} x2={w * 0.382} y2={h} />
          <line x1={w * 0.618} y1={0} x2={w * 0.618} y2={h} />
          <line x1={0} y1={h * 0.382} x2={w} y2={h * 0.382} />
          <line x1={0} y1={h * 0.618} x2={w} y2={h * 0.618} />
        </g>
      )}
      {activeIds.has('spiral') && (
        <path
          d={buildSpiralPath(w, h)}
          stroke="#67e8f9"
          strokeOpacity="0.85"
          strokeWidth="1.5"
        />
      )}
    </g>
  )
}

const SEVERITY_STYLE = {
  high: 'bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-300',
  medium: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300',
  low: 'bg-slate-500/15 text-slate-600 border-slate-400/30 dark:text-slate-300',
}
const SEVERITY_LABEL = { high: 'Cao', medium: 'Vừa', low: 'Thấp' }
const EMPTY_SET = new Set()

const aiInputCls =
  'w-full px-2 py-1 text-[11px] rounded border border-slate-200 bg-white placeholder:text-slate-400 ' +
  'dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ' +
  'focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/30'

// AI pre-check: gọi vision LLM qua gateway LAN, hiện findings, cho phép tạo mark từ finding.
// Additive — không đụng checklist/marks/lens. Ảnh chỉ rời browser khi artist chủ động bấm.
function AIPrecheckPanel({ imageUrl, aiContext, onAddMark, markTypes, prominent = false, allPhases = null, onSelectPhase = null }) {
  const [open, setOpen] = useState(Boolean(prominent))
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState(loadAiConfig)
  // Kết quả lưu THEO TỪNG PHASE → đổi tab không mất; phase chưa chạy = trống.
  const [byPhase, setByPhase] = useState({}) // { [phaseId]: {result, meta, error, added:Set} }
  const [runningPhases, setRunningPhases] = useState(() => new Set())

  const phaseId = aiContext?.phaseId
  const cur = byPhase[phaseId] || {}
  const result = cur.result || null
  const meta = cur.meta || null
  const error = cur.error || null
  const addedIdx = cur.added || EMPTY_SET
  const loading = runningPhases.has(phaseId)
  const runAllInProgress = runningPhases.size > 0

  const configured = Boolean(config.gatewayUrl.trim() && config.apiKey.trim())
  const canRun = Boolean(imageUrl) && !loading

  const handleSaveConfig = () => {
    saveAiConfig(config)
    setConfig(loadAiConfig())
    setShowConfig(false)
  }

  // Chạy 1 phase, lưu kết quả vào byPhase[pid]. base64 truyền vào để run-all encode 1 lần.
  const runOne = async (pid, checklist, base64) => {
    setRunningPhases((prev) => new Set(prev).add(pid))
    setByPhase((prev) => ({ ...prev, [pid]: { ...(prev[pid] || {}), error: null } }))
    try {
      const res = await runPrecheck({
        gatewayUrl: config.gatewayUrl, apiKey: config.apiKey, model: config.model,
        base64, phase: pid, projectType: aiContext?.projectType, checklist,
      })
      setByPhase((prev) => ({
        ...prev,
        [pid]: res.ok
          ? { result: res.data, meta: res.meta, error: null, added: new Set() }
          : { result: null, meta: null, error: res.error, added: new Set() },
      }))
    } catch (e) {
      setByPhase((prev) => ({ ...prev, [pid]: { result: null, meta: null, error: e?.message || 'Lỗi xử lý ảnh.', added: new Set() } }))
    } finally {
      setRunningPhases((prev) => { const n = new Set(prev); n.delete(pid); return n })
    }
  }

  const handleRun = async () => {
    if (!imageUrl) return
    try {
      const base64 = await encodeImageForAi(imageUrl)
      await runOne(phaseId, aiContext?.checklist, base64)
    } catch (e) {
      setByPhase((prev) => ({ ...prev, [phaseId]: { result: null, meta: null, error: e?.message || 'Lỗi xử lý ảnh.', added: new Set() } }))
    }
  }

  // Review tổng thể: encode 1 lần, chạy TUẦN TỰ 5 phase (tránh quá tải VRAM box).
  const handleRunAll = async () => {
    if (!imageUrl || !allPhases?.length) return
    let base64
    try { base64 = await encodeImageForAi(imageUrl) }
    catch (e) { setByPhase((prev) => ({ ...prev, [phaseId]: { result: null, meta: null, error: e?.message || 'Lỗi xử lý ảnh.', added: new Set() } })); return }
    for (const p of allPhases) {
      await runOne(p.id, p.checklist, base64)
    }
  }

  const handleAddMark = (finding, idx) => {
    const mapped = mapAreaToMarkType(finding.area)
    const typeId = markTypes?.some((t) => t.id === mapped) ? mapped : 'fix'
    // Model không trả toạ độ → đặt mark mặc định, lệch nhẹ theo idx để không chồng khít.
    const x = Math.min(70, 32 + (idx % 3) * 10)
    const y = Math.min(70, 26 + (Math.floor(idx / 3) % 3) * 12)
    const note = `[AI] ${finding.title || ''}${finding.suggestion ? ' — ' + finding.suggestion : ''}`.trim()
    onAddMark({ type: typeId, xPercent: x, yPercent: y, widthPercent: 26, heightPercent: 20, note })
    setByPhase((prev) => {
      const c = prev[phaseId] || {}
      const added = new Set(c.added || [])
      added.add(idx)
      return { ...prev, [phaseId]: { ...c, added } }
    })
  }

  const sortedFindings = result
    ? result.findings
        .map((f, i) => ({ f, i }))
        .sort((a, b) => (SEVERITY_ORDER[a.f.severity] ?? 9) - (SEVERITY_ORDER[b.f.severity] ?? 9))
    : []

  return (
    <div className="border-b border-slate-200 dark:border-white/10 shrink-0">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
        <button
          type="button"
          onClick={() => { if (!prominent) setOpen((o) => !o) }}
          className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          AI pre-check
          <span className="text-[9px] font-normal normal-case text-slate-400">(beta · LAN)</span>
        </button>
        <div className="flex items-center gap-2">
          {!configured && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400">chưa cấu hình</span>
          )}
          <button
            type="button"
            onClick={() => { setOpen(true); setShowConfig((s) => !s) }}
            className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition"
          >
            Cấu hình
          </button>
          {!prominent && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition"
            >
              {open ? 'Ẩn' : 'Mở'}
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="px-3 pb-2.5 space-y-2">
          {showConfig && (
            <div className="space-y-1.5 p-2 rounded bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gateway URL</label>
              <input
                type="text"
                value={config.gatewayUrl}
                onChange={(e) => setConfig((c) => ({ ...c, gatewayUrl: e.target.value }))}
                placeholder="http://192.168.x.x:8765"
                className={aiInputCls}
              />
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">API key</label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig((c) => ({ ...c, apiKey: e.target.value }))}
                placeholder="sk-jcviz-..."
                className={aiInputCls}
              />
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Model</label>
              <input
                type="text"
                value={config.model}
                onChange={(e) => setConfig((c) => ({ ...c, model: e.target.value }))}
                placeholder={DEFAULT_MODEL}
                className={aiInputCls}
              />
              <p className="text-[10px] leading-snug text-slate-400 dark:text-slate-500">
                Key lưu trong trình duyệt và hiển thị trong client — chỉ dùng cho gateway LAN nội bộ, đừng dùng key bí mật.
              </p>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-2.5 py-1 text-[11px] font-medium rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition"
              >
                Lưu cấu hình
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleRun}
            disabled={!canRun}
            title={!imageUrl ? 'Mở ảnh trước' : (!configured ? 'Cấu hình gateway trước' : '')}
            className="w-full px-3 py-1.5 text-[11px] font-medium rounded bg-violet-600 text-white hover:bg-violet-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-white/10 dark:disabled:text-slate-500 transition"
          >
            {loading ? 'Đang phân tích…' : (allPhases ? 'Review phase này' : 'Chạy AI pre-check (gửi ảnh sang box LAN nội bộ)')}
          </button>

          {allPhases && (
            <button
              type="button"
              onClick={handleRunAll}
              disabled={!imageUrl || runAllInProgress}
              className="w-full px-3 py-1.5 text-[11px] font-medium rounded border border-violet-300 text-violet-700 hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-violet-500/40 dark:text-violet-300 dark:hover:bg-violet-500/10 transition"
            >
              {runAllInProgress
                ? `Đang review… (${allPhases.filter((p) => byPhase[p.id]?.result || byPhase[p.id]?.error).length}/${allPhases.length})`
                : '★ Review tổng thể cả 5 phase'}
            </button>
          )}

          <p className="text-[10px] leading-snug text-slate-400 dark:text-slate-500">
            Ảnh sẽ rời trình duyệt sang box LAN nội bộ (không cloud, không lưu). Chỉ gửi khi bạn bấm.
            Kết quả chỉ là gợi ý — bạn vẫn là người quyết cuối.
          </p>

          {allPhases && allPhases.some((p) => byPhase[p.id]?.result || byPhase[p.id]?.error) && (
            <div className="p-2 rounded bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Tổng quan 5 phase</div>
              <div className="flex flex-col gap-0.5">
                {allPhases.map((p) => {
                  const b = byPhase[p.id]
                  const n = b?.result?.findings?.length
                  const running = runningPhases.has(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onSelectPhase && onSelectPhase(p.id)}
                      className={`flex items-center justify-between text-[11px] px-1.5 py-0.5 rounded text-left transition ${p.id === phaseId ? 'bg-violet-100 dark:bg-violet-500/20' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`}
                    >
                      <span className="text-slate-700 dark:text-slate-200">{p.short || p.name}</span>
                      <span className="text-[10px] tabular-nums">
                        {running ? <span className="text-violet-500">đang chạy…</span>
                          : b?.error ? <span className="text-rose-500">lỗi</span>
                          : typeof n === 'number'
                            ? <span className={n > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>{n > 0 ? `${n} điểm cần xem` : 'ổn'}</span>
                            : <span className="text-slate-400">chưa chạy</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="p-2 rounded text-[11px] bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {result.summary && (
                <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] leading-snug text-slate-700 dark:bg-white/5 dark:border-white/10 dark:text-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Nhận định</span>
                    {result.ready_hint
                      ? <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">AI gợi ý: ổn để review</span>
                      : <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">AI gợi ý: còn điểm cần xem</span>}
                  </div>
                  {result.summary}
                </div>
              )}

              {sortedFindings.length === 0 ? (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center py-2">
                  AI không nêu finding nào cho phase này.
                </p>
              ) : (
                sortedFindings.map(({ f, i }) => (
                  <div key={i} className="p-2 rounded border border-slate-200 dark:border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${SEVERITY_STYLE[f.severity] || SEVERITY_STYLE.medium}`}>
                        {SEVERITY_LABEL[f.severity] || f.severity}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400">{f.area}</span>
                      <span className="text-[11px] font-medium text-slate-800 dark:text-slate-100">{f.title}</span>
                    </div>
                    {f.observation && (
                      <p className="text-[11px] leading-snug text-slate-600 dark:text-slate-300">{f.observation}</p>
                    )}
                    {f.suggestion && (
                      <div className="mt-1 p-1.5 rounded bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">💡 Giải pháp</span>
                        <p className="text-[11px] leading-snug text-emerald-800 dark:text-emerald-200">{f.suggestion}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAddMark(f, i)}
                      disabled={addedIdx.has(i)}
                      className="px-2 py-0.5 text-[10px] font-medium rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:text-emerald-600 disabled:border-emerald-200 disabled:hover:bg-transparent dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10 dark:disabled:text-emerald-400 transition"
                    >
                      {addedIdx.has(i) ? '✓ Đã tạo mark' : 'Tạo mark'}
                    </button>
                  </div>
                ))
              )}

              {meta?.elapsedMs && (
                <p className="text-[9px] text-slate-400 dark:text-slate-500 text-right">
                  {meta.model} · {meta.elapsedMs}ms
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// AI Review mode — chế độ riêng (additive). Ảnh + marks RIÊNG (tách khỏi Self-QC),
// findings là view chính. Reuse MarkOverlay + AIPrecheckPanel(prominent) + aiPrecheck.js.
export function AIReviewMode({
  phaseOptions, projectType, markTypes,
  marks, onAddMark, onClearMarks, selectedId, onSelect, onDeleteSelected,
}) {
  const [imageUrl, setImageUrl] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedPhaseId, setSelectedPhaseId] = useState(phaseOptions[0]?.id || 'storytelling')
  const inputRef = useRef(null)
  const objectUrlRef = useRef(null)

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
  }, [])

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setImageUrl(url)
  }
  const clearImage = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
    setImageUrl(null)
  }
  const onDrop = (e) => {
    e.preventDefault(); setIsDragging(false)
    const f = e.dataTransfer?.files?.[0]; if (f) handleFile(f)
  }

  const phase = phaseOptions.find((p) => p.id === selectedPhaseId) || phaseOptions[0]
  const aiContext = { phaseId: selectedPhaseId, projectType, checklist: phase?.checklist || [] }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_clamp(360px,30vw,460px)] gap-3 h-full min-h-0 lg:min-h-[620px]">
      {/* Left: image + AI-created marks */}
      <section className="bg-white border border-slate-200 rounded-lg h-full flex flex-col overflow-hidden dark:bg-[#111827] dark:border-white/10 min-h-0">
        <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-slate-200 shrink-0 dark:border-white/10">
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-slate-700 dark:text-slate-200">AI Review <span className="text-[10px] font-normal text-violet-500">(beta)</span></h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Gợi ý từ AI — không thay QC người. Ảnh chỉ gửi khi bạn bấm Review.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {marks.length > 0 && (
              <>
                <button onClick={onDeleteSelected} disabled={!selectedId} className="px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 disabled:text-slate-400 disabled:hover:bg-transparent dark:text-rose-400 dark:hover:bg-rose-500/10 dark:disabled:text-slate-500 transition rounded">Xóa mark chọn</button>
                <button onClick={onClearMarks} className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition rounded">Xóa marks</button>
              </>
            )}
            {imageUrl && (
              <button onClick={clearImage} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition">Xóa ảnh</button>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = '' }} />
            <button onClick={() => inputRef.current?.click()} className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10 transition">{imageUrl ? 'Đổi ảnh' : 'Mở ảnh'}</button>
          </div>
        </div>

        {!imageUrl ? (
          <div className="flex-1 min-h-0 p-3">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false) }}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`h-full flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg cursor-pointer transition select-none ${isDragging ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 dark:border-white/15 dark:hover:border-white/30 dark:hover:bg-white/5'}`}
            >
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Kéo ảnh vào đây để AI review</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">hoặc bấm để chọn file</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3">Ảnh chỉ nằm trong trình duyệt cho tới khi bạn bấm Review</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 p-1.5">
            <div
              className="relative bg-[#080A0F] overflow-hidden h-full flex items-center justify-center rounded-lg"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false) }}
              onDrop={onDrop}
            >
              <img src={imageUrl} alt="" draggable={false} className="absolute inset-0 w-full h-full object-contain z-0 select-none" />
              <div className="absolute inset-0 z-20" onClick={() => onSelect(null)}>
                {marks.map((mark) => (
                  <MarkOverlay
                    key={mark.id}
                    mark={mark}
                    type={markTypes.find((t) => t.id === mark.type)}
                    isSelected={selectedId === mark.id}
                    pinNumber={null}
                    onSelect={onSelect}
                    selectable
                  />
                ))}
              </div>
              {isDragging && (
                <div className="absolute inset-0 z-50 bg-slate-900/85 flex items-center justify-center text-white text-sm font-medium pointer-events-none">Thả để đổi ảnh</div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Right: phase selector + findings (AIPrecheckPanel prominent) */}
      <aside className="bg-white border border-slate-200 rounded-lg flex flex-col min-h-0 overflow-hidden dark:bg-[#111827] dark:border-white/10">
        <div className="px-4 py-2.5 border-b border-slate-200 shrink-0 dark:border-white/10 bg-violet-50/40 dark:bg-violet-500/5">
          <h3 className="text-sm font-semibold text-violet-700 dark:text-violet-300">AI Review (beta)</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">Gợi ý của AI để soi nhanh — <strong>không thay thế QC của người</strong>. Bạn vẫn quyết cuối.</p>
        </div>

        <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10 shrink-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Phase</div>
          <div className="flex gap-1 overflow-x-auto">
            {phaseOptions.map((p) => {
              const active = selectedPhaseId === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  title={p.name}
                  onClick={() => setSelectedPhaseId(p.id)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition whitespace-nowrap shrink-0 ${active ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'}`}
                >
                  {p.short || p.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <AIPrecheckPanel
            prominent
            imageUrl={imageUrl}
            aiContext={aiContext}
            onAddMark={onAddMark}
            markTypes={markTypes}
            allPhases={phaseOptions}
            onSelectPhase={setSelectedPhaseId}
          />
        </div>
      </aside>
    </div>
  )
}
