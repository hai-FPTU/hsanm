/* =========================================================
   Học sinh nhận thức an toàn thông tin – đề thi mẫu Vòng 1
   Cuộc thi FPTU Cyber Security – Học sinh THPT
   10 chặng = 10 dạng thử thách, mỗi chặng 10 điểm.
   Đội chuyển chặng tự do; điểm chỉ công bố sau khi nộp bài; xuất kết quả PDF.
   Mọi nhân vật, số điện thoại, tài khoản, tên miền đều hư cấu.
   ========================================================= */
(() => {
  "use strict";

  /* ---------------- Tiện ích ---------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (sec) => { sec = Math.max(0, Math.round(sec)); return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------------- Âm thanh (Web Audio, không cần file) ---------------- */
  let audioCtx = null;
  let soundOn = true;
  function tone(freq, dur = 0.12, type = "sine", vol = 0.08, delay = 0) {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = audioCtx.currentTime + delay;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(audioCtx.destination);
      o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) { /* trình duyệt chặn âm thanh: bỏ qua */ }
  }
  const sfx = {
    good: () => { tone(660, .1, "triangle"); tone(990, .16, "triangle", .08, .09); },
    bad: () => { tone(200, .22, "sawtooth", .05); },
    stamp: () => { tone(90, .18, "square", .09); tone(60, .25, "sine", .1, .03); },
    tick: () => tone(1200, .04, "square", .03),
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .18, "triangle", .08, i * .12)),
  };

  /* ---------------- Thông báo nổi ---------------- */
  let toastTimer;
  function toast(msg, kind = "") {
    const el = $("#toast");
    el.textContent = msg;
    el.className = `toast is-show ${kind ? "is-" + kind : ""}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.className = "toast"), 2200);
  }

  /* =========================================================
     NỘI DUNG ĐỀ THI
     ========================================================= */

  /* ---------- Chương 1: Tìm điểm bất thường ---------- */
  const CH1_HOTSPOTS = {
    zalo: "Cơ quan công an không gửi giấy triệu tập qua Zalo, Messenger hay tài khoản cá nhân. Giấy mời, giấy triệu tập được gửi trực tiếp hoặc qua chính quyền địa phương, nhà trường.",
    unit: "Không có đơn vị nào tên \"Cục Truy nã Quốc tế và Phòng chống Rửa tiền\". Kẻ gian thường bịa tên cơ quan nghe thật kêu để gây sợ hãi.",
    secret: "Yêu cầu giữ bí mật, không cho gia đình, thầy cô biết là dấu hiệu chắc chắn của lừa đảo. Cơ quan chức năng không bao giờ ép người chưa thành niên giấu bố mẹ.",
    money: "Không có cái gọi là \"tài khoản tạm giữ\" đứng tên cá nhân. Công an không bao giờ yêu cầu chuyển tiền để \"chứng minh trong sạch\".",
    hotel: "Ép tự thuê phòng khách sạn, giữ video call 24/24 là thủ đoạn \"bắt cóc online\": cô lập nạn nhân rồi dàn cảnh đòi tiền chuộc gia đình.",
    threat: "Đe dọa \"bắt ngay trong đêm\", đặt hạn 2 giờ là cách tạo áp lực để nạn nhân không kịp suy nghĩ, không kịp hỏi ai.",
  };
  const CH1_LABELS = {
    zalo: "Gửi qua Zalo cá nhân", unit: "Tên cơ quan bịa đặt", secret: "Buộc giữ bí mật với gia đình",
    money: "Chuyển tiền vào tài khoản cá nhân", hotel: "Ép tự cô lập ở khách sạn", threat: "Đe dọa, đặt hạn gấp",
  };

  /* ---------- Chương 2: Chọn đường đi ---------- */
  const CH2_SCENES = [
    {
      clock: "21:40 – tối thứ Sáu",
      call: { name: "Mẹ (Facebook)", quote: "\"Con ơi mẹ đang ở bệnh viện, điện thoại mẹ hết pin. Con chuyển gấp 15 triệu vào số tài khoản mẹ nhắn nhé. Đừng gọi lại, mẹ đang bận làm thủ tục!\"" },
      text: "Cuộc gọi video kéo dài 8 giây. Hình ảnh hơi mờ, khuôn mặt thỉnh thoảng giật, rồi \"mẹ\" tắt máy và gửi ngay một số tài khoản mang tên người lạ.",
      choices: [
        { t: "Chuyển ngay 15 triệu vì rõ ràng là mặt và giọng của mẹ.", pts: 0, bad: true,
          o: "Kẻ gian đã dùng deepfake ghép mặt và giọng mẹ từ video đăng trên Facebook. 15 triệu biến mất chỉ sau vài phút." },
        { t: "Tắt máy, gọi lại cho mẹ bằng số điện thoại đã lưu trong danh bạ.", pts: 7,
          o: "Chuẩn thám tử! Luôn xác minh bằng một kênh khác mà mình chắc chắn, như số điện thoại đã lưu từ trước." },
        { t: "Nhắn lại hỏi một câu chỉ mẹ biết: \"Mẹ ơi, con mèo nhà mình tên gì?\"", pts: 4,
          o: "Khá tốt: câu hỏi bí mật giúp vạch mặt kẻ giả mạo. Nhưng kẻ gian có thể né hoặc lục được thông tin trên mạng. Gọi lại số đã lưu vẫn chắc chắn hơn." },
      ],
    },
    {
      clock: "21:46",
      text: "Em gọi số của mẹ nhưng mẹ không nghe máy. Ngay lúc đó, tài khoản \"Mẹ\" nhắn liên tục: \"Sao con chưa chuyển? Mẹ đang cấp cứu, bác sĩ cần tiền ngay!!!\"",
      choices: [
        { t: "Chuyển trước một nửa cho chắc, phòng khi chuyện là thật.", pts: 0, bad: true,
          o: "Chuyển \"một nửa\" vẫn là mất tiền. Kẻ gian sẽ tiếp tục đòi phần còn lại với lý do mới." },
        { t: "Bình tĩnh, gọi cho bố, người thân khác hoặc cô chủ nhiệm để xác minh mẹ đang ở đâu.", pts: 7,
          o: "Đúng rồi! Không liên lạc được người bị giả danh thì hỏi qua người thân thứ ba. Kẻ gian sợ nhất là nạn nhân kịp hỏi người khác." },
        { t: "Chặn luôn tài khoản \"Mẹ\" rồi đi ngủ.", pts: 3,
          o: "Em đã không mất tiền, nhưng mẹ và người thân khác vẫn có thể bị lừa từ tài khoản đó. Cần làm thêm một bước nữa." },
      ],
    },
    {
      clock: "22:05",
      text: "Bố xác nhận mẹ đang họp phụ huynh ở trường em gái, hoàn toàn an toàn. Thì ra tài khoản Facebook của mẹ đã bị chiếm. Việc tiếp theo cần làm là gì?",
      choices: [
        { t: "Thôi, mình không mất tiền là được rồi.", pts: 0, bad: true,
          o: "Kẻ gian vẫn đang dùng tài khoản của mẹ để nhắn vay tiền họ hàng, bạn bè của mẹ." },
        { t: "Gọi lại số kẻ gian để mắng cho hả giận.", pts: 0, bad: true,
          o: "Không nên tiếp xúc với kẻ gian: có thể bị thao túng tiếp hoặc lộ thêm thông tin." },
        { t: "Giúp mẹ lấy lại tài khoản, báo người thân bạn bè cảnh giác, báo cáo tài khoản giả và trình báo công an kèm số tài khoản kẻ gian.", pts: 6,
          o: "Xuất sắc! Em vừa ngăn được những nạn nhân tiếp theo. Số tài khoản kẻ gian là bằng chứng quan trọng cho công an." },
      ],
    },
  ];

  /* ---------- Chương 3: Thật hay giả ---------- */
  const CH3_ROUNDS = [
    {
      q: "Hai tin nhắn \"từ ngân hàng\". Đâu là tin LỪA ĐẢO?",
      cards: [
        { app: "Tin nhắn", from: "SAOMAIBANK", body: "SaoMai Bank: TK x123 -150,000VND luc 14:02 12/03. SD: 2,350,000VND. ND: thanh toan hoc phi." },
        { app: "Tin nhắn", from: "+84 899 214 xxx", body: "SaoMai Bank thong bao: TK cua quy khach bi KHOA do nghi van rua tien. Xac minh ngay tai saomaibank-xacminh.top trong 30 phut de tranh bi phong toa." },
      ],
      fake: 1,
      explain: "Tin giả gửi từ số điện thoại cá nhân, có đường link lạ, dọa khóa tài khoản và đặt hạn 30 phút. Ngân hàng thật không gửi link yêu cầu đăng nhập qua tin nhắn.",
    },
    {
      q: "Hai bài tuyển người trên mạng xã hội. Đâu là CÁI BẪY?",
      cards: [
        { app: "Bảng tin trường", from: "CLB Tin học THPT", body: "CLB Tin học tuyển thành viên khóa mới.\nPhỏng vấn tại phòng 204 sau giờ học thứ Tư.\nKhông thu bất kỳ khoản phí nào." },
        { app: "Nhóm Facebook", from: "Việc Làm Online 24h", body: "Tuyển CTV từ 16 tuổi 🔥\nChỉ cần CCCD + quét mặt mở tài khoản ngân hàng hộ.\nNhận ngay 500K/lần, không cần đi làm!" },
      ],
      fake: 1,
      explain: "Mở hộ, bán, cho thuê tài khoản ngân hàng là vi phạm pháp luật. Tài khoản và khuôn mặt của em có thể bị dùng để nhận tiền lừa đảo, và chính em sẽ bị điều tra.",
    },
    {
      q: "Hai tin nhắn liên quan mã OTP. Đâu là tin LỪA ĐẢO?",
      cards: [
        { app: "Zalo", from: "CSKH SaoMai Bank ✔", body: "Chào bạn, hệ thống vừa hoàn tiền nhầm 2.000.000đ. Bạn vui lòng đọc mã OTP vừa nhận để chúng tôi xử lý hoàn tiền nhé." },
        { app: "Tin nhắn", from: "SAOMAIBANK", body: "Ma OTP cua quy khach la 482913. TUYET DOI KHONG cung cap ma nay cho bat ky ai, ke ca nhan vien ngan hang." },
      ],
      fake: 0,
      explain: "Không ai được phép hỏi mã OTP của em, kể cả \"nhân viên ngân hàng\". Dấu tích xanh trên Zalo hay Facebook cũng có thể bị làm giả.",
    },
    {
      q: "Hai tin nhắn từ bạn cùng lớp. Đâu là tin ĐÁNG NGỜ?",
      cards: [
        { app: "Messenger", from: "Tuấn Anh (lớp 11A2)", body: "Ê mai mang giúp tao quyển sách Lý nha, tao để quên trong hộc bàn mày." },
        { app: "Messenger", from: "Tuấn Anh (lớp 11A2)", body: "Ê cho tao mượn tạm CCCD với tài khoản ngân hàng mấy hôm, có người nhờ nhận tiền giùm, xong tao chia mày 1 triệu. Đừng nói ai nha." },
      ],
      fake: 1,
      explain: "Tài khoản của bạn có thể đã bị chiếm, hoặc bạn đang bị lôi kéo. Lời đề nghị \"nhận tiền giùm\" kèm \"đừng nói ai\" là dấu hiệu của đường dây rửa tiền lừa đảo.",
    },
  ];

  /* ---------- Chương 4: Giải mã manh mối ---------- */
  const CH4_ROUNDS = [
    {
      context: "Email báo em trúng học bổng 100% kèm đường link đăng ký:",
      chunks: [["https://", 0], ["hocbong.", 1], ["fpt.", 1], ["edu.", 1], ["vn.", 1], ["xet-tuyen.top", 1], ["/dang-ky", 0]],
      answer: 5, safe: false,
      explain: "Tên miền thật nằm ngay trước dấu \"/\" đầu tiên: xet-tuyen.top. Phần \"hocbong.fpt.edu.vn\" phía trước chỉ là tên miền con do kẻ gian tự đặt để đánh lừa.",
    },
    {
      context: "Đường link đăng nhập trên ứng dụng ngân hàng của bố:",
      chunks: [["https://", 0], ["login.", 1], ["saomaibank.vn", 1], ["/tai-khoan", 0]],
      answer: 2, safe: true,
      explain: "Tên miền thật là saomaibank.vn, đúng tên miền của ngân hàng. Phần \"login.\" là tên miền con hợp lệ. Đường link này an toàn.",
    },
    {
      context: "Tin nhắn yêu cầu xác thực tài khoản ngân hàng:",
      chunks: [["https://", 0], ["saomaibank.", 1], ["vn-baomat.com", 1], ["/xac-thuc?id=8812", 0]],
      answer: 2, safe: false,
      explain: "Tên miền thật là vn-baomat.com, không phải saomaibank.vn. Kẻ gian dùng dấu chấm và dấu gạch ngang để ghép chữ \"saomaibank.vn\" vào cho giống thật.",
    },
    {
      context: "Bài đăng \"Chương trình học bổng du học 2027\" trên một nhóm Facebook:",
      chunks: [["http://", 0], ["fptu.", 1], ["edu-vn.", 1], ["scholarship-2027.online", 1], ["/apply", 0]],
      answer: 3, safe: false,
      explain: "Tên miền thật là scholarship-2027.online. \"edu-vn\" có gạch ngang chứ không phải \"edu.vn\". Đường link còn dùng http không có chữ s, dữ liệu gửi đi không được mã hóa.",
    },
  ];

  /* ---------- Chương 5: Sắp xếp diễn biến ---------- */
  const CH5_STEPS = [
    "Thấy quảng cáo \"làm nhiệm vụ thả tim video, 50K mỗi nhiệm vụ, làm tại nhà\".",
    "Được thêm vào nhóm Telegram, làm vài nhiệm vụ đầu và nhận thưởng 50K thật.",
    "Được mời làm \"nhiệm vụ VIP\": nạp 500K, hoàn thành sẽ nhận về 700K.",
    "Nạp tiền lần đầu, nhận lại tiền lãi nhỏ nên càng tin tưởng.",
    "Bị báo \"thao tác sai\", phải nạp thêm 5 triệu mới rút được toàn bộ tiền.",
    "Nhóm chat biến mất, tài khoản bị chặn, không liên lạc được ai.",
  ];
  const CH5_SHUFFLE = [3, 0, 5, 2, 4, 1]; // thứ tự hiển thị ban đầu (chỉ số trong CH5_STEPS)

  /* =========================================================
     NỘI DUNG CÁC DẠNG MỚI
     ========================================================= */

  /* ---------- Nối cặp ---------- */
  const MATCH_PAIRS = [
    ["Bắt cóc online", "Ép giữ bí mật với gia đình, tự thuê phòng khách sạn"],
    ["Deepfake người thân", "Khuôn mặt giật, cuộc gọi rất ngắn, dặn đừng gọi lại"],
    ["Lừa làm nhiệm vụ online", "Cho lãi nhỏ trước, rồi bắt nạp thêm mới cho rút tiền"],
    ["Thu mua tài khoản ngân hàng", "Trả tiền để mượn CCCD và quét khuôn mặt"],
    ["Website ngân hàng giả", "Tên miền lạ, yêu cầu nhập mã OTP"],
    ["Lừa bán vật phẩm game", "Giá rẻ bất thường, đòi chuyển khoản trước khi giao"],
  ];
  const MATCH_RIGHT_ORDER = [3, 5, 0, 4, 2, 1];

  /* ---------- Mê cung tìm đường ---------- */
  // s = ô an toàn (đường đúng), t = bẫy; start/goal đánh dấu riêng
  const MAZE = {
    cols: 5,
    start: [0, 0], goal: [3, 4],
    cells: [
      [{ s: 1, t: "📩 Tin nhắn: \"Chúc mừng bạn trúng iPhone 17! Bấm link nhận quà\"" },
       { t: "Bấm link xem thử cho biết", why: "Link lạ có thể dẫn tới trang giả hoặc tự tải mã độc về máy." },
       { t: "Nhập số điện thoại và mã OTP để nhận quà", why: "Mã OTP là chìa khóa tài khoản. Đưa OTP là mất tài khoản." },
       { t: "Chuyển 200K \"phí vận chuyển\"", why: "Trúng thưởng thật không bắt người nhận nộp tiền trước." },
       { t: "Chia sẻ link cho cả lớp cùng nhận", why: "Em vô tình giúp kẻ gian lừa thêm nhiều bạn khác." }],
      [{ s: 1, t: "Không bấm link, kiểm tra kỹ người gửi" },
       { s: 1, t: "Tra tên chương trình trên trang chính thức của hãng" },
       { t: "Nhắn lại hỏi người gửi: \"Có thật không ạ?\"", why: "Kẻ gian sẽ luôn khẳng định là thật và dụ tiếp." },
       { t: "Cài ứng dụng \"nhận quà\" theo hướng dẫn", why: "Ứng dụng lạ có thể chiếm quyền điều khiển điện thoại." },
       { t: "Gửi ảnh CCCD để \"xác minh trúng thưởng\"", why: "Ảnh CCCD có thể bị dùng để mở tài khoản, vay tiền mạo danh em." }],
      [{ t: "Tin luôn vì tin nhắn có logo hãng", why: "Logo, tên hãng rất dễ sao chép. Không phải bằng chứng." },
       { s: 1, t: "Phát hiện hãng không có chương trình nào như vậy" },
       { s: 1, t: "Chụp màn hình tin nhắn làm bằng chứng" },
       { s: 1, t: "Báo cho bố mẹ, thầy cô" },
       { t: "Đăng lên mạng xã hội khoe trúng thưởng", why: "Kẻ gian khác sẽ nhắm tới em vì biết em tin những tin như vậy." }],
      [{ t: "Im lặng, không nói với ai", why: "Giữ im lặng khiến những người khác vẫn có thể bị lừa." },
       { t: "Gọi lại số lạ để hỏi cho ra lẽ", why: "Gọi lại số lạ có thể bị tính cước cao hoặc bị thao túng tiếp." },
       { t: "Đưa điện thoại cho \"nhân viên hỗ trợ\" điều khiển từ xa", why: "Cho người lạ điều khiển từ xa là trao toàn bộ dữ liệu, tài khoản cho họ." },
       { s: 1, t: "Chặn và báo cáo số điện thoại lừa đảo" },
       { s: 1, t: "🛡️ AN TOÀN" }],
    ],
  };
  const MAZE_PATH_LEN = 8;

  /* ---------- Thám tử phá án ---------- */
  const DETECTIVE = {
    suspects: [
      { id: "A", name: "Thầy Minh", role: "Giáo viên chủ nhiệm", msg: "Nhắn trong nhóm lớp có cả phụ huynh: \"Các em nộp học phí tại phòng Kế toán của trường trước thứ Sáu.\"" },
      { id: "B", name: "Cô Lan", role: "\"Phòng Đào tạo\"", msg: "Nhắn riêng cho Hà: \"Em được chọn nhận học bổng 100%. Chuyển 2 triệu phí giữ suất trong 1 giờ, không cần báo phụ huynh.\"" },
      { id: "C", name: "Tuấn", role: "Lớp trưởng", msg: "Nhắn trong nhóm lớp: \"Tớ gửi đề cương ôn tập Toán nhé, file PDF ở dưới.\"" },
      { id: "D", name: "Anh Khoa", role: "CLB Robotics", msg: "Nhắn riêng: \"Em có muốn tham gia CLB không? Sinh hoạt thứ Tư ở phòng 204, không thu phí.\"" },
    ],
    culprit: "B",
    clues: [
      { t: "Tài khoản \"Cô Lan\" mới tạo 3 ngày trước, ảnh đại diện lấy từ website trường.", key: true },
      { t: "Thầy Minh nhắn trong nhóm lớp có cả phụ huynh tham gia.", key: false },
      { t: "Số tài khoản nhận tiền đứng tên TRAN VAN BINH, không phải tài khoản của trường.", key: true },
      { t: "Lịch sinh hoạt CLB Robotics được dán trên bảng tin của trường.", key: false },
      { t: "Tin nhắn đòi chuyển tiền trong 1 giờ và dặn không cần báo phụ huynh.", key: true },
      { t: "File đề cương của Tuấn có đuôi .pdf, dung lượng 180 KB.", key: false },
    ],
  };

  /* ---------- Phân loại ---------- */
  const SORT_ITEMS = [
    { t: "Đặt mật khẩu \"matkhau123\"", safe: false },
    { t: "Bật xác thực hai lớp cho Facebook, Zalo", safe: true },
    { t: "Dùng chung một mật khẩu cho mọi tài khoản", safe: false },
    { t: "Cập nhật hệ điều hành điện thoại thường xuyên", safe: true },
    { t: "Đăng ảnh CCCD, vé máy bay lên mạng xã hội", safe: false },
    { t: "Kiểm tra quyền truy cập trước khi cài ứng dụng", safe: true },
    { t: "Đăng nhập ngân hàng qua Wi-Fi miễn phí ở quán", safe: false },
    { t: "Mật khẩu dài, kết hợp chữ, số và ký hiệu", safe: true },
  ];
  const SORT_ORDER = [4, 1, 6, 3, 0, 7, 2, 5];

  /* ---------- Ô chữ ---------- */
  const CROSS = {
    key: "DUNGLAI", keyLabel: "DỪNG LẠI",
    keyClue: "Từ khóa hàng dọc: việc đầu tiên cần làm khi nghi ngờ mình đang bị lừa (2 từ, viết liền không dấu).",
    rows: [
      { a: "CCCD", k: 3, c: "Giấy tờ tùy thân viết tắt, tuyệt đối không cho người lạ mượn (4 chữ cái)" },
      { a: "UNGDUNG", k: 0, c: "Chỉ cài ... từ kho chính thức như CH Play, App Store (7)" },
      { a: "NGANHANG", k: 0, c: "Không bán, không cho thuê tài khoản ... (8)" },
      { a: "DANGNHAP", k: 3, c: "Không ... tài khoản trên trang web lạ gửi qua tin nhắn (8)" },
      { a: "TELEGRAM", k: 2, c: "Ứng dụng nhắn tin kẻ gian hay dùng để lập nhóm \"làm nhiệm vụ\" (8)" },
      { a: "BAOMAT", k: 1, c: "Xác thực hai lớp giúp tăng ... cho tài khoản (6)" },
      { a: "PHISHING", k: 2, c: "Tên tiếng Anh của hình thức lừa lấy thông tin qua email, trang web giả (8)" },
    ],
  };

  /* =========================================================
     DANH SÁCH 10 CHẶNG (mỗi chặng 10 điểm)
     ========================================================= */
  const TOTAL_MINUTES = 30;
  const CHAPTERS = [
    { title: "Cuộc gọi lúc nửa đêm", threat: "Bắt cóc online, giả danh công an", type: "Tìm điểm bất thường trong hình", build: buildHunt },
    { title: "Dấu vân tay của kẻ gian", threat: "Tổng hợp các thủ đoạn đang nóng", type: "Nối cặp", build: buildMatch },
    { title: "Video call từ \"mẹ\"", threat: "Deepfake hình ảnh, giọng nói người thân", type: "Chọn đường đi (truyện tương tác)", build: buildPath },
    { title: "500 nghìn cho một lần quét mặt", threat: "Tài khoản ngân hàng, mã OTP, dữ liệu cá nhân", type: "Thật hay giả", build: buildTrueFake },
    { title: "Lối thoát khỏi tin nhắn trúng thưởng", threat: "Lừa trúng thưởng, link lạ", type: "Mê cung tìm đường", build: buildMaze },
    { title: "Ai là kẻ gian?", threat: "Giả danh nhà trường, thầy cô", type: "Thám tử phá án", build: buildDetective },
    { title: "Học bổng trong mơ", threat: "Giả danh học bổng, website giả", type: "Giải mã manh mối", build: buildDecode },
    { title: "Ổ khóa cho tài khoản", threat: "Mật khẩu, thói quen an toàn số", type: "Phân loại kéo thả", build: buildSort },
    { title: "Việc nhẹ, lời to", threat: "Việc nhẹ lương cao, làm nhiệm vụ online", type: "Sắp xếp diễn biến", build: buildOrder },
    { title: "Ô chữ an toàn số", threat: "Tổng kết kiến thức", type: "Ô chữ", build: buildCross },
  ].map((c) => ({ ...c, max: 10 }));

  const fmtPts = (n) => (Math.round(n * 10) / 10).toString().replace(".", ",");
  const pts = (v, max = 10) => clamp(Math.round(v * 10) / 10, 0, max);
  const OK = '<span class="rv-ok">✓</span>';
  const NO = '<span class="rv-no">✗</span>';

  /* =========================================================
     TRẠNG THÁI CHUNG
     ========================================================= */
  const state = { team: "", school: "", members: "", cur: 0, startAt: 0, endAt: 0, timerId: null, submitted: false, stages: [] };
  const app = $("#app");

  /* =========================================================
     1 – TÌM ĐIỂM BẤT THƯỜNG (đánh dấu, không báo đúng sai)
     ========================================================= */
  function buildHunt(body) {
    const keys = Object.keys(CH1_HOTSPOTS);
    const MAX_MARKS = 8;
    const marks = []; // {x, y, hs}
    body.append(h(`<div>
      <p class="brief">23:12. Khôi, học sinh lớp 11, nhận được tin nhắn Zalo kèm một "lệnh triệu tập khẩn cấp". Hãy soi kỹ màn hình điện thoại của Khôi.</p>
      <div class="task">Bấm vào những chi tiết mà đội cho là dấu hiệu lừa đảo để cắm cờ đánh dấu (tối đa ${MAX_MARKS} cờ). Bấm vào cờ để gỡ. Mỗi dấu hiệu đúng được cộng điểm, mỗi cờ cắm sai bị trừ 1 điểm.</div>
      <p class="hunt-counter">Cờ đã cắm: <span class="js-n">0</span> / ${MAX_MARKS}</p></div>`));
    const phone = h(`
      <div class="phone" role="application" aria-label="Màn hình điện thoại cần điều tra">
        <div class="phone__bar">
          <div class="avatar">H</div>
          <div class="hs" data-hs="zalo"><b>Thượng úy Trần Văn Hùng</b><small>Tài khoản Zalo cá nhân · vừa truy cập</small></div>
        </div>
        <div class="phone__body">
          <div class="bubble bubble--time">23:12</div>
          <div class="bubble">Em là Nguyễn Minh Khôi, sinh năm 2009 đúng không? Em đang có tên trong hồ sơ một vụ án. Đọc kỹ văn bản dưới đây.</div>
          <div class="doc">
            <div class="doc__head hs" data-hs="unit">BỘ CÔNG AN<br>CỤC TRUY NÃ QUỐC TẾ VÀ PHÒNG CHỐNG RỬA TIỀN</div>
            <div style="text-align:center;margin-top:4px">Số: 127/LTT-CA &nbsp;·&nbsp; Ngày 14 tháng 3 năm 2027</div>
            <div class="doc__title">LỆNH TRIỆU TẬP KHẨN CẤP</div>
            <div>Triệu tập công dân: <b>Nguyễn Minh Khôi</b>, sinh năm 2009.</div>
            <div>Lý do: liên quan đến đường dây rửa tiền 3,2 tỷ đồng.</div>
            <div class="hs" data-hs="secret">Công dân phải <b>giữ bí mật tuyệt đối</b>, không được thông báo cho gia đình, nhà trường để phục vụ điều tra.</div>
            <div class="hs" data-hs="money">Chuyển toàn bộ số dư tài khoản vào tài khoản tạm giữ <b>0899 214 576 – NGUYEN VAN TAM</b> để chứng minh trong sạch.</div>
            <div class="hs" data-hs="hotel">Tự thuê phòng khách sạn, tắt định vị và giữ cuộc gọi video với cán bộ điều tra 24/24.</div>
            <div class="doc__sign"><div class="seal">CÔNG AN<br>★<br>CỤC ĐIỀU TRA</div></div>
          </div>
          <div class="bubble hs" data-hs="threat">Em có 2 giờ để làm theo. Nếu không, lệnh bắt tạm giam sẽ thi hành ngay trong đêm nay.</div>
        </div>
      </div>`);
    body.append(phone);

    function draw() {
      $$(".flag", phone).forEach((f) => f.remove());
      marks.forEach((m, i) => {
        const f = h(`<button class="flag" aria-label="Gỡ cờ số ${i + 1}" style="left:${m.x}%;top:${m.y}%"><span>${i + 1}</span></button>`);
        f.addEventListener("click", (e) => { e.stopPropagation(); marks.splice(i, 1); sfx.tick(); draw(); touch(); });
        phone.append(f);
      });
      $(".js-n", body).textContent = marks.length;
    }
    phone.addEventListener("click", (e) => {
      if (state.submitted) return;
      if (marks.length >= MAX_MARKS) { toast(`Đã cắm đủ ${MAX_MARKS} cờ. Gỡ bớt một cờ để cắm chỗ khác.`); return; }
      const r = phone.getBoundingClientRect();
      const hs = e.target.closest("[data-hs]");
      marks.push({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, hs: hs ? hs.dataset.hs : null });
      sfx.tick(); draw(); touch();
    });

    const result = () => {
      const found = new Set(marks.filter((m) => m.hs).map((m) => m.hs));
      const wrong = marks.filter((m) => !m.hs).length;
      return { found, wrong, score: pts((found.size / keys.length) * 10 - wrong) };
    };
    return {
      answered: () => marks.length > 0,
      score: () => result().score,
      review: () => {
        const r = result();
        return `<p>Tìm đúng ${r.found.size}/${keys.length} dấu hiệu · Cắm sai ${r.wrong} cờ.</p><ul>${keys.map((k) =>
          `<li>${r.found.has(k) ? OK : NO} <b>${esc(CH1_LABELS[k])}:</b> ${esc(CH1_HOTSPOTS[k])}</li>`).join("")}</ul>`;
      },
    };
  }

  /* =========================================================
     2 – NỐI CẶP
     ========================================================= */
  function buildMatch(body) {
    const links = new Map();
    let picked = null;
    body.append(h(`<div><p class="brief">Mỗi thủ đoạn lừa đảo đều để lại "dấu vân tay" riêng. Hãy nối mỗi thủ đoạn với dấu hiệu nhận biết của nó.</p>
      <div class="task">Bấm một ô bên trái, rồi bấm ô phù hợp bên phải để nối. Bấm lại vào ô đã nối để gỡ dây.</div></div>`));
    const board = h(`
      <div class="match">
        <svg class="match__svg" aria-hidden="true"></svg>
        <div class="match__col">${MATCH_PAIRS.map((p, i) => `<button class="mnode mnode--l" data-l="${i}"><span>${esc(p[0])}</span><i class="dot"></i></button>`).join("")}</div>
        <div></div>
        <div class="match__col">${MATCH_RIGHT_ORDER.map((r) => `<button class="mnode mnode--r" data-r="${r}"><i class="dot"></i><span>${esc(MATCH_PAIRS[r][1])}</span></button>`).join("")}</div>
      </div>`);
    body.append(board);
    const count = h(`<p class="note">Đã nối ${0}/${MATCH_PAIRS.length}</p>`);
    body.append(count);
    const svg = $(".match__svg", board);

    function center(el) {
      const d = $(".dot", el).getBoundingClientRect(), b = board.getBoundingClientRect();
      return [d.left + d.width / 2 - b.left, d.top + d.height / 2 - b.top];
    }
    function draw() {
      if (!board.offsetParent) return; // đang ẩn
      svg.setAttribute("viewBox", `0 0 ${board.clientWidth} ${board.clientHeight}`);
      svg.innerHTML = [...links].map(([l, r]) => {
        const [x1, y1] = center($(`[data-l="${l}"]`, board)), [x2, y2] = center($(`[data-r="${r}"]`, board));
        return `<path d="M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}"/>`;
      }).join("");
      $$(".mnode", board).forEach((n) => n.classList.toggle("is-linked",
        n.dataset.l !== undefined ? links.has(+n.dataset.l) : [...links.values()].includes(+n.dataset.r)));
      $$(".mnode--l", board).forEach((b) => b.classList.toggle("is-picked", +b.dataset.l === picked));
      count.textContent = `Đã nối ${links.size}/${MATCH_PAIRS.length}`;
    }
    board.addEventListener("click", (e) => {
      if (state.submitted) return;
      const n = e.target.closest(".mnode"); if (!n) return;
      if (n.dataset.l !== undefined) {
        const l = +n.dataset.l;
        if (links.has(l)) { links.delete(l); picked = null; } else picked = l;
      } else {
        const r = +n.dataset.r;
        const owner = [...links].find(([, rr]) => rr === r);
        if (owner) links.delete(owner[0]);
        else if (picked !== null) { links.set(picked, r); picked = null; sfx.tick(); }
        else toast("Hãy chọn một ô bên trái trước.");
      }
      draw(); touch();
    });
    new ResizeObserver(draw).observe(board);

    const right = () => [...links].filter(([l, r]) => l === r).length;
    return {
      answered: () => links.size > 0,
      onShow: draw,
      score: () => pts((right() / MATCH_PAIRS.length) * 10),
      review: () => `<p>Nối đúng ${right()}/${MATCH_PAIRS.length} cặp.</p><ul>${MATCH_PAIRS.map((p, i) => {
        const r = links.get(i);
        return `<li>${r === i ? OK : NO} <b>${esc(p[0])}</b> → ${esc(p[1])}${r !== undefined && r !== i ? `<br><small>Đội đã nối với: ${esc(MATCH_PAIRS[r][1])}</small>` : r === undefined ? "<br><small>Đội chưa nối</small>" : ""}</li>`;
      }).join("")}</ul>`,
    };
  }

  /* =========================================================
     3 – CHỌN ĐƯỜNG ĐI (truyện tương tác, không báo đúng sai)
     ========================================================= */
  function buildPath(body) {
    const picks = [];
    body.append(h(`<div><p class="brief">Đội vào vai Linh, học sinh lớp 10. Câu chuyện diễn ra qua 3 tình huống liên tiếp.</p>
      <div class="task">Ở mỗi tình huống, chọn cách xử lý mà đội cho là đúng nhất. Có thể đổi lựa chọn trước khi nộp bài.</div></div>`));
    const stage = h(`<div class="story"></div>`);
    body.append(stage);
    function draw() {
      const shown = Math.min(CH2_SCENES.length, picks.filter((p) => p !== undefined).length + 1);
      stage.replaceChildren(...CH2_SCENES.slice(0, shown).map((sc, si) => {
        const el = h(`<div class="scene">
          <div class="scene__clock">Tình huống ${si + 1} · ${esc(sc.clock)}</div>
          ${sc.call ? `<div class="call"><div class="call__video" aria-hidden="true"></div>
            <div><div class="note" style="color:#9fb2b3">Cuộc gọi video đến…</div><div class="call__name">${esc(sc.call.name)}</div><p class="call__quote">${esc(sc.call.quote)}</p></div></div>` : ""}
          <p class="brief">${esc(sc.text)}</p>
          <div class="choices">${sc.choices.map((c, i) => `<button class="choice ${picks[si] === i ? "is-selected" : ""}" data-s="${si}" data-i="${i}" aria-pressed="${picks[si] === i}"><b>${"ABC"[i]}</b><span>${esc(c.t)}</span></button>`).join("")}</div>
        </div>`);
        return el;
      }));
    }
    stage.addEventListener("click", (e) => {
      if (state.submitted) return;
      const b = e.target.closest(".choice"); if (!b) return;
      picks[+b.dataset.s] = +b.dataset.i; sfx.tick(); draw(); touch();
    });
    draw();
    const total = () => CH2_SCENES.reduce((a, sc, i) => a + (picks[i] !== undefined ? sc.choices[picks[i]].pts : 0), 0);
    return {
      answered: () => picks.some((p) => p !== undefined),
      score: () => pts((total() / 20) * 10),
      review: () => `<ul>${CH2_SCENES.map((sc, i) => {
        const best = sc.choices.reduce((bi, c, ci, arr) => (c.pts > arr[bi].pts ? ci : bi), 0);
        const p = picks[i];
        return `<li>${p === best ? OK : NO} <b>Tình huống ${i + 1}:</b> đội chọn ${p === undefined ? "<i>chưa chọn</i>" : "ABC"[p]}, đáp án tốt nhất ${"ABC"[best]}.<br><small>${esc(sc.choices[best].t)} – ${esc(sc.choices[best].o)}</small></li>`;
      }).join("")}</ul>`,
    };
  }

  /* =========================================================
     4 – THẬT HAY GIẢ
     ========================================================= */
  function buildTrueFake(body) {
    const picks = [];
    body.append(h(`<div><p class="brief">Điện thoại của Minh nhận rất nhiều tin nhắn. Hãy giúp Minh phân biệt đâu là tin thật, đâu là cái bẫy.</p>
      <div class="task">Mỗi cặp có 2 tin. Bấm vào tin mà đội cho là lừa đảo hoặc đáng ngờ.</div></div>`));
    const wrap = h(`<div class="rounds"></div>`);
    CH3_ROUNDS.forEach((R, ri) => wrap.append(h(`
      <div class="round"><h3>Cặp ${ri + 1}. ${esc(R.q)}</h3>
        <div class="pair">${R.cards.map((c, i) => `
          <button class="card-pick" data-r="${ri}" data-i="${i}" aria-pressed="false">
            <div class="card-pick__head"><span>${esc(c.app)}</span><b>${esc(c.from)}</b></div>
            <div class="card-pick__body">${esc(c.body)}</div>
            <span class="pick-badge">Đội chọn: lừa đảo</span>
          </button>`).join("")}</div></div>`)));
    body.append(wrap);
    wrap.addEventListener("click", (e) => {
      if (state.submitted) return;
      const b = e.target.closest(".card-pick"); if (!b) return;
      picks[+b.dataset.r] = +b.dataset.i;
      $$(`.card-pick[data-r="${b.dataset.r}"]`, wrap).forEach((x) => { const on = x === b; x.classList.toggle("is-selected", on); x.setAttribute("aria-pressed", on); });
      sfx.tick(); touch();
    });
    const right = () => CH3_ROUNDS.filter((R, i) => picks[i] === R.fake).length;
    return {
      answered: () => picks.some((p) => p !== undefined),
      score: () => pts((right() / CH3_ROUNDS.length) * 10),
      review: () => `<p>Đúng ${right()}/${CH3_ROUNDS.length} cặp.</p><ul>${CH3_ROUNDS.map((R, i) =>
        `<li>${picks[i] === R.fake ? OK : NO} <b>Cặp ${i + 1}:</b> tin lừa đảo là tin từ "${esc(R.cards[R.fake].from)}"${picks[i] === undefined ? " (đội chưa chọn)" : ""}.<br><small>${esc(R.explain)}</small></li>`).join("")}</ul>`,
    };
  }

  /* =========================================================
     5 – MÊ CUNG TÌM ĐƯỜNG (vẽ đường, chấm khi nộp)
     ========================================================= */
  function buildMaze(body) {
    const path = [MAZE.start.join()];
    body.append(h(`<div><p class="brief">An vừa nhận được một tin nhắn "trúng thưởng". Hãy vạch đường cho An từ ô xuất phát tới ô 🛡️ AN TOÀN.</p>
      <div class="task">Bấm lần lượt vào ô kề bên (trên, dưới, trái, phải) để vẽ đường đi. Chỉ nên đi qua các hành động đúng: mỗi ô bẫy trên đường đi bị trừ 2 điểm. Có thể lùi lại hoặc vẽ lại từ đầu.</div></div>`));
    const grid = h(`<div class="maze" style="--cols:${MAZE.cols}"></div>`);
    body.append(grid);
    const tools = h(`<div class="actions"><button class="btn btn--ghost js-undo">Lùi một bước</button><button class="btn btn--ghost js-reset">Vẽ lại từ đầu</button><span class="note js-steps"></span></div>`);
    body.append(tools);
    const last = () => path[path.length - 1].split(",").map(Number);
    const atGoal = () => path[path.length - 1] === MAZE.goal.join();
    function draw() {
      const [pr, pc] = last();
      grid.replaceChildren(...MAZE.cells.flatMap((row, r) => row.map((cell, c) => {
        const k = `${r},${c}`, step = path.indexOf(k);
        const adj = Math.abs(r - pr) + Math.abs(c - pc) === 1 && step < 0 && !atGoal();
        const b = h(`<button class="mcell ${step >= 0 ? "is-path" : ""} ${k === path[path.length - 1] ? "is-here" : ""} ${adj ? "is-next" : ""} ${k === MAZE.goal.join() ? "is-goal" : ""}" data-k="${k}">
          ${step > 0 ? `<span class="mstep">${step}</span>` : ""}${k === path[path.length - 1] ? '<span class="pawn" aria-hidden="true">🧑‍🎓</span>' : ""}<span>${esc(cell.t)}</span></button>`);
        b.disabled = !adj || state.submitted;
        return b;
      })));
      $(".js-steps", tools).textContent = atGoal() ? `Đã tới đích sau ${path.length - 1} bước.` : `Đã đi ${path.length - 1} bước.`;
    }
    grid.addEventListener("click", (e) => {
      const b = e.target.closest(".mcell"); if (!b || b.disabled) return;
      path.push(b.dataset.k); sfx.tick(); draw(); touch();
    });
    $(".js-undo", tools).addEventListener("click", () => { if (path.length > 1 && !state.submitted) { path.pop(); draw(); touch(); } });
    $(".js-reset", tools).addEventListener("click", () => { if (!state.submitted) { path.length = 1; draw(); touch(); } });
    draw();
    const cellAt = (k) => { const [r, c] = k.split(",").map(Number); return MAZE.cells[r][c]; };
    const calc = () => {
      const steps = path.slice(1);
      const traps = steps.filter((k) => !cellAt(k).s);
      const safe = steps.filter((k) => cellAt(k).s).length;
      const score = atGoal() ? 10 - traps.length * 2 : (safe / (MAZE_PATH_LEN - 1)) * 6 - traps.length * 2;
      return { traps, safe, score: pts(score) };
    };
    return {
      answered: () => path.length > 1,
      score: () => calc().score,
      review: () => {
        const r = calc();
        return `<p>${atGoal() ? OK + " Đội đã tới đích." : NO + " Đội chưa tới đích."} Đi qua ${r.traps.length} ô bẫy.</p>
          ${r.traps.length ? `<ul>${r.traps.map((k) => `<li>${NO} <b>${esc(cellAt(k).t)}:</b> ${esc(cellAt(k).why)}</li>`).join("")}</ul>` : ""}
          <p><small>Đường đúng: Không bấm link → Tra trên trang chính thức → Phát hiện không có chương trình → Chụp màn hình làm bằng chứng → Báo bố mẹ, thầy cô → Chặn và báo cáo → An toàn.</small></p>`;
      },
    };
  }

  /* =========================================================
     6 – THÁM TỬ PHÁ ÁN
     ========================================================= */
  function buildDetective(body) {
    let suspect = null; const chosen = new Set();
    body.append(h(`<div><p class="brief">Hà, lớp 11A3, nhận được 4 tin nhắn trong cùng một buổi tối. Một trong số đó là kẻ lừa đảo giả danh nhà trường. Hãy xem tin nhắn của từng người, soi các manh mối trên bảng và kết luận vụ án.</p>
      <div class="task">Bước 1: chọn 1 nghi phạm. Bước 2: ghim đúng 3 manh mối chứng minh người đó là kẻ gian.</div></div>`));
    const sus = h(`<div class="suspects">${DETECTIVE.suspects.map((s) => `
      <button class="suspect" data-id="${s.id}" aria-pressed="false">
        <span class="suspect__tag">Nghi phạm ${s.id}</span>
        <span class="suspect__face" aria-hidden="true">${esc(s.name.split(" ").pop()[0])}</span>
        <b>${esc(s.name)}</b><small>${esc(s.role)}</small>
        <span class="suspect__msg">${esc(s.msg)}</span>
      </button>`).join("")}</div>`);
    body.append(sus);
    const board = h(`<div class="corkboard"><h3>Bảng manh mối</h3><div class="pins">${DETECTIVE.clues.map((c, i) => `
      <button class="pin" data-i="${i}" aria-pressed="false">${esc(c.t)}</button>`).join("")}</div></div>`);
    body.append(board);
    const hint = h(`<p class="note"></p>`); body.append(hint);
    function refresh() {
      $$(".suspect", sus).forEach((b) => { const on = b.dataset.id === suspect; b.classList.toggle("is-picked", on); b.setAttribute("aria-pressed", on); });
      $$(".pin", board).forEach((b) => { const on = chosen.has(+b.dataset.i); b.classList.toggle("is-pinned", on); b.setAttribute("aria-pressed", on); });
      hint.textContent = `${suspect ? "Đội nghi ngờ: Nghi phạm " + suspect : "Chưa chọn nghi phạm"} · Đã ghim ${chosen.size}/3 manh mối`;
    }
    sus.addEventListener("click", (e) => { const b = e.target.closest(".suspect"); if (!b || state.submitted) return; suspect = b.dataset.id; sfx.tick(); refresh(); touch(); });
    board.addEventListener("click", (e) => {
      const b = e.target.closest(".pin"); if (!b || state.submitted) return;
      const i = +b.dataset.i;
      if (chosen.has(i)) chosen.delete(i);
      else if (chosen.size < 3) { chosen.add(i); sfx.tick(); }
      else toast("Chỉ được ghim 3 manh mối. Bỏ ghim một manh mối trước.");
      refresh(); touch();
    });
    refresh();
    const calc = () => {
      let s = suspect === DETECTIVE.culprit ? 4 : 0;
      chosen.forEach((i) => (s += DETECTIVE.clues[i].key ? 2 : -1));
      return pts(s);
    };
    return {
      answered: () => !!suspect || chosen.size > 0,
      score: calc,
      review: () => `<p>${suspect === DETECTIVE.culprit ? OK : NO} Đội chọn ${suspect ? "nghi phạm " + suspect : "<i>chưa chọn</i>"}. Thủ phạm là nghi phạm B – "Cô Lan", tài khoản giả danh Phòng Đào tạo.</p>
        <ul>${DETECTIVE.clues.map((c, i) => `<li>${chosen.has(i) ? (c.key ? OK : NO) : c.key ? "○" : "·"} ${esc(c.t)} ${c.key ? "<b>(manh mối then chốt)</b>" : ""}${chosen.has(i) ? " <small>– đội đã ghim</small>" : ""}</li>`).join("")}</ul>`,
    };
  }

  /* =========================================================
     7 – GIẢI MÃ MANH MỐI
     ========================================================= */
  function buildDecode(body) {
    const picks = [];
    body.append(h(`<div><p class="brief">Kẻ gian giỏi nhất là ngụy trang đường link. Chỉ người biết đọc tên miền mới không bị lừa.</p>
      <div class="task">Với mỗi đường link, bấm vào phần là <b>tên miền thật</b>, tức là website mà đường link thực sự dẫn tới.</div>
      <p class="note">Gợi ý: đọc phần địa chỉ từ phải sang trái, bắt đầu ngay trước dấu "/" đầu tiên.</p></div>`));
    const wrap = h(`<div class="rounds"></div>`);
    CH4_ROUNDS.forEach((R, ri) => wrap.append(h(`
      <div class="round"><p><b>Đường link ${ri + 1}.</b> ${esc(R.context)}</p>
        <div class="url-bar"><span class="url-bar__lock" aria-hidden="true">${R.chunks[0][0].startsWith("https") ? "🔒" : "⚠️"}</span>
          <span class="url-chunks">${R.chunks.map(([t, host], i) => host
            ? `<button class="chunk chunk--host" data-r="${ri}" data-i="${i}" aria-pressed="false">${esc(t)}</button>`
            : `<span class="chunk chunk--static">${esc(t)}</span>`).join("")}</span>
        </div></div>`)));
    body.append(wrap);
    wrap.addEventListener("click", (e) => {
      const b = e.target.closest(".chunk--host"); if (!b || state.submitted) return;
      picks[+b.dataset.r] = +b.dataset.i;
      $$(`.chunk--host[data-r="${b.dataset.r}"]`, wrap).forEach((x) => { const on = x === b; x.classList.toggle("is-selected", on); x.setAttribute("aria-pressed", on); });
      sfx.tick(); touch();
    });
    const right = () => CH4_ROUNDS.filter((R, i) => picks[i] === R.answer).length;
    return {
      answered: () => picks.some((p) => p !== undefined),
      score: () => pts((right() / CH4_ROUNDS.length) * 10),
      review: () => `<p>Đúng ${right()}/${CH4_ROUNDS.length} đường link.</p><ul>${CH4_ROUNDS.map((R, i) =>
        `<li>${picks[i] === R.answer ? OK : NO} <b>Link ${i + 1}:</b> tên miền thật là <code>${esc(R.chunks[R.answer][0])}</code> – ${R.safe ? "an toàn" : "nguy hiểm"}${picks[i] !== undefined && picks[i] !== R.answer ? ` (đội chọn <code>${esc(R.chunks[picks[i]][0])}</code>)` : picks[i] === undefined ? " (đội chưa chọn)" : ""}.<br><small>${esc(R.explain)}</small></li>`).join("")}</ul>`,
    };
  }

  /* =========================================================
     8 – PHÂN LOẠI KÉO THẢ
     ========================================================= */
  function buildSort(body) {
    const place = new Map();
    let picked = null;
    body.append(h(`<div><p class="brief">Thói quen nào giúp bảo vệ tài khoản, thói quen nào đang "mở cửa" cho kẻ gian?</p>
      <div class="task">Kéo từng thẻ vào đúng giỏ. Trên điện thoại: bấm chọn thẻ, rồi bấm vào giỏ. Bấm thẻ trong giỏ rồi bấm vùng thẻ phía trên để đưa ra lại.</div></div>`));
    const wrap = h(`<div>
      <div class="pool" data-bin="pool"></div>
      <div class="bins">
        <div class="bin bin--safe" data-bin="safe" tabindex="0"><h3>✅ An toàn</h3><div class="bin__items"></div></div>
        <div class="bin bin--risk" data-bin="risk" tabindex="0"><h3>⚠️ Nguy hiểm</h3><div class="bin__items"></div></div>
      </div></div>`);
    body.append(wrap);
    function chip(i) {
      const c = h(`<button class="chip ${picked === i ? "is-picked" : ""}" draggable="true" data-i="${i}">${esc(SORT_ITEMS[i].t)}</button>`);
      c.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", i); picked = i; });
      return c;
    }
    function draw() {
      $(".pool", wrap).replaceChildren(...SORT_ORDER.filter((i) => !place.has(i)).map(chip));
      $(".bin--safe .bin__items", wrap).replaceChildren(...SORT_ORDER.filter((i) => place.get(i) === "safe").map(chip));
      $(".bin--risk .bin__items", wrap).replaceChildren(...SORT_ORDER.filter((i) => place.get(i) === "risk").map(chip));
    }
    function moveTo(bin) {
      if (picked === null || state.submitted) return;
      if (bin === "pool") place.delete(picked); else place.set(picked, bin);
      picked = null; sfx.tick(); draw(); touch();
    }
    wrap.addEventListener("click", (e) => {
      if (state.submitted) return;
      const c = e.target.closest(".chip");
      if (c) { const i = +c.dataset.i; picked = picked === i ? null : i; draw(); return; }
      const b = e.target.closest("[data-bin]");
      if (b) moveTo(b.dataset.bin);
    });
    $$("[data-bin]", wrap).forEach((b) => {
      b.addEventListener("dragover", (e) => { e.preventDefault(); b.classList.add("is-over"); });
      b.addEventListener("dragleave", () => b.classList.remove("is-over"));
      b.addEventListener("drop", (e) => { e.preventDefault(); b.classList.remove("is-over"); picked = +e.dataTransfer.getData("text/plain"); moveTo(b.dataset.bin); });
      b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); moveTo(b.dataset.bin); } });
    });
    draw();
    const right = () => SORT_ITEMS.filter((it, i) => place.get(i) === (it.safe ? "safe" : "risk")).length;
    return {
      answered: () => place.size > 0,
      score: () => pts((right() / SORT_ITEMS.length) * 10),
      review: () => `<p>Xếp đúng ${right()}/${SORT_ITEMS.length} thẻ.</p><ul>${SORT_ITEMS.map((it, i) => {
        const want = it.safe ? "safe" : "risk", got = place.get(i);
        return `<li>${got === want ? OK : NO} ${esc(it.t)} → <b>${it.safe ? "An toàn" : "Nguy hiểm"}</b>${got && got !== want ? " (đội xếp nhầm giỏ)" : !got ? " (đội chưa xếp)" : ""}</li>`;
      }).join("")}</ul>`,
    };
  }

  /* =========================================================
     9 – SẮP XẾP DIỄN BIẾN
     ========================================================= */
  function buildOrder(body) {
    const order = [...CH5_SHUFFLE];
    let moved = false, dragFrom = null;
    body.append(h(`<div><p class="brief">Chị của Nam mất 5,5 triệu đồng sau một tuần "làm nhiệm vụ online". Công an cần đội dựng lại đúng trình tự vụ việc để cảnh báo các bạn khác.</p>
      <div class="task">Sắp xếp 6 diễn biến theo đúng thứ tự thời gian. Kéo thả thẻ, hoặc dùng nút ▲ ▼.</div></div>`));
    const list = h(`<ol class="timeline" aria-label="Các diễn biến cần sắp xếp"></ol>`);
    body.append(list);
    function draw() {
      list.replaceChildren(...order.map((stepIdx, pos) => {
        const li = h(`<li class="tl-item" draggable="true" data-pos="${pos}">
          <span>${esc(CH5_STEPS[stepIdx])}</span>
          <span class="tl-move">
            <button aria-label="Đưa lên" ${pos === 0 ? "disabled" : ""} data-dir="-1">▲</button>
            <button aria-label="Đưa xuống" ${pos === order.length - 1 ? "disabled" : ""} data-dir="1">▼</button>
          </span></li>`);
        li.addEventListener("dragstart", () => { dragFrom = pos; li.classList.add("is-dragging"); });
        li.addEventListener("dragend", () => li.classList.remove("is-dragging"));
        li.addEventListener("dragover", (e) => { e.preventDefault(); li.classList.add("is-over"); });
        li.addEventListener("dragleave", () => li.classList.remove("is-over"));
        li.addEventListener("drop", (e) => {
          e.preventDefault();
          if (dragFrom === null || dragFrom === pos || state.submitted) return;
          const [m] = order.splice(dragFrom, 1); order.splice(pos, 0, m);
          dragFrom = null; moved = true; sfx.tick(); draw(); touch();
        });
        $$("button[data-dir]", li).forEach((b) => b.addEventListener("click", () => {
          if (state.submitted) return;
          const to = pos + +b.dataset.dir;
          [order[pos], order[to]] = [order[to], order[pos]];
          moved = true; sfx.tick(); draw(); touch();
          const again = $(`.tl-item[data-pos="${to}"] button[data-dir="${b.dataset.dir}"]`, list);
          if (again && !again.disabled) again.focus();
        }));
        return li;
      }));
    }
    draw();
    const right = () => order.filter((s, pos) => s === pos).length;
    return {
      answered: () => moved,
      score: () => (moved ? pts((right() / order.length) * 10) : 0),
      review: () => `<p>${moved ? `Đúng ${right()}/6 vị trí.` : "Đội chưa sắp xếp (giữ nguyên thứ tự ban đầu), chặng này được 0 điểm."}</p><ol>${CH5_STEPS.map((s, i) => `<li>${order[i] === i ? OK : NO} ${esc(s)}</li>`).join("")}</ol>
        <p><small>Kịch bản điển hình: cho lãi nhỏ để tạo lòng tin, rồi viện cớ "thao tác sai" bắt nạp thêm cho đến khi nạn nhân hết tiền.</small></p>`,
    };
  }

  /* =========================================================
     10 – Ô CHỮ
     ========================================================= */
  function buildCross(body) {
    const K = Math.max(...CROSS.rows.map((r) => r.k));
    const width = Math.max(...CROSS.rows.map((r) => K - r.k + r.a.length));
    const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "D").toUpperCase().replace(/[^A-Z]/g, "");
    body.append(h(`<div><p class="brief">Giải 7 hàng ngang để tìm ra từ khóa hàng dọc, câu "thần chú" của mọi học sinh khi gặp lừa đảo.</p>
      <div class="task">Gõ chữ không dấu vào các ô. Cột tô vàng ghép lại thành từ khóa.</div></div>`));
    const grid = h(`<div class="cross"></div>`);
    CROSS.rows.forEach((row, r) => {
      const off = K - row.k;
      const line = h(`<div class="cross__row"><span class="cross__no">${r + 1}</span><div class="cross__cells" style="--w:${width}"></div></div>`);
      const cells = $(".cross__cells", line);
      for (let c = 0; c < width; c++) {
        const idx = c - off;
        if (idx < 0 || idx >= row.a.length) { cells.append(h(`<span class="cross__gap"></span>`)); continue; }
        cells.append(h(`<input class="cross__in ${idx === row.k ? "is-key" : ""}" maxlength="1" data-r="${r}" data-i="${idx}" aria-label="Hàng ${r + 1}, chữ ${idx + 1}" autocomplete="off" autocapitalize="characters" spellcheck="false">`));
      }
      grid.append(line);
    });
    body.append(grid);
    body.append(h(`<ol class="cross__clues">${CROSS.rows.map((r) => `<li>${esc(r.c)}</li>`).join("")}</ol>`));
    const keyField = h(`<div class="field" style="max-width:420px;margin-top:14px"><label>${esc(CROSS.keyClue)}</label><input class="js-key" maxlength="20" autocomplete="off" placeholder="Từ khóa hàng dọc"></div>`);
    body.append(keyField);
    const keyIn = $(".js-key", keyField);
    keyIn.addEventListener("input", touch);
    grid.addEventListener("input", (e) => {
      const el = e.target; if (!el.classList.contains("cross__in")) return;
      el.value = norm(el.value).slice(-1);
      if (el.value) { const nx = $(`.cross__in[data-r="${el.dataset.r}"][data-i="${+el.dataset.i + 1}"]`, grid); if (nx) nx.focus(); }
      touch();
    });
    grid.addEventListener("keydown", (e) => {
      const el = e.target; if (!el.classList.contains("cross__in")) return;
      if (e.key === "Backspace" && !el.value) {
        const pv = $(`.cross__in[data-r="${el.dataset.r}"][data-i="${+el.dataset.i - 1}"]`, grid);
        if (pv) { pv.focus(); pv.value = ""; e.preventDefault(); }
      }
    });
    const rowVal = (r) => $$(`.cross__in[data-r="${r}"]`, grid).map((i) => i.value).join("");
    const keyOk = () => norm(keyIn.value) === CROSS.key;
    const right = () => CROSS.rows.filter((row, r) => rowVal(r) === row.a).length + (keyOk() ? 1 : 0);
    return {
      answered: () => $$(".cross__in", grid).some((i) => i.value) || !!keyIn.value.trim(),
      lock: () => { $$("input", body).forEach((i) => (i.disabled = true)); },
      score: () => pts((right() / (CROSS.rows.length + 1)) * 10),
      review: () => `<p>Đúng ${right()}/${CROSS.rows.length + 1} (7 hàng ngang + từ khóa).</p><ul>${CROSS.rows.map((row, r) =>
        `<li>${rowVal(r) === row.a ? OK : NO} Hàng ${r + 1}: <b>${row.a}</b>${rowVal(r) && rowVal(r) !== row.a ? ` (đội điền ${esc(rowVal(r))})` : ""}</li>`).join("")}
        <li>${keyOk() ? OK : NO} Từ khóa: <b>${esc(CROSS.keyLabel)}</b>${keyIn.value.trim() && !keyOk() ? ` (đội điền ${esc(keyIn.value.trim())})` : ""}</li></ul>`,
    };
  }

  /* =========================================================
     ĐIỀU HƯỚNG TỰ DO GIỮA CÁC CHẶNG
     ========================================================= */
  function touch() { renderTabs(); }

  function renderTabs() {
    $("#tabs").replaceChildren(...CHAPTERS.map((c, i) => {
      const done = state.stages[i] && state.stages[i].api.answered();
      const b = h(`<button class="tab ${i === state.cur ? "is-current" : ""} ${done ? "is-done" : ""}" title="Chặng ${i + 1}: ${esc(c.title)}${done ? " (đã làm)" : " (chưa làm)"}" aria-label="Chặng ${i + 1}${done ? ", đã làm" : ", chưa làm"}">${i + 1}</button>`);
      b.addEventListener("click", () => show(i));
      return b;
    }));
  }

  function show(i) {
    state.cur = i;
    state.stages.forEach((s, k) => (s.el.hidden = k !== i));
    const api = state.stages[i].api;
    if (api.onShow) requestAnimationFrame(api.onShow);
    renderTabs();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildExam() {
    state.stages = CHAPTERS.map((ch, i) => {
      const el = h(`
        <section class="folder stage" data-tab="Chặng ${i + 1} / ${CHAPTERS.length}" hidden>
          <div class="paper">
            <div class="chapter-meta">${esc(ch.type)} · ${esc(ch.threat)}</div>
            <h1 class="chapter-title">${esc(ch.title)}</h1>
            <div class="chapter-body"></div>
            <nav class="stage-nav" aria-label="Chuyển chặng">
              <button class="btn btn--ghost js-prev" ${i === 0 ? "disabled" : ""}>Chặng trước</button>
              <span class="note">Chặng ${i + 1} / ${CHAPTERS.length}</span>
              ${i < CHAPTERS.length - 1 ? `<button class="btn js-next">Chặng sau</button>` : `<button class="btn btn--stamp js-submit">Nộp bài</button>`}
            </nav>
          </div>
        </section>`);
      app.append(el);
      const api = ch.build($(".chapter-body", el));
      $(".js-prev", el).addEventListener("click", () => show(i - 1));
      const nx = $(".js-next", el); if (nx) nx.addEventListener("click", () => show(i + 1));
      const sb = $(".js-submit", el); if (sb) sb.addEventListener("click", askSubmit);
      return { el, api };
    });
  }

  /* ---------------- Đồng hồ chung ---------------- */
  function startTimer() {
    clearInterval(state.timerId);
    state.endAt = Date.now() + TOTAL_MINUTES * 60000;
    const el = $("#timer");
    const tick = () => {
      const left = (state.endAt - Date.now()) / 1000;
      el.textContent = fmt(left);
      el.classList.toggle("is-low", left <= 60);
      if (left <= 10 && left > 0) sfx.tick();
      if (left <= 0) { clearInterval(state.timerId); toast("Hết giờ! Bài làm được nộp tự động.", "bad"); submit(); }
    };
    tick();
    state.timerId = setInterval(tick, 1000);
  }

  /* ---------------- Nộp bài ---------------- */
  function askSubmit() {
    const left = CHAPTERS.map((c, i) => i).filter((i) => !state.stages[i].api.answered());
    const modal = h(`
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
        <div class="modal__box paper">
          <h2 id="mTitle">Nộp bài?</h2>
          <p>${left.length ? `Đội còn <b>${left.length} chặng chưa làm</b>: ${left.map((i) => `chặng ${i + 1}`).join(", ")}. Các chặng này sẽ được 0 điểm.` : "Đội đã làm đủ 10 chặng."}</p>
          <p>Sau khi nộp, đội không thể sửa bài. Điểm và đáp án chi tiết sẽ hiện ngay sau đó.</p>
          <div class="actions">
            <button class="btn btn--ghost js-back">Quay lại làm tiếp</button>
            <button class="btn btn--stamp js-ok">Nộp bài</button>
          </div>
        </div>
      </div>`);
    document.body.append(modal);
    $(".js-ok", modal).focus();
    const close = () => modal.remove();
    $(".js-back", modal).addEventListener("click", close);
    $(".js-ok", modal).addEventListener("click", () => { close(); submit(); });
    modal.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  function submit() {
    if (state.submitted) return;
    state.submitted = true;
    clearInterval(state.timerId);
    $$(".modal").forEach((m) => m.remove());
    state.stages.forEach((s) => s.api.lock && s.api.lock());
    showReport();
  }

  /* =========================================================
     BÁO CÁO KẾT QUẢ + XUẤT PDF
     ========================================================= */
  function showReport() {
    $("#topbar").hidden = true;
    const scores = state.stages.map((s) => s.api.score());
    const total = Math.round(scores.reduce((a, b) => a + b, 0) * 10) / 10;
    const used = Math.min(TOTAL_MINUTES * 60, Math.round((Date.now() - state.startAt) / 1000));
    const rank = total >= 90 ? "Huy hiệu Kim cương – Công dân số xuất sắc" : total >= 75 ? "Huy hiệu Vàng – Công dân số vững vàng" : total >= 50 ? "Huy hiệu Bạc – Công dân số cảnh giác" : "Huy hiệu Đồng – Cần ôn luyện thêm";
    const now = new Date();
    const when = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ngày ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    try { localStorage.setItem("hsnt-attt-ketqua", JSON.stringify({ team: state.team, school: state.school, total, used, scores, at: now.toISOString() })); } catch (e) { /* bỏ qua */ }
    sfx.win();
    window.scrollTo({ top: 0 });
    app.replaceChildren(h(`
      <section class="folder" data-tab="Kết quả">
        <div class="paper" id="report">
          <div class="report-head">
            <div>
              <div class="chapter-meta">Cuộc thi FPTU Cyber Security · Vòng 1</div>
              <h1 class="chapter-title" style="margin-bottom:4px">Kết quả bài thi: Học sinh nhận thức an toàn thông tin</h1>
              <p class="report-team"><b>Đội:</b> ${esc(state.team)} · <b>Trường:</b> ${esc(state.school)}${state.members ? `<br><b>Thành viên:</b> ${esc(state.members)}` : ""}<br><b>Nộp bài lúc:</b> ${when} · <b>Thời gian làm bài:</b> ${fmt(used)}</p>
            </div>
            <div class="report-score"><div class="final-score">${fmtPts(total)}<small> / 100</small></div><div class="rank">${rank}</div></div>
          </div>
          <table class="breakdown">
            <thead><tr><th>Chặng</th><th>Dạng câu hỏi</th><th>Điểm</th></tr></thead>
            <tbody>${CHAPTERS.map((c, i) => `<tr>
              <td><b>${i + 1}. ${esc(c.title)}</b><div class="bar"><span style="width:${(scores[i] / c.max) * 100}%"></span></div></td>
              <td>${esc(c.type)}</td><td>${fmtPts(scores[i])} / ${c.max}</td></tr>`).join("")}
              <tr class="breakdown__total"><td colspan="2"><b>Tổng điểm</b></td><td><b>${fmtPts(total)} / 100</b></td></tr></tbody>
          </table>
          <h2 class="report-sub">Đáp án và nhận xét từng chặng</h2>
          ${CHAPTERS.map((c, i) => `<div class="review-block">
            <h3>Chặng ${i + 1}. ${esc(c.title)} <span>${fmtPts(scores[i])} / ${c.max} điểm</span></h3>
            <div class="review-body">${state.stages[i].api.review()}</div></div>`).join("")}
          <div class="lesson review-block">
            <h3>Khi gặp lừa đảo thật, hãy nhớ</h3>
            <div class="hotlines">
              <div><b>113</b>Công an – gọi khẩn cấp</div>
              <div><b>111</b>Tổng đài quốc gia bảo vệ trẻ em</div>
              <div><b>Bố mẹ, thầy cô</b>Người đầu tiên cần báo</div>
              <div><b>Công an phường, xã</b>Nơi trình báo gần nhất</div>
            </div>
          </div>
        </div>
        <div class="actions report-actions">
          <button class="btn btn--stamp" id="pdfBtn">Tải kết quả PDF</button>
          <button class="btn btn--ghost" id="againBtn">Làm bài mới</button>
        </div>
      </section>`));
    $("#pdfBtn").addEventListener("click", exportPdf);
    $("#againBtn").addEventListener("click", () => { if (confirm("Bắt đầu bài mới? Kết quả hiện tại sẽ không còn trên màn hình (hãy tải PDF trước).")) location.reload(); });
  }

  /* Xuất PDF: dùng thư viện html2pdf.js (tải từ cdnjs khi cần).
     Nếu không tải được (mất mạng), mở hộp thoại In để chọn "Lưu thành PDF". */
  function loadScript(src) {
    return new Promise((res, rej) => {
      if (window.html2pdf) return res();
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.append(s);
    });
  }
  async function exportPdf() {
    const btn = $("#pdfBtn");
    btn.disabled = true; btn.textContent = "Đang tạo PDF…";
    const slug = (state.team || "doi-thi").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js");
      // Dựng một bản sao khổ A4 ở góc trái trên để thư viện chụp đúng vị trí
      const holder = document.createElement("div");
      holder.style.cssText = "position:absolute;left:0;top:0;width:720px;background:#fff;z-index:-1;";
      const clone = $("#report").cloneNode(true);
      clone.removeAttribute("id");
      clone.classList.add("report-pdf");
      holder.append(clone);
      document.body.append(holder);
      const y = window.scrollY;
      window.scrollTo(0, 0);
      try {
        await window.html2pdf().set({
          margin: [10, 10, 12, 10],
          filename: `KetQua_${slug}.pdf`,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", scrollX: 0, scrollY: 0 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css"], avoid: [".review-block", "tr", ".report-head"] },
        }).from(clone).save();
      } finally {
        holder.remove();
        window.scrollTo(0, y);
      }
    } catch (e) {
      toast("Không tải được công cụ PDF. Chọn \"Lưu thành PDF\" trong hộp thoại In.", "bad");
      setTimeout(() => window.print(), 400);
    } finally {
      btn.disabled = false; btn.textContent = "Tải kết quả PDF";
    }
  }

  /* =========================================================
     MÀN MỞ ĐẦU
     ========================================================= */
  function showCover() {
    $("#topbar").hidden = true;
    app.replaceChildren(h(`
      <section class="folder" data-tab="Vòng 1 – Đề thi mẫu">
        <div class="stamp-wrap"><span class="stamp">VÒNG 1</span></div>
        <div class="cover">
          <div>
            <div class="chapter-meta">Cuộc thi FPTU Cyber Security</div>
            <h1 class="cover__title">Học sinh nhận thức an toàn thông tin</h1>
            <p class="cover__sub">10 chặng, 10 kiểu thử thách khác nhau: soi hình tìm điểm bất thường, nối cặp, truyện tương tác, mê cung, phá án, ô chữ… Mỗi chặng là một thủ đoạn lừa đảo đang nhắm vào học sinh.</p>
            <ol class="chapter-list">
              ${CHAPTERS.map((c, i) => `<li><b>${i + 1}</b><span><strong>${esc(c.title)}</strong><br><span class="note" style="font-size:17px">${esc(c.type)}</span></span><small>${c.max} điểm</small></li>`).join("")}
            </ol>
          </div>
          <form class="paper" id="teamForm" autocomplete="off">
            <h2 style="font-size:22px">Đăng ký đội thi</h2>
            <div class="field"><label for="fTeam">Tên đội</label><input id="fTeam" required maxlength="40" placeholder="Ví dụ: Lá Chắn Xanh"></div>
            <div class="field"><label for="fSchool">Trường</label><input id="fSchool" required maxlength="80" placeholder="Ví dụ: THPT Lê Quý Đôn"></div>
            <div class="field"><label for="fMembers">Thành viên (4 người)</label><input id="fMembers" maxlength="160" placeholder="Họ tên, cách nhau bằng dấu phẩy"></div>
            <div class="rules">
              <p><b>Thời gian:</b> ${TOTAL_MINUTES} phút cho cả bài.</p>
              <p><b>Làm theo thứ tự tùy ý:</b> đội có thể chuyển qua lại giữa các chặng bất cứ lúc nào và sửa câu trả lời trước khi nộp.</p>
              <p><b>Điểm:</b> chỉ công bố sau khi nộp bài, kèm đáp án chi tiết và bản PDF để tải về.</p>
            </div>
            <button class="btn btn--stamp" type="submit" style="width:100%">Bắt đầu làm bài</button>
          </form>
        </div>
      </section>`));
    $("#teamForm").addEventListener("submit", (e) => {
      e.preventDefault();
      state.team = $("#fTeam").value.trim();
      state.school = $("#fSchool").value.trim();
      state.members = $("#fMembers").value.trim();
      state.startAt = Date.now();
      $("#teamLabel").textContent = `${state.team} – ${state.school}`;
      $("#topbar").hidden = false;
      app.replaceChildren();
      buildExam();
      show(0);
      startTimer();
      sfx.stamp();
    });
  }

  /* ---------------- Khởi động ---------------- */
  $("#soundBtn").addEventListener("click", () => {
    soundOn = !soundOn;
    $("#soundBtn").textContent = soundOn ? "🔊" : "🔇";
    $("#soundBtn").setAttribute("aria-label", soundOn ? "Tắt âm thanh" : "Bật âm thanh");
  });
  $("#submitBtn").addEventListener("click", askSubmit);
  window.addEventListener("beforeunload", (e) => {
    if (state.startAt && !state.submitted) { e.preventDefault(); e.returnValue = ""; }
  });
  showCover();
})();
