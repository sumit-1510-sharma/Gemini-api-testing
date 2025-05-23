import "./App.css";
import { useState } from "react";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function App() {
  const [inputImageBase64, setInputImageBase64] = useState(null);
  const [imageInputs, setImageInputs] = useState([null, null, null]);
  const [outputImageBase64, setOutputImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");

  const API_KEY = "AIzaSyDpoXsu0byin_HHuJHrBH12Ni000D5CxkM"; // 🔐 Insert your API key

  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     const base64String = reader.result.split(",")[1]; // Remove "data:image/*;base64,"
  //     setInputImageBase64(base64String);
  //   };
  //   reader.readAsDataURL(file);
  // };

  // const generateImage = async () => {
  //   // if (!inputImageBase64) {
  //   //   alert("Please upload an image first.");
  //   //   return;
  //   // }

  //   setLoading(true);
  //   try {
  //     const response = await fetch(
  //       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${API_KEY}`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           contents: [
  //             {
  //               parts: [
  //                 { text: prompt },
  //                 // {
  //                 //   inline_data: {
  //                 //     mime_type: "image/jpeg",
  //                 //     data: inputImageBase64,
  //                 //   },
  //                 // },
  //               ],
  //             },
  //           ],
  //           generationConfig: {
  //             responseModalities: ["TEXT", "IMAGE"],
  //           },
  //         }),
  //       }
  //     );

  //     const data = await response.json();
  //     const base64Image = data.candidates?.[0]?.content?.parts?.find(
  //       (part) => part.inlineData?.data
  //     )?.inlineData?.data;

  //     if (base64Image) {
  //       setOutputImageBase64(base64Image);
  //     } else {
  //       console.error("No image returned:", data);
  //       alert("No image generated.");
  //     }
  //   } catch (error) {
  //     console.error("Error calling Gemini API:", error);
  //     alert("Something went wrong. Check the console for details.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSingleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(",")[1]; // remove data:image/jpeg;base64,...
      const updated = [...imageInputs];
      updated[index] = base64;
      setImageInputs(updated);
    };
    reader.readAsDataURL(file);
  };

  const generateImage = async () => {
    const validImages = imageInputs.filter((img) => img !== null);
    if (validImages.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setLoading(true);
    try {
      const imageParts = validImages.map((base64) => ({
        inline_data: {
          mime_type: "image/jpeg",
          data: base64,
        },
      }));

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
                parts: [{ text: prompt }, ...imageParts],
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

      <div>
        <label>Image 1:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleSingleImageUpload(e, 0)}
        />
        {imageInputs[0] && (
          <img
            src={`data:image/jpeg;base64,${imageInputs[0]}`}
            alt="Image 1"
            width={100}
            style={{ marginLeft: "1rem" }}
          />
        )}
      </div>

      <div>
        <label>Image 2:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleSingleImageUpload(e, 1)}
        />
        {imageInputs[1] && (
          <img
            src={`data:image/jpeg;base64,${imageInputs[1]}`}
            alt="Image 2"
            width={100}
            style={{ marginLeft: "1rem" }}
          />
        )}
      </div>

      <div>
        <label>Image 3:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleSingleImageUpload(e, 2)}
        />
        {imageInputs[2] && (
          <img
            src={`data:image/jpeg;base64,${imageInputs[2]}`}
            alt="Image 3"
            width={100}
            style={{ marginLeft: "1rem" }}
          />
        )}
      </div>

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

      <button onClick={generateImage} disabled={loading}>
        {loading ? "Generating..." : "Generate Image"}
      </button>

      {outputImageBase64 && (
        <div style={{ marginTop: "1rem" }}>
          <img
            src={`data:image/png;base64,${outputImageBase64}`}
            alt="Generated"
            width={300}
          />
        </div>
      )}
    </div>
  );
}

export default App;
