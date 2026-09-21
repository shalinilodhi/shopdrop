export const formatPrice = (amount) =>
  "₹" + Number(amount || 0).toLocaleString("en-IN");

export const formatDate = (date) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const shortId = (id = "") => "#" + id.slice(-6).toUpperCase();

export const getError = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong";

export const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">' +
      '<rect width="100%" height="100%" fill="#e5e7eb"/>' +
      '<text x="50%" y="55%" font-size="48" text-anchor="middle">🛍️</text>' +
      "</svg>"
  );

// Swap a broken image URL for the placeholder
export const onImgError = (e) => {
  e.target.onerror = null;
  e.target.src = PLACEHOLDER_IMG;
};
