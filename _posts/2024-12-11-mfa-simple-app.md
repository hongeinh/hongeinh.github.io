---
title: "Authentication App with Flask Python (Part 1)"
date: 2024-12-11
layout: post
---
# Create a simple Two-Factor Authentication application with Python Flask, MySQL, Docker and Twilio (p1)
For this quarter (Fall 2023?24? - I'm still so lost about this lol), one class requires students to set up an authentication system with Multi-Factor Authentication. 

I was like, cool, I always wanted to see how I can use Google Authenticator for my app, this would be a great opportunity.  
But guess what, the instructor said we need to build everything FROM SCRATCH. Okay interesting challenge, so here is a post of how I created a very simple website with the fundamental features (register, log in, log out, change information) with Twilio sandbox.

This will be a long series with the following outline:
* Set up project template
* Design 
* Code up
* Testing
* Quality Check
* Containerization
* CI/CD and deploy

## Set up project template
