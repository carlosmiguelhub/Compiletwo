import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class Main extends JFrame {

      private JTextField nameField;
    private JTextField emailField;
    private JTextField phoneField;
    private JComboBox<String> courseBox;
    private JRadioButton maleButton;
    private JRadioButton femaleButton;
    private JCheckBox javaBox;
    private JCheckBox pythonBox;
    private JCheckBox webBox;
    private JTextArea addressArea;
    private JTable studentTable;
    private DefaultTableModel tableModel;

    public Main() {
        setTitle("Student Registration System");
        setSize(900, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        setLayout(new BorderLayout(10, 10));

        JLabel titleLabel = new JLabel("Student Registration System", JLabel.CENTER);
        titleLabel.setFont(new Font("Arial", Font.BOLD, 28));
        titleLabel.setBorder(BorderFactory.createEmptyBorder(15, 10, 15, 10));
        add(titleLabel, BorderLayout.NORTH);

        JPanel formPanel = new JPanel();
        formPanel.setLayout(new GridBagLayout());
        formPanel.setBorder(BorderFactory.createTitledBorder("Student Information"));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(8, 8, 8, 8);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        JLabel nameLabel = new JLabel("Full Name:");
        nameField = new JTextField(20);

        JLabel emailLabel = new JLabel("Email:");
        emailField = new JTextField(20);

        JLabel phoneLabel = new JLabel("Phone:");
        phoneField = new JTextField(20);

        JLabel courseLabel = new JLabel("Course:");
        String[] courses = {"BSIT", "BSCS", "BSIS", "BSEMC"};
        courseBox = new JComboBox<>(courses);

        JLabel genderLabel = new JLabel("Gender:");
        maleButton = new JRadioButton("Male");
        femaleButton = new JRadioButton("Female");

        ButtonGroup genderGroup = new ButtonGroup();
        genderGroup.add(maleButton);
        genderGroup.add(femaleButton);

        JPanel genderPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        genderPanel.add(maleButton);
        genderPanel.add(femaleButton);

        JLabel skillsLabel = new JLabel("Skills:");
        javaBox = new JCheckBox("Java");
        pythonBox = new JCheckBox("Python");
        webBox = new JCheckBox("Web Design");

        JPanel skillsPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        skillsPanel.add(javaBox);
        skillsPanel.add(pythonBox);
        skillsPanel.add(webBox);

        JLabel addressLabel = new JLabel("Address:");
        addressArea = new JTextArea(4, 20);
        JScrollPane addressScroll = new JScrollPane(addressArea);

        addToForm(formPanel, gbc, nameLabel, 0, 0);
        addToForm(formPanel, gbc, nameField, 1, 0);

        addToForm(formPanel, gbc, emailLabel, 0, 1);
        addToForm(formPanel, gbc, emailField, 1, 1);

        addToForm(formPanel, gbc, phoneLabel, 0, 2);
        addToForm(formPanel, gbc, phoneField, 1, 2);

        addToForm(formPanel, gbc, courseLabel, 0, 3);
        addToForm(formPanel, gbc, courseBox, 1, 3);

        addToForm(formPanel, gbc, genderLabel, 0, 4);
        addToForm(formPanel, gbc, genderPanel, 1, 4);

        addToForm(formPanel, gbc, skillsLabel, 0, 5);
        addToForm(formPanel, gbc, skillsPanel, 1, 5);

        addToForm(formPanel, gbc, addressLabel, 0, 6);
        addToForm(formPanel, gbc, addressScroll, 1, 6);

        JPanel buttonPanel = new JPanel(new FlowLayout());

        JButton addButton = new JButton("Add Student");
        JButton clearButton = new JButton("Clear");
        JButton exitButton = new JButton("Exit");

        buttonPanel.add(addButton);
        buttonPanel.add(clearButton);
        buttonPanel.add(exitButton);

        gbc.gridx = 0;
        gbc.gridy = 7;
        gbc.gridwidth = 2;
        formPanel.add(buttonPanel, gbc);

        String[] columns = {"Name", "Email", "Phone", "Course", "Gender", "Skills", "Address"};
        tableModel = new DefaultTableModel(columns, 0);
        studentTable = new JTable(tableModel);

        JScrollPane tableScroll = new JScrollPane(studentTable);
        tableScroll.setBorder(BorderFactory.createTitledBorder("Registered Students"));

        add(formPanel, BorderLayout.WEST);
        add(tableScroll, BorderLayout.CENTER);

        addButton.addActionListener(e -> addStudent());
        clearButton.addActionListener(e -> clearForm());
        exitButton.addActionListener(e -> System.exit(0));
    }

    private void addToForm(JPanel panel, GridBagConstraints gbc, Component component, int x, int y) {
        gbc.gridx = x;
        gbc.gridy = y;
        gbc.gridwidth = 1;
        panel.add(component, gbc);
    }

    private void addStudent() {
        String name = nameField.getText();
        String email = emailField.getText();
        String phone = phoneField.getText();
        String course = courseBox.getSelectedItem().toString();

        String gender = "";
        if (maleButton.isSelected()) {
            gender = "Male";
        } else if (femaleButton.isSelected()) {
            gender = "Female";
        }

        String skills = "";
        if (javaBox.isSelected()) {
            skills += "Java ";
        }
        if (pythonBox.isSelected()) {
            skills += "Python ";
        }
        if (webBox.isSelected()) {
            skills += "Web Design ";
        }

        String address = addressArea.getText();

        if (name.isEmpty() || email.isEmpty() || phone.isEmpty() || gender.isEmpty()) {
            JOptionPane.showMessageDialog(
                    this,
                    "Please complete all required fields.",
                    "Missing Information",
                    JOptionPane.WARNING_MESSAGE
            );
            return;
        }

        Object[] row = {
                name,
                email,
                phone,
                course,
                gender,
                skills,
                address
        };

        tableModel.addRow(row);

        JOptionPane.showMessageDialog(
                this,
                "Student added successfully!",
                "Success",
                JOptionPane.INFORMATION_MESSAGE
        );

        clearForm();
    }

    private void clearForm() {
        nameField.setText("");
        emailField.setText("");
        phoneField.setText("");
        courseBox.setSelectedIndex(0);
        maleButton.setSelected(false);
        femaleButton.setSelected(false);
        javaBox.setSelected(false);
        pythonBox.setSelected(false);
        webBox.setSelected(false);
        addressArea.setText("");
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new StudentRegistrationGUI().setVisible(true);
        });
    }
}