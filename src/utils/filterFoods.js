export const filterFoods = (foods, filterType) => {
  if (filterType === "recommended") {
    return foods.filter((food) => food.recommended);
  }

  if (filterType === "notRecommended") {
    return foods.filter((food) => !food.recommended);
  }

  return foods;
};