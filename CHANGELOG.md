# CHANGELOG — QC Checklist (JCVIZ Artist Self-QC)

All notable changes to the QC Checklist workspace tool.

## [Migration 2026-05-30]

- Chuyển workspace từ `D:\00 ANTIGRAVITY\07. QC Checklist` → `D:\JCVIZ-AI\JCVIZ-WEB\qc-checklist`.
- Di chuyển nguyên folder kèm `.git` và toàn bộ docs (`README.md`, `DEPLOYMENT_NOTES.md`,
  `PILOT_GUIDE.md`, `PILOT_FEEDBACK_TEMPLATE.md`).
- Reinstall `node_modules` tại vị trí mới (`npm install` OK, 0 vulnerabilities).
- Thêm doc set chuẩn JCVIZ-AI: `CLAUDE.md` (Tool Card), `CHANGELOG.md`, `VERSION.txt`.
- **Production không đổi:** Vercel auto-deploy từ GitHub `main` (remote
  `nh1288/jcviz-artist-self-qc`) giữ nguyên.
