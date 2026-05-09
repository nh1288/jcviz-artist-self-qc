import { useState, useEffect, useRef } from 'react'

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

export default function ImageReviewHelper({ phase, lens, marking }) {
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
            Mở ảnh local để inspect. Ảnh chỉ được mở trong trình duyệt và không được upload.
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

      {/* Lens toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-200 dark:border-white/10 shrink-0 flex-wrap">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">Lens</span>
        {lens.items.map((l) => {
          const active = lens.active === l.id
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => lens.set(active ? null : l.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition ${
                active
                  ? 'bg-cyan-600 text-white dark:bg-cyan-500'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
              }`}
              title={l.purpose}
            >
              {l.label}
            </button>
          )
        })}
        {lens.active && (
          <button
            type="button"
            onClick={() => lens.set(null)}
            className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition px-1.5"
          >
            Bỏ chọn
          </button>
        )}
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
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3">JPG, PNG, WebP — file giữ ở local</p>

            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-6 max-w-md text-left text-[11px] leading-relaxed bg-slate-50 border border-slate-200 rounded-md px-3.5 py-2.5 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-slate-300"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Hướng dẫn nhanh
              </div>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Mở ảnh local</li>
                <li>Chọn phase</li>
                <li>Dùng checklist và lens để tự QC</li>
                <li>Mark vùng cần chú ý</li>
                <li>Đánh dấu Đạt / Cần sửa</li>
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
