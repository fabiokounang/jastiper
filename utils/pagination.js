exports.buildPagination = (page = 1, limit = 10) => {
  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const perPage = Number(limit) > 0 ? Number(limit) : 10;
  const offset = (currentPage - 1) * perPage;

  return {
    currentPage,
    perPage,
    offset,
  };
};
