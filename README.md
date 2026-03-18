# Capstone-project-1

# 📷 Photo Exposure Calculator

> An interactive web tool that solves the Exposure Triangle in real time —
> lock any two of Shutter Speed, Aperture, and ISO, and the third is calculated automatically.

---

## 🌟 Background & Motivation

Perhaps the most common obstacle anyone encounters when first learning digital photography is the **Exposure Triangle**. Understanding intuitively how Shutter Speed, Aperture, and ISO connect with one another takes a considerable amount of time. Simply reading and memorizing a textbook is not enough — and unless you are majoring in photography, sitting through dedicated coursework and lectures is no easy commitment.

That is why I felt there needed to be a tool that lets people **actually change the numbers and see the results for themselves**.

As it happened, I was in the middle of building a web development portfolio at the time, and I was specifically looking for a project that could go beyond simple clone coding — something that implemented real domain knowledge directly in code, demonstrating both **engineering thinking and development ability** at once. The exposure calculator was an idea that naturally bridged the two.

---

## 🎯 Project Overview

**Goal:** Build an interactive web calculator where the user locks any two of the three parameters — Shutter Speed, Aperture, and ISO — and the remaining one is automatically solved using the EV (Exposure Value) formula.

### Core Formula

```
EV = log₂(N² / t) - log₂(ISO / 100)
```

| Variable | Description |
|---|---|
| `N` | Aperture f-number |
| `t` | Shutter speed (seconds) |
| `ISO` | Sensor sensitivity |

### Key Features

- 🔒 **Lock 2 of 3 parameters** → auto-solve the third via inverse calculation
- 📊 **EV bar visualization** mapped across a 0–20 spectrum
- 🌤 **Context-aware descriptions** for shooting environment (night, indoor, outdoor, etc.)
- ⚡ **5 shooting presets** — Sunny / Indoor / Night / Portrait / Sports
- 📋 **Equivalent exposure table** with characteristic tags (Motion Blur / Freeze / Bokeh)

---

## 🛠 Tech Stack

```
index.html   — Structure
style.css    — Styling
script.js    — Calculation logic & UI interactions
```

- Vanilla HTML / CSS / JavaScript (no frameworks, no libraries)
- Canvas API
- Responsive design (desktop & mobile)

---

## ⚙️ Development Process

### ① Design Phase

The core design challenge was structuring the logic for *"automatically solving one of three interdependent variables."* Unlike a one-directional calculator, this required real-time tracking of which variables were locked, with a hard constraint that **exactly two must always be locked**. Defining this state management structure before writing any code was the most critical planning step.

### ② Calculation Logic

The EV formula was implemented using JavaScript's `Math.log2()`. Inverse calculation was branched based on which parameter was unlocked:

```js
// Solving for Shutter Speed
t = N² / 2^(EV + log₂(ISO / 100))

// Solving for Aperture
N = √(2^(EV + log₂(ISO / 100)) × t)
```

Since the sliders operate on **discrete arrays** rather than continuous values, a nearest-index search was implemented to map each calculated result to the closest available value.

### ③ UI Design

The three parameter panels were laid out symmetrically so that locking and unlocking any of them felt natural and consistent. When a panel was unlocked (being auto-calculated), a **background color shift** and a `CALCULATING` label provided clear visual feedback about the current state.

### ④ File Architecture Separation

The project was initially developed as a single HTML file, then refactored into three separate files: `index.html`, `style.css`, and `script.js`. During this process, a path mismatch bug caused the files to fail to link correctly — debugging this firsthand gave practical experience with how browsers resolve relative file paths and the importance of **consistent naming conventions**.

### ⑤ Extended Features

After completing the core calculator, an equivalent exposure combination table was added. For a given EV, the table generates multiple valid combinations across different ISO and aperture settings, and tags each with its photographic characteristic so the user can pick the right setting for their shooting intention.

---

## 📈 Results

### Technical Outcomes

- ✅ Implemented the full EV inverse calculation formula in JavaScript with **zero library dependencies**
- ✅ Completed a stable 3-parameter lock state manager that always guarantees exactly two parameters are locked
- ✅ Applied a separated HTML / CSS / JS file architecture, gaining practical experience with modular code organization
- ✅ Implemented responsive design — functions correctly on both desktop and mobile

### Key Learnings

- Practical application of JS math functions (`Math.log2`, `Math.pow`, `Math.sqrt`) in a physics-based context
- Nearest-value mapping between continuous inverse-calculated results and discrete slider arrays
- Designing state that simultaneously affects multiple UI elements without inconsistency
- The critical importance of file path management in a multi-file architecture

### Portfolio Value

This project goes beyond a typical calculator exercise by implementing a **real domain-specific formula** — the Exposure Value equation — directly in code. It demonstrates the ability to bridge engineering understanding and software development. The inverse calculation logic in particular showcases mathematical thinking applied directly to a practical programming problem.

---

## 📁 File Structure

```
exposure-calculator/
├── index.html          # HTML structure
├── exposure-style.css  # Styles
└── exposure-script.js  # Calculation logic & DOM interactions
```

---

## 🚀 Getting Started

1. Download all three files into the **same folder**
2. Open `index.html` in any modern browser
3. No installation or build step required

---

*Built as part of a web development portfolio — combining domain knowledge in digital photography with hands-on JavaScript development.*
