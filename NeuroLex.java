import javax.swing.SwingUtilities;
import javax.swing.UIManager;
import javax.swing.UnsupportedLookAndFeelException;

public class NeuroLex {
    public static void main(String[] args) {
        System.out.println("[App] Launching Dyslexia Reader Tool...");

        // Try to make the buttons look like the native OS (Windows/Mac)
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException | UnsupportedLookAndFeelException ignored) { }

        SwingUtilities.invokeLater(() -> {
            new ReaderGUI().setVisible(true);
        });
    }
}