# Deployment Notes

Hướng dẫn deploy JCVIZ Artist Self-QC cho pilot.

## Recommended hosting: Vercel

App là Vite SPA pure-static — Vercel auto-detect, không cần config gì thêm.

Free tier dư sức cho 2–3 artist pilot.

## Steps

1. **Push code lên GitHub**
   - Tạo repo (private hoặc internal team).
   - `git init && git add . && git commit -m "init pilot release"`
   - `git remote add origin <repo-url> && git push -u origin main`

2. **Import repo vào Vercel**
   - Đăng nhập [vercel.com](https://vercel.com).
   - Click **Add New → Project**.
   - Chọn repo vừa push.

3. **Cấu hình build (Vercel sẽ auto-detect, verify lại)**
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Install command**: `npm install` (default)
   - **Node version**: 18 hoặc 20 (default Vercel ổn)

4. **Deploy**
   - Click **Deploy**.
   - Vercel build trong ~1 phút.
   - Xong sẽ có URL dạng `https://<project-name>.vercel.app`.

5. **(Tùy chọn) Custom domain hoặc protect**
   - Project Settings → Domains: gắn custom domain nếu muốn URL gọn.
   - Project Settings → Deployment Protection: bật **Vercel Authentication** nếu muốn chỉ team JCVIZ truy cập.

## Expected result

- 1 URL public hoặc internal-protected.
- Artist mở URL trong Chrome / Edge / Firefox và dùng được luôn.
- Lần đầu mở: dark mode default, Hướng dẫn nhanh hiện trong dropzone.
- Mỗi artist có dữ liệu riêng trong browser của họ.

## Important note

App dùng **localStorage** cho persistence. Điều này nghĩa là:

- **Mỗi artist, mỗi browser, mỗi máy có dữ liệu QC riêng**. Không có cloud sync.
- **Xóa cache trình duyệt sẽ mất hết dữ liệu QC** của browser đó.
- Khuyên artist **bookmark URL** và dùng cùng 1 browser cho mọi session.
- Nếu artist đổi máy, dữ liệu cũ không theo. Đây là design choice cho pilot — không cần backend.

## Alternative hosts (nếu không dùng Vercel)

App là pure static, deploy ở đâu cũng được. Output `dist/` chỉ chứa `index.html` + `assets/`.

| Host | Build command | Output | Note |
|---|---|---|---|
| **Netlify** | `npm run build` | `dist` | Auto-detect Vite, free tier |
| **Cloudflare Pages** | `npm run build` | `dist` | Auto-detect Vite, free tier |
| **GitHub Pages** | `npm run build` | `dist` | Cần config `vite.config.js` `base: '/<repo-name>/'` nếu deploy ở subpath |
| **Internal nginx** | `npm run build` rồi rsync | `dist/*` | Serve `index.html` + assets, fallback to index.html cho SPA routing (tuy nhiên app này không dùng client routing nên không cần fallback) |

## Update deployment

Mỗi lần push lên branch `main` của GitHub repo, Vercel auto-redeploy. Không cần làm gì thêm.

Để rollback: vào Vercel dashboard → Deployments → chọn deploy cũ → **Promote to Production**.

## Pilot checklist trước khi gửi URL cho artist

- [ ] Build green: `npm run build` passes local
- [ ] Vercel deploy success, URL hoạt động
- [ ] Mở URL trên 1 browser sạch (incognito) và verify:
  - [ ] Dark mode default
  - [ ] Hướng dẫn nhanh hiện trong dropzone
  - [ ] Mở 1 ảnh test → checklist sidebar hiện
  - [ ] Drag rectangle mark → vẽ được
  - [ ] Đặt pin Note → pin xuất hiện
  - [ ] Reload trang → marks và checklist persist
  - [ ] Bấm icon **? Hướng dẫn** → modal Help mở
- [ ] Gửi URL cho artist kèm link đến `PILOT_GUIDE.md` và `PILOT_FEEDBACK_TEMPLATE.md`

## Sau pilot

- Thu feedback bằng `PILOT_FEEDBACK_TEMPLATE.md`.
- Quyết định fix / cải thiện / rollout cho team.
- Nếu rollout cho cả studio:
  - Có thể tiếp tục dùng Vercel free tier (đủ cho ≤20 user).
  - Hoặc tự host trên server JCVIZ với nginx.

---

**Câu hỏi liên hệ Hoàng (lead dev)** nếu có vấn đề trong quá trình deploy.
