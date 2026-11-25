"use strict";
(function () {
    // sidebar 
    let sideBar = document.getElementById('sidebar');
    let menuBtn = document.getElementById('header-menu-btn');
    let closeBtn = document.getElementById('sidebar-close-btn');
    let sidbar_overlay = document.getElementById('sidebar-overlay');
    function opensidebar() {
        sideBar.classList.add('open');
        sidbar_overlay.classList.add('active');
    }
    function closesidebar() {
        sideBar.classList.remove('open');
        sidbar_overlay.classList.remove('active');
    }
    menuBtn.addEventListener('click', opensidebar);
    closeBtn.addEventListener('click', closesidebar);
    sidbar_overlay.addEventListener('click', closesidebar);
    let navlinks = document.querySelectorAll('.nav-link');
    for (let i = 0; i < navlinks.length; i++) {
        navlinks[i].addEventListener('click', closesidebar);
    }
    // meals-------------------------------------------------------------------------------------------------------------------
    let currentMeal = null;
    let currentNutrition = null;
    let logModal = document.getElementById("log-modal");
    let modalImg = document.getElementById("modal-img");
    let modalName = document.getElementById("modal-name");
    let modalCal = document.getElementById("modal-cal");
    let modalProtein = document.getElementById("modal-protein");
    let modalCarbs = document.getElementById("modal-carbs");
    let modalFat = document.getElementById("modal-fat");
    let servingsInput = document.getElementById("servings-input");
    let minusBtn = document.getElementById("minus-btn");
    let plusBtn = document.getElementById("plus-btn");
    let cancelBtn = document.getElementById("cancel-btn");
    let confirmBtn = document.getElementById("confirm-log-btn");
    let logBtn = document.getElementById("log-meal-btn");
    logBtn.addEventListener("click", function () {
        if (currentMeal == null || currentNutrition == null) {
            return;
        }
        let meal = currentMeal;
        let nutrition = currentNutrition;
        modalImg.src = meal.thumbnail;
        modalImg.alt = meal.name;
        modalName.textContent = meal.name;
        modalCal.textContent = `${nutrition.calories}`;
        modalProtein.textContent = `${nutrition.protein}g`;
        modalCarbs.textContent = `${nutrition.carbs}g`;
        modalFat.textContent = `${nutrition.fat}g`;
        servingsInput.value = "1";
        logModal.classList.remove("hidden");
    });
    minusBtn.addEventListener("click", function () {
        let value = Number(servingsInput.value) || 1;
        if (value > 0.5) {
            servingsInput.value = String(value - 0.5);
        }
    });
    plusBtn.addEventListener("click", function () {
        let value = Number(servingsInput.value) || 1;
        if (value < 10) {
            servingsInput.value = String(value + 0.5);
        }
    });
    cancelBtn.addEventListener("click", function () {
        logModal.classList.add("hidden");
    });
    logModal.addEventListener("click", function (back) {
        if (back.target === logModal) {
            logModal.classList.add("hidden");
        }
    });
    confirmBtn.addEventListener("click", function () {
        if (currentMeal == null || currentNutrition == null) {
            return;
        }
        let meal = currentMeal;
        let nutrition = currentNutrition;
        let servings = Number(servingsInput.value) || 1;
        addToLog({
            type: "meal",
            name: meal.name,
            brand: "",
            time: nowTime(),
            thumbnail: meal.thumbnail,
            servings: servings,
            calories: nutrition.calories * servings,
            protein: nutrition.protein * servings,
            carbs: nutrition.carbs * servings,
            fat: nutrition.fat * servings
        });
        logModal.classList.add("hidden");
        notify("Meal Logged!", `${meal.name} has been added to your daily log.`);
    });
    // search.......................................................
    let searchInput = document.getElementById("search-input");
    searchInput?.addEventListener("input", function () {
        search(searchInput.value);
    });
    async function search(section) {
        loading();
        try {
            let response = await fetch(`https://nutriplan-api.vercel.app/api/meals/search?q=${section}&page=1&limit=25`);
            let data = await response.json();
            ch_meal = data.results || [];
            display();
            let count = document.getElementById("recipes-count");
            if (count) {
                if (section.trim() !== "") {
                    count.innerHTML = `Showing ${ch_meal.length} recipes for "${section}"`;
                }
                else {
                    count.innerHTML = `Showing ${ch_meal.length} recipes`;
                }
            }
            load.classList.add("loading");
        }
        catch (error) {
            console.log(error);
            load.classList.add("loading");
        }
    }
    // ..............................................................................................
    let ch_meal = [];
    let load = document.querySelector(".loader");
    // get by category------------------------------------------------------------------
    let category_grid = document.getElementById("categories-grid");
    category_grid?.addEventListener("click", async function (back) {
        let card = back.target;
        let category_card = card.closest(".category-card");
        let meal_category = category_card.dataset.category;
        await meals(meal_category);
        let count = document.getElementById("recipes-count");
        count.innerHTML = `Showing ${ch_meal.length} ${meal_category} recipes `;
    });
    // get by area----------------------------------------------------------------
    let country = document.getElementById("countries");
    country.addEventListener("click", function (back) {
        let target = back.target;
        let btn = target.closest("[data-area]");
        if (btn == null) {
            return;
        }
        let allButtons = document.querySelectorAll("#countries button");
        allButtons.forEach(function (button) {
            button.classList.remove("bg-emerald-600", "text-white", "hover:bg-emerald-700");
            button.classList.add("bg-gray-100", "text-gray-700", "hover:bg-gray-200");
        });
        btn.classList.remove("bg-gray-100", "text-gray-700", "hover:bg-gray-200");
        btn.classList.add("bg-emerald-600", "text-white", "hover:bg-emerald-700");
        let area = btn.getAttribute("data-area");
        if (area) {
            mealbyarea(area);
        }
        else {
            meals();
        }
    });
    async function mealbyarea(area) {
        loading();
        try {
            let response = await fetch(`https://nutriplan-api.vercel.app/api/meals/filter?area=${area}&page=1&limit=25`);
            let data = await response.json();
            ch_meal = data.results || [];
            display();
            load.classList.add("loading");
        }
        catch (error) {
            console.log(error);
            load.classList.add("loading");
        }
    }
    // -----------------------------------------------------------------------------------------------------------------------
    // get meals------------------------------------------------------------------------------------------------------------------------
    async function meals(category = "Chicken") {
        loading();
        try {
            let response = await fetch(`https://nutriplan-api.vercel.app/api/meals/filter?category=${category}&page=1&limit=25`);
            let data = await response.json();
            ch_meal = data.results || [];
            console.log(ch_meal);
            display();
            load.classList.add("loading");
        }
        catch (error) {
            console.log(error);
            load.classList.add("loading");
        }
    }
    meals();
    // ......................................................................................................................................
    // show----------------------------------------------------------------------------------------------------------------
    function display() {
        let cartona = ``;
        if (ch_meal.length == 0) {
            document.getElementById("recipes-grid").innerHTML = `<div class="flex flex-col items-center justify-center py-10 text-center">
  <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5 ">
    <i class="fa-solid fa-magnifying-glass text-3xl text-gray-400"></i>
  </div>
  <p class="text-lg text-gray-500 max-w-xs">
    No recipes found. Try a different search term.
  </p>
</div>`;
            document.getElementById("recipes-count").innerHTML = `Showing 0 recipes`;
            return;
        }
        for (let i = 0; i < ch_meal.length; i++) {
            cartona += `<div
      class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
      data-meal-id="${ch_meal[i].id}"
    >
      <div class="relative h-48 overflow-hidden">
        <img
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          src="${ch_meal[i].thumbnail}"
          alt="${ch_meal[i].name}"
          loading="lazy"
        />
        <div class="absolute bottom-3 left-3 flex gap-2">
        <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
  <i class="fa-solid fa-tag text-emerald-600 mr-1"></i>
  ${ch_meal[i].category}
</span>
 
    <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
  <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
  ${ch_meal[i].area || `International`}
</span>
        </div>
      </div>
      <div class="p-4">
        <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
          ${ch_meal[i].name}
        </h3>
        <p class="text-xs text-gray-600 mb-3 line-clamp-2">
          ${ch_meal[i].instructions.join(" ")}
        </p>
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-gray-900">
            <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
            ${ch_meal[i].category}
          </span>
          <span class="font-semibold text-gray-500">
            <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
            ${ch_meal[i].area || `International`}
          </span>
        </div>
      </div>
    </div>`;
        }
        document.getElementById("recipes-grid").innerHTML = cartona;
        document.getElementById("recipes-count").textContent = `Showing ${ch_meal.length} recipes`;
    }
    // .......................................................................................................................
    // random meal---------------------------------------------------------------------------------------
    async function randomMeal() {
        let response = await fetch("https://nutriplan-api.vercel.app/api/meals/random?count=3");
        let data = await response.json();
        display();
    }
    // .......................................................................................................
    // view grid & list..............................................................................
    let grid_Recipe = document.getElementById("recipes-grid");
    let btn1 = document.getElementById("grid-view-btn");
    let btn2 = document.getElementById("list-view-btn");
    btn1.addEventListener("click", function () {
        grid_Recipe.classList.remove("grid-cols-2");
        grid_Recipe.classList.add("grid-cols-4");
        btn1.classList.add('bg-white', 'rounded-md', 'shadow-sm');
        btn2.classList.remove('bg-white', 'rounded-md', 'shadow-sm');
        display();
    });
    btn2.addEventListener("click", function () {
        grid_Recipe.classList.remove("grid-cols-4");
        grid_Recipe.classList.add("grid-cols-2");
        btn2.classList.add('bg-white', 'rounded-md', 'shadow-sm');
        btn1.classList.remove('bg-white', 'rounded-md', 'shadow-sm');
        display();
    });
    // loadeing-------------------------------------------------------------------------------------
    function loading() {
        document.getElementById("recipes-grid").innerHTML = "";
        load.classList.remove("loading");
    }
    // ---------------------------------------------------------------------
    grid_Recipe.addEventListener("click", function (back) {
        let target = back.target;
        let card = target.closest(".recipe-card");
        if (card == null) {
            return;
        }
        let id = card.getAttribute("data-meal-id");
        let meal = ch_meal.find(function (e) {
            return e.id === id;
        });
        if (meal == undefined) {
            return;
        }
        showDetails(meal);
    });
    let navEdit = document.querySelector("#main-content h1");
    let navEdit2 = document.querySelector("#main-content p");
    let searchFilter = document.getElementById("search-filters-section");
    let mealCategory = document.getElementById("meal-categories-section");
    let allRecipe = document.getElementById("all-recipes-section");
    let mealDetails = document.getElementById("meal-details");
    let titleDetails = document.getElementById("detail-title");
    let imgDetails = document.getElementById("detail-img");
    let badgesDetails = document.getElementById("detail-badges");
    let ingredientCount = document.getElementById("ingredient-count");
    let ingredientDetail = document.getElementById("ingredients");
    let instructions_det = document.getElementById("Instructions");
    let videoSection = document.getElementById("videoSection");
    let videoframe = document.getElementById("videoframe");
    let key = "HpdqcJnN6QTnqghbWH9nWQgPWtjzJRkMwGCCLC87";
    let heroCalories = document.getElementById("hero-calories");
    let nutritionCoctainer = document.getElementById("nutrition-facts-container");
    let currentID = "";
    let servings = document.getElementById("hero-servings");
    let backButton = document.getElementById("back-to-meals-btn");
    backButton.addEventListener("click", function () {
        searchFilter.classList.remove("hidden");
        mealCategory.classList.remove("hidden");
        allRecipe.classList.remove("hidden");
        mealDetails.classList.add("hidden");
        navEdit.innerHTML = `Meals & Recipes`;
        navEdit2.innerHTML = `Discover delicious and nutritious recipes tailored for you`;
        videoframe.src = "";
        currentID = "";
    });
    function showDetails(meal) {
        currentMeal = meal;
        currentNutrition = null;
        searchFilter.classList.add("hidden");
        mealCategory.classList.add("hidden");
        allRecipe.classList.add("hidden");
        mealDetails.classList.remove("hidden");
        navEdit.innerHTML = `Recipe Details`;
        navEdit2.innerHTML = `View full recipe information and nutrition facts`;
        titleDetails.innerHTML = meal.name;
        imgDetails.alt = meal.name;
        imgDetails.src = meal.thumbnail;
        badgesDetails.innerHTML = `  <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.category}</span>
   ${meal.area ? `<span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.area}</span>` : ``}`;
        ingrdnt_instrctn(meal);
        if (meal.youtube) {
            let video = meal.youtube.split("v=")[1].split("&")[0];
            videoframe.src = `https://www.youtube.com/embed/${video}`;
            videoSection.classList.remove("hidden");
        }
        else {
            videoframe.src = "";
            videoSection.classList.add("hidden");
        }
        getNutrition(meal);
    }
    function ingrdnt_instrctn(meal) {
        let items = ``;
        let list = meal.ingredients || [];
        for (let i = 0; i < list.length; i++) {
            items += `
       <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
    <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
    <span class="text-gray-700">
      <span class="font-medium text-gray-900">${list[i].measure}</span> ${list[i].ingredient}
    </span>
   </div>`;
        }
        ingredientDetail.innerHTML = items;
        ingredientCount.innerHTML = `${list.length} items`;
        let steps = ``;
        let step = meal.instructions || [];
        for (let i = 1; i < step.length; i++) {
            steps += `<div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div
                    class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                    ${i}
                  </div>
                  <p class="text-gray-700 leading-relaxed pt-2">
                  ${step[i]}
                  </p>
                </div>`;
        }
        instructions_det.innerHTML = steps;
    }
    function nutritionLoading() {
        heroCalories.innerHTML = `calculating...`;
        logBtn.disabled = true;
        logBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Calculating...</span>`;
        logBtn.classList.remove("bg-blue-600", "hover:bg-blue-700", "text-white");
        logBtn.classList.add("bg-gray-200", "text-gray-500", "cursor-not-allowed");
        nutritionCoctainer.innerHTML = `
    <div class="text-center py-10">
    <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
      <i class="fa-solid fa-calculator text-emerald-600 text-xl"></i>
    </div>
    <p class="font-semibold text-gray-900">Calculating Nutrition</p>
    <p class="text-sm text-gray-500 mb-3">Analyzing ingredients...</p>
    <div class="flex items-center justify-center gap-1">
      <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
      <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
      <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
    </div>
  </div>
    `;
    }
    function nutritionfalse() {
        logBtn.disabled = false;
        logBtn.innerHTML = `
    <i class="fa-solid fa-clipboard-list"></i><span>Log This Meal</span>
    `;
        logBtn.classList.remove("bg-gray-200", "text-gray-500", "cursor-not-allowed");
        logBtn.classList.add("bg-blue-600", "hover:bg-blue-700", "text-white");
    }
    async function getNutrition(meal) {
        currentID = meal.id;
        nutritionLoading();
        try {
            let response = await fetch("https://nutriplan-api.vercel.app/api/nutrition/analyze", {
                method: "post", headers: {
                    "Content-Type": "application/json",
                    "x-api-key": key
                },
                body: JSON.stringify({
                    recipeName: meal.name,
                    ingredients: (meal.ingredients || []).map(function (item) {
                        return `${item.measure} ${item.ingredient}`.trim();
                    })
                })
            });
            if (!response.ok) {
                throw new Error("Request failed: " + response.status);
            }
            let data = await response.json();
            if (currentID !== meal.id) {
                return;
            }
            if (!data.success) {
                throw new Error("Nutrition failed");
            }
            show(data.data);
            nutritionfalse();
        }
        catch (error) {
            console.log(error);
            if (currentID !== meal.id) {
                return;
            }
            nutritionCoctainer.innerHTML = ` < p class="text-center text-red-500 py-10" > Could not calculate nutrition.</p>`;
            heroCalories.innerHTML = "-";
            nutritionfalse();
        }
    }
    function show(info) {
        let per = info.perServing;
        let total = info.totals;
        currentNutrition = {
            calories: per.calories,
            protein: per.protein,
            carbs: per.carbs,
            fat: per.fat
        };
        heroCalories.innerHTML = `${per.calories} cal/serving`;
        servings.textContent = `${info.servings} servings`;
        let bar = [
            { name: "protein", value: per.protein, goal: 50, color: "bg-emerald-500" },
            { name: "carbs", value: per.carbs, goal: 300, color: "bg-blue-500" },
            { name: "fat", value: per.fat, goal: 65, color: "bg-purple-500" },
            { name: "fiber", value: per.fiber, goal: 28, color: "bg-orange-500" },
            { name: "sugar", value: per.sugar, goal: 28, color: "bg-pink-500" },
            { name: "saturated fat", value: per.saturatedFat, goal: 28, color: "bg-red-500" },
        ];
        let card = ``;
        for (let i = 0; i < bar.length; i++) {
            let bars = bar[i];
            let width = Math.min(100, Math.round((bars.value / bars.goal) * 100));
            card += `
       <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full ${bars.color}"></div>
        <span class="text-gray-700">${bars.name}</span>
      </div>
      <span class="font-bold text-gray-900">${Math.round(bars.value)}g</span>
    </div>
    <div class="w-full bg-gray-100 rounded-full h-2">
      <div class="${bars.color} h-2 rounded-full" style="width: ${width}%"></div>
    </div>
      `;
        }
        nutritionCoctainer.innerHTML = `
        <p class="text-sm text-gray-500 mb-4">Per serving</p>
    <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
      <p class="text-sm text-gray-600">Calories per serving</p>
      <p class="text-4xl font-bold text-emerald-600">${Math.round(per.calories)}</p>
      <p class="text-xs text-gray-500 mt-1">Total: ${Math.round(total.calories)} cal</p>
    </div>
    <div class="space-y-4">${card}</div>

       <div class="mt-6 pt-6 border-t border-gray-100">
      <h3 class="text-sm font-semibold text-gray-900 mb-3">Other</h3>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Cholesterol</span>
          <span class="font-medium">${Math.round(per.cholesterol || 0)}mg</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Sodium</span>
          <span class="font-medium">${Math.round(per.sodium || 0)}mg</span>
        </div>
      </div>
    </div>
    `;
    }
    let productSection = document.getElementById("products-section");
    let foodLogSection = document.getElementById("foodlog-section");
    let navLink = document.querySelectorAll(".nav-link");
    // transfer between pages--------------------------------------------------------------------
    function nextPage(page) {
        searchFilter.classList.add("hidden");
        mealCategory.classList.add("hidden");
        allRecipe.classList.add("hidden");
        mealDetails.classList.add("hidden");
        foodLogSection.classList.add("hidden");
        productSection.classList.add("hidden");
        if (page === "meals") {
            searchFilter.classList.remove("hidden");
            mealCategory.classList.remove("hidden");
            allRecipe.classList.remove("hidden");
            navEdit.innerHTML = `Meals & Recipes`;
            navEdit2.innerHTML = `Discover delicious and nutritious recipes tailored for you`;
        }
        else if (page === "product") {
            productSection.classList.remove("hidden");
            foodLogSection.classList.add("hidden");
            navEdit.innerHTML = `Product Scanner`;
            navEdit2.innerHTML = `Search packaged foods and scan barcodes for nutrition info`;
        }
        else {
            productSection.classList.add("hidden");
            foodLogSection.classList.remove("hidden");
            navEdit.innerHTML = `Food Log`;
            navEdit2.innerHTML = `Track and monitor your daily nutrition intake`;
        }
        for (let i = 0; i < navLink.length; i++) {
            if (navLink[i].getAttribute("data-page") === page) {
                navLink[i].classList.add("bg-emerald-50", "text-emerald-700");
                navLink[i].classList.remove("text-gray-600", "hover:bg-gray-50");
            }
            else {
                navLink[i].classList.remove("bg-emerald-50", "text-emerald-700");
                navLink[i].classList.add("text-gray-600", "hover:bg-gray-50");
            }
        }
    }
    for (let i = 0; i < navLink.length; i++) {
        navLink[i].addEventListener("click", function (b) {
            b.preventDefault();
            let page = navLink[i].getAttribute("data-page");
            if (page) {
                location.hash = page;
            }
        });
    }
    function route() {
        let page = location.hash.replace("#", "");
        if (page !== "meals" && page !== "product" && page !== "foodlog") {
            page = "meals";
        }
        nextPage(page);
    }
    window.addEventListener("hashchange", route);
    route();
    // -------------------------------------------------------------------------------
    let productSearchInput = document.getElementById("product-search-input");
    let productSearchBtn = document.getElementById("search-product-btn");
    let productsGrid = document.getElementById("products-grid");
    let productsCount = document.getElementById("products-count");
    let productModal = document.getElementById("product-modal");
    let barcodeInput = document.getElementById("barcode-input");
    let barcodeBtn = document.getElementById("lookup-barcode-btn");
    let ch_product = [];
    let currentProduct = null;
    // search.......................................................
    productSearchBtn.addEventListener("click", function () {
        getProducts(productSearchInput.value);
    });
    // empty------------------------------------------------------------------
    function emptyContainer() {
        return `
    <div class="flex flex-col items-center justify-center py-12 text-center" style="grid-column: 1 / -1">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
        <i class="fa-solid fa-box-open text-gray-400 text-3xl"></i>
      </div>
      <p class="text-lg font-medium text-gray-500 mb-2">No products to display</p>
      <p class="text-sm text-gray-400">Search for a product or browse by category</p>
    </div>`;
    }
    productsGrid.innerHTML = emptyContainer();
    // loading-------------------------------------------------------------------------------------
    function productLoading() {
        productsGrid.innerHTML = `<div class="flex items-center justify-center py-12" style="grid-column: 1 / -1"><span class="loader"></span></div>`;
    }
    // get products------------------------------------------------------------------------------------------------------------------------
    async function getProducts(name, grade = "", category = "") {
        productLoading();
        let categoryName = category.replace(/-/g, " ");
        try {
            let filterPart = "";
            let tagIndex = 0;
            if (grade) {
                filterPart += `&tagtype_${tagIndex}=nutrition_grades&tag_contains_${tagIndex}=contains&tag_${tagIndex}=${grade}`;
                tagIndex++;
            }
            if (category) {
                filterPart += `&tagtype_${tagIndex}=categories&tag_contains_${tagIndex}=contains&tag_${tagIndex}=${encodeURIComponent(category)}`;
                tagIndex++;
            }
            let url = `https://world.openfoodfacts.org/cgi/search.pl?page=1&page_size=24&json=1&search_terms=${encodeURIComponent(name.trim())}${filterPart}`;
            let response = await fetch(url);
            if (!response.ok) {
                throw new Error("Request failed: " + response.status);
            }
            let data = await response.json();
            let list = data.products || [];
            ch_product = list.map(function (A) {
                return {
                    barcode: A.code,
                    name: A.product_name || "Unknown product",
                    brand: A.brands || "",
                    image: A.image_front_small_url || A.image_url || "",
                    novaGroup: A.nova_group ?? 0,
                    nutritionGrade: A.nutrition_grades || "",
                    quantity: A.quantity || "",
                    ingredients: A.ingredients_text || "",
                    allergens: (A.allergens_tags || []).map(function (a) {
                        return a.replace("en:", "");
                    }).join(", "),
                    nutrients: {
                        calories: A.nutriments?.["energy-kcal_100g"] ?? 0,
                        protein: A.nutriments?.proteins_100g ?? 0,
                        carbs: A.nutriments?.carbohydrates_100g ?? 0,
                        fat: A.nutriments?.fat_100g ?? 0,
                        sugar: A.nutriments?.sugars_100g ?? 0,
                        saturatedFat: A.nutriments?.["saturated-fat_100g"] ?? 0,
                        fiber: A.nutriments?.fiber_100g ?? 0,
                        salt: A.nutriments?.salt_100g ?? 0
                    }
                };
            });
            let filterText = "";
            if (category) {
                filterText += ` in ${categoryName}`;
            }
            if (grade) {
                filterText += ` with Nutri-Score ${grade.toUpperCase()}`;
            }
            if (ch_product.length == 0) {
                productsGrid.innerHTML = emptyContainer();
                if (name.trim() !== "") {
                    productsCount.innerHTML = `No products found for "${name}"${filterText}`;
                }
                else {
                    productsCount.innerHTML = `No products found${filterText}`;
                }
                return;
            }
            if (name.trim() !== "") {
                productsCount.innerHTML = `Found ${data.count} products for "${name}"${filterText}`;
            }
            else {
                productsCount.innerHTML = `Found ${data.count} products${filterText}`;
            }
            displayProducts();
        }
        catch (error) {
            console.log(error);
            productsGrid.innerHTML = emptyContainer();
            productsCount.innerHTML = `Something went wrong, please try again`;
        }
    }
    // ......................................................................................................................................
    function fix1(value) {
        return (Number(value) || 0).toFixed(1);
    }
    function percent(value, max) {
        let result = (Number(value) || 0) / max * 100;
        if (result > 100) {
            result = 100;
        }
        return result;
    }
    // show------------------------------------------
    function displayProducts() {
        let cartona = ``;
        let gradeColors = {
            a: "bg-green-500",
            b: "bg-lime-500",
            c: "bg-yellow-500",
            d: "bg-orange-500",
            e: "bg-red-500"
        };
        let novaColors = {
            1: "bg-green-500",
            2: "bg-lime-500",
            3: "bg-orange-500",
            4: "bg-red-500"
        };
        for (let i = 0; i < ch_product.length; i++) {
            let product = ch_product[i];
            let gradeColor = gradeColors[product.nutritionGrade] || "bg-gray-400";
            let novaColor = novaColors[product.novaGroup] || "bg-gray-400";
            cartona += `<div
      class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
      data-barcode="${product.barcode}"
    >
      <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        ${product.image ? `<img
          class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        />` : `<i class="fa-solid fa-image text-gray-300 text-4xl"></i>`}

        <div class="absolute top-2 left-2 ${gradeColor} text-white text-xs font-bold px-2 py-1 rounded uppercase">
          Nutri-Score ${product.nutritionGrade || "?"}
        </div>

        <div
          class="absolute top-2 right-2 ${novaColor} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
          title="NOVA ${product.novaGroup || "unknown"}"
        >
          ${product.novaGroup || "?"}
        </div>
      </div>

      <div class="p-4">
        <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">
          ${product.brand}
        </p>
        <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          ${product.name}
        </h3>

        <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
          ${product.quantity ? `<span><i class="fa-solid fa-weight-scale mr-1"></i>${product.quantity}</span>` : ``}
          <span><i class="fa-solid fa-fire mr-1"></i>${Math.round(Number(product.nutrients.calories) || 0)} kcal/100g</span>
        </div>

        <div class="grid grid-cols-4 gap-1 text-center">
          <div class="bg-emerald-50 rounded p-1.5">
            <p class="text-xs font-bold text-emerald-700">${fix1(product.nutrients.protein)}g</p>
            <p class="text-[10px] text-gray-500">Protein</p>
          </div>
          <div class="bg-blue-50 rounded p-1.5">
            <p class="text-xs font-bold text-blue-700">${fix1(product.nutrients.carbs)}g</p>
            <p class="text-[10px] text-gray-500">Carbs</p>
          </div>
          <div class="bg-purple-50 rounded p-1.5">
            <p class="text-xs font-bold text-purple-700">${fix1(product.nutrients.fat)}g</p>
            <p class="text-[10px] text-gray-500">Fat</p>
          </div>
          <div class="bg-orange-50 rounded p-1.5">
            <p class="text-xs font-bold text-orange-700">${fix1(product.nutrients.sugar)}g</p>
            <p class="text-[10px] text-gray-500">Sugar</p>
          </div>
        </div>
      </div>
    </div>`;
        }
        productsGrid.innerHTML = cartona;
    }
    productsGrid.addEventListener("click", function (back) {
        let target = back.target;
        let card = target.closest(".product-card");
        if (card == null) {
            return;
        }
        let barcode = card.dataset.barcode;
        let product = ch_product.find(function (e) {
            return e.barcode === barcode;
        });
        if (product == undefined) {
            return;
        }
        showProduct(product);
    });
    // product details-------------------------
    function showProduct(p) {
        currentProduct = p;
        document.getElementById("pm-name").textContent = p.name;
        document.getElementById("pm-brand").textContent = p.brand;
        document.getElementById("pm-quantity").textContent = p.quantity;
        document.getElementById("pm-cal").textContent = String(Math.round(p.nutrients.calories));
        document.getElementById("pm-protein").textContent = fix1(p.nutrients.protein) + "g";
        document.getElementById("pm-carbs").textContent = fix1(p.nutrients.carbs) + "g";
        document.getElementById("pm-fat").textContent = fix1(p.nutrients.fat) + "g";
        document.getElementById("pm-sugar").textContent = fix1(p.nutrients.sugar) + "g";
        document.getElementById("pm-satfat").textContent = fix1(p.nutrients.saturatedFat) + "g";
        document.getElementById("pm-fiber").textContent = fix1(p.nutrients.fiber) + "g";
        document.getElementById("pm-salt").textContent = p.nutrients.salt.toFixed(2) + "g";
        let img = document.getElementById("pm-img");
        img.src = p.image;
        img.alt = p.name;
        document.getElementById("pm-ingredients").textContent = p.ingredients || "No ingredients information available";
        let allergenBox = document.getElementById("pm-allergens-box");
        if (p.allergens) {
            document.getElementById("pm-allergens").textContent = p.allergens;
            allergenBox.classList.remove("hidden");
        }
        else {
            allergenBox.classList.add("hidden");
        }
        let nutriInfo = {
            a: { color: "#038141", label: "Excellent" },
            b: { color: "#85bb2f", label: "Good" },
            c: { color: "#fecb02", label: "Average" },
            d: { color: "#ee8100", label: "Poor" },
            e: { color: "#e63e11", label: "Bad" }
        };
        let info = nutriInfo[p.nutritionGrade] || { color: "#9ca3af", label: "Unknown" };
        let letterBox = document.getElementById("pm-nutri-letter");
        letterBox.textContent = p.nutritionGrade ? p.nutritionGrade.toUpperCase() : "?";
        letterBox.style.backgroundColor = info.color;
        document.getElementById("pm-nutri-label").textContent = info.label;
        document.getElementById("pm-nutri-title").style.color = info.color;
        document.getElementById("pm-nutri-box").style.backgroundColor = info.color + "20";
        document.getElementById("pm-protein-bar").style.width = percent(p.nutrients.protein, 50) + "%";
        document.getElementById("pm-carbs-bar").style.width = percent(p.nutrients.carbs, 100) + "%";
        document.getElementById("pm-fat-bar").style.width = percent(p.nutrients.fat, 70) + "%";
        document.getElementById("pm-sugar-bar").style.width = percent(p.nutrients.sugar, 50) + "%";
        let novaInfo = {
            1: { color: "#038141", label: "Unprocessed" },
            2: { color: "#85bb2f", label: "Processed ingredients" },
            3: { color: "#ee8100", label: "Processed" },
            4: { color: "#e63e11", label: "Ultra-processed" }
        };
        let novaBox = document.getElementById("pm-nova-box");
        let nova = novaInfo[p.novaGroup];
        if (nova) {
            let novaNum = document.getElementById("pm-nova-num");
            novaNum.textContent = String(p.novaGroup);
            novaNum.style.backgroundColor = nova.color;
            document.getElementById("pm-nova-label").textContent = nova.label;
            document.getElementById("pm-nova-title").style.color = nova.color;
            novaBox.style.backgroundColor = nova.color + "20";
            novaBox.classList.remove("hidden");
        }
        else {
            novaBox.classList.add("hidden");
        }
        productModal.classList.remove("hidden");
    }
    // close modal.................................................................................
    let closeProductBtns = document.querySelectorAll(".close-product-modal");
    for (let i = 0; i < closeProductBtns.length; i++) {
        closeProductBtns[i].addEventListener("click", function () {
            productModal.classList.add("hidden");
        });
    }
    // log product-------------------------------------------------------------------------------------
    let gradeBtns = document.querySelectorAll(".nutri-score-filter");
    for (let i = 0; i < gradeBtns.length; i++) {
        gradeBtns[i].addEventListener("click", function () {
            for (let j = 0; j < gradeBtns.length; j++) {
                gradeBtns[j].classList.remove("ring-2", "ring-gray-900");
            }
            gradeBtns[i].classList.add("ring-2", "ring-gray-900");
            getProducts(productSearchInput.value, gradeBtns[i].dataset.grade || "");
        });
    }
    // categories-------------------------------------------------------------------------------------
    let productCategoryBtns = document.querySelectorAll(".product-category-btn");
    for (let i = 0; i < productCategoryBtns.length; i++) {
        productCategoryBtns[i].addEventListener("click", function () {
            getProducts(productSearchInput.value, "", productCategoryBtns[i].dataset.category || "");
        });
    }
    // barcode-------------------------------------------------------------------------------------
    barcodeBtn.addEventListener("click", function () {
        let code = barcodeInput.value.trim();
        if (code) {
            getBarcode(code);
        }
    });
    async function getBarcode(code) {
        productLoading();
        try {
            let response = await fetch(`https://nutriplan-api.vercel.app/api/products/barcode/${encodeURIComponent(code)}`);
            let data = await response.json();
            let r = data.result;
            if (!r) {
                ch_product = [];
                productsGrid.innerHTML = emptyContainer();
                productsCount.innerHTML = `No product found for barcode "${code}"`;
                return;
            }
            let ingredients = "";
            let allergens = "";
            let saturatedFat = 0;
            try {
                let offResponse = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`);
                let offData = await offResponse.json();
                let op = offData.product;
                if (op) {
                    ingredients = op.ingredients_text || "";
                    allergens = (op.allergens_tags || []).map(function (a) {
                        return a.replace("en:", "");
                    }).join(", ");
                    saturatedFat = op.nutriments?.["saturated-fat_100g"] ?? 0;
                }
            }
            catch (error) {
                console.log(error);
            }
            ch_product = [{
                    barcode: r.barcode,
                    name: r.name || "Unknown product",
                    brand: r.brand || "",
                    image: r.image || "",
                    novaGroup: r.novaGroup ?? 0,
                    nutritionGrade: r.nutritionGrade || "",
                    quantity: "",
                    ingredients: ingredients,
                    allergens: allergens,
                    nutrients: {
                        calories: r.nutrients?.calories ?? 0,
                        protein: r.nutrients?.protein ?? 0,
                        carbs: r.nutrients?.carbs ?? 0,
                        fat: r.nutrients?.fat ?? 0,
                        sugar: r.nutrients?.sugar ?? 0,
                        saturatedFat: saturatedFat,
                        fiber: r.nutrients?.fiber ?? 0,
                        salt: (r.nutrients?.sodium ?? 0) * 2.5
                    }
                }];
            productsCount.innerHTML = `Found product: ${ch_product[0].name}`;
            displayProducts();
            showProduct(ch_product[0]);
        }
        catch (error) {
            console.log(error);
            productsGrid.innerHTML = emptyContainer();
            productsCount.innerHTML = `Something went wrong, please try again`;
        }
    }
    let logProductBtn = document.getElementById("pm-log-btn");
    logProductBtn.addEventListener("click", function () {
        if (currentProduct == null) {
            return;
        }
        let product = currentProduct;
        addToLog({
            type: "product",
            name: product.name,
            brand: product.brand,
            time: nowTime(),
            thumbnail: product.image,
            servings: 1,
            calories: product.nutrients.calories,
            protein: product.nutrients.protein,
            carbs: product.nutrients.carbs,
            fat: product.nutrients.fat
        });
        productModal.classList.add("hidden");
        notify("Product Logged!", `${product.name} has been added to your daily log.`);
    });
    let goals = { calories: 2000, protein: 50, carbs: 250, fat: 65 };
    function logKey(date) {
        return "foodlog-" + date.toLocaleDateString("en-CA");
    }
    function readLog(date) {
        try {
            let data = JSON.parse(localStorage.getItem(logKey(date)) || "[]");
            return Array.isArray(data) ? data : [];
        }
        catch (error) {
            return [];
        }
    }
    function writeLog(date, items) {
        localStorage.setItem(logKey(date), JSON.stringify(items));
    }
    function addToLog(item) {
        let items = readLog(new Date());
        items.push(item);
        writeLog(new Date(), items);
        console.log("saved in", logKey(new Date()), items);
        renderFoodLog();
    }
    function nowTime() {
        return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    function sumOf(items, key) {
        let total = 0;
        for (let i = 0; i < items.length; i++) {
            total += Number(items[i][key]) || 0;
        }
        return total;
    }
    function showToast(message) {
        let toast = document.createElement("div");
        toast.className = "fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg z-50";
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function () {
            toast.remove();
        }, 2500);
    }
    function notify(title, text) {
        if (typeof Swal !== "undefined") {
            Swal.fire({ icon: "success", title: title, text: text, confirmButtonColor: "#059669" });
        }
        else {
            showToast(title + " " + text);
        }
    }
    function getWeek() {
        let week = [];
        for (let i = 6; i >= 0; i--) {
            let day = new Date();
            day.setDate(day.getDate() - i);
            let items = readLog(day);
            week.push({
                date: day,
                items: items.length,
                calories: Math.round(sumOf(items, "calories"))
            });
        }
        return week;
    }
    function renderFoodLog() {
        let today = readLog(new Date());
        let week = getWeek();
        let nutrients = [
            { label: "Calories", key: "calories", unit: "kcal", bar: "bg-emerald-500", text: "text-emerald-600" },
            { label: "Protein", key: "protein", unit: "g", bar: "bg-blue-500", text: "text-blue-600" },
            { label: "Carbs", key: "carbs", unit: "g", bar: "bg-amber-500", text: "text-amber-600" },
            { label: "Fat", key: "fat", unit: "g", bar: "bg-purple-500", text: "text-purple-600" }
        ];
        let progress = ``;
        for (let i = 0; i < nutrients.length; i++) {
            let n = nutrients[i];
            let total = Math.round(sumOf(today, n.key));
            let goal = goals[n.key];
            let width = Math.min(100, Math.round((total / goal) * 100));
            let over = total >= goal;
            progress += `
        <div class="bg-gray-50 rounded-xl p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">${n.label}</span>
            <span class="text-xs ${over ? "text-red-500" : n.text}">${width}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div class="${over ? "bg-red-500" : n.bar} h-2.5 rounded-full" style="width: ${width}%"></div>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold ${over ? "text-red-600" : n.text}">${total} ${n.unit}</span>
            <span class="text-gray-400">/ ${goal} ${n.unit}</span>
          </div>
        </div>`;
        }
        let list = ``;
        if (today.length == 0) {
            list = `
        <div class="text-center py-8 text-gray-500">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <i class="fa-solid fa-utensils text-3xl text-gray-300"></i>
          </div>
          <p class="font-medium text-gray-500 mb-2">No food logged today</p>
          <p class="text-sm text-gray-400 mb-4">Start tracking your nutrition by logging meals or scanning products</p>
          <div class="flex justify-center gap-3">
            <button id="browse-recipes-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
              <i class="fa-solid fa-plus mr-2"></i>Browse Recipes
            </button>
            <button id="scan-product-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              <i class="fa-solid fa-barcode mr-2"></i>Scan Product
            </button>
          </div>
        </div>`;
        }
        else {
            for (let i = 0; i < today.length; i++) {
                let item = today[i];
                let isMeal = item.type === "meal";
                let picture = item.thumbnail
                    ? `<img src="${item.thumbnail}" alt="${item.name}" class="w-16 h-16 rounded-lg ${isMeal ? "object-cover" : "object-contain bg-gray-100"} shrink-0">`
                    : `<div class="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
               <i class="fa-solid fa-box text-blue-600 text-xl"></i>
             </div>`;
                let sub = isMeal
                    ? `Recipe <span class="mx-1">•</span> ${item.servings || 1} serving${(item.servings || 1) == 1 ? "" : "s"}`
                    : `${item.brand} <span class="mx-1">•</span> Product`;
                list += `
          <div class="flex items-center justify-between gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-all rounded-xl">
            <div class="flex items-center gap-4 min-w-0">
              ${picture}
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 truncate">${item.name}</p>
                <p class="text-sm ${isMeal ? "text-emerald-600" : "text-blue-600"}">${sub}</p>
                <p class="text-xs text-gray-400 mt-1">${item.time}</p>
              </div>
            </div>
            <div class="flex items-center gap-4 shrink-0">
              <div class="text-center">
                <p class="text-xl font-bold text-emerald-600">${Math.round(item.calories)}</p>
                <p class="text-xs text-gray-500">kcal</p>
              </div>
              <div class="flex gap-2 text-xs">
                <span class="px-2 py-1 rounded-lg bg-blue-50 text-gray-600">${(Math.round(item.protein * 10) / 10)}g P</span>
                <span class="px-2 py-1 rounded-lg bg-amber-50 text-gray-600">${(Math.round(item.carbs * 10) / 10)}g C</span>
                <span class="px-2 py-1 rounded-lg bg-purple-50 text-gray-600">${(Math.round(item.fat * 10) / 10)}g F</span>
              </div>
              <button class="delete-log-item text-gray-400 hover:text-red-500" data-index="${i}" aria-label="Remove item">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>`;
            }
        }
        let days = ``;
        let weekCal = 0;
        let weekItems = 0;
        let onGoal = 0;
        for (let i = 0; i < week.length; i++) {
            let day = week[i];
            let hasData = day.calories > 0;
            let color = hasData ? "text-emerald-600" : "text-gray-300";
            weekCal += day.calories;
            weekItems += day.items;
            if (hasData && day.calories <= goals.calories) {
                onGoal++;
            }
            days += `
        <div class="text-center py-2 rounded-xl ${i == week.length - 1 ? "bg-indigo-100" : ""}">
          <p class="text-xs text-gray-500">${day.date.toLocaleDateString("en-US", { weekday: "short" })}</p>
          <p class="font-medium text-gray-900 mb-1">${day.date.getDate()}</p>
          <p class="text-lg font-bold ${color}">${day.calories}</p>
          <p class="text-xs ${color}">kcal</p>
          ${hasData ? `<p class="text-xs text-gray-400 mt-1">${day.items} ${day.items == 1 ? "item" : "items"}</p>` : ``}
        </div>`;
        }
        foodLogSection.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold mb-2"><i class="fa-solid fa-clipboard-list mr-2"></i>Daily Food Log</h2>
              <p class="opacity-90">Track and monitor your daily nutrition intake</p>
            </div>
            <div class="text-right">
              <p class="text-sm opacity-80">Today</p>
              <p class="text-xl font-bold">${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 mb-6 border-2 border-gray-200">
          <h3 class="text-lg font-bold text-gray-900 mb-4"><i class="fa-solid fa-fire text-orange-500 mr-2"></i>Today's Nutrition</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">${progress}</div>

          <div class="border-t border-gray-200 pt-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-gray-700">Logged Items (${today.length})</h4>
              ${today.length > 0 ? `<button id="clear-foodlog" class="text-red-500 hover:text-red-600 text-sm font-medium"><i class="fa-solid fa-trash mr-1"></i>Clear All</button>` : ``}
            </div>
            <div class="space-y-2">${list}</div>
          </div>
        </div>

                <div class="bg-white rounded-2xl p-6 mb-6 border-2 border-gray-200">
          <h3 class="text-lg font-bold text-gray-900 mb-4"><i class="fa-solid fa-calendar-week text-indigo-500 mr-2"></i>Weekly Overview</h3>
          <div class="grid grid-cols-7 gap-2">${days}</div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-2xl p-5 border border-gray-200 flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <i class="fa-solid fa-chart-line text-emerald-600 text-xl"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500">Weekly Average</p>
              <p class="text-2xl font-bold text-gray-900">${Math.round(weekCal / 7)} kcal</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-gray-200 flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <i class="fa-solid fa-utensils text-blue-600 text-xl"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500">Total Items This Week</p>
              <p class="text-2xl font-bold text-gray-900">${weekItems} ${weekItems == 1 ? "item" : "items"}</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-gray-200 flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <i class="fa-solid fa-bullseye text-purple-600 text-xl"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500">Days On Goal</p>
              <p class="text-2xl font-bold text-gray-900">${onGoal} / 7</p>
            </div>
          </div>
        </div>
      </div>`;
    }
    function clearToday() {
        localStorage.removeItem(logKey(new Date()));
        renderFoodLog();
        showToast("Today's log cleared");
    }
    function askClear() {
        if (typeof Swal !== "undefined") {
            Swal.fire({
                title: "Clear Today's Log?",
                text: "This will remove all logged food items for today.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, clear it!",
                confirmButtonColor: "#ef4444",
                cancelButtonColor: "#6b7280"
            }).then(function (result) {
                if (result.isConfirmed) {
                    clearToday();
                }
            });
        }
        else if (confirm("Clear today's log?")) {
            clearToday();
        }
    }
    foodLogSection.addEventListener("click", function (back) {
        let target = back.target;
        if (target.closest("#browse-recipes-btn")) {
            nextPage("meals");
            return;
        }
        if (target.closest("#scan-product-btn")) {
            nextPage("product");
            return;
        }
        if (target.closest("#clear-foodlog")) {
            askClear();
            return;
        }
        let deleteBtn = target.closest(".delete-log-item");
        if (deleteBtn) {
            let items = readLog(new Date());
            items.splice(Number(deleteBtn.dataset.index), 1);
            writeLog(new Date(), items);
            renderFoodLog();
        }
    });
    for (let i = 0; i < navLink.length; i++) {
        navLink[i].addEventListener("click", renderFoodLog);
    }
    renderFoodLog();
    let appOverlay = document.getElementById("app-loading-overlay");
    window.addEventListener("load", function () {
        appOverlay.classList.add("opacity-0", "pointer-events-none");
        setTimeout(function () {
            appOverlay.classList.add("loading");
        }, 500);
    });
})();
