// AI pre-check helper — gọi vision LLM qua gateway LAN (Smart Convert gateway, endpoint
// /qc-analyze). Thuần logic: config localStorage + resize/encode ảnh + fetch + map kết quả.
// KHÔNG phụ thuộc React. Contract: docs/LLM_QC_INTEGRATION.md.

// Config AI lưu RIÊNG, không trộn vào STORAGE_KEY checklist.
export const AI_CONFIG_KEY = 'jcviz-self-qc-ai-v1'
export const DEFAULT_MODEL = 'qwen2.5vl:7b'

// Cap cạnh dài ảnh trước khi gửi — vision model nào cũng downscale; tránh 413 + nhanh hơn.
export const MAX_EDGE = 1568
export const JPEG_QUALITY = 0.85

export const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 }

export const loadAiConfig = () => {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      return {
        gatewayUrl: typeof p.gatewayUrl === 'string' ? p.gatewayUrl : '',
        apiKey: typeof p.apiKey === 'string' ? p.apiKey : '',
        model: typeof p.model === 'string' && p.model ? p.model : DEFAULT_MODEL,
      }
    }
  } catch { /* ignore */ }
  return { gatewayUrl: '', apiKey: '', model: DEFAULT_MODEL }
}

export const saveAiConfig = (cfg) => {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify({
      gatewayUrl: (cfg.gatewayUrl || '').trim(),
      apiKey: (cfg.apiKey || '').trim(),
      model: (cfg.model || '').trim() || DEFAULT_MODEL,
    }))
  } catch { /* ignore */ }
}

// area (model trả) -> id trong MARK_TYPES. hero->hero, distraction->distraction, còn lại->fix.
export const mapAreaToMarkType = (area) => {
  if (area === 'hero') return 'hero'
  if (area === 'distraction') return 'distraction'
  return 'fix'
}

// Resize ảnh (object URL) bằng canvas -> base64 JPEG KHÔNG kèm tiền tố data:.
export const encodeImageForAi = (imageUrl, maxEdge = MAX_EDGE, quality = JPEG_QUALITY) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      if (!w || !h) { reject(new Error('Ảnh không hợp lệ')); return }
      const scale = Math.min(1, maxEdge / Math.max(w, h))
      const cw = Math.max(1, Math.round(w * scale))
      const ch = Math.max(1, Math.round(h * scale))
      const canvas = document.createElement('canvas')
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Không tạo được canvas')); return }
      ctx.drawImage(img, 0, 0, cw, ch)
      let dataUrl
      try {
        dataUrl = canvas.toDataURL('image/jpeg', quality)
      } catch (e) {
        reject(new Error('Không mã hoá được ảnh')); return
      }
      const base64 = (dataUrl.split(',')[1]) || ''
      if (!base64) { reject(new Error('Mã hoá ảnh rỗng')); return }
      resolve(base64)
    }
    img.onerror = () => reject(new Error('Không đọc được ảnh để phân tích'))
    img.src = imageUrl
  })

const friendlyError = (status, detail) => {
  switch (status) {
    case 400: return detail || 'Yêu cầu không hợp lệ (thiếu ảnh hoặc phase sai).'
    case 401: return 'Thiếu API key — nhập key trong cấu hình AI.'
    case 403: return 'API key sai — kiểm tra lại key.'
    case 413: return 'Ảnh quá lớn so với giới hạn gateway.'
    case 502: return 'Model phân tích thất bại (gateway trả 502). Thử lại hoặc đổi model.'
    case 503: return 'Gateway chưa cấu hình API key.'
    default: return detail || `Gateway trả lỗi ${status}.`
  }
}

// Gọi /qc-analyze. Trả { ok, data?, meta?, error? } — không bao giờ throw cho UI.
export const runPrecheck = async ({ gatewayUrl, apiKey, model, base64, phase, projectType, checklist }) => {
  const base = (gatewayUrl || '').trim().replace(/\/+$/, '')
  if (!base) return { ok: false, error: 'Chưa cấu hình URL gateway.' }
  if (!apiKey) return { ok: false, error: 'Chưa cấu hình API key.' }

  const body = {
    image: base64,
    phase,
    model: model || DEFAULT_MODEL,
  }
  if (projectType) body.project_type = projectType
  if (Array.isArray(checklist) && checklist.length) {
    body.checklist = checklist.filter((s) => typeof s === 'string' && s.trim())
  }

  let res
  try {
    res = await fetch(`${base}/qc-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    })
  } catch {
    return {
      ok: false,
      error: 'Không kết nối được gateway (box LAN tắt, sai URL, hoặc bị chặn mixed-content khi mở qua HTTPS).',
    }
  }

  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json())?.detail || '' } catch { /* ignore */ }
    return { ok: false, error: friendlyError(res.status, detail) }
  }

  let data
  try {
    data = await res.json()
  } catch {
    return { ok: false, error: 'Gateway trả dữ liệu không đọc được.' }
  }

  const findings = Array.isArray(data?.findings) ? data.findings : []
  return {
    ok: true,
    data: {
      summary: typeof data?.summary === 'string' ? data.summary : '',
      findings,
      ready_hint: Boolean(data?.ready_hint),
    },
    meta: {
      model: res.headers.get('X-QC-Model') || model || '',
      elapsedMs: res.headers.get('X-QC-Elapsed-Ms') || '',
    },
  }
}
