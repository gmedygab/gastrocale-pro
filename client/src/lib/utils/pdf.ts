import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FullRecipe } from "@shared/schema";
import RecipePDF from "@/components/Recipe/RecipePDF";
import { createRoot } from "react-dom/client";
import * as React from "react";

export async function generateRecipePDF(recipe: FullRecipe): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create a detached DOM element to render our PDF content
      const element = document.createElement("div");
      document.body.appendChild(element);
      
      // Set styles for PDF rendering
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.width = "800px";
      element.style.height = "auto";
      
      // Render the RecipePDF component into our detached element
      const root = createRoot(element);
      root.render(React.createElement(RecipePDF, { recipe }));
      
      // Wait a moment for the component to render
      setTimeout(async () => {
        try {
          // Use html2canvas to convert the component to a canvas
          const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff"
          });
          
          // Initialize the PDF
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
          });
          
          // Calculate the proper width to maintain aspect ratio
          const imgWidth = 210; // A4 width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add the image to the PDF
          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
          
          // If the content is longer than one page, we need to add more pages
          if (imgHeight > 297) { // A4 height in mm
            let remainingHeight = imgHeight;
            let position = -297;
            
            while (remainingHeight > 0) {
              remainingHeight -= 297;
              position -= 297;
              
              if (remainingHeight > 0) {
                pdf.addPage();
                pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
              }
            }
          }
          
          // Save the PDF
          pdf.save(`${recipe.name.replace(/\s+/g, "_")}_recipe.pdf`);
          
          // Clean up
          document.body.removeChild(element);
          resolve();
        } catch (error) {
          console.error("Error generating PDF:", error);
          document.body.removeChild(element);
          reject(error);
        }
      }, 500);
    } catch (error) {
      console.error("Error setting up PDF generation:", error);
      reject(error);
    }
  });
}
