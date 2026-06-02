# LLM QC Integration — Vision auto pre-check

Thiết kế tích hợp **vision LLM dùng chung** (Ollama trên box 4090, qua gateway Prompt Master)
để QC Checklist tự pre-check ảnh trước khi artist soi tay.

> Trạng thái: **DESIGN + GATEWAY MVP**. Client React (QC) chưa nối — chờ pull vision model
> và smoke-test gateway. Xem mục [Trạng thái & việc còn lại](#trạng-thái--việc-còn-lại).

---

## 1. Vì sao & ràng buộc

QC Checklist là SPA tĩnh, **không có backend riêng** (luật pilot). Thay vì tự dựng server,
QC trở thành **một client nữa** của gateway LAN dùng chung — đúng câu hỏi mở trong
`09. Prompt Master/docs/V2_DESIGN.md` ("tách gateway thành service dùng chung?").

```
[ QC Checklist (browser SPA) ] --HTTP(LAN)--> [ Gateway :8765 ] --localhost--> [ Ollama :11434  vision model ]
        fetch() POST /qc-analyze         API-key + CORS + semaphore + size-guard      qwen2.5vl:7b (mặc định)
```

QC **không** dựng backend; chỉ gọi service có sẵn → vẫn giữ tinh thần "static, no backend".

## 2. Hai thay đổi so với hiện trạng gateway

1. **Vision model**: box hiện chỉ có `qwen3.5:9b` (text). Đã `ollama pull qwen2.5vl:7b`
   (~6 GB — model vision đã chọn sau smoke-test: bám JSON schema tốt, nhẹ VRAM, phase-aware).
   Gateway whitelist thêm model này qua `SC_VISION_MODEL`.
2. **CORS**: gateway cũ chỉ phục vụ client desktop Python (không cần CORS). Browser gọi
   được thì gateway phải bật `CORSMiddleware`. Đã thêm, cấu hình qua `SC_CORS_ORIGINS`.

## 3. Quyết định riêng tư (đổi lời hứa "không upload ảnh")

QC vốn quảng cáo "ảnh chỉ nằm trong trình duyệt". Vision pre-check **gửi ảnh sang box LAN**
(không phải cloud, không lưu — gateway xử lý trong RAM rồi quên). Đây vẫn là thay đổi so với
lời hứa cũ → **UI phải có consent rõ ràng**: nút "Chạy AI pre-check (gửi ảnh sang box LAN nội bộ)"
+ ghi chú; mặc định **tắt**, artist chủ động bấm. Không bao giờ auto-gửi.

## 4. Contract: `POST /qc-analyze`

Header: `Authorization: Bearer <api_key>` (dùng chung key với `/convert`).

**Request body**
```json
{
  "image": "<base64, KHÔNG kèm tiền tố data:...;base64,>",
  "phase": "camera",
  "project_type": "villa",
  "checklist": ["Góc camera khớp hướng đã duyệt", "Bố cục cân bằng"],
  "model": "qwen2.5vl:7b"
}
```
- `image` (bắt buộc): base64 JPEG/PNG. Cap kích thước qua `SC_MAX_IMAGE_BYTES` (mặc định 12 MB
  ảnh gốc).
- `phase` (bắt buộc): `storytelling | camera | material | render | post`.
- `project_type` (tuỳ chọn): cho phase storytelling (`general|villa|shophouse|...`).
- `checklist` (tuỳ chọn): danh sách title item để model soi đúng trọng tâm phase.
- `model` (tuỳ chọn): phải nằm trong whitelist; mặc định = `SC_VISION_MODEL`.

**Response 200** — body schema gọn (chẩn đoán đẩy qua header, theo đúng style `/convert`):
```json
{
  "summary": "Nhận định tổng thể kiểu senior review, 2-4 câu, tiếng Việt.",
  "findings": [
    {
      "title": "Hero bị cây che một phần",
      "severity": "high",
      "area": "hero",
      "observation": "Tán cây foreground trùm lên lối vào chính, giảm lực hút của hero.",
      "suggestion": "Dời/tỉa cây hoặc đổi vantage point để lộ entrance."
    }
  ],
  "ready_hint": false
}
```
- `severity`: `high | medium | low`.
- `area`: `hero | composition | lighting | material | render | post | distraction`.
- `ready_hint`: gợi ý của model xem ảnh "đủ sạch để review" chưa (KHÔNG ghi đè
  `readyForReview` thật của app — chỉ là gợi ý tham khảo).

**Header chẩn đoán**: `X-QC-Model`, `X-QC-Elapsed-Ms`, `X-QC-Findings` (số finding),
`X-QC-Warning` (khi parse lỗi/fallback).

**Mã lỗi**: `401` thiếu token · `403` key sai · `400` thiếu image / phase sai / model ngoài
whitelist · `413` ảnh quá lớn · `502` analyze thất bại · `503` chưa cấu hình key.

## 5. Quy ước phía QC client (sẽ làm sau)

- Lấy ảnh đang soi (object URL) → `Blob` → base64 (bỏ tiền tố `data:`).
- Đính kèm `phase`, `project_type`, và các item title của phase hiện tại.
- Hiện findings dạng danh sách theo `severity`; cho phép **một-chạm tạo mark** trên ảnh từ
  finding (map `area` → MARK_TYPES: hero→hero, distraction→distraction, còn lại→fix).
- **Fallback**: gateway/box offline → báo thân thiện, QC vẫn dùng tay bình thường.
- Cấu hình URL gateway + API key lưu localStorage (key mới, vd `jcviz-self-qc-ai-v1`),
  **không** trộn vào `STORAGE_KEY` checklist.
- Key hiển thị trong client JS → chấp nhận được vì LAN nội bộ sau firewall; ghi rõ trong UI.

## 6. Trạng thái & việc còn lại

- [x] Design + contract (file này).
- [x] Gateway: `config.py` (vision model + CORS + size-guard), `qc_analyze.py`,
      `qc_system_prompt.txt`, `/qc-analyze` + CORS trong `app.py`. *(additive, không đụng
      `/convert`)*
- [x] `ollama pull qwen2.5vl:7b` trên box 4090 (model vision đã chọn — default của client).
- [x] Smoke-test gateway: `/health`, `/qc-analyze` 5 phase với ảnh thật (schema 100%, ~2–4s warm).
- [x] QC client: `src/aiPrecheck.js` + panel findings + consent + tạo-mark-từ-finding (v0.1.0).
- [x] Mode "AI Review" riêng (v0.2.0) + e2e thật + fallback offline.

## 7. Nguồn tham khảo

- `09. Prompt Master/docs/V2_DESIGN.md` (topology box dùng chung + câu hỏi mở service chung).
- `09. Prompt Master/server/` (gateway hiện hữu: `/convert`, auth, semaphore, size-guard).
- Ollama vision (`/api/chat` + `images:[base64]` + `format` structured output).
</content>
