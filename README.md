# ito ito Code Challenge – Define Sewing Lines 🧵

Hi there!  
I'm Behzad and this is my solution for the ito ito frontend challenge.  
In this project, I built a small tool where you can upload 2D sewing patterns (SVG files), define sewing lines, and view a simple 3D preview.

---

## 🧩 What I Built

This app is designed in **three simple phases**:

### 1. Uploading SVG Patterns
- I made it so you can upload **two SVGs at once** with a single click.
- They will appear next to each other on the screen for easy reference and interaction.

### 2. Drawing Sewing Lines
- You can draw connections (sewing lines) between edges of the two patterns:
  - **Left click** creates a **red line** (for nearby edges).
  - **Right click** creates a **blue line** (for farther connections).
- Also, I want to mention that **you can currently click anywhere**, but in the future I plan to **limit the clickable area to only the edges** for more accuracy.
- A **live pointer** follows your cursor to help track where the lines are drawn.
- I also designed it so that **blue lines appear underneath red lines**, keeping the visuals clean.
- At any point, you can:
  - Click **Undo** to remove the last line
  - Click **Reset** to remove all lines and start over

### 3. Previewing in 3D
- When you're ready, just hit **"Show 3D"** to see a basic 3D preview of the connected pieces using **Three.js**.
- Right now, the 3D view gives a general idea of the form — but it **needs more work to show everything exactly in 3D** (like proper depth, structure, and alignment).

---

## 🛠️ Tech Stack

- ⚛️ **React** – Frontend framework
- 🧵 **SVG.js** – For handling and displaying SVG patterns
- 🌐 **Three.js** – For 3D visualization
- 🎨 **Tailwind CSS** – For styling
- ⚡ **Vite** – Fast build and development environment

---

![Introduction](introduction.gif)



## 🚀 How to Run It

```bash
git clone https://github.com/behzadkazemi/behzad-itoito-code-challengee.git
cd behzad-itoito-code-challengee
npm install
npm run dev




🙏 Final Words
First, I want to say thank you for giving me the opportunity to work on this challenge.
Some parts of the project were a bit confusing and could use more clarification, but I did my best to understand and build a working prototype.

Honestly, I learned a lot during this process — especially around SVG handling, drawing interactions, and integrating Three.js.
I believe that with more time and feedback, I can improve this project even more.

If you believe in me, I’m confident I can take it further and build something even better! 🙌







