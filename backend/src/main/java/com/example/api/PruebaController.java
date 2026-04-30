package com.example.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PruebaController {

	@GetMapping("/")
	public String home() {
		return "Nutrifit backend OK";
	}

	@GetMapping("/api/prueba")
	public String prueba() {
		return "ok";
	}
}
