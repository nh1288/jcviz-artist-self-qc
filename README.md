# JCVIZ Artist Self-QC

Artist Self-QC là app nội bộ giúp artist JCVIZ tự kiểm tra ảnh still image trước khi gửi PM hoặc Creative Director review.

App chạy 100% trong trình duyệt — không có backend, không upload ảnh, dữ liệu QC lưu local trong browser của từng artist.

## Tính năng chính

- **Mở ảnh local trong trình duyệt** — kéo thả hoặc bấm "Mở ảnh"; ảnh không upload lên server.
- **Dark mode mặc định** — tối ưu cho việc soi ảnh; có thể chuyển Light mode.
- **00. Storytelling** — phase định hướng concept (hero, mood, visual hierarchy) trước khi check kỹ thuật.
- **Checklist theo phase** — 5 phase (Storytelling, Camera & Composition, Material & Lighting, Render Quality, Post Production & Final Delivery) với guided card kiểu accordion: title, summary, Cần nhìn, Góc nhìn expert, Lỗi thường gặp, Hướng xử lý, Câu hỏi tự check.
- **Loại hình công trình** — Storytelling thay đổi nội dung theo loại hình (General / Villa / Shophouse / Townhouse / Public Landscape / Park / Street View / Interior).
- **Senior Review Lens** — 7 lens (Story / Composition / Lighting / Material / Depth / Distraction / Premium Mood) hỗ trợ soi ảnh theo từng góc nhìn expert; có chấm điểm 1–5 cho mỗi lens.
- **Visual Marking trên ảnh** — vẽ trực tiếp trên ảnh các vùng: Vùng hero, Vùng hỗ trợ, Gây nhiễu, Cần sửa, Ghi chú (pin có note).
- **Composition guides** — Rule of Thirds, Center Lines, Safe Frame, Diagonals, Golden Ratio, Golden Spiral overlay trên ảnh.
- **Hint guides** — gợi ý visual cho các phase Material / Render / Post (Material Focus, Shadow / Highlight, 100% Zoom, v.v.).
- **Fullscreen review** — mở fullscreen để soi ảnh ở 100% với guides và marks vẫn hiển thị.
- **Ghi chú lỗi** — note text cho từng item checklist và cho từng pin.
- **Filter checklist** — lọc Tất cả / Cần sửa / Chưa kiểm / Đạt.
- **localStorage persistence** — toàn bộ checklist, notes, marks, lens scores, theme và project metadata lưu local; restore sau reload.
- **Ready for Review logic** — nút chỉ active khi tất cả item ở trạng thái Đạt.
- **Hướng dẫn nhanh** — onboarding card lúc chưa có ảnh + nút **Hướng dẫn** ở top bar mở help panel chi tiết.

## Tech stack

- [Vite 6](https://vitejs.dev/) + [React 18](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/) (dark mode dùng class strategy)
- localStorage cho persistence
- Không có backend, Firestore, Firebase Storage hay auth

## Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:5173/

## Build production

```bash
npm run build
```

Output ở thư mục `dist/`.

## Preview build

```bash
npm run preview
```

## Deployment

Khuyến nghị: **Vercel** (auto-detect Vite, không cần config thêm).

- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist`

Có thể deploy lên bất kỳ static host nào (Netlify, GitHub Pages, Cloudflare Pages, internal nginx) — chỉ cần serve thư mục `dist/` sau khi build.

Xem chi tiết trong [DEPLOYMENT_NOTES.md](DEPLOYMENT_NOTES.md).

## Cho artist dùng thử

Xem [PILOT_GUIDE.md](PILOT_GUIDE.md) để biết quy trình QC đề xuất.

Sau khi dùng thử, copy template trong [PILOT_FEEDBACK_TEMPLATE.md](PILOT_FEEDBACK_TEMPLATE.md) để gửi feedback.

## Limitations

- **Ảnh không được lưu sau reload** — ảnh chỉ tồn tại trong session browser dưới dạng object URL; reload là mất.
- **Checklist / notes / marks lưu bằng localStorage trên từng máy** — mỗi browser, mỗi máy có dữ liệu riêng.
- **Không có sync giữa nhiều người dùng** — đây là tool tự QC cá nhân, không phải hệ thống review nhóm.
- **Không có backend** — không có server, không có database, không có account.
- **Không có AI tự phân tích ảnh** — toàn bộ đánh giá do artist tự làm; app chỉ cung cấp checklist, lens guidance và công cụ marking.
- **Reset / Xóa tất cả mark** xóa hoàn toàn dữ liệu local; không có undo.
- **Tối ưu cho desktop** (≥1024px); dưới breakpoint này workspace sẽ stack dọc.

## Cấu trúc dự án

```
src/
├── main.jsx              # entry, áp dụng theme class trước khi React mount
├── index.css             # Tailwind import + body style + custom-variant dark
├── App.jsx               # toàn bộ App component, PHASES data, LENSES, MARK_TYPES, sub-components
└── CompositionHelper.jsx # Image Review Helper: image canvas, guides SVG, marks, drawing
```
