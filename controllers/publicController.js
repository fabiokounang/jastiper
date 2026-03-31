exports.home = (_req, res) => {
  return res.render("public/home", {
    title: "Jastip Platform",
  });
};

exports.publicTripDetail = (req, res) => {
  const { slug } = req.params;
  return res.render("public/trip-detail", {
    title: "Trip Detail",
    slug,
  });
};

exports.publicProductDetail = (req, res) => {
  const { slug, productSlug } = req.params;
  return res.render("public/product-detail", {
    title: "Product Detail",
    slug,
    productSlug,
  });
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
