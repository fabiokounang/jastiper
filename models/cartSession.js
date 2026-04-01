const productModel = require("./productModel");

const CART_SESSION_KEY = "guestCart";

const normalizeCart = (cart) => {
  if (!cart || typeof cart !== "object") {
    return { items: [] };
  }

  if (!Array.isArray(cart.items)) {
    return { items: [] };
  }

  return {
    items: cart.items
      .map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        note: item.note ? String(item.note).slice(0, 255) : "",
      }))
      .filter((item) => Number.isInteger(item.product_id) && item.product_id > 0 && item.quantity > 0),
  };
};

const getCart = (req) => {
  const normalized = normalizeCart(req.session[CART_SESSION_KEY]);
  req.session[CART_SESSION_KEY] = normalized;
  return normalized;
};

const setCart = (req, cart) => {
  req.session[CART_SESSION_KEY] = normalizeCart(cart);
};

const addItem = (req, productId, quantity, note = "") => {
  const cart = getCart(req);
  const targetProductId = Number(productId);
  const qty = Number(quantity);

  const existing = cart.items.find((item) => item.product_id === targetProductId);
  if (existing) {
    existing.quantity += qty;
    existing.note = note || existing.note || "";
  } else {
    cart.items.push({
      product_id: targetProductId,
      quantity: qty,
      note: note || "",
    });
  }

  setCart(req, cart);
  return cart;
};

const setItemQuantity = (req, productId, quantity, note = "") => {
  const cart = getCart(req);
  const targetProductId = Number(productId);
  const qty = Number(quantity);

  const item = cart.items.find((entry) => entry.product_id === targetProductId);
  if (!item) {
    return false;
  }

  item.quantity = qty;
  item.note = note || "";
  setCart(req, cart);
  return true;
};

const updateItem = (req, productId, quantity, note = "") => {
  const cart = getCart(req);
  const targetProductId = Number(productId);
  const qty = Number(quantity);

  cart.items = cart.items.map((item) => {
    if (item.product_id !== targetProductId) {
      return item;
    }

    return {
      ...item,
      quantity: qty,
      note: note || "",
    };
  });

  setCart(req, cart);
  return cart;
};

const removeItem = (req, productId) => {
  const cart = getCart(req);
  const targetProductId = Number(productId);
  cart.items = cart.items.filter((item) => item.product_id !== targetProductId);
  setCart(req, cart);
  return cart;
};

const clearCart = (req) => {
  setCart(req, { items: [] });
};

const hydrateCart = async (req) => {
  const cart = getCart(req);
  if (!cart.items.length) {
    return {
      items: [],
      subtotal_amount: 0,
      jastip_fee_amount: 0,
      total_amount: 0,
      currency: "IDR",
      trip_count: 0,
    };
  }

  const productIds = cart.items.map((item) => item.product_id);
  const products = await productModel.findPublicByIds(productIds);
  const productMap = new Map(products.map((product) => [Number(product.id), product]));

  const items = [];
  let subtotal = 0;
  let fee = 0;
  let total = 0;
  let currency = "IDR";
  const tripIds = new Set();

  for (const cartItem of cart.items) {
    const product = productMap.get(Number(cartItem.product_id));
    if (!product) {
      continue;
    }

    const quantity = Math.max(1, Number(cartItem.quantity));
    const basePrice = Number(product.base_price || 0);
    const jastipFee = Number(product.jastip_fee || 0);
    const lineSubtotal = basePrice * quantity;
    const lineFee = jastipFee * quantity;
    const lineTotal = lineSubtotal + lineFee;

    subtotal += lineSubtotal;
    fee += lineFee;
    total += lineTotal;
    currency = product.currency || currency;
    tripIds.add(Number(product.trip_id));

    items.push({
      product_id: Number(product.id),
      trip_id: Number(product.trip_id),
      product_slug: product.slug,
      trip_slug: product.trip_slug,
      name: product.name,
      quantity,
      note: cartItem.note || "",
      base_price: basePrice,
      jastip_fee: jastipFee,
      unit_price: basePrice + jastipFee,
      line_subtotal: lineSubtotal,
      line_fee: lineFee,
      line_total: lineTotal,
      currency: product.currency || "IDR",
      availability_status: product.availability_status,
      product_status: product.product_status,
      primary_image: product.primary_image || null,
      stock: Number(product.stock || 0),
      jastiper_id: Number(product.user_id),
    });
  }

  return {
    items,
    subtotal_amount: subtotal,
    jastip_fee_amount: fee,
    total_amount: total,
    currency,
    trip_count: tripIds.size,
  };
};

module.exports = {
  CART_SESSION_KEY,
  getCart,
  setCart,
  addItem,
  setItemQuantity,
  updateItem,
  removeItem,
  clearCart,
  hydrateCart,
};
