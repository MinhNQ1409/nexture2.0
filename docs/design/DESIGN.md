---
version: "1.1"
author: tran-quang-dat
name: Kmarket-Internal-Design-System
description: Hệ thống thiết kế (Design System) cho ứng dụng quản lý nội bộ Kmarket
colors:
  # Brand primary
  primary:             "#18794E" # Màu chủ đạo thương hiệu: CTA chính, sidebar active item, icon nhấn, viền trái task card
  primary-dark:        "#12603E" # Trạng thái hover/pressed của primary, hover/active item trên sidebar, nút loading
  primary-light:       "#E8F5EE" # Nền tint thương hiệu: card chỉ số (stat), bóng chat người gửi, avatar, thẻ tag
  on-primary:          "#ffffff" # Màu chữ & icon tương phản trên nền xanh thương hiệu, nút destructive hoặc badge đỏ

  # Text / Ink
  ink:                 "#2C3E50" # Màu chữ chính trên nền sáng, tiêu đề khối, nội dung văn bản, icon mặc định
  ink-mute:            "#6B7B8D" # Màu chữ phụ, chú thích (caption), văn bản hướng dẫn (helper text), tab chưa chọn
  ink-subtle:          "#9AAAB8" # Chữ gợi ý (placeholder) trong ô nhập liệu, đường chia nhẹ, chấm offline
  on-dark:             "#ffffff" # Màu chữ & icon hiển thị trên các bề mặt tối (surface-dark, toast thông báo, tooltip)
  on-dark-mute:        "#A8B8C8" # Màu chữ phụ hiển thị trên các bề mặt tối (footer app, ghi chú trên nền tối)

  # Canvas / Surface
  canvas:              "#F6F7F9" # Màu nền toàn bộ ứng dụng (xám nhạt trung tính dịu mắt, phù hợp môi trường làm việc lâu)
  canvas-white:        "#ffffff" # Màu nền bề mặt card, hộp thoại modal, ô nhập dữ liệu (input), dòng bảng dữ liệu
  canvas-section:      "#EDEFF3" # Màu nền phân vùng khối con trong card, tiêu đề bảng, nền hover của hàng dữ liệu
  surface-dark:        "#2C3E50" # Màu nền bề mặt tối: thanh chân trang (footer app), khối banner CTA tối, toast, tooltip
  surface-dark-hover:  "#243343" # Trạng thái hover cho các nút hoặc thành phần nằm trên bề mặt tối
  surface-elev:        "#ffffff" # Màu nền bề mặt nâng lớp (dropdown popover, menu ngữ cảnh nổi)

  # Accent — urgent, not error
  accent:              "#C75C3C" # Cam đất: Đánh dấu công việc khẩn cấp, task cần lưu ý gấp (không dùng làm màu lỗi)
  accent-light:        "#FBE9E3" # Nền tint khẩn cấp: sự kiện lịch khẩn cấp, khối thông báo cần chú ý
  accent-dark:         "#9E3F28" # Trạng thái hover/pressed cho các nút hoặc liên kết thuộc nhóm khẩn cấp

  # Links
  link:                "#075E9A" # Màu liên kết inline dạng văn bản trong nội dung (luôn có gạch chân)
  link-hover:          "#044A78" # Trạng thái rê chuột (hover) của liên kết văn bản inline

  # Borders
  hairline:            "#E2E5EA" # Đường viền 1px mỏng nhẹ: viền card, viền ô nhập liệu, viền phân cách bảng
  hairline-strong:     "#2C3E50" # Đường viền đậm nhấn mạnh: đáy hàng tiêu đề bảng, viền ô checkbox trạng thái chờ

  # Semantic — foreground colors are chosen for 4.5:1 contrast on their paired backgrounds
  semantic-success:    "#16703A" # Chữ & icon trạng thái thành công, xu hướng tăng trưởng (trend-up)
  semantic-success-bg: "#E8F5EE" # Nền badge trạng thái thành công, thẻ hoàn tất, khối thông báo kết quả thành công
  semantic-error:      "#B42318" # Chữ & icon lỗi hệ thống, nút xóa nguy hiểm (destructive), viền ô nhập báo lỗi
  semantic-error-bg:   "#FEE4E2" # Nền badge trạng thái lỗi, khối thông báo thất bại/nguy hiểm
  semantic-warning:    "#8A5A00" # Chữ & icon trạng thái cảnh báo, phiếu chờ duyệt
  semantic-warning-bg: "#FFF4CC" # Nền badge trạng thái cảnh báo, thẻ chờ xử lý
  semantic-info:       "#0B5CAD" # Chữ & icon thông tin trợ giúp, ô ký số cần thao tác, hàng trong bảng đang chọn
  semantic-info-bg:    "#EAF3FF" # Nền badge thông tin, nền ô vị trí ký số, nền sự kiện lịch thông tin
  notification:        "#B42318" # Màu chấm đỏ thông báo, badge hiển thị số lượng tin nhắn hoặc thông báo mới

  # Data Visualization — use with labels/patterns; color is never the only encoding
  chart-primary:       "#18794E" # Chuỗi dữ liệu chính trong biểu đồ: doanh thu, sản lượng, tỷ lệ hoàn thành KPI
  chart-secondary:     "#0B5CAD" # Chuỗi dữ liệu đối chiếu thứ hai trong biểu đồ: số liệu kỳ trước, mục tiêu kế hoạch
  chart-warning:       "#8A5A00" # Dữ liệu cảnh báo trên biểu đồ: chỉ số sụt giảm, chỉ tiêu có nguy cơ trễ hạn
  chart-accent:        "#C75C3C" # Dữ liệu đột biến trên biểu đồ: vượt định mức chi phí, tồn kho vượt trần
  chart-purple:        "#6941C6" # Chuỗi phân loại thứ ba trên biểu đồ: phân bổ theo phòng ban hoặc kênh phân phối
  chart-purple-light:  "#F2EDFF" # Vùng diện tích mờ (area fill) bên dưới đường biểu đồ phân loại tím
  chart-grid:          "#E2E5EA" # Đường kẻ lưới tọa độ trục X/Y trên biểu đồ

  # States (Disabled & Base)
  disabled-bg:         "#EDEFF3" # Màu nền của nút bấm, ô nhập liệu bị vô hiệu hóa (disabled - không thể tương tác)
  disabled-text:       "#6B7B8D" # Màu chữ & icon của nút bấm, ô nhập liệu bị vô hiệu hóa
  focus-ring:          "#18794E" # Vòng viền highlight 2px khi người dùng điều hướng bàn phím (tab focus) 

typography:
  display-xxl:
    fontFamily: "Be Vietnam Pro, Inter, system-ui, -apple-system, sans-serif"
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: -0.64px
  display-xl:
    fontFamily: "Be Vietnam Pro, Inter, system-ui, -apple-system, sans-serif"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.48px
  display-lg:
    fontFamily: "Be Vietnam Pro, Inter, system-ui, -apple-system, sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.36px
  display-md:
    fontFamily: "Be Vietnam Pro, Inter, system-ui, -apple-system, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.28
    letterSpacing: -0.22px
  heading-lg:
    fontFamily: "Be Vietnam Pro, Inter, system-ui, -apple-system, sans-serif"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.36
    letterSpacing: -0.11px
  heading-md:
    fontFamily: "Be Vietnam Pro, Inter, system-ui, -apple-system, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.44
    letterSpacing: 0
  heading-sm:
    fontFamily: "Be Vietnam Pro, Inter, system-ui, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.53
    letterSpacing: 0
  body-lg:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.57
    letterSpacing: 0
  body-strong:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.57
    letterSpacing: 0
  button-lg:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0
  button-md:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0.1px
  button-sm:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0.1px
  caption:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.46
    letterSpacing: 0.1px
  micro-cap:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: 0.72px

rounded:
  xs:   2px
  sm:   4px
  md:   8px
  lg:   12px
  xl:   16px
  xxl:  24px
  pill: 90px

spacing:
  xs:   4px
  sm:   8px
  md:   12px
  lg:   16px
  xl:   20px
  xxl:  24px
  huge: 32px

components:
  # ── Buttons ──────────────────────────────────────────────
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    minHeight: 44px
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    minHeight: 44px
  button-primary-lg:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-lg}"
    rounded: "{rounded.md}"
    padding: 12px 24px
    minHeight: 48px
  button-secondary:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    minHeight: 44px
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 10px 20px
  button-ghost-primary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 10px 20px
  button-danger:
    backgroundColor: "{colors.semantic-error}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    minHeight: 44px
  button-disabled:
    backgroundColor: "{colors.disabled-bg}"
    textColor: "{colors.disabled-text}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    minHeight: 44px
    cursor: not-allowed
  button-loading:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    minHeight: 44px
  button-sm:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.sm}"
    padding: 8px 14px
    minHeight: 40px

  # ── Navigation ───────────────────────────────────────────
  sidebar-nav:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 0
    width: 240px
  sidebar-nav-item:
    backgroundColor: "transparent"
    textColor: "rgba(255, 255, 255, 0.7)"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 10px 16px
    minHeight: 44px
  sidebar-nav-item-active:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.sm}"
    padding: 10px 16px
    minHeight: 44px
  sidebar-nav-item-hover:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 10px 16px
  sidebar-section-label:
    backgroundColor: "transparent"
    textColor: "rgba(255, 255, 255, 0.5)"
    typography: "{typography.micro-cap}"
    rounded: "{rounded.xs}"
    padding: 8px 16px 4px 16px
  topbar:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 0 24px
    height: 56px

  # ── Cards & Containers ───────────────────────────────────
  card-default:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 20px
  card-section:
    backgroundColor: "{colors.canvas-section}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 20px
  card-stat:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    typography: "{typography.display-lg}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-welcome:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.xl}"
    padding: 32px
  card-task:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 16px
    borderLeft: "4px solid {colors.primary}"
  card-task-urgent:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 16px
    borderLeft: "4px solid {colors.accent}"
  card-document:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 16px
  card-interactive-hover:
    backgroundColor: "{colors.canvas-section}"
    cursor: "pointer"
  card-dark-cta:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.xl}"
    padding: 48px

  # ── Forms & Inputs ───────────────────────────────────────
  text-input:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 12px
  text-input-focus:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 12px
    outline: "2px solid {colors.primary}"
  textarea:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 12px
  select-input:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 12px
  form-label:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.xs}"
    padding: 0 0 4px 0
  text-input-error:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.ink}"
    borderColor: "{colors.semantic-error}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 12px
    outline: "2px solid {colors.semantic-error}"
  text-input-disabled:
    backgroundColor: "{colors.disabled-bg}"
    textColor: "{colors.disabled-text}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 12px
  form-helper:
    backgroundColor: "transparent"
    textColor: "{colors.ink-mute}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 4px 0 0 0
  form-error:
    backgroundColor: "transparent"
    textColor: "{colors.semantic-error}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 4px 0 0 0

  # ── Advanced Inputs ──────────────────────────────────────
  checkbox:
    backgroundColor: "{colors.canvas-white}"
    borderColor: "{colors.hairline-strong}"
    rounded: "{rounded.xs}"
    size: 16px
  checkbox-checked:
    backgroundColor: "{colors.primary}"
    borderColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  checkbox-focus:
    outline: "2px solid {colors.focus-ring}"
    outlineOffset: "2px"
  toggle-track:
    backgroundColor: "{colors.ink-subtle}"
    rounded: "{rounded.pill}"
    width: 36px
    height: 20px
  toggle-track-active:
    backgroundColor: "{colors.primary}"
  toggle-track-focus:
    outline: "2px solid {colors.focus-ring}"
    outlineOffset: "2px"
  toggle-thumb:
    backgroundColor: "{colors.canvas-white}"
    rounded: "{rounded.pill}"
    size: 16px
  file-dropzone:
    backgroundColor: "{colors.canvas-white}"
    borderColor: "{colors.primary-light}"
    borderStyle: "dashed"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px

  # ── Badges & Status ──────────────────────────────────────
  badge-success:
    backgroundColor: "{colors.semantic-success-bg}"
    textColor: "{colors.semantic-success}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 10px
    display: inline-flex
    alignItems: center
    whiteSpace: nowrap
    width: fit-content
    flexShrink: 0

  badge-error:
    backgroundColor: "{colors.semantic-error-bg}"
    textColor: "{colors.semantic-error}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 10px
    display: inline-flex
    alignItems: center
    whiteSpace: nowrap
    width: fit-content
    flexShrink: 0

  badge-warning:
    backgroundColor: "{colors.semantic-warning-bg}"
    textColor: "{colors.semantic-warning}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 10px
    display: inline-flex
    alignItems: center
    whiteSpace: nowrap
    width: fit-content
    flexShrink: 0

  badge-info:
    backgroundColor: "{colors.semantic-info-bg}"
    textColor: "{colors.semantic-info}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 10px
    display: inline-flex
    alignItems: center
    whiteSpace: nowrap
    width: fit-content
    flexShrink: 0

  badge-neutral:
    backgroundColor: "{colors.canvas-section}"
    textColor: "{colors.ink-mute}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 10px
    display: inline-flex
    alignItems: center
    whiteSpace: nowrap
    width: fit-content
    flexShrink: 0

  tag-primary:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    typography: "{typography.micro-cap}"
    rounded: "{rounded.sm}"
    padding: 3px 8px
  trend-up:
    textColor: "{colors.semantic-success}"
    typography: "{typography.caption}"
    icon: "arrow-up-right"
    iconSize: "{icon-sm}"
  trend-down:
    textColor: "{colors.semantic-error}"
    typography: "{typography.caption}"
    icon: "arrow-down-right"
    iconSize: "{icon-sm}"

  # ── Navigation Pills & Tabs ───────────────────────────────
  tab-active:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.xs}"
    padding: 10px 16px
    borderBottom: "2px solid {colors.primary}"
  tab-inactive:
    backgroundColor: "transparent"
    textColor: "{colors.ink-mute}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 10px 16px
  breadcrumb:
    backgroundColor: "transparent"
    textColor: "{colors.ink-mute}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 0

  # ── Data Table ───────────────────────────────────────────
  table-header:
    backgroundColor: "{colors.canvas-section}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    padding: 12px 16px
    borderBottom: "1px solid {colors.hairline-strong}"
  table-row:
    backgroundColor: "{colors.canvas-white}"
    borderBottom: "1px solid {colors.hairline}"
  table-row-hover:
    backgroundColor: "{colors.primary-light}"
  table-row-selected:
    backgroundColor: "{colors.semantic-info-bg}"
    borderLeft: "4px solid {colors.semantic-info}"

  # ── Toast / Snackbar ─────────────────────────────────────
  toast-container:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 12px 16px
    shadow: "0 8px 32px rgba(44,62,80,0.16)"
  toast-success-icon:
    textColor: "{colors.semantic-success}"
  toast-error-icon:
    textColor: "{colors.semantic-error}"

  # ── Empty & Loading States ───────────────────────────────
  empty-state:
    backgroundColor: "transparent"
    textColor: "{colors.ink-mute}"
    typography: "{typography.body-lg}"
    padding: 48px
    align: "center"
  skeleton-base:
    backgroundColor: "{colors.hairline}"
    rounded: "{rounded.sm}"
  skeleton-highlight:
    backgroundColor: "{colors.canvas-section}"

  # ── Motion & layering ─────────────────────────────────────
  motion-fast: 120ms ease-out
  motion-standard: 200ms ease
  motion-slow: 250ms ease-out
  z-base: 0
  z-sticky: 10
  z-dropdown: 20
  z-modal: 40
  z-drawer: 50
  z-toast: 60

  # ── Misc ─────────────────────────────────────────────────
  avatar-sm:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.pill}"
    size: 28px
  avatar-md:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    size: 36px
  avatar-lg:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    typography: "{typography.heading-md}"
    rounded: "{rounded.pill}"
    size: 48px
  notification-badge:
    backgroundColor: "{colors.notification}"
    textColor: "{colors.on-primary}"
    typography: "{typography.micro-cap}"
    rounded: "{rounded.pill}"
    minWidth: 16px
    minHeight: 16px
  divider:
    backgroundColor: "{colors.hairline}"
    height: 1px
  tooltip:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: 6px 10px
  footer-app:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark-mute}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 16px 24px
  link-inline:
    backgroundColor: "transparent"
    textColor: "{colors.link}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 0
---

# Kmarket Internal Design System

## Overview

Kmarket là doanh nghiệp bán lẻ nội địa Việt Nam. Ứng dụng quản lý nội bộ này được xây dựng để phục vụ toàn bộ vòng đời tác nghiệp của nhân viên — từ tự động hóa quy trình nghiệp vụ, giao-nhận-theo dõi công việc, truyền thông và gắn kết nhân sự, quản lý tài liệu, lịch biểu thông minh, quản lý nhân sự.

Triết lý màu sắc của Kmarket đặt **xanh lá `{colors.primary}`** làm trung tâm — màu của tăng trưởng, tin cậy và sự tươi mới — kết hợp với nền **xám nhạt trung tính `{colors.canvas}`** giữ cảm giác sạch, hiện đại và tập trung, phân biệt Kmarket khỏi các app doanh nghiệp màu trắng thuần đơn điệu. **Xám sẫm `{colors.ink}`** đảm bảo độ dễ đọc cao trong môi trường làm việc mật độ thông tin lớn. Sidebar điều hướng dùng nền xanh `#18794E` tạo bản sắc thương hiệu xuyên suốt, đưa nội dung làm việc lên foreground.

Điểm nhấn thứ hai là **cam đất `{colors.accent}`** — màu nóng dành cho tình huống khẩn cấp và task cần chú ý, không thay thế màu lỗi hệ thống. **Lỗi/destructive dùng `{colors.semantic-error}`**; **link dùng `{colors.link}`** và luôn có underline khi không ở trong component điều hướng.

Typography chia hai tầng: **Be Vietnam Pro** (700) cho tất cả heading và display — font được thiết kế bởi người Việt, tối ưu tiếng Việt ở cả kích thước lớn lẫn nhỏ — và **Inter** (400/600) cho body, button label, caption — font chuẩn mực của các app nội bộ hiện đại toàn cầu.

- Xanh lá `{colors.primary}` làm màu CTA chính, sidebar active item, icon nhấn và điểm nhấn thương hiệu — **không dùng làm màu foreground cho badge success**.
- Success dùng `{colors.semantic-success}` để phân biệt trạng thái hoàn tất với hành động chính.
- Nền xám nhạt `{colors.canvas}` là background toàn app; card và modal dùng `{colors.canvas-white}` để tạo depth tự nhiên.
- Sidebar xanh `#18794E` (240px) + Topbar trắng (56px) tạo khung điều hướng ổn định.
- Button bo vừa `{rounded.md}` (8px); pill chỉ dành cho badge, avatar và trạng thái ngắn.
- Cam đất `{colors.accent}` chỉ biểu thị việc cần chú ý/khẩn cấp; error destructive dùng semantic error.
- Các số liệu kho hàng, tiền và tồn kho dùng `font-variant-numeric: tabular-nums` để các cột thẳng hàng.

## Design Principles

Đây là các nguyên tắc **có thể ra quyết định** — khi phân vân giữa hai lựa chọn thiết kế, nguyên tắc dưới đây quyết định, không phải cảm tính cá nhân của người code. Mọi token, component và ngoại lệ trong tài liệu này đều quy chiếu về một trong các nguyên tắc sau.

1. **Mật độ trước, trang trí sau.** Nhân viên dùng app này 8 giờ/ngày; ưu tiên hiển thị nhiều thông tin hữu ích trên một màn hình hơn khoảng trắng thẩm mỹ. → Padding card giữ ở 16–20px (không tự ý tăng lên 32px+ trừ `card-welcome`/`card-dark-cta`); dashboard ưu tiên nhiều widget nhỏ hơn 1 hero banner lớn.
2. **Màu mang nghĩa, không mang cảm xúc.** Mỗi màu chỉ gắn với đúng một vai trò ngữ nghĩa đã định nghĩa (`primary` = brand/CTA, `accent` = khẩn cấp, `semantic-*` = trạng thái hệ thống). Cấm dùng màu ngoài vai trò "cho đẹp". → Trước khi thêm màu mới, tự hỏi: "màu này đang thay thế token ngữ nghĩa nào đã có sẵn?" — nếu có, dùng lại token đó.
3. **Một cách làm cho một việc.** Nếu hệ thống đã có pattern cho một nhu cầu (badge trạng thái, card, button), không tạo biến thể mới cho cùng mục đích. → Component mới chỉ được thêm khi không token nào trong "Card System" / "Interaction States" phủ được use-case, và phải nêu rõ lý do trong PR.
4. **Trạng thái tương tác là hợp đồng, không phải tùy chọn.** Mọi element có thể click/focus/nhập liệu đều phải có đủ hover, active, focus, disabled theo đúng công thức chuẩn ở mục "Interaction States" — không tự chế công thức riêng cho từng component.
5. **Chọn component theo vai trò thông tin, không theo cảm tính hình ảnh.** Trước khi tạo `card-xyz` hay `badge-xyz` mới, map nó vào đúng 1 vai trò đã liệt kê trong "Card System". Nếu không map được vào vai trò nào, đó là dấu hiệu cần một pattern thật sự mới — không phải một biến thể.
6. **Bản sắc nằm ở chi tiết lặp lại nhất quán, không phải một khoảnh khắc trang trí.** Border-left accent, tabular-nums, tông giọng tiếng Việt tự nhiên phải xuất hiện ở MỌI nơi liên quan (xem "Tín hiệu thị giác Kmarket" bên dưới) — không phải chỉ xuất hiện đẹp ở 1 màn hình rồi biến mất.

### Tín hiệu thị giác Kmarket (Signature Moments)

Ba chi tiết sau giúp phân biệt Kmarket với một admin template chung chung. Mỗi chi tiết phải lặp lại nhất quán ở MỌI nơi phù hợp, không phải chỉ 1 màn hình:

- **Border-left accent trên mọi "record row".** `card-task`/`card-task-urgent` đã dùng `borderLeft: 4px solid {colors.primary|accent}` — áp dụng pattern này cho MỌI hàng đại diện 1 bản ghi có thể có mức ưu tiên (task, đơn hàng, phiếu kho), không riêng module Công việc.
- **Ngôn ngữ số liệu kho/tiền.** Mọi con số kho hàng, tiền tệ dùng `font-variant-numeric: tabular-nums`, định dạng `vi-VN`/`VND` (xem "Data & Localization"). Xu hướng tăng/giảm dùng `trend-up`/`trend-down` (mũi tên + màu semantic), không dùng màu đơn thuần làm tín hiệu duy nhất.
- **Tông giọng microcopy tiếng Việt tự nhiên.** Empty state, error, toast dùng câu tiếng Việt trực tiếp, không dịch máy từ tiếng Anh. Ví dụ đúng: "Chưa có công việc nào ở đây" thay vì "Không tìm thấy dữ liệu"; "Đang lưu lại cho bạn…" thay vì "Đang xử lý...".

## Colors

> **Context:** App nội bộ — không phải trang marketing. Màu được tối ưu cho mật độ thông tin cao, đọc lâu, nhiều màn hình cùng lúc.

### Brand & Primary

- **Xanh lá Kmarket** (`{colors.primary}` — `#18794E`): CTA chính, sidebar active, icon nhấn và border-left task card.
- **Xanh lá tối** (`{colors.primary-dark}` — `#12603E`): hover/pressed của primary.
- **Xanh lá nhạt** (`{colors.primary-light}` — `#E8F5EE`): surface tint của brand.

### Accent & Semantic

- **Cam đất** (`{colors.accent}` — `#C75C3C`): task khẩn cấp hoặc cần chú ý; không dùng cho lỗi validation.
- **Error** (`{colors.semantic-error}` / `{colors.semantic-error-bg}`): lỗi, xóa, validation và hành động destructive.
- **Link** (`{colors.link}` / `{colors.link-hover}`): liên kết inline; không dùng làm màu tùy ý cho UI.

### Surface & Canvas

- **Canvas trung tính** (`{colors.canvas}` — `#F6F7F9`): Background toàn app — xám xanh nhạt, trung tính, không chuyển vàng, dễ chịu khi đọc lâu.
- **Canvas trắng** (`{colors.canvas-white}` — `#ffffff`): Bề mặt card, modal, input — tạo depth nhẹ so với nền canvas.
- **Canvas section** (`{colors.canvas-section}` — `#EDEFF3`): Section phân vùng trên nền canvas — đậm hơn nhẹ theo cùng tông lạnh để tạo visual grouping.
- **Surface tối** (`{colors.surface-dark}` — `#2C3E50`): Footer app, card-dark-cta — tạo phân tầng tối/sáng rõ ràng.
- **Surface tối hover** (`{colors.surface-dark-hover}` — `#243343`): Hover state trên dark surface.

### Text / Ink

- **Ink** (`{colors.ink}` — `#2C3E50`): Text chính trên nền sáng.
- **Ink mute** (`{colors.ink-mute}` — `#6B7B8D`): Text phụ, caption và helper text.
- **Ink subtle** (`{colors.ink-subtle}` — `#9AAAB8`): Placeholder và separator nhẹ; không dùng cho nội dung bắt buộc phải đọc.
- **On dark** (`{colors.on-dark}` — `#ffffff`): Text trên surface tối.
- **On dark mute** (`{colors.on-dark-mute}` — `#A8B8C8`): Text phụ trên sidebar.

### Semantic

- Foreground semantic dùng trên background semantic tương ứng và phải đạt tối thiểu 4.5:1.
- Không truyền đạt trạng thái chỉ bằng màu; luôn kèm label, icon hoặc pattern.
- **Success**: Foreground `{colors.semantic-success}` / Background `{colors.semantic-success-bg}`
- **Error**: Foreground `{colors.semantic-error}` / Background `{colors.semantic-error-bg}`
- **Warning**: Foreground `{colors.semantic-warning}` / Background `{colors.semantic-warning-bg}`
- **Info**: Foreground `{colors.semantic-info}` / Background `{colors.semantic-info-bg}`

### Borders

- **Hairline** (`{colors.hairline}` — `#E2E5EA`): Border 1px trên card và input — xám lạnh, đồng tông với canvas trung tính.
- **Hairline strong** (`{colors.hairline-strong}` — `#2C3E50`): Border nhấn mạnh — dùng cho border-left task card, viền ô checkbox trạng thái chờ. Focus ring trên bề mặt tối (sidebar xanh) dùng `{colors.on-primary}` để đảm bảo tương phản.

## Typography

### Font Family

**Display tier — Be Vietnam Pro**: Font humanist sans được thiết kế bởi người Việt, tối ưu cho ký tự có dấu tiếng Việt. Sử dụng weight 700 cho tất cả heading và display. Load từ Google Fonts: `font-family: 'Be Vietnam Pro'`.

**Body tier — Inter**: Font UI chuẩn mực toàn cầu, tối ưu cho mật độ thông tin cao, render sắc nét ở 13–16px. Weight 400 (body) và 600 (strong/button). Load từ Google Fonts: `font-family: 'Inter'`.

Cả hai font đều free và open-source qua Google Fonts. Fallback chain: `system-ui, -apple-system, sans-serif`.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
| --- | --- | --- | --- | --- | --- |
| `{typography.display-xxl}` | 64px | 700 | 1.12 | -0.64px | Màn hình welcome hero, onboarding |
| `{typography.display-xl}` | 48px | 700 | 1.2 | -0.48px | Page title lớn, section opener |
| `{typography.display-lg}` | 36px | 700 | 1.25 | -0.36px | Stat callout, module title |
| `{typography.display-md}` | 28px | 700 | 1.28 | -0.22px | Card header chính, dashboard widget title |
| `{typography.heading-lg}` | 22px | 700 | 1.36 | -0.11px | Section heading trong page |
| `{typography.heading-md}` | 18px | 600 | 1.44 | 0 | Sub-section, panel title |
| `{typography.heading-sm}` | 15px | 600 | 1.53 | 0 | Compact card title, sidebar group label |
| `{typography.body-lg}` | 16px | 400 | 1.6 | 0 | Body copy chính, mô tả dài |
| `{typography.body-md}` | 14px | 400 | 1.57 | 0 | Default UI body — list item, table row |
| `{typography.body-strong}` | 14px | 600 | 1.57 | 0 | Emphasized body, table header |
| `{typography.button-lg}` | 16px | 600 | 1.0 | 0 | Button chính trên hero / welcome |
| `{typography.button-md}` | 14px | 600 | 1.0 | 0.1px | Button tiêu chuẩn |
| `{typography.button-sm}` | 13px | 600 | 1.0 | 0.1px | Button trong table, compact action |
| `{typography.caption}` | 13px | 400 | 1.46 | 0.1px | Caption, helper text, timestamp |
| `{typography.micro-cap}` | 11px | 700 | 1.0 | 0.72px | All-caps label, sidebar section header |

### Principles

- **Be Vietnam Pro chỉ dùng cho heading/display.** Không dùng Be Vietnam Pro cho body text — sẽ làm tăng file size và giảm readability ở size nhỏ.
- **Body tại 1.57–1.6 line-height.** Phù hợp cho data-dense screen — không quá chật (1.4) cũng không quá thưa (1.75).
- **Negative tracking chỉ áp dụng cho display ≥ 22px.** Tại size nhỏ hơn, tracking về 0 để đảm bảo legibility.
- **Micro-cap dùng uppercase + 0.72px tracking** — tạo visual weight đủ lớn mà không cần tăng size.

## Layout

### Spacing System

- **Base unit**: 8px với các sub-token 4 / 12 / 16 / 20 / 24 / 32px.
- **Tokens**: `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.lg}` 16px · `{spacing.xl}` 20px · `{spacing.xxl}` 24px · `{spacing.huge}` 32px.
- **Section padding**: 24–32px cho các panel trong app nội bộ.
- **Card internal padding**: 20px tiêu chuẩn, 24px cho stat card, 32px cho welcome card.

### Grid & Layout

- **App shell**: Sidebar 240px cố định bên trái + Topbar 56px cố định phía trên + vùng content `flex: 1; min-width: 0`.
- **Không áp dụng một `max-width` toàn cục cho mọi page.** Width của content được chọn theo vai trò của màn hình bằng `Content Width Modes` bên dưới.
- **Dashboard grid**: 12-column CSS grid, 16px gap. Widget chiếm 3 / 4 / 6 / 12 cột tùy loại.
- **Data table**: chiếm 100% width vùng content; pagination ở bottom. Trên mobile ưu tiên horizontal scroll thay vì bó/collapse dữ liệu.
- **Nested flex/grid**: child có khả năng co phải dùng `min-width: 0`; vùng scroll dọc bên trong layout phải dùng `min-height: 0`.

### Content Width Modes

Không dùng một `max-width` duy nhất cho toàn bộ ứng dụng. Chọn đúng mode theo loại nội dung:

| Mode | Dùng cho | Width contract |
| --- | --- | --- |
| `standard-content` | Dashboard, Profile, Settings, standalone form, overview | `width: 100%; max-width: 1200px; margin-inline: auto` |
| `workspace-content` | Role & Permission, User Management, Employee Management, Warehouse, Audit, master-detail, large table | `width: 100%; max-width: none; min-width: 0` |
| `reading-content` | Policy, help, article, tài liệu dài thiên về đọc | `width: 100%; max-width: 760px; margin-inline: auto` |

**Quy tắc chọn mode:**

- `standard-content` giới hạn độ rộng để dashboard/form không bị kéo quá xa trên 2K/4K.
- `workspace-content` dùng toàn bộ không gian còn lại của app shell; không được ép về 1200px chỉ vì viewport lớn.
- `reading-content` ưu tiên độ dài dòng dễ đọc.
- Page padding mặc định 24px ở Desktop/Wide; có thể giảm theo breakpoint nhưng không được thay bằng khoảng trắng do `max-width` sai mục đích.
- Một page chỉ center bằng `margin-inline: auto` khi mode của nó có `max-width`; workspace không tự center thành một cột hẹp giữa màn hình rộng.

### Whitespace Philosophy

Nền xám nhạt `{colors.canvas}` cùng card trắng `{colors.canvas-white}` đã tạo đủ phân tầng visual. Không cần gradient nặng hay shadow phức tạp để tạo depth — sự tương phản canvas/trắng là "depth" ngầm của Kmarket Design System.

## Management Screen Patterns

Các màn quản trị dữ liệu không được tự suy diễn layout chỉ từ token card/button. Chúng dùng `workspace-content` và một trong các pattern bên dưới.

### Data Management Screen

Cấu trúc mặc định:

```text
Page Header
├── Page title
├── Description
└── Primary action

Toolbar
├── Search
├── Filter
└── Secondary actions

Data Region
└── Table / List / Master-detail
```

- Header và toolbar không được làm co `Data Region` bằng fixed width không cần thiết.
- List/table phải ưu tiên không gian cho dữ liệu; action/status không được khiến tên bản ghi bị co bất hợp lý.
- Nếu page là workspace, không dùng `standard-content` chỉ để tạo khoảng trắng hai bên.

### Master–Detail Management

Dùng khi người dùng cần duyệt danh sách bản ghi và xem/chỉnh sửa chi tiết mà không rời khỏi màn hình, ví dụ Role & Permission.

**Desktop/Wide khi container đủ rộng:**

```css
.management-master-detail {
  display: grid;
  grid-template-columns: minmax(360px, 440px) minmax(0, 1fr);
  gap: 16px;
  width: 100%;
  min-width: 0;
}
```

- **Master panel**: `min-width: 360px`, preferred khoảng `400px`, `max-width: 440px`; không dùng tỷ lệ phần trăm khiến panel tăng lên 800–1000px trên 4K.
- **Detail panel**: `min-width: 0; width: 100%`; chiếm toàn bộ phần không gian còn lại.
- **Detail form/readable content**: có thể giới hạn khoảng `max-width: 1100px`; bảng, permission matrix và data-heavy section được phép full width trong detail panel.
- **Không dùng width 240px/300px của Chat cho management screen.** Các giá trị đó là contract riêng của Chat module, không phải pattern toàn hệ thống.
- Tên bản ghi trong master list có thể ellipsis khi thật sự thiếu chỗ, nhưng không được dùng một master panel quá hẹp làm nguyên nhân mặc định khiến tên thông thường bị cắt.

**Khi container không còn đủ rộng:** chuyển cấu trúc theo container width, không chờ viewport breakpoint nếu component thực tế đã bị bó hẹp. Pattern khuyến nghị:

```css
.management-shell {
  container-type: inline-size;
}

@container (max-width: 900px) {
  .management-master-detail {
    grid-template-columns: 1fr;
  }
}
```

Ở mode một cột, ưu tiên một pane tại một thời điểm (`list → detail` và có nút Back) cho dữ liệu phức tạp; chỉ stack cả list và detail nếu chiều dài trang vẫn hợp lý.

### Management Empty State

- Empty state của detail panel được center **trong panel**, không được biến thành hero screen chiếm vô hạn chiều cao.
- Không mặc định dùng `height: 100vh` cho empty state nằm bên trong app shell.
- Khuyến nghị `min-height: 320px` hoặc `place-items: center` trong vùng panel thực tế.
- Khi master/detail có scroll riêng: container cha dùng `min-height: 0`; từng panel dùng `overflow-y: auto`.

## Card System

7 token card không phải 7 lựa chọn ngang hàng — mỗi token gắn với đúng 1 vai trò thông tin. Chọn card theo **nội dung cần hiển thị**, không theo cảm tính:

| Token | Vai trò | Dùng khi | KHÔNG dùng khi |
| --- | --- | --- | --- |
| `card-default` | Container nội dung chung | 1 khối nội dung độc lập, không cần nhấn mạnh đặc biệt (panel, list container) | Cần hiển thị 1 con số nổi bật → dùng `card-stat` |
| `card-section` | Section lồng bên trong 1 card cha | Nhóm field/nội dung con bên trong 1 card lớn hơn, cần phân vùng nhẹ | Card top-level trên dashboard → dùng `card-default` |
| `card-stat` | KPI / số liệu nổi bật | Dashboard widget hiển thị đúng 1 metric chính | Chứa nhiều loại nội dung hỗn hợp |
| `card-welcome` | Hero one-off | Welcome/onboarding message, xuất hiện tối đa 1 lần/trang | Card lặp lại nhiều instance trên cùng màn hình |
| `card-task` / `card-task-urgent` | Record có mức ưu tiên | Hàng trong danh sách công việc/kho có thể "khẩn cấp"; `-urgent` chỉ dùng `{colors.accent}`, không dùng cho lỗi | Tài liệu hay thông tin tĩnh không có khái niệm ưu tiên |
| `card-document` | Record tài liệu | Đại diện 1 tài liệu trong danh sách — không có border-left vì tài liệu không mang "mức ưu tiên" | Task/công việc → dùng `card-task` |
| `card-dark-cta` | CTA one-off nổi bật | Lời mời hành động quan trọng (hoàn tất ký, hoàn tất hồ sơ), tối đa 1 instance/màn hình | Card thông thường, lặp lại nhiều lần |

`card-task`, `card-task-urgent` và `card-document` là card **có thể click** (mở chi tiết record) — dùng `card-interactive-hover` cho hover state của cả 3, theo đúng công thức trong "Interaction States".

**Quy tắc quyết định nhanh:** nội dung là 1 con số → `card-stat`; là 1 bản ghi có thể khẩn cấp → `card-task`/`-urgent`; là 1 tài liệu → `card-document`; là khối nội dung tổng quát → `card-default`; là section lồng trong card khác → `card-section`; là lời mời hành động one-off → `card-welcome` hoặc `card-dark-cta`. Nếu nội dung không map được vào vai trò nào ở trên, đó là dấu hiệu cần thảo luận trước khi tạo card mới — xem nguyên tắc #5 trong "Design Principles".

## Elevation & Depth

| Level | Treatment | Use |
| --- | --- | --- |
| 0 | Flat | Background canvas, sidebar, topbar |
| 1 | `box-shadow: 0 1px 4px rgba(44,62,80,0.08)` | Card tiêu chuẩn, input focused |
| 2 | `box-shadow: 0 4px 16px rgba(44,62,80,0.12)` | Dropdown menu, popover |
| 3 | `box-shadow: 0 8px 32px rgba(44,62,80,0.16)` | Modal, dialog |
| 4 | `box-shadow: 0 16px 48px rgba(44,62,80,0.2)` | Sheet, drawer |
| Focus | `outline: 2px solid {colors.focus-ring}; outline-offset: 2px` | Keyboard focus ring trên mọi interactive element |

### Depth Philosophy

Shadow dùng màu `rgba(44,62,80,…)` thay vì đen thuần để giữ độ dịu cho nền xám lạnh. Card thường ưu tiên border + canvas contrast; shadow chỉ tăng theo layer tương tác.

## Shapes

### Border Radius Scale

| Token | Value | Use |
| --- | --- | --- |
| `{rounded.xs}` | 2px | Hairline tag, divider corner |
| `{rounded.sm}` | 4px | Button compact, calendar event chip |
| `{rounded.md}` | 8px | Button tiêu chuẩn, input, tag |
| `{rounded.lg}` | 12px | Card tiêu chuẩn, dropdown |
| `{rounded.xl}` | 16px | Modal, large card, welcome card |
| `{rounded.xxl}` | 24px | Avatar group, notification panel |
| `{rounded.pill}` | 90px | Badge/status chip nhỏ, avatar tròn |

### Icon Library

Dùng **Lucide Icons** làm icon library chính cho toàn bộ hệ thống. Nếu cần thêm icon, chỉ dùng **Phosphor Icons** làm source bổ sung — không trộn nhiều thư viện.

### Icon Sizes

| Token | Size | Use |
| --- | --- | --- |
| `icon-sm` | 16px | Inline icon cạnh text, helper text, breadcrumb separator |
| `icon-md` | 20px | Button icon, input prefix/suffix, badge icon |
| `icon-lg` | 24px | Navigation sidebar icon, topbar action icon |
| `icon-xl` | 32px | Empty state illustration, large callout icon |

### Icon Style

- **Stroke width**: 1.5px cho tất cả icon — phù hợp với Inter font-weight 400/600.
- **Color:** Kế thừa màu từ parent element. Dùng `{colors.ink}` làm default; `{colors.ink-mute}` cho secondary/muted; `{colors.primary}` cho active/selected.
- **Optical alignment**: Icon nằm giữa icon container (20px hoặc 24px box), không padding thêm trừ khi icon cần align với text baseline.

### Icon-to-Text Spacing

- Icon trước text: `margin-right: 6px` (inline), `gap: 8px` (flex container).
- Icon sau text: `margin-left: 6px` (inline), `gap: 8px` (flex container).

### Nghiêm cấm sử dụng Emoji

- **KHÔNG dùng emoji (😀, 🚀, ✅, ⚠️, 🔔, v.v.) thay cho icon component** trong bất kỳ context nào — UI text, button label, badge, status, empty state, toast message, heading, placeholder, tooltip.
- **Tại sao**: Emoji rendering không nhất quán giữa các OS (macOS vs Windows vs Linux), font size khó control, không có hover/focus state, không phù hợp với design system tokens, và phá vỡ visual consistency.
- **Thay thế bắt buộc**: Luôn dùng component `<Icon>` từ Lucide/Phosphor với token `{icon-sm}`, `{icon-md}`, `{icon-lg}` tương ứng.
- **Trường hợp ngoại lệ duy nhất**: User-generated content (tin nhắn chat, comment) — ở đây emoji là input của người dùng, không phải design decision.
- **Ví dụ sai**: `⚠️ Cần xác nhận`, `📋 Danh sách`, `✅ Hoàn thành`
- **Ví dụ đúng**: `<Icon name="alert-triangle" /> Cần xác nhận`, `<Icon name="list" /> Danh sách`, `<Icon name="check-circle" /> Hoàn thành`

## Badge & Status Rules

Badge dạng `{rounded.pill}` là **status label ngắn**, không phải container văn bản nhiều dòng. Tất cả `badge-success`, `badge-error`, `badge-warning`, `badge-info`, `badge-neutral` tuân theo contract sau:

```css
.badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  flex-shrink: 0;
  white-space: nowrap;
}
```

- Badge **không được wrap thành nhiều dòng**.
- Không đặt fixed width cho badge; width phải theo nội dung + padding.
- Trong flex/grid row, badge dùng `flex-shrink: 0` để status không bị bó méo hoặc xuống dòng.
- `{rounded.pill}` chỉ dùng cho label ngắn như `Đang hoạt động`, `Cần duyệt gấp`, `Chờ xác nhận`.
- Nếu nội dung trạng thái dài đến mức không phù hợp trong một dòng, **không ép pill xuống dòng**; chuyển sang status text, callout hoặc container dùng `{rounded.md}`.
- Khi badge đặt cạnh title/tên record, phần text chính là vùng được phép co (`min-width: 0; overflow: hidden; text-overflow: ellipsis` nếu cần), nhưng phải bảo đảm parent đủ rộng theo pattern layout trước khi dùng ellipsis.

## Interaction States

Trước bản cập nhật này, hover/focus chỉ xuất hiện rải rác (button, input, sidebar, table row) — mỗi nơi một công thức khác nhau. Từ nay, **mọi element tương tác dùng đúng 1 công thức sau**, không tự chế công thức riêng:

| State | Công thức chuẩn | Áp dụng cho |
| --- | --- | --- |
| Hover | Nền tối/nhạt thêm đúng 1 bậc theo cùng tone màu (`{colors.primary}` → `{colors.primary-dark}`; `{colors.canvas-white}` → `{colors.canvas-section}`/`{colors.primary-light}`; item trên nền sidebar `{colors.primary}` → `{colors.primary-dark}`) | Button, sidebar nav item, table row, card có thể click |
| Active/Pressed | Dùng biến thể `-dark` sẵn có, hoặc tối thêm 1 bậc nữa so với hover | Button, toggle, checkbox |
| Focus | `outline: 2px solid {colors.focus-ring}; outline-offset: 2px` — không đổi màu nền/border | Mọi element nhận keyboard focus: button, input, checkbox, toggle, tab, link |
| Disabled | `{colors.disabled-bg}` + `{colors.disabled-text}`, `cursor: not-allowed`, giữ nguyên layout/kích thước | Button, input, checkbox, toggle |
| Loading | Giữ nguyên kích thước, thay nội dung bằng spinner, nền dùng biến thể `-dark`/hover | Button, form submit |

**Token đã có sẵn theo đúng công thức:** `button-primary-hover`, `button-loading`, `button-disabled`, `text-input-focus`, `text-input-error`, `text-input-disabled`, `table-row-hover`.

**Gap đã bổ sung trong bản cập nhật này** (component có tương tác nhưng trước đó thiếu state, vi phạm nguyên tắc #4):

- `card-interactive-hover` — cho `card-task`, `card-task-urgent`, `card-document` khi dùng làm hàng có thể click.
- `checkbox-focus`, `toggle-track-focus` — trước đó 2 component này hoàn toàn không có focus state.

**Quy tắc cho component mới:** nếu component tương tác chưa có token hover/focus riêng trong bảng trên, áp dụng công thức chuẩn theo family màu của nó — không tạo công thức mới. Đây là hệ quả trực tiếp của nguyên tắc #4 trong "Design Principles".

## Do's and Don'ts

### Do

- Dùng `{colors.primary}` cho CTA chính, sidebar active và điểm nhấn thương hiệu.
- Dùng `{colors.semantic-success}`, `{colors.semantic-error}`, `{colors.semantic-warning}`, `{colors.semantic-info}` đúng theo ý nghĩa trạng thái.
- Dùng `{colors.accent}` cho việc khẩn cấp/cần chú ý, không dùng cho destructive action.
- Luôn dùng focus ring `outline: 2px solid {colors.focus-ring}; outline-offset: 2px`.
- Với số liệu kho, số lượng, tiền tệ: dùng `tabular-nums`, phân tách hàng nghìn và định dạng `vi-VN` / `VND` thống nhất.
- Hiển thị status bằng label hoặc icon bên cạnh màu, đặc biệt trong bảng và chart.
- Với badge pill: luôn `white-space: nowrap`, `width: fit-content`, `flex-shrink: 0`.
- Với management/data-heavy screen: chọn `workspace-content`; chỉ dùng `standard-content` khi nội dung thực sự cần giới hạn độ rộng.

### Don't

- Không dùng `{colors.primary}` làm background diện rộng.
- Không dùng `{colors.accent}` cho error, validation hoặc xóa; dùng `{colors.semantic-error}`.
- Không dùng màu là tín hiệu trạng thái duy nhất.
- Không tự tạo badge color ngoài semantic token đã định nghĩa.
- Không dùng emoji thay cho Lucide/Phosphor icon trong UI.
- Không dùng shadow level 3+ cho card thông thường.
- Không cho badge pill xuống nhiều dòng hoặc đặt fixed width chỉ để ép vừa layout.
- Không dùng `max-width: 1200px` như global rule cho workspace/data management.
- Không thêm breakpoint theo tên độ phân giải màn hình nếu không có thay đổi cấu trúc UX.

## Responsive Behavior

### Resolution Independence

Kmarket phải hoạt động độc lập với độ phân giải vật lý của màn hình. **Full HD, 2K, 4K, 21:9, 32:9 chỉ là cấu hình test, không phải layout contract.** Responsive dựa trên CSS viewport/container khả dụng, không dựa trên tên monitor.

- Không giả định người dùng luôn mở browser fullscreen.
- Phải hoạt động khi split-screen, mở DevTools, browser zoom hoặc OS scaling làm thay đổi số CSS pixel khả dụng.
- Breakpoint chỉ quyết định **thay đổi cấu trúc lớn**; kích thước bên trong breakpoint phải tiếp tục fluid.
- Ưu tiên CSS Grid/Flexbox, `minmax()`, `clamp()`, `min()`, `max()` và Container Queries.
- Không dùng `100vw` cho content nằm bên trong app shell có sidebar; dùng `width: 100%` / `flex: 1` từ containing block.
- Không dùng fixed width cho content chính nếu nội dung có thể tận dụng không gian còn lại.
- Component phải hoạt động ở **mọi width nằm giữa hai breakpoint**, không chỉ tại đúng 768/1024/1440px.

Responsive hierarchy:

```text
Viewport
  ↓
App shell
  ↓
Available content width
  ↓
Page pattern / Content Width Mode
  ↓
Container width
  ↓
Component adaptation
```

### Breakpoints

| Name | Width | Key Changes |
| --- | --- | --- |
| Wide | ≥ 1440px | Sidebar 240px; page chọn `standard-content`, `workspace-content` hoặc `reading-content`; layout bên trong tiếp tục fluid |
| Desktop | 1024–1439px | Sidebar 240px, dashboard 3-up widgets |
| Tablet | 768–1023px | Sidebar collapse → 64px icon-only, dashboard 2-up |
| Mobile | < 768px | Sidebar off-canvas (hamburger), dashboard 1-up, topbar rút gọn |

**Không tạo breakpoint riêng chỉ vì màn hình là 1920, 2560, 3440 hay 3840px.** Chỉ thêm breakpoint mới khi có một thay đổi cấu trúc có lý do UX rõ ràng.

### Fluid Sizing Rules

- Dùng giới hạn hữu ích thay vì scale tuyến tính vô hạn. Ví dụ master panel có thể dùng `clamp(360px, 25vw, 440px)` hoặc `minmax(360px, 440px)`.
- Không dùng `%` cho panel có giới hạn đọc rõ ràng nếu nó khiến component phình quá mức trên 4K/ultrawide.
- Detail/workspace có thể full width, nhưng nội dung form/readable bên trong nên có `max-width` riêng; table/matrix có thể rộng hơn.
- Với chiều cao, app shell dùng `min-height: 100dvh`; workspace có thể dùng `height: calc(100dvh - var(--topbar-height))` khi cần pane scroll độc lập.
- Không hard-code chiều cao pixel cho vùng dữ liệu dài; dùng `overflow-y: auto`, `min-height: 0`.

### Container-Responsive Components

Component phức tạp như master-detail, toolbar nhiều action, filter panel hoặc data grid phải phản ứng theo **container width** khi không gian thực tế của component quan trọng hơn viewport.

```css
.component-shell {
  container-type: inline-size;
}

@container (max-width: 900px) {
  /* đổi cấu trúc component khi chính container không còn đủ chỗ */
}
```

Container Query bổ sung cho viewport breakpoint, không thay thế app-level breakpoint.

### Touch Targets

- `button-primary`, `button-secondary`, `button-danger` và button disabled/loading có `minHeight: 44px`; đây là mức tối thiểu cho touch target.
- `button-sm` chỉ dùng ở desktop/table. Trên touch device, wrapper action hoặc icon button phải đạt tối thiểu 44 × 44px.
- Sidebar nav item phải đặt `min-height: 44px`; icon-only control luôn có vùng tương tác tối thiểu 44 × 44px.

### Collapsing Strategy

- **Sidebar**: 240px (full) → 64px icon-only tooltip → off-canvas slide-in. Transition: `{components.motion-standard}`.
- **Dashboard widgets**: 12-col → 6-col → 12-col (1-up) qua grid-column span.
- **Display typography**: dùng tối đa `display-lg` trong app shell; `display-xxl` chỉ cho onboarding hiếm gặp.
- **Topbar**: giữ nguyên 56px nhưng ẩn breadcrumb; chỉ giữ nút menu `<Icon name="menu" />`, logo và avatar.
- **Data tables**: horizontal scroll trên mobile thay vì collapse column — giữ nguyên cấu trúc dữ liệu.

### Chat Module — Responsive

#### Desktop (≥ 1024px) — 3 cột song song

- Layout: `col-channels` (240px, `{colors.canvas-white}`) | `col-conversations` (300px, `{colors.canvas-white}`) | `col-chat` (flex, `{colors.canvas}`).
- Cả 2 cột trái phân biệt bằng `border-right: 1px solid {colors.hairline}`.
- Tất cả 3 cột hiển thị đồng thời mặc định; không có drawer hay navigation stack.

#### Collapse Columns (chỉ Desktop ≥ 1024px)

Mỗi cột trái có thể ẩn hoàn toàn để mở rộng `col-chat`:

- **Collapse**: Nút `collapse-btn` (`<Icon name="chevrons-left"/>`) ở góc phải `panel-header` của từng cột. Click → `width: 0`, `min-width: 0`, `border-right: none`. Transition `250ms ease`, `overflow: hidden`.
- **Expand**: `expand-pill` xuất hiện trên `chat-topbar` khi cột đang collapse; click để mở lại.
- **col-chat**: `flex: 1` — tự dãn chiếm toàn bộ không gian sau khi cột ẩn.
- Hai cột hoạt động độc lập — có thể ẩn một hoặc cả hai.

| Trạng thái | col-channels | col-conversations | expand-pill hiển thị |
| --- | --- | --- | --- |
| Mặc định | 240px | 300px | Không hiện |
| Ẩn Kênh | 0 | 300px | Pill "Kênh" |
| Ẩn Hội thoại | 240px | 0 | Pill "Hội thoại" |
| Ẩn cả hai | 0 | 0 | Cả 2 pill |

#### Tablet (768–1023px) — 2 cột + Drawer

- `col-channels` ẩn off-canvas mặc định (`transform: translateX(-100%)`), `position: fixed`, `z-index: {components.z-drawer}`, `width: 240px`.
- `col-conversations` (280–300px) và `col-chat` (flex) hiển thị song song.
- **Trigger mở Drawer**: Icon button (`<Icon name="layout-list"/>`) bên trái `conv-header`.
- **Drawer animation**: `transform: translateX(-100% → 0)`, `transition: {components.motion-slow}`. Backdrop: `rgba(44,62,80,0.45)`, `backdrop-filter: blur(2px)`.
- **Đóng Drawer**: Tap backdrop / chọn kênh — drawer tự đóng, `conv-header` cập nhật tên kênh.
- **Collapse Columns không áp dụng trên tablet** — chỉ dùng drawer pattern.

#### Mobile (< 768px) — Drill-Down 3 bước (Stack Navigation)

- Chỉ hiển thị **1 màn hình duy nhất** tại một thời điểm; không có layout nhiều cột.
- **Luồng tiến:** KÊNH ① →(tap kênh)→ HỘI THOẠI ② →(tap người)→ CHAT ③
- **Luồng lùi:** CHAT ③ →(nút ←)→ HỘI THOẠI ② →(nút ←)→ KÊNH ①
- **Nút back tại Chat ③**: `←` trên `chat-topbar`, góc trái.
- **Nút back tại Hội thoại ②**: `←` trong `conv-header`; label dynamic theo kênh active.
- **Landscape phone**: Vẫn 1 cột (breakpoint `< 768px` bất kể orientation).
- **Collapse Columns không áp dụng trên mobile** — dùng stack navigation.

#### Shared — mọi breakpoint

- `chat-input-bar` luôn sticky bottom; `min-height: 52px`.
- Nút Send dùng `button-primary` — không tạo token riêng.
- Badge đếm tin chưa đọc dùng `notification-badge` (`{colors.notification}` đỏ) — không tạo token riêng.
- `conv-header` luôn hiển thị tên kênh/người active — không để trống.
- File đính kèm dùng `chat-bubble-attachment`.
- Nút back, Drawer trigger, `collapse-btn`, `expand-pill` đều `min-width/height: 44px` (WCAG AA).

### Modal & Dialog — Responsive

- **Desktop / Tablet (≥ 768px)**: Modal hiển thị centered với `max-width: 560px` (dialog nhỏ) hoặc `max-width: 800px` (modal lớn — xem tài liệu, form phức tạp). Có backdrop `rgba(44,62,80,0.48)`. Shadow level 3.
- **Mobile (< 768px)**: Modal chuyển sang **bottom sheet** — trượt lên từ dưới, `border-radius: 16px 16px 0 0`, chiếm tối đa 90vh. Có drag handle indicator (4px × 32px, màu `{colors.hairline}`) ở trên cùng. Transition: `{components.motion-slow}`.
- **Full-screen modal** (ví dụ: soạn email, xem preview tài liệu): chiếm 100vw × 100vh trên mobile, giữ nguyên centered window trên desktop.
- Backdrop tap để đóng luôn được bật — không áp dụng cho modal yêu cầu action bắt buộc (confirm xóa, ký số).

### Form Layout — Responsive

- **Desktop (≥ 1024px)**: Form có thể dùng 2 cột (CSS grid `repeat(2, 1fr)`, gap 16px) cho các field ngắn (họ tên, ngày tháng, số điện thoại).
- **Tablet (768–1023px)**: Giảm xuống 2 cột nếu field đủ ngắn; field dài (textarea, mô tả) luôn chiếm full width.
- **Mobile (< 768px)**: **Tất cả field đều 1 cột, full width** — không dùng 2-col layout trên mobile. `text-input` và `select-input` tối thiểu 44px height trên mobile (tăng padding: `12px 12px`).
- Button group trong form: Desktop → nút phải (Cancel | Submit); Mobile → 2 nút stack dọc full-width, Submit ở trên.

### Topbar Search & Assets — Responsive

- **Desktop / Wide**: Search bar hiển thị inline trên topbar, `width: 280px`, placeholder "Tìm kiếm toàn hệ thống…".
- **Tablet**: Search thu lại thành button icon `<Icon name="search" />`; tap để mở expanded search overlay toàn topbar.
- **Mobile**: Search là button icon `<Icon name="search" />`; tap mở full-screen search overlay với keyboard auto-focus.
- **Avatar**: Luôn hiển thị `avatar-sm` (28px) trên topbar ở mọi breakpoint — không ẩn.
- **Notification bell**: Hiển thị trên mọi breakpoint; dùng `notification-badge` `{colors.notification}` overlay góc trên phải icon.
- **Icon size theo breakpoint**: Navigation icon 24px (desktop) → 22px (tablet/mobile). Button icon 20px mọi breakpoint.

## Data & Localization

- Dùng `vi-VN` cho ngày/giờ và `VND` cho tiền tệ; không trộn `MM/DD/YYYY`, dấu phẩy-thập phân hoặc ký hiệu tiền tệ kiểu Mỹ.
- Số liệu có thể so sánh trong bảng, KPI và kho hàng phải bật `font-variant-numeric: tabular-nums`.
- Cung cấp density `comfortable` (mặc định) và `compact` cho data table; compact chỉ giảm vertical padding, không giảm cỡ chữ hoặc touch target của action.
- Chart phải có title, đơn vị, legend/label trực tiếp và trạng thái empty/error; không dựa vào màu đơn thuần.

## Iteration Guide

1. Tập trung vào **một component một lần** — tham chiếu trực tiếp token (`{colors.primary}`, `{rounded.md}`).
2. Khi thêm màu mới, kiểm tra contrast ratio với nền canvas và dark surface — tối thiểu 4.5:1 (WCAG AA).
3. Dùng **Inter 400** làm baseline body và chỉ nâng lên **Inter 600** khi cần nhấn mạnh.
4. Mọi interactive element đều phải có `focus` state — dùng `outline: 2px solid {colors.focus-ring}; outline-offset: 2px`.
5. Badge và tag chỉ dùng màu semantic đã định nghĩa — không tự tạo màu badge mới.
6. Khi cần thêm module mới, tạo component riêng theo pattern: `module-name-element` (ví dụ: `warehouse-stock-badge`).
7. Giữ sidebar xanh `{colors.primary}` — đây là architectural decision, không phải style preference.
8. Mọi form field đều phải có `form-label` và `form-helper` (kể cả khi helper rỗng — giữ layout ổn định).
9. Khi cần hiển thị icon, luôn dùng `<Icon>` component từ Lucide/Phosphor — **KHÔNG dùng emoji** dưới bất kỳ hình thức nào trong UI.
10. Trước khi tạo card/badge/button mới, đối chiếu với bảng vai trò trong "Card System" — nếu nội dung map được vào token đã có, dùng lại thay vì tạo biến thể mới (nguyên tắc #3 và #5 trong "Design Principles").
11. Trước khi code một page mới, chọn rõ `Content Width Mode`: `standard-content`, `workspace-content` hoặc `reading-content`; không mặc định dùng 1200px.
12. Với màn quản trị/master-detail, áp dụng "Management Screen Patterns" trước khi tự tạo tỷ lệ cột.
13. Test responsive bằng **available width** và các width trung gian/ngẫu nhiên, không chỉ snapshot Full HD/2K/4K. Tối thiểu kiểm tra mobile, tablet, desktop, wide, split-screen và một ultrawide.
14. Nếu component có thể bị bó bởi parent độc lập với viewport, dùng Container Query hoặc behavior tương đương thay vì thêm viewport breakpoint tùy tiện.
15. Kiểm tra mọi flex/grid child quan trọng có `min-width: 0`; panel scroll dọc có `min-height: 0` để tránh overflow/co rút bất ngờ.
