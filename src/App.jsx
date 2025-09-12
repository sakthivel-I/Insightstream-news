import React, { useState } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchRecipe = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setRecipes([]);

    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();

      if (!data.meals) {
        setRecipes([]);
        setLoading(false);
        return;
      }

      // Format each recipe
      const formatted = data.meals.map((meal) => {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
          const ingredient = meal[`strIngredient${i}`];
          const measure = meal[`strMeasure${i}`];
          if (ingredient && ingredient.trim()) {
            ingredients.push(`${ingredient} - ${measure}`);
          }
        }

        // Extract YouTube videoId if available
        let youtubeEmbed = null;
        if (meal.strYoutube) {
          const videoId = new URL(meal.strYoutube).searchParams.get("v");
          if (videoId) {
            youtubeEmbed = `https://www.youtube.com/embed/${videoId}`;
          }
        }

        return {
          id: meal.idMeal,
          title: meal.strMeal,
          country: meal.strArea,
          image: meal.strMealThumb,
          ingredients,
          instructions: meal.strInstructions,
          youtube: meal.strYoutube,
          youtubeEmbed,
        };
      });

      setRecipes(formatted);
    } catch (err) {
      console.error("Error fetching recipes:", err);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header>
        <h1>🌍 World Cookbook - Virtual Cooking Assistant</h1>
        <p>
          Search for any dish from any country and get its image, origin,
          ingredients, instructions, and video guide.
        </p>
      </header>

      <div id="search-box">
        <input
          type="text"
          id="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter any food name..."
          onKeyPress={(e) => e.key === "Enter" && searchRecipe()}
        />
        <button id="search-button" onClick={searchRecipe}>
          Search
        </button>
      </div>

      <div id="recipe-container">
        {loading && <p>Loading recipes...</p>}
        {!loading && recipes.length === 0 && (
          <p className="not-loading">🍽️ No recipes yet. Try searching for a dish!</p>
        )}

        {recipes.map((meal) => (
          <div key={meal.id} className="recipe-card">
            <img src={meal.image} alt={meal.title} />
            <div className="recipe-title">{meal.title}</div>
            <div className="recipe-country">
              <strong>Country:</strong> {meal.country}
            </div>
            <div className="recipe-ingredients">
              <strong>Ingredients:</strong>
              <br />
              {meal.ingredients.join(", ")}
            </div>
            <div className="recipe-instructions">
              <strong>Instructions:</strong> {meal.instructions}
            </div>

            {/* ✅ YouTube Embed OR Fallback */}
            {meal.youtubeEmbed ? (
              <div className="recipe-video">
                <strong>🎥 Watch Recipe:</strong>
                <iframe
                  width="100%"
                  height="315"
                  src={meal.youtubeEmbed}
                  title="YouTube recipe video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : meal.youtube ? (
              <p>
                🎥 Watch on{" "}
                <a href={meal.youtube} target="_blank" rel="noopener noreferrer">
                  YouTube
                </a>
              </p>
            ) : (
              <p>🚫 No video available for this recipe.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
