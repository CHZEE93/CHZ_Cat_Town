import { Building } from "./Buildings";
import { BUILDINGS } from "../config/constants";
export function CatHouse() {
  return <Building {...BUILDINGS.home} title="CAT HOUSE" />;
}
