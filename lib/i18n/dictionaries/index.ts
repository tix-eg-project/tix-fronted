import common from "./common";
import header from "./header";
import footer from "./footer";
import home from "./home";
import products from "./products";
import product from "./product";
import cart from "./cart";
import checkout from "./checkout";
import auth from "./auth";
import account from "./account";
import wishlist from "./wishlist";
import offers from "./offers";
import subcategory from "./subcategory";
import brand from "./brand";
import vendorRegister from "./vendorRegister";
import about from "./about";
import contact from "./contact";
import legal from "./legal";

export type Lang = "ar" | "en";

const namespaces = {
  common,
  header,
  footer,
  home,
  products,
  product,
  cart,
  checkout,
  auth,
  account,
  wishlist,
  offers,
  subcategory,
  brand,
  vendorRegister,
  about,
  contact,
  legal,
};

export type Namespace = keyof typeof namespaces;

export default namespaces;
