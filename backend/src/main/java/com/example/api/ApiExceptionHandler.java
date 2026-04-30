package com.example.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(IllegalArgumentException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ProblemDetail handleIllegalArgument(IllegalArgumentException ex) {
		var pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
		pd.setTitle("Bad Request");
		pd.setDetail(ex.getMessage());
		return pd;
	}
}
