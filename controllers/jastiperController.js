const tripModel = require("../models/tripModel");
const productModel = require("../models/productModel");
const slugify = require("../utils/slugify");

const toDateInput = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const toDateTimeInput = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
};

const buildTripPayload = (body, file, userId) => ({
  user_id: userId,
  title: body.title,
  slug: body.slug || slugify(body.title),
  destination_country: body.destination_country,
  destination_city: body.destination_city,
  cover_image: file ? `/uploads/${file.filename}` : null,
  start_date: body.start_date,
  end_date: body.end_date,
  estimated_arrival_date: body.estimated_arrival_date || null,
  order_deadline: body.order_deadline || null,
  description: body.description || null,
  notes: body.notes || null,
  jastip_fee_policy: body.jastip_fee_policy || null,
  currency: body.currency || "IDR",
  status: body.status || "draft",
  is_public:
    (body.status || "draft") === "published" || (body.status || "draft") === "active",
  published_at:
    (body.status || "draft") === "published" || (body.status || "draft") === "active"
      ? new Date()
      : null,
});

const buildProductPayload = (body, file, userId) => ({
  user_id: userId,
  trip_id: Number(body.trip_id),
  name: body.name,
  slug: body.slug || slugify(body.name),
  category: body.category || null,
  brand: body.brand || null,
  sku: body.sku || null,
  description: body.description || null,
  base_price: Number(body.base_price || 0),
  jastip_fee: Number(body.jastip_fee || 0),
  final_price_estimate:
    body.final_price_estimate !== undefined &&
    body.final_price_estimate !== null &&
    body.final_price_estimate !== ""
      ? Number(body.final_price_estimate)
      : Number(body.base_price || 0) + Number(body.jastip_fee || 0),
  currency: body.currency || "IDR",
  stock: body.stock || 0,
  weight: body.weight || null,
  purchase_location: body.purchase_location || null,
  preorder_type: body.preorder_type || null,
  availability_status: body.availability_status || "available",
  product_status: body.product_status || "draft",
  notes: body.notes || null,
  tags: body.tags || null,
  image_path: file ? `/uploads/${file.filename}` : null,
});

const buildTripFormData = (data = {}) => ({
  title: data.title || "",
  slug: data.slug || "",
  destination_country: data.destination_country || "",
  destination_city: data.destination_city || "",
  start_date: toDateInput(data.start_date),
  end_date: toDateInput(data.end_date),
  estimated_arrival_date: toDateInput(data.estimated_arrival_date),
  order_deadline: toDateTimeInput(data.order_deadline),
  description: data.description || "",
  notes: data.notes || "",
  jastip_fee_policy: data.jastip_fee_policy || "",
  currency: data.currency || "IDR",
  status: data.status || "draft",
  cover_image: data.cover_image || null,
});

const buildProductFormData = (data = {}) => ({
  trip_id: data.trip_id || "",
  name: data.name || "",
  slug: data.slug || "",
  category: data.category || "",
  brand: data.brand || "",
  sku: data.sku || "",
  description: data.description || "",
  base_price: data.base_price || "",
  jastip_fee: data.jastip_fee || 0,
  final_price_estimate: data.final_price_estimate || "",
  currency: data.currency || "IDR",
  stock: data.stock || 0,
  weight: data.weight || "",
  purchase_location: data.purchase_location || "",
  preorder_type: data.preorder_type || "",
  availability_status: data.availability_status || "available",
  product_status: data.product_status || "draft",
  notes: data.notes || "",
  tags: data.tags || "",
});

exports.dashboard = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const summary = await tripModel.getDashboardSummary(userId);

    return res.render("jastiper/dashboard", {
      title: "Jastiper Dashboard",
      summary,
    });
  } catch (error) {
    return next(error);
  }
};

exports.profile = (_req, res) => {
  return res.render("jastiper/profile", {
    title: "Jastiper Profile",
  });
};

exports.listTrips = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const trips = await tripModel.getTripsByUser(userId);

    return res.render("jastiper/trips-list", {
      title: "My Trips",
      trips,
    });
  } catch (error) {
    return next(error);
  }
};

exports.showCreateTrip = (_req, res) => {
  return res.render("jastiper/trips-create", {
    title: "Create Trip",
    old: buildTripFormData(),
    formError: "",
  });
};

exports.createTrip = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const payload = buildTripPayload(req.body, req.file, userId);
    const existing = await tripModel.findBySlug(payload.slug);

    if (existing) {
      return res.status(409).render("jastiper/trips-create", {
        title: "Create Trip",
        old: buildTripFormData(req.body),
        formError: "Trip slug already exists. Please use a different slug.",
      });
    }

    await tripModel.createTrip(payload);
    req.flash("success", "Trip created successfully.");
    return res.redirect("/jastiper/trips");
  } catch (error) {
    return next(error);
  }
};

exports.showEditTrip = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const userId = req.session.user.id;
    const trip = await tripModel.getTripByIdAndUser(tripId, userId);

    if (!trip) {
      return res.status(404).render("errors/404", {
        title: "Trip Not Found",
        message: "Trip is not found or inaccessible.",
      });
    }

    return res.render("jastiper/trips-edit", {
      title: "Edit Trip",
      trip: {
        ...buildTripFormData(trip),
        id: trip.id,
        cover_image: trip.cover_image,
      },
      formError: "",
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateTrip = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const userId = req.session.user.id;
    const current = await tripModel.getTripByIdAndUser(tripId, userId);

    if (!current) {
      return res.status(404).render("errors/404", {
        title: "Trip Not Found",
        message: "Trip is not found or inaccessible.",
      });
    }

    const payload = buildTripPayload(req.body, req.file, userId);
    if (!req.file) {
      payload.cover_image = current.cover_image;
    }

    const conflict = await tripModel.findBySlug(payload.slug);
    if (conflict && conflict.id !== tripId) {
      return res.status(409).render("jastiper/trips-edit", {
        title: "Edit Trip",
        trip: {
          ...buildTripFormData(current),
          ...buildTripFormData(req.body),
          id: current.id,
          cover_image: current.cover_image,
        },
        formError: "Trip slug already exists. Please use a different slug.",
      });
    }

    await tripModel.updateTrip(tripId, userId, payload);
    req.flash("success", "Trip updated successfully.");
    return res.redirect("/jastiper/trips");
  } catch (error) {
    return next(error);
  }
};

exports.deleteTrip = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const userId = req.session.user.id;
    await tripModel.deleteTrip(tripId, userId);
    req.flash("success", "Trip deleted.");
    return res.redirect("/jastiper/trips");
  } catch (error) {
    return next(error);
  }
};

exports.publishTrip = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const userId = req.session.user.id;
    await tripModel.updateTripStatus(tripId, userId, "published", true);
    req.flash("success", "Trip published.");
    return res.redirect("/jastiper/trips");
  } catch (error) {
    return next(error);
  }
};

exports.unpublishTrip = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const userId = req.session.user.id;
    await tripModel.updateTripStatus(tripId, userId, "draft", false);
    req.flash("success", "Trip moved to draft.");
    return res.redirect("/jastiper/trips");
  } catch (error) {
    return next(error);
  }
};

exports.closeTrip = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const userId = req.session.user.id;
    await tripModel.updateTripStatus(tripId, userId, "closed", false);
    req.flash("success", "Trip closed.");
    return res.redirect("/jastiper/trips");
  } catch (error) {
    return next(error);
  }
};

exports.duplicateTrip = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const userId = req.session.user.id;
    const source = await tripModel.getTripByIdAndUser(tripId, userId);

    if (!source) {
      return res.status(404).render("errors/404", {
        title: "Trip Not Found",
        message: "Trip is not found or inaccessible.",
      });
    }

    const duplicatedTitle = `${source.title} Copy`;
    const duplicatedSlug = `${slugify(duplicatedTitle)}-${Date.now()}`;
    await tripModel.createTrip({
      user_id: userId,
      title: duplicatedTitle,
      slug: duplicatedSlug,
      destination_country: source.destination_country,
      destination_city: source.destination_city,
      cover_image: source.cover_image,
      start_date: source.start_date,
      end_date: source.end_date,
      estimated_arrival_date: source.estimated_arrival_date,
      order_deadline: source.order_deadline,
      description: source.description,
      notes: source.notes,
      jastip_fee_policy: source.jastip_fee_policy,
      currency: source.currency,
      status: "draft",
      is_public: false,
      published_at: null,
    });

    req.flash("success", "Trip duplicated as draft.");
    return res.redirect("/jastiper/trips");
  } catch (error) {
    return next(error);
  }
};

exports.tripProducts = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const userId = req.session.user.id;
    const trip = await tripModel.getTripByIdAndUser(tripId, userId);

    if (!trip) {
      return res.status(404).render("errors/404", {
        title: "Trip Not Found",
        message: "Trip is not found or inaccessible.",
      });
    }

    const products = await productModel.findByTrip(tripId, userId);
    return res.render("jastiper/trip-products", {
      title: "Trip Products",
      trip,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

exports.showCreateProduct = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const trips = await tripModel.getTripsByUser(userId);
    return res.render("jastiper/products-create", {
      title: "Create Product",
      trips,
      old: buildProductFormData(),
      formError: "",
    });
  } catch (error) {
    return next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const payload = buildProductPayload(req.body, req.file, userId);
    const trip = await tripModel.getTripByIdAndUser(payload.trip_id, userId);

    if (!trip) {
      return res.status(404).render("errors/404", {
        title: "Trip Not Found",
        message: "Selected trip is not found.",
      });
    }

    const existing = await productModel.slugExistsForTrip(payload.trip_id, payload.slug);
    if (existing) {
      const trips = await tripModel.getTripsByUser(userId);
      return res.status(409).render("jastiper/products-create", {
        title: "Create Product",
        trips,
        old: buildProductFormData(req.body),
        formError: "Product slug already exists in this trip.",
      });
    }

    const productId = await productModel.create(payload);
    if (payload.image_path) {
      await productModel.addImage(productId, payload.image_path, true);
    }
    req.flash("success", "Product created successfully.");
    return res.redirect(`/jastiper/trips/${payload.trip_id}/products`);
  } catch (error) {
    return next(error);
  }
};

exports.showEditProduct = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const productId = Number(req.params.id);
    const product = await productModel.findById(productId, userId);

    if (!product) {
      return res.status(404).render("errors/404", {
        title: "Product Not Found",
        message: "Product is not found or inaccessible.",
      });
    }

    const trips = await tripModel.getTripsByUser(userId);
    const images = await productModel.listImagesByProductId(productId);
    return res.render("jastiper/products-edit", {
      title: "Edit Product",
      product,
      trips,
      images,
      formError: "",
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const productId = Number(req.params.id);
    const current = await productModel.findById(productId, userId);

    if (!current) {
      return res.status(404).render("errors/404", {
        title: "Product Not Found",
        message: "Product is not found or inaccessible.",
      });
    }

    const payload = buildProductPayload(req.body, req.file, userId);
    if (!req.file) {
      payload.image_path = null;
    }

    const conflict = await productModel.slugExistsForTrip(
      payload.trip_id,
      payload.slug,
      productId
    );
    if (conflict) {
      const trips = await tripModel.getTripsByUser(userId);
      const images = await productModel.listImagesByProductId(productId);
      return res.status(409).render("jastiper/products-edit", {
        title: "Edit Product",
        product: {
          ...current,
          ...buildProductFormData(current),
          ...buildProductFormData(req.body),
          id: current.id,
        },
        trips,
        images,
        formError: "Product slug already exists in this trip.",
      });
    }

    await productModel.update(productId, userId, payload);
    if (payload.image_path) {
      await productModel.addImage(productId, payload.image_path, true);
    }
    req.flash("success", "Product updated successfully.");
    return res.redirect(`/jastiper/trips/${payload.trip_id}/products`);
  } catch (error) {
    return next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const productId = Number(req.params.id);
    const product = await productModel.findById(productId, userId);

    if (!product) {
      return res.status(404).render("errors/404", {
        title: "Product Not Found",
        message: "Product is not found or inaccessible.",
      });
    }

    await productModel.remove(productId, userId);
    req.flash("success", "Product deleted.");
    return res.redirect(`/jastiper/trips/${product.trip_id}/products`);
  } catch (error) {
    return next(error);
  }
};

exports.hideProduct = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const productId = Number(req.params.id);
    const product = await productModel.findById(productId, userId);

    if (!product) {
      return res.status(404).render("errors/404", {
        title: "Product Not Found",
        message: "Product is not found or inaccessible.",
      });
    }

    await productModel.updateStatus(productId, userId, "hidden");
    req.flash("success", "Product hidden.");
    return res.redirect(`/jastiper/trips/${product.trip_id}/products`);
  } catch (error) {
    return next(error);
  }
};

exports.showProduct = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const productId = Number(req.params.id);
    const product = await productModel.findById(productId, userId);

    if (!product) {
      return res.status(404).render("errors/404", {
        title: "Product Not Found",
        message: "Product is not found or inaccessible.",
      });
    }

    await productModel.updateStatus(productId, userId, "published");
    req.flash("success", "Product published.");
    return res.redirect(`/jastiper/trips/${product.trip_id}/products`);
  } catch (error) {
    return next(error);
  }
};

exports.soldOutProduct = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const productId = Number(req.params.id);
    const product = await productModel.findById(productId, userId);

    if (!product) {
      return res.status(404).render("errors/404", {
        title: "Product Not Found",
        message: "Product is not found or inaccessible.",
      });
    }

    await productModel.markSoldOut(productId, userId);
    req.flash("success", "Product marked sold out.");
    return res.redirect(`/jastiper/trips/${product.trip_id}/products`);
  } catch (error) {
    return next(error);
  }
};

exports.duplicateProduct = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const productId = Number(req.params.id);
    const source = await productModel.findById(productId, userId);

    if (!source) {
      return res.status(404).render("errors/404", {
        title: "Product Not Found",
        message: "Product is not found or inaccessible.",
      });
    }

    const duplicateName = `${source.name} Copy`;
    const duplicateSlug = `${slugify(duplicateName)}-${Date.now()}`;
    const newProductId = await productModel.create({
      user_id: userId,
      trip_id: source.trip_id,
      name: duplicateName,
      slug: duplicateSlug,
      category: source.category,
      brand: source.brand,
      sku: source.sku,
      description: source.description,
      base_price: source.base_price,
      jastip_fee: source.jastip_fee,
      final_price_estimate: source.final_price_estimate,
      currency: source.currency,
      stock: source.stock,
      weight: source.weight,
      purchase_location: source.purchase_location,
      preorder_type: source.preorder_type,
      availability_status: source.availability_status,
      product_status: "draft",
      notes: source.notes,
      tags: source.tags,
      image_path: null,
    });
    const sourceImages = await productModel.listImagesByProductId(productId);
    if (sourceImages.length) {
      await productModel.addImage(newProductId, sourceImages[0].image_path, true);
    }

    req.flash("success", "Product duplicated as draft.");
    return res.redirect(`/jastiper/trips/${source.trip_id}/products`);
  } catch (error) {
    return next(error);
  }
};

exports.orders = (_req, res) => {
  return res.send("Stage 3: orders");
};

exports.orderDetail = (_req, res) => {
  return res.send("Stage 3: order detail");
};
