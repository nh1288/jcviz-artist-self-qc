# CLAUDE.md

Guidance for Claude Code when working in this repository.
See `README.md` for full feature list and `DEPLOYMENT_NOTES.md` for deploy details.

---

## JCVIZ-AI Tool Card

- **Tool:** QC Checklist (JCVIZ Artist Self-QC) — package name `jcviz-artist-self-qc`
- **Class:** JCVIZ-WEB
- **Path:** `D:\JCVIZ-AI\JCVIZ-WEB\qc-checklist`
- **Purpose:** App nội bộ giúp artist JCVIZ tự QC still image (checklist theo phase, Senior
  Review Lens, visual marking + composition guides) trước khi gửi PM / Creative Director.
- **Version:** 0.2.1

### Stack
- **Vite 6** + **React 18** + **Tailwind CSS 4** (dark mode = class strategy).
- **100% client-side** — KHÔNG backend riêng, KHÔNG Firebase/Firestore/Storage, KHÔNG auth.
  Ảnh chỉ là object URL trong session (mất khi reload).
- **Ngoại lệ duy nhất — AI pre-check (v0.1.0, consent-gated):** khi artist CHỦ ĐỘNG bấm, ảnh
  được gửi tới gateway **LAN nội bộ** (Smart Convert gateway, endpoint `/qc-analyze`, vision
  model trên Ollama) — KHÔNG cloud, KHÔNG lưu. Mặc định TẮT, không bao giờ auto-gửi. QC vẫn
  là client; KHÔNG tự dựng backend.
- Entry: `index.html` → `src/main.jsx` → `src/App.jsx` (toàn bộ app + data PHASES/LENSES/
  MARK_TYPES). Image helper: `src/CompositionHelper.jsx`. AI pre-check: `src/aiPrecheck.js`
  (logic) + panel trong `src/CompositionHelper.jsx`. Contract: `docs/LLM_QC_INTEGRATION.md`.
- **Mode (v0.2.0):** `appMode` ở `App.jsx` toggle Self-QC ↔ AI Review (`hidden` toggle, không
  remount). AI Review = component `AIReviewMode` (export từ `CompositionHelper.jsx`), reuse
  `AIPrecheckPanel` (prop `prominent`) + `MarkOverlay`. State AI Review RIÊNG: `aiMarks`
  (ephemeral, KHÔNG persist, KHÔNG trộn `STORAGE_KEY`/`state.marks`).

### Scope-lock
- Work **only** inside `JCVIZ-WEB\qc-checklist`. Đọc phần còn lại của `D:\JCVIZ-AI` để lấy
  context được, nhưng không sửa tool khác / file root trừ khi được yêu cầu rõ.

### Data (localStorage)
- Persistence bằng **localStorage** (mỗi browser/máy có dữ liệu riêng, không cloud sync):
  - `jcviz-self-qc-v3` — checklist, notes, marks, lens scores, project metadata (`STORAGE_KEY`).
  - `jcviz-self-qc-theme-v1` — theme (`THEME_KEY`).
  - `jcviz-self-qc-guides-v1` — composition guide prefs (`GUIDE_PREFS_KEY`).
  - `jcviz-self-qc-ai-v1` — AI pre-check config: gateway URL + API key + model (`AI_CONFIG_KEY`,
    trong `src/aiPrecheck.js`). KHÔNG trộn vào `STORAGE_KEY` checklist.
- Đổi code không xoá dữ liệu đã lưu — nhưng **cẩn thận khi đổi schema state**; nếu đổi shape,
  bump key version (`-v3` → `-v4`) hoặc migrate, đừng làm hỏng dữ liệu QC của artist.

### Deploy
- **Vercel auto-deploy từ GitHub `main`** (remote `nh1288/jcviz-artist-self-qc`). Pure-static
  Vite SPA — framework preset Vite, build `npm run build`, output `dist/`. Production URL dạng
  `<project>.vercel.app` (xem chính xác ở Vercel dashboard; custom domain là tuỳ chọn).

### Working rule
- Fix bug cụ thể → test (`npm run build` xanh) → commit. KHÔNG tự refactor / đổi visual
  direction. Đây là tool pilot — giữ đơn giản, không thêm backend/dependency thừa.
