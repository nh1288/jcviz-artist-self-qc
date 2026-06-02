# CHANGELOG — QC Checklist (JCVIZ Artist Self-QC)

All notable changes to the QC Checklist workspace tool.

## [0.3.1] — 2026-06-02

### Fixed
- **Bỏ scrollbar con thừa ở AI Review**: khối findings không còn `max-h-72` khi ở mode prominent
  (AI Review) → findings giãn tự nhiên, chỉ cuộn bằng khối ngoài (`aside`) khi thực sự hết màn
  hình, thay vì ép cuộn trong hộp nhỏ dù bên dưới còn trống. Panel nhỏ Self-QC vẫn giữ cap.

## [0.3.0] — 2026-06-02

### Added
- **Review tổng thể cả 5 phase**: nút "★ Review tổng thể cả 5 phase" — encode ảnh 1 lần rồi
  chạy **tuần tự** cả 5 phase (tránh quá tải VRAM box) + bảng **Tổng quan 5 phase** (số điểm
  cần xem mỗi phase, bấm để nhảy phase).
- **Giải pháp nổi bật**: mỗi finding hiện box "💡 Giải pháp" (xanh) tách khỏi observation —
  dùng field `suggestion` sẵn có, làm rõ hướng điều chỉnh cho artist.

### Fixed
- **Đổi tab không mất nhận xét**: lưu kết quả **theo từng phase** (`byPhase`) trong
  `AIPrecheckPanel` thay vì 1 state chung. Đổi phase rồi quay lại → findings cũ còn nguyên;
  phase chưa chạy = trống. (Sửa đúng hành vi mong muốn; thay cho cách clear-toàn-bộ ở v0.2.2.)

## [0.2.2] — 2026-06-02

### Fixed / Changed — UX mode AI Review
- **Phase selector 1 dòng**: dùng nhãn ngắn (`PHASE_SHORT_NAMES`: Storytelling/Camera/Material/
  Render/Post) + `whitespace-nowrap` + scroll ngang → không còn vỡ 2 dòng (full name ở tooltip).
- **Đổi phase → xoá findings cũ**: thêm `useEffect` trong `AIPrecheckPanel` reset
  result/error/meta khi `phaseId` đổi → phase chưa chạy hiển thị **trống** (không còn giữ
  findings của phase trước). Áp dụng cho cả Self-QC pre-check (findings vốn theo từng phase).
- **Ảnh chiếm tối đa**: giảm padding khung ảnh AI Review (`p-3`→`p-1.5`). Giữ `object-contain`
  (full ảnh, không méo/không crop — đúng nhu cầu QC; letterbox 2 bên là do tỉ lệ ảnh).

## [0.2.1] — 2026-06-02

### Changed
- **Default vision model**: `DEFAULT_MODEL` trong `src/aiPrecheck.js` đổi
  `llama3.2-vision:11b` → **`qwen2.5vl:7b`** (model đã smoke-test + chọn: bám JSON schema tốt,
  nhẹ VRAM, phase-aware). Tránh lỗi 400/502 cho người dùng lần đầu khi gateway LAN chạy
  `SC_VISION_MODEL=qwen2.5vl:7b`. Placeholder ô MODEL tự đổi theo (dùng chung biến).
- Đồng bộ `docs/LLM_QC_INTEGRATION.md` sang `qwen2.5vl:7b` + cập nhật checklist trạng thái.

## [0.2.0] — 2026-06-02

### Added — chế độ "AI Review" (tab/mode riêng, additive)
- Thêm **mode toggle** ở header: **Self-QC** (mặc định, y nguyên) ↔ **AI Review (beta)**.
- **AI Review mode** (`AIReviewMode` trong `src/CompositionHelper.jsx`): nạp ảnh riêng →
  chọn 1 trong 5 phase → **findings là view chính** (summary + ready_hint + list theo
  severity). KHÔNG hiển thị checklist tay ở mode này. Giữ **một-chạm tạo mark từ finding**
  (reuse mapping `area`→MARK_TYPES) + fallback offline thân thiện.
- **Tách state 2 mode**: AI Review có **ảnh + marks riêng** (`aiMarks`, ephemeral, KHÔNG
  persist, KHÔNG đụng `STORAGE_KEY`/`state.marks` của Self-QC). Chuyển mode dùng `hidden`
  toggle → **không mất ảnh/state, không remount**.
- Reuse tối đa: `AIPrecheckPanel` thêm prop `prominent` (mở sẵn, ẩn nút thu gọn) để dùng làm
  view findings chính; reuse `MarkOverlay`, `aiPrecheck.js`, MARK_TYPES. Config dùng chung
  `jcviz-self-qc-ai-v1`.
- Nhãn rõ "AI Review (beta) — gợi ý, không thay QC người"; `ready_hint` KHÔNG ghi đè
  `readyForReview` thật của Self-QC.
- Self-QC giữ NGUYÊN: checklist 5 phase / marks tay / lens / readyForReview / STORAGE_KEY /
  `aiPrecheck.js` không đổi.
- ✅ Verify: `npm run build` xanh; regression Self-QC (phase tabs, mark item, ready) OK;
  AI mode e2e thật với gateway `qwen2.5vl:7b` (load ảnh → Review → POST 200 → findings render
  → tạo mark, marks tách khỏi Self-QC) OK; round-trip 2 mode giữ state, không crash; fallback
  offline thân thiện OK.

## [0.1.0] — 2026-06-02

### Added — AI pre-check (vision LLM qua gateway LAN)
- Tính năng **AI pre-check**: gửi ảnh đang soi tới gateway LAN dùng chung (endpoint
  `/qc-analyze`, vision model trên Ollama) để nhận findings có cấu trúc theo phase QC,
  hiển thị theo severity, kèm summary + gợi ý `ready_hint`. **Thuần additive** — không
  đụng checklist / marks / lens hiện có.
- **Một-chạm tạo mark từ finding**: map `area` → `MARK_TYPES` (hero→hero,
  distraction→distraction, còn lại→fix), tạo mark bằng đúng cơ chế hiện có.
- **Consent bắt buộc**: nút "Chạy AI pre-check (gửi ảnh sang box LAN nội bộ)", mặc định
  TẮT, không bao giờ auto-gửi; ghi rõ ảnh rời browser sang box LAN (không cloud, không lưu).
- **Resize ảnh client** (cap cạnh dài ~1568px, JPEG q0.85) trước khi gửi → nhanh, tránh 413.
- **Config riêng** (gateway URL + API key + model) lưu localStorage `jcviz-self-qc-ai-v1`,
  KHÔNG trộn vào `STORAGE_KEY` checklist. Key chỉ dùng LAN nội bộ (có cảnh báo trong UI).
- **Fallback** offline/lỗi: báo thân thiện (chưa cấu hình / không kết nối / 4xx-5xx), QC vẫn
  soi tay bình thường, không crash.
- File mới: `src/aiPrecheck.js` (config + encode + fetch). Panel UI trong
  `src/CompositionHelper.jsx`. Thiết kế + contract: `docs/LLM_QC_INTEGRATION.md`.
- ⚠️ **End-to-end với gateway + vision model thật CHƯA verify** (box chưa
  `ollama pull` vision model). Đã verify: `npm run build` xanh + smoke không-gateway
  (render, lỗi thân thiện khi chưa cấu hình / gateway offline, không crash).

## [Migration 2026-05-30]

- Chuyển workspace từ `D:\00 ANTIGRAVITY\07. QC Checklist` → `D:\JCVIZ-AI\JCVIZ-WEB\qc-checklist`.
- Di chuyển nguyên folder kèm `.git` và toàn bộ docs (`README.md`, `DEPLOYMENT_NOTES.md`,
  `PILOT_GUIDE.md`, `PILOT_FEEDBACK_TEMPLATE.md`).
- Reinstall `node_modules` tại vị trí mới (`npm install` OK, 0 vulnerabilities).
- Thêm doc set chuẩn JCVIZ-AI: `CLAUDE.md` (Tool Card), `CHANGELOG.md`, `VERSION.txt`.
- **Production không đổi:** Vercel auto-deploy từ GitHub `main` (remote
  `nh1288/jcviz-artist-self-qc`) giữ nguyên.
