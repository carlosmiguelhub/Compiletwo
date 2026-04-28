import javax.swing.*;
import java.awt.*;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("CyberCompile Java GUI Test");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setSize(500, 300);
            frame.setLayout(new BorderLayout());

            JLabel label = new JLabel("Hello from Java Swing!", SwingConstants.CENTER);
            label.setFont(new Font("Arial", Font.BOLD, 22));

            JButton button = new JButton("Click Me");
            button.addActionListener(e -> label.setText("Button clicked!"));

            frame.add(label, BorderLayout.CENTER);
            frame.add(button, BorderLayout.SOUTH);

            frame.setVisible(true);
        });
    }
}