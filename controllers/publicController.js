const { validationResult } = require("express-validator");
const tripModel = require("../models/tripModel");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const cartSession = require("../models/cartSession");

const defaultCheckoutForm = {
  receiver_name: "",
  receiver_phone: "",
  guest_email: "",
  guest_phone: "",
  shipping_address: "",
  province: "",
  city: "",
  postal_code: "",
  checkout_notes: "",
  payment_method: "qris_mnc",
};

const buildCheckoutForm = (data = {}) => ({
  receiver_name: data.receiver_name || "",
  receiver_phone: data.receiver_phone || "",
  guest_email: data.guest_email || "",
  guest_phone: data.guest_phone || "",
  shipping_address: data.shipping_address || "",
  province: data.province || "",
  city: data.city || "",
  postal_code: data.postal_code || "",
  checkout_notes: data.checkout_notes || "",
  payment_method: data.payment_method || "qris_mnc",
});

const renderCheckout = (res, cart, form, checkoutError = "", status = 200) => {
  return res.status(status).render("public/checkout", {
    title: "Checkout",
    cart,
    form,
    checkoutError,
  });
};

const extractValidationMessage = (req) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return "";
  }

  return errors.array()[0]?.msg || "Please review your input.";
};

exports.home = (_req, res) => {
  return res.render("public/home", {
    title: "Jastip Platform",
  });
};

exports.publicTripDetail = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const trip = await tripModel.findPublicBySlug(slug);
    if (!trip) {
      return res.status(404).render("errors/404", {
        title: "Trip Not Found",
        message: "This trip link is not available or has been unpublished.",
      });
    }

    const products = await productModel.listPublicByTripId(trip.id);
    return res.render("public/trip-detail", {
      title: trip.title,
      trip,
      products,
      slug,
    });
  } catch (error) {
    return next(error);
  }
};

exports.publicProductDetail = async (req, res, next) => {
  try {
    const { slug, productSlug } = req.params;
    const trip = await tripModel.findPublicBySlug(slug);
    if (!trip) {
      return res.status(404).render("errors/404", {
        title: "Trip Not Found",
        message: "This trip link is not available or has been unpublished.",
      });
    }

    const product = await productModel.findPublicByTripAndSlug(trip.id, productSlug);
    if (!product) {
      return res.status(404).render("errors/404", {
        title: "Product Not Found",
        message: "This product is hidden or unavailable for this trip.",
      });
    }

    const images = await productModel.listImagesByProductId(product.id);
    return res.render("public/product-detail", {
      title: product.name,
      slug,
      trip,
      product,
      images,
      productSlug,
    });
  } catch (error) {
    return next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const validationError = extractValidationMessage(req);
    if (validationError) {
      req.flash("error", validationError);
      return res.redirect("back");
    }

    const productId = Number(req.body.product_id);
    const quantity = Number(req.body.quantity);
    const note = (req.body.note || "").trim();

    const products = await productModel.findPublicByIds([productId]);
    const product = products[0];
    if (!product) {
      req.flash("error", "Product is no longer available.");
      return res.redirect("back");
    }

    if (product.product_status !== "published") {
      req.flash("error", "Only published products can be added to cart.");
      return res.redirect(`/trip/${product.trip_slug}/product/${product.slug}`);
    }

    const currentCart = cartSession.getCart(req);
    const existingQty =
      currentCart.items.find((item) => item.product_id === productId)?.quantity || 0;
    if (quantity + existingQty > Number(product.stock || 0)) {
      req.flash("error", "Requested quantity exceeds available stock.");
      return res.redirect(`/trip/${product.trip_slug}/product/${product.slug}`);
    }

    cartSession.addItem(req, productId, quantity, note);
    req.flash("success", "Product added to cart.");
    return res.redirect("/cart");
  } catch (error) {
    return next(error);
  }
};

exports.cart = async (req, res, next) => {
  try {
    const cart = await cartSession.hydrateCart(req);
    return res.render("public/cart", {
      title: "Cart",
      cart,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const validationError = extractValidationMessage(req);
    if (validationError) {
      req.flash("error", validationError);
      return res.redirect("/cart");
    }

    const productId = Number(req.params.itemId);
  const quantity = Number(req.body.quantity);
  const note = (req.body.note || "").trim();

    const products = await productModel.findPublicByIds([productId]);
    const product = products[0];
    if (!product) {
      cartSession.removeItem(req, productId);
      req.flash("error", "Product no longer available and removed from cart.");
      return res.redirect("/cart");
    }

    if (quantity > Number(product.stock || 0)) {
      req.flash("error", "Requested quantity exceeds available stock.");
      return res.redirect("/cart");
    }

    const updated = cartSession.setItemQuantity(req, productId, quantity, note);
    if (!updated) {
      req.flash("error", "Cart item not found.");
      return res.redirect("/cart");
    }

    req.flash("success", "Cart updated.");
    return res.redirect("/cart");
  } catch (error) {
    return next(error);
  }
};

exports.removeCartItem = (req, res) => {
  const productId = Number(req.params.itemId);
  cartSession.removeItem(req, productId);
  req.flash("success", "Item removed from cart.");
  return res.redirect("/cart");
};

exports.checkout = async (req, res, next) => {
  try {
    const cart = await cartSession.hydrateCart(req);
    if (!cart.items.length) {
      req.flash("error", "Your cart is empty.");
      return res.redirect("/cart");
    }

    return renderCheckout(res, cart, defaultCheckoutForm, "");
  } catch (error) {
    return next(error);
  }
};

exports.placeOrder = async (req, res, next) => {
  try {
    const cart = await cartSession.hydrateCart(req);
    if (!cart.items.length) {
      req.flash("error", "Your cart is empty.");
      return res.redirect("/cart");
    }

    const validationError = extractValidationMessage(req);
    if (validationError) {
      return renderCheckout(res, cart, buildCheckoutForm(req.body), validationError, 422);
    }

    if (cart.trip_count > 1) {
      return renderCheckout(
        res,
        cart,
        buildCheckoutForm(req.body),
        "Current checkout supports one trip per order. Please checkout each trip separately.",
        422,
      );
    }

    const productIds = cart.items.map((item) => item.product_id);
    const latestProducts = await orderModel.getProductsForCheckout(productIds);
    const latestProductMap = new Map(latestProducts.map((product) => [Number(product.id), product]));
    const unavailableItems = [];
    const normalizedItems = [];

    for (const item of cart.items) {
      const latest = latestProductMap.get(item.product_id);
      if (!latest) {
        unavailableItems.push(`${item.name} (no longer available)`);
        continue;
      }

      if (latest.product_status !== "published") {
        unavailableItems.push(`${item.name} (not published)`);
        continue;
      }

      if (Number(item.quantity) > Number(latest.stock || 0)) {
        unavailableItems.push(`${item.name} (insufficient stock)`);
        continue;
      }

      const quantity = Number(item.quantity);
      const basePrice = Number(latest.base_price || 0);
      const jastipFee = Number(latest.jastip_fee || 0);
      normalizedItems.push({
        product_id: Number(latest.id),
        trip_id: Number(latest.trip_id),
        jastiper_id: Number(latest.user_id),
        name: latest.name,
        quantity,
        note: item.note || null,
        base_price: basePrice,
        jastip_fee: jastipFee,
        line_total: (basePrice + jastipFee) * quantity,
        currency: latest.currency || "IDR",
      });
    }

    if (unavailableItems.length || !normalizedItems.length) {
      const msg = unavailableItems.length
        ? `Please review your cart: ${unavailableItems.join(", ")}`
        : "Your cart items are no longer available.";
      return renderCheckout(res, cart, buildCheckoutForm(req.body), msg, 422);
    }

    const tripIds = new Set(normalizedItems.map((item) => item.trip_id));
    const jastiperIds = new Set(normalizedItems.map((item) => item.jastiper_id));
    const currencies = new Set(normalizedItems.map((item) => item.currency));
    if (tripIds.size > 1 || jastiperIds.size > 1 || currencies.size > 1) {
      return renderCheckout(
        res,
        cart,
        buildCheckoutForm(req.body),
        "Mixed trip, jastiper, or currency is not supported in one checkout.",
        422,
      );
    }

    const subtotalAmount = normalizedItems.reduce(
      (sum, item) => sum + item.base_price * item.quantity,
      0,
    );
    const jastipFeeAmount = normalizedItems.reduce(
      (sum, item) => sum + item.jastip_fee * item.quantity,
      0,
    );
    const totalAmount = subtotalAmount + jastipFeeAmount;
    const orderCode = orderModel.generateOrderCode();

    const buyerId = req.session.user?.role === "buyer" ? req.session.user.id : null;
    const checkoutMode = buyerId ? "account" : "guest";
    const tripId = [...tripIds][0];
    const jastiperId = [...jastiperIds][0];
    const currency = normalizedItems[0].currency || "IDR";

    const orderPayload = {
      order_code: orderCode,
      buyer_id: buyerId,
      guest_email: req.body.guest_email || null,
      guest_phone: req.body.guest_phone || null,
      checkout_mode: checkoutMode,
      jastiper_id: jastiperId,
      trip_id: tripId,
      receiver_name: req.body.receiver_name,
      receiver_phone: req.body.receiver_phone,
      shipping_address: req.body.shipping_address,
      province: req.body.province,
      city: req.body.city,
      postal_code: req.body.postal_code,
      checkout_notes: req.body.checkout_notes || null,
      status: "awaiting_payment",
      payment_status: "pending",
      subtotal_amount: subtotalAmount,
      jastip_fee_amount: jastipFeeAmount,
      total_amount: totalAmount,
      currency,
    };

    const orderItems = normalizedItems.map((item) => ({
      product_id: item.product_id,
      product_variant_id: null,
      product_name_snapshot: item.name,
      variant_snapshot: null,
      quantity: item.quantity,
      unit_price: item.base_price,
      jastip_fee: item.jastip_fee,
      line_total: item.line_total,
      note: item.note,
    }));

    const orderId = await orderModel.createOrderWithItems(orderPayload, orderItems);
    cartSession.clearCart(req);
    req.flash(
      "success",
      `Order ${orderCode} created successfully. Continue to payment in next stage.`,
    );
    return res.redirect(`/checkout/success?order_id=${orderId}`);
  } catch (error) {
    return next(error);
  }
};

exports.checkoutSuccess = async (req, res, next) => {
  try {
    const orderId = Number(req.query.order_id);
    if (!orderId) {
      return res.status(404).render("errors/404", {
        title: "Order Not Found",
        message: "Order confirmation is not available.",
      });
    }

    const order = await orderModel.findOrderWithItemsById(orderId);
    if (!order) {
      return res.status(404).render("errors/404", {
        title: "Order Not Found",
        message: "Order confirmation is not available.",
      });
    }

    return res.render("public/checkout-success", {
      title: "Order Created",
      order,
    });
  } catch (error) {
    return next(error);
  }
};
