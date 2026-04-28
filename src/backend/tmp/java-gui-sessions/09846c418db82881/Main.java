import javax.swing.*; // for GUI components

public class Main
{
    public static void main(String[] args)
    {
        JOptionPane jop = new JOptionPane();

        // read the user's name graphically
        String name = jop.showInputDialog(null, "What is your name?");

        // ask the user a yes/no question
        int choice = jop.showConfirmDialog(null, "Do you like me, " + name + "?");

        // show different response depending on answer
        if (choice == jop.YES_OPTION) {
            jop.showMessageDialog(null, "Of course! Who doesn't?");
        } else { // choice == NO_OPTION or CANCEL_OPTION
            jop.showMessageDialog(null, "You have to learn to like me.");
        }
    }
}