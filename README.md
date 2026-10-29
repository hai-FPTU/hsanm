# Học sinh nhận thức an toàn thông tin

Đề thi mẫu Vòng 1 – Cuộc thi FPTU Cyber Security dành cho học sinh THPT.
Trang web tĩnh (HTML, CSS, JavaScript thuần), không cần máy chủ, không cần cài đặt.

## Cấu trúc
- `index.html` – khung trang
- `style.css` – giao diện
- `app.js` – nội dung đề, cách chấm điểm và logic từng dạng câu hỏi

## Cách làm bài
- Thời gian: 30 phút cho cả bài (sửa ở hằng số `TOTAL_MINUTES` trong `app.js`).
- Đội chuyển qua lại giữa các chặng bất cứ lúc nào bằng thanh số 1–10 hoặc nút "Chặng trước / Chặng sau", và sửa câu trả lời trước khi nộp.
- Trong lúc làm bài không báo đúng sai, không hiện điểm. Ô số màu xanh chỉ cho biết chặng đó đã làm.
- Bấm "Nộp bài" (hoặc hết giờ) để xem điểm từng chặng, đáp án, nhận xét chi tiết.
- Nút "Tải kết quả PDF" tạo file `KetQua_<tên-đội>.pdf`. Công cụ tạo PDF (html2pdf.js) được tải từ cdnjs khi bấm nút;
  nếu máy không có mạng, trang tự mở hộp thoại In để chọn "Lưu thành PDF".

## 10 chặng = 10 dạng câu hỏi (mỗi chặng 10 điểm, tổng 100)
| Chặng | Chủ đề | Dạng câu hỏi |
|---|---|---|
| 1. Cuộc gọi lúc nửa đêm | Bắt cóc online, giả danh công an | Tìm điểm bất thường trong hình |
| 2. Dấu vân tay của kẻ gian | Tổng hợp thủ đoạn | Nối cặp (vẽ dây nối) |
| 3. Video call từ "mẹ" | Deepfake | Chọn đường đi (truyện tương tác) |
| 4. 500 nghìn cho một lần quét mặt | Tài khoản ngân hàng, OTP | Thật hay giả |
| 5. Lối thoát khỏi tin nhắn trúng thưởng | Lừa trúng thưởng, link lạ | Mê cung tìm đường |
| 6. Ai là kẻ gian? | Giả danh nhà trường | Thám tử phá án (chọn nghi phạm, ghim manh mối) |
| 7. Học bổng trong mơ | Website, đường link giả | Giải mã manh mối (tìm tên miền thật) |
| 8. Ổ khóa cho tài khoản | Mật khẩu, thói quen an toàn | Phân loại kéo thả |
| 9. Việc nhẹ, lời to | Việc nhẹ lương cao | Sắp xếp diễn biến |
| 10. Ô chữ an toàn số | Tổng kết | Ô chữ có từ khóa hàng dọc |

## Đưa lên GitHub Pages
1. Tạo repository mới trên GitHub (ví dụ `hoc-sinh-attt`), chọn Public.
2. Bấm **Add file → Upload files**, kéo thả các file này vào, bấm **Commit changes**.
3. Vào **Settings → Pages**, mục *Branch* chọn `main` và thư mục `/ (root)`, bấm **Save**.
4. Sau 1–2 phút, trang chạy tại `https://<tên-tài-khoản>.github.io/hoc-sinh-attt/`.

## Sửa nội dung đề
Toàn bộ câu hỏi nằm trong `app.js`, mỗi dạng một khối dữ liệu riêng:
`CH1_HOTSPOTS`, `MATCH_PAIRS`, `CH2_SCENES`, `CH3_ROUNDS`, `MAZE`, `DETECTIVE`,
`CH4_ROUNDS`, `SORT_ITEMS`, `CH5_STEPS`, `CROSS`.
Tên chặng, thời gian và thứ tự chặng nằm trong mảng `CHAPTERS`.

## Lưu ý trước khi dùng thi thật
Đây là bản mẫu để minh họa dạng đề. Đáp án nằm trong mã nguồn phía trình duyệt nên học sinh có thể xem được.
Khi thi chính thức cần: chấm điểm trên máy chủ, tài khoản đăng nhập theo đội, nhiều phiên bản đề xáo trộn,
ghi log và lưu kết quả về cơ sở dữ liệu của Ban tổ chức.

Mọi nhân vật, số điện thoại, tài khoản, tên miền trong đề đều là hư cấu.
