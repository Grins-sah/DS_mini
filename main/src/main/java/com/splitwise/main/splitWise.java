package com.splitwise.main;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

// this is an implementation of the splitwise
// inherits User class
@Component
public class splitWise  {
    // hash map to store users
    // inserted of array use ordered_set to avoid duplicates and fast search
    private final Map<Integer, User> users;
    public splitWise() {
        this.users = new HashMap<>();
    }
    
    // expose all users (read-only snapshot)
    public ArrayList<User> getAllUsers() {
        return new ArrayList<>(users.values());
    }
    // add User to splitwise
    public void addUser(User newUser) {
        users.put(newUser.getId(), newUser);
    }  
    protected ArrayList<Integer> getAllUserIds() {
        return new ArrayList<Integer>(users.keySet());
    }
    // display all users    
    public void displayUsers() {
        for (User u : users.values()) {
            u.displayUser();
        }
    }
    // display only id
    public void displayUserIds() {
        for (User u : users.values()) {
            System.out.println("User ID: " + u.getId() + ", Name: " + u.getName());
        }
    }
    // add the amount owed between two users
    public void addOwedAmount(Integer fromUserId, Integer toUserId, Double amount) {
        User fromUser = null;
        User toUser = null;
        // correct it
        if(!users.containsKey(fromUserId) || !users.containsKey(toUserId)) {
            return;
        }
        fromUser = users.get(fromUserId);
        toUser = users.get(toUserId);
        if (fromUser != null && toUser != null) {
            toUser.assignOwedAmount(fromUserId, amount);
        }
    }
    // get the owed amounts of a User
    public ArrayList<Pair<Integer, Double>> getUserOwedAmounts(Integer userId) {
        if(users.containsKey(userId)) {
            return new ArrayList<Pair<Integer, Double>>(users.get(userId).getOwedAmounts().entrySet().stream().map(e -> new Pair<>(e.getKey(), e.getValue())).toList());
        }
        return new ArrayList<>();
    }
    // this function add the split to all users
    public void splitExpense(Integer paidByUserId, Double totalAmount) {
        int numberOfUsers = users.size();
        if(!users.containsKey(paidByUserId) || numberOfUsers <= 0) {
            return;
        }
        Double splitAmount = totalAmount / numberOfUsers;
        for(User u : users.values()) {
            if(u.getId() != paidByUserId) {
                u.assignOwedAmount(paidByUserId, splitAmount);
            }
        }
    }
    // arbitary split the function take a pair of userId and split precentage so that every one get the 
    // the different price
    // it will be an array 
    // so used an array of pairs
    public void splitExpenseArbitrary(Integer paidByUserId, ArrayList<Pair<Integer, Double>> splitPercentages, Double totalAmount) {
        if(!users.containsKey(paidByUserId)) {
            return;
        }
        for(Pair<Integer, Double> entry : splitPercentages) {
            Integer userId = entry.first;
            Double percentage = entry.second;
            if(users.containsKey(userId) && userId != paidByUserId) {
                Double splitAmount = (percentage / 100) * totalAmount;
                users.get(userId).assignOwedAmount(paidByUserId, splitAmount);
            }
        }
    }

    // Record a payment from fromUserId to toUserId, reducing owed amount.
    // If amount >= current owed, the entry is cleared.
    public void recordPayment(Integer fromUserId, Integer toUserId, Double amount) {
        if (amount == null || amount <= 0) return;
        if (!users.containsKey(toUserId)) return;
        User receiver = users.get(toUserId);
        // receiver.owedAmounts[fromUserId] holds how much fromUser owes to toUser
        Double current = receiver.getOwedAmounts().getOrDefault(fromUserId, 0.0);
        if (current <= 0) return; // nothing to reduce
        receiver.assignOwedAmount(fromUserId, -amount);
        // assignOwedAmount already removes on zero via User logic
    }

    // Settle payment entirely: clear any owed balance from fromUserId to toUserId
    public void settlePayment(Integer fromUserId, Integer toUserId) {
        if (!users.containsKey(toUserId)) return;
        User receiver = users.get(toUserId);
        Double current = receiver.getOwedAmounts().getOrDefault(fromUserId, 0.0);
        if (current != 0.0) {
            receiver.assignOwedAmount(fromUserId, -current);
        }
    }

    // Simple Pair alternative to avoid external dependency
    public static class Pair<F, S> {
        public final F first;
        public final S second;
        public Pair(F first, S second) {
            this.first = first;
            this.second = second;
        }
    }
    // lets write a simple test
    
}

