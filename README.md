# NeuroLex - Dyslexia & Low-Vision Reader Aid

A Java Swing application designed to help individuals with dyslexia and low vision read text more easily. The app features **Bionic Reading** technology that bolds the first half of each word to guide the eye and improve reading speed and comprehension.

## Features

### 🔤 Bionic Reading Mode
- Automatically bolds the first half of each word to guide eye movement
- Improves reading speed and comprehension for users with dyslexia
- Real-time text processing as you type

### 🎨 Multiple Theme Modes
- **Light Mode**: Cream-colored background with black text (easy on the eyes)
- **Dark Mode**: Dark grey background with light grey text (reduces eye strain)
- **High Contrast Mode**: Pure white background with pure black text (maximum visibility)

### 🔤 Font Customization
- 12 different font options including:
  - Comic Sans MS (dyslexia-friendly)
  - Verdana, Arial, Tahoma
  - Trebuchet MS, Georgia
  - Times New Roman, Courier New
  - And more...
- Adjustable font size (12-48px) with slider control

### 📝 Dual-Pane Interface
- **Left Pane**: Input area for typing or pasting text
- **Right Pane**: Enhanced text display with real-time formatting
- Side-by-side comparison for easy reference

## Screenshots

*[Add screenshots of your application here]*

## Requirements

- **Java**: JDK 8 or higher
- **Operating System**: Windows, macOS, or Linux
- No external dependencies required (uses standard Java Swing library)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/DyslexiaLow-Vision_Reader.git
cd DyslexiaLow-Vision_Reader
```

2. Compile the Java files:
```bash
javac *.java
```

3. Run the application:
```bash
java NeuroLex
```

## Usage

1. **Launch the application** - Run `NeuroLex.java`

2. **Enter your text** - Type or paste text into the left input pane

3. **Enable Bionic Reading** (optional):
   - Check the "Bionic Reading Mode" checkbox
   - Watch as the first half of each word becomes bold in real-time

4. **Customize your reading experience**:
   - Select a font from the dropdown menu
   - Adjust font size using the slider
   - Switch between Light, Dark, or High Contrast themes

5. **Read comfortably** - The processed text appears in the right pane with your chosen settings

## How It Works

### Bionic Reading Technology
Bionic Reading is a reading technique that guides the eye by highlighting the initial letters of words. The algorithm:
1. Processes text word by word
2. Identifies the core word (ignoring punctuation)
3. Calculates the midpoint of each word
4. Bolds the first half while keeping the second half normal
5. Preserves punctuation and formatting

**Example**: "hello" becomes **"hel"**lo, "reading" becomes **"read"**ing

### Technical Implementation
- Built with Java Swing for cross-platform compatibility
- Real-time text processing using character-by-character analysis
- HTML rendering for styled text display
- HTML escaping to prevent injection attacks
- Character-by-character whitespace handling for proper formatting

## Project Structure

```
DyslexiaLow-Vision_Reader/
├── NeuroLex.java            # Main entry point
├── ReaderGUI.java           # GUI implementation and layout
├── TextProcessor.java       # Bionic Reading processing logic
├── README.md                # This file
├── LICENSE                  # MIT License
└── .gitignore              # Git ignore file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Bionic Reading technology
- Designed with accessibility in mind
- Built for the dyslexia and low-vision community

## Future Enhancements

Potential features for future versions:
- [ ] Text-to-speech integration
- [ ] Customizable bold percentage
- [ ] Export to PDF/image
- [ ] Additional color themes
- [ ] Word spacing adjustments
- [ ] Line height customization
- [ ] Reading speed statistics

## Support

If you encounter any issues or have suggestions, please open an issue on GitHub.

---

**Made with ❤️ for accessibility and inclusive reading**

