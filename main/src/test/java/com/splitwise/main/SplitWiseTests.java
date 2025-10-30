package com.splitwise.main;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SplitWiseTests {

    @Test
    @DisplayName("addUser and getAllUsers should reflect users added")
    void addUser_and_getAllUsers() {
        splitWise sw = new splitWise();
        sw.addUser(new User("Alice", 1));
        sw.addUser(new User("Bob", 2));

        assertEquals(2, sw.getAllUsers().size());
        List<Integer> ids = sw.getAllUsers().stream().map(User::getId).sorted().toList();
        assertEquals(List.of(1, 2), ids);
    }

    @Test
    @DisplayName("splitExpense should assign equal owed amounts to non-payers")
    void splitExpense_equal() {
        splitWise sw = new splitWise();
        sw.addUser(new User("Alice", 1));
        sw.addUser(new User("Bob", 2));
        sw.addUser(new User("Charlie", 3));

        sw.splitExpense(1, 90.0);

        ArrayList<splitWise.Pair<Integer, Double>> bobOwes = sw.getUserOwedAmounts(2);
        ArrayList<splitWise.Pair<Integer, Double>> charlieOwes = sw.getUserOwedAmounts(3);

        assertEquals(1, bobOwes.size());
        assertEquals(1, charlieOwes.size());
        assertEquals(1, bobOwes.get(0).first);
        assertEquals(30.0, bobOwes.get(0).second, 1e-9);
        assertEquals(1, charlieOwes.get(0).first);
        assertEquals(30.0, charlieOwes.get(0).second, 1e-9);
    }

    @Test
    @DisplayName("addOwedAmount should reflect on the receiver's owed map")
    void addOwedAmount_basic() {
        splitWise sw = new splitWise();
        sw.addUser(new User("Alice", 1));
        sw.addUser(new User("Bob", 2));

        sw.addOwedAmount(2, 1, 50.0); // Bob owes Alice 50 -> stored on Alice keyed by Bob

        ArrayList<splitWise.Pair<Integer, Double>> aliceOwed = sw.getUserOwedAmounts(1);
        assertEquals(1, aliceOwed.size());
        assertEquals(2, aliceOwed.get(0).first);
        assertEquals(50.0, aliceOwed.get(0).second, 1e-9);
    }

    @Test
    @DisplayName("splitExpenseArbitrary should assign according to percentages")
    void splitExpense_arbitrary() {
        splitWise sw = new splitWise();
        sw.addUser(new User("Alice", 1));
        sw.addUser(new User("Bob", 2));
        sw.addUser(new User("Charlie", 3));

        ArrayList<splitWise.Pair<Integer, Double>> splits = new ArrayList<>();
        splits.add(new splitWise.Pair<>(2, 25.0));
        splits.add(new splitWise.Pair<>(3, 75.0));

        sw.splitExpenseArbitrary(1, splits, 200.0);

        ArrayList<splitWise.Pair<Integer, Double>> bobOwes = sw.getUserOwedAmounts(2);
        ArrayList<splitWise.Pair<Integer, Double>> charlieOwes = sw.getUserOwedAmounts(3);

        assertEquals(1, bobOwes.size());
        assertEquals(1, charlieOwes.size());
        assertEquals(1, bobOwes.get(0).first);
        assertEquals(50.0, bobOwes.get(0).second, 1e-9);
        assertEquals(1, charlieOwes.get(0).first);
        assertEquals(150.0, charlieOwes.get(0).second, 1e-9);
    }

    @Test
    @DisplayName("recordPayment reduces owed and removes when zero")
    void payments_record_and_settle() {
        splitWise sw = new splitWise();
        sw.addUser(new User("Alice", 1));
        sw.addUser(new User("Bob", 2));

        sw.addOwedAmount(2, 1, 100.0); // Bob owes Alice 100
        assertEquals(100.0, sw.getUserOwedAmounts(1).get(0).second, 1e-9);

        sw.recordPayment(2, 1, 30.0); // pay 30
        assertEquals(70.0, sw.getUserOwedAmounts(1).get(0).second, 1e-9);

        sw.recordPayment(2, 1, 70.0); // pay remaining
        assertEquals(0, sw.getUserOwedAmounts(1).size()); // removed when zero

        // set up again and settle
        sw.addOwedAmount(2, 1, 55.0);
        assertEquals(55.0, sw.getUserOwedAmounts(1).get(0).second, 1e-9);
        sw.settlePayment(2, 1);
        assertEquals(0, sw.getUserOwedAmounts(1).size());
    }
}
