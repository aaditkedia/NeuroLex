public class TextProcessor {

    /**
     * Converts plain text into "Bionic Reading" HTML.
     * Logic: Bolds the first half of every word to guide the eye.
     */
    public static String convertToBionic(String text, int fontSize, String fontFace) {
        if (text == null || text.isEmpty()) return "";

        StringBuilder html = new StringBuilder();
        // Start HTML wrapper with dynamic font styles
        html.append("<html><body style='font-family:")
            .append(escapeHtml(fontFace))
            .append("; font-size:")
            .append(fontSize)
            .append("px;'>");

        // Process text character by character to handle newlines and spaces properly
        StringBuilder currentWord = new StringBuilder();
        boolean inWord = false;

        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);

            if (Character.isWhitespace(c)) {
                // Process accumulated word before whitespace
                if (inWord && currentWord.length() > 0) {
                    html.append(processWord(currentWord.toString()));
                    currentWord.setLength(0);
                    inWord = false;
                }

                // Handle different whitespace characters
                switch (c) {
                    case '\n' -> html.append("<br>");
                    case ' ' -> html.append(" ");
                    case '\t' -> html.append("&nbsp;&nbsp;&nbsp;&nbsp;"); // Tab as 4 spaces
                    default -> { } // Other whitespace ignored
                }
            } else {
                // Accumulate characters into word
                currentWord.append(c);
                inWord = true;
            }
        }

        // Process any remaining word at the end
        if (inWord && currentWord.length() > 0) {
            html.append(processWord(currentWord.toString()));
        }

        html.append("</body></html>");
        return html.toString();
    }

    // Helper: Bolds the first half of a single word
    private static String processWord(String word) {
        if (word == null || word.isEmpty()) return "";

        // Find the actual word boundaries (strip leading/trailing punctuation)
        int start = 0;
        int end = word.length();

        // Skip leading punctuation
        while (start < end && !Character.isLetterOrDigit(word.charAt(start))) {
            start++;
        }

        // Skip trailing punctuation
        while (end > start && !Character.isLetterOrDigit(word.charAt(end - 1))) {
            end--;
        }

        // If no letters/digits found, just escape and return
        if (start >= end) {
            return escapeHtml(word);
        }

        // Extract the core word (without punctuation) for split calculation
        String coreWord = word.substring(start, end);
        int coreLen = coreWord.length();

        if (coreLen <= 1) {
            // Very short word: bold the whole thing
            return escapeHtml(word.substring(0, start)) 
                 + "<b>" + escapeHtml(coreWord) + "</b>" 
                 + escapeHtml(word.substring(end));
        }

        // Calculate split point for the core word (round up)
        int splitIndex = (int) Math.ceil(coreLen / 2.0);

        // Split the core word
        String firstHalf = coreWord.substring(0, splitIndex);
        String secondHalf = coreWord.substring(splitIndex);

        // Reconstruct with leading/trailing punctuation preserved
        return escapeHtml(word.substring(0, start))
             + "<b>" + escapeHtml(firstHalf) + "</b>" + escapeHtml(secondHalf)
             + escapeHtml(word.substring(end));
    }

    // Helper: Escape HTML special characters to prevent injection
    private static String escapeHtml(String text) {
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