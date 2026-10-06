import { Building } from "./Buildings";
import { BUILDINGS } from "../config/constants";
export function CatShop() {
  return <Building {...BUILDINGS.shop} shop title="CAT SHOP" />;
}
