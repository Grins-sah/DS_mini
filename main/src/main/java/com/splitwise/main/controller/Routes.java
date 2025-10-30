package com.splitwise.main.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.splitwise.main.User;
import com.splitwise.main.splitWise;

@RestController
@RequestMapping("/api")
public class Routes {

    private final splitWise sw = new splitWise();

    @GetMapping("/users")
    public List<UserSummary> listUsers() {
        List<UserSummary> list = new ArrayList<>();
        for (User u : sw.getAllUsers()) {
            list.add(new UserSummary(u.getId(), u.getName()));
        }
        return list;
    }

    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> addUser(@RequestBody CreateUserRequest req) {
        if (req == null || req.id == null || req.name == null || req.name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "name and id are required"));
        }
        sw.addUser(new User(req.name, req.id));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("id", req.id, "name", req.name));
    }

    @GetMapping("/users/{id}/owed")
    public ResponseEntity<List<OwedEntry>> getUserOwed(@PathVariable("id") Integer userId) {
        List<OwedEntry> out = new ArrayList<>();
        for (splitWise.Pair<Integer, Double> p : sw.getUserOwedAmounts(userId)) {
            out.add(new OwedEntry(p.first, p.second));
        }
        return ResponseEntity.ok(out);
    }

    @PostMapping("/owed")
    public ResponseEntity<Map<String, Object>> addOwed(@RequestBody AddOwedRequest req) {
        if (req == null || req.fromUserId == null || req.toUserId == null || req.amount == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "fromUserId, toUserId, amount are required"));
        }
        sw.addOwedAmount(req.fromUserId, req.toUserId, req.amount);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/expenses/split")
    public ResponseEntity<Map<String, Object>> splitExpense(@RequestBody SplitEqualRequest req) {
        if (req == null || req.paidByUserId == null || req.totalAmount == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "paidByUserId and totalAmount are required"));
        }
        sw.splitExpense(req.paidByUserId, req.totalAmount);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/expenses/split-arbitrary")
    public ResponseEntity<Map<String, Object>> splitExpenseArbitrary(@RequestBody SplitArbitraryRequest req) {
        if (req == null || req.paidByUserId == null || req.totalAmount == null || req.splits == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "paidByUserId, totalAmount, and splits are required"));
        }
        ArrayList<splitWise.Pair<Integer, Double>> pairs = new ArrayList<>();
        for (SplitPart p : req.splits) {
            if (p == null || p.userId == null || p.percentage == null) continue;
            pairs.add(new splitWise.Pair<>(p.userId, p.percentage));
        }
        sw.splitExpenseArbitrary(req.paidByUserId, pairs, req.totalAmount);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/payments")
    public ResponseEntity<Map<String, Object>> recordPayment(@RequestBody PaymentRequest req) {
        if (req == null || req.fromUserId == null || req.toUserId == null || req.amount == null || req.amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "fromUserId, toUserId and positive amount are required"));
        }
        sw.recordPayment(req.fromUserId, req.toUserId, req.amount);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/payments/settle")
    public ResponseEntity<Map<String, Object>> settlePayment(@RequestBody SettleRequest req) {
        if (req == null || req.fromUserId == null || req.toUserId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "fromUserId and toUserId are required"));
        }
        sw.settlePayment(req.fromUserId, req.toUserId);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    // DTOs
    public static class CreateUserRequest {
        public Integer id;
        public String name;
    }

    public static class UserSummary {
        public Integer id;
        public String name;
        public UserSummary(Integer id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    public static class AddOwedRequest {
        public Integer fromUserId;
        public Integer toUserId;
        public Double amount;
    }

    public static class SplitEqualRequest {
        public Integer paidByUserId;
        public Double totalAmount;
    }

    public static class SplitArbitraryRequest {
        public Integer paidByUserId;
        public Double totalAmount;
        public List<SplitPart> splits;
    }

    public static class SplitPart {
        public Integer userId;
        public Double percentage;
    }

    public static class OwedEntry {
        public Integer userId;
        public Double amount;
        public OwedEntry(Integer userId, Double amount) {
            this.userId = userId;
            this.amount = amount;
        }
    }

    public static class PaymentRequest {
        public Integer fromUserId;
        public Integer toUserId;
        public Double amount;
    }

    public static class SettleRequest {
        public Integer fromUserId;
        public Integer toUserId;
    }
}
