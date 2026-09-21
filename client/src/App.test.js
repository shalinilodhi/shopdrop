import { formatPrice, shortId, getError } from "./utils/format";

test("formats prices in rupees", () => {
  expect(formatPrice(1500)).toBe("₹1,500");
  expect(formatPrice()).toBe("₹0");
});

test("shortens order ids", () => {
  expect(shortId("64f1a2b3c4d5e6f7a8b9c0d1")).toBe("#B9C0D1");
});

test("reads the API error message", () => {
  const err = { response: { data: { message: "Cart is empty" } } };
  expect(getError(err)).toBe("Cart is empty");
});
