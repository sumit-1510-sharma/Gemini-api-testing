import "./App.css";
import { useState } from "react";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function App() {
  const [inputImageBase64, setInputImageBase64] = useState(null);
  const [outputImageBase64, setOutputImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState(
    "Edit this photo by drawing directly on top of it: Surround the subject with fluffy, hand‑drawn pastel clouds. Add floating crescent moons and tiny twinkling stars above the head. Lightly outline the subject with a chalk‑style white line. Preserve the photo underneath. Do not add any text on the photo."
  );

  const API_KEY = "AIzaSyDpoXsu0byin_HHuJHrBH12Ni000D5CxkM"; // 🔐 Insert your API key

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1]; // Remove "data:image/*;base64,"
      setInputImageBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const generateImage = async () => {
    if (!inputImageBase64) {
      alert("Please upload an image first.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: "image/jpeg",
                      data: inputImageBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          }),
        }
      );

      const data = await response.json();
      const base64Image = data.candidates?.[0]?.content?.parts?.find(
        (part) => part.inlineData?.data
      )?.inlineData?.data;

      if (base64Image) {
        setOutputImageBase64(base64Image);
      } else {
        console.error("No image returned:", data);
        alert("No image generated.");
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      alert("Something went wrong. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Gemini Image Generator</h1>

      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <br />

      <textarea
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
        style={{
          width: "100%",
          marginTop: "1rem",
          padding: "0.5rem",
          fontSize: "1rem",
          height: 200,
        }}
      />

      <button onClick={generateImage} disabled={loading || !inputImageBase64}>
        {loading ? "Generating..." : "Generate Image"}
      </button>

      <div style={{ marginTop: "1rem" }}>
        {outputImageBase64 && (
          <img
            src={`data:image/png;base64,${outputImageBase64}`}
            alt="Generated"
            width={300}
          />
        )}
      </div>
    </div>
  );
}

export default App;
