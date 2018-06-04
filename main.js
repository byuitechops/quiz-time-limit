const canvas = require('canvas-wrapper');
const asyncLib = require('async');


module.exports = (course, stepCallback) => {

    function checkQuiz(quiz, checkQuizCb) {
        // Check if the time limit is the Brightspace default
        if (quiz.time_limit === 120) {
            // Remove the time limit and push the quiz to Canvas
            var oldTimeLimit = quiz.time_limit;
            canvas.put(`/api/v1/courses/${course.info.canvasOU}/quizzes/${quiz.id}`, {
                'quiz[time_limit]': null
            }, (err) => {
                if (err) {
                    console.log(err);
                    course.error(err);
                    // Move on to the next quiz
                    checkQuizCb(null);
                    return;
                }
                course.log('Quiz Time Limit Removed', {
                    'Quiz Title': quiz.title,
                    'Quiz ID': quiz.id,
                    'Old Time Limit': oldTimeLimit
                });
                // Move on to the next quiz
                checkQuizCb(null);
            });
        } else {
            // Keep the time limit
            // Move on to the next quiz
            checkQuizCb(null);
        }
    }

    /************************************
     * START HERE
     *  Get all quizzes in the course 
     ************************************/
    var validPlatforms = ['online', 'pathway'];
    if (!validPlatforms.includes(course.settings.platform)) {
        course.message('Invalid platform. Skipping child module');
        stepCallback(null, course);
        return;
    }
    // First get all the quizzes
    canvas.get(`https://byui.instructure.com/api/v1/courses/${course.info.canvasOU}/quizzes`, (err, quizzes) => {
        if (err) {
            console.log(err);
            course.error(err);
            stepCallback(null, course);
            return;
        }
        asyncLib.eachSeries(quizzes, checkQuiz, (err) => {
            if (err) {
                console.log(err);
                course.error(err);
            }
            // Quizzes have finished looping
            stepCallback(null, course);
        });
    });
};