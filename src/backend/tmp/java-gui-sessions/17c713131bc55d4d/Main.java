import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("Java GUI Example");
            frame.setSize(400, 250);
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setLocationRelativeTo(null);

            JPanel panel = new JPanel();
            panel.setLayout(new GridLayout(4, 1, 10, 10));
            panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

            JLabel titleLabel = new JLabel("Welcome to Java GUI", SwingConstants.CENTER);
            titleLabel.setFont(new Font("Arial", Font.BOLD, 20));

            JTextField nameField = new JTextField();
            nameField.setHorizontalAlignment(JTextField.CENTER);
            nameField.setFont(new Font("Arial", Font.PLAIN, 16));

            JButton button = new JButton("Click Me");

            JLabel resultLabel = new JLabel("", SwingConstants.CENTER);
            resultLabel.setFont(new Font("Arial", Font.PLAIN, 16));

            button.addActionListener(new ActionListener() {
                @Override
                public void actionPerformed(ActionEvent e) {
                    String name = nameField.getText();

                    if (name.isEmpty()) {
                        resultLabel.setText("Please enter your name.");
                    } else {
                        resultLabel.setText("Hello, " + name + "!");
                    }
                }
            });

            panel.add(titleLabel);
            panel.add(nameField);
            panel.add(button);
            panel.add(resultLabel);

            frame.add(panel);
            frame.setVisible(true);
        });
    }
}