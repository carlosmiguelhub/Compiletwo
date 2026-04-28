import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.*;
import java.util.Vector;

public class Main extends JFrame {
    private CardLayout cardLayout;
    private JPanel mainPanel;

    private JTextField usernameField;
    private JPasswordField passwordField;
    private JLabel loginMessageLabel;

    private JTextField studentIdField;
    private JTextField fullNameField;
    private JTextField emailField;
    private JTextField phoneField;
    private JTextField searchField;
    private JComboBox<String> courseBox;
    private JComboBox<String> yearBox;
    private JRadioButton maleRadio;
    private JRadioButton femaleRadio;
    private JTextArea addressArea;

    private DefaultTableModel tableModel;
    private JTable studentTable;

    private JLabel totalStudentsLabel;
    private JLabel selectedStudentLabel;

    public Main() {
        setTitle("Campus Management System");
        setSize(1150, 720);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        cardLayout = new CardLayout();
        mainPanel = new JPanel(cardLayout);

        mainPanel.add(createLoginPanel(), "login");
        mainPanel.add(createDashboardPanel(), "dashboard");

        add(mainPanel);
        cardLayout.show(mainPanel, "login");

        setVisible(true);
    }

    private JPanel createLoginPanel() {
        JPanel wrapper = new JPanel(new GridBagLayout());
        wrapper.setBackground(new Color(25, 33, 48));

        JPanel card = new JPanel();
        card.setLayout(new BorderLayout(20, 20));
        card.setPreferredSize(new Dimension(420, 460));
        card.setBorder(new EmptyBorder(35, 35, 35, 35));
        card.setBackground(Color.WHITE);

        JLabel title = new JLabel("Campus Login");
        title.setFont(new Font("Arial", Font.BOLD, 30));
        title.setForeground(new Color(35, 45, 65));
        title.setHorizontalAlignment(SwingConstants.CENTER);

        JLabel subtitle = new JLabel("Sign in to access the student dashboard");
        subtitle.setFont(new Font("Arial", Font.PLAIN, 14));
        subtitle.setForeground(new Color(110, 120, 135));
        subtitle.setHorizontalAlignment(SwingConstants.CENTER);

        JPanel header = new JPanel(new GridLayout(2, 1, 5, 5));
        header.setBackground(Color.WHITE);
        header.add(title);
        header.add(subtitle);

        JPanel form = new JPanel(new GridLayout(6, 1, 8, 8));
        form.setBackground(Color.WHITE);

        JLabel usernameLabel = new JLabel("Username");
        usernameLabel.setFont(new Font("Arial", Font.BOLD, 13));

        usernameField = new JTextField();
        usernameField.setFont(new Font("Arial", Font.PLAIN, 15));

        JLabel passwordLabel = new JLabel("Password");
        passwordLabel.setFont(new Font("Arial", Font.BOLD, 13));

        passwordField = new JPasswordField();
        passwordField.setFont(new Font("Arial", Font.PLAIN, 15));

        loginMessageLabel = new JLabel("Use admin / 1234");
        loginMessageLabel.setFont(new Font("Arial", Font.PLAIN, 12));
        loginMessageLabel.setForeground(new Color(120, 130, 145));
        loginMessageLabel.setHorizontalAlignment(SwingConstants.CENTER);

        JButton loginButton = new JButton("Login");
        loginButton.setFont(new Font("Arial", Font.BOLD, 15));
        loginButton.setBackground(new Color(45, 120, 255));
        loginButton.setForeground(Color.WHITE);
        loginButton.setFocusPainted(false);

        form.add(usernameLabel);
        form.add(usernameField);
        form.add(passwordLabel);
        form.add(passwordField);
        form.add(loginMessageLabel);
        form.add(loginButton);

        JPanel footer = new JPanel(new GridLayout(2, 1, 4, 4));
        footer.setBackground(Color.WHITE);

        JLabel note = new JLabel("Demo system for Java GUI compiler testing");
        note.setHorizontalAlignment(SwingConstants.CENTER);
        note.setForeground(new Color(130, 140, 155));
        note.setFont(new Font("Arial", Font.PLAIN, 12));

        JLabel hint = new JLabel("No database connected. Data is stored in memory.");
        hint.setHorizontalAlignment(SwingConstants.CENTER);
        hint.setForeground(new Color(160, 90, 60));
        hint.setFont(new Font("Arial", Font.PLAIN, 12));

        footer.add(note);
        footer.add(hint);

        loginButton.addActionListener(e -> handleLogin());

        passwordField.addActionListener(e -> handleLogin());
        usernameField.addActionListener(e -> passwordField.requestFocus());

        card.add(header, BorderLayout.NORTH);
        card.add(form, BorderLayout.CENTER);
        card.add(footer, BorderLayout.SOUTH);

        wrapper.add(card);
        return wrapper;
    }

    private JPanel createDashboardPanel() {
        JPanel root = new JPanel(new BorderLayout());
        root.setBackground(new Color(241, 245, 249));

        JPanel sidebar = createSidebar();
        JPanel content = createStudentManagementPanel();

        root.add(sidebar, BorderLayout.WEST);
        root.add(content, BorderLayout.CENTER);

        return root;
    }

    private JPanel createSidebar() {
        JPanel sidebar = new JPanel(new BorderLayout(10, 10));
        sidebar.setPreferredSize(new Dimension(240, 720));
        sidebar.setBackground(new Color(20, 30, 45));
        sidebar.setBorder(new EmptyBorder(20, 16, 20, 16));

        JPanel top = new JPanel(new GridLayout(4, 1, 5, 5));
        top.setBackground(new Color(20, 30, 45));

        JLabel appName = new JLabel("CAMPUS");
        appName.setFont(new Font("Arial", Font.BOLD, 26));
        appName.setForeground(Color.WHITE);

        JLabel appSub = new JLabel("Management Suite");
        appSub.setFont(new Font("Arial", Font.PLAIN, 13));
        appSub.setForeground(new Color(170, 185, 205));

        JLabel role = new JLabel("Logged in as: Admin");
        role.setFont(new Font("Arial", Font.PLAIN, 13));
        role.setForeground(new Color(170, 185, 205));

        JLabel status = new JLabel("Status: Online");
        status.setFont(new Font("Arial", Font.PLAIN, 13));
        status.setForeground(new Color(120, 220, 160));

        top.add(appName);
        top.add(appSub);
        top.add(role);
        top.add(status);

        JPanel menu = new JPanel(new GridLayout(7, 1, 8, 8));
        menu.setBackground(new Color(20, 30, 45));

        JButton studentsButton = sidebarButton("Student Records");
        JButton enrollmentButton = sidebarButton("Enrollment");
        JButton gradesButton = sidebarButton("Grades");
        JButton reportsButton = sidebarButton("Reports");
        JButton settingsButton = sidebarButton("Settings");
        JButton aboutButton = sidebarButton("About");
        JButton logoutButton = sidebarButton("Logout");

        enrollmentButton.addActionListener(e -> showInfo("Enrollment module is only a demo button."));
        gradesButton.addActionListener(e -> showInfo("Grades module is only a demo button."));
        reportsButton.addActionListener(e -> showInfo("Reports module is only a demo button."));
        settingsButton.addActionListener(e -> showInfo("Settings module is only a demo button."));
        aboutButton.addActionListener(e -> showInfo("Campus Management System\nJava Swing demo application."));
        logoutButton.addActionListener(e -> handleLogout());

        menu.add(studentsButton);
        menu.add(enrollmentButton);
        menu.add(gradesButton);
        menu.add(reportsButton);
        menu.add(settingsButton);
        menu.add(aboutButton);
        menu.add(logoutButton);

        sidebar.add(top, BorderLayout.NORTH);
        sidebar.add(menu, BorderLayout.CENTER);

        return sidebar;
    }

    private JButton sidebarButton(String text) {
        JButton button = new JButton(text);
        button.setHorizontalAlignment(SwingConstants.LEFT);
        button.setFont(new Font("Arial", Font.BOLD, 13));
        button.setBackground(new Color(31, 44, 65));
        button.setForeground(Color.WHITE);
        button.setFocusPainted(false);
        button.setBorder(new EmptyBorder(10, 14, 10, 14));
        return button;
    }

    private JPanel createStudentManagementPanel() {
        JPanel page = new JPanel(new BorderLayout(15, 15));
        page.setBorder(new EmptyBorder(20, 20, 20, 20));
        page.setBackground(new Color(241, 245, 249));

        JPanel header = new JPanel(new BorderLayout());
        header.setBackground(new Color(241, 245, 249));

        JPanel titleBox = new JPanel(new GridLayout(2, 1, 3, 3));
        titleBox.setBackground(new Color(241, 245, 249));

        JLabel title = new JLabel("Student Records");
        title.setFont(new Font("Arial", Font.BOLD, 30));
        title.setForeground(new Color(30, 41, 59));

        JLabel subtitle = new JLabel("Manage student profiles, contact details, and enrollment information.");
        subtitle.setFont(new Font("Arial", Font.PLAIN, 14));
        subtitle.setForeground(new Color(100, 116, 139));

        titleBox.add(title);
        titleBox.add(subtitle);

        JPanel stats = new JPanel(new GridLayout(1, 2, 10, 10));
        stats.setBackground(new Color(241, 245, 249));

        totalStudentsLabel = statCard("Total Students", "0");
        selectedStudentLabel = statCard("Selected", "None");

        stats.add(totalStudentsLabel);
        stats.add(selectedStudentLabel);

        header.add(titleBox, BorderLayout.WEST);
        header.add(stats, BorderLayout.EAST);

        JPanel body = new JPanel(new BorderLayout(15, 15));
        body.setBackground(new Color(241, 245, 249));

        JPanel formCard = createStudentFormCard();
        JPanel tableCard = createTableCard();

        body.add(formCard, BorderLayout.WEST);
        body.add(tableCard, BorderLayout.CENTER);

        page.add(header, BorderLayout.NORTH);
        page.add(body, BorderLayout.CENTER);

        seedTableData();
        updateStats();

        return page;
    }

    private JLabel statCard(String label, String value) {
        JLabel card = new JLabel(
                "<html><div style='text-align:center;'>" +
                        "<span style='font-size:11px;'>" + label + "</span><br>" +
                        "<span style='font-size:22px; font-weight:bold;'>" + value + "</span>" +
                        "</div></html>"
        );
        card.setOpaque(true);
        card.setBackground(Color.WHITE);
        card.setForeground(new Color(30, 41, 59));
        card.setBorder(new EmptyBorder(10, 22, 10, 22));
        card.setPreferredSize(new Dimension(150, 70));
        return card;
    }

    private JPanel createStudentFormCard() {
        JPanel card = new JPanel(new BorderLayout(10, 10));
        card.setPreferredSize(new Dimension(360, 560));
        card.setBackground(Color.WHITE);
        card.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(220, 230, 240)),
                new EmptyBorder(15, 15, 15, 15)
        ));

        JLabel formTitle = new JLabel("Student Information");
        formTitle.setFont(new Font("Arial", Font.BOLD, 18));
        formTitle.setForeground(new Color(30, 41, 59));

        JPanel form = new JPanel(new GridBagLayout());
        form.setBackground(Color.WHITE);

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(7, 5, 7, 5);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        studentIdField = new JTextField();
        fullNameField = new JTextField();
        emailField = new JTextField();
        phoneField = new JTextField();

        courseBox = new JComboBox<>(new String[]{"BSIT", "BSCS", "BSBA", "BSEd", "BSHM", "BSTM"});
        yearBox = new JComboBox<>(new String[]{"1st Year", "2nd Year", "3rd Year", "4th Year"});

        maleRadio = new JRadioButton("Male");
        femaleRadio = new JRadioButton("Female");
        maleRadio.setBackground(Color.WHITE);
        femaleRadio.setBackground(Color.WHITE);
        maleRadio.setSelected(true);

        ButtonGroup genderGroup = new ButtonGroup();
        genderGroup.add(maleRadio);
        genderGroup.add(femaleRadio);

        JPanel genderPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 0));
        genderPanel.setBackground(Color.WHITE);
        genderPanel.add(maleRadio);
        genderPanel.add(femaleRadio);

        addressArea = new JTextArea(3, 20);
        addressArea.setLineWrap(true);
        addressArea.setWrapStyleWord(true);
        JScrollPane addressScroll = new JScrollPane(addressArea);

        addFormRow(form, gbc, 0, "Student ID", studentIdField);
        addFormRow(form, gbc, 1, "Full Name", fullNameField);
        addFormRow(form, gbc, 2, "Email", emailField);
        addFormRow(form, gbc, 3, "Phone", phoneField);
        addFormRow(form, gbc, 4, "Course", courseBox);
        addFormRow(form, gbc, 5, "Year Level", yearBox);
        addFormRow(form, gbc, 6, "Gender", genderPanel);
        addFormRow(form, gbc, 7, "Address", addressScroll);

        JButton addButton = actionButton("Add Student", new Color(37, 99, 235), Color.WHITE);
        JButton updateButton = actionButton("Update Selected", new Color(22, 163, 74), Color.WHITE);
        JButton clearButton = actionButton("Clear Form", new Color(226, 232, 240), new Color(30, 41, 59));
        JButton deleteButton = actionButton("Delete Selected", new Color(220, 38, 38), Color.WHITE);

        JPanel buttons = new JPanel(new GridLayout(2, 2, 8, 8));
        buttons.setBackground(Color.WHITE);
        buttons.add(addButton);
        buttons.add(updateButton);
        buttons.add(clearButton);
        buttons.add(deleteButton);

        addButton.addActionListener(e -> addStudent());
        updateButton.addActionListener(e -> updateSelectedStudent());
        clearButton.addActionListener(e -> clearStudentForm());
        deleteButton.addActionListener(e -> deleteSelectedStudent());

        card.add(formTitle, BorderLayout.NORTH);
        card.add(form, BorderLayout.CENTER);
        card.add(buttons, BorderLayout.SOUTH);

        return card;
    }

    private JPanel createTableCard() {
        JPanel card = new JPanel(new BorderLayout(10, 10));
        card.setBackground(Color.WHITE);
        card.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(220, 230, 240)),
                new EmptyBorder(15, 15, 15, 15)
        ));

        JPanel top = new JPanel(new BorderLayout(10, 10));
        top.setBackground(Color.WHITE);

        JLabel tableTitle = new JLabel("Registered Students");
        tableTitle.setFont(new Font("Arial", Font.BOLD, 18));
        tableTitle.setForeground(new Color(30, 41, 59));

        searchField = new JTextField();
        searchField.setPreferredSize(new Dimension(240, 32));

        JButton searchButton = actionButton("Search", new Color(45, 120, 255), Color.WHITE);
        JButton resetButton = actionButton("Reset", new Color(226, 232, 240), new Color(30, 41, 59));

        JPanel searchPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        searchPanel.setBackground(Color.WHITE);
        searchPanel.add(new JLabel("Search:"));
        searchPanel.add(searchField);
        searchPanel.add(searchButton);
        searchPanel.add(resetButton);

        top.add(tableTitle, BorderLayout.WEST);
        top.add(searchPanel, BorderLayout.EAST);

        String[] columns = {"Student ID", "Name", "Email", "Phone", "Course", "Year", "Gender", "Address"};
        tableModel = new DefaultTableModel(columns, 0);
        studentTable = new JTable(tableModel);
        studentTable.setRowHeight(28);
        studentTable.setFont(new Font("Arial", Font.PLAIN, 13));
        studentTable.getTableHeader().setFont(new Font("Arial", Font.BOLD, 13));
        studentTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

        JScrollPane scrollPane = new JScrollPane(studentTable);

        studentTable.addMouseListener(new MouseAdapter() {
            public void mouseClicked(MouseEvent e) {
                loadSelectedStudentToForm();
            }
        });

        searchButton.addActionListener(e -> searchStudents());
        resetButton.addActionListener(e -> {
            searchField.setText("");
            studentTable.clearSelection();
            updateStats();
        });

        card.add(top, BorderLayout.NORTH);
        card.add(scrollPane, BorderLayout.CENTER);

        return card;
    }

    private JButton actionButton(String text, Color background, Color foreground) {
        JButton button = new JButton(text);
        button.setBackground(background);
        button.setForeground(foreground);
        button.setFocusPainted(false);
        button.setFont(new Font("Arial", Font.BOLD, 12));
        return button;
    }

    private void addFormRow(JPanel panel, GridBagConstraints gbc, int row, String labelText, JComponent input) {
        JLabel label = new JLabel(labelText + ":");
        label.setFont(new Font("Arial", Font.BOLD, 12));
        label.setForeground(new Color(51, 65, 85));

        gbc.gridx = 0;
        gbc.gridy = row;
        gbc.weightx = 0.35;
        panel.add(label, gbc);

        gbc.gridx = 1;
        gbc.weightx = 0.65;
        panel.add(input, gbc);
    }

    private void handleLogin() {
        String username = usernameField.getText().trim();
        String password = new String(passwordField.getPassword());

        if (username.equals("admin") && password.equals("1234")) {
            loginMessageLabel.setText("Login successful.");
            loginMessageLabel.setForeground(new Color(22, 163, 74));
            cardLayout.show(mainPanel, "dashboard");
        } else {
            loginMessageLabel.setText("Invalid username or password.");
            loginMessageLabel.setForeground(new Color(220, 38, 38));
            passwordField.setText("");
        }
    }

    private void handleLogout() {
        int confirm = JOptionPane.showConfirmDialog(
                this,
                "Are you sure you want to logout?",
                "Logout",
                JOptionPane.YES_NO_OPTION
        );

        if (confirm == JOptionPane.YES_OPTION) {
            usernameField.setText("");
            passwordField.setText("");
            loginMessageLabel.setText("Use admin / 1234");
            loginMessageLabel.setForeground(new Color(120, 130, 145));
            cardLayout.show(mainPanel, "login");
        }
    }

    private void addStudent() {
        if (!validateStudentForm()) {
            return;
        }

        tableModel.addRow(new Object[]{
                studentIdField.getText().trim(),
                fullNameField.getText().trim(),
                emailField.getText().trim(),
                phoneField.getText().trim(),
                courseBox.getSelectedItem().toString(),
                yearBox.getSelectedItem().toString(),
                maleRadio.isSelected() ? "Male" : "Female",
                addressArea.getText().trim()
        });

        clearStudentForm();
        updateStats();
        showInfo("Student added successfully.");
    }

    private void updateSelectedStudent() {
        int row = studentTable.getSelectedRow();

        if (row == -1) {
            showWarning("Please select a student to update.");
            return;
        }

        if (!validateStudentForm()) {
            return;
        }

        tableModel.setValueAt(studentIdField.getText().trim(), row, 0);
        tableModel.setValueAt(fullNameField.getText().trim(), row, 1);
        tableModel.setValueAt(emailField.getText().trim(), row, 2);
        tableModel.setValueAt(phoneField.getText().trim(), row, 3);
        tableModel.setValueAt(courseBox.getSelectedItem().toString(), row, 4);
        tableModel.setValueAt(yearBox.getSelectedItem().toString(), row, 5);
        tableModel.setValueAt(maleRadio.isSelected() ? "Male" : "Female", row, 6);
        tableModel.setValueAt(addressArea.getText().trim(), row, 7);

        updateStats();
        showInfo("Student updated successfully.");
    }

    private void deleteSelectedStudent() {
        int row = studentTable.getSelectedRow();

        if (row == -1) {
            showWarning("Please select a student to delete.");
            return;
        }

        int confirm = JOptionPane.showConfirmDialog(
                this,
                "Delete selected student?",
                "Confirm Delete",
                JOptionPane.YES_NO_OPTION
        );

        if (confirm == JOptionPane.YES_OPTION) {
            tableModel.removeRow(row);
            clearStudentForm();
            updateStats();
        }
    }

    private void loadSelectedStudentToForm() {
        int row = studentTable.getSelectedRow();

        if (row == -1) {
            return;
        }

        studentIdField.setText(tableModel.getValueAt(row, 0).toString());
        fullNameField.setText(tableModel.getValueAt(row, 1).toString());
        emailField.setText(tableModel.getValueAt(row, 2).toString());
        phoneField.setText(tableModel.getValueAt(row, 3).toString());
        courseBox.setSelectedItem(tableModel.getValueAt(row, 4).toString());
        yearBox.setSelectedItem(tableModel.getValueAt(row, 5).toString());

        String gender = tableModel.getValueAt(row, 6).toString();
        if (gender.equals("Female")) {
            femaleRadio.setSelected(true);
        } else {
            maleRadio.setSelected(true);
        }

        addressArea.setText(tableModel.getValueAt(row, 7).toString());
        selectedStudentLabel.setText(
                "<html><div style='text-align:center;'>" +
                        "<span style='font-size:11px;'>Selected</span><br>" +
                        "<span style='font-size:18px; font-weight:bold;'>" +
                        tableModel.getValueAt(row, 1).toString() +
                        "</span>" +
                        "</div></html>"
        );
    }

    private void searchStudents() {
        String keyword = searchField.getText().trim().toLowerCase();

        if (keyword.isEmpty()) {
            showWarning("Type something to search.");
            return;
        }

        for (int i = 0; i < tableModel.getRowCount(); i++) {
            boolean found = false;

            for (int j = 0; j < tableModel.getColumnCount(); j++) {
                String value = tableModel.getValueAt(i, j).toString().toLowerCase();

                if (value.contains(keyword)) {
                    found = true;
                    break;
                }
            }

            if (found) {
                studentTable.setRowSelectionInterval(i, i);
                studentTable.scrollRectToVisible(studentTable.getCellRect(i, 0, true));
                loadSelectedStudentToForm();
                return;
            }
        }

        showWarning("No matching student found.");
    }

    private boolean validateStudentForm() {
        if (studentIdField.getText().trim().isEmpty()) {
            showWarning("Student ID is required.");
            return false;
        }

        if (fullNameField.getText().trim().isEmpty()) {
            showWarning("Full name is required.");
            return false;
        }

        if (emailField.getText().trim().isEmpty()) {
            showWarning("Email is required.");
            return false;
        }

        if (!emailField.getText().contains("@")) {
            showWarning("Email must contain @.");
            return false;
        }

        if (phoneField.getText().trim().isEmpty()) {
            showWarning("Phone number is required.");
            return false;
        }

        if (addressArea.getText().trim().isEmpty()) {
            showWarning("Address is required.");
            return false;
        }

        return true;
    }

    private void clearStudentForm() {
        studentIdField.setText("");
        fullNameField.setText("");
        emailField.setText("");
        phoneField.setText("");
        courseBox.setSelectedIndex(0);
        yearBox.setSelectedIndex(0);
        maleRadio.setSelected(true);
        addressArea.setText("");
        studentTable.clearSelection();

        selectedStudentLabel.setText(
                "<html><div style='text-align:center;'>" +
                        "<span style='font-size:11px;'>Selected</span><br>" +
                        "<span style='font-size:22px; font-weight:bold;'>None</span>" +
                        "</div></html>"
        );
    }

    private void updateStats() {
        totalStudentsLabel.setText(
                "<html><div style='text-align:center;'>" +
                        "<span style='font-size:11px;'>Total Students</span><br>" +
                        "<span style='font-size:22px; font-weight:bold;'>" +
                        tableModel.getRowCount() +
                        "</span>" +
                        "</div></html>"
        );

        if (studentTable.getSelectedRow() == -1) {
            selectedStudentLabel.setText(
                    "<html><div style='text-align:center;'>" +
                            "<span style='font-size:11px;'>Selected</span><br>" +
                            "<span style='font-size:22px; font-weight:bold;'>None</span>" +
                            "</div></html>"
            );
        }
    }

    private void seedTableData() {
        tableModel.addRow(new Object[]{
                "2026-0001",
                "Carlos Reyes",
                "carlos@example.com",
                "09123456789",
                "BSIT",
                "3rd Year",
                "Male",
                "Cavite"
        });

        tableModel.addRow(new Object[]{
                "2026-0002",
                "Mika Santos",
                "mika@example.com",
                "09998887777",
                "BSCS",
                "2nd Year",
                "Female",
                "Manila"
        });

        tableModel.addRow(new Object[]{
                "2026-0003",
                "John Dela Cruz",
                "john@example.com",
                "09771234567",
                "BSBA",
                "1st Year",
                "Male",
                "Laguna"
        });
    }

    private void showInfo(String message) {
        JOptionPane.showMessageDialog(this, message, "Information", JOptionPane.INFORMATION_MESSAGE);
    }

    private void showWarning(String message) {
        JOptionPane.showMessageDialog(this, message, "Warning", JOptionPane.WARNING_MESSAGE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new Main());
    }
}