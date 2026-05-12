package com.workshop_app.demo.data.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class KnownGoodState {

    @Autowired
    private final JdbcTemplate jdbcTemplate;


    public KnownGoodState(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void set() {
        jdbcTemplate.update("call set_known_good_state();");
    }
}
