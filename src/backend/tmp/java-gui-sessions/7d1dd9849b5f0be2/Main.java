import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class Main extends JFrame {
    private JTextField productNameField;
    private JTextField priceField;
    private JTextField quantityField;
    private JComboBox<String> categoryBox;
    private JTable table;
    private DefaultTableModel tableModel;
    private JLabel totalLabel;

    public Main() {
        setTitle("Inventory Management System");
        setSize(1050, 650);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        JPanel root = new JPanel(new BorderLayout(15, 15));
        root.setBorder(new EmptyBorder(20, 20, 20, 20));
        root.setBackground(new Color(245, 247, 250));

        JLabel title = new JLabel("Inventory Management System");
        title.setFont(new Font("Arial", Font.BOLD, 30));
        title.setForeground(new Color(35, 45, 65));
        title.setHorizontalAlignment(SwingConstants.CENTER);

        JLabel subtitle = new JLabel("Add products, track quantity, and manage stock records");
        subtitle.setFont(new Font("Arial", Font.PLAIN, 14));
        subtitle.setForeground(new Color(100, 110, 130));
        subtitle.setHorizontalAlignment(SwingConstants.CENTER);

        JPanel headerPanel = new JPanel(new GridLayout(2, 1, 5, 5));
        headerPanel.setBackground(new Color(245, 247, 250));
        headerPanel.add(title);
        headerPanel.add(subtitle);

        root.add(headerPanel, BorderLayout.NORTH);

        JPanel formPanel = new JPanel();
        formPanel.setLayout(new GridBagLayout());
        formPanel.setBorder(BorderFactory.createTitledBorder("Product Details"));
        formPanel.setBackground(Color.WHITE);

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(10, 12, 10, 12);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        productNameField = new JTextField(18);
        priceField = new JTextField(18);
        quantityField = new JTextField(18);
        categoryBox = new JComboBox<>(new String[]{
                "Electronics",
                "School Supplies",
                "Food",
                "Clothing",
                "Accessories",
                "Others"
        });

        addFormRow(formPanel, gbc, 0, "Product Name:", productNameField);
        addFormRow(formPanel, gbc, 1, "Category:", categoryBox);
        addFormRow(formPanel, gbc, 2, "Price:", priceField);
        addFormRow(formPanel, gbc, 3, "Quantity:", quantityField);

        JButton addButton = new JButton("Add Product");
        JButton clearButton = new JButton("Clear Fields");
        JButton removeButton = new JButton("Remove Selected");

        addButton.setBackground(new Color(45, 120, 255));
        addButton.setForeground(Color.WHITE);
        addButton.setFocusPainted(false);

        clearButton.setBackground(new Color(230, 235, 245));
        clearButton.setFocusPainted(false);

        removeButton.setBackground(new Color(220, 70, 70));
        removeButton.setForeground(Color.WHITE);
        removeButton.setFocusPainted(false);

        JPanel buttonPanel = new JPanel(new GridLayout(3, 1, 8, 8));
        buttonPanel.setBackground(Color.WHITE);
        buttonPanel.add(addButton);
        buttonPanel.add(clearButton);
        buttonPanel.add(removeButton);

        gbc.gridx = 0;
        gbc.gridy = 4;
        gbc.gridwidth = 2;
        formPanel.add(buttonPanel, gbc);

        root.add(formPanel, BorderLayout.WEST);

        String[] columns = {"Product", "Category", "Price", "Qty", "Subtotal"};
        tableModel = new DefaultTableModel(columns, 0);
        table = new JTable(tableModel);
        table.setRowHeight(28);
        table.setFont(new Font("Arial", Font.PLAIN, 13));
        table.getTableHeader().setFont(new Font("Arial", Font.BOLD, 13));

        JScrollPane scrollPane = new JScrollPane(table);
        scrollPane.setBorder(BorderFactory.createTitledBorder("Inventory Records"));

        JPanel tablePanel = new JPanel(new BorderLayout(10, 10));
        tablePanel.setBackground(Color.WHITE);
        tablePanel.add(scrollPane, BorderLayout.CENTER);

        totalLabel = new JLabel("Total Inventory Value: ₱0.00");
        totalLabel.setFont(new Font("Arial", Font.BOLD, 18));
        totalLabel.setHorizontalAlignment(SwingConstants.RIGHT);
        totalLabel.setBorder(new EmptyBorder(10, 10, 10, 10));

        tablePanel.add(totalLabel, BorderLayout.SOUTH);
        root.add(tablePanel, BorderLayout.CENTER);

        addButton.addActionListener(e -> addProduct());
        clearButton.addActionListener(e -> clearFields());
        removeButton.addActionListener(e -> removeSelectedProduct());

        add(root);
        setVisible(true);
    }

    private void addFormRow(JPanel panel, GridBagConstraints gbc, int row, String labelText, JComponent input) {
        JLabel label = new JLabel(labelText);
        label.setFont(new Font("Arial", Font.BOLD, 13));

        gbc.gridx = 0;
        gbc.gridy = row;
        gbc.gridwidth = 1;
        panel.add(label, gbc);

        gbc.gridx = 1;
        panel.add(input, gbc);
    }

    private void addProduct() {
        String name = productNameField.getText().trim();
        String category = categoryBox.getSelectedItem().toString();
        String priceText = priceField.getText().trim();
        String quantityText = quantityField.getText().trim();

        if (name.isEmpty() || priceText.isEmpty() || quantityText.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Please fill in all fields.");
            return;
        }

        try {
            double price = Double.parseDouble(priceText);
            int quantity = Integer.parseInt(quantityText);
            double subtotal = price * quantity;

            tableModel.addRow(new Object[]{
                    name,
                    category,
                    String.format("₱%.2f", price),
                    quantity,
                    String.format("₱%.2f", subtotal)
            });

            clearFields();
            updateTotal();
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Price must be a number and quantity must be a whole number.");
        }
    }

    private void clearFields() {
        productNameField.setText("");
        priceField.setText("");
        quantityField.setText("");
        categoryBox.setSelectedIndex(0);
    }

    private void removeSelectedProduct() {
        int selectedRow = table.getSelectedRow();

        if (selectedRow == -1) {
            JOptionPane.showMessageDialog(this, "Please select a product to remove.");
            return;
        }

        tableModel.removeRow(selectedRow);
        updateTotal();
    }

    private void updateTotal() {
        double total = 0;

        for (int i = 0; i < tableModel.getRowCount(); i++) {
            String subtotalText = tableModel.getValueAt(i, 4).toString();
            subtotalText = subtotalText.replace("₱", "").replace(",", "");
            total += Double.parseDouble(subtotalText);
        }

        totalLabel.setText(String.format("Total Inventory Value: ₱%.2f", total));
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new Main());
    }
}