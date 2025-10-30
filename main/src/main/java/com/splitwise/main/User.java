package com.splitwise.main;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

/**
 * Represents a Splitwise user and their balances with other users.
 * Kept minimal; focuses on tracking owed amounts.
 */
@Component
public class User {
    private String name;
    private Integer id;
    // Use Map to expose interface and keep implementation flexible
    private final Map<Integer, Double> owedAmounts;

    public User(String name, Integer id) {
        this.name = name;
        this.id = id;
        this.owedAmounts = new HashMap<>();
    }

    public User() {
        this.owedAmounts = new HashMap<>();
    }

    /**
     * Prints the basic user info and non-negative owed amounts.
     */
    public void displayUser() {
        System.out.println("User ID: " + id + ", Name: " + name);
        for (Map.Entry<Integer, Double> entry : owedAmounts.entrySet()) {
            if (entry.getValue() >= 0) {
                System.out.print(
                        "Owed by User ID: " + entry.getKey() + ", Amount: " + entry.getValue());
                System.out.println();
            }
        }
    }

    protected Integer getBalance(Integer userId) {
        return owedAmounts.getOrDefault(userId, 0.0).intValue();
    }

    // Fixed method name casing for consistency (was GetTotalBalance)
    protected Double getTotalBalance() {
        double total = 0.0;
        for (Double amount : owedAmounts.values()) {
            total += amount;
        }
        return total;
    }

    protected void assignOwedAmount(Integer userId, Double amount) {
        double updated = owedAmounts.getOrDefault(userId, 0.0) + amount;
        if (Math.abs(updated) < 1e-9) {
            owedAmounts.remove(userId);
        } else {
            owedAmounts.put(userId, updated);
        }
    }

    // friend class to splitWise.java
    protected Map<Integer, Double> getOwedAmounts() {
        return owedAmounts;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
