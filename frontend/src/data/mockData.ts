import { Platform, Province, District, Ward, Product, Tag, QuickReply, Customer } from "../types";

export const PROVINCES: Province[] = [
  { code: "HN", name: "Hà Nội" },
  { code: "HCM", name: "TP. Hồ Chí Minh" },
  { code: "DN", name: "Đà Nẵng" },
  { code: "CT", name: "Cần Thơ" },
  { code: "HP", name: "Hải Phòng" },
];

export const DISTRICTS: District[] = [
  { code: "HN-CG", provinceCode: "HN", name: "Quận Cầu Giấy" },
  { code: "HN-HK", provinceCode: "HN", name: "Quận Hoàn Kiếm" },
  { code: "HN-DD", provinceCode: "HN", name: "Quận Đống Đa" },
  { code: "HCM-Q1", provinceCode: "HCM", name: "Quận 1" },
  { code: "HCM-Q3", provinceCode: "HCM", name: "Quận 3" },
  { code: "HCM-BT", provinceCode: "HCM", name: "Quận Bình Thạnh" },
  { code: "HCM-TD", provinceCode: "HCM", name: "TP. Thủ Đức" },
  { code: "DN-HC", provinceCode: "DN", name: "Quận Hải Châu" },
  { code: "DN-ST", provinceCode: "DN", name: "Quận Sơn Trà" },
  { code: "CT-NK", provinceCode: "CT", name: "Quận Ninh Kiều" },
  { code: "CT-CR", provinceCode: "CT", name: "Quận Cái Răng" },
];

export const WARDS: Ward[] = [
  { code: "HN-CG-DV", districtCode: "HN-CG", name: "Phường Dịch Vọng" },
  { code: "HN-CG-YH", districtCode: "HN-CG", name: "Phường Yên Hòa" },
  { code: "HN-CG-QH", districtCode: "HN-CG", name: "Phường Quan Hoa" },
  { code: "HN-HK-HT", districtCode: "HN-HK", name: "Phường Hàng Trống" },
  { code: "HN-HK-HB", districtCode: "HN-HK", name: "Phường Hàng Bạc" },
  { code: "HCM-Q1-BN", districtCode: "HCM-Q1", name: "Phường Bến Nghé" },
  { code: "HCM-Q1-DK", districtCode: "HCM-Q1", name: "Phường Đa Kao" },
  { code: "HCM-BT-P25", districtCode: "HCM-BT", name: "Phường 25" },
  { code: "HCM-BT-P15", districtCode: "HCM-BT", name: "Phường 15" },
  { code: "DN-HC-TB", districtCode: "DN-HC", name: "Phường Thuận Phước" },
  { code: "DN-HC-HA", districtCode: "DN-HC", name: "Phường Hòa Thuận Đông" },
  { code: "CT-NK-AK", districtCode: "CT-NK", name: "Phường An Khánh" },
  { code: "CT-NK-AP", districtCode: "CT-NK", name: "Phường An Phú" },
];

export const TAGS: Tag[] = [
  { id: "tag-completed", name: "Đã chốt đơn", color: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium" },
  { id: "tag-phone", name: "Có SĐT", color: "bg-pink-100 text-pink-800 border border-pink-300 font-medium" },
  { id: "tag-vip", name: "Khách VIP", color: "bg-amber-100 text-amber-800 border border-amber-300 font-medium" },
  { id: "tag-consulting", name: "Cần tư vấn", color: "bg-blue-100 text-blue-800 border border-blue-300 font-medium" },
  { id: "tag-pending-pay", name: "Chờ ck", color: "bg-purple-100 text-purple-800 border border-purple-300 font-medium" },
  { id: "tag-cancelled", name: "Hủy đơn", color: "bg-rose-100 text-rose-800 border border-rose-300 font-medium" },
];

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Váy Hoa Nhí Vintage Hàn Quốc",
    sku: "VHN-HQ-01",
    price: 290000,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=150&auto=format&fit=crop&q=80",
    stock: 45,
  },
  {
    id: "prod-2",
    name: "Áo Thun Unisex Streetwear Basic",
    sku: "ATU-SW-02",
    price: 180000,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150&auto=format&fit=crop&q=80",
    stock: 120,
  },
  {
    id: "prod-3",
    name: "Son Tint Lì Siêu Mướt LipGlaze Sparkle",
    sku: "STL-LG-03",
    price: 150000,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=150&auto=format&fit=crop&q=80",
    stock: 80,
  },
  {
    id: "prod-4",
    name: "Giày Sneaker Sport Trắng Chunky",
    sku: "GST-CK-04",
    price: 450000,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150&auto=format&fit=crop&q=80",
    stock: 32,
  },
  {
    id: "prod-5",
    name: "Kính Mát Thời Trang Chống UV Cao Cấp",
    sku: "KMT-UV-05",
    price: 120000,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=150&auto=format&fit=crop&q=80",
    stock: 55,
  },
];

export const QUICK_REPLIES: QuickReply[] = [
  {
    id: "qr-1",
    shortcut: "/sdt",
    text: "Dạ, anh/chị cho em xin số điện thoại và địa chỉ nhận hàng cụ thể để em kiểm tra phí ship và lên đơn giao hàng ngay cho mình nhé ạ! ❤️",
    description: "Xin SĐT & Địa chỉ",
  },
  {
    id: "qr-2",
    shortcut: "/price",
    text: "Dạ sản phẩm này bên em đang có giá ưu đãi đặc biệt là {price}đ và đang được áp dụng voucher giảm giá hấp dẫn ạ! Anh/chị lấy size nào để em check kho báo mình nha.",
    description: "Báo giá ưu đãi",
  },
  {
    id: "qr-3",
    shortcut: "/ship",
    text: "Dạ bên em đồng giá ship toàn quốc là 30.000đ ạ. Đặc biệt nếu anh/chị mua hóa đơn từ 500.000đ trở lên bên em sẽ miễn phí vận chuyển (Freeship) hoàn toàn nhé!",
    description: "Báo phí vận chuyển",
  },
  {
    id: "qr-4",
    shortcut: "/ck",
    text: "Dạ anh/chị có thể thanh toán chuyển khoản qua tài khoản ngân hàng của shop để nhận quà tặng kèm ạ:\n- Ngân hàng: Vietcombank\n- Số TK: 1023948573\n- Chủ TK: NGUYEN VAN A\nSau khi chuyển khoản mình gửi kèm ảnh chụp hóa đơn giao dịch giúp em nha!",
    description: "Thông tin chuyển khoản",
  },
  {
    id: "qr-5",
    shortcut: "/goi",
    text: "Dạ nhân viên CSKH bên em sẽ liên hệ trực tiếp cho anh/chị qua số điện thoại này trong ít phút nữa để tư vấn chi tiết hơn ạ. Anh/chị chú ý điện thoại giúp em nhé!",
    description: "Hẹn điện thoại tư vấn",
  },
];

// Để trống dữ liệu cuộc trò chuyện và khách hàng ảo để không hiển thị lên giao diện
export const INITIAL_CUSTOMERS: Customer[] = [];
