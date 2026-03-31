const tripModel = require("../models/tripModel");
const productModel = require("../models/productModel");

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

exports.cart = (_req, res) => {
  return res.render("public/cart", {
    title: "Cart",
  });
};

exports.checkout = (_req, res) => {
  return res.render("public/checkout", {
    title: "Checkout",
  });
};
