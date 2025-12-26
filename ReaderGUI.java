import java.awt.*;
import javax.swing.*;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;

public class ReaderGUI extends JFrame {

    // Components
    private JTextArea inputArea;       // Where user types raw text
    private JTextPane displayPane;     // Where enhanced text is shown
    private JCheckBox bionicToggle;    // Toggle Bionic Mode
    private JComboBox<String> themeSelector;  // Theme selector: Light/Dark/High Contrast
    private JComboBox<String> fontSelector;
    private JSlider sizeSlider;
    private JPanel toolbar;            // Toolbar panel for theme updates

    // State Variables
    private boolean isBionic = false;
    private String currentTheme = "Light";  // Light, Dark, or High Contrast

    public ReaderGUI() {
        setTitle("Dyslexia & Low-Vision Reader Aid");
        setSize(1000, 700);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        initializeComponents();
        updateDisplay(); // Initial render
    }

    private void initializeComponents() {
        // --- TOOLBAR (Top) ---
        toolbar = new JPanel(new FlowLayout(FlowLayout.LEFT));
        toolbar.setBackground(new Color(230, 230, 230));

        // 1. Font Selector
        // Comic Sans is often cited as dyslexia-friendly due to unique letter shapes
        String[] fonts = {
            "SansSerif", "Verdana", "Comic Sans MS", "Arial", 
            "Tahoma", "Trebuchet MS", "Georgia", "Times New Roman",
            "Courier New", "Century Gothic", "Lucida Sans", "Calibri"
        };
        fontSelector = new JComboBox<>(fonts);
        fontSelector.addActionListener(e -> updateDisplay());

        // 2. Font Size Slider
        sizeSlider = new JSlider(12, 48, 18);
        sizeSlider.setPaintLabels(true);
        sizeSlider.setMajorTickSpacing(12);
        sizeSlider.addChangeListener(e -> updateDisplay());

        // 3. Toggles
        bionicToggle = new JCheckBox("Bionic Reading Mode");
        bionicToggle.addActionListener(e -> {
            isBionic = bionicToggle.isSelected();
            updateDisplay();
        });

        // Theme selector: Light, Dark, High Contrast
        String[] themes = {"Light", "Dark", "High Contrast"};
        themeSelector = new JComboBox<>(themes);
        themeSelector.setSelectedIndex(0); // Default to Light Mode
        themeSelector.addActionListener(e -> {
            currentTheme = (String) themeSelector.getSelectedItem();
            if (currentTheme != null) {
                applyTheme();
            }
        });

        toolbar.add(new JLabel("Font:"));
        toolbar.add(fontSelector);
        toolbar.add(new JLabel("Size:"));
        toolbar.add(sizeSlider);
        toolbar.add(new JSeparator(SwingConstants.VERTICAL));
        toolbar.add(bionicToggle);
        toolbar.add(new JLabel("Theme:"));
        toolbar.add(themeSelector);

        add(toolbar, BorderLayout.NORTH);

        // --- SPLIT PANE (Center) ---
        // Left: Input (Raw), Right: Output (Processed)
        
        inputArea = new JTextArea("Paste or type your text here...\n\nTry reading this text with Bionic Mode enabled. It guides the eye by highlighting the initial letters of words.");
        inputArea.setLineWrap(true);
        inputArea.setWrapStyleWord(true);
        inputArea.setFont(new Font("SansSerif", Font.PLAIN, 14));
        inputArea.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        // Listener: Update output instantly when user types
        inputArea.getDocument().addDocumentListener(new DocumentListener() {
            @Override
            public void insertUpdate(DocumentEvent e) { updateDisplay(); }
            @Override
            public void removeUpdate(DocumentEvent e) { updateDisplay(); }
            @Override
            public void changedUpdate(DocumentEvent e) { updateDisplay(); }
        });

        displayPane = new JTextPane();
        displayPane.setContentType("text/html"); // Crucial for Bionic rendering
        displayPane.setEditable(false);
        displayPane.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        JSplitPane splitPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, 
            new JScrollPane(inputArea), 
            new JScrollPane(displayPane));
        splitPane.setResizeWeight(0.4); // Input takes 40% width
        
        add(splitPane, BorderLayout.CENTER);
    }

    // --- LOGIC METHODS ---

    private void updateDisplay() {
        String rawText = inputArea.getText();
        int size = sizeSlider.getValue();
        String fontFace = (String) fontSelector.getSelectedItem();
        
        // Get colors for HTML body styling based on theme
        String bgColor, textColor;
        switch (currentTheme) {
            case "Dark" -> {
                bgColor = "#1E1E1E";  // Dark grey
                textColor = "#DCDCDC"; // Light grey
            }
            case "High Contrast" -> {
                bgColor = "#FFFFFF";  // Pure white
                textColor = "#000000"; // Pure black
            }
            default -> { // Light Mode
                bgColor = "#FFFAF0";  // Floral White
                textColor = "#000000"; // Black
            }
        }

        if (isBionic) {
            // Use TextProcessor for Bionic Logic
            String html = TextProcessor.convertToBionic(rawText, size, fontFace);
            // Inject color styles into the HTML body
            html = html.replace("<body style='", 
                "<body style='background-color:" + bgColor + "; color:" + textColor + "; ");
            displayPane.setText(html);
        } else {
            // Standard Text Mode (just HTML wrapping for size/font consistency)
            // Escape HTML first, then convert newlines to <br> tags
            String escapedText = escapeHtmlForDisplay(rawText);
            String htmlText = escapedText.replace("\n", "<br>");
            displayPane.setText("<html><body style='font-family:" + fontFace + "; font-size:" + size + "px; " +
                                "background-color:" + bgColor + "; color:" + textColor + ";'>" 
                                + htmlText
                                + "</body></html>");
        }
        
        // Re-apply component colors because JTextPane resets on new text
        Color bg, fg;
        switch (currentTheme) {
            case "Dark" -> {
                bg = new Color(30, 30, 30);
                fg = new Color(220, 220, 220);
            }
            case "High Contrast" -> {
                bg = Color.WHITE;
                fg = Color.BLACK;
            }
            default -> { // Light Mode
                bg = new Color(255, 250, 240);
                fg = Color.BLACK;
            }
        }
        displayPane.setBackground(bg);
        displayPane.setForeground(fg);
    }

    private void applyTheme() {
        Color bg, fg, inputBg, inputFg, toolbarBg;

        switch (currentTheme) {
            case "Dark" -> {
                // Dark Mode
                bg = new Color(30, 30, 30);           // Dark Grey background
                fg = new Color(220, 220, 220);        // Light Grey text
                inputBg = new Color(45, 45, 45);      // Slightly lighter dark for input
                inputFg = new Color(220, 220, 220);   // Light Grey text
                toolbarBg = new Color(50, 50, 50);    // Dark toolbar
            }
            case "High Contrast" -> {
                // High Contrast Mode - Pure black and white for maximum contrast
                bg = Color.WHITE;                     // Pure white background
                fg = Color.BLACK;                     // Pure black text
                inputBg = Color.WHITE;                // Pure white input
                inputFg = Color.BLACK;                // Pure black text
                toolbarBg = Color.LIGHT_GRAY;         // Light grey toolbar
            }
            default -> { // Light Mode
                // Light Mode
                bg = new Color(255, 250, 240);        // Floral White (Creamy)
                fg = Color.BLACK;
                inputBg = Color.WHITE;
                inputFg = Color.BLACK;
                toolbarBg = new Color(230, 230, 230); // Light grey toolbar
            }
        }

        // Apply to display pane
        displayPane.setBackground(bg);
        displayPane.setForeground(fg);
        
        // Apply to input area
        inputArea.setBackground(inputBg);
        inputArea.setForeground(inputFg);
        inputArea.setCaretColor(inputFg); // Cursor color matches text
        
        // Apply to toolbar
        toolbar.setBackground(toolbarBg);
        
        // Update display to apply HTML body color for dark mode
        updateDisplay();
    }
    
    // Helper: Escape HTML special characters to prevent injection
    private String escapeHtmlForDisplay(String text) {
        if (text == null) return "";
        
        StringBuilder escaped = new StringBuilder();
        for (char c : text.toCharArray()) {
            switch (c) {
                case '<' -> escaped.append("&lt;");
                case '>' -> escaped.append("&gt;");
                case '&' -> escaped.append("&amp;");
                case '"' -> escaped.append("&quot;");
                case '\'' -> escaped.append("&#39;");
                default -> escaped.append(c);
            }
        }
        return escaped.toString();
    }
}