import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class Main extends JFrame {
    private JTextField itemField;
    private JTextField amountField;
    private JComboBox<String> categoryBox;
    private JTable expenseTable;
    private DefaultTableModel tableModel;
    private JLabel totalLabel;

    public Main() {
        setTitle("Personal Expense Tracker");
        setSize(900, 560);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        JPanel root = new JPanel(new BorderLayout(15, 15));
        root.setBorder(new EmptyBorder(20, 20, 20, 20));
        root.setBackground(new Color(245, 247, 250));

        JLabel title = new JLabel("Personal Expense Tracker");
        title.setFont(new Font("Arial", Font.BOLD, 30));
        title.setHorizontalAlignment(SwingConstants.CENTER);
        title.setForeground(new Color(35, 45, 65));

        JLabel subtitle = new JLabel("Add expenses, categorize spending, and track your total cost");
        subtitle.setFont(new Font("Arial", Font.PLAIN, 14));
        subtitle.setHorizontalAlignment(SwingConstants.CENTER);
        subtitle.setForeground(new Color(100, 110, 130));

        JPanel header = new JPanel(new GridLayout(2, 1, 5, 5));
        header.setBackground(new Color(245, 247, 250));
        header.add(title);
        header.add(subtitle);

        root.add(header, BorderLayout.NORTH);

        JPanel formPanel = new JPanel(new GridBagLayout());
        formPanel.setPreferredSize(new Dimension(310, 0));
        formPanel.setBackground(Color.WHITE);
        formPanel.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(220, 230, 240)),
                new EmptyBorder(20, 20, 20, 20)
        ));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(8, 5, 8, 5);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        itemField = new JTextField();
        amountField = new JTextField();
        categoryBox = new JComboBox<>(new String[]{
                "Food",
                "Transportation",
                "School",
                "Bills",
                "Shopping",
                "Others"
        });

        addFormRow(formPanel, gbc, 0, "Expense Item:", itemField);
        addFormRow(formPanel, gbc, 1, "Amount:", amountField);
        addFormRow(formPanel, gbc, 2, "Category:", categoryBox);

        JButton addButton = new JButton("Add Expense");
        JButton clearButton = new JButton("Clear Fields");
        JButton deleteButton = new JButton("Delete Selected");

        addButton.setBackground(new Color(45, 120, 255));
        addButton.setForeground(Color.WHITE);
        addButton.setFocusPainted(false);

        clearButton.setBackground(new Color(230, 235, 245));
        clearButton.setForeground(new Color(30, 41, 59));
        clearButton.setFocusPainted(false);

        deleteButton.setBackground(new Color(220, 60, 70));
        deleteButton.setForeground(Color.WHITE);
        deleteButton.setFocusPainted(false);

        JPanel buttonPanel = new JPanel(new GridLayout(3, 1, 8, 8));
        buttonPanel.setBackground(Color.WHITE);
        buttonPanel.add(addButton);
        buttonPanel.add(clearButton);
        buttonPanel.add(deleteButton);

        gbc.gridx = 0;
        gbc.gridy = 3;
        gbc.gridwidth = 2;
        gbc.insets = new Insets(18, 5, 8, 5);
        formPanel.add(buttonPanel, gbc);

        JLabel note = new JLabel("<html><center>Tip: Enter numbers only<br>for the amount field.</center></html>");
        note.setFont(new Font("Arial", Font.PLAIN, 12));
        note.setForeground(new Color(120, 130, 145));
        note.setHorizontalAlignment(SwingConstants.CENTER);

        gbc.gridy = 4;
        gbc.insets = new Insets(18, 5, 8, 5);
        formPanel.add(note, gbc);

        root.add(formPanel, BorderLayout.WEST);

        JPanel tablePanel = new JPanel(new BorderLayout(10, 10));
        tablePanel.setBackground(Color.WHITE);
        tablePanel.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(220, 230, 240)),
                new EmptyBorder(15, 15, 15, 15)
        ));

        JLabel tableTitle = new JLabel("Expense Records");
        tableTitle.setFont(new Font("Arial", Font.BOLD, 18));
        tableTitle.setForeground(new Color(35, 45, 65));

        String[] columns = {"Item", "Category", "Amount"};
        tableModel = new DefaultTableModel(columns, 0);
        expenseTable = new JTable(tableModel);
        expenseTable.setRowHeight(28);
        expenseTable.setFont(new Font("Arial", Font.PLAIN, 13));
        expenseTable.getTableHeader().setFont(new Font("Arial", Font.BOLD, 13));

        JScrollPane scrollPane = new JScrollPane(expenseTable);

        totalLabel = new JLabel("Total Expenses: ₱0.00");
        totalLabel.setFont(new Font("Arial", Font.BOLD, 18));
        totalLabel.setHorizontalAlignment(SwingConstants.RIGHT);
        totalLabel.setForeground(new Color(30, 41, 59));

        tablePanel.add(tableTitle, BorderLayout.NORTH);
        tablePanel.add(scrollPane, BorderLayout.CENTER);
        tablePanel.add(totalLabel, BorderLayout.SOUTH);

        root.add(tablePanel, BorderLayout.CENTER);

        addButton.addActionListener(e -> addExpense());
        clearButton.addActionListener(e -> clearFields());
        deleteButton.addActionListener(e -> deleteSelectedExpense());

        add(root);
        setVisible(true);
    }

    private void addFormRow(JPanel panel, GridBagConstraints gbc, int row, String labelText, JComponent input) {
        JLabel label = new JLabel(labelText);
        label.setFont(new Font("Arial", Font.BOLD, 12));
        label.setForeground(new Color(51, 65, 85));

        gbc.gridx = 0;
        gbc.gridy = row;
        gbc.gridwidth = 1;
        gbc.weightx = 0.35;
        panel.add(label, gbc);

        gbc.gridx = 1;
        gbc.weightx = 0.65;
        panel.add(input, gbc);
    }

    private void addExpense() {
        String item = itemField.getText().trim();
        String amountText = amountField.getText().trim();
        String category = categoryBox.getSelectedItem().toString();

        if (item.isEmpty() || amountText.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Please fill in all fields.");
            return;
        }

        try {
            double amount = Double.parseDouble(amountText);

            if (amount <= 0) {
                JOptionPane.showMessageDialog(this, "Amount must be greater than zero.");
                return;
            }

            tableModel.addRow(new Object[]{
                    item,
                    category,
                    String.format("₱%.2f", amount)
            });

            clearFields();
            updateTotal();
        } catch (NumberFormatException error) {
            JOptionPane.showMessageDialog(this, "Amount must be a valid number.");
        }
    }

    private void clearFields() {
        itemField.setText("");
        amountField.setText("");
        categoryBox.setSelectedIndex(0);
    }

    private void deleteSelectedExpense() {
        int selectedRow = expenseTable.getSelectedRow();

        if (selectedRow == -1) {
            JOptionPane.showMessageDialog(this, "Please select an expense to delete.");
            return;
        }

        tableModel.removeRow(selectedRow);
        updateTotal();
    }

    private void updateTotal() {
        double total = 0;

        for (int i = 0; i < tableModel.getRowCount(); i++) {
            String amountText = tableModel.getValueAt(i, 2).toString();
            amountText = amountText.replace("₱", "").replace(",", "");
            total += Double.parseDouble(amountText);
        }

        totalLabel.setText(String.format("Total Expenses: ₱%.2f", total));
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new Main());
    }
}