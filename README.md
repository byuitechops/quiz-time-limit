# Quiz Time Limit
### *Package Name*: quiz-time-limit
### *Child Type*: post-import
### *Platform*: <online/pathway/campus/all> (Ask Zach or Daniel about this)
### *Required*: <Required/Recommended/Optional> (Ask Zach or Daniel about this)

This child module is built to be used by the Brigham Young University - Idaho D2L to Canvas Conversion Tool. It utilizes the standard `module.exports => (course, stepCallback)` signature and uses the Conversion Tool's standard logging functions. You can view extended documentation [Here](https://github.com/byuitechops/d2l-to-canvas-conversion-tool/tree/master/documentation).

## Purpose

The quiz-time-limit child module checks each quiz's timelimit in a Canvas course. When a course conversion occurs from Brightspace to Canvas, quiz time limits convert incorrectly. While 
Brightspace allows for a time limit to be defined, but not enforced, Canvas always enforces a defined time limit. Brightspace quizzes always have a defined time limit of 120 minutes that is not enforced by default(Unless specified manually). When these Brightspace quizzes convert to Canvas their time limits are automatically enforced when they shouldn't be. This child module goes through each quiz and decides if a quiz's time limit should be removed in Canvas or not.

## How to Install

```
npm install quiz-time-limit
```

## Run Requirements

This child module should be ran after all other quiz related modules have finished.

## Process

Describe in steps how the module accomplishes its goals.

1. Check if the platform is valid.
2. Get the D2L quiz xml files.
3. Map each D2L quiz file into an Array of objects that contain the quiz's name and enforced time limit.
4. Get all the quizzes from Canvas.
5. Asynchronously loop through the quizzes calling the checkQuiz function on each quiz.
6. Check if the Canvas quiz has a time limit of 120 minutes. 
7. If it does, find the correct quiz XML file and see if the time limit is enforced. If it's enforced, keep the time limit and go on to the next quiz. If it's not enforced, remove the time limit and go on to the next quiz.
8. If the Canvas quiz does not have a time limit of 120, keep the time limit and go on to the next quiz.
9. After all quizzes have finished, check for errors.
10. Move onto the next module.

## Log Categories

List the categories used in logging data in your module.

- Quiz Time Limit Removed/Kept
- Quiz Title
- Quiz ID
- Old/Kept Time Limit

## Requirements

The expectation of the quiz-time-limit child module is that quizzes have correct time limits.