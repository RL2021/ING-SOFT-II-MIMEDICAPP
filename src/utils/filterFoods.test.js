import { describe, expect, test } from "vitest";
import { filterFoods } from "./filterFoods";

describe("US-040 - Filtrado de alimentos", () => {
  const foods = [
    {
      id: 1,
      name: "Manzana",
      recommended: true,
    },
    {
      id: 2,
      name: "Gaseosa",
      recommended: false,
    },
    {
      id: 3,
      name: "Avena",
      recommended: true,
    },
  ];

  test("Debe mostrar solo los alimentos recomendados", () => {
    const result = filterFoods(foods, "recommended");

    expect(result).toHaveLength(2);
    expect(result.every((food) => food.recommended)).toBe(true);
  });

  test("Debe mostrar solo los alimentos no recomendados", () => {
    const result = filterFoods(foods, "notRecommended");

    expect(result).toHaveLength(1);
    expect(result.every((food) => !food.recommended)).toBe(true);
  });

  test("Debe mostrar todos los alimentos", () => {
    const result = filterFoods(foods, "all");

    expect(result).toHaveLength(3);
    expect(result).toEqual(foods);
  });
});