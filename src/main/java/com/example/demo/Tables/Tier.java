package com.example.demo.Tables;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Tier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private String subject;
    private String s;
    private String a;
    private String b;
    private String c;
    private String d;
    private String f;
    private Integer userId;

    public Tier (String subject, String s, String a, String b, String c, String d, String f, Integer userId){
        this.subject = subject;
        this.s = s;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.f = f;
        this.userId = userId;
    }

    public Tier(){}
    public Integer getId() {
        return id;
    }
    public String getSubject() {
        return subject;
    }
    public String getS() {
        return s;
    }
    public String getA() {
        return a;
    }
    public String getB() {
        return b;
    }
    public String getC() {
        return c;
    }
    public String getD() {
        return d;
    }
    public String getF() {
        return f;
    }
    public Integer getUserId() { return userId; }

    public void setId(Integer id) {
        this.id = id;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public void setS(String s) {
        this.s = s;
    }

    public void setA(String a) {
        this.a = a;
    }

    public void setB(String b) {
        this.b = b;
    }

    public void setC(String c) {
        this.c = c;
    }

    public void setD(String d) {
        this.d = d;
    }

    public void setF(String f) {
        this.f = f;
    }

    
}
