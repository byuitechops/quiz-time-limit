const canvas = require('canvas-wrapper');
const asyncLib = require('async');

module.exports = (course, stepCallback) => {

    function checkQuiz(quiz, checkQuizCb) {
        // Check if the time limit is the Brightspace default(2 hours or 120 minutes)
        if (quiz.time_limit === 120) {
            // Check if this quiz is supposed to have a time limit of 2 hours
            var d2lQuiz = d2lQuizzes.find(d2lQuizObj => {
                return d2lQuizObj.name.toLowerCase() === quiz.title.toLowerCase();
            });
            if (d2lQuiz) {
                // Check if the quiz had a time limit in d2l
                if (d2lQuiz.enforceTimeLimit !== undefined) {
                    if (d2lQuiz.enforceTimeLimit[0].toLowerCase().includes('yes')) {
                        // Time limit of 2 hours needs to stay
                        course.log('Quiz Time Limit Kept', {
                            'Quiz Title': quiz.title,
                            'Quiz ID': quiz.id,
                            'Kept Time Limit': quiz.time_limit
                        });
                        checkQuizCb(null);
                        return;
                    }
                } else {
                    // The enforce_time_limit was not found in the xml file. Throw an error
                    console.log('Error: Enforce Time Limit not found in the XML file', d2lQuiz.name);

                }
            } else {
                // Quiz doesn't have a title in the XML file
                console.log('Error: Quiz does not have a title in the XML file');
            }
            // Remove the time limit and push the quiz to Canvas
            var oldTimeLimit = quiz.time_limit;
            canvas.put(`/api/v1/courses/${course.info.canvasOU}/quizzes/${quiz.id}`, {
                'quiz[time_limit]': null
            }, (err) => {
                if (err) {
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
            course.log('Quiz Time Limit Kept', {
                'Quiz Title': quiz.title,
                'Quiz ID': quiz.id,
                'Kept Time Limit': quiz.time_limit
            });
            // Move on to the next quiz
            checkQuizCb(null);
        }
    }

    /************************************
     * START HERE
     ************************************/

    // Check if the platform is valid
    var validPlatforms = ['online', 'pathway'];
    if (!validPlatforms.includes(course.settings.platform)) {
        course.message('Invalid platform. Skipping child module');
        stepCallback(null, course);
        return;
    }
    // Get all the quizzes xml files
    var d2lQuizFiles = course.content.filter(file => {
        return file.name.includes('quiz_d2l');
    });
    // Make them into objects
    var d2lQuizzes = d2lQuizFiles.map(quizFile => {
        return {
            name: quizFile.dom('assessment').attr('title') || undefined,
            enforceTimeLimit: quizFile.dom('assess_procextension').html().match(/<d2l_2p0:enforce_time_limit>.+>/g) || undefined
        };
    });
    // Next get all the quizzes from Canvas
    canvas.get(`https://byui.instructure.com/api/v1/courses/${course.info.canvasOU}/quizzes`, (err, quizzes) => {
        if (err) {
            course.error(err);
            stepCallback(null, course);
            return;
        }
        asyncLib.eachSeries(quizzes, checkQuiz, (err) => {
            if (err) {
                course.error(err);
            }
            // Quizzes have finished looping
            stepCallback(null, course);
        });
    });
};