import { useState, useEffect } from "react";
import { Customer, Product, OrderItem, Order } from "@/types";
import { PROVINCES, DISTRICTS, WARDS, PRODUCTS } from "@/data/mockData";

export function useOrderCreator(
  customer: Customer | undefined,
  onCreateOrder: (order: Order) => void
) {
  // Customer details forms
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [wardCode, setWardCode] = useState("");

  // Product Cart items
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [shippingFee, setShippingFee] = useState(30000);
  const [discount, setDiscount] = useState(0);
  const [carrier, setCarrier] = useState("GHTK");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANKING">("COD");
  const [customerNote, setCustomerNote] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("Cho xem hàng");

  // Local helper state
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "create">("info");
  const [copiedText, setCopiedText] = useState(false);

  // Sync inputs with selected customer
  useEffect(() => {
    if (customer) {
      setCustomerName(customer.name || "");
      setPhone(customer.phone || "");
      setAddress(customer.address || "");
      setProvinceCode(customer.provinceCode || "");
      setDistrictCode(customer.districtCode || "");
      setWardCode(customer.wardCode || "");

      // Auto assign some default products based on customer interests to make it super intuitive
      if (customer.id === "cust-1" && cartItems.length === 0) {
        const p = PRODUCTS.find(x => x.id === "prod-1");
        if (p) setCartItems([{ id: "item-1", product: p, quantity: 1, price: 290000 }]);
      } else if (customer.id === "cust-2" && cartItems.length === 0) {
        const p = PRODUCTS.find(x => x.id === "prod-2");
        if (p) setCartItems([{ id: "item-2", product: p, quantity: 1, price: 180000 }]);
      } else if (customer.id === "cust-3" && cartItems.length === 0) {
        const p = PRODUCTS.find(x => x.id === "prod-3");
        if (p) setCartItems([{ id: "item-3", product: p, quantity: 3, price: 150000 }]);
      } else if (customer.id === "cust-4" && cartItems.length === 0) {
        const p = PRODUCTS.find(x => x.id === "prod-5");
        if (p) setCartItems([{ id: "item-5", product: p, quantity: 1, price: 120000 }]);
      } else if (customer.id === "cust-5" && cartItems.length === 0) {
        const p = PRODUCTS.find(x => x.id === "prod-4");
        if (p) setCartItems([{ id: "item-4", product: p, quantity: 1, price: 450000 }]);
      }
    } else {
      setCustomerName("");
      setPhone("");
      setAddress("");
      setProvinceCode("");
      setDistrictCode("");
      setWardCode("");
      setCartItems([]);
    }
  }, [customer]);

  const availableDistricts = DISTRICTS.filter((d) => d.provinceCode === provinceCode);
  const availableWards = WARDS.filter((w) => w.districtCode === districtCode);

  const addProductToCart = (product: Product) => {
    const existing = cartItems.find((item) => item.product.id === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantity + 1);
    } else {
      setCartItems([
        ...cartItems,
        {
          id: `item-${Date.now()}`,
          product,
          quantity: 1,
          price: product.price,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, q: number) => {
    if (q <= 0) {
      setCartItems(cartItems.filter((item) => item.product.id !== productId));
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.product.id === productId ? { ...item, quantity: q } : item
        )
      );
    }
  };

  const removeItem = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.product.id !== productId));
  };

  const subTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = Math.max(0, subTotal + shippingFee - discount);

  useEffect(() => {
    if (subTotal >= 500000) {
      setShippingFee(0);
    } else if (subTotal > 0) {
      setShippingFee(30000);
    }
  }, [subTotal]);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone) {
      alert("Họ tên và Số điện thoại khách hàng là bắt buộc!");
      return;
    }
    if (cartItems.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm!");
      return;
    }

    const orderCode = `PAN-${Math.floor(100000 + Math.random() * 900000)}`;
    const provName = PROVINCES.find(p => p.code === provinceCode)?.name || "";
    const distName = DISTRICTS.find(d => d.code === districtCode)?.name || "";
    const wardName = WARDS.find(w => w.code === wardCode)?.name || "";

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderCode,
      customerId: customer?.id || "walk-in",
      customerName,
      phone,
      fullAddress: address,
      province: provName,
      district: distName,
      ward: wardName,
      items: cartItems,
      shippingFee,
      discount,
      total,
      carrier,
      paymentMethod,
      note: customerNote,
      deliveryNote,
      status: "pending",
      orderTime: new Date(),
    };

    onCreateOrder(newOrder);
    setStatusMessage(`🎉 BÙM CHÍU! Đã chốt thành công đơn hàng ${orderCode} cho chị/anh ${customerName}!`);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };

      playTone(523.25, now, 0.4);
      playTone(659.25, now + 0.1, 0.4);
      playTone(783.99, now + 0.2, 0.5);
      playTone(1046.50, now + 0.35, 0.7);
    } catch (e) {
    }

    setCartItems([]);
    setDiscount(0);
    setCustomerNote("");

    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  const copyBankDetails = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return {
    customerName, setCustomerName,
    phone, setPhone,
    address, setAddress,
    provinceCode, setProvinceCode,
    districtCode, setDistrictCode,
    wardCode, setWardCode,
    cartItems, setCartItems,
    shippingFee, setShippingFee,
    discount, setDiscount,
    carrier, setCarrier,
    paymentMethod, setPaymentMethod,
    customerNote, setCustomerNote,
    deliveryNote, setDeliveryNote,
    statusMessage, setStatusMessage,
    activeTab, setActiveTab,
    copiedText, setCopiedText,
    availableDistricts, availableWards,
    addProductToCart, updateQuantity, removeItem,
    subTotal, total,
    handleSubmitOrder, copyBankDetails
  };
}
