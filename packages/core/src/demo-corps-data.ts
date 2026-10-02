// Demo data for three real Vietnamese corporations (Vinamilk, FPT, Vingroup), compiled 2026-10 from their
// official sites, annual reports and press coverage; every item lists the public pages it was taken from.
// Generated from research notes; edit the facts here directly.
import type { CorpDemo } from './demo-corps';

export const CORPS: CorpDemo[] = [
 {
  "key": "vinamilk",
  "name": "Vinamilk",
  "foundedYear": 1976,
  "industryCode": "FNB",
  "employeeSize": "S500_PLUS",
  "provinceCode": "ho-chi-minh",
  "website": "https://www.vinamilk.com.vn",
  "shortDescVi": "Doanh nghiệp sữa Việt Nam thành lập năm 1976, niêm yết trên HOSE từ 2006 (mã VNM). Sở hữu hệ thống trang trại bò sữa và nhà máy trong nước, cùng các công ty con tại Mỹ, Campuchia và Lào.",
  "shortDescEn": "Vietnamese dairy company founded in 1976 and listed on HOSE since 2006 (ticker VNM). It runs dairy farms and factories in Vietnam and has subsidiaries in the United States, Cambodia and Laos.",
  "values": [
   {
    "nameVi": "Chính trực",
    "nameEn": "Integrity",
    "descVi": "Liêm chính và minh bạch trong các hành động và giao dịch.",
    "descEn": "Integrity and transparency in actions and transactions."
   },
   {
    "nameVi": "Tôn trọng",
    "nameEn": "Respect",
    "descVi": "Tự trọng, tôn trọng đồng nghiệp, tôn trọng Công ty và các đối tác.",
    "descEn": "Self-respect, and respect for colleagues, the Company and its partners."
   },
   {
    "nameVi": "Công bằng",
    "nameEn": "Fairness",
    "descVi": "Công bằng với nhân viên, khách hàng, nhà cung cấp và các bên liên quan khác.",
    "descEn": "Fairness towards employees, customers, suppliers and other parties."
   },
   {
    "nameVi": "Đạo đức",
    "nameEn": "Ethics",
    "descVi": "Tôn trọng các tiêu chuẩn đạo đức đã được thiết lập và hành động theo đó.",
    "descEn": "Respecting established ethical standards and acting accordingly."
   },
   {
    "nameVi": "Tuân thủ",
    "nameEn": "Compliance",
    "descVi": "Tuân thủ pháp luật, Bộ Quy tắc Ứng xử và các quy chế, chính sách, quy trình của Công ty.",
    "descEn": "Complying with the law, the Company's Code of Conduct, regulations and procedures."
   }
  ],
  "people": [
   {
    "key": "mai-kieu-lien",
    "fullName": "Mai Kiều Liên",
    "roleVi": "Tổng Giám đốc",
    "roleEn": "Chief Executive Officer",
    "isFounder": false,
    "joined": [
     "1992-12-01",
     "MONTH"
    ],
    "bioVi": "<p>Sinh năm 1953, bà Mai Kiều Liên học ngành chế biến sữa tại Liên Xô và bắt đầu làm kỹ sư tại nhà máy sữa Trường Thọ, tiền thân của Vinamilk. Bà lần lượt giữ các vị trí trưởng ca, phó giám đốc kỹ thuật, phó tổng giám đốc trước khi trở thành Tổng Giám đốc từ tháng 12/1992. Năm 2022, bà được tái bổ nhiệm Tổng Giám đốc và làm Chủ tịch Tiểu ban Chiến lược.</p>",
    "bioEn": "<p>Born in 1953, Mai Kiều Liên studied dairy processing in the Soviet Union and began as an engineer at the Trường Thọ dairy factory, a predecessor of Vinamilk. She rose through roles including shift supervisor, deputy technical director and deputy general director before becoming General Director in December 1992. In 2022 she was reappointed CEO and named chair of the Strategy Committee.</p>",
    "sources": [
     {
      "title": "vneconomy.vn",
      "url": "https://vneconomy.vn/nu-thuyen-truong-ba-thap-ky-cheo-lai-vinamilk.htm"
     },
     {
      "title": "vietnamnews.vn",
      "url": "https://vietnamnews.vn/economy/1176419/vinamilk-announces-new-board-of-directors.html"
     },
     {
      "title": "vinamilk.com.vn",
      "url": "https://www.vinamilk.com.vn/bao-cao-thuong-nien/bao-cao/2024/en/general-information.html"
     }
    ]
   },
   {
    "key": "le-thi-bang-tam",
    "fullName": "Lê Thị Băng Tâm",
    "roleVi": "Nguyên Chủ tịch HĐQT (2015–2022)",
    "roleEn": "Former Chair of the Board (2015–2022)",
    "isFounder": false,
    "joined": [
     "2015-07-25",
     "DAY"
    ],
    "bioVi": "<p>Bà Lê Thị Băng Tâm sinh năm 1947, là tiến sĩ kinh tế, từng là Thứ trưởng Bộ Tài chính (1995–2005) và Chủ tịch Tổng Công ty Đầu tư và Kinh doanh vốn Nhà nước (SCIC) giai đoạn 2006–2008. Từ thành viên HĐQT độc lập, bà được bầu làm Chủ tịch HĐQT Vinamilk từ ngày 25/7/2015 và giữ vị trí này đến tháng 4/2022.</p>",
    "bioEn": "<p>Born in 1947, Lê Thị Băng Tâm holds a doctorate in economics. She served as Vietnam's Deputy Minister of Finance (1995–2005) and chaired the State Capital Investment Corporation (SCIC) from 2006 to 2008. An independent board member, she was elected Chair of Vinamilk's Board on 25 July 2015 and held the post until April 2022.</p>",
    "sources": [
     {
      "title": "brandsvietnam.com",
      "url": "https://www.brandsvietnam.com/7349-Chan-dung-tan-Chu-tich-Vinamilk-Le-Thi-Bang-Tam"
     },
     {
      "title": "vietnamnews.vn",
      "url": "https://vietnamnews.vn/economy/1176419/vinamilk-announces-new-board-of-directors.html"
     }
    ]
   },
   {
    "key": "nguyen-hanh-phuc",
    "fullName": "Nguyễn Hạnh Phúc",
    "roleVi": "Chủ tịch HĐQT",
    "roleEn": "Chairman of the Board",
    "isFounder": false,
    "joined": [
     "2022-04-26",
     "DAY"
    ],
    "bioVi": "<p>Ông Nguyễn Hạnh Phúc sinh năm 1959, từng là Bí thư Tỉnh ủy Thái Bình và giữ các chức vụ Chủ nhiệm Văn phòng Quốc hội, Tổng Thư ký Quốc hội trong giai đoạn 2011–2021. Ngày 26/4/2022, ông được HĐQT Vinamilk nhiệm kỳ 2022–2026 bầu làm Chủ tịch, kế nhiệm bà Lê Thị Băng Tâm.</p>",
    "bioEn": "<p>Born in 1959, Nguyễn Hạnh Phúc was Party Secretary of Thái Bình province and served as Chief of the National Assembly Office and Secretary-General of the National Assembly between 2011 and 2021. On 26 April 2022 Vinamilk's 2022–2026 board elected him Chairman, succeeding Lê Thị Băng Tâm.</p>",
    "sources": [
     {
      "title": "thitruongtaichinhtiente.vn",
      "url": "https://thitruongtaichinhtiente.vn/nguyen-tong-thu-ky-quoc-hoi-nguyen-hanh-phuc-duoc-bau-lam-chu-tich-vinamilk-40393.html"
     },
     {
      "title": "vietnamnews.vn",
      "url": "https://vietnamnews.vn/economy/1176419/vinamilk-announces-new-board-of-directors.html"
     },
     {
      "title": "vinamilk.com.vn",
      "url": "https://www.vinamilk.com.vn/bao-cao-thuong-nien/bao-cao/2024/en/general-information.html"
     }
    ]
   },
   {
    "key": "le-thanh-liem",
    "fullName": "Lê Thành Liêm",
    "roleVi": "Giám đốc Điều hành Tài chính, thành viên HĐQT",
    "roleEn": "Chief Financial Officer, Board member",
    "isFounder": false,
    "joined": null,
    "bioVi": "<p>Ông Lê Thành Liêm là Giám đốc Điều hành Tài chính của Vinamilk và là thành viên HĐQT nhiệm kỳ 2022–2026. Năm 2024, ông đại diện Vinamilk triển khai hệ thống khóa sổ và hợp nhất báo cáo tài chính FPT CFS, phục vụ lộ trình áp dụng chuẩn mực IFRS.</p>",
    "bioEn": "<p>Lê Thành Liêm is Vinamilk's Chief Financial Officer and a member of its 2022–2026 Board of Directors. In 2024 he led Vinamilk's rollout of the FPT CFS financial closing and consolidation system, supporting the company's move toward IFRS reporting.</p>",
    "sources": [
     {
      "title": "vcci.com.vn",
      "url": "https://vcci.com.vn/tin-tuc/vinamilk-va-fpt-hop-tac-chien-luoc-nang-tam-quan-tri-tai-chinh-toan-dien-bang-giai-phap-cong-nghe"
     },
     {
      "title": "vietnamnews.vn",
      "url": "https://vietnamnews.vn/economy/1176419/vinamilk-announces-new-board-of-directors.html"
     }
    ]
   }
  ],
  "products": [
   {
    "key": "ong-tho",
    "kind": "PRODUCT",
    "titleVi": "Sữa đặc Ông Thọ",
    "titleEn": "Ông Thọ condensed milk",
    "summaryVi": "Sản phẩm sữa đặc truyền thống của Vinamilk, gắn với công ty từ năm 1976.",
    "summaryEn": "Vinamilk's traditional condensed milk, associated with the company since 1976.",
    "launch": [
     "1976-01-01",
     "YEAR"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>Theo Bộ Công Thương, sữa đặc Ông Thọ là sản phẩm truyền thống của Vinamilk, ra đời cùng với sự hình thành của công ty từ năm 1976. Sản lượng sữa đặc của Vinamilk được nêu ở mức gần 15.000 tấn mỗi tháng.</p>",
    "descriptionEn": "<p>According to the Ministry of Industry and Trade, Ông Thọ condensed milk is a traditional Vinamilk product dating from the company's formation in 1976. Vinamilk's condensed milk output is cited at nearly 15,000 tonnes a month.</p>",
    "sources": [
     {
      "title": "Bộ Công Thương – Gần nửa thế kỷ xây dựng thương hiệu tại thị trường sữa Việt",
      "url": "https://moit.gov.vn/tu-hao-hang-viet-nam/gan-nua-the-ky-xay-dung-thuong-hieu-tai-thi-truong-sua-viet.html"
     }
    ]
   },
   {
    "key": "dielac",
    "kind": "PRODUCT",
    "titleVi": "Sữa bột Dielac",
    "titleEn": "Dielac powdered milk",
    "summaryVi": "Dòng sữa bột của Vinamilk; công ty giới thiệu sữa bột trẻ em đầu tiên năm 1989.",
    "summaryEn": "Vinamilk's powdered milk line; the company introduced its first infant formula in 1989.",
    "launch": null,
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>Dielac là tên một trong ba nhà máy mà Vinamilk tiếp quản năm 1976 và sau này là một dòng sữa bột của công ty. Theo báo cáo của Vinamilk, công ty giới thiệu sản phẩm sữa bột trẻ em đầu tiên vào năm 1989.</p>",
    "descriptionEn": "<p>Dielac was the name of one of the three factories Vinamilk took over in 1976 and later became one of its powdered milk lines. According to Vinamilk, the company introduced its first infant formula in 1989.</p>",
    "sources": [
     {
      "title": "Vinamilk Sustainability Report 2022 – General information",
      "url": "https://www.vinamilk.com.vn/phat-trien-ben-vung/bao-cao/2022/en/general-information.html"
     },
     {
      "title": "Vinamilk Annual Report 2024 – General information",
      "url": "https://www.vinamilk.com.vn/bao-cao-thuong-nien/bao-cao/2024/en/general-information.html"
     },
     {
      "title": "VnEconomy – Nữ thuyền trưởng ba thập kỷ chèo lái Vinamilk",
      "url": "https://vneconomy.vn/nu-thuyen-truong-ba-thap-ky-cheo-lai-vinamilk.htm"
     }
    ]
   },
   {
    "key": "organic-milk",
    "kind": "PRODUCT",
    "titleVi": "Sữa tươi Vinamilk Organic",
    "titleEn": "Vinamilk Organic fresh milk",
    "summaryVi": "Sữa tươi 100% organic từ trang trại đạt chuẩn hữu cơ châu Âu tại Đà Lạt, ra mắt tháng 12/2016.",
    "summaryEn": "100% organic fresh milk from an EU-certified organic farm in Đà Lạt, launched in December 2016.",
    "launch": [
     "2016-12-01",
     "MONTH"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>Sữa tươi 100% organic của Vinamilk được đưa ra thị trường vào tháng 12/2016, sử dụng nguyên liệu từ trang trại bò sữa hữu cơ tại Đà Lạt. Trang trại được Control Union (Hà Lan) chứng nhận đạt tiêu chuẩn hữu cơ châu Âu vào tháng 10/2016 và khánh thành ngày 13/3/2017.</p>",
    "descriptionEn": "<p>Vinamilk's 100% organic fresh milk went on sale in December 2016, using milk from its organic dairy farm in Đà Lạt. The farm was certified to EU organic standards by Control Union (Netherlands) in October 2016 and inaugurated on 13 March 2017.</p>",
    "sources": [
     {
      "title": "Tuổi Trẻ – Hành trình sữa tươi organic nâng tầm ngành sữa Việt",
      "url": "https://tuoitre.vn/hanh-trinh-sua-tuoi-organic-nang-tam-nganh-sua-viet-1300121.htm"
     }
    ]
   },
   {
    "key": "green-farm",
    "kind": "PRODUCT",
    "titleVi": "Sữa tươi Vinamilk Green Farm",
    "titleEn": "Vinamilk Green Farm fresh milk",
    "summaryVi": "Dòng sữa tươi ra mắt năm 2021, nguyên liệu từ các trang trại sinh thái Green Farm.",
    "summaryEn": "Fresh milk line launched in 2021, sourced from Green Farm eco-farms.",
    "launch": [
     "2021-01-01",
     "YEAR"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>Green Farm là dòng sữa tươi Vinamilk giới thiệu năm 2021, lấy nguyên liệu từ các trang trại sinh thái tại Thanh Hóa, Quảng Ngãi và Tây Ninh. Sản phẩm có phiên bản có đường và ít đường, dung tích 110 ml và 180 ml.</p>",
    "descriptionEn": "<p>Green Farm is a fresh milk line Vinamilk introduced in 2021, sourced from eco-farms in Thanh Hóa, Quảng Ngãi and Tây Ninh. It comes in sweetened and reduced-sugar versions in 110 ml and 180 ml packs.</p>",
    "sources": [
     {
      "title": "Thị trường Tài chính Tiền tệ – Tìm hiểu “lý lịch” của dòng sữa tươi Green Farm",
      "url": "https://thitruongtaichinhtiente.vn/tim-hieu-ly-lich-cua-dong-sua-tuoi-green-farm-moi-dang-khien-cac-me-to-mo-34550.html"
     }
    ]
   },
   {
    "key": "tay-ninh-farm",
    "kind": "PROJECT",
    "titleVi": "Trang trại bò sữa Vinamilk Tây Ninh",
    "titleEn": "Vinamilk Tây Ninh dairy farm",
    "summaryVi": "Trang trại 685 ha tại huyện Bến Cầu, Tây Ninh, đi vào hoạt động năm 2019.",
    "summaryEn": "A 685-hectare farm in Bến Cầu district, Tây Ninh, operating since 2019.",
    "launch": [
     "2019-01-01",
     "YEAR"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>Trang trại bò sữa Vinamilk Tây Ninh nằm tại xã Long Khánh, huyện Bến Cầu, khánh thành năm 2019. Theo SGGP (2024), trang trại rộng 685 ha, vốn đầu tư 50 triệu USD, quy mô khoảng 8.000 con bò, trong đó khoảng 4.000 con đang cho sữa.</p><p>Trang trại áp dụng các giải pháp như biogas, tái sử dụng nước và tự canh tác nguồn thức ăn cho bò.</p>",
    "descriptionEn": "<p>Vinamilk's Tây Ninh dairy farm is in Long Khánh commune, Bến Cầu district, and was inaugurated in 2019. According to SGGP (2024), it covers 685 ha, cost USD 50 million and holds about 8,000 cattle, around 4,000 of them milking.</p><p>The farm uses biogas, water recycling and on-site feed crops.</p>",
    "sources": [
     {
      "title": "SGGP – Ấn tượng với trang trại bò sữa Vinamilk ở Tây Ninh",
      "url": "https://www.sggp.org.vn/an-tuong-voi-trang-trai-bo-sua-vinamilk-o-tay-ninh-post769314.html"
     },
     {
      "title": "Vinamilk – Báo cáo thường niên (core values, milestones)",
      "url": "https://www.vinamilk.com.vn/static/uploads/bc_thuong_nien/1585291614-e5df6f54f1b460c71648e3b3974c13d41721ed54aaef4e256def7956f8cc7d38.pdf"
     }
    ]
   },
   {
    "key": "quy-sua-vuon-cao",
    "kind": "PROJECT",
    "titleVi": "Quỹ sữa Vươn cao Việt Nam",
    "titleEn": "Vietnam Rise Tall Milk Fund",
    "summaryVi": "Chương trình trao sữa cho trẻ em khó khăn, do Quỹ Bảo trợ trẻ em Việt Nam và Vinamilk khởi xướng năm 2008.",
    "summaryEn": "A milk donation programme for disadvantaged children, launched in 2008 by the Vietnam Child Support Fund and Vinamilk.",
    "launch": [
     "2008-01-01",
     "YEAR"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>Quỹ sữa Vươn cao Việt Nam được thành lập năm 2008 với thông điệp “Để mọi trẻ em đều được uống sữa mỗi ngày”. Theo VOV (tháng 1/2020), sau 12 năm, chương trình đã trao hơn 35 triệu ly sữa, trị giá khoảng 151 tỷ đồng, cho khoảng 441.000 trẻ em.</p>",
    "descriptionEn": "<p>The Vietnam Rise Tall Milk Fund was set up in 2008 with the message \"So that every child can drink milk every day\". According to VOV (January 2020), over 12 years it had donated more than 35 million cups of milk worth about VND 151 billion to around 441,000 children.</p>",
    "sources": [
     {
      "title": "VOV – 12 năm vì sứ mệnh: Để mọi trẻ em đều được uống sữa mỗi ngày",
      "url": "https://vov.vn/kinh-te/doanh-nghiep/12-nam-vi-su-menh-de-moi-tre-em-deu-duoc-uong-sua-moi-ngay-1002584.vov"
     }
    ]
   }
  ],
  "stories": [
   {
    "key": "vinamilk-history",
    "type": "COMPANY",
    "titleVi": "Từ ba nhà máy sữa đến tập đoàn dinh dưỡng",
    "titleEn": "From three dairy factories to a nutrition group",
    "summaryVi": "Hành trình của Vinamilk từ năm 1976, qua cổ phần hóa, niêm yết và mở rộng ra nước ngoài.",
    "summaryEn": "Vinamilk's path since 1976 through equitization, listing and overseas expansion.",
    "date": [
     "1976-08-20",
     "DAY"
    ],
    "contentVi": "<p>Vinamilk lấy ngày 20/8/1976 làm ngày thành lập. Khi đó, Công ty Sữa – Cà phê Miền Nam tiếp quản ba nhà máy sữa Thống Nhất, Trường Thọ và Dielac. Sữa đặc Ông Thọ là một trong những sản phẩm gắn với giai đoạn đầu này.</p><p>Trong thập niên 1980–1990, công ty mở rộng danh mục: năm 1989 giới thiệu sữa bột trẻ em đầu tiên, năm 1991 đưa ra sữa tiệt trùng UHT và sữa chua.</p><p>Năm 2003, Vinamilk được cổ phần hóa thành Công ty Cổ phần Sữa Việt Nam. Ngày 19/01/2006, cổ phiếu VNM được niêm yết trên HOSE; cùng năm công ty thành lập đơn vị chuyên về trang trại bò sữa.</p><p>Từ năm 2010, Vinamilk đầu tư ra nước ngoài: góp vốn vào Miraka (New Zealand) năm 2010, mua 70% Driftwood Dairy (Mỹ) năm 2013 và nâng lên 100% năm 2016, thành lập Angkormilk (Campuchia) năm 2014, đầu tư Lao-Jagro (Lào) năm 2018.</p><p>Theo báo cáo thường niên 2024, Vinamilk có 9.960 nhân viên tại thời điểm 31/12/2024, vận hành 15 trang trại và 16 nhà máy. Năm 2023, công ty công bố bộ nhận diện thương hiệu mới.</p>",
    "contentEn": "<p>Vinamilk dates its founding to 20 August 1976, when the Southern Milk–Coffee Company took over three dairy factories: Thống Nhất, Trường Thọ and Dielac. Ông Thọ condensed milk is among the products associated with this early period.</p><p>In the 1980s and 1990s the company broadened its range, introducing its first infant formula in 1989 and UHT milk and yogurt in 1991.</p><p>In 2003 Vinamilk was equitized as Vietnam Dairy Products Joint Stock Company. On 19 January 2006 its shares were listed on HOSE under the ticker VNM, and that year it set up a unit dedicated to dairy farming.</p><p>From 2010 Vinamilk invested abroad: a stake in Miraka (New Zealand) in 2010, 70% of Driftwood Dairy (USA) in 2013 rising to 100% in 2016, the founding of Angkormilk (Cambodia) in 2014 and an investment in Lao-Jagro (Laos) in 2018.</p><p>According to its 2024 annual report, Vinamilk had 9,960 employees as of 31 December 2024 and operated 15 farms and 16 factories. In 2023 it introduced a new brand identity.</p>",
    "sources": [
     {
      "title": "Vinamilk – Báo cáo thường niên (core values, milestones)",
      "url": "https://www.vinamilk.com.vn/static/uploads/bc_thuong_nien/1585291614-e5df6f54f1b460c71648e3b3974c13d41721ed54aaef4e256def7956f8cc7d38.pdf"
     },
     {
      "title": "Vinamilk Annual Report 2024 – General information",
      "url": "https://www.vinamilk.com.vn/bao-cao-thuong-nien/bao-cao/2024/en/general-information.html"
     },
     {
      "title": "Vinamilk Sustainability Report 2022 – General information",
      "url": "https://www.vinamilk.com.vn/phat-trien-ben-vung/bao-cao/2022/en/general-information.html"
     },
     {
      "title": "Bộ Công Thương – Gần nửa thế kỷ xây dựng thương hiệu tại thị trường sữa Việt",
      "url": "https://moit.gov.vn/tu-hao-hang-viet-nam/gan-nua-the-ky-xay-dung-thuong-hieu-tai-thi-truong-sua-viet.html"
     }
    ]
   },
   {
    "key": "mai-kieu-lien-story",
    "type": "FOUNDER",
    "titleVi": "Bà Mai Kiều Liên và ba thập kỷ điều hành",
    "titleEn": "Mai Kiều Liên and three decades at the helm",
    "summaryVi": "Từ kỹ sư nhà máy Trường Thọ đến Tổng Giám đốc Vinamilk từ năm 1992.",
    "summaryEn": "From engineer at the Trường Thọ factory to Vinamilk CEO since 1992.",
    "date": [
     "1992-12-01",
     "MONTH"
    ],
    "contentVi": "<p>Bà Mai Kiều Liên sinh năm 1953 tại Paris, quê ở Hậu Giang. Sau khi học phổ thông tại Trường Trưng Vương, bà sang Liên Xô học ngành chế biến sữa.</p><p>Bà bắt đầu làm kỹ sư phụ trách sản xuất sữa bột và sữa chua tại nhà máy sữa Trường Thọ, tiền thân của Vinamilk, rồi lần lượt giữ các vị trí trưởng ca, phó giám đốc kỹ thuật và phó tổng giám đốc.</p><p>Tháng 12/1992, bà trở thành Tổng Giám đốc Vinamilk. VnEconomy ghi nhận bà gắn với sự ra đời của các dòng sản phẩm như Dielac và Ngôi sao Phương Nam.</p><p>Bà từng kiêm nhiệm Chủ tịch HĐQT trước khi vị trí này được chuyển cho bà Lê Thị Băng Tâm năm 2015. Năm 2022, bà được tái bổ nhiệm Tổng Giám đốc và làm Chủ tịch Tiểu ban Chiến lược của HĐQT.</p>",
    "contentEn": "<p>Mai Kiều Liên was born in Paris in 1953 to a family from Hậu Giang. After secondary school at Trưng Vương, she studied dairy processing in the Soviet Union.</p><p>She started as an engineer overseeing powdered milk and yogurt production at the Trường Thọ dairy factory, a predecessor of Vinamilk, then became shift supervisor, deputy technical director and deputy general director.</p><p>In December 1992 she became Vinamilk's General Director. VnEconomy credits her with the development of product lines such as Dielac and Ngôi sao Phương Nam.</p><p>She also served as board chair until the role passed to Lê Thị Băng Tâm in 2015. In 2022 she was reappointed CEO and named chair of the board's Strategy Committee.</p>",
    "sources": [
     {
      "title": "VnEconomy – Nữ thuyền trưởng ba thập kỷ chèo lái Vinamilk",
      "url": "https://vneconomy.vn/nu-thuyen-truong-ba-thap-ky-cheo-lai-vinamilk.htm"
     },
     {
      "title": "Brands Vietnam – Chân dung tân Chủ tịch Vinamilk Lê Thị Băng Tâm",
      "url": "https://www.brandsvietnam.com/7349-Chan-dung-tan-Chu-tich-Vinamilk-Le-Thi-Bang-Tam"
     },
     {
      "title": "Viet Nam News – Vinamilk announces new board of directors",
      "url": "https://vietnamnews.vn/economy/1176419/vinamilk-announces-new-board-of-directors.html"
     }
    ]
   },
   {
    "key": "vinamilk-culture",
    "type": "CULTURE",
    "titleVi": "Năm giá trị cốt lõi của Vinamilk",
    "titleEn": "Vinamilk's five core values",
    "summaryVi": "Chính trực, Tôn trọng, Công bằng, Đạo đức, Tuân thủ và các hoạt động cộng đồng như Quỹ sữa Vươn cao Việt Nam.",
    "summaryEn": "Integrity, Respect, Fairness, Ethics and Compliance, and community work such as the Vietnam Rise Tall Milk Fund.",
    "date": [
     "2010-01-01",
     "YEAR"
    ],
    "contentVi": "<p>Vinamilk công bố năm giá trị cốt lõi: Chính trực, Tôn trọng, Công bằng, Đạo đức và Tuân thủ. Theo báo cáo phát triển bền vững 2022, công ty xây dựng và truyền thông bộ giá trị cốt lõi từ năm 2010, và chính thức ban hành “Sáu nguyên tắc văn hóa” vào năm 2016.</p><p>Chính trực được diễn giải là liêm chính, minh bạch trong hành động và giao dịch; Tôn trọng là tự trọng, tôn trọng đồng nghiệp, công ty và đối tác; Công bằng là công bằng với nhân viên, khách hàng, nhà cung cấp và các bên liên quan.</p><p>Đạo đức là tôn trọng các tiêu chuẩn đạo đức đã được thiết lập; Tuân thủ là tuân thủ pháp luật, Bộ Quy tắc Ứng xử và các quy định của công ty.</p><p>Tầm nhìn của Vinamilk là trở thành biểu tượng niềm tin hàng đầu Việt Nam về sản phẩm dinh dưỡng và sức khỏe; sứ mệnh là mang đến cho cộng đồng nguồn dinh dưỡng tốt nhất với sự trân trọng, tình yêu và trách nhiệm.</p><p>Ở hoạt động cộng đồng, từ năm 2008 Vinamilk cùng Quỹ Bảo trợ trẻ em Việt Nam triển khai Quỹ sữa Vươn cao Việt Nam, trao sữa cho trẻ em có hoàn cảnh khó khăn.</p>",
    "contentEn": "<p>Vinamilk states five core values: Integrity, Respect, Fairness, Ethics and Compliance. According to its 2022 sustainability report, the company defined and communicated these values in 2010 and formally launched its \"Six Cultural Principles\" in 2016.</p><p>Integrity means honesty and transparency in actions and transactions; Respect covers self-respect and respect for colleagues, the company and partners; Fairness means fair treatment of employees, customers, suppliers and other parties.</p><p>Ethics means respecting established ethical standards; Compliance means following the law, the Code of Conduct and company rules.</p><p>Vinamilk's vision is to become Vietnam's leading symbol of trust in nutrition and health products, and its mission is to provide the community with the best nutrition with respect, love and responsibility.</p><p>In community work, Vinamilk has run the Vietnam Rise Tall Milk Fund with the Vietnam Child Support Fund since 2008, donating milk to disadvantaged children.</p>",
    "sources": [
     {
      "title": "Vinamilk – Báo cáo thường niên (core values, milestones)",
      "url": "https://www.vinamilk.com.vn/static/uploads/bc_thuong_nien/1585291614-e5df6f54f1b460c71648e3b3974c13d41721ed54aaef4e256def7956f8cc7d38.pdf"
     },
     {
      "title": "Vinamilk Sustainability Report 2022 – General information",
      "url": "https://www.vinamilk.com.vn/phat-trien-ben-vung/bao-cao/2022/en/general-information.html"
     },
     {
      "title": "Vinamilk Annual Report 2024 – General information",
      "url": "https://www.vinamilk.com.vn/bao-cao-thuong-nien/bao-cao/2024/en/general-information.html"
     },
     {
      "title": "VOV – 12 năm vì sứ mệnh: Để mọi trẻ em đều được uống sữa mỗi ngày",
      "url": "https://vov.vn/kinh-te/doanh-nghiep/12-nam-vi-su-menh-de-moi-tre-em-deu-duoc-uong-sua-moi-ngay-1002584.vov"
     }
    ]
   }
  ],
  "events": [
   {
    "type": "FOUNDING",
    "titleVi": "Thành lập Công ty Sữa – Cà phê Miền Nam",
    "titleEn": "Founding of the Southern Milk–Coffee Company",
    "start": [
     "1976-08-20",
     "DAY"
    ],
    "summaryVi": "Ngày 20/8/1976, tiền thân của Vinamilk tiếp quản ba nhà máy sữa Thống Nhất, Trường Thọ và Dielac.",
    "summaryEn": "On 20 August 1976, Vinamilk's predecessor took over three dairy factories: Thống Nhất, Trường Thọ and Dielac.",
    "end": null,
    "contentVi": "<p>Vinamilk lấy ngày 20/8/1976 làm mốc thành lập. Khi đó, Công ty Sữa – Cà phê Miền Nam được hình thành trên cơ sở tiếp quản ba nhà máy sữa Thống Nhất, Trường Thọ và Dielac.</p><p>Sữa đặc Ông Thọ, sản phẩm truyền thống của công ty, ra đời cùng với quá trình hình thành này và tiếp tục được sản xuất đến nay.</p>",
    "contentEn": "<p>Vinamilk dates its founding to 20 August 1976, when the Southern Milk–Coffee Company was formed by taking over three dairy factories: Thống Nhất, Trường Thọ and Dielac.</p><p>Ông Thọ condensed milk, the company's traditional product, dates from this period and remains in production today.</p>",
    "people": [],
    "products": [
     "ong-tho"
    ],
    "values": [],
    "sources": [
     {
      "title": "Vinamilk – Báo cáo thường niên (core values, milestones)",
      "url": "https://www.vinamilk.com.vn/static/uploads/bc_thuong_nien/1585291614-e5df6f54f1b460c71648e3b3974c13d41721ed54aaef4e256def7956f8cc7d38.pdf"
     },
     {
      "title": "Vinamilk Annual Report 2024 – General information",
      "url": "https://www.vinamilk.com.vn/bao-cao-thuong-nien/bao-cao/2024/en/general-information.html"
     },
     {
      "title": "Bộ Công Thương – Gần nửa thế kỷ xây dựng thương hiệu tại thị trường sữa Việt",
      "url": "https://moit.gov.vn/tu-hao-hang-viet-nam/gan-nua-the-ky-xay-dung-thuong-hieu-tai-thi-truong-sua-viet.html"
     }
    ]
   },
   {
    "type": "PRODUCT_LAUNCH",
    "titleVi": "Ra mắt sữa bột trẻ em đầu tiên",
    "titleEn": "First infant formula",
    "start": [
     "1989-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 1989, Vinamilk giới thiệu sản phẩm sữa bột dành cho trẻ em đầu tiên.",
    "summaryEn": "In 1989 Vinamilk introduced its first infant formula product.",
    "end": null,
    "contentVi": "<p>Theo báo cáo của Vinamilk, năm 1989 công ty giới thiệu sản phẩm sữa bột đầu tiên dành cho trẻ em, mở ra ngành hàng dinh dưỡng công thức.</p><p>Dielac sau này trở thành một trong các dòng sản phẩm sữa bột chủ lực của công ty.</p>",
    "contentEn": "<p>According to Vinamilk's reporting, in 1989 the company introduced its first infant formula, opening up its formula nutrition category.</p><p>Dielac later became one of the company's main powdered milk lines.</p>",
    "people": [],
    "products": [
     "dielac"
    ],
    "values": [],
    "sources": [
     {
      "title": "Vinamilk Sustainability Report 2022 – General information",
      "url": "https://www.vinamilk.com.vn/phat-trien-ben-vung/bao-cao/2022/en/general-information.html"
     },
     {
      "title": "VnEconomy – Nữ thuyền trưởng ba thập kỷ chèo lái Vinamilk",
      "url": "https://vneconomy.vn/nu-thuyen-truong-ba-thap-ky-cheo-lai-vinamilk.htm"
     }
    ]
   },
   {
    "type": "PRODUCT_LAUNCH",
    "titleVi": "Ra mắt sữa tiệt trùng UHT và sữa chua",
    "titleEn": "Launch of UHT milk and yogurt",
    "start": [
     "1991-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 1991, Vinamilk đưa ra thị trường sữa tiệt trùng UHT và sữa chua.",
    "summaryEn": "In 1991 Vinamilk brought UHT milk and yogurt to market.",
    "end": null,
    "contentVi": "<p>Năm 1991, Vinamilk bắt đầu sản xuất và đưa ra thị trường sữa tiệt trùng UHT và sữa chua ăn.</p><p>Đây là các ngành hàng tiếp tục giữ vai trò chính trong danh mục sản phẩm của công ty, bên cạnh sữa đặc và sữa bột.</p>",
    "contentEn": "<p>In 1991 Vinamilk began producing and selling UHT milk and spoonable yogurt.</p><p>These categories remain central to the company's portfolio alongside condensed milk and powdered milk.</p>",
    "people": [],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "Vinamilk Sustainability Report 2022 – General information",
      "url": "https://www.vinamilk.com.vn/phat-trien-ben-vung/bao-cao/2022/en/general-information.html"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "Bà Mai Kiều Liên trở thành Tổng Giám đốc",
    "titleEn": "Mai Kiều Liên becomes General Director",
    "start": [
     "1992-12-01",
     "MONTH"
    ],
    "summaryVi": "Tháng 12/1992, bà Mai Kiều Liên được bổ nhiệm Tổng Giám đốc Vinamilk.",
    "summaryEn": "In December 1992, Mai Kiều Liên was appointed General Director of Vinamilk.",
    "end": null,
    "contentVi": "<p>Sau nhiều năm làm việc tại nhà máy sữa Trường Thọ và các vị trí kỹ thuật, quản lý, bà Mai Kiều Liên trở thành Tổng Giám đốc Vinamilk vào tháng 12/1992.</p><p>Bà tiếp tục giữ vị trí này qua các giai đoạn cổ phần hóa, niêm yết và mở rộng quốc tế của công ty.</p>",
    "contentEn": "<p>After years at the Trường Thọ dairy factory in technical and management roles, Mai Kiều Liên became Vinamilk's General Director in December 1992.</p><p>She has held the position through the company's equitization, listing and international expansion.</p>",
    "people": [
     "mai-kieu-lien"
    ],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "VnEconomy – Nữ thuyền trưởng ba thập kỷ chèo lái Vinamilk",
      "url": "https://vneconomy.vn/nu-thuyen-truong-ba-thap-ky-cheo-lai-vinamilk.htm"
     },
     {
      "title": "Vinamilk Annual Report 2024 – General information",
      "url": "https://www.vinamilk.com.vn/bao-cao-thuong-nien/bao-cao/2024/en/general-information.html"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "Cổ phần hóa",
    "titleEn": "Equitization",
    "start": [
     "2003-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 2003, Vinamilk được cổ phần hóa và đổi tên thành Công ty Cổ phần Sữa Việt Nam.",
    "summaryEn": "In 2003 Vinamilk was equitized and renamed Vietnam Dairy Products Joint Stock Company.",
    "end": null,
    "contentVi": "<p>Năm 2003, doanh nghiệp nhà nước được chuyển đổi thành công ty cổ phần và mang tên Công ty Cổ phần Sữa Việt Nam.</p><p>Việc cổ phần hóa tạo tiền đề cho việc niêm yết cổ phiếu trên sàn chứng khoán ba năm sau đó.</p>",
    "contentEn": "<p>In 2003 the state-owned enterprise became a joint stock company named Vietnam Dairy Products Joint Stock Company.</p><p>Equitization paved the way for the company's stock exchange listing three years later.</p>",
    "people": [],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "Vinamilk Annual Report 2024 – General information",
      "url": "https://www.vinamilk.com.vn/bao-cao-thuong-nien/bao-cao/2024/en/general-information.html"
     },
     {
      "title": "Bộ Công Thương – Gần nửa thế kỷ xây dựng thương hiệu tại thị trường sữa Việt",
      "url": "https://moit.gov.vn/tu-hao-hang-viet-nam/gan-nua-the-ky-xay-dung-thuong-hieu-tai-thi-truong-sua-viet.html"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "Niêm yết trên HOSE",
    "titleEn": "Listing on HOSE",
    "start": [
     "2006-01-19",
     "DAY"
    ],
    "summaryVi": "Ngày 19/01/2006, cổ phiếu Vinamilk (VNM) được niêm yết trên Sở Giao dịch Chứng khoán TP.HCM.",
    "summaryEn": "On 19 January 2006, Vinamilk shares (VNM) were listed on the Ho Chi Minh City Stock Exchange.",
    "end": null,
    "contentVi": "<p>Ngày 19/01/2006, Vinamilk niêm yết cổ phiếu trên Sở Giao dịch Chứng khoán TP. Hồ Chí Minh (HOSE) với mã VNM.</p><p>Cùng năm, công ty thành lập Công ty TNHH MTV Bò sữa Việt Nam để phát triển mảng trang trại.</p>",
    "contentEn": "<p>On 19 January 2006 Vinamilk listed on the Ho Chi Minh City Stock Exchange (HOSE) under the ticker VNM.</p><p>The same year it set up Vietnam Dairy Cow One-Member Co., Ltd. to develop its farming operations.</p>",
    "people": [],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "Vinamilk – Báo cáo thường niên (core values, milestones)",
      "url": "https://www.vinamilk.com.vn/static/uploads/bc_thuong_nien/1585291614-e5df6f54f1b460c71648e3b3974c13d41721ed54aaef4e256def7956f8cc7d38.pdf"
     },
     {
      "title": "Vinamilk Annual Report 2024 – General information",
      "url": "https://www.vinamilk.com.vn/bao-cao-thuong-nien/bao-cao/2024/en/general-information.html"
     }
    ]
   },
   {
    "type": "CULTURE_ACTIVITY",
    "titleVi": "Khởi động Quỹ sữa Vươn cao Việt Nam",
    "titleEn": "Launch of the Vietnam Rise Tall Milk Fund",
    "start": [
     "2008-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 2008, Quỹ sữa Vươn cao Việt Nam được Quỹ Bảo trợ trẻ em Việt Nam và Vinamilk khởi xướng.",
    "summaryEn": "In 2008 the Vietnam Rise Tall Milk Fund was launched by the Vietnam Child Support Fund and Vinamilk.",
    "end": null,
    "contentVi": "<p>Quỹ sữa Vươn cao Việt Nam được thành lập năm 2008 bởi Quỹ Bảo trợ trẻ em Việt Nam (thuộc Bộ Lao động – Thương binh và Xã hội) phối hợp cùng Vinamilk, với thông điệp “Để mọi trẻ em đều được uống sữa mỗi ngày”.</p><p>Theo VOV, sau 12 năm hoạt động, quỹ đã trao hơn 35 triệu ly sữa, trị giá khoảng 151 tỷ đồng, cho khoảng 441.000 trẻ em có hoàn cảnh khó khăn.</p>",
    "contentEn": "<p>The Vietnam Rise Tall Milk Fund was set up in 2008 by the Vietnam Child Support Fund (under the Ministry of Labour, Invalids and Social Affairs) together with Vinamilk, with the message \"So that every child can drink milk every day\".</p><p>According to VOV, in its first 12 years the fund donated more than 35 million cups of milk, worth about VND 151 billion, to around 441,000 disadvantaged children.</p>",
    "people": [],
    "products": [
     "quy-sua-vuon-cao"
    ],
    "values": [
     "Tôn trọng"
    ],
    "sources": [
     {
      "title": "VOV – 12 năm vì sứ mệnh: Để mọi trẻ em đều được uống sữa mỗi ngày",
      "url": "https://vov.vn/kinh-te/doanh-nghiep/12-nam-vi-su-menh-de-moi-tre-em-deu-duoc-uong-sua-moi-ngay-1002584.vov"
     }
    ]
   },
   {
    "type": "EXPANSION",
    "titleVi": "Đầu tư vào Driftwood Dairy (Mỹ)",
    "titleEn": "Investment in Driftwood Dairy (USA)",
    "start": [
     "2013-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 2013, Vinamilk sở hữu 70% Driftwood Dairy Holdings tại California; năm 2016 nâng lên 100%.",
    "summaryEn": "In 2013 Vinamilk acquired 70% of Driftwood Dairy Holdings in California, rising to 100% in 2016.",
    "end": [
     "2016-01-01",
     "YEAR"
    ],
    "contentVi": "<p>Năm 2013, Vinamilk nắm 70% cổ phần Driftwood Dairy Holdings Corporation, một doanh nghiệp sữa tại bang California, Hoa Kỳ.</p><p>Đến năm 2016, Vinamilk nâng sở hữu tại Driftwood lên 100%, đưa công ty này trở thành công ty con toàn phần tại Mỹ.</p>",
    "contentEn": "<p>In 2013 Vinamilk took a 70% stake in Driftwood Dairy Holdings Corporation, a dairy business in California, USA.</p><p>In 2016 it raised its holding to 100%, making Driftwood a wholly owned US subsidiary.</p>",
    "people": [],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "Vinamilk Annual Report 2024 – General information",
      "url": "https://www.vinamilk.com.vn/bao-cao-thuong-nien/bao-cao/2024/en/general-information.html"
     },
     {
      "title": "Vinamilk – Báo cáo thường niên (core values, milestones)",
      "url": "https://www.vinamilk.com.vn/static/uploads/bc_thuong_nien/1585291614-e5df6f54f1b460c71648e3b3974c13d41721ed54aaef4e256def7956f8cc7d38.pdf"
     }
    ]
   },
   {
    "type": "EXPANSION",
    "titleVi": "Thành lập Angkormilk tại Campuchia",
    "titleEn": "Establishment of Angkormilk in Cambodia",
    "start": [
     "2014-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 2014, Vinamilk góp 51% vốn thành lập Angkormilk tại Campuchia.",
    "summaryEn": "In 2014 Vinamilk contributed 51% of the capital to establish Angkormilk in Cambodia.",
    "end": null,
    "contentVi": "<p>Năm 2014, Vinamilk góp 51% vốn để thành lập Angkor Dairy Products (Angkormilk) tại Campuchia. Cùng năm, công ty mở văn phòng Vinamilk Europe tại Ba Lan.</p><p>Theo báo cáo thường niên 2024, Angkormilk hiện là công ty con do Vinamilk sở hữu 100%.</p>",
    "contentEn": "<p>In 2014 Vinamilk contributed 51% of the capital to found Angkor Dairy Products (Angkormilk) in Cambodia. The same year it opened Vinamilk Europe in Poland.</p><p>According to the 2024 annual report, Angkormilk is now wholly owned by Vinamilk.</p>",
    "people": [],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "Vinamilk Annual Report 2024 – General information",
      "url": "https://www.vinamilk.com.vn/bao-cao-thuong-nien/bao-cao/2024/en/general-information.html"
     },
     {
      "title": "Vinamilk – Báo cáo thường niên (core values, milestones)",
      "url": "https://www.vinamilk.com.vn/static/uploads/bc_thuong_nien/1585291614-e5df6f54f1b460c71648e3b3974c13d41721ed54aaef4e256def7956f8cc7d38.pdf"
     }
    ]
   },
   {
    "type": "PRODUCT_LAUNCH",
    "titleVi": "Sữa tươi Organic và trang trại hữu cơ Đà Lạt",
    "titleEn": "Organic fresh milk and the Đà Lạt organic farm",
    "start": [
     "2016-12-01",
     "MONTH"
    ],
    "summaryVi": "Tháng 12/2016, Vinamilk ra mắt sữa tươi 100% organic; trang trại hữu cơ Đà Lạt khánh thành ngày 13/3/2017.",
    "summaryEn": "In December 2016 Vinamilk launched 100% organic fresh milk; its Đà Lạt organic farm was inaugurated on 13 March 2017.",
    "end": [
     "2017-03-13",
     "DAY"
    ],
    "contentVi": "<p>Trang trại bò sữa hữu cơ của Vinamilk tại Đà Lạt được khởi công tháng 3/2016 và được Control Union (Hà Lan) chứng nhận đạt tiêu chuẩn hữu cơ châu Âu vào tháng 10/2016.</p><p>Tháng 12/2016, sản phẩm sữa tươi 100% organic được đưa ra thị trường. Trang trại chính thức khánh thành ngày 13/3/2017.</p>",
    "contentEn": "<p>Vinamilk's organic dairy farm in Đà Lạt broke ground in March 2016 and was certified to EU organic standards by Control Union (Netherlands) in October 2016.</p><p>Its 100% organic fresh milk went on sale in December 2016, and the farm was formally inaugurated on 13 March 2017.</p>",
    "people": [],
    "products": [
     "organic-milk"
    ],
    "values": [],
    "sources": [
     {
      "title": "Tuổi Trẻ – Hành trình sữa tươi organic nâng tầm ngành sữa Việt",
      "url": "https://tuoitre.vn/hanh-trinh-sua-tuoi-organic-nang-tam-nganh-sua-viet-1300121.htm"
     }
    ]
   },
   {
    "type": "EXPANSION",
    "titleVi": "Trang trại Tây Ninh và thương vụ GTNFoods",
    "titleEn": "Tây Ninh farm and the GTNFoods deal",
    "start": [
     "2019-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 2019, Vinamilk khánh thành trang trại bò sữa Tây Ninh và nắm 75% GTNFoods, đơn vị sở hữu Mộc Châu Milk.",
    "summaryEn": "In 2019 Vinamilk opened its Tây Ninh dairy farm and took 75% of GTNFoods, owner of Mộc Châu Milk.",
    "end": null,
    "contentVi": "<p>Năm 2019, trang trại bò sữa Vinamilk Tây Ninh tại huyện Bến Cầu đi vào hoạt động. Theo SGGP, trang trại rộng 685 ha, vốn đầu tư 50 triệu USD, quy mô khoảng 8.000 con bò.</p><p>Cũng trong năm 2019, Vinamilk nắm 75% cổ phần GTNFoods, qua đó tham gia vận hành Mộc Châu Milk.</p>",
    "contentEn": "<p>In 2019 Vinamilk's Tây Ninh dairy farm in Bến Cầu district began operating. According to SGGP, it covers 685 ha, represents a USD 50 million investment and holds about 8,000 cattle.</p><p>Also in 2019, Vinamilk acquired 75% of GTNFoods, bringing Mộc Châu Milk under its operations.</p>",
    "people": [],
    "products": [
     "tay-ninh-farm"
    ],
    "values": [],
    "sources": [
     {
      "title": "SGGP – Ấn tượng với trang trại bò sữa Vinamilk ở Tây Ninh",
      "url": "https://www.sggp.org.vn/an-tuong-voi-trang-trai-bo-sua-vinamilk-o-tay-ninh-post769314.html"
     },
     {
      "title": "Vinamilk Annual Report 2024 – General information",
      "url": "https://www.vinamilk.com.vn/bao-cao-thuong-nien/bao-cao/2024/en/general-information.html"
     },
     {
      "title": "Vinamilk – Báo cáo thường niên (core values, milestones)",
      "url": "https://www.vinamilk.com.vn/static/uploads/bc_thuong_nien/1585291614-e5df6f54f1b460c71648e3b3974c13d41721ed54aaef4e256def7956f8cc7d38.pdf"
     }
    ]
   },
   {
    "type": "PRODUCT_LAUNCH",
    "titleVi": "Ra mắt sữa tươi Green Farm",
    "titleEn": "Launch of Green Farm fresh milk",
    "start": [
     "2021-01-01",
     "YEAR"
    ],
    "summaryVi": "Đầu năm 2021, Vinamilk giới thiệu dòng sữa tươi Green Farm từ hệ thống trang trại sinh thái.",
    "summaryEn": "In early 2021 Vinamilk introduced Green Farm fresh milk from its eco-farm system.",
    "end": null,
    "contentVi": "<p>Năm 2021, Vinamilk ra mắt dòng sữa tươi Green Farm, lấy nguyên liệu từ hệ thống trang trại sinh thái tại Thanh Hóa, Quảng Ngãi và Tây Ninh.</p><p>Sản phẩm có các phiên bản có đường và ít đường, đóng gói 110 ml và 180 ml.</p>",
    "contentEn": "<p>In 2021 Vinamilk launched Green Farm fresh milk, sourced from its eco-farms in Thanh Hóa, Quảng Ngãi and Tây Ninh.</p><p>The line comes in sweetened and reduced-sugar versions in 110 ml and 180 ml packs.</p>",
    "people": [],
    "products": [
     "green-farm"
    ],
    "values": [],
    "sources": [
     {
      "title": "Thị trường Tài chính Tiền tệ – Tìm hiểu “lý lịch” của dòng sữa tươi Green Farm",
      "url": "https://thitruongtaichinhtiente.vn/tim-hieu-ly-lich-cua-dong-sua-tuoi-green-farm-moi-dang-khien-cac-me-to-mo-34550.html"
     }
    ]
   },
   {
    "type": "ACHIEVEMENT",
    "titleVi": "Huân chương Độc lập hạng Nhất",
    "titleEn": "First-Class Independence Order",
    "start": [
     "2022-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 2022, Vinamilk được trao Huân chương Độc lập hạng Nhất.",
    "summaryEn": "In 2022 Vinamilk received the First-Class Independence Order.",
    "end": null,
    "contentVi": "<p>Theo báo cáo phát triển bền vững 2022, năm 2022 Vinamilk được trao Huân chương Độc lập hạng Nhất.</p><p>Cũng trong năm này, công ty công bố tham gia các sáng kiến hướng tới mục tiêu Net Zero.</p>",
    "contentEn": "<p>According to its 2022 sustainability report, Vinamilk received the First-Class Independence Order in 2022.</p><p>That year the company also announced its participation in Net Zero initiatives.</p>",
    "people": [],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "Vinamilk Sustainability Report 2022 – General information",
      "url": "https://www.vinamilk.com.vn/phat-trien-ben-vung/bao-cao/2022/en/general-information.html"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "HĐQT nhiệm kỳ 2022–2026",
    "titleEn": "2022–2026 Board of Directors",
    "start": [
     "2022-04-26",
     "DAY"
    ],
    "summaryVi": "Ngày 26/4/2022, ông Nguyễn Hạnh Phúc được bầu làm Chủ tịch HĐQT; bà Mai Kiều Liên tiếp tục là Tổng Giám đốc.",
    "summaryEn": "On 26 April 2022 Nguyễn Hạnh Phúc was elected Chairman; Mai Kiều Liên continued as CEO.",
    "end": null,
    "contentVi": "<p>Ngày 26/4/2022, HĐQT Vinamilk nhiệm kỳ 2022–2026 bầu ông Nguyễn Hạnh Phúc, nguyên Tổng Thư ký Quốc hội, làm Chủ tịch, kế nhiệm bà Lê Thị Băng Tâm.</p><p>Bà Mai Kiều Liên được tái bổ nhiệm Tổng Giám đốc và làm Chủ tịch Tiểu ban Chiến lược.</p>",
    "contentEn": "<p>On 26 April 2022 Vinamilk's 2022–2026 board elected Nguyễn Hạnh Phúc, former Secretary-General of the National Assembly, as Chairman, succeeding Lê Thị Băng Tâm.</p><p>Mai Kiều Liên was reappointed CEO and became chair of the Strategy Committee.</p>",
    "people": [
     "nguyen-hanh-phuc",
     "mai-kieu-lien",
     "le-thi-bang-tam",
     "le-thanh-liem"
    ],
    "products": [],
    "values": [
     "Tuân thủ"
    ],
    "sources": [
     {
      "title": "Thị trường Tài chính Tiền tệ – Nguyên Tổng Thư ký Quốc hội Nguyễn Hạnh Phúc được bầu làm Chủ tịch Vinamilk",
      "url": "https://thitruongtaichinhtiente.vn/nguyen-tong-thu-ky-quoc-hoi-nguyen-hanh-phuc-duoc-bau-lam-chu-tich-vinamilk-40393.html"
     },
     {
      "title": "Viet Nam News – Vinamilk announces new board of directors",
      "url": "https://vietnamnews.vn/economy/1176419/vinamilk-announces-new-board-of-directors.html"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "Công bố nhận diện thương hiệu mới",
    "titleEn": "New brand identity",
    "start": [
     "2023-07-06",
     "DAY"
    ],
    "summaryVi": "Ngày 6/7/2023, Vinamilk công bố bộ nhận diện thương hiệu mới với logo dạng chữ và dòng “Est 1976”.",
    "summaryEn": "On 6 July 2023 Vinamilk unveiled a new brand identity with a wordmark logo carrying \"Est 1976\".",
    "end": null,
    "contentVi": "<p>Ngày 6/7/2023, Vinamilk công bố bộ nhận diện thương hiệu mới. Logo chuyển từ dạng biểu tượng sang dạng chữ viết tay, có hình nụ cười ở chữ “i” và giọt sữa kèm dòng “Est 1976” ở chữ “a”, với hai màu chủ đạo xanh dương và màu kem.</p><p>Bộ nhận diện còn gồm ba phông chữ riêng, hệ thống họa tiết và thư viện hình minh họa lấy cảm hứng từ văn hóa, ẩm thực Việt Nam, và được triển khai trên các kênh từ tháng 7/2023.</p>",
    "contentEn": "<p>On 6 July 2023 Vinamilk unveiled a new brand identity. The logo changed from an emblem to a hand-lettered wordmark, with a smile on the \"i\" and a milk drop with \"Est 1976\" in the \"a\", in vibrant blue and cream.</p><p>The system also includes three custom typefaces, a pattern set and an illustration library inspired by Vietnamese culture and food, rolled out across channels from July 2023.</p>",
    "people": [
     "mai-kieu-lien"
    ],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "VnBusiness – Vinamilk chính thức công bố nhận diện thương hiệu mới",
      "url": "https://vnbusiness.vn/vinamilk-chinh-thuc-cong-bo-nhan-dien-thuong-hieu-moi.html"
     },
     {
      "title": "Vinamilk Annual Report 2024 – General information",
      "url": "https://www.vinamilk.com.vn/bao-cao-thuong-nien/bao-cao/2024/en/general-information.html"
     }
    ]
   }
  ]
 },
 {
  "key": "fpt",
  "name": "FPT",
  "foundedYear": 1988,
  "industryCode": "TECH",
  "employeeSize": "S500_PLUS",
  "provinceCode": "ha-noi",
  "website": "https://fpt.com",
  "shortDescVi": "Tập đoàn công nghệ Việt Nam thành lập ngày 13/9/1988, hoạt động trong công nghệ thông tin, viễn thông và giáo dục. Niêm yết trên HOSE từ 2006 (mã FPT), trụ sở tại Cầu Giấy, Hà Nội.",
  "shortDescEn": "Vietnamese technology group founded on 13 September 1988, working in IT services, telecommunications and education. Listed on HOSE since 2006 (ticker FPT), headquartered in Cầu Giấy, Hanoi.",
  "values": [
   {
    "nameVi": "Tôn trọng",
    "nameEn": "Respect",
    "descVi": "Tôn trọng sự khác biệt của mỗi cá nhân, không phân biệt vị trí, cấp bậc.",
    "descEn": "Embracing individual differences regardless of position or rank."
   },
   {
    "nameVi": "Đổi mới",
    "nameEn": "Innovation",
    "descVi": "Liên tục học hỏi, cải tiến và tạo điều kiện để mọi tài năng phát triển.",
    "descEn": "Continuous learning and improvement, giving every talent room to grow."
   },
   {
    "nameVi": "Đồng đội",
    "nameEn": "Teammate",
    "descVi": "Tinh thần gắn bó như một gia đình, nơi mỗi người được yêu thương, chăm lo và bảo vệ.",
    "descEn": "A family-like sense of unity in which each person is cared for and supported."
   },
   {
    "nameVi": "Chí công",
    "nameEn": "Fairness",
    "descVi": "Mọi quyết định được đưa ra công bằng, không thiên vị cá nhân hay địa vị.",
    "descEn": "Every decision is made fairly, without personal bias or regard to status."
   },
   {
    "nameVi": "Gương mẫu",
    "nameEn": "Exemplarity",
    "descVi": "Người lãnh đạo là tấm gương thể hiện tinh thần và giá trị của FPT.",
    "descEn": "Leaders set an example by embodying FPT's spirit and values."
   },
   {
    "nameVi": "Sáng suốt",
    "nameEn": "Assertiveness",
    "descVi": "Người lãnh đạo có tầm nhìn dài hạn và sự quyết đoán để dẫn dắt tập thể.",
    "descEn": "Leaders bring long-term vision and decisiveness to guide their teams."
   }
  ],
  "people": [
   {
    "key": "truong-gia-binh",
    "fullName": "Trương Gia Bình",
    "roleVi": "Nhà sáng lập, Chủ tịch HĐQT",
    "roleEn": "Founder, Chairman of the Board",
    "isFounder": true,
    "joined": [
     "1988-09-13",
     "DAY"
    ],
    "bioVi": "<p>Ông Trương Gia Bình sinh năm 1956 tại Nghệ An, tốt nghiệp Khoa Cơ – Toán Đại học Tổng hợp Moskva năm 1978 và bảo vệ tiến sĩ tại đây năm 1982. Ông là người đứng đầu nhóm 13 thành viên sáng lập FPT năm 1988 và hiện là Chủ tịch HĐQT. Năm 2013, ông nhận Giải thưởng Nikkei châu Á.</p>",
    "bioEn": "<p>Born in 1956 in Nghệ An, Trương Gia Bình graduated from the Faculty of Mechanics and Mathematics at Moscow State University in 1978 and earned his PhD there in 1982. He led the group of 13 founders who set up FPT in 1988 and is its Chairman. In 2013 he received the Nikkei Asia Prize.</p>",
    "sources": [
     {
      "title": "en.wikipedia.org",
      "url": "https://en.wikipedia.org/wiki/Trương_Gia_Bình"
     },
     {
      "title": "brandsvietnam.com",
      "url": "https://www.brandsvietnam.com/2797-FPT-Hanh-trinh-1-4-the-ky"
     },
     {
      "title": "vietnamnews.vn",
      "url": "https://vietnamnews.vn/economy/1654395/fpt-and-nvidia-ink-mou-to-build-200m-ai-factory.html"
     }
    ]
   },
   {
    "key": "bui-quang-ngoc",
    "fullName": "Bùi Quang Ngọc",
    "roleVi": "Đồng sáng lập, Phó Chủ tịch HĐQT",
    "roleEn": "Co-founder, Vice Chairman of the Board",
    "isFounder": true,
    "joined": [
     "1988-09-13",
     "DAY"
    ],
    "bioVi": "<p>Ông Bùi Quang Ngọc sinh năm 1956, là một trong những người sáng lập FPT cùng ông Trương Gia Bình. Ông giữ chức Tổng Giám đốc FPT từ năm 2013 đến tháng 3/2019; trong giai đoạn 2013–2017, doanh thu FPT tăng từ hơn 27.100 tỷ đồng lên gần 43.300 tỷ đồng. Sau đó ông tiếp tục là Phó Chủ tịch HĐQT.</p>",
    "bioEn": "<p>Born in 1956, Bùi Quang Ngọc is one of FPT's founders alongside Trương Gia Bình. He was FPT's CEO from 2013 to March 2019; between 2013 and 2017 revenue grew from over VND 27.1 trillion to nearly VND 43.3 trillion. He then remained Vice Chairman of the Board.</p>",
    "sources": [
     {
      "title": "vnexpress.net",
      "url": "https://vnexpress.net/fpt-co-tong-giam-doc-moi-3891725.html"
     },
     {
      "title": "doanhnhan.baophapluat.vn",
      "url": "https://doanhnhan.baophapluat.vn/ong-nguyen-van-khoa-tro-thanh-tan-tong-giam-doc-fpt-thay-the-ong-bui-quang-ngoc-15257.html"
     }
    ]
   },
   {
    "key": "do-cao-bao",
    "fullName": "Đỗ Cao Bảo",
    "roleVi": "Đồng sáng lập",
    "roleEn": "Co-founder",
    "isFounder": true,
    "joined": [
     "1988-09-13",
     "DAY"
    ],
    "bioVi": "<p>Ông Đỗ Cao Bảo sinh ngày 18/6/1957, tốt nghiệp ngành Toán – Điều khiển tại Học viện Kỹ thuật Quân sự. Ông là một trong 13 thành viên sáng lập FPT và từng giữ chức Phó Tổng Giám đốc phụ trách kinh doanh.</p>",
    "bioEn": "<p>Born on 18 June 1957, Đỗ Cao Bảo graduated in mathematics and control from the Military Technical Academy. He is one of FPT's 13 founders and has served as Deputy CEO in charge of business operations.</p>",
    "sources": [
     {
      "title": "nhadautu.vn",
      "url": "https://nhadautu.vn/13-dong-sang-lap-fpt-ngay-ay-va-bay-gio-ky-1-d13193.html"
     }
    ]
   },
   {
    "key": "nguyen-van-khoa",
    "fullName": "Nguyễn Văn Khoa",
    "roleVi": "Tổng Giám đốc",
    "roleEn": "Chief Executive Officer",
    "isFounder": false,
    "joined": [
     "1997-01-01",
     "YEAR"
    ],
    "bioVi": "<p>Ông Nguyễn Văn Khoa sinh năm 1977, gia nhập FPT năm 1997 với vị trí nhân viên hỗ trợ kỹ thuật mạng. Ông làm Tổng Giám đốc FPT Telecom từ năm 2012, trở thành Phó Tổng Giám đốc FPT tháng 3/2018 và giữ chức Tổng Giám đốc FPT từ ngày 29/3/2019.</p>",
    "bioEn": "<p>Born in 1977, Nguyễn Văn Khoa joined FPT in 1997 as a network technical support employee. He became CEO of FPT Telecom in 2012, Deputy CEO of FPT in March 2018, and CEO of FPT from 29 March 2019.</p>",
    "sources": [
     {
      "title": "vnexpress.net",
      "url": "https://vnexpress.net/fpt-co-tong-giam-doc-moi-3891725.html"
     },
     {
      "title": "doanhnhan.baophapluat.vn",
      "url": "https://doanhnhan.baophapluat.vn/ong-nguyen-van-khoa-tro-thanh-tan-tong-giam-doc-fpt-thay-the-ong-bui-quang-ngoc-15257.html"
     }
    ]
   }
  ],
  "products": [
   {
    "key": "fpt-software",
    "kind": "PRODUCT",
    "titleVi": "FPT Software",
    "titleEn": "FPT Software",
    "summaryVi": "Công ty dịch vụ phần mềm và chuyển đổi số của FPT, thành lập năm 1999.",
    "summaryEn": "FPT's software and digital transformation services company, founded in 1999.",
    "launch": [
     "1999-01-01",
     "YEAR"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>FPT Software được thành lập năm 1999 dưới dạng trung tâm xuất khẩu phần mềm, mở chi nhánh Nhật Bản năm 2005 và lần lượt có mặt tại Singapore, Mỹ, châu Âu, Hàn Quốc. Công ty vượt 10.000 nhân viên năm 2016 và doanh thu vượt 1 tỷ USD năm 2023.</p>",
    "descriptionEn": "<p>FPT Software was founded in 1999 as a software outsourcing centre, opened a Japan branch in 2005 and expanded to Singapore, the US, Europe and Korea. It passed 10,000 employees in 2016 and USD 1 billion in revenue in 2023.</p>",
    "sources": [
     {
      "title": "FPT Software – History",
      "url": "https://fptsoftware.com/about-us/history"
     },
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     }
    ]
   },
   {
    "key": "fpt-telecom",
    "kind": "PRODUCT",
    "titleVi": "FPT Telecom",
    "titleEn": "FPT Telecom",
    "summaryVi": "Nhà cung cấp Internet và viễn thông, tiền thân là Trung tâm FOX thành lập ngày 31/1/1997.",
    "summaryEn": "Internet and telecom provider that grew out of FOX, founded on 31 January 1997.",
    "launch": [
     "1997-01-31",
     "DAY"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>FPT Telecom có tiền thân là Trung tâm Dữ liệu trực tuyến FPT (FOX), thành lập ngày 31/1/1997 với mạng Intranet “Trí tuệ Việt Nam”. Công ty cung cấp dịch vụ Internet và truyền hình, với mạng lưới chi nhánh trên cả nước.</p>",
    "descriptionEn": "<p>FPT Telecom grew out of the FPT Online Exchange (FOX), founded on 31 January 1997 with the \"Trí tuệ Việt Nam\" intranet. It provides Internet and television services through branches across the country.</p>",
    "sources": [
     {
      "title": "FPT Telecom – Introduction",
      "url": "https://fpt.vn/en/about-fpt-telecom/introduction.html"
     },
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     }
    ]
   },
   {
    "key": "fpt-university",
    "kind": "PROJECT",
    "titleVi": "Trường Đại học FPT",
    "titleEn": "FPT University",
    "summaryVi": "Trường đại học tư thục do FPT thành lập theo quyết định ngày 8/9/2006.",
    "summaryEn": "Private university founded by FPT under a decision dated 8 September 2006.",
    "launch": [
     "2006-09-08",
     "DAY"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>Trường Đại học FPT được thành lập theo Quyết định 208/2006/QĐ-TTg ngày 8/9/2006 của Thủ tướng, là trường đại học tư thục có tư cách pháp nhân, trụ sở ban đầu tại Hà Nội. Ông Trương Gia Bình làm Chủ tịch Hội đồng quản trị của trường từ năm 2006.</p>",
    "descriptionEn": "<p>FPT University was established by Prime Minister's Decision 208/2006/QĐ-TTg of 8 September 2006 as a private university with its initial seat in Hanoi. Trương Gia Bình has chaired its board since 2006.</p>",
    "sources": [
     {
      "title": "Quyết định 208/2006/QĐ-TTg về việc thành lập Trường Đại học FPT",
      "url": "https://hethongphapluat.com/quyet-dinh-208-2006-qd-ttg-ve-viec-thanh-lap-truong-dai-hoc-fpt-do-thu-tuong-chinh-phu-ban-hanh.html"
     },
     {
      "title": "Wikipedia – Trương Gia Bình",
      "url": "https://en.wikipedia.org/wiki/Trương_Gia_Bình"
     }
    ]
   },
   {
    "key": "fpt-ai",
    "kind": "PRODUCT",
    "titleVi": "FPT.AI",
    "titleEn": "FPT.AI",
    "summaryVi": "Nền tảng trí tuệ nhân tạo của FPT, ra mắt năm 2017.",
    "summaryEn": "FPT's artificial intelligence platform, launched in 2017.",
    "launch": [
     "2017-01-01",
     "YEAR"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>FPT.AI là nền tảng trí tuệ nhân tạo do FPT ra mắt năm 2017. Năm 2018, FPT tiếp tục giới thiệu nền tảng tự động hóa quy trình akaBot.</p>",
    "descriptionEn": "<p>FPT.AI is an artificial intelligence platform FPT launched in 2017. In 2018 FPT followed with the akaBot process automation platform.</p>",
    "sources": [
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     }
    ]
   },
   {
    "key": "fpt-ai-factory",
    "kind": "PROJECT",
    "titleVi": "Nhà máy AI hợp tác với NVIDIA",
    "titleEn": "AI factory with NVIDIA",
    "summaryVi": "Dự án nhà máy AI trị giá 200 triệu USD theo biên bản ghi nhớ FPT – NVIDIA ký ngày 23/4/2024.",
    "summaryEn": "A USD 200 million AI factory project under an FPT–NVIDIA MoU signed on 23 April 2024.",
    "launch": [
     "2024-04-23",
     "DAY"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>Theo biên bản ghi nhớ ký ngày 23/4/2024, FPT và NVIDIA hợp tác xây dựng nhà máy AI trị giá 200 triệu USD, sử dụng GPU NVIDIA H100 Tensor Core và phần mềm NVIDIA AI Enterprise để nghiên cứu, phát triển và triển khai giải pháp AI.</p>",
    "descriptionEn": "<p>Under an MoU signed on 23 April 2024, FPT and NVIDIA agreed to build a USD 200 million AI factory using NVIDIA H100 Tensor Core GPUs and NVIDIA AI Enterprise software for AI research, development and deployment.</p>",
    "sources": [
     {
      "title": "Viet Nam News – FPT and NVIDIA ink MoU to build $200m AI factory",
      "url": "https://vietnamnews.vn/economy/1654395/fpt-and-nvidia-ink-mou-to-build-200m-ai-factory.html"
     }
    ]
   }
  ],
  "stories": [
   {
    "key": "fpt-history",
    "type": "COMPANY",
    "titleVi": "FPT: từ 13 nhà khoa học đến tập đoàn công nghệ",
    "titleEn": "FPT: from 13 scientists to a technology group",
    "summaryVi": "Các giai đoạn phát triển của FPT từ năm 1988 đến 2025.",
    "summaryEn": "FPT's stages of development from 1988 to 2025.",
    "date": [
     "1988-09-13",
     "DAY"
    ],
    "contentVi": "<p>FPT được thành lập ngày 13/9/1988 với tên Công ty Công nghệ Thực phẩm, do 13 thành viên sáng lập, phần lớn là các nhà khoa học. Năm 1990, công ty đổi tên thành Công ty Phát triển Đầu tư Công nghệ và chọn công nghệ thông tin làm lĩnh vực cốt lõi.</p><p>Trong thập niên 1990, FPT trở thành đối tác đầu tiên của IBM tại Việt Nam (1994) và là một trong bốn nhà cung cấp dịch vụ Internet đầu tiên được cấp phép (1997). Năm 1999, FPT chọn hướng toàn cầu hóa với xuất khẩu phần mềm làm trọng tâm.</p><p>Năm 2006, FPT niêm yết trên HOSE (13/12/2006) và thành lập Trường Đại học FPT (8/9/2006). Các năm tiếp theo, công ty mở rộng sang bán lẻ, thương mại điện tử và các hợp đồng CNTT lớn trong nước.</p><p>Từ năm 2014, FPT đẩy mạnh M&amp;A quốc tế, bắt đầu với RWE IT Slovakia, sau đó là Intellinet (2018) và nhiều thương vụ năm 2023. Năm 2022, doanh thu dịch vụ CNTT nước ngoài vượt 1 tỷ USD.</p><p>Từ năm 2024, FPT tập trung vào AI và hạ tầng điện toán, với biên bản ghi nhớ xây dựng nhà máy AI cùng NVIDIA và trung tâm dữ liệu FPT Fornix HCM02 khánh thành năm 2025.</p>",
    "contentEn": "<p>FPT was established on 13 September 1988 as the Food Processing Technology Company by 13 founders, most of them scientists. In 1990 it was renamed the Corporation for Technology Development and Investment and chose information technology as its core business.</p><p>In the 1990s FPT became IBM's first partner in Vietnam (1994) and one of the first four licensed Internet service providers (1997). In 1999 it chose globalization, with software outsourcing as its focus.</p><p>In 2006 FPT listed on HOSE (13 December 2006) and founded FPT University (8 September 2006). In the following years it expanded into retail, e-commerce and large domestic IT contracts.</p><p>From 2014 FPT pursued international M&amp;A, starting with RWE IT Slovakia, followed by Intellinet (2018) and several deals in 2023. In 2022 its overseas IT services revenue passed USD 1 billion.</p><p>Since 2024 FPT has concentrated on AI and computing infrastructure, including an MoU with NVIDIA for an AI factory and the FPT Fornix HCM02 data centre opened in 2025.</p>",
    "sources": [
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     },
     {
      "title": "Brands Vietnam – FPT: Hành trình 1/4 thế kỷ",
      "url": "https://www.brandsvietnam.com/2797-FPT-Hanh-trinh-1-4-the-ky"
     },
     {
      "title": "Pinetree – Cổ phiếu FPT: thông tin và lịch sử giá",
      "url": "https://pinetree.vn/en/post/20230216/co-phieu-fpt-thong-tin-va-lich-su-gia/"
     },
     {
      "title": "Quyết định 208/2006/QĐ-TTg về việc thành lập Trường Đại học FPT",
      "url": "https://hethongphapluat.com/quyet-dinh-208-2006-qd-ttg-ve-viec-thanh-lap-truong-dai-hoc-fpt-do-thu-tuong-chinh-phu-ban-hanh.html"
     },
     {
      "title": "FPT Software – History",
      "url": "https://fptsoftware.com/about-us/history"
     },
     {
      "title": "Viet Nam News – FPT and NVIDIA ink MoU to build $200m AI factory",
      "url": "https://vietnamnews.vn/economy/1654395/fpt-and-nvidia-ink-mou-to-build-200m-ai-factory.html"
     }
    ]
   },
   {
    "key": "truong-gia-binh-story",
    "type": "FOUNDER",
    "titleVi": "Trương Gia Bình và nhóm sáng lập",
    "titleEn": "Trương Gia Bình and the founding team",
    "summaryVi": "Người đứng đầu nhóm 13 thành viên sáng lập FPT và Chủ tịch HĐQT của tập đoàn.",
    "summaryEn": "The leader of FPT's 13 founders and the group's Chairman.",
    "date": [
     "1988-09-13",
     "DAY"
    ],
    "contentVi": "<p>Ông Trương Gia Bình sinh năm 1956 tại Nghệ An. Ông tốt nghiệp Khoa Cơ – Toán Đại học Tổng hợp Moskva năm 1978 và nhận bằng tiến sĩ tại đây năm 1982.</p><p>Năm 1988, ông cùng 12 cộng sự thành lập FPT. Trong nhóm sáng lập có các ông Bùi Quang Ngọc và Đỗ Cao Bảo, những người sau này giữ các vị trí lãnh đạo chủ chốt của tập đoàn.</p><p>Sau khi FPT cổ phần hóa năm 2002, ông Bình là Chủ tịch kiêm Tổng Giám đốc. Vị trí Tổng Giám đốc sau đó lần lượt được chuyển giao, trong đó ông Bùi Quang Ngọc giữ chức từ 2013 và ông Nguyễn Văn Khoa từ 29/3/2019.</p><p>Ông Bình đồng thời là Chủ tịch Hội đồng quản trị Trường Đại học FPT từ năm 2006 và từng là Chủ tịch Hiệp hội Phần mềm và Dịch vụ CNTT Việt Nam (VINASA). Năm 2013, ông nhận Giải thưởng Nikkei châu Á.</p><p>Tháng 4/2024, với tư cách Chủ tịch FPT, ông ký biên bản ghi nhớ với NVIDIA về việc xây dựng nhà máy AI trị giá 200 triệu USD.</p>",
    "contentEn": "<p>Trương Gia Bình was born in 1956 in Nghệ An. He graduated from the Faculty of Mechanics and Mathematics at Moscow State University in 1978 and received his PhD there in 1982.</p><p>In 1988 he and 12 colleagues founded FPT. The founding group included Bùi Quang Ngọc and Đỗ Cao Bảo, who later held senior leadership roles in the group.</p><p>After FPT's equitization in 2002, Bình served as Chairman and CEO. The CEO role was later handed on, including to Bùi Quang Ngọc from 2013 and to Nguyễn Văn Khoa from 29 March 2019.</p><p>Bình has also chaired FPT University's board since 2006 and has chaired the Vietnam Software and IT Services Association (VINASA). In 2013 he received the Nikkei Asia Prize.</p><p>In April 2024, as FPT Chairman, he signed an MoU with NVIDIA to build a USD 200 million AI factory.</p>",
    "sources": [
     {
      "title": "Wikipedia – Trương Gia Bình",
      "url": "https://en.wikipedia.org/wiki/Trương_Gia_Bình"
     },
     {
      "title": "Brands Vietnam – FPT: Hành trình 1/4 thế kỷ",
      "url": "https://www.brandsvietnam.com/2797-FPT-Hanh-trinh-1-4-the-ky"
     },
     {
      "title": "Nhà Đầu tư – 13 đồng sáng lập FPT: Ngày ấy và bây giờ (Kỳ 1)",
      "url": "https://nhadautu.vn/13-dong-sang-lap-fpt-ngay-ay-va-bay-gio-ky-1-d13193.html"
     },
     {
      "title": "VnExpress – FPT có tổng giám đốc mới",
      "url": "https://vnexpress.net/fpt-co-tong-giam-doc-moi-3891725.html"
     },
     {
      "title": "Viet Nam News – FPT and NVIDIA ink MoU to build $200m AI factory",
      "url": "https://vietnamnews.vn/economy/1654395/fpt-and-nvidia-ink-mou-to-build-200m-ai-factory.html"
     }
    ]
   },
   {
    "key": "fpt-culture",
    "type": "CULTURE",
    "titleVi": "Tôn – Đổi – Đồng – Chí – Gương – Sáng",
    "titleEn": "FPT's six core values",
    "summaryVi": "Sáu giá trị cốt lõi của FPT: Tôn trọng, Đổi mới, Đồng đội, Chí công, Gương mẫu, Sáng suốt.",
    "summaryEn": "FPT's six core values: Respect, Innovation, Teammate, Fairness, Exemplarity and Assertiveness.",
    "date": null,
    "contentVi": "<p>FPT tóm tắt sáu giá trị cốt lõi bằng cụm từ “Tôn – Đổi – Đồng – Chí – Gương – Sáng”, tương ứng với Tôn trọng, Đổi mới, Đồng đội, Chí công, Gương mẫu và Sáng suốt.</p><p>Ba giá trị đầu áp dụng cho mọi người FPT: tôn trọng sự khác biệt của từng cá nhân bất kể vị trí; không ngừng học hỏi và đổi mới; gắn bó như một gia đình, nơi mỗi người được quan tâm và bảo vệ.</p><p>Ba giá trị sau đặt ra cho người lãnh đạo: chí công trong mọi quyết định, gương mẫu thể hiện tinh thần FPT, và sáng suốt với tầm nhìn dài hạn cùng sự quyết đoán.</p><p>Theo một bài viết năm 2024 trên Người Quan Sát, tinh thần đồng đội ở FPT thường được gọi bằng cách xưng hô “Bọn FPT”, và môi trường làm việc khuyến khích nhân viên trẻ thẳng thắn bày tỏ ý kiến.</p>",
    "contentEn": "<p>FPT summarises its six core values with the phrase \"Tôn – Đổi – Đồng – Chí – Gương – Sáng\": Respect, Innovation, Teammate, Fairness, Exemplarity and Assertiveness.</p><p>The first three apply to everyone at FPT: respecting individual differences regardless of position; continuous learning and innovation; and a family-like unity in which each person is cared for and supported.</p><p>The last three are expected of leaders: fairness in every decision, setting an example of the FPT spirit, and long-term vision with decisiveness.</p><p>A 2024 article in Người Quan Sát notes that team spirit at FPT is often expressed through the in-house term \"Bọn FPT\" (\"us FPT folks\"), and that younger employees are encouraged to speak their minds.</p>",
    "sources": [
     {
      "title": "FPT – Core values",
      "url": "https://fpt.com/en/about-us/core-values"
     },
     {
      "title": "Người Quan Sát – Giá trị cốt lõi Tôn – Đổi – Đồng – Chí – Gương – Sáng của FPT",
      "url": "https://nguoiquansat.vn/gia-tri-cot-loi-ton-doi-dong-chi-guong-sang-cua-fpt-duoi-goc-nhin-ba-the-he-153046.html"
     }
    ]
   }
  ],
  "events": [
   {
    "type": "FOUNDING",
    "titleVi": "Thành lập Công ty Công nghệ Thực phẩm",
    "titleEn": "Founding as the Food Processing Technology Company",
    "start": [
     "1988-09-13",
     "DAY"
    ],
    "summaryVi": "Sáng 13/9/1988, FPT được thành lập với tên Công ty Công nghệ Thực phẩm, do 13 thành viên sáng lập.",
    "summaryEn": "On the morning of 13 September 1988, FPT was established as the Food Processing Technology Company by 13 founders.",
    "end": null,
    "contentVi": "<p>FPT chính thức được thành lập lúc 10 giờ sáng ngày 13/9/1988 với tên gọi Công ty Công nghệ Thực phẩm. Nhóm sáng lập gồm 13 người, phần lớn là các nhà khoa học, do ông Trương Gia Bình đứng đầu.</p><p>Theo FPT, công ty khởi đầu mà không có vốn ban đầu.</p>",
    "contentEn": "<p>FPT was formally established at 10 a.m. on 13 September 1988 as the Food Processing Technology Company. Its 13 founders, mostly scientists, were led by Trương Gia Bình.</p><p>According to FPT, the company started with no initial capital.</p>",
    "people": [
     "truong-gia-binh",
     "bui-quang-ngoc",
     "do-cao-bao"
    ],
    "products": [],
    "values": [
     "Đồng đội"
    ],
    "sources": [
     {
      "title": "Brands Vietnam – FPT: Hành trình 1/4 thế kỷ",
      "url": "https://www.brandsvietnam.com/2797-FPT-Hanh-trinh-1-4-the-ky"
     },
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     },
     {
      "title": "Nhà Đầu tư – 13 đồng sáng lập FPT: Ngày ấy và bây giờ (Kỳ 1)",
      "url": "https://nhadautu.vn/13-dong-sang-lap-fpt-ngay-ay-va-bay-gio-ky-1-d13193.html"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "Đổi tên và chọn tin học làm lĩnh vực chính",
    "titleEn": "Renaming and choosing IT as the core business",
    "start": [
     "1990-10-01",
     "MONTH"
    ],
    "summaryVi": "Tháng 10/1990, công ty đổi tên thành Công ty Phát triển Đầu tư Công nghệ, giữ tên viết tắt FPT, và tập trung vào tin học.",
    "summaryEn": "In October 1990 the company was renamed the Corporation for Technology Development and Investment, keeping the FPT acronym, and focused on IT.",
    "end": null,
    "contentVi": "<p>Năm 1990, công ty đổi tên thành Công ty Phát triển Đầu tư Công nghệ nhưng vẫn giữ tên viết tắt FPT.</p><p>FPT xác định công nghệ thông tin là lĩnh vực kinh doanh cốt lõi và ký hợp đồng phần mềm đầu tiên với Vietnam Airlines.</p>",
    "contentEn": "<p>In 1990 the company was renamed the Corporation for Technology Development and Investment while keeping the FPT acronym.</p><p>FPT chose information technology as its core business and signed its first software contract with Vietnam Airlines.</p>",
    "people": [],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     },
     {
      "title": "Brands Vietnam – FPT: Hành trình 1/4 thế kỷ",
      "url": "https://www.brandsvietnam.com/2797-FPT-Hanh-trinh-1-4-the-ky"
     },
     {
      "title": "Pinetree – Cổ phiếu FPT: thông tin và lịch sử giá",
      "url": "https://pinetree.vn/en/post/20230216/co-phieu-fpt-thong-tin-va-lich-su-gia/"
     }
    ]
   },
   {
    "type": "PARTNERSHIP",
    "titleVi": "Đối tác đầu tiên của IBM tại Việt Nam",
    "titleEn": "IBM's first partner in Vietnam",
    "start": [
     "1994-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 1994, FPT trở thành đối tác đầu tiên của IBM tại Việt Nam, mở rộng sang phân phối sản phẩm công nghệ.",
    "summaryEn": "In 1994 FPT became IBM's first partner in Vietnam, moving into technology distribution.",
    "end": null,
    "contentVi": "<p>Năm 1994, FPT tham gia lĩnh vực phân phối và trở thành đối tác đầu tiên của IBM tại Việt Nam.</p><p>Mảng phân phối giúp FPT đưa các sản phẩm công nghệ mới vào thị trường trong nước.</p>",
    "contentEn": "<p>In 1994 FPT entered distribution and became IBM's first partner in Vietnam.</p><p>Distribution allowed FPT to bring new technology products to the domestic market.</p>",
    "people": [],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     }
    ]
   },
   {
    "type": "PRODUCT_LAUNCH",
    "titleVi": "FPT Telecom và dịch vụ Internet",
    "titleEn": "FPT Telecom and Internet services",
    "start": [
     "1997-01-31",
     "DAY"
    ],
    "summaryVi": "Ngày 31/1/1997, Trung tâm Dữ liệu trực tuyến FPT (FOX), tiền thân của FPT Telecom, được thành lập.",
    "summaryEn": "On 31 January 1997, the FPT Online Exchange (FOX), predecessor of FPT Telecom, was founded.",
    "end": null,
    "contentVi": "<p>FPT Telecom có tiền thân là Trung tâm Dữ liệu trực tuyến FPT (FOX), thành lập ngày 31/1/1997 với bốn thành viên và mạng Intranet “Trí tuệ Việt Nam”.</p><p>Cùng năm 1997, FPT là một trong bốn nhà cung cấp dịch vụ Internet đầu tiên được cấp phép tại Việt Nam.</p>",
    "contentEn": "<p>FPT Telecom grew out of the FPT Online Exchange (FOX), founded on 31 January 1997 by four people with the \"Trí tuệ Việt Nam\" intranet.</p><p>Also in 1997, FPT became one of the first four licensed Internet service providers in Vietnam.</p>",
    "people": [],
    "products": [
     "fpt-telecom"
    ],
    "values": [],
    "sources": [
     {
      "title": "FPT Telecom – Introduction",
      "url": "https://fpt.vn/en/about-fpt-telecom/introduction.html"
     },
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     }
    ]
   },
   {
    "type": "EXPANSION",
    "titleVi": "Định hướng toàn cầu hóa và FPT Software",
    "titleEn": "Globalization strategy and FPT Software",
    "start": [
     "1999-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 1999, tại Hội nghị Diên Hồng, FPT chọn toàn cầu hóa với xuất khẩu phần mềm làm trọng tâm; FPT Software ra đời.",
    "summaryEn": "In 1999, at the Diên Hồng Conference, FPT chose globalization with software outsourcing as its focus; FPT Software was born.",
    "end": null,
    "contentVi": "<p>Năm 1999, FPT xác định hướng toàn cầu hóa tại Hội nghị Diên Hồng, lấy xuất khẩu phần mềm làm trọng tâm chiến lược.</p><p>Cùng năm, FPT Software được thành lập dưới hình thức Trung tâm Xuất khẩu Phần mềm, với văn phòng đầu tiên ở Bangalore, Ấn Độ.</p>",
    "contentEn": "<p>In 1999, at the Diên Hồng Conference, FPT set its course toward globalization with software outsourcing as the strategic focus.</p><p>The same year FPT Software was founded as a strategic software outsourcing centre, with its first office in Bangalore, India.</p>",
    "people": [],
    "products": [
     "fpt-software"
    ],
    "values": [
     "Đổi mới"
    ],
    "sources": [
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     },
     {
      "title": "FPT Software – History",
      "url": "https://fptsoftware.com/about-us/history"
     }
    ]
   },
   {
    "type": "EXPANSION",
    "titleVi": "Thành lập pháp nhân tại Nhật Bản",
    "titleEn": "Legal entity in Japan",
    "start": [
     "2005-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 2005, FPT thành lập pháp nhân tại Nhật Bản, chi nhánh nước ngoài đầu tiên của FPT Software.",
    "summaryEn": "In 2005 FPT set up a legal entity in Japan, FPT Software's first overseas branch.",
    "end": null,
    "contentVi": "<p>Năm 2005, FPT mở chi nhánh tại Nhật Bản. Đây là chi nhánh nước ngoài đầu tiên được FPT Software ghi nhận trong lịch sử phát triển.</p><p>Nhật Bản sau đó trở thành một thị trường lớn; theo FPT Software, năm 2024 doanh thu từ thị trường này vượt 500 triệu USD.</p>",
    "contentEn": "<p>In 2005 FPT opened a branch in Japan, listed by FPT Software as its first overseas branch.</p><p>Japan later became a major market; according to FPT Software, revenue there exceeded USD 500 million in 2024.</p>",
    "people": [],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     },
     {
      "title": "FPT Software – History",
      "url": "https://fptsoftware.com/about-us/history"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "Thành lập Trường Đại học FPT",
    "titleEn": "Founding of FPT University",
    "start": [
     "2006-09-08",
     "DAY"
    ],
    "summaryVi": "Ngày 8/9/2006, Thủ tướng ký Quyết định 208/2006/QĐ-TTg thành lập Trường Đại học FPT.",
    "summaryEn": "On 8 September 2006 the Prime Minister signed Decision 208/2006/QĐ-TTg establishing FPT University.",
    "end": null,
    "contentVi": "<p>Ngày 8/9/2006, Thủ tướng Nguyễn Tấn Dũng ký Quyết định 208/2006/QĐ-TTg cho phép thành lập Trường Đại học FPT, một trường đại học tư thục với trụ sở tạm thời tại Hà Nội.</p><p>Ông Trương Gia Bình giữ vai trò Chủ tịch Hội đồng quản trị của trường từ năm 2006.</p>",
    "contentEn": "<p>On 8 September 2006 Prime Minister Nguyễn Tấn Dũng signed Decision 208/2006/QĐ-TTg establishing FPT University, a private university with a temporary seat in Hanoi.</p><p>Trương Gia Bình has chaired the university's board since 2006.</p>",
    "people": [
     "truong-gia-binh"
    ],
    "products": [
     "fpt-university"
    ],
    "values": [],
    "sources": [
     {
      "title": "Quyết định 208/2006/QĐ-TTg về việc thành lập Trường Đại học FPT",
      "url": "https://hethongphapluat.com/quyet-dinh-208-2006-qd-ttg-ve-viec-thanh-lap-truong-dai-hoc-fpt-do-thu-tuong-chinh-phu-ban-hanh.html"
     },
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     },
     {
      "title": "Wikipedia – Trương Gia Bình",
      "url": "https://en.wikipedia.org/wiki/Trương_Gia_Bình"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "Niêm yết cổ phiếu trên HOSE",
    "titleEn": "Listing on HOSE",
    "start": [
     "2006-12-13",
     "DAY"
    ],
    "summaryVi": "Ngày 13/12/2006, cổ phiếu FPT được niêm yết trên Sở Giao dịch Chứng khoán TP.HCM.",
    "summaryEn": "On 13 December 2006 FPT shares were listed on the Ho Chi Minh City Stock Exchange.",
    "end": null,
    "contentVi": "<p>Ngày 13/12/2006, FPT niêm yết cổ phiếu trên Sở Giao dịch Chứng khoán TP. Hồ Chí Minh (HOSE) với mã FPT.</p><p>Năm 2006 cũng là năm FPT thành lập Trường Đại học FPT và củng cố mảng xuất khẩu phần mềm.</p>",
    "contentEn": "<p>On 13 December 2006 FPT listed on the Ho Chi Minh City Stock Exchange (HOSE) under the ticker FPT.</p><p>In the same year FPT founded FPT University and strengthened its software outsourcing business.</p>",
    "people": [],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "Pinetree – Cổ phiếu FPT: thông tin và lịch sử giá",
      "url": "https://pinetree.vn/en/post/20230216/co-phieu-fpt-thong-tin-va-lich-su-gia/"
     },
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     }
    ]
   },
   {
    "type": "EXPANSION",
    "titleVi": "Mua lại RWE IT Slovakia",
    "titleEn": "Acquisition of RWE IT Slovakia",
    "start": [
     "2014-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 2014, FPT mua lại RWE IT Slovakia, thương vụ M&A quốc tế đầu tiên của một doanh nghiệp CNTT Việt Nam.",
    "summaryEn": "In 2014 FPT acquired RWE IT Slovakia, the first international M&A deal by a Vietnamese IT company.",
    "end": null,
    "contentVi": "<p>Năm 2014, FPT mua lại RWE IT Slovakia. FPT Software ghi nhận đây là thương vụ M&amp;A đầu tiên trong ngành CNTT Việt Nam.</p><p>Cùng năm, doanh thu FPT Software vượt 100 triệu USD.</p>",
    "contentEn": "<p>In 2014 FPT acquired RWE IT Slovakia, which FPT Software describes as the first M&amp;A deal in Vietnam's IT industry.</p><p>The same year FPT Software's revenue passed USD 100 million.</p>",
    "people": [],
    "products": [
     "fpt-software"
    ],
    "values": [],
    "sources": [
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     },
     {
      "title": "FPT Software – History",
      "url": "https://fptsoftware.com/about-us/history"
     }
    ]
   },
   {
    "type": "PRODUCT_LAUNCH",
    "titleVi": "Ra mắt FPT.AI",
    "titleEn": "Launch of FPT.AI",
    "start": [
     "2017-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 2017, FPT ra mắt nền tảng trí tuệ nhân tạo FPT.AI.",
    "summaryEn": "In 2017 FPT launched its FPT.AI artificial intelligence platform.",
    "end": null,
    "contentVi": "<p>Năm 2017, FPT giới thiệu nền tảng trí tuệ nhân tạo FPT.AI.</p><p>Cũng trong năm này, FPT trúng thầu hợp đồng CNTT chính phủ lớn nhất tại Myanmar, trị giá 11,3 triệu USD.</p>",
    "contentEn": "<p>In 2017 FPT introduced its FPT.AI artificial intelligence platform.</p><p>That year FPT also won Myanmar's largest government IT contract, worth USD 11.3 million.</p>",
    "people": [],
    "products": [
     "fpt-ai"
    ],
    "values": [
     "Đổi mới"
    ],
    "sources": [
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "Ông Nguyễn Văn Khoa làm Tổng Giám đốc",
    "titleEn": "Nguyễn Văn Khoa becomes CEO",
    "start": [
     "2019-03-29",
     "DAY"
    ],
    "summaryVi": "Từ ngày 29/3/2019, ông Nguyễn Văn Khoa giữ chức Tổng Giám đốc FPT, kế nhiệm ông Bùi Quang Ngọc.",
    "summaryEn": "From 29 March 2019 Nguyễn Văn Khoa became FPT's CEO, succeeding Bùi Quang Ngọc.",
    "end": null,
    "contentVi": "<p>Ông Nguyễn Văn Khoa, sinh năm 1977, gia nhập FPT năm 1997 và từng làm Tổng Giám đốc FPT Telecom từ năm 2012. Từ ngày 29/3/2019, ông trở thành Tổng Giám đốc FPT.</p><p>Ông Bùi Quang Ngọc, Tổng Giám đốc từ năm 2013, tiếp tục giữ vị trí Phó Chủ tịch HĐQT.</p>",
    "contentEn": "<p>Nguyễn Văn Khoa, born in 1977, joined FPT in 1997 and led FPT Telecom from 2012. On 29 March 2019 he became FPT's CEO.</p><p>Bùi Quang Ngọc, CEO since 2013, remained Vice Chairman of the Board.</p>",
    "people": [
     "nguyen-van-khoa",
     "bui-quang-ngoc"
    ],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "VnExpress – FPT có tổng giám đốc mới",
      "url": "https://vnexpress.net/fpt-co-tong-giam-doc-moi-3891725.html"
     },
     {
      "title": "Doanh nhân (Báo Pháp luật) – Ông Nguyễn Văn Khoa trở thành tân Tổng giám đốc FPT",
      "url": "https://doanhnhan.baophapluat.vn/ong-nguyen-van-khoa-tro-thanh-tan-tong-giam-doc-fpt-thay-the-ong-bui-quang-ngoc-15257.html"
     }
    ]
   },
   {
    "type": "ACHIEVEMENT",
    "titleVi": "Doanh thu dịch vụ CNTT nước ngoài vượt 1 tỷ USD",
    "titleEn": "Overseas IT services revenue passes USD 1 billion",
    "start": [
     "2022-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 2022, doanh thu dịch vụ CNTT từ thị trường nước ngoài của FPT vượt mốc 1 tỷ USD.",
    "summaryEn": "In 2022 FPT's overseas IT services revenue exceeded USD 1 billion.",
    "end": null,
    "contentVi": "<p>Theo FPT, năm 2022 doanh thu dịch vụ CNTT tại thị trường nước ngoài vượt 1 tỷ USD, đưa tập đoàn vào nhóm doanh nghiệp tỷ đô ở mảng này.</p><p>Năm 2023, riêng FPT Software ghi nhận doanh thu vượt 1 tỷ USD.</p>",
    "contentEn": "<p>According to FPT, its overseas IT services revenue passed USD 1 billion in 2022.</p><p>In 2023 FPT Software alone reported revenue above USD 1 billion.</p>",
    "people": [],
    "products": [
     "fpt-software"
    ],
    "values": [],
    "sources": [
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     },
     {
      "title": "FPT Software – History",
      "url": "https://fptsoftware.com/about-us/history"
     }
    ]
   },
   {
    "type": "PARTNERSHIP",
    "titleVi": "Hợp tác với NVIDIA xây dựng nhà máy AI",
    "titleEn": "NVIDIA partnership for an AI factory",
    "start": [
     "2024-04-23",
     "DAY"
    ],
    "summaryVi": "Ngày 23/4/2024, FPT và NVIDIA ký biên bản ghi nhớ xây dựng nhà máy AI trị giá 200 triệu USD.",
    "summaryEn": "On 23 April 2024 FPT and NVIDIA signed an MoU to build a USD 200 million AI factory.",
    "end": null,
    "contentVi": "<p>Ngày 23/4/2024, FPT và NVIDIA ký biên bản ghi nhớ hợp tác xây dựng nhà máy AI (AI factory) trị giá 200 triệu USD, sử dụng GPU NVIDIA H100 và phần mềm NVIDIA AI Enterprise.</p><p>Hợp tác ưu tiên các lĩnh vực ô tô, sản xuất và tài chính – ngân hàng – bảo hiểm. Cùng năm, FPT mua lại công ty NAC tại Nhật Bản.</p>",
    "contentEn": "<p>On 23 April 2024 FPT and NVIDIA signed an MoU to build a USD 200 million AI factory using NVIDIA H100 GPUs and NVIDIA AI Enterprise software.</p><p>The partnership prioritises automotive, manufacturing and banking, financial services and insurance. That year FPT also acquired NAC in Japan.</p>",
    "people": [
     "truong-gia-binh"
    ],
    "products": [
     "fpt-ai-factory"
    ],
    "values": [],
    "sources": [
     {
      "title": "Viet Nam News – FPT and NVIDIA ink MoU to build $200m AI factory",
      "url": "https://vietnamnews.vn/economy/1654395/fpt-and-nvidia-ink-mou-to-build-200m-ai-factory.html"
     },
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "Làm chủ công nghệ chiến lược",
    "titleEn": "Mastering strategic technologies",
    "start": [
     "2025-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 2025, FPT thành lập Ban Chỉ đạo Công nghệ chiến lược và khánh thành trung tâm dữ liệu FPT Fornix HCM02.",
    "summaryEn": "In 2025 FPT set up a Strategic Technology Steering Committee and opened the FPT Fornix HCM02 data centre.",
    "end": null,
    "contentVi": "<p>Theo FPT, năm 2025 tập đoàn thành lập Ban Chỉ đạo Công nghệ chiến lược và khánh thành trung tâm dữ liệu FPT Fornix HCM02.</p><p>Cùng năm, FPT Software trở thành Đối tác chính (Principal Partner) của câu lạc bộ Chelsea FC.</p>",
    "contentEn": "<p>According to FPT, in 2025 the group established a Strategic Technology Steering Committee and inaugurated the FPT Fornix HCM02 data centre.</p><p>The same year FPT Software became a Principal Partner of Chelsea FC.</p>",
    "people": [],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "FPT – History",
      "url": "https://fpt.com/en/about-us/history"
     },
     {
      "title": "FPT Software – History",
      "url": "https://fptsoftware.com/about-us/history"
     }
    ]
   }
  ]
 },
 {
  "key": "vingroup",
  "name": "Vingroup",
  "foundedYear": 1993,
  "industryCode": "REAL_ESTATE",
  "employeeSize": "S500_PLUS",
  "provinceCode": "ha-noi",
  "website": "https://vingroup.net",
  "shortDescVi": "Tập đoàn kinh tế tư nhân có nguồn gốc từ Technocom (Ukraine, 1993), hình thành từ việc sáp nhập Vincom và Vinpearl năm 2012. Hoạt động trong bất động sản, du lịch, bán lẻ, y tế, giáo dục và ô tô điện (VinFast).",
  "shortDescEn": "Private conglomerate tracing its roots to Technocom (Ukraine, 1993) and formed by the 2012 merger of Vincom and Vinpearl. It operates in real estate, hospitality, retail, healthcare, education and electric vehicles (VinFast).",
  "values": [
   {
    "nameVi": "Tín",
    "nameEn": "Trust",
    "descVi": "Luôn chuẩn bị đầy đủ năng lực thực thi và nỗ lực hết mình để đảm bảo đúng cam kết.",
    "descEn": "Building the capability to deliver and doing everything possible to keep commitments."
   },
   {
    "nameVi": "Tâm",
    "nameEn": "Heart",
    "descVi": "Luôn thượng tôn pháp luật, duy trì đạo đức, lấy khách hàng làm trung tâm.",
    "descEn": "Upholding the law, maintaining ethics and putting customers at the centre."
   },
   {
    "nameVi": "Trí",
    "nameEn": "Intellect",
    "descVi": "Coi sáng tạo là sức sống, đề cao tinh thần dám nghĩ, dám làm.",
    "descEn": "Treating creativity as a source of vitality and valuing the courage to think and act boldly."
   },
   {
    "nameVi": "Tốc",
    "nameEn": "Speed",
    "descVi": "Đề cao tốc độ và hiệu quả trong từng hành động, ra quyết định và triển khai nhanh.",
    "descEn": "Speed and effectiveness in every action, with fast decisions and implementation."
   },
   {
    "nameVi": "Tinh",
    "nameEn": "Excellence",
    "descVi": "Hướng tới con người tinh hoa, sản phẩm và dịch vụ tinh hoa, cuộc sống tinh hoa.",
    "descEn": "Aiming for excellent people, excellent products and services, and an excellent quality of life."
   },
   {
    "nameVi": "Nhân",
    "nameEn": "Humanity",
    "descVi": "Coi trọng người lao động là tài sản quý giá nhất, tạo dựng sự “nhân hòa”.",
    "descEn": "Valuing employees as the most precious asset and fostering harmony among people."
   }
  ],
  "people": [
   {
    "key": "pham-nhat-vuong",
    "fullName": "Phạm Nhật Vượng",
    "roleVi": "Nhà sáng lập, Chủ tịch HĐQT",
    "roleEn": "Founder, Chairman of the Board",
    "isFounder": true,
    "joined": [
     "1993-01-01",
     "YEAR"
    ],
    "bioVi": "<p>Ông Phạm Nhật Vượng sinh năm 1968 tại Hà Nội, tốt nghiệp Học viện Địa chất Thăm dò Moskva năm 1992. Tại Kharkiv (Ukraine), ông lập Technocom năm 1993, công ty sở hữu thương hiệu mì Mivina. Ông trở về Việt Nam đầu tư Vinpearl và Vincom, nay là Chủ tịch HĐQT Vingroup, và kiêm Tổng Giám đốc VinFast từ tháng 1/2024.</p>",
    "bioEn": "<p>Born in 1968 in Hanoi, Phạm Nhật Vượng graduated from the Moscow Geological Prospecting Institute in 1992. In Kharkiv, Ukraine, he founded Technocom in 1993, the company behind the Mivina noodle brand. He returned to invest in Vinpearl and Vincom, chairs Vingroup, and has also been CEO of VinFast since January 2024.</p>",
    "sources": [
     {
      "title": "en.wikipedia.org",
      "url": "https://en.wikipedia.org/wiki/Pham_Nhat_Vuong"
     },
     {
      "title": "static2.vietstock.vn",
      "url": "https://static2.vietstock.vn/data/HOSE/2012/BCTN/VN/VIC_Baocaothuongnien_2012.pdf"
     },
     {
      "title": "thitruongtaichinhtiente.vn",
      "url": "https://thitruongtaichinhtiente.vn/ong-pham-nhat-vuong-lam-tong-giam-doc-vinfast-thay-ba-le-thi-thu-thuy-55396.html"
     }
    ]
   },
   {
    "key": "le-thi-thu-thuy",
    "fullName": "Lê Thị Thu Thủy",
    "roleVi": "Chủ tịch HĐQT VinFast; nguyên Tổng Giám đốc Vingroup",
    "roleEn": "Chair of VinFast; former Vingroup CEO",
    "isFounder": false,
    "joined": [
     "2012-06-14",
     "DAY"
    ],
    "bioVi": "<p>Bà Lê Thị Thu Thủy được bổ nhiệm Tổng Giám đốc Vingroup ngày 14/6/2012, ngay sau khi tập đoàn hoàn tất sáp nhập Vincom – Vinpearl. Bà sau đó làm Tổng Giám đốc VinFast trong giai đoạn công ty niêm yết trên Nasdaq, và từ tháng 1/2024 chuyển sang vị trí Chủ tịch HĐQT VinFast.</p>",
    "bioEn": "<p>Lê Thị Thu Thủy was appointed CEO of Vingroup on 14 June 2012, shortly after the Vincom–Vinpearl merger was completed. She later served as CEO of VinFast through its Nasdaq listing and in January 2024 became Chair of VinFast's board.</p>",
    "sources": [
     {
      "title": "static2.vietstock.vn",
      "url": "https://static2.vietstock.vn/data/HOSE/2012/BCTN/VN/VIC_Baocaothuongnien_2012.pdf"
     },
     {
      "title": "thitruongtaichinhtiente.vn",
      "url": "https://thitruongtaichinhtiente.vn/ong-pham-nhat-vuong-lam-tong-giam-doc-vinfast-thay-ba-le-thi-thu-thuy-55396.html"
     }
    ]
   },
   {
    "key": "nguyen-viet-quang",
    "fullName": "Nguyễn Việt Quang",
    "roleVi": "Phó Chủ tịch HĐQT kiêm Tổng Giám đốc",
    "roleEn": "Vice Chairman and Chief Executive Officer",
    "isFounder": false,
    "joined": [
     "2017-04-01",
     "MONTH"
    ],
    "bioVi": "<p>Ông Nguyễn Việt Quang sinh năm 1968, có bằng thạc sĩ luật và cử nhân quản trị kinh doanh. Ông từng là Tổng Giám đốc Vinmec, trở thành Phó Chủ tịch Vingroup từ tháng 4/2017 và giữ chức Tổng Giám đốc từ tháng 2/2018; tháng 7/2021, ông được bổ nhiệm lại cho nhiệm kỳ 2021–2026.</p>",
    "bioEn": "<p>Born in 1968, Nguyễn Việt Quang holds a master's degree in law and a bachelor's in business administration. A former CEO of Vinmec, he became Vingroup Vice Chairman in April 2017 and CEO in February 2018, and was reappointed in July 2021 for the 2021–2026 term.</p>",
    "sources": [
     {
      "title": "brandsvietnam.com",
      "url": "https://www.brandsvietnam.com/21782-Vingroup-cong-bo-bo-nhiem-Tong-Giam-doc"
     }
    ]
   },
   {
    "key": "le-mai-lan",
    "fullName": "Lê Mai Lan",
    "roleVi": "Phó Chủ tịch HĐQT, Chủ tịch dự án VinUni",
    "roleEn": "Vice Chairwoman, VinUni project chair",
    "isFounder": false,
    "joined": null,
    "bioVi": "<p>Tiến sĩ Lê Mai Lan là Phó Chủ tịch HĐQT Vingroup và là Chủ tịch dự án Trường Đại học VinUni. Bà phát biểu tại lễ khánh thành VinUni ngày 15/1/2020, nêu mục tiêu đưa trường vào nhóm đại học trẻ hàng đầu thế giới.</p>",
    "bioEn": "<p>Dr. Lê Mai Lan is Vice Chairwoman of Vingroup and chair of the VinUniversity project. She spoke at VinUni's inauguration on 15 January 2020, setting the goal of joining the world's leading young universities.</p>",
    "sources": [
     {
      "title": "tuoitre.vn",
      "url": "https://tuoitre.vn/khanh-thanh-truong-dh-vinuni-dat-muc-tieu-dang-cap-the-gioi-20200116100122899.htm"
     }
    ]
   }
  ],
  "products": [
   {
    "key": "vinpearl-nha-trang",
    "kind": "PROJECT",
    "titleVi": "Vinpearl Nha Trang (đảo Hòn Tre)",
    "titleEn": "Vinpearl Nha Trang (Hòn Tre island)",
    "summaryVi": "Khu nghỉ dưỡng 5 sao đầu tiên của Vinpearl, khai trương năm 2003 trên đảo Hòn Tre.",
    "summaryEn": "Vinpearl's first five-star resort, opened on Hòn Tre island in 2003.",
    "launch": [
     "2003-01-01",
     "YEAR"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>Vinpearl Nha Trang là khu nghỉ dưỡng đầu tiên của Vinpearl, khai trương năm 2003 sau 18 tháng xây dựng trên đảo Hòn Tre. Tuyến cáp treo vượt biển dài 3,2 km ra đảo từng giữ danh hiệu dài nhất thế giới trong 15 năm.</p><p>Theo Viet Nam News (2024), Vinpearl có 45 cơ sở tại 17 tỉnh, thành với hơn 18.500 phòng và biệt thự.</p>",
    "descriptionEn": "<p>Vinpearl Nha Trang was Vinpearl's first resort, opened in 2003 after 18 months of construction on Hòn Tre island. The 3.2 km cable car to the island held the title of the world's longest over-sea cable car for 15 years.</p><p>According to Viet Nam News (2024), Vinpearl operates 45 properties in 17 provinces with more than 18,500 rooms and villas.</p>",
    "sources": [
     {
      "title": "Viet Nam News – From Barren Island to Glittering Oasis: The Vinpearl Story",
      "url": "https://vietnamnews.vn/media-outreach/1661272/from-barren-island-to-glittering-oasis-the-vinpearl-story.html"
     }
    ]
   },
   {
    "key": "vincom-ba-trieu",
    "kind": "PROJECT",
    "titleVi": "Vincom City Towers (Vincom Center Bà Triệu)",
    "titleEn": "Vincom City Towers (Vincom Center Bà Triệu)",
    "summaryVi": "Tổ hợp thương mại – văn phòng tại 191 Bà Triệu, Hà Nội, hoàn thành tháng 11/2004.",
    "summaryEn": "Retail and office complex at 191 Bà Triệu, Hanoi, completed in November 2004.",
    "launch": [
     "2004-11-01",
     "MONTH"
    ],
    "ppStatus": "COMPLETED",
    "descriptionVi": "<p>Vincom City Towers, còn gọi là Vincom Center Bà Triệu, tại 191 Bà Triệu, Hà Nội, là dự án đầu tiên của Vincom, hoàn thành tháng 11/2004. Tổ hợp kết hợp mua sắm, ẩm thực, giải trí và văn phòng, là nền móng cho chuỗi trung tâm thương mại Vincom, đến năm 2024 gồm 88 trung tâm tại 48 tỉnh, thành.</p>",
    "descriptionEn": "<p>Vincom City Towers, also known as Vincom Center Bà Triệu, at 191 Bà Triệu, Hanoi, was Vincom's first project, completed in November 2004. Combining retail, dining, entertainment and offices, it laid the groundwork for the Vincom mall chain, which by 2024 comprised 88 malls in 48 provinces and cities.</p>",
    "sources": [
     {
      "title": "Vingroup – Báo cáo thường niên 2012",
      "url": "https://static2.vietstock.vn/data/HOSE/2012/BCTN/VN/VIC_Baocaothuongnien_2012.pdf"
     },
     {
      "title": "The Leader – Hành trình hai thập kỷ của Vincom",
      "url": "https://theleader.vn/hanh-trinh-ket-noi-kien-tao-gia-tri-ben-vung-suot-hai-thap-ky-cua-vincom-d38082.html"
     }
    ]
   },
   {
    "key": "vinmec",
    "kind": "PRODUCT",
    "titleVi": "Hệ thống Y tế Vinmec",
    "titleEn": "Vinmec Healthcare System",
    "summaryVi": "Hệ thống bệnh viện của Vingroup; bệnh viện đầu tiên hoạt động từ ngày 7/1/2012.",
    "summaryEn": "Vingroup's hospital network; its first hospital opened on 7 January 2012.",
    "launch": [
     "2012-01-07",
     "DAY"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>Vinmec là hệ thống y tế của Vingroup. Bệnh viện Đa khoa Quốc tế Vinmec đầu tiên tại Hà Nội khai trương ngày 7/1/2012, đánh dấu việc tập đoàn tham gia lĩnh vực y tế.</p>",
    "descriptionEn": "<p>Vinmec is Vingroup's healthcare system. Its first hospital, Vinmec International General Hospital in Hanoi, opened on 7 January 2012, marking the group's entry into healthcare.</p>",
    "sources": [
     {
      "title": "Vingroup – Báo cáo thường niên 2012",
      "url": "https://static2.vietstock.vn/data/HOSE/2012/BCTN/VN/VIC_Baocaothuongnien_2012.pdf"
     }
    ]
   },
   {
    "key": "vinschool",
    "kind": "PRODUCT",
    "titleVi": "Hệ thống giáo dục Vinschool",
    "titleEn": "Vinschool education system",
    "summaryVi": "Hệ thống trường liên cấp của Vingroup, công bố năm 2013.",
    "summaryEn": "Vingroup's K-12 school system, announced in 2013.",
    "launch": [
     "2013-01-01",
     "YEAR"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>Vinschool là hệ thống trường liên cấp do Vingroup công bố năm 2013. Theo kế hoạch công bố khi đó, trường mầm non đầu tiên khai giảng tháng 8/2013, nhận trẻ từ 18 tháng đến 5 tuổi.</p>",
    "descriptionEn": "<p>Vinschool is a K-12 school system Vingroup announced in 2013. Under the plan announced at the time, the first kindergarten was to open in August 2013 for children aged 18 months to 5 years.</p>",
    "sources": [
     {
      "title": "VietNamNet – Tháng 8/2013 khai giảng trường mầm non Vinschool",
      "url": "https://vietnamnet.vn/thang-82013-khai-giang-truong-mam-non-vinschool-122002.html"
     }
    ]
   },
   {
    "key": "vinfast",
    "kind": "PRODUCT",
    "titleVi": "VinFast",
    "titleEn": "VinFast",
    "summaryVi": "Hãng ô tô của Vingroup, khởi công nhà máy năm 2017, niêm yết Nasdaq năm 2023.",
    "summaryEn": "Vingroup's carmaker; plant groundbreaking in 2017, Nasdaq listing in 2023.",
    "launch": [
     "2017-09-02",
     "DAY"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>VinFast là hãng sản xuất ô tô của Vingroup. Nhà máy tại Hải Phòng khởi công ngày 2/9/2017 và khánh thành ngày 14/6/2019; hai mẫu xe đầu tiên LUX A2.0 và LUX SA2.0 ra mắt tại Paris Motor Show ngày 2/10/2018.</p><p>Ngày 15/8/2023, VinFast niêm yết trên Nasdaq với mã VFS. Từ tháng 1/2024, ông Phạm Nhật Vượng làm Tổng Giám đốc và bà Lê Thị Thu Thủy làm Chủ tịch HĐQT VinFast.</p>",
    "descriptionEn": "<p>VinFast is Vingroup's carmaker. Its Hải Phòng plant broke ground on 2 September 2017 and was inaugurated on 14 June 2019; its first two models, the LUX A2.0 and LUX SA2.0, debuted at the Paris Motor Show on 2 October 2018.</p><p>On 15 August 2023 VinFast listed on Nasdaq under the ticker VFS. Since January 2024 Phạm Nhật Vượng has been CEO and Lê Thị Thu Thủy Chair of VinFast.</p>",
    "sources": [
     {
      "title": "VietnamPlus – Tập đoàn Vingroup khánh thành nhà máy sản xuất ôtô VinFast",
      "url": "https://www.vietnamplus.vn/tap-doan-vingroup-khanh-thanh-nha-may-san-xuat-oto-vinfast-post574834.vnp"
     },
     {
      "title": "Viet Nam News – VinFast announces cars LUX A2.0 and LUX SA2.0",
      "url": "https://vietnamnews.vn/economy/466887/vinfast-announces-cars-lux-a2-0-and-lux-sa2-0.html"
     },
     {
      "title": "Viet Nam News – VinFast's market value surpasses $85.5 billion after first day on Nasdaq",
      "url": "https://vietnamnews.vn/economy/1582519/vinfast-s-market-value-surpasses-85-5-billion-after-first-day-on-nasdaq.html"
     },
     {
      "title": "Thị trường Tài chính Tiền tệ – Ông Phạm Nhật Vượng làm Tổng giám đốc VinFast thay bà Lê Thị Thu Thủy",
      "url": "https://thitruongtaichinhtiente.vn/ong-pham-nhat-vuong-lam-tong-giam-doc-vinfast-thay-ba-le-thi-thu-thuy-55396.html"
     }
    ]
   },
   {
    "key": "vinuni",
    "kind": "PROJECT",
    "titleVi": "Trường Đại học VinUni",
    "titleEn": "VinUniversity",
    "summaryVi": "Trường đại học do Vingroup đầu tư, khánh thành ngày 15/1/2020, hợp tác với Cornell và Đại học Pennsylvania.",
    "summaryEn": "Vingroup-funded university inaugurated on 15 January 2020, partnered with Cornell and the University of Pennsylvania.",
    "launch": [
     "2020-01-15",
     "DAY"
    ],
    "ppStatus": "ACTIVE",
    "descriptionVi": "<p>Trường Đại học VinUni được khánh thành ngày 15/1/2020 trên khuôn viên 23 ha, tổng mức đầu tư 6.500 tỷ đồng. Trường hợp tác chiến lược với Đại học Cornell và Đại học Pennsylvania, tuyển sinh khóa đầu năm học 2020–2021.</p>",
    "descriptionEn": "<p>VinUniversity was inaugurated on 15 January 2020 on a 23-hectare campus with a total investment of VND 6.5 trillion. It partners with Cornell University and the University of Pennsylvania and admitted its first students in the 2020–2021 academic year.</p>",
    "sources": [
     {
      "title": "Tuổi Trẻ – Khánh thành trường ĐH VinUni: Đặt mục tiêu đẳng cấp thế giới",
      "url": "https://tuoitre.vn/khanh-thanh-truong-dh-vinuni-dat-muc-tieu-dang-cap-the-gioi-20200116100122899.htm"
     }
    ]
   }
  ],
  "stories": [
   {
    "key": "vingroup-history",
    "type": "COMPANY",
    "titleVi": "Từ Technocom đến tập đoàn đa ngành",
    "titleEn": "From Technocom to a diversified group",
    "summaryVi": "Hành trình của Vingroup từ Ukraine năm 1993 đến bất động sản, du lịch, y tế, giáo dục và ô tô điện.",
    "summaryEn": "Vingroup's path from Ukraine in 1993 to real estate, hospitality, healthcare, education and EVs.",
    "date": [
     "1993-01-01",
     "YEAR"
    ],
    "contentVi": "<p>Vingroup xác định tiền thân của mình là Technocom, thành lập năm 1993 tại Ukraine. Đầu những năm 2000, nhóm sáng lập trở về Việt Nam đầu tư vào du lịch và bất động sản với hai thương hiệu Vinpearl và Vincom.</p><p>Vinpearl được thành lập ngày 25/7/2001 và khai trương khu nghỉ dưỡng đầu tiên trên đảo Hòn Tre, Nha Trang năm 2003. Vincom được thành lập ngày 3/5/2002; tổ hợp Vincom City Towers tại 191 Bà Triệu, Hà Nội hoàn thành tháng 11/2004. Cổ phiếu VIC niêm yết trên HOSE ngày 19/9/2007.</p><p>Tháng 1/2012, Vinpearl sáp nhập vào Vincom và công ty đổi tên thành Tập đoàn Vingroup. Cùng năm, bệnh viện Vinmec đầu tiên đi vào hoạt động (7/1/2012); năm 2013, tập đoàn công bố hệ thống trường Vinschool.</p><p>Năm 2017, Vingroup khởi công nhà máy VinFast tại Hải Phòng (2/9/2017). VinFast ra mắt mẫu xe đầu tiên tại Paris Motor Show ngày 2/10/2018, khánh thành nhà máy ngày 14/6/2019 và niêm yết trên Nasdaq ngày 15/8/2023. Tháng 5/2018, Vinhomes niêm yết trên HOSE; ngày 15/1/2020, Trường Đại học VinUni được khánh thành.</p><p>Theo trang giới thiệu của tập đoàn, Vingroup hiện định hướng phát triển theo sáu trụ cột: Công nghệ – Công nghiệp, Thương mại Dịch vụ, Hạ tầng, Năng lượng xanh, Văn hóa và Thiện nguyện Xã hội.</p>",
    "contentEn": "<p>Vingroup traces its origins to Technocom, founded in Ukraine in 1993. In the early 2000s the founders returned to Vietnam to invest in tourism and real estate under the Vinpearl and Vincom brands.</p><p>Vinpearl was founded on 25 July 2001 and opened its first resort on Hòn Tre island, Nha Trang, in 2003. Vincom was founded on 3 May 2002, and Vincom City Towers at 191 Bà Triệu, Hanoi, was completed in November 2004. VIC shares listed on HOSE on 19 September 2007.</p><p>In January 2012 Vinpearl merged into Vincom and the company was renamed Vingroup. The first Vinmec hospital opened that year (7 January 2012), and in 2013 the group announced the Vinschool system.</p><p>In 2017 Vingroup broke ground on the VinFast plant in Hải Phòng (2 September 2017). VinFast showed its first cars at the Paris Motor Show on 2 October 2018, inaugurated its factory on 14 June 2019 and listed on Nasdaq on 15 August 2023. Vinhomes listed on HOSE in May 2018, and VinUniversity was inaugurated on 15 January 2020.</p><p>According to its corporate site, Vingroup now organises its development around six pillars: Technology &amp; Industry, Commerce &amp; Services, Infrastructure, Green Energy, Culture, and Charity &amp; Social Work.</p>",
    "sources": [
     {
      "title": "Vingroup – Giới thiệu",
      "url": "https://vingroup.net/gioi-thieu"
     },
     {
      "title": "Vingroup – Báo cáo thường niên 2012",
      "url": "https://static2.vietstock.vn/data/HOSE/2012/BCTN/VN/VIC_Baocaothuongnien_2012.pdf"
     },
     {
      "title": "Viet Nam News – From Barren Island to Glittering Oasis: The Vinpearl Story",
      "url": "https://vietnamnews.vn/media-outreach/1661272/from-barren-island-to-glittering-oasis-the-vinpearl-story.html"
     },
     {
      "title": "VietNamNet – Tháng 8/2013 khai giảng trường mầm non Vinschool",
      "url": "https://vietnamnet.vn/thang-82013-khai-giang-truong-mam-non-vinschool-122002.html"
     },
     {
      "title": "VietnamPlus – Tập đoàn Vingroup khánh thành nhà máy sản xuất ôtô VinFast",
      "url": "https://www.vietnamplus.vn/tap-doan-vingroup-khanh-thanh-nha-may-san-xuat-oto-vinfast-post574834.vnp"
     },
     {
      "title": "Viet Nam News – VinFast announces cars LUX A2.0 and LUX SA2.0",
      "url": "https://vietnamnews.vn/economy/466887/vinfast-announces-cars-lux-a2-0-and-lux-sa2-0.html"
     },
     {
      "title": "Viet Nam News – VinFast's market value surpasses $85.5 billion after first day on Nasdaq",
      "url": "https://vietnamnews.vn/economy/1582519/vinfast-s-market-value-surpasses-85-5-billion-after-first-day-on-nasdaq.html"
     },
     {
      "title": "VIR – Vinhomes makes historic stock market debut",
      "url": "https://vir.com.vn/vinhomes-makes-historic-stock-market-debut-59274.html"
     },
     {
      "title": "Tuổi Trẻ – Khánh thành trường ĐH VinUni: Đặt mục tiêu đẳng cấp thế giới",
      "url": "https://tuoitre.vn/khanh-thanh-truong-dh-vinuni-dat-muc-tieu-dang-cap-the-gioi-20200116100122899.htm"
     }
    ]
   },
   {
    "key": "pham-nhat-vuong-story",
    "type": "FOUNDER",
    "titleVi": "Phạm Nhật Vượng: từ Kharkiv đến VinFast",
    "titleEn": "Phạm Nhật Vượng: from Kharkiv to VinFast",
    "summaryVi": "Người sáng lập Technocom và Vingroup, Chủ tịch HĐQT tập đoàn, Tổng Giám đốc VinFast từ năm 2024.",
    "summaryEn": "Founder of Technocom and Vingroup, group Chairman, and VinFast CEO since 2024.",
    "date": [
     "1993-01-01",
     "YEAR"
    ],
    "contentVi": "<p>Ông Phạm Nhật Vượng sinh năm 1968 tại Hà Nội. Ông nhận học bổng du học và tốt nghiệp Học viện Địa chất Thăm dò Moskva năm 1992.</p><p>Sống tại Kharkiv (Ukraine) trong những năm 1990, ông lập Technocom năm 1993, công ty sản xuất thực phẩm khô gắn với thương hiệu mì Mivina. Theo Wikipedia, Technocom được bán cho Nestlé năm 2009.</p><p>Từ đầu những năm 2000, ông đầu tư vào Việt Nam qua Vinpearl (thành lập năm 2001) và Vincom (thành lập năm 2002). Sau khi hai công ty sáp nhập năm 2012, ông là Chủ tịch HĐQT Tập đoàn Vingroup.</p><p>Vingroup dưới sự dẫn dắt của ông mở rộng sang y tế (Vinmec), giáo dục (Vinschool, VinUni) và ô tô (VinFast). Từ tháng 1/2024, ông kiêm nhiệm Tổng Giám đốc VinFast, trực tiếp điều hành sản xuất, kinh doanh và chiến lược toàn cầu của hãng.</p>",
    "contentEn": "<p>Phạm Nhật Vượng was born in Hanoi in 1968. He won a scholarship to study abroad and graduated from the Moscow Geological Prospecting Institute in 1992.</p><p>Living in Kharkiv, Ukraine, in the 1990s, he founded Technocom in 1993, a dehydrated food maker associated with the Mivina noodle brand. According to Wikipedia, Technocom was sold to Nestlé in 2009.</p><p>From the early 2000s he invested in Vietnam through Vinpearl (founded 2001) and Vincom (founded 2002). After the two merged in 2012, he became Chairman of Vingroup.</p><p>Under his leadership Vingroup expanded into healthcare (Vinmec), education (Vinschool, VinUni) and cars (VinFast). Since January 2024 he has also been VinFast's CEO, directly running its manufacturing, sales and global strategy.</p>",
    "sources": [
     {
      "title": "Wikipedia – Phạm Nhật Vượng",
      "url": "https://en.wikipedia.org/wiki/Pham_Nhat_Vuong"
     },
     {
      "title": "Vingroup – Báo cáo thường niên 2012",
      "url": "https://static2.vietstock.vn/data/HOSE/2012/BCTN/VN/VIC_Baocaothuongnien_2012.pdf"
     },
     {
      "title": "Thị trường Tài chính Tiền tệ – Ông Phạm Nhật Vượng làm Tổng giám đốc VinFast thay bà Lê Thị Thu Thủy",
      "url": "https://thitruongtaichinhtiente.vn/ong-pham-nhat-vuong-lam-tong-giam-doc-vinfast-thay-ba-le-thi-thu-thuy-55396.html"
     }
    ]
   },
   {
    "key": "vingroup-culture",
    "type": "CULTURE",
    "titleVi": "Tín – Tâm – Trí – Tốc – Tinh – Nhân",
    "titleEn": "Trust, Heart, Intellect, Speed, Excellence, Humanity",
    "summaryVi": "Sáu giá trị cốt lõi và sứ mệnh “Vì một cuộc sống tốt đẹp hơn cho mọi người” của Vingroup.",
    "summaryEn": "Vingroup's six core values and its mission \"For a better life for everyone\".",
    "date": null,
    "contentVi": "<p>Vingroup công bố sứ mệnh “Vì một cuộc sống tốt đẹp hơn cho mọi người” và sáu giá trị cốt lõi: Tín – Tâm – Trí – Tốc – Tinh – Nhân.</p><p>Tín là chuẩn bị đầy đủ năng lực thực thi và nỗ lực để giữ đúng cam kết. Tâm là thượng tôn pháp luật, giữ đạo đức và lấy khách hàng làm trung tâm. Trí là coi sáng tạo là sức sống, đề cao tinh thần dám nghĩ, dám làm.</p><p>Tốc là tốc độ và hiệu quả trong từng hành động. Tinh hướng tới con người, sản phẩm, dịch vụ và cuộc sống tinh hoa. Nhân là coi người lao động là tài sản quý giá nhất và xây dựng sự “nhân hòa”.</p><p>Trên trang giới thiệu đội ngũ nhân sự, Vingroup nêu yêu cầu cán bộ quản lý phải là người thể hiện các giá trị cốt lõi này, cùng với chuyên môn, ý chí phát triển sự nghiệp, tinh thần trách nhiệm và kỷ luật.</p><p>Các giá trị này được thể hiện qua tiến độ của nhiều dự án, chẳng hạn nhà máy VinFast được xây dựng trong khoảng 21 tháng, và qua các đơn vị hoạt động trong y tế, giáo dục như Vinmec, Vinschool và VinUni.</p>",
    "contentEn": "<p>Vingroup states its mission as \"For a better life for everyone\" and its six core values as Tín – Tâm – Trí – Tốc – Tinh – Nhân.</p><p>Trust (Tín) means building the capability to deliver and keeping commitments. Heart (Tâm) means upholding the law, acting ethically and putting customers first. Intellect (Trí) treats creativity as a source of vitality and values the courage to think and act boldly.</p><p>Speed (Tốc) means speed and effectiveness in every action. Excellence (Tinh) aims for excellent people, products, services and quality of life. Humanity (Nhân) treats employees as the most valuable asset and seeks harmony among people.</p><p>On its staff page, Vingroup says managers are expected to embody these values, alongside professional skill, career commitment, responsibility and discipline.</p><p>The values are reflected in the pace of projects such as the VinFast plant, built in about 21 months, and in the group's healthcare and education units Vinmec, Vinschool and VinUni.</p>",
    "sources": [
     {
      "title": "Vingroup – Tầm nhìn, sứ mệnh và giá trị cốt lõi",
      "url": "https://vingroup.net/gioi-thieu/tam-nhin-su-menh-va-gia-tri-cot-loi"
     },
     {
      "title": "Vingroup – Giới thiệu",
      "url": "https://vingroup.net/gioi-thieu"
     },
     {
      "title": "VietnamPlus – Tập đoàn Vingroup khánh thành nhà máy sản xuất ôtô VinFast",
      "url": "https://www.vietnamplus.vn/tap-doan-vingroup-khanh-thanh-nha-may-san-xuat-oto-vinfast-post574834.vnp"
     }
    ]
   }
  ],
  "events": [
   {
    "type": "FOUNDING",
    "titleVi": "Thành lập Technocom tại Ukraine",
    "titleEn": "Founding of Technocom in Ukraine",
    "start": [
     "1993-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 1993, Technocom, tiền thân của Vingroup, được thành lập tại Ukraine.",
    "summaryEn": "In 1993 Technocom, the predecessor of Vingroup, was founded in Ukraine.",
    "end": null,
    "contentVi": "<p>Vingroup xác định tiền thân của tập đoàn là Technocom, thành lập năm 1993 tại Ukraine. Technocom hoạt động trong lĩnh vực thực phẩm khô và gắn với thương hiệu mì Mivina.</p><p>Năm 2023, Vingroup tổ chức kỷ niệm 30 năm thành lập, tính từ mốc này.</p>",
    "contentEn": "<p>Vingroup traces its origins to Technocom, founded in Ukraine in 1993. Technocom made dehydrated food products and is associated with the Mivina noodle brand.</p><p>In 2023 Vingroup marked its 30th anniversary, counting from this date.</p>",
    "people": [
     "pham-nhat-vuong"
    ],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "Vingroup – Giới thiệu",
      "url": "https://vingroup.net/gioi-thieu"
     },
     {
      "title": "Brands Vietnam – Vingroup 30 năm gây dựng và phát triển",
      "url": "https://www.brandsvietnam.com/congdong/topic/334140-vingroup-30-nam-gay-dung-va-phat-trien-de-tu-hao-bay-cao"
     },
     {
      "title": "Wikipedia – Phạm Nhật Vượng",
      "url": "https://en.wikipedia.org/wiki/Pham_Nhat_Vuong"
     }
    ]
   },
   {
    "type": "FOUNDING",
    "titleVi": "Thành lập Vinpearl",
    "titleEn": "Founding of Vinpearl",
    "start": [
     "2001-07-25",
     "DAY"
    ],
    "summaryVi": "Ngày 25/7/2001, công ty tiền thân của Vinpearl được thành lập, khởi đầu mảng du lịch nghỉ dưỡng.",
    "summaryEn": "On 25 July 2001 Vinpearl's predecessor company was founded, starting the group's hospitality business.",
    "end": null,
    "contentVi": "<p>Theo báo cáo thường niên 2012 của Vingroup, Vinpearl được thành lập ngày 25/7/2001. Công ty chọn đảo Hòn Tre ở Nha Trang làm địa điểm phát triển dự án đầu tiên.</p><p>Cổ phiếu Vinpearl (VPL) được niêm yết ngày 31/1/2008.</p>",
    "contentEn": "<p>According to Vingroup's 2012 annual report, Vinpearl was founded on 25 July 2001. The company chose Hòn Tre island in Nha Trang for its first project.</p><p>Vinpearl shares (VPL) were listed on 31 January 2008.</p>",
    "people": [
     "pham-nhat-vuong"
    ],
    "products": [
     "vinpearl-nha-trang"
    ],
    "values": [],
    "sources": [
     {
      "title": "Vingroup – Báo cáo thường niên 2012",
      "url": "https://static2.vietstock.vn/data/HOSE/2012/BCTN/VN/VIC_Baocaothuongnien_2012.pdf"
     },
     {
      "title": "Viet Nam News – From Barren Island to Glittering Oasis: The Vinpearl Story",
      "url": "https://vietnamnews.vn/media-outreach/1661272/from-barren-island-to-glittering-oasis-the-vinpearl-story.html"
     }
    ]
   },
   {
    "type": "FOUNDING",
    "titleVi": "Thành lập Vincom",
    "titleEn": "Founding of Vincom",
    "start": [
     "2002-05-03",
     "DAY"
    ],
    "summaryVi": "Ngày 3/5/2002, Công ty CP Thương mại Tổng hợp Việt Nam (Vincom) được thành lập.",
    "summaryEn": "On 3 May 2002, Vietnam General Trading JSC (Vincom) was founded.",
    "end": null,
    "contentVi": "<p>Vincom được thành lập ngày 3/5/2002 với tên Công ty Cổ phần Thương mại Tổng hợp Việt Nam. Đây là pháp nhân mà sau này, sau khi sáp nhập Vinpearl, được đổi tên thành Tập đoàn Vingroup.</p><p>Dự án đầu tiên của Vincom là tổ hợp Vincom City Towers tại 191 Bà Triệu, Hà Nội.</p>",
    "contentEn": "<p>Vincom was founded on 3 May 2002 as Vietnam General Trading Joint Stock Company. After merging with Vinpearl, this legal entity was renamed Vingroup.</p><p>Vincom's first project was the Vincom City Towers complex at 191 Bà Triệu, Hanoi.</p>",
    "people": [],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "Vingroup – Báo cáo thường niên 2012",
      "url": "https://static2.vietstock.vn/data/HOSE/2012/BCTN/VN/VIC_Baocaothuongnien_2012.pdf"
     }
    ]
   },
   {
    "type": "PRODUCT_LAUNCH",
    "titleVi": "Khai trương Vinpearl Nha Trang",
    "titleEn": "Opening of Vinpearl Nha Trang",
    "start": [
     "2003-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 2003, khu nghỉ dưỡng 5 sao Vinpearl Nha Trang trên đảo Hòn Tre khai trương sau 18 tháng xây dựng.",
    "summaryEn": "In 2003 the five-star Vinpearl Nha Trang resort on Hòn Tre island opened after 18 months of construction.",
    "end": null,
    "contentVi": "<p>Khu nghỉ dưỡng đầu tiên của Vinpearl tại đảo Hòn Tre, Nha Trang, được đưa vào hoạt động năm 2003 sau khoảng 18 tháng xây dựng.</p><p>Tuyến cáp treo vượt biển dài 3,2 km nối đất liền với đảo sau đó giữ danh hiệu cáp treo vượt biển dài nhất thế giới trong 15 năm.</p>",
    "contentEn": "<p>Vinpearl's first resort, on Hòn Tre island in Nha Trang, opened in 2003 after about 18 months of construction.</p><p>The 3.2 km sea-crossing cable car later built to the island held the title of the world's longest over-sea cable car for 15 years.</p>",
    "people": [],
    "products": [
     "vinpearl-nha-trang"
    ],
    "values": [],
    "sources": [
     {
      "title": "Viet Nam News – From Barren Island to Glittering Oasis: The Vinpearl Story",
      "url": "https://vietnamnews.vn/media-outreach/1661272/from-barren-island-to-glittering-oasis-the-vinpearl-story.html"
     }
    ]
   },
   {
    "type": "PRODUCT_LAUNCH",
    "titleVi": "Hoàn thành Vincom City Towers (Vincom Center Bà Triệu)",
    "titleEn": "Completion of Vincom City Towers (Vincom Center Bà Triệu)",
    "start": [
     "2004-11-01",
     "MONTH"
    ],
    "summaryVi": "Tháng 11/2004, tổ hợp Vincom City Towers tại 191 Bà Triệu, Hà Nội hoàn thành, mở đầu chuỗi trung tâm thương mại Vincom.",
    "summaryEn": "In November 2004 Vincom City Towers at 191 Bà Triệu, Hanoi was completed, starting the Vincom mall chain.",
    "end": null,
    "contentVi": "<p>Vincom City Towers tại 191 Bà Triệu, Hà Nội, hoàn thành vào tháng 11/2004. Tổ hợp kết hợp mua sắm, ẩm thực, giải trí và văn phòng.</p><p>Theo The Leader (2024), sau hai thập kỷ, Vincom vận hành 88 trung tâm thương mại tại 48 tỉnh, thành.</p>",
    "contentEn": "<p>Vincom City Towers at 191 Bà Triệu, Hanoi, was completed in November 2004, combining shopping, dining, entertainment and offices.</p><p>According to The Leader (2024), two decades later Vincom operated 88 malls in 48 provinces and cities.</p>",
    "people": [],
    "products": [
     "vincom-ba-trieu"
    ],
    "values": [],
    "sources": [
     {
      "title": "Vingroup – Báo cáo thường niên 2012",
      "url": "https://static2.vietstock.vn/data/HOSE/2012/BCTN/VN/VIC_Baocaothuongnien_2012.pdf"
     },
     {
      "title": "The Leader – Hành trình hai thập kỷ của Vincom",
      "url": "https://theleader.vn/hanh-trinh-ket-noi-kien-tao-gia-tri-ben-vung-suot-hai-thap-ky-cua-vincom-d38082.html"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "Niêm yết cổ phiếu VIC",
    "titleEn": "VIC listing",
    "start": [
     "2007-09-19",
     "DAY"
    ],
    "summaryVi": "Ngày 19/9/2007, cổ phiếu Vincom (mã VIC) được niêm yết trên HOSE.",
    "summaryEn": "On 19 September 2007 Vincom shares (ticker VIC) were listed on HOSE.",
    "end": null,
    "contentVi": "<p>Ngày 19/9/2007, Vincom niêm yết cổ phiếu trên Sở Giao dịch Chứng khoán TP. Hồ Chí Minh với mã VIC.</p><p>Mã VIC được giữ nguyên sau khi Vincom sáp nhập Vinpearl và đổi tên thành Vingroup.</p>",
    "contentEn": "<p>On 19 September 2007 Vincom listed on the Ho Chi Minh City Stock Exchange under the ticker VIC.</p><p>The VIC ticker was retained after Vincom merged with Vinpearl and became Vingroup.</p>",
    "people": [],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "Vingroup – Báo cáo thường niên 2012",
      "url": "https://static2.vietstock.vn/data/HOSE/2012/BCTN/VN/VIC_Baocaothuongnien_2012.pdf"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "Sáp nhập Vincom – Vinpearl thành Vingroup",
    "titleEn": "Vincom–Vinpearl merger forms Vingroup",
    "start": [
     "2011-11-01",
     "MONTH"
    ],
    "summaryVi": "Sáp nhập Vinpearl vào Vincom được thông qua tháng 11/2011, hoàn tất tháng 1/2012; công ty đổi tên thành Tập đoàn Vingroup.",
    "summaryEn": "The Vinpearl–Vincom merger was approved in November 2011 and completed in January 2012; the company became Vingroup.",
    "end": [
     "2012-01-01",
     "MONTH"
    ],
    "contentVi": "<p>Việc sáp nhập Vinpearl vào Vincom được thông qua vào tháng 11/2011 và hoàn tất vào tháng 1/2012. Công ty sau sáp nhập đổi tên thành Tập đoàn Vingroup – Công ty CP và hoạt động như một tập đoàn đa ngành.</p><p>Ngày 14/6/2012, bà Lê Thị Thu Thủy được bổ nhiệm Tổng Giám đốc tập đoàn.</p>",
    "contentEn": "<p>The merger of Vinpearl into Vincom was approved in November 2011 and completed in January 2012. The combined company was renamed Vingroup JSC and began operating as a diversified group.</p><p>On 14 June 2012 Lê Thị Thu Thủy was appointed the group's CEO.</p>",
    "people": [
     "pham-nhat-vuong",
     "le-thi-thu-thuy"
    ],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "Vingroup – Báo cáo thường niên 2012",
      "url": "https://static2.vietstock.vn/data/HOSE/2012/BCTN/VN/VIC_Baocaothuongnien_2012.pdf"
     },
     {
      "title": "Vingroup – Giới thiệu",
      "url": "https://vingroup.net/gioi-thieu"
     }
    ]
   },
   {
    "type": "PRODUCT_LAUNCH",
    "titleVi": "Bệnh viện Vinmec đầu tiên đi vào hoạt động",
    "titleEn": "First Vinmec hospital opens",
    "start": [
     "2012-01-07",
     "DAY"
    ],
    "summaryVi": "Ngày 7/1/2012, Bệnh viện Đa khoa Quốc tế Vinmec chính thức hoạt động tại Hà Nội.",
    "summaryEn": "On 7 January 2012 Vinmec International General Hospital began operating in Hanoi.",
    "end": null,
    "contentVi": "<p>Theo báo cáo thường niên 2012 của Vingroup, Bệnh viện Đa khoa Quốc tế Vinmec khai trương ngày 7/1/2012, đánh dấu việc tập đoàn tham gia lĩnh vực y tế.</p><p>Ông Nguyễn Việt Quang, người sau này là Tổng Giám đốc Vingroup, từng giữ chức Tổng Giám đốc Vinmec.</p>",
    "contentEn": "<p>According to Vingroup's 2012 annual report, Vinmec International General Hospital opened on 7 January 2012, marking the group's entry into healthcare.</p><p>Nguyễn Việt Quang, later Vingroup's CEO, previously served as CEO of Vinmec.</p>",
    "people": [
     "nguyen-viet-quang"
    ],
    "products": [
     "vinmec"
    ],
    "values": [
     "Nhân"
    ],
    "sources": [
     {
      "title": "Vingroup – Báo cáo thường niên 2012",
      "url": "https://static2.vietstock.vn/data/HOSE/2012/BCTN/VN/VIC_Baocaothuongnien_2012.pdf"
     },
     {
      "title": "Brands Vietnam – Vingroup công bố bổ nhiệm Tổng Giám đốc",
      "url": "https://www.brandsvietnam.com/21782-Vingroup-cong-bo-bo-nhiem-Tong-Giam-doc"
     }
    ]
   },
   {
    "type": "EXPANSION",
    "titleVi": "Gia nhập lĩnh vực giáo dục với Vinschool",
    "titleEn": "Entering education with Vinschool",
    "start": [
     "2013-01-01",
     "YEAR"
    ],
    "summaryVi": "Năm 2013, Vingroup công bố gia nhập lĩnh vực giáo dục với hệ thống trường liên cấp Vinschool.",
    "summaryEn": "In 2013 Vingroup announced its entry into education with the Vinschool K-12 system.",
    "end": null,
    "contentVi": "<p>Năm 2013, Vingroup công bố tham gia lĩnh vực giáo dục với hệ thống trường liên cấp Vinschool. Theo VietNamNet (tháng 5/2013), trường mầm non đầu tiên dự kiến khai giảng vào tháng 8/2013.</p><p>Các lớp mầm non ban đầu dành cho trẻ từ 18 tháng đến 5 tuổi, mỗi lớp 18–25 học sinh.</p>",
    "contentEn": "<p>In 2013 Vingroup announced its entry into education with the Vinschool K-12 school system. According to VietNamNet (May 2013), the first kindergarten was scheduled to open in August 2013.</p><p>The initial kindergarten classes were for children aged 18 months to 5 years, with 18–25 pupils per class.</p>",
    "people": [],
    "products": [
     "vinschool"
    ],
    "values": [],
    "sources": [
     {
      "title": "VietNamNet – Tháng 8/2013 khai giảng trường mầm non Vinschool",
      "url": "https://vietnamnet.vn/thang-82013-khai-giang-truong-mam-non-vinschool-122002.html"
     }
    ]
   },
   {
    "type": "PRODUCT_LAUNCH",
    "titleVi": "Khởi công nhà máy VinFast tại Hải Phòng",
    "titleEn": "Groundbreaking of the VinFast plant in Hải Phòng",
    "start": [
     "2017-09-02",
     "DAY"
    ],
    "summaryVi": "Ngày 2/9/2017, Vingroup khởi công tổ hợp nhà máy ô tô VinFast tại KCN Đình Vũ – Cát Hải, Hải Phòng.",
    "summaryEn": "On 2 September 2017 Vingroup broke ground on the VinFast car plant at the Đình Vũ – Cát Hải industrial zone, Hải Phòng.",
    "end": null,
    "contentVi": "<p>Ngày 2/9/2017, Vingroup khởi công tổ hợp sản xuất ô tô VinFast tại Khu kinh tế Đình Vũ – Cát Hải, Hải Phòng, đánh dấu việc tập đoàn bước vào lĩnh vực công nghiệp ô tô.</p><p>Tổ hợp có quy mô 335 ha; công suất thiết kế giai đoạn 1 là 250.000 xe mỗi năm.</p>",
    "contentEn": "<p>On 2 September 2017 Vingroup broke ground on the VinFast automotive complex in the Đình Vũ – Cát Hải economic zone, Hải Phòng, marking its entry into car manufacturing.</p><p>The complex covers 335 ha, with a phase-one design capacity of 250,000 vehicles a year.</p>",
    "people": [
     "pham-nhat-vuong"
    ],
    "products": [
     "vinfast"
    ],
    "values": [
     "Tốc"
    ],
    "sources": [
     {
      "title": "VietnamPlus – Tập đoàn Vingroup khánh thành nhà máy sản xuất ôtô VinFast",
      "url": "https://www.vietnamplus.vn/tap-doan-vingroup-khanh-thanh-nha-may-san-xuat-oto-vinfast-post574834.vnp"
     }
    ]
   },
   {
    "type": "EXPANSION",
    "titleVi": "Niêm yết Vinhomes trên HOSE",
    "titleEn": "Vinhomes listing on HOSE",
    "start": [
     "2018-05-01",
     "MONTH"
    ],
    "summaryVi": "Tháng 5/2018, cổ phiếu Vinhomes (VHM) chào sàn HOSE với 2,68 tỷ cổ phiếu, vốn hóa khoảng 13,5 tỷ USD.",
    "summaryEn": "In May 2018 Vinhomes (VHM) listed on HOSE with 2.68 billion shares and a market value of about USD 13.5 billion.",
    "end": null,
    "contentVi": "<p>Tháng 5/2018, Vinhomes, công ty bất động sản nhà ở thuộc Vingroup, niêm yết 2,68 tỷ cổ phiếu trên HOSE với mã VHM, giá tham chiếu 92.100 đồng.</p><p>Theo VIR, vốn hóa khi chào sàn khoảng 13,5 tỷ USD, đưa Vinhomes thành doanh nghiệp niêm yết lớn thứ hai trên sàn khi đó. Quỹ GIC (Singapore) là nhà đầu tư neo trước IPO.</p>",
    "contentEn": "<p>In May 2018 Vinhomes, Vingroup's residential property arm, listed 2.68 billion shares on HOSE under the ticker VHM at a reference price of VND 92,100.</p><p>According to VIR, its market value at listing was about USD 13.5 billion, making it the exchange's second-largest listed company at the time. Singapore's GIC was the anchor pre-IPO investor.</p>",
    "people": [],
    "products": [],
    "values": [],
    "sources": [
     {
      "title": "VIR – Vinhomes makes historic stock market debut",
      "url": "https://vir.com.vn/vinhomes-makes-historic-stock-market-debut-59274.html"
     }
    ]
   },
   {
    "type": "PRODUCT_LAUNCH",
    "titleVi": "VinFast ra mắt tại Paris Motor Show",
    "titleEn": "VinFast debuts at the Paris Motor Show",
    "start": [
     "2018-10-02",
     "DAY"
    ],
    "summaryVi": "Ngày 2/10/2018, VinFast giới thiệu hai mẫu xe LUX A2.0 và LUX SA2.0 tại Paris Motor Show.",
    "summaryEn": "On 2 October 2018 VinFast unveiled the LUX A2.0 and LUX SA2.0 at the Paris Motor Show.",
    "end": null,
    "contentVi": "<p>Ngày 2/10/2018, VinFast ra mắt hai mẫu xe đầu tiên là sedan LUX A2.0 và SUV LUX SA2.0 tại Paris Motor Show.</p><p>Các mẫu xe được phát triển với sự tham gia của các đối tác như BMW, Bosch, Magna Steyr và Pininfarina.</p>",
    "contentEn": "<p>On 2 October 2018 VinFast unveiled its first two models, the LUX A2.0 sedan and the LUX SA2.0 SUV, at the Paris Motor Show.</p><p>The cars were developed with partners including BMW, Bosch, Magna Steyr and Pininfarina.</p>",
    "people": [],
    "products": [
     "vinfast"
    ],
    "values": [],
    "sources": [
     {
      "title": "Viet Nam News – VinFast announces cars LUX A2.0 and LUX SA2.0",
      "url": "https://vietnamnews.vn/economy/466887/vinfast-announces-cars-lux-a2-0-and-lux-sa2-0.html"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "Khánh thành nhà máy VinFast",
    "titleEn": "Inauguration of the VinFast plant",
    "start": [
     "2019-06-14",
     "DAY"
    ],
    "summaryVi": "Ngày 14/6/2019, nhà máy ô tô VinFast tại Hải Phòng được khánh thành sau 21 tháng xây dựng.",
    "summaryEn": "On 14 June 2019 the VinFast car plant in Hải Phòng was inaugurated after 21 months of construction.",
    "end": null,
    "contentVi": "<p>Ngày 14/6/2019, Vingroup khánh thành nhà máy sản xuất ô tô VinFast tại Hải Phòng, khoảng 21 tháng sau ngày khởi công, và chính thức bước vào giai đoạn sản xuất hàng loạt.</p><p>Nhà máy có diện tích hơn 500.000 m² trong tổ hợp 335 ha.</p>",
    "contentEn": "<p>On 14 June 2019 Vingroup inaugurated the VinFast car plant in Hải Phòng, about 21 months after groundbreaking, and began mass production.</p><p>The plant covers more than 500,000 m² within the 335-hectare complex.</p>",
    "people": [],
    "products": [
     "vinfast"
    ],
    "values": [
     "Tốc"
    ],
    "sources": [
     {
      "title": "VietnamPlus – Tập đoàn Vingroup khánh thành nhà máy sản xuất ôtô VinFast",
      "url": "https://www.vietnamplus.vn/tap-doan-vingroup-khanh-thanh-nha-may-san-xuat-oto-vinfast-post574834.vnp"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "Khánh thành Trường Đại học VinUni",
    "titleEn": "Inauguration of VinUniversity",
    "start": [
     "2020-01-15",
     "DAY"
    ],
    "summaryVi": "Ngày 15/1/2020, Trường Đại học VinUni được khánh thành, hợp tác chiến lược với Cornell và Đại học Pennsylvania.",
    "summaryEn": "On 15 January 2020 VinUniversity was inaugurated, with Cornell and the University of Pennsylvania as strategic partners.",
    "end": null,
    "contentVi": "<p>Ngày 15/1/2020, Vingroup khánh thành Trường Đại học VinUni trên khuôn viên 23 ha, với tổng mức đầu tư 6.500 tỷ đồng, gồm 3.500 tỷ cho cơ sở vật chất và 3.000 tỷ cho học bổng và vận hành trong 10 năm.</p><p>Trường hợp tác chiến lược với Đại học Cornell và Đại học Pennsylvania, tuyển sinh khóa đầu tiên năm học 2020–2021.</p>",
    "contentEn": "<p>On 15 January 2020 Vingroup inaugurated VinUniversity on a 23-hectare campus, with a total investment of VND 6.5 trillion: VND 3.5 trillion for facilities and VND 3 trillion for scholarships and operations over 10 years.</p><p>The university partners with Cornell University and the University of Pennsylvania and admitted its first students in the 2020–2021 academic year.</p>",
    "people": [
     "le-mai-lan"
    ],
    "products": [
     "vinuni"
    ],
    "values": [
     "Tinh"
    ],
    "sources": [
     {
      "title": "Tuổi Trẻ – Khánh thành trường ĐH VinUni: Đặt mục tiêu đẳng cấp thế giới",
      "url": "https://tuoitre.vn/khanh-thanh-truong-dh-vinuni-dat-muc-tieu-dang-cap-the-gioi-20200116100122899.htm"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "VinFast niêm yết trên Nasdaq",
    "titleEn": "VinFast lists on Nasdaq",
    "start": [
     "2023-08-15",
     "DAY"
    ],
    "summaryVi": "Ngày 15/8/2023, cổ phiếu VinFast (VFS) giao dịch phiên đầu tiên trên Nasdaq sau khi sáp nhập với Black Spade.",
    "summaryEn": "On 15 August 2023 VinFast shares (VFS) began trading on Nasdaq following a merger with Black Spade.",
    "end": null,
    "contentVi": "<p>Ngày 15/8/2023 (giờ Mỹ), VinFast chính thức giao dịch trên sàn Nasdaq với mã VFS, sau khi hoàn tất sáp nhập với công ty SPAC Black Spade Acquisition.</p><p>Kết thúc phiên đầu tiên, cổ phiếu đóng cửa ở mức 37,06 USD, tăng 68,4% so với giá tham chiếu 22 USD, đưa vốn hóa lên khoảng 85,5 tỷ USD.</p>",
    "contentEn": "<p>On 15 August 2023 (US time) VinFast began trading on Nasdaq under the ticker VFS, after completing its merger with the SPAC Black Spade Acquisition.</p><p>The stock closed its first session at USD 37.06, up 68.4% from the USD 22 reference price, for a market value of about USD 85.5 billion.</p>",
    "people": [
     "le-thi-thu-thuy"
    ],
    "products": [
     "vinfast"
    ],
    "values": [],
    "sources": [
     {
      "title": "Viet Nam News – VinFast's market value surpasses $85.5 billion after first day on Nasdaq",
      "url": "https://vietnamnews.vn/economy/1582519/vinfast-s-market-value-surpasses-85-5-billion-after-first-day-on-nasdaq.html"
     }
    ]
   },
   {
    "type": "MILESTONE",
    "titleVi": "Ông Phạm Nhật Vượng làm Tổng Giám đốc VinFast",
    "titleEn": "Phạm Nhật Vượng becomes VinFast CEO",
    "start": [
     "2024-01-06",
     "DAY"
    ],
    "summaryVi": "Ngày 6/1/2024, ông Phạm Nhật Vượng chuyển sang làm Tổng Giám đốc VinFast; bà Lê Thị Thu Thủy làm Chủ tịch HĐQT.",
    "summaryEn": "On 6 January 2024 Phạm Nhật Vượng became VinFast CEO, with Lê Thị Thu Thủy taking the chair.",
    "end": null,
    "contentVi": "<p>Ngày 6/1/2024, VinFast công bố thay đổi nhân sự: ông Phạm Nhật Vượng chuyển từ Chủ tịch HĐQT sang Tổng Giám đốc, trực tiếp điều hành sản xuất, kinh doanh và chiến lược thị trường toàn cầu.</p><p>Bà Lê Thị Thu Thủy chuyển từ Tổng Giám đốc sang Chủ tịch HĐQT VinFast; bà Nguyễn Thị Lan Anh được bổ nhiệm Giám đốc Tài chính.</p>",
    "contentEn": "<p>On 6 January 2024 VinFast announced a leadership change: Phạm Nhật Vượng moved from Chairman to CEO, taking direct charge of global manufacturing, sales and market strategy.</p><p>Lê Thị Thu Thủy moved from CEO to Chair of VinFast's board, and Nguyễn Thị Lan Anh was appointed CFO.</p>",
    "people": [
     "pham-nhat-vuong",
     "le-thi-thu-thuy"
    ],
    "products": [
     "vinfast"
    ],
    "values": [],
    "sources": [
     {
      "title": "Thị trường Tài chính Tiền tệ – Ông Phạm Nhật Vượng làm Tổng giám đốc VinFast thay bà Lê Thị Thu Thủy",
      "url": "https://thitruongtaichinhtiente.vn/ong-pham-nhat-vuong-lam-tong-giam-doc-vinfast-thay-ba-le-thi-thu-thuy-55396.html"
     }
    ]
   }
  ]
 }
];
