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
- **Version:** 0.0.1

### Stack
- **Vite 6** + **React 18** + **Tailwind CSS 4** (dark mode = class strategy).
- **100% client-side** — KHÔNG backend, KHÔNG Firebase/Firestore/Storage, KHÔNG auth, KHÔNG
  upload ảnh. Ảnh chỉ là object URL trong session (mất khi reload).
- Entry: `index.html` → `src/main.jsx` → `src/App.jsx` (toàn bộ app + data PHASES/LENSES/
  MARK_TYPES). Image helper: `src/CompositionHelper.jsx`.

### Scope-lock
- Work **only** inside `JCVIZ-WEB\qc-checklist`. Đọc phần còn lại của `D:\JCVIZ-AI` để lấy
  context được, nhưng không sửa tool khác / file root trừ khi được yêu cầu rõ.

### Data (localStorage)
- Persistence bằng **localStorage** (mỗi browser/máy có dữ liệu riêng, không cloud sync):
  - `jcviz-self-qc-v3` — checklist, notes, marks, lens scores, project metadata (`STORAGE_KEY`).
  - `jcviz-self-qc-theme-v1` — theme (`THEME_KEY`).
  - `jcviz-self-qc-guides-v1` — composition guide prefs (`GUIDE_PREFS_KEY`).
- Đổi code không xoá dữ liệu đã lưu — nhưng **cẩn thận khi đổi schema state**; nếu đổi shape,
  bump key version (`-v3` → `-v4`) hoặc migrate, đừng làm hỏng dữ liệu QC của artist.

### Deploy
- **Vercel auto-deploy từ GitHub `main`** (remote `nh1288/jcviz-artist-self-qc`). Pure-static
  Vite SPA — framework preset Vite, build `npm run build`, output `dist/`. Production URL dạng
  `<project>.vercel.app` (xem chính xác ở Vercel dashboard; custom domain là tuỳ chọn).

### Working rule
- Fix bug cụ thể → test (`npm run build` xanh) → commit. KHÔNG tự refactor / đổi visual
  direction. Đây là tool pilot — giữ đơn giản, không thêm backend/dependency thừa.
